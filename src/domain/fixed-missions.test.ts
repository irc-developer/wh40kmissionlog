import { expect, it } from 'vitest';
import { initialCatalog } from '../catalog/initial';
import { createGame, executeCommand, previewScore } from './index';
import { setup } from '../../tests/game-fixture';
it('Golpe brutal y Derribadlo son fijas elegibles y puntúan por unidades/miniaturas al final de cualquier turno', () => {
    const draft = { ...setup, players: [{ ...setup.players[0], fixedMissionIds: ['secondary-grievous', 'secondary-bringdown'] }, setup.players[1]] as typeof setup.players };
    const created = createGame(initialCatalog, draft, 'fixed-match');
    expect(created.ok).toBe(true);
    if (!created.ok)
        return;
    const moved = executeCommand(created.value, { operationId: 'advance-1', expectedRevision: 0, intent: { type: 'advance' } });
    expect(moved.ok).toBe(true);
    if (!moved.ok)
        return;
    expect(previewScore(moved.value, 'p1', 'grievous-fixed', { units13: 2 })).toMatchObject({ valid: true, requested: 8, applied: 8 });
    expect(previewScore(moved.value, 'p1', 'bringdown-fixed', { models10: 1 })).toMatchObject({ valid: true, requested: 4, applied: 4 });
});
