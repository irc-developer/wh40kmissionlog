import { registerSW } from 'virtual:pwa-register';
import type { PwaPort } from '../application/session';
import type { PwaStatus } from '../application/ui-contract';
export class BrowserPwa implements PwaPort {
    private registration: ServiceWorkerRegistration | null = null;
    private updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;
    private applyRequested = false;
    private externalActivation = false;
    constructor(private status: (patch: Partial<PwaStatus>) => void, private reload: () => void = () => window.location.reload()) { }
    async prepare() {
        this.status({ online: navigator.onLine });
        if (!import.meta.env.PROD) {
            this.status({ offline: 'error', message: 'El uso sin conexión se verifica en la construcción de producción.' });
            return;
        }
        if (!('serviceWorker' in navigator) || !('caches' in window))
            throw new Error('Este navegador no permite preparar el uso sin conexión.');
        if (this.updateSW) {
            await this.registration?.update();
            await this.verifyResources();
            return;
        }
        const online = () => this.status({ online: navigator.onLine });
        window.addEventListener('online', online);
        window.addEventListener('offline', online);
        this.updateSW = registerSW({ immediate: true, onNeedReload: () => {
                if (this.applyRequested)
                    this.reload();
                else {
                    this.externalActivation = true;
                    this.status({ update: 'available', message: 'Otra pestaña ha activado una actualización. Puedes seguir y recargar cuando termines de guardar.' });
                }
            }, onNeedRefresh: () => this.status({ update: 'available' }), onOfflineReady: () => { void this.verifyResources(); }, onRegisterError: (error) => this.status({ offline: 'error', message: error instanceof Error ? error.message : 'No se han podido descargar los recursos.' }), onRegisteredSW: (_url, registration) => {
                this.registration = registration ?? null;
                if (registration?.active)
                    void this.verifyResources();
                registration?.installing?.addEventListener('statechange', () => { if (registration.active)
                    void this.verifyResources(); });
            } });
    }
    private async verifyResources() {
        try {
            await navigator.serviceWorker.ready;
            const urls = [new URL(import.meta.env.BASE_URL + 'index.html', location.origin).href, ...Array.from(document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>('script[src],link[rel="stylesheet"][href]')).map(e => e instanceof HTMLScriptElement ? e.src : e.href)];
            const resources = await Promise.all(urls.map(url => caches.match(url, { ignoreSearch: true })));
            if (resources.some(r => !r?.ok))
                throw new Error('Faltan recursos para recargar sin conexión.');
            this.status({ offline: 'ready', message: undefined });
        }
        catch (error) {
            this.status({ offline: 'error', message: error instanceof Error ? error.message : 'Descarga incompleta.' });
        }
    }
    async apply() { if (!this.updateSW)
        throw new Error('No hay actualización preparada.'); this.applyRequested = true; if (this.externalActivation)
        this.reload();
    else
        await this.updateSW(true); }
}
