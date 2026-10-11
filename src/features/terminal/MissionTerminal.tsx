import { useEffect, useRef, useState } from 'react';
import type { EvaluationView, Facts, GameIntent, GameView, PlayerId, SetupDraft, TerminalProps } from '../../application/ui-contract';
import { FactFields, initialFacts } from './FactFields';
import { SetupScreen } from './SetupScreen';
import { TerminalSurfaces, type CorrectionDraft } from './TerminalSurfaces';
import { useTerminalNavigation, type Surface } from './navigation';

const emptySetup = (): SetupDraft => ({ players: [
  { id: 'p1', name: '', faction: '', battleReady: false, secondaryMode: 'fixed', fixedMissionIds: [] },
  { id: 'p2', name: '', faction: '', battleReady: false, secondaryMode: 'fixed', fixedMissionIds: [] },
], firstPlayerId: 'p1', primaryMissionId: '', twistId: null });

function Scoreboard({ game, selected, onSelect }: { game: GameView; selected: PlayerId; onSelect: (id: PlayerId) => void }) {
  return <div className="terminal-scoreboard" aria-label="Marcador de ambos jugadores">{game.players.map(player => <button key={player.id} className="terminal-player" aria-pressed={selected === player.id} aria-label={`Consultar ${player.name}, ${player.total} PV`} onClick={() => onSelect(player.id)}>
    <strong>{player.name}</strong><span className="terminal-muted">{player.faction}</span>
    <span className="terminal-score">{player.total}<span className="terminal-sr-only"> puntos de victoria</span></span>
    <span className="terminal-player-tags">{player.id === game.activeTurnPlayerId && <span>Turno</span>}{player.id === selected && <span>Consultando</span>}</span>
  </button>)}</div>;
}

function EvaluationCard({ evaluation, playerId, playerName, facts, onFacts, busy, actions, onRecord, onRules, stale, onReview }: { evaluation: EvaluationView; playerId: PlayerId; playerName: string; facts: Facts; onFacts: (facts: Facts) => void; busy: boolean; actions: TerminalProps['actions']; onRecord: () => void; onRules: () => void; stale: boolean; onReview: () => void }) {
  const preview = actions.previewScore(playerId, evaluation.objectiveId, facts);
  return <section className="terminal-card terminal-card-primary terminal-stack">
    <div><p className="terminal-eyebrow">{evaluation.timing}</p><h2>{evaluation.name}</h2></div>
    <details className="terminal-condition"><summary>Condiciones de puntuación</summary><p>{evaluation.text}</p></details>
    <button onClick={onRules} aria-label={`Consultar reglas de ${evaluation.name}`}>Consultar reglas</button>
    {evaluation.entryId ? <p>Puntuación registrada. Consulta el desglose para revisar la entrada.</p> : <>
      {!evaluation.permission.enabled && <p className="terminal-notice terminal-warning">{evaluation.permission.reason || 'Acción no permitida en este momento.'}</p>}
      {stale && <div className="terminal-notice terminal-warning terminal-stack"><p>Revisar antes de registrar: el contexto ha cambiado.</p><button onClick={onReview} aria-label={`Revisar previsión de ${evaluation.name}`}>Revisar previsión</button></div>}
      {evaluation.permission.enabled && <FactFields fields={evaluation.fields} facts={facts} onChange={onFacts} disabled={busy} errors={preview.errors} />}
      {evaluation.permission.enabled && <>
        <p><strong>Previsión +{preview.applied} PV</strong></p>
        {preview.requested !== preview.applied && <p className="terminal-muted">Solicitado: {preview.requested} PV · Aplicado: {preview.applied} PV</p>}
        {preview.limits.map(limit => <p key={limit} className="terminal-muted">{limit}</p>)}
        {preview.errors.filter(error => !error.field).map((error, index) => <p key={`${error.code}-${index}`} className="terminal-field-error">{error.message}</p>)}
      </>}
      <button className="terminal-button-primary" disabled={busy || stale || !evaluation.permission.enabled || !preview.valid} onClick={onRecord} aria-label={`Registrar puntuación de ${playerName} en ${evaluation.name}`}>Registrar +{preview.applied} PV</button>
    </>}
  </section>;
}

export function MissionTerminal({ model, actions }: TerminalProps) {
  const { screen, surface, navigate, openSurface: pushSurface, closeSurface, dismissSurface } = useTerminalNavigation();
  const focusTurnAfterAction = useRef(false);
  const openSurface = (next: Surface) => { focusTurnAfterAction.current = false; pushSurface(next); };
  const game = model.game;
  const [selected, setSelected] = useState<PlayerId>(game?.activeTurnPlayerId ?? 'p1');
  const [drafts, setDrafts] = useState<Record<string, Facts>>({});
  const [draftRevisions, setDraftRevisions] = useState<Record<string, number>>({});
  const [corrections, setCorrections] = useState<Record<string, CorrectionDraft>>({});
  const [discardDrafts, setDiscardDrafts] = useState(false);
  const [setup, setSetup] = useState<SetupDraft>(emptySetup);
  const [busy, setBusy] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [theme, setTheme] = useState<'light dark' | 'light' | 'dark'>('light dark');
  const operation = useRef(false);
  const previous = useRef({ load: model.load, gameId: game?.id, context: game?.contextId, finalized: game?.finalized, candidateId: model.candidate?.id });
  const turnHeading = useRef<HTMLElement>(null);
  const blocked = busy || !['ready', 'empty'].includes(model.load) || ['saving', 'error', 'conflict'].includes(model.persistence.status);
  const importBlocked = busy || !['ready', 'empty', 'incompatible'].includes(model.load) || ['saving', 'error', 'conflict'].includes(model.persistence.status);
  const queried = game?.players.find(player => player.id === selected);
  const turnPlayer = game?.players.find(player => player.id === game.activeTurnPlayerId);
  useEffect(() => {
    const old = previous.current;
    if (game && (old.gameId !== game.id || old.context !== game.contextId)) {
      setSelected(game.activeTurnPlayerId);
      focusTurnAfterAction.current = true;
      setNotice(`Turno de ${game.players.find(player => player.id === game.activeTurnPlayerId)?.name ?? ''}`);
      turnHeading.current?.focus();
    }
    const activated = game && model.persistence.status === 'saved' && (old.gameId !== game.id || !!old.candidateId && !model.candidate);
    if (activated) { setSetup(emptySetup()); setDrafts({}); setCorrections({}); }
    if (game && (activated || (old.load === 'loading' && model.load === 'ready') || old.finalized !== game.finalized)) navigate(game.finalized ? 'result' : 'game', true);
    previous.current = { load: model.load, gameId: game?.id, context: game?.contextId, finalized: game?.finalized, candidateId: model.candidate?.id };
  }, [game, model.load, model.candidate, model.persistence.status, navigate]);

  async function perform(task: () => ReturnType<TerminalProps['actions']['execute']>, afterSuccess?: () => void, actionBlocked = blocked) {
    if (operation.current || actionBlocked) return;
    operation.current = true; setBusy(true); setUiError(null);
    try {
      const outcome = await task();
      if (!outcome.ok) setUiError(outcome.error.message);
      else afterSuccess?.();
    } catch { setUiError('No se ha podido completar la operación. Conserva los cambios y vuelve a intentarlo.'); }
    finally { operation.current = false; setBusy(false); }
  }
  const execute = (intent: GameIntent, revision = game?.revision) => {
    if (revision === undefined) return;
    void perform(() => actions.execute(intent, revision), () => {
      if (intent.type === 'record-score' && game) {
        const key = `${game.id}:${intent.playerId}:${game.contextId}:${intent.objectiveId}`;
        setDrafts(current => { const next = { ...current }; delete next[key]; return next; });
      }
      if (intent.type === 'correct') setCorrections(current => { const next = { ...current }; delete next[intent.entryId]; return next; });
      if (intent.type === 'advance' || intent.type === 'undo') dismissSurface();
      else if (surface && intent.type === 'correct') closeSurface();
    });
  };
  function exportCopy() {
    const outcome = actions.exportCopy();
    if (!outcome.ok) { setUiError(outcome.error.message); return; }
    const url = URL.createObjectURL(new Blob([outcome.value], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'missionlog-copia.json'; anchor.click();
    URL.revokeObjectURL(url);
    setNotice('Descarga de la copia solicitada. Comprueba que conservas el archivo.');
  }
  function start() {
    const validation = actions.validateSetup(setup);
    if (!validation.valid) { setUiError(validation.errors.map(error => error.message).join(' ')); return; }
    if (game) openSurface({ kind: 'replace', source: 'create', target: { id: game.id, revision: game.revision } });
    else void perform(() => actions.create(setup, null), () => { setSetup(emptySetup()); navigate('game', true); });
  }
  const saveText = { idle: 'Sin cambios registrados', saving: 'Guardando cambios…', saved: 'Guardado en este dispositivo', error: 'No se han guardado los últimos cambios.', conflict: 'Otra pestaña ha cambiado la partida.' }[model.persistence.status];
  const correctionEntry = surface?.kind === 'correct' ? game?.entries.find(entry => entry.id === surface.entryId) : undefined;
  const correction = correctionEntry ? corrections[correctionEntry.id] ?? { facts: correctionEntry.facts, note: '' } : null;
  const hasSetupDraft = setup.players.some(player => player.name || player.faction || player.battleReady || player.secondaryMode !== 'fixed' || player.fixedMissionIds.length > 0) || !!setup.primaryMissionId || setup.firstPlayerId !== 'p1' || setup.twistId !== null;
  const hasDrafts = Object.keys(drafts).length > 0 || Object.keys(corrections).length > 0 || hasSetupDraft;
  const readImport = async (file: File) => {
    setUiError(null);
    try { const outcome = await actions.validateImport(await file.text()); if (!outcome.ok) setUiError(outcome.error.message); }
    catch { setUiError('No se ha podido leer la copia. La partida actual se conserva.'); }
  };

  return <div className="terminal" style={{ colorScheme: theme }}>
    <a className="terminal-skip" href="#terminal-main" onClick={event => { event.preventDefault(); document.getElementById('terminal-main')?.focus(); }}>Ir al contenido</a>
    <header className="terminal-header">
      <div><p className="terminal-brand">MISSION LOG</p><p className="terminal-eyebrow">Terminal táctico / Warhammer 40K</p></div>
      <p className={`terminal-save ${['error', 'conflict'].includes(model.persistence.status) ? 'terminal-error' : ''}`} role="status">{saveText}</p>
      <nav className="terminal-actions" aria-label="Menú del terminal"><button onClick={() => navigate('home')}>Inicio</button><button onClick={() => openSurface({ kind: 'backup' })}>Copia de seguridad</button></nav>
    </header>
    <main id="terminal-main" tabIndex={-1} className="terminal-main terminal-stack">
      {!surface && (uiError || model.actionError) && <p role="alert" className="terminal-notice terminal-error">{uiError || model.actionError}</p>}
      {busy && <p role="status">Procesando acción…</p>}
      {model.catalogMessage && <p role="alert" className="terminal-notice terminal-error">Catálogo no disponible: {model.catalogMessage}</p>}
      {['error', 'conflict'].includes(model.persistence.status) && <section className="terminal-notice terminal-warning terminal-stack">
        <p>{model.persistence.message || 'Hay cambios pendientes en esta sesión. Recargar o cerrar ahora puede perderlos.'}</p>
        <div className="terminal-actions">{model.persistence.status === 'error' && <button disabled={busy} onClick={() => {
          if (operation.current) return;
          operation.current = true; setBusy(true);
          void actions.retrySave().then(outcome => { if (!outcome.ok) setUiError(outcome.error.message); }).finally(() => { operation.current = false; setBusy(false); });
        }}>Reintentar guardado</button>}{model.persistence.status === 'conflict' && <button onClick={() => openSurface({ kind: 'conflict' })}>Revisar versión almacenada</button>}<button onClick={exportCopy}>Exportar cambios pendientes</button></div>
      </section>}
      {model.pwa.update === 'available' && <section className="terminal-notice terminal-stack"><p>Hay una actualización disponible. Puedes continuar la partida y revisarla más tarde.</p><button onClick={() => { setDiscardDrafts(false); openSurface({ kind: 'update' }); }}>Revisar actualización</button></section>}
      {model.pwa.update === 'error' && <p role="alert" className="terminal-notice terminal-error">{model.pwa.message || 'No se ha podido aplicar la actualización.'}</p>}
      <p className="terminal-sr-only" role="status">{notice}</p>
      {(screen === 'home' || !game && screen !== 'setup' || model.load === 'loading') && <section className="terminal-stack">
        <h1>Tu terminal de partida</h1>
        {model.load === 'loading' ? <p role="status">Cargando partida…</p> : ['error', 'incompatible'].includes(model.load) ? <div className="terminal-card terminal-stack">
          <p role="alert">{model.loadMessage || 'No se puede recuperar la partida conservada.'}</p>
          <button onClick={() => { void actions.load(); }}>Reintentar carga</button>
          <p>La copia local se conserva mientras revisas el problema.</p>
          <button onClick={() => openSurface({ kind: 'backup' })}>Importar copia compatible</button>
        </div> : <>
          {game ? <div className="terminal-card terminal-stack"><p className="terminal-eyebrow">Partida conservada</p><Scoreboard game={game} selected={selected} onSelect={setSelected} /><p>{game.packageName} · Ronda {game.round}</p><button className="terminal-button-primary" onClick={() => navigate(game.finalized ? 'result' : 'game')}>{game.finalized ? 'Ver resultado' : 'Continuar partida'}</button></div> : <p>Un dispositivo, ambos jugadores. Prepara las misiones y registra las acciones durante la partida.</p>}
          <button disabled={blocked || !model.setupOptions.ready} onClick={() => navigate('setup')}>Nueva partida</button><button onClick={() => openSurface({ kind: 'backup' })}>Importar copia</button>
          {!model.setupOptions.ready && <p className="terminal-notice terminal-warning">No se puede iniciar: revisa la disponibilidad del catálogo y las reglas pendientes.</p>}
        </>}
      </section>}
      {screen === 'setup' && model.load !== 'loading' && <SetupScreen model={model} actions={actions} draft={setup} setDraft={setSetup} busy={blocked} onStart={start} onRules={id => openSurface({ kind: 'rules', ruleId: id })} onBack={() => navigate('home')} />}
      {['game', 'result'].includes(screen) && game?.rules.some(item => item.category === 'general') && <button onClick={() => openSurface({ kind: 'rules', ruleId: game.rules.find(item => item.category === 'general')!.id })}>Reglas del paquete</button>}
      {screen === 'game' && game && model.load !== 'loading' && <>
        <h1>Terminal de partida</h1>
        <Scoreboard game={game} selected={selected} onSelect={setSelected} />
        <section aria-label="Contexto del turno" className="terminal-turn terminal-stack" ref={turnHeading} tabIndex={-1}><div className="terminal-row"><p>Ronda {game.round}</p><strong>Turno de {turnPlayer?.name}</strong></div><p>Consultando a {queried?.name}</p></section>
        {game.steps.length > 0 && <section className="terminal-stack"><h2>Pasos del turno</h2><ul className="terminal-step-list">{game.steps.map(step => <li key={step}>{step}</li>)}</ul></section>}
        <div className="terminal-game-grid"><div className="terminal-stack">{game.evaluations[selected].map(evaluation => {
          const key = `${game.id}:${selected}:${game.contextId}:${evaluation.objectiveId}`;
          const facts = drafts[key] ?? initialFacts(evaluation.fields);
          return <EvaluationCard key={evaluation.objectiveId} evaluation={evaluation} playerId={selected} playerName={queried?.name ?? ''} facts={facts} onFacts={value => { setDrafts(current => ({ ...current, [key]: value })); setDraftRevisions(current => ({ ...current, [key]: game.revision })); }} busy={blocked} actions={actions} stale={!!drafts[key] && draftRevisions[key] !== game.revision} onReview={() => setDraftRevisions(current => ({ ...current, [key]: game.revision }))} onRecord={() => execute({ type: 'record-score', playerId: selected, objectiveId: evaluation.objectiveId, facts })} onRules={() => openSurface({ kind: 'rules', ruleId: evaluation.missionId })} />;
        })}</div><section className="terminal-card terminal-stack"><h2>Secundarias de {queried?.name}</h2><p className="terminal-eyebrow">{game.decks[selected].mode === 'fixed' ? 'Misiones fijas' : 'Misiones tácticas'}</p>{game.decks[selected].active.map(item => <div className="terminal-stack" key={item.id}><h3>{item.name}</h3><button onClick={() => openSurface({ kind: 'rules', ruleId: item.id })}>Consultar {item.name}</button></div>)}<button onClick={() => openSurface({ kind: 'deck' })}>Mazo de {queried?.name}</button></section></div>
        <div className="terminal-actions"><button onClick={() => openSurface({ kind: 'log' })}>Desglose y registro</button><button disabled={blocked || !game.undo.permission.enabled} onClick={() => openSurface({ kind: 'undo', revision: game.revision })}>Deshacer {game.undo.label}</button></div>
        {!game.undo.permission.enabled && <p className="terminal-muted">{game.undo.permission.reason}</p>}
        <div className="terminal-stack"><p className="terminal-muted">Avance del turno de {turnPlayer?.name}</p>{!game.transition.permission.enabled && <p className="terminal-notice terminal-warning">{game.transition.permission.reason}</p>}<button className="terminal-button-primary" disabled={blocked || !game.transition.permission.enabled} onClick={() => openSurface({ kind: 'advance', revision: game.revision })}>{game.transition.label}</button></div>
      </>}
      {screen === 'result' && game && <section className="terminal-stack"><h1>Resultado</h1><p>{game.result?.label || 'Resultado pendiente de confirmación del motor.'}</p><Scoreboard game={game} selected={selected} onSelect={setSelected} /><div className="terminal-card terminal-stack">{game.players.map(player => <div key={player.id}><h2>{player.name}</h2><p>Primaria: {player.primary} PV · Secundarias: {player.secondary} PV · Preparado para la batalla: {player.battleReady} PV</p></div>)}</div><div className="terminal-actions"><button onClick={() => openSurface({ kind: 'log' })}>Desglose y registro</button><button disabled={blocked || !game.undo.permission.enabled} onClick={() => openSurface({ kind: 'undo', revision: game.revision })}>Deshacer {game.undo.label}</button></div><button onClick={exportCopy}>Exportar copia</button><button disabled={blocked || !model.setupOptions.ready} onClick={() => navigate('setup')}>Nueva partida</button></section>}
    </main>
    <footer className="terminal-footer">
      <span>{game?.packageName || model.setupOptions.packageName} · Catálogo {game?.catalogVersion || model.setupOptions.catalogVersion}</span>
      <span>{model.pwa.offline === 'ready' ? 'Lista para usar sin conexión' : model.pwa.offline === 'error' ? 'Descarga sin conexión incompleta' : 'Preparando uso sin conexión'}</span>
      {!model.pwa.online && <span>Sin conexión</span>}
      {model.pwa.offline === 'error' && <button onClick={() => { void actions.prepareOffline(); }}>Reintentar descarga sin conexión</button>}
      <label>Apariencia <select aria-label="Apariencia" value={theme} onChange={event => setTheme(event.currentTarget.value as typeof theme)}><option value="light dark">Sistema</option><option value="light">Clara</option><option value="dark">Oscura</option></select></label>
    </footer>
    {surface && <TerminalSurfaces model={model} actions={actions} surface={surface} selected={selected} blocked={blocked} importBlocked={importBlocked} hasDrafts={hasDrafts} discardDrafts={discardDrafts} correction={correction} error={uiError || model.actionError} returnFocusTarget={() => focusTurnAfterAction.current ? turnHeading.current : null} rulesFromSetup={screen === 'setup'} onClose={closeSurface} onOpen={openSurface} onExecute={execute} onExport={exportCopy} onDiscardDrafts={setDiscardDrafts} onCorrection={draft => { if (correctionEntry) setCorrections(current => ({ ...current, [correctionEntry.id]: draft })); }} onCreate={target => { void perform(() => actions.create(setup, target), () => navigate('game', true)); }} onFile={file => { void readImport(file); }} onImport={() => { if (model.importPreview) void perform(() => actions.importCopy(model.importPreview!), () => navigate(model.importPreview!.game.finalized ? 'result' : 'game', true), importBlocked); }} onLoadStored={() => { void actions.load(); }} onUpdate={() => { void perform(() => actions.applyUpdate(discardDrafts), () => { if (discardDrafts) { setDrafts({}); setDraftRevisions({}); setCorrections({}); setSetup(emptySetup()); } closeSurface(); }); }} />}
  </div>;
}
