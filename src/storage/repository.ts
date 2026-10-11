import type { Game } from '../domain/types';
export interface StoredIdentity {
    id: string;
    revision: number;
}
export type StoredExpectation = StoredIdentity | { unreadable: unknown } | null;
export interface GameRepository {
    loadCurrent(): Promise<unknown | null>;
    saveCurrent(game: Game, expected: StoredExpectation): Promise<void>;
}
export class WriteConflict extends Error {
    constructor() { super('Otra pestaña ha cambiado la partida. Conserva una copia y carga la revisión actual.'); this.name = 'WriteConflict'; }
}
