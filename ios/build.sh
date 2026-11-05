#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
platform="${1:-iphoneos}"
case "$platform" in
  iphoneos) target=arm64-apple-ios15.0 ;;
  iphonesimulator) target="$(uname -m)-apple-ios15.0-simulator" ;;
  *) echo 'Usage: bash ios/build.sh [iphoneos|iphonesimulator]' >&2; exit 1 ;;
esac
app="ios/build/$platform/Payload/ScannerDiagnostics.app"
mkdir -p "$app/Web" dist
cp ios/Info.plist "$app/Info.plist"
# Share identical parser/app logic without module loading restrictions on custom schemes.
python3 - "$app/Web" <<'PY'
from pathlib import Path
import sys
out = Path(sys.argv[1])
parser = Path('parser.mjs').read_text().replace('export function ', 'function ')
app = Path('app.mjs').read_text().split('\n', 1)[1]
(out/'bundle.js').write_text(parser+'\n'+app)
(out/'index.html').write_text(Path('index.html').read_text().replace('type="module" src="app.mjs"', 'defer src="bundle.js"'))
PY
xcrun --sdk "$platform" swiftc -parse-as-library -O -sdk "$(xcrun --sdk "$platform" --show-sdk-path)" -target "$target" -framework UIKit -framework WebKit ios/Main.swift -o "$app/ScannerDiagnostics"
plutil -lint "$app/Info.plist"
codesign --force --sign - "$app"
codesign --verify --deep --strict "$app"
if [[ "$platform" == iphoneos ]]; then
  output="$PWD/dist/upc-scanner-diagnostics-ios-0.1.1.ipa"
  (cd "ios/build/$platform" && /usr/bin/zip -q -r "$output" Payload)
  (cd dist && shasum -a 256 upc-scanner-diagnostics-ios-0.1.1.ipa > iOS-SHA256SUMS.txt)
fi
