const $=s=>document.querySelector(s);const state={L:80,W:50,H:110,top:'tuck',bottom:'tuck',labels:true,glue:true,zoom:1};
const types={top:[{id:'tuck',name:'끼움형 뚜껑',en:'TUCK TOP',desc:'정면에 연결된 뚜껑의 마개를 안쪽으로 끼워 닫아요.'},{id:'reverse',name:'역방향 끼움형 뚜껑',en:'REVERSE TUCK TOP',desc:'반대쪽 면에 뚜껑을 연결해 여닫는 방향을 바꿔요.'},{id:'seal',name:'접착형 뚜껑',en:'GLUED TOP',desc:'네 날개를 겹치고 접착해서 상단을 닫는 기본 형태예요.'}],bottom:[{id:'tuck',name:'끼움형 바닥',en:'TUCK BOTTOM',desc:'하단 뚜껑의 마개를 안쪽으로 끼워 바닥을 닫아요.'},{id:'lock',name:'밑면 결구식 · 십자조립형',en:'SNAP LOCK BOTTOM',desc:'모양이 다른 네 날개를 차례로 겹쳐 조립하는 기본형이에요.'},{id:'seal',name:'접착형 바닥',en:'GLUED BOTTOM',desc:'바닥 날개를 겹쳐 붙이는 구조예요. 바닥 접착 작업이 필요해요.'}]};
types.top.push(
{id:'slit',name:'잠금 끼움형 뚜껑',en:'SLIT LOCK TOP',desc:'끼움 날개와 잠금 칼집을 더해 닫힘을 잡아주는 형태예요.'},
{id:'overlap',name:'맞물림형 뚜껑',en:'INTERLOCK TOP',desc:'마주 보는 두 날개의 탭과 칼집을 맞물려 닫는 개념형이에요.'});
types.bottom.push(
{id:'reverse',name:'반대면 끼움형 바닥',en:'OPPOSITE TUCK BOTTOM',desc:'기본 바닥과 반대쪽 면에 뚜껑을 연결해 개폐 방향을 바꿔요.'},
{id:'slit',name:'잠금 끼움형 바닥',en:'SLIT LOCK BOTTOM',desc:'끼움 날개에 잠금 칼집을 더한 밑면 형태예요.'},
{id:'auto',name:'삼면접착 자동바닥형',en:'AUTO BOTTOM · CONCEPT',desc:'옆면과 바닥 두 곳을 미리 접착하는 구조의 개념도예요. 양산 칼선은 별도 설계가 필요해요.'});
const presets=[
{id:'straight',name:'위아래 개폐형 · 같은 방향',top:'tuck',bottom:'reverse'},
{id:'reverse',name:'위아래 개폐형 · 반대 방향',top:'tuck',bottom:'tuck'},
{id:'locked',name:'상단 개폐 + 밑면 결구식',top:'tuck',bottom:'lock'},
{id:'automatic',name:'상단 개폐 + 자동바닥형',top:'tuck',bottom:'auto'}];
function presetMarkup(){return presets.map(p=>`<button class="preset" data-preset="${p.id}">${p.name}<span>↗</span></button>`).join('');}
function net(o,{decor=true}={}){let {L,W,H,top,bottom,labels=true,glue=true}=o;const g=Math.min(18,L*.22),tab=Math.min(18,W*.32),flap=W+tab+8,margin=30,total=2*(L+W)+g,bodyY=flap;let cuts=[],folds=[],fills=[],texts=[];const path=(d,c='cut')=>`<path d="${d}" class="${c}"/>`;const line=(x,y,a,b)=>`M${x} ${y}L${a} ${b}`;const poly=(pts,fill='#fff')=>{fills.push(`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="${fill}"/>`);};const label=(x,y,t,size=4,color='#888888')=>texts.push(`<text x="${x}" y="${y}" text-anchor="middle" fill="${color}" font-size="${size}">${t}</text>`);
poly([[0,bodyY+6],[g,bodyY],[g,bodyY+H],[0,bodyY+H-6]],glue?'#d6d6d2':'#fff');cuts.push(path(`M${g} ${bodyY}L0 ${bodyY+6}L0 ${bodyY+H-6}L${g} ${bodyY+H}`));folds.push(path(line(g,bodyY,g,bodyY+H),'fold'));
const widths=[L,W,L,W];let x=g;for(let i=0;i<4;i++){const w=widths[i];poly([[x,bodyY],[x+w,bodyY],[x+w,bodyY+H],[x,bodyY+H]]);if(i<3)folds.push(path(line(x+w,bodyY,x+w,bodyY+H),'fold'));else cuts.push(path(line(x+w,bodyY,x+w,bodyY+H)));if(labels){label(x+w/2,bodyY+H/2,['FRONT','SIDE','BACK','SIDE'][i]);label(x+w/2,bodyY+H/2+7,w+' mm',3.5);}
for(const side of ['top','bottom']){const kind=side==='top'?top:bottom,base=side==='top'?bodyY:bodyY+H,sign=side==='top'?-1:1;const main=side==='top'?(kind==='reverse'?2:0):(kind==='reverse'?0:2);let pts,creaseExtra=null,glued=false;const p=(a,b)=>[x+a,base+sign*b];const inset=Math.min(2,w*.035),d=Math.min(W*.48,w*.5),ch=Math.min(5,w*.1);
if(kind==='tuck'||kind==='reverse'||kind==='slit'){if(i===main){pts=[p(0,0),p(0,W),p(ch,W+tab),p(w-ch,W+tab),p(w,W),p(w,0)];creaseExtra=[p(0,W),p(w,W)];}else if(i%2===1){pts=[p(inset,0),p(ch,d),p(w-ch,d),p(w-inset,0)];}else{cuts.push(path(line(x,base,x+w,base)));continue;}}
else if(kind==='overlap'){if(i%2===0){const depth=W*.57,tongue=Math.min(12,w*.16);pts=i===0?[p(inset,0),p(inset,depth),p(w*.5-tongue,depth),p(w*.5-tongue,depth+tab*.5),p(w*.5+tongue,depth+tab*.5),p(w*.5+tongue,depth),p(w-inset,depth),p(w-inset,0)]:[p(inset,0),p(ch,depth),p(w-ch,depth),p(w-inset,0)];if(i===2)cuts.push(path(line(...p(w*.3,depth*.7),...p(w*.7,depth*.7))));}else pts=[p(inset,0),p(ch,d),p(w-ch,d),p(w-inset,0)];}
else if(kind==='auto'){const depth=i%2===0?W*.67:Math.min(L*.5,W*.7);pts=i%2===0?[p(inset,0),p(inset,depth*.65),p(w*.3,depth),p(w*.72,depth),p(w-inset,depth*.58),p(w-inset,0)]:[p(inset,0),p(ch,depth),p(w-ch,depth*.65),p(w-inset,0)];creaseExtra=[p(inset,0),p(w*.62,depth*.8)];glued=i%2===1;}
else if(kind==='seal'){const depth=i%2===0?W*.56:Math.min(L*.45,W*.5);pts=[p(inset,0),p(ch,depth),p(w-ch,depth),p(w-inset,0)];glued=i===2;}
else if(kind==='lock'){const depth=i%2===0?W*.72:Math.min(L*.5,W*.67),notch=Math.min(w*.18,10);if(i===0)pts=[p(inset,0),p(inset,depth),p(w*.36,depth),p(w*.36,depth*.62),p(w*.64,depth*.62),p(w*.64,depth),p(w-inset,depth),p(w-inset,0)];else if(i===2)pts=[p(inset,0),p(notch,depth*.7),p(w*.36,depth*.7),p(w*.4,depth),p(w*.6,depth),p(w*.64,depth*.7),p(w-notch,depth*.7),p(w-inset,0)];else pts=[p(inset,0),p(ch,depth*.7),p(w*.55,depth),p(w-ch,depth*.55),p(w-inset,0)];}
if(kind==='slit'&&i===main){cuts.push(path(line(...p(w*.24,W*.92),...p(w*.76,W*.92))));}
poly(pts,'#fff');cuts.push(path('M'+pts.map(a=>a.join(' ')).join('L')));folds.push(path(line(pts[0][0],base,pts[pts.length-1][0],base),'fold'));if(creaseExtra)folds.push(path(line(...creaseExtra[0],...creaseExtra[1]),'fold'));}
x+=w;}
if(labels){label(g+L/2,bodyY- W-tab-10,'L '+L+' mm',4);label(total+13,bodyY+H/2,'H '+H,4);if(glue)label(g/2,bodyY+H/2,'SIDE GLUE',2.4);}
const vh=H+2*flap+2*margin,vw=total+2*margin;return `<svg xmlns="http://www.w3.org/2000/svg" width="${vw}mm" height="${vh}mm" viewBox="${-margin} ${-margin} ${vw} ${vh}" role="img" aria-label="단상자 전개도"><style>.cut{fill:none;stroke:#303030;stroke-width:.28;stroke-linejoin:round;stroke-linecap:round}.fold{fill:none;stroke:#888888;stroke-width:.25;stroke-dasharray:2 1.4}text{font-family:Arial,sans-serif}</style><g class="dieline-sheet">${fills.join('')}</g>${cuts.join('')}${folds.join('')}${texts.join('')}${decor?`<text x="${g}" y="${bodyY+H+flap+15}" font-size="3" fill="#999999">UNFOLD / SAMPLE DIELINE / NO MATERIAL ALLOWANCE</text>`:''}</svg>`;}
function boxArt(){return `<svg class="dimension-art" viewBox="0 0 280 160" aria-label="장 폭 고 위치 안내"><path d="M80 45L145 20L208 48L142 76Z" fill="#dbf8e9" stroke="#334a39"/><path d="M80 45L142 76V139L80 106Z" fill="white" stroke="#334a39"/><path d="M142 76L208 48V110L142 139Z" fill="#f0f4ec" stroke="#334a39"/><g font-size="11" fill="#5a7563"><text x="89" y="139">장 L</text><text x="179" y="138">폭 W</text><text x="219" y="86">고 H</text></g></svg>`}
document.querySelectorAll('[data-presets]').forEach(el=>el.innerHTML=presetMarkup());
$('#dimensionArt').innerHTML=boxArt();
function renderCards(filter='all'){$('#cards').innerHTML=Object.entries(types).flatMap(([side,items])=>filter!=='all'&&filter!==side?[]:items.map((t,i)=>`<article class="card"><div class="card-art">${net({...state,[side]:t.id,labels:false})}</div><div class="card-body"><span class="tag">${side==='top'?'TOP':'BOTTOM'} / ${String(i+1).padStart(2,'0')}</span><h3>${t.name}</h3><p>${t.desc}</p><button data-use="${side}:${t.id}">이 구조로 만들어보기 <span>↗</span></button></div></article>`)).join('');}renderCards();
function page(id){$('#home').style.display=id==='home'?'block':'none';$('#studio').style.display=id==='studio'?'block':'none';document.querySelectorAll('nav [data-page]').forEach(b=>b.classList.toggle('on',b.dataset.page===id));location.hash=id==='home'?'home':'studio';window.scrollTo(0,0);if(id==='studio')render();}
function renderChoices(){for(const side of ['top','bottom']){$('#'+side+'Choices').innerHTML=types[side].map(t=>`<button class="choice ${state[side]===t.id?'active':''}" data-choice="${side}:${t.id}" aria-pressed="${state[side]===t.id}"><b>${t.name}</b><small>${t.en}</small></button>`).join('');}const t=types.top.find(t=>t.id===state.top),b=types.bottom.find(t=>t.id===state.bottom);$('#selectedInfo').textContent=t.name+' + '+b.name+' · '+(state.bottom==='auto'?'자동바닥은 개념도입니다. 바닥 접착 위치는 제작사 설계 확인이 필요합니다.':'선택한 두 구조가 전개도에 반영됩니다.');document.querySelectorAll('[data-preset]').forEach(el=>{const p=presets.find(p=>p.id===el.dataset.preset);el.classList.toggle('active',p.top===state.top&&p.bottom===state.bottom);});}
function render(){renderChoices();$('#canvas').innerHTML=net(state);$('#canvas svg').style.transform=`scale(${state.zoom})`;$('#canvas svg').style.transition='transform .25s ease';$('#overall').textContent=`${state.L} × ${state.W} × ${state.H} mm`;$('#zoomLabel').textContent=Math.round(state.zoom*100)+'%';}
let valid=true;function readDimensions(){const specs=[['length','L',20,300],['width','W',15,200],['height','H',30,400]];valid=true;let values={};for(const [id,k,min,max]of specs){const el=$('#'+id),v=Number(el.value),ok=el.value!==''&&Number.isFinite(v)&&v>=min&&v<=max;el.setAttribute('aria-invalid',String(!ok));if(!ok)valid=false;values[k]=v;}$('#error').textContent=valid?'':'장 20–300 / 폭 15–200 / 고 30–400mm 범위로 입력해 주세요.';$('#download').disabled=!valid;if(valid){Object.assign(state,values);render();}}
for(const id of ['length','width','height'])$('#'+id).addEventListener('input',readDimensions);for(const key of ['labels','glue'])$('#'+key).onchange=e=>{state[key]=e.target.checked;render();};
document.addEventListener('click',e=>{const target=e.target.closest('button');if(!target)return;if(target.dataset.page)page(target.dataset.page);if(target.dataset.preset){const p=presets.find(p=>p.id===target.dataset.preset);state.top=p.top;state.bottom=p.bottom;page('studio');}if(target.dataset.filter){document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b===target));renderCards(target.dataset.filter);}if(target.dataset.use){const [side,id]=target.dataset.use.split(':');state[side]=id;page('studio');}if(target.dataset.choice){const[side,id]=target.dataset.choice.split(':');state[side]=id;render();}});
$('#reset').onclick=()=>{Object.assign(state,{L:80,W:50,H:110,top:'tuck',bottom:'tuck',labels:true,glue:true,zoom:1});for(const[id,k]of [['length','L'],['width','W'],['height','H']])$('#'+id).value=state[k];$('#labels').checked=$('#glue').checked=true;readDimensions();};$('#plus').onclick=()=>{state.zoom=Math.min(1.6,state.zoom+.1);render();};$('#minus').onclick=()=>{state.zoom=Math.max(.5,state.zoom-.1);render();};$('#download').onclick=()=>{if(!valid)return;const blob=new Blob([net(state)],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`UNFOLD_${state.L}x${state.W}x${state.H}_${state.top}_${state.bottom}.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#toast').textContent='SVG를 저장했어요. 실제 크기로 출력해 샘플을 확인해 주세요.';$('#toast').style.display='block';setTimeout(()=>$('#toast').style.display='none',4000);};render();if(location.hash==='#studio')page('studio');addEventListener('hashchange',()=>{const id=location.hash==='#studio'?'studio':'home';if($('#'+id).style.display==='none')page(id);});

const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
const titleEl=document.querySelector('.wave-title');
document.querySelector('[data-scroll="about"]').onclick=()=>document.querySelector('#about').scrollIntoView({behavior:motionQuery.matches?'auto':'smooth'});

for(const [selector,title] of [['.settings','치수 · 표시 설정'],['.structure-panel','상단 · 하단 구조']]){const panel=document.querySelector(selector),head=document.createElement('div');head.className='floating-heading';head.innerHTML=`<span>${title}</span><button class="panel-collapse" aria-label="${title} 접기" aria-expanded="true">−</button>`;panel.prepend(head);head.querySelector('button').onclick=e=>{const collapsed=panel.classList.toggle('is-collapsed');e.currentTarget.textContent=collapsed?'+':'−';e.currentTarget.setAttribute('aria-expanded',String(!collapsed));e.currentTarget.setAttribute('aria-label',title+(collapsed?' 펼치기':' 접기'));};}

// A two-dimensional paper mesh bends locally around the grab point.
(()=>{
 const base=titleEl.querySelector('.title-word'),canvas=document.createElement('canvas'),texture=document.createElement('canvas'),back=document.createElement('canvas');
 const ctx=canvas.getContext('2d'),ink=texture.getContext('2d');if(!ctx||!ink)return;
 canvas.className='paper-mesh';canvas.setAttribute('aria-hidden','true');titleEl.append(canvas);
 titleEl.setAttribute('aria-label','UNFOLD · 끝을 잡아당겨 스티커처럼 떼어보세요');
 const hint=document.createElement('span');hint.id='peel-help';hint.className='peel-hint';hint.textContent='끝을 잡고 스티커처럼 떼어보세요 ↖';titleEl.after(hint);titleEl.setAttribute('aria-describedby','peel-help');
 let edgeLeft=0,edgeRight=0,rest=0,frontPixels,backPixels,raster;const surface=document.createElement('canvas'),surfaceCtx=surface.getContext('2d');
 let w=0,h=0,pad=0,dpr=1,amount=0,v=0,target=0,gx=.72,gy=.55,grabX=.72,grabY=.55,drag=false,startX=0,startY=0,foldSide=1,startLift=0,frame=0,last=0,pid=null;
 function layout(){const b=base.getBoundingClientRect(),r=titleEl.getBoundingClientRect();if(!b.width)return;w=b.width;h=b.height;edgeLeft=base.firstElementChild.getBoundingClientRect().left-b.left;edgeRight=base.lastElementChild.getBoundingClientRect().right-b.left;rest=0;if(!drag){amount=rest;target=rest;v=0;}pad=Math.ceil(h+40);dpr=Math.min(2,Math.max(1.5,devicePixelRatio||1));
  canvas.width=Math.ceil((w+pad*2)*dpr);canvas.height=Math.ceil((h+pad*2)*dpr);Object.assign(canvas.style,{left:(b.left-r.left-pad)+'px',top:(b.top-r.top-pad)+'px',width:(w+pad*2)+'px',height:(h+pad*2)+'px'});
  texture.width=Math.ceil(w*dpr);texture.height=Math.ceil((h+6)*dpr);ink.setTransform(dpr,0,0,dpr,0,0);ink.clearRect(0,0,w,h+6);ink.fillStyle='#101010';ink.textBaseline='alphabetic';
  base.querySelectorAll(':scope>span').forEach(el=>{const a=el.getBoundingClientRect(),st=getComputedStyle(el);ink.font=`${st.fontWeight} ${st.fontSize} ${st.fontFamily}`;const m=ink.measureText(el.textContent);ink.fillText(el.textContent,a.left-b.left,a.top-b.top+a.height/2+(m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/2);});
  back.width=texture.width;back.height=texture.height;const bc=back.getContext('2d');bc.drawImage(texture,0,0);bc.globalCompositeOperation='source-in';const paper=bc.createLinearGradient(0,0,0,back.height);paper.addColorStop(0,'#faf8ef');paper.addColorStop(.5,'#ded9cc');paper.addColorStop(1,'#aaa497');bc.fillStyle=paper;bc.fillRect(0,0,back.width,back.height);frontPixels=ink.getImageData(0,0,texture.width,texture.height).data;backPixels=bc.getImageData(0,0,back.width,back.height).data;surface.width=canvas.width;surface.height=canvas.height;raster=surfaceCtx.createImageData(canvas.width,canvas.height);base.classList.add('mesh-original');paint();
 }
 function peelGeometry(){return {nx:foldSide*.9701,ny:.2425,cornerX:foldSide<0?edgeLeft:edgeRight,radius:Math.min(h*.28,h*.105+Math.max(0,amount)*.065),depth:Math.max(0,amount)*1.8};}
 function vertex(x,y){
  // Adhered ink stays flat; a moving rounded peel front releases a free tail.
  let {nx,ny,cornerX,radius,depth}=peelGeometry();
  let d=(x-cornerX)*nx+(y-h-6)*ny+depth;
  // A small resting curl at the U's lower-left corner stays independent.
  const leftD=(x-edgeLeft)*-.58+(y-h*.92)*.815+h*.33;
  if(foldSide>0&&d<=0&&leftD>0){nx=-.58;ny=.815;radius=h*.075;d=leftD;}
  if(d<=0)return [pad+x,pad+y,0,0];
  const turn=2.52,arc=radius*turn,theta=Math.min(turn,d/radius),tail=Math.max(0,d-arc);
  const along=radius*Math.sin(theta)+tail*Math.cos(turn);
  const z=radius*(1-Math.cos(theta))+tail*Math.sin(turn);
  return [pad+x+(along-d)*nx,pad+y+(along-d)*ny-z*.72,z,theta];
 }
 function triangle(a,b,c,A,B,C,reverse=false){
  const ax=A[0]*dpr,ay=A[1]*dpr,bx=B[0]*dpr,by=B[1]*dpr,cx=C[0]*dpr,cy=C[1]*dpr;
  const den=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);if(Math.abs(den)<.001)return;
  const minX=Math.max(0,Math.floor(Math.min(ax,bx,cx))),maxX=Math.min(canvas.width-1,Math.ceil(Math.max(ax,bx,cx))),minY=Math.max(0,Math.floor(Math.min(ay,by,cy))),maxY=Math.min(canvas.height-1,Math.ceil(Math.max(ay,by,cy)));
  const src=reverse?backPixels:frontPixels,tw=texture.width,th=texture.height,dst=raster.data;
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
   const u=((by-cy)*(x+.5-cx)+(cx-bx)*(y+.5-cy))/den,v=((cy-ay)*(x+.5-cx)+(ax-cx)*(y+.5-cy))/den,t=1-u-v;
   if(u<-.00001||v<-.00001||t<-.00001)continue;
   const sx=Math.max(0,Math.min(tw-1,(u*a[0]+v*b[0]+t*c[0])*dpr)),sy=Math.max(0,Math.min(th-1,(u*a[1]+v*b[1]+t*c[1])*dpr));
   const ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy,j=(iy*tw+ix)*4,k=(y*canvas.width+x)*4,jx=(iy*tw+Math.min(tw-1,ix+1))*4,jy=(Math.min(th-1,iy+1)*tw+ix)*4,jxy=(Math.min(th-1,iy+1)*tw+Math.min(tw-1,ix+1))*4;
   const alpha=(src[j+3]*(1-fx)*(1-fy)+src[jx+3]*fx*(1-fy)+src[jy+3]*(1-fx)*fy+src[jxy+3]*fx*fy)/255;if(alpha<.002)continue;
   const old=dst[k+3]/255,out=alpha+old*(1-alpha);for(let n=0;n<3;n++){const color=src[j+n]*(1-fx)*(1-fy)+src[jx+n]*fx*(1-fy)+src[jy+n]*(1-fx)*fy+src[jxy+n]*fx*fy;dst[k+n]=(color*alpha+dst[k+n]*old*(1-alpha))/out;}dst[k+3]=out*255;
  }
 }
 function paint(){if(!w)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w+2*pad,h+2*pad);
  const lift=Math.max(0,amount);if(lift>.5){
   const g=peelGeometry(),distance=p=>(p[0]-g.cornerX)*g.nx+(p[1]-h*.92)*g.ny+g.depth;
   const rect=[[0,0],[w,0],[w,h+6],[0,h+6]],poly=[];
   for(let i=0;i<4;i++){const a=rect[i],b=rect[(i+1)%4],da=distance(a),db=distance(b);if(da>=0)poly.push(a);if((da>=0)!==(db>=0)){const t=da/(da-db);poly.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}
   if(poly.length){ctx.save();ctx.beginPath();poly.forEach((p,i)=>i?ctx.lineTo(pad+p[0],pad+p[1]+8):ctx.moveTo(pad+p[0],pad+p[1]+8));ctx.closePath();ctx.clip();ctx.globalAlpha=Math.min(.2,.07+lift/h*.07);ctx.filter='blur(9px)';ctx.drawImage(texture,pad,pad+8,w,h+6);ctx.restore();}
  }
  
  raster.data.fill(0);const nx=64,ny=20,faces=[];for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
   const x=i*w/nx,X=(i+1)*w/nx,y=j*(h+6)/ny,Y=(j+1)*(h+6)/ny;
   const a=[x,y],b=[X,y],c=[X,Y],d=[x,Y],A=vertex(x,y),B=vertex(X,y),C=vertex(X,Y),D=vertex(x,Y);
   for(const f of [[a,b,c,A,B,C],[a,c,d,A,C,D]]){const angle=(f[3][3]+f[4][3]+f[5][3])/3;faces.push({f,angle,z:(f[3][2]+f[4][2]+f[5][2])/3});}
  }
  faces.sort((a,b)=>a.z-b.z);for(const face of faces)triangle(...face.f,face.angle>Math.PI/2);surfaceCtx.putImageData(raster,0,0);ctx.drawImage(surface,0,0,canvas.width/dpr,canvas.height/dpr);
 }

 function tick(now){frame=0;const dt=Math.min(2,Math.max(.5,(now-(last||now-16.7))/16.7));last=now;
  v=(v+(target-amount)*.072*dt)*Math.pow(.69,dt);amount+=v*dt;gx+=(grabX-gx)*.12*dt;gy+=(grabY-gy)*.12*dt;
  if(Math.abs(target-amount)<.06&&Math.abs(v)<.06){amount=target;v=0;paint();last=0;return;}paint();frame=requestAnimationFrame(tick);
 }
 function setLift(n){target=motionQuery.matches?rest:Math.max(rest,n);if(!frame)frame=requestAnimationFrame(tick);hint.classList.toggle('active',drag||target>rest+.5);}
 function grab(e){const r=base.getBoundingClientRect();grabX=Math.max(.02,Math.min(.98,(e.clientX-r.left)/w));grabY=Math.max(0,Math.min(1,(e.clientY-r.top)/h));if(!drag){gx=grabX;gy=grabY;foldSide=grabX<.5?-1:1;}}
 titleEl.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!drag){setLift(rest+h*.025);}});
 titleEl.addEventListener('pointerdown',e=>{if(e.button!==0)return;grab(e);drag=true;pid=e.pointerId;startX=e.clientX;startY=e.clientY;startLift=Math.max(amount,18);titleEl.classList.add('is-peeling');titleEl.setPointerCapture(pid);setLift(startLift);});
 titleEl.addEventListener('pointermove',e=>{if(drag){const inward=(startX-e.clientX)*foldSide;setLift(Math.max(0,Math.min(h*1.7,startLift+(startY-e.clientY)*.7+inward*.7)));}});
 function release(){drag=false;titleEl.classList.remove('is-peeling');if(pid!==null&&titleEl.hasPointerCapture(pid))titleEl.releasePointerCapture(pid);pid=null;setLift(0);}
 titleEl.addEventListener('pointerup',release);titleEl.addEventListener('pointercancel',release);titleEl.addEventListener('lostpointercapture',()=>{if(drag)release()});titleEl.addEventListener('pointerleave',()=>{if(!drag)setLift(0)});titleEl.addEventListener('blur',release);
 titleEl.addEventListener('keydown',e=>{if((e.code==='Space'||e.code==='Enter')&&!e.repeat){e.preventDefault();grabX=.72;grabY=.5;foldSide=1;setLift(h*.65)}if(e.key==='Escape')release()});titleEl.addEventListener('keyup',e=>{if(e.code==='Space'||e.code==='Enter')release()});
 document.fonts.ready.then(layout);new ResizeObserver(layout).observe(base);addEventListener('hashchange',()=>{release();if(location.hash!=='#studio')requestAnimationFrame(layout)});
})();
