// Fixtures técnicas: verifican interacción y accesibilidad, no reglas de juego.
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SurfaceDialog } from './SurfaceDialog';
import { installDialogFixture } from './dialog.fixture';

beforeEach(() => {
  installDialogFixture();
});
afterEach(() => vi.restoreAllMocks());

describe('SurfaceDialog', () => {
  it('identifica la consulta, enfoca Cerrar y devuelve foco al disparador', () => {
    const launcher = document.createElement('button');
    launcher.textContent = 'Consultar regla';
    document.body.append(launcher);
    launcher.focus();
    const view = render(<SurfaceDialog title="Regla de misión" onClose={vi.fn()}>Texto de consulta</SurfaceDialog>);
    expect(screen.getByRole('dialog', { name: 'Regla de misión' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cerrar Regla de misión' })).toHaveFocus();
    view.unmount();
    expect(launcher).toHaveFocus();
    launcher.remove();
  });

  it('cerrar o cancelar con Escape solicita cancelar sin aceptar acciones', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<SurfaceDialog title="Revisar avance" onClose={onClose}>Cambios pendientes</SurfaceDialog>);
    await user.click(screen.getByRole('button', { name: 'Cerrar Revisar avance' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
