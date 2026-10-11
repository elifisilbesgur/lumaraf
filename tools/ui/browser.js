'use strict';
/* Tarayıcı önizlemesi (ONIZLEME.html): telefon köprüsü yoksa kayıt localStorage'a yazılır, ses çalmaz.
   Telefonda (Expo Go) bu dosya hiçbir şey yapmaz. */
if(!window.ReactNativeWebView){
  const KEY='lumaraf-onizleme-v1';
  window.PreviewNative={
    async call(type,payload){
      if(type==='load'){ try{ const v=localStorage.getItem(KEY); return v?JSON.parse(v):null; }catch{ return null; } }
      if(type==='save'){ try{ localStorage.setItem(KEY,JSON.stringify(payload.state)); }catch{} return true; }
      return true;
    }
  };
}
