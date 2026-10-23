/* Local Chrome CDP checks; launch isolated Chrome on port 9223 and the app on 3001. */
const fs=require('node:fs');
async function connect() {
 const pages=await(await fetch('http://127.0.0.1:9223/json')).json();
 const page=pages.find(p=>p.type==='page'&&!p.url.startsWith('chrome-extension:'));
 const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let id=0;const pending=new Map(),errors=[];
 ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text+': '+m.params.exceptionDetails.exception?.description);});
 const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value;};
 await send('Runtime.enable');await send('Page.enable');
 const settle=()=>evaluate(`new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(true))))`);
 const wait=async expression=>{for(let n=0;n<100;n++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,50));}throw Error('Timeout: '+expression);};
 const go=async path=>{await evaluate(`history.pushState({},'',${JSON.stringify(path)});window.dispatchEvent(new PopStateEvent('popstate'))`);await wait(`document.querySelector('main') && !document.querySelector('.route-loading')`);await settle();};
 return {send,evaluate,settle,wait,go,errors,close:()=>ws.close()};
}
module.exports={connect};

if(require.main===module)(async()=>{
 const b=await connect();const origin=process.env.QA_ORIGIN||'http://127.0.0.1:3001';
 try {
 await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await b.send('Page.navigate',{url:origin+'/account?mode=access'});await b.wait(`!!document.querySelector('#existing-player')`);
 await b.evaluate(`document.querySelector('#existing-player').closest('form').requestSubmit()`);await b.wait(`!!document.querySelector('.account-identity')`);
 const routes=['/','/players','/players/demo-p001','/players/demo-p003','/teams','/teams/demo-harbour','/teams/demo-creek','/matches','/rankings','/rankings?sport=Cricket','/leaderboards?period=all','/leaderboards?period=all&metric=assists','/leaderboards?period=all&sport=Cricket','/leaderboards?period=all&sport=Cricket&metric=wickets','/rivalries','/rivalries/demo-harbour-coast','/rivalries/demo-creek-falcons','/account','/account/profile','/account/edit','/account/teams','/account/bookings','/account/matches','/account/statistics','/account/invitations','/account/settings','/teams/create','/booking','/challenges','/inbox',...['Overview','Players','Join Requests','Invitations','Team Settings'].map(tab=>'/teams/demo-harbour/manage?tab='+encodeURIComponent(tab))];
 for(const sport of ['Football','Cricket']) {await b.go('/matches?sport='+sport);await b.settle();const links=await b.evaluate(`Array.from(document.querySelectorAll('main a[href^="/matches/"]'),a=>a.getAttribute('href'))`);routes.push(...links.filter(link=>!routes.includes(link)));}
 const widths=process.argv.includes('--matrix')?[320,375,390,430,768,1024,1440,1920]:[390,1440];
 const failures=[];let checked=0;
 for(const theme of ['light','dark']) {
   await b.go('/account/settings');await b.evaluate(`var themeSelect=document.querySelector('main .theme-toggle');themeSelect.value=${JSON.stringify(theme)};themeSelect.dispatchEvent(new Event('change',{bubbles:true}));`);await b.settle();
   for(const width of widths) {
    await b.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    for(const route of routes) {
      await b.go(route);await b.settle();
      const result=await b.evaluate(`(()=>{const width=document.documentElement.clientWidth; const overflow=document.documentElement.scrollWidth>width+1;const bad=overflow?Array.from(document.querySelectorAll('main *,header *,footer *')).filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>width+1&&!e.closest('.sports-table-scroll,.journey-steps')}).slice(0,6).map(e=>e.className||e.tagName):[];const scene=document.querySelector('.account-layout .card-scene-wrap'),details=document.querySelector('.account-profile-details');let overlap=false;if(scene&&details){const a=scene.getBoundingClientRect(),d=details.getBoundingClientRect();overlap=a.left<d.right&&a.right>d.left&&a.top<d.bottom&&a.bottom>d.top;}return {overflow,bad,overlap,theme:document.documentElement.dataset.theme};})()`);
      checked++;
      if(result.overflow||result.overlap||result.theme!==theme)failures.push({route,width,theme,...result});
    }
    console.log(`Checked ${theme} ${width}px (${routes.length} routes; ${failures.length} issues so far)`);
   }
 }
 const shotDir=require('node:path').join(require('node:os').tmpdir(),'legends-ui-polish-shots');fs.mkdirSync(shotDir,{recursive:true});
 for(const width of [390,1440])for(const route of ['/account/profile','/leaderboards?period=all','/leaderboards?sport=Cricket&period=all&metric=wickets']){
  await b.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await b.go(route);await b.settle();const shot=await b.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});fs.writeFileSync(require('node:path').join(shotDir,`${width}-${route.includes('profile')?'profile':route.includes('Cricket')?'wickets':'goals'}.png`),Buffer.from(shot.data,'base64'));
 }
 console.log(JSON.stringify({checked,failures,runtimeErrors:b.errors,screenshots:shotDir},null,2));
 if(failures.length||b.errors.length)process.exitCode=1;
 }finally{b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
