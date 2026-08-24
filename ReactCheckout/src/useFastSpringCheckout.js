import { useEffect, useRef, useState } from "react";

const SBL_SCRIPT_ID = "fsc-api";
const SBL_SRC =
  "https://d1f8f9xcsvx3ha.cloudfront.net/sbl/TNP-27957/fastspring-builder.js";
const STOREFRONT = "thoran.test.qa2.onfastspring.com/embedded-stacked";
const DATA_CALLBACK_NAME = "__fscOnDataReady";

/**
 * Loads the FastSpring Store Builder Library once and adds/opens the given
 * product path in the embedded checkout container as soon as the library
 * reports its first session data. Callers must render an element with id
 * "fsc-embedded-checkout-container" that stays untouched by React (SBL
 * mutates it directly), and can use `ready` to show a placeholder as a
 * sibling instead of a child.
 */
export function useFastSpringCheckout(productPath) {
  const [ready, setReady] = useState(false);
  const addedRef = useRef(false);

  useEffect(() => {
    window[DATA_CALLBACK_NAME] = () => {
      if (addedRef.current) return;
      addedRef.current = true;
      window.fastspring.builder.add(productPath);
      window.fastspring.builder.checkout();
      setReady(true);
    };

    if (!document.getElementById(SBL_SCRIPT_ID)) {
      // The SBL caches its session id in localStorage keyed to the
      // storefront (fscSerial-*, fscLatestSession-*) and only clears it via
      // a postMessage "close" event meant for popup checkouts. A plain
      // embedded checkout never sends that message on completion, so after
      // a completed purchase the id lingers and a later page load resumes
      // that same now-finalized session — which the checkout iframe reports
      // as "expired". This is a single-product checkout page, not a
      // persistent cart, so every load should start a brand new session.
      localStorage.removeItem(`fscSerial-${STOREFRONT}`);
      localStorage.removeItem(`fscLatestSession-${STOREFRONT}`);
      const script = document.createElement("script");
      script.id = SBL_SCRIPT_ID;
      script.type = "text/javascript";
      script.src = SBL_SRC;
      script.dataset.storefront = STOREFRONT;
      script.dataset.dataCallback = DATA_CALLBACK_NAME;
      // The SBL only ever calls Markup.init() (which flips its internal
      // "ready" gate) from a DOMContentLoaded listener it registers on load.
      // That event has already fired by the time a script is inserted from a
      // React effect, so the gate never opens and the data-fsc-item-* order
      // summary directives silently stay empty even though checkout works.
      // Re-firing the event once the SBL has registered its listener trips
      // the same init path without needing an unsupported internal API.
      script.onload = () => {
        document.dispatchEvent(
          new Event("DOMContentLoaded", { bubbles: true, cancelable: true }),
        );
      };
      document.body.appendChild(script);
    }

    return () => {
      delete window[DATA_CALLBACK_NAME];
    };
  }, [productPath]);

  return { ready };
}
