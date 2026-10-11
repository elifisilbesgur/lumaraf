'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'..'),pkgFile=path.join(root,'package.json'),stateDir=path.join(root,'.luma');
const BUILD='LUMARAF-0.1.0-ILK-ODALAR';
process.chdir(root);
function run(command,args){const r=cp.spawnSync(command,args,{cwd:root,stdio:'inherit',env:process.env});if(r.error)throw r.error;if(r.status!==0)throw new Error(command+' başarısız ('+r.status+').');}
function installed(){try{return JSON.parse(fs.readFileSync(path.join(root,'node_modules/expo/package.json'))).version.startsWith('57.');}catch{return false;}}
const extras=['expo-audio','expo-file-system','expo-status-bar','react-native-safe-area-context','react-native-webview','babel-preset-expo'];
function checkImports(){const {createRequire}=require('module');const req=createRequire(pkgFile);for(const k of extras)req.resolve(k);if(!installed())throw new Error('Bu proje Expo SDK 57 için hazırlandı.');}
function main(){
 fs.mkdirSync(stateDir,{recursive:true});
 const marker=path.join(stateDir,'setup-01.json');let complete=fs.existsSync(marker);
 try{if(complete)checkImports();}catch{complete=false;}
 if(!complete){
  console.log('\nPaketler bu klasöre kuruluyor (ilk açılışta birkaç dakika sürebilir)…');
  run('npm',['install']);
  if(!installed())throw new Error('Expo 57 kurulumu doğrulanamadı.');
  run(process.execPath,['node_modules/expo/bin/cli','install',...extras,'--npm']);
  run(process.execPath,['node_modules/expo/bin/cli','install','--fix','--npm']);
  checkImports();
  fs.writeFileSync(marker,JSON.stringify({build:BUILD,createdAt:new Date().toISOString(),node:process.version},null,2));
 }
 run(process.execPath,['tools/build-ui.cjs']);run(process.execPath,['tools/verify.cjs']);
 console.log('\nLumaRaf · '+BUILD+'\nTelefonda Expo Go ile bu penceredeki QR kodunu okut.\n');
 const args=['node_modules/expo/bin/cli','start','--go','--clear','--port',process.env.LUMA_PORT||'8099'];
 if(process.env.LUMA_TUNNEL==='1')args.push('--tunnel');
 run(process.execPath,args);
}
try{main();}catch(e){console.error('\nDURDU: '+e.message+'\nBu çıktıyı paylaş; proje klasörünü silme.');process.exitCode=1;}
