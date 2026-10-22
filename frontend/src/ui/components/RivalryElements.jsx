import React, { useEffect, useRef, useState } from 'react';
import { TeamLogo } from './CommunityElements';
import { rivalrySummary, rivalryHistory } from '../data/competition';
import { useCommunity } from '../state/CommunityStore';

export function WinDistribution({ rivalry, teamA, teamB }) {
  const { matches } = useCommunity();
  const { played, aWins, bWins, draws } = rivalrySummary(rivalry, matches);
  const root = useRef(null);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    if (!window.IntersectionObserver || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let observer;
    try {
      observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setAnimate(true); observer.disconnect(); } }, { threshold: .2 });
      observer.observe(root.current);
    } catch { /* The full-width comparison remains visible without animation. */ }
    return () => observer?.disconnect();
  }, []);
  const pieces = [{ name: teamA.name, value: aWins, className: 'team-a' }, ...(draws ? [{ name: rivalry.sport === 'Football' ? 'Draws' : 'Ties', value: draws, className: 'draws' }] : []), { name: teamB.name, value: bWins, className: 'team-b' }];
  return <div ref={root} className={`win-distribution ${animate ? 'animate-distribution' : ''}`}><div className="distribution-track" role="img" aria-label={`${played} illustrative matches: ${teamA.name} ${aWins} wins, ${teamB.name} ${bWins} wins${draws ? `, ${draws} ${rivalry.sport === 'Football' ? 'draws' : 'ties'}` : ''}.`}>{pieces.filter(piece => piece.value > 0).map((piece, index) => <span key={piece.className} className={piece.className} style={{ width: `${played ? piece.value / played * 100 : 0}%`, '--bar-delay': `${index * 90}ms` }} aria-hidden="true" />)}</div><ul className="distribution-legend">{pieces.map(piece => <li key={piece.className}><i className={piece.className} aria-hidden="true" /><span>{piece.name}</span><strong>{piece.value}</strong></li>)}</ul></div>;
}
export function RivalryCard({ rivalry }) {
  const { teams, matches } = useCommunity();
  const teamA = teams.find(team => team.id === rivalry.teamAId);
  const teamB = teams.find(team => team.id === rivalry.teamBId);
  const summary = rivalrySummary(rivalry, matches);
  if (!teamA || !teamB) return null;
  return <article className="rivalry-card"><div className="rivalry-card-meta"><span>{rivalry.sport} / HEAD-TO-HEAD</span><span>Demo records</span></div><div className="rivalry-versus"><a href={`/teams/${teamA.id}`}><TeamLogo team={teamA} large /><h2>{teamA.name}</h2></a><span className="versus-mark">VS</span><a href={`/teams/${teamB.id}`}><TeamLogo team={teamB} large /><h2>{teamB.name}</h2></a></div><p className="rivalry-label">{rivalry.label}</p><WinDistribution rivalry={rivalry} teamA={teamA} teamB={teamB} /><div className="rivalry-recent"><span>Recent results</span>{rivalryHistory(rivalry, matches).slice(0, 3).map(match => <a href={`/matches/${match.id}`} key={match.id}>{rivalry.sport === 'Football' ? `${match.scoreA}–${match.scoreB}` : match.description}</a>)}</div><div className="rivalry-card-footer"><span>{summary.played} illustrative matches</span><a className="text-link" href={`/rivalries/${rivalry.id}`}>View head-to-head ↗</a></div></article>;
}
