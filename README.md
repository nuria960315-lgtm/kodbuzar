# Kodbuzar

3 xonali maxfiy kodni topish o'yini (Android va iOS). Kompyuterga qarshi yoki bitta telefonda 1v1.

## Qoidalar
- Kod 3 xonali, birinchi raqam 0 bo'lmaydi (`010`, `001` mumkin emas; `089`, `100` mumkin).
- Taxmindagi raqam **o'z ustunida** to'g'ri bo'lsa hisoblanadi. Natija 0 bo'lsa qizil, 1-3 bo'lsa yashil.
- 0 natijali taxminning raqamlari o'z ustunidan chiqib ketadi (pastdagi ustunlarda qizil). Raqamni bosib qo'lda ham belgilash mumkin.
- Kodni birinchi topgan raundni yutadi: 100 ochko + tezlik bonusi (`10 × (10 − taxminlar soni)`).
- 2 raund yutgan o'yinni yutadi (+50 bonus). Raundlarda boshlovchi navbat bilan almashadi.

## Ishga tushirish
```bash
npm install
npm run dev        # brauzerda sinash (telefon o'lchamida oching)
npm test           # o'yin mantiqi testlari
npm run build      # ishlab chiqarish build'i
```

## Telefon ilovasi (Capacitor)
```bash
npm run cap:sync   # build + android/ios ga nusxalash
npx cap open android   # Android Studio (Java/Android SDK kerak)
npx cap open ios       # Xcode (faqat macOS)
```

## Tuzilma
- `src/game/logic.ts` — qoidalar, kompyuter AI (oson / o'rta / qiyin)
- `src/game/match.ts` — raund va navbat mashinasi (testlangan)
- `src/screens/` — Home, Setup, Game, History, How, Settings
- `src/components/ui.tsx` — shisha komponentlar: baraban, qulf, natija sharchasi, tugmalar
- `src/styles.css` — liquid-glass dizayn tizimi va 3 mavzu (Okean / Binafsha / Quyosh)
- `src/lib/` — saqlash (localStorage), tovush (WebAudio), titrash
