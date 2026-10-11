export type PlayerId = 'p1' | 'p2';
export type Facts = Record<string, number | boolean>;
export type Phase = 'command' | 'end';
export interface Problem {
    code: string;
    message: string;
    field?: string;
}
export type Outcome<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: Problem;
};
export interface EvaluationField {
    id: string;
    label: string;
    type: 'integer' | 'boolean';
    min?: number;
    max?: number;
}
export interface ObjectiveDefinition {
    id: string;
    title: string;
    timing: string;
    window: 'command-late' | 'end-early' | 'own-end' | 'any-end';
    fields: EvaluationField[];
    formula: 'dominance-early' | 'dominance-late' | 'assassination-fixed' | 'engage-fixed' | 'grievous-fixed' | 'bringdown-fixed';
}
export interface RuleDefinition {
    id: string;
    name: string;
    category: 'primary' | 'secondary' | 'general';
    text: string;
    objectives: ObjectiveDefinition[];
    fixed: boolean;
}
export interface Catalog {
    id: string;
    version: string;
    packageName: string;
    rules: RuleDefinition[];
    limits: {
        primaryRound: number;
        primaryGame: number;
        secondaryRound: number;
        secondaryGame: number;
        fixedMission: number;
        battleReady: number;
    };
    rounds: number;
    pending: string[];
}
export interface PlayerSetup {
    id: PlayerId;
    name: string;
    faction: string;
    battleReady: boolean;
    secondaryMode: 'fixed' | 'tactical';
    fixedMissionIds: string[];
}
export interface SetupDraft {
    players: [
        PlayerSetup,
        PlayerSetup
    ];
    firstPlayerId: PlayerId;
    primaryMissionId: string;
    twistId: string | null;
}
export interface ScoreEntry {
    id: string;
    playerId: PlayerId;
    missionId: string;
    objectiveId: string;
    round: number;
    turnPlayerId: PlayerId;
    phase: Phase;
    facts: Facts;
    requested: number;
    applied: number;
    note: string;
    corrected: boolean;
}
export interface DeckState {
    draw: string[];
    active: string[];
    discarded: string[];
    achieved: string[];
}
export interface GameContent {
    setup: SetupDraft;
    rules: Catalog;
    round: number;
    activeTurnPlayerId: PlayerId;
    phase: Phase;
    finalized: boolean;
    decks: Record<PlayerId, DeckState>;
    entries: ScoreEntry[];
}
export interface Game extends GameContent {
    schemaVersion: 1;
    id: string;
    revision: number;
    operationIds: string[];
    undo: {
        label: string;
        content: GameContent;
    } | null;
}
export type GameIntent = {
    type: 'record-score';
    playerId: PlayerId;
    objectiveId: string;
    facts: Facts;
} | {
    type: 'correct';
    entryId: string;
    facts: Facts;
    note: string;
} | {
    type: 'advance';
} | {
    type: 'undo';
} | {
    type: 'draw';
    playerId: PlayerId;
} | {
    type: 'discard';
    playerId: PlayerId;
    missionId: string;
};
export interface GameCommand {
    operationId: string;
    expectedRevision: number;
    intent: GameIntent;
}
export interface Permission {
    enabled: boolean;
    reason?: string;
}
export interface EvaluationView {
    missionId: string;
    objectiveId: string;
    name: string;
    timing: string;
    text: string;
    fields: EvaluationField[];
    permission: Permission;
    entryId?: string;
}
export interface ScorePreview {
    valid: boolean;
    requested: number;
    applied: number;
    errors: Problem[];
    limits: string[];
}
export interface CorrectionPreview extends ScorePreview {
    affectedEntryIds: string[];
    changes: {
        entryId: string;
        beforeApplied: number;
        afterApplied: number;
    }[];
    players: PlayerView[];
    result: {
        winnerId: PlayerId | null;
        label: string;
    } | null;
}
export interface TransitionPreview {
    label: string;
    destination: string;
    permission: Permission;
    consequences: string[];
}
export interface DeckView {
    mode: 'fixed' | 'tactical';
    active: RuleDefinition[];
    remaining: number;
    discarded: number;
    achieved: number;
    draw: Permission;
    discard: Permission;
}
export interface PlayerView {
    id: PlayerId;
    name: string;
    faction: string;
    primary: number;
    secondary: number;
    battleReady: number;
    total: number;
}
export interface GameView {
    id: string;
    revision: number;
    packageName: string;
    catalogVersion: string;
    round: number;
    activeTurnPlayerId: PlayerId;
    phase: Phase;
    contextId: string;
    finalized: boolean;
    players: PlayerView[];
    evaluations: Record<PlayerId, EvaluationView[]>;
    decks: Record<PlayerId, DeckView>;
    rules: RuleDefinition[];
    entries: ScoreEntry[];
    transition: TransitionPreview;
    undo: {
        permission: Permission;
        label: string;
    };
    result: {
        winnerId: PlayerId | null;
        label: string;
    } | null;
    steps: string[];
}
export interface SetupOptions {
    packageName: string;
    catalogVersion: string;
    generalRules: RuleDefinition[];
    primaryMissions: RuleDefinition[];
    secondaryMissions: RuleDefinition[];
    modes: {
        id: 'fixed' | 'tactical';
        label: string;
        permission: Permission;
    }[];
    twists: {
        id: string | null;
        label: string;
        permission: Permission;
    }[];
    fixedCount: number;
    pending: string[];
    ready: boolean;
}
