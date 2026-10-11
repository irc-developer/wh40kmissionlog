import type { CorrectionPreview, Facts, GameIntent, GameView, Outcome, PlayerId, ScorePreview, SetupDraft, SetupOptions } from '../domain/types';
export type { Facts, GameIntent, GameView, PlayerId, SetupDraft, SetupOptions, EvaluationView, EvaluationField, RuleDefinition, ScoreEntry } from '../domain/types';
export interface PersistenceStatus {
    status: 'idle' | 'saving' | 'saved' | 'error' | 'conflict';
    persistedRevision: number | null;
    message?: string;
    candidateAvailable: boolean;
}
export interface PwaStatus {
    offline: 'preparing' | 'ready' | 'error';
    update: 'none' | 'available' | 'applying' | 'error';
    online: boolean;
    message?: string;
}
export interface ImportPreview {
    game: GameView;
    target: {
        id: string;
        revision: number;
    } | null;
}
export interface TerminalModel {
    load: 'loading' | 'empty' | 'ready' | 'error' | 'incompatible';
    loadMessage?: string;
    catalogMessage?: string;
    persistence: PersistenceStatus;
    pwa: PwaStatus;
    setupOptions: SetupOptions;
    game: GameView | null;
    candidate: GameView | null;
    importStatus: 'idle' | 'validating' | 'ready' | 'error';
    importPreview: ImportPreview | null;
    importMessage?: string;
    actionError?: string;
}
export interface TerminalActions {
    load(): Promise<void>;
    create(draft: SetupDraft, target: {
        id: string;
        revision: number;
    } | null): Promise<Outcome<void>>;
    execute(intent: GameIntent, expectedRevision: number): Promise<Outcome<void>>;
    retrySave(): Promise<Outcome<void>>;
    exportCopy(): Outcome<string>;
    validateImport(text: string): Promise<Outcome<ImportPreview>>;
    importCopy(preview: ImportPreview): Promise<Outcome<void>>;
    cancelImport(): void;
    validateSetup(draft: SetupDraft): {
        valid: boolean;
        errors: {
            code: string;
            message: string;
            field?: string;
        }[];
    };
    previewScore(playerId: PlayerId, objectiveId: string, facts: Facts): ScorePreview;
    previewCorrection(entryId: string, facts: Facts): CorrectionPreview;
    prepareOffline(): Promise<void>;
    applyUpdate(discardDrafts: boolean): Promise<Outcome<void>>;
}
export interface TerminalProps {
    model: TerminalModel;
    actions: TerminalActions;
}
