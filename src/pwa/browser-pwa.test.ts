import { beforeEach, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => ({ options: null as {
        onNeedReload?: () => void;
        onRegisteredSW?: (url: string, r: ServiceWorkerRegistration) => void;
    } | null }));
vi.mock('virtual:pwa-register', () => ({ registerSW: (options: typeof mock.options) => { mock.options = options; return async () => mock.options?.onNeedReload?.(); } }));
import { BrowserPwa } from './browser-pwa';
beforeEach(() => { mock.options = null; vi.stubEnv('PROD', true); Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { ready: Promise.resolve({}), addEventListener: vi.fn() } }); vi.stubGlobal('caches', { match: vi.fn().mockResolvedValue({ ok: true }) }); });
it('una activación desde otra pestaña no recarga la partida sin confirmación', async () => {
    const reload = vi.fn(), status = vi.fn();
    const pwa = new BrowserPwa(status, reload);
    await pwa.prepare();
    expect(mock.options?.onNeedReload).toBeTypeOf('function');
    mock.options?.onNeedReload?.();
    expect(reload).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(expect.objectContaining({ update: 'available' }));
    await pwa.apply();
    expect(reload).toHaveBeenCalledOnce();
});
it('una actualización propia recarga solo al aplicar explícitamente', async () => { const reload = vi.fn(); const pwa = new BrowserPwa(vi.fn(), reload); await pwa.prepare(); await pwa.apply(); expect(reload).toHaveBeenCalledOnce(); });
