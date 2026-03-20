/**
 * @file services/workerClient.test.ts
 * @description Testes para o cliente RPC do sync.worker.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../utils', async () => {
    const actual = await vi.importActual<typeof import('../utils')>('../utils');
    let counter = 0;
    return {
        ...actual,
        logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
        generateUUID: vi.fn(() => `uuid-${++counter}`),
    };
});

// Referência mutável para o Worker criado no teste corrente
let currentWorker: MockWorker | null = null;

class MockWorker {
    onmessage: ((e: MessageEvent) => void) | null = null;
    onerror: ((e: ErrorEvent) => void) | null = null;
    terminate = vi.fn();

    constructor(_url: string) {
        currentWorker = this;
    }

    postMessage(_msg: any) {
        // Comportamento padrão vazio — pode ser sobrescrito por teste
    }
}

describe('workerClient', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        currentWorker = null;
        vi.stubGlobal('Worker', MockWorker);
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('deve resolver task com sucesso', async () => {
        const { runWorkerTask } = await import('./workerClient');

        // Configura resposta de sucesso ao receber postMessage
        MockWorker.prototype.postMessage = function (msg: any) {
            currentWorker?.onmessage?.({
                data: { id: msg.id, status: 'success', result: 'ok-result' }
            } as MessageEvent);
        };

        const result = await runWorkerTask<string>('encrypt', 'payload', {
            timeoutMs: 5000,
            workerUrl: 'test-worker.js',
        });

        expect(result).toBe('ok-result');
    });

    it('deve rejeitar quando worker retorna status de erro (linha 77)', async () => {
        const { runWorkerTask } = await import('./workerClient');

        MockWorker.prototype.postMessage = function (msg: any) {
            currentWorker?.onmessage?.({
                data: { id: msg.id, status: 'error', error: 'Worker processing failed' }
            } as MessageEvent);
        };

        await expect(
            runWorkerTask<string>('decrypt', 'payload', { timeoutMs: 5000, workerUrl: 'test-worker.js' })
        ).rejects.toThrow('Worker processing failed');
    });

    it('deve usar mensagem padrão quando error está ausente (linha 77 fallback)', async () => {
        const { runWorkerTask } = await import('./workerClient');

        MockWorker.prototype.postMessage = function (msg: any) {
            currentWorker?.onmessage?.({
                data: { id: msg.id, status: 'error' } // sem campo `error`
            } as MessageEvent);
        };

        await expect(
            runWorkerTask<string>('encrypt', 'payload', { timeoutMs: 5000, workerUrl: 'test-worker.js' })
        ).rejects.toThrow('Worker error');
    });

    it('deve logar e rejeitar pendentes quando worker.onerror é disparado (linhas 81-82)', async () => {
        const { runWorkerTask } = await import('./workerClient');
        const { logger } = await import('../utils');

        MockWorker.prototype.postMessage = function () {
            // Não responde — simula worker travado
        };

        const resultPromise = runWorkerTask<string>('encrypt', 'payload', {
            timeoutMs: 5000,
            workerUrl: 'test-worker.js',
        });

        // Dispara onerror antes do timeout
        currentWorker?.onerror?.({ message: 'Worker crashed' } as ErrorEvent);

        await expect(resultPromise).rejects.toThrow('Worker crashed');
        expect(logger.error).toHaveBeenCalledWith('Critical Worker Error:', expect.anything());
    });

    it('deve rejeitar e limpar pending quando postMessage lança (linhas 110-112)', async () => {
        const { runWorkerTask } = await import('./workerClient');

        MockWorker.prototype.postMessage = function () {
            throw new Error('postMessage failed — context lost');
        };

        await expect(
            runWorkerTask<string>('encrypt', 'payload', { timeoutMs: 5000, workerUrl: 'test-worker.js' })
        ).rejects.toThrow('postMessage failed');
    });

    it('deve ignorar mensagens sem id válido', async () => {
        const { runWorkerTask } = await import('./workerClient');

        MockWorker.prototype.postMessage = function (msg: any) {
            // Envia mensagem sem id, depois a resposta correta
            currentWorker?.onmessage?.({ data: null } as MessageEvent);
            currentWorker?.onmessage?.({
                data: { id: msg.id, status: 'success', result: 'done' }
            } as MessageEvent);
        };

        const result = await runWorkerTask<string>('encrypt', 'payload', {
            timeoutMs: 5000,
            workerUrl: 'test-worker.js',
        });
        expect(result).toBe('done');
    });

    it('deve reutilizar worker existente em chamadas subsequentes', async () => {
        let constructorCallCount = 0;
        vi.stubGlobal('Worker', class extends MockWorker {
            constructor(url: string) {
                super(url);
                constructorCallCount++;
            }
        });

        const { runWorkerTask } = await import('./workerClient');

        MockWorker.prototype.postMessage = function (msg: any) {
            currentWorker?.onmessage?.({
                data: { id: msg.id, status: 'success', result: 'r' }
            } as MessageEvent);
        };

        await runWorkerTask('encrypt', 'a', { timeoutMs: 5000, workerUrl: 'w.js' });
        await runWorkerTask('decrypt', 'b', { timeoutMs: 5000, workerUrl: 'w.js' });

        expect(constructorCallCount).toBe(1);
    });
});
