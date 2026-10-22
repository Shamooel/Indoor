import { standings } from '../data/sportsStatistics';
import React from 'react';
import DemoCommunityBar from '../components/DemoCommunityBar';
import { MatchHistory, MissingProfile, Statistics, TeamLogo } from '../components/CommunityElements';
import { useCommunity } from '../state/CommunityStore';
import TeamCompetitionActions from '../components/TeamCompetitionActions';
import '../styles/community.css';

function Status({ value }) { return <span className={`membership-status ${value}`}>{value}</span>; }

export default function TeamProfile({ id }) {
  const { teams, players, matches, activePlayer, invitations, requests, dispatch } = useCommunity();
  const team = teams.find(item => item.id === id);
  if (!team) return <main id="main" tabIndex="-1" className="inner-page container community-page"><MissingProfile type="team" /></main>;
  const record = standings(matches, teams, team.sport).find(row => row.team.id === team.id);
  const captain = players.find(player => player.id === team.captainId);
  const isCaptain = activePlayer?.id === team.captainId;
  const isMember = team.members.includes(activePlayer?.id);
  const compatible = activePlayer?.sports.includes(team.sport);
  const teamInvitations = invitations.filter(item => item.teamId === team.id);
  const teamRequests = requests.filter(item => item.teamId === team.id);
  const ownInvitations = teamInvitations.filter(item => item.playerId === activePlayer?.id);
  const ownRequests = teamRequests.filter(item => item.playerId === activePlayer?.id);
  const pendingFor = playerId => [...teamInvitations, ...teamRequests].some(item => item.playerId === playerId && item.status === 'pending');
  const act = (type, rest = {}) => dispatch({ type, teamId: team.id, ...rest });
  return <main id="main" tabIndex="-1" className="inner-page container community-page">
    <a href="/teams" className="back-link">← All teams</a><DemoCommunityBar />
    <section className="team-profile-header"><TeamLogo team={team} large /><div><p className="eyebrow">{team.sport.toUpperCase()} / DEMO TEAM</p><h1>{team.name}<span className="dot">.</span></h1><p>{team.description}</p><div className="team-header-meta"><span>{team.members.length} demo players</span><a href={`/players/${captain.id}`}>Captain: {captain.name} ↗</a></div></div></section>
    {isCaptain && <a className="button" href={`/teams/${team.id}/manage`}>Manage Team ↗</a>}<TeamCompetitionActions team={team} />
    <div className="team-profile-layout"><div>
      <section className="community-section"><div className="community-section-title"><h2>The team sheet</h2><span>{team.sport} roster</span></div><ul className="roster-list">{team.members.map(playerId => { const player = players.find(item => item.id === playerId); return <li key={player.id}><img src={player.photo} alt={`Illustrative portrait for ${player.name}`} width="48" height="48" loading="lazy" /><a href={`/players/${player.id}`}><strong>{player.name}</strong><small>{team.sport === 'Football' ? player.positions.join(' / ') : player.role}</small></a><span>{player.id === captain.id ? 'Captain · demo' : 'Member · demo'}</span></li>; })}</ul></section>
      <section className="community-section"><div className="community-section-title"><h2>Team at a glance</h2><span>Completed demo results</span></div><Statistics values={{ Played: record.played, Won: record.won, Lost: record.lost, ...(team.sport === "Football" ? { Drawn: record.drawn } : { Tied: record.tied, "No result": record.noResult }), Points: record.points }} /><a className="text-link" href={`/rankings?sport=${team.sport}`}>View demo standings ↗</a><p className="helper">Illustrative statistics only. Membership actions do not calculate or change match records.</p></section><MatchHistory matches={matches.filter(match => match.confirmed && match.status === "Completed" && [match.homeTeamId, match.awayTeamId].includes(team.id))} />
    </div><aside className="team-membership-panel">
      <p className="eyebrow">YOUR PLACE IN THE TEAM</p><h2>{isCaptain ? 'Lead the team.' : isMember ? 'On the team sheet.' : 'Find your place.'}</h2><p className="membership-context">{activePlayer ? <>Playing as <strong>{activePlayer.name}</strong> · Demo account</> : "Access your player account to join this team."}</p>
      {!activePlayer ? <a className="button" href={`/account?next=${encodeURIComponent("/teams/" + team.id)}`}>Access account to join</a> : isCaptain ? <p className="helper">You captain this team. Manage players, invitations, challenges and bookings in its workspace.</p>
        : isMember ? <p className="helper">You play for this team. <a href="/account/teams">Manage your membership in My Teams.</a></p>
        : !compatible ? <p className="helper">This player is not registered for {team.sport.toLowerCase()}. Select a demo player who plays this sport to request a place.</p>
        : <><button type="button" className="button full-width" disabled={pendingFor(activePlayer?.id)} onClick={() => act('request')}>Request to join <span aria-hidden="true">↗</span></button>{pendingFor(activePlayer?.id) && <p className="helper">An invitation or join request is already pending. Check its status below.</p>}</>}

      {!isCaptain && (ownInvitations.length > 0 || ownRequests.length > 0) && <section className="membership-activity"><h3>Your invitation & request status</h3>{ownInvitations.map(item => <div className="activity-entry" key={item.id}><div><strong>Team invitation</strong><Status value={item.status} /></div>{item.status === 'pending' && <div className="activity-actions"><button className="compact-action" onClick={() => act('respondInvite', { entryId: item.id, accept: true })}>Accept invitation</button><button className="text-button" onClick={() => act('respondInvite', { entryId: item.id, accept: false })}>Reject invitation</button></div>}</div>)}{ownRequests.map(item => <div className="activity-entry" key={item.id}><div><strong>Your join request</strong><Status value={item.status} /></div>{item.status === 'pending' && <button className="text-button" onClick={() => act('cancelRequest', { entryId:item.id })}>Cancel join request</button>}<p className="helper">{item.status === 'pending' ? 'Waiting for the demo captain.' : `Demo request ${item.status}.`}</p></div>)}</section>}
    </aside></div>

  </main>;
}
