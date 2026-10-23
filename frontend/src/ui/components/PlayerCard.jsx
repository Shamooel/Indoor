import React from 'react';
import PlayerAvatar from './PlayerAvatar';

export function CollectibleFace({ player, sport, teamName, back = false }) {
  return <div className={`collectible-face ${back ? 'card-back' : ''}`}>
    <div className="card-edition"><span>LEGENDS FIELD</span><span>DEMO / {sport === 'Football' ? 'FB' : 'CR'}</span></div>
    {back ? <div className="card-back-content"><span className="card-emblem" aria-hidden="true">LF</span><h3>{player.name}</h3><p>{player.id.toUpperCase()}</p><p>{player.bio}</p><strong>{sport}</strong><span>{teamName || 'Independent demo player'}</span><small>Fictional player · No rating or verified identity</small></div> : <><div className="card-portrait"><PlayerAvatar player={player} size={128}/><span>{sport === 'Football' ? player.positions[0] : player.role}</span></div><div className="card-name"><h3>{player.name}</h3><p>{teamName || 'Independent demo player'}</p></div><div className="card-identity"><span>{sport}</span><span>{player.id.toUpperCase()}</span></div></>}
  </div>;
}

export default function PlayerCard({ player, teams }) {
  const sport = player.sports[0];
  const team = teams.find(item => item.sport === sport && item.members.includes(player.id));
  return <article className="player-tile"><a className="player-card-link" href={`/players/${player.id}`} aria-label={`View ${player.name}, ${player.sports.join(' and ')} demo profile`}><CollectibleFace player={player} sport={sport} teamName={team?.name} /><div className="player-tile-footer"><span>{player.sports.join(' + ')}</span><span>View profile ↗</span></div></a></article>;
}
