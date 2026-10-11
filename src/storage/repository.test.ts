import { afterEach, describe, expect, it } from 'vitest';
import { DexieGameRepository } from './dexie-repository';
import { game, apply } from '../../tests/game-fixture';
import { validateGame, validateCatalog, exportGame, parseCopy } from './validation';
import { initialCatalog } from '../catalog/initial';
import Dexie from 'dexie';
const dbs: DexieGameRepository[] = [];
afterEach(async () => { await Promise.all(dbs.splice(0).map(r => r.destroy())); });
describe('persistencia y fronteras', () => {
    it('sustituye un snapshot incompatible leído solo si sigue siendo el mismo', async () => {
        const name = 'test-' + crypto.randomUUID();
        const repo = new DexieGameRepository(name); dbs.push(repo);
        await repo.saveCurrent(game(), null);
        const db = new Dexie(name); db.version(1).stores({ current: 'slot' });
        const unreadable = { ...game(), schemaVersion: 99 };
        try {
            await db.table('current').put({ slot: 'current', game: unreadable });
            await repo.saveCurrent(game(), { unreadable });
            expect(await repo.loadCurrent()).toEqual(game());
            await db.table('current').put({ slot: 'current', game: { ...unreadable, revision: 5 } });
            await expect(repo.saveCurrent(game(), { unreadable })).rejects.toThrow('Otra pestaña');
            expect(await repo.loadCurrent()).toEqual({ ...unreadable, revision: 5 });
        } finally { db.close(); }
    });
    it('recupera revisión y reversión sin cambiar cartas ni reglas', async () => { const repo = new DexieGameRepository('test-' + crypto.randomUUID()); dbs.push(repo); const g = apply(game(), { type: 'advance' }); await repo.saveCurrent(g, null); expect(await repo.loadCurrent()).toEqual(g); });
    it('compara identidad y revisión dentro de una transacción sin sobrescribir', async () => { const name = 'test-' + crypto.randomUUID(); const a = new DexieGameRepository(name), b = new DexieGameRepository(name); dbs.push(a, b); const g = game(); await a.saveCurrent(g, null); const next = apply(g, { type: 'advance' }); await a.saveCurrent(next, { id: g.id, revision: g.revision }); await expect(b.saveCurrent({ ...g, id: 'replacement' }, { id: g.id, revision: g.revision })).rejects.toThrow('Otra pestaña'); expect(await b.loadCurrent()).toEqual(next); });
    it('rechaza snapshots incompatibles, cartas perdidas y puntuaciones manipuladas', () => { const g = game(); expect(validateGame(g).ok).toBe(true); expect(validateGame({ ...g, schemaVersion: 99 }).ok).toBe(false); expect(validateGame({ ...g, decks: { ...g.decks, p1: { ...g.decks.p1, active: [] } } }).ok).toBe(false); const scored = apply(apply(g, { type: 'advance' }), { type: 'record-score', playerId: 'p1', objectiveId: 'engage-fixed', facts: { quarters: 4 } }); scored.entries[0].applied = 80; expect(validateGame(scored).ok).toBe(false); expect(validateCatalog({ ...initialCatalog, rules: [...initialCatalog.rules, initialCatalog.rules[0]] }).ok).toBe(false); });
    it('exporta solo formato permitido y restaura la reversión validada', () => { const g = apply(game(), { type: 'advance' }); const copy = exportGame(g); expect(copy.ok).toBe(true); if (!copy.ok)
        return; expect(parseCopy(copy.value)).toEqual({ ok: true, value: g }); expect(parseCopy(copy.value.replace('"formatVersion":1', '"formatVersion":99')).ok).toBe(false); expect(parseCopy('{"unknown":true}').ok).toBe(false); });
});
