import { rivalryMatches, matchResult, scoreFor } from './matches';
import { localDate } from './booking';

// References use the existing community teams. All schedules and results are fictional.
export function initialCompetition() {
  return {
    challenges: [
      { id: 'demo-challenge-football', fromTeamId: 'demo-harbour', toTeamId: 'demo-coast', sport: 'Football', date: localDate(3), time: '20:00', message: 'A friendly rematch? Let’s discuss a suitable booking separately.', status: 'pending' },
      { id: 'demo-challenge-return', fromTeamId: 'demo-coast', toTeamId: 'demo-harbour', sport: 'Football', date: localDate(5), time: '19:00', message: 'Would your side be up for a game next week?', status: 'pending' },
      { id: 'demo-challenge-cricket', fromTeamId: 'demo-creek', toTeamId: 'demo-falcons', sport: 'Cricket', date: localDate(4), time: '18:00', message: 'Let’s arrange another indoor cricket friendly.', status: 'pending' },
      { id: 'demo-challenge-accepted', fromTeamId: 'demo-harbour', toTeamId: 'demo-coast', sport: 'Football', date: localDate(7), time: '21:00', message: 'Demo acceptance only; the field still needs a confirmed booking.', status: 'accepted' },
      { id: 'demo-challenge-rejected', fromTeamId: 'demo-falcons', toTeamId: 'demo-creek', sport: 'Cricket', date: localDate(6), time: '17:00', message: 'This proposed time did not work for the other demo captain.', status: 'rejected' },
      { id: 'demo-challenge-cancelled', fromTeamId: 'demo-coast', toTeamId: 'demo-harbour', sport: 'Football', date: localDate(8), time: '19:00', message: 'The sender cancelled this illustrative proposal.', status: 'cancelled' }
    ],
    conversations: [
      { id: 'demo-conversation-football', teamIds: ['demo-harbour', 'demo-coast'], messages: [
        { id: 'demo-history-message-1', fromTeamId: 'demo-coast', text: 'Good game last time. Shall we discuss another friendly?', timestamp: `${localDate(-1)}T11:00:00+05:00` },
        { id: 'demo-history-message-2', fromTeamId: 'demo-harbour', text: 'Sounds good. Let’s agree on a proposal, then arrange the turf booking separately.', timestamp: `${localDate(-1)}T11:08:00+05:00` }
      ] },
      { id: 'demo-conversation-cricket', teamIds: ['demo-creek', 'demo-falcons'], messages: [
        { id: 'demo-history-message-3', fromTeamId: 'demo-creek', text: 'Would your demo team be available for another cricket match?', timestamp: `${localDate(-1)}T14:30:00+05:00` }
      ] }
    ],
    inboxConversationId: '',
    rivalries: [
      { id: 'demo-harbour-coast', teamAId: 'demo-harbour', teamBId: 'demo-coast', sport: 'Football', label: 'The coastal fixture' },
      { id: 'demo-creek-falcons', teamAId: 'demo-creek', teamBId: 'demo-falcons', sport: 'Cricket', label: 'A contest of partnerships' }
    ]
  };
}

export function scheduledInstant(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time || '')) return NaN;
  const day = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== date) return NaN;
  return new Date(`${date}T${time}:00+05:00`).getTime();
}
export function formatSchedule(date, time) {
  const instant = scheduledInstant(date, time);
  if (!Number.isFinite(instant)) return 'Schedule not set';
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(instant) + ' PKT';
}
export function messageTime(value, full = false) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', day: 'numeric', month: 'short', ...(full ? { year: 'numeric' } : {}), hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value)) + ' PKT';
}
export function rivalryHistory(rivalry, matches) {
  return rivalryMatches(matches, rivalry).map(match => {
    const result = matchResult(match);
    return { id: match.id, date: match.date, scoreA: scoreFor(match, rivalry.teamAId), scoreB: scoreFor(match, rivalry.teamBId), winner: !result.winnerId ? 'draw' : result.winnerId === rivalry.teamAId ? 'a' : 'b', description: match.sport === 'Football' ? 'Demo football friendly' : result.label };
  });
}
export function rivalrySummary(rivalry, matches) {
  const history = rivalryHistory(rivalry, matches);
  return { played: history.length, aWins: history.filter(match => match.winner === 'a').length, bWins: history.filter(match => match.winner === 'b').length, draws: history.filter(match => match.winner === 'draw').length };
}
export function sameTeamPair(first, second, teamIds) { return teamIds.includes(first) && teamIds.includes(second); }
