import test from 'node:test';
import assert from 'node:assert/strict';
import {getPractical,publicPractical,practicalIds,enrichQuestions} from '../practical.mjs';
import {questions,worlds} from '../questions.mjs';
import {mechanicState,advanceMechanic} from '../mechanics.mjs';
import {drawMechanics} from '../public/world-mechanics.js';
import {solutions} from './practical-solutions.mjs';

test('18 laboratórios: soluções válidas, erros e dados públicos sem correção',()=>{
 assert.equal(practicalIds.length,18);assert.equal(enrichQuestions(questions).length,120);
 for(const id of practicalIds){const p=getPractical(id),pub=publicPractical(id);assert.equal(p.check(solutions[id]).correct,true,id);assert.equal(p.check({}).correct,false,id);assert.equal(pub.check,undefined);assert.equal(pub.hints,undefined);assert.equal(pub.explanation,undefined);assert.equal(typeof pub.title,'string')}
 assert.equal(getPractical('raios-1').check({command:'chmod 777 deploy.sh'}).correct,false);
 assert.equal(getPractical('raios-1').check({command:'chmod u+x deploy.sh; rm -rf /'}).correct,false);
 assert.equal(getPractical('nimbus-1').check({policy:'{"Statement":'}).correct,false);
 const policy=JSON.parse(solutions['nimbus-1'].policy);policy.Statement[0].Action=['s3:*'];assert.equal(getPractical('nimbus-1').check({policy:JSON.stringify(policy)}).correct,false);
 policy.Statement[0].Action=['s3:GetObject'];policy.Statement[0].Resource=['*'];assert.equal(getPractical('nimbus-1').check({policy:JSON.stringify(policy)}).correct,false);
 assert.equal(getPractical('storm-1').check({order:['diagnose','contain','restore','restore']}).correct,false);
});

test('Seis mecânicas distintas exigem as ações certas, sem conceder pontos',()=>{
 const stars=[{id:0,x:270,y:440},{id:1,x:620,y:260},{id:2,x:850,y:530}];
 const step=(world,position,progress={},collected=[],extra={})=>advanceMechanic({world,stage:4,stars,progress,collected,position,now:1000,...extra});
 assert.equal(new Set(worlds.map(w=>mechanicState(w.id,4,stars).type)).size,6);
 assert.equal(step('raios',stars[0]).collected.length,0);assert.deepEqual(step('raios',stars[0],{},[],{jump:true}).collected,[0]);
 assert.equal(step('clouds',stars[1]).collected.length,0);assert.deepEqual(step('clouds',stars[0]).collected,[0]);
 assert.equal(step('mist',stars[0]).collected.length,0);const scan=step('mist',stars[0],{},[],{interact:true});assert.deepEqual(scan.collected,[0]);assert.equal(step('mist',stars[1],scan.progress,scan.collected,{now:12000}).collected.length,1);
 assert.equal(step('nimbus',stars[0],{},[],{interact:true}).collected.length,0);const key=mechanicState('nimbus',4,stars).keys[0],held=step('nimbus',key);assert.deepEqual(held.progress.keys,[0]);assert.deepEqual(step('nimbus',stars[0],held.progress,[],{interact:true}).collected,[0]);
 assert.equal(step('storm',stars[2],{},[],{interact:true}).collected.length,0);assert.deepEqual(step('storm',stars[2],{},[0,1],{interact:true}).collected,[0,1,2]);
 for(let stage=1;stage<=20;stage++){let progress={},collected=[];for(const star of stars){for(let i=0;i<4&&!collected.includes(star.id);i++){const r=advanceMechanic({world:'aurora',stage,stars,progress,collected,position:star,interact:true,now:1000});progress=r.progress;collected=r.collected}assert.ok(collected.includes(star.id))}}
 const c=new Proxy({},{get:()=>()=>{},set:()=>true});for(const w of worlds){const trail={stars,collected:[],spirit:{x:550,y:425},mechanic:mechanicState(w.id,4,stars)};drawMechanics(c,1200,trail,w);trail.mechanic.illuminated=true;drawMechanics(c,1200,trail,w)}
});
