import React, { useState } from 'react';
import DemoCommunityBar from '../components/DemoCommunityBar';
import PlayerCardExperience from '../components/PlayerCardExperience';
import { MatchHistory, MissingProfile, SportTags, Statistics, TeamLogo } from '../components/CommunityElements';
import { useCommunity } from '../state/CommunityContext';
import { playerMatches } from '../data/community';
import '../styles/community.css';

export default function PlayerProfile({ id }) {
  const { players, teams } = useCommunity();
  const player = players.find(item => item.id === id);
  const [sport, setSport] = useState(player?.sports[0] || 'Football');
  if (!player) return <main id="main" tabIndex="-1" className="inner-page container community-page"><MissingProfile type="player" /></main>;
  const playerTeams = teams.filter(team => team.members.includes(player.id));
  const selectedTeam = playerTeams.find(team => team.sport === sport);
  return <main id="main" tabIndex="-1" className="inner-page container community-page">
    <a className="back-link" href="/players">← All players</a><DemoCommunityBar />
    <div className="player-profile-layout"><aside className="player-card-stage"><PlayerCardExperience key={player.id} player={player} sport={sport} teamName={selectedTeam?.name} /></aside>
      <div className="player-profile-content"><p className="eyebrow">PLAYER PROFILE / DEMO</p><h1>{player.name}<span className="dot">.</span></h1><p className="profile-demo-id">{player.id.toUpperCase()} · Illustrative Player ID</p><SportTags sports={player.sports} /><p className="profile-bio">{player.bio}</p>
        <dl className="player-roles">{player.sports.includes('Football') && <div><dt>Football</dt><dd>{player.positions[0]}<span>{player.positions.slice(1).length ? `Secondary: ${player.positions.slice(1).join(', ')}` : 'Primary position'}</span></dd></div>}{player.sports.includes('Cricket') && <div><dt>Cricket</dt><dd>{player.role}<span>Primary role</span></dd></div>}</dl>
        <section className="community-section"><div className="community-section-title"><h2>In the game</h2><span>Demo statistics</span></div><div className="sport-filters" role="tablist" aria-label="Sport-specific statistics">{player.sports.map(item => <button role="tab" key={item} id={`tab-${item}`} aria-controls={`panel-${item}`} aria-selected={sport === item} tabIndex={sport === item ? 0 : -1} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? player.sports[0] : event.key === 'End' ? player.sports.at(-1) : player.sports[(player.sports.indexOf(sport) + 1) % player.sports.length]; setSport(next); document.getElementById(`tab-${next}`)?.focus(); } }} onClick={() => setSport(item)}>{item}</button>)}</div>{player.sports.map(item => <div key={item} id={`panel-${item}`} role="tabpanel" aria-labelledby={`tab-${item}`} tabIndex="0" hidden={sport !== item}><Statistics values={player[item.toLowerCase()]} /><p className="helper">Independent {item.toLowerCase()} records. Illustrative only; no overall player rating.</p></div>)}</section>
        <section className="community-section"><div className="community-section-title"><h2>Current teams</h2><span>By sport</span></div>{player.sports.map(item => <div className="player-team-group" key={item}><p className="eyebrow">{item}</p>{playerTeams.filter(team => team.sport === item).length ? playerTeams.filter(team => team.sport === item).map(team => <a className="mini-team" href={`/teams/${team.id}`} key={team.id}><TeamLogo team={team} /><span><strong>{team.name}</strong><small>{team.captainId === player.id ? 'Demo captain' : 'Demo member'}</small></span><span aria-hidden="true">↗</span></a>) : <p className="helper">No current demo {item.toLowerCase()} team.</p>}</div>)}</section>
        <MatchHistory matches={playerMatches[sport]} />
      </div>
    </div>
  </main>;
}

