# Hardware test record

## 2026-11-05: Tera 1100L

PC USB: STX prefix maps to Ctrl+B. Exact 17-digit capture, background focus, button focus without activation, unrelated text-field capture, ordinary typing, simulated timeout recovery, and 12-digit base UPC tests passed.

Android: physical user test in offline APK 0.1.0, Android 9 KFKAWI, WebView Chrome 138.0.7204.244. STX maps to Ctrl+B. Background, button (activation count 1 to 1), 17-digit UPC, 12-digit UPC, and simulated timeout recovery passed. UPCs were `75960621560700111` and `759606215607`.

**Ordinary typing: PASS WITH CAVEAT.** Three attempts produced the exact expected multiline text `scan 123\ndone`, Enter was observed, and captured scan count stayed 3. APK 0.1.0 labeled these FAIL solely because no Backspace keydown was recorded. The human confirmed following the editing instructions. Deletion itself cannot be independently established from that report; absence of a Backspace event is not evidence of broken editing. Original report remains unchanged. This is a reviewed interpretation of its evidence, not a regenerated hardware run.

Version 0.1.1 records beforeinput/input deletion evidence as well as key events. Correct final text and unchanged scan count pass with a caveat when deletion evidence is unavailable. The caveat is displayed and exported. This update still requires a new device run to verify soft-keyboard event reporting.

Addenda On required the supplement to be readable in these tests. Addenda Off allowed main-only capture. Automatic fallback under a single scanner setting has not been demonstrated.

iOS/LiveContainer: package prepared for testing; physical scanner validation pending. Results there apply to WKWebView inside LiveContainer, not automatically to a standalone signed Hardlight app.

## iOS package build, 2026-11-05

Version 0.1.1 device IPA and simulator app compiled on barovia.chateaulore.net with Xcode 26.3. Ad-hoc signing verification and post-transfer SHA-256 verification passed. Published as ios-v0.1.1 for LiveContainer import. Simulator startup was still pending at publication; runtime rendering, LiveContainer import, and physical Bluetooth tests are not yet marked passed.

