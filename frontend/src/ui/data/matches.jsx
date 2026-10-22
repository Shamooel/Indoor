import { localDate } from './booking';

const footballTeams = ['demo-harbour', 'demo-coast'];
const cricketTeams = ['demo-creek', 'demo-falcons'];
const footballLineups = { 'demo-harbour': ['demo-p001', 'demo-p003', 'demo-p006'], 'demo-coast': ['demo-p004', 'demo-p005'] };
const cricketLineups = { 'demo-creek': ['demo-p002', 'demo-p001'], 'demo-falcons': ['demo-p005', 'demo-p003', 'demo-p006'] };
export function ballsToOvers(balls) { return `${Math.floor(balls / 6)}.${balls % 6}`; }
export function monthKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi', year: 'numeric', month: '2-digit' }).formatToParts(date);
  return `${parts.find(part => part.type === 'year').value}-${parts.find(part => part.type === 'month').value}`;
}

// Replay a deterministic delivery script. Scoreboards, individual rows and bowling totals
// all come from these deliveries. Unregistered historical guests are never ranked.
export function buildInnings(teamId, bowlingTeamId, targetRuns, targetWickets, legalBalls, limit = 60, chaseTarget = null) {
  const ids = cricketLineups[teamId];
  const bowlerIds = cricketLineups[bowlingTeamId].slice(0, 2);
  const batters = Array.from({ length: 7 }, (_, index) => ({ playerId: ids[index] || null, label: `Demo guest batter ${index + 1}`, runs: 0, balls: 0, fours: 0, sixes: 0, out: false }));
  const bowlers = bowlerIds.map(playerId => ({ playerId, balls: 0, runs: 0, wickets: 0 }));
  const wicketIndices = new Set(Array.from({ length: targetWickets }, (_, index) => targetWickets === 6 && index === 5 ? legalBalls - 1 : Math.floor((index + 1) * legalBalls / (targetWickets + 1)) - 1));
  const values = Array(legalBalls).fill(0);
  const free = values.map((_, index) => index).filter(index => !wicketIndices.has(index));
  [0, 1, 4, 6].forEach((value, index) => { values[free[index]] = value; });
  const finishingRun = chaseTarget && targetRuns >= chaseTarget ? 1 : 0;
  if (finishingRun) values[legalBalls - 1] = 1;
  let remaining = targetRuns - 1 - 11 - finishingRun;
  for (const index of free.slice(4).filter(index => !finishingRun || index !== legalBalls - 1)) {
    const value = remaining >= 6 ? 6 : remaining >= 4 ? 4 : remaining >= 2 ? 2 : remaining >= 1 ? 1 : 0;
    values[index] = value; remaining -= value;
  }
  if (remaining !== 0) throw new Error('Invalid illustrative innings totals');
  let striker = 0, nonStriker = 1, next = 2, runs = 1, wickets = 0;
  bowlers[0].runs = 1;
  const deliveries = [{ id: 'wide', legal: false, over: '0.0', kind: 'Extra', batRuns: 0, extras: 1, playerId: batters[0].playerId, label: batters[0].label, bowlerId: bowlerIds[0], totalRuns: 1, totalWickets: 0 }];
  values.forEach((batRuns, index) => {
    const bowler = bowlers[Math.floor(index / 6) % bowlers.length];
    const batter = batters[striker];
    const wicket = wicketIndices.has(index);
    batter.balls += 1; batter.runs += batRuns; batter.fours += Number(batRuns === 4); batter.sixes += Number(batRuns === 6);
    bowler.balls += 1; bowler.runs += batRuns; bowler.wickets += Number(wicket);
    runs += batRuns; wickets += Number(wicket);
    deliveries.push({ id: `ball-${index + 1}`, legal: true, over: ballsToOvers(index + 1), kind: wicket ? 'Wicket' : batRuns === 0 ? 'Dot' : batRuns === 4 ? 'Boundary' : batRuns === 6 ? 'Six' : 'Runs', batRuns, extras: 0, wicket, playerId: batter.playerId, label: batter.label, bowlerId: bowler.playerId, totalRuns: runs, totalWickets: wickets });
    if (wicket) { batter.out = true; striker = next++; }
    else if (batRuns % 2) [striker, nonStriker] = [nonStriker, striker];
    if ((index + 1) % 6 === 0 && next <= batters.length) [striker, nonStriker] = [nonStriker, striker];
  });
  return { teamId, bowlingTeamId, runs, wickets, legalBalls, limit, extras: 1, batters, bowlers, deliveries };
}
function base(id, sport, date, status = 'Completed', time = '20:00') {
  const pair = sport === 'Football' ? footballTeams : cricketTeams;
  return { id, sport, homeTeamId: pair[0], awayTeamId: pair[1], date, time, status, confirmed: true, venue: 'Legends Field Indoor', lineups: sport === 'Football' ? footballLineups : cricketLineups };
}
function football(id, date, homeGoals, awayGoals, status = 'Completed', now = Date.now()) {
  const result = base(id, 'Football', date, status);
  const count = homeGoals + awayGoals;
  const events = [];
  for (let index = 0; index < count; index++) {
    const home = index < homeGoals;
    events.push({ id: `goal-${index}`, type: 'Goal', teamId: home ? footballTeams[0] : footballTeams[1], playerId: home ? (index % 2 ? 'demo-p006' : 'demo-p001') : 'demo-p005', assistId: home ? 'demo-p006' : 'demo-p004', minute: status === 'Live' ? 4 : status === 'Half-Time' ? 12 : Math.floor((index + 1) * 38 / (count + 1)) });
    if (events.at(-1).playerId === events.at(-1).assistId) events.at(-1).assistId = 'demo-p001';
  }
  events.push({ id: 'yellow', type: 'Yellow card', teamId: footballTeams[1], playerId: 'demo-p004', minute: status === 'Live' ? 6 : 16 });
  if (status === 'Completed') {
    events.push({ id: 'red', type: 'Red card', teamId: footballTeams[1], playerId: 'demo-p004', minute: 39 });
    events.push({ id: 'substitution', type: 'Substitution', teamId: footballTeams[0], playerId: 'demo-p003', label: 'Guest goalkeeper on · Saad Khan off', minute: 30 });
  }
  const frozen = status === 'Half-Time' ? 1200 : 2400;
  const startedAt = status === 'Live' ? now - 444000 : status === 'Half-Time' ? now - 1200000 : new Date(`${date}T20:00:00+05:00`).getTime();
  if (['Live', 'Half-Time'].includes(status)) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(startedAt);
    const get = type => parts.find(part => part.type === type).value;
    result.date = `${get('year')}-${get('month')}-${get('day')}`;
    result.time = `${get('hour')}:${get('minute')}`;
  }
  // Historical roles belong to the fixture, so profile edits cannot rewrite results.
  result.football = { homeGoals, awayGoals, goalkeeperIds: ['demo-p003'], events: events.sort((a, b) => a.minute - b.minute), clock: { startedAt, baseSeconds: 0, frozenSeconds: frozen, periodEnd: 1200 } };
  return result;
}
function cricket(id, date, homeRuns, homeWickets, awayRuns, awayWickets, homeBalls = 60, awayBalls = 60) {
  return { ...base(id, 'Cricket', date), cricket: { innings: [buildInnings(cricketTeams[0], cricketTeams[1], homeRuns, homeWickets, homeBalls), buildInnings(cricketTeams[1], cricketTeams[0], awayRuns, awayWickets, awayBalls, 60, homeRuns + 1)], currentInnings: 2, maxWickets: 6 } };
}
export function createDemoMatches(now = Date.now()) {
  const key = monthKey(new Date(now));
  const today = (offset = 0) => localDate(offset, now);
  const currentDay = Number(today().slice(-2));
  const monthly = day => `${key}-${String(Math.min(day, currentDay)).padStart(2, '0')}`;
  const result = [
    football('demo-fb-sep18', '2026-09-18', 3, 2), football('demo-fb-sep04', '2026-09-04', 1, 2), football('demo-fb-aug21', '2026-08-21', 2, 2), football('demo-fb-aug07', '2026-08-07', 4, 1), football('demo-fb-jul24', '2026-07-24', 1, 3), football('demo-fb-jul10', '2026-07-10', 2, 0),
    cricket('demo-cr-sep19', '2026-09-19', 86, 5, 74, 6, 60, 56), cricket('demo-cr-sep05', '2026-09-05', 70, 6, 71, 4, 55, 53), cricket('demo-cr-aug22', '2026-08-22', 92, 4, 80, 6, 60, 58), cricket('demo-cr-aug08', '2026-08-08', 66, 6, 67, 5, 50, 55), cricket('demo-cr-jul25', '2026-07-25', 83, 5, 75, 6),
    football('demo-fb-month-a', monthly(3), 2, 1), football('demo-fb-month-b', monthly(10), 0, 0),
    cricket('demo-cr-month-a', monthly(4), 90, 3, 70, 6), cricket('demo-cr-month-b', monthly(11), 62, 6, 63, 2), cricket('demo-cr-month-tie', monthly(14), 74, 5, 74, 5),
    { ...base('demo-cr-no-result', 'Cricket', monthly(16)), cricket: { innings: [], currentInnings: 1, maxWickets: 6, noResult: true } },
    football('demo-fb-live', today(), 1, 0, 'Live', now), football('demo-fb-half-time', today(), 0, 1, 'Half-Time', now),
    { ...base('demo-cr-live', 'Cricket', today(), 'Live', '18:00'), cricket: { innings: [buildInnings(cricketTeams[0], cricketTeams[1], 86, 5, 60), buildInnings(cricketTeams[1], cricketTeams[0], 50, 2, 28)], currentInnings: 2, maxWickets: 6 } },
    { ...base('demo-cr-innings-break', 'Cricket', today(), 'Innings Break', '16:00'), cricket: { innings: [buildInnings(cricketTeams[0], cricketTeams[1], 83, 5, 60)], currentInnings: 1, maxWickets: 6 } }
  ];
  for (const sport of ['Football', 'Cricket']) for (const [index, status] of ['Upcoming', 'Postponed', 'Cancelled'].entries()) result.push(base(`demo-${sport.toLowerCase()}-${status.toLowerCase()}`, sport, today(index + 2), status));
  return result.filter(match => match.status !== 'Completed' || new Date(`${match.date}T${match.time}:00+05:00`).getTime() + (match.cricket?.noResult ? 0 : match.sport === 'Football' ? 2400000 : 3600000) <= now);
}
export function matchResult(match) {
  if (match.status !== 'Completed') return { winnerId: null, label: match.status, noResult: false };
  if (match.sport === 'Football') {
    const { homeGoals: a, awayGoals: b } = match.football;
    return { winnerId: a === b ? null : a > b ? match.homeTeamId : match.awayTeamId, label: a === b ? 'Draw' : `${a}–${b}`, noResult: false };
  }
  if (match.cricket.noResult) return { winnerId: null, label: 'No result · no play', noResult: true };
  const [first, second] = match.cricket.innings;
  return { winnerId: first.runs === second.runs ? null : first.runs > second.runs ? first.teamId : second.teamId, label: first.runs === second.runs ? 'Tied' : first.runs > second.runs ? `Won by ${first.runs - second.runs} runs` : `Won by ${match.cricket.maxWickets - second.wickets} wickets`, noResult: false };
}
export function scoreFor(match, teamId) {
  if (match.sport === 'Football') return match.football ? String(teamId === match.homeTeamId ? match.football.homeGoals : match.football.awayGoals) : '—';
  const innings = match.cricket?.innings.find(item => item.teamId === teamId);
  return innings ? `${innings.runs}/${innings.wickets}` : '—';
}
export function completedMatches(matches, sport, period = 'all', key = monthKey()) {
  return matches.filter(match => match.confirmed && match.status === 'Completed' && (!sport || match.sport === sport) && (period === 'all' || match.date.startsWith(key)));
}
export function rivalryMatches(matches, rivalry) {
  return completedMatches(matches, rivalry.sport).filter(match => !matchResult(match).noResult && [rivalry.teamAId, rivalry.teamBId].includes(match.homeTeamId) && [rivalry.teamAId, rivalry.teamBId].includes(match.awayTeamId)).sort((a, b) => b.date.localeCompare(a.date));
}
export function appearances(matches, playerId, sport) { return completedMatches(matches, sport).filter(match => Object.values(match.lineups).some(ids => ids.includes(playerId)) && (sport !== 'Cricket' || match.cricket.innings.length > 0)); }
export function footballClock(match, now = Date.now()) {
  if (!match.football) return '—';
  const clock = match.football.clock;
  const seconds = match.status === 'Live' ? Math.min(clock.periodEnd, clock.baseSeconds + Math.max(0, Math.floor((now - clock.startedAt) / 1000))) : clock.frozenSeconds;
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
