import { describe, expect, it } from 'vitest';
import { SessionController } from './session';
import type { GameRepository } from '../storage/repository';
import { WriteConflict } from '../storage/repository';
import { initialCatalog } from '../catalog/initial';
import { setup, game } from '../../tests/game-fixture';
import type { Game } from '../domain/types';
import { exportGame } from '../storage/validation';
function deferred() { let resolve!: () => void; let reject!: (e: Error) => void; const promise = new Promise<void>((r, j) => { resolve = r; reject = j; }); return { promise, resolve, reject }; }
describe('sesión y escritura coherente', () => {
    it('una copia compatible sustituye un dato incompatible solo tras confirmar', async () => {
        const malformed = { ...game(), schemaVersion: 99 };
        let stored: unknown = malformed;
        const writes: unknown[] = [];
        const repo: GameRepository = { loadCurrent: async () => stored, saveCurrent: async (candidate, expected) => { writes.push(expected); stored = candidate; } };
        const session = new SessionController(repo, initialCatalog, () => 'recovered');
        await session.load();
        const copy = exportGame(game());
        if (!copy.ok) throw new Error(copy.error.message);
        const preview = await session.validateImport(copy.value);
        if (!preview.ok) throw new Error(preview.error.message);
        expect(stored).toBe(malformed);
        expect((await session.create(setup, null)).ok).toBe(false);
        expect((await session.importCopy(preview.value)).ok).toBe(true);
        expect(writes).toEqual([{ unreadable: malformed }]);
        expect(session.model.game?.id).toBe('recovered');
        expect(session.model.load).toBe('ready');
    });
    it('no activa creación ni dice guardado antes de completar escritura', async () => {
        const pending = deferred();
        let stored: Game | null = null;
        const repo: GameRepository = { loadCurrent: async () => stored, saveCurrent: async (g) => { await pending.promise; stored = g; } };
        const session = new SessionController(repo, initialCatalog, () => 'new-game');
        await session.load();
        const creating = session.create(setup, null);
        expect(session.model.persistence.status).toBe('saving');
        expect(session.model.game).toBeNull();
        expect(session.model.candidate).not.toBeNull();
        expect((await session.execute({ type: 'advance' }, 0)).ok).toBe(false);
        pending.resolve();
        expect((await creating).ok).toBe(true);
        expect(session.model.persistence.status).toBe('saved');
        expect(session.model.game?.id).toBe('new-game');
    });
    it('fallo conserva candidato y reintento escribe exactamente el mismo estado', async () => {
        const saved = game();
        const writes: Game[] = [];
        let broken = true;
        const repo: GameRepository = { loadCurrent: async () => saved, saveCurrent: async (g) => { writes.push(g); if (broken)
                throw new Error('fallo'); } };
        let ids = 0;
        const session = new SessionController(repo, initialCatalog, () => 'id-' + (++ids));
        await session.load();
        await session.execute({ type: 'advance' }, 0);
        expect(session.model.persistence.status).toBe('error');
        expect(session.model.game?.phase).toBe('end');
        expect(session.model.persistence.persistedRevision).toBe(0);
        expect(session.exportCopy().ok).toBe(true);
        expect((await session.execute({ type: 'advance' }, 1)).ok).toBe(false);
        broken = false;
        await session.retrySave();
        expect(writes[1]).toEqual(writes[0]);
        expect(ids).toBe(1);
        expect(session.model.persistence.status).toBe('saved');
    });
    it('otra pestaña bloquea la escritura y no permite reintento sobre conflicto', async () => {
        const repo: GameRepository = { loadCurrent: async () => game(), saveCurrent: async () => { throw new WriteConflict(); } };
        const s = new SessionController(repo, initialCatalog, () => 'op');
        await s.load();
        await s.execute({ type: 'advance' }, 0);
        expect(s.model.persistence.status).toBe('conflict');
        expect((await s.retrySave()).ok).toBe(false);
        expect(s.exportCopy().ok).toBe(true);
    });
    it('importación inválida y sustitución fallida conservan la partida anterior', async () => {
        const repo: GameRepository = { loadCurrent: async () => game(), saveCurrent: async () => { throw new Error('fallo'); } };
        const s = new SessionController(repo, initialCatalog, () => 'replacement');
        await s.load();
        expect((await s.validateImport('{bad')).ok).toBe(false);
        expect(s.model.game?.id).toBe('match-1');
        await s.create(setup, { id: 'match-1', revision: 0 });
        expect(s.model.game?.id).toBe('match-1');
        expect(s.model.candidate?.id).toBe('replacement');
    });
    it('lectura incompatible conserva el dato y no se trata como partida vacía', async () => { const s = new SessionController({ loadCurrent: async () => ({ schemaVersion: 99 }), saveCurrent: async () => { throw new Error('no escribir'); } }, initialCatalog, () => 'id'); await s.load(); expect(s.model.load).toBe('incompatible'); expect((await s.create(setup, null)).ok).toBe(false); });
    it('una lectura antigua no reemplaza una carga posterior', async () => {
        let finish!: (value: unknown) => void;
        let reads = 0;
        const repo: GameRepository = { loadCurrent: () => ++reads === 1 ? new Promise(r => { finish = r; }) : Promise.resolve(game()), saveCurrent: async () => { } };
        const s = new SessionController(repo, initialCatalog, () => 'id');
        const first = s.load();
        await s.load();
        finish(null);
        await first;
        expect(s.model.game?.id).toBe('match-1');
        expect(s.model.load).toBe('ready');
    });
    it('recupera con reglas congeladas aunque el catálogo nuevo sea inválido', async () => {
        const invalid = { ...initialCatalog, rules: [] };
        const s = new SessionController({ loadCurrent: async () => game(), saveCurrent: async () => { } }, invalid, () => 'id');
        await s.load();
        expect(s.model.game?.id).toBe('match-1');
        expect(s.model.catalogMessage).toBeTruthy();
        expect(s.validateSetup(setup).valid).toBe(false);
        expect((await s.execute({ type: 'advance' }, 0)).ok).toBe(true);
        expect(s.previewScore('p1', 'dominance-early', { more: true }).requested).toBe(2);
    });
    it('actualización disponible no se aplica con guardado pendiente y acepta sesión sin borradores', async () => {
        const apply = () => { count++; return Promise.resolve(); };
        let count = 0;
        let broken = false;
        const repo: GameRepository = { loadCurrent: async () => game(), saveCurrent: async () => { if (broken)
                throw new Error('fallo'); } };
        const s = new SessionController(repo, initialCatalog, () => 'op', { prepare: async () => { }, apply });
        await s.load();
        s.setPwa({ update: 'available' });
        expect(count).toBe(0);
        expect((await s.applyUpdate(false)).ok).toBe(true);
        expect(count).toBe(1);
        s.setPwa({ update: 'available' });
        broken = true;
        await s.execute({ type: 'advance' }, 0);
        expect((await s.applyUpdate(true)).ok).toBe(false);
        expect(count).toBe(1);
    });
    it('importar una copia antigua asigna identidad nueva y evita sobrescritura por una pestaña obsoleta', async () => {
        const original = game();
        let stored = original;
        const repo: GameRepository = { loadCurrent: async () => structuredClone(stored), saveCurrent: async (g, target) => { if (!target || 'unreadable' in target || target.id !== stored.id || target.revision !== stored.revision)
                throw new WriteConflict(); stored = g; } };
        const stale = new SessionController(repo, initialCatalog, () => 'stale-op');
        await stale.load();
        const current = new SessionController(repo, initialCatalog, () => 'imported-id');
        await current.load();
        const copy = exportGame(original);
        if (!copy.ok)
            throw new Error('copia');
        const checked = await current.validateImport(copy.value);
        if (!checked.ok)
            throw new Error(checked.error.message);
        expect(checked.value.game.id).toBe('imported-id');
        expect((await current.importCopy(checked.value)).ok).toBe(true);
        expect(stored.id).toBe('imported-id');
        expect((await stale.execute({ type: 'advance' }, 0)).ok).toBe(false);
        expect(stale.model.persistence.status).toBe('conflict');
    });
});
