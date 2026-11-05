export const WORLD=160,DURATION=120,COLORS=['#ff7755','#68d9ca','#9a8aff','#f6c76b','#6faee9','#e98bb0'];
export const DISTRICTS={park:{name:'Parque Central',color:'#6d9d67'},residential:{name:'Bairro dos Jardins',color:'#c7ae89'},downtown:{name:'Centro Financeiro',color:'#829dab'},market:{name:'Praça do Mercado',color:'#cc986e'},harbor:{name:'Cais da Cidade',color:'#85b5bd'}};
export const BLOCKS=[];for(let gx=-3;gx<=2;gx++)for(let gz=-3;gz<=2;gz++){const district=gz===2?'harbor':(gx===-1&&gz===-1||gx===0&&gz===-1)?'park':gx<0?(gz<0?'residential':'park'):(gz<0?'downtown':'market');BLOCKS.push({gx,gz,x:gx*24+12,z:gz*24+12,district})}
export function districtAt(x,z){const gx=Math.max(-3,Math.min(2,Math.floor(x/24))),gz=Math.max(-3,Math.min(2,Math.floor(z/24)));return BLOCKS.find(b=>b.gx===gx&&b.gz===gz).district}
export const TYPES={fountain:{size:2.6,points:30},cone:{size:.48,points:1},bin:{size:.72,points:2},bench:{size:1.05,points:4},lamp:{size:1.1,points:4},tree:{size:1.3,points:6},car:{size:1.75,points:12},kiosk:{size:2.45,points:25},house:{size:3.3,points:50},tower:{size:4.8,points:110}};
export function radius(score){return Math.min(11,.96+Math.sqrt(Math.max(0,score))*.185)}
export const LEVELS=[0,5,15,35,65,115,190,300,450,650,900,1250,1700];
export function levelState(score){score=Math.max(0,Number(score)||0);let i=0;while(i<LEVELS.length-1&&score>=LEVELS[i+1])i++;const next=LEVELS[i+1]??null;return {level:i+1,progress:next===null?1:(score-LEVELS[i])/(next-LEVELS[i]),earned:score-LEVELS[i],needed:next===null?null:next-LEVELS[i]}}
export function buildingProfile(o){const tower=o.type==='tower',variant=o.tint??0;if(o.district==='harbor'&&!tower)return {w:6,d:4.4,h:4.2,glass:false};return {w:tower?6:4.6,d:tower?5.8:4.4,h:tower?13+variant*2:5+variant*1.1,glass:tower&&variant%2===0}}
export function rng(seed=1){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
export const EDGE=WORLD/2-2;
const height={fountain:2.4,cone:.95,bin:1.05,bench:1.4,tree:3.4,lamp:3.7,car:1.5,kiosk:3.2,house:5.6,tower:10.8};
export function canEat(h,o){return !o.owner&&o.cooldown<=0&&h.r>o.size*1.1&&Math.hypot(h.x-(o.px??o.x),h.z-(o.pz??o.z))<Math.max(.15,h.r-o.size*.35)}
export class Arena{
 constructor(random=Math.random){this.random=random;this.reset()}
 reset(color=COLORS[0]){this.time=0;this.done=false;this.eaten=0;this.events=[];this.objects=[];this.holes=[];this.energy=1;this.burst=false;this.boostLocked=false;this.combo=0;this.lastMeal=-9;let id=0;let district='downtown';const add=(type,x,z)=>{this.objects.push({id:id++,type,district,x,z,px:x,pz:z,y:0,vx:0,vz:0,vy:0,tiltX:0,tiltZ:0,...TYPES[type],owner:null,fall:0,cooldown:0,tint:Math.floor(this.random()*5)})};
 for(const block of BLOCKS){const {x,z}=block;district=block.district;
 if(district==='park'){add('fountain',x,z);for(let k=0;k<6;k++){const a=k*Math.PI/3;add('tree',x+Math.cos(a)*6.5,z+Math.sin(a)*6.5)}add('bench',x-4,z+8);add('bench',x+4,z-8)}
 else if(district==='downtown'){add('tower',x-4,z-4);add((block.gx+block.gz)%2?'tower':'house',x+5,z+4);add('kiosk',x-5,z+5);add('tree',x+7,z-6)}
 else if(district==='residential'){add('house',x-4,z-3);add('house',x+4,z-3);add('tree',x-6,z+5);add('tree',x+6,z+5);add('bench',x,z+6)}
 else if(district==='market'){for(const dx of[-4,4])for(const dz of[-4,4])add('kiosk',x+dx,z+dz);add('bench',x,z+7);add('tree',x+7,z-7)}
 else{add('house',x-4,z-4);add('kiosk',x+5,z-4);add('car',x-4,z+5);add('car',x,z+5);add('bench',x+6,z+6)}
 add('lamp',x+8,z+8);add('car',x+11,z-5);for(let k=0;k<4;k++)add('bin',x-9,z-7+k*4);for(let k=0;k<5;k++)add('cone',x-7+k*3.5,z+10);add('bin',x+9,z+1);add('bin',x+9,z-9);
 }
 // Equivalent small-object starts, placed along roads rather than inside buildings.
 district='downtown';for(const [sx,sz]of[[0,0],[-65,-65],[65,65],[-65,65],[65,-65],[0,64]])for(let i=0;i<12;i++){const a=i*Math.PI/6,d=3+(i%2)*2;add(i%3?'cone':'bin',sx+Math.cos(a)*d,sz+Math.sin(a)*d)}
 const starts=[[0,0],[-65,-65],[65,65],[-65,65],[65,-65],[0,64]],names=['Tu','Órbita','Cometa','Nebulosa','Eclipse','Cosmo'];starts.forEach(([x,z],i)=>this.holes.push({id:i,name:names[i],x,z,r:.96,score:0,color:i?COLORS[i]:color,shield:4,respawn:0,think:0,target:null}));this.player=this.holes[0]}
 swallow(h,o){if(!canEat(h,o))return false;o.owner=h;o.fall=0;o.px??=o.x;o.pz??=o.z;o.y??=0;o.vx??=0;o.vz??=0;o.vy=0;o.tiltX=0;o.tiltZ=0;return true}
 update(dt,input={x:0,z:0,boost:false}){if(this.done)return;dt=Math.min(.05,Math.max(0,Number(dt)||0));this.time=Math.min(DURATION,this.time+dt);this.events=[];const p=this.player;
 if(this.energy<=.02)this.boostLocked=true;
 if(this.boostLocked&&this.energy>=.3)this.boostLocked=false;
 this.burst=!!input.boost&&!this.boostLocked&&this.energy>.02&&p.respawn<=0;
 this.energy=Math.max(0,Math.min(1,this.energy+dt*(this.burst?-.34:.2)));
 for(const h of this.holes){h.shield=Math.max(0,h.shield-dt);if(h.respawn>0){h.respawn-=dt;if(h.respawn<=0){h.x=(this.random()-.5)*(WORLD-24);h.z=(this.random()-.5)*(WORLD-24);h.shield=4;}continue}let dx=Number(input.x)||0,dz=Number(input.z)||0;
 if(h.id){h.think-=dt;if(h.think<=0||!h.target||h.target.owner||h.target.cooldown>0){let best=Infinity,target=null;for(const o of this.objects)if(!o.owner&&o.cooldown<=0&&h.r>o.size*1.1){const d=(h.x-o.px)**2+(h.z-o.pz)**2;if(d<best){best=d;target=o}}h.target=target;h.think=.3+this.random()*.3}dx=(h.target?.px??0)-h.x;dz=(h.target?.pz??0)-h.z;for(const other of this.holes)if(other!==h&&other.respawn<=0&&other.r>h.r*1.25&&Math.hypot(other.x-h.x,other.z-h.z)<other.r+6){dx=h.x-other.x;dz=h.z-other.z;break}}
 const len=Math.hypot(dx,dz),speed=(h.id?5.5:7.2)/(1+h.r*.024)*(h.id===0&&this.burst?1.6:1);if(len>.03){h.x=Math.max(-EDGE+h.r,Math.min(EDGE-h.r,h.x+dx/Math.max(1,len)*speed*dt));h.z=Math.max(-EDGE+h.r,Math.min(EDGE-h.r,h.z+dz/Math.max(1,len)*speed*dt))}
 for(const o of this.objects)this.swallow(h,o);
 }
 // Semi-implicit integration: attraction, inertia, tipping and gravity persist
 // while following the opening with a damped pull. Each object scores once.
 for(const o of this.objects){
 if(o.cooldown>0){o.cooldown=Math.max(0,o.cooldown-dt);if(!o.cooldown){o.px=o.x;o.pz=o.z;o.y=0;o.vx=o.vz=o.vy=o.tiltX=o.tiltZ=0}continue}
 o.px??=o.x;o.pz??=o.z;o.vx??=0;o.vz??=0;
 if(o.owner){const h=o.owner;o.fall+=dt;const dx=h.x-o.px,dz=h.z-o.pz;
 const pull=Math.min(1,o.fall*3);o.vx+=(dx*28-o.vx*8)*dt;o.vz+=(dz*28-o.vz*8)*dt;
 o.px+=o.vx*dt;o.pz+=o.vz*dt;
 o.tiltX+=(Math.max(-.85,Math.min(.85,dz*.6))*pull-o.tiltX)*Math.min(1,dt*8);
 o.tiltZ+=(Math.max(-.85,Math.min(.85,-dx*.6))*pull-o.tiltZ)*Math.min(1,dt*8);
 if(o.fall>.12){o.vy-=19*dt;o.y+=o.vy*dt}
 if(o.y<-(o.type==='house'||o.type==='tower'?buildingProfile(o).h+1:(height[o.type]??1))-2){h.score+=o.points;h.r=radius(h.score);if(!h.id){this.eaten++;this.combo=this.time-this.lastMeal<2?this.combo+1:1;this.lastMeal=this.time;this.events.push({type:'eat',points:o.points,combo:this.combo,kind:o.type})}o.owner=null;o.fall=0;o.cooldown=20+this.random()*10}
 }else{
 // Loose street props slide away from the rim when they are still too large.
 if(['cone','bin','bench','car'].includes(o.type))for(const h of this.holes){if(h.respawn>0)continue;const dx=o.px-h.x,dz=o.pz-h.z,d=Math.hypot(dx,dz),contact=h.r+o.size*.4;if(d>.01&&d<contact&&h.r<=o.size*1.1){const impulse=(contact-d)*16*dt;o.vx+=dx/d*impulse;o.vz+=dz/d*impulse}}
 const damping=Math.exp(-5*dt);o.vx*=damping;o.vz*=damping;o.px=Math.max(-EDGE+o.size,Math.min(EDGE-o.size,o.px+o.vx*dt));o.pz=Math.max(-EDGE+o.size,Math.min(EDGE-o.size,o.pz+o.vz*dt));
 }
 }
 for(let i=0;i<this.holes.length;i++)for(let j=i+1;j<this.holes.length;j++){let a=this.holes[i],b=this.holes[j];if(a.respawn>0||b.respawn>0||a.shield>0||b.shield>0)continue;if(a.r<b.r)[a,b]=[b,a];if(a.r>b.r*1.28&&Math.hypot(a.x-b.x,a.z-b.z)<a.r-b.r*.3){a.score+=Math.max(8,Math.floor(b.score*.2));a.r=radius(a.score);b.score=Math.floor(b.score*.65);b.r=radius(b.score);b.respawn=1.5;b.target=null;if(!b.id)this.events.push({type:'caught'});if(!a.id)this.events.push({type:'rival'})}}
 for(const h of this.holes){h.x=Math.max(-EDGE+h.r,Math.min(EDGE-h.r,h.x));h.z=Math.max(-EDGE+h.r,Math.min(EDGE-h.r,h.z))}
 if(this.time>=DURATION){this.done=true;this.burst=false;this.events.push({type:'end'})}
 }
 ranking(){return [...this.holes].sort((a,b)=>b.score-a.score||a.id-b.id)}
}
