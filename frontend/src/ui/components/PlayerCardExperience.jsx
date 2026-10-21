import React, { Component, lazy, Suspense, useEffect, useState } from 'react';
import { CollectibleFace } from './PlayerCard';

const CardScene = lazy(() => import('./PlayerCardScene'));
export function supportsWebGL2() {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch { return false; }
}
class SceneBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function PlayerCardExperience({ player, sport, teamName }) {
  const [mode, setMode] = useState('2d');
  const [flipped, setFlipped] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [failed, setFailed] = useState(false);
  function changeMode() {
    if (mode === '3d') { setMode('2d'); return; }
    if (reducedMotion) return;
    if (!supportsWebGL2()) { setFailed(true); return; }
    setMode('3d');
  }
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReducedMotion(query.matches); if (query.matches) setMode('2d'); };
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const fallback = <div className="static-collectible"><CollectibleFace player={player} sport={sport} teamName={teamName} back={flipped} /></div>;
  return <div className="player-card-experience"><div className="card-scene-wrap" aria-label={`${player.name} ${sport} demo collectible card`}>
    {mode === '3d' && !failed ? <SceneBoundary onFailure={() => setFailed(true)} fallback={fallback}><Suspense fallback={fallback}><CardScene player={player} sport={sport} teamName={teamName} flipped={flipped} fallback={fallback} onFailure={() => setFailed(true)} /></Suspense></SceneBoundary> : fallback}
    </div><div className="card-controls"><button type="button" className="compact-action" onClick={() => setFlipped(!flipped)} aria-pressed={flipped}>{flipped ? 'Show front' : 'Flip card'} <span aria-hidden="true">↻</span></button><button type="button" className="text-button" disabled={reducedMotion || failed} onClick={changeMode}>{failed ? '2D fallback active' : reducedMotion ? '2D · reduced motion' : mode === '3d' ? 'Use 2D view' : 'Explore in 3D'}</button></div><p className="helper" role="status">{failed ? '3D is unavailable on this device. Your player card remains available in 2D.' : reducedMotion ? 'Motion is reduced. Use Flip card to switch sides without animation.' : mode === '3d' ? 'Move your pointer to tilt. Use Flip card on touch or keyboard.' : 'Lightweight 2D view. The 3D scene loads only when requested.'}</p><p className="card-accessible-details">{player.name} · {sport} · {sport === 'Football' ? player.positions[0] : player.role} · {teamName || 'Independent demo player'} · {player.id.toUpperCase()}</p><span className="card-demo-stamp">COLLECTIBLE PREVIEW / NO OVERALL RATING</span></div>;
}
