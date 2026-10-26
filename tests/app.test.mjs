import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../server.mjs';
import {worlds,questions} from '../questions.mjs';
import {solutions} from './practical-solutions.mjs';

test('Campanha, contas, identidade, saldo, resgates e aprovação',async()=>{
 const dataDir=await mkdtemp(join(tmpdir(),'infraquest-test-'));
 let clock=Date.now();const origin='http://127.0.0.1:4191',app=await createApp({port:4191,origin,dataDir,clock:()=>clock});
 await new Promise(r=>app.server.listen(4191,'127.0.0.1',r));
 let cookie='';
 async function request(path,body,session=cookie,extra={}){const r=await fetch(origin+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json','X-Infraquest':'1',Origin:origin}:{}),...(session?{Cookie:session}:{}),...extra},body:body?JSON.stringify(body):undefined,redirect:'manual'});let data;try{data=await r.json()}catch{data={}}return {r,data}}
 try{
 assert.equal(questions.length,120);assert.equal(new Set(questions.map(q=>q.id)).size,120);assert.equal(worlds.length,6);assert.ok(worlds.every(w=>questions.filter(q=>q.world===w.id).length===20));
 assert.equal((await request('/api/mission')).r.status,401);
 assert.equal((await request('/api/register',{username:'explorer',email:'test@example.invalid',password:'short'})).r.status,400);
 const reg=await request('/api/register',{username:'explorer',email:'test@example.invalid',password:'A-test-password-2026!'});
 assert.equal(reg.r.status,201);assert.match(reg.r.headers.get('set-cookie'),/HttpOnly/);cookie=reg.r.headers.get('set-cookie').split(';')[0];
 const stored=app.db.prepare('SELECT * FROM users WHERE username=?').get('explorer');assert.notEqual(stored.password,'A-test-password-2026!');assert.equal(stored.password.length,128);
 assert.equal((await request('/api/register',{username:'EXPLORER',email:'test2@example.invalid',password:'A-test-password-2026!'})).r.status,409);
 assert.equal((await request('/api/profile',{profile:{name:'Ayla',gender:'feminine',outfit:'dress',skin:'#764630',hair:'braids',ready:true}})).r.status,200);
 assert.equal((await request('/api/me')).data.user.profile.outfit,'dress');
 assert.equal((await request('/api/play/mode',{mode:'robot',difficulty:'easy'})).data.play.mode,'robot');
 assert.equal((await request('/api/world',{world:'nimbus'})).data.user.world,'nimbus');
 assert.equal((await request('/api/world',{world:'fake'})).r.status,400);
 assert.equal((await request('/api/mission?world=raios&id=raios-20')).r.status,403);
 assert.equal((await request('/api/redeem',{reward:'water',points:99999})).r.status,400);
 assert.equal((await request('/api/profile',{profile:{name:'Ayla',ready:true}},cookie,{Origin:'https://attacker.invalid'})).r.status,403);
 async function moveSignal(signals){const p=(await request('/api/play/state')).data.play.position;clock+=100;return request('/api/play/move',{x:p.x,y:p.y,...signals})}
 async function travel(target,signals={}){let p=(await request('/api/play/state')).data.play.position;while(Math.hypot(p.x-target.x,p.y-target.y)>1){const distance=Math.hypot(p.x-target.x,p.y-target.y),step=Math.min(distance,180);clock+=1500;const r=await request('/api/play/move',{x:p.x+(target.x-p.x)/distance*step,y:p.y+(target.y-p.y)/distance*step,...signals});assert.equal(r.r.status,200,JSON.stringify(r.data));p=r.data.play.position}}
 async function explore(q){let s=(await request('/api/me')).data.user;if(s.world!==q.world)await request('/api/world',{world:q.world});let t=(await request('/api/play/state')).data.play.trail;if(t.phase==='lore'){await travel(t.spirit);const lore=await request('/api/play/lore',{});assert.equal(lore.r.status,200);t=lore.data.play.trail}if(t.phase==='collect'){for(const star of t.stars){let latest=(await request('/api/play/state')).data.play.trail;if(latest.collected.includes(star.id))continue;if(t.mechanic.type==='locks')await travel(latest.mechanic.keys[star.id]);await travel(star,t.mechanic.type==='fog'?{interact:true}:{});for(let i=0;i<4;i++){latest=(await request('/api/play/state')).data.play.trail;if(latest.collected.includes(star.id))break;const r=await moveSignal(t.mechanic.type==='electric'?{jump:true}:{interact:true});assert.equal(r.r.status,200)}}}t=(await request('/api/play/state')).data.play.trail;assert.equal(t.phase,'ready');await travel(t.portal)}
 let total=0;
 for(const q of questions){await explore(q);const r=await request(`/api/mission?world=${q.world}`);assert.equal(r.data.question.id,q.id);assert.equal(r.data.question.correct,undefined);const practical=!!r.data.question.activity,payload=practical?{submission:solutions[q.id]}:{answer:r.data.question.choices.indexOf(q.choices[q.correct])};if(practical){assert.equal(r.data.question.choices,undefined);assert.equal(r.data.question.activity.check,undefined)}if(total===0){for(let i=0;i<2;i++){const wrong=await request('/api/answer',{id:q.id,submission:{command:'chmod 777 deploy.sh'}});assert.equal(wrong.data.correct,false);assert.equal(wrong.data.user.points,0);if(i===1)assert.ok(wrong.data.hint)}}const answer=await request('/api/answer',{id:q.id,...payload});assert.equal(answer.data.correct,true,q.id);total+=25;assert.equal(answer.data.user.points,total);assert.equal(answer.data.user.play.trail.phase,'lore');const repeat=await request('/api/answer',{id:q.id,...payload});assert.equal(repeat.data.earned,0);assert.equal(repeat.data.user.points,total);if(q.stage<20)assert.equal((await request(`/api/mission?world=${q.world}`)).r.status,409)}
 assert.equal(total,3000);assert.equal((await request('/api/me')).data.user.xp,12000);
 const water=await request('/api/redeem',{reward:'water'});assert.equal(water.r.status,201);assert.equal(water.data.user.points,2700);assert.equal(water.data.user.claims[0].status,'pending');
 assert.equal((await request('/api/redeem',{reward:'water'})).r.status,409);
 assert.equal((await request('/api/admin/requests')).r.status,403);
 app.db.prepare('INSERT INTO admins VALUES(?)').run(stored.id);
 assert.equal((await request('/api/admin/decide',{id:water.data.receipt,status:'rejected'})).r.status,200);assert.equal((await request('/api/me')).data.user.points,3000);
 const water2=await request('/api/redeem',{reward:'water'});assert.equal((await request('/api/admin/decide',{id:water2.data.receipt,status:'approved'})).r.status,200);
 assert.equal((await request('/api/cancel',{id:water2.data.receipt})).r.status,400);
 assert.equal((await request('/api/admin/decide',{id:water2.data.receipt,status:'delivered'})).r.status,200);
 assert.equal((await request('/api/admin/decide',{id:water2.data.receipt,status:'rejected'})).r.status,409);
 const meal=await request('/api/redeem',{reward:'meal'});assert.equal(meal.r.status,201);
 const off=await request('/api/redeem',{reward:'dayoff'});assert.equal(off.r.status,201);assert.equal(off.data.user.points,200);
 assert.equal((await request('/api/cancel',{id:off.data.receipt})).data.user.points,2200);
 const other=await request('/api/register',{username:'another',email:'other@example.invalid',password:'Another-test-password!'},'');const otherCookie=other.r.headers.get('set-cookie').split(';')[0];
 assert.equal((await request('/api/me',null,otherCookie)).data.user.points,0);assert.equal((await request('/api/cancel',{id:meal.data.receipt},otherCookie)).r.status,400);assert.equal((await request('/api/admin/requests',null,otherCookie)).r.status,403);
 assert.equal((await request('/api/login',{login:'explorer',password:'wrong-password'})).r.status,401);
 assert.equal((await request('/api/login',{login:'test@example.invalid',password:'A-test-password-2026!'})).r.status,200);
 assert.equal((await request('/api/logout',{})).r.status,200);assert.equal((await request('/api/me')).data.user,null);
 console.log('120 fases, 3000 pontos, isolamento de contas, revisão sem duplicação, saldo e aprovação validados.');
 }finally{await app.close();await rm(dataDir,{recursive:true,force:true})}
});
