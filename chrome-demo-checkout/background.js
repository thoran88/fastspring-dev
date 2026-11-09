importScripts('config.js');

// Strict site CSPs (script-src without the FastSpring CDN allowlisted) block the injected
// <script src>. When that happens we strip the CSP response header for just this tab and
// retry — scoped via activeTab + declarativeNetRequest tabIds condition, no broad host access.
async function stripCspForTab(tabId) {
  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [tabId],
    addRules: [
      {
        id: tabId,
        priority: 1,
        condition: { tabIds: [tabId], resourceTypes: ['main_frame', 'sub_frame'] },
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            { header: 'content-security-policy', operation: 'remove' },
            { header: 'content-security-policy-report-only', operation: 'remove' },
          ],
        },
      },
    ],
  });
}

function reloadAndWait(tabId) {
  return new Promise((resolve) => {
    function listener(id, info) {
      if (id === tabId && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }
    chrome.tabs.onUpdated.addListener(listener);
    chrome.tabs.reload(tabId);
  });
}

async function inject(tabId) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: tryOpenCheckout,
    args: [FS_DEMO_CONFIG],
  });
  return result; // 'ok' | 'blocked'
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  chrome.action.setBadgeText({ tabId: tab.id, text: '' });

  const first = await inject(tab.id);
  if (first === 'ok') return;

  // Blocked by page CSP — strip it for this tab only and retry once.
  // (No effect if the site sets CSP via a <meta> tag instead of a response header;
  // that's rare and there's no clean fix for it from an extension.)
  await stripCspForTab(tab.id);
  await reloadAndWait(tab.id);
  const second = await inject(tab.id);

  if (second !== 'ok') {
    chrome.action.setBadgeText({ tabId: tab.id, text: '!' });
    chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: '#c0392b' });
    chrome.action.setTitle({ tabId: tab.id, title: 'Blocked — this site\'s CSP is set via a <meta> tag and can\'t be stripped.' });
  }
});

function tryOpenCheckout(config) {
  const SCRIPT_ID = 'fsc-demo-injected-api';

  function runCheckout() {
    window.fastspring.builder.add(config.productPath, function () {
      window.fastspring.builder.checkout();
    });
  }

  if (window.fastspring && window.fastspring.builder) {
    runCheckout();
    return Promise.resolve('ok');
  }

  const existing = document.getElementById(SCRIPT_ID);
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener('load', () => { runCheckout(); resolve('ok'); }, { once: true });
      existing.addEventListener('error', () => resolve('blocked'), { once: true });
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'text/javascript';
    script.src = `https://d1f8f9xcsvx3ha.cloudfront.net/sbl/${config.buildId}/fastspring-builder.js`;
    script.setAttribute('data-storefront', config.storefront);
    script.addEventListener('load', () => { runCheckout(); resolve('ok'); }, { once: true });
    script.addEventListener('error', () => resolve('blocked'), { once: true });
    document.head.appendChild(script);
  });
}
