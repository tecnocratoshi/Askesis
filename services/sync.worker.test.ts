import { describe, expect, it } from 'vitest';

import { jsonReviver } from './sync.worker';

describe('sync worker jsonReviver', () => {
    it('revive bigint tagged payloads without coercing plain strings', () => {
        expect(jsonReviver('value', { __type: 'bigint', val: '255' })).toBe(255n);
        expect(jsonReviver('note', '0x1')).toBe('0x1');
    });

    it('revive tagged maps and keep nested hex-looking strings intact until the caller normalizes them', () => {
        const revived = jsonReviver('monthlyLogs', {
            __type: 'map',
            val: [['habit-1_2024-01', '0x1']]
        });

        expect(revived).toBeInstanceOf(Map);
        expect((revived as Map<string, string>).get('habit-1_2024-01')).toBe('0x1');
    });
});