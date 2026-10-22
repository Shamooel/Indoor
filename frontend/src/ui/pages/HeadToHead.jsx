import React from 'react';
import DemoCommunityBar from '../components/DemoCommunityBar';
import { TeamLogo } from '../components/CommunityElements';
import { WinDistribution } from '../components/RivalryElements';
import { rivalrySummary, rivalryHistory } from '../data/competition';
import { useCommunity } from '../state/CommunityStore';
import '../styles/community.css';
import '../styles/competition.css';

export default function HeadToHead({ id }) {
  const { teams, players, rivalries, matches } = useCommunity();
  const rivalry = rivalries.find(item => item.id === id);
  const teamA = teams.find(team => team.id === rivalry?.teamAId);
  const teamB = teams.find(team => team.id === rivalry?.teamBId);
  if (!rivalry || !teamA || !teamB) return <main id="main" tabIndex="-1" className="inner-page container community-page competition-page"><div className="empty-state"><h1>Rivalry not found.</h1><p>This illustrative head-to-head is not part of the current demo.</p><a href="/rivalries" className="text-link">Back to rivalries ↗</a></div></main>;
  const summary = rivalrySummary(rivalry, matches);
  const neutral = rivalry.sport === 'Football' ? 'Draws' : 'Ties';
  const captain = team => players.find(player => player.id === team.captainId);
  return <main id="main" tabIndex="-1" className="inner-page container community-page competition-page"><a className="back-link" href="/rivalries">← All rivalries</a><DemoCommunityBar />
    <section className="head-to-head-hero"><p className="eyebrow">{rivalry.sport.toUpperCase()} / FICTIONAL HEAD-TO-HEAD</p><h1>{rivalry.label}<span className="dot">.</span></h1><div className="broadcast-versus"><div><TeamLogo team={teamA} large /><h2><a href={`/teams/${teamA.id}`}>{teamA.name}</a></h2><a className="broadcast-captain" href={`/players/${captain(teamA).id}`}>Captain: {captain(teamA).name} ↗</a></div><div className="broadcast-center"><span>VS</span><strong>{summary.played}</strong><small>DEMO MATCHES</small></div><div><TeamLogo team={teamB} large /><h2><a href={`/teams/${teamB.id}`}>{teamB.name}</a></h2><a className="broadcast-captain" href={`/players/${captain(teamB).id}`}>Captain: {captain(teamB).name} ↗</a></div></div><p>Illustrative records only · Completed demo fixtures only</p></section>
    <div className="head-to-head-body"><section className="head-to-head-comparison"><p className="eyebrow">THE RECORD, SIDE BY SIDE</p><h2>A fixture in numbers.</h2><p className="helper">{rivalry.sport === 'Football' ? 'Football results show goals scored by each side.' : 'Cricket results show runs/wickets and the illustrative winning margin. No-play fixtures are excluded from head-to-head totals.'}</p><div className="comparison-heading"><span>{teamA.name}</span><span>{teamB.name}</span></div><dl className="comparison-statistics"><div><dt>Wins</dt><dd aria-label={`${teamA.name} wins`}>{summary.aWins}</dd><dd aria-label={`${teamB.name} wins`}>{summary.bWins}</dd></div><div><dt>Losses</dt><dd aria-label={`${teamA.name} losses`}>{summary.bWins}</dd><dd aria-label={`${teamB.name} losses`}>{summary.aWins}</dd></div><div><dt>{neutral}</dt><dd>{summary.draws}</dd><dd>{summary.draws}</dd></div><div><dt>Played</dt><dd>{summary.played}</dd><dd>{summary.played}</dd></div></dl><h3>Win distribution</h3><WinDistribution rivalry={rivalry} teamA={teamA} teamB={teamB} /></section>
      <section className="head-to-head-results"><div className="community-section-title"><h2>Recent meetings</h2><span>Fictional history</span></div><p className="helper">Scores are listed {teamA.name} first, {teamB.name} second.</p><ol>{rivalryHistory(rivalry, matches).map(match => <li key={match.id}><time dateTime={match.date}>{new Date(`${match.date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</time><div><a href={`/matches/${match.id}`} aria-label={`View demo match on ${match.date}`}><strong>{match.scoreA} <span>—</span> {match.scoreB}</strong> ↗</a><p>{match.description}</p></div><span className={`result-winner ${match.winner}`}>{match.winner === 'draw' ? (rivalry.sport === 'Football' ? 'Draw' : 'Tie') : `${match.winner === 'a' ? teamA.name : teamB.name} win`}</span></li>)}</ol></section>
    </div><p className="directory-footnote">Head-to-head records are fixed illustrative data, not results of the interactive challenges. The same normalized demo fixtures drive match details and rankings; proposals never count as matches.</p>
  </main>;
}
