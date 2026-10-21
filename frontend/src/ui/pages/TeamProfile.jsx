import React, { useState } from 'react';
import DemoCommunityBar from '../components/DemoCommunityBar';
import { MatchHistory, MissingProfile, Statistics, TeamLogo } from '../components/CommunityElements';
import { useCommunity } from '../state/CommunityContext';
import '../styles/community.css';

function Status({ value }) { return <span className={`membership-status ${value}`}>{value}</span>; }

export default function TeamProfile({ id }) {
  const { teams, players, activePlayer, invitations, requests, dispatch } = useCommunity();
  const [query, setQuery] = useState('');
  const team = teams.find(item => item.id === id);
  if (!team) return <main id="main" tabIndex="-1" className="inner-page container community-page"><MissingProfile type="team" /></main>;
  const captain = players.find(player => player.id === team.captainId);
  const isCaptain = activePlayer.id === team.captainId;
  const isMember = team.members.includes(activePlayer.id);
  const compatible = activePlayer.sports.includes(team.sport);
  const teamInvitations = invitations.filter(item => item.teamId === team.id);
  const teamRequests = requests.filter(item => item.teamId === team.id);
  const ownInvitations = teamInvitations.filter(item => item.playerId === activePlayer.id);
  const ownRequests = teamRequests.filter(item => item.playerId === activePlayer.id);
  const pendingFor = playerId => [...teamInvitations, ...teamRequests].some(item => item.playerId === playerId && item.status === 'pending');
  const candidates = players.filter(player => player.sports.includes(team.sport) && !team.members.includes(player.id)
    && `${player.name} ${player.id}`.toLowerCase().includes(query.trim().toLowerCase()));
  const act = (type, rest = {}) => dispatch({ type, teamId: team.id, ...rest });
  return <main id="main" tabIndex="-1" className="inner-page container community-page">
    <a href="/teams" className="back-link">← All teams</a><DemoCommunityBar />
    <section className="team-profile-header"><TeamLogo team={team} large /><div><p className="eyebrow">{team.sport.toUpperCase()} / DEMO TEAM</p><h1>{team.name}<span className="dot">.</span></h1><p>{team.description}</p><div className="team-header-meta"><span>{team.members.length} demo players</span><a href={`/players/${captain.id}`}>Captain: {captain.name} ↗</a></div></div></section>
    <div className="team-profile-layout"><div>
      <section className="community-section"><div className="community-section-title"><h2>The team sheet</h2><span>{team.sport} roster</span></div><ul className="roster-list">{team.members.map(playerId => { const player = players.find(item => item.id === playerId); return <li key={player.id}><img src={player.photo} alt={`Illustrative portrait for ${player.name}`} width="48" height="48" loading="lazy" /><a href={`/players/${player.id}`}><strong>{player.name}</strong><small>{team.sport === 'Football' ? player.positions.join(' / ') : player.role}</small></a><span>{player.id === captain.id ? 'Captain · demo' : 'Member · demo'}</span></li>; })}</ul></section>
      <section className="community-section"><div className="community-section-title"><h2>Team at a glance</h2><span>Static demo records</span></div><Statistics values={team.stats} /><p className="helper">Illustrative statistics only. Membership actions do not calculate or change match records.</p></section><MatchHistory matches={team.matches} />
    </div><aside className="team-membership-panel">
      <p className="eyebrow">YOUR PLACE IN THE TEAM</p><h2>{isCaptain ? 'Lead the team.' : isMember ? 'On the team sheet.' : 'Find your place.'}</h2><p className="membership-context">Acting as <strong>{activePlayer.name}</strong> · Demo only</p>
      {isCaptain ? <p className="helper">You are acting as the demo captain. Invite registered players and review join requests below.</p>
        : isMember ? <p className="helper">This demo player is already a member of this {team.sport.toLowerCase()} team.</p>
        : !compatible ? <p className="helper">This player is not registered for {team.sport.toLowerCase()}. Select a demo player who plays this sport to request a place.</p>
        : <><button type="button" className="button full-width" disabled={pendingFor(activePlayer.id)} onClick={() => act('request')}>Request to join <span aria-hidden="true">↗</span></button>{pendingFor(activePlayer.id) && <p className="helper">An invitation or join request is already pending. Check its status below.</p>}</>}
      {!isCaptain && <button className="text-button captain-switch" type="button" onClick={() => dispatch({ type: 'switchPlayer', playerId: captain.id })}>Try {captain.name}'s demo captain view</button>}
      {!isCaptain && (ownInvitations.length > 0 || ownRequests.length > 0) && <section className="membership-activity"><h3>Your invitation & request status</h3>{ownInvitations.map(item => <div className="activity-entry" key={item.id}><div><strong>Team invitation</strong><Status value={item.status} /></div>{item.status === 'pending' && <div className="activity-actions"><button className="compact-action" onClick={() => act('respondInvite', { entryId: item.id, accept: true })}>Accept invitation</button><button className="text-button" onClick={() => act('respondInvite', { entryId: item.id, accept: false })}>Reject invitation</button></div>}</div>)}{ownRequests.map(item => <div className="activity-entry" key={item.id}><div><strong>Your join request</strong><Status value={item.status} /></div><p className="helper">{item.status === 'pending' ? 'Waiting for the demo captain.' : `Demo request ${item.status}.`}</p></div>)}</section>}
    </aside></div>
    {isCaptain && <section className="captain-management"><div className="community-section-title"><div><p className="eyebrow">DEMO CAPTAIN CONTROLS</p><h2>Build your team.</h2></div><span>No invitations or notifications leave this tab.</span></div><div className="management-grid">
      <section className="management-column"><h3>Invite a registered player</h3><label className="field-label" htmlFor="invite-search">Search eligible demo players</label><input id="invite-search" type="search" value={query} placeholder="Name or demo Player ID" onChange={event => setQuery(event.target.value)} /><p className="helper">Only registered {team.sport.toLowerCase()} players outside this roster are shown.</p><ul className="invite-candidates">{candidates.map(player => <li key={player.id}><img src={player.photo} width="40" height="40" alt="" loading="lazy" /><div><a href={`/players/${player.id}`}>{player.name}</a><small>{player.id.toUpperCase()}</small></div><button type="button" className="compact-action" disabled={pendingFor(player.id)} aria-label={`Invite ${player.name} to ${team.name}`} onClick={() => act('invite', { playerId: player.id })}>{pendingFor(player.id) ? 'Pending' : 'Invite'}</button></li>)}</ul>{!candidates.length && <p className="empty-state">No eligible players match this search.</p>}</section>
      <section className="management-column"><h3>Invitations</h3><p className="helper">Switch the demo player to a recipient to accept or reject an invitation.</p>{teamInvitations.length ? teamInvitations.map(item => <div className="activity-entry" key={item.id}><div><a href={`/players/${item.playerId}`}>{players.find(player => player.id === item.playerId)?.name}</a><Status value={item.status} /></div>{item.status === 'pending' && <button type="button" className="text-button" onClick={() => act('cancelInvite', { entryId: item.id })}>Cancel demo invitation</button>}</div>) : <p className="empty-state">No demo invitations yet.</p>}</section>
      <section className="management-column"><h3>Membership requests</h3>{teamRequests.length ? teamRequests.map(item => <div className="activity-entry" key={item.id}><div><a href={`/players/${item.playerId}`}>{players.find(player => player.id === item.playerId)?.name}</a><Status value={item.status} /></div>{item.status === 'pending' && <div className="activity-actions"><button type="button" className="compact-action" onClick={() => act('respondRequest', { entryId: item.id, accept: true })}>Approve request</button><button type="button" className="text-button" onClick={() => act('respondRequest', { entryId: item.id, accept: false })}>Reject request</button></div>}</div>) : <p className="empty-state">No demo join requests yet.</p>}</section>
    </div></section>}
  </main>;
}
