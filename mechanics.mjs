const descriptions={
 raios:{type:'electric',title:'Saltos elétricos',hint:'Salte sobre cada cristal carregado com Espaço ou Pular para recolher a energia.'},
 aurora:{type:'wind',title:'Hélices da aurora',hint:'Aproxime-se de cada hélice e use E para girá-la até alinhar com a seta indicada.'},
 clouds:{type:'bridges',title:'Pontes de nuvens',hint:'Siga as nuvens numeradas na ordem 1 → 2 → 3. Cada passo ilumina o próximo trecho.'},
 mist:{type:'fog',title:'Lanterna da neblina',hint:'Use E para iluminar a névoa por alguns segundos e encontrar os fragmentos escondidos.'},
 nimbus:{type:'locks',title:'Chaves do menor privilégio',hint:'Pegue cada chave colorida, aproxime-se da fechadura correspondente e pressione E para abrir.'},
 storm:{type:'beacons',title:'Faróis resilientes',hint:'Ative os faróis 1 e 2 com E. Com duas réplicas saudáveis, ative o farol central 3.'}
};
export function mechanicState(world,stage,stars,progress={},now=Date.now()){
 const m=descriptions[world],names=['Leitura','Execução','Auditoria'];
 return {...m,targets:stars.map(s=>(stage+s.id)%4),turns:progress.turns||{},illuminated:(progress.scanUntil||0)>now,keys:stars.map(s=>({id:s.id,x:Math.max(130,s.x-70),y:Math.min(580,s.y+55),name:names[s.id],held:(progress.keys||[]).includes(s.id)}))};
}
export function advanceMechanic({world,stage,stars,collected,progress={},position,jump=false,interact=false,now=Date.now()}){
 const state={...progress,keys:[...(progress.keys||[])],turns:{...(progress.turns||{})}},done=[...collected],near=s=>Math.hypot(position.x-s.x,position.y-s.y)<45;
 const m=mechanicState(world,stage,stars,state,now);let feedback='';
 if(m.type==='fog'&&interact){state.scanUntil=now+10000;feedback='Lanterna acesa: os caminhos escondidos ficaram visíveis por 10 segundos.'}
 if(m.type==='locks')for(const key of m.keys)if(!done.includes(key.id)&&!state.keys.includes(key.id)&&near(key)){state.keys.push(key.id);feedback=`Chave de ${key.name.toLowerCase()} recolhida. Abra a fechadura da mesma cor com E.`}
 for(const star of stars){if(done.includes(star.id)||!near(star))continue;
  let accept=false;
  if(m.type==='electric'){accept=jump;if(interact&&!jump)feedback='Este cristal está carregado. Pule para recolhê-lo sem tocar na descarga.'}
  if(m.type==='wind'&&interact){const turn=((state.turns[star.id]||0)+1)%4;state.turns[star.id]=turn;accept=turn===m.targets[star.id];feedback=accept?'Hélice alinhada: a corrente de ar ficou estável.':'Hélice girada. Compare sua seta com o alvo e use E novamente.'}
  if(m.type==='bridges'){accept=star.id===done.length;if(!accept&&interact)feedback='A ponte precisa ser construída em ordem. Siga o próximo número iluminado.'}
  if(m.type==='fog')accept=(state.scanUntil||0)>now;
  if(m.type==='locks'&&interact){accept=state.keys.includes(star.id);if(!accept)feedback='A fechadura exige a chave correspondente. Procure a chave da mesma cor.'}
  if(m.type==='beacons'&&interact){accept=star.id!==2||(done.includes(0)&&done.includes(1));if(!accept)feedback='O farol central precisa dos outros dois faróis saudáveis primeiro.'}
  if(accept){done.push(star.id);feedback=done.length===3?'Mecânica concluída! A energia abriu um novo portal.':`${m.title}: ${done.length}/3 objetivos concluídos.`}
 }
 return {collected:done,progress:state,feedback};
}
