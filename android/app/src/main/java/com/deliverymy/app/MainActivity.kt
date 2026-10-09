package com.deliverymy.app

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
    private val defaultUrl = "https://deliverymy.com" // Live Cloud URL or local asset

    // Activity Result Launcher for Camera & Gallery File Chooser
    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (filePathCallback == null) return@registerForActivityResult
        val results: Array<Uri>? = when {
            result.resultCode == RESULT_OK && result.data != null -> {
                val clipData = result.data?.clipData
                val dataString = result.data?.dataString
                when {
                    clipData != null -> {
                        Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
                    }
                    dataString != null -> arrayOf(Uri.parse(dataString))
                    else -> null
                }
            }
            else -> null
        }
        filePathCallback?.onReceiveValue(results)
        filePathCallback = null
    }

    // Permission launcher for Location (GPS)
    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineLocationGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        val coarseLocationGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] ?: false

        if (fineLocationGranted || coarseLocationGranted) {
            geolocationCallback?.invoke(geolocationOrigin, true, false)
            // Trigger web app location refresh if interface available
            webView.evaluateJavascript("window.dispatchEvent(new CustomEvent('androidGpsGranted'));", null)
        } else {
            geolocationCallback?.invoke(geolocationOrigin, false, false)
            Toast.makeText(this, "Izin lokasi diperlukan untuk mencari pemandu terdekat.", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        setupWebView()
        setupBackNavigation()

        // Load entry point
        loadTargetUrl()
    }

    private fun initViews() {
        webView = findViewById(R.id.webView)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)
        progressBar = findViewById(R.id.progressBar)
        offlineContainer = findViewById(R.id.offlineContainer)
        btnRetry = findViewById(R.id.btnRetry)

        swipeRefreshLayout.setColorSchemeResources(R.color.primary, R.color.secondary)
        swipeRefreshLayout.setOnRefreshListener {
            webView.reload()
        }

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
        settings.setSupportZoom(false)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.mediaPlaybackRequiresUserGesture = false

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        // Custom User Agent to identify DeliveryMY Android Native App
        val defaultUa = settings.userAgentString
        settings.userAgentString = "$defaultUa DeliveryMYAndroid/1.0.0"

        // Native JavaScript Bridges
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

            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                geolocationOrigin = origin
                geolocationCallback = callback
                checkAndRequestLocationPermissions()
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback

                val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "image/*"
                }
                try {
                    fileChooserLauncher.launch(intent)
                } catch (e: ActivityNotFoundException) {
                    this@MainActivity.filePathCallback = null
                    Toast.makeText(this@MainActivity, "Tiada aplikasi pemilih fail ditemui.", Toast.LENGTH_SHORT).show()
                    return false
                }
                return true
            }
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                offlineContainer.visibility = View.GONE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                swipeRefreshLayout.isRefreshing = false
                // Inject native Android detection flag into web window
                webView.evaluateJavascript("window.isAndroidNativeApp = true;", null)
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    // Try fallback to local bundled assets if network fails
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

                // 1. WhatsApp Intent Interception
                if (url.startsWith("whatsapp://") || url.startsWith("https://wa.me/") || url.startsWith("https://api.whatsapp.com/send")) {
                    return handleExternalIntent(url, "com.whatsapp")
                }

                // 2. Telephone Call Interception
                if (url.startsWith("tel:")) {
                    val intent = Intent(Intent.ACTION_DIAL, Uri.parse(url))
                    startActivity(intent)
                    return true
                }

                // 3. Google Maps / Navigation Interception
                if (url.startsWith("geo:") || url.contains("maps.google.com")) {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    try {
                        startActivity(intent)
                    } catch (e: Exception) {
                        return false
                    }
                    return true
                }

                return false
            }
        }
    }

    private fun handleExternalIntent(url: String, targetPackage: String? = null): Boolean {
        return try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            if (targetPackage != null) {
                intent.setPackage(targetPackage)
            }
            startActivity(intent)
            true
        } catch (e: Exception) {
            try {
                // Retry without package constraint
                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                true
            } catch (ex: Exception) {
                Toast.makeText(this, "Aplikasi yang diperlukan tidak ditemui.", Toast.LENGTH_SHORT).show()
                false
            }
        }
    }

    private fun checkAndRequestLocationPermissions() {
        val fineLocation = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
        val coarseLocation = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION)

        if (fineLocation == PackageManager.PERMISSION_GRANTED || coarseLocation == PackageManager.PERMISSION_GRANTED) {
            geolocationCallback?.invoke(geolocationOrigin, true, false)
        } else {
            locationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    fun requestDeviceLocation() {
        checkAndRequestLocationPermissions()
    }

    private fun loadTargetUrl() {
        // Priority 1: Cloud hosted URL, Priority 2: Local bundled asset
        webView.loadUrl(defaultUrl)
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    if (backPressedTime + 2000 > System.currentTimeMillis()) {
                        finish()
                    } else {
                        Toast.makeText(
                            this@MainActivity,
                            getString(R.string.press_again_to_exit),
                            Toast.LENGTH_SHORT
                        ).show()
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
