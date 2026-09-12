package edu.ewubd.toolkit

import android.app.Activity
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.print.PrintAttributes
import android.print.PrintManager
import android.provider.MediaStore
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream

class WebAppInterface(
    private val activity: Activity,
    private val webViewProvider: () -> WebView
) {

    @JavascriptInterface
    fun printPage() {
        activity.runOnUiThread {
            try {
                val printManager = activity.getSystemService(Context.PRINT_SERVICE) as? PrintManager
                if (printManager != null) {
                    val webView = webViewProvider()
                    val printAdapter = webView.createPrintDocumentAdapter("EWU_Advising_Routine")
                    val printAttributes = PrintAttributes.Builder()
                        .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                        .setColorMode(PrintAttributes.COLOR_MODE_COLOR)
                        .build()
                    printManager.print("EWU Advising Slip & Routine", printAdapter, printAttributes)
                } else {
                    Toast.makeText(activity, "Printing not supported on this device", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                e.printStackTrace()
                Toast.makeText(activity, "Print error: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    @JavascriptInterface
    fun saveBase64File(base64Data: String, filename: String, mimeType: String) {
        activity.runOnUiThread {
            Toast.makeText(activity, "Saving $filename...", Toast.LENGTH_SHORT).show()
        }

        Thread {
            try {
                val cleanBase64 = if (base64Data.contains(",")) {
                    base64Data.substringAfter(",")
                } else {
                    base64Data
                }
                val fileBytes = Base64.decode(cleanBase64, Base64.DEFAULT)

                var savedUri: Uri? = null

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    val contentValues = ContentValues().apply {
                        put(MediaStore.MediaColumns.DISPLAY_NAME, filename)
                        put(MediaStore.MediaColumns.MIME_TYPE, mimeType)
                        put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                    }
                    val resolver = activity.contentResolver
                    val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                    if (uri != null) {
                        resolver.openOutputStream(uri)?.use { os ->
                            os.write(fileBytes)
                            os.flush()
                        }
                        savedUri = uri
                    }
                } else {
                    val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                    if (!downloadsDir.exists()) downloadsDir.mkdirs()
                    val targetFile = File(downloadsDir, filename)
                    FileOutputStream(targetFile).use { fos ->
                        fos.write(fileBytes)
                        fos.flush()
                    }
                    savedUri = FileProvider.getUriForFile(
                        activity,
                        "${activity.packageName}.fileprovider",
                        targetFile
                    )
                }

                activity.runOnUiThread {
                    Toast.makeText(
                        activity,
                        "✓ Saved to Downloads: $filename",
                        Toast.LENGTH_LONG
                    ).show()

                    // Trigger Share Sheet so student can directly share routine/excel
                    savedUri?.let { uri ->
                        try {
                            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                type = mimeType
                                putExtra(Intent.EXTRA_STREAM, uri)
                                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                            }
                            activity.startActivity(
                                Intent.createChooser(shareIntent, "Share $filename")
                            )
                        } catch (e: Exception) {
                            // Non-fatal if user cancels chooser
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                activity.runOnUiThread {
                    Toast.makeText(
                        activity,
                        "Failed to save $filename: ${e.localizedMessage}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }.start()
    }
}
