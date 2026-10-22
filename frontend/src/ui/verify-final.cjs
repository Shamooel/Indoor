/* Isolated handler/hook regressions: no DOM, browser, image-decoding or GPU claims. */
const assert = require('node:assert/strict');
module.exports = function verifyFinal() {
  const React = require('react');
  const { initialCommunity,communityReducer:r } = require('./state/communityReducer.jsx');
  const { reduceAction } = require('./state/CommunityContext.jsx');
  const { historySports,personalFixtures,challengeLink,bookingLink,scheduleHandoff } = require('./data/journeys.jsx');
  const { appearances } = require('./data/matches.jsx');
  const { profileStatistics,leaderboard } = require('./data/sportsStatistics.jsx');
  const { localDate,slotsForDate } = require('./data/booking.jsx');
  let state=initialCommunity();
  // Removed current sports/positions never erase recorded participation or goalkeeper eligibility.
  const keeper=state.players.find(p=>p.id==='demo-p003');
  let keeperSession=r({...state,activePlayerId:keeper.id},{type:'leaveTeam',teamId:'demo-harbour'});
  keeperSession=r(keeperSession,{type:'editProfile',values:{...keeper,sports:['Cricket'],positions:[]}});
  assert.equal(keeperSession.noticeKind,'success'); assert.equal(keeperSession.matches,state.matches);
  assert.deepEqual(profileStatistics(keeperSession.matches,keeperSession.players.find(p=>p.id===keeper.id),'Football'),profileStatistics(state.matches,keeper,'Football'));
  const changed={...keeper,sports:['Cricket'],positions:[]};
  assert.deepEqual(profileStatistics(state.matches,keeper,'Football'),profileStatistics(state.matches,changed,'Football'));
  assert(historySports(state.matches,changed).includes('Football'));
  const before=leaderboard(state.matches,[keeper],'Football','cleanSheets','all');
  const after=leaderboard(state.matches,[changed],'Football','cleanSheets','all');
  assert(before.length>0); assert.equal(after.length,before.length);assert.equal(after[0].cleanSheets,before[0].cleanSheets);
  state=r(state,{type:'switchPlayer',playerId:'demo-p001'});
  state=r(state,{type:'invite',teamId:'demo-harbour',playerId:'demo-p006'});
  state=r(state,{type:'switchPlayer',playerId:'demo-p006'});
  state=r(state,{type:'request',teamId:'demo-coast'});
  const p=state.players.find(p=>p.id==='demo-p006');
  const updated=r(state,{type:'editProfile',values:{...p,sports:['Cricket'],positions:[]}});
  for(const key of ['invitations','requests']) {const entry=updated[key].find(e=>e.playerId===p.id);assert.equal(entry.status,'cancelled');assert(entry.reason.includes('sport removed'));}
  assert.equal(updated.matches,state.matches);
  const invalid=reduceAction({...state,activePlayerId:null},{type:'createTeam',values:{name:'Denied',sport:'Football'}});assert(!invalid.ok);assert(invalid.error);assert.equal(invalid.state.teams,state.teams);
  const valid=reduceAction({...state,noticeKind:'error',notice:'previous error',activePlayerId:'demo-p001'},{type:'openConversation',fromTeamId:'demo-harbour',toTeamId:'demo-coast'});assert(valid.ok);assert.equal(valid.state.inboxConversationId,'demo-conversation-football');
  const fixtureState=initialCommunity();
  for(const sport of ['Football','Cricket']) for(const status of ['Upcoming','Live','Completed','Postponed','Cancelled']) {
    const list=personalFixtures(fixtureState.matches,fixtureState.teams,'demo-p001',sport,status);
    for(const match of list) {assert.equal(match.sport,sport);assert(status==='Live'?['Live','Half-Time','Innings Break'].includes(match.status):match.status===status);}
  }
  const date=localDate(2),slot=slotsForDate(date).find(s=>s.available).time;
  const booking={teamId:'demo-harbour',opponentId:'demo-coast',date,slot};
  const params=new URL(challengeLink(booking),'http://demo').searchParams;
  assert.equal(params.get('from'),booking.teamId);assert.equal(params.get('opponent'),booking.opponentId);
  const carried=scheduleHandoff(params.get('date'),params.get('time'),'challenge');assert.equal(carried.date,date);assert.equal(carried.time,slot);
  const proposal={fromTeamId:booking.teamId,toTeamId:booking.opponentId,date,time:slot};
  const back=new URL(bookingLink(proposal,booking.opponentId),'http://demo').searchParams;
  assert.equal(back.get('from'),booking.opponentId);assert.equal(back.get('opponent'),booking.teamId);
  assert.equal(scheduleHandoff(back.get('date'),back.get('time'),'booking').time,slot);
  assert.equal(scheduleHandoff(date,'23:59','booking').time,'');assert(scheduleHandoff(date,'23:59','booking').message.includes('choose a new'));
  assert.equal(scheduleHandoff(localDate(-1),slot,'challenge').date,'');
  // Run the actual component event handlers with isolated hook storage, not a browser renderer.
  // React 19 test-only dispatcher: exercises handlers without mounting a DOM.
  const internals=React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  const previousDispatcher=internals.H;
  const original={};for(const key of ['useState','useRef','useEffect','useContext'])original[key]=React[key];
  const event={preventDefault(){}};
  function harness(Component,props,context) {
    const hooks=[];let cursor=0;
    return { render() {
      cursor=0;
      React.useState=initial=>{const index=cursor++;if(!(index in hooks))hooks[index]=typeof initial==='function'?initial():initial;return [hooks[index],value=>hooks[index]=typeof value==='function'?value(hooks[index]):value];};
      React.useRef=initial=>{const index=cursor++;return hooks[index]||(hooks[index]={current:initial});};
      React.useEffect=()=>{};React.useContext=()=>context;
      internals.H={useState:React.useState,useRef:React.useRef,useEffect:React.useEffect,useContext:React.useContext};
      return Component(props);
    }};
  }
  function nodes(tree,predicate) {
    const found=[];function walk(node){if(!node||typeof node!=='object')return;if(Array.isArray(node)){node.forEach(walk);return;}if(predicate(node))found.push(node);walk(node.props?.children);}walk(tree);return found;
  }
  const text=node=>Array.isArray(node)?node.map(text).join(''):typeof node==='string'?node:node?.props?text(node.props.children):'';
  try {
    const Account=require('./pages/Account.jsx').default, ImageUpload=require('./components/ImageUpload.jsx').default;
    const context={...initialCommunity(),activePlayer:null,dispatch:()=>({ok:false,error:'Rejected by reducer'})};
    const account=harness(Account,{},context);let tree=account.render();
    const change=(name,value)=>{const field=nodes(tree,n=>n.props?.name===name)[0];field.props.onChange({target:{name,value}});tree=account.render();};
    for(const [name,value] of Object.entries({name:'QA Player',email:'qa@example.test',password:'demo-only-password',confirmPassword:'demo-only-password'}))change(name,value);
    const submit=()=>{nodes(tree,n=>n.type==='form'&&n.props.noValidate)[0].props.onSubmit(event);tree=account.render();};
    submit();
    nodes(tree,n=>n.props?.setValues)[0].props.setValues(v=>({...v,sports:['Football'],positions:['Forward']}));tree=account.render();submit();
    let upload=nodes(tree,n=>n.type===ImageUpload)[0];
    const image=harness(ImageUpload,upload.props,context);let imageTree=image.render();
    nodes(imageTree,n=>n.props?.type==='file')[0].props.onChange({target:{files:[{type:'text/plain',size:5}]}});
    imageTree=image.render();assert(text(imageTree).includes('Choose a JPG'));tree=account.render();
    assert(nodes(tree,n=>n.type==='button'&&text(n).includes('Continue'))[0].props.disabled);
    nodes(tree,n=>n.type==='button'&&text(n).includes('Back'))[0].props.onClick();tree=account.render();
    assert(!nodes(tree,n=>n.type==='button'&&text(n).includes('Continue'))[0].props.disabled);
    submit();assert(nodes(tree,n=>n.type===ImageUpload).length===1);assert(nodes(tree,n=>n.type==='button'&&text(n).includes('Continue'))[0].props.disabled);
    nodes(imageTree,n=>n.type==='button'&&text(n).includes('Remove image'))[0].props.onClick();tree=account.render();
    assert(!nodes(tree,n=>n.type==='button'&&text(n).includes('Continue'))[0].props.disabled);
    // Pending status blocks both photo progression and review submission.
    nodes(tree,n=>n.type===ImageUpload)[0].props.onStatusChange(true);tree=account.render();assert(nodes(tree,n=>n.type==='button'&&text(n).includes('Continue'))[0].props.disabled);
    nodes(tree,n=>n.type===ImageUpload)[0].props.onStatusChange(false);tree=account.render();submit();submit();
    assert(nodes(tree,n=>n.props?.errors?.submit==='Rejected by reducer').length); // No redirect on failed create.
    const Booking=require('./pages/Booking.jsx').default;
    const bookingState={...initialCommunity(),activePlayerId:'demo-p001'};bookingState.activePlayer=bookingState.players[0];bookingState.bookingDrafts={'demo-p001':{sport:'Football',date,slot,teamId:'demo-harbour',opponentId:'demo-coast'}};bookingState.dispatch=action=>reduceAction(bookingState,action);
    const wizard=harness(Booking,{},bookingState);tree=wizard.render();
    for(let i=0;i<2;i++){nodes(tree,n=>n.type==='form'&&!n.props.noValidate)[0].props.onSubmit(event);tree=wizard.render();}
    nodes(tree,n=>n.type==='button'&&text(n).includes('Create My Team'))[0].props.onClick();tree=wizard.render();
    nodes(tree,n=>n.type===ImageUpload)[0].props.onStatusChange(true);tree=wizard.render();assert(nodes(tree,n=>n.type==='button'&&text(n).includes('Create & select'))[0].props.disabled);
    nodes(tree,n=>n.type==='button'&&text(n).includes('Cancel team creation'))[0].props.onClick();tree=wizard.render();
    nodes(tree,n=>n.type==='button'&&text(n).includes('Create My Team'))[0].props.onClick();tree=wizard.render();
    assert(!nodes(tree,n=>n.type==='button'&&text(n).includes('Create & select'))[0].props.disabled);assert.equal(bookingState.bookingDrafts['demo-p001'].slot,slot);
    const {MatchHistory}=require('./components/CommunityElements.jsx');
    const personal=appearances(fixtureState.matches,'demo-p001','Football');assert(personal.length>6);
    const history=harness(MatchHistory,{matches:personal},{teams:fixtureState.teams});tree=history.render();assert.equal(nodes(tree,n=>n.type==='li').length,6);
    nodes(tree,n=>n.type==='button'&&text(n).includes('View All History'))[0].props.onClick();tree=history.render();assert.equal(nodes(tree,n=>n.type==='li').length,personal.length);
    assert.deepEqual(nodes(tree,n=>n.type==='a').map(n=>n.props.href).sort(),personal.map(m=>'/matches/'+m.id).sort());
  } finally { Object.assign(React,original); internals.H=previousDispatcher; }
  console.log('PASS: final regressions — actual isolated upload/wizard handlers, reducer rejection feedback, sport-removal reconciliation, historical goalkeeper eligibility, contextual full history, fixture statuses, bidirectional schedule handoff. Browser behavior remains unverified.');
};
