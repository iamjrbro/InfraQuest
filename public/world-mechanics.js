export function drawMechanics(c,time,trail,theme){
 const m=trail.mechanic,stars=trail.stars,done=trail.collected;if(!m)return;
 const ellipse=(x,y,rx,ry,col)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=col;c.fill()},line=(x,y,x2,y2,col,width=2)=>{c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=col;c.lineWidth=width;c.stroke()},label=(x,y,s)=>{c.font='600 12px Segoe UI';c.textAlign='center';c.fillStyle=theme.ink;c.fillText(s,x,y)};
 if(m.type==='fog'&&!m.illuminated){for(let i=0;i<5;i++){const x=220+i*150,y=340+Math.sin(time/2500+i)*75;ellipse(x,y,140,42,theme.cloud+'aa')}label(550,240,'[E] Acender a lanterna da neblina');return}
 if(m.type==='bridges'){const route=[{x:trail.spirit.x,y:trail.spirit.y},...stars];for(let i=1;i<route.length;i++){c.setLineDash([8,9]);line(route[i-1].x,route[i-1].y,route[i].x,route[i].y,i<=done.length+1?theme.glow:theme.edge+'55',5);c.setLineDash([])}}
 if(m.type==='beacons'){line(stars[0].x,stars[0].y,stars[2].x,stars[2].y,done.includes(0)?theme.glow:theme.edge,3);line(stars[1].x,stars[1].y,stars[2].x,stars[2].y,done.includes(1)?theme.glow:theme.edge,3)}
 if(m.type==='locks')for(const key of m.keys){if(key.held||done.includes(key.id))continue;const col=[theme.glow,'#d4b47c','#b6c7db'][key.id];ellipse(key.x-7,key.y-15,8,8,col);line(key.x,key.y-15,key.x+19,key.y-15,col,5);line(key.x+11,key.y-15,key.x+11,key.y-7,col,4);label(key.x,key.y+16,'Chave: '+key.name)}
 for(const star of stars){const complete=done.includes(star.id),active=m.type!=='bridges'||star.id===done.length,x=star.x,y=star.y,glow=complete?theme.edge:active?theme.glow:theme.edge+'77';
  ellipse(x,y+8,26,9,theme.edge+'44');
  if(m.type==='electric'){ellipse(x,y-9,28,15,theme.edge);c.save();c.translate(x,y-20);c.rotate(Math.PI/4);c.fillStyle=glow;c.fillRect(-10,-10,20,20);c.restore();if(!complete){line(x-27,y-3,x-16,y-8,theme.glow,2);line(x+16,y-8,x+28,y-2,theme.glow,2)}label(x,y+36,complete?'✓ Energia estável':'[Espaço] Saltar '+(star.id+1))}
  else if(m.type==='wind'){line(x,y,x,y-48,theme.edge,6);c.save();c.translate(x,y-43);c.rotate((m.turns[star.id]||0)*Math.PI/2);for(let i=0;i<4;i++){c.rotate(Math.PI/2);c.fillStyle=glow;c.fillRect(1,-28,9,25)}c.restore();ellipse(x,y-43,5,5,theme.wall);label(x,y-81,'Alvo '+['↑','→','↓','←'][m.targets[star.id]]);label(x,y+32,complete?'✓ Vento alinhado':'[E] Girar hélice')}
  else if(m.type==='bridges'){ellipse(x,y-16,35,13,glow);ellipse(x-13,y-24,16,14,glow);ellipse(x+10,y-27,19,17,glow);label(x,y-15,complete?'✓':String(star.id+1));label(x,y+31,complete?'Ponte construída':active?'Próxima nuvem':'Aguarde a ponte')}
  else if(m.type==='locks'){const col=[theme.glow,'#d4b47c','#b6c7db'][star.id];c.strokeStyle=col;c.lineWidth=5;c.beginPath();c.arc(x,y-28,12,Math.PI,Math.PI*2);c.stroke();c.fillStyle=complete?theme.edge:col;c.fillRect(x-19,y-29,38,30);ellipse(x,y-16,3,4,theme.ink);label(x,y+32,complete?'✓ Acesso autorizado':'[E] '+m.keys[star.id].name)}
  else if(m.type==='beacons'){c.fillStyle=theme.wall;c.fillRect(x-14,y-44,28,44);c.fillStyle=glow;c.fillRect(x-19,y-53,38,17);if(complete){ellipse(x,y-44,45+Math.sin(time/500)*5,15,theme.glow+'44')}label(x,y+32,complete?'✓ Farol saudável':'[E] Farol '+(star.id+1));if(star.id===2&&!done.includes(0)&&!done.includes(1))label(x,y-76,'Aguarda duas réplicas')}
  else{c.save();c.translate(x,y-15+Math.sin(time/500+star.id)*5);c.rotate(Math.PI/4);c.fillStyle=glow;c.fillRect(-10,-10,20,20);c.restore();label(x,y+30,complete?'✓ Descoberto':'Fragmento revelado '+(star.id+1))}
 }
 c.textAlign='left';
}
