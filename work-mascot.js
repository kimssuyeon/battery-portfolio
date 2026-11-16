/* The same uploaded jelly, without a mouth, watches the cursor beneath WORK. */
(() => {
  const host=document.querySelector('.work-mascot');
  let svg,eyes,frame=0,active=false,last=0,x=0,y=0;
  const pointer={x:innerWidth/2,y:innerHeight/2};
  addEventListener('pointermove',e=>{pointer.x=e.clientX;pointer.y=e.clientY;},{passive:true});
  function tick(now){
    if(!active||!svg)return;
    const matrix=svg.getScreenCTM();if(!matrix)return;
    const origin=new DOMPoint(961.91,524.315).matrixTransform(matrix);
    const dx=pointer.x-origin.x,dy=pointer.y-origin.y,d=Math.hypot(dx,dy)||1;
    const strength=Math.min(1,d/150),blend=1-Math.exp(-Math.min(.1,(now-last)/1000)*12);last=now;
    x+=((dx/d)*17*strength-x)*blend;y+=((dy/d)*12*strength-y)*blend;
    eyes.setAttribute('transform',`translate(${x} ${y})`);
    frame=requestAnimationFrame(tick);
  }
  function update(){active=document.body.dataset.view==='portfolioScreen';cancelAnimationFrame(frame);if(active&&svg){last=performance.now();frame=requestAnimationFrame(tick);}}
  document.addEventListener('portfolio:view',update);
  fetch('assets/opening/character.svg').then(r=>{if(!r.ok)throw Error('WORK character load failed');return r.text();}).then(text=>{
    const doc=new DOMParser().parseFromString(text,'image/svg+xml');
    if(doc.querySelector('parsererror'))throw Error('Invalid WORK character SVG');
    svg=document.importNode(doc.documentElement,true);svg.setAttribute('viewBox','681.91 340 560 400');
    const body=svg.querySelector('[data-name="몸통"]');body.querySelector('path.st3').remove();
    eyes=document.createElementNS('http://www.w3.org/2000/svg','g');eyes.setAttribute('data-work-gaze','');
    [...body.querySelectorAll('rect.st3,.st0')].forEach(e=>eyes.append(e));body.append(eyes);
    svg.querySelectorAll('[data-name$="팔"]').forEach(e=>e.remove());
    host.replaceChildren(svg);update();
  }).catch(error=>console.error(error));
  addEventListener('pagehide',()=>{active=false;cancelAnimationFrame(frame);},{once:true});
})();
