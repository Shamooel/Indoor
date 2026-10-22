import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import PlayerCard from '../components/PlayerCard';
import DemoCommunityBar from '../components/DemoCommunityBar';
import { useCommunity } from '../state/CommunityStore';
import { filterPlayers, footballPositions, cricketRoles } from '../data/community';
import '../styles/community.css';

export default function Players() {
  const { players, teams } = useCommunity();
  const [filters, setFilters] = useState({ query: '', sport: 'All', position: '', role: '' });
  const results = filterPlayers(players, filters);
  function selectSport(sport) { setFilters(previous => ({ ...previous, sport, position: sport === 'Cricket' ? '' : previous.position, role: sport === 'Football' ? '' : previous.role })); }
  return <main id="main" tabIndex="-1" className="inner-page container community-page">
    <PageHeader eyebrow="THE COMMUNITY / PLAYERS" title="Find your kind of player">Different positions. A shared love of the game. Explore the fictional Legends Field player community.</PageHeader>
    <DemoCommunityBar />
    <div className="directory-toolbar"><div className="directory-search"><label htmlFor="player-search">Search players</label><input id="player-search" type="search" placeholder="Name or demo Player ID" value={filters.query} onChange={event => setFilters({ ...filters, query: event.target.value })} /></div><div className="filter-field"><label htmlFor="football-position">Football position</label><select id="football-position" disabled={filters.sport === 'Cricket'} value={filters.position} onChange={event => setFilters({ ...filters, position: event.target.value })}><option value="">All positions</option>{footballPositions.map(position => <option key={position}>{position}</option>)}</select></div><div className="filter-field"><label htmlFor="cricket-role">Cricket role</label><select id="cricket-role" disabled={filters.sport === 'Football'} value={filters.role} onChange={event => setFilters({ ...filters, role: event.target.value })}><option value="">All roles</option>{cricketRoles.map(role => <option key={role}>{role}</option>)}</select></div></div>
    <div className="directory-meta"><div className="sport-filters" role="group" aria-label="Filter players by sport">{['All', 'Football', 'Cricket', 'Both'].map(sport => <button key={sport} type="button" aria-pressed={filters.sport === sport} onClick={() => selectSport(sport)}>{sport === 'All' ? 'All players' : sport}</button>)}</div><p role="status">{results.length} demo {results.length === 1 ? 'player' : 'players'}</p></div>
    {results.length ? <div className="players-grid">{results.map(player => <PlayerCard key={player.id} player={player} teams={teams} />)}</div> : <div className="empty-state"><h2>No players match these filters.</h2><button className="text-button" type="button" onClick={() => setFilters({ query: '', sport: 'All', position: '', role: '' })}>Clear all filters</button></div>}
    <p className="directory-footnote">Demo profiles and results are illustrative. Accounts created in this session also appear here.</p>
  </main>;
}
