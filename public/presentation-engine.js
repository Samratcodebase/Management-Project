
(function(){
  if (window.__presentationDestroy) window.__presentationDestroy();
  var lifecycle = new AbortController();
  var signal = lifecycle.signal;
  var timers = new Set();
  function later(fn, ms) { var id = setTimeout(function(){ timers.delete(id); fn(); }, ms); timers.add(id); return id; }
  function cancelLater(id) { clearTimeout(id); timers.delete(id); }
  var frames = new Set();
  function frame(fn) { var id = requestAnimationFrame(function(ts){ frames.delete(id); fn(ts); }); frames.add(id); return id; }
  var dustFrame = 0;
  var IMG = {"blobs_a":"/assets/blobs_a.webp","blobs_b":"/assets/blobs_b.webp","sphere":"/assets/sphere.webp","torus_anim":"/assets/torus_anim.webp","capsule_anim":"/assets/capsule_anim.webp","cube_anim":"/assets/cube_anim.webp","twist_anim":"/assets/twist_anim.webp"};
  // objects: name -> [image, float duration, spin]
  var OBJ = {
    blobA:["blobs_a",13,0,1], blobB:["blobs_b",11,0,1],
    torus:["torus_anim",7,0], sphere:["sphere",8,0], capsule:["capsule_anim",6.5,0], cube:["cube_anim",9,0], twist:["twist_anim",7.5,0],
    pearl:["sphere",6,0], ring:["torus_anim",8.5,0]
  };
  // pose per slide: [x, y, width, rotate, opacity]   (x,y = centre on 1920x1080 stage)
  var P = [
   {blobA:[1180,520,1500,0,.95],blobB:[620,380,1100,40,.55],torus:[1540,330,420,-18,1],sphere:[1650,800,300,0,1],capsule:[1300,990,200,60,1],cube:[1850,170,150,18,1],twist:[-70,600,200,12,1],pearl:[1240,150,90,0,1],ring:[1880,560,120,40,1]},
   {blobA:[400,760,1300,60,.75],blobB:[1500,260,1000,-20,.6],torus:[560,840,340,30,1],sphere:[160,800,170,0,1],capsule:[1990,700,180,-30,0],cube:[1880,165,140,40,1],twist:[-40,140,220,-10,.95],pearl:[960,120,70,0,1],ring:[1880,580,110,10,1]},
   {blobA:[1500,700,1200,120,.7],blobB:[300,200,900,10,.55],torus:[1730,245,300,10,1],sphere:[20,570,160,0,1],capsule:[960,1110,200,80,1],cube:[1500,110,110,-20,1],twist:[1990,950,200,30,0],pearl:[1300,90,60,0,1],ring:[1890,560,130,-30,1]},
   {blobA:[1650,300,1200,180,.7],blobB:[200,900,900,90,.55],torus:[1700,245,300,-30,1],sphere:[1950,960,160,0,1],capsule:[1390,170,180,-60,1],cube:[1990,620,130,70,0],twist:[-120,1010,200,-20,0],pearl:[1190,110,60,0,1],ring:[-10,900,130,60,1]},
   {blobA:[960,640,1600,240,.8],blobB:[1500,200,900,30,.5],torus:[1660,265,340,25,1],sphere:[1450,950,170,0,1],capsule:[520,960,170,80,1],cube:[1310,170,130,10,1],twist:[-120,300,200,40,0],pearl:[1200,100,70,0,1],ring:[1880,700,120,-40,1]},
   {blobA:[1400,600,1300,300,.7],blobB:[400,300,900,0,.5],torus:[1650,225,260,40,1],sphere:[1500,930,170,0,1],capsule:[1100,920,150,-70,1],cube:[1180,150,110,-30,1],twist:[1990,560,180,0,0],pearl:[1400,90,60,0,1],ring:[1880,560,110,20,1]},
   {blobA:[700,520,1400,0,.75],blobB:[1600,800,1000,120,.55],torus:[1700,330,360,-10,1],sphere:[1500,960,160,0,1],capsule:[2000,180,190,-35,0],cube:[1520,155,120,20,1],twist:[1990,120,180,30,0],pearl:[1880,600,80,0,1],ring:[-20,700,120,-50,1]},
   {blobA:[960,470,1500,60,.75],blobB:[300,900,900,200,.5],torus:[1680,255,320,-40,1],sphere:[1450,980,150,0,1],capsule:[1990,980,200,20,0],cube:[1320,130,110,40,1],twist:[-120,980,190,-30,0],pearl:[1880,480,80,0,1],ring:[-10,600,120,0,1]},
   {blobA:[520,640,1300,140,.8],blobB:[1500,400,900,-30,.55],torus:[1700,225,260,20,1],sphere:[1250,1000,140,0,1],capsule:[2000,160,170,-50,0],cube:[1300,140,110,-10,1],twist:[-120,990,180,10,0],pearl:[1500,100,60,0,1],ring:[-10,650,120,30,1]},
   {blobA:[1380,560,1300,200,.75],blobB:[420,620,1000,60,.55],torus:[1690,225,260,-10,1],sphere:[1450,950,150,0,1],capsule:[-120,120,180,60,0],cube:[1880,860,130,25,1],twist:[-120,1000,200,-40,0],pearl:[1550,125,60,0,1],ring:[1990,600,110,10,0]},
   {blobA:[960,760,1500,320,.8],blobB:[1500,200,900,0,.5],torus:[1650,245,300,30,1],sphere:[1500,920,170,0,1],capsule:[700,930,160,-70,1],cube:[1150,150,120,-15,1],twist:[1990,620,170,30,0],pearl:[1880,380,70,0,1],ring:[-120,180,100,-30,0]},
   {blobA:[1450,620,1400,30,.8],blobB:[450,300,900,140,.5],torus:[1700,225,260,0,1],sphere:[1500,920,180,0,1],capsule:[500,920,160,40,1],cube:[1450,120,100,60,1],twist:[-120,160,180,20,0],pearl:[1000,900,70,0,1],ring:[1880,560,110,-20,1]},
   {blobA:[600,560,1400,90,.75],blobB:[1500,780,1000,-60,.55],torus:[1600,275,360,-20,1],sphere:[1990,950,180,0,0],capsule:[1350,330,170,30,1],cube:[1100,180,140,-30,1],twist:[-30,300,180,20,1],pearl:[1850,130,70,0,1],ring:[950,380,90,30,1]},
   {blobA:[1450,520,1400,10,.95],blobB:[600,500,1100,80,.55],torus:[1560,245,300,-14,1],sphere:[1820,250,180,0,1],capsule:[2000,180,170,24,0],cube:[1350,140,110,-20,1],twist:[1060,1120,170,8,0],pearl:[1300,330,70,0,1],ring:[1880,960,120,40,1]},
   {blobA:[960,500,1700,40,1],blobB:[960,560,1300,200,.7],torus:[1770,250,240,-16,1],sphere:[300,820,240,0,1],capsule:[1640,820,170,28,1],cube:[170,240,130,-18,1],twist:[100,560,150,14,.95],pearl:[1500,190,60,0,1],ring:[1840,600,110,30,1]}
  ];
  var world=document.getElementById('world'), els={};
  var ASP={"blobs_a": 1.0, "blobs_b": 1.0, "sphere": 1.0, "torus_anim": 1.0, "capsule_anim": 1.0387, "cube_anim": 0.975, "twist_anim": 0.8819};
  Object.keys(OBJ).forEach(function(k){
    var o=OBJ[k], d=document.createElement('div'); d.className='ob'+(o[3]?' blob':'');
    var base=o[3]?1000:400; d.style.width=base+'px'; d._b=base; d._a=ASP[o[0]]||1;
    var T={blobA:[2.1,0],blobB:[2.3,60],torus:[1.5,0],sphere:[1.6,40],capsule:[1.75,90],cube:[1.85,60],twist:[1.8,120],pearl:[2,140],ring:[1.95,100]}[k];
    d.style.transitionDuration=T[0]+'s,'+Math.min(T[0],1.2)+'s'; d.style.transitionDelay=T[1]+'ms,0ms';
    d.style.setProperty('--fd',o[1]+'s');
    d.innerHTML='<div class="fl"><img alt="" src="'+IMG[o[0]]+'"></div>';
    world.appendChild(d); els[k]=d;
  });
  // glass lenses that float over the 3D objects (real backdrop blur), derived from object poses
  var LENS={lensA:{src:'torus',shape:'round',dx:.36,dy:.34,w:.62,h:.62,r:0,fd:9}};
  Object.keys(LENS).forEach(function(k){
    var L=LENS[k], d=document.createElement('div'); d.className='lens '+L.shape;
    d.style.width='300px'; d.style.height=(300*L.h/L.w)+'px'; d.style.setProperty('--fd',L.fd+'s');
    d.innerHTML='<i></i>'; world.appendChild(d); L.el=d;
  });
  function place(e,x,y,w,h0,r,o,instant){
    if(instant){e.style.transition='none';}
    var b=e._b||300, sc=w/b;
    e.style.transform='translate3d('+(x-b/2)+'px,'+(y-h0/2)+'px,0) rotate('+r+'deg) scale('+sc.toFixed(4)+')';
    e.style.opacity=o;
    if(instant){e.offsetWidth; e.style.transition='';}
  }
  function pose(i, instant){
    var p=P[i];
    Object.keys(els).forEach(function(k){
      var v=p[k], e=els[k];
      place(e,v[0],v[1],v[2],e._b*e._a,v[3],v[4],instant);
    });
    Object.keys(LENS).forEach(function(k){
      var L=LENS[k], v=p[L.src], w=v[2]*L.w, on=v[4]>0 && v[0]>60 && v[0]<1860 && v[1]>60 && v[1]<1020;
      L.el._b=300; place(L.el, v[0]+v[2]*L.dx, v[1]+v[2]*L.dy, w, 300*L.h/L.w, L.r+v[3]*.3, on?1:0, instant);
    });
  }
  // cover title: per-letter rise
  (function(){
    [].forEach.call(document.querySelectorAll('[data-chars]'),function(t){
      var d=parseInt(t.style.getPropertyValue('--d'))||0, step=+(t.getAttribute('data-step')||38), txt=t.textContent; t.textContent='';
      for(var c=0;c<txt.length;c++){ var sp=document.createElement('span'); sp.className='ch'; sp.textContent=txt[c]; sp.style.setProperty('--c',c*step/38); sp.style.setProperty('--d',d); t.appendChild(sp); }
    });
  })();
  // numbers that count up when their slide appears
  function countUp(s){
    [].forEach.call(s.querySelectorAll('[data-to]'),function(el){
      var a=+el.getAttribute('data-from'), b=+el.getAttribute('data-to'), t0=null, dur=1600, delay=700;
      el.textContent=a;
      function step(ts){ if(t0===null) t0=ts; var k=Math.min(1,Math.max(0,(ts-t0-delay)/dur)); k=1-Math.pow(1-k,4);
        el.textContent=Math.round(a+(b-a)*k); if(k<1) frame(step); }
      frame(step);
    });
  }
  var sweep=document.getElementById('sweep');
  // cards tilt toward the pointer with a moving glare
  [].forEach.call(document.querySelectorAll('.card.glass,.chip.glass,.row.glass,.new.glass,.hawk.glass,.accept.glass,.thanks.glass,.nm.glass'),function(c){
    c.addEventListener('mousemove',function(e){
      var r=c.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
      if(!c.closest('.slide.active')) return;
      c.classList.add('tilt'); c.style.setProperty('--gx',(x*100)+'%'); c.style.setProperty('--gy',(y*100)+'%');
      c.style.transform='perspective(1000px) rotateX('+((.5-y)*9).toFixed(2)+'deg) rotateY('+((x-.5)*11).toFixed(2)+'deg) translateZ(10px)';
    }, { signal: signal });
    c.addEventListener('mouseleave',function(){ c.style.transform=''; later(function(){c.classList.remove('tilt');},350); }, { signal: signal });
  });
  function gradChars(){
    [].forEach.call(document.querySelectorAll('.tyw'),function(el){
      var w=el.offsetWidth, x0=el.offsetLeft;
      [].forEach.call(el.querySelectorAll('.ch'),function(c){ c.style.backgroundSize=w+'px 100%'; c.style.backgroundPosition=(-(c.offsetLeft-x0))+'px 0'; });
    });
  }
  // stardust on the finale
  var dust=document.getElementById('dust'), dctx=dust&&dust.getContext('2d'), dOn=false, parts=[];
  for(var q=0;q<140;q++){ parts.push({x:Math.random()*1920,y:Math.random()*1080,r:.6+Math.random()*2.6,v:.15+Math.random()*.55,ph:Math.random()*6.28,c:['201,184,255','255,155,203','255,255,255','142,155,255'][q%4]}); }
  function dustLoop(){
    if(!dOn) return;
    dctx.clearRect(0,0,1920,1080);
    var t=performance.now()/1000;
    for(var q=0;q<parts.length;q++){ var p=parts[q];
      p.y-=p.v; p.x+=Math.sin(t*.6+p.ph)*.25; if(p.y<-10){p.y=1090;p.x=Math.random()*1920;}
      var a=.35+.45*Math.sin(t*1.6+p.ph);
      var g=dctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4); g.addColorStop(0,'rgba('+p.c+','+a.toFixed(3)+')'); g.addColorStop(1,'rgba('+p.c+',0)');
      dctx.fillStyle=g; dctx.beginPath(); dctx.arc(p.x,p.y,p.r*4,0,6.283); dctx.fill(); }
    dustFrame=frame(dustLoop);
  }
  function setDust(on){ if(!dctx) return; if(on&&!dOn){dOn=true;dustFrame=frame(dustLoop);} if(!on){dOn=false;} }


  var slides=[].slice.call(document.querySelectorAll('.slide')), N=slides.length, cur=-1, pend;
  var segs=document.getElementById('segs'); for(var i=0;i<N;i++){segs.appendChild(document.createElement('i'));}
  var segEls=segs.children, who=document.getElementById('who'), counter=document.getElementById('counter');
  function pad(n){return (n<10?'0':'')+n;}
  function go(i, instant){
    if(i<0||i>=N||i===cur) return;
    var prev=cur>=0?slides[cur]:null; cur=i;
    cancelLater(pend);
    slides.forEach(function(x){ if(x!==prev){ x.classList.remove('active','leaving'); } });
    if(prev){prev.classList.remove('active');prev.classList.add('leaving');later(function(){ if(slides[cur]!==prev) prev.classList.remove('leaving');},560);}
    var s=slides[i];
    pend=later(function(){ if(cur===i){ s.classList.remove('leaving'); s.classList.add('active'); countUp(s); } }, prev?300:60);
    if(matchMedia('(max-width: 760px) and (orientation: portrait)').matches) s.scrollTop=0;
    setDust(s.id==='s15');
    pose(i, instant);
    if(prev && sweep){ sweep.classList.remove('go'); void sweep.offsetWidth; sweep.classList.add('go'); }
    for(var k=0;k<N;k++) segEls[k].classList.toggle('on',k<=i);
    who.textContent=s.getAttribute('data-who'); counter.textContent=pad(i+1)+' / '+N;
    try{ history.replaceState(null,'','#slide-'+(i+1)); }catch(e){}
  }
  function next(){go(cur+1);} function prev(){go(cur-1);}

  // scale stage
  var stage=document.getElementById('stage');
  function fit2(){
    if(matchMedia('(max-width: 760px) and (orientation: portrait)').matches){
      stage.style.width='100vw'; stage.style.height='100dvh'; stage.style.left='0'; stage.style.top='0'; stage.style.transform='none';
      return;
    }
    stage.style.width='1920px'; stage.style.height='1080px';
    var k=Math.min(innerWidth/1920, innerHeight/1080); stage.style.left=((innerWidth-1920*k)/2)+'px'; stage.style.top=((innerHeight-1080*k)/2)+'px'; stage.style.transform='scale('+k+')';
  }
  addEventListener('resize',function(){fit2();fitTitles();gradChars();},{signal:signal}); fit2();

  document.addEventListener('keydown',function(e){
    if(e.repeat) return;
    var k=e.key;
    if(k==='ArrowRight'||k==='PageDown'||k===' '||k==='Enter'||k==='ArrowDown'){e.preventDefault();next();}
    else if(k==='ArrowLeft'||k==='PageUp'||k==='Backspace'||k==='ArrowUp'){e.preventDefault();prev();}
    else if(k==='Home'){go(0);} else if(k==='End'){go(N-1);}
    else if(k==='f'||k==='F'){toggleFs();}
    wake();
  }, {signal:signal});
  stage.addEventListener('click',function(){if(!matchMedia('(pointer: coarse)').matches) next();},{signal:signal});
  document.getElementById('next').addEventListener('click',function(e){e.stopPropagation();next();},{signal:signal});
  document.getElementById('prev').addEventListener('click',function(e){e.stopPropagation();prev();},{signal:signal});
  document.getElementById('fs').addEventListener('click',function(e){e.stopPropagation();toggleFs();},{signal:signal});
  function toggleFs(){
    try{ if(!document.fullscreenElement){ var r=document.documentElement.requestFullscreen(); if(r&&r.catch) r.catch(function(){}); } else { document.exitFullscreen(); } }catch(err){}
  }
  var tx=null; stage.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;},{passive:true,signal:signal});
  stage.addEventListener('touchend',function(e){ if(tx===null) return; var dx=e.changedTouches[0].clientX-tx; if(Math.abs(dx)>40){ dx<0?next():prev(); } tx=null; },{signal:signal});

  // idle: hide HUD + cursor
  var hud=document.getElementById('hud'), hint=document.getElementById('hint'), t;
  function wake(){hud.classList.remove('hide');stage.classList.remove('idle');cancelLater(t);if(!matchMedia('(pointer: coarse)').matches)t=later(function(){hud.classList.add('hide');stage.classList.add('idle');},2600);}
  addEventListener('pointerdown',wake,{signal:signal});
  addEventListener('mousemove',wake,{signal:signal}); wake();
  later(function(){hint.classList.add('gone');},5000);

  // keep display titles inside their column whichever font loads
  function fitTitles(){
    [].forEach.call(document.querySelectorAll('.disp'),function(h){
      h.style.fontSize='';
      var spans=h.querySelectorAll('.ln > span'), w=h.clientWidth, max=0;
      [].forEach.call(spans,function(s){ s.style.whiteSpace='nowrap'; max=Math.max(max,s.offsetWidth); });
      if(max>w && w>0){ var fs=parseFloat(getComputedStyle(h).fontSize); h.style.fontSize=Math.floor(fs*w/max*0.98)+'px'; }
    });
  }
  fitTitles(); gradChars(); if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){fitTitles();gradChars();});} 
  var start=0, m=/#slide-(\d+)/.exec(location.hash); if(m){start=Math.max(0,Math.min(N-1,parseInt(m[1],10)-1));}
  go(start,true);
  addEventListener('hashchange',function(){ var m=/#slide-(\d+)/.exec(location.hash); if(m){ go(Math.max(0,Math.min(N-1,parseInt(m[1],10)-1))); } },{signal:signal});

  // Explicit teardown keeps React remounts and hot reloads from stacking listeners.
  window.__presentationDestroy = function(){
    lifecycle.abort();
    timers.forEach(clearTimeout);
    timers.clear();
    frames.forEach(cancelAnimationFrame);
    frames.clear();
    dOn=false;
    if(window.__presentationDestroy) delete window.__presentationDestroy;
  };
})();
