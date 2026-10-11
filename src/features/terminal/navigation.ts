import { useCallback, useEffect, useState } from 'react';

export type Screen = 'home' | 'setup' | 'game' | 'result';
export type Surface = { kind: 'rules'; ruleId: string } | { kind: 'deck' | 'log' | 'backup' | 'update' } | { kind: 'advance' | 'undo'; revision: number } | { kind: 'correct'; entryId: string; revision: number } | { kind: 'replace'; source: 'create' | 'import'; target: { id: string; revision: number } | null } | { kind: 'conflict' };
const hashes: Record<Screen, string> = { home: '#/inicio', setup: '#/preparacion', game: '#/partida', result: '#/resultado' };
function screenFromHash(): Screen { return (Object.keys(hashes) as Screen[]).find(key => hashes[key] === window.location.hash) ?? 'home'; }
interface NavigationState { terminal: true; screen: Screen; surface: Surface | null }

export function useTerminalNavigation() {
  const [screen, setScreen] = useState<Screen>(screenFromHash);
  const [surface, setSurface] = useState<Surface | null>(null);
  useEffect(() => {
    window.history.replaceState({ terminal: true, screen: screenFromHash(), surface: null }, '', hashes[screenFromHash()]);
    const synchronize = () => {
      const current = window.history.state as NavigationState | null;
      setScreen(screenFromHash());
      setSurface(current?.terminal ? current.surface : null);
    };
    window.addEventListener('popstate', synchronize);
    window.addEventListener('hashchange', synchronize);
    return () => { window.removeEventListener('popstate', synchronize); window.removeEventListener('hashchange', synchronize); };
  }, []);
  const navigate = useCallback((next: Screen, replace = false) => {
    window.history[replace ? 'replaceState' : 'pushState']({ terminal: true, screen: next, surface: null }, '', hashes[next]);
    setScreen(next); setSurface(null);
  }, []);
  const openSurface = (next: Surface) => {
    window.history.pushState({ terminal: true, screen, surface: next }, '', hashes[screen]);
    setSurface(next);
  };
  const closeSurface = () => { window.history.back(); };
  const dismissSurface = () => {
    const currentScreen = screenFromHash();
    window.history.replaceState({ terminal: true, screen: currentScreen, surface: null }, '', hashes[currentScreen]);
    setSurface(null);
  };
  return { screen, surface, navigate, openSurface, closeSurface, dismissSurface };
}
