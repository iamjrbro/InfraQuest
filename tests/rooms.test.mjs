import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../server.mjs';

test('Salas independentes, ID de time, presença, anfitrião e robô',async()=>{
 const dataDir=await mkdtemp(join(tmpdir(),'nexus-rooms-'));let clock=Date.now();
 const origin='http://127.0.0.1:4192',app=await createApp({port:4192,origin,dataDir,clock:()=>clock});await new Promise(r=>app.server.listen(4192,'127.0.0.1',r));
 const cookies=[];
 async function req(i,path,b){const r=await fetch(origin+path,{method:b?'POST':'GET',headers:{...(cookies[i]?{Cookie:cookies[i]}:{}),...(b?{Origin:origin,'X-Infraquest':'1','Content-Type':'application/json'}:{})},body:b?JSON.stringify(b):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')}}
 try{
 for(let i=0;i<4;i++){const r=await req(i,'/api/register',{username:'player'+i,email:`player${i}@example.invalid`,password:'Room-testing-password!'});assert.equal(r.status,201);cookies[i]=r.cookie.split(';')[0];await req(i,'/api/profile',{profile:{name:'Pessoa '+i,gender:i%2?'masculine':'feminine',outfit:i%2?'pilot':'pleats',ready:true}})}
 const a=await req(0,'/api/rooms/create',{name:'Nuvem A',world:'clouds'}),b=await req(1,'/api/rooms/create',{name:'Nuvem B',world:'aurora'});assert.equal(a.status,201);assert.equal(b.status,201);assert.notEqual(a.data.play.room.id,b.data.play.room.id);
 assert.equal((await req(2,'/api/rooms/join',{code:'00000000'})).status,404);
 const joined=await req(2,'/api/rooms/join',{code:a.data.play.room.id.toLowerCase()});assert.equal(joined.status,200);assert.equal(joined.data.play.room.members.length,2);assert.equal(joined.data.user.world,'clouds');
 assert.equal((await req(1,'/api/play/state')).data.play.room.members.length,1);
 assert.equal((await req(2,'/api/world',{world:'raios'})).status,403);
 assert.equal((await req(0,'/api/world',{world:'nimbus'})).status,200);assert.equal((await req(2,'/api/me')).data.user.world,'nimbus');
 assert.equal((await req(2,'/api/play/move',{x:990,y:220})).status,400);
 clock+=1500;const moved=await req(2,'/api/play/move',{x:590,y:475});assert.equal(moved.status,200);const peer=(await req(0,'/api/play/state')).data.play.room.members.find(m=>!m.me);assert.equal(peer.x,590);assert.equal(peer.y,475);assert.equal(peer.profile.outfit,'pleats');
 assert.equal((await req(0,'/api/rooms/leave',{})).status,200);assert.equal((await req(2,'/api/play/state')).data.play.room.isHost,true);
 assert.equal((await req(0,'/api/play/state')).data.play.room,undefined);
 const solo=await req(3,'/api/play/mode',{mode:'robot',difficulty:'easy'});assert.equal(solo.data.play.robot.score,0);clock+=100*60000;const bot=(await req(3,'/api/play/state')).data.play.robot;assert.equal(bot.winner,'robot');assert.ok(bot.score>=250);assert.equal((await req(3,'/api/me')).data.user.points,0);
 const uid=app.db.prepare('SELECT id FROM users WHERE username=?').get('player3').id;app.db.prepare('UPDATE play_modes SET human=250,winner=? WHERE uid=?').run('human',uid);assert.equal((await req(3,'/api/play/state')).data.play.robot.winner,'human');
 console.log('Multijogador real validado com quatro contas e duas salas isoladas.');
 }finally{await app.close();await rm(dataDir,{recursive:true,force:true})}
});
