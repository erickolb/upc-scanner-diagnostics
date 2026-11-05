# Hardware test record

## 2026-11-05: Tera 1100L

PC USB: STX prefix maps to Ctrl+B. Exact 17-digit capture, background focus, button focus without activation, unrelated text-field capture, ordinary typing, simulated timeout recovery, and 12-digit base UPC tests passed.

Android: physical user test in offline APK 0.1.0, Android 9 KFKAWI, WebView Chrome 138.0.7204.244. STX maps to Ctrl+B. Background, button (activation count 1 to 1), 17-digit UPC, 12-digit UPC, and simulated timeout recovery passed. UPCs were `75960621560700111` and `759606215607`.

**Ordinary typing: PASS WITH CAVEAT.** Three attempts produced the exact expected multiline text `scan 123\ndone`, Enter was observed, and captured scan count stayed 3. APK 0.1.0 labeled these FAIL solely because no Backspace keydown was recorded. The human confirmed following the editing instructions. Deletion itself cannot be independently established from that report; absence of a Backspace event is not evidence of broken editing. Original report remains unchanged. This is a reviewed interpretation of its evidence, not a regenerated hardware run.

Version 0.1.1 records beforeinput/input deletion evidence as well as key events. Correct final text and unchanged scan count pass with a caveat when deletion evidence is unavailable. The caveat is displayed and exported. This update still requires a new device run to verify soft-keyboard event reporting.

Addenda On required the supplement to be readable in these tests. Addenda Off allowed main-only capture. Automatic fallback under a single scanner setting has not been demonstrated.

iOS/LiveContainer: physical results are recorded below. Results apply to WKWebView inside LiveContainer, not automatically to a standalone signed Hardlight app.

## iOS package build, 2026-11-05

Version 0.1.1 device IPA and simulator app compiled on barovia.chateaulore.net with Xcode 26.3. Ad-hoc signing verification and post-transfer SHA-256 verification passed. Published as ios-v0.1.1 for LiveContainer import. Simulator startup was still pending at publication; runtime rendering, LiveContainer import, and physical Bluetooth tests are not yet marked passed.

Follow-up: The iPhone simulator on Barovia completed startup, launched UPC Diagnostics, and rendered the bundled page (screenshot visually checked). Physical LiveContainer import, scanner input, and share-sheet export remain pending.

## iPhone physical tests, 2026-11-05 (supersedes pending status above)

Offline iOS WKWebView through LiveContainer, iPhone OS 18.7, diagnostics 0.1.1:

- STX maps to Ctrl+B, matching PC and Android.
- Repeated exact 17-digit UPC capture with background focus: PASS.
- Main-only 12-digit UPC capture with Addenda Off: PASS.
- Simulated timeout followed by fresh exact full UPC capture: PASS.
- LiveContainer import and JSON report export: PASS, demonstrated by the supplied reports.
- Button-focus test: NOT APPLICABLE to the tested iPhone touch workflow. Tapping activated the button but left document focus on body. Scans did not add activations. No follow-up button-focus test is required for this workflow; this does not claim buttons can never receive programmatic or keyboard focus on iOS.
- Ordinary typing after showing the software keyboard: PASS, no caveat. Final value was `scan 123\ndone`; Backspace, deletion input, and Enter were observed; scan count stayed 1 to 1.

Keyboard-setting persistence is uncertain: the human revised the initial impression that **Show/Hide iOS Virtual HID Keyboard** was only an immediate toggle. Do not treat persistence as established either way. **Recommended iOS configuration:** scan **Double Press Trigger to Show Keyboard On** (manual printed page 17). The human tried the double-trigger shortcut and reported that it makes showing the software keyboard easy. Select a text field and double-press the trigger when needed. This usability recommendation does not change the successful typing or scanner test results.

The tested PC, Android, and iPhone workflows support prefix-driven, cursor-independent UPC capture. Android ordinary typing retains its documented deletion-event caveat. Scanner addenda mode must still be selected explicitly; automatic 17-/12-digit hardware fallback was not established.
