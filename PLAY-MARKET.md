# Kodbuzar → Google Play: bosqichma-bosqich yo'riqnoma

Tayyor fayllar:

| Nima | Qayerda |
|---|---|
| Imzolangan AAB (Play'ga yuklash uchun) | `release/Kodbuzar-1.0.0.aab` |
| Sinab ko'rish uchun APK | `release/Kodbuzar.apk` |
| Do'kon matnlari (EN / RU / UZ) | `store/LISTING.md` |
| Ikonka 512×512 | `store/icon-512.png` |
| Banner 1024×500 | `store/<til>/feature-graphic-1024x500.png` |
| Skrinshotlar 1080×1920 (8 ta) | `store/<til>/phone-0N-*.png` |
| Maxfiylik siyosati | `docs/privacy.html` |
| Imzo kaliti (**yo'qotmang!**) | `release/kodbuzar.keystore` + `release/KEYSTORE-PAROL.txt` |

## 1. Akkauntlar (buni faqat siz ocha olasiz)
1. **GitHub:** https://github.com/signup (bepul).
2. **Google Play Console:** https://play.google.com/console/signup. Bir martalik **$25** to'lov, shaxsni tasdiqlash (pasport/ID) kerak.
   Yakka tartibdagi (personal) akkauntni tanlasangiz, Google bu akkauntlardan production'ga chiqishdan oldin
   **yopiq testni (closed testing) kamida 12 ta tester bilan 14 kun ketma-ket** o'tkazishni talab qilgan (talab o'zgargan bo'lishi mumkin,
   Play Console'dagi hozirgi shartni tekshiring). Test uchun do'st/oilangiz Gmail manzillarini yig'ib qo'ying.

## 2. Loyihani GitHub'ga yuklash
Loyiha papkasida git repo va birinchi commit tayyor. GitHub'da bo'sh repo yarating (README/gitignore qo'shmasdan), so'ng:

```bash
git remote add origin https://github.com/<foydalanuvchi>/<repo>.git
git branch -M main
git push -u origin main
```

Kalit fayllar (`*.keystore`, `keystore.properties`, `release/`) `.gitignore` da, ular GitHub'ga **chiqmaydi**. Ularni boshqa joyga (USB, parol menejeri) nusxalab qo'ying.

## 3. Maxfiylik siyosatini e'lon qilish
1. `docs/privacy.html` ichidagi `[YOUR EMAIL]` ni (3 joyda) o'z emailingizga almashtiring va commit/push qiling.
2. GitHub repo → **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main`, folder: `/docs`**.
3. 1–2 daqiqadan keyin havola tayyor: `https://<foydalanuvchi>.github.io/<repo>/privacy.html`. Shuni Play Console'ga qo'yasiz.

## 4. Play Console'da ilova yaratish
1. **Create app** → nom `Kodbuzar - Code Breaker Game`, til English (US), **Game**, **Free**.
2. **Dashboard** dagi vazifalarni bajaring:
   - **App access:** barcha funksiyalar login'siz ochiq.
   - **Ads:** No ads.
   - **Content rating:** savolnomani to'ldiring (hammasiga "No"), natija *Everyone*.
   - **Target audience:** 13+ (bolalar uchun emas).
   - **Data safety:** "No data collected / No data shared" (tafsilot `store/LISTING.md` da).
   - **Privacy policy:** 3-bo'limdagi havola.
   - **Government apps / Financial features / Health:** No.
3. **Main store listing:** `store/LISTING.md` dagi matnlarni, `store/icon-512.png`, banner va 8 ta skrinshotni yuklang.
   So'ng **Manage translations** orqali Русский va O'zbekcha qo'shing, har biriga o'z papkasidagi rasmlarni va matnni yuklang.
4. **Testing → Closed testing → Create release** → `release/Kodbuzar-1.0.0.aab` ni yuklang (**Play App Signing** ni qabul qiling:
   sizning kalitingiz "upload key" bo'ladi, Google ilovani o'z kaliti bilan imzolab tarqatadi).
5. Tester ro'yxatini qo'shing, havolani ularga yuboring, 14 kun kuting.
6. Talab bajarilgach: **Production → Create release** → shu AAB (yoki yangisi) → **Review** → **Send for review**. Tekshiruv odatda bir necha kundan 7 kungacha.

## 5. Yangilanish chiqarish
1. `android/app/build.gradle` da `versionCode` ni **oshiring** (1 → 2 → …) va `versionName` ni yangilang.
2. Yig'ing:
   ```bash
   npm run cap:sync
   cd android
   set JAVA_HOME=C:\Users\Victus\android-build\jdk
   set ANDROID_HOME=C:\Users\Victus\android-build\sdk
   gradlew.bat bundleRelease
   ```
   Natija: `android/app/build/outputs/bundle/release/app-release.aab` (imzo `android/keystore.properties` orqali avtomatik).
3. Yangi AAB'ni Play Console'ga yangi release sifatida yuklang.

## 6. Eslatmalar
- Paket nomi `uz.kodbuzar.app` birinchi yuklashdan keyin **o'zgarmaydi**.
- Kalit yo'qolsa, Play App Signing yoqilgan bo'lsa Google orqali upload key'ni tiklash mumkin, lekin jarayon uzoq. Nusxa saqlang.
- Skrinshotlarni yangilash: `npm run dev -- --port 5173`, boshqa oynada `node scripts/make-screenshots.mjs` (Chrome kerak).
  Banner va ikonka: `node scripts/make-store-graphics.mjs`.
