'use strict';
/* Açılış: kaydı yükle → normalize → çiz. */
(async function boot(){
  try{
    const saved=await Native.call('load');
    if(saved){ S=normalize(saved); }
    else { S=freshState(); await persistNow(); }
  }catch(e){
    // Kayıt okunamadıysa üzerine yazmayız (R-VER): yalnızca uyarı gösteririz.
    document.getElementById('view').innerHTML='<div class="card hint" style="margin-top:40px"><div class="serif">Kayıt okunamadı.</div><p class="muted">'+esc(e.message)+'</p><p class="muted">Dosyaların silinmedi. Uygulamayı kapatıp yeniden aç; sorun sürerse bu mesajı paylaş.</p></div>';
    return;
  }
  UI.room=S.lastRoom||'reading';
  render();
  Native.call('ready').catch(()=>{});
  syncAudio();
  if(!S.prefs.intro) setTimeout(()=>openSheet('welcome'),350);
  window.addEventListener('resize',()=>{ if(UI.tab!=='home') render(); else Scene.redraw(); });
})();
