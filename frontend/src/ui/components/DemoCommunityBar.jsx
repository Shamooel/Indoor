import React from 'react';
import { useCommunity } from '../state/CommunityContext';

export default function DemoCommunityBar() {
  const { players, teams, invitations, requests, activePlayerId, dispatch, notice, noticeKind } = useCommunity();
  const pendingActivity = [
    ...invitations.filter(item => item.playerId === activePlayerId && item.status === 'pending').map(item => ({ ...item, label: 'Invitation pending' })),
    ...requests.filter(item => item.playerId === activePlayerId && item.status === 'pending').map(item => ({ ...item, label: 'Join request pending' }))
  ];
  return <div className="community-demo">
    <div><strong>Community preview</strong><p>Fictional players, teams, and records. Changes last in this tab until reload. No authentication or real invitations.</p></div>
    <div className="demo-identity"><label htmlFor="demo-player">Act as demo player</label><select id="demo-player" value={activePlayerId} onChange={event => dispatch({ type: 'switchPlayer', playerId: event.target.value })}>{players.map(player => <option key={player.id} value={player.id}>{player.name} · {player.id.toUpperCase()}</option>)}</select></div>
    {pendingActivity.length > 0 && <div className="demo-pending-links" aria-label="Selected demo player's pending activity">{pendingActivity.map(item => <a href={`/teams/${item.teamId}`} key={item.id}>{item.label}: {teams.find(team => team.id === item.teamId)?.name} ↗</a>)}</div>}
    <p className={`community-notice ${noticeKind}`} role="status" aria-live="polite">{notice}</p>
  </div>;
}
