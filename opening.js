/* Time-based, single-owner opening. No handlers belonging to later screens are removed. */
(() => {
  'use strict';
  const stage = document.querySelector('#openingStage');
  const screen = document.querySelector('#loading');
  stage.removeAttribute('aria-hidden');
  const NS = 'http://www.w3.org/2000/svg';
  const playListeners=new AbortController();
  const CX = 961.91, FLOOR = 718.18;
  let frame = 0, generation = 0, running = true, mode = 'intro';
  const dialogue=document.createElement('div');dialogue.className='opening-dialogue';dialogue.hidden=true;
  dialogue.innerHTML='<p class="opening-line" aria-live="polite"></p><div class="opening-choices" hidden><button type="button" data-answer="yes">네 좋아요!</button><button type="button" data-answer="wait">음~ 조금만 기다려주세요!</button></div>';
  screen.append(dialogue);
  const line=dialogue.querySelector('.opening-line'), choices=dialogue.querySelector('.opening-choices');
  const bubble=document.createElement('button');bubble.type='button';bubble.className='opening-bubble';bubble.hidden=true;
  bubble.setAttribute('aria-label','작업물 보러 가기');bubble.innerHTML='<span class="dots" aria-hidden="true">●●●</span><small>작업물 보러 가기</small>';
  let letters=[], sentence='';
  function setSentence(text) {
    if(sentence===text)return;sentence=text;line.replaceChildren();letters=[];line.setAttribute('aria-label',text.replace('\n',' '));
    text.split(/(\s+)/).forEach(word=> {
      if(word.includes('\n')){line.append(document.createElement('br'));return;}
      const wrap=document.createElement('span');wrap.className='opening-word';
      [...word].forEach(char=>{const span=document.createElement('span');span.className='opening-letter';span.textContent=char;span.setAttribute('aria-hidden','true');wrap.append(span);letters.push(span);});
      line.append(wrap);
    });
  }
  function lettering(elapsed,fadeAt=Infinity) {
    letters.forEach((letter,i)=>{const appear=ease((elapsed-i*.07)/.3),disappear=ease((elapsed-fadeAt-i*.042)/.3);letter.style.opacity=String(appear*(1-disappear));});
  }
  const canPlay = () => ['dialogue','choice','choiceExit','play'].includes(mode);
  const blocked = ['pointerdown', 'pointerup', 'pointermove', 'click', 'dblclick', 'wheel', 'touchstart', 'touchmove', 'touchend', 'keydown'];
  function guard(e) {
    if (!running) return;
    if(['choice','play'].includes(mode)&&e.type==='keydown'&&e.key==='Tab')return;
    const control=e.target.closest?.('.opening-choices button,.opening-bubble');
    if(control && (mode==='choice'||mode==='play') && !['wheel','touchmove'].includes(e.type))return;
    if(canPlay() && ['pointerdown','pointerup','pointermove','pointercancel','touchstart','touchend'].includes(e.type) && stage.contains(e.target))return;
    if(canPlay() && e.type==='pointermove')return;
    if (e.cancelable) e.preventDefault();
    e.stopImmediatePropagation();
  }
  blocked.forEach(type => window.addEventListener(type, guard, {capture:true, passive:false}));
  function release() {
    blocked.forEach(type => window.removeEventListener(type, guard, true));
    running = false;
  }
  function dispose() { ++generation; cancelAnimationFrame(frame); playListeners.abort(); release(); }
  window.addEventListener('pagehide', dispose, {once:true});
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => { n = clamp(n); return n*n*(3-2*n); };
  const mix = (a,b,t) => a+(b-a)*t;
  const svgEl = (tag, attrs={}) => {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k,v]) => e.setAttribute(k,v));
    return e;
  };
  // Closed mouth contours; eyes below use a single round-capped stroked arch.
  function oval(x,y,rx,ry) {
    const k=.55228475;
    return [x,y-ry,x+k*rx,y-ry,x+rx,y-k*ry,x+rx,y,x+rx,y+k*ry,x+k*rx,y+ry,x,y+ry,x-k*rx,y+ry,x-rx,y+k*ry,x-rx,y,x-rx,y-k*ry,x-k*rx,y-ry,x,y-ry];
  }
  function curve(x,y,w,h,thickness) {
    return [x-w,y,x-w*.55,y+h,x+w*.55,y+h,x+w,y,x+w+thickness*.55,y,x+w+thickness*.55,y+thickness,x+w,y+thickness,x+w*.55,y+h+thickness,x-w*.55,y+h+thickness,x-w,y+thickness,x-w-thickness*.55,y+thickness,x-w-thickness*.55,y,x-w,y];
  }
  function path(points) {
    return `M${points[0]},${points[1]} `+Array.from({length:4},(_,i)=>'C'+points.slice(2+i*6,8+i*6).join(' ')).join(' ')+'Z';
  }
  function morph(a,b,t) { return a.map((v,i)=>mix(v,b[i],t)); }
  const poses = [
    // seconds, width, height, grounded shear, left x/y, right x/y
    [0,1,1,0,0,0,0,0], [.65,1.012,.988,.005,-1,1,1,0],
    [1.3,.997,1.003,-.008,0,0,0,1], [2,1,1,0,0,0,0,0],
    [2.2,.963,1.045,0,0,0,0,0], [2.43,1.055,.949,0,-4,6,3,5],
    [2.72,.994,1.008,0,1,-2,1,-4], [3,1,1,0,0,0,2,-10],
    [3.44,1.016,.987,.055,-5,3,21,-117],
    [3.86,1.009,.995,.043,-2,0,49,-134],
    [4.16,1.02,.987,.06,-4,3,-2,-119],
    [4.61,1.009,.996,.042,-1,1,43,-139],
    [4.97,1.018,.99,.054,-5,3,3,-122],
    [5.47,1.008,.998,.038,-2,1,37,-132],
    [5.85,1.013,.993,.05,-4,2,6,-119],
    [6.5,1.003,.998,.025,-1,0,18,-96],
    [6.85,1.013,.988,-.012,1,2,-3,8],
    [7.12,.996,1.005,.006,0,-1,1,-4], [7.5,1,1,0,0,0,0,0],
    [8.18,.70,.84,0,69,36,-69,36], [8.5,.65,.81,0,77,40,-77,40],
    [8.68,1.15,1.09,-.008,-25,-20,23,-24], [8.9,1.08,1.025,0,-17,-12,18,-15],
    [9.1,.98,.96,0,-13,-7,13,-10], [9.46,.12,.16,0,185,65,-185,65],
    [9.58,0,0,0,205,76,-205,76]
  ];
  function poseAt(t) {
    for (let i=1;i<poses.length;i++) {
      if(t<=poses[i][0]) {
        const a=poses[i-1], b=poses[i], u=ease((t-a[0])/(b[0]-a[0]));
        return a.slice(1).map((v,k)=>mix(v,b[k+1],u));
      }
    }
    return poses.at(-1).slice(1);
  }
  async function start() {
    const serial=++generation;
    const response=await fetch('assets/opening/character.svg');
    if(!response.ok) throw new Error('캐릭터 SVG를 불러오지 못했습니다.');
    const doc=new DOMParser().parseFromString(await response.text(),'image/svg+xml');
    if(doc.querySelector('parsererror')) throw new Error('캐릭터 SVG를 읽지 못했습니다.');
    const svg=document.importNode(doc.documentElement,true);
    svg.setAttribute('viewBox','681.91 300.75 560 480');
    svg.setAttribute('aria-hidden','true');
    const body=svg.querySelector('[data-name="몸통"]');
    const left=svg.querySelector('[data-name="왼쪽_팔"]');
    const right=svg.querySelector('[data-name="오른쪽_팔"]');
    // Keep every original body and hand texture/highlight. Only expression geometry changes.
    const face=svgEl('g',{'data-opening-face':''});
    const eyeRects=[...body.querySelectorAll('rect.st3')];
    const eyes=eyeRects.map(rect=> {
      const e=svgEl('path',{fill:'#35ba97'});rect.replaceWith(e);face.append(e);return e;
    });
    const mouth=body.querySelector('path.st3'), originalMouth=mouth.getAttribute('d');face.append(mouth);
    const highlights=[...body.querySelectorAll('.st0')];
    highlights.forEach(h=>face.append(h));body.append(face);
    const defs=svg.querySelector('defs');
    const gradient=svgEl('radialGradient',{id:'openingContact'});
    [['0%','#8dcfc5','.32'],['40%','#b9dbe6','.21'],['72%','#d8cce9','.10'],['100%','#d2f6ec','0']].forEach(([offset,color,opacity])=>gradient.append(svgEl('stop',{offset,'stop-color':color,'stop-opacity':opacity})));
    defs.append(gradient);
    const shadow=svgEl('ellipse',{cx:CX,cy:FLOOR+1,rx:118,ry:12,fill:'url(#openingContact)'});
    svg.insertBefore(shadow,body);
    const dropletColors=['#a5ede0','#c6e5ed','#d9d2eb','#eeedcd'];
    dropletColors.forEach((color,i)=> {
      const gradient=svgEl('radialGradient',{id:`openingDrop${i}`,cx:'35%',cy:'28%',r:'75%'});
      [['0%','#fff','.86'],['28%',color,'.6'],['72%',color,'.82'],['100%','#e2fff8','.62']].forEach(([offset,color,opacity])=>gradient.append(svgEl('stop',{offset,'stop-color':color,'stop-opacity':opacity})));
      defs.append(gradient);
    });
    const droplets=svgEl('g',{'data-opening-droplets':''});svg.append(droplets);
    // A small, deterministic local spray. First droplets leave body/hand edges while they still exist.
    const particles=Array.from({length:17},(_,i)=> {
      const fromHand=i>=12;
      const a=(i*2.39996)-Math.PI;
      const delay=8.99+(i%5)*.046;
      const [sx,sy,shear,lx,ly,rx,ry]=poseAt(delay);
      const by=548+Math.sin(a)*149;
      const x=fromHand?(i%2?1178+rx:741+lx):CX+Math.cos(a)*174*sx+shear*(by-FLOOR);
      const y=fromHand?630+(i%2?ry:ly):FLOOR+(by-FLOOR)*sy;
      const r=5+(i*7%9);
      const g=svgEl('g',{opacity:0});
      g.append(svgEl('ellipse',{rx:r,ry:r,fill:`url(#openingDrop${i%4})`,'fill-opacity':'.82'}));
      g.append(svgEl('ellipse',{cx:-r*.25,cy:-r*.3,rx:r*.3,ry:r*.17,fill:'#fff','fill-opacity':'.8'}));
      droplets.append(g);
      return {g,x,y,r,dx:Math.cos(a)*(45+i%4*12),dy:Math.sin(a)*(42+i%3*12)-24,delay,duration:.89+(i%3)*.09};
    });
    stage.replaceChildren(svg,bubble);
    // Decode all embedded PNG artwork before starting the elapsed-time clock.
    await Promise.all([...svg.querySelectorAll('image')].map(e=>new Promise((resolve,reject)=> {
      const image=new Image();image.onload=resolve;image.onerror=reject;
      image.src=e.getAttributeNS('http://www.w3.org/1999/xlink','href')||e.getAttribute('href');
    })));
    if(document.readyState!=='complete') await new Promise(resolve=>window.addEventListener('load',resolve,{once:true}));
    await document.fonts.load('28px OpeningSaeeum');
    if(serial!==generation) return;
    screen.setAttribute('aria-busy','false');stage.style.opacity=1;
    const smileMouth=curve(963,557,35,24,7.5), oMouth=oval(963,565,8,10);
    const begun=performance.now();
    const welcome='안녕하세요!\n제 포트폴리오에 오신걸 환영해요!';
    const invitation="제 작업물 같이 보러 가실래요? (@’v’@)";
    const greetingStart=7.5, fadeAt=[...welcome].length*.07+1.55;
    const invitationStart=greetingStart+fadeAt+[...welcome].length*.042+.65;
    const choiceStart=invitationStart+[...invitation].length*.07+.45;
    let choiceExitAt=0, choiceAction='';
    let departure=0, departurePose=null, press=null, spring=null, held=false, lastPose=[1,1,0,0,0,0,0];
    let gazeX=0,gazeY=0,targetX=0,targetY=0,lastTime=begun,playStart=0;
    const hands=[{g:left,x:755.52,dx:0,dy:0,pointer:null,release:0},{g:right,x:1164.48,dx:0,dy:0,pointer:null,release:0}];
    const point=e=>{const p=new DOMPoint(e.clientX,e.clientY);return p.matrixTransform(svg.getScreenCTM().inverse());};
    function endPointers(){hands.forEach(h=>{if(h.pointer!==null&&svg.hasPointerCapture(h.pointer))svg.releasePointerCapture(h.pointer);h.pointer=null;});held=false;press=null;}
    function depart(){
      if(!['choice','choiceExit','play'].includes(mode))return;
      departurePose=lastPose.slice();endPointers();mode='depart';screen.dataset.mode=mode;departure=performance.now();
      choices.hidden=true;bubble.hidden=true;dialogue.hidden=true;
    }
    choices.querySelector('[data-answer="yes"]').addEventListener('click',()=>queueChoice('yes'));
    bubble.addEventListener('click',depart);
    function enterPlay(){
      mode='play';screen.dataset.mode=mode;playStart=performance.now();dialogue.hidden=true;choices.hidden=true;bubble.hidden=false;
      bubble.focus({preventScroll:true});
    }
    function queueChoice(action){if(mode!=='choice')return;choiceAction=action;choiceExitAt=performance.now();mode='choiceExit';choices.hidden=true;}
    choices.querySelector('[data-answer="wait"]').addEventListener('click',()=>queueChoice('wait'));
    function look(e){
      if(!canPlay())return;const p=point(e),dx=p.x-CX,dy=p.y-530;
      targetX=Math.max(-22,Math.min(22,dx*.10));targetY=Math.max(-13,Math.min(13,dy*.08));
    }
    window.addEventListener('pointermove',look,{passive:true,signal:playListeners.signal});
    svg.addEventListener('pointerdown',e=>{
      if(!canPlay())return;const p=point(e),hand=hands.find(h=>h.g.contains(e.target));
      if(hand){if(hand.pointer!==null)return;hand.pointer=e.pointerId;hand.origin={x:p.x-hand.dx,y:p.y-hand.dy};hand.release=0;}
      else if(body.contains(e.target)){if(press)return;held=true;spring=null;press={pointer:e.pointerId,start:performance.now(),sy:lastPose[1]};}
      else return;
      e.preventDefault();svg.setPointerCapture(e.pointerId);
    });
    svg.addEventListener('pointermove',e=>{
      if(!canPlay())return;const h=hands.find(h=>h.pointer===e.pointerId);if(!h)return;
      const p=point(e);h.dx=Math.max(-150,Math.min(150,p.x-h.origin.x));h.dy=Math.max(-170,Math.min(145,p.y-h.origin.y));
    });
    function pointerEnd(e){
      const h=hands.find(h=>h.pointer===e.pointerId);
      if(h){h.pointer=null;h.release=performance.now();h.from={x:h.dx,y:h.dy};}
      if(press?.pointer===e.pointerId){held=false;spring={start:performance.now(),sy:lastPose[1]};press=null;}
      if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);
    }
    svg.addEventListener('pointerup',pointerEnd);svg.addEventListener('pointercancel',pointerEnd);svg.addEventListener('lostpointercapture',pointerEnd);
    window.addEventListener('blur',()=>{if(press)pointerEnd({pointerId:press.pointer});hands.forEach(h=>{if(h.pointer!==null)pointerEnd({pointerId:h.pointer});});targetX=targetY=0;},{signal:playListeners.signal});
    svg.addEventListener('pointerleave',()=>{targetX=targetY=0;});
    function tick(now) {
      if(serial!==generation) return;
      const elapsed=(now-begun)/1000;
      const dt=Math.min(.1,(now-lastTime)/1000);lastTime=now;
      let t=mode==='depart'?7.5+Math.max(0,(now-departure)/1000-.35):Math.min(elapsed,7.5);
      let [sx,sy,shear,lx,ly,rx,ry]=poseAt(t);
      if(mode==='intro' && elapsed>=greetingStart){mode='dialogue';screen.dataset.mode=mode;}
      if(['dialogue','choice'].includes(mode)) {
        dialogue.hidden=false;
        if(elapsed<invitationStart){setSentence(welcome);lettering(elapsed-greetingStart,fadeAt);}
        else {setSentence(invitation);lettering(elapsed-invitationStart);}
        if(elapsed>=choiceStart){const entering=mode!=='choice';mode='choice';screen.dataset.mode=mode;choices.hidden=false;if(entering)choices.querySelector('button').focus({preventScroll:true});}
      }
      if(mode==='choiceExit'){lettering(100+(now-choiceExitAt)/1000,100);if(now-choiceExitAt>(letters.length*.042+.35)*1000){if(choiceAction==='wait')enterPlay();else depart();}}
      if(canPlay()) {
        // 77% means 0.77 of ORIGINAL BODY HEIGHT, not a 77% reduction. Hands retain scale 1.
        sy=press?mix(press.sy,.77,1-Math.exp(-(now-press.start)/70)):spring?1+(spring.sy-1)*Math.exp(-(now-spring.start)/190)*Math.cos((now-spring.start)/75):1;
        sx=1+(1-sy)*.46;shear=0;
        hands.forEach(h=>{if(h.release){const age=(now-h.release)/1000,f=Math.exp(-age*6)*Math.cos(age*14);h.dx=h.from.x*f;h.dy=h.from.y*f;if(age>1.8){h.dx=h.dy=0;h.release=0;}}});
        [lx,ly,rx,ry]=[hands[0].dx,hands[0].dy,hands[1].dx,hands[1].dy];
      }
      if(mode==='depart' && now-departure<350){const u=ease((now-departure)/350);[sx,sy,shear,lx,ly,rx,ry]=departurePose.map((v,i)=>mix(v,[1,1,0,0,0,0,0][i],u));}
      lastPose=[sx,sy,shear,lx,ly,rx,ry];
      const tremble=ease((t-7.95)/.25)*(1-ease((t-8.48)/.12));
      shear+=Math.sin(t*87)*.004*tremble;
      body.setAttribute('transform',`matrix(${sx} 0 ${shear} ${sy} ${CX*(1-sx)-shear*FLOOR} ${FLOOR*(1-sy)})`);
      body.setAttribute('opacity',String(1-ease((t-9.43)/.15)));
      const arrival=ease(t/.55);svg.style.opacity=arrival;
      const handScale=mode!=='depart'?1:mix(1,.75,ease((t-7.5)/.8));
      const vanish=1-ease((t-9.18)/.4);
      [[left,755.52,lx,ly,0],[right,1164.48,rx,ry,.09]].forEach(([hand,x,dx,dy,lag])=>{
        // Velocity-linked hand deformation, delayed behind the grounded body.
        const before=poseAt(Math.max(0,t-.035-lag));const after=poseAt(Math.max(0,t-lag));
        const speed=(after[x<CX?4:6]-before[x<CX?4:6])/.035;
        const stretch=t>=7.5&&mode!=='depart'?0:Math.min(.13,Math.abs(speed)*.00065);
        const scale=handScale*vanish;
        hand.setAttribute('transform',`translate(${x+dx} ${641.89+dy}) scale(${scale*(1+stretch)} ${scale/(1+stretch)}) translate(${-x} -641.89)`);
        hand.setAttribute('opacity',String(1-ease((t-9.46)/.14)));
      });
      let gaze=t<.65?0:t<1.08?mix(0,-6,ease((t-.65)/.22)):t<1.7?mix(-6,6,ease((t-1.08)/.28)):mix(6,0,ease((t-1.7)/.25));
      const blink=ease((t-1.43)/.075)*(1-ease((t-1.53)/.10));
      const surprise=ease((t-2)/.2)*(1-ease((t-2.75)/.35));
      const speaking=mode==='dialogue';
      const chuckle=speaking?Math.pow(Math.max(0,Math.sin((elapsed-7.5)*2.25)),6):mode==='play'?Math.pow(Math.max(0,Math.sin((now-playStart)/1000*1.6)),12)*.8:0;
      const happy=t<7.5?ease((t-2.85)/.4):mode==='depart'?ease((now-departure)/350):Math.max(1-ease((elapsed-7.5)/.45),chuckle);
      const squeeze=mode==='depart'?ease((t-7.5)/.38):0;
      const smoothing=1-Math.exp(-dt*12);gazeX=mix(gazeX,canPlay()?targetX:0,smoothing);gazeY=mix(gazeY,canPlay()?targetY:0,smoothing);
      if(canPlay())gaze=0;
      eyes.forEach((eye,i)=> {
        const x=i?1004.155:919.655;
        // One stroked cubic: rounded vertical capsule -> simple arch. No filled outline to fold over.
        const neutral=[x,517.705,x,522.11,x,526.52,x,530.925];
        const round=[x,515.5,x,520.5,x,525.5,x,530.5];
        const arch=[x-10,526,x-6,511,x+6,511,x+10,526];
        const tight=[x-10,525,x-5,516,x+5,516,x+10,525];
        let points=morph(neutral,round,surprise);
        points=morph(points,arch,happy);points=morph(points,tight,squeeze);
        points=points.map((v,k)=>k%2?524.315+(v-524.315)*(1-blink*.94):v+gaze);
        eye.setAttribute('fill','none');eye.setAttribute('stroke','#35ba97');eye.setAttribute('stroke-linecap','round');
        eye.setAttribute('stroke-width',String(mix(mix(21.77,25,surprise),16,Math.max(happy,squeeze))*(1-blink*.86)));
        eye.setAttribute('d',`M${points[0]} ${points[1]} C${points.slice(2).join(' ')}`);
      });
      mouth.setAttribute('d',surprise>0?path(morph(smileMouth,oMouth,surprise)):originalMouth);
      const talk=speaking?1+.10*Math.sin(elapsed*9)*Math.sin(elapsed*2.7):1;
      mouth.setAttribute('transform',`translate(963 568) scale(1 ${talk}) translate(-963 -568)`);
      highlights.forEach(h=> {
        h.setAttribute('opacity',String((1-happy)*(1-blink)*(1-squeeze)));
        h.setAttribute('transform',`translate(${gaze} 0)`);
      });
      face.setAttribute('transform',`translate(${shear*-30+gazeX} ${gazeY})`);
      shadow.setAttribute('cx',String(CX+shear*-45));
      shadow.setAttribute('rx',String(118*sx+ease((t-9)/.75)*54));
      shadow.setAttribute('ry',String(12+ease((t-9)/.75)*5));
      shadow.setAttribute('opacity',String(1-ease((t-9.08)/1.12)));
      particles.forEach(p=> {
        const u=clamp((t-p.delay)/p.duration), flight=1-Math.pow(1-u,2);
        const scale=(1-ease((u-.4)/.6))*(u===0?0:1);
        const stretch=1+.8*(1-ease(u/.42));
        const angle=Math.atan2(p.dy,p.dx)*180/Math.PI;
        p.g.setAttribute('opacity',String((1-ease((u-.52)/.48))*(u>0?1:0)));
        p.g.setAttribute('transform',`translate(${p.x+p.dx*flight} ${p.y+p.dy*flight+38*u*u}) rotate(${angle}) scale(${scale*stretch} ${scale/stretch})`);
      });
      screen.dataset.interactive=String(canPlay());
      screen.dataset.phase=mode==='play'?'play':mode==='choice'?'choice':['dialogue','choiceExit'].includes(mode)?'dialogue':t<2?'look':t<3?'discover':t<6.5?'wave':t<7.5?'settle':t<8.5?'gather':t<9?'expand':t<10.5?'droplets':'white';
      // All spray and contact light are gone by 10.5s, then hold pure white for 1.5s.
      if(t>=10.5) svg.style.visibility='hidden';
      if(mode==='depart' && t>=12) {
        playListeners.abort();
        stage.replaceChildren();screen.dataset.phase='complete';release();
        show('profileScreen');document.querySelector('.corner').style.display='block';
        return;
      }
      frame=requestAnimationFrame(tick);
    }
    frame=requestAnimationFrame(tick);
  }
  start().catch(error=> {
    console.error('Opening:',error);
    document.querySelector('#openingStatus').textContent='캐릭터를 불러오지 못했습니다. 페이지를 새로고침해 주세요.';
  });
})();
