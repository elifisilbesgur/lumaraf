/** Telefon tarafı servisler. Köprü komutları açıkça listelenmiştir; ağ isteği yapılmaz.
 * Kayıt düzeni LumaNote 0.5.7 ile aynıdır: .tmp → .previous → state.json */
import * as FS from 'expo-file-system/legacy';
import type {AudioSettings,BridgeMessage,NativeEvent} from './types';
import {isRafState} from './types';

const ROOT=`${FS.documentDirectory}lumaraf-v1/`;
const STORE=`${ROOT}state.json`;
const explain=(e:unknown)=>e instanceof Error?e.message:'İşlem tamamlanamadı.';

export function createNativeServices(options:{emit:(event:NativeEvent)=>void;setAudio:(settings:AudioSettings)=>void}){
  let writeTail:Promise<unknown>=Promise.resolve();
  let uiReady=false;let pending:NativeEvent[]=[];
  const queueEvent=(event:NativeEvent)=>uiReady?options.emit(event):pending.push(event);

  async function prepare(){
    if(!FS.documentDirectory)throw new Error('Cihazın belge klasörüne ulaşılamadı.');
    await FS.makeDirectoryAsync(ROOT,{intermediates:true});
  }
  async function load(){
    await prepare();
    let found=false;
    for(const path of [STORE,`${STORE}.tmp`,`${STORE}.previous`]){
      if(!(await FS.getInfoAsync(path)).exists)continue;
      found=true;
      try{
        const value:unknown=JSON.parse(await FS.readAsStringAsync(path));
        if(!isRafState(value))throw new Error('Geçersiz kayıt');
        if(path!==STORE)queueEvent({type:'notice',payload:'Son geçerli yerel kaydın geri yüklendi.'});
        return value;
      }catch{/* bir sonraki kurtarma dosyasını dene */}
    }
    if(found)throw new Error('Kayıt dosyası okunamadı. Dosyalar silinmedi; yeni kayıt yapılmadan önce destek iste.');
    return null;
  }
  function save(state:unknown){
    if(!isRafState(state))return Promise.reject(new Error('Kaydedilecek veri geçersiz.'));
    const text=JSON.stringify(state);
    const job=writeTail.then(async()=>{
      await prepare();
      await FS.writeAsStringAsync(`${STORE}.tmp`,text);
      if((await FS.getInfoAsync(STORE)).exists){
        await FS.deleteAsync(`${STORE}.previous`,{idempotent:true});
        await FS.copyAsync({from:STORE,to:`${STORE}.previous`});
        await FS.deleteAsync(STORE,{idempotent:true});
      }
      await FS.moveAsync({from:`${STORE}.tmp`,to:STORE});
      return true;
    });
    writeTail=job.catch(()=>{});
    return job;
  }
  async function handle(message:BridgeMessage){
    const p=message.payload||{};
    switch(message.type){
      case 'load':return load();
      case 'save':return save(p.state);
      case 'ready':uiReady=true;for(const e of pending)options.emit(e);pending=[];return true;
      case 'audio':{
        const volumes:Record<string,number>={};
        for(const [k,v] of Object.entries(p.volumes||{}))volumes[String(k).slice(0,30)]=Math.max(0,Math.min(100,Number(v)||0));
        options.setAudio({playing:!!p.playing,volumes});return true;
      }
      default:throw new Error('Tanınmayan işlem: '+String(message.type).slice(0,40));
    }
  }
  return {handle,explain};
}
