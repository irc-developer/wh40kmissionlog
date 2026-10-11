// Datos sintéticos para comprobar el contrato de UI. No validan reglas de juego.
import { vi } from 'vitest';
import type { GameView, RuleDefinition, TerminalActions, TerminalModel } from '../../application/ui-contract';

export const primaryRule: RuleDefinition = {
  id: 'test-primary', name: 'Primaria de prueba', category: 'primary', fixed: false,
  text: 'Texto sintético de consulta. La puntuación la proporciona el motor.',
  objectives: [{ id: 'test-objective', title: 'Condición de prueba', timing: 'Ventana de prueba', window: 'command-late', fields: [{ id: 'count', label: 'Objetivos observados', type: 'integer', min: 0, max: 6 }], formula: 'dominance-late' }],
};
const secondary = (id: string): RuleDefinition => ({ ...primaryRule, id, name: `Secundaria ${id}`, category: 'secondary', fixed: true, objectives: [] });

export function terminalFixture(): { model: TerminalModel; actions: TerminalActions } {
  const game: GameView = {
    id: 'test-game', revision: 3, packageName: 'Paquete de prueba', catalogVersion: 'test-1',
    round: 2, activeTurnPlayerId: 'p1', phase: 'command', contextId: 'test-context', finalized: false,
    players: [
      { id: 'p1', name: 'Aurora', faction: 'Facción uno', primary: 7, secondary: 0, battleReady: 0, total: 7 },
      { id: 'p2', name: 'Boreal', faction: 'Facción dos', primary: 3, secondary: 0, battleReady: 0, total: 3 },
    ],
    evaluations: {
      p1: [{ missionId: primaryRule.id, objectiveId: 'test-objective', name: 'Primaria de prueba', timing: 'Ventana de prueba', text: 'Condición de prueba', fields: primaryRule.objectives[0].fields, permission: { enabled: true } }],
      p2: [{ missionId: primaryRule.id, objectiveId: 'test-objective', name: 'Primaria de prueba', timing: 'Ventana de prueba', text: 'Condición de prueba', fields: primaryRule.objectives[0].fields, permission: { enabled: false, reason: 'Fuera de la ventana de puntuación.' } }],
    },
    decks: {
      p1: { mode: 'fixed', active: [secondary('uno'), secondary('dos')], remaining: 0, discarded: 0, achieved: 0, draw: { enabled: false, reason: 'Selecciones fijas.' }, discard: { enabled: false, reason: 'No se permite descartar.' } },
      p2: { mode: 'fixed', active: [secondary('uno'), secondary('dos')], remaining: 0, discarded: 0, achieved: 0, draw: { enabled: false, reason: 'Selecciones fijas.' }, discard: { enabled: false, reason: 'No se permite descartar.' } },
    },
    rules: [primaryRule, secondary('uno'), secondary('dos')], entries: [],
    transition: { label: 'Cerrar fase de prueba', destination: 'Destino del motor', permission: { enabled: true }, consequences: ['Consecuencia proporcionada por el motor.'] },
    undo: { permission: { enabled: true }, label: 'registro de prueba' }, result: null, steps: ['Paso proporcionado por el motor'],
  };
  return {
    model: {
      load: 'ready', persistence: { status: 'saved', persistedRevision: 3, candidateAvailable: false },
      pwa: { offline: 'preparing', update: 'none', online: true },
      setupOptions: { packageName: 'Paquete de prueba', catalogVersion: 'test-1', generalRules: [], primaryMissions: [primaryRule], secondaryMissions: [secondary('uno'), secondary('dos')], modes: [{ id: 'fixed', label: 'Fijas', permission: { enabled: true } }, { id: 'tactical', label: 'Tácticas', permission: { enabled: false, reason: 'Pendiente de verificación.' } }], twists: [{ id: null, label: 'Sin giro', permission: { enabled: true } }], fixedCount: 2, pending: ['Tácticas pendientes de verificación.'], ready: true },
      game, candidate: null, importStatus: 'idle', importPreview: null,
    },
    actions: {
      load: vi.fn(async () => undefined), create: vi.fn(async () => ({ ok: true as const, value: undefined })),
      execute: vi.fn(async () => ({ ok: true as const, value: undefined })), retrySave: vi.fn(async () => ({ ok: true as const, value: undefined })),
      exportCopy: vi.fn(() => ({ ok: true as const, value: '{"format":"test"}' })),
      validateImport: vi.fn(async () => ({ ok: false as const, error: { code: 'invalid-snapshot', message: 'Copia de prueba inválida.' } })),
      importCopy: vi.fn(async () => ({ ok: true as const, value: undefined })), cancelImport: vi.fn(),
      validateSetup: vi.fn(() => ({ valid: true, errors: [] })),
      previewScore: vi.fn(() => ({ valid: true, requested: 9, applied: 4, errors: [], limits: ['Límite proporcionado por el motor.'] })),
      previewCorrection: vi.fn(() => ({ valid: true, requested: 9, applied: 4, errors: [], limits: [], affectedEntryIds: [], changes: [], players: [], result: null })),
      prepareOffline: vi.fn(async () => undefined), applyUpdate: vi.fn(async () => ({ ok: true as const, value: undefined })),
    },
  };
}
