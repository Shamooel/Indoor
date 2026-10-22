import React, { useState } from 'react';
import { useCommunity } from '../state/CommunityStore';
import '../styles/competition.css';

export default function TeamCompetitionActions({ team }) {
  const { teams, activePlayer, rivalries, dispatch } = useCommunity();
  const [sourceId, setSourceId] = useState('');
  const ownTeams = teams.filter(item => item.captainId === activePlayer?.id && item.sport === team.sport && item.id !== team.id);
  const source = ownTeams.find(item => item.id === sourceId) || ownTeams[0];
  const histories = rivalries.filter(item => item.teamAId === team.id || item.teamBId === team.id);
  const ownCaptain = team.captainId === activePlayer?.id;
  return <section className="team-competition-actions" aria-label="Team competition"><div><p className="eyebrow">THE NEXT FIXTURE</p><h2>Take it to the field.</h2><p className="helper">All captain interactions are local demos. A challenge never reserves the turf.</p></div><div className="team-competition-controls">
    {source && <><label htmlFor="challenge-as-team">Challenge as</label><select id="challenge-as-team" value={source.id} onChange={event => setSourceId(event.target.value)}>{ownTeams.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select><div><a className="compact-action" href={`/challenges?from=${source.id}&opponent=${team.id}`}>Challenge team ↗</a><a className="text-link" href={`/inbox?from=${source.id}`} onClick={() => dispatch({ type: 'openConversation', fromTeamId: source.id, toTeamId: team.id })}>Captain inbox ↗</a></div></>}
    {ownCaptain && <a className="text-link" href={`/challenges?from=${team.id}`}>Find an opponent for {team.name} ↗</a>}

    {histories.map(item => <a className="text-link" href={`/rivalries/${item.id}`} key={item.id}>Head-to-head vs {teams.find(other => other.id === (item.teamAId === team.id ? item.teamBId : item.teamAId))?.name} ↗</a>)}
  </div></section>;
}
