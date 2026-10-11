import { useId } from 'react';
import type { EvaluationField, Facts } from '../../application/ui-contract';

export function initialFacts(fields: EvaluationField[]): Facts {
  return Object.fromEntries(fields.map(field => [field.id, field.type === 'boolean' ? false : field.min ?? 0]));
}

export function FactFields({ fields, facts, onChange, disabled, errors = [] }: { fields: EvaluationField[]; facts: Facts; onChange: (facts: Facts) => void; disabled: boolean; errors?: { field?: string; message: string }[] }) {
  const prefix = useId();
  return <div className="terminal-stack">{fields.map(field => {
    const error = errors.filter(problem => problem.field === field.id).map(problem => problem.message).join(' ');
    const inputId = `${prefix}-${field.id}`;
    return <div className="terminal-field" key={field.id}>
    {field.type === 'boolean' ? <label className="terminal-check" htmlFor={inputId}>
      <input id={inputId} aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : undefined} type="checkbox" checked={facts[field.id] === true} disabled={disabled} onChange={event => onChange({ ...facts, [field.id]: event.currentTarget.checked })} /><span>{field.label}</span>
    </label> : <><label htmlFor={inputId}>{field.label}</label><input id={inputId} aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : undefined} type="number" inputMode="numeric" min={field.min} max={field.max} step="1" value={typeof facts[field.id] === 'number' ? String(facts[field.id]) : ''} disabled={disabled} onChange={event => {
        const next = { ...facts };
        if (event.currentTarget.value === '') delete next[field.id];
        else next[field.id] = Number(event.currentTarget.value);
        onChange(next);
      }} /></>}
    {error && <p id={`${inputId}-error`} className="terminal-field-error">{error}</p>}
  </div>;
  })}</div>;
}
