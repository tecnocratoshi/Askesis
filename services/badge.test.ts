/**
 * @file services/badge.test.ts
 * @description Testes para o controlador de App Badging API.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./selectors', () => ({
    calculateDaySummary: vi.fn(),
}));

vi.mock('../utils', async () => {
    const actual = await vi.importActual<typeof import('../utils')>('../utils');
    return {
        ...actual,
        getTodayUTCIso: vi.fn(() => '2025-01-15'),
        logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
    };
});

import { updateAppBadge } from './badge';
import { calculateDaySummary } from './selectors';
import { logger } from '../utils';

const mockCalc = calculateDaySummary as ReturnType<typeof vi.fn>;

describe('updateAppBadge', () => {
    const setAppBadge = vi.fn(() => Promise.resolve());
    const clearAppBadge = vi.fn(() => Promise.resolve());

    beforeEach(() => {
        vi.clearAllMocks();
        Object.defineProperty(globalThis, 'navigator', {
            value: { setAppBadge, clearAppBadge },
            configurable: true,
            writable: true,
        });
    });

    it('chama setAppBadge quando há pendências', async () => {
        mockCalc.mockReturnValue({ pending: 3, completedPercent: 0, snoozedPercent: 0, showPlusIndicator: false });

        await updateAppBadge();

        expect(setAppBadge).toHaveBeenCalledWith(3);
        expect(clearAppBadge).not.toHaveBeenCalled();
    });

    it('chama clearAppBadge quando não há pendências', async () => {
        mockCalc.mockReturnValue({ pending: 0, completedPercent: 100, snoozedPercent: 0, showPlusIndicator: false });

        await updateAppBadge();

        expect(clearAppBadge).toHaveBeenCalled();
        expect(setAppBadge).not.toHaveBeenCalled();
    });

    it('não lança quando navigator não suporta Badging API', async () => {
        Object.defineProperty(globalThis, 'navigator', {
            value: {},
            configurable: true,
            writable: true,
        });

        await expect(updateAppBadge()).resolves.toBeUndefined();
        expect(setAppBadge).not.toHaveBeenCalled();
    });

    it('loga erro silenciosamente quando setAppBadge falha', async () => {
        mockCalc.mockReturnValue({ pending: 2, completedPercent: 0, snoozedPercent: 0, showPlusIndicator: false });
        setAppBadge.mockRejectedValueOnce(new Error('OS denied badge'));

        await expect(updateAppBadge()).resolves.toBeUndefined();
        expect(logger.error).toHaveBeenCalled();
    });
});
