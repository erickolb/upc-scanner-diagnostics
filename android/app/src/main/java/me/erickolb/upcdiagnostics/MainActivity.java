package me.erickolb.upcdiagnostics;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import android.widget.FrameLayout;
import java.io.ByteArrayInputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Collections;

/** Offline WebView host: scanner input is delivered through the normal WebView path. */
public class MainActivity extends Activity {
    private static final String ORIGIN = "https://diagnostics.invalid/";
    private static final int SAVE_REPORT = 1;
    private WebView web;
    private String pendingReport;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(16, 24, 36));
        FrameLayout container = new FrameLayout(this);
        container.setBackgroundColor(Color.rgb(16, 24, 36));
        container.addView(web, new FrameLayout.LayoutParams(-1, -1));
        container.setOnApplyWindowInsetsListener((view, insets) -> {
            view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                    insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets.consumeSystemWindowInsets();
        });
        setContentView(container);
        container.requestApplyInsets();
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);
        web.getSettings().setDomStorageEnabled(false);
        web.addJavascriptInterface(new ReportExporter(), "AndroidDiagnostics");
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return true; // The toolkit has no navigation outside its bundled page.
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                String name = url.startsWith(ORIGIN) ? url.substring(ORIGIN.length()) : "";
                if (name.isEmpty() && url.equals(ORIGIN)) name = "index.html";
                if (Arrays.asList("index.html", "app.mjs", "parser.mjs").contains(name)) {
                    try {
                        Map<String,String> headers = new HashMap<>();
                        headers.put("Cache-Control", "no-store");
                        headers.put("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'none'; object-src 'none'; frame-src 'none'");
                        return new WebResourceResponse(name.endsWith("html") ? "text/html" : "text/javascript",
                                "UTF-8", 200, "OK", headers,
                                getAssets().open(name));
                    } catch (Exception ignored) { }
                }
                return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
            }
        });
        web.loadUrl(ORIGIN);
    }

    private final class ReportExporter {
        @JavascriptInterface public void saveReport(String json) {
            if (json == null || json.length() > 2_000_000) return;
            runOnUiThread(() -> {
                if (pendingReport != null) return;
                pendingReport = json;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                intent.putExtra(Intent.EXTRA_TITLE, "scanner-diagnostics.json");
                try { startActivityForResult(intent, SAVE_REPORT); }
                catch (Exception error) { pendingReport = null; Toast.makeText(MainActivity.this, "No document saver available", Toast.LENGTH_LONG).show(); }
            });
        }
    }

    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request != SAVE_REPORT) return;
        String report = pendingReport;
        pendingReport = null;
        if (result != RESULT_OK || data == null || data.getData() == null || report == null) return;
        try (OutputStream stream = getContentResolver().openOutputStream(data.getData(), "wt")) {
            if (stream == null) throw new IllegalStateException("No output stream");
            stream.write(report.getBytes(StandardCharsets.UTF_8));
            Toast.makeText(this, "Report saved", Toast.LENGTH_SHORT).show();
        } catch (Exception error) { Toast.makeText(this, "Could not save report", Toast.LENGTH_LONG).show(); }
    }
    @Override protected void onDestroy() { web.removeJavascriptInterface("AndroidDiagnostics"); web.destroy(); super.onDestroy(); }
}
