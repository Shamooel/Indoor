import { demoPlayers, demoTeams } from '../data/community';

export function initialCommunity() {
  return { players: demoPlayers, teams: demoTeams.map(team => ({ ...team, members: [...team.members] })), activePlayerId: demoPlayers[0].id,
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
  if (!values.description.trim() || values.description.trim().length > 280) errors.description = 'Add a description of up to 280 characters.';
  return errors;
}
function notify(state, notice, noticeKind = 'error') { return { ...state, notice, noticeKind }; }
function joinRoster(state, teamId, playerId) {
  return state.teams.map(team => team.id === teamId && !team.members.includes(playerId) ? { ...team, members: [...team.members, playerId] } : team);
}
export function communityReducer(state, action) {
  if (action.type === 'clearNotice') return { ...state, notice: '' };
  if (action.type === 'switchPlayer') return state.players.some(player => player.id === action.playerId) ? { ...state, activePlayerId: action.playerId, notice: '' } : state;
  const actor = state.players.find(player => player.id === state.activePlayerId);
  if (!actor) return notify(state, 'Select a registered demo player first.');
  if (action.type === 'createTeam') {
    const errors = validateTeam(action.values, state.teams, actor);
    if (Object.keys(errors).length) return notify(state, Object.values(errors)[0]);
    const team = { id: `demo-team-${state.sequence}`, name: action.values.name.trim().replace(/\s+/g, ' '), sport: action.values.sport,
      description: action.values.description.trim(), logo: action.values.logo || '', captainId: actor.id, members: [actor.id], stats: {}, matches: [] };
    return { ...state, teams: [...state.teams, team], sequence: state.sequence + 1, notice: 'Demo team created in this tab only. Nothing was saved to a database.', noticeKind: 'success' };
  }
  const team = state.teams.find(item => item.id === action.teamId);
  if (!team) return notify(state, 'This demo team could not be found.');
  const captain = actor.id === team.captainId;
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
