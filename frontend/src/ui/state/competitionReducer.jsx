import { sameTeamPair, scheduledInstant } from '../data/competition';

export const competitionActions = ['sendChallenge', 'respondChallenge', 'cancelChallenge', 'openConversation', 'sendMessage'];
const feedback = (state, notice, noticeKind = 'error') => ({ ...state, notice, noticeKind });
export function validateChallenge(values, state, actor, now = Date.now()) {
  const errors = {};
  const source = state.teams.find(team => team.id === values.fromTeamId);
  const opponent = state.teams.find(team => team.id === values.toTeamId);
  if (!source || source.captainId !== actor?.id) errors.fromTeamId = 'Choose a team captained by the selected demo player.';
  if (!opponent) errors.toTeamId = 'Choose an opponent team.';
  if (source && opponent && source.id === opponent.id) errors.toTeamId = 'A team cannot challenge itself.';
  if (!['Football', 'Cricket'].includes(values.sport) || (source && source.sport !== values.sport) || (opponent && opponent.sport !== values.sport)) errors.sport = 'Both teams must play the selected sport.';
  if (!values.date) errors.date = 'Choose a proposed match date.';
  if (!values.time) errors.time = 'Choose a proposed match time.';
  if (values.date && values.time) {
    const instant = scheduledInstant(values.date, values.time);
    if (!Number.isFinite(instant)) errors.date = 'Enter a valid date and time.';
    else if (instant <= now) errors.time = 'The proposed date and time must be in the future (Karachi time).';
  }
  if ((values.message || '').trim().length > 500) errors.message = 'Keep the challenge message to 500 characters or less.';
  if (state.challenges.some(item => ['pending', 'accepted'].includes(item.status) && item.sport === values.sport && item.date === values.date && item.time === values.time
    && sameTeamPair(values.fromTeamId, values.toTeamId, [item.fromTeamId, item.toTeamId]))) errors.toTeamId = 'An active challenge already exists for these teams at this proposed time.';
  return errors;
}
export function competitionReducer(state, action, actor) {
  if (action.type === 'sendChallenge') {
    const errors = validateChallenge(action.values, state, actor);
    if (Object.keys(errors).length) return feedback(state, Object.values(errors)[0]);
    const { fromTeamId, toTeamId, sport, date, time, message = '' } = action.values;
    const item = { id: `demo-challenge-${state.sequence}`, fromTeamId, toTeamId, sport, date, time, message: message.trim(), status: 'pending' };
    return { ...state, challenges: [...state.challenges, item], sequence: state.sequence + 1, notice: 'Demo challenge added locally. No message was delivered and no turf booking was created.', noticeKind: 'success' };
  }
  if (action.type === 'respondChallenge' || action.type === 'cancelChallenge') {
    const item = state.challenges.find(challenge => challenge.id === action.challengeId);
    if (!item || item.status !== 'pending') return feedback(state, 'This challenge is no longer pending.');
    const source = state.teams.find(team => team.id === item.fromTeamId);
    const target = state.teams.find(team => team.id === item.toTeamId);
    const cancelling = action.type === 'cancelChallenge';
    if ((cancelling ? source : target)?.captainId !== actor.id) return feedback(state, 'Only the relevant demo captain can perform this action.');
    const proposed = scheduledInstant(item.date, item.time);
    if (!cancelling && action.accept && (!Number.isFinite(proposed) || proposed <= Date.now())) return feedback(state, 'This proposed schedule has passed or is invalid. Create a new future proposal.');
    const status = cancelling ? 'cancelled' : action.accept ? 'accepted' : 'rejected';
    return { ...state, challenges: state.challenges.map(challenge => challenge.id === item.id ? { ...challenge, status } : challenge),
      notice: status === 'accepted' ? 'Challenge accepted in the demo only. A separate confirmed turf booking is still required.' : `Demo challenge ${status}. No reservation was changed.`, noticeKind: 'success' };
  }
  if (action.type === 'openConversation') {
    const source = state.teams.find(team => team.id === action.fromTeamId);
    const opponent = state.teams.find(team => team.id === action.toTeamId);
    if (!source || source.captainId !== actor.id) return feedback(state, 'Choose a team you captain in this demo.');
    if (!opponent || source.id === opponent.id || source.sport !== opponent.sport) return feedback(state, 'Choose a different opponent team in the same sport.');
    const existing = state.conversations.find(thread => sameTeamPair(source.id, opponent.id, thread.teamIds));
    if (existing) return { ...state, inboxConversationId: existing.id, notice: '' };
    const thread = { id: `demo-conversation-${state.sequence}`, teamIds: [source.id, opponent.id], messages: [] };
    return { ...state, conversations: [...state.conversations, thread], inboxConversationId: thread.id, sequence: state.sequence + 1, notice: 'A local demo conversation is ready. No real conversation was opened.', noticeKind: 'success' };
  }
  if (action.type === 'sendMessage') {
    const thread = state.conversations.find(item => item.id === action.conversationId);
    const source = state.teams.find(team => team.id === action.fromTeamId);
    if (!thread || !source || !thread.teamIds.includes(source.id) || source.captainId !== actor.id) return feedback(state, 'Only a participating demo team captain can add messages.');
    const text = (action.text || '').trim();
    if (!text || text.length > 1000) return feedback(state, 'Enter a message of 1–1,000 characters.');
    const message = { id: `demo-message-${state.sequence}`, fromTeamId: source.id, text, timestamp: new Date().toISOString() };
    return { ...state, conversations: state.conversations.map(item => item.id === thread.id ? { ...item, messages: [...item.messages, message] } : item), sequence: state.sequence + 1,
      notice: 'Demo message added in this tab only. It was not delivered to anyone.', noticeKind: 'success' };
  }
  return state;
}
