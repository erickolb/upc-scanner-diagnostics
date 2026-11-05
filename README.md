# UPC scanner diagnostics

## Offline Android app

Download the APK from this repository's Releases, open it on Android, and allow installation from your download app when Android prompts. Requires Android 9 or later and a current Android System WebView. The app is named **UPC Scanner Diagnostics**, separate from Hardlight. No server, account, Internet permission, or runtime Bluetooth permission is required. All page assets are bundled in the APK; reports stay on-device until you explicitly save/share them.

1. Pair the Tera in Android Settings using **Bluetooth HID**, not SPP/BLE app mode. Keep the STX prefix, carriage-return terminator, and desired addenda setting.
2. Open the app in Observe mode, focus the baseline field, and scan. Determine how STX reaches Android; Ctrl+B is only confirmed on PC so far.
3. Select the observed prefix, enable Capture, and repeat the focus, 12-digit, typing, and timeout tests. For ordinary typing, use Android's on-screen keyboard or a physical keyboard; the scanner isn't used for that step.
4. **Download report** opens Android's document picker. Save the JSON and attach it to the diagnostic discussion. Test airplane mode with Bluetooth re-enabled to demonstrate offline operation.

### Build without deployment

Install JDK 17 and the Android SDK with platform 36 and build-tools 36.0.0. Set `ANDROID_HOME` to your SDK directory (or use an untracked `android/local.properties` with `sdk.dir`). From `android/`, run `./gradlew :app:assembleDebug :app:lintDebug` on Linux/macOS, or `gradlew.bat :app:assembleDebug :app:lintDebug` on Windows. The first build downloads Gradle/build dependencies; the installed app itself is offline. Gradle copies the root HTML/JS into generated assets automatically. Output: `android/app/build/outputs/apk/debug/app-debug.apk`.

The installable diagnostic APK uses Android's debug signing certificate. Builds made on different machines/CI may have different signing keys and cannot update one another: export reports and uninstall the older app first if Android reports a signature conflict. This is a testing toolkit, not a production-signed Hardlight release. CI builds and lints the APK and retains it as a workflow artifact.

The host serves an in-memory HTTPS origin from bundled assets so JavaScript modules work without file-URL exceptions. It does not intercept scanner keys natively: tests exercise the normal WebView keyboard path. Native code only hosts the page and saves exported JSON. Physical Bluetooth behavior must be tested on each device; a successful build does not establish scanner compatibility.

Standalone, local-only keyboard diagnostics for a Tera 1100L. No dependencies, API credentials, or Metron requests. This is a hardware integration test page, with small automated parser tests.

Serve this directory with any static HTTP server and open index.html. For example, with Python installed: `python -m http.server 8080`, then open http://localhost:8080. Run parser checks with `node --test parser.test.mjs`.

## PC test procedure

1. Start in Observe mode without a scanner prefix. Scan a known comic. Verify 17 digits, zeros, and Enter. Save the log if needed.
2. Configure the scanner prefix as STX using its manual. Scan in Observe mode. Inspect keydown/keyup events: do not assume STX maps to Ctrl+B. Record any browser shortcut or missing prefix.
3. Select the matching prefix and Capture mode. If no reliable event reaches the page, STX fails: choose a different scanner prefix and repeat observation. The custom option supports a single key only.
4. Scan with the background focused, then with the cursor in the middle of `keep this text`, then with the test button focused. Expect one complete scan each time, unchanged text, and no button activation from the scan. Clicking the button to focus it increments its count; Tab to focus it when testing keyboard activation.
5. Scan the same comic three times and two other comics. Expect five separate results in order, with exact digits. Set Expected barcode to the comic under test, or clear it for mixed scans.
6. Scan a main UPC without its supplement. Expect 12 digits classified as base UPC. Other lengths must be rejected.
7. Type/edit ordinary text and use Enter. Expect no captured scans or interference unless you deliberately type the configured prefix.
8. Click Simulate incomplete scan, wait at least two seconds, then scan. Expect timeout recovery and a clean subsequent result. This simulates parser state, not a physical interrupted transmission.
9. Download the JSON report. Record OS, browser version, scanner connection, prefix configuration, and any failed steps alongside it.

Pass means scans work anywhere in the active document, retain all digits, complete exactly once, and do not change unrelated controls. This does not capture input sent to browser chrome, other apps, or another frame. Android and iPhone require separate validation. The page retains only the latest 600 keyboard events; clearing or reloading discards them. Reports contain typed sample text, so do not type passwords here.

The Capture switch enables interception. Live indicators distinguish background readiness and test-button readiness. Click the background pad or focus the test button, then scan. Completed results retain start/end focus and activation counts in the on-screen Focus test log and downloaded report. A green PASS requires a valid prefixed 12- or 17-digit UPC, stable appropriate focus, and (for the button) no new activations. Expected barcode matching is reported separately; PASS validates capture and focus, not catalog identity.


Guided tests: Prepare 12-digit test snapshots the expected main UPC and focuses the background. Cover the supplemental bars and scan; a full extended scan produces RETRY. Ordinary typing checks exact multiline text plus Backspace/Enter and absence of captured scans. Timeout recovery seeds a simulated partial payload, records the timeout, then requires a fresh physical prefixed scan matching the expected UPC. All results appear in Test log and focusTests in the downloaded JSON.


## Printable scanner controls

Print [the one-page Tera 1100L addenda On/Off card](docs/tera-1100l-addenda-on-off.pdf) at 100% / Actual size. It reproduces the original manual barcodes with room for scanning. Scan a setting directly; keep the configured prefix and terminator.


Print [the two-page Bluetooth pairing and unpairing guide](docs/tera-1100l-bluetooth-pair-unpair.pdf) for HID pairing barcodes, phone-side Forget steps, and the optional return-to-PC wireless mode barcode.


## Offline iOS / LiveContainer

The iOS IPA is attached to iOS releases in this repository. On your iPhone, save it to Files, open LiveContainer, tap **+**, select the IPA, and launch **UPC Diagnostics**. Requires iOS 15+. LiveContainer handles import/signing; the distributed IPA is ad-hoc signed, without an Apple provisioning profile. It is not for direct standalone installation. Official import instructions: https://github.com/LiveContainer/LiveContainer#installing-apps

Pair Bluetooth HID in iOS Settings. Keep STX and Enter configured. Physical iPhone testing confirmed STX arrives as Ctrl+B, matching PC and Android; observe first on a new setup and select the matching prefix. Download report opens the iOS share sheet; choose Save to Files. This requires no Android/PC server. Reports identify the offline iOS WKWebView host.

If the scanner connection hides the software keyboard, select the typing field and scan **Show/Hide iOS Virtual HID Keyboard** (manual printed page 17). The persistence of this barcode setting is uncertain. Recommended for iOS: scan **Double Press Trigger to Show Keyboard On** (also printed page 17), then double-press the scanner trigger to show the software keyboard when needed. The human tested this shortcut and found it convenient. Ordinary typing passed after the keyboard was made available. Tapping the test button left focus on body on the tested iPhone, so button-focus testing is not applicable to that touch workflow. See the hardware test record for exact scope and results.

Build on a Mac with Xcode command-line tools: `bash ios/build.sh iphoneos`. Output: `dist/upc-scanner-diagnostics-ios-0.1.1.ipa`. To build for a simulator: `bash ios/build.sh iphonesimulator`. No third-party iOS dependencies or Apple developer credentials are needed for this LiveContainer package. The wrapper serves bundled assets through a custom local URL scheme; the build combines the shared parser and app into one classic script to avoid custom-scheme JavaScript module restrictions. It does not intercept scanner keys natively.

## Interpreting typing results

Since 0.1.1, correct final text with no false scans is a pass. Missing deletion evidence yields **PASS WITH CAVEAT**, not FAIL; beforeinput/input events can establish deletion when soft keyboards omit Backspace keydown. See [reviewed PC/Android results](docs/test-results.md). The original Android 0.1.0 report is not rewritten. A successful new build is not a new physical device test.

### Maintainer iOS build host

Use `barovia.chateaulore.net` for iOS builds and simulator verification. Cloud iOS build automation is intentionally omitted; the Android workflow remains. Transfer the committed source to a dedicated `~/Projects/upc-scanner-diagnostics` directory on Barovia, then run `bash ios/build.sh iphoneos` and `bash ios/build.sh iphonesimulator`. Retrieve the IPA and iOS-SHA256SUMS.txt from dist, verify the checksum, and attach them to the separate iOS release. No Apple provisioning profile is needed for LiveContainer import.
