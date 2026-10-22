import { localDate, slotsForDate } from './booking';
import { scheduledInstant } from './competition';
import { appearances } from './matches';
export function historySports(matches, player) {
  return [...new Set([...player.sports, ...['Football','Cricket'].filter(s => appearances(matches, player.id, s).length)])];
}
export function personalFixtures(matches, teams, playerId, sport, status) {
  const own = teams.filter(t => t.members.includes(playerId)).map(t => t.id);
  return matches.filter(m => m.confirmed && m.sport === sport && (status === 'Live' ? ['Live','Half-Time','Innings Break'].includes(m.status) : m.status === status) && [m.homeTeamId,m.awayTeamId].some(id => own.includes(id)));
}
export function challengeLink(record) {
  return '/challenges?' + new URLSearchParams({ from:record.teamId, opponent:record.opponentId, date:record.date, time:record.slot });
}
export function bookingLink(challenge, ownTeamId) {
  return '/booking?' + new URLSearchParams({ from:ownTeamId, opponent:ownTeamId === challenge.fromTeamId ? challenge.toTeamId : challenge.fromTeamId, date:challenge.date, time:challenge.time });
}
export function scheduleHandoff(date, time, destination, now = Date.now()) {
  if (!date && !time) return { date:'', time:'', message:'' };
  const instant = scheduledInstant(date,time);
  const future = Number.isFinite(instant) && instant > now;
  const compatible = future && (destination === 'challenge' || (date >= localDate(1,new Date(now)) && slotsForDate(date).some(s => s.time === time && s.available)));
  return compatible ? { date,time,message:'Proposed date and time copied (PKT). Review them before submitting; requests and challenges remain separate.' } : { date:'',time:'',message:destination === 'challenge' ? 'That request time has passed or is invalid. Choose a new future challenge time; no reservation is created.' : 'This proposal does not match an available demo slot from tomorrow onward. Teams were copied; choose a new date and time. No reservation or fixture is created.' };
}
