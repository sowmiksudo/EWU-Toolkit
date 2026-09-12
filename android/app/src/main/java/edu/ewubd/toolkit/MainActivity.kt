package edu.ewubd.toolkit

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.webkit.*
import android.widget.ProgressBar
import androidx.activity.addCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var pageProgressBar: ProgressBar
    private var cachedScript: String? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)
        pageProgressBar = findViewById(R.id.pageProgressBar)

        preloadScript()
        setupWebView()
        setupSwipeRefresh()
        setupBackNavigation()

        if (savedInstanceState == null) {
            webView.loadUrl(getString(R.string.portal_url))
        } else {
            webView.restoreState(savedInstanceState)
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    private fun preloadScript() {
        try {
            assets.open("ewu-toolkit.user.js").bufferedReader().use {
                cachedScript = it.readText()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
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
            mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
            textZoom = 100
            layoutAlgorithm = WebSettings.LayoutAlgorithm.NORMAL
        }
        webView.overScrollMode = View.OVER_SCROLL_IF_CONTENT_SCROLLS

        CookieManager.getInstance().apply {
            setAcceptCookie(true)
            setAcceptThirdPartyCookies(webView, true)
        }

        webView.addJavascriptInterface(WebAppInterface(this) { webView }, "AndroidBridge")

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
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
                pageProgressBar.visibility = View.VISIBLE
                injectViewportMeta(view)
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                swipeRefreshLayout.isRefreshing = false
                pageProgressBar.visibility = View.GONE
                injectViewportMeta(view)

                if (url != null && (url.contains("portal.ewubd.edu") || url.contains("ewubd.edu"))) {
                    injectToolkitScript(view)
                }
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val uri = request?.url ?: return false
                val urlStr = uri.toString()

                if (urlStr.startsWith("mailto:")) {
                    try {
                        val intent = Intent(Intent.ACTION_SENDTO, uri)
                        startActivity(intent)
                    } catch (e: Exception) {
                        // Ignore if no email client is available
                    }
                    return true
                }

                val host = uri.host?.lowercase() ?: ""
                if (!host.contains("ewubd.edu")) {
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, uri)
                        startActivity(intent)
                    } catch (e: Exception) {
                        // Ignore if no browser is available
                    }
                    return true
                }

                return false
            }
        }
    }

    private fun injectViewportMeta(view: WebView?) {
        val viewportJs = """
            (function() {
                var meta = document.querySelector('meta[name="viewport"]');
                if (!meta) {
                    meta = document.createElement('meta');
                    meta.name = 'viewport';
                    document.head.appendChild(meta);
                }
                meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
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
            webView.reload()
        }
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this) {
            if (webView.canGoBack()) {
                webView.goBack()
            } else {
                finish()
            }
        }
    }
}
