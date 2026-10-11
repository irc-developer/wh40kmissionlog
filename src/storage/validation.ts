import { z } from 'zod';
import { validateContent } from '../domain/index';
import type { Catalog, Game, Outcome } from '../domain/types';
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
const short = z.string().min(1).max(300);
const nonnegative = z.number().int().min(0).max(10000);
const playerId = z.enum(['p1', 'p2']);
const field = z.strictObject({ id, label: short, type: z.enum(['integer', 'boolean']), min: nonnegative.optional(), max: nonnegative.optional() });
const objective = z.strictObject({ id, title: short, timing: short, window: z.enum(['command-late', 'end-early', 'own-end', 'any-end']), fields: z.array(field).min(1).max(10), formula: z.enum(['dominance-early', 'dominance-late', 'assassination-fixed', 'engage-fixed', 'grievous-fixed', 'bringdown-fixed']) });
const rule = z.strictObject({ id, name: short, category: z.enum(['primary', 'secondary', 'general']), text: z.string().max(20000), objectives: z.array(objective).max(10), fixed: z.boolean() });
const catalog = z.strictObject({ id, version: z.string().regex(/^\d+\.\d+\.\d+$/), packageName: short, rules: z.array(rule).min(1).max(100), limits: z.strictObject({ primaryRound: nonnegative, primaryGame: nonnegative, secondaryRound: nonnegative, secondaryGame: nonnegative, fixedMission: nonnegative, battleReady: nonnegative }), rounds: z.literal(5), pending: z.array(short).max(100) });
const player = z.strictObject({ id: playerId, name: z.string().min(1).max(80), faction: z.string().min(1).max(100), battleReady: z.boolean(), secondaryMode: z.literal('fixed'), fixedMissionIds: z.array(id).length(2) });
const setup = z.strictObject({ players: z.tuple([player, player]), firstPlayerId: playerId, primaryMissionId: id, twistId: z.null() });
const facts = z.record(id, z.union([z.boolean(), z.number().int().min(0).max(10000)]));
const entry = z.strictObject({ id, playerId, missionId: id, objectiveId: id, round: z.number().int().min(1).max(5), turnPlayerId: playerId, phase: z.enum(['command', 'end']), facts, requested: nonnegative, applied: nonnegative, note: z.string().max(300), corrected: z.boolean() });
const deck = z.strictObject({ draw: z.array(id).max(100), active: z.array(id).max(100), discarded: z.array(id).max(100), achieved: z.array(id).max(100) });
const content = z.strictObject({ setup, rules: catalog, round: z.number().int().min(1).max(5), activeTurnPlayerId: playerId, phase: z.enum(['command', 'end']), finalized: z.boolean(), decks: z.strictObject({ p1: deck, p2: deck }), entries: z.array(entry).max(1000) });
const gameSchema = content.extend({ schemaVersion: z.literal(1), id, revision: nonnegative, operationIds: z.array(id).max(10000), undo: z.strictObject({ label: short, content }).nullable() });
const copySchema = z.strictObject({ format: z.literal('mission-terminal'), formatVersion: z.literal(1), game: gameSchema });
function failed(message: string, code = 'invalid-snapshot'): Outcome<never> { return { ok: false, error: { code, message } }; }
export function validateCatalog(value: unknown): Outcome<Catalog> {
    const parsed = catalog.safeParse(value);
    if (!parsed.success)
        return failed('El catálogo contiene campos no válidos.', 'invalid-catalog');
    const c = parsed.data;
    const ids = c.rules.map(r => r.id), os = c.rules.flatMap(r => r.objectives.map(o => o.id));
    if (new Set(ids).size !== ids.length || new Set(os).size !== os.length)
        return failed('El catálogo contiene identificadores duplicados.', 'invalid-catalog');
    const specs = { 'dominance-early': { window: 'end-early', keys: ['more:boolean'] }, 'dominance-late': { window: 'command-late', keys: ['objectives:integer', 'home:boolean'] }, 'assassination-fixed': { window: 'any-end', keys: ['characters:integer', 'wounds4:integer'] }, 'engage-fixed': { window: 'own-end', keys: ['quarters:integer'] }, 'grievous-fixed': { window: 'any-end', keys: ['units13:integer'] }, 'bringdown-fixed': { window: 'any-end', keys: ['models10:integer'] } };
    for (const r of c.rules) {
        if (r.category === 'general' ? (r.fixed || r.objectives.length !== 0) : r.objectives.length === 0)
            return failed('La categoría y los objetivos no son compatibles.', 'invalid-catalog');
    }
    for (const r of c.rules)
        for (const o of r.objectives) {
            const s = specs[o.formula];
            if (o.window !== s.window || o.fields.map(f => f.id + ':' + f.type).join() !== s.keys.join() || o.fields.some(f => f.type === 'integer' && (f.min !== 0 || f.max === undefined || f.max > 100 || f.max < 1)) || (o.formula.startsWith('dominance') ? r.category !== 'primary' : r.category !== 'secondary' || !r.fixed))
                return failed('La definición usa un comportamiento no compatible.', 'invalid-catalog');
        }
    const l = c.limits;
    if (l.primaryRound !== 15 || l.primaryGame !== 45 || l.secondaryRound !== 15 || l.secondaryGame !== 45 || l.fixedMission !== 20 || l.battleReady !== 10)
        return failed('Los límites del paquete no son compatibles.', 'invalid-catalog');
    return { ok: true, value: c };
}
export function validateGame(value: unknown): Outcome<Game> {
    const parsed = gameSchema.safeParse(value);
    if (!parsed.success)
        return failed('La copia no es válida o usa un esquema no compatible.', typeof value === 'object' && value !== null && 'schemaVersion' in value && value.schemaVersion !== 1 ? 'unsupported-schema' : 'invalid-snapshot');
    const g = parsed.data;
    const cat = validateCatalog(g.rules);
    if (!cat.ok)
        return cat;
    if (new Set(g.operationIds).size !== g.operationIds.length || g.operationIds.length !== g.revision || g.entries.some(e => !g.operationIds.includes(e.id)))
        return failed('La identidad de las operaciones no es coherente.');
    const problem = validateContent(g);
    if (problem)
        return failed(problem);
    if (g.undo) {
        const c = validateCatalog(g.undo.content.rules);
        if (!c.ok)
            return c;
        const p = validateContent(g.undo.content);
        if (p || JSON.stringify(g.undo.content.setup) !== JSON.stringify(g.setup) || JSON.stringify(g.undo.content.rules) !== JSON.stringify(g.rules) || g.undo.content.entries.some(e => !g.operationIds.includes(e.id)))
            return failed('La información de deshacer no es coherente.');
    }
    return { ok: true, value: g };
}
export function exportGame(game: Game): Outcome<string> { const checked = validateGame(game); return checked.ok ? { ok: true, value: JSON.stringify({ format: 'mission-terminal', formatVersion: 1, game: checked.value }) } : checked; }
export function parseCopy(text: string): Outcome<Game> { if (text.length > 2000000)
    return failed('La copia supera el tamaño permitido.'); try {
    const parsed = copySchema.safeParse(JSON.parse(text));
    if (!parsed.success)
        return failed('Formato de copia no compatible.');
    return validateGame(parsed.data.game);
}
catch {
    return failed('No se ha podido leer el archivo de copia.');
} }
