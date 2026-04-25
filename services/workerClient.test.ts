/**
 * @file services/workerClient.test.ts
 *
 * Characterisation tests for workerClient.ts (F-02-006 / F-02-010).
 *
 * PURPOSE OF THIS FILE:
 * These tests document the CURRENT and INTENDED behaviour of the worker
 * client's timeout and pending-task handling. They must be written and
 * committed BEFORE any changes to workerClient.ts so that:
 *   1. The bug (global reset on single timeout) is explicitly documented.
 *   2. The fix can be verified by watching the previously-failing test pass.
 *
 * Commit strategy:
 *   - Commit 1: this file only (characterisation — documents current behaviour)
 *   - Commit 2: fix in workerClient.ts (isolation — makes the isolation test pass)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Minimal Worker stub ──────────────────────────────────────────────────────

type WorkerMessage = {
    id: string;
    type: string;
    payload: unknown;
    key?: string;
};

type WorkerResponse = {
    id: string;
    status: 'success' | 'error';
    result?: unknown;
    error?: string;
};

class FakeWorker extends EventTarget {
    // Messages posted to the worker
    posted: WorkerMessage[] = [];
    // Manually trigger a response
    respond(msg: WorkerResponse) {
        const event = new MessageEvent('message', { data: msg });
        this.dispatchEvent(event);
        if (this.onmessage) this.onmessage(event);
    }
    postMessage(msg: WorkerMessage) {
        this.posted.push(msg);
    }
    terminate() {
        // no-op stub
    }
    onmessage: ((e: MessageEvent) => void) | null = null;
    onerror: ((e: ErrorEvent) => void) | null = null;
}

// ── Test helpers ─────────────────────────────────────────────────────────────

/**
 * Spawns a fresh workerClient module per test to avoid module-level state
 * (pending map, syncWorker reference) leaking between tests.
 */
async function freshClientWithFakeWorker(): Promise<{
    runTask: <T>(type: string, payload: unknown, timeoutMs: number) => Promise<T>;
    fakeWorker: FakeWorker;
}> {
    vi.resetModules();
    const fakeWorker = new FakeWorker();

    // Patch the Worker constructor so the module uses our stub.
    const WorkerMock = vi.fn(function MockWorker(this: unknown) {
        return fakeWorker;
    }) as unknown as typeof Worker;
    vi.stubGlobal('Worker', WorkerMock);
    // Provide window.setTimeout (used for timeout IDs)
    vi.stubGlobal('window', { setTimeout, clearTimeout });

    const mod = await import('./workerClient');

    function runTask<T>(type: string, payload: unknown, timeoutMs: number): Promise<T> {
        return mod.runWorkerTask<T>(type as import('../contracts/worker').WorkerTaskType, payload, {
            timeoutMs,
            workerUrl: 'fake-worker.js'
        });
    }

    return { runTask, fakeWorker };
}

// ── Characterisation tests ────────────────────────────────────────────────────

describe('workerClient — timeout isolation (F-02-006)', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.resetModules();
    });

    it('uma tarefa com timeout não cancela tarefas pendentes não relacionadas (comportamento ALVO)', async () => {
        const { runTask, fakeWorker } = await freshClientWithFakeWorker();

        // Task A: short timeout — will time out
        const taskA = runTask<string>('SYNC', { a: 1 }, 100);

        // Task B: long timeout — should NOT be affected by task A's timeout
        const taskB = runTask<string>('SYNC', { b: 2 }, 10_000);

        // Retrieve the IDs posted so far
        const idA = fakeWorker.posted[0]?.id;
        const idB = fakeWorker.posted[1]?.id;

        expect(idA).toBeTruthy();
        expect(idB).toBeTruthy();

        // Advance time past task A's timeout
        vi.advanceTimersByTime(200);

        // Task A must reject
        await expect(taskA).rejects.toThrow();

        // Task B's pending entry must still be alive; resolve it normally
        fakeWorker.respond({ id: idB!, status: 'success', result: 'done' });
        await expect(taskB).resolves.toBe('done');
    });

    it('worker crash (onerror) rejeita todas as pendências', async () => {
        const { runTask, fakeWorker } = await freshClientWithFakeWorker();

        const taskA = runTask<string>('SYNC', { a: 1 }, 10_000);
        const taskB = runTask<string>('SYNC', { b: 2 }, 10_000);

        // Simulate an unrecoverable worker crash
        const errorEvent = new ErrorEvent('error', { message: 'Uncaught error' });
        if (fakeWorker.onerror) fakeWorker.onerror(errorEvent);

        // Both tasks must reject — a crash is a legitimate reason for global reset
        await expect(taskA).rejects.toThrow();
        await expect(taskB).rejects.toThrow();
    });

    it('tarefa completa normalmente antes do timeout', async () => {
        const { runTask, fakeWorker } = await freshClientWithFakeWorker();

        const task = runTask<string>('SYNC', { x: 1 }, 5_000);
        const id = fakeWorker.posted[0]?.id;
        expect(id).toBeTruthy();

        fakeWorker.respond({ id: id!, status: 'success', result: 'ok' });

        await expect(task).resolves.toBe('ok');
    });

    it('tarefa retorna erro do worker sem reiniciar o worker inteiro', async () => {
        const { runTask, fakeWorker } = await freshClientWithFakeWorker();

        const task = runTask<string>('SYNC', {}, 5_000);
        const id = fakeWorker.posted[0]?.id;

        fakeWorker.respond({ id: id!, status: 'error', error: 'Sync failed' });

        await expect(task).rejects.toThrow('Sync failed');

        // A second task should still work (worker was not torn down)
        const task2 = runTask<string>('SYNC', {}, 5_000);
        const id2 = fakeWorker.posted[1]?.id;
        fakeWorker.respond({ id: id2!, status: 'success', result: 'recovered' });
        await expect(task2).resolves.toBe('recovered');
    });
});
