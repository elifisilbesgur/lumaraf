'use strict';
// Kaynak ve paket bütünlüğü kontrolü. Gerçek cihaz testi yerine geçmez.
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
let checks=0;function assert(ok,msg){checks++;if(!ok)throw new Error(msg);}
const BUILD='LUMARAF-0.1.0-ILK-ODALAR';
const pkg=JSON.parse(read('package.json')),app=JSON.parse(read('app.json')).expo;
assert(pkg.name==='lumaraf'&&pkg.main==='index.js','package.json beklenen proje değil.');
assert(pkg.dependencies.expo.startsWith('~57.'),'Bu proje Expo SDK 57 içindir.');
assert(app.extra.lumaRafBuild===BUILD,'Sürüm etiketi farklı.');
assert(/import App from ['"]\.\/App['"]/.test(read('index.js')),'Giriş dosyası hatalı.');
assert(read('App.tsx').includes("from './raf/UI_HTML'"),'Arayüz başlangıcı hatalı.');
const gen=read('raf/UI_HTML.ts'),prefix='export const UI_HTML: string = ';
const embedded=JSON.parse(gen.slice(gen.indexOf(prefix)+prefix.length).trim().replace(/;$/,''));
assert(embedded===read('ONIZLEME.html'),'Telefon ve önizleme arayüzleri farklı. node tools/build-ui.cjs çalıştır.');
assert(embedded.includes(BUILD),'Arayüzde sürüm etiketi yok.');
for(const f of fs.readdirSync(path.join(root,'tools/ui')).filter(x=>x.endsWith('.js')))new vm.Script(read('tools/ui/'+f),{filename:f});
const assets=read('raf/AudioAssets.ts');
for(const m of assets.matchAll(/require\('([^']+)'\)/g)){assert(fs.statSync(path.resolve(root,'raf',m[1])).size>1000,'Ses dosyası boş: '+m[1]);}
const lic=JSON.parse(read('licenses/Audio-Included.json'));
for(const k of [...assets.matchAll(/(\w+): require/g)].map(m=>m[1]))assert(lic[k]&&lic[k].license,'Lisans kaydı eksik: '+k);
assert(read('babel.config.js').includes('babel-preset-expo'),'Babel yapılandırması yok.');
for(const f of ['App.js','App.jsx','index.ts','app.config.js','app.config.ts'])assert(!fs.existsSync(path.join(root,f)),'Giriş çakışması: '+f);
console.log(`DOĞRULANDI: ${BUILD} · ${checks} kaynak kontrolü`);
console.log('index.js → App.tsx → raf/UI_HTML.ts. Gerçek cihaz testi ayrı yapılır.');
