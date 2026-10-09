# Add project specific ProGuard rules here.
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.deliverymy.app.WebAppInterface { *; }
-dontwarn android.webkit.**
