import { createGame, executeCommand, getGameView, getSetupOptions, previewCorrection, previewScore, validateSetup } from '../domain/index';
import type { Catalog, CorrectionPreview, Facts, Game, GameIntent, Outcome, PlayerId, ScorePreview, SetupDraft } from '../domain/types';
import { WriteConflict, type GameRepository, type StoredIdentity, type StoredExpectation } from '../storage/repository';
import { exportGame, parseCopy, validateCatalog, validateGame } from '../storage/validation';
import type { ImportPreview, PwaStatus, TerminalActions, TerminalModel } from './ui-contract';
const success: Outcome<void> = { ok: true, value: undefined };
const failure = (code: string, message: string): Outcome<never> => ({ ok: false, error: { code, message } });
interface PendingWrite {
    game: Game;
    expected: StoredExpectation;
    replace: boolean;
}
export interface PwaPort {
    prepare(): Promise<void>;
    apply(): Promise<void>;
}
export class SessionController implements TerminalActions {
    model: TerminalModel;
    private current: Game | null = null;
    private persisted: StoredIdentity | null = null;
    private unreadable: { unreadable: unknown } | null = null;
    private pending: PendingWrite | null = null;
    private imported: Game | null = null;
    private importToken: ImportPreview | null = null;
    private listeners = new Set<() => void>();
    private epoch = 0;
    private busy = false;
    private catalogValid: boolean;
    constructor(private repository: GameRepository, private catalog: Catalog, private identity: () => string, private pwa?: PwaPort) {
        const cat = validateCatalog(catalog);
        this.catalogValid = cat.ok;
        this.model = { load: 'loading', catalogMessage: cat.ok ? undefined : cat.error.message, persistence: { status: 'idle', persistedRevision: null, candidateAvailable: false }, pwa: { offline: 'preparing', update: 'none', online: true }, setupOptions: cat.ok ? getSetupOptions(cat.value) : { packageName: 'Catálogo no disponible', catalogVersion: '', generalRules: [], primaryMissions: [], secondaryMissions: [], modes: [], twists: [], fixedCount: 2, pending: [], ready: false }, game: null, candidate: null, importStatus: 'idle', importPreview: null };
    }
    subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
    private update(patch: Partial<TerminalModel>) { this.model = { ...this.model, ...patch }; for (const listener of this.listeners)
        listener(); }
    setPwa(patch: Partial<PwaStatus>) { this.update({ pwa: { ...this.model.pwa, ...patch } }); }
    async load(): Promise<void> {
        if (this.busy)
            return;
        const epoch = ++this.epoch;
        this.imported = null;
        this.importToken = null;
        this.unreadable = null;
        this.update({ load: 'loading', loadMessage: undefined, actionError: undefined });
        try {
            const raw = await this.repository.loadCurrent();
            if (epoch !== this.epoch)
                return;
            if (raw === null) {
                this.current = null;
                this.persisted = null;
                this.pending = null;
                this.update({ load: 'empty', game: null, candidate: null, importStatus: 'idle', importPreview: null, persistence: { status: 'idle', persistedRevision: null, candidateAvailable: false } });
                return;
            }
            const checked = validateGame(raw);
            if (!checked.ok) {
                this.current = null;
                this.persisted = null;
                this.pending = null;
                this.unreadable = { unreadable: structuredClone(raw) };
                this.update({ load: 'incompatible', loadMessage: checked.error.message, game: null, candidate: null, importStatus: 'idle', importPreview: null, persistence: { status: 'idle', persistedRevision: null, candidateAvailable: false } });
                return;
            }
            this.current = checked.value;
            this.persisted = { id: checked.value.id, revision: checked.value.revision };
            this.pending = null;
            this.imported = null;
            this.importToken = null;
            this.update({ load: 'ready', game: getGameView(checked.value), candidate: null, persistence: { status: 'saved', persistedRevision: checked.value.revision, candidateAvailable: false }, importStatus: 'idle', importPreview: null });
        }
        catch (error) {
            if (epoch !== this.epoch)
                return;
            this.update({ load: 'error', loadMessage: message(error) });
        }
    }
    private canMutate(recovery = false): Outcome<void> {
        if (this.busy || this.model.persistence.status === 'saving')
            return failure('busy', 'Espera a que termine la escritura.');
        if (this.pending)
            return failure('write-pending', 'Resuelve el guardado pendiente antes de otra acción.');
        if (!['ready', 'empty'].includes(this.model.load) && !(recovery && this.model.load === 'incompatible' && this.unreadable))
            return failure('load-pending', 'Carga una partida compatible antes de modificarla.');
        return success;
    }
    private checkTarget(target: StoredIdentity | null) { return target === null ? this.persisted === null : !!this.persisted && target.id === this.persisted.id && target.revision === this.persisted.revision; }
    async create(draft: SetupDraft, target: StoredIdentity | null): Promise<Outcome<void>> {
        const can = this.canMutate();
        if (!can.ok)
            return can;
        if (!this.catalogValid)
            return failure('invalid-catalog', this.model.catalogMessage!);
        if (!this.checkTarget(target))
            return failure('stale-revision', 'Ha cambiado la partida que ibas a sustituir.');
        const created = createGame(this.catalog, draft, this.identity());
        if (!created.ok) {
            this.update({ actionError: created.error.message });
            return created;
        }
        return this.persist({ game: created.value, expected: target, replace: true });
    }
    async execute(intent: GameIntent, expectedRevision: number): Promise<Outcome<void>> {
        const can = this.canMutate();
        if (!can.ok)
            return can;
        if (!this.current)
            return failure('not-allowed', 'No hay partida en curso.');
        const next = executeCommand(this.current, { operationId: this.identity(), expectedRevision, intent });
        if (!next.ok) {
            this.update({ actionError: next.error.message });
            return next;
        }
        return this.persist({ game: next.value, expected: this.persisted, replace: false });
    }
    private async persist(write: PendingWrite): Promise<Outcome<void>> {
        this.busy = true;
        ++this.epoch;
        this.pending = write;
        if (!write.replace)
            this.current = write.game;
        this.update({ game: this.current ? getGameView(this.current) : null, candidate: write.replace ? getGameView(write.game) : null, actionError: undefined, persistence: { status: 'saving', persistedRevision: this.persisted?.revision ?? null, candidateAvailable: true } });
        try {
            await this.repository.saveCurrent(write.game, write.expected);
            this.current = write.game;
            this.persisted = { id: write.game.id, revision: write.game.revision };
            this.pending = null;
            this.unreadable = null;
            this.imported = null;
            this.importToken = null;
            this.update({ load: 'ready', game: getGameView(write.game), candidate: null, persistence: { status: 'saved', persistedRevision: write.game.revision, candidateAvailable: false }, importStatus: 'idle', importPreview: null });
            return success;
        }
        catch (error) {
            const conflict = error instanceof WriteConflict;
            this.update({ persistence: { status: conflict ? 'conflict' : 'error', persistedRevision: this.persisted?.revision ?? null, candidateAvailable: true, message: conflict ? error.message : 'No se han guardado los últimos cambios. Reintenta o exporta una copia antes de cerrar.' } });
            return failure(conflict ? 'write-conflict' : 'write-failed', message(error));
        }
        finally {
            this.busy = false;
        }
    }
    async retrySave(): Promise<Outcome<void>> { if (this.busy)
        return failure('busy', 'La escritura está en curso.'); if (this.model.persistence.status === 'conflict')
        return failure('write-conflict', 'Conserva una copia y carga la revisión de la otra pestaña.'); if (!this.pending)
        return failure('not-allowed', 'No hay una escritura pendiente.'); return this.persist(this.pending); }
    exportCopy(): Outcome<string> { const g = this.pending?.game ?? this.current; return g ? exportGame(g) : failure('not-allowed', 'No hay una partida válida para exportar.'); }
    async validateImport(text: string): Promise<Outcome<ImportPreview>> {
        const can = this.canMutate(true);
        if (!can.ok) return can;
        this.update({ importStatus: 'validating', importMessage: undefined, importPreview: null });
        const parsed = parseCopy(text);
        if (!parsed.ok) {
            this.imported = null;
            this.importToken = null;
            this.update({ importStatus: 'error', importMessage: parsed.error.message });
            return parsed;
        }
        this.imported = { ...parsed.value, id: this.identity() };
        const preview = { game: getGameView(this.imported), target: this.persisted ? { ...this.persisted } : null };
        this.importToken = preview;
        this.update({ importStatus: 'ready', importPreview: preview });
        return { ok: true, value: preview };
    }
    async importCopy(preview: ImportPreview): Promise<Outcome<void>> { const can = this.canMutate(true); if (!can.ok)
        return can; if (!this.imported || preview !== this.importToken || !this.checkTarget(preview.target))
        return failure('stale-revision', 'La vista previa ya no es válida. Revisa la copia.'); return this.persist({ game: this.imported, expected: this.unreadable ?? preview.target, replace: true }); }
    cancelImport() { if (this.busy)
        return; this.imported = null; this.importToken = null; this.update({ importStatus: 'idle', importPreview: null, importMessage: undefined }); }
    validateSetup = (draft: SetupDraft) => this.catalogValid ? validateSetup(this.catalog, draft) : { valid: false, errors: [{ code: 'invalid-catalog', message: this.model.catalogMessage ?? 'Catálogo no disponible.' }] };
    previewScore = (player: PlayerId, objective: string, facts: Facts): ScorePreview => this.current ? previewScore(this.current, player, objective, facts) : { valid: false, requested: 0, applied: 0, limits: [], errors: [{ code: 'not-allowed', message: 'No hay partida.' }] };
    previewCorrection = (entry: string, facts: Facts): CorrectionPreview => this.current ? previewCorrection(this.current, entry, facts) : { valid: false, requested: 0, applied: 0, limits: [], errors: [{ code: 'not-allowed', message: 'No hay partida.' }], affectedEntryIds: [], changes: [], players: [], result: null };
    async prepareOffline(): Promise<void> { if (!this.pwa)
        return; this.setPwa({ offline: 'preparing' }); try {
        await this.pwa.prepare();
    }
    catch (error) {
        this.setPwa({ offline: 'error', message: message(error) });
    } }
    async applyUpdate(discardDrafts: boolean): Promise<Outcome<void>> { void discardDrafts; if (this.busy || this.pending || this.model.load === 'loading')
        return failure('write-pending', 'La partida debe estar guardada antes de actualizar.'); if (!this.pwa || this.model.pwa.update !== 'available')
        return failure('not-allowed', 'No hay actualización disponible.'); this.setPwa({ update: 'applying' }); try {
        await this.pwa.apply();
        return success;
    }
    catch (error) {
        this.setPwa({ update: 'error', message: message(error) });
        return failure('update-failed', message(error));
    } }
}
function message(error: unknown) { return error instanceof Error ? error.message : 'Almacenamiento no disponible.'; }
