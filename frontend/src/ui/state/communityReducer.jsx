import { demoPlayers, demoTeams } from '../data/community';
import { initialCompetition } from '../data/competition';
import { competitionActions, competitionReducer } from './competitionReducer';
import { createDemoMatches } from '../data/matches';
import { profileErrors, cleanProfile, bookingErrors } from './accountActions';

export function initialCommunity() {
  return { ...initialCompetition(), matches: createDemoMatches(), players: demoPlayers, teams: demoTeams.map(team => ({ ...team, members: [...team.members] })), activePlayerId: null, bookings: [], bookingDrafts: {},
    invitations: [{ id: 'demo-invite-1', teamId: 'demo-coast', playerId: 'demo-p001', status: 'pending' }],
    requests: [{ id: 'demo-request-1', teamId: 'demo-harbour', playerId: 'demo-p004', status: 'pending' }],
    sequence: 2, notice: '', noticeKind: 'success' };
}
const normalized = value => value.trim().replace(/\s+/g, ' ').toLowerCase();
export function validateTeam(values, teams, actor) {
  const errors = {};
  if (values.name.trim().length < 2 || values.name.trim().length > 50) errors.name = 'Use a team name between 2 and 50 characters.';
  if (!['Football', 'Cricket'].includes(values.sport)) errors.sport = 'Choose Football or Cricket.';
  else if (!actor?.sports.includes(values.sport)) errors.sport = 'Choose a sport registered on the selected demo player, or switch demo players.';
  if (teams.some(team => team.sport === values.sport && normalized(team.name) === normalized(values.name))) errors.name = 'A demo team with this name already exists for this sport.';
  if ((values.description || '').trim().length > 280) errors.description = 'Keep the description to 280 characters or less.';
  return errors;
}
function notify(state, notice, noticeKind = 'error') { return { ...state, notice, noticeKind }; }
function joinRoster(state, teamId, playerId) {
  return state.teams.map(team => team.id === teamId && !team.members.includes(playerId) ? { ...team, members: [...team.members, playerId] } : team);
}
export function communityReducer(state, action) {
  if (action.type === 'clearNotice') return { ...state, notice: '' };
  if (action.type === 'exitAccount') return { ...state, activePlayerId: null, inboxConversationId: '', notice: '' };
  if (action.type === 'createAccount') {
    const errors = profileErrors(action.values, state, null, true);
    if (Object.keys(errors).length) return notify(state, Object.values(errors)[0]);
    const player = { ...cleanProfile(action.values), id: `demo-player-${state.sequence}`, email: action.values.email.trim().toLowerCase(), bio: 'Ready for the next game at Legends Field Indoor.' };
    return { ...state, players: [...state.players, player], activePlayerId: player.id, sequence: state.sequence + 1, notice: 'Your demo player account is ready. Changes last until refresh.', noticeKind: 'success' };
  }
  if (action.type === 'switchPlayer') return state.players.some(player => player.id === action.playerId) ? { ...state, activePlayerId: action.playerId, notice: '' } : state;
  const actor = state.players.find(player => player.id === state.activePlayerId);
  if (!actor) return notify(state, 'Select a registered demo player first.');
  if (action.type === 'editProfile') {
    const errors = profileErrors(action.values, state, actor);
    if (Object.keys(errors).length) return notify(state, Object.values(errors)[0]);
    const reconcile = entries => entries.map(entry => entry.playerId === actor.id && entry.status === 'pending' && !action.values.sports.includes(state.teams.find(t => t.id === entry.teamId)?.sport) ? { ...entry, status:'cancelled', reason:'Required sport removed from player profile. Add it again before requesting a new invitation or joining.' } : entry);
    const invitations = reconcile(state.invitations), requests = reconcile(state.requests);
    const cancelled = [...invitations, ...requests].filter(e => e.playerId === actor.id && e.reason).length;
    return { ...state, invitations, requests, players: state.players.map(p => p.id === actor.id ? { ...p, ...cleanProfile(action.values) } : p), notice: 'Profile updated everywhere in this demo session.' + (cancelled ? ' Ineligible pending memberships were cancelled; details are in Team Invitations.' : ''), noticeKind: 'success' };
  }
  if (action.type === 'bookingDraft') return { ...state, bookingDrafts: { ...state.bookingDrafts, [actor.id]: { ...state.bookingDrafts[actor.id], ...action.values } } };
  if (action.type === 'createBooking') {
    const errors = bookingErrors(action.values, state, actor);
    if (Object.keys(errors).length) return notify(state, Object.values(errors)[0]);
    const { sport, date, slot, teamId, opponentId } = action.values;
    const booking = { id: `demo-booking-${state.sequence}`, playerId: actor.id, sport, date, slot, teamId, opponentId, duration: 60, status: 'Demo request', opponentStatus: 'Not requested', createdAt: new Date().toISOString() };
    return { ...state, bookings: [...state.bookings, booking], bookingDrafts: { ...state.bookingDrafts, [actor.id]: {} }, sequence: state.sequence + 1, notice: 'Demo request added to My Bookings. No slot is reserved and the opponent has not accepted.', noticeKind: 'success' };
  }
  if (competitionActions.includes(action.type)) return competitionReducer(state, action, actor);
  if (action.type === 'createTeam') {
    const errors = validateTeam(action.values, state.teams, actor);
    if (Object.keys(errors).length) return notify(state, Object.values(errors)[0]);
    const team = { id: `demo-team-${state.sequence}`, name: action.values.name.trim().replace(/\s+/g, ' '), sport: action.values.sport,
      description: (action.values.description || '').trim(), logo: action.values.logo || '', captainId: actor.id, members: [actor.id] };
    return { ...state, teams: [...state.teams, team], ...(action.forBooking ? { bookingDrafts: { ...state.bookingDrafts, [actor.id]: { ...state.bookingDrafts[actor.id], teamId: team.id, opponentId: state.bookingDrafts[actor.id]?.opponentId === team.id ? '' : state.bookingDrafts[actor.id]?.opponentId || '' } } } : {}), sequence: state.sequence + 1, notice: 'Your demo team is ready. You are its captain.', noticeKind: 'success' };
  }
  const team = state.teams.find(item => item.id === action.teamId);
  if (!team) return notify(state, 'This demo team could not be found.');
  const captain = actor.id === team.captainId;
  if (action.type === 'editTeam') {
    if (!captain) return notify(state, 'Only this team’s captain can edit its settings.');
    const values = { ...action.values, sport: team.sport };
    const errors = validateTeam(values, state.teams.filter(t => t.id !== team.id), actor);
    if (Object.keys(errors).length) return notify(state, Object.values(errors)[0]);
    return { ...state, teams: state.teams.map(t => t.id === team.id ? { ...t, name: values.name.trim().replace(/\s+/g, ' '), description: (values.description || '').trim(), logo: values.logo || '' } : t), notice: 'Team settings updated everywhere in this session.', noticeKind: 'success' };
  }
  if (action.type === 'leaveTeam' || action.type === 'removeMember') {
    const playerId = action.type === 'leaveTeam' ? actor.id : action.playerId;
    if (action.type === 'removeMember' && !captain) return notify(state, 'Only this team’s captain can remove players.');
    if (playerId === team.captainId) return notify(state, 'The captain must remain. Captain transfer is not available in this demo.');
    if (!team.members.includes(playerId)) return notify(state, 'This player is no longer a member.');
    const clear = entries => entries.map(e => e.teamId === team.id && e.playerId === playerId && e.status === 'pending' ? { ...e, status: 'cancelled' } : e);
    return { ...state, teams: state.teams.map(t => t.id === team.id ? { ...t, members: t.members.filter(id => id !== playerId) } : t), invitations: clear(state.invitations), requests: clear(state.requests), bookingDrafts: { ...state.bookingDrafts, [playerId]: state.bookingDrafts[playerId]?.teamId === team.id ? { ...state.bookingDrafts[playerId], teamId: '', opponentId: '' } : state.bookingDrafts[playerId] || {} }, notice: 'Team membership updated. Recorded matches and past demo requests are unchanged.', noticeKind: 'success' };
  }
  if (action.type === 'cancelRequest') {
    const entry = state.requests.find(r => r.id === action.entryId && r.teamId === team.id && r.playerId === actor.id && r.status === 'pending');
    if (!entry) return notify(state, 'Only your own pending join request can be cancelled.');
    return { ...state, requests: state.requests.map(r => r.id === entry.id ? { ...r, status: 'cancelled' } : r), notice: 'Join request cancelled.', noticeKind: 'success' };
  }
  if (action.type === 'invite' || action.type === 'request') {
    const playerId = action.type === 'invite' ? action.playerId : actor.id;
    const player = state.players.find(item => item.id === playerId);
    if (action.type === 'invite' && !captain) return notify(state, 'Switch to this team’s demo captain to manage invitations.');
    if (!player || !player.sports.includes(team.sport)) return notify(state, 'Only registered demo players for this sport can join.');
    if (team.members.includes(playerId)) return notify(state, 'This player is already on the team.');
    const pending = [...state.invitations, ...state.requests].some(item => item.teamId === team.id && item.playerId === playerId && item.status === 'pending');
    if (pending) return notify(state, 'An invitation or join request is already pending for this player.');
    const key = action.type === 'invite' ? 'invitations' : 'requests';
    const entry = { id: `demo-${action.type}-${state.sequence}`, teamId: team.id, playerId, status: 'pending' };
    return { ...state, [key]: [...state[key], entry], sequence: state.sequence + 1, notice: action.type === 'invite' ? 'Demo invitation added. No notification was sent.' : 'Demo join request added. No request was sent outside this tab.', noticeKind: 'success' };
  }
  if (action.type === 'respondInvite' || action.type === 'cancelInvite' || action.type === 'respondRequest') {
    const request = action.type === 'respondRequest';
    const key = request ? 'requests' : 'invitations';
    const entry = state[key].find(item => item.id === action.entryId && item.teamId === team.id);
    if (!entry || entry.status !== 'pending') return notify(state, 'This item is no longer pending.');
    const canAct = request || action.type === 'cancelInvite' ? captain : actor.id === entry.playerId;
    if (!canAct) return notify(state, 'Switch to the relevant demo player or captain to use this control.');
    const status = action.type === 'cancelInvite' ? 'cancelled' : action.accept ? 'accepted' : 'rejected';
    const member = state.players.find(player => player.id === entry.playerId);
    if (status === 'accepted' && (!member?.sports.includes(team.sport) || team.members.includes(entry.playerId))) return notify(state, 'This player is already a member or is not registered for this sport.');
    return { ...state, [key]: state[key].map(item => item.id === entry.id ? { ...item, status } : item),
      teams: status === 'accepted' ? joinRoster(state, team.id, entry.playerId) : state.teams,
      notice: `Demo ${request ? 'join request' : 'invitation'} ${status}. ${status === 'accepted' ? 'The local roster has been updated.' : 'No roster changes were made.'}`, noticeKind: 'success' };
  }
  return state;
}
