/* Real DOM/keyboard checks in an isolated local Chrome profile; no external services. */
const assert=require('node:assert/strict');
const {connect}=require('./verify-responsive.cjs');
(async()=>{
 const b=await connect();
 const click=async label=>{await b.evaluate(`(()=>{const target=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(label)});if(!target)throw Error('Button missing: '+${JSON.stringify(label)});target.focus();target.click();})()`);await b.settle();};
 const geometry=async()=>{const r=await b.evaluate(`({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth})`);assert(r.scroll<=r.width+1);};
 try{
 await b.send('Page.navigate',{url:(process.env.QA_ORIGIN||'http://127.0.0.1:3001')+'/account?mode=access'});await b.wait(`!!document.querySelector('#existing-player')`);await b.evaluate(`document.querySelector('#existing-player').closest('form').requestSubmit()`);await b.wait(`!!document.querySelector('.account-identity')`);
 await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await b.send('Emulation.setDeviceMetricsOverride',{width:320,height:800,deviceScaleFactor:1,mobile:false});
 for(const theme of ['light','dark']){
  await b.go('/account/settings');await b.evaluate(`var choice=document.querySelector('main .theme-toggle');choice.value=${JSON.stringify(theme)};choice.dispatchEvent(new Event('change',{bubbles:true}))`);await b.settle();
  await b.go('/leaderboards?period=all');
  for(const [sport,category,metric] of [['Football','Goals','goals'],['Football','Assists','assists'],['Cricket','Runs','runs'],['Cricket','Wickets','wickets']]){
   await click(sport);await click(category);await geometry();
   const result=await b.evaluate(`({title:document.querySelector('#leaderboard-title').textContent,rows:[...document.querySelectorAll('.leaderboard-row')].map(e=>({metric:e.dataset.metric,value:Number(e.dataset.value),player:!!e.querySelector('a[href^="/players/"]'),avatar:!!e.querySelector('img.player-avatar'),team:!!e.querySelector('a[href^="/teams/"] .team-logo')||!!e.querySelector('.leaderboard-independent')}))})`);
   assert(result.title.includes(sport+' '+category));assert(result.rows.length);result.rows.forEach((r,i)=>{assert.equal(r.metric,metric);assert(r.player&&r.avatar&&r.team);if(i)assert(result.rows[i-1].value>=r.value);});
   const contrast=await b.evaluate(`(()=>{const rgb=s=>(s.match(/[\\d.]+/g)||[]).slice(0,3).map(Number);const lum=rgb=>rgb.map(c=>c/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((n,c,i)=>n+c*[.2126,.7152,.0722][i],0);return [...document.querySelectorAll('.leaderboard-row strong,.leaderboard-row small,.leaderboard-team-label,.leaderboard-stat > span')].map(e=>{let p=e,bg='rgba(0, 0, 0, 0)';while(p&&bg==='rgba(0, 0, 0, 0)'){bg=getComputedStyle(p).backgroundColor;p=p.parentElement;}const a=lum(rgb(getComputedStyle(e).color)),b=lum(rgb(bg));return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);});})()`);
   assert(contrast.every(r=>r>=4.5),'Leaderboard text contrast');
  }
 }
 await b.go('/account/profile');await geometry();assert(await b.evaluate(`document.querySelector('.card-scene-wrap').getBoundingClientRect().width <= document.querySelector('.account-card-column').getBoundingClientRect().width+1`));
 // Browser-dispatched error exercises the component's fallback, without changing shared records.
 await b.evaluate(`document.querySelector('.account-profile-details .player-avatar').dispatchEvent(new Event('error'))`);await b.settle();assert(await b.evaluate(`document.querySelector('.account-profile-details .player-avatar').src.startsWith('data:image/svg+xml')`));
 assert(await b.evaluate(`document.querySelector('.card-controls .text-button').disabled`));
 await b.evaluate(`document.querySelector('.menu-toggle').focus();document.querySelector('.menu-toggle').click()`);await b.settle();assert(await b.evaluate(`document.querySelector('.navigation').classList.contains('is-open')`));
 await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await b.settle();assert(await b.evaluate(`document.activeElement===document.querySelector('.menu-toggle')&&!document.querySelector('.navigation').classList.contains('is-open')`));
 await b.go('/teams/demo-harbour/manage?tab=Players');await click('Remove Player');
 assert(await b.evaluate(`(()=>{const d=document.querySelector('dialog');const r=d.getBoundingClientRect();return d.open&&d.contains(document.activeElement)&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;})()`));
 await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});assert(await b.evaluate(`document.querySelector('dialog').contains(document.activeElement)`));
 await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await b.settle();assert(await b.evaluate(`!document.querySelector('dialog')&&document.activeElement.textContent==='Remove Player'`));
 await b.go('/inbox');await b.evaluate(`document.querySelector('.conversation-list > button').click()`);await b.settle();assert(await b.evaluate(`document.querySelector('.captain-inbox').classList.contains('conversation-is-open')`));await click('← Conversations');assert(await b.evaluate(`!document.querySelector('.captain-inbox').classList.contains('conversation-is-open')`));await geometry();
 await b.go('/booking');await click('Continue ↗');await b.evaluate(`document.querySelector('input[name=slot]:not(:disabled)').click()`);await b.settle();await click('Continue ↗');
 await b.evaluate(`document.querySelector('.team-option').click()`);await b.settle();await click('Continue ↗');await b.evaluate(`document.querySelector('.team-option').click()`);await b.settle();await click('Continue ↗');await geometry();await click('Submit demo request ↗');assert(await b.evaluate(`document.querySelector('main').textContent.includes('Your game plan is ready.')`));
 await b.go('/teams/create');
 await b.evaluate(`var nameInput=document.querySelector('input[name=name]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(nameInput,'Browser QA Team');nameInput.dispatchEvent(new Event('input',{bubbles:true}));`);
 const doc=await b.send('DOM.getDocument');const fileInput=await b.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'input[type=file]'});
 await b.send('DOM.setFileInputFiles',{nodeId:fileInput.nodeId,files:[require('node:path').join(__dirname,'assets/players/ayaan.jpg')]});
 await b.wait(`!!document.querySelector('.upload-preview img') && !document.querySelector('button[type=submit]').disabled`);
 await b.evaluate(`document.querySelector('main form').requestSubmit()`);await b.wait(`!!document.querySelector('.team-created')`);
 assert(await b.evaluate(`!!document.querySelector('.team-created img.team-logo')`));
 await b.evaluate(`document.querySelector('.team-created img.team-logo').dispatchEvent(new Event('error'))`);await b.settle();assert(await b.evaluate(`!!document.querySelector('.team-created .team-logo.monogram')`));
 await b.go('/account/settings');await click('Exit Demo Account');await b.go('/booking');assert(await b.evaluate(`document.querySelector('main').textContent.includes('Create or access your player account')`));
 for(const route of ['/account','/login','/register'])for(const width of [320,375,390,430,768,1024,1440,1920]){await b.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await b.go(route);await geometry();}
 assert.deepEqual(b.errors,[]);
 console.log('PASS: real Chrome metric controls/sorting/links and text contrast in both themes; avatar fallback, real logo upload and failed-logo monogram; profile containment; reduced-motion control; mobile menu Escape/focus; dialog Tab/Escape/focus; inbox back; full captain booking; visitor gate and account aliases at eight widths.');
 }finally{b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
