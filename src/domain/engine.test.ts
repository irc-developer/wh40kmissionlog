import { describe, expect, it } from 'vitest';
import { initialCatalog } from '../catalog/initial';
import { executeCommand, getGameView, previewScore, validateSetup } from './index';
import { setup, game, apply } from '../../tests/game-fixture';
describe('primer recorrido verificado', () => {
    it('valida dos fijas distintas y bloquea tácticas pendientes', () => {
        expect(validateSetup(initialCatalog, setup).valid).toBe(true);
        expect(validateSetup(initialCatalog, { ...setup, players: [{ ...setup.players[0], fixedMissionIds: ['secondary-engage', 'secondary-engage'] }, setup.players[1]] }).valid).toBe(false);
        expect(validateSetup(initialCatalog, { ...setup, twistId: 'unknown' }).valid).toBe(false);
    });
    it('congela reglas y mantiene dos jugadores con sus selecciones', () => { const g = game(); expect(g.decks.p1.active).toEqual(setup.players[0].fixedMissionIds); expect(g.rules).toEqual(initialCatalog); expect(g.rules).not.toBe(initialCatalog); expect(getGameView(g).players.map(p => p.total)).toEqual([10, 0]); });
    it('previsualiza sin mutar y puntúa solo la ventana correspondiente', () => {
        let g = game();
        const before = structuredClone(g);
        expect(previewScore(g, 'p1', 'dominance-early', { more: true }).valid).toBe(false);
        expect(g).toEqual(before);
        g = apply(g, { type: 'advance' });
        expect(previewScore(g, 'p1', 'dominance-early', { more: true })).toMatchObject({ valid: true, requested: 2, applied: 2 });
        g = apply(g, { type: 'record-score', playerId: 'p1', objectiveId: 'dominance-early', facts: { more: true } });
        expect(getGameView(g).players[0].primary).toBe(2);
        expect(previewScore(g, 'p1', 'dominance-early', { more: true }).valid).toBe(false);
    });
    it('Asesinato se puntúa al final de cualquier turno, máximo 15 por ronda y 20 por fija', () => {
        let g = apply(game(), { type: 'advance' });
        g = apply(g, { type: 'record-score', playerId: 'p2', objectiveId: 'assassination-fixed', facts: { characters: 4, wounds4: 4 } });
        expect(getGameView(g).players[1].secondary).toBe(15);
        expect(g.entries[0]).toMatchObject({ requested: 16, applied: 15 });
        g = apply(g, { type: 'advance' });
        g = apply(g, { type: 'advance' });
        expect(previewScore(g, 'p2', 'assassination-fixed', { characters: 2, wounds4: 2 }).applied).toBe(0);
        g = apply(g, { type: 'advance' });
        g = apply(g, { type: 'advance' });
        expect(previewScore(g, 'p2', 'assassination-fixed', { characters: 4, wounds4: 4 }).applied).toBe(5);
    });
    it('Luchar en todos los frentes fija da 2/4 PV, sin sumar condiciones excluyentes', () => { const g = apply(game(), { type: 'advance' }); expect(previewScore(g, 'p1', 'engage-fixed', { quarters: 3 }).requested).toBe(2); expect(previewScore(g, 'p1', 'engage-fixed', { quarters: 4 }).requested).toBe(4); expect(previewScore(g, 'p2', 'engage-fixed', { quarters: 4 }).valid).toBe(false); });
    it('rechaza datos imposibles, revisiones antiguas, operación repetida y descarte de fijas', () => {
        let g = apply(game(), { type: 'advance' });
        expect(previewScore(g, 'p1', 'assassination-fixed', { characters: 1, wounds4: 2 }).valid).toBe(false);
        expect(executeCommand(g, { operationId: 'new', expectedRevision: 0, intent: { type: 'advance' } }).ok).toBe(false);
        expect(executeCommand(g, { operationId: 'op-0', expectedRevision: g.revision, intent: { type: 'advance' } }).ok).toBe(false);
        expect(executeCommand(g, { operationId: 'new', expectedRevision: g.revision, intent: { type: 'discard', playerId: 'p1', missionId: 'secondary-engage' } }).ok).toBe(false);
        g = apply(g, { type: 'record-score', playerId: 'p1', objectiveId: 'engage-fixed', facts: { quarters: 4 } });
        const reverted = apply(g, { type: 'undo' });
        expect(reverted.entries).toHaveLength(0);
        expect(reverted.phase).toBe('end');
        expect(reverted.revision).toBe(g.revision + 1);
    });
    it('finaliza tras cinco rondas completas y deshacer restaura todo', () => {
        let g = game();
        for (let i = 0; i < 20; i++)
            g = apply(g, { type: 'advance' });
        expect(getGameView(g)).toMatchObject({ finalized: true, result: { winnerId: 'p1' } });
        g = apply(g, { type: 'undo' });
        expect(g.finalized).toBe(false);
        expect(g.round).toBe(5);
        expect(g.phase).toBe('end');
    });
    it('Dominio desde ronda 2 aplica control y acumulación del objetivo local', () => {
        let g = game();
        for (let i = 0; i < 4; i++)
            g = apply(g, { type: 'advance' });
        expect(previewScore(g, 'p1', 'dominance-late', { objectives: 3, home: true }).requested).toBe(13);
        expect(previewScore(g, 'p1', 'dominance-late', { objectives: 3, home: false }).requested).toBe(9);
    });
});
