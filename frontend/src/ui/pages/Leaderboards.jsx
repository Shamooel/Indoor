import Recognition from '../components/Recognition';
import SectionNav from '../components/SectionNav';
import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import PlayerAvatar from '../components/PlayerAvatar';
import { TeamLogo } from '../components/CommunityElements';
import { SportPeriodFilters, SportsDemoNote } from '../components/MatchElements';
import { useCommunity } from '../state/CommunityStore';
import { leaderboard, leaderboardMetrics, leaderboardTeams } from '../data/sportsStatistics';
import { monthKey } from '../data/matches';
import '../styles/community.css';
import '../styles/sports.css';

const primary = { Football:[['goals','Goals'],['assists','Assists']], Cricket:[['runs','Runs'],['wickets','Wickets']] };
export default function Leaderboards({ search = '' }) {
  const { matches, players, teams } = useCommunity();
  const params = new URLSearchParams(search);
  const [sport,setSport] = useState(params.get('sport') === 'Cricket' ? 'Cricket' : 'Football');
  const [period,setPeriod] = useState(params.get('period') === 'all' ? 'all' : 'month');
  const [metricKey,setMetricKey] = useState(params.get('metric') || primary[sport][0][0]);
  const metrics = leaderboardMetrics[sport];
  const metric = metrics.find(item => item.key === metricKey) || metrics[0];
  const key = monthKey();
  const rows = leaderboard(matches,players,sport,metric.key,period,key);
  const primaryLabel = primary[sport].find(([id]) => id === metric.key)?.[1];
  const label = primaryLabel || metric.label;
  const title = `${sport} ${label} Leaderboard`;
  const additional = metrics.filter(item => !primary[sport].some(([id]) => id === item.key));
  const chooseSport = value => { setSport(value);setMetricKey(primary[value][0][0]); };
  const value = row => ['strikeRate','economy'].includes(metric.key) ? row[metric.key].toFixed(2) : row[metric.key];
  return <main id="main" tabIndex="-1" className="inner-page container community-page sports-page leaderboard-page">
    <SectionNav current="/leaderboards" group="performance"/>
    <PageHeader eyebrow="THE PLAYERS / DEMO LEADERBOARDS" title="Every contribution counts">Goals, assists, runs and wickets. Separate rankings from completed fictional matches.</PageHeader>
    <SportsDemoNote/>
    <SportPeriodFilters sport={sport} setSport={chooseSport} period={period} setPeriod={setPeriod} month={key}/>
    <div className="leaderboard-controls">
      <div className="sport-filters metric-tabs" role="group" aria-label={`${sport} ranking category`}>
        {primary[sport].map(([id,name]) => <button type="button" key={id} aria-pressed={metric.key === id} aria-controls="leaderboard-results" onClick={() => setMetricKey(id)}>{name}</button>)}
      </div>
      <div className="filter-field additional-rankings"><label htmlFor="additional-ranking">More statistics</label><select id="additional-ranking" value={primaryLabel ? '' : metric.key} onChange={e => setMetricKey(e.target.value || primary[sport][0][0])}><option value="">Choose another statistic</option>{additional.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}</select></div>
    </div>
    <section id="leaderboard-results" aria-labelledby="leaderboard-title">
      <div className="leaderboard-heading"><div><p className="eyebrow">{period === 'month' ? `CURRENT MONTH / ${key}` : 'ALL RECORDED DEMO HISTORY'}</p><h2 id="leaderboard-title">{title}</h2><p>{metric.note || `Ranked independently by total ${label.toLowerCase()} in completed demo ${sport.toLowerCase()} matches.`}</p></div><p className="results-count" role="status">{rows.length} ranked {rows.length === 1 ? 'player' : 'players'} · {label}</p></div>
      {rows.length ? <ol className="leaderboard-list" aria-label={title}>{rows.map(row => {
        const currentTeams = leaderboardTeams(teams,row.player.id,sport);
        return <li className={`leaderboard-row ${row.rank <= 3 ? 'rank-leading' : ''}`} key={row.player.id} data-player-id={row.player.id} data-metric={metric.key} data-value={row[metric.key]}>
          <span className="leaderboard-rank" aria-label={`Rank ${row.rank}`}>#{row.rank}</span>
          <a className="leaderboard-player" href={`/players/${row.player.id}`}><PlayerAvatar player={row.player} alt="" size={48}/><span><strong>{row.player.name}</strong><small>{row.matches} completed {row.matches === 1 ? 'appearance' : 'appearances'}</small></span></a>
          <div className="leaderboard-teams"><span className="leaderboard-team-label">Current {currentTeams.length > 1 ? 'teams' : 'team'}</span>{currentTeams.length ? currentTeams.map(team => <a className="leaderboard-team" key={team.id} href={`/teams/${team.id}`}><TeamLogo team={team}/><span>{team.name}</span></a>) : <span className="leaderboard-independent">Independent player</span>}</div>
          <div className="leaderboard-stat"><strong>{value(row)}</strong><span>{label}</span></div>
        </li>;
      })}</ol> : <div className="empty-state"><h3>No eligible {label.toLowerCase()} records.</h3><p>Try All-Time or another category. Only completed demo performances count.</p></div>}
    </section>
    <p className="directory-footnote">Team labels show current memberships in this sport. Statistics include historical appearances across teams. Equal values share a rank; names only order ties. Current profile roles do not erase past performances.</p>
    <Recognition/>
  </main>;
}
