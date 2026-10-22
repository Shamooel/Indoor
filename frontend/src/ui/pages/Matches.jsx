import SectionNav from '../components/SectionNav';
import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { MatchCard, SportsDemoNote } from '../components/MatchElements';
import { useCommunity } from '../state/CommunityStore';
import '../styles/community.css';
import '../styles/sports.css';

const live = ['Live', 'Half-Time', 'Innings Break'];
export default function Matches({ search = '' }) {
  const { matches, teams } = useCommunity();
  const [sport, setSport] = useState(new URLSearchParams(search).get('sport') === 'Cricket' ? 'Cricket' : 'Football');
  const [view, setView] = useState('All');
  const [status, setStatus] = useState('All');
  const statuses = ['Upcoming', 'Live', sport === 'Football' ? 'Half-Time' : 'Innings Break', 'Completed', 'Postponed', 'Cancelled'];
  const visible = matches.filter(match => match.confirmed && match.sport === sport && (view === 'All' || (view === 'Live' ? live.includes(match.status) : match.status === view)) && (status === 'All' || status === match.status)).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  return <main id="main" tabIndex="-1" className="inner-page container community-page sports-page"><SectionNav current="/matches" group="performance"/><PageHeader eyebrow="THE FIELD / MATCH CENTER" title="Every moment of the game">From the first whistle to the final over. Explore a fictional match-day experience at Legends Field Indoor.</PageHeader><SportsDemoNote /><div className="sports-filters"><div className="sport-filters" role="group" aria-label="Match sport">{['Football', 'Cricket'].map(item => <button type="button" key={item} aria-pressed={sport === item} onClick={() => { setSport(item); setStatus('All'); }}>{item}</button>)}</div><a href="/challenges" className="text-link">View challenge proposals ↗</a></div><div className="match-view-filters"><div className="sport-filters" role="group" aria-label="Match view">{['All', 'Live', 'Upcoming', 'Completed'].map(item => <button type="button" key={item} aria-pressed={view === item} onClick={() => { setView(item); setStatus('All'); }}>{item === 'Live' ? 'Live demos' : item === 'All' ? 'All fixtures' : item}</button>)}</div><div className="filter-field"><label htmlFor="match-status-filter">Match status</label><select id="match-status-filter" value={status} onChange={event => { setStatus(event.target.value); setView('All'); }}><option>All</option>{statuses.map(item => <option key={item}>{item}</option>)}</select></div></div><p className="results-count" role="status">{visible.length} {sport.toLowerCase()} demo {visible.length === 1 ? 'fixture' : 'fixtures'}</p><div className="matches-grid">{visible.map(match => <MatchCard key={match.id} match={match} home={teams.find(team => team.id === match.homeTeamId)} away={teams.find(team => team.id === match.awayTeamId)} />)}</div>{!visible.length && <div className="empty-state"><h2>No fixtures in this view.</h2><button type="button" className="text-button" onClick={() => { setView('All'); setStatus('All'); }}>Show all demo fixtures</button></div>}</main>;
}
