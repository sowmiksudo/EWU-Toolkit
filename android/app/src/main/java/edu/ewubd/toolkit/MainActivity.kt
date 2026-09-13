package edu.ewubd.toolkit

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.net.http.SslError
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.*
import android.widget.LinearLayout
import android.widget.ProgressBar
import androidx.activity.addCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.google.android.material.button.MaterialButton
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var pageProgressBar: ProgressBar
    private lateinit var layoutOffline: LinearLayout
    private lateinit var btnRetry: MaterialButton
    private var cachedScript: String? = null
    private val dynamicScriptFileName = "dynamic_toolkit.user.js"
    private var isPageLoadingError = false

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        if ((applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            WebView.setWebContentsDebuggingEnabled(true)
        }

        webView = findViewById(R.id.webView)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)
        pageProgressBar = findViewById(R.id.pageProgressBar)
        layoutOffline = findViewById(R.id.layoutOffline)
        btnRetry = findViewById(R.id.btnRetry)

        loadInitialScript()
        fetchDynamicScriptAsync()
        setupWebView()
        setupSwipeRefresh()
        setupOfflineRetry()
        setupBackNavigation()

        if (savedInstanceState == null) {
            loadPortalPage()
        } else {
            webView.restoreState(savedInstanceState)
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    private fun isNetworkAvailable(): Boolean {
        val connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return false
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    private fun loadPortalPage() {
        if (!isNetworkAvailable()) {
            showOfflineState(true)
            return
        }
        showOfflineState(false)
        webView.loadUrl(getString(R.string.portal_url))
    }

    private fun reloadPortal() {
        if (!isNetworkAvailable()) {
            showOfflineState(true)
            return
        }
        showOfflineState(false)
        pageProgressBar.visibility = View.VISIBLE
        fetchDynamicScriptAsync()
        val currentUrl = webView.url
        if (currentUrl.isNullOrBlank() || currentUrl == "about:blank" || currentUrl.startsWith("file://")) {
            webView.loadUrl(getString(R.string.portal_url))
        } else {
            webView.reload()
        }
    }

    private fun showOfflineState(show: Boolean) {
        if (show) {
            layoutOffline.visibility = View.VISIBLE
            webView.visibility = View.GONE
            pageProgressBar.visibility = View.GONE
            swipeRefreshLayout.isRefreshing = false
        } else {
            layoutOffline.visibility = View.GONE
            webView.visibility = View.VISIBLE
        }
    }

    private fun setupOfflineRetry() {
        btnRetry.setOnClickListener {
            reloadPortal()
        }
    }

    private fun loadInitialScript() {
        // 1. Try to load dynamically cached script from internal app storage
        try {
            val dynamicFile = File(filesDir, dynamicScriptFileName)
            if (dynamicFile.exists() && dynamicFile.length() > 500) {
                cachedScript = dynamicFile.readText()
                Log.d("EWU-Toolkit", "Loaded dynamic script from local storage (${cachedScript?.length} chars)")
            }
        } catch (e: Exception) {
            Log.w("EWU-Toolkit", "Failed reading dynamic script from storage", e)
        }

        // 2. Fall back to bundled asset if dynamic script isn't available yet
        if (cachedScript.isNullOrBlank()) {
            try {
                assets.open("ewu-toolkit.user.js").bufferedReader().use {
                    cachedScript = it.readText()
                    Log.d("EWU-Toolkit", "Loaded bundled asset script (${cachedScript?.length} chars)")
                }
            } catch (e: Exception) {
                Log.e("EWU-Toolkit", "Failed loading bundled asset script", e)
            }
        }
    }

    private fun fetchDynamicScriptAsync() {
        thread(isDaemon = true, name = "DynamicScriptFetchThread") {
            try {
                val scriptUrl = getString(R.string.remote_script_url)
                val urlWithCacheBuster = "$scriptUrl?t=${System.currentTimeMillis()}"
                val connection = (URL(urlWithCacheBuster).openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"
                    connectTimeout = 10000
                    readTimeout = 15000
                    setRequestProperty("User-Agent", "EWU-Toolkit-Android/1.3.0")
                    setRequestProperty("Cache-Control", "no-cache")
                    instanceFollowRedirects = true
                }

                val responseCode = connection.responseCode
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    val downloadedScript = connection.inputStream.bufferedReader().use { it.readText() }
                    // Sanity check: must look like a valid userscript
                    if (downloadedScript.isNotBlank() &&
                        downloadedScript.length > 500 &&
                        (downloadedScript.contains("EWU-Toolkit") || downloadedScript.contains("UserScript") || downloadedScript.contains("function"))
                    ) {
                        if (downloadedScript != cachedScript) {
                            Log.i("EWU-Toolkit", "New script detected (${downloadedScript.length} chars). Updating cache...")
                            val dynamicFile = File(filesDir, dynamicScriptFileName)
                            val tmpFile = File(filesDir, "$dynamicScriptFileName.tmp")
                            tmpFile.writeText(downloadedScript)
                            if (tmpFile.renameTo(dynamicFile) || (dynamicFile.delete() && tmpFile.renameTo(dynamicFile))) {
                                cachedScript = downloadedScript
                                Log.i("EWU-Toolkit", "Dynamic script saved and updated successfully.")
                                runOnUiThread {
                                    val currentUrl = webView.url ?: ""
                                    if (currentUrl.contains("portal.ewubd.edu") || currentUrl.contains("ewubd.edu")) {
                                        injectToolkitScript(webView)
                                    }
                                }
                            }
                        } else {
                            Log.d("EWU-Toolkit", "Local script is already up-to-date with GitHub raw.")
                        }
                    } else {
                        Log.w("EWU-Toolkit", "Downloaded script failed sanity validation; keeping existing script.")
                    }
                } else {
                    Log.w("EWU-Toolkit", "Failed to fetch remote script, HTTP status: $responseCode")
                }
                connection.disconnect()
            } catch (e: Exception) {
                Log.w("EWU-Toolkit", "Could not fetch dynamic script from GitHub: ${e.message}")
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        // Hardware acceleration layer and safe background to eliminate Android 13 blank paint glitches
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        webView.setBackgroundColor(ContextCompat.getColor(this, R.color.background))

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            textZoom = 100
            layoutAlgorithm = WebSettings.LayoutAlgorithm.NORMAL
            allowFileAccess = true
            allowContentAccess = true
        }
        webView.overScrollMode = View.OVER_SCROLL_IF_CONTENT_SCROLLS

        CookieManager.getInstance().apply {
            setAcceptCookie(true)
            setAcceptThirdPartyCookies(webView, true)
        }

        webView.addJavascriptInterface(WebAppInterface(this) { webView }, "AndroidBridge")

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100 && !isPageLoadingError) {
                    pageProgressBar.visibility = View.VISIBLE
                    pageProgressBar.progress = newProgress
                } else {
                    pageProgressBar.visibility = View.GONE
                }
            }
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                isPageLoadingError = false
                pageProgressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                swipeRefreshLayout.isRefreshing = false
                pageProgressBar.visibility = View.GONE

                if (!isPageLoadingError) {
                    showOfflineState(false)
                    injectViewportMeta(view)

                    if (url != null && (url.contains("portal.ewubd.edu") || url.contains("ewubd.edu"))) {
                        injectToolkitScript(view)
                    }
                }
            }

            @SuppressLint("WebViewClientOnReceivedSslError")
            override fun onReceivedSslError(view: WebView?, handler: SslErrorHandler?, error: SslError?) {
                val errorUrl = error?.url ?: ""
                Log.w("EWU-Toolkit", "SSL Error [${error?.primaryError}] for URL: $errorUrl")
                // Stricter TLS path checks on Android 13 fail Sectigo intermediate certificates on portal.ewubd.edu
                if (errorUrl.contains("ewubd.edu")) {
                    handler?.proceed()
                } else {
                    handler?.cancel()
                }
            }

            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    Log.e("EWU-Toolkit", "Main frame load failed: ${error?.description} (${error?.errorCode})")
                    isPageLoadingError = true
                    showOfflineState(true)
                }
            }

            override fun onReceivedHttpError(view: WebView?, request: WebResourceRequest?, errorResponse: WebResourceResponse?) {
                super.onReceivedHttpError(view, request, errorResponse)
                if (request?.isForMainFrame == true && (errorResponse?.statusCode ?: 200) >= 500) {
                    Log.e("EWU-Toolkit", "HTTP Server Error: ${errorResponse?.statusCode}")
                    isPageLoadingError = true
                    showOfflineState(true)
                }
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val uri = request?.url ?: return false
                val scheme = uri.scheme?.lowercase() ?: ""
                val host = uri.host?.lowercase() ?: ""

                if (scheme == "mailto:") {
                    try {
                        startActivity(Intent(Intent.ACTION_SENDTO, uri))
                    } catch (_: Exception) {}
                    return true
                }

                if (scheme == "tel:") {
                    try {
                        startActivity(Intent(Intent.ACTION_DIAL, uri))
                    } catch (_: Exception) {}
                    return true
                }

                // Allow internal schemes, empty hosts, and portal domains without intercepting
                if (scheme == "about" || scheme == "data" || scheme == "javascript" || host.contains("ewubd.edu") || host.isEmpty()) {
                    return false
                }

                // Only launch external intent if user clicked on a link targeting the main frame
                if (request.isForMainFrame) {
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, uri))
                    } catch (_: Exception) {}
                    return true
                }

                return false
            }
        }
    }

    private fun injectViewportMeta(view: WebView?) {
        val viewportJs = """
            (function() {
                try {
                    var meta = document.querySelector('meta[name="viewport"]');
                    if (!meta && document.head) {
                        meta = document.createElement('meta');
                        meta.name = 'viewport';
                        document.head.appendChild(meta);
                    }
                    if (meta) {
                        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
                    }
                } catch (e) {
                    console.error('Viewport meta injection error', e);
                }
            })();
        """.trimIndent()
        view?.evaluateJavascript(viewportJs, null)
    }

    private fun injectToolkitScript(view: WebView?) {
        val script = cachedScript ?: return
        val printOverride = """
            (function() {
                if (window.AndroidBridge && typeof window.AndroidBridge.printPage === 'function') {
                    window.print = function() { window.AndroidBridge.printPage(); };
                }
            })();
        """.trimIndent()

        view?.evaluateJavascript(printOverride, null)
        view?.evaluateJavascript(script, null)
    }

    private fun setupSwipeRefresh() {
        swipeRefreshLayout.setColorSchemeResources(
            R.color.accent,
            R.color.primary
        )
        swipeRefreshLayout.setOnRefreshListener {
            reloadPortal()
        }
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this) {
            if (layoutOffline.visibility == View.VISIBLE && webView.canGoBack()) {
                showOfflineState(false)
                webView.goBack()
            } else if (webView.canGoBack()) {
                webView.goBack()
            } else {
                finish()
            }
        }
    }
}
