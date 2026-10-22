import React, { memo } from 'react';
import { TeamLogo } from './CommunityElements';
import { useCommunity } from '../state/CommunityStore';
import { ballsToOvers, footballClock, matchResult, scoreFor } from '../data/matches';
import { formatSchedule } from '../data/competition';
import { useMatchNow } from '../state/matchClock';

export function MatchStatus({ status }) { return <span className={`match-status status-${status.toLowerCase().replaceAll(' ', '-')}`}>{status === 'Live' ? 'Live · demo' : status}</span>; }
export function FootballClock({ match }) {
  const now = useMatchNow(match.status === 'Live');
  return <span className="football-clock" aria-live="off">{footballClock(match, now)}<small>{match.status === 'Live' ? 'simulated' : match.status === 'Half-Time' ? 'paused' : 'full time'}</small></span>;
}
export function SportsDemoNote() { return <details className="sports-demo-note"><summary><strong>Demo matches & statistics</strong> · Fictional results. How this preview works ↓</summary><p>“Live” uses scripted scores and a simulated football clock. These are not real venue events. Accepted challenges and demo booking requests do not create scheduled fixtures.</p></details>; }
export const MatchCard = memo(function MatchCard({ match, home, away }) {
  return <article className="match-card"><div className="match-card-top"><span>{match.sport} / DEMO FIXTURE</span><MatchStatus status={match.status} /></div>
    {match.sport === 'Cricket' ? <div className="match-card-cricket-teams">{[home,away].map(team => <a key={team.id} href={`/teams/${team.id}`}><TeamLogo team={team}/><strong>{team.name}</strong><b>{scoreFor(match,team.id)}</b></a>)}{match.cricket?.innings.length > 0 && <p>{ballsToOvers(match.cricket.innings.at(-1).legalBalls)} overs · innings {match.cricket.currentInnings}</p>}</div> : <div className="match-card-teams"><a href={`/teams/${home.id}`}><TeamLogo team={home} /><strong>{home.name}</strong></a><div className="match-card-score"><strong>{scoreFor(match,home.id)} <span>:</span> {scoreFor(match,away.id)}</strong>{match.football && <FootballClock match={match}/>}</div><a href={`/teams/${away.id}`}><TeamLogo team={away}/><strong>{away.name}</strong></a></div>}
    <div className="match-card-bottom"><span>{formatSchedule(match.date, match.time)}</span><a href={`/matches/${match.id}`}>View match details ↗</a></div></article>;
});
export function PlayerName({ id, label = 'Demo guest' }) {
  const { players } = useCommunity();
  const player = players.find(item => item.id === id);
  return player ? <a href={`/players/${player.id}`}>{player.name}</a> : <span>{label}</span>;
}
export function MatchOutcome({ match }) {
  const { teams } = useCommunity();
  const result = matchResult(match);
  if (match.status !== 'Completed') return null;
  const winner = teams.find(team => team.id === result.winnerId);
  return <p className="match-outcome-banner">{winner ? `${winner.name} · ${result.label}` : result.label} <span>Fictional result</span></p>;
}
export function SportPeriodFilters({ sport, setSport, period, setPeriod, month }) {
  return <div className="sports-filters"><div className="sport-filters" role="group" aria-label="Sport">{['Football', 'Cricket'].map(item => <button type="button" key={item} aria-pressed={sport === item} onClick={() => setSport(item)}>{item}</button>)}</div><div className="period-filters" role="group" aria-label="Ranking period"><button type="button" aria-pressed={period === 'month'} onClick={() => setPeriod('month')}>Current Month <span>{month}</span></button><button type="button" aria-pressed={period === 'all'} onClick={() => setPeriod('all')}>All-Time</button></div></div>;
}
