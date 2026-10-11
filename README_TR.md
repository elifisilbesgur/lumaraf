# LumaRaf 0.1.0 · İlk odalar

Sürüm etiketi: **LUMARAF-0.1.0-ILK-ODALAR** · Expo SDK 57 · LumaNote 0.5.7 kabuğu

Okudukça kitaplığı, izledikçe kaset rafı dolan piksel bir ev. Tasarım ve kurallar:
`docs/LumaRaf_Urun_ve_Gelistirme_Spesifikasyonu.pdf` (SPEC-0.1).

## Çalıştırma (Mac)
1. Klasörü Masaüstü'ne `LumaRaf` adıyla koy. LumaNote klasörüne dokunmaz, ayrı bir projedir.
2. Terminal'de: `bash "$HOME/Desktop/LumaRaf/BASLAT.command"`
   (ya da Finder'da BASLAT.command dosyasına çift tıkla).
3. İlk açılışta paketler kurulur (birkaç dakika). Sonra QR kodu çıkar; iPhone'da Expo Go ile okut.
4. Telefon ve Mac aynı ağda değilse `TUNEL_ILE_BASLAT.command` kullan.

Varsayılan port **8099**'dur (LumaNote 8098 kullanır; ikisi aynı anda açık kalabilir).
Başka port için: `LUMA_PORT=8100 bash BASLAT.command`

## Bu sürümde olanlar
- **Evim:** okuma odası, TV odası, balkon. Üstteki "Odalar" ya da alttaki oda düğmeleri.
- **Sahneler kodla çiziliyor** (160×200 piksel): yağmur, kar, gece/alacakaranlık, yanıp sönen pencereler, lamba ışığı, uyuyan kedi.
- **Kitaplık gerçek kayıtlardan çiziliyor:** sırt kalınlığı sayfa sayısından, rengi kitaptan; raf dolunca kitaplar üstte yatay yığılır.
- **Okunacaklar** yerde yığın; **okuyorum** sehpada açık kitap.
- **TV odası:** izlenenler TV ünitesindeki kaset kutusunda, izlenecekler duvar rafında; diziler sezon sayısı kadar kasetlik kutu set; "şimdi izliyorum" televizyonda oynar; favoriler afiş duvarında.
- **Yuva sistemi:** koltuğa (veya lamba, halı, bitki, kitaplık, TV, pikap…) dokun → önizle → al/yerleştir. Tek kopya kuralı korunur.
- **Mağaza:** 50+ eşya, manzaralar, 4 kedi. Jeton defterden hesaplanır, çift ödül/ücret olmaz.
- **Ses:** oda başına karışım. Yağmur, şömine, plak çıtırtısı (yeni, özgün sentez), yumuşak gürültü ve 3 piyano.

## Henüz bağlı olmayanlar
- **Yapay zekâ doğrulaması (özet / 10 soru):** "Okudum" ekranında yeri hazır. Şimdilik okuduğunu kendin
  onaylıyorsun ve **geçici olarak** ödül veriliyor (`tools/ui/data.js` → `ECONOMY.interimRewards`).
- **Kitap / film arama:** şimdilik elle ekleniyor (ad, yazar, sayfa).
- Yedekleme dışa aktarma, bildirimler.

## Kod nerede?
| Değişiklik | Dosya |
|---|---|
| Renkler, katalog, fiyatlar, ses kanalları | `tools/ui/data.js` |
| Kayıt, köprü, sayfa açma | `tools/ui/core.js` |
| Kitap/film/mağaza kuralları, defter | `tools/ui/model.js` |
| Piksel çizimler (eşyalar, kedi, manzara) | `tools/ui/art.js` |
| Oda yerleşimleri ve dokunma alanları | `tools/ui/scene.js` |
| Ekranlar ve alttan açılan sayfalar | `tools/ui/screens.js` |
| Görünüm | `tools/ui/style.css` |
| Telefon kabuğu, kayıt dosyası, ses motoru | `App.tsx`, `raf/*.ts(x)` |

`raf/UI_HTML.ts` ve `ONIZLEME.html` **üretilmiş** dosyalardır; elle düzenleme.
Değişiklikten sonra: `node tools/build-ui.cjs && node tools/verify.cjs`
(BASLAT.command bunu her açılışta kendisi yapar.)

`ONIZLEME.html` tarayıcıda açılır; kayıt tarayıcıda tutulur, ses çalmaz.

## Kayıt
Telefonda `Documents/lumaraf-v1/state.json` (önce `.tmp`, önceki sürüm `.previous`). Hesap ve sunucu yok.

## Test durumu
Bu ortamda: TypeScript kontrolü, Expo 57 iOS Metro paketlemesi (`expo export`), kaynak doğrulaması
ve tarayıcı önizlemesinde uçtan uca akış (kitap ekle → rafa → jeton → koltuk al → yeniden aç) geçti.
Fiziksel iPhone / Expo Go ve kulaklıkta ses testi yapılmadı.
