import { appearances, completedMatches, matchResult, monthKey } from './matches';

export function playerRecord(matches, player, sport, period = 'all', key = monthKey()) {
  const eligible = completedMatches(matches, sport, period, key);
  const played = appearances(eligible, player.id, sport);
  if (sport === 'Football') {
    let goals = 0, assists = 0, cleanSheets = 0;
    for (const match of played) {
      goals += match.football.events.filter(event => event.type === 'Goal' && event.playerId === player.id).length;
      assists += match.football.events.filter(event => event.type === 'Goal' && event.assistId === player.id).length;
      const team = Object.keys(match.lineups).find(id => match.lineups[id].includes(player.id));
      const against = team === match.homeTeamId ? match.football.awayGoals : match.football.homeGoals;
      if (match.football.goalkeeperIds.includes(player.id) && against === 0) cleanSheets++;
    }
    return { matches: played.length, goals, assists, cleanSheets };
  }
  const result = { matches: played.length, runs: 0, balls: 0, fours: 0, sixes: 0, wickets: 0, bowlingBalls: 0, conceded: 0 };
  for (const match of played) for (const innings of match.cricket.innings) {
    for (const row of innings.batters.filter(item => item.playerId === player.id)) for (const field of ['runs', 'balls', 'fours', 'sixes']) result[field] += row[field];
    for (const row of innings.bowlers.filter(item => item.playerId === player.id)) { result.wickets += row.wickets; result.bowlingBalls += row.balls; result.conceded += row.runs; }
  }
  return { ...result, strikeRate: result.balls ? result.runs / result.balls * 100 : null, economy: result.bowlingBalls ? result.conceded * 6 / result.bowlingBalls : null };
}
export function profileStatistics(matches, player, sport) {
  const row = playerRecord(matches, player, sport);
  return sport === 'Football' ? { Appearances: row.matches, Goals: row.goals, Assists: row.assists, 'Clean sheets': row.cleanSheets }
    : { Appearances: row.matches, Runs: row.runs, Wickets: row.wickets, 'Strike rate': row.strikeRate?.toFixed(2) ?? '—', Economy: row.economy?.toFixed(2) ?? '—' };
}
export const leaderboardMetrics = {
  Football: [{ key: 'goals', label: 'Most Goals' }, { key: 'assists', label: 'Most Assists' }, { key: 'matches', label: 'Most Matches Played' }, { key: 'cleanSheets', label: 'Clean Sheets', note: 'Players recorded as goalkeepers in completed matches in the selected period; current profile roles do not change eligibility.' }],
  Cricket: [{ key: 'runs', label: 'Most Runs' }, { key: 'wickets', label: 'Most Wickets' }, { key: 'strikeRate', label: 'Best Batting Strike Rate', note: 'Minimum 20 balls faced in the selected period.' }, { key: 'economy', label: 'Best Bowling Economy', note: 'Minimum 12 legal balls bowled in the selected period. Lower is better.' }]
};
export function leaderboard(matches, players, sport, metric, period, key = monthKey()) {
  const rows = players.map(player => ({ player, ...playerRecord(matches, player, sport, period, key) }))
    .filter(row => row.matches > 0 && (metric !== 'cleanSheets' || completedMatches(matches, sport, period, key).some(match => match.football.goalkeeperIds.includes(row.player.id) && appearances([match], row.player.id, sport).length)) && (sport !== 'Cricket' || metric !== 'runs' || row.balls > 0) && (sport !== 'Cricket' || metric !== 'wickets' || row.bowlingBalls > 0) && (metric !== 'strikeRate' || row.balls >= 20) && (metric !== 'economy' || row.bowlingBalls >= 12) && row[metric] !== null);
  rows.sort((a, b) => (metric === 'economy' ? a[metric] - b[metric] : b[metric] - a[metric]) || a.player.name.localeCompare(b.player.name));
  let previous, rank = 0;
  return rows.map((row, index) => { if (row[metric] !== previous) rank = index + 1; previous = row[metric]; return { ...row, rank }; });
}
export function standings(matches, teams, sport, period = 'all', key = monthKey()) {
  const rows = teams.filter(team => team.sport === sport).map(team => ({ team, played: 0, won: 0, drawn: 0, lost: 0, tied: 0, noResult: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 }));
  for (const match of completedMatches(matches, sport, period, key)) {
    const outcome = matchResult(match);
    for (const row of rows.filter(item => [match.homeTeamId, match.awayTeamId].includes(item.team.id))) {
      row.played++;
      if (sport === 'Football') {
        const home = row.team.id === match.homeTeamId;
        row.goalsFor += home ? match.football.homeGoals : match.football.awayGoals;
        row.goalsAgainst += home ? match.football.awayGoals : match.football.homeGoals;
        if (!outcome.winnerId) { row.drawn++; row.points++; }
        else if (outcome.winnerId === row.team.id) { row.won++; row.points += 3; } else row.lost++;
      } else if (outcome.noResult) { row.noResult++; row.points++; }
      else if (!outcome.winnerId) { row.tied++; row.points++; }
      else if (outcome.winnerId === row.team.id) { row.won++; row.points += 2; } else row.lost++;
    }
  }
  rows.forEach(row => { row.goalDifference = row.goalsFor - row.goalsAgainst; });
  rows.sort((a, b) => b.points - a.points || (sport === 'Football' ? b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor : b.won - a.won) || a.team.name.localeCompare(b.team.name));
  return rows.map((row, index) => ({ ...row, position: index + 1 }));
}

export function leaderboardTeams(teams, playerId, sport) {
  return teams.filter(team => team.sport === sport && team.members.includes(playerId));
}
