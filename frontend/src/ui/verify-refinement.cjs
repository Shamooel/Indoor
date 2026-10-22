/* Run: node frontend/src/ui/verify-refinement.cjs. No added test dependencies. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
async function main() {
  const babel = await import('@babel/core');
  require.extensions['.css'] = () => {};
  require.extensions['.jsx'] = (module, filename) => {
    const source = fs.readFileSync(filename,'utf8').replaceAll('import.meta.url',JSON.stringify(pathToFileURL(filename).href));
    module._compile(babel.transformSync(source,{ filename,configFile:false,babelrc:false,presets:[[require.resolve('@babel/preset-env'),{targets:{node:'current'},modules:'commonjs'}],[require.resolve('@babel/preset-react'),{runtime:'classic'}]] }).code,filename);
  };
  const { initialCommunity, communityReducer:r } = require('./state/communityReducer.jsx');
  const { bookingErrors,profileErrors } = require('./state/accountActions.jsx');
  const { localDate,slotsForDate } = require('./data/booking.jsx');
  const { requiresAccount,safeNext } = require('./data/navigation.jsx');
  const { standings,leaderboard,profileStatistics,playerRecord } = require('./data/sportsStatistics.jsx');
  const { monthKey,ballsToOvers } = require('./data/matches.jsx');
  let state = initialCommunity();
  const initialMatches = state.matches;
  assert.equal(state.activePlayerId,null);
  for (const route of ['/booking','/booking/','/account/edit','/teams/create','/challenges','/inbox']) assert(requiresAccount(route));
  for (const route of ['/','/players','/teams','/matches','/rankings']) assert(!requiresAccount(route));
  assert.equal(safeNext('https://example.com'),'');assert.equal(safeNext('//example.com'),'');assert.equal(safeNext('/booking'),'/booking');
  const values = {sport:'Football',date:localDate(2),slot:slotsForDate(localDate(2)).find(s => s.available).time,teamId:'demo-harbour',opponentId:'demo-coast'};
  assert(bookingErrors(values,state,null).account);
  assert.equal(r(state,{type:'createBooking',values}).bookings.length,0);
  assert.equal(r(state,{type:'createTeam',values:{name:'Blocked',sport:'Football'}}).teams.length,state.teams.length);
  state = r(state,{type:'createAccount',values:{name:'Test Player',email:'player@example.test',sports:['Football','Cricket'],positions:['Midfielder'],role:'All-rounder',photo:'',password:'never-store-this',confirmPassword:'never-store-this'}});
  const id = state.activePlayerId;
  let actor = state.players.find(p => p.id === id);
  assert(actor);assert.equal(actor.name,'Test Player');assert(!JSON.stringify(state).includes('never-store-this'));assert(!('password' in actor));
  assert(profileErrors({...actor,email:'PLAYER@example.test'},state,null,true).email);
  const beforeEdit = state.players.length;
  state = r(state,{type:'editProfile',values:{...actor,name:'Updated Player',positions:['Forward','Midfielder']}});
  actor = state.players.find(p => p.id === id);
  assert.equal(actor.name,'Updated Player');assert.equal(state.players.length,beforeEdit);
  state = r(state,{type:'bookingDraft',values});
  const beforeTeams = state.teams.length;
  state = r(state,{type:'createTeam',values:{name:'Test United',sport:'Football',logo:''},forBooking:true});
  const own = state.teams.at(-1);
  assert.equal(state.teams.length,beforeTeams+1);assert.equal(own.captainId,id);assert.deepEqual(own.members,[id]);
  assert.equal(state.bookingDrafts[id].slot,values.slot);assert.equal(state.bookingDrafts[id].teamId,own.id);
  assert(profileErrors({...actor,sports:['Cricket']},state,actor).sports);
  const request = {...values,teamId:own.id};
  assert.equal(Object.keys(bookingErrors(request,state,actor)).length,0);
  for (const bad of [{opponentId:own.id},{opponentId:'invented-opponent'},{opponentId:'demo-creek'},{teamId:'demo-coast'},{date:'2026-02-31'},{date:localDate(-1)},{slot:'23:59'},{sport:'Tennis'}]) {
    const next = {...request,...bad};assert(Object.keys(bookingErrors(next,state,actor)).length);assert.equal(r(state,{type:'createBooking',values:next}).bookings.length,0);
  }
  state = r(state,{type:'createBooking',values:request});
  assert.equal(state.bookings.length,1);assert.equal(state.bookings[0].status,'Demo request');assert.equal(state.bookings[0].opponentStatus,'Not requested');
  assert.equal(state.matches,initialMatches);assert.equal(r(state,{type:'createBooking',values:request}).bookings.length,1);
  assert(slotsForDate(values.date).find(s => s.time === values.slot).available);
  state = r(state,{type:'exitAccount'});assert.equal(state.activePlayerId,null);assert.equal(state.bookings.length,1);
  state = r(state,{type:'switchPlayer',playerId:id});assert.equal(state.activePlayerId,id);
  // Membership permissions and invitation acceptance still use the same store.
  state = r(state,{type:'invite',teamId:own.id,playerId:'demo-p004'});
  const invitation = state.invitations.at(-1);
  const rejected = r(state,{type:'respondInvite',teamId:own.id,entryId:invitation.id,accept:true});
  assert(!rejected.teams.find(t => t.id === own.id).members.includes('demo-p004'));
  state = r(state,{type:'switchPlayer',playerId:'demo-p004'});
  state = r(state,{type:'respondInvite',teamId:own.id,entryId:invitation.id,accept:true});
  assert(state.teams.find(t => t.id === own.id).members.includes('demo-p004'));
  // Members may browse but only the selected team captain may submit.
  const member = state.players.find(p => p.id === state.activePlayerId);
  assert(bookingErrors({...request,date:localDate(3),slot:slotsForDate(localDate(3)).find(s => s.available).time},state,member).captain);
  assert.equal(r(state,{type:'createBooking',values:request}).bookings.length,1);
  state = r(state,{type:'request',teamId:'demo-harbour'});
  const join = state.requests.find(q => q.playerId === 'demo-p004' && q.teamId === 'demo-harbour' && q.status === 'pending');
  state = r(state,{type:'switchPlayer',playerId:'demo-p001'});
  state = r(state,{type:'respondRequest',teamId:'demo-harbour',entryId:join.id,accept:true});
  assert(state.teams.find(t => t.id === 'demo-harbour').members.includes('demo-p004'));
  const challengeValues = {fromTeamId:'demo-harbour',toTeamId:'demo-coast',sport:'Football',date:localDate(10),time:'17:00',message:'A demo friendly'};
  state = r(state,{type:'sendChallenge',values:challengeValues});const challenge = state.challenges.at(-1);
  state = r(state,{type:'switchPlayer',playerId:'demo-p004'});
  state = r(state,{type:'respondChallenge',challengeId:challenge.id,accept:true});
  assert.equal(state.challenges.at(-1).status,'accepted');assert.equal(state.matches,initialMatches);assert.equal(state.bookings.length,1);
  state = r(state,{type:'openConversation',fromTeamId:'demo-coast',toTeamId:'demo-harbour'});
  state = r(state,{type:'sendMessage',conversationId:state.inboxConversationId,fromTeamId:'demo-coast',text:'See you at the field'});
  assert.equal(state.conversations.find(t => t.id === state.inboxConversationId).messages.at(-1).text,'See you at the field');
  for (const sport of ['Football','Cricket']) {
    const all = standings(state.matches,state.teams,sport,'all'); const month = standings(state.matches,state.teams,sport,'month',monthKey());
    assert(all.reduce((n,r) => n+r.played,0) > month.reduce((n,r) => n+r.played,0));
    for (const row of all) assert.equal(row.points,sport === 'Football' ? row.won*3+row.drawn : row.won*2+row.tied+row.noResult);
    const ranked = leaderboard(state.matches,state.players,sport,sport === 'Football' ? 'goals' : 'runs','all');
    const metric = sport === 'Football' ? 'goals' : 'runs'; ranked.forEach((row,i) => {if(i) assert(ranked[i-1][metric] >= row[metric]);});
  }
  assert.equal(standings(state.matches,state.teams,'Football').find(r => r.team.id === own.id).played,0);
  assert.equal(profileStatistics(state.matches,actor,'Football').Appearances,0);
  for (const match of state.matches) for (const innings of match.cricket?.innings || []) {
    assert.equal(innings.runs,innings.batters.reduce((n,b) => n+b.runs,0)+innings.extras);
    assert.equal(innings.legalBalls,innings.bowlers.reduce((n,b) => n+b.balls,0));
    assert.equal(innings.wickets,innings.batters.filter(b => b.out).length);
    assert.equal(innings.runs,innings.bowlers.reduce((n,b) => n+b.runs,0));
  }
  assert.equal(ballsToOvers(28),'4.4');
  const midfielder = state.players.find(p => p.id === 'demo-p001');
  assert.equal(playerRecord(state.matches,{...midfielder,positions:['Goalkeeper']},'Football').cleanSheets,0);
  const keeper = state.players.find(p => p.id === 'demo-p003');
  assert.equal(playerRecord(state.matches,{...keeper,positions:['Forward']},'Football').cleanSheets,playerRecord(state.matches,keeper,'Football').cleanSheets);
  const { resolveRoute } = require('./Website.jsx');
  for (const route of ['/','/account','/account/edit','/account/profile','/account/teams','/account/bookings','/account/matches','/account/statistics','/account/invitations','/account/settings','/teams/demo-harbour/manage','/booking','/booking/','/login','/register','/players','/teams','/teams/create','/matches','/rankings','/leaderboards','/challenges','/inbox','/rivalries','/players/demo-p001','/teams/demo-harbour','/matches/demo-fb-live','/rivalries/demo-harbour-coast']) assert(resolveRoute(route).Page,route);
  assert(!resolveRoute('/unknown').Page);
  assert.equal(resolveRoute('/players/demo-p001').id,'demo-p001');
  assert.equal(resolveRoute('/login').Page,resolveRoute('/account').Page);
  assert.equal(resolveRoute('/register').Page,resolveRoute('/account').Page);

  // Render all page families for visitors and active sample/custom players.
  const React = require('react'); const {renderToStaticMarkup} = require('react-dom/server');
  const {CommunityContext} = require('./state/CommunityStore.jsx');
  let renders = 0;
  const renderedLinks = new Set();
  const render = (name,props={},current=state) => {
    const Page = require(`./${name}.jsx`).default;
    const value = {...current,activePlayer:current.players.find(p => p.id === current.activePlayerId),dispatch:()=>{}};
    const html = renderToStaticMarkup(React.createElement(CommunityContext.Provider,{value},React.createElement(Page,props)));
    assert(html.length > 80,name);
    for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) renderedLinks.add(match[1]);
    renders++;return html;
  };
  const visitor = {...state,activePlayerId:null};
  for (const name of ['Home','Players','Teams','Matches','Leaderboards','Rankings','Rivalries']) render(`pages/${name}`,{},visitor);
  for (const name of ['Matches','Leaderboards','Rankings']) render(`pages/${name}`,{search:'?sport=Cricket&period=all'},visitor);
  for (const name of ['Account','Booking','CreateTeam','Challenges','Inbox','EditProfile']) render(`pages/${name}`);
  render('pages/Account',{},visitor);render('pages/Account',{initialMode:'access',search:'?next=%2Fbooking'},visitor);
  for (const player of state.players) render('pages/PlayerProfile',{id:player.id},visitor);
  for (const team of state.teams) {render('pages/TeamProfile',{id:team.id},visitor);render('pages/TeamProfile',{id:team.id});}
  for (const match of state.matches) render('pages/MatchDetails',{id:match.id},visitor);
  for (const rivalry of state.rivalries) render('pages/HeadToHead',{id:rivalry.id},visitor);
  for (const page of ['PlayerProfile','TeamProfile','MatchDetails','HeadToHead']) render(`pages/${page}`,{id:'missing'},visitor);
  const dashboard = render('pages/Account',{}, {...state,activePlayerId:id});assert(dashboard.includes('Updated Player'));assert(dashboard.includes('/account/teams'));assert(!dashboard.includes('Captain Inbox')); assert(dashboard.includes('My Bookings'));
  for (const view of ['profile','teams','bookings','matches','statistics','invitations','settings']) {
    assert(requiresAccount(`/account/${view}`));assert(resolveRoute(`/account/${view}`).Page);
    render('pages/AccountPages',{view},{...state,activePlayerId:id});
    render('pages/AccountPages',{view});
  }
  for (const t of state.teams) {
    assert(requiresAccount(`/teams/${t.id}/manage`));assert(resolveRoute(`/teams/${t.id}/manage`).Page);
    const denied=render('pages/ManageTeam',{id:t.id},{...state,activePlayerId:id === t.captainId ? 'demo-p002' : id});assert(denied.includes('belongs to the team captain'));assert(!denied.includes('Save Team Settings'));
    for (const tab of ['Overview','Players','Join Requests','Invitations','Team Settings']) render('pages/ManageTeam',{id:t.id,search:'?tab='+encodeURIComponent(tab)},{...state,activePlayerId:t.captainId});
  }
  render('pages/ManageTeam',{id:'missing'});
  const regular={...state,activePlayerId:id};
  const noCaptain={...regular,teams:state.teams.filter(t => t.captainId !== id)};
  assert(!render('pages/Challenges',{},noCaptain).includes('challenge-form'));
  assert(!render('pages/Inbox',{},noCaptain).includes('captain-message'));
  const bookingsPage=render('pages/AccountPages',{view:'bookings'},regular);assert(bookingsPage.includes('Test United'));assert(bookingsPage.includes('Demo request'));
  // Role mutations use one shared roster and guard direct reducer calls.
  let memberState={...state,activePlayerId:'demo-p004'};
  assert.equal(r(memberState,{type:'editTeam',teamId:own.id,values:{name:'Illegal'}}).teams,memberState.teams);
  assert.equal(r(memberState,{type:'removeMember',teamId:own.id,playerId:id}).teams,memberState.teams);
  const left=r(memberState,{type:'leaveTeam',teamId:own.id});assert(!left.teams.find(t=>t.id===own.id).members.includes('demo-p004'));assert.equal(left.matches,state.matches);
  let captainState={...state,activePlayerId:id};
  assert.equal(r(captainState,{type:'leaveTeam',teamId:own.id}).teams,captainState.teams);
  assert.equal(r(captainState,{type:'removeMember',teamId:own.id,playerId:id}).teams,captainState.teams);
  const removed=r(captainState,{type:'removeMember',teamId:own.id,playerId:'demo-p004'});assert(!removed.teams.find(t=>t.id===own.id).members.includes('demo-p004'));
  const edited=r(captainState,{type:'editTeam',teamId:own.id,values:{name:'Renamed United',description:'Same shared roster',logo:''}});assert.equal(edited.teams.find(t=>t.id===own.id).name,'Renamed United');assert.equal(edited.teams.find(t=>t.id===own.id).captainId,id);assert.equal(edited.matches,state.matches);
  assert.equal(r(captainState,{type:'editTeam',teamId:own.id,values:{name:state.teams.find(t=>t.id==='demo-harbour').name}}).teams,captainState.teams);
  let pending=r({...left,activePlayerId:'demo-p004'},{type:'request',teamId:own.id});const pendingId=pending.requests.at(-1).id;
  assert.equal(r({...pending,activePlayerId:id},{type:'cancelRequest',teamId:own.id,entryId:pendingId}).requests,pending.requests);
  pending=r(pending,{type:'cancelRequest',teamId:own.id,entryId:pendingId});assert.equal(pending.requests.at(-1).status,'cancelled');
  assert.equal(r({...captainState,activePlayerId:null},{type:'removeMember',teamId:own.id,playerId:'demo-p004'}).teams,state.teams);
  const duplicate=r(captainState,{type:'invite',teamId:own.id,playerId:'demo-p004'});assert.equal(duplicate.invitations.length,captainState.invitations.length);
  const captainOnly={...state,activePlayerId:id,teams:state.teams.map(t=>t.id==='demo-coast'?{...t,captainId:id}:t)};
  const scopedChallenge={id:'scope-test',fromTeamId:own.id,toTeamId:'demo-coast',sport:'Football',date:localDate(10),time:'18:00',status:'pending'};
  const sentMarkup=render('components/ChallengeCard',{challenge:scopedChallenge,contextTeamId:own.id},captainOnly);assert(sentMarkup.includes('Cancel proposal'));assert(!sentMarkup.includes('Accept challenge'));
  const incomingMarkup=render('components/ChallengeCard',{challenge:scopedChallenge,contextTeamId:'demo-coast'},captainOnly);assert(incomingMarkup.includes('Accept challenge'));assert(!incomingMarkup.includes('Cancel proposal'));
  const otherContext=render('pages/Challenges',{search:`?from=${own.id}`},captainOnly);assert(!otherContext.includes('id="demo-challenge-1"'));
  const stale={...memberState,invitations:[...memberState.invitations,{id:'stale',teamId:own.id,playerId:'demo-p004',status:'pending'}],bookingDrafts:{'demo-p004':{teamId:own.id,opponentId:'demo-coast'}}};
  const cleaned=r(stale,{type:'leaveTeam',teamId:own.id});assert.equal(cleaned.invitations.at(-1).status,'cancelled');assert.equal(cleaned.bookingDrafts['demo-p004'].teamId,'');
  // Theme initialization, persistence, system updates and unavailable storage in a simulated DOM.
  const vm=require('node:vm');
  const themeCode=babel.transformSync(fs.readFileSync(path.join(__dirname,'state/theme.jsx'),'utf8'),{configFile:false,babelrc:false,presets:[[require.resolve('@babel/preset-env'),{targets:{node:'current'},modules:'commonjs'}]]}).code;
  function themeHarness(saved,dark,blocked=false) {
    const events={};const media={matches:dark,addEventListener:(type,fn)=>events.media=fn};const storage={value:saved,getItem(){if(blocked)throw Error();return this.value;},setItem(k,v){if(blocked)throw Error();this.value=v;}};
    const context={exports:{},require,document:{documentElement:{dataset:{},style:{}}},window:{localStorage:storage,matchMedia:()=>media,addEventListener:(type,fn)=>events[type]=fn}};
    vm.runInNewContext(themeCode,context);return {context,events,media,storage};
  }
  const first=themeHarness(null,true);assert.equal(first.context.document.documentElement.dataset.theme,'dark');first.events.media({matches:false});assert.equal(first.context.document.documentElement.dataset.theme,'light');
  first.context.exports.setTheme('dark');assert.equal(first.storage.value,'dark');first.events.media({matches:false});assert.equal(first.context.document.documentElement.dataset.theme,'dark');
  assert.equal(themeHarness(first.storage.value,false).context.document.documentElement.dataset.theme,'dark');
  assert.equal(themeHarness('light',true).context.document.documentElement.dataset.theme,'light');
  const blocked=themeHarness(null,true,true);blocked.context.exports.setTheme('light');assert.equal(blocked.context.document.documentElement.dataset.theme,'light');
  first.media.matches = true; first.context.exports.setTheme('system'); assert.equal(first.storage.value,'system'); assert.equal(first.context.document.documentElement.dataset.theme,'dark'); first.events.media({matches:false}); assert.equal(first.context.document.documentElement.dataset.theme,'light');
  assert.equal(themeHarness('system',true).context.document.documentElement.dataset.theme,'dark');
  first.events.storage({key:'legends-field-theme',newValue:'light'});assert.equal(first.context.document.documentElement.dataset.theme,'light');
  const gate = render('components/AccountGate',{next:'/booking'},visitor);assert(gate.includes('Create or access your player account to book a turf slot.'));assert(!gate.includes('name="slot"'));
  const nav = render('components/Navbar',{path:'/'},visitor);assert(nav.includes('My Account'));assert(!nav.includes('/login'));assert(!nav.includes('/register'));
  const card = render('components/PlayerCardExperience',{player:actor,sport:'Football',teamName:own.name});assert(card.includes('static-collectible'));assert(card.includes('Explore in 3D'));assert(!card.includes('<canvas'));
  // CSS syntax and source-level guardrails, not visual/browser assertions.
  const postcss = require('postcss');
  for (const name of fs.readdirSync(path.join(__dirname,'styles'))) if(name.endsWith('.css')) { const tree=postcss.parse(fs.readFileSync(path.join(__dirname,'styles',name),'utf8')); tree.walkRules(rule=>assert(rule.selector.trim(),`Empty CSS selector: ${name}`)); assert(tree.nodes.some(n=>n.name==='layer'),`Missing deterministic layer: ${name}`); }
  const css = fs.readFileSync(path.join(__dirname,'styles/refinement.css'),'utf8');assert(css.includes('prefers-reduced-motion'));assert(css.includes('max-width:600px'));assert(css.includes('max-width:900px'));
  const bookingSource = fs.readFileSync(path.join(__dirname,'pages/Booking.jsx'),'utf8');assert(!/Create Opponent|createOpponent/.test(bookingSource));
  for (const href of renderedLinks) if (href.startsWith('/')) {
    const url = new URL(href.replaceAll('&amp;','&'),'http://localhost');
    assert(resolveRoute(url.pathname).Page,`Broken internal route: ${href}`);
  }
  require('./verify-final.cjs')();
  const dist = path.resolve(__dirname,'../../dist');
  if (fs.existsSync(path.join(dist,'index.html'))) {
    const html = fs.readFileSync(path.join(dist,'index.html'),'utf8');
    const scripts = [...html.matchAll(/<script\b[^>]*src=(?:"([^"]+)"|([^\s>]+))/g)].map(m => m[1] || m[2]);
    assert(scripts.some(s => s.includes('runtime.')));
    assert(!scripts.some(s => s.includes('three-vendor')));
    let bytes=0;
    for (const script of scripts) { assert(/^\/[\w.-]+\.[a-f0-9]{8}\.js$/.test(script),script); bytes+=fs.statSync(path.join(dist,script.slice(1))).size; }
    console.log(`Production initial JavaScript: ${(bytes/1024).toFixed(2)} KiB. Hashed root assets and separate runtime verified; Three.js is not an entry script.`);
  }
  const httpArg = process.argv.find(a => a.startsWith('--http='));
  if (httpArg) {
    const origin = httpArg.slice(7);
    const paths = ['/','/account','/account?next=%2Fbooking','/account/edit','/account/profile','/account/teams','/account/bookings','/account/matches','/account/statistics','/account/invitations','/account/settings','/teams/demo-harbour/manage','/booking','/booking/','/login','/register','/players','/players/demo-p001','/players/unknown','/teams','/teams/create','/teams/demo-harbour','/matches','/matches/demo-fb-live','/matches/demo-cr-live','/rankings?sport=Cricket','/leaderboards?period=all','/challenges','/inbox','/rivalries','/rivalries/demo-harbour-coast','/unknown'];
    await Promise.all(paths.map(async route => { const response=await fetch(origin+route);assert.equal(response.status,200,route);assert((await response.text()).includes('id="root"'),route); }));
    const html=await (await fetch(origin)).text();
    const scripts=[...html.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(m => m[1]);
    assert(scripts.length>1);
    await Promise.all(scripts.map(async script => { const response=await fetch(origin+script);assert.equal(response.status,200,script);assert(/javascript/.test(response.headers.get('content-type')),script); }));
    console.log(`HTTP: ${paths.length} direct/query/nested/fallback routes return the app shell; ${scripts.length} initial JavaScript assets served correctly. This is not a browser interaction test.`);
  }
  console.log(`PASS: account, editing, visitor gate, own-team creation/selection, opponent validation, booking requests, memberships, captain challenges/messages, rankings and innings consistency. ${renders} page/component renders. CSS syntax and 2D fallback render passed.`);
}
main().catch(error => { console.error(error);process.exitCode=1; });

