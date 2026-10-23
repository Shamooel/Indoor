import { footballPositions, cricketRoles } from '../data/community';
import { validEmail } from '../data/player';
import { localDate, slotsForDate } from '../data/booking';

import { defaultPhoto } from '../data/identity';
export { defaultPhoto } from '../data/identity';
export function profileErrors(values, state, actor, creating = false) {
  const errors = {};
  if (!values.name?.trim() || values.name.trim().length > 70) errors.name = 'Enter a name of 1–70 characters.';
  if (creating && !validEmail(values.email || '')) errors.email = 'Enter a valid email address.';
  if (creating && state.players.some(p => p.email?.toLowerCase() === values.email?.trim().toLowerCase())) errors.email = 'This email already has a demo player in this session. Use Access Existing Account.';
  if (!Array.isArray(values.sports) || !values.sports.length || values.sports.some(s => !['Football','Cricket'].includes(s))) errors.sports = 'Choose Football, Cricket, or both.';
  if (values.sports?.includes('Football') && (!values.positions?.length || values.positions.some(p => !footballPositions.includes(p)))) errors.positions = 'Choose your primary football position.';
  if (values.sports?.includes('Cricket') && !cricketRoles.includes(values.role)) errors.role = 'Choose your cricket role.';
  if (!creating && state.teams.some(t => t.members.includes(actor?.id) && !values.sports?.includes(t.sport))) errors.sports = 'Keep the sports of your current teams selected so your memberships remain valid.';
  return errors;
}
export function cleanProfile(values) {
  return { name: values.name.trim(), sports: [...new Set(values.sports)], positions: values.sports.includes('Football') ? [...new Set(values.positions)] : [], role: values.sports.includes('Cricket') ? values.role : '', photo: values.photo || defaultPhoto };
}
export function bookingErrors(values, state, actor) {
  const errors = {};
  if (!actor) errors.account = 'Create or access your player account to book a turf slot.';
  if (!['Football','Cricket'].includes(values.sport) || !actor?.sports.includes(values.sport)) errors.sport = 'Choose a sport on your player profile. You can add another sport in Edit Profile.';
  const date = new Date(`${values.date}T12:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== values.date || values.date < localDate(1)) errors.date = 'Choose tomorrow or a later valid date.';
  if (!values.slot || !slotsForDate(values.date || '').some(s => s.time === values.slot && s.available)) errors.slot = 'Select an available demo slot.';
  const own = state.teams.find(t => t.id === values.teamId);
  const opponent = state.teams.find(t => t.id === values.opponentId);
  if (!own || own.sport !== values.sport || !own.members.includes(actor?.id)) errors.teamId = 'Select one of your teams in this sport.';
  if (own && own.captainId !== actor?.id) errors.captain = 'Only the captain of your selected team can submit. Contact your captain or select a team you captain.';
  if (!opponent || opponent.sport !== values.sport || opponent.id === own?.id) errors.opponentId = 'Select a different registered team in the same sport.';
  if (state.bookings.some(b => b.playerId === actor?.id && b.date === values.date && b.slot === values.slot)) errors.duplicate = 'You already have a demo request for this time. View it in My Bookings.';
  return errors;
}
