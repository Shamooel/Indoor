import React, { useState } from 'react';
import { initials } from '../data/community';
import { matchResult, scoreFor } from '../data/matches';
import { useCommunity } from '../state/CommunityStore';

export function TeamLogo({ team, large = false }) {
  return team.logo ? <img className={`team-logo ${large ? 'large' : ''}`} src={team.logo} alt={`${team.name} demo logo`} /> : <span className={`team-logo monogram ${large ? 'large' : ''}`} aria-label={`${team.name} demo monogram`}>{initials(team.name)}</span>;
}
export function SportTags({ sports }) { return <div className="sport-tags">{sports.map(sport => <span key={sport}>{sport}</span>)}</div>; }
export function Statistics({ values }) {
  return Object.keys(values || {}).length ? <dl className="sport-statistics">{Object.entries(values).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : <p className="empty-state">No demo statistics have been added for this team.</p>;
}
export function MatchHistory({ matches }) {
  const { teams } = useCommunity();
  const [expanded,setExpanded] = useState(false);
  return <section className="community-section"><div className="community-section-title"><h2>Match history</h2><span>Completed demo records</span></div>{matches.length ? <ul className="match-list">{[...matches].sort((a, b) => b.date.localeCompare(a.date)).slice(0, expanded ? undefined : 6).map(match => <li key={match.id}><time dateTime={match.date}>{new Date(`${match.date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</time><div><a href={`/matches/${match.id}`}><strong>{teams.find(team => team.id === match.homeTeamId)?.name} — {teams.find(team => team.id === match.awayTeamId)?.name} ↗</strong></a><span>{scoreFor(match, match.homeTeamId)} – {scoreFor(match, match.awayTeamId)} · {matchResult(match).label}</span></div></li>)}</ul> : <p className="empty-state">No completed demo appearances yet.</p>}{matches.length > 6 && <button type="button" className="text-button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Show recent history' : `View All History (${matches.length})`}</button>}</section>;
}
export function MissingProfile({ type }) {
  return <div className="empty-state"><h1>{type === 'player' ? 'Player' : 'Team'} not found.</h1><p>This demo may have reset on reload, or the link may be incorrect.</p><a className="text-link" href={type === 'player' ? '/players' : '/teams'}>Back to {type === 'player' ? 'players' : 'teams'} ↗</a></div>;
}
