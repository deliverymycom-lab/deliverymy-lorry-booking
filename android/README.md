# DeliveryMY - Standalone Android Studio App Project

Projek Android Studio rasmi untuk aplikasi **DeliveryMY - Malaysia Lorry Transport Booking Platform (Direct Deal • 0% Komisen)**.

Aplikasi ini dibina khusus untuk telefon pintar Android menggunakan **Kotlin, Android SDK 34 (Android 14/15), Material Design 3, Edge-to-Edge display, Geolocation GPS, serta integrasi terus dengan WhatsApp & Dialer telefon**.

---

## 📱 Ciri-Ciri Projek Android Native

- **Pakej Android**: `com.deliverymy.app`
- **Minimum SDK**: Android 7.0 (API Level 24)
- **Target SDK**: Android 14 / 15 (API Level 34)
- **Bahasa**: Kotlin 1.9.22 + Gradle 8.5
- **Android Manifest**: 
  - Izin GPS tepat (`ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`)
  - Izin WhatsApp inter-app query (`com.whatsapp`, `com.whatsapp.w4b`)
  - Izin dail telefon terus (`ACTION_DIAL`)
  - Izin kamera & fail untuk resit consignment note / gambar lori
- **Kotlin Bridge**: `WebAppInterface` untuk haptic feedback getaran (`vibrate`), Android Native Toast (`showToast`), dan intent WhatsApp tanpa sekatan pelayar web.

---

## 🛠️ Langkah-Langkah Membina APK dalam Android Studio

### Langkah 1: Muat Turun & Ekstrak Kod Sumber
1. Muat turun fail ZIP projek dari aplikasi atau butang muat turun.
2. Ekstrak arkib `.zip` ke folder komputer anda, contohnya:
   ```
   C:\AndroidProjects\DeliveryMY
   ```

### Langkah 2: Buka dalam Android Studio
1. Buka perisian **Android Studio** (Hedgehog, Iguana, Jellyfish, Koala atau lebih terkini).
2. Pilih **File** > **Open...**
3. Arahkan ke direktori folder `android/` yang diekstrak tadi dan tekan **OK**.
4. Biarkan Android Studio selesai menjalankan proses **Gradle Sync** (biasanya 1–2 minit untuk muat turun kebergantungan pertama kali).

### Langkah 3: Bina APK (Build APK)
#### Cara A (Melalui Menu Antara Muka):
1. Klik pada menu atas: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2. Tunggu sehingga notifikasi **"Build APK(s): APK(s) generated successfully"** muncul di bahagian bawah kanan.
3. Klik **locate** untuk mendapatkan fail:
   ```
   app/build/outputs/apk/debug/app-debug.apk
   ```

#### Cara B (Melalui Terminal / Command Prompt):
Jalankan arahan berikut di terminal folder projek:

**Windows:**
```cmd
gradlew.bat assembleDebug
```

**macOS / Linux:**
```bash
chmod +x gradlew
./gradlew assembleDebug
```

Fail APK yang dihasilkan berada di:
`app/build/outputs/apk/debug/app-debug.apk`

---

## 🚀 Membina Signed Release APK untuk Google Play Store

1. Dalam Android Studio, klik **Build** > **Generate Signed Bundle / APK...**
2. Pilih **APK** (untuk pemasangan terus) atau **Android App Bundle (AAB)** (untuk Google Play Store).
3. Cipta atau pilih fail Keystore anda (`my-release-key.jks`).
4. Pilih Build Variant: **release** dan tekan **Finish**.
5. Fail release sedia dimuat naik ke Google Play Console!

---

## 📞 Sokongan & Maklumat Sistem
- **Platform**: DeliveryMY (Malaysia Lorry Booking Platform)
- **Hubungi Pemandu**: Urusan terus pelanggan - pemandu melalui WhatsApp & Telefon (Zero Commission).
- **Muatan Balik (Return Load)**: Jimat kos sehingga 30% - 70% di seluruh Semenanjung Malaysia.
