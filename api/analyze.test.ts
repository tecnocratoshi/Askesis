import { beforeEach, describe, expect, it, vi } from 'vitest';

const generateContentMock = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = {
      generateContent: generateContentMock
    };
    constructor(_args: unknown) {}
  }
}));

function makeAnalyzeRequest(prompt = 'hello', systemInstruction = 'sys') {
  return new Request('https://askesis.vercel.app/api/analyze', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'origin': 'https://askesis.vercel.app',
      'x-vercel-forwarded-for': '203.0.113.10'
    },
    body: JSON.stringify({ prompt, systemInstruction })
  });
}

describe('api/analyze quota cooldown', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.API_KEY = 'test-key';
    process.env.CORS_ALLOWED_ORIGINS = 'https://askesis.vercel.app';
    process.env.CORS_STRICT = '1';
    process.env.DISABLE_RATE_LIMIT = '1';
    process.env.AI_QUOTA_COOLDOWN_MS = '120000';
  });

  it('ativa cooldown após erro de quota e bloqueia nova chamada ao provedor', async () => {
    generateContentMock.mockRejectedValueOnce(Object.assign(new Error('RESOURCE_EXHAUSTED'), { status: 429 }));

    const mod = await import('./analyze');
    const handler = mod.default;

    const first = await handler(makeAnalyzeRequest('p1', 's1'));
    expect(first.status).toBe(429);

    const second = await handler(makeAnalyzeRequest('p2', 's2'));
    expect(second.status).toBe(429);

    expect(generateContentMock).toHaveBeenCalledTimes(1);
    expect(second.headers.get('Retry-After')).toBeTruthy();
  });

  it('responde cache hit mesmo durante cooldown sem chamar provedor', async () => {
    generateContentMock.mockResolvedValueOnce({ text: 'cached answer' });
    generateContentMock.mockRejectedValueOnce(Object.assign(new Error('RESOURCE_EXHAUSTED'), { status: 429 }));

    const mod = await import('./analyze');
    const handler = mod.default;

    const first = await handler(makeAnalyzeRequest('same', 'sys'));
    expect(first.status).toBe(200);

    const second = await handler(makeAnalyzeRequest('other', 'sys'));
    expect(second.status).toBe(429);

    const third = await handler(makeAnalyzeRequest('same', 'sys'));
    expect(third.status).toBe(200);
    expect(third.headers.get('X-Cache')).toBe('HIT');

    expect(generateContentMock).toHaveBeenCalledTimes(2);
  });

  it('usa somente o modelo gemini-3.0-flash', async () => {
    generateContentMock.mockResolvedValueOnce({ text: 'ok' });

    const mod = await import('./analyze');
    const handler = mod.default;

    const res = await handler(makeAnalyzeRequest('p3', 's3'));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('ok');

    expect(generateContentMock).toHaveBeenCalledTimes(1);
    expect(generateContentMock.mock.calls[0][0].model).toBe('gemini-3.0-flash');
  });
});
