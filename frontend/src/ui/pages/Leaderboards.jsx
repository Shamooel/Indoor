import Recognition from '../components/Recognition';
import SectionNav from '../components/SectionNav';
import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { SportPeriodFilters, SportsDemoNote } from '../components/MatchElements';
import { useCommunity } from '../state/CommunityStore';
import { leaderboard, leaderboardMetrics } from '../data/sportsStatistics';
import { ballsToOvers, monthKey } from '../data/matches';
import '../styles/community.css';
import '../styles/sports.css';

export default function Leaderboards({ search = '' }) {
  const { matches, players } = useCommunity();
  const params = new URLSearchParams(search);
  const [sport, setSport] = useState(params.get('sport') === 'Cricket' ? 'Cricket' : 'Football');
  const [period, setPeriod] = useState(params.get('period') === 'all' ? 'all' : 'month');
  const [metricKey, setMetricKey] = useState('goals');
  const metrics = leaderboardMetrics[sport];
  const metric = metrics.find(item => item.key === metricKey) || metrics[0];
  const key = monthKey();
  const rows = leaderboard(matches, players, sport, metric.key, period, key);
  const value = row => ['strikeRate', 'economy'].includes(metric.key) ? row[metric.key].toFixed(2) : row[metric.key];
  return <main id="main" tabIndex="-1" className="inner-page container community-page sports-page"><SectionNav current="/leaderboards" group="performance"/><PageHeader eyebrow="THE PLAYERS / DEMO LEADERBOARDS" title="The moments behind the numbers">Explore individual performances from completed fictional matches. Football and cricket records stay independent.</PageHeader><SportsDemoNote /><SportPeriodFilters sport={sport} setSport={setSport} period={period} setPeriod={setPeriod} month={key} /><div className="leaderboard-heading"><div><p className="eyebrow">{period === 'month' ? `CURRENT MONTH / ${key}` : 'ALL RECORDED DEMO HISTORY'}</p><h2>{metric.label}<span className="dot">.</span></h2><p>{metric.note || 'Recorded participants in completed matches in the selected period. Current sports and roles do not remove historical eligibility.'}</p></div><div className="filter-field"><label htmlFor="leaderboard-metric">Performance category</label><select id="leaderboard-metric" value={metric.key} onChange={event => setMetricKey(event.target.value)}>{metrics.map(item => <option value={item.key} key={item.key}>{item.label}</option>)}</select></div></div>
    {rows.length ? <><div className="leaderboard-podium" aria-label="Leading demo players">{rows.slice(0, 3).map((row, index) => <article key={row.player.id} className={`podium-player podium-place-${index + 1}`}><span className="podium-rank">#{row.rank}</span><img src={row.player.photo} width="80" height="80" alt={`Illustrative portrait for ${row.player.name}`} loading="lazy" /><h3><a href={`/players/${row.player.id}`}>{row.player.name}</a></h3><p>{sport === 'Football' ? row.player.positions[0] || 'Historical football participant' : row.player.role || 'Historical cricket participant'}</p><strong>{value(row)}</strong><small>{metric.label}</small></article>)}</div><div className="sports-table-scroll" role="region" aria-label="Player leaderboard, horizontally scrollable" tabIndex="0"><table className="sports-table leaderboard-table"><caption>{sport} · {metric.label} · {period === 'month' ? key : 'All-Time'} · Fictional completed-match statistics</caption><thead><tr><th scope="col">Rank</th><th scope="col">Player</th><th scope="col">Matches</th><th scope="col">{metric.label}</th><th scope="col">Record basis</th></tr></thead><tbody>{rows.map(row => <tr key={row.player.id}><td>{row.rank}</td><th scope="row"><a className="table-player" href={`/players/${row.player.id}`}><img src={row.player.photo} width="34" height="34" alt="" loading="lazy" /><span>{row.player.name}<small>{row.player.id.toUpperCase()}</small></span></a></th><td>{row.matches}</td><td className="metric-value">{value(row)}</td><td>{metric.key === 'strikeRate' ? `${row.runs} runs / ${row.balls} balls` : metric.key === 'economy' ? `${row.conceded} runs / ${ballsToOvers(row.bowlingBalls)} overs` : sport === 'Football' ? metric.key === 'cleanSheets' ? 'Recorded goalkeeper' : 'Completed appearances' : row.balls ? `${row.balls} batting balls` : `${ballsToOvers(row.bowlingBalls)} bowling overs`}</td></tr>)}</tbody></table></div></> : <div className="empty-state"><h2>No eligible records in this view.</h2><p>Try a different period or category. Players without the required recorded statistics are not ranked.</p></div>}
    <Recognition/><p className="directory-footnote">Equal values share a rank; names order tied rows for display only. Rates use unrounded totals. Monthly windows filter match dates and never overwrite all-time records. No scheduled resets, official ratings, or real performance claims.</p>
  </main>;
}
