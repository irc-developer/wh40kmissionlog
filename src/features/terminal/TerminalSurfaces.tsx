import type { Facts, GameIntent, PlayerId, TerminalProps } from '../../application/ui-contract';
import { SurfaceDialog } from '../../components/SurfaceDialog';
import { FactFields } from './FactFields';
import type { Surface } from './navigation';

export interface CorrectionDraft { facts: Facts; note: string }
interface SurfaceProps extends TerminalProps {
  surface: Surface; selected: PlayerId; blocked: boolean; importBlocked: boolean; hasDrafts: boolean; discardDrafts: boolean;
  correction: CorrectionDraft | null;
  error?: string | null;
  returnFocusTarget: () => HTMLElement | null;
  onCorrection: (draft: CorrectionDraft) => void; onDiscardDrafts: (value: boolean) => void;
  onClose: () => void; onOpen: (surface: Surface) => void;
  onExecute: (intent: GameIntent, revision: number) => void;
  onExport: () => void; onCreate: (target: { id: string; revision: number } | null) => void;
  onImport: () => void; onFile: (file: File) => void; onLoadStored: () => void; onUpdate: () => void;
  rulesFromSetup: boolean;
}

export function TerminalSurfaces(props: SurfaceProps) {
  const { model, actions, surface, selected, blocked, onClose, onOpen, onExecute, onExport, correction } = props;
  const game = model.game;
  const setupDefinitions = [...model.setupOptions.primaryMissions, ...model.setupOptions.secondaryMissions, ...model.setupOptions.generalRules];
  const definitions = props.rulesFromSetup ? setupDefinitions : game?.rules ?? setupDefinitions;
  const rule = surface.kind === 'rules' ? definitions.find(item => item.id === surface.ruleId) : undefined;
  const player = game?.players.find(item => item.id === selected);
  const entry = surface.kind === 'correct' ? game?.entries.find(item => item.id === surface.entryId) : undefined;
  const objective = entry && game?.rules.flatMap(item => item.objectives).find(item => item.id === entry.objectiveId);
  const preview = entry && correction ? actions.previewCorrection(entry.id, correction.facts) : null;
  const names = { advance: 'Revisar avance', undo: 'Confirmar deshacer', correct: 'Corregir puntuación', log: 'Desglose y registro', backup: 'Copia de seguridad', replace: 'Sustituir partida conservada', update: 'Actualizar terminal', conflict: 'Resolver conflicto' };
  const title = surface.kind === 'rules' ? rule?.name ?? 'Reglas pendientes' : surface.kind === 'deck' ? `Mazo de ${player?.name ?? ''}` : names[surface.kind];
  const stale = 'revision' in surface && surface.revision !== game?.revision;
  return <SurfaceDialog title={title} onClose={onClose} focusTargetId={surface.kind === 'correct' ? 'correction-rules' : undefined} returnFocusTarget={props.returnFocusTarget}>
    {props.error && <p role="alert" className="terminal-notice terminal-error">{props.error}</p>}
    {surface.kind === 'rules' && <><p className="terminal-eyebrow">{props.rulesFromSetup ? model.setupOptions.packageName : game?.packageName || model.setupOptions.packageName} · Catálogo {props.rulesFromSetup ? model.setupOptions.catalogVersion : game?.catalogVersion || model.setupOptions.catalogVersion}</p><p className="terminal-rule-text">{rule?.text || 'Contenido pendiente de verificación. La acción afectada permanece bloqueada.'}</p>{rule?.category === 'general' && definitions.filter(item => item.category === 'general' && item.id !== rule.id).map(item => <section className="terminal-stack" key={item.id}><h3>{item.name}</h3><p className="terminal-rule-text">{item.text}</p></section>)}</>}
    {stale && <p className="terminal-notice terminal-warning">El contexto ha cambiado. Cancela y revisa la acción con los datos actuales.</p>}
    {surface.kind === 'advance' && game && <>
      <p>{game.transition.destination}</p>{game.transition.consequences.map(item => <p key={item}>{item}</p>)}
      <div className="terminal-actions"><button onClick={onClose}>Cancelar</button><button className="terminal-button-primary" disabled={blocked || stale || !game.transition.permission.enabled} onClick={() => onExecute({ type: 'advance' }, surface.revision)}>{game.transition.label === 'Finalizar partida' ? 'Finalizar partida' : 'Confirmar avance'}</button></div>
    </>}
    {surface.kind === 'undo' && game && <>
      <p>Deshacer {game.undo.label}</p><p>Se restaura el estado anterior completo de la última operación reversible, incluidos puntuaciones, cartas y turno. La reversión se guarda como una nueva revisión.</p>
      {!game.undo.permission.enabled && <p>{game.undo.permission.reason}</p>}
      <div className="terminal-actions"><button onClick={onClose}>Cancelar</button><button className="terminal-button-primary" disabled={blocked || stale || !game.undo.permission.enabled} onClick={() => onExecute({ type: 'undo' }, surface.revision)}>Confirmar deshacer</button></div>
    </>}
    {surface.kind === 'deck' && game && <>
      <p>{game.decks[selected].mode === 'fixed' ? 'Selecciones fijas' : 'Mazo táctico independiente'}</p>
      {game.decks[selected].mode === 'tactical' && <div className="terminal-row"><p>Cartas por robar: {game.decks[selected].remaining}</p><p>Descartadas: {game.decks[selected].discarded}</p><p>Completadas: {game.decks[selected].achieved}</p></div>}
      {game.decks[selected].active.map(item => <article key={item.id} className="terminal-card terminal-stack"><h3>{item.name}</h3><button onClick={() => onOpen({ kind: 'rules', ruleId: item.id })}>Consultar reglas de {item.name}</button>{game.decks[selected].discard.enabled && <button disabled={blocked} onClick={() => onExecute({ type: 'discard', playerId: selected, missionId: item.id }, game.revision)}>Descartar {item.name} de {player?.name}</button>}</article>)}
      {game.decks[selected].draw.enabled ? <button disabled={blocked} onClick={() => onExecute({ type: 'draw', playerId: selected }, game.revision)}>Robar para {player?.name}</button> : <p className="terminal-muted">{game.decks[selected].draw.reason}</p>}
      {!game.decks[selected].discard.enabled && <p className="terminal-muted">{game.decks[selected].discard.reason}</p>}
    </>}
    {surface.kind === 'log' && game && <>
      <p>Registro de la partida actual · Consultando a {player?.name}</p>
      {game.entries.filter(item => item.playerId === selected).length === 0 && <p>Todavía no hay entradas para este jugador.</p>}
      {game.entries.filter(item => item.playerId === selected).map(item => {
        const mission = game.rules.find(definition => definition.id === item.missionId);
        return <article key={item.id} className="terminal-card terminal-stack"><h3>{mission?.name || 'Misión'}</h3><p>Ronda {item.round} · Turno de {game.players.find(p => p.id === item.turnPlayerId)?.name} · {item.phase === 'command' ? 'Fase de mando' : 'Final del turno'}</p><p>Aplicado: {item.applied} PV · Solicitado: {item.requested} PV</p>{item.corrected && <p>Entrada corregida</p>}{item.note && <p>{item.note}</p>}<button disabled={blocked} aria-label={`Corregir entrada de ${player?.name} en ${mission?.name}`} onClick={() => onOpen({ kind: 'correct', entryId: item.id, revision: game.revision })}>Corregir</button></article>;
      })}
    </>}
    {surface.kind === 'correct' && entry && correction && preview && <>
      <p>Entrada de {game?.players.find(item => item.id === entry.playerId)?.name} · Ronda {entry.round}</p>
      <button id="correction-rules" onClick={() => onOpen({ kind: 'rules', ruleId: entry.missionId })}>Consultar reglas de la corrección</button>
      {objective ? <FactFields fields={objective.fields} facts={correction.facts} onChange={facts => props.onCorrection({ ...correction, facts })} disabled={blocked || stale} errors={preview.errors} /> : <p>Los campos de esta misión no están disponibles.</p>}
      <div className="terminal-field"><label htmlFor="correction-note">Motivo de la corrección</label><textarea id="correction-note" value={correction.note} onChange={event => props.onCorrection({ ...correction, note: event.currentTarget.value })} disabled={blocked || stale} /></div>
      <p>Previsión +{preview.applied} PV · Solicitado: {preview.requested} PV</p>
      {preview.changes.map(change => <p key={change.entryId}>{change.beforeApplied} → {change.afterApplied} PV</p>)}
      {preview.players.map(item => <p key={item.id}>Total previsto de {item.name}: {item.total} PV</p>)}
      {preview.result && <p>Resultado previsto: {preview.result.label}</p>}
      {preview.limits.map(limit => <p key={limit}>{limit}</p>)}{preview.errors.filter(error => !error.field).map((error, index) => <p className="terminal-field-error" key={`${error.code}-${index}`}>{error.message}</p>)}
      <div className="terminal-actions"><button onClick={onClose}>Cancelar</button><button className="terminal-button-primary" disabled={blocked || stale || !preview.valid || !objective} onClick={() => onExecute({ type: 'correct', entryId: entry.id, facts: correction.facts, note: correction.note }, surface.revision)}>Aplicar corrección</button></div>
    </>}
    {surface.kind === 'backup' && <>
      {model.load === 'incompatible' ? <p>Los datos locales incompatibles se conservan. Importa una copia válida para revisar su sustitución.</p> : <><p>{model.persistence.candidateAvailable ? 'Copia de los cambios pendientes' : 'Copia de la revisión guardada'}</p><p>La copia incluye las reglas y los datos necesarios para continuar esta partida.</p></>}<button disabled={!game && !model.candidate} onClick={onExport}>Exportar copia</button>
      <div className="terminal-field"><label htmlFor="import-copy">Importar copia</label><input id="import-copy" type="file" accept="application/json,.json" disabled={props.importBlocked || model.importStatus === 'validating'} onChange={event => { const file = event.currentTarget.files?.[0]; if (file) props.onFile(file); event.currentTarget.value = ''; }} /></div>
      {model.importStatus === 'validating' && <p role="status">Validando copia…</p>}{model.importStatus === 'error' && model.importMessage !== props.error && <p role="alert">{model.importMessage || 'No se puede importar esta copia.'}</p>}
      {model.importPreview && <div className="terminal-card terminal-stack"><h3>Copia validada</h3>{model.importPreview.game.players.map(item => <p key={item.id}>{item.name}: {item.total} PV</p>)}<p>Ronda {model.importPreview.game.round} · {model.importPreview.game.packageName}</p><button disabled={props.importBlocked} onClick={() => onOpen({ kind: 'replace', source: 'import', target: model.importPreview!.target })}>Revisar sustitución</button><button onClick={() => actions.cancelImport()}>Cancelar importación</button></div>}
    </>}
    {surface.kind === 'replace' && <>
      {model.load === 'incompatible' && surface.source === 'import' ? <p>Los datos locales incompatibles se sustituirán solo al confirmar y completar el guardado. No se pueden exportar como una partida válida.</p> : <p>{surface.source === 'import' ? 'La copia validada sustituirá la partida conservada al completar la escritura.' : 'La partida conservada se sustituirá al guardar la nueva.'} Puedes descargar una copia antes de continuar.</p>}<button disabled={!game} onClick={onExport}>Exportar partida conservada</button>
      <div className="terminal-actions"><button onClick={onClose}>Cancelar</button><button className="terminal-button-primary" disabled={surface.source === 'create' ? blocked : props.importBlocked || !model.importPreview} onClick={() => surface.source === 'create' ? props.onCreate(surface.target) : props.onImport()}>{surface.source === 'create' ? 'Sustituir e iniciar' : 'Sustituir con copia'}</button></div>
    </>}
    {surface.kind === 'conflict' && <>
      <p>La versión almacenada sustituirá los cambios pendientes de esta sesión. Descarga una copia si quieres conservarlos antes de continuar.</p><button onClick={onExport}>Exportar cambios pendientes</button><div className="terminal-actions"><button onClick={onClose}>Cancelar</button><button onClick={props.onLoadStored}>Cargar versión almacenada</button></div>
    </>}
    {surface.kind === 'update' && <>
      <p>La actualización recargará el terminal y recuperará la partida guardada.</p>
      {props.hasDrafts && <><p>Hay borradores sin registrar. Puedes volver a ellos antes de actualizar.</p><label className="terminal-row"><input type="checkbox" checked={props.discardDrafts} onChange={event => props.onDiscardDrafts(event.currentTarget.checked)} /><span>Descartar expresamente los borradores sin registrar</span></label></>}
      <div className="terminal-actions"><button onClick={onClose}>Más tarde</button><button className="terminal-button-primary" disabled={blocked || model.persistence.status !== 'saved' && model.persistence.status !== 'idle' || props.hasDrafts && !props.discardDrafts} onClick={props.onUpdate}>Aplicar actualización</button></div>
    </>}
  </SurfaceDialog>;
}
