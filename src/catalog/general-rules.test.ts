import { describe, expect, it } from 'vitest';
import { initialCatalog } from './initial';
import { getGameView, getSetupOptions } from '../domain/index';
import { game } from '../../tests/game-fixture';
import { parseCopy, exportGame, validateCatalog } from '../storage/validation';
describe('consulta de reglas generales', () => {
    it('ofrece reglas del paquete en preparación y las conserva en la copia', () => {
        const options = getSetupOptions(initialCatalog);
        const generals = options.generalRules;
        expect(generals.map(r => r.id)).toEqual(['general-preparation', 'general-fixed', 'general-scoring', 'general-ending']);
        const current = game();
        const exported = exportGame(current);
        expect(exported.ok).toBe(true);
        if (!exported.ok)
            throw new Error(exported.error.message);
        const restored = parseCopy(exported.value);
        expect(restored.ok).toBe(true);
        if (!restored.ok)
            throw new Error(restored.error.message);
        expect(getGameView(restored.value).rules.filter(r => r.category === 'general')).toEqual(generals);
        expect(generals.every(r => r.objectives.length === 0 && !r.fixed)).toBe(true);
    });
    it('rechaza reglas generales con objetivos de puntuación y misiones sin objetivos', () => {
        const catalog = structuredClone(initialCatalog);
        const primary = catalog.rules.find(r => r.category === 'primary')!;
        catalog.rules.push({ ...primary, id: 'general-invalid', category: 'general', objectives: primary.objectives.map(o => ({ ...o, id: 'invalid-' + o.id })) });
        expect(validateCatalog(catalog).ok).toBe(false);
        catalog.rules.pop();
        primary.objectives = [];
        expect(validateCatalog(catalog).ok).toBe(false);
    });
    it('recupera catálogos compatibles anteriores que no tenían reglas generales', () => {
        const catalog = structuredClone(initialCatalog);
        catalog.version = '0.2.0';
        catalog.rules = catalog.rules.filter(r => r.category !== 'general');
        expect(validateCatalog(catalog).ok).toBe(true);
        expect(getSetupOptions(catalog).generalRules).toEqual([]);
    });
});
