import UIKit
import WebKit

final class LocalAssets: NSObject, WKURLSchemeHandler {
    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let url = urlSchemeTask.request.url, url.scheme == "diagnostics", url.host == "local",
              ["/index.html", "/bundle.js"].contains(url.path),
              let file = Bundle.main.url(forResource: String(url.path.dropFirst()), withExtension: nil, subdirectory: "Web"),
              let data = try? Data(contentsOf: file) else {
            urlSchemeTask.didFailWithError(NSError(domain: "LocalAssets", code: 404)); return
        }
        let response = URLResponse(url: url, mimeType: url.path.hasSuffix("html") ? "text/html" : "text/javascript", expectedContentLength: data.count, textEncodingName: "UTF-8")
        urlSchemeTask.didReceive(response)
        urlSchemeTask.didReceive(data)
        urlSchemeTask.didFinish()
    }
    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}
}

final class DiagnosticsController: UIViewController, WKScriptMessageHandler, WKNavigationDelegate {
    private var web: WKWebView!
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 16/255, green: 24/255, blue: 36/255, alpha: 1)
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .nonPersistent()
        config.setURLSchemeHandler(LocalAssets(), forURLScheme: "diagnostics")
        config.userContentController.add(self, name: "saveReport")
        web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = self
        web.isOpaque = false
        web.backgroundColor = view.backgroundColor
        web.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(web)
        NSLayoutConstraint.activate([
            web.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor),
            web.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor),
            web.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            web.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor)
        ])
        web.load(URLRequest(url: URL(string: "diagnostics://local/index.html")!))
    }
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        let url = navigationAction.request.url
        decisionHandler(url?.scheme == "diagnostics" && url?.host == "local" && url?.path == "/index.html" ? .allow : .cancel)
    }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "saveReport", message.frameInfo.isMainFrame,
              message.frameInfo.request.url?.scheme == "diagnostics",
              let json = message.body as? String, json.utf8.count < 2_000_000,
              presentedViewController == nil else { return }
        do {
            let directory = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
            try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
            let file = directory.appendingPathComponent("scanner-diagnostics.json")
            try Data(json.utf8).write(to: file)
            let share = UIActivityViewController(activityItems: [file], applicationActivities: nil)
            share.popoverPresentationController?.sourceView = web
            share.popoverPresentationController?.sourceRect = CGRect(x: web.bounds.midX, y: web.bounds.midY, width: 1, height: 1)
            share.completionWithItemsHandler = { _, _, _, _ in try? FileManager.default.removeItem(at: directory) }
            present(share, animated: true)
        } catch {
            let alert = UIAlertController(title: "Could not export report", message: error.localizedDescription, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default))
            present(alert, animated: true)
        }
    }
}

@main final class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        window = UIWindow(frame: UIScreen.main.bounds)
        window?.rootViewController = DiagnosticsController()
        window?.makeKeyAndVisible()
        return true
    }
}
