import { bookingLink } from '../data/journeys';
import React from 'react';
import { TeamLogo } from './CommunityElements';
import { useCommunity } from '../state/CommunityStore';
import { formatSchedule } from '../data/competition';

export function ChallengeStatus({ status }) {
  return <span className={`challenge-status ${status}`}>{status}</span>;
}
export default function ChallengeCard({ challenge, highlighted = false, contextTeamId }) {
  const { teams, activePlayer, dispatch } = useCommunity();
  const source = teams.find(team => team.id === challenge.fromTeamId);
  const opponent = teams.find(team => team.id === challenge.toTeamId);
  if (!source || !opponent) return null;
  const sender = source.captainId === activePlayer?.id && (!contextTeamId || contextTeamId === source.id);
  const receiver = opponent.captainId === activePlayer?.id && (!contextTeamId || contextTeamId === opponent.id);
  const ownTeam = sender ? source : receiver ? opponent : null;
  const otherTeam = sender ? opponent : source;
  const act = (type, accept) => dispatch({ type, challengeId: challenge.id, accept });
  return <article id={challenge.id} className={`challenge-card ${highlighted ? 'highlighted' : ''}`}>
    <div className="challenge-card-meta"><span>{challenge.sport} · {sender ? 'Outgoing' : receiver ? 'Incoming' : 'Demo proposal'}</span><ChallengeStatus status={challenge.status} /></div>
    <div className="challenge-versus"><a href={`/teams/${source.id}`}><TeamLogo team={source} /><strong>{source.name}</strong></a><span className="versus-mark">VS</span><a href={`/teams/${opponent.id}`}><TeamLogo team={opponent} /><strong>{opponent.name}</strong></a></div>
    <p className="helper">Sent by {source.name} · {challenge.status === 'pending' ? `Awaiting ${opponent.name}` : `Response status: ${challenge.status}`}</p><p className="challenge-schedule">{formatSchedule(challenge.date, challenge.time)}</p>{challenge.message && <p className="challenge-message">“{challenge.message}”</p>}
    <p className={`booking-separation ${challenge.status === 'accepted' ? 'emphasized' : ''}`}>{challenge.status === 'accepted' ? 'Accepted proposal only. No scheduled match or turf booking has been created; a separate confirmed booking is still required.' : 'Proposed match only · No turf reservation.'}</p>
    <div className="challenge-card-actions">{ownTeam && ['pending','accepted'].includes(challenge.status) && <a className="text-link" href={bookingLink(challenge,ownTeam.id)}>Review demo booking options ↗</a>}{challenge.status === 'pending' && <>{receiver && <><button className="compact-action" onClick={() => act('respondChallenge', true)}>Accept challenge</button><button className="text-button" onClick={() => act('respondChallenge', false)}>Reject</button></>}{sender && <button className="text-button" onClick={() => act('cancelChallenge')}>Cancel proposal</button>}</>}{ownTeam && <a className="text-link" href={`/inbox?from=${ownTeam.id}`} onClick={() => dispatch({ type: 'openConversation', fromTeamId: ownTeam.id, toTeamId: otherTeam.id })}>Captain inbox ↗</a>}</div>
  </article>;
}
