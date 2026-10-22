import { challengeLink } from '../data/journeys';
import React from 'react';
import { useCommunity } from '../state/CommunityStore';
import { endTime, formatDate } from '../data/booking';
export default function BookingRecord({ booking }) {
  const { teams, players, activePlayer } = useCommunity();
  return <details className="booking-request"><summary><strong>{booking.sport} · {formatDate(booking.date)}</strong><span>{booking.slot}–{endTime(booking.slot)} PKT</span><span className="booking-status">{booking.status}</span><span>View details ↓</span></summary><dl className="review-details">{[['Request ID',booking.id],['Player',players.find(p => p.id === booking.playerId)?.name],['My Team',teams.find(t => t.id === booking.teamId)?.name],['Opponent Team',teams.find(t => t.id === booking.opponentId)?.name],['Duration','60 minutes'],['Venue','Legends Field Indoor'],['Opponent confirmation',booking.opponentStatus],['Turf reservation','Not reserved']].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="helper">A demo request only. No booking or match is confirmed, and no message was sent to the opponent.</p>{teams.find(t => t.id === booking.teamId)?.captainId === activePlayer?.id && <a className="text-link" href={challengeLink(booking)}>Propose this date to the opponent ↗</a>}</details>;
}
