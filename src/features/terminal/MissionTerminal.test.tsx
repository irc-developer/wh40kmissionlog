import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MissionTerminal } from './MissionTerminal';
import { terminalFixture } from './terminal.fixture';
import { installDialogFixture } from '../../components/dialog.fixture';

beforeEach(() => { window.history.replaceState(null, '', '#/partida'); installDialogFixture(); });

describe('Terminal de partida', () => {
  it('el último avance muestra Resultado aunque la confirmación termine después del cambio de modelo', async () => {
    const props = terminalFixture();
    props.model.game!.transition.label = 'Finalizar partida';
    const view = render(<MissionTerminal {...props} />);
    props.actions.execute = vi.fn(async () => {
      props.model.game = { ...props.model.game!, finalized: true, result: { winnerId: 'p1', label: 'Victoria de Aurora' } };
      view.rerender(<MissionTerminal {...props} />);
      return { ok: true as const, value: undefined };
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Finalizar partida' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Finalizar partida' }));
    expect(screen.getByRole('heading', { name: 'Resultado' })).toBeVisible();
    expect(window.location.hash).toBe('#/resultado');
  });

  it('deshacer una operación que conserva finalización mantiene Resultado', async () => {
    const props = terminalFixture();
    props.model.game!.finalized = true;
    props.model.game!.result = { winnerId: null, label: 'Empate de prueba' };
    window.history.replaceState(null, '', '#/resultado');
    render(<MissionTerminal {...props} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Deshacer registro de prueba' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirmar deshacer' }));
    expect(screen.getByRole('heading', { name: 'Resultado' })).toBeVisible();
  });

  it('después del avance enfoca el contexto del turno en lugar de la confirmación cerrada', async () => {
    const props = terminalFixture();
    const view = render(<MissionTerminal {...props} />);
    props.actions.execute = vi.fn(async () => {
      props.model.game = { ...props.model.game!, phase: 'end', contextId: 'test-next-context' };
      view.rerender(<MissionTerminal {...props} />);
      return { ok: true as const, value: undefined };
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Cerrar fase de prueba' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirmar avance' }));
    expect(screen.getByRole('region', { name: 'Contexto del turno' })).toHaveFocus();
  });

  it('consultar al rival conserva el turno y no ejecuta acciones', async () => {
    const props = terminalFixture();
    const user = userEvent.setup();
    render(<MissionTerminal {...props} />);
    await user.click(screen.getByRole('button', { name: /Consultar Boreal/ }));
    expect(screen.getByText('Turno de Aurora')).toBeVisible();
    expect(screen.getByText('Consultando a Boreal')).toBeVisible();
    expect(screen.getByText('Fuera de la ventana de puntuación.')).toBeVisible();
    expect(props.actions.execute).not.toHaveBeenCalled();
  });

  it('conserva entradas al consultar reglas y al cambiar de jugador', async () => {
    const props = terminalFixture();
    const user = userEvent.setup();
    render(<MissionTerminal {...props} />);
    const field = screen.getByRole('spinbutton', { name: 'Objetivos observados' });
    await user.clear(field);
    await user.type(field, '3');
    const launcher = screen.getByRole('button', { name: 'Consultar reglas de Primaria de prueba' });
    await user.click(launcher);
    const dialog = screen.getByRole('dialog', { name: 'Primaria de prueba' });
    expect(within(dialog).getByText(/Texto sintético de consulta/)).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Cerrar Primaria de prueba' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(field).toHaveValue(3);
    expect(launcher).toHaveFocus();
    await user.click(screen.getByRole('button', { name: /Consultar Boreal/ }));
    await user.click(screen.getByRole('button', { name: /Consultar Aurora/ }));
    expect(screen.getByRole('spinbutton', { name: 'Objetivos observados' })).toHaveValue(3);
    expect(props.actions.execute).not.toHaveBeenCalled();
  });

  it('muestra la previsión del motor y registra una única intención con revisión', async () => {
    const props = terminalFixture();
    let finish: ((value: {ok: true; value: undefined}) => void) | undefined;
    props.actions.execute = vi.fn(() => new Promise<{ok: true; value: undefined}>(resolve => { finish = resolve; }));
    const user = userEvent.setup();
    render(<MissionTerminal {...props} />);
    expect(screen.getByText('Previsión +4 PV')).toBeVisible();
    expect(screen.getByText(/Solicitado: 9 PV/)).toBeVisible();
    const button = screen.getByRole('button', { name: /Registrar.*Aurora.*Primaria de prueba/ });
    await user.dblClick(button);
    expect(props.actions.execute).toHaveBeenCalledTimes(1);
    expect(props.actions.execute).toHaveBeenCalledWith({ type: 'record-score', playerId: 'p1', objectiveId: 'test-objective', facts: { count: 0 } }, 3);
    finish?.({ ok: true, value: undefined });
  });

  it('cancelar avance conserva el contexto; confirmar usa el destino del motor', async () => {
    const props = terminalFixture();
    const user = userEvent.setup();
    render(<MissionTerminal {...props} />);
    await user.click(screen.getByRole('button', { name: 'Cerrar fase de prueba' }));
    const dialog = screen.getByRole('dialog', { name: 'Revisar avance' });
    expect(within(dialog).getByText('Destino del motor')).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(props.actions.execute).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Cerrar fase de prueba' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirmar avance' }));
    expect(props.actions.execute).toHaveBeenCalledWith({ type: 'advance' }, 3);
  });

  it('conserva un borrador cuya revisión cambió y exige revisar la nueva previsión', async () => {
    const props = terminalFixture();
    const user = userEvent.setup();
    const view = render(<MissionTerminal {...props} />);
    await user.clear(screen.getByRole('spinbutton', { name: 'Objetivos observados' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Objetivos observados' }), '3');
    props.model.game = { ...props.model.game!, revision: 4 };
    view.rerender(<MissionTerminal {...props} />);
    expect(screen.getByText('Revisar antes de registrar: el contexto ha cambiado.')).toBeVisible();
    expect(screen.getByRole('spinbutton', { name: 'Objetivos observados' })).toHaveValue(3);
    expect(screen.getByRole('button', { name: /Registrar puntuación de Aurora/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Revisar previsión de Primaria de prueba' }));
    expect(screen.getByRole('button', { name: /Registrar puntuación de Aurora/ })).toBeEnabled();
  });

  it('asocia el error de evaluación del motor con la observación que necesita revisión', () => {
    const props = terminalFixture();
    props.actions.previewScore = vi.fn(() => ({ valid: false, requested: 0, applied: 0, limits: [], errors: [{ code: 'invalid-input', field: 'count', message: 'Revisa los objetivos observados.' }] }));
    render(<MissionTerminal {...props} />);
    expect(screen.getByRole('spinbutton', { name: 'Objetivos observados' })).toHaveAccessibleDescription('Revisa los objetivos observados.');
    expect(screen.getByRole('button', { name: /Registrar puntuación de Aurora/ })).toBeDisabled();
  });
});

describe('Carga y persistencia', () => {
  it('cargar la revisión almacenada abre su partida aunque la carga termine después del cambio de modelo', async () => {
    const props = terminalFixture();
    props.model.persistence.status = 'conflict';
    let finishLoad: (() => void) | undefined;
    const view = render(<MissionTerminal {...props} />);
    props.actions.load = vi.fn(async () => {
      props.model.load = 'loading';
      view.rerender(<MissionTerminal {...props} />);
      await new Promise<void>(resolve => { finishLoad = resolve; });
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Revisar versión almacenada' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cargar versión almacenada' }));
    props.model.load = 'ready';
    props.model.persistence.status = 'saved';
    props.model.game = { ...props.model.game!, revision: 4 };
    view.rerender(<MissionTerminal {...props} />);
    await act(async () => { finishLoad?.(); });
    expect(screen.getByRole('heading', { name: 'Terminal de partida' })).toBeVisible();
    expect(window.location.hash).toBe('#/partida');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('espera la carga y distingue un fallo de una partida vacía', async () => {
    const props = terminalFixture();
    props.model.load = 'loading'; props.model.game = null;
    const view = render(<MissionTerminal {...props} />);
    expect(screen.getByText('Cargando partida…')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Nueva partida' })).not.toBeInTheDocument();
    props.model.load = 'error'; props.model.loadMessage = 'No se puede leer el almacenamiento.';
    view.rerender(<MissionTerminal {...props} />);
    expect(screen.getByText('No se puede leer el almacenamiento.')).toBeVisible();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Reintentar carga' }));
    expect(props.actions.load).toHaveBeenCalledTimes(1);
    expect(props.actions.create).not.toHaveBeenCalled();
  });

  it('no anuncia guardado hasta recibir estado saved y ofrece reintento tras fallo', async () => {
    const props = terminalFixture();
    props.model.persistence = { status: 'saving', persistedRevision: 2, candidateAvailable: true };
    const view = render(<MissionTerminal {...props} />);
    expect(screen.getByText('Guardando cambios…')).toBeVisible();
    expect(screen.queryByText('Guardado en este dispositivo')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrar.*Aurora/ })).toBeDisabled();
    props.model.persistence = { status: 'error', persistedRevision: 2, candidateAvailable: true };
    view.rerender(<MissionTerminal {...props} />);
    expect(screen.getByText(/No se han guardado los últimos cambios/)).toBeVisible();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Reintentar guardado' }));
    expect(props.actions.retrySave).toHaveBeenCalledTimes(1);
    props.model.persistence = { status: 'saved', persistedRevision: 3, candidateAvailable: false };
    view.rerender(<MissionTerminal {...props} />);
    expect(screen.getByText('Guardado en este dispositivo')).toBeVisible();
  });

  it('un reintento de creación activa la partida nueva solo después del guardado', () => {
    const props = terminalFixture();
    window.history.replaceState(null, '', '#/preparacion');
    props.model.persistence.status = 'error';
    props.model.candidate = { ...props.model.game!, id: 'new-test-game' };
    const view = render(<MissionTerminal {...props} />);
    expect(screen.getByRole('heading', { name: 'Preparar partida' })).toBeVisible();
    props.model.game = props.model.candidate;
    props.model.candidate = null;
    props.model.persistence.status = 'saved';
    view.rerender(<MissionTerminal {...props} />);
    expect(screen.getByRole('heading', { name: 'Terminal de partida' })).toBeVisible();
  });

  it('un nuevo contexto consulta el jugador del turno aunque se estuviera viendo al rival', async () => {
    const props = terminalFixture();
    const view = render(<MissionTerminal {...props} />);
    await userEvent.setup().click(screen.getByRole('button', { name: /Consultar Boreal/ }));
    props.model.game = { ...props.model.game!, phase: 'end', contextId: 'test-next-context' };
    view.rerender(<MissionTerminal {...props} />);
    expect(screen.getByText('Consultando a Aurora')).toBeVisible();
  });
});
