import Dexie, { type Table } from 'dexie';
import type { Game } from '../domain/types';
import { WriteConflict, type GameRepository, type StoredExpectation } from './repository';
import { validateGame } from './validation';
interface Row {
    slot: 'current';
    game: unknown;
}
export class DexieGameRepository implements GameRepository {
    private db: Dexie;
    private current: Table<Row, string>;
    constructor(name = 'mission-terminal') { this.db = new Dexie(name); this.db.version(1).stores({ current: 'slot' }); this.current = this.db.table('current'); }
    async loadCurrent(): Promise<unknown | null> { return (await this.current.get('current'))?.game ?? null; }
    async saveCurrent(game: Game, expected: StoredExpectation): Promise<void> {
        const checked = validateGame(game);
        if (!checked.ok)
            throw new Error(checked.error.message);
        await this.db.transaction('rw', this.current, async () => {
            const row = await this.current.get('current');
            const matches = expected === null ? row === undefined : 'unreadable' in expected
                ? row !== undefined && sameUnreadableSnapshot(row.game, expected.unreadable)
                : !!row && typeof row.game === 'object' && row.game !== null && 'id' in row.game && 'revision' in row.game && row.game.id === expected.id && row.game.revision === expected.revision;
            if (!matches)
                throw new WriteConflict();
            await this.current.put({ slot: 'current', game: checked.value });
        });
    }
    async destroy() { this.db.close(); await this.db.delete(); }
}

// Los snapshots de partida son datos JSON. Si el dato corrupto no lo es,
// no se permite sustituirlo mediante una comparación que pudiera perder campos.
function sameUnreadableSnapshot(current: unknown, expected: unknown): boolean {
    const serialize = (value: unknown): string | null => {
        const seen = new WeakSet<object>();
        const check = (item: unknown): boolean => {
            if (item === null || typeof item === 'string' || typeof item === 'boolean') return true;
            if (typeof item === 'number') return Number.isFinite(item);
            if (typeof item !== 'object' || seen.has(item)) return false;
            seen.add(item);
            if (!Array.isArray(item) && Object.getPrototypeOf(item) !== Object.prototype) return false;
            return Object.values(item).every(check);
        };
        try { return check(value) ? JSON.stringify(value) : null; } catch { return null; }
    };
    const snapshot = serialize(expected);
    return snapshot !== null && serialize(current) === snapshot;
}
