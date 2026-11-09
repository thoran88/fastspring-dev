# FastSpring Demo Checkout (Chrome extension)

Injects a FastSpring SBL checkout popup into whatever page is open, so sales can demo checkout
directly on a seller's real website instead of a mockup.

## Load it

1. `chrome://extensions` → enable Developer mode → **Load unpacked** → select this folder.
2. Open any website, click the extension's toolbar icon.
3. The FastSpring SBL script loads into that page and opens the checkout popup for the product
   configured in [`config.js`](config.js).

## Configure

Edit [`config.js`](config.js) — `storefront`, `buildId`, and `productPath` — to point at a real
demo store/product instead of the QA test store it ships with.

## How it works

No content script runs automatically on every page (no `<all_urls>` permission). Clicking the
toolbar icon uses `activeTab` + `chrome.scripting.executeScript` to inject the FastSpring builder
script and call `add()` + `checkout()` only on the tab you're actively demoing in.

**Strict site CSP:** some seller sites' `Content-Security-Policy` blocks the FastSpring script
from loading (`script-src` doesn't allowlist the CDN). When that happens, the extension strips
the CSP response header for that one tab (`declarativeNetRequest` scoped by `tabIds`, no broad
host permissions) and reloads once, then retries automatically. If the toolbar icon shows a red
`!` badge after that, the site sets its CSP via an HTML `<meta>` tag instead of a response header
— that can't be stripped this way, and there's no clean extension-side fix for it.

If you just added the `declarativeNetRequest`/`tabs` permissions, reload the extension at
`chrome://extensions` (the refresh icon on its card) before testing again.
