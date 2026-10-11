'use strict';
/* LumaRaf · sabit veriler: palet, odalar, katalog, ekonomi, ses kanalları.
   Spesifikasyon: SPEC-0.1 (R-GRS-02 palet, R-EKO katalog/ekonomi, R-EV yuvalar). */

// R-GRS-02: sahne, kitap ve kaset sırtları yalnızca bu paletten renk alır.
const C = {
  ink:'#0f0c0b', night:'#1b1513', wood0:'#2a1a12', wood1:'#3a2014', wood2:'#4a3428', wood3:'#6b3a22',
  rust:'#7a2e22', brick:'#9c4a2c', terra:'#c06a3a', terra2:'#c8643c', tan:'#d08a50', ochre:'#d9a05b',
  gold:'#e8c27a', lamp:'#f2b766', cream:'#efe2c8', sand:'#c9b89a', taupe:'#b7a796', mute:'#7e6f63',
  olive:'#5b6b3a', moss:'#3f5a3c', sage:'#93b48b', fern:'#7e926c', teal:'#173e42', slate:'#2f4a5a',
  blue:'#365f73', aqua:'#5fa8a0', rain:'#6f8fc0', navy:'#2a2f4a', plum:'#5b3b5e', berry:'#8a4a5c',
  rose:'#b07a6a', pink:'#ed92a2', sky0:'#0d0f1a', sky1:'#161a2b', sky2:'#20253b', white:'#f7f1e6',
  tealD:'#11302f', wall:'#4a2a22', wallD:'#3d221c', black:'#080706'
};
const PALETTE = Object.values(C);
// Kitap/kaset sırtı için seçilebilir tonlar (koyu arka planda okunur olanlar)
const SPINE_COLORS = [C.rust,C.brick,C.terra,C.ochre,C.gold,C.olive,C.moss,C.slate,C.blue,C.rain,C.navy,C.plum,C.berry,C.rose,C.cream,C.sand,C.wood3,C.teal,C.aqua,C.sage];

const BUILD = (typeof window!=='undefined'&&window.RAF_BUILD)||'LUMARAF-dev';

// R-EV-01: oda anahtarları sabittir.
const ROOMS = {
  reading:{ key:'reading', name:'Okuma odası', eyebrow:'EVİM', hint:'Kitaplığın burada',
            slots:['view','bookcase','art','lamp','sofa','table','rug','plant'] },
  tv:     { key:'tv', name:'TV odası', eyebrow:'EVİM', hint:'Kasetlerin burada',
            slots:['view','tv','tapes','music','lamp','tvseat','rug','plant'] },
  balcony:{ key:'balcony', name:'Balkon', eyebrow:'EVİM', hint:'Yağmuru dinle',
            slots:['view','lights','chair','btable','plant','plant2'] }
};
const ROOM_ORDER = ['reading','tv','balcony'];

// Yuva → kabul ettiği eşya türü (R-EV-13)
const SLOT_TYPE = { view:'view', bookcase:'bookcase', art:'art', lamp:'lamp', sofa:'sofa', table:'table', rug:'rug',
  plant:'plant', plant2:'plant', tv:'tv', tapes:'tapes', music:'music', tvseat:'tvseat', lights:'lights', chair:'chair', btable:'btable' };
const TYPE_LABEL = { view:'Pencere manzarası', bookcase:'Kitaplık', art:'Duvar', lamp:'Lamba', sofa:'Koltuk', table:'Sehpa',
  rug:'Halı', plant:'Bitki', tv:'Televizyon', tapes:'Kaset rafı', music:'Müzik çalar', tvseat:'Oturma', lights:'Işıklar',
  chair:'Sandalye', btable:'Balkon masası', cat:'Yol arkadaşı' };

/* Katalog. price 0 = başlangıç eşyası (her zaman var, her yuvada kullanılabilir).
   multi:true = aynı anda birden fazla odada kullanılabilir (manzaralar).
   Diğer eşyaların tek kopyası vardır (R-EV-12). */
const CATALOG = [
  // Koltuklar
  {id:'sofa_terra',  type:'sofa', name:'Terrakota kanepe', price:0,    look:{base:C.terra2,shade:C.brick,light:C.tan,leg:C.wood0,cush:3,arm:'round'}},
  {id:'sofa_velvet', type:'sofa', name:'Yeşil kadife kanepe', price:650, look:{base:C.moss,shade:'#2f4630',light:C.fern,leg:C.wood1,cush:2,arm:'round'}},
  {id:'sofa_navy',   type:'sofa', name:'Lacivert chesterfield', price:900, look:{base:C.navy,shade:'#1f2338',light:C.blue,leg:C.wood0,cush:3,arm:'scroll',tuft:true}},
  {id:'sofa_rose',   type:'sofa', name:'Gül kurusu kanepe', price:750, look:{base:C.rose,shade:C.berry,light:'#c99686',leg:C.wood1,cush:2,arm:'square'}},
  {id:'sofa_cream',  type:'sofa', name:'Krem modüler kanepe', price:1100, look:{base:C.sand,shade:C.taupe,light:C.cream,leg:C.wood2,cush:3,arm:'square',low:true}},
  // Kitaplıklar
  {id:'bc_pine',   type:'bookcase', name:'Çam kitaplık', price:0,   look:{frame:C.ochre,dark:C.wood3,back:C.wood1,shelves:4}},
  {id:'bc_walnut', type:'bookcase', name:'Ceviz kitaplık', price:800, look:{frame:C.wood3,dark:C.wood0,back:'#24140d',shelves:5}},
  {id:'bc_white',  type:'bookcase', name:'Beyaz kitaplık', price:600, look:{frame:C.cream,dark:C.sand,back:C.wood2,shelves:5}},
  {id:'bc_ladder', type:'bookcase', name:'Merdivenli kütüphane', price:1400, look:{frame:C.brick,dark:C.rust,back:'#2b130c',shelves:6,ladder:true}},
  // Lambalar
  {id:'lamp_bulb',    type:'lamp', name:'Çıplak ampul', price:0,   look:{kind:'bulb'}},
  {id:'lamp_floor',   type:'lamp', name:'Abajur', price:300, look:{kind:'floor',shade:C.ochre}},
  {id:'lamp_lantern', type:'lamp', name:'Asılı fener', price:250, look:{kind:'lantern'}},
  {id:'lamp_lava',    type:'lamp', name:'Lav lambası', price:450, look:{kind:'lava'}},
  // Halılar
  {id:'rug_mat',     type:'rug', name:'Hasır paspas', price:0,   look:{kind:'mat',a:C.sand,b:C.taupe}},
  {id:'rug_kilim',   type:'rug', name:'Kilim', price:350, look:{kind:'kilim',a:C.rust,b:C.ochre,c:C.navy}},
  {id:'rug_round',   type:'rug', name:'Örgü yuvarlak halı', price:250, look:{kind:'round',a:C.sage,b:C.cream}},
  {id:'rug_persian', type:'rug', name:'Bordo halı', price:500, look:{kind:'persian',a:C.berry,b:C.gold,c:C.plum}},
  // Bitkiler
  {id:'plant_none',     type:'plant', name:'Boş köşe', price:0,   look:{kind:'none'}},
  {id:'plant_monstera', type:'plant', name:'Monstera', price:220, look:{kind:'monstera'}},
  {id:'plant_ivy',      type:'plant', name:'Sarmaşık', price:160, look:{kind:'ivy'}},
  {id:'plant_cactus',   type:'plant', name:'Kaktüs', price:90,  look:{kind:'cactus'}},
  {id:'plant_fern',     type:'plant', name:'Eğreltiotu', price:180, look:{kind:'fern'}},
  {id:'plant_lemon',    type:'plant', name:'Limon ağacı', price:380, look:{kind:'lemon'}},
  // Sehpa
  {id:'table_stool', type:'table', name:'Tabure', price:0,   look:{kind:'stool'}},
  {id:'table_round', type:'table', name:'Yuvarlak sehpa', price:260, look:{kind:'round'}},
  // Duvar
  {id:'art_frame',    type:'art', name:'Küçük çerçeve', price:0,   look:{kind:'frame'}},
  {id:'art_mountain', type:'art', name:'Dağ tablosu', price:150, look:{kind:'mountain'}},
  {id:'art_board',    type:'art', name:'Kara tahta pano', price:300, look:{kind:'board'}},
  // Manzaralar (multi)
  {id:'view_city',   type:'view', name:'Gece şehri', price:0,    multi:true, look:{kind:'city'}},
  {id:'view_harbor', type:'view', name:'Liman', price:900,  multi:true, look:{kind:'harbor'}},
  {id:'view_forest', type:'view', name:'Çam ormanı', price:800,  multi:true, look:{kind:'forest'}},
  {id:'view_sakura', type:'view', name:'Sakura sokağı', price:1200, multi:true, look:{kind:'sakura'}},
  // TV odası
  {id:'tv_crt',   type:'tv', name:'Küçük tüplü TV', price:0,   look:{body:C.slate,dark:'#1d2d36',knob:C.ochre}},
  {id:'tv_teal',  type:'tv', name:'Turkuaz retro TV', price:550, look:{body:C.aqua,dark:C.teal,knob:C.cream}},
  {id:'tv_wood',  type:'tv', name:'Ahşap kasalı TV', price:700, look:{body:C.wood3,dark:C.wood0,knob:C.gold,wood:true}},
  {id:'tapes_box',     type:'tapes', name:'Ahşap kaset kutusu', price:0,   look:{wood:C.wood3,dark:C.wood1,rows:1}},
  {id:'tapes_cabinet', type:'tapes', name:'Kaset dolabı', price:800, look:{wood:C.brick,dark:C.wood0,rows:2}},
  {id:'tvseat_pouf',  type:'tvseat', name:'Puf', price:0,   look:{kind:'pouf',base:C.blue,shade:C.slate}},
  {id:'tvseat_bean',  type:'tvseat', name:'Armut koltuk', price:350, look:{kind:'bean',base:C.terra2,shade:C.brick}},
  {id:'tvseat_sofa',  type:'tvseat', name:'Kadife ikili', price:850, look:{kind:'love',base:C.plum,shade:'#432a45'}},
  {id:'music_cassette', type:'music', name:'Kasetçalar', price:0,   look:{kind:'boombox'}},
  {id:'music_radio',    type:'music', name:'Eski radyo', price:450, look:{kind:'radio'}},
  {id:'music_vinyl',    type:'music', name:'Pikap', price:700, look:{kind:'vinyl'}},
  // Balkon
  {id:'chair_wicker', type:'chair', name:'Hasır sandalye', price:0,   look:{kind:'wicker'}},
  {id:'chair_deck',   type:'chair', name:'Şezlong', price:300, look:{kind:'deck'}},
  {id:'chair_swing',  type:'chair', name:'Salıncak koltuk', price:950, look:{kind:'swing'}},
  {id:'lights_none',    type:'lights', name:'Işık yok', price:0,   look:{kind:'none'}},
  {id:'lights_fairy',   type:'lights', name:'Işık zinciri', price:280, look:{kind:'fairy'}},
  {id:'lights_lantern', type:'lights', name:'Kâğıt fenerler', price:420, look:{kind:'paper'}},
  {id:'btable_crate', type:'btable', name:'Ahşap kasa', price:0,   look:{kind:'crate'}},
  {id:'btable_tea',   type:'btable', name:'Çay masası', price:240, look:{kind:'tea'}},
  // Yol arkadaşları (yuva değil, S.companion)
  {id:'cat_tabby', type:'cat', name:'Tekir', price:0,   look:{a:'#8a7a6a',b:'#5e5146',c:C.cream}},
  {id:'cat_black', type:'cat', name:'Kara kedi', price:600, look:{a:'#26222a',b:'#151317',c:'#3a3540'}},
  {id:'cat_ginger',type:'cat', name:'Sarman', price:600, look:{a:C.tan,b:C.terra,c:C.cream}},
  {id:'cat_white', type:'cat', name:'Beyaz kedi', price:800, look:{a:C.cream,b:C.sand,c:C.white}},
];
const ITEM = Object.fromEntries(CATALOG.map(i=>[i.id,i]));
const DEFAULT_ITEM = {};
for(const i of CATALOG) if(i.price===0 && !DEFAULT_ITEM[i.type]) DEFAULT_ITEM[i.type]=i.id;

const SHOP_TABS = [
  {key:'reading', label:'Okuma odası', types:['sofa','bookcase','lamp','rug','plant','table','art']},
  {key:'tv',      label:'TV odası',    types:['tv','tapes','tvseat','music','lamp','rug','plant']},
  {key:'balcony', label:'Balkon',      types:['chair','lights','btable','plant']},
  {key:'view',    label:'Manzaralar',  types:['view']},
  {key:'cat',     label:'Arkadaşlar',  types:['cat']},
  {key:'owned',   label:'Sahip olduklarım', types:null},
];

// R-EKO: tüm sayılar tek yerde.
const ECONOMY = {
  welcome:150,
  // GEÇİCİ MOD: yapay zekâ doğrulaması bağlanana kadar "Okudum" beyanı ödül verir.
  // Doğrulama eklendiğinde bu bayrak kapatılıp verify_base/page_bonus doğrulamaya taşınacak.
  interimRewards:true,
  readBase:50, pagePer100:10, pageMax:50,
  avgPerBook:75,
};

// Ses kanalları (raf/AudioAssets.ts anahtarlarıyla aynı)
const CHANNELS = [
  {key:'rain', label:'Yağmur', note:'Saha kaydı · CC0'},
  {key:'fire', label:'Şömine', note:'Saha kaydı · CC0'},
  {key:'vinyl', label:'Plak çıtırtısı', note:'Özgün sentez'},
  {key:'brown', label:'Yumuşak gürültü', note:'Özgün sentez'},
];
const PIANOS = [
  {key:'pianoMoon', label:'Gece Notları', note:'48 BPM · özgün'},
  {key:'pianoGlass', label:'Camdaki Damlalar', note:'84 BPM · özgün'},
  {key:'pianoVelvet', label:'Kadife Piyano', note:'Döngü · CC0'},
];
const DEFAULT_MIX = {
  reading:{rain:40,fire:0,vinyl:0,brown:0,piano:'pianoMoon',pianoVol:30},
  tv:     {rain:20,fire:0,vinyl:30,brown:0,piano:'pianoGlass',pianoVol:25},
  balcony:{rain:55,fire:0,vinyl:0,brown:10,piano:'pianoVelvet',pianoVol:20},
};
