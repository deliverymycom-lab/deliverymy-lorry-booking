import JSZip from 'jszip';

export interface AndroidFileDefinition {
  path: string;
  filename: string;
  category: 'manifest' | 'kotlin' | 'gradle' | 'res' | 'doc';
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: Record<string, AndroidFileDefinition> = {
  'MainActivity.kt': {
    path: 'app/src/main/java/com/deliverymy/app/MainActivity.kt',
    filename: 'MainActivity.kt',
    category: 'kotlin',
    description: 'Aktiviti utama Android dengan WebView, Edge-to-Edge, Geolocation GPS & WhatsApp Intent interceptor.',
    content: `package com.deliverymy.app

import android.Manifest
import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.*
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar
    private lateinit var offlineContainer: LinearLayout
    private lateinit var btnRetry: Button

    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var geolocationOrigin: String? = null
    private var geolocationCallback: GeolocationPermissions.Callback? = null

    private var backPressedTime: Long = 0
    private val defaultUrl = "https://deliverymy.com"

    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (filePathCallback == null) return@registerForActivityResult
        val results: Array<Uri>? = when {
            result.resultCode == RESULT_OK && result.data != null -> {
                val clipData = result.data?.clipData
                val dataString = result.data?.dataString
                when {
                    clipData != null -> Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
                    dataString != null -> arrayOf(Uri.parse(dataString))
                    else -> null
                }
            }
            else -> null
        }
        filePathCallback?.onReceiveValue(results)
        filePathCallback = null
    }

    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineLocationGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        val coarseLocationGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] ?: false

        if (fineLocationGranted || coarseLocationGranted) {
            geolocationCallback?.invoke(geolocationOrigin, true, false)
            webView.evaluateJavascript("window.dispatchEvent(new CustomEvent('androidGpsGranted'));", null)
        } else {
            geolocationCallback?.invoke(geolocationOrigin, false, false)
            Toast.makeText(this, "Izin lokasi diperlukan untuk mencari lori berdekatan.", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        setupWebView()
        setupBackNavigation()
        loadTargetUrl()
    }

    private fun initViews() {
        webView = findViewById(R.id.webView)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)
        progressBar = findViewById(R.id.progressBar)
        offlineContainer = findViewById(R.id.offlineContainer)
        btnRetry = findViewById(R.id.btnRetry)

        swipeRefreshLayout.setColorSchemeResources(R.color.primary, R.color.secondary)
        swipeRefreshLayout.setOnRefreshListener { webView.reload() }

        btnRetry.setOnClickListener {
            offlineContainer.visibility = View.GONE
            webView.visibility = View.VISIBLE
            loadTargetUrl()
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.setGeolocationEnabled(true)
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.mediaPlaybackRequiresUserGesture = false

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        val defaultUa = settings.userAgentString
        settings.userAgentString = "$defaultUa DeliveryMYAndroid/1.0.0"

        val nativeInterface = WebAppInterface(this, this)
        webView.addJavascriptInterface(nativeInterface, "Android")
        webView.addJavascriptInterface(nativeInterface, "DeliveryMyNative")

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
                    progressBar.visibility = View.VISIBLE
                    progressBar.progress = newProgress
                } else {
                    progressBar.visibility = View.GONE
                    swipeRefreshLayout.isRefreshing = false
                }
            }

            override fun onGeolocationPermissionsShowPrompt(origin: String?, callback: GeolocationPermissions.Callback?) {
                geolocationOrigin = origin
                geolocationCallback = callback
                checkAndRequestLocationPermissions()
            }

            override fun onShowFileChooser(webView: WebView?, callback: ValueCallback<Array<Uri>>?, params: FileChooserParams?): Boolean {
                filePathCallback?.onReceiveValue(null)
                filePathCallback = callback
                val intent = params?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply { type = "image/*" }
                try {
                    fileChooserLauncher.launch(intent)
                } catch (e: ActivityNotFoundException) {
                    filePathCallback = null
                    return false
                }
                return true
            }
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                swipeRefreshLayout.isRefreshing = false
                webView.evaluateJavascript("window.isAndroidNativeApp = true;", null)
            }

            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    if (!view?.url.orEmpty().startsWith("file:///android_asset/")) {
                        view?.loadUrl("file:///android_asset/www/index.html")
                    } else {
                        webView.visibility = View.GONE
                        offlineContainer.visibility = View.VISIBLE
                    }
                }
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                if (url.startsWith("whatsapp://") || url.startsWith("https://wa.me/") || url.startsWith("https://api.whatsapp.com/send")) {
                    return handleExternalIntent(url, "com.whatsapp")
                }
                if (url.startsWith("tel:")) {
                    startActivity(Intent(Intent.ACTION_DIAL, Uri.parse(url)))
                    return true
                }
                if (url.startsWith("geo:") || url.contains("maps.google.com")) {
                    try { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))); return true } catch (e: Exception) { return false }
                }
                return false
            }
        }
    }

    private fun handleExternalIntent(url: String, targetPackage: String? = null): Boolean {
        return try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                if (targetPackage != null) setPackage(targetPackage)
            }
            startActivity(intent)
            true
        } catch (e: Exception) {
            try {
                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                true
            } catch (ex: Exception) {
                Toast.makeText(this, "Aplikasi tidak dijumpai.", Toast.LENGTH_SHORT).show()
                false
            }
        }
    }

    private fun checkAndRequestLocationPermissions() {
        val fineLocation = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
        if (fineLocation == PackageManager.PERMISSION_GRANTED) {
            geolocationCallback?.invoke(geolocationOrigin, true, false)
        } else {
            locationPermissionLauncher.launch(
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
            )
        }
    }

    fun requestDeviceLocation() { checkAndRequestLocationPermissions() }

    private fun loadTargetUrl() { webView.loadUrl(defaultUrl) }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    if (backPressedTime + 2000 > System.currentTimeMillis()) {
                        finish()
                    } else {
                        Toast.makeText(this@MainActivity, getString(R.string.press_again_to_exit), Toast.LENGTH_SHORT).show()
                        backPressedTime = System.currentTimeMillis()
                    }
                }
            }
        })
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
`,
  },

  'AndroidManifest.xml': {
    path: 'app/src/main/AndroidManifest.xml',
    filename: 'AndroidManifest.xml',
    category: 'manifest',
    description: 'Kebenaran Android (GPS, WhatsApp, Dail Telefon, Kamera) dan tetapan Aktiviti.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

    <queries>
        <package android:name="com.whatsapp" />
        <package android:name="com.whatsapp.w4b" />
        <package android:name="com.google.android.apps.maps" />
        <package android:name="com.waze" />
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="whatsapp" />
        </intent>
        <intent>
            <action android:name="android.intent.action.DIAL" />
            <data android:scheme="tel" />
        </intent>
    </queries>

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.DeliveryMY"
        android:usesCleartextTraffic="true"
        android:networkSecurityConfig="@xml/network_security_config"
        android:hardwareAccelerated="true"
        tools:targetApi="34">

        <activity
            android:name=".SplashActivity"
            android:exported="true"
            android:theme="@style/Theme.DeliveryMY.Splash"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait"
            android:windowSoftInputMode="adjustResize"
            android:configChanges="orientation|screenSize|keyboardHidden|screenLayout|smallestScreenSize">
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="deliverymy" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
  },

  'app/build.gradle': {
    path: 'app/build.gradle',
    filename: 'build.gradle (app)',
    category: 'gradle',
    description: 'Skrip binaan modul aplikasi dengan compileSdk 34 dan dependencies AndroidX.',
    content: `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'com.deliverymy.app'
    compileSdk 34

    defaultConfig {
        applicationId "com.deliverymy.app"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.debug
        }
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = '1.8'
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.webkit:webkit:1.10.0'
    implementation 'androidx.swiperefreshlayout:swiperefreshlayout:1.1.0'
    implementation 'androidx.activity:activity-ktx:1.8.2'
    implementation 'com.google.android.gms:play-services-location:21.1.0'
}`,
  },

  'WebAppInterface.kt': {
    path: 'app/src/main/java/com/deliverymy/app/WebAppInterface.kt',
    filename: 'WebAppInterface.kt',
    category: 'kotlin',
    description: 'Jambatan JavaScript ke Android Native untuk getaran, toast, dan WhatsApp.',
    content: `package com.deliverymy.app

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.webkit.JavascriptInterface
import android.widget.Toast

class WebAppInterface(private val context: Context, private val activity: MainActivity) {

    @JavascriptInterface
    fun showToast(message: String) {
        activity.runOnUiThread { Toast.makeText(context, message, Toast.LENGTH_SHORT).show() }
    }

    @JavascriptInterface
    fun vibrate(durationMs: Long) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vm = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vm?.defaultVibrator?.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                val v = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                v?.vibrate(durationMs)
            }
        } catch (e: Exception) {}
    }

    @JavascriptInterface
    fun openWhatsApp(phone: String, text: String) {
        activity.runOnUiThread {
            try {
                var clean = phone.replace("+", "").replace("-", "").replace(" ", "").trim()
                if (clean.startsWith("0")) clean = "60" + clean.substring(1)
                val uri = Uri.parse("https://api.whatsapp.com/send?phone=$clean&text=\${Uri.encode(text)}")
                context.startActivity(Intent(Intent.ACTION_VIEW, uri).apply { setPackage("com.whatsapp") })
            } catch (e: Exception) {
                var clean = phone.replace("+", "").replace("-", "").replace(" ", "").trim()
                if (clean.startsWith("0")) clean = "60" + clean.substring(1)
                context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/$clean?text=\${Uri.encode(text)}")))
            }
        }
    }

    @JavascriptInterface
    fun dialPhone(phone: String) {
        activity.runOnUiThread {
            try { context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phone"))) } catch (e: Exception) {}
        }
    }

    @JavascriptInterface
    fun isAndroidNative(): Boolean = true

    @JavascriptInterface
    fun getAppVersion(): String = "1.0.0"
}`,
  },

  'build.gradle (root)': {
    path: 'build.gradle',
    filename: 'build.gradle (root)',
    category: 'gradle',
    description: 'Skrip tahap atas projek untuk Gradle Android Plugin & Kotlin Plugin.',
    content: `buildscript {
    ext {
        kotlin_version = '1.9.22'
        agp_version = '8.2.2'
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath "com.android.tools.build:gradle:$agp_version"
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}`,
  },

  'settings.gradle': {
    path: 'settings.gradle',
    filename: 'settings.gradle',
    category: 'gradle',
    description: 'Konfigurasi repositori dan modul :app.',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "DeliveryMY"
include ':app'`,
  },

  'strings.xml': {
    path: 'app/src/main/res/values/strings.xml',
    filename: 'strings.xml',
    category: 'res',
    description: 'Teks dan sumber rentetan aplikasi DeliveryMY.',
    content: `<resources>
    <string name="app_name">DeliveryMY</string>
    <string name="app_tagline">Malaysia Lorry Transport Booking - Direct Deal</string>
    <string name="press_again_to_exit">Tekan sekali lagi untuk keluar dari DeliveryMY</string>
    <string name="location_permission_rationale">DeliveryMY memerlukan izin lokasi GPS untuk mengira jarak KM lori yang tepat.</string>
</resources>`,
  },

  'README.md': {
    path: 'README.md',
    filename: 'README.md',
    category: 'doc',
    description: 'Panduan lengkap langkah demi langkah membina APK dalam Android Studio.',
    content: `# DeliveryMY - Standalone Android Studio App Project

## Cara Membina APK:
1. Muat turun fail ZIP ini dan ekstrak.
2. Buka Android Studio > File > Open > Pilih folder projek ini.
3. Tunggu Gradle Sync selesai.
4. Klik Build > Build Bundle(s) / APK(s) > Build APK(s).
5. Pasang fail 'app-debug.apk' ke mana-mana telefon Android!`,
  },
};

/**
 * Trigger ZIP download of the entire Android Studio project.
 * Uses API endpoint if accessible, or creates client-side ZIP with JSZip instantly.
 */
export async function downloadAndroidStudioProjectZip(
  onProgress?: (progressText: string) => void
): Promise<void> {
  onProgress?.('Menyediakan struktur projek Android Studio...');

  try {
    // Attempt 1: Try backend route first
    const response = await fetch('/api/v1/download-android-project', { method: 'GET' });
    if (response.ok) {
      onProgress?.('Memuat turun pakej ZIP...');
      const blob = await response.blob();
      triggerBlobDownload(blob, 'DeliveryMY-Android-Studio-Project.zip');
      return;
    }
  } catch (err) {
    console.warn('Backend download endpoint not reachable, generating client-side ZIP fallback...', err);
  }

  // Attempt 2: Generate complete Android Studio project structure in-memory via JSZip
  onProgress?.('Membungkus fail Kotlin, Gradle & Manifest...');
  const zip = new JSZip();

  // Root files
  zip.file('build.gradle', ANDROID_PROJECT_FILES['build.gradle (root)'].content);
  zip.file('settings.gradle', ANDROID_PROJECT_FILES['settings.gradle'].content);
  zip.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8\nandroid.useAndroidX=true\nandroid.enableJetifier=true\nkotlin.code.style=official\n`
  );
  zip.file('README.md', ANDROID_PROJECT_FILES['README.md'].content);

  // Gradle wrapper
  zip.file(
    'gradle/wrapper/gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME\ndistributionPath=wrapper/dists\ndistributionUrl=https\\://services.gradle.org/distributions/gradle-8.5-bin.zip\nnetworkTimeout=10000\nvalidateDistributionUrl=true\nzipStoreBase=GRADLE_USER_HOME\nzipStorePath=wrapper/dists\n`
  );

  // App module
  zip.file('app/build.gradle', ANDROID_PROJECT_FILES['app/build.gradle'].content);
  zip.file('app/proguard-rules.pro', `-keepattributes JavascriptInterface\n-keep class com.deliverymy.app.WebAppInterface { *; }\n`);
  zip.file('app/src/main/AndroidManifest.xml', ANDROID_PROJECT_FILES['AndroidManifest.xml'].content);

  // Kotlin files
  zip.file('app/src/main/java/com/deliverymy/app/MainActivity.kt', ANDROID_PROJECT_FILES['MainActivity.kt'].content);
  zip.file('app/src/main/java/com/deliverymy/app/WebAppInterface.kt', ANDROID_PROJECT_FILES['WebAppInterface.kt'].content);
  zip.file(
    'app/src/main/java/com/deliverymy/app/SplashActivity.kt',
    `package com.deliverymy.app\nimport android.content.Intent\nimport android.os.Bundle\nimport android.os.Handler\nimport android.os.Looper\nimport androidx.appcompat.app.AppCompatActivity\nclass SplashActivity : AppCompatActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContentView(R.layout.activity_splash)\n        Handler(Looper.getMainLooper()).postDelayed({ startActivity(Intent(this, MainActivity::class.java)); finish() }, 1000)\n    }\n}\n`
  );

  // Resources
  zip.file('app/src/main/res/values/strings.xml', ANDROID_PROJECT_FILES['strings.xml'].content);
  zip.file(
    'app/src/main/res/values/colors.xml',
    `<resources>\n    <color name="primary">#FF6B00</color>\n    <color name="primary_dark">#E65100</color>\n    <color name="secondary">#0D47A1</color>\n    <color name="background">#F8F9FE</color>\n    <color name="surface">#FFFFFF</color>\n</resources>`
  );
  zip.file(
    'app/src/main/res/values/themes.xml',
    `<resources>\n    <style name="Theme.DeliveryMY" parent="Theme.Material3.DayNight.NoActionBar">\n        <item name="colorPrimary">@color/primary</item>\n        <item name="android:statusBarColor">@color/primary</item>\n    </style>\n    <style name="Theme.DeliveryMY.Splash" parent="Theme.Material3.DayNight.NoActionBar">\n        <item name="android:statusBarColor">@color/primary</item>\n    </style>\n</resources>`
  );
  zip.file(
    'app/src/main/res/xml/network_security_config.xml',
    `<network-security-config>\n    <base-config cleartextTrafficPermitted="true"/>\n</network-security-config>`
  );
  zip.file(
    'app/src/main/res/layout/activity_main.xml',
    `<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android" xmlns:app="http://schemas.android.com/apk/res-auto" android:layout_width="match_parent" android:layout_height="match_parent">\n    <androidx.swiperefreshlayout.widget.SwipeRefreshLayout android:id="@+id/swipeRefreshLayout" android:layout_width="match_parent" android:layout_height="match_parent">\n        <WebView android:id="@+id/webView" android:layout_width="match_parent" android:layout_height="match_parent"/>\n    </androidx.swiperefreshlayout.widget.SwipeRefreshLayout>\n    <ProgressBar android:id="@+id/progressBar" style="?android:attr/progressBarStyleHorizontal" android:layout_width="match_parent" android:layout_height="4dp" android:visibility="gone" app:layout_constraintTop_toTopOf="parent"/>\n    <LinearLayout android:id="@+id/offlineContainer" android:layout_width="wrap_content" android:layout_height="wrap_content" android:orientation="vertical" android:gravity="center" android:visibility="gone" app:layout_constraintTop_toTopOf="parent" app:layout_constraintBottom_toBottomOf="parent" app:layout_constraintStart_toStartOf="parent" app:layout_constraintEnd_toEndOf="parent">\n        <Button android:id="@+id/btnRetry" android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="Retry"/>\n    </LinearLayout>\n</androidx.constraintlayout.widget.ConstraintLayout>`
  );
  zip.file(
    'app/src/main/res/layout/activity_splash.xml',
    `<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android" android:layout_width="match_parent" android:layout_height="match_parent" android:background="#FF6B00" android:gravity="center" android:orientation="vertical">\n    <TextView android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="DeliveryMY" android:textColor="#FFFFFF" android:textSize="28sp" android:textStyle="bold"/>\n</LinearLayout>`
  );

  // Asset offline html
  zip.file(
    'app/src/main/assets/www/index.html',
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>DeliveryMY</title></head><body><h1>DeliveryMY Android App</h1><p>Online connect mode active.</p></body></html>`
  );

  onProgress?.('Menjana arkib ZIP...');
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  triggerBlobDownload(blob, 'DeliveryMY-Android-Studio-Project.zip');
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Android Device native bridge helper functions
 */
export const AndroidBridge = {
  isNative(): boolean {
    return typeof (window as any).Android !== 'undefined' || (window as any).isAndroidNativeApp === true;
  },

  toast(message: string): void {
    if ((window as any).Android?.showToast) {
      (window as any).Android.showToast(message);
    } else {
      // Custom Web fallback event
      window.dispatchEvent(new CustomEvent('androidToast', { detail: { message } }));
    }
  },

  vibrate(durationMs = 50): void {
    if ((window as any).Android?.vibrate) {
      (window as any).Android.vibrate(durationMs);
    } else if (navigator.vibrate) {
      navigator.vibrate(durationMs);
    }
  },

  openWhatsApp(phone: string, text: string): void {
    if ((window as any).Android?.openWhatsApp) {
      (window as any).Android.openWhatsApp(phone, text);
    } else {
      let clean = phone.replace('+', '').replace('-', '').replace(/\s+/g, '').trim();
      if (clean.startsWith('0')) clean = '60' + clean.substring(1);
      window.open(`https://wa.me/${clean}?text=${encodeURIComponent(text)}`, '_blank');
    }
  },

  dialPhone(phone: string): void {
    if ((window as any).Android?.dialPhone) {
      (window as any).Android.dialPhone(phone);
    } else {
      window.location.href = `tel:${phone}`;
    }
  },
};
