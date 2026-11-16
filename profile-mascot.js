/* Reuse the uploaded jelly artwork behind the profile card. */
(() => {
  const host=document.querySelector('.profile-mascot');
  const profile=document.querySelector('#profileScreen');
  let svg,face,frame=0,entered=0,active=false,x=0,y=0;
  const pointer={x:innerWidth/2,y:innerHeight/2};
  addEventListener('pointermove',e=>{pointer.x=e.clientX;pointer.y=e.clientY;},{passive:true});
  function tick(now){
    if(!active||!svg)return;
    const matrix=svg.getScreenCTM();
    if(!matrix)return;
    const origin=new DOMPoint(961.91,524.315).matrixTransform(matrix);
    const photo=document.querySelector('.profile-picture').getBoundingClientRect();
    const lookingAtPhoto=now-entered<2000;
    host.dataset.gaze=lookingAtPhoto?'portrait':'cursor';
    const tx=lookingAtPhoto?photo.left+photo.width*.5:pointer.x;
    const ty=lookingAtPhoto?photo.top+photo.height*.35:pointer.y;
    const dx=tx-origin.x,dy=ty-origin.y,d=Math.hypot(dx,dy)||1;
    const strength=Math.min(1,d/160);
    x+=((dx/d)*13*strength-x)*.18;y+=((dy/d)*10*strength-y)*.18;
    face.setAttribute('transform',`translate(${x} ${y-24})`);
    frame=requestAnimationFrame(tick);
  }
  function enter(){cancelAnimationFrame(frame);active=true;entered=performance.now();x=y=0;frame=requestAnimationFrame(tick);}
  document.addEventListener('portfolio:view',e=>{
    active=e.detail.id==='profileScreen';cancelAnimationFrame(frame);
    if(active&&svg)enter();
  });
  fetch('assets/opening/character.svg').then(r=>{if(!r.ok)throw Error('Profile character load failed');return r.text();}).then(text=>{
    const doc=new DOMParser().parseFromString(text,'image/svg+xml');
    if(doc.querySelector('parsererror'))throw Error('Invalid profile character SVG');
    svg=document.importNode(doc.documentElement,true);svg.setAttribute('viewBox','681.91 340 560 230');
    face=document.createElementNS('http://www.w3.org/2000/svg','g');face.setAttribute('data-profile-gaze','');
    const body=svg.querySelector('[data-name="몸통"]');
    [...body.querySelectorAll('rect.st3,.st0')].forEach(eye=>face.append(eye));body.append(face);
    svg.querySelectorAll('[data-name$="팔"]').forEach(hand=>hand.setAttribute('transform','translate(0 -100)'));
    host.replaceChildren(svg);if(profile.classList.contains('active'))enter();
  }).catch(error=>console.error(error));
  addEventListener('pagehide',()=>{active=false;cancelAnimationFrame(frame);},{once:true});
})();
