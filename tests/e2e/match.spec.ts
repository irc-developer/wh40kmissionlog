import { test, expect, type Page } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import type { Game } from '../../src/domain/types';
async function prepare(page: Page) {
    await page.goto('./');
    await page.getByRole('button', { name: 'Nueva partida', exact: true }).click();
    for (const n of [1, 2]) {
        await page.getByLabel(`Nombre del jugador ${n}`, { exact: true }).fill(n === 1 ? 'Alfa' : 'Bravo');
        await page.getByLabel(`Facción del jugador ${n}`, { exact: true }).fill(n === 1 ? 'Marines' : 'Orkos');
    }
    await page.getByLabel('Misión primaria', { exact: true }).selectOption('primary-dominance');
    for (const name of ['Asesinato', 'Luchar en todos los frentes']) {
        const boxes = page.getByRole('checkbox', { name, exact: true });
        await boxes.nth(0).check();
        await boxes.nth(1).check();
    }
    await page.getByRole('button', { name: 'Iniciar partida', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Terminal de partida', exact: true })).toBeVisible();
    await expect(page.getByText('Guardado en este dispositivo', { exact: true })).toBeVisible();
}
async function advance(page: Page) { await page.getByRole('button', { name: /^(Ir al final del turno|Terminar turno de|Finalizar partida)/ }).click(); await page.getByRole('dialog').getByRole('button', { name: /^(Confirmar avance|Finalizar partida)$/ }).click(); await expect(page.getByText('Guardado en este dispositivo', { exact: true })).toBeVisible(); }
test('preparar, puntuar, consultar rival, recargar y finalizar bajo subruta', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await prepare(page);
    await advance(page);
    await page.getByLabel('Controlas más objetivos que tu oponente', { exact: true }).check();
    await page.getByRole('button', { name: /Registrar puntuación de Alfa en Dominio.*Control superior/ }).click();
    await expect(page.getByRole('button', { name: 'Consultar Alfa, 2 PV', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Consultar Bravo, 0 PV', exact: true }).click();
    await expect(page.getByRole('strong').filter({ hasText: 'Turno de Alfa' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Consultar Alfa, 2 PV', exact: true })).toBeVisible();
    for (let i = 1; i < 20; i++)
        await advance(page);
    await expect(page.getByRole('heading', { name: 'Resultado', exact: true })).toBeVisible();
    await expect(page.getByText('Victoria de Alfa', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Resultado', exact: true })).toBeVisible();
    expect(errors).toEqual([]);
});
test('recarga y nueva escritura sin red conservan la partida', async ({ page, context }) => {
    await prepare(page);
    await expect(page.getByText('Lista para usar sin conexión', { exact: true })).toBeVisible({ timeout: 20000 });
    await page.reload();
    await expect(page.getByText('Lista para usar sin conexión', { exact: true })).toBeVisible();
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Terminal de partida', exact: true })).toBeVisible();
    await advance(page);
    await page.reload();
    await expect(page.getByLabel('Controlas más objetivos que tu oponente', { exact: true })).toBeEnabled();
    await expect(page.getByText('Guardado en este dispositivo', { exact: true })).toBeVisible();
});
test('320px sin desplazamiento horizontal y reglas con retorno de foco', async ({ page }) => { await page.setViewportSize({ width: 320, height: 740 }); await prepare(page); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true); const button = page.getByRole('button', { name: /Consultar reglas de Dominio.*Control superior/ }); await button.click(); await expect(page.getByRole('dialog')).toBeVisible(); await page.keyboard.press('Escape'); await expect(button).toBeFocused(); });
test('corrección, deshacer y copia conservan puntuaciones y reglas', async ({ page }) => {
    await prepare(page);
    await advance(page);
    await page.getByLabel('Controlas más objetivos que tu oponente', { exact: true }).check();
    await page.getByRole('button', { name: /Registrar puntuación de Alfa en Dominio.*Control superior/ }).click();
    await page.getByRole('button', { name: 'Desglose y registro', exact: true }).click();
    await page.getByRole('button', { name: 'Corregir entrada de Alfa en Dominio del campo de batalla', exact: true }).click();
    const correction = page.getByRole('dialog');
    await correction.getByLabel('Controlas más objetivos que tu oponente', { exact: true }).uncheck();
    await correction.getByLabel('Motivo de la corrección').fill('Recuento corregido');
    await correction.getByRole('button', { name: 'Aplicar corrección', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Consultar Alfa, 0 PV', exact: true })).toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: 'Deshacer corrección de puntuación', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirmar deshacer', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Consultar Alfa, 2 PV', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Copia de seguridad', exact: true }).click();
    const dialog = page.getByRole('dialog');
    const download = page.waitForEvent('download');
    await dialog.getByRole('button', { name: 'Exportar copia', exact: true }).click();
    const file = await download;
    const path = await file.path();
    if (!path)
        throw new Error('Sin copia descargada');
    await dialog.getByLabel('Importar copia', { exact: true }).setInputFiles({ name: 'incorrecta.json', mimeType: 'application/json', buffer: Buffer.from('{"format":"bad"}') });
    await expect(dialog.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Consultar Alfa, 2 PV', exact: true })).toBeVisible();
    await dialog.getByLabel('Importar copia', { exact: true }).setInputFiles(path);
    await dialog.getByRole('button', { name: 'Revisar sustitución', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Sustituir con copia', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Terminal de partida', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Consultar Alfa, 2 PV', exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Consultar Alfa, 2 PV', exact: true })).toBeVisible();
});
test('otra pestaña no sobrescribe una revisión y carga la versión almacenada tras confirmar', async ({ page, context }) => {
    await prepare(page);
    const stale = await context.newPage();
    await stale.goto('./');
    await expect(stale.getByRole('heading', { name: 'Terminal de partida', exact: true })).toBeVisible();
    await advance(page);
    await stale.getByRole('button', { name: 'Ir al final del turno', exact: true }).click();
    await stale.getByRole('dialog').getByRole('button', { name: 'Confirmar avance', exact: true }).click();
    await expect(stale.getByRole('dialog').getByRole('alert')).toBeVisible();
    await stale.keyboard.press('Escape');
    await stale.getByRole('button', { name: 'Revisar versión almacenada', exact: true }).click();
    await stale.getByRole('dialog').getByRole('button', { name: 'Cargar versión almacenada', exact: true }).click();
    await expect(stale.getByRole('heading', { name: 'Terminal de partida', exact: true })).toBeVisible();
    await expect(stale.getByText('Guardado en este dispositivo', { exact: true })).toBeVisible();
    await expect(stale.getByLabel('Controlas más objetivos que tu oponente', { exact: true })).toBeEnabled();
    await stale.close();
});
test('una actualización real espera confirmación y recupera la partida guardada', async ({ page }) => {
    await prepare(page);
    await expect(page.getByText('Lista para usar sin conexión', { exact: true })).toBeVisible({ timeout: 20000 });
    await page.reload();
    await advance(page);
    await page.getByLabel('Controlas más objetivos que tu oponente', { exact: true }).check();
    await page.getByRole('button', { name: /Registrar puntuación de Alfa en Dominio.*Control superior/ }).click();
    const workerPath = new URL('../../dist/sw.js', import.meta.url);
    const original = await readFile(workerPath, 'utf8');
    try {
        await writeFile(workerPath, original + '\n// Ensayo de actualización ' + Date.now());
        await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration())?.update(); });
        await page.getByRole('button', { name: 'Revisar actualización', exact: true }).click();
        await page.getByRole('dialog').getByRole('button', { name: 'Más tarde', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Consultar Alfa, 2 PV', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Revisar actualización', exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'Revisar actualización', exact: true }).click();
        await page.getByRole('dialog').getByRole('button', { name: 'Aplicar actualización', exact: true }).click();
        await expect(page.getByRole('dialog')).not.toBeVisible();
        await expect(page.getByRole('button', { name: 'Consultar Alfa, 2 PV', exact: true })).toBeVisible();
        await expect(page.getByText('Guardado en este dispositivo', { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Revisar actualización', exact: true })).not.toBeVisible();
    }
    finally {
        await writeFile(workerPath, original);
    }
});

test('recupera un dato local incompatible con una copia validada y confirmada', async ({ page }) => {
    await prepare(page);
    const validCopy = await page.evaluate(() => new Promise<string>((resolve, reject) => {
        const opening = indexedDB.open('mission-terminal');
        opening.onerror = () => reject(opening.error);
        opening.onsuccess = () => {
            const db = opening.result;
            const transaction = db.transaction('current', 'readwrite');
            const table = transaction.objectStore('current');
            const reading = table.get('current');
            let copy = '';
            reading.onsuccess = () => {
                const row = reading.result as { slot: string; game: Game };
                copy = JSON.stringify({ format: 'mission-terminal', formatVersion: 1, game: row.game });
                table.put({ ...row, game: { ...row.game, schemaVersion: 99 } });
            };
            transaction.oncomplete = () => { db.close(); resolve(copy); };
            transaction.onabort = () => { db.close(); reject(transaction.error); };
        };
    }));
    await page.reload();
    await expect(page.getByRole('alert')).toContainText('esquema no compatible');
    await page.getByRole('button', { name: 'Importar copia compatible', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Importar copia', { exact: true }).setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{}') });
    await expect(dialog.getByRole('alert')).toBeVisible();
    await dialog.getByLabel('Importar copia', { exact: true }).setInputFiles({ name: 'valid.json', mimeType: 'application/json', buffer: Buffer.from(validCopy) });
    await expect(dialog.getByRole('heading', { name: 'Copia validada', exact: true })).toBeVisible();
    await dialog.getByRole('button', { name: 'Revisar sustitución', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Sustituir con copia', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Terminal de partida', exact: true })).toBeVisible();
    await expect(page.getByText('Guardado en este dispositivo', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Consultar Alfa, 0 PV', exact: true })).toBeVisible();
});
