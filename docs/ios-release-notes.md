Offline iPhone/iPad scanner diagnostics for LiveContainer, version 0.1.1.

- Bundled WKWebView tests; no deployment, server, account, or network connection required.
- Same prefix, UPC, focus, typing, and timeout logic as the PC and Android toolkit.
- Report export uses the iOS share sheet: choose Save to Files, then share the JSON.
- Ordinary typing accepts correct output without false scans as PASS WITH CAVEAT when deletion events are unavailable; records input events when supplied.

Download the IPA to Files, open your existing LiveContainer, tap +, select the IPA, and launch UPC Diagnostics. This arm64 iOS 15+ package is ad-hoc signed for LiveContainer to process; it has no Apple provisioning profile and is not a directly installable standalone iPhone app.

Pair the scanner in iOS Settings using Bluetooth HID. Retain STX, carriage return, and Addenda On. First scan in Observe mode to establish how STX arrives on iOS. Only then select the corresponding prefix and enable Capture. Repeat background/button focus, full UPC, base UPC (Addenda Off), typing, timeout, and report export tests. Restore Addenda On afterward.

Build and simulator results do not establish physical Bluetooth behavior or LiveContainer compatibility on your phone. Hardware tests are pending. Android evidence and caveats are documented in docs/test-results.md.
