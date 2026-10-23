const assert=require('node:assert/strict');
module.exports=function verifyLeaderboards(){
 const {initialCommunity}=require('./state/communityReducer.jsx');
 const {leaderboard,leaderboardTeams}=require('./data/sportsStatistics.jsx');
 const {completedMatches,appearances,monthKey}=require('./data/matches.jsx');
 const {teams,players,matches}=initialCommunity();
 for(const [sport,metric] of [['Football','goals'],['Football','assists'],['Cricket','runs'],['Cricket','wickets']])for(const period of ['all','month']){
  const eligible=completedMatches(matches,sport,period,monthKey());
  const rows=leaderboard(matches,players,sport,metric,period,monthKey());
  for(const row of rows){
   const played=appearances(eligible,row.player.id,sport);
   const independentlyCounted=played.reduce((total,match)=>total+(sport==='Football'?match.football.events.filter(e=>e.type==='Goal'&&e[metric==='goals'?'playerId':'assistId']===row.player.id).length:match.cricket.innings.reduce((n,i)=>n+(metric==='runs'?i.batters:i.bowlers).filter(r=>r.playerId===row.player.id).reduce((n,r)=>n+r[metric],0),0)),0);
   assert.equal(row[metric],independentlyCounted,`${sport} ${metric} ${row.player.id}`);
  }
  const sorted=[...rows].sort((a,b)=>b[metric]-a[metric]||a.player.name.localeCompare(b.player.name));assert.deepEqual(rows.map(r=>r.player.id),sorted.map(r=>r.player.id));
  rows.forEach((row,index)=>assert.equal(row.rank,index&&row[metric]===rows[index-1][metric]?rows[index-1].rank:index+1));
 }
 const fb=matches.find(m=>m.status==='Completed'&&m.sport==='Football');
 const fixture={...fb,football:{...fb.football,events:[{type:'Goal',playerId:'demo-p001',assistId:'demo-p004'},{type:'Goal',playerId:'demo-p001',assistId:'demo-p004'}]}};
 assert.equal(leaderboard([fixture],players,'Football','goals','all')[0].player.id,'demo-p001');
 assert.equal(leaderboard([fixture],players,'Football','assists','all')[0].player.id,'demo-p004');
 const cr=matches.find(m=>m.status==='Completed'&&m.sport==='Cricket'&&m.cricket.innings.length);
 const innings={batters:[{playerId:'demo-p001',runs:50,balls:25,fours:2,sixes:1},{playerId:'demo-p002',runs:10,balls:10,fours:0,sixes:0}],bowlers:[{playerId:'demo-p001',wickets:0,balls:12,runs:10},{playerId:'demo-p002',wickets:4,balls:12,runs:10}]};
 const cricket={...cr,cricket:{...cr.cricket,innings:[innings]}};
 assert.equal(leaderboard([cricket],players,'Cricket','runs','all')[0].player.id,'demo-p001');
 assert.equal(leaderboard([cricket],players,'Cricket','wickets','all')[0].player.id,'demo-p002');
 const multi=[...teams,{...teams[0],id:'test-other',members:['demo-p001']}];assert.equal(leaderboardTeams(multi,'demo-p001','Football').length,2);assert.equal(leaderboardTeams(teams,'missing','Football').length,0);
 console.log('PASS: independent goals/assists/runs/wickets totals, ordering, ties, monthly/all-time periods, intentionally different category leaders, multiple/no team membership.');
};
