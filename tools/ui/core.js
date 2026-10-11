'use strict';
/* LumaRaf · çekirdek: köprü, kalıcı durum (S), geçici ekran durumu (UI), kayıt, sayfa/sheet, bildirim. */

let S = null;            // kalıcı durum — yalnızca model.js işlevleriyle değiştirilir
const UI = {             // geçici ekran durumu — diske yazılmaz
  tab:'home', room:'reading', edit:false, preview:null, booksView:'shelf', filmsView:'rack',
  shopTab:'reading', sheet:null, highlight:null, saving:'idle'
};

const $ = (sel,root=document)=>root.querySelector(sel);
const $$ = (sel,root=document)=>[...root.querySelectorAll(sel)];
const esc = s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = (p='x')=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const nowISO = ()=>new Date().toISOString();
const fmt = n=>Number(n||0).toLocaleString('tr-TR');
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const norm = s=>String(s||'').toLocaleLowerCase('tr-TR').normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9ığüşöç ]/g,' ').replace(/\s+/g,' ').trim();
const TR_MONTHS=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
const TR_DAYS=['PAZAR','PAZARTESİ','SALI','ÇARŞAMBA','PERŞEMBE','CUMA','CUMARTESİ'];
const TR_MONTHS_LONG=['OCAK','ŞUBAT','MART','NİSAN','MAYIS','HAZİRAN','TEMMUZ','AĞUSTOS','EYLÜL','EKİM','KASIM','ARALIK'];
const shortDate = iso=>{if(!iso)return '';const d=new Date(iso);return d.getDate()+' '+TR_MONTHS[d.getMonth()]+' '+d.getFullYear();};
function hash(s){let h=2166136261;for(const ch of String(s)){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}

/* ---------- Köprü ---------- */
const Native = {
  _n:0, _wait:new Map(),
  available(){ return !!window.ReactNativeWebView; },
  call(type,payload={}){
    if(!this.available() && window.PreviewNative) return window.PreviewNative.call(type,payload);
    return new Promise((resolve,reject)=>{
      const id='m'+(++this._n)+'-'+Date.now();
      const timer=setTimeout(()=>{this._wait.delete(id);reject(new Error('Telefon yanıt vermedi.'));},20000);
      this._wait.set(id,{resolve,reject,timer});
      window.ReactNativeWebView.postMessage(JSON.stringify({id,type,payload}));
    });
  }
};
window.__rafReceive = function(msg){
  if(msg && msg.replyTo){
    const w=Native._wait.get(msg.replyTo); if(!w) return;
    Native._wait.delete(msg.replyTo); clearTimeout(w.timer);
    msg.error ? w.reject(new Error(msg.error)) : w.resolve(msg.result);
    return;
  }
  if(!msg||!msg.type) return;
  if(msg.type==='notice') toast(String(msg.payload||''));
  else if(msg.type==='back'){ if(UI.sheet) closeSheet(); else if(UI.edit){UI.edit=false;UI.preview=null;render();} else if(UI.tab!=='home') go('home'); }
  else if(msg.type==='background'){ Scene.pause(); persistNow(); }
  else if(msg.type==='resume'){ Scene.resume(); syncAudio(); }
  else if(msg.type==='audioError'){ toast('Ses çalınamadı: '+String(msg.payload||'').slice(0,80)); if(S){S.prefs.soundOn=false;persist();renderHeader();} }
};
window.addEventListener('error',e=>{try{Native.call('diagnostic',{message:String(e.message||e.error)}).catch(()=>{});}catch{}});

/* ---------- Kayıt (R-VER-01/02) ---------- */
let saveTimer=null, saveChain=Promise.resolve();
function persist(){ clearTimeout(saveTimer); saveTimer=setTimeout(persistNow,260); }
function persistNow(){
  clearTimeout(saveTimer); saveTimer=null;
  if(!S) return Promise.resolve();
  const snapshot=JSON.parse(JSON.stringify(S));
  UI.saving='saving';
  saveChain=saveChain.then(()=>Native.call('save',{state:snapshot})).then(()=>{UI.saving='saved';},e=>{UI.saving='error';toast('Kaydedilemedi: '+e.message);throw e;});
  return saveChain.catch(()=>{});
}

/* ---------- Bildirim ---------- */
let toastTimer=null;
function toast(text,kind=''){
  const el=$('#toast'); if(!el) return;
  el.textContent=text; el.className='toast show '+kind;
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.className='toast',2600);
}

/* ---------- Alttan açılan sayfa ---------- */
function openSheet(name,args={}){ UI.sheet={name,args}; renderSheet(); }
function closeSheet(){
  const layer=$('#sheetLayer'); if(!layer) return;
  if(UI.preview){ UI.preview=null; Scene.redraw(); }
  layer.classList.remove('open'); UI.sheet=null;
  setTimeout(()=>{ if(!UI.sheet) layer.innerHTML=''; },220);
}
function renderSheet(){
  const layer=$('#sheetLayer'); if(!UI.sheet){ layer.innerHTML=''; return; }
  const fn=Sheets[UI.sheet.name]; if(!fn) return;
  const keep=layer.querySelector('.sheet-body'); const scroll=keep?keep.scrollTop:0;
  layer.innerHTML=`<div class="dim" data-act="closeSheet"></div><section class="sheet" role="dialog" aria-modal="true"><div class="grab"></div><div class="sheet-body">${fn(UI.sheet.args)}</div></section>`;
  requestAnimationFrame(()=>layer.classList.add('open'));
  const body=layer.querySelector('.sheet-body'); if(body) body.scrollTop=scroll;
  hydrate(layer);
}

/* ---------- Gezinme ---------- */
function go(tab,opts={}){
  UI.tab=tab; UI.edit=false; UI.preview=null;
  if(opts.room) UI.room=opts.room;
  if(UI.sheet) closeSheet();
  render();
  const main=$('#view'); if(main) main.scrollTop=opts.scrollTo?main.scrollTop:0;
  if(opts.scrollTo) requestAnimationFrame(()=>{const t=$(opts.scrollTo); if(t) t.scrollIntoView({block:'start',behavior:'smooth'});});
}

/* ---------- Olay yönlendirme: data-act="ad" data-*="..." ---------- */
const Actions = {};
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-act]'); if(!el) return;
  const fn=Actions[el.dataset.act]; if(!fn) return;
  e.preventDefault(); fn(el.dataset,el,e);
});
document.addEventListener('input',e=>{
  const el=e.target.closest('[data-input]'); if(!el) return;
  const fn=Actions[el.dataset.input]; if(fn) fn(el.dataset,el,e);
});
Actions.closeSheet=()=>closeSheet();
Actions.go=d=>go(d.tab,{room:d.room,scrollTo:d.scroll});
