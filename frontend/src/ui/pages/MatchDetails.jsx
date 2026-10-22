import React from 'react';
import { useCommunity } from '../state/CommunityStore';
import { MatchOutcome, MatchStatus, SportsDemoNote } from '../components/MatchElements';
import FootballMatch from '../components/FootballMatch';
import CricketMatch from '../components/CricketMatch';
import { formatSchedule } from '../data/competition';
import '../styles/community.css';
import '../styles/sports.css';

export default function MatchDetails({ id }) {
  const { matches, teams } = useCommunity();
  const match = matches.find(item => item.id === id && item.confirmed);
  if (!match) return <main id="main" tabIndex="-1" className="inner-page container community-page sports-page"><div className="empty-state"><h1>Match not found.</h1><p>This ID is not an explicitly scheduled demo fixture. Accepting a challenge does not create a match.</p><a href="/matches" className="text-link">Back to the match center ↗</a></div></main>;
  const home = teams.find(team => team.id === match.homeTeamId);
  const away = teams.find(team => team.id === match.awayTeamId);
  return <main id="main" tabIndex="-1" className="inner-page container community-page sports-page"><a href={`/matches?sport=${match.sport}`} className="back-link">← Match center</a><SportsDemoNote /><div className="match-detail-heading"><div><p className="eyebrow">{match.sport.toUpperCase()} / DEMO MATCH DETAILS</p><h1>{home.name} vs {away.name}<span className="dot">.</span></h1><p>{formatSchedule(match.date, match.time)} · {match.venue}</p></div><MatchStatus status={match.status} /></div><MatchOutcome match={match} />{match.sport === 'Football' ? <FootballMatch match={match} home={home} away={away} /> : <CricketMatch match={match} home={home} away={away} />}<p className="directory-footnote">Public frontend demonstration only. Staff-controlled timing, event recording, and real scoring are not implemented.</p></main>;
}
