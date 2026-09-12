# Preserve JavaScript interface bridge methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-keepattributes JavascriptInterface
-keepclassmembers class edu.ewubd.toolkit.WebAppInterface {
    public *;
}
