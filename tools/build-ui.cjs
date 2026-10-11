'use strict';
// tools/ui kaynaklarını tek HTML'e birleştirir → raf/UI_HTML.ts (telefon) + ONIZLEME.html (tarayıcı).
// Üretilen iki dosya elle düzenlenmez.
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),ui=path.join(root,'tools/ui');
const BUILD='LUMARAF-0.1.0-ILK-ODALAR';
const JS=['data.js','core.js','model.js','art.js','scene.js','screens.js','browser.js','main.js'];
const CSS=['style.css'];
const main=JS.map(f=>'\n/* '+f+' */\n'+fs.readFileSync(path.join(ui,f),'utf8')).join('\n');
new vm.Script(main,{filename:'lumaraf-ui.js'});
let html=fs.readFileSync(path.join(ui,'index.html'),'utf8');
html=html.replace('/*__CSS__*/',()=>CSS.map(f=>fs.readFileSync(path.join(ui,f),'utf8')).join('\n'));
html=html.replace('/*__JS__*/',()=>('window.RAF_BUILD='+JSON.stringify(BUILD)+';\n'+main).replace(/<\/script/gi,'<\\/script'));
fs.writeFileSync(path.join(root,'ONIZLEME.html'),html);
fs.writeFileSync(path.join(root,'raf/UI_HTML.ts'),'// ÜRETİLMİŞ DOSYA — tools/ui altında düzenle, sonra: node tools/build-ui.cjs\nexport const UI_HTML: string = '+JSON.stringify(html)+';\n');
console.log('Arayüz hazır: '+BUILD+' · '+Math.round(html.length/1024)+' KB');
