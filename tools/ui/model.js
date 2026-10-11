'use strict';
/* LumaRaf · veri modeli. S'yi değiştiren her işlem buradadır (SPEC bölüm 11). */

const SCHEMA = 1;

function freshRoom(key){
  const slots={};
  for(const slot of ROOMS[key].slots) slots[slot]=DEFAULT_ITEM[SLOT_TYPE[slot]];
  return { slots, lightOn:true, mix:{...DEFAULT_MIX[key]} };
}
function freshState(){
  const s={
    schema:SCHEMA, createdAt:nowISO(), deviceId:uid('d'),
    books:{}, reading:[], media:{}, watch:[],
    ledger:[], owned:[],
    rooms:Object.fromEntries(ROOM_ORDER.map(k=>[k,freshRoom(k)])),
    lastRoom:'reading',
    companion:{itemId:'cat_tabby',name:'Mırnav'},
    prefs:{ soundOn:true, weather:'rain', sky:'night', animations:true, shelfSort:'date', intro:false }
  };
  award(s,'welcome',ECONOMY.welcome,'welcome');
  return s;
}

/* R-VER-03: normalize asla jeton veya eşya üretmez; yalnızca biçimi düzeltir. */
function normalize(raw){
  const s=raw&&typeof raw==='object'?raw:{};
  const out=freshState(); out.ledger=[]; // hoş geldin hediyesi yalnızca gerçekten yeni kayıtta verilir
  out.schema=SCHEMA;
  out.createdAt=s.createdAt||out.createdAt; out.deviceId=s.deviceId||out.deviceId;
  out.books=s.books&&typeof s.books==='object'?s.books:{};
  out.reading=Array.isArray(s.reading)?s.reading.filter(r=>r&&out.books[r.bookId]):[];
  out.media=s.media&&typeof s.media==='object'?s.media:{};
  out.watch=Array.isArray(s.watch)?s.watch.filter(w=>w&&out.media[w.mediaId]):[];
  // defter: refKey tekilleştirme
  const seen=new Set(); out.ledger=[];
  for(const tx of Array.isArray(s.ledger)?s.ledger:[]){
    if(!tx||typeof tx.amount!=='number'||!tx.refKey||seen.has(tx.refKey)) continue;
    seen.add(tx.refKey); out.ledger.push(tx);
  }
  out.owned=(Array.isArray(s.owned)?s.owned:[]).filter(o=>o&&ITEM[o.itemId]&&ITEM[o.itemId].price>0);
  for(const key of ROOM_ORDER){
    const r=(s.rooms&&s.rooms[key])||{};
    const room=freshRoom(key);
    for(const slot of ROOMS[key].slots){
      const id=r.slots&&r.slots[slot];
      if(id&&ITEM[id]&&ITEM[id].type===SLOT_TYPE[slot]&&(ITEM[id].price===0||out.owned.some(o=>o.itemId===id))) room.slots[slot]=id;
    }
    room.lightOn=r.lightOn!==false;
    if(r.mix) room.mix={...room.mix,...r.mix};
    out.rooms[key]=room;
  }
  // tek kopya: aynı eşya iki yuvadaysa ilki kalır
  const used=new Set();
  for(const key of ROOM_ORDER) for(const slot of ROOMS[key].slots){
    const id=out.rooms[key].slots[slot], it=ITEM[id];
    if(it.price===0||it.multi) continue;
    if(used.has(id)) out.rooms[key].slots[slot]=DEFAULT_ITEM[it.type]; else used.add(id);
  }
  out.lastRoom=ROOMS[s.lastRoom]?s.lastRoom:'reading';
  const c=s.companion||{};
  out.companion={itemId:(ITEM[c.itemId]&&(ITEM[c.itemId].price===0||out.owned.some(o=>o.itemId===c.itemId)))?c.itemId:'cat_tabby',name:String(c.name||'Mırnav').slice(0,24)};
  out.prefs={...out.prefs,...(s.prefs||{})};
  return out;
}

/* ---------- Jeton defteri (R-EKO-01/02) ---------- */
function balance(s=S){ return s.ledger.reduce((t,x)=>t+x.amount,0); }
function hasRef(refKey,s=S){ return s.ledger.some(x=>x.refKey===refKey); }
function award(s,reason,amount,refKey){
  if(!amount||s.ledger.some(x=>x.refKey===refKey)) return 0;
  s.ledger.push({id:uid('t'),at:nowISO(),amount,reason,refKey});
  return amount;
}

/* ---------- Kitaplar ---------- */
function pageBonus(pages){ return Math.min(ECONOMY.pageMax,Math.floor((Number(pages)||0)/100)*ECONOMY.pagePer100); }
function readReward(book){ return ECONOMY.interimRewards ? ECONOMY.readBase+pageBonus(book.pageCount) : 0; }
function spineColorFor(title,author){ return SPINE_COLORS[hash(norm(title)+'|'+norm(author))%SPINE_COLORS.length]; }
function findBookEntry(title,author){
  const k=norm(title)+'|'+norm(author);
  return S.reading.find(r=>{const b=S.books[r.bookId];return b&&norm(b.title)+'|'+norm(b.authors.join(', '))===k;});
}
function addBook({title,author,pages,status,color}){
  title=String(title||'').trim().slice(0,140); author=String(author||'').trim().slice(0,100);
  if(!title) throw new Error('Kitabın adını yaz.');
  const existing=findBookEntry(title,author);
  if(existing){
    if(existing.status==='read') throw new Error('Bu kitap zaten rafında.');
    return {entry:existing,existed:true};
  }
  const id=uid('b');
  const book={id,title,authors:author?[author]:[],pageCount:pages?clamp(Math.round(Number(pages)),1,5000):null,
    kind:'fiction',spineColor:color&&SPINE_COLORS.includes(color)?color:spineColorFor(title,author),source:'manual',createdAt:nowISO()};
  S.books[id]=book;
  const entry={id:uid('r'),bookId:id,status:'planned',addedAt:nowISO(),readCount:0};
  S.reading.push(entry);
  if(status==='reading') entry.status='reading', entry.startedAt=nowISO();
  return {entry,existed:false};
}
function startReading(entry){ entry.status='reading'; entry.startedAt=entry.startedAt||nowISO(); }
function planAgain(entry){ entry.status='planned'; delete entry.startedAt; }
/* Okudum → rafa. Doğrulama bağlanınca burası özet/test sonucunu bekleyecek (R-DOG-40/41). */
function finishBook(entry){
  const book=S.books[entry.bookId];
  entry.status='read'; entry.finishedAt=nowISO(); entry.readCount=(entry.readCount||0)+1;
  entry.verification={method:'interim',at:nowISO(),score:null,perfect:false};
  let gained=0;
  if(ECONOMY.interimRewards){
    gained+=award(S,'read_base',ECONOMY.readBase,'book:'+book.id+':read_base');
    gained+=award(S,'page_bonus',pageBonus(book.pageCount),'book:'+book.id+':page_bonus');
  }
  return gained;
}
function removeBook(entry){
  S.reading=S.reading.filter(r=>r!==entry);
  delete S.books[entry.bookId]; // R-EKO-03: kazanılan jeton defterde kalır
}
function readBooks(){
  const list=S.reading.filter(r=>r.status==='read');
  const by=S.prefs.shelfSort;
  const B=r=>S.books[r.bookId];
  if(by==='author') list.sort((a,b)=>(B(a).authors[0]||'').localeCompare(B(b).authors[0]||'','tr'));
  else if(by==='color') list.sort((a,b)=>SPINE_COLORS.indexOf(B(a).spineColor)-SPINE_COLORS.indexOf(B(b).spineColor));
  else if(by==='title') list.sort((a,b)=>B(a).title.localeCompare(B(b).title,'tr'));
  else list.sort((a,b)=>String(a.finishedAt).localeCompare(String(b.finishedAt)));
  return list;
}
const plannedBooks=()=>S.reading.filter(r=>r.status==='planned').sort((a,b)=>String(a.addedAt).localeCompare(String(b.addedAt)));
const readingBooks=()=>S.reading.filter(r=>r.status==='reading').sort((a,b)=>String(b.startedAt).localeCompare(String(a.startedAt)));
const readThisYear=()=>{const y=new Date().getFullYear();return S.reading.filter(r=>r.status==='read'&&r.finishedAt&&new Date(r.finishedAt).getFullYear()===y).length;};
/* R-KIT-01..04: deterministik sırt */
function spineFor(book){
  const h=hash(norm(book.title)+'|'+norm((book.authors||[]).join(',')));
  const w=book.pageCount?clamp(Math.round(book.pageCount/60),3,10):5;
  return {w,hClass:h%3,band:(h>>4)%3,color:book.spineColor||SPINE_COLORS[(h>>3)%SPINE_COLORS.length]};
}

/* ---------- Film & dizi ---------- */
function addMedia({title,kind,year,seasons,status}){
  title=String(title||'').trim().slice(0,140);
  if(!title) throw new Error('Yapımın adını yaz.');
  kind=kind==='series'?'series':'movie';
  const k=norm(title)+'|'+kind;
  const ex=S.watch.find(w=>{const m=S.media[w.mediaId];return m&&norm(m.title)+'|'+m.kind===k;});
  if(ex) throw new Error(ex.status==='watched'?'Bu yapım zaten rafında.':'Bu yapım zaten listende.');
  const id=uid('m');
  const n=kind==='series'?clamp(Math.round(Number(seasons)||1),1,30):null;
  S.media[id]={id,kind,title,year:year?clamp(Math.round(Number(year)),1888,2100):null,seasons:n,spineColor:spineColorFor(title,kind),createdAt:nowISO()};
  const entry={id:uid('w'),mediaId:id,status:status==='watched'?'watched':status==='watching'?'watching':'planned',addedAt:nowISO()};
  if(entry.status==='watched'){entry.watchedAt=nowISO(); if(n) entry.seasonsWatched=Array.from({length:n},(_,i)=>i+1);}
  else entry.seasonsWatched=[];
  S.watch.push(entry);
  return entry;
}
function setWatch(entry,status){
  if(status==='watching'){ for(const w of S.watch) if(w.status==='watching'&&w!==entry) w.status='planned'; }
  entry.status=status;
  const m=S.media[entry.mediaId];
  if(status==='watched'){ entry.watchedAt=nowISO(); if(m.seasons&&!(entry.seasonsWatched||[]).length) entry.seasonsWatched=Array.from({length:m.seasons},(_,i)=>i+1); }
}
function removeMedia(entry){ S.watch=S.watch.filter(w=>w!==entry); delete S.media[entry.mediaId]; }
const watchedList=()=>S.watch.filter(w=>w.status==='watched').sort((a,b)=>String(a.watchedAt).localeCompare(String(b.watchedAt)));
const plannedMedia=()=>S.watch.filter(w=>w.status!=='watched').sort((a,b)=>String(a.addedAt).localeCompare(String(b.addedAt)));
const watchingNow=()=>S.watch.find(w=>w.status==='watching');

/* ---------- Mağaza, sahiplik, yerleştirme (R-EV-10..13, R-EKO-04) ---------- */
const owns=id=>ITEM[id]&&(ITEM[id].price===0||S.owned.some(o=>o.itemId===id));
function buy(id){
  const it=ITEM[id]; if(!it) throw new Error('Ürün bulunamadı.');
  if(owns(id)) return false;
  if(balance()<it.price) throw new Error('Jetonun yetmiyor.');
  const tx={id:uid('t'),at:nowISO(),amount:-it.price,reason:'purchase',refKey:'buy:'+id};
  if(hasRef(tx.refKey)) throw new Error('Bu ürün zaten satın alınmış görünüyor.');
  S.ledger.push(tx); S.owned.push({itemId:id,at:tx.at,txId:tx.id});
  return true;
}
function whereIs(id){
  const out=[];
  for(const key of ROOM_ORDER) for(const slot of ROOMS[key].slots) if(S.rooms[key].slots[slot]===id) out.push({room:key,slot});
  return out;
}
function slotsFor(type){
  const out=[];
  for(const key of ROOM_ORDER) for(const slot of ROOMS[key].slots) if(SLOT_TYPE[slot]===type) out.push({room:key,slot});
  return out;
}
function place(id,room,slot){
  const it=ITEM[id];
  if(!it||SLOT_TYPE[slot]!==it.type) throw new Error('Bu eşya oraya uymuyor.');
  if(!owns(id)) throw new Error('Önce satın almalısın.');
  if(it.price>0&&!it.multi) for(const w of whereIs(id)) S.rooms[w.room].slots[w.slot]=DEFAULT_ITEM[it.type];
  S.rooms[room].slots[slot]=id;
}
function itemIn(room,slot){
  if(UI.preview&&UI.preview.room===room&&UI.preview.slot===slot) return ITEM[UI.preview.itemId];
  return ITEM[S.rooms[room].slots[slot]];
}
function setCompanion(id){ if(!owns(id)) throw new Error('Önce satın almalısın.'); S.companion.itemId=id; }
