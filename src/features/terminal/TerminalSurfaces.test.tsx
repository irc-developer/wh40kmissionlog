import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MissionTerminal } from './MissionTerminal';
import { primaryRule, terminalFixture } from './terminal.fixture';
import { installDialogFixture } from '../../components/dialog.fixture';

beforeEach(() => { window.history.replaceState(null, '', '#/partida'); installDialogFixture(); });

describe('Preparación y resultado', () => {
  it('consulta reglas generales congeladas en partida y actuales al preparar sin confundirlas', async () => {
    const props = terminalFixture();
    props.model.game!.rules.unshift({ ...primaryRule, id: 'test-general', name: 'Reglas generales de prueba', category: 'general', objectives: [], text: 'Texto general conservado en esta partida.' });
    props.model.setupOptions.generalRules = [{ ...props.model.game!.rules[0], text: 'Texto general del catálogo actual.' }];
    const user = userEvent.setup();
    render(<MissionTerminal {...props} />);
    await user.click(screen.getByRole('button', { name: 'Reglas del paquete' }));
    expect(within(screen.getByRole('dialog')).getByText('Texto general conservado en esta partida.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Cerrar Reglas generales de prueba' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Inicio' }));
    await user.click(screen.getByRole('button', { name: 'Nueva partida' }));
    await user.click(screen.getByRole('button', { name: 'Reglas del paquete' }));
    expect(within(screen.getByRole('dialog')).getByText('Texto general del catálogo actual.')).toBeVisible();
    expect(screen.queryByText('Texto general conservado en esta partida.')).not.toBeInTheDocument();
  });

  it('asocia errores del motor a los campos y bloquea el inicio inválido', async () => {
    const props = terminalFixture();
    props.actions.validateSetup = vi.fn(() => ({ valid: false, errors: [{ code: 'invalid-input', field: 'p1.name', message: 'Revisa el nombre del jugador.' }] }));
    window.history.replaceState(null, '', '#/preparacion');
    render(<MissionTerminal {...props} />);
    expect(screen.getByRole('textbox', { name: 'Nombre del jugador 1' })).toHaveAccessibleDescription('Revisa el nombre del jugador.');
    expect(screen.getByRole('button', { name: 'Iniciar partida' })).toBeDisabled();
    expect(props.actions.create).not.toHaveBeenCalled();
  });

  it('cancelar sustitución conserva la partida y el borrador de preparación', async () => {
    const props = terminalFixture();
    window.history.replaceState(null, '', '#/preparacion');
    const user = userEvent.setup();
    render(<MissionTerminal {...props} />);
    await user.type(screen.getByRole('textbox', { name: 'Nombre del jugador 1' }), 'Nombre nuevo');
    await user.click(screen.getByRole('button', { name: 'Iniciar partida' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('textbox', { name: 'Nombre del jugador 1' })).toHaveValue('Nombre nuevo');
    expect(props.actions.create).not.toHaveBeenCalled();
  });

  it('presenta el resultado aportado por el motor', () => {
    const props = terminalFixture();
    props.model.game!.finalized = true;
    props.model.game!.result = { winnerId: null, label: 'Resultado sintético del motor' };
    window.history.replaceState(null, '', '#/resultado');
    render(<MissionTerminal {...props} />);
    expect(screen.getByText('Resultado sintético del motor')).toBeVisible();
    expect(screen.queryByText('Victoria de Aurora')).not.toBeInTheDocument();
  });
});

describe('Mazos, registro y decisiones', () => {
  it('consulta las selecciones fijas del rival sin presentar pila de robo', async () => {
    const props = terminalFixture();
    const user = userEvent.setup();
    render(<MissionTerminal {...props} />);
    await user.click(screen.getByRole('button', { name: /Consultar Boreal/ }));
    await user.click(screen.getByRole('button', { name: 'Mazo de Boreal' }));
    const panel = screen.getByRole('dialog', { name: 'Mazo de Boreal' });
    expect(within(panel).getByText('Selecciones fijas')).toBeVisible();
    expect(within(panel).queryByText('Cartas por robar')).not.toBeInTheDocument();
    expect(within(panel).getByText('No se permite descartar.')).toBeVisible();
    expect(props.actions.execute).not.toHaveBeenCalled();
  });

  it('deshacer requiere confirmación y no se confunde con la consulta', async () => {
    const props = terminalFixture();
    const user = userEvent.setup();
    render(<MissionTerminal {...props} />);
    await user.click(screen.getByRole('button', { name: 'Deshacer registro de prueba' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(props.actions.execute).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Deshacer registro de prueba' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirmar deshacer' }));
    expect(props.actions.execute).toHaveBeenCalledWith({ type: 'undo' }, 3);
  });

  it('conserva corrección y motivo al consultar reglas y muestra efectos completos', async () => {
    const props = terminalFixture();
    props.model.game!.entries = [{ id: 'test-entry', playerId: 'p1', missionId: 'test-primary', objectiveId: 'test-objective', round: 2, turnPlayerId: 'p1', phase: 'command', facts: { count: 1 }, requested: 7, applied: 7, note: '', corrected: false }];
    props.actions.previewCorrection = vi.fn(() => ({ valid: true, requested: 5, applied: 5, errors: [], limits: [], affectedEntryIds: ['test-entry'], changes: [{ entryId: 'test-entry', beforeApplied: 7, afterApplied: 5 }], players: [{ ...props.model.game!.players[0], total: 5 }], result: null }));
    const user = userEvent.setup();
    render(<MissionTerminal {...props} />);
    await user.click(screen.getByRole('button', { name: 'Desglose y registro' }));
    await user.click(screen.getByRole('button', { name: 'Corregir entrada de Aurora en Primaria de prueba' }));
    await user.type(screen.getByRole('textbox', { name: 'Motivo de la corrección' }), 'Observación revisada');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Consultar reglas de la corrección' }));
    expect(screen.getByRole('dialog', { name: 'Primaria de prueba' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Cerrar Primaria de prueba' }));
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'Corregir puntuación' })).toBeVisible());
    expect(screen.getByRole('textbox', { name: 'Motivo de la corrección' })).toHaveValue('Observación revisada');
    expect(screen.getByText('7 → 5 PV')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Aplicar corrección' }));
    expect(props.actions.execute).toHaveBeenCalledWith({ type: 'correct', entryId: 'test-entry', facts: { count: 1 }, note: 'Observación revisada' }, 3);
  });

  it('Atrás cierra reglas sin registrar ni deshacer una acción', async () => {
    const props = terminalFixture();
    render(<MissionTerminal {...props} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Consultar reglas de Primaria de prueba' }));
    window.history.back();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(props.actions.execute).not.toHaveBeenCalled();
  });

  it('un rechazo de corrección permanece visible dentro del diálogo y conserva el motivo', async () => {
    const props = terminalFixture();
    props.model.game!.entries = [{ id: 'test-entry', playerId: 'p1', missionId: 'test-primary', objectiveId: 'test-objective', round: 2, turnPlayerId: 'p1', phase: 'command', facts: { count: 1 }, requested: 7, applied: 7, note: '', corrected: false }];
    props.actions.execute = vi.fn(async () => ({ ok: false as const, error: { code: 'invalid-input', message: 'Corrección rechazada por el motor.' } }));
    const user = userEvent.setup();
    render(<MissionTerminal {...props} />);
    await user.click(screen.getByRole('button', { name: 'Desglose y registro' }));
    await user.click(screen.getByRole('button', { name: 'Corregir entrada de Aurora en Primaria de prueba' }));
    await user.type(screen.getByRole('textbox', { name: 'Motivo de la corrección' }), 'Pendiente');
    await user.click(screen.getByRole('button', { name: 'Aplicar corrección' }));
    const dialog = screen.getByRole('dialog', { name: 'Corregir puntuación' });
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Corrección rechazada por el motor.');
    expect(screen.getByRole('textbox', { name: 'Motivo de la corrección' })).toHaveValue('Pendiente');
  });
});

describe('Copias y fiabilidad', () => {
  it('permite validar y confirmar una copia compatible sin ejecutar acciones sobre datos incompatibles', async () => {
    const props = terminalFixture();
    const importedGame = props.model.game!;
    props.model.game = null;
    props.model.load = 'incompatible';
    props.model.persistence.status = 'idle';
    const view = render(<MissionTerminal {...props} />);
    props.actions.validateImport = vi.fn(async () => {
      props.model.importPreview = { game: importedGame, target: null };
      props.model.importStatus = 'ready';
      view.rerender(<MissionTerminal {...props} />);
      return { ok: true as const, value: props.model.importPreview };
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Importar copia compatible' }));
    const file = new File(['{}'], 'copia.json', { type: 'application/json' });
    Object.defineProperty(file, 'text', { value: async () => '{}' });
    expect(screen.getByLabelText('Importar copia')).toBeEnabled();
    await user.upload(screen.getByLabelText('Importar copia'), file);
    expect(props.actions.importCopy).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Revisar sustitución' }));
    expect(screen.getByText('Los datos locales incompatibles se sustituirán solo al confirmar y completar el guardado. No se pueden exportar como una partida válida.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Sustituir con copia' }));
    expect(props.actions.importCopy).toHaveBeenCalledWith(props.model.importPreview);
    expect(props.actions.create).not.toHaveBeenCalled();
    expect(props.actions.execute).not.toHaveBeenCalled();
  });

  it.each(['loading', 'error'] as const)('no habilita importación durante carga %s', async load => {
    const props = terminalFixture();
    props.model.game = null;
    props.model.load = load;
    render(<MissionTerminal {...props} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Copia de seguridad' }));
    expect(screen.getByLabelText('Importar copia')).toBeDisabled();
  });

  it('una copia inválida explica el fallo y no sustituye la partida', async () => {
    const props = terminalFixture();
    const user = userEvent.setup();
    render(<MissionTerminal {...props} />);
    await user.click(screen.getByRole('button', { name: 'Copia de seguridad' }));
    const file = new File(['{}'], 'copia.json', { type: 'application/json' });
    Object.defineProperty(file, 'text', { value: async () => '{}' });
    await user.upload(screen.getByLabelText('Importar copia'), file);
    expect(await screen.findByText('Copia de prueba inválida.')).toBeVisible();
    expect(props.actions.importCopy).not.toHaveBeenCalled();
  });

  it('cargar otra revisión tras conflicto exige confirmar y ofrece conservar copia', async () => {
    const props = terminalFixture();
    props.model.persistence.status = 'conflict';
    const user = userEvent.setup();
    render(<MissionTerminal {...props} />);
    await user.click(screen.getByRole('button', { name: 'Revisar versión almacenada' }));
    expect(props.actions.load).not.toHaveBeenCalled();
    const dialog = screen.getByRole('dialog', { name: 'Resolver conflicto' });
    expect(within(dialog).getByRole('button', { name: 'Exportar cambios pendientes' })).toBeEnabled();
    await user.click(within(dialog).getByRole('button', { name: 'Cargar versión almacenada' }));
    expect(props.actions.load).toHaveBeenCalledTimes(1);
  });

  it('una actualización disponible no recarga y exige revisar borradores', async () => {
    const props = terminalFixture();
    props.model.pwa.update = 'available';
    const user = userEvent.setup();
    render(<MissionTerminal {...props} />);
    expect(props.actions.applyUpdate).not.toHaveBeenCalled();
    await user.type(screen.getByRole('spinbutton', { name: 'Objetivos observados' }), '3');
    await user.click(screen.getByRole('button', { name: 'Revisar actualización' }));
    const dialog = screen.getByRole('dialog', { name: 'Actualizar terminal' });
    const confirm = within(dialog).getByRole('button', { name: 'Aplicar actualización' });
    expect(confirm).toBeDisabled();
    await user.click(within(dialog).getByRole('checkbox', { name: 'Descartar expresamente los borradores sin registrar' }));
    await user.click(confirm);
    expect(props.actions.applyUpdate).toHaveBeenCalledWith(true);
  });

  it.each(['preparado', 'orden'])('protege también cambios de preparación de %s al actualizar', async change => {
    const props = terminalFixture();
    props.model.pwa.update = 'available';
    window.history.replaceState(null, '', '#/preparacion');
    render(<MissionTerminal {...props} />);
    const user = userEvent.setup();
    if (change === 'preparado') await user.click(screen.getAllByRole('checkbox', { name: 'Ejército preparado para la batalla' })[0]);
    else await user.selectOptions(screen.getByRole('combobox', { name: 'Primer jugador' }), 'p2');
    await user.click(screen.getByRole('button', { name: 'Revisar actualización' }));
    expect(screen.getByRole('button', { name: 'Aplicar actualización' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Descartar expresamente los borradores sin registrar' })).toBeVisible();
    expect(props.actions.applyUpdate).not.toHaveBeenCalled();
  });

  it('las entradas ya registradas dejan de contarse como borradores pendientes', async () => {
    const props = terminalFixture();
    props.model.pwa.update = 'available';
    const user = userEvent.setup();
    render(<MissionTerminal {...props} />);
    await user.type(screen.getByRole('spinbutton', { name: 'Objetivos observados' }), '3');
    await user.click(screen.getByRole('button', { name: /Registrar puntuación de Aurora/ }));
    await user.click(screen.getByRole('button', { name: 'Revisar actualización' }));
    expect(screen.queryByRole('checkbox', { name: 'Descartar expresamente los borradores sin registrar' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Aplicar actualización' }));
    expect(props.actions.applyUpdate).toHaveBeenCalledWith(false);
  });
});
