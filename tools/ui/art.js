'use strict';
/* LumaRaf · kodla çizilen piksel sanat. Tüm koordinatlar 160×200 sahne pikselidir (R-GRS-01).
   Her eşya çizimi (g, x, y, look, t, extra) imzasını kullanır; x,y eşyanın kutusunun sol üstüdür. */

const Art = (()=>{
  const R=(g,x,y,w,h,c)=>{ if(w<=0||h<=0) return; g.fillStyle=c; g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); };
  const P=(g,x,y,c)=>R(g,x,y,1,1,c);
  const DK=a=>`rgba(0,0,0,${a})`, LT=a=>`rgba(255,240,220,${a})`;
  function hexA(hex,a){ const n=parseInt(hex.slice(1),16); return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`; }
  function line(g,x0,y0,x1,y1,c){ // Bresenham
    x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
    const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let e=dx+dy;
    for(;;){P(g,x0,y0,c);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}
  }
  function ellipse(g,cx,cy,rx,ry,c){
    for(let y=-ry;y<=ry;y++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry+.01))));R(g,cx-w,cy+y,w*2+1,1,c);}
  }
  function glow(g,cx,cy,r,color,a){
    const gr=g.createRadialGradient(cx,cy,0,cx,cy,r);
    gr.addColorStop(0,hexA(color,a)); gr.addColorStop(.45,hexA(color,a*.45)); gr.addColorStop(1,hexA(color,0));
    const prev=g.globalCompositeOperation; g.globalCompositeOperation='lighter';
    g.fillStyle=gr; g.fillRect(cx-r,cy-r,r*2,r*2); g.globalCompositeOperation=prev;
  }
  // Şablon: karakter → renk eşlemesi ile piksel dizisi
  function sprite(g,x,y,rows,map,flip=false){
    rows.forEach((row,j)=>{ for(let i=0;i<row.length;i++){ const ch=row[flip?row.length-1-i:i]; const c=map[ch]; if(c) P(g,x+i,y+j,c); } });
  }

  /* ---------------- Manzara ---------------- */
  function sky(g,x,y,w,h,mode){
    const bands = mode==='dusk' ? [C.plum,'#6e4560',C.berry,C.rose,C.tan] : [C.sky0,C.sky1,C.sky2,C.navy];
    const bh=Math.ceil(h/bands.length);
    bands.forEach((c,i)=>R(g,x,y+i*bh,w,bh+1,c));
  }
  function view(g,x,y,w,h,look,t,env){
    g.save(); g.beginPath(); g.rect(x,y,w,h); g.clip();
    const rnd=rng(hash(look.kind+w+'x'+h));
    sky(g,x,y,w,h,env.sky);
    const night=env.sky!=='dusk';
    if(env.weather==='clear'&&night){ for(let i=0;i<w*h/90;i++) P(g,x+rnd()*w,y+rnd()*h*.6,(i%5===0)?C.gold:C.taupe); }
    if(env.weather!=='rain'){ ellipse(g,x+w*.78,y+h*.16,3,3,night?C.cream:C.gold); }
    if(look.kind==='city'||look.kind==='sakura'){
      // uzak bloklar
      let bx=x-2; while(bx<x+w){ const bw=6+Math.floor(rnd()*10), bhh=h*.25+rnd()*h*.35; R(g,bx,y+h-bhh,bw,bhh,'#1c2034'); bx+=bw+1; }
      // yakın bloklar ve pencereler
      bx=x-3; while(bx<x+w){
        const bw=10+Math.floor(rnd()*14), bhh=h*.18+rnd()*h*.42, top=y+h-bhh;
        R(g,bx,top,bw,bhh,look.kind==='sakura'?'#2b2238':C.navy); R(g,bx,top,bw,1,'#3a3f5c');
        for(let wy=top+3;wy<y+h-2;wy+=4) for(let wx=bx+2;wx<bx+bw-2;wx+=3){
          const r=rnd(); const on=r<.38 && ((Math.floor(t/7+r*30))%9!==0);
          P(g,wx,wy,on?(r<.12?C.lamp:C.gold):'#22263a'); if(on) P(g,wx,wy+1,hexA(C.ochre,.7));
        }
        bx+=bw+1;
      }
      if(look.kind==='sakura'){
        for(let i=0;i<4;i++){ const tx=x+8+i*(w/4)+rnd()*4, ty=y+h-6; R(g,tx,ty-12,2,12,C.wood1);
          ellipse(g,tx+1,ty-16,8,6,C.berry); ellipse(g,tx+1,ty-17,7,5,C.pink); for(let k=0;k<8;k++)P(g,tx-5+rnd()*12,ty-20+rnd()*8,C.cream); }
        R(g,x,y+h-3,w,3,'#3a2e3e');
      }
    } else if(look.kind==='harbor'){
      const sea=y+Math.round(h*.62);
      R(g,x,sea-6,w,6,'#1a1f30'); for(let i=0;i<w;i+=7) R(g,x+i,sea-6-rnd()*5,7,6,'#1a1f30');
      R(g,x,sea,w,y+h-sea,'#18233a');
      for(let yy=sea+2;yy<y+h;yy+=3) for(let i=0;i<w;i+=6) R(g,x+i+((yy+Math.floor(t*2))%6),yy,3,1,'#24324d');
      const lx=x+w*.82; R(g,lx,sea-22,4,22,C.cream); R(g,lx,sea-14,4,3,C.rust); R(g,lx-1,sea-25,6,3,C.slate);
      const beam=(Math.sin(t*1.4)+1)/2; glow(g,lx+2,sea-23,10+beam*8,C.gold,.55);
      for(let i=0;i<3;i++){ const bx=x+8+i*w*.22; R(g,bx,sea+4+i*3,7,2,C.wood1); P(g,bx+3,sea+3+i*3,C.lamp); R(g,bx+3,sea+7+i*3,1,4,hexA(C.lamp,.35)); }
    } else if(look.kind==='forest'){
      ellipse(g,x+w*.3,y+h*.22,5,5,C.cream);
      const layer=(base,col,step,hh)=>{ for(let i=-4;i<w+6;i+=step){ const th=hh*(.7+rnd()*.5), px=x+i; for(let k=0;k<th;k++){ const half=Math.floor((k/th)*step*.7); R(g,px-half,y+h-th+k-(base),half*2+1,1,col);} } };
      layer(10,'#1b2a2a',7,h*.5); layer(4,'#162420',9,h*.55); layer(0,'#0f1a16',11,h*.45);
      R(g,x,y+h*.72,w,2,hexA(C.taupe,.12));
    }
    // hava
    if(env.weather==='rain'&&env.anim!==false){
      const n=Math.floor(w*h/55); const rr=rng(77);
      for(let i=0;i<n;i++){ const sx=rr(), sy=rr(), sp=.6+rr()*.6;
        const dy=((sy*h + t*h*sp*1.6)%h), dx=(sx*w - dy*.12 + w)%w;
        R(g,x+dx,y+dy,1,2+(sp>.9?1:0),hexA(C.rain,.55+sp*.25)); }
    } else if(env.weather==='rain'){
      const rr=rng(77); for(let i=0;i<w*h/55;i++) R(g,x+rr()*w,y+rr()*h,1,2,hexA(C.rain,.6));
    } else if(env.weather==='snow'){
      const rr=rng(91); for(let i=0;i<w*h/70;i++){ const sx=rr(),sy=rr(),sp=.3+rr()*.4;
        const dy=(sy*h+t*h*sp*.35)%h, dx=(sx*w+Math.sin(t+i)*2+w)%w; R(g,x+dx,y+dy,rr()<.2?2:1,1,C.cream); }
      R(g,x,y+h-2,w,2,hexA(C.cream,.65));
    }
    if(look.kind==='sakura'&&env.anim!==false){ const rr=rng(31); for(let i=0;i<10;i++){ const dy=(rr()*h+t*8)%h; P(g,x+(rr()*w+Math.sin(t+i)*3+w)%w,y+dy,C.pink);} }
    g.restore();
  }
  // Cam üzerindeki yağmur izleri (Referans 1)
  function glassDrips(g,x,y,w,h,t,on){
    if(!on) return; const rr=rng(hash('drip'+x+w));
    for(let i=0;i<w;i+=2){ const len=1+Math.floor(rr()*rr()*9); R(g,x+i,y,1,len,hexA(C.rain,.55)); }
    for(let i=0;i<5;i++){ const dx=rr()*w, sp=.15+rr()*.2; const dy=((rr()*h)+t*h*sp)%h; R(g,x+dx,y+dy,1,4,hexA(C.cream,.22)); }
  }
  function windowFrame(g,x,y,w,h,panes,col,dark){
    R(g,x-3,y-3,w+6,3,col); R(g,x-3,y+h,w+6,3,col); R(g,x-3,y,3,h,col); R(g,x+w,y,3,h,col);
    R(g,x-3,y-3,w+6,1,LT(.25)); R(g,x-1,y,1,h,DK(.35));
    for(let i=1;i<panes;i++){ const mx=x+Math.round(i*w/panes)-1; R(g,mx,y,2,h,col); R(g,mx+1,y,1,h,DK(.3)); }
    R(g,x-5,y+h+3,w+10,3,col); R(g,x-5,y+h+5,w+10,1,dark);
  }

  /* ---------------- Kitaplık ---------------- */
  function bookcase(g,x,y,look,books,t,opt={}){
    const w=38,h=140,n=look.shelves;
    R(g,x,y,w,h,look.frame); R(g,x+3,y+4,w-6,h-10,look.back);
    R(g,x,y,w,3,look.frame); R(g,x-1,y,w+2,2,LT(.18)); R(g,x,y+h-6,w,6,look.dark);
    R(g,x+w-2,y,2,h,DK(.25));
    const innerTop=y+4, innerH=h-10, ch=Math.floor((innerH-(n-1)*2)/n), innerW=w-6;
    const comps=[]; for(let i=0;i<n;i++){ const cy=innerTop+i*(ch+2); comps.push({y:cy,h:ch}); if(i<n-1){R(g,x+3,cy+ch,w-6,2,look.frame);R(g,x+3,cy+ch+1,w-6,1,DK(.25));} }
    // kitapları rafa diz
    let ci=0, cx=x+3; const overflow=[]; const hl=opt.highlight;
    for(const b of books){
      const sp=b.spine; if(ci>=n){ overflow.push(b); continue; }
      if(cx+sp.w>x+3+innerW){ ci++; cx=x+3; if(ci>=n){ overflow.push(b); continue; } }
      const comp=comps[ci]; const bh=Math.max(8,comp.h-2-[7,4,1][sp.hClass]);
      const by=comp.y+comp.h-bh;
      R(g,cx,by,sp.w,bh,sp.color); R(g,cx,by,sp.w,1,LT(.22)); R(g,cx+sp.w-1,by,1,bh,DK(.28));
      if(sp.band>0) R(g,cx,by+Math.floor(bh*.22),sp.w,1,DK(.3));
      if(sp.band>1) R(g,cx,by+Math.floor(bh*.75),sp.w,1,LT(.3));
      if(sp.gold) R(g,cx,by+1,sp.w,2,C.gold);
      if(hl&&b.id===hl){ const a=.5+.5*Math.sin(t*6); R(g,cx-1,by-1,sp.w+2,1,hexA(C.lamp,a)); R(g,cx-1,by-1,1,bh+1,hexA(C.lamp,a)); R(g,cx+sp.w,by-1,1,bh+1,hexA(C.lamp,a)); }
      cx+=sp.w;
    }
    // boş raflara küçük süsler
    comps.forEach((comp,i)=>{
      const used = i<ci ? innerW : i===ci ? cx-(x+3) : 0;
      if(innerW-used<11) return;
      const ex=x+w-14, ey=comp.y+comp.h;
      if(i%3===0){ R(g,ex+2,ey-5,6,5,C.terra); R(g,ex+1,ey-6,8,1,C.brick); R(g,ex+3,ey-10,1,4,C.moss); R(g,ex+5,ey-12,1,6,C.sage); R(g,ex+6,ey-9,2,1,C.sage); }
      else if(i%3===1){ R(g,ex+1,ey-3,10,3,C.sand); R(g,ex+2,ey-6,8,3,C.rose); }
      else { R(g,ex+4,ey-8,3,8,C.slate); R(g,ex+5,ey-9,1,1,C.cream); }
    });
    // taşan kitaplar: üstte yatay yığın (R-KIT-06)
    overflow.slice(0,6).forEach((b,i)=>{ const bw=16+(b.spine.w%5)*2; R(g,x+3+(i%2)*3,y-3-i*3,bw,3,b.spine.color); R(g,x+3+(i%2)*3,y-3-i*3,bw,1,LT(.2)); });
    if(look.ladder){
      for(let k=0;k<2;k++) line(g,x+w-6+k*6,y+h+6,x+w-2+k*6,y+8,C.wood0);
      for(let r=0;r<9;r++){ const yy=y+16+r*15, f=(yy-(y+8))/(h-2); R(g,x+w-2-Math.round((1-f)*-4),yy,6,1,C.wood2); }
      R(g,x+w-3,y+4,2,2,C.gold);
    }
    return {overflow:overflow.length};
  }
  function bookcaseCapacity(look){ const ch=Math.floor((130-(look.shelves-1)*2)/look.shelves); return {shelves:look.shelves,width:32,ch}; }

  /* ---------------- Koltuklar ---------------- */
  function sofa(g,x,y,look){
    const top=y+(look.low?10:0);
    // arka minder
    R(g,x+6,top,68,30-(top-y),look.base); R(g,x+6,top,68,1,look.light); R(g,x+6,top+1,68,1,hexA(C.cream,.12));
    const cw=Math.floor(68/look.cush);
    for(let i=1;i<look.cush;i++){ R(g,x+6+i*cw,top+2,1,26-(top-y),look.shade); }
    if(look.tuft) for(let yy=top+5;yy<y+24;yy+=6) for(let xx=x+10+(yy%12?3:0);xx<x+72;xx+=7) P(g,xx,yy,look.shade);
    // oturma
    R(g,x+4,y+26,72,12,look.base); R(g,x+4,y+26,72,2,look.light); R(g,x+4,y+35,72,3,look.shade);
    for(let i=1;i<look.cush;i++) R(g,x+4+i*Math.floor(72/look.cush),y+27,1,9,look.shade);
    // kollar
    const arm=(ax)=>{
      if(look.arm==='scroll'){ R(g,ax,y+12,12,30,look.base); ellipse(g,ax+6,y+13,6,4,look.base); R(g,ax+1,y+10,10,1,look.light); R(g,ax+3,y+14,6,1,look.shade); }
      else if(look.arm==='square'){ R(g,ax,y+14,11,28,look.base); R(g,ax,y+14,11,1,look.light); }
      else { R(g,ax,y+16,11,26,look.base); R(g,ax+1,y+14,9,2,look.base); R(g,ax+1,y+14,9,1,look.light); }
      R(g,ax,y+38,11,4,look.shade);
    };
    arm(x); arm(x+69); R(g,x+10,y+16,1,22,DK(.15)); R(g,x+69,y+16,1,22,DK(.25));
    R(g,x+2,y+40,76,4,look.shade); R(g,x+2,y+43,76,1,DK(.3));
    R(g,x+6,y+44,3,5,look.leg); R(g,x+71,y+44,3,5,look.leg);
    // dekoratif yastık
    R(g,x+14,y+18,10,9,C.cream); R(g,x+14,y+18,10,1,C.white); R(g,x+15,y+21,8,1,hexA(C.ochre,.6));
  }
  function tvseat(g,x,y,look){
    if(look.kind==='pouf'){ ellipse(g,x+18,y+20,16,9,look.base); R(g,x+3,y+20,31,8,look.base); ellipse(g,x+18,y+28,15,4,look.shade); ellipse(g,x+18,y+14,14,4,hexA(C.cream,.18)); R(g,x+17,y+12,2,10,look.shade); }
    else if(look.kind==='bean'){ ellipse(g,x+18,y+22,17,10,look.base); ellipse(g,x+14,y+12,11,9,look.base); ellipse(g,x+12,y+8,7,4,hexA(C.cream,.18)); ellipse(g,x+20,y+30,15,3,look.shade); }
    else { R(g,x+3,y+4,30,14,look.base); R(g,x+3,y+4,30,1,hexA(C.cream,.2)); R(g,x,y+12,36,12,look.base); R(g,x+1,y+12,34,1,hexA(C.cream,.2)); R(g,x,y+8,5,18,look.shade); R(g,x+31,y+8,5,18,look.shade); R(g,x+17,y+5,1,12,look.shade); R(g,x+2,y+24,32,3,look.shade); R(g,x+3,y+27,2,4,C.wood0); R(g,x+31,y+27,2,4,C.wood0); }
  }
  function chair(g,x,y,look,t){
    if(look.kind==='wicker'){
      R(g,x+6,y,26,24,C.ochre); for(let yy=y+2;yy<y+24;yy+=3) R(g,x+7,yy,24,1,C.tan); for(let xx=x+8;xx<x+31;xx+=4) R(g,xx,y+1,1,22,hexA(C.wood3,.5));
      R(g,x+2,y+22,34,8,C.ochre); R(g,x+2,y+22,34,1,C.gold); R(g,x+4,y+24,30,4,C.cream); R(g,x+4,y+24,30,1,C.white);
      R(g,x+4,y+30,2,18,C.wood3); R(g,x+32,y+30,2,18,C.wood3); R(g,x+9,y+30,2,14,C.wood2); R(g,x+27,y+30,2,14,C.wood2);
    } else if(look.kind==='deck'){
      line(g,x+4,y+4,x+14,y+30,C.wood3); line(g,x+5,y+4,x+15,y+30,C.wood3);
      for(let i=0;i<6;i++) R(g,x+5+i*2,y+6+i*4,14,3,i%2?C.cream:C.terra2);
      R(g,x+14,y+28,24,4,C.terra2); R(g,x+14,y+28,24,1,C.tan); line(g,x+16,y+32,x+10,y+48,C.wood2); line(g,x+36,y+32,x+38,y+48,C.wood2);
    } else {
      const sw=Math.round(Math.sin(t*1.2)*1.5);
      R(g,x+18,y-40,1,40,C.mute);
      g.save(); g.translate(sw,0);
      ellipse(g,x+18,y+18,16,20,C.ochre); ellipse(g,x+18,y+18,13,17,'#a7713f'); ellipse(g,x+18,y+24,12,9,C.cream); R(g,x+8,y+26,20,3,C.terra2);
      for(let yy=y+2;yy<y+34;yy+=3) R(g,x+5,yy,26,1,hexA(C.wood3,.25));
      g.restore();
    }
  }

  /* ---------------- Işık ve lambalar ---------------- */
  function lamp(g,x,y,look,t,on,env){
    const flick = on ? .92+.08*Math.sin(t*9)*Math.sin(t*2.3) : 0;
    let cx=x+9, cy=y+10;
    if(look.kind==='bulb'){ R(g,x+9,0,1,y+8,C.wood0); R(g,x+7,y+8,5,2,C.mute); ellipse(g,x+9,y+13,3,3,on?C.lamp:C.taupe); if(on)P(g,x+9,y+12,C.white); cy=y+13; }
    else if(look.kind==='lantern'){ R(g,x+9,0,1,y+4,C.wood0); R(g,x+5,y+4,9,2,C.wood0); R(g,x+5,y+6,9,13,on?C.ochre:C.wood2); R(g,x+6,y+7,7,11,on?C.lamp:C.wood1); R(g,x+9,y+6,1,13,C.wood0); R(g,x+5,y+19,9,2,C.wood0); cy=y+12; }
    else if(look.kind==='floor'){
      R(g,x+3,y,13,2,look.shade); R(g,x+2,y+2,15,8,look.shade); R(g,x+1,y+10,17,2,C.wood3); R(g,x+3,y+2,1,8,LT(.25));
      if(on){ R(g,x+4,y+12,11,2,hexA(C.lamp,.8)); }
      R(g,x+9,y+12,1,(env.floorY||148)-y-14,C.wood0); R(g,x+5,(env.floorY||148)-3,9,3,C.wood0); cy=y+9;
    } else if(look.kind==='lava'){
      R(g,x,y+26,20,3,C.wood3); R(g,x+1,y+29,2,4,C.wood1); R(g,x+17,y+29,2,4,C.wood1);
      R(g,x+6,y+20,8,6,C.slate); R(g,x+7,y+4,6,16,on?C.berry:C.plum); R(g,x+8,y+2,4,2,C.slate);
      if(on){ const b=Math.sin(t*.8)*4; ellipse(g,x+10,y+12+b,2,2,C.pink); ellipse(g,x+9,y+7-b*.5,1,1,C.pink); }
      cy=y+12; cx=x+10;
      if(on) glow(g,cx,cy,22,C.pink,.35*flick);
      return;
    }
    if(on) glow(g,cx,cy,46,C.lamp,.42*flick);
  }
  function lights(g,look,t){
    if(look.kind==='none') return;
    if(look.kind==='fairy'){
      for(let x=0;x<=160;x++){ const y=6+Math.round(Math.sin(x/160*Math.PI)*10); P(g,x,y,C.wood1); if(x%11===5){ const on=((Math.floor(t*2)+x)%7)!==0; R(g,x-1,y+1,3,3,on?C.lamp:C.wood2); if(on) glow(g,x,y+2,9,C.gold,.35); } }
    } else {
      const cols=[C.terra2,C.ochre,C.berry,C.lamp,C.terra];
      for(let i=0;i<5;i++){ const x=14+i*32, sway=Math.sin(t*1.5+i)*1; R(g,x,0,1,8+i%2*4,C.wood0); const cy=14+i%2*4; ellipse(g,x+sway,cy,5,6,cols[i]); R(g,x-4+sway,cy-1,9,1,DK(.2)); R(g,x-4+sway,cy+2,9,1,DK(.2)); glow(g,x,cy,16,cols[i],.35); }
    }
  }

  /* ---------------- Küçük eşyalar ---------------- */
  function plant(g,x,y,look){ // kutu 24×44, alt kenar y+44
    if(look.kind==='none') return;
    const b=y+44;
    const pot=(c=C.terra)=>{ R(g,x+6,b-10,12,9,c); R(g,x+5,b-11,14,2,C.brick); R(g,x+7,b-1,10,1,C.wood1); R(g,x+16,b-9,1,8,DK(.25)); };
    if(look.kind==='monstera'){ pot(C.cream); R(g,x+11,b-24,2,14,C.moss);
      [[2,-34],[12,-40],[14,-28],[0,-24]].forEach(([dx,dy],i)=>{ ellipse(g,x+dx+5,b+dy+5,6,4,i%2?C.moss:C.olive); P(g,x+dx+4,b+dy+5,C.wood0); P(g,x+dx+7,b+dy+4,C.wood0); R(g,x+dx+1,b+dy+5,9,1,hexA(C.sage,.5)); }); }
    else if(look.kind==='ivy'){ pot(C.terra); for(let i=0;i<6;i++){ const lx=x+3+i*3, len=8+((i*7)%9); for(let k=0;k<len;k+=3) R(g,lx+(k%2),b-12-6+k,2,2,i%2?C.sage:C.olive); } ellipse(g,x+12,b-15,9,4,C.moss); }
    else if(look.kind==='cactus'){ pot(C.ochre); R(g,x+10,b-28,5,18,C.olive); R(g,x+11,b-28,1,18,C.sage); R(g,x+6,b-22,4,3,C.olive); R(g,x+6,b-26,3,5,C.olive); R(g,x+15,b-20,4,3,C.olive); R(g,x+16,b-24,3,5,C.olive); P(g,x+12,b-30,C.pink); }
    else if(look.kind==='fern'){ pot(C.slate); for(let i=0;i<7;i++){ const a=(i/6)*Math.PI; line(g,x+12,b-11,x+12-Math.cos(a)*11,b-11-Math.sin(a)*14,i%2?C.sage:C.fern); } }
    else if(look.kind==='lemon'){ pot(C.cream); R(g,x+11,b-26,2,16,C.wood2); ellipse(g,x+12,b-32,10,9,C.moss); ellipse(g,x+10,b-34,7,6,C.olive); [[6,-30],[15,-35],[13,-27],[8,-37]].forEach(([dx,dy])=>R(g,x+dx,b+dy,2,2,C.gold)); }
  }
  function rug(g,x,y,look){ // 72×24
    if(look.kind==='mat'){ R(g,x+6,y+4,60,16,look.a); for(let i=x+8;i<x+64;i+=4) R(g,i,y+5,1,14,look.b); R(g,x+6,y+4,60,1,LT(.15)); }
    else if(look.kind==='kilim'){ R(g,x,y+2,72,20,look.a); R(g,x+2,y+4,68,16,look.b); R(g,x+4,y+6,64,12,look.a);
      for(let i=0;i<4;i++){ const cx=x+13+i*15, cy=y+12; for(let k=0;k<5;k++) R(g,cx-k,cy-4+k,k*2+1,1,look.c), R(g,cx-k,cy+4-k,k*2+1,1,look.c); P(g,cx,cy,look.b); }
      for(let i=x;i<x+72;i+=3){ P(g,i,y,C.cream); P(g,i,y+23,C.cream); } }
    else if(look.kind==='round'){ ellipse(g,x+36,y+12,34,11,look.b); ellipse(g,x+36,y+12,30,9,look.a); ellipse(g,x+36,y+12,24,7,look.b); ellipse(g,x+36,y+12,17,5,look.a); ellipse(g,x+36,y+12,9,3,look.b); }
    else { R(g,x,y+2,72,20,look.a); R(g,x+3,y+4,66,16,look.c); R(g,x+5,y+6,62,12,look.a); ellipse(g,x+36,y+12,12,5,look.b); ellipse(g,x+36,y+12,7,3,look.c); for(let i=x+3;i<x+70;i+=4){P(g,i,y+3,look.b);P(g,i,y+20,look.b);} for(let i=x;i<x+72;i+=2){ P(g,i,y,C.sand); P(g,i,y+23,C.sand);} }
  }
  function table(g,x,y,look,book){ // 20×24, alt y+24
    if(look.kind==='stool'){ R(g,x+2,y+4,16,3,C.ochre); R(g,x+2,y+4,16,1,C.gold); R(g,x+4,y+7,2,17,C.wood3); R(g,x+14,y+7,2,17,C.wood3); R(g,x+5,y+16,10,1,C.wood2); }
    else { ellipse(g,x+10,y+5,10,2,C.wood3); R(g,x,y+5,20,2,C.wood1); R(g,x+9,y+7,2,15,C.wood2); R(g,x+5,y+22,10,2,C.wood1); ellipse(g,x+10,y+4,9,1,C.tan); }
    if(book){ R(g,x+4,y+1,12,3,C.cream); R(g,x+9,y+1,2,3,book.spineColor||C.rust); R(g,x+4,y+1,12,1,C.white); R(g,x+5,y+2,3,1,C.taupe); R(g,x+12,y+2,3,1,C.taupe); }
    else { R(g,x+13,y,4,4,C.cream); R(g,x+17,y+1,1,2,C.cream); R(g,x+14,y,2,1,C.wood3); }
  }
  function art(g,x,y,look,count){ // 30×24
    if(look.kind==='frame'){ R(g,x+6,y+4,18,16,C.ochre); R(g,x+8,y+6,14,12,C.navy); ellipse(g,x+15,y+12,3,3,C.gold); R(g,x+8,y+15,14,3,C.moss); }
    else if(look.kind==='mountain'){ R(g,x,y,30,24,C.wood3); R(g,x+2,y+2,26,20,C.slate); for(let k=0;k<10;k++) R(g,x+12-k,y+8+k,k*2+1,1,C.sage); for(let k=0;k<7;k++) R(g,x+22-k,y+12+k,k*2+1,1,C.fern); R(g,x+21,y+5,3,3,C.gold); R(g,x+2,y+20,26,2,C.moss); }
    else { R(g,x-2,y-2,34,28,C.wood3); R(g,x,y,30,24,'#1f2a24'); R(g,x+2,y+2,10,1,hexA(C.cream,.7)); R(g,x+2,y+4,6,1,hexA(C.cream,.5));
      const n=Math.min(count||0,25); for(let i=0;i<n;i++){ const grp=Math.floor(i/5), k=i%5; const gx=x+3+grp*5, gy=y+8+Math.floor(grp/5)*9; if(k<4) R(g,gx+k,gy,1,6,C.cream); else line(g,gx-1,gy+5,gx+4,gy,C.gold); }
      if(!n){ R(g,x+4,y+12,22,1,hexA(C.cream,.25)); } }
  }
  /* TV odası */
  function tv(g,x,y,look,t,media,anim){ // 52×40
    R(g,x+20,y-12,1,12,C.mute); line(g,x+20,y-12,x+12,y-22,C.mute); line(g,x+21,y-12,x+30,y-24,C.mute); R(g,x+16,y-2,10,2,C.slate);
    R(g,x,y,52,40,look.body); R(g,x,y,52,1,LT(.25)); R(g,x+51,y,1,40,DK(.3)); R(g,x,y+38,52,2,look.dark);
    if(look.wood){ for(let i=y+3;i<y+38;i+=4) R(g,x+1,i,50,1,hexA(C.wood0,.35)); }
    const sx=x+4,sy=y+4,sw=36,sh=30;
    R(g,sx,sy,sw,sh,C.black);
    if(media){ const c=media.spineColor||C.blue; const ph=anim?t:0;
      for(let yy=0;yy<sh;yy++){ const k=Math.sin(yy*.35+ph*2)*.5+.5; R(g,sx+1,sy+yy,sw-2,1,yy<sh*.55?hexA(c,.45+k*.3):hexA(C.aqua,.25+k*.25)); }
      ellipse(g,sx+sw*.65,sy+sh*.35,4,4,hexA(C.gold,.7)); R(g,sx+3,sy+sh-6,sw-6,2,hexA(C.cream,.35));
    } else { const rr=rng(Math.floor(anim?t*8:1)); for(let i=0;i<70;i++) P(g,sx+1+rr()*(sw-2),sy+1+rr()*(sh-2),rr()<.5?C.slate:C.navy); }
    R(g,sx,sy,sw,1,LT(.15)); R(g,sx,sy,1,sh,LT(.08)); P(g,sx,sy,look.body); P(g,sx+sw-1,sy,look.body); P(g,sx,sy+sh-1,look.body); P(g,sx+sw-1,sy+sh-1,look.body);
    ellipse(g,x+46,y+10,2,2,look.knob); ellipse(g,x+46,y+18,2,2,look.knob); for(let i=0;i<4;i++) R(g,x+43,y+25+i*3,6,1,look.dark);
    if(anim||media) glow(g,sx+sw/2,sy+sh/2,34,media?C.aqua:C.rain,media?.3:.12);
  }
  function tapes(g,x,y,look,list,t,hl){ // 64×30 dolap, alt y+30; list = [{color,series,seasons,id}]
    const rows=look.rows, h=30;
    R(g,x,y,64,h,look.wood); R(g,x,y,64,1,LT(.2)); R(g,x+63,y,1,h,DK(.3)); R(g,x,y+h-3,64,3,look.dark);
    const rowH=Math.floor((h-6)/rows); let placed=0; const cap=rows*20;
    for(let r=0;r<rows;r++){
      const ry=y+2+r*(rowH+1); R(g,x+3,ry,58,rowH,look.dark);
      let cx=x+4;
      while(placed<list.length && cx<x+60){
        const m=list[placed]; const n=m.series?Math.max(1,m.count):1;
        if(cx+n*3>x+61) break;
        for(let k=0;k<n;k++){ const faded=m.series&&k>=m.watched; R(g,cx,ry+1,3,rowH-1,faded?hexA(m.color,.4):m.color); R(g,cx,ry+3,3,Math.max(2,rowH-7),hexA(C.white,faded?.25:.8)); R(g,cx+2,ry+1,1,rowH-1,DK(.25)); cx+=3; }
        if(m.series){ R(g,cx-n*3,ry+1,n*3,1,C.gold); }
        if(hl&&m.id===hl){ const a=.5+.5*Math.sin(t*6); R(g,cx-n*3-1,ry,n*3+2,1,hexA(C.lamp,a)); }
        placed++; cx+=1;
      }
    }
    // taşanlar üstte yatay yığın
    list.slice(placed).slice(0,5).forEach((m,i)=>{ R(g,x+44-(i%2)*2,y-3-i*3,16,3,m.color); R(g,x+44-(i%2)*2,y-2-i*3,16,1,hexA(C.white,.6)); });
    return {cap};
  }
  function planShelf(g,x,y,list){ // 30 genişlik raf; kasetler üstünde dikey
    R(g,x,y,30,3,C.wood3); R(g,x,y,30,1,C.tan); R(g,x+3,y+3,2,4,C.wood1); R(g,x+25,y+3,2,4,C.wood1);
    list.slice(0,7).forEach((m,i)=>{ const cx=x+2+i*4; R(g,cx,y-13,4,13,m.color); R(g,cx+1,y-10,2,7,hexA(C.white,.75)); R(g,cx+3,y-13,1,13,DK(.25)); });
  }
  function posters(g,x,y,list){
    if(!list.length){ R(g,x+2,y+4,14,20,C.wood2); R(g,x+3,y+5,12,18,C.tealD); R(g,x+5,y+15,8,1,hexA(C.cream,.3)); return; }
    list.slice(0,2).forEach((m,i)=>{ const px=x+i*15, py=y+i*5; R(g,px,py,13,19,C.cream); R(g,px+1,py+1,11,17,m.color);
      const h=hash(m.title); ellipse(g,px+6,py+6+(h%4),2+(h%2),2+(h%2),C.gold); R(g,px+1,py+12,11,6,hexA(C.black,.35)); R(g,px+2,py+15,7,1,C.cream); R(g,px+2,py+17,5,1,hexA(C.cream,.6)); });
  }
  function music(g,x,y,look,t,anim){ // masa + cihaz, kutu 36×30, alt y+30
    R(g,x,y+12,36,3,C.wood3); R(g,x,y+12,36,1,C.tan); R(g,x+2,y+15,2,15,C.wood1); R(g,x+32,y+15,2,15,C.wood1); R(g,x+3,y+24,30,1,C.wood2);
    if(look.kind==='boombox'){ R(g,x+4,y+2,28,10,C.slate); R(g,x+4,y+2,28,1,LT(.2)); R(g,x+10,y-1,16,2,C.mute); ellipse(g,x+9,y+7,3,3,C.black); ellipse(g,x+27,y+7,3,3,C.black); R(g,x+14,y+4,8,5,C.navy); R(g,x+15,y+5,6,3,hexA(C.aqua,.6)); P(g,x+9,y+7,C.mute); P(g,x+27,y+7,C.mute); }
    else if(look.kind==='radio'){ R(g,x+6,y,24,12,C.wood3); R(g,x+6,y,24,1,C.tan); for(let i=0;i<5;i++) R(g,x+8,y+2+i*2,10,1,C.wood0); R(g,x+20,y+2,8,4,C.cream); R(g,x+22+Math.round(Math.sin(t*.3)*2),y+2,1,4,C.rust); ellipse(g,x+22,y+9,1,1,C.gold); ellipse(g,x+26,y+9,1,1,C.gold); }
    else { R(g,x+3,y+6,30,6,C.wood2); R(g,x+3,y+6,30,1,C.tan); ellipse(g,x+15,y+6,11,2,C.black); ellipse(g,x+15,y+6,3,1,C.terra2);
      const a=anim?t*3.5:0; P(g,x+15+Math.round(Math.cos(a)*8),y+6+Math.round(Math.sin(a)*1.5),C.mute); line(g,x+30,y+3,x+23,y+6,C.cream); R(g,x+29,y+2,3,2,C.mute); }
  }
  function btable(g,x,y,look){ // 26×26, alt y+26
    if(look.kind==='crate'){ R(g,x+1,y+8,24,18,C.ochre); for(let i=0;i<3;i++) R(g,x+1,y+9+i*6,24,1,C.wood3); R(g,x+1,y+8,24,1,C.gold); R(g,x+1,y+8,1,18,C.wood3); R(g,x+24,y+8,1,18,C.wood3); }
    else { R(g,x,y+10,26,3,C.wood3); R(g,x,y+10,26,1,C.tan); R(g,x+3,y+13,2,13,C.wood1); R(g,x+21,y+13,2,13,C.wood1); R(g,x+3,y+4,8,6,C.cream); R(g,x+11,y+5,2,2,C.cream); R(g,x+4,y+2,6,2,C.terra2); }
    R(g,x+15,y+4,5,4,look.kind==='crate'?C.cream:C.white); R(g,x+16,y+4,3,1,C.rust); R(g,x+20,y+5,1,2,C.cream);
  }
  /* Kedi: yatan poz, şablon */
  const CAT_ROWS=[
    '...............b...b..',
    '..............bab.bab.',
    '..............aaaaaaa.',
    '......abaabaaaaakaaka.',
    '....aaabaabaaabaaapaa.',
    '...aaaaaaaaaaaaaaacca.',
    '..aaaccccccccccaaaa...',
    '..aaaaaaaaaaaaaaaa....',
  ];
  function cat(g,x,y,look,t,anim){
    const breathe=anim&&Math.sin(t*1.6)>.6?1:0;
    const map={a:look.a,b:look.b,c:look.c,k:C.black,p:C.pink};
    sprite(g,x,y-breathe*0,CAT_ROWS,map);
    if(breathe) R(g,x+6,y+4,9,1,look.a);
    const sw=anim?Math.round(Math.sin(t*1.1)*1.5):0;
    R(g,x,y+6,3,1,look.a); R(g,x-1+sw,y+4,2,2,look.a); R(g,x-2+sw,y+3,2,1,look.b);
  }

  /* Sırtları sahnede kullanılacak biçime çevir */
  function spinesFrom(entries){
    return entries.map(r=>{ const b=S.books[r.bookId]; const sp=spineFor(b); return {id:r.id,spine:{...sp,gold:!!(r.verification&&r.verification.perfect)}}; });
  }
  function tapeList(entries){
    return entries.map(w=>{ const m=S.media[w.mediaId]; return {id:w.id,title:m.title,color:m.spineColor,series:m.kind==='series',count:m.seasons||1,watched:(w.seasonsWatched||[]).length}; });
  }

  return {R,P,glow,ellipse,line,hexA,view,glassDrips,windowFrame,bookcase,bookcaseCapacity,sofa,tvseat,chair,lamp,lights,plant,rug,table,art,tv,tapes,planShelf,posters,music,btable,cat,spinesFrom,tapeList,DK,LT};
})();
