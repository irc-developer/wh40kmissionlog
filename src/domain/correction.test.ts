import { expect, it } from 'vitest';
import { apply, game } from '../../tests/game-fixture';
import { getGameView, previewCorrection } from './index';
it('corregir una entrada recalcula límites de entradas posteriores y se deshace tras recuperación', () => {
    let g = apply(game(), { type: 'advance' });
    g = apply(g, { type: 'record-score', playerId: 'p1', objectiveId: 'assassination-fixed', facts: { characters: 4, wounds4: 4 } });
    const entryId = g.entries[0].id;
    g = apply(g, { type: 'record-score', playerId: 'p1', objectiveId: 'engage-fixed', facts: { quarters: 4 } });
    expect(g.entries[1].applied).toBe(0);
    const preview = previewCorrection(g, entryId, { characters: 1, wounds4: 1 });
    expect(preview.changes).toEqual([{ entryId, beforeApplied: 15, afterApplied: 4 }, { entryId: g.entries[1].id, beforeApplied: 0, afterApplied: 4 }]);
    expect(preview.players[0].secondary).toBe(8);
    const original = structuredClone(g);
    g = apply(g, { type: 'correct', entryId, facts: { characters: 1, wounds4: 1 }, note: 'Corrección del número observado' });
    expect(getGameView(g).players[0].secondary).toBe(8);
    g = apply(structuredClone(g), { type: 'undo' });
    expect(g.entries).toEqual(original.entries);
    expect(g.decks).toEqual(original.decks);
});
it('la primaria nunca supera45PV y ronda5 puntúa al final para ambos jugadores', () => {
    let g = game();
    for (let i = 0; i < 4; i++)
        g = apply(g, { type: 'advance' });
    for (let round = 2; round <= 4; round++) {
        g = apply(g, { type: 'record-score', playerId: 'p1', objectiveId: 'dominance-late', facts: { objectives: 5, home: false } });
        for (let i = 0; i < 4; i++)
            g = apply(g, { type: 'advance' });
    }
    expect(getGameView(g).players[0].primary).toBe(45);
    g = apply(g, { type: 'advance' });
    g = apply(g, { type: 'record-score', playerId: 'p1', objectiveId: 'dominance-late', facts: { objectives: 5, home: false } });
    expect(g.entries.at(-1)?.applied).toBe(0);
    g = apply(g, { type: 'advance' });
    g = apply(g, { type: 'advance' });
    g = apply(g, { type: 'record-score', playerId: 'p2', objectiveId: 'dominance-late', facts: { objectives: 1, home: false } });
    expect(g.entries.at(-1)?.applied).toBe(3);
});
