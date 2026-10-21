import React from 'react';
import { initials } from '../data/community';

export function TeamLogo({ team, large = false }) {
  return team.logo ? <img className={`team-logo ${large ? 'large' : ''}`} src={team.logo} alt={`${team.name} demo logo`} /> : <span className={`team-logo monogram ${large ? 'large' : ''}`} aria-label={`${team.name} demo monogram`}>{initials(team.name)}</span>;
}
export function SportTags({ sports }) { return <div className="sport-tags">{sports.map(sport => <span key={sport}>{sport}</span>)}</div>; }
export function Statistics({ values }) {
  return Object.keys(values || {}).length ? <dl className="sport-statistics">{Object.entries(values).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : <p className="empty-state">No demo statistics have been added for this team.</p>;
}
export function MatchHistory({ matches }) {
  return <section className="community-section"><div className="community-section-title"><h2>Match history</h2><span>Illustrative records</span></div>{matches.length ? <ul className="match-list">{matches.map((match, index) => <li key={`${match.date}-${index}`}><time dateTime={match.date}>{new Date(`${match.date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</time><div><strong>{match.opponent || match.label}</strong><span>{match.detail || match.result}</span></div>{match.outcome && <span className="match-outcome">{match.outcome}</span>}</li>)}</ul> : <p className="empty-state">No demo matches yet.</p>}</section>;
}
export function MissingProfile({ type }) {
  return <div className="empty-state"><h1>{type === 'player' ? 'Player' : 'Team'} not found.</h1><p>This demo may have reset on reload, or the link may be incorrect.</p><a className="text-link" href={type === 'player' ? '/players' : '/teams'}>Back to {type === 'player' ? 'players' : 'teams'} ↗</a></div>;
}
