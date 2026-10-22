import Recognition from '../components/Recognition';
import SectionNav from '../components/SectionNav';
import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { TeamLogo } from '../components/CommunityElements';
import { SportPeriodFilters, SportsDemoNote } from '../components/MatchElements';
import { useCommunity } from '../state/CommunityStore';
import { standings } from '../data/sportsStatistics';
import { monthKey } from '../data/matches';
import '../styles/community.css';
import '../styles/sports.css';

export default function Rankings({ search = '' }) {
  const { teams, matches } = useCommunity();
  const params = new URLSearchParams(search);
  const [sport, setSport] = useState(params.get('sport') === 'Cricket' ? 'Cricket' : 'Football');
  const [period, setPeriod] = useState(params.get('period') === 'all' ? 'all' : 'month');
  const key = monthKey();
  const rows = standings(matches, teams, sport, period, key);
  const columns = sport === 'Football' ? [['P', 'played'], ['W', 'won'], ['D', 'drawn'], ['L', 'lost'], ['GF', 'goalsFor'], ['GA', 'goalsAgainst'], ['GD', 'goalDifference'], ['Pts', 'points']] : [['P', 'played'], ['W', 'won'], ['L', 'lost'], ['Tied', 'tied'], ['NR', 'noResult'], ['Pts', 'points']];
  return <main id="main" tabIndex="-1" className="inner-page container community-page sports-page"><SectionNav current="/rankings" group="performance"/><PageHeader eyebrow="THE TEAMS / DEMO STANDINGS" title="Every result tells a story">A clear view of the competition, calculated from the same completed demo fixtures shown in the match center.</PageHeader><SportsDemoNote /><SportPeriodFilters sport={sport} setSport={setSport} period={period} setPeriod={setPeriod} month={key} /><div className="standings-title"><p className="eyebrow">{period === 'month' ? `CURRENT MONTH / ${key}` : 'ALL-TIME / RECORDED DEMO HISTORY'}</p><h2>{sport === 'Football' ? 'Football standings.' : 'Cricket rankings.'}</h2><p>{sport === 'Football' ? 'Demo points: win 3 · draw 1 · loss 0. Order: points, goal difference, goals for, then team name.' : 'Illustrative cricket points: win 2 · tie 1 · no result 1 · loss 0. Order: points, wins, then team name. No football metrics or net run rate are applied.'}</p></div><div className="sports-table-scroll" role="region" aria-label={`${sport} team rankings, horizontally scrollable`} tabIndex="0"><table className="sports-table standings-table"><caption>{sport} · {period === 'month' ? key : 'All-Time'} · Completed fictional fixtures only</caption><thead><tr><th scope="col">Position</th><th scope="col">Team</th>{columns.map(([label]) => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.team.id}><td>{row.position}</td><th scope="row"><a className="table-team" href={`/teams/${row.team.id}`}><TeamLogo team={row.team} /><span>{row.team.name}{!row.played && <small>No completed demo fixtures</small>}</span></a></th>{columns.map(([, field]) => <td key={field} className={field === 'points' ? 'points-cell' : ''}>{field === 'goalDifference' && row[field] > 0 ? `+${row[field]}` : row[field]}</td>)}</tr>)}</tbody></table></div><div className="standings-key"><p><strong>P</strong> Played · <strong>W</strong> Won · <strong>L</strong> Lost {sport === 'Football' ? '· D Drawn · GF Goals for · GA Goals against · GD Goal difference' : '· Tied Equal scores · NR No result'} · <strong>Pts</strong> Points</p></div><Recognition/><p className="directory-footnote">Upcoming, live, interrupted, postponed, cancelled, and challenge-only proposals do not contribute to standings. No-play completed cricket fixtures count as no result but do not contribute player statistics. Monthly and all-time views use separate filtered totals; new demo teams start with zero recorded results.</p></main>;
}
