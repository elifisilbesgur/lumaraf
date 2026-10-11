'use strict';
/* LumaRaf · oda sahneleri. 160×200 tampona çizilir, ekrana tam piksel büyütülür. */

const SW=160, SH=200;
const Scene=(()=>{
  let canvas=null, view=null, buf=null, g=null, raf=0, last=0, running=false, hotspots=[], t0=performance.now(), visible=true;
  const env=()=>({weather:S.prefs.weather, sky:S.prefs.sky, anim:S.prefs.animations, floorY:148});
  const time=()=>(performance.now()-t0)/1000;

  function ensureBuf(){ if(!buf){ buf=document.createElement('canvas'); buf.width=SW; buf.height=SH; g=buf.getContext('2d'); } }

  /* ----- Okuma odası ----- */
  function reading(t,E){
    const A=Art, room='reading', on=S.rooms[room].lightOn;
    const hs=[];
    // duvar
    A.R(g,0,0,SW,148,C.wall);
    for(let x=0;x<SW;x+=8){ A.R(g,x,6,1,140,C.wallD); A.R(g,x+4,6,1,140,'rgba(255,220,190,.035)'); }
    A.R(g,0,0,SW,5,C.wood3); A.R(g,0,5,SW,1,C.wood0);
    // zemin
    A.R(g,0,148,SW,52,C.wood3);
    for(let y=150;y<SH;y+=6){ A.R(g,0,y,SW,1,C.wood2); A.R(g,0,y+1,SW,1,'rgba(255,230,200,.05)'); const off=((y-150)/6*23)%52; for(let x=off;x<SW;x+=52) A.R(g,x,y+1,1,5,C.wood2); }
    A.R(g,0,148,SW,1,'rgba(255,230,200,.12)'); A.R(g,0,144,SW,4,C.wood0);
    // pencere
    const V=itemIn(room,'view'); A.view(g,48,12,64,78,V.look,t,E); A.glassDrips(g,48,12,64,78,t,E.weather==='rain'); A.windowFrame(g,48,12,64,78,3,C.wood3,C.wood0);
    A.R(g,42,8,76,2,C.wood1);
    hs.push({id:'view',slot:'view',x:45,y:9,w:70,h:88,label:'Pencere'});
    // duvar süsü
    const ART=itemIn(room,'art'); A.art(g,121,50,ART.look,readThisYear()); hs.push({id:'art',slot:'art',x:118,y:46,w:36,h:32,label:TYPE_LABEL.art});
    // kitaplık
    const BC=itemIn(room,'bookcase');
    A.bookcase(g,3,6,BC.look,A.spinesFrom(readBooks()),t,{highlight:UI.highlight&&UI.highlight.kind==='book'?UI.highlight.id:null});
    hs.push({id:'bookcase',slot:'bookcase',x:0,y:0,w:44,h:148,label:'Kitaplık'});
    // lamba
    const L=itemIn(room,'lamp'); const lp={bulb:[136,20],lantern:[136,22],floor:[140,80],lava:[136,92]}[L.look.kind];
    // kanepe
    const SO=itemIn(room,'sofa'); A.sofa(g,38,98,SO.look); hs.push({id:'sofa',slot:'sofa',x:38,y:98,w:80,h:50,label:'Koltuk'});
    // kedi
    const CAT=ITEM[S.companion.itemId]; A.cat(g,72,116,CAT.look,t,E.anim); hs.push({id:'cat',x:70,y:112,w:26,h:14,label:S.companion.name});
    // sehpa
    const rd=readingBooks()[0]; const TB=itemIn(room,'table'); A.table(g,120,124,TB.look,rd?S.books[rd.bookId]:null);
    hs.push({id:'table',slot:'table',x:118,y:120,w:22,h:28,label:rd?'Okuyorum':'Sehpa'});
    // halı
    const RU=itemIn(room,'rug'); A.rug(g,44,166,RU.look); hs.push({id:'rug',slot:'rug',x:44,y:166,w:72,h:24,label:'Halı'});
    // okunacaklar yığını
    const plan=plannedBooks();
    plan.slice(0,12).forEach((r,i)=>{ const b=S.books[r.bookId]; const w=18+(hash(b.title)%9); const x=8+((hash(b.title)>>3)%4); const y=192-i*3; A.R(g,x,y,w,3,b.spineColor); A.R(g,x,y,w,1,A.LT(.2)); A.R(g,x+w-1,y,1,3,A.DK(.3)); A.R(g,x+w-3,y+1,2,1,C.cream); });
    if(!plan.length){ A.R(g,8,190,22,1,'rgba(255,240,220,.08)'); }
    hs.push({id:'tbr',x:4,y:150,w:36,h:48,label:'Okunacaklar'});
    // bitki
    const PL=itemIn(room,'plant'); A.plant(g,134,152,PL.look); hs.push({id:'plant',slot:'plant',x:130,y:150,w:30,h:48,label:'Bitki'});
    A.lamp(g,lp[0],lp[1],L.look,t,on,E);
    hs.push({id:'lamp',slot:'lamp',x:lp[0]-2,y:L.look.kind==='floor'?lp[1]:0,w:24,h:L.look.kind==='floor'?86:lp[1]+28,label:'Lamba'});
    if(!on) A.R(g,0,0,SW,SH,'rgba(4,3,10,.38)');
    return hs;
  }

  /* ----- TV odası ----- */
  function tvroom(t,E){
    const A=Art, room='tv', on=S.rooms[room].lightOn, hs=[];
    A.R(g,0,0,SW,148,C.teal);
    for(let x=6;x<SW;x+=12) A.R(g,x,0,1,118,C.tealD);
    A.R(g,0,118,SW,30,C.tealD); A.R(g,0,118,SW,2,C.slate); A.R(g,0,144,SW,4,C.wood0);
    A.R(g,0,148,SW,52,C.wood2);
    for(let y=150;y<SH;y+=6){ A.R(g,0,y,SW,1,C.wood1); const off=((y-150)/6*19)%48; for(let x=off;x<SW;x+=48) A.R(g,x,y+1,1,5,C.wood1); }
    // pencere + jaluzi
    const V=itemIn(room,'view'); A.view(g,118,12,36,58,V.look,t,E); A.windowFrame(g,118,12,36,58,2,C.slate,C.tealD);
    for(let y=12;y<36;y+=3) A.R(g,118,y,36,1,'rgba(239,226,200,.55)'); A.R(g,118,36,36,2,C.sand);
    hs.push({id:'view',slot:'view',x:114,y:8,w:44,h:68,label:'Pencere'});
    // afişler (favoriler)
    const favs=S.watch.filter(w=>w.favorite&&w.status==='watched').map(w=>S.media[w.mediaId]);
    A.posters(g,4,12,favs); hs.push({id:'posters',x:2,y:10,w:34,h:36,label:'Afiş duvarı'});
    // izlenecekler rafı
    const plan=plannedMedia().filter(w=>w.status==='planned');
    A.planShelf(g,4,74,Art.tapeList(plan)); hs.push({id:'planrack',x:2,y:56,w:34,h:26,label:'İzleyeceklerim'});
    // dolap + kasetler
    const TP=itemIn(room,'tapes');
    A.tapes(g,32,118,TP.look,Art.tapeList(watchedList()),t,UI.highlight&&UI.highlight.kind==='media'?UI.highlight.id:null);
    hs.push({id:'tapes',slot:'tapes',x:32,y:112,w:64,h:36,label:'Kaset rafı'});
    // televizyon
    const TV=itemIn(room,'tv'); const w=watchingNow();
    A.tv(g,38,78,TV.look,t,w?S.media[w.mediaId]:null,E.anim);
    hs.push({id:'tv',slot:'tv',x:36,y:56,w:56,h:62,label:'Televizyon'});
    // müzik
    const MU=itemIn(room,'music'); A.music(g,118,118,MU.look,t,E.anim&&S.prefs.soundOn); hs.push({id:'music',slot:'music',x:116,y:112,w:40,h:36,label:'Müzik'});
    // halı, oturma, kedi
    const RU=itemIn(room,'rug'); A.rug(g,44,168,RU.look); hs.push({id:'rug',slot:'rug',x:44,y:168,w:72,h:24,label:'Halı'});
    const SE=itemIn(room,'tvseat'); A.tvseat(g,4,160,SE.look); hs.push({id:'tvseat',slot:'tvseat',x:2,y:156,w:40,h:40,label:'Oturma'});
    A.cat(g,9,158,ITEM[S.companion.itemId].look,t,E.anim); hs.push({id:'cat',x:6,y:154,w:26,h:12,label:S.companion.name});
    const PL=itemIn(room,'plant'); A.plant(g,132,152,PL.look); hs.push({id:'plant',slot:'plant',x:128,y:150,w:30,h:48,label:'Bitki'});
    const L=itemIn(room,'lamp'); const lp={bulb:[100,24],lantern:[100,26],floor:[98,62],lava:[96,92]}[L.look.kind];
    A.lamp(g,lp[0],lp[1],L.look,t,on,E); hs.push({id:'lamp',slot:'lamp',x:lp[0]-2,y:L.look.kind==='floor'?lp[1]:0,w:22,h:L.look.kind==='floor'?86:lp[1]+28,label:'Lamba'});
    if(!on) A.R(g,0,0,SW,SH,'rgba(2,6,10,.4)');
    return hs;
  }

  /* ----- Balkon ----- */
  function balcony(t,E){
    const A=Art, room='balcony', hs=[];
    const V=itemIn(room,'view'); A.view(g,0,0,SW,148,V.look,t,E);
    hs.push({id:'view',slot:'view',x:14,y:22,w:110,h:80,label:'Manzara'});
    // kapı kenarı
    A.R(g,0,0,12,148,C.wall); A.R(g,10,0,3,148,C.cream); A.R(g,12,0,1,148,A.DK(.3)); A.R(g,3,70,3,10,C.gold);
    // korkuluk
    A.R(g,13,108,147,4,C.wood3); A.R(g,13,108,147,1,C.tan);
    for(let x=16;x<SW;x+=7){ A.R(g,x,112,2,32,C.wood2); A.R(g,x+1,112,1,32,A.DK(.25)); }
    A.R(g,13,142,147,3,C.wood3);
    // zemin
    A.R(g,0,145,SW,55,C.terra);
    for(let y=145;y<SH;y+=7){ A.R(g,0,y,SW,1,C.brick); const off=((y-145)/7)%2?0:7; for(let x=off;x<SW;x+=14) A.R(g,x,y,1,7,C.brick); }
    A.R(g,0,145,SW,2,A.DK(.25));
    const P2=itemIn(room,'plant2'); A.plant(g,128,64,P2.look); hs.push({id:'plant2',slot:'plant2',x:124,y:62,w:32,h:48,label:'Bitki'});
    const LI=itemIn(room,'lights'); A.lights(g,LI.look,t); hs.push({id:'lights',slot:'lights',x:0,y:0,w:SW,h:22,label:'Işıklar'});
    const CH=itemIn(room,'chair'); A.chair(g,22,132,CH.look,E.anim?t:0); hs.push({id:'chair',slot:'chair',x:18,y:126,w:44,h:58,label:'Sandalye'});
    A.cat(g,30,152,ITEM[S.companion.itemId].look,t,E.anim); hs.push({id:'cat',x:28,y:148,w:26,h:12,label:S.companion.name});
    const BT=itemIn(room,'btable'); A.btable(g,70,160,BT.look); hs.push({id:'btable',slot:'btable',x:66,y:156,w:32,h:32,label:'Masa'});
    const PL=itemIn(room,'plant'); A.plant(g,120,152,PL.look); hs.push({id:'plant',slot:'plant',x:116,y:150,w:32,h:48,label:'Bitki'});
    return hs;
  }

  function drawRoom(){
    if(!S||!g) return;
    if(UI.highlight&&Date.now()>UI.highlight.until) UI.highlight=null;
    const t=time(), E=env();
    g.clearRect(0,0,SW,SH);
    const room=UI.room;
    hotspots = room==='tv'?tvroom(t,E):room==='balcony'?balcony(t,E):reading(t,E);
    if(UI.edit){
      const now=Math.floor(t*2)%2;
      for(const h of hotspots) if(h.slot){ g.strokeStyle=now?'rgba(242,183,102,.95)':'rgba(242,183,102,.55)'; g.setLineDash([2,2]); g.lineWidth=1; g.strokeRect(h.x+.5,h.y+.5,h.w-1,h.h-1); g.setLineDash([]); }
    }
    blit();
  }
  function blit(){
    if(!view||!buf) return;
    const rect=canvas.getBoundingClientRect(); const dpr=Math.min(3,window.devicePixelRatio||1);
    const W=Math.max(1,Math.round(rect.width*dpr)), H=Math.max(1,Math.round(rect.width*SH/SW*dpr));
    if(canvas.width!==W||canvas.height!==H){ canvas.width=W; canvas.height=H; }
    view.imageSmoothingEnabled=false; view.clearRect(0,0,W,H); view.drawImage(buf,0,0,W,H);
  }
  function loop(ts){
    if(!running) return;
    raf=requestAnimationFrame(loop);
    if(!visible) return;
    if(ts-last<80) return; last=ts;
    drawRoom();
  }
  function mount(el){
    ensureBuf(); canvas=el; view=el.getContext('2d');
    el.onclick=e=>{
      const r=el.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width*SW, y=(e.clientY-r.top)/r.height*SH;
      // en üstteki (son çizilen) önce
      const hit=[...hotspots].reverse().find(h=>x>=h.x&&x<h.x+h.w&&y>=h.y&&y<h.y+h.h);
      if(hit) onHotspot(hit);
    };
    drawRoom();
    if(S.prefs.animations){ if(!running){ running=true; raf=requestAnimationFrame(loop);} } else stop();
  }
  function stop(){ running=false; cancelAnimationFrame(raf); }
  function unmount(){ stop(); canvas=null; view=null; }
  return {
    mount, unmount, stop,
    redraw(){ if(canvas) drawRoom(); },
    pause(){ visible=false; }, resume(){ visible=true; if(canvas) drawRoom(); },
    hotspots:()=>hotspots,
    /* Mağaza/koleksiyon için küçük resim */
    thumb(el,id){
      const it=ITEM[id]; if(!it) return; const A=Art;
      const box={sofa:[84,52],bookcase:[44,146],lamp:[22,54],rug:[74,26],plant:[26,46],table:[22,26],art:[34,28],view:[60,60],tv:[54,64],tapes:[66,34],tvseat:[38,34],music:[38,32],chair:[40,52],lights:[160,30],btable:[28,28],cat:[26,10]}[it.type]||[40,40];
      el.width=box[0]; el.height=box[1]; const c=el.getContext('2d'); c.clearRect(0,0,el.width,el.height);
      const saved=g; g=c; const t=2.2, E={weather:'rain',sky:'night',anim:false,floorY:box[1]};
      try{
        const L=it.look;
        if(it.type==='sofa') A.sofa(c,2,1,L);
        else if(it.type==='bookcase'){ const demo=Array.from({length:28},(_,i)=>({id:'d'+i,spine:{w:3+(i*7)%6,hClass:i%3,band:i%3,color:SPINE_COLORS[(i*5)%SPINE_COLORS.length]}})); A.bookcase(c,3,4,L,demo,t); }
        else if(it.type==='lamp'){ const y={bulb:4,lantern:6,floor:0,lava:16}[L.kind]; A.lamp(c,2,y,L,t,true,{...E,floorY:54}); }
        else if(it.type==='rug') A.rug(c,1,1,L);
        else if(it.type==='plant'){ if(L.kind==='none'){ A.R(c,6,40,14,2,'rgba(255,240,220,.15)'); } else A.plant(c,1,1,L); }
        else if(it.type==='table') A.table(c,1,1,L,null);
        else if(it.type==='art') A.art(c,2,2,L,7);
        else if(it.type==='view'){ A.view(c,0,0,60,60,L,t,E); }
        else if(it.type==='tv') A.tv(c,1,23,L,t,null,false);
        else if(it.type==='tapes') A.tapes(c,1,3,L,Array.from({length:12},(_,i)=>({id:'d'+i,color:SPINE_COLORS[(i*3)%SPINE_COLORS.length],series:i===4,count:3,watched:3})),t);
        else if(it.type==='tvseat') A.tvseat(c,1,1,L);
        else if(it.type==='music') A.music(c,1,1,L,t,false);
        else if(it.type==='chair') A.chair(c,1,1,L,0);
        else if(it.type==='lights'){ if(L.kind==='none') A.R(c,10,14,140,1,'rgba(255,240,220,.15)'); else A.lights(c,L,t); }
        else if(it.type==='btable') A.btable(c,1,1,L);
        else if(it.type==='cat') A.cat(c,3,1,L,0,false);
      }finally{ g=saved; }
    }
  };
})();

/* ----- Sahne dokunuşları ----- */
function onHotspot(h){
  const room=UI.room;
  if(UI.edit){
    if(h.slot) openSheet('slot',{room,slot:h.slot});
    else if(h.id==='cat') openSheet('companion');
    return;
  }
  switch(h.id){
    case 'bookcase': go('books'); break;
    case 'tbr': go('books',{scrollTo:'#planned'}); break;
    case 'table': { const rd=readingBooks()[0]; rd?openSheet('book',{id:rd.id}):toast('Okumaya başladığın kitap sehpada durur.'); break; }
    case 'sofa': case 'tvseat': case 'chair': case 'plant': case 'plant2': case 'rug': case 'art': case 'btable': case 'bookcaseEdit':
      openSheet('slot',{room,slot:h.slot}); break;
    case 'lamp': S.rooms[room].lightOn=!S.rooms[room].lightOn; persist(); Scene.redraw(); toast(S.rooms[room].lightOn?'Lamba açıldı.':'Lamba kapandı.'); break;
    case 'view': openSheet('weather'); break;
    case 'lights': openSheet('slot',{room,slot:'lights'}); break;
    case 'cat': toast(S.companion.name+' mırlıyor.'); break;
    case 'tv': { const w=watchingNow(); w?openSheet('media',{id:w.id}):go('films'); break; }
    case 'tapes': go('films'); break;
    case 'planrack': go('films',{scrollTo:'#mplanned'}); break;
    case 'posters': toast('İzlediğin bir yapımı favori yapınca afişi burada belirir.'); break;
    case 'music': openSheet('sound'); break;
  }
}
