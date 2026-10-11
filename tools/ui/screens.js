'use strict';
/* LumaRaf · ekranlar ve alttan açılan sayfalar. */

const ICON={
  home:'<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
  book:'<path d="M5 4h10a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M5 17a3 3 0 013-3h10"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  film:'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="8.5" cy="12" r="2"/><circle cx="15.5" cy="12" r="2"/><path d="M10.5 12h3"/>',
  shop:'<path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 016 0"/>',
  gear:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  edit:'<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
  grid:'<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  leaf:'<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19l8-8"/>',
  cloud:'<path d="M7 17h10a4 4 0 000-8 6 6 0 00-11 1 3.5 3.5 0 001 7z"/><path d="M9 20l-1 2M13 20l-1 2M17 20l-1 2"/>',
  music:'<path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>',
  back:'<path d="M15 5l-7 7 7 7"/>',
  arrow:'<path d="M9 5l7 7-7 7"/>',
  door:'<path d="M5 20V5a1 1 0 011-1h12a1 1 0 011 1v15"/><path d="M3 20h18M15 12h.01"/>',
  star:'<path d="M12 4l2.4 5 5.6.6-4.2 3.8 1.2 5.6L12 16.3 7 19l1.2-5.6L4 9.6 9.6 9z"/>',
};
const ic=(n,s=20)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;

/* ---------------- Ana çizim ---------------- */
function render(){
  if(!S) return;
  document.body.dataset.room = UI.tab==='home'?UI.room:(UI.tab==='films'?'tv':'reading');
  renderHeader(); renderNav();
  const v=$('#view');
  Scene.unmount();
  v.innerHTML = UI.tab==='books'?viewBooks():UI.tab==='films'?viewFilms():UI.tab==='shop'?viewShop():viewHome();
  hydrate(v);
}
function hydrate(root){
  for(const c of $$('canvas[data-thumb]',root)) Scene.thumb(c,c.dataset.thumb);
  const sc=$('#scene',root); if(sc) Scene.mount(sc);
}
function renderHeader(){
  $('#top').innerHTML=`
    <div class="logo">luma.<small>RAF</small></div>
    <div class="top-r">
      <button class="coin" data-act="go" data-tab="shop" aria-label="Jeton: ${balance()}"><i class="coin-dot"></i><span id="coinv">${fmt(balance())}</span></button>
      <button class="pet" data-act="companion" aria-label="Yol arkadaşı"><canvas data-thumb="${S.companion.itemId}"></canvas></button>
      <button class="icon-btn" data-act="settings" aria-label="Ayarlar">${ic('gear')}</button>
    </div>`;
  hydrate($('#top'));
}
function renderNav(){
  const tabs=[['home','Evim','home'],['books','Kitaplar','book'],['add','Ekle','plus'],['films','Filmler','film'],['shop','Mağaza','shop']];
  $('#nav').innerHTML=tabs.map(([k,l,i])=>k==='add'
    ?`<button class="nav-add" data-act="add" aria-label="Ekle"><span>${ic('plus',22)}</span><em>${l}</em></button>`
    :`<button class="${UI.tab===k?'on':''}" data-act="go" data-tab="${k}">${ic(i)}<em>${l}</em></button>`).join('');
}
function bumpCoins(gained){
  renderHeader(); const el=$('.coin'); if(!el) return;
  el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  if(gained>0){ const f=document.createElement('div'); f.className='coin-float'; f.textContent='+'+gained; el.appendChild(f); setTimeout(()=>f.remove(),1400); }
}
function dateLine(){ const d=new Date(); return d.getDate()+' '+TR_MONTHS_LONG[d.getMonth()]+' '+TR_DAYS[d.getDay()]; }

/* ---------------- Evim ---------------- */
function viewHome(){
  const room=ROOMS[UI.room];
  S.lastRoom=UI.room;
  let cards='';
  if(UI.room==='reading'){
    const rd=readingBooks(), plan=plannedBooks().length, read=readBooks().length;
    cards+=rd.map(r=>{const b=S.books[r.bookId];return `<div class="card row-card" data-act="book" data-id="${r.id}"><span class="mini-spine" style="background:${b.spineColor}"></span><div class="grow"><div class="eyebrow small">ŞU AN OKUYORUM</div><div class="serif">${esc(b.title)}</div><div class="muted">${esc(b.authors.join(', ')||'Yazar yok')}${b.pageCount?' · '+b.pageCount+' sayfa':''}</div></div><button class="btn sm" data-act="finish" data-id="${r.id}">Bitirdim</button></div>`;}).join('');
    cards+=`<div class="stats"><div class="stat" data-act="go" data-tab="books"><b>${readThisYear()}</b><span>bu yıl</span></div><div class="stat" data-act="go" data-tab="books"><b>${read}</b><span>rafta</span></div><div class="stat" data-act="go" data-tab="books" data-scroll="#planned"><b>${plan}</b><span>okunacak</span></div></div>`;
    if(!read&&!rd.length) cards+=`<div class="card hint"><div class="serif">Kitaplığın şimdilik boş.</div><p class="muted">Okuduğun bir kitabı ekle; sırtı soldaki rafa yerleşsin. Okumayı planladıkların yerdeki yığında durur.</p><button class="btn" data-act="add" data-kind="book">Kitap ekle</button></div>`;
  } else if(UI.room==='tv'){
    const w=watchingNow();
    if(w){ const m=S.media[w.mediaId]; cards+=`<div class="card row-card" data-act="media" data-id="${w.id}"><span class="mini-tape" style="background:${m.spineColor}"></span><div class="grow"><div class="eyebrow small">ŞU AN İZLİYORUM</div><div class="serif">${esc(m.title)}</div><div class="muted">${m.kind==='series'?'Dizi · '+(w.seasonsWatched||[]).length+'/'+m.seasons+' sezon':'Film'}</div></div><button class="btn sm" data-act="watched" data-id="${w.id}">İzledim</button></div>`; }
    cards+=`<div class="stats"><div class="stat" data-act="go" data-tab="films"><b>${watchedList().filter(w=>S.media[w.mediaId].kind==='movie').length}</b><span>film</span></div><div class="stat" data-act="go" data-tab="films"><b>${watchedList().filter(w=>S.media[w.mediaId].kind==='series').length}</b><span>dizi</span></div><div class="stat" data-act="go" data-tab="films" data-scroll="#mplanned"><b>${plannedMedia().filter(w=>w.status==='planned').length}</b><span>izlenecek</span></div></div>`;
    if(!S.watch.length) cards+=`<div class="card hint"><div class="serif">Kaset rafın boş.</div><p class="muted">İzlediğin filmler TV ünitesindeki kutuya, izlemek istediklerin soldaki duvar rafına dizilir.</p><button class="btn" data-act="add" data-kind="media">Film ya da dizi ekle</button></div>`;
  } else {
    cards+=`<div class="card row-card" data-act="sound"><span class="round-ic">${ic('music')}</span><div class="grow"><div class="serif">Balkonda biraz dinlen</div><div class="muted">Yağmur ve kadife piyano · ses ayarı</div></div>${ic('arrow',18)}</div>`;
  }
  return `
  <div class="eyebrow">${dateLine()}</div>
  <div class="title-row"><h1>${room.name}</h1><button class="pill" data-act="rooms">${ic('door',18)}Odalar</button></div>
  <div class="scene-card ${UI.edit?'editing':''}">
    <canvas id="scene" aria-label="${room.name} sahnesi"></canvas>
    ${UI.edit?`<div class="edit-banner">Değiştirmek istediğin eşyaya dokun <button data-act="edit">Bitti</button></div>`:''}
  </div>
  <div class="tools">
    <button class="${UI.edit?'on':''}" data-act="edit">${ic('edit')}<span>Düzenle</span></button>
    <button data-act="go" data-tab="shop">${ic('grid')}<span>Mağaza</span></button>
    <button data-act="collection">${ic('leaf')}<span>Koleksiyon</span></button>
    <button data-act="weather">${ic('cloud')}<span>Hava</span></button>
  </div>
  <div class="room-tabs">${ROOM_ORDER.map(k=>`<button class="${UI.room===k?'on':''}" data-act="room" data-room="${k}">${ROOMS[k].name}</button>`).join('')}</div>
  ${cards}
  <div class="foot-space"></div>`;
}

/* ---------------- Kitaplar ---------------- */
function shelfRows(entries,maxW,unit=3,gap=2){
  const rows=[[]]; let w=0;
  for(const r of entries){ const sp=spineFor(S.books[r.bookId]); const bw=Math.max(14,sp.w*unit+4); if(w+bw>maxW&&rows[rows.length-1].length){ rows.push([]); w=0; } rows[rows.length-1].push({r,sp,bw}); w+=bw+gap; }
  return rows;
}
function viewBooks(){
  const read=readBooks(), rd=readingBooks(), plan=plannedBooks();
  const maxW=Math.min(560,window.innerWidth)-32-20;
  const rows=shelfRows(read,maxW);
  while(rows.length<3) rows.push([]);
  const shelf=`<div class="bigshelf">${rows.map(row=>`<div class="shelf-row">${row.map(({r,sp,bw})=>{const b=S.books[r.bookId];const h=[96,108,120][sp.hClass];
      return `<button class="spine${UI.highlight&&UI.highlight.id===r.id?' glow':''}" data-act="book" data-id="${r.id}" style="width:${bw}px;height:${h}px;--c:${sp.color}" aria-label="${esc(b.title)}"><span class="band b${sp.band}"></span><span class="st">${esc(b.title)}</span></button>`;}).join('')}</div>`).join('')}</div>`;
  const list=read.slice().reverse().map(r=>{const b=S.books[r.bookId];return `<button class="list-row" data-act="book" data-id="${r.id}"><span class="mini-spine" style="background:${b.spineColor}"></span><span class="grow"><b class="serif">${esc(b.title)}</b><small>${esc(b.authors.join(', ')||'—')} · ${shortDate(r.finishedAt)}</small></span>${r.rating?`<span class="stars">${'★'.repeat(r.rating)}</span>`:''}</button>`;}).join('');
  const sorts=[['date','Tarih'],['author','Yazar'],['title','Ad'],['color','Renk']];
  return `
  <div class="eyebrow">OKUMA ODASI</div>
  <div class="title-row"><h1>Kitaplığım</h1><button class="pill" data-act="add" data-kind="book">${ic('plus',18)}Kitap</button></div>
  <div class="stats"><div class="stat"><b>${readThisYear()}</b><span>bu yıl</span></div><div class="stat"><b>${read.length}</b><span>rafta</span></div><div class="stat"><b>${plan.length}</b><span>okunacak</span></div></div>
  <div class="seg-row"><div class="seg">${[['shelf','Raf'],['list','Liste']].map(([k,l])=>`<button class="${UI.booksView===k?'on':''}" data-act="booksView" data-v="${k}">${l}</button>`).join('')}</div>
    <div class="chips">${sorts.map(([k,l])=>`<button class="chip ${S.prefs.shelfSort===k?'on':''}" data-act="sort" data-v="${k}">${l}</button>`).join('')}</div></div>
  ${read.length?(UI.booksView==='shelf'?shelf:`<div class="list">${list}</div>`):`<div class="card hint"><div class="serif">Rafın seni bekliyor.</div><p class="muted">Okuduğun ilk kitabı ekle; sırtı sayfa sayısına göre kalın ya da ince olur.</p><button class="btn" data-act="add" data-kind="book">Okuduğum bir kitabı ekle</button></div>`}
  ${rd.length?`<h2 class="sec">Okuyorum</h2><div class="list">${rd.map(r=>{const b=S.books[r.bookId];return `<div class="list-row"><span class="mini-spine" style="background:${b.spineColor}"></span><button class="grow plain" data-act="book" data-id="${r.id}"><b class="serif">${esc(b.title)}</b><small>${esc(b.authors.join(', ')||'—')} · ${shortDate(r.startedAt)} başladın</small></button><button class="btn sm" data-act="finish" data-id="${r.id}">Bitirdim</button></div>`;}).join('')}</div>`:''}
  <h2 class="sec" id="planned">Okunacaklar <small>${plan.length}</small></h2>
  ${plan.length?`<div class="tbr">${plan.map(r=>{const b=S.books[r.bookId];return `<div class="tbr-row"><span class="tbr-book" style="--c:${b.spineColor};width:${58+hash(b.title)%30}%"></span><button class="grow plain" data-act="book" data-id="${r.id}"><b class="serif">${esc(b.title)}</b><small>${esc(b.authors.join(', ')||'—')}</small></button><button class="btn sm ghost" data-act="startBook" data-id="${r.id}">Başladım</button></div>`;}).join('')}</div>`
  :`<p class="muted pad">Okumayı planladığın kitaplar burada ve odanda yerde yığın olarak durur.</p>`}
  <div class="foot-space"></div>`;
}

/* ---------------- Filmler ---------------- */
function tapeRows(entries,maxW){
  const rows=[[]]; let w=0;
  for(const e of entries){ const m=S.media[e.mediaId]; const n=m.kind==='series'?m.seasons||1:1; const bw=n*18+(n>1?4:0); if(w+bw>maxW&&rows[rows.length-1].length){rows.push([]);w=0;} rows[rows.length-1].push(e); w+=bw+3; }
  return rows;
}
function tapeHtml(e){
  const m=S.media[e.mediaId]; const n=m.kind==='series'?m.seasons||1:1; const ws=e.seasonsWatched||[];
  const one=(k)=>`<span class="tape${m.kind==='series'&&e.status==='watched'&&!ws.includes(k+1)?' faded':''}" style="--c:${m.spineColor}"><span class="lbl">${k===0?esc(m.title):'S'+(k+1)}</span></span>`;
  return `<button class="tapeset${n>1?' box':''}${UI.highlight&&UI.highlight.id===e.id?' glow':''}" data-act="media" data-id="${e.id}" aria-label="${esc(m.title)}">${Array.from({length:n},(_,k)=>one(k)).join('')}</button>`;
}
function viewFilms(){
  const watched=watchedList(), planned=plannedMedia();
  const maxW=Math.min(560,window.innerWidth)-32-24;
  const rack=(list,cls)=>{ const rows=tapeRows(list,maxW); return `<div class="rack ${cls}">${rows.map(r=>`<div class="rack-row">${r.map(tapeHtml).join('')}</div>`).join('')}</div>`; };
  return `
  <div class="eyebrow">TV ODASI</div>
  <div class="title-row"><h1>İzlediklerim</h1><button class="pill" data-act="add" data-kind="media">${ic('plus',18)}Ekle</button></div>
  <div class="stats"><div class="stat"><b>${watched.filter(w=>S.media[w.mediaId].kind==='movie').length}</b><span>film</span></div><div class="stat"><b>${watched.filter(w=>S.media[w.mediaId].kind==='series').length}</b><span>dizi</span></div><div class="stat"><b>${planned.filter(w=>w.status==='planned').length}</b><span>izlenecek</span></div></div>
  ${watched.length?rack(watched,'wood'):`<div class="card hint"><div class="serif">Kaset kutun boş.</div><p class="muted">Her film bir kaset, her dizi sezon sayısı kadar kasetlik bir kutu set olur.</p><button class="btn" data-act="add" data-kind="media">İzlediğim bir şeyi ekle</button></div>`}
  <h2 class="sec" id="mplanned">İzleyeceklerim <small>${planned.length}</small></h2>
  ${planned.length?rack(planned,'teal'):`<p class="muted pad">İzlemek istediklerin TV odasındaki duvar rafında durur.</p>`}
  ${planned.length?`<div class="list">${planned.map(e=>{const m=S.media[e.mediaId];return `<button class="list-row" data-act="media" data-id="${e.id}"><span class="mini-tape" style="background:${m.spineColor}"></span><span class="grow"><b class="serif">${esc(m.title)}</b><small>${m.kind==='series'?'Dizi':'Film'}${m.year?' · '+m.year:''}${e.status==='watching'?' · izliyorum':''}</small></span>${ic('arrow',16)}</button>`;}).join('')}</div>`:''}
  <div class="foot-space"></div>`;
}

/* ---------------- Mağaza ---------------- */
function shopItems(tab){
  const def=SHOP_TABS.find(t=>t.key===tab)||SHOP_TABS[0];
  if(!def.types) return CATALOG.filter(i=>i.price>0&&owns(i.id));
  return CATALOG.filter(i=>def.types.includes(i.type)).sort((a,b)=>def.types.indexOf(a.type)-def.types.indexOf(b.type));
}
function itemStatus(it){
  if(it.type==='cat') return S.companion.itemId===it.id?'Yanında':owns(it.id)?'Sahip':null;
  const w=whereIs(it.id);
  if(it.price===0) return 'Başlangıç';
  if(w.length) return it.multi?w.map(x=>ROOMS[x.room].name).join(', '):ROOMS[w[0].room].name;
  return owns(it.id)?'Sahip':null;
}
function viewShop(){
  const items=shopItems(UI.shopTab), bal=balance();
  return `
  <div class="eyebrow">KÜÇÜK EŞYALAR DÜKKÂNI</div>
  <div class="title-row"><h1>Mağaza</h1></div>
  <div class="card balance"><span class="coin-dot big"></span><div class="grow"><b>${fmt(bal)} jeton</b><div class="muted">Yaklaşık ${Math.max(0,Math.floor(bal/ECONOMY.avgPerBook))} kitaplık okuma karşılığı</div></div></div>
  <div class="chips scroll">${SHOP_TABS.map(t=>`<button class="chip ${UI.shopTab===t.key?'on':''}" data-act="shopTab" data-v="${t.key}">${t.label}</button>`).join('')}</div>
  ${items.length?`<div class="grid">${items.map(it=>{const st=itemStatus(it);return `<button class="item-card" data-act="item" data-id="${it.id}"><div class="thumb ${it.type}"><canvas data-thumb="${it.id}"></canvas></div><small>${TYPE_LABEL[it.type]}</small><b>${esc(it.name)}</b>${st?`<span class="tag">${esc(st)}</span>`:`<span class="price ${bal<it.price?'short':''}"><i class="coin-dot"></i>${fmt(it.price)}</span>`}</button>`;}).join('')}</div>`
  :`<p class="muted pad">Henüz bir şey satın almadın. Okudukça jeton biriktirip buraya dönebilirsin.</p>`}
  <div class="foot-space"></div>`;
}

/* ================= Alttan açılan sayfalar ================= */
const Sheets={};
const sheetHead=(title,eyebrow='')=>`<div class="sheet-head"><div>${eyebrow?`<div class="eyebrow small">${eyebrow}</div>`:''}<h2>${title}</h2></div><button class="icon-btn" data-act="closeSheet" aria-label="Kapat">${ic('close')}</button></div>`;

Sheets.rooms=()=>sheetHead('Evim')+`<div class="room-grid">${ROOM_ORDER.map(k=>{const thumb={reading:'sofa_terra',tv:'tv_crt',balcony:'chair_wicker'}[k];return `<button class="room-card ${UI.room===k?'on':''}" data-act="room" data-room="${k}"><div class="thumb"><canvas data-thumb="${S.rooms[k].slots[{reading:'sofa',tv:'tv',balcony:'chair'}[k]]||thumb}"></canvas></div><b>${ROOMS[k].name}</b><small>${ROOMS[k].hint}</small></button>`;}).join('')}<div class="room-card soon"><div class="thumb"></div><b>Yeni oda</b><small>İleride</small></div></div>`;

Sheets.slot=({room,slot})=>{
  const type=SLOT_TYPE[slot], cur=S.rooms[room].slots[slot];
  const sel=UI.preview&&UI.preview.slot===slot?UI.preview.itemId:cur;
  const items=CATALOG.filter(i=>i.type===type).sort((a,b)=>(owns(b.id)-owns(a.id))||(a.price-b.price));
  const it=ITEM[sel], need=!owns(sel), bal=balance();
  const elsewhere=!it.multi&&it.price>0?whereIs(sel).filter(w=>!(w.room===room&&w.slot===slot)):[];
  let action;
  if(sel===cur) action=`<button class="btn wide ghost" data-act="closeSheet">Kapat</button>`;
  else if(need) action=bal>=it.price?`<button class="btn wide" data-act="buyPlace" data-id="${sel}" data-room="${room}" data-slot="${slot}">${fmt(it.price)} jetonla al ve yerleştir</button>`:`<button class="btn wide" disabled>${fmt(it.price-bal)} jeton eksik · ~${Math.ceil((it.price-bal)/ECONOMY.avgPerBook)} kitap</button>`;
  else action=`<button class="btn wide" data-act="placeSel" data-id="${sel}" data-room="${room}" data-slot="${slot}">Buraya yerleştir</button>`;
  return sheetHead(TYPE_LABEL[type],ROOMS[room].name.toLocaleUpperCase('tr-TR'))+
   `<p class="muted">Seçtiğin eşya yukarıda önizlenir; onaylamadan hiçbir şey değişmez.</p>
   <div class="pick-grid">${items.map(i=>{const o=owns(i.id);return `<button class="pick ${i.id===sel?'sel':''} ${o?'':'locked'}" data-act="preview" data-id="${i.id}" data-room="${room}" data-slot="${slot}"><div class="thumb ${i.type}"><canvas data-thumb="${i.id}"></canvas></div><b>${esc(i.name)}</b><small>${i.id===cur?'Burada':o?'Sahip':`<i class="coin-dot"></i>${fmt(i.price)}`}</small></button>`;}).join('')}</div>
   ${elsewhere.length?`<p class="note">Bu eşya şu an ${ROOMS[elsewhere[0].room].name} odasında. Buraya taşınırsa oradaki yeri başlangıç eşyasına döner; ikinci kopya oluşmaz.</p>`:''}
   <div class="sheet-actions">${action}</div>`;
};

Sheets.item=({id})=>{
  const it=ITEM[id], o=owns(id), bal=balance();
  let body='';
  if(it.type==='cat'){
    body = !o?(bal>=it.price?`<button class="btn wide" data-act="buy" data-id="${id}">${fmt(it.price)} jetonla al</button>`:`<button class="btn wide" disabled>${fmt(it.price-bal)} jeton eksik</button>`)
      : S.companion.itemId===id?`<p class="muted">Şu an yanında.</p>`:`<button class="btn wide" data-act="setCat" data-id="${id}">Yol arkadaşım olsun</button>`;
  } else if(!o){
    body = bal>=it.price?`<button class="btn wide" data-act="buy" data-id="${id}">${fmt(it.price)} jetonla al</button>`:`<button class="btn wide" disabled>${fmt(it.price-bal)} jeton eksik · yaklaşık ${Math.ceil((it.price-bal)/ECONOMY.avgPerBook)} kitap</button>`;
  } else {
    const slots=slotsFor(it.type);
    body = `<div class="eyebrow small">NEREYE YERLEŞTİRİLSİN?</div><div class="list">${slots.map(s=>{const here=S.rooms[s.room].slots[s.slot]===id;return `<div class="list-row"><span class="grow"><b>${ROOMS[s.room].name}</b><small>${TYPE_LABEL[SLOT_TYPE[s.slot]]} · şu an: ${esc(ITEM[S.rooms[s.room].slots[s.slot]].name)}</small></span>${here?'<span class="tag">Burada</span>':`<button class="btn sm" data-act="placeHere" data-id="${id}" data-room="${s.room}" data-slot="${s.slot}">Yerleştir</button>`}</div>`;}).join('')}</div>`;
  }
  return sheetHead(esc(it.name),TYPE_LABEL[it.type].toLocaleUpperCase('tr-TR'))+
    `<div class="item-hero"><canvas data-thumb="${id}"></canvas></div>
     <div class="center muted">${it.price?`<i class="coin-dot"></i> ${fmt(it.price)} jeton`:'Başlangıç eşyası'}${it.multi?' · birden fazla odada kullanılabilir':''}${it.id==='music_vinyl'?' · Plak çıtırtısı kanalına eşlik eder':''}</div>
     <div class="sheet-actions col">${body}</div>`;
};
Sheets.collection=()=>{
  const own=CATALOG.filter(i=>i.price>0&&owns(i.id));
  return sheetHead('Koleksiyon','SAHİP OLDUKLARIN')+(own.length?`<div class="pick-grid">${own.map(i=>`<button class="pick" data-act="item" data-id="${i.id}"><div class="thumb ${i.type}"><canvas data-thumb="${i.id}"></canvas></div><b>${esc(i.name)}</b><small>${esc(itemStatus(i)||'Sahip')}</small></button>`).join('')}</div>`:`<p class="muted">Henüz satın aldığın bir eşya yok. Başlangıç eşyaları her odada hazır.</p><div class="sheet-actions"><button class="btn wide" data-act="go" data-tab="shop">Mağazaya git</button></div>`);
};

/* ----- Ekle ----- */
UI.form=null;
function freshForm(kind){ return kind==='media'?{kind:'media',title:'',mkind:'movie',year:'',seasons:'1',status:'watched'}:{kind:'book',title:'',author:'',pages:'',status:'read',color:''}; }
Sheets.add=({kind})=>{
  if(!UI.form||UI.form.kind!==(kind||UI.form.kind)) UI.form=freshForm(kind||'book');
  const f=UI.form;
  const seg=(name,opts)=>`<div class="seg full">${opts.map(([v,l])=>`<button class="${f[name]===v?'on':''}" data-act="formSet" data-k="${name}" data-v="${v}">${l}</button>`).join('')}</div>`;
  const head=sheetHead(f.kind==='book'?'Ne okudun?':'Ne izledin?','YENİ KAYIT')+
    `<div class="seg full kind">${[['book','Kitap'],['media','Film / dizi']].map(([v,l])=>`<button class="${f.kind===v?'on':''}" data-act="formKind" data-v="${v}">${l}</button>`).join('')}</div>`;
  if(f.kind==='book') return head+`
    <label class="field"><span>Kitabın adı</span><input data-input="formIn" data-k="title" value="${esc(f.title)}" placeholder="Kürk Mantolu Madonna" autocomplete="off" maxlength="140"></label>
    <label class="field"><span>Yazar</span><input data-input="formIn" data-k="author" value="${esc(f.author)}" placeholder="Sabahattin Ali" autocomplete="off" maxlength="100"></label>
    <label class="field"><span>Sayfa sayısı <em>sırtın kalınlığını belirler</em></span><input data-input="formIn" data-k="pages" value="${esc(f.pages)}" inputmode="numeric" placeholder="160" maxlength="5"></label>
    <div class="field"><span>Durum</span>${seg('status',[['read','Okudum'],['reading','Okuyorum'],['planned','Okuyacağım']])}</div>
    <div class="field"><span>Sırt rengi</span><div class="swatches"><button class="sw auto ${!f.color?'on':''}" data-act="formSet" data-k="color" data-v="">oto</button>${SPINE_COLORS.map(c=>`<button class="sw ${f.color===c?'on':''}" style="--c:${c}" data-act="formSet" data-k="color" data-v="${c}" aria-label="${c}"></button>`).join('')}</div></div>
    <div class="sheet-actions"><button class="btn wide" data-act="submitAdd">${f.status==='read'?'Devam et':'Ekle'}</button></div>`;
  return head+`
    <label class="field"><span>Adı</span><input data-input="formIn" data-k="title" value="${esc(f.title)}" placeholder="Babam ve Oğlum" autocomplete="off" maxlength="140"></label>
    <div class="field"><span>Tür</span>${seg('mkind',[['movie','Film'],['series','Dizi']])}</div>
    <div class="two">
      <label class="field"><span>Yıl</span><input data-input="formIn" data-k="year" value="${esc(f.year)}" inputmode="numeric" placeholder="2005" maxlength="4"></label>
      ${f.mkind==='series'?`<label class="field"><span>Sezon sayısı</span><input data-input="formIn" data-k="seasons" value="${esc(f.seasons)}" inputmode="numeric" maxlength="2"></label>`:'<div></div>'}
    </div>
    <div class="field"><span>Durum</span>${seg('status',[['watched','İzledim'],['watching','İzliyorum'],['planned','İzleyeceğim']])}</div>
    <div class="sheet-actions"><button class="btn wide" data-act="submitAdd">Ekle</button></div>`;
};

/* ----- Okudum → rafa (doğrulama yeri) ----- */
Sheets.finish=({id})=>{
  const r=S.reading.find(x=>x.id===id); if(!r) return sheetHead('Bulunamadı');
  const b=S.books[r.bookId], sp=spineFor(b), base=ECONOMY.interimRewards?ECONOMY.readBase:0, pb=ECONOMY.interimRewards?pageBonus(b.pageCount):0;
  const already=hasRef('book:'+b.id+':read_base');
  return sheetHead('Rafına yerleştir','OKUDUM')+`
    <div class="finish-hero"><span class="big-spine" style="--c:${sp.color};width:${sp.w*5+10}px"></span><div><div class="serif lg">${esc(b.title)}</div><div class="muted">${esc(b.authors.join(', ')||'Yazar yok')}${b.pageCount?' · '+b.pageCount+' sayfa':''}</div></div></div>
    <div class="card verify"><div class="eyebrow small">DOĞRULAMA · YAKINDA</div><p>Yapay zekâ ile <b>özet</b> ya da <b>10 soruluk test</b> adımı bu sürümde henüz bağlı değil. Şimdilik okuduğunu kendin onaylıyorsun; doğrulama eklendiğinde bu ekran o adıma dönüşecek.</p></div>
    ${already?'<p class="note">Bu kitap için ödül daha önce alındı; yeniden ödül verilmez.</p>':`<div class="reward"><div><span>Okuma ödülü</span><b>+${base}</b></div><div><span>Sayfa bonusu${b.pageCount?' ('+b.pageCount+' s.)':''}</span><b>+${pb}</b></div><div class="tot"><span>Toplam</span><b>+${base+pb} jeton</b></div></div>`}
    <div class="sheet-actions col"><button class="btn wide" data-act="confirmFinish" data-id="${id}">Rafıma koy</button><button class="btn wide ghost" data-act="closeSheet">Şimdi değil</button></div>`;
};

/* ----- Kitap kartı ----- */
Sheets.book=({id})=>{
  const r=S.reading.find(x=>x.id===id); if(!r) return sheetHead('Kitap bulunamadı');
  const b=S.books[r.bookId], sp=spineFor(b);
  const status={planned:'Okunacak',reading:'Okuyorum',read:'Rafta'}[r.status];
  const acts=r.status==='planned'?`<button class="btn wide" data-act="startBook" data-id="${id}">Okumaya başladım</button><button class="btn wide ghost" data-act="finish" data-id="${id}">Okudum, rafa koy</button>`
    :r.status==='reading'?`<button class="btn wide" data-act="finish" data-id="${id}">Bitirdim, rafa koy</button><button class="btn wide ghost" data-act="planBook" data-id="${id}">Okunacaklara geri al</button>`
    :`<div class="rate">${[1,2,3,4,5].map(n=>`<button class="${(r.rating||0)>=n?'on':''}" data-act="rate" data-id="${id}" data-v="${n}" aria-label="${n} yıldız">${ic('star',26)}</button>`).join('')}</div>`;
  return sheetHead(esc(b.title),status.toLocaleUpperCase('tr-TR'))+`
    <div class="finish-hero"><span class="big-spine" style="--c:${sp.color};width:${sp.w*5+10}px"></span><div><div class="muted">${esc(b.authors.join(', ')||'Yazar yok')}</div><div class="muted">${b.pageCount?b.pageCount+' sayfa':'Sayfa sayısı yok'}</div>
    <div class="muted">${r.finishedAt?'Bitirdin: '+shortDate(r.finishedAt):r.startedAt?'Başladın: '+shortDate(r.startedAt):'Eklendi: '+shortDate(r.addedAt)}</div>
    ${r.verification?`<div class="tag">${r.verification.method==='interim'?'Kendi onayın':'Doğrulandı'}</div>`:''}</div></div>
    <div class="sheet-actions col">${acts}
      ${UI.confirmDel===id?`<button class="btn wide danger" data-act="delBook" data-id="${id}">Evet, sil</button><p class="note">Kazandığın jetonlar silinmez; kitap yeniden eklenirse ödül tekrar verilmez.</p>`:`<button class="btn wide text" data-act="askDel" data-id="${id}">Kitabı sil</button>`}
    </div>`;
};

/* ----- Film / dizi kartı ----- */
Sheets.media=({id})=>{
  const e=S.watch.find(x=>x.id===id); if(!e) return sheetHead('Kayıt bulunamadı');
  const m=S.media[e.mediaId];
  const label={planned:'İzlenecek',watching:'İzliyorum',watched:'Rafta'}[e.status];
  const seasons=m.kind==='series'?`<div class="field"><span>İzlenen sezonlar</span><div class="season-row">${Array.from({length:m.seasons},(_,k)=>`<button class="${(e.seasonsWatched||[]).includes(k+1)?'on':''}" data-act="season" data-id="${id}" data-v="${k+1}" style="--c:${m.spineColor}">${k+1}</button>`).join('')}</div></div>`:'';
  const acts=[
    e.status!=='watched'?`<button class="btn wide" data-act="watched" data-id="${id}">İzledim, rafa koy</button>`:'',
    e.status==='planned'?`<button class="btn wide ghost" data-act="watching" data-id="${id}">Şimdi izliyorum</button>`:'',
    e.status==='watched'?`<button class="btn wide ${e.favorite?'':'ghost'}" data-act="fav" data-id="${id}">${e.favorite?'Afiş duvarında':'Afiş duvarına as'}</button>`:'',
    e.status!=='planned'?`<button class="btn wide ghost" data-act="mplan" data-id="${id}">İzleyeceklerime al</button>`:'',
  ].join('');
  return sheetHead(esc(m.title),label.toLocaleUpperCase('tr-TR'))+`
    <div class="finish-hero"><span class="big-tape" style="--c:${m.spineColor}"></span><div><div class="muted">${m.kind==='series'?'Dizi · '+m.seasons+' sezon':'Film'}${m.year?' · '+m.year:''}</div><div class="muted">${e.watchedAt?'İzledin: '+shortDate(e.watchedAt):'Eklendi: '+shortDate(e.addedAt)}</div></div></div>
    ${seasons}
    <div class="sheet-actions col">${acts}
    ${UI.confirmDel===id?`<button class="btn wide danger" data-act="delMedia" data-id="${id}">Evet, sil</button>`:`<button class="btn wide text" data-act="askDel" data-id="${id}">Kaydı sil</button>`}</div>`;
};

/* ----- Hava, ses, ayarlar, arkadaş, hoş geldin ----- */
Sheets.weather=()=>{
  const p=S.prefs;
  const seg=(k,opts)=>`<div class="seg full">${opts.map(([v,l])=>`<button class="${String(p[k])===v?'on':''}" data-act="pref" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div>`;
  return sheetHead('Hava','BÜTÜN PENCERELER')+`
    <div class="field"><span>Hava</span>${seg('weather',[['rain','Yağmur'],['snow','Kar'],['clear','Açık']])}</div>
    <div class="field"><span>Gökyüzü</span>${seg('sky',[['night','Gece'],['dusk','Alacakaranlık']])}</div>
    <div class="field"><span>Hareket</span>${seg('animations',[[true,'Açık'],[false,'Kapalı']].map(([v,l])=>[String(v),l]))}</div>
    <p class="muted">Manzaranın kendisi mağazadan değişir; hava ücretsizdir.</p>`;
};
Sheets.sound=()=>{
  const room=UI.tab==='home'?UI.room:S.lastRoom, mix=S.rooms[room].mix;
  return sheetHead('Ses alanım',ROOMS[room].name.toLocaleUpperCase('tr-TR'))+`
    <button class="toggle-row" data-act="soundToggle"><span><b>${S.prefs.soundOn?'Çalıyor':'Sessiz'}</b><small>${Native.available()?'Her odanın kendi karışımı vardır':'Tarayıcı önizlemesinde ses çalmaz; telefonda çalar'}</small></span><i class="switch ${S.prefs.soundOn?'on':''}"></i></button>
    ${CHANNELS.map(c=>`<label class="slider"><span><b>${c.label}</b><small>${c.note}</small></span><input type="range" min="0" max="100" step="5" value="${mix[c.key]||0}" data-input="mix" data-k="${c.key}" data-room="${room}"><em>${mix[c.key]||0}%</em></label>`).join('')}
    <div class="field"><span>Piyano</span><div class="chips wrap">${PIANOS.map(p=>`<button class="chip ${mix.piano===p.key?'on':''}" data-act="piano" data-v="${p.key}" data-room="${room}">${p.label}</button>`).join('')}</div></div>
    <label class="slider"><span><b>${(PIANOS.find(p=>p.key===mix.piano)||PIANOS[0]).label}</b><small>${(PIANOS.find(p=>p.key===mix.piano)||PIANOS[0]).note}</small></span><input type="range" min="0" max="100" step="5" value="${mix.pianoVol||0}" data-input="mix" data-k="pianoVol" data-room="${room}"><em>${mix.pianoVol||0}%</em></label>`;
};
Sheets.settings=()=>sheetHead('Ayarlar')+`
  <div class="list">
    <button class="list-row" data-act="sound"><span class="grow"><b>Ses alanım</b><small>Yağmur, şömine, plak, piyano</small></span>${ic('arrow',16)}</button>
    <button class="list-row" data-act="weather"><span class="grow"><b>Hava ve hareket</b><small>Yağmur, kar, gece</small></span>${ic('arrow',16)}</button>
    <button class="list-row" data-act="companion"><span class="grow"><b>Yol arkadaşım</b><small>${esc(S.companion.name)} · ${esc(ITEM[S.companion.itemId].name)}</small></span>${ic('arrow',16)}</button>
  </div>
  <div class="card about"><div class="eyebrow small">HAKKINDA</div>
    <p><b>LumaRaf</b> · ${esc(BUILD)}</p>
    <p class="muted">LumaNote 0.5.7 kabuğu üzerine kuruldu. Bütün kayıtların bu telefonda, yerel bir dosyada tutulur; hesap ve sunucu yoktur.</p>
    <p class="muted">Yapay zekâ doğrulaması (özet ve test) henüz bağlı değil. Bu sürümde "Okudum" demek kitabı rafa koyar ve geçici olarak ödül verir.</p>
    <p class="muted small">Sesler: yağmur, şömine ve kadife piyano CC0 kayıtlarıdır (Freesound: DBlover, BonnyOrbit, blankie.rest). Gece Notları, Camdaki Damlalar, yumuşak gürültü ve plak çıtırtısı özgün sentezdir.</p>
  </div>`;
Sheets.companion=()=>{
  const cats=CATALOG.filter(i=>i.type==='cat');
  return sheetHead('Yol arkadaşım')+`
    <label class="field"><span>Adı</span><input data-input="catName" value="${esc(S.companion.name)}" maxlength="24"></label>
    <div class="pick-grid">${cats.map(i=>`<button class="pick ${S.companion.itemId===i.id?'sel':''} ${owns(i.id)?'':'locked'}" data-act="${owns(i.id)?'setCat':'item'}" data-id="${i.id}"><div class="thumb cat"><canvas data-thumb="${i.id}"></canvas></div><b>${esc(i.name)}</b><small>${S.companion.itemId===i.id?'Yanında':owns(i.id)?'Sahip':`<i class="coin-dot"></i>${fmt(i.price)}`}</small></button>`).join('')}</div>`;
};
Sheets.welcome=()=>`<div class="welcome">
  <div class="eyebrow small">HOŞ GELDİN</div><h2 class="serif xl">Okudukça<br><em>dolan raflar.</em></h2>
  <ol><li><b>Bu senin evin.</b> Okuma odası, TV odası ve balkon. Üstteki “Odalar” ile gezersin.</li>
  <li><b>Okuduğun kitabı ekle.</b> Sırtı soldaki rafa yerleşir; okumayı planladıkların yerde yığın olur.</li>
  <li><b>Jetonla döşe.</b> Koltuğa dokun, değiştir. Lamba, bitki, manzara mağazada.</li></ol>
  <div class="reward"><div class="tot"><span>Taşınma hediyesi</span><b>+${ECONOMY.welcome} jeton</b></div></div>
  <div class="sheet-actions"><button class="btn wide" data-act="closeWelcome">Evime gir</button></div></div>`;

/* ================= Eylemler ================= */
function syncAudio(){
  if(!S) return;
  const room=UI.tab==='home'?UI.room:S.lastRoom, mix=S.rooms[room].mix, volumes={};
  for(const c of CHANNELS) volumes[c.key]=Number(mix[c.key])||0;
  if(mix.piano) volumes[mix.piano]=Number(mix.pianoVol)||0;
  Native.call('audio',{playing:!!S.prefs.soundOn,volumes}).catch(()=>{});
}
function safe(fn){ try{ return fn(); }catch(e){ toast(e.message||'İşlem tamamlanamadı.','warn'); return undefined; } }

Object.assign(Actions,{
  room:d=>{ UI.room=d.room; S.lastRoom=d.room; persist(); if(UI.tab!=='home') UI.tab='home'; if(UI.sheet) closeSheet(); render(); syncAudio(); },
  rooms:()=>openSheet('rooms'),
  edit:()=>{ UI.edit=!UI.edit; UI.preview=null; render(); if(UI.edit) toast('Kesikli çizgili eşyalara dokun.'); },
  collection:()=>openSheet('collection'),
  weather:()=>openSheet('weather'),
  sound:()=>openSheet('sound'),
  settings:()=>openSheet('settings'),
  companion:()=>openSheet('companion'),
  add:d=>{ UI.form=freshForm(d.kind||'book'); openSheet('add',{kind:d.kind||'book'}); },
  formKind:d=>{ UI.form=freshForm(d.v); if(UI.sheet) UI.sheet.args.kind=d.v; renderSheet(); },
  formSet:d=>{ UI.form[d.k]=d.v; renderSheet(); },
  formIn:(d,el)=>{ UI.form[d.k]=el.value; },
  submitAdd:()=>safe(()=>{
    const f=UI.form;
    if(f.kind==='book'){
      const pages=String(f.pages||'').replace(/\D/g,'');
      const {entry,existed}=addBook({title:f.title,author:f.author,pages,status:f.status==='read'?'planned':f.status,color:f.color});
      persistNow(); UI.form=null;
      if(f.status==='read'){ openSheet('finish',{id:entry.id}); return; }
      closeSheet(); toast(existed?'Bu kitap zaten listende.':f.status==='reading'?'Sehpana koydum. İyi okumalar.':'Okunacaklar yığınına eklendi.');
      UI.room='reading'; go('home',{room:'reading'});
    } else {
      const entry=addMedia({title:f.title,kind:f.mkind,year:String(f.year||'').replace(/\D/g,''),seasons:f.seasons,status:f.status});
      persistNow(); UI.form=null; closeSheet();
      UI.highlight={kind:'media',id:entry.id,until:Date.now()+5000};
      toast(entry.status==='watched'?'Kaset rafına yerleşti.':entry.status==='watching'?'Televizyonda açık.':'İzleyeceklerine eklendi.');
      go('home',{room:'tv'}); syncAudio();
    }
  }),
  finish:d=>openSheet('finish',{id:d.id}),
  confirmFinish:d=>safe(()=>{
    const r=S.reading.find(x=>x.id===d.id); if(!r) return;
    const gained=finishBook(r); persistNow();
    closeSheet(); UI.highlight={kind:'book',id:r.id,until:Date.now()+6000};
    go('home',{room:'reading'}); bumpCoins(gained); syncAudio();
    toast(gained?`+${gained} jeton · kitabın rafına yerleşti.`:'Kitabın rafına yerleşti.');
  }),
  book:d=>{ UI.confirmDel=null; openSheet('book',{id:d.id}); },
  startBook:d=>{ const r=S.reading.find(x=>x.id===d.id); if(!r) return; startReading(r); persist(); if(UI.sheet) closeSheet(); render(); toast('Sehpana koydum. İyi okumalar.'); },
  planBook:d=>{ const r=S.reading.find(x=>x.id===d.id); if(!r) return; planAgain(r); persist(); closeSheet(); render(); },
  rate:d=>{ const r=S.reading.find(x=>x.id===d.id); if(!r) return; r.rating=Number(d.v)===r.rating?0:Number(d.v); persist(); renderSheet(); if(UI.tab==='books') render(); },
  askDel:d=>{ UI.confirmDel=d.id; renderSheet(); },
  delBook:d=>{ const r=S.reading.find(x=>x.id===d.id); if(!r) return; removeBook(r); persistNow(); UI.confirmDel=null; closeSheet(); render(); toast('Kitap silindi.'); },
  booksView:d=>{ UI.booksView=d.v; render(); },
  sort:d=>{ S.prefs.shelfSort=d.v; persist(); render(); },
  media:d=>{ UI.confirmDel=null; openSheet('media',{id:d.id}); },
  watched:d=>{ const e=S.watch.find(x=>x.id===d.id); if(!e) return; setWatch(e,'watched'); persistNow(); if(UI.sheet) closeSheet(); UI.highlight={kind:'media',id:e.id,until:Date.now()+5000}; go('home',{room:'tv'}); toast('Kaset rafına yerleşti.'); },
  watching:d=>{ const e=S.watch.find(x=>x.id===d.id); if(!e) return; setWatch(e,'watching'); persist(); closeSheet(); go('home',{room:'tv'}); toast('Televizyonda açık.'); },
  mplan:d=>{ const e=S.watch.find(x=>x.id===d.id); if(!e) return; setWatch(e,'planned'); e.favorite=false; persist(); closeSheet(); render(); },
  fav:d=>{ const e=S.watch.find(x=>x.id===d.id); if(!e) return; if(!e.favorite&&S.watch.filter(w=>w.favorite).length>=2) S.watch.find(w=>w.favorite).favorite=false; e.favorite=!e.favorite; persist(); renderSheet(); Scene.redraw(); },
  season:d=>{ const e=S.watch.find(x=>x.id===d.id); if(!e) return; const n=Number(d.v); const set=new Set(e.seasonsWatched||[]); set.has(n)?set.delete(n):set.add(n); e.seasonsWatched=[...set].sort((a,b)=>a-b); persist(); renderSheet(); Scene.redraw(); },
  delMedia:d=>{ const e=S.watch.find(x=>x.id===d.id); if(!e) return; removeMedia(e); persistNow(); UI.confirmDel=null; closeSheet(); render(); toast('Kayıt silindi.'); },
  shopTab:d=>{ UI.shopTab=d.v; render(); },
  item:d=>openSheet('item',{id:d.id}),
  buy:d=>safe(()=>{ const it=ITEM[d.id]; if(buy(d.id)){ persistNow(); bumpCoins(0); toast(it.name+' senin.'); if(UI.tab==='shop') render(); renderSheet(); } }),
  placeHere:d=>safe(()=>{ place(d.id,d.room,d.slot); persistNow(); closeSheet(); go('home',{room:d.room}); toast(ITEM[d.id].name+' yerleşti.'); }),
  preview:d=>{ UI.preview={room:d.room,slot:d.slot,itemId:d.id}; Scene.redraw(); renderSheet(); },
  placeSel:d=>safe(()=>{ place(d.id,d.room,d.slot); UI.preview=null; persistNow(); closeSheet(); Scene.redraw(); toast(ITEM[d.id].name+' yerleşti.'); }),
  buyPlace:d=>safe(()=>{ buy(d.id); place(d.id,d.room,d.slot); UI.preview=null; persistNow(); closeSheet(); render(); bumpCoins(0); toast(ITEM[d.id].name+' senin. Odana yerleşti.'); }),
  setCat:d=>safe(()=>{ setCompanion(d.id); persist(); renderHeader(); renderSheet(); Scene.redraw(); }),
  catName:(d,el)=>{ S.companion.name=el.value.slice(0,24)||'Mırnav'; persist(); },
  pref:d=>{ const v=d.v==='true'?true:d.v==='false'?false:d.v; S.prefs[d.k]=v; persist(); renderSheet(); if(d.k==='animations') render(); else Scene.redraw(); },
  soundToggle:()=>{ S.prefs.soundOn=!S.prefs.soundOn; persist(); renderSheet(); syncAudio(); },
  mix:(d,el)=>{ S.rooms[d.room].mix[d.k]=Number(el.value); const em=el.parentElement.querySelector('em'); if(em) em.textContent=el.value+'%'; persist(); clearTimeout(Actions._mixT); Actions._mixT=setTimeout(syncAudio,150); },
  piano:d=>{ S.rooms[d.room].mix.piano=d.v; if(!S.rooms[d.room].mix.pianoVol) S.rooms[d.room].mix.pianoVol=25; persist(); renderSheet(); syncAudio(); },
  closeWelcome:()=>{ S.prefs.intro=true; persistNow(); closeSheet(); },
});
