# Owl Stare — Build Plan (v1, 2026-10-15)

Dasar: GDD v0.2 (approved 15 Okt 2026), art style A (`concept/styleA`: kertas cream, garis ink brush-pen, aksen pale blue / pale yellow, font Gaegu).
Pola teknis ikut Cake Tower: Phaser 3 tanpa build step, semua library di-vendor lokal, tools Node lewat Chrome DevTools Protocol.

## 1. Arsitektur

```
 kamera (getUserMedia, facingMode:user)
    │ <video> (preview kecil di DOM, mirror, bisa disembunyikan)
    ▼
 face/tracker.js ── MediaPipe FaceLandmarker (VIDEO mode, GPU→CPU fallback, ~30 fps, rAF)
    │   per frame: { face, blinkL, blinkR, smile, jawOpen, yaw, pitch, t }
    ▼
 face/judge.js  (pure, tanpa DOM; dites di Node)
    │   threshold dari kalibrasi + filter waktu: blink ≥120 ms, away ≥500 ms, smile ≥150 ms
    │   output: null | "blink" | "smile" | "away"
    ▼
 Phaser scenes ── Title → CameraAsk → (Denied) → Calibrate → Match → Result
                  owl + tricks (faces, feathers, ...) + audio WebAudio synth
```

- **Phaser 3.90** (`lib/phaser.min.js`, sama dengan Cake Tower), skala `RESIZE`, layout portrait & landscape.
- **MediaPipe Tasks Vision 1.0.1** (`lib/mediapipe/`, ES module + wasm SIMD & no-SIMD) dan model `models/face_landmarker.task` (float16, 3.6 MB). Semua lokal: tidak ada request ke CDN, sejalan dengan janji privasi.
- Output yang dipakai: `faceBlendshapes` (eyeBlinkLeft/Right, mouthSmileLeft/Right, jawOpen) dan `facialTransformationMatrixes` (yaw/pitch kepala).
- ES modules, jadi game harus lewat http(s) (itch OK). Lokal: `node tools/serve.mjs`. Bukan `file://` seperti Cake Tower: wasm + ES module tidak jalan dari file.
- Progress (kalibrasi, owl yang sudah dikalahkan) di `localStorage`, dibungkus try/catch.
- Debug: `?debug` menampilkan meter sinyal; `?fake` mengganti tracker dengan sinyal palsu yang bisa diatur dari script (untuk test logika game tanpa kamera).

## 2. Struktur file

```
index.html              game
spike.html             M1: halaman tech spike (meter blink/smile/yaw, kalibrasi, log event)
src/
  main.js              config Phaser + daftar scene
  face/tracker.js      kamera + FaceLandmarker loop
  face/signals.js      blendshape + matrix → sinyal (yaw/pitch)
  face/judge.js        pure: aturan kalah + filter waktu
  face/calibrate.js    pure: sampel → threshold
  scenes/*.js          Title, CameraAsk, Denied, Calibrate, Match, Result
  owls/hoot.js         data owl: nama, durasi, set trik
  tricks/*.js          face.js, feathers.js, (M3: joke, bug, hoot-sound, popup, dance)
  art/owl.js           owl doodle digambar dari SVG (placeholder sampai art final)
  audio.js             WebAudio synth (tick, sting, fanfare, HOOT)
lib/  models/  assets/fonts (Gaegu, OFL)
tools/
  serve.mjs            static server lokal
  check.mjs            screenshot + eval headless (dari Cake Tower, versi http + kamera palsu)
  record-steady.mjs    rekam frame (dari Cake Tower, M4)
  fake-cam.sh          gambar wajah → .y4m untuk kamera palsu Chrome
  build-zip.sh         zip untuk itch
test/                  node --test (judge, calibrate) + fixtures wajah
```

## 3. Milestone (GDD §10) + cara verifikasi

| # | Isi | Verifikasi (oleh saya, headless) |
|---|---|---|
| **M1 Tech spike** | tracker, sinyal, judge, kalibrasi 3 langkah (rileks → kedip → senyum), spike.html | (a) unit test judge/calibrate; (b) MediaPipe jalan di Chrome headless pada foto wajah nyata: netral vs mata tertutup vs senyum vs menoleh, nilai blendshape/yaw masuk akal; (c) Chrome kamera palsu (`--use-file-for-fake-video-capture`) memutar klip netral→kedip→senyum→menoleh→kosong, spike.html harus melapor event berurutan; (d) iframe lintas-origin dengan `allow="camera"` jalan, tanpa `allow` muncul layar "kamera dibutuhkan"; (e) viewport HP portrait. |
| **M2 Prototype** | Hoot (1 owl), 2 trik (funny face, feather flurry), loop penuh: title → izin kamera → kalibrasi → countdown 3-2-1-STARE → match + timer → kalah (reaksi owl) / menang → result card → retry | Mode `?fake`: script memaksa kedip di detik X → harus kalah "blink" dengan waktu benar; tanpa gangguan → menang setelah 10 s; screenshot tiap layar desktop + HP; lalu satu run end-to-end dengan kamera palsu (klip wajah) sampai kalah. Nol error di console. |
| M3 Ladder | 8 owl + semua trik, ladder map, progress localStorage | screenshot tiap owl; tiap trik dipicu paksa; save/load progress |
| M4 Polish | result card (Save/Share, tanpa wajah), audio final, halaman itch, video promo (record-steady) | zip build, cek di halaman itch draft (setelah approval Angel) |

## 4. Aset

**Art (style A, garis ink tebal, cream/putih/abu, mata kuning):**
- Per owl: idle, blink-taunt, 4–6 funny faces, reaksi menang (tertawa / menunjuk), reaksi kalah (kaget/cemberut), wajah ladder (ikon kecil). Hoot dulu.
- Trik: bulu (3 bentuk), lalat/kumbang (2 frame jalan), pop-up palsu, speech bubble joke, garis kaget "!!" & petir kuning (sudah ada di concept screen).
- UI: bar timer + jam weker, frame preview kamera, tombol doodle, ikon kamera/mata, latar kertas.
- **M1–M2: digambar sendiri sebagai SVG/Phaser Graphics bergaya doodle (placeholder).** Art final: lihat keputusan Angel di bawah.

**Audio (WebAudio synth seperti Cake Tower, tanpa file):** tick tegang, countdown blip, "STARE!" sting, HOOT (synth formant), squeak, kalah (trombone turun), menang (fanfare kecil), musik DJ (M3).

## 5. Risiko

| Risiko | Mitigasi |
|---|---|
| Izin kamera di iframe itch | GDD: iframe Cake Tower ada `allow="camera"`. Disimulasikan lokal (iframe lintas-origin). Tetap wajib dites di halaman itch asli (draft) — butuh approval Angel. Fallback: tombol "open in new window" (itch fullscreen / tab baru). |
| HP: wasm 12 MB + model 3.6 MB, GPU delegate gagal, fps rendah | load sekali dengan progress bar; GPU → CPU fallback; turunkan resolusi kamera 640x480; judge pakai waktu nyata (bukan jumlah frame) jadi fps rendah tetap adil. |
| iOS Safari: `playsinline`, autoplay audio, izin per sesi | `<video playsinline muted>`, audio dibuka setelah tap pertama. Tes di iPhone asli = butuh Angel / device. |
| Kacamata, cahaya gelap, kulit gelap → blink/smile meleset | kalibrasi per pemain (threshold di antara rileks dan kedip); layar "terlalu gelap / wajah tidak terlihat"; GDD open question tetap. |
| False lose (frame noise) bikin frustrasi | filter waktu + sedikit "grace" setelah STARE!; replay menunjukkan apa yang terdeteksi ("You blinked!"). |
| Verifikasi tanpa kamera asli | foto wajah public domain + kamera palsu Chrome + mode `?fake`. Uji wajah sungguhan tetap perlu Angel sekali main. |
| Privasi | semua lokal; tidak ada analytics di M1–M2; teks penjelasan sebelum prompt browser. |

## 6. Keputusan untuk Angel (nanti, tidak memblokir M1–M2)
1. Art final: digenerate (Google Flow seperti concept) lalu dipotong, atau tetap doodle SVG buatan kode?
2. Boleh upload build draft (restricted, tidak publik) ke itch untuk tes kamera di iframe asli?
3. Tes di HP asli (iPhone/Android) — Angel main sekali dari link lokal/itch draft.

## 7. Catatan setelah M1–M2 (15 Okt 2026)
- **Blink:** filter 120 ms dari GDD membuang hampir semua kedipan asli (di atas threshold cuma ~70–130 ms, 2–4 frame). Diganti: **2 frame berturut-turut** (≥30 ms). Diuji dengan video nyata: 12/15 kedipan tertangkap, 0 alarm palsu.
- **Grace 400 ms** setelah STARE! sebelum judge aktif.
- Threshold kedip = istirahat + 50% jarak ke puncak; senyum = istirahat + 45%. Kalibrasi gagal (tidak kedip/senyum) diulang sekali, lalu pakai default aman.
- Verifikasi headless: `tools/check.mjs` (+ `--cam`, `--drive`, `--shotq`, `--mobile`, `--deny`), `test/drive-*.js`, footage public domain (`tools/fetch-fixtures.sh`, `tools/fake-cam.sh`).

## 8. Catatan M3 (16 Okt 2026)
- Keputusan Angel: art final = doodle SVG style A; Hoot tetap face + feathers; itch draft boleh (zip: `tools/build-zip.sh`).
- Owl = 3 layer (body per owl, face bersama, front props) di `src/art/owl-sprite.js`: 8 body + 9 face + 5 front, bukan 72 gambar utuh.
- Trik baru: joke, fly, hoot, squeak, popup, knit, surprise, dance. Twins = 2 owl dengan jadwal trik sendiri-sendiri; boss `overlap` (trik berikutnya tidak menunggu). Trik kembali ke `owl.home`, jadi trik yang tumpang-tindih tidak menggeser owl.
- Ladder: owl terkunci = siluet tinta; terbuka bila owl sebelumnya dikalahkan (`localStorage owlstare.v1.beaten`).

## 9. Sisa milestone (update 16 Okt 2026)
Keputusan Angel 16 Okt: art tetap doodle SVG; Hoot 2 trik; itch hanya draft/restricted (upload oleh sesi itch staff, saya siapkan build); playtest laptop: semua kedipan tertangkap.

| # | Isi | Verifikasi |
|---|---|---|
| **M4 Result card** | Save (PNG digambar ulang dari owl + teks, **tanpa wajah/kamera**) dan Share (Web Share API dengan file bila didukung, kalau tidak: salin teks + link) | PNG tersimpan headless, dicek isinya bukan frame kamera; tombol tidak menimpa di 6 ukuran layar; `npm test` |
| **M5 Polish** | tombol mute (diingat), tick tegang makin cepat di 3 dtk terakhir, titik-titik + catatan "first time takes a while" saat model dimuat (progress asli tidak bisa: wasm dimuat MediaPipe sendiri), peringatan "can't see you" di kalibrasi bila wajah hilang/gelap | `?fake` loop penuh, screenshot tiap layar desktop + HP, nol error console |
| **M6 Mobile** | `MOBILE-TEST.md`: checklist untuk Angel (iPhone Safari + Android Chrome: izin kamera, fps, kedip, rotasi, suara setelah tap, layar terkunci/kembali); cek headless ukuran HP; kamera dilanjutkan saat tab kembali. Memori tekstur owl tidak dikurangi: di HP 2x owl memang tampil ±800 px tinggi, jadi tekstur 800x880 dibutuhkan; tunggu hasil HP asli | checklist dikirim ke Angel; screenshot HP kecil/besar/landscape |
| **M7 itch build** | `tools/build-zip.sh` ulang, teks halaman itch (deskripsi, privasi kamera, kontrol), cover 630x500 + 3 screenshot | zip diuji di iframe lintas-origin dengan kamera palsu; lapor ke manager "siap upload" (draft/restricted saja) |
| M8 Promo video | rekam frame (record-steady) owl + trik, tanpa wajah pemain | menunggu approval Angel |

## 10. Art ulang mengikuti lineup (17 Okt 2026)
Permintaan Angel lewat manager (16 Okt): owl harus sama dengan `concept/lineup.jpg`. Semua owl digambar ulang sebagai SVG di `src/art/owl.js`: garis brush tebal-tipis dengan sedikit putus (filter displacement), isi flat, piringan wajah pucat, tanda dada V, kaki gelap, sayap di dalam badan. Hoot = bayi fluffy. Wajah istirahat per owl (`rest`): dots, specs, wide, stare, sweet, idle, idle, sleepy. Layar title / kamera / kalibrasi pakai owl cream dari keyart (`GUIDE`). Pembanding: `test/compare.html`.
Build itch: hanya wasm SIMD (zip ±7 MB, batas 10 MB). Browser tanpa SIMD dapat layar "This browser can't run the owl".
