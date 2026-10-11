import type { Dispatch, SetStateAction } from 'react';
import type { SetupDraft, TerminalProps } from '../../application/ui-contract';

export function SetupScreen({ model, actions, draft, setDraft, busy, onStart, onRules, onBack }: TerminalProps & { draft: SetupDraft; setDraft: Dispatch<SetStateAction<SetupDraft>>; busy: boolean; onStart: () => void; onRules: (id: string) => void; onBack: () => void }) {
  const options = model.setupOptions;
  const validation = actions.validateSetup(draft);
  return <div className="terminal-stack">
    <div className="terminal-row"><h1>Preparar partida</h1><button onClick={onBack}>Volver al inicio</button></div>
    <p className="terminal-muted">Borrador de esta sesión. La partida conservada se sustituye solo después de confirmar y guardar.</p>
    <form className="terminal-stack" onSubmit={event => { event.preventDefault(); onStart(); }}>
      <section className="terminal-stack" aria-labelledby="setup-players"><h2 id="setup-players">1. Jugadores</h2>
        <div className="terminal-form-grid terminal-stack">{draft.players.map((player, index) => <fieldset className="terminal-stack" key={player.id}>
          <legend>Jugador {index + 1}</legend>
          <div className="terminal-field"><label htmlFor={`name-${player.id}`}>Nombre del jugador {index + 1}</label><input id={`name-${player.id}`} aria-invalid={validation.errors.some(error => error.field === `${player.id}.name`)} aria-describedby={validation.errors.some(error => error.field === `${player.id}.name`) ? `error-name-${player.id}` : undefined} autoComplete="off" value={player.name} onChange={event => {
            const value = event.currentTarget.value;
            setDraft(current => ({ ...current, players: current.players.map(item => item.id === player.id ? { ...item, name: value } : item) as SetupDraft['players'] }));
          }} />{validation.errors.some(error => error.field === `${player.id}.name`) && <p id={`error-name-${player.id}`} className="terminal-field-error">{validation.errors.filter(error => error.field === `${player.id}.name`).map(error => error.message).join(' ')}</p>}</div>
          <div className="terminal-field"><label htmlFor={`faction-${player.id}`}>Facción del jugador {index + 1}</label><input id={`faction-${player.id}`} aria-invalid={validation.errors.some(error => error.field === `${player.id}.faction`)} aria-describedby={validation.errors.some(error => error.field === `${player.id}.faction`) ? `error-faction-${player.id}` : undefined} value={player.faction} onChange={event => {
            const value = event.currentTarget.value;
            setDraft(current => ({ ...current, players: current.players.map(item => item.id === player.id ? { ...item, faction: value } : item) as SetupDraft['players'] }));
          }} />{validation.errors.some(error => error.field === `${player.id}.faction`) && <p id={`error-faction-${player.id}`} className="terminal-field-error">{validation.errors.filter(error => error.field === `${player.id}.faction`).map(error => error.message).join(' ')}</p>}</div>
          <label className="terminal-row"><span>Ejército preparado para la batalla</span><input type="checkbox" checked={player.battleReady} onChange={event => {
            const checked = event.currentTarget.checked;
            setDraft(current => ({ ...current, players: current.players.map(item => item.id === player.id ? { ...item, battleReady: checked } : item) as SetupDraft['players'] }));
          }} /></label>
        </fieldset>)}</div>
      </section>
      <section className="terminal-stack" aria-labelledby="setup-missions"><h2 id="setup-missions">2. Misiones y orden</h2>
        <p>{options.packageName} · Catálogo {options.catalogVersion}</p>
        {options.generalRules.length > 0 && <button type="button" onClick={() => onRules(options.generalRules[0].id)}>Reglas del paquete</button>}
        <div className="terminal-field"><label htmlFor="setup-primary">Misión primaria</label><select id="setup-primary" value={draft.primaryMissionId} onChange={event => { const value = event.currentTarget.value; setDraft(current => ({ ...current, primaryMissionId: value })); }}>
          <option value="">Selecciona una primaria</option>{options.primaryMissions.map(rule => <option key={rule.id} value={rule.id}>{rule.name}</option>)}
        </select></div>
        {draft.primaryMissionId && <button type="button" onClick={() => onRules(draft.primaryMissionId)}>Consultar reglas de la primaria</button>}
        <div className="terminal-field"><label htmlFor="setup-twist">Giro</label><select id="setup-twist" value={draft.twistId ?? ''} onChange={event => { const value = event.currentTarget.value; setDraft(current => ({ ...current, twistId: value || null })); }}>
          {options.twists.map(option => <option key={option.id ?? 'none'} value={option.id ?? ''} disabled={!option.permission.enabled}>{option.label}</option>)}
        </select>{options.twists.filter(option => !option.permission.enabled).map(option => <p className="terminal-muted" key={option.id}>{option.label}: {option.permission.reason}</p>)}</div>
        <div className="terminal-field"><label htmlFor="setup-first">Primer jugador</label><select id="setup-first" value={draft.firstPlayerId} onChange={event => { const value = event.currentTarget.value as SetupDraft['firstPlayerId']; setDraft(current => ({ ...current, firstPlayerId: value })); }}>
          {draft.players.map((player, index) => <option key={player.id} value={player.id}>Jugador {index + 1} · {player.name || 'Sin nombre'}</option>)}
        </select></div>
        <div className="terminal-form-grid terminal-stack">{draft.players.map((player, index) => <fieldset className="terminal-stack" key={player.id}>
          <legend>Secundarias · Jugador {index + 1}</legend>
          <div className="terminal-field"><label htmlFor={`mode-${player.id}`}>Modalidad del jugador {index + 1}</label><select id={`mode-${player.id}`} value={player.secondaryMode} onChange={event => {
            const secondaryMode = event.currentTarget.value as 'fixed' | 'tactical';
            setDraft(current => ({ ...current, players: current.players.map(item => item.id === player.id ? { ...item, secondaryMode } : item) as SetupDraft['players'] }));
          }}>{options.modes.map(mode => <option key={mode.id} value={mode.id} disabled={!mode.permission.enabled}>{mode.label}</option>)}</select></div>
          {options.modes.filter(mode => !mode.permission.enabled).map(mode => <p key={mode.id} className="terminal-muted">{mode.label}: {mode.permission.reason}</p>)}
          {player.secondaryMode === 'fixed' && <><p>Selecciona {options.fixedCount} misiones.</p>{options.secondaryMissions.map(rule => <div className="terminal-row" key={rule.id}>
            <label className="terminal-row"><input type="checkbox" checked={player.fixedMissionIds.includes(rule.id)} onChange={event => {
              const checked = event.currentTarget.checked;
              setDraft(current => ({ ...current, players: current.players.map(item => item.id === player.id ? { ...item, fixedMissionIds: checked ? [...item.fixedMissionIds, rule.id] : item.fixedMissionIds.filter(id => id !== rule.id) } : item) as SetupDraft['players'] }));
            }} /><span>{rule.name}</span></label><button type="button" onClick={() => onRules(rule.id)} aria-label={`Consultar ${rule.name} para jugador ${index + 1}`}>Reglas</button>
          </div>)}</>}
        </fieldset>)}</div>
      </section>
      <section className="terminal-card terminal-stack" aria-labelledby="setup-review"><h2 id="setup-review">3. Revisión</h2>
        <p>{draft.players[0].name || 'Jugador 1'} frente a {draft.players[1].name || 'Jugador 2'}</p>
        <p>Comienza: {draft.players.find(player => player.id === draft.firstPlayerId)?.name || 'Sin nombre'}</p>
        {validation.errors.length > 0 && <div className="terminal-notice terminal-warning"><p>Revisa la preparación:</p><ul>{validation.errors.map((error, index) => <li key={`${error.code}-${index}`}>{error.message}</li>)}</ul></div>}
        {options.pending.map(message => <p className="terminal-muted" key={message}>{message}</p>)}
        <button className="terminal-button-primary" type="submit" disabled={busy || !options.ready || !validation.valid}>Iniciar partida</button>
      </section>
    </form>
  </div>;
}
