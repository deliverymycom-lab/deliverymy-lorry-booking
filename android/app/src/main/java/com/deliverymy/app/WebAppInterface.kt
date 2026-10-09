package com.deliverymy.app

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.webkit.JavascriptInterface
import android.widget.Toast

/**
 * JavaScript interface exposed to the WebView for native Android capabilities.
 * Accessible in Web JavaScript via: window.Android or window.DeliveryMyNative
 */
class WebAppInterface(private val context: Context, private val activity: MainActivity) {

    @JavascriptInterface
    fun showToast(message: String) {
        activity.runOnUiThread {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
    }

    @JavascriptInterface
    fun vibrate(durationMs: Long) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator?.vibrate(
                    VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE)
                )
            } else {
                @Suppress("DEPRECATION")
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator?.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator?.vibrate(durationMs)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @JavascriptInterface
    fun openWhatsApp(phone: String, text: String) {
        activity.runOnUiThread {
            try {
                // Normalize Malaysian phone number (replace leading 0 with 60)
                var cleanPhone = phone.replace("+", "").replace("-", "").replace(" ", "").trim()
                if (cleanPhone.startsWith("0")) {
                    cleanPhone = "60" + cleanPhone.substring(1)
                }
                val encodedText = Uri.encode(text)
                val url = "https://api.whatsapp.com/send?phone=$cleanPhone&text=$encodedText"
                val intent = Intent(Intent.ACTION_VIEW).apply {
                    data = Uri.parse(url)
                    setPackage("com.whatsapp")
                }
                context.startActivity(intent)
            } catch (e: Exception) {
                // Fallback to browser or regular intent if com.whatsapp package not found
                try {
                    var cleanPhone = phone.replace("+", "").replace("-", "").replace(" ", "").trim()
                    if (cleanPhone.startsWith("0")) {
                        cleanPhone = "60" + cleanPhone.substring(1)
                    }
                    val url = "https://wa.me/$cleanPhone?text=${Uri.encode(text)}"
                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                } catch (ex: Exception) {
                    Toast.makeText(context, "Sila pasang WhatsApp terlebih dahulu.", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    @JavascriptInterface
    fun dialPhone(phone: String) {
        activity.runOnUiThread {
            try {
                val intent = Intent(Intent.ACTION_DIAL).apply {
                    data = Uri.parse("tel:$phone")
                }
                context.startActivity(intent)
            } catch (e: Exception) {
                Toast.makeText(context, "Tidak dapat membuka telefon dialer.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    @JavascriptInterface
    fun openNavigationMap(lat: Double, lng: Double, label: String) {
        activity.runOnUiThread {
            try {
                val uri = Uri.parse("geo:$lat,$lng?q=$lat,$lng(${Uri.encode(label)})")
                val intent = Intent(Intent.ACTION_VIEW, uri)
                context.startActivity(intent)
            } catch (e: Exception) {
                val webMaps = "https://www.google.com/maps/search/?api=1&query=$lat,$lng"
                context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(webMaps)))
            }
        }
    }

    @JavascriptInterface
    fun isAndroidNative(): Boolean {
        return true
    }

    @JavascriptInterface
    fun getAppVersion(): String {
        return "1.0.0"
    }

    @JavascriptInterface
    fun requestLocationUpdate() {
        activity.runOnUiThread {
            activity.requestDeviceLocation()
        }
    }
}
