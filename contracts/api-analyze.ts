/**
 * @license
 * SPDX-License-Identifier: MIT
 */

/**
 * @file contracts/api-analyze.ts
 * @description Contratos de payload para o endpoint /api/analyze.
 */

export type AnalyzePostRequest = {
    prompt: string;
    systemInstruction: string;
};
