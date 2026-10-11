import type { Catalog, CorrectionPreview, DeckView, EvaluationView, Facts, Game, GameCommand, GameContent, GameIntent, GameView, ObjectiveDefinition, Outcome, Permission, PlayerId, PlayerView, Problem, RuleDefinition, ScoreEntry, ScorePreview, SetupDraft, SetupOptions, TransitionPreview } from './types';
export type * from './types';
const fail = (code: string, message: string): Outcome<never> => ({ ok: false, error: { code, message } });
const clone = <T,>(value: T): T => structuredClone(value);
const blocked = (reason: string): Permission => ({ enabled: false, reason });
const allowed: Permission = { enabled: true };
const other = (id: PlayerId): PlayerId => id === 'p1' ? 'p2' : 'p1';
export function getSetupOptions(catalog: Catalog): SetupOptions {
    return { packageName: catalog.packageName, catalogVersion: catalog.version, generalRules: clone(catalog.rules.filter(r => r.category === 'general')), primaryMissions: catalog.rules.filter(r => r.category === 'primary'), secondaryMissions: catalog.rules.filter(r => r.category === 'secondary' && r.fixed), fixedCount: 2, modes: [{ id: 'fixed', label: 'Fijas', permission: allowed }, { id: 'tactical', label: 'Tácticas', permission: blocked('Agotamiento pendiente de verificación y mazo completo pendiente de implementación.') }], twists: [{ id: null, label: 'Sin giro', permission: allowed }], pending: catalog.pending, ready: catalog.rules.some(r => r.category === 'primary') && catalog.rules.filter(r => r.fixed).length >= 2 };
}
export function validateSetup(catalog: Catalog, draft: SetupDraft): {
    valid: boolean;
    errors: Problem[];
} {
    const errors: Problem[] = [];
    const add = (field: string, message: string, code = 'invalid-input') => errors.push({ code, message, field });
    if (draft.players.length !== 2 || draft.players[0].id !== 'p1' || draft.players[1].id !== 'p2')
        add('players', 'Se requieren dos jugadores con identidad distinta.');
    for (const p of draft.players) {
        if (!p.name.trim() || p.name.length > 80)
            add(`${p.id}.name`, 'Introduce un nombre de hasta 80 caracteres.');
        if (!p.faction.trim() || p.faction.length > 100)
            add(`${p.id}.faction`, 'Introduce una facción de hasta 100 caracteres.');
        if (p.secondaryMode !== 'fixed')
            add(`${p.id}.secondaryMode`, 'La modalidad táctica está pendiente de implementación.', 'rule-pending');
        if (p.fixedMissionIds.length !== 2 || new Set(p.fixedMissionIds).size !== 2 || p.fixedMissionIds.some(id => !catalog.rules.some(r => r.id === id && r.fixed && r.category === 'secondary')))
            add(`${p.id}.fixedMissionIds`, 'Selecciona dos misiones fijas distintas disponibles.');
    }
    if (!['p1', 'p2'].includes(draft.firstPlayerId))
        add('firstPlayerId', 'Selecciona quién empieza tras resolver la tirada de desempate.');
    if (!catalog.rules.some(r => r.id === draft.primaryMissionId && r.category === 'primary'))
        add('primaryMissionId', 'Selecciona una primaria implementada.');
    if (draft.twistId !== null)
        add('twistId', 'Este giro está pendiente de implementación.', 'rule-pending');
    return { valid: errors.length === 0, errors };
}
export function createGame(catalog: Catalog, draft: SetupDraft, id: string): Outcome<Game> {
    const checked = validateSetup(catalog, draft);
    if (!checked.valid)
        return { ok: false, error: checked.errors[0] };
    return { ok: true, value: { schemaVersion: 1, id, revision: 0, operationIds: [], undo: null, setup: clone(draft), rules: clone(catalog), round: 1, activeTurnPlayerId: draft.firstPlayerId, phase: 'command', finalized: false, decks: { p1: { draw: [], active: [...draft.players[0].fixedMissionIds], discarded: [], achieved: [] }, p2: { draw: [], active: [...draft.players[1].fixedMissionIds], discarded: [], achieved: [] } }, entries: [] } };
}
function findObjective(game: GameContent, id: string): {
    mission: RuleDefinition;
    objective: ObjectiveDefinition;
} | undefined {
    for (const mission of game.rules.rules) {
        const objective = mission.objectives.find(o => o.id === id);
        if (objective)
            return { mission, objective };
    }
}
function permission(game: GameContent, playerId: PlayerId, mission: RuleDefinition, o: ObjectiveDefinition): Permission {
    if (game.finalized)
        return blocked('La partida ha finalizado. Puedes corregir entradas o deshacer.');
    if (mission.category === 'secondary' && !game.decks[playerId].active.includes(mission.id))
        return blocked('Esta misión no está activa para este jugador.');
    if (mission.category === 'primary' && mission.id !== game.setup.primaryMissionId)
        return blocked('Esta no es la primaria de la partida.');
    const own = playerId === game.activeTurnPlayerId;
    const valid = o.window === 'any-end' ? game.phase === 'end' : o.window === 'own-end' ? own && game.phase === 'end' : o.window === 'end-early' ? own && game.phase === 'end' && game.round <= 2 : own && game.round >= 2 && game.phase === (game.round === 5 ? 'end' : 'command');
    if (!valid)
        return blocked('Fuera del momento permitido: ' + o.timing);
    if (game.entries.some(e => e.playerId === playerId && e.objectiveId === o.id && e.round === game.round && e.turnPlayerId === game.activeTurnPlayerId && e.phase === game.phase))
        return blocked('Ya registrada en este momento. Usa Corregir.');
    return allowed;
}
function evaluate(o: ObjectiveDefinition, facts: Facts): Outcome<number> {
    if (Object.keys(facts).some(key => !o.fields.some(f => f.id === key)))
        return fail('invalid-input', 'Hay observaciones desconocidas.');
    for (const f of o.fields) {
        const v = facts[f.id];
        if (f.type === 'boolean' ? typeof v !== 'boolean' : typeof v !== 'number' || !Number.isSafeInteger(v) || v < (f.min ?? 0) || v > (f.max ?? 100))
            return { ok: false, error: { code: 'invalid-input', message: 'Revisa ' + f.label, field: f.id } };
    }
    switch (o.formula) {
        case 'dominance-early': return { ok: true, value: facts.more ? 2 : 0 };
        case 'dominance-late': {
            const n = facts.objectives as number;
            if (facts.home && n === 0)
                return fail('invalid-input', 'Controlar tu objetivo local requiere al menos un objetivo.');
            return { ok: true, value: 3 * n + (facts.home ? 2 * (n - 1) : 0) };
        }
        case 'assassination-fixed':
            if ((facts.wounds4 as number) > (facts.characters as number))
                return fail('invalid-input', 'El subconjunto con H de 4 o más no puede superar los personajes eliminados.');
            return { ok: true, value: 3 * (facts.characters as number) + (facts.wounds4 as number) };
        case 'engage-fixed': return { ok: true, value: facts.quarters === 4 ? 4 : facts.quarters === 3 ? 2 : 0 };
        case 'grievous-fixed': return { ok: true, value: 4 * (facts.units13 as number) };
        case 'bringdown-fixed': return { ok: true, value: 4 * (facts.models10 as number) };
    }
}
function category(game: GameContent, e: ScoreEntry) { return game.rules.rules.find(r => r.id === e.missionId)?.category; }
function cap(game: GameContent, entry: ScoreEntry, previous: ScoreEntry[]): number {
    const cat = category(game, entry);
    const entries = previous.filter(e => e.playerId === entry.playerId && category(game, e) === cat);
    const sum = (es: ScoreEntry[]) => es.reduce((s, e) => s + e.applied, 0);
    const l = game.rules.limits;
    return Math.max(0, Math.min(entry.requested, (cat === 'primary' ? l.primaryGame : l.secondaryGame) - sum(entries), (cat === 'primary' ? l.primaryRound : l.secondaryRound) - sum(entries.filter(e => e.round === entry.round)), cat === 'secondary' ? l.fixedMission - sum(entries.filter(e => e.missionId === entry.missionId)) : Infinity));
}
export function previewScore(game: Game, playerId: PlayerId, objectiveId: string, facts: Facts): ScorePreview {
    const found = findObjective(game, objectiveId);
    if (!found)
        return { valid: false, requested: 0, applied: 0, errors: [{ code: 'invalid-input', message: 'Misión desconocida.' }], limits: [] };
    const p = permission(game, playerId, found.mission, found.objective);
    const result = evaluate(found.objective, facts);
    if (!p.enabled || !result.ok)
        return { valid: false, requested: 0, applied: 0, errors: [!p.enabled ? { code: 'not-allowed', message: p.reason! } : (!result.ok ? result.error : { code: 'invalid-input', message: 'Revisa las observaciones.' })], limits: [] };
    const entry: ScoreEntry = { id: 'preview', playerId, missionId: found.mission.id, objectiveId, round: game.round, turnPlayerId: game.activeTurnPlayerId, phase: game.phase, facts, requested: result.value, applied: 0, note: '', corrected: false };
    const applied = cap(game, entry, game.entries);
    return { valid: true, requested: result.value, applied, errors: [], limits: applied < result.value ? ['Se aplica el límite de ronda, partida o misión fija.'] : [] };
}
function players(game: GameContent): PlayerView[] { return game.setup.players.map(p => { const es = game.entries.filter(e => e.playerId === p.id); const primary = es.filter(e => category(game, e) === 'primary').reduce((s, e) => s + e.applied, 0); const secondary = es.filter(e => category(game, e) === 'secondary').reduce((s, e) => s + e.applied, 0); const battleReady = p.battleReady ? game.rules.limits.battleReady : 0; return { id: p.id, name: p.name, faction: p.faction, primary, secondary, battleReady, total: primary + secondary + battleReady }; }); }
function result(game: GameContent) { if (!game.finalized)
    return null; const ps = players(game); const winner = ps[0].total === ps[1].total ? null : ps[ps[0].total > ps[1].total ? 0 : 1]; return { winnerId: winner?.id ?? null, label: winner ? `Victoria de ${winner.name}` : 'Empate' }; }
export function previewCorrection(game: Game, entryId: string, facts: Facts): CorrectionPreview {
    const empty = { affectedEntryIds: [], changes: [], players: players(game), result: result(game) };
    const e = game.entries.find(e => e.id === entryId);
    const found = e && findObjective(game, e.objectiveId);
    if (!e || !found)
        return { ...empty, valid: false, requested: 0, applied: 0, errors: [{ code: 'invalid-input', message: 'Entrada desconocida.' }], limits: [] };
    const computed = evaluate(found.objective, facts);
    if (!computed.ok)
        return { ...empty, valid: false, requested: 0, applied: 0, errors: [computed.error], limits: [] };
    const candidate = clone(game);
    candidate.entries = candidate.entries.map(e => e.id === entryId ? { ...e, facts: clone(facts), requested: computed.value, corrected: true } : e);
    const previous: ScoreEntry[] = [];
    for (const entry of candidate.entries) {
        entry.applied = cap(candidate, entry, previous);
        previous.push(entry);
    }
    const changes = candidate.entries.flatMap(e => { const before = game.entries.find(x => x.id === e.id)!; return before.applied !== e.applied ? [{ entryId: e.id, beforeApplied: before.applied, afterApplied: e.applied }] : []; });
    const updated = candidate.entries.find(e => e.id === entryId)!;
    return { valid: true, requested: updated.requested, applied: updated.applied, errors: [], limits: updated.applied < updated.requested ? ['Se recalculan los límites de todas las entradas afectadas.'] : [], affectedEntryIds: changes.map(c => c.entryId), changes, players: players(candidate), result: result(candidate) };
}
export function getTransition(game: Game): TransitionPreview {
    if (game.finalized)
        return { label: 'Partida finalizada', destination: 'Resultado', permission: blocked('La partida ya ha finalizado.'), consequences: [] };
    const name = game.setup.players.find(p => p.id === game.activeTurnPlayerId)!.name;
    if (game.phase === 'command')
        return { label: 'Ir al final del turno', destination: `Final del turno de ${name}`, permission: allowed, consequences: ['Las observaciones de la fase de mando sin registrar quedarán sin puntuación.'] };
    const last = game.round === game.rules.rounds && game.activeTurnPlayerId !== game.setup.firstPlayerId;
    return { label: last ? 'Finalizar partida' : `Terminar turno de ${name}`, destination: last ? 'Resultado' : `Ronda ${game.round + (game.activeTurnPlayerId === game.setup.firstPlayerId ? 0 : 1)}, turno de ${game.setup.players.find(p => p.id === other(game.activeTurnPlayerId))!.name}`, permission: allowed, consequences: ['Los registros no realizados se omiten. Las misiones fijas siguen activas.'] };
}
export function getDeckView(game: Game, playerId: PlayerId): DeckView { const d = game.decks[playerId]; return { mode: game.setup.players.find(p => p.id === playerId)!.secondaryMode, active: d.active.map(id => game.rules.rules.find(r => r.id === id)!), remaining: d.draw.length, discarded: d.discarded.length, achieved: d.achieved.length, draw: blocked('Las misiones fijas están activas durante toda la partida; no se roban.'), discard: blocked('Las misiones fijas no pueden descartarse.') }; }
export function getEvaluation(game: Game, playerId: PlayerId): EvaluationView[] { return game.rules.rules.filter(m => m.id === game.setup.primaryMissionId || game.decks[playerId].active.includes(m.id)).flatMap(m => m.objectives.map(o => ({ missionId: m.id, objectiveId: o.id, name: m.name + ' · ' + o.title, timing: o.timing, text: m.text, fields: clone(o.fields), permission: permission(game, playerId, m, o), entryId: game.entries.find(e => e.playerId === playerId && e.objectiveId === o.id && e.round === game.round && e.turnPlayerId === game.activeTurnPlayerId && e.phase === game.phase)?.id }))); }
export function getGameView(game: Game): GameView { return { id: game.id, revision: game.revision, packageName: game.rules.packageName, catalogVersion: game.rules.version, round: game.round, activeTurnPlayerId: game.activeTurnPlayerId, phase: game.phase, contextId: `${game.round}-${game.activeTurnPlayerId}-${game.phase}`, finalized: game.finalized, players: players(game), evaluations: { p1: getEvaluation(game, 'p1'), p2: getEvaluation(game, 'p2') }, decks: { p1: getDeckView(game, 'p1'), p2: getDeckView(game, 'p2') }, rules: clone(game.rules.rules), entries: clone(game.entries), transition: getTransition(game), undo: { permission: game.undo ? allowed : blocked('No hay una operación reversible.'), label: game.undo?.label ?? 'Sin operación' }, result: result(game), steps: game.finalized ? [] : [game.phase === 'command' ? 'Registrar las condiciones de mando disponibles.' : 'Registrar primaria y secundarias de ambos jugadores según sus ventanas.', 'Revisar registros antes de avanzar.'] }; }
function content(game: Game): GameContent { const { setup, rules, round, activeTurnPlayerId, phase, finalized, decks, entries } = game; return clone({ setup, rules, round, activeTurnPlayerId, phase, finalized, decks, entries }); }
export function validateContent(game: GameContent): string | null {
    if (!validateSetup(game.rules, game.setup).valid)
        return 'Preparación incoherente.';
    for (const p of game.setup.players) {
        const d = game.decks[p.id];
        if (d.draw.length || d.discarded.length || d.achieved.length || d.active.join() !== p.fixedMissionIds.join())
            return 'Las selecciones fijas no se conservan.';
    }
    if (game.finalized && (game.round !== 5 || game.phase !== 'end' || game.activeTurnPlayerId === game.setup.firstPlayerId))
        return 'Finalización incoherente.';
    const seen = new Set<string>();
    const previous: ScoreEntry[] = [];
    let last = -1;
    const moment = (round: number, turn: PlayerId, phase: string) => (round - 1) * 4 + (turn === game.setup.firstPlayerId ? 0 : 2) + (phase === 'end' ? 1 : 0);
    for (const entry of game.entries) {
        const found = findObjective(game, entry.objectiveId);
        const order = moment(entry.round, entry.turnPlayerId, entry.phase);
        const key = [entry.playerId, entry.objectiveId, entry.round, entry.turnPlayerId, entry.phase].join();
        if (!found || found.mission.id !== entry.missionId || seen.has(key) || previous.some(e => e.id === entry.id) || order < last || order > moment(game.round, game.activeTurnPlayerId, game.phase))
            return 'El registro contiene referencias, duplicados o momentos incoherentes.';
        const context = { ...game, round: entry.round, activeTurnPlayerId: entry.turnPlayerId, phase: entry.phase, finalized: false, entries: previous };
        const p = permission(context, entry.playerId, found.mission, found.objective);
        const value = evaluate(found.objective, entry.facts);
        if (!p.enabled || !value.ok || value.value !== entry.requested || cap(game, entry, previous) !== entry.applied)
            return 'Las observaciones o puntuaciones no coinciden con las reglas conservadas.';
        seen.add(key);
        previous.push(entry);
        last = order;
    }
    return null;
}
export function executeCommand(game: Game, command: GameCommand): Outcome<Game> {
    if (command.expectedRevision !== game.revision)
        return fail('stale-revision', 'El contexto ha cambiado. Revisa la partida.');
    if (!command.operationId || game.operationIds.includes(command.operationId))
        return fail('already-applied', 'Esta operación ya fue aplicada.');
    const intent: GameIntent = command.intent;
    const next = clone(game);
    let label: string;
    if (intent.type === 'undo') {
        if (!game.undo)
            return fail('not-allowed', 'No hay una operación reversible.');
        Object.assign(next, clone(game.undo.content));
        next.undo = null;
    }
    else {
        if (intent.type === 'record-score') {
            const preview = previewScore(game, intent.playerId, intent.objectiveId, intent.facts);
            if (!preview.valid)
                return { ok: false, error: preview.errors[0] };
            const found = findObjective(game, intent.objectiveId)!;
            next.entries.push({ id: command.operationId, playerId: intent.playerId, missionId: found.mission.id, objectiveId: intent.objectiveId, round: game.round, turnPlayerId: game.activeTurnPlayerId, phase: game.phase, facts: clone(intent.facts), requested: preview.requested, applied: preview.applied, note: '', corrected: false });
            label = 'registro de ' + found.mission.name;
        }
        else if (intent.type === 'correct') {
            if (!intent.note.trim() || intent.note.length > 300)
                return fail('invalid-input', 'Indica un motivo de hasta 300 caracteres.');
            const p = previewCorrection(game, intent.entryId, intent.facts);
            if (!p.valid)
                return { ok: false, error: p.errors[0] };
            const e = next.entries.find(e => e.id === intent.entryId)!;
            e.facts = clone(intent.facts);
            e.requested = p.requested;
            e.note = intent.note;
            e.corrected = true;
            const previous: ScoreEntry[] = [];
            for (const entry of next.entries) {
                entry.applied = cap(next, entry, previous);
                previous.push(entry);
            }
            label = 'corrección de puntuación';
        }
        else if (intent.type === 'advance') {
            const p = getTransition(game);
            if (!p.permission.enabled)
                return fail('not-allowed', p.permission.reason!);
            if (game.phase === 'command')
                next.phase = 'end';
            else if (game.round === game.rules.rounds && game.activeTurnPlayerId !== game.setup.firstPlayerId)
                next.finalized = true;
            else {
                next.phase = 'command';
                next.activeTurnPlayerId = other(game.activeTurnPlayerId);
                if (next.activeTurnPlayerId === game.setup.firstPlayerId)
                    next.round++;
            }
            label = game.phase === 'command' ? 'avance a final de turno' : next.finalized ? 'finalización' : 'avance de turno';
        }
        else
            return fail('rule-pending', 'La partida usa misiones fijas; no permite robos ni descartes.');
        next.undo = { label, content: content(game) };
    }
    next.revision = game.revision + 1;
    next.operationIds.push(command.operationId);
    return { ok: true, value: next };
}
