# FastSpring Integration Demos

Static reference implementations of FastSpring's checkout integrations, all
served from one hub page. No backend — everything runs client-side against
the FastSpring Store Builder Library (SBL).

## Structure

```
index.html              Hub page — links to every demo below
EmbeddedCheckouts/       SBL checkout embedded inline in the page
PopupCheckouts/          SBL checkout opened as an overlay popup
WebCheckouts/            Hosted checkout redirect (plain link, no SBL)
PaymentComponents/       Planned — individually embeddable payment fields
```

Each demo page is self-contained and points at its own FastSpring Checkout:

| Demo              | Checkout                                              |
| ----------------- | ----------------------------------------------------- |
| Embedded Checkout | `thoran.test.qa.onfastspring.com/embedded-cards`      |
| Popup Checkout    | `thoran.test.qa.onfastspring.com/popup-rocket-league` |
| Web Checkout      | `thoran.test.qa.onfastspring.com/license`             |

All three point at the sandbox (test) store — no real charges occur.
