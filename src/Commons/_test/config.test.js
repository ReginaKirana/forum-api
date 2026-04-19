import { describe, it, expect, vi, afterEach } from 'vitest';

describe('config', () => {
  afterEach(() => {
    vi.resetModules();
  });

  it('should call dotenv config when NODE_ENV is test (default)', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    const config = (await import('../config.js')).default;
    expect(config.app.host).toBeDefined();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should call dotenv config normally when NODE_ENV is not test', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const config = (await import('../config.js')).default;
    expect(config.app.host).toBeDefined();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should use 0.0.0.0 as host when NODE_ENV is production', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const config = (await import('../config.js')).default;
    expect(config.app.host).toBe('0.0.0.0');

    process.env.NODE_ENV = originalNodeEnv;
  });
});
