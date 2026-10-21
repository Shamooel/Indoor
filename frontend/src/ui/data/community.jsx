const portrait = name => {
  const images = {
    ayaan: new URL('../assets/players/ayaan.jpg', import.meta.url).href,
    zain: new URL('../assets/players/zain.jpg', import.meta.url).href,
    saad: new URL('../assets/players/saad.jpg', import.meta.url).href,
    imran: new URL('../assets/players/imran.jpg', import.meta.url).href,
    bilal: new URL('../assets/players/bilal.jpg', import.meta.url).href,
    hamza: new URL('../assets/players/hamza.jpg', import.meta.url).href
  };
  return images[name];
};

// Fictional registered players. IDs, sports records, names and teams are demo data.
export const demoPlayers = [
  { id: 'demo-p001', name: 'Ayaan Malik', photo: portrait('ayaan'), sports: ['Football', 'Cricket'], positions: ['Midfielder', 'Forward'], role: 'All-rounder', bio: 'Finding space, building partnerships, and playing for the team.', football: { Appearances: 18, Goals: 7, Assists: 11 }, cricket: { Appearances: 14, Runs: 286, Wickets: 12 } },
  { id: 'demo-p002', name: 'Zain Ahmed', photo: portrait('zain'), sports: ['Cricket'], positions: [], role: 'Batsman', bio: 'Patient at the crease. Always looking for the next partnership.', cricket: { Appearances: 16, Runs: 412, Wickets: 0 } },
  { id: 'demo-p003', name: 'Saad Khan', photo: portrait('saad'), sports: ['Football', 'Cricket'], positions: ['Goalkeeper'], role: 'Wicketkeeper', bio: 'A steady pair of hands, whichever game is on.', football: { Appearances: 18, Saves: 47, 'Clean sheets': 5 }, cricket: { Appearances: 12, Runs: 148, Catches: 16 } },
  { id: 'demo-p004', name: 'Imran Shah', photo: portrait('imran'), sports: ['Football'], positions: ['Defender', 'Midfielder'], role: '', bio: 'Reading the game and keeping the back line together.', football: { Appearances: 20, Goals: 2, Assists: 6 } },
  { id: 'demo-p005', name: 'Bilal Raza', photo: portrait('bilal'), sports: ['Football', 'Cricket'], positions: ['Forward'], role: 'Bowler', bio: 'Playing on the front foot, with a team-first approach.', football: { Appearances: 15, Goals: 13, Assists: 4 }, cricket: { Appearances: 15, Runs: 94, Wickets: 23 } },
  { id: 'demo-p006', name: 'Hamza Ali', photo: portrait('hamza'), sports: ['Football', 'Cricket'], positions: ['Defender'], role: 'All-rounder', bio: 'Here for the close games and the people who make them.', football: { Appearances: 9, Goals: 1, Assists: 3 }, cricket: { Appearances: 8, Runs: 167, Wickets: 9 } }
];

export const demoTeams = [
  { id: 'demo-harbour', name: 'Harbour Athletic', sport: 'Football', captainId: 'demo-p001', members: ['demo-p001', 'demo-p003'], logo: '', description: 'A fictional Karachi side built around quick passing and a shared love of the game.', stats: { Played: 12, Won: 7, Drawn: 2, Lost: 3 }, matches: [{ date: '2026-09-18', opponent: 'Coast United', result: '3–2', outcome: 'Win' }, { date: '2026-09-11', opponent: 'Demo visiting side', result: '1–1', outcome: 'Draw' }] },
  { id: 'demo-creek', name: 'Creek Cricket Club', sport: 'Cricket', captainId: 'demo-p002', members: ['demo-p002', 'demo-p001'], logo: '', description: 'A demo cricket club that values patient partnerships and a good team spirit.', stats: { Played: 10, Won: 6, Lost: 4 }, matches: [{ date: '2026-09-19', opponent: 'Falcons Cricket', result: 'Won by 12 runs', outcome: 'Win' }] },
  { id: 'demo-coast', name: 'Coast United', sport: 'Football', captainId: 'demo-p004', members: ['demo-p004', 'demo-p005'], logo: '', description: 'A fictional football team that keeps things simple: show up, play together, enjoy the match.', stats: { Played: 12, Won: 6, Drawn: 1, Lost: 5 }, matches: [{ date: '2026-09-18', opponent: 'Harbour Athletic', result: '2–3', outcome: 'Loss' }] },
  { id: 'demo-falcons', name: 'Falcons Cricket', sport: 'Cricket', captainId: 'demo-p005', members: ['demo-p005', 'demo-p003'], logo: '', description: 'An illustrative cricket squad with a positive approach to every over.', stats: { Played: 10, Won: 5, Lost: 5 }, matches: [{ date: '2026-09-19', opponent: 'Creek Cricket Club', result: 'Lost by 12 runs', outcome: 'Loss' }] }
];

export const playerMatches = {
  Football: [{ date: '2026-09-18', label: 'Demo five-a-side match', detail: 'Appearance · illustrative record' }, { date: '2026-09-11', label: 'Demo friendly', detail: 'Appearance · illustrative record' }],
  Cricket: [{ date: '2026-09-19', label: 'Demo indoor cricket match', detail: 'Appearance · illustrative record' }, { date: '2026-09-12', label: 'Demo friendly', detail: 'Appearance · illustrative record' }]
};

export const footballPositions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
export const cricketRoles = ['Batsman', 'Bowler', 'All-rounder', 'Wicketkeeper'];
export function initials(name) { return name.trim().split(/\s+/).map(word => word[0]).slice(0, 2).join('').toUpperCase(); }
export function filterPlayers(players, { query = '', sport = 'All', position = '', role = '' }) {
  const term = query.trim().toLowerCase();
  return players.filter(player => (!term || `${player.name} ${player.id}`.toLowerCase().includes(term))
    && (sport === 'All' || (sport === 'Both' ? player.sports.length === 2 : player.sports.includes(sport)))
    && (!position || player.positions.includes(position)) && (!role || player.role === role));
}
