import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import DemoCommunityBar from '../components/DemoCommunityBar';
import { TeamLogo } from '../components/CommunityElements';
import { useCommunity } from '../state/CommunityContext';
import '../styles/community.css';

export default function Teams() {
  const { teams, players } = useCommunity();
  const [query, setQuery] = useState('');
  const [sport, setSport] = useState('All');
  const results = teams.filter(team => (sport === 'All' || team.sport === sport) && team.name.toLowerCase().includes(query.trim().toLowerCase()));
  return <main id="main" tabIndex="-1" className="inner-page container community-page">
    <div className="community-page-top"><PageHeader eyebrow="THE COMMUNITY / TEAMS" title="Better as a team">Find a side that shares your game. Explore demo football and cricket teams, or build your own in this tab.</PageHeader><a href="/teams/create" className="button">Create demo team <span aria-hidden="true">↗</span></a></div><DemoCommunityBar />
    <div className="team-directory-toolbar"><div className="directory-search"><label htmlFor="team-search">Search teams</label><input id="team-search" type="search" value={query} placeholder="Search by team name" onChange={event => setQuery(event.target.value)} /></div><div className="sport-filters" role="group" aria-label="Filter teams by sport">{['All', 'Football', 'Cricket'].map(item => <button key={item} aria-pressed={sport === item} onClick={() => setSport(item)}>{item === 'All' ? 'All teams' : item}</button>)}</div></div>
    <p className="results-count" role="status">{results.length} demo {results.length === 1 ? 'team' : 'teams'}</p>
    {results.length ? <div className="teams-grid">{results.map(team => <article className="team-tile" key={team.id}><div className="team-tile-top"><TeamLogo team={team} large /><span className="team-sport">{team.sport}</span></div><h2><a href={`/teams/${team.id}`}>{team.name}</a></h2><p>{team.description}</p><div className="team-tile-captain"><span>Demo captain</span><a href={`/players/${team.captainId}`}>{players.find(player => player.id === team.captainId)?.name}</a></div><div className="team-tile-bottom"><span>{team.members.length} demo players</span><a className="text-link" href={`/teams/${team.id}`}>View team ↗</a></div></article>)}</div> : <div className="empty-state"><h2>No teams match your search.</h2><button type="button" className="text-button" onClick={() => { setQuery(''); setSport('All'); }}>Clear filters</button></div>}
  </main>;
}
