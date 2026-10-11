import React,{useEffect,useMemo,useRef,useState} from 'react';
import {AppState,BackHandler,KeyboardAvoidingView,Platform,Pressable,StyleSheet,Text,View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider,useSafeAreaInsets} from 'react-native-safe-area-context';
import {WebView,WebViewMessageEvent} from 'react-native-webview';
import {UI_HTML} from './raf/UI_HTML';
import {createNativeServices} from './raf/NativeServices';
import {AudioEngine} from './raf/AudioEngine';
import type {AudioSettings,BridgeMessage,NativeEvent} from './raf/types';

const BUILD='LUMARAF-0.1.0-ILK-ODALAR';
const BG='#0f0c0b';
function Application(){
  const web=useRef<WebView>(null);
  const insets=useSafeAreaInsets();
  const [audio,setAudio]=useState<AudioSettings>({playing:false,volumes:{}});
  const [fatal,setFatal]=useState<string|null>(null);
  const [generation,setGeneration]=useState(0);
  const send=(message:unknown)=>web.current?.injectJavaScript(`window.__rafReceive&&window.__rafReceive(${JSON.stringify(message).replace(/</g,'\\u003c')});true;`);
  const sendRef=useRef(send);sendRef.current=send;
  const services=useMemo(()=>createNativeServices({emit:(e:NativeEvent)=>sendRef.current(e),setAudio}),[]);
  const source=useMemo(()=>({html:UI_HTML}),[]);
  const insetJs=`document.documentElement.style.setProperty('--safe-top','${Math.max(0,insets.top)}px');document.documentElement.style.setProperty('--safe-bottom','${Math.max(0,insets.bottom)}px');true;`;

  useEffect(()=>{
    const sub=AppState.addEventListener('change',state=>{
      if(state!=='active'){setAudio(v=>({...v,playing:false}));sendRef.current({type:'background'});}
      else sendRef.current({type:'resume'});
    });
    const back=BackHandler.addEventListener('hardwareBackPress',()=>{sendRef.current({type:'back'});return true});
    return()=>{sub.remove();back.remove();};
  },[]);
  useEffect(()=>{web.current?.injectJavaScript(insetJs);},[insets.top,insets.bottom]);

  async function onMessage(event:WebViewMessageEvent){
    let message:BridgeMessage;
    try{
      if(event.nativeEvent.data.length>20*1024*1024)throw new Error('Mesaj çok büyük.');
      message=JSON.parse(event.nativeEvent.data);
      if(!message||typeof message.id!=='string'||typeof message.type!=='string')throw new Error('Geçersiz köprü mesajı.');
    }catch{return;}
    try{
      if(message.type==='diagnostic'){const p=message.payload||{};console.warn('[LumaRaf UI] '+String(p.message||'').slice(0,320));send({replyTo:message.id,result:true});return;}
      if(message.type==='ready')console.info('[LumaRaf] '+BUILD+' · arayüz yüklendi.');
      const result=await services.handle(message);send({replyTo:message.id,result});
    }catch(e){send({replyTo:message.id,error:e instanceof Error?e.message:'İşlem tamamlanamadı.'});}
  }
  if(Platform.OS==='web')return <View style={styles.error}><Text style={styles.title}>LumaRaf</Text><Text style={styles.message}>Tarayıcıda ONIZLEME.html dosyasını aç. Expo uygulaması iPhone ve Android içindir.</Text></View>;
  return <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={[styles.root,{backgroundColor:BG}]}>
    <StatusBar style="light"/>
    <AudioEngine settings={audio} onError={m=>{setAudio(v=>({...v,playing:false}));send({type:'audioError',payload:m})}}/>
    {fatal?<View style={styles.error}><Text style={styles.title}>Görünüm yüklenemedi.</Text><Text style={styles.message}>{fatal}</Text><Pressable accessibilityRole="button" style={styles.retry} onPress={()=>{setFatal(null);setGeneration(v=>v+1)}}><Text>Yeniden dene</Text></Pressable></View>:<WebView
      key={generation}
      ref={web}
      source={source}
      style={{flex:1,backgroundColor:BG}}
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      cacheEnabled={false}
      bounces={false}
      overScrollMode="never"
      showsVerticalScrollIndicator={false}
      automaticallyAdjustContentInsets={false}
      contentInsetAdjustmentBehavior="never"
      keyboardDisplayRequiresUserAction={false}
      allowsLinkPreview={false}
      setSupportMultipleWindows={false}
      allowFileAccess={false}
      mixedContentMode="never"
      injectedJavaScriptBeforeContentLoaded={insetJs}
      onLoadEnd={()=>web.current?.injectJavaScript(insetJs)}
      onMessage={onMessage}
      onShouldStartLoadWithRequest={r=>r.url==='about:blank'||r.url.startsWith('about:blank#')}
      onContentProcessDidTerminate={()=>{setAudio(v=>({...v,playing:false}));setGeneration(v=>v+1)}}
      onRenderProcessGone={()=>setFatal('Telefon görüntüleme sürecini kapattı. Kaydedilen verilerin korunuyor.')}
      onError={e=>setFatal(e.nativeEvent.description||'WebView yüklenemedi.')}
    />}
  </KeyboardAvoidingView>;
}
export default function App(){return <SafeAreaProvider><Application/></SafeAreaProvider>}
const styles=StyleSheet.create({root:{flex:1},error:{flex:1,backgroundColor:BG,alignItems:'center',justifyContent:'center',padding:30},title:{color:'#f5ece1',fontSize:24,marginBottom:18,textAlign:'center'},message:{color:'#b7a796',fontSize:15,lineHeight:24,textAlign:'center'},retry:{marginTop:25,backgroundColor:'#f2b766',padding:16,borderRadius:14}});
