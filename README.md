# UPC scanner diagnostics

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
