(function () {
  function nowStamp() {
    var d = new Date();
    return d.toLocaleTimeString();
  }

  function panel() {
    return document.getElementById('live-log');
  }

  function appendEntry(kind, label, payload) {
    var p = panel();
    if (!p) return;
    var empty = p.querySelector('.log-empty');
    if (empty) empty.remove();

    var entry = document.createElement('div');
    entry.className = 'log-entry log-' + kind;

    var head = document.createElement('div');
    head.className = 'log-entry-head';
    var kindSpan = document.createElement('span');
    kindSpan.className = 'log-kind';
    kindSpan.textContent = label;
    var timeSpan = document.createElement('span');
    timeSpan.className = 'log-time';
    timeSpan.textContent = nowStamp();
    head.appendChild(kindSpan);
    head.appendChild(timeSpan);
    entry.appendChild(head);

    if (payload !== undefined) {
      var pre = document.createElement('pre');
      pre.className = 'log-payload';
      try {
        pre.textContent = JSON.stringify(payload, null, 2);
      } catch (e) {
        pre.textContent = String(payload);
      }
      entry.appendChild(pre);
    }

    p.insertBefore(entry, p.firstChild);
  }

  // SBL global callbacks, wired via data-data-callback / data-popup-closed /
  // data-popup-webhook-received / data-error-callback on the script tag.
  window.dataCallback = function (data) {
    appendEntry('data', 'data-data-callback', data);
  };
  window.popupClosed = function (data) {
    appendEntry('popup', 'data-popup-closed', data);
  };
  window.webhookReceived = function (data) {
    appendEntry('webhook', 'data-popup-webhook-received', data);
  };
  window.errorCallback = function (data) {
    appendEntry('error', 'data-error-callback', data);
  };

  window.sblLog = {
    note: function (message) { appendEntry('note', message); },
    error: function (message) { appendEntry('error', message); },
    // Runs fn, logging a note first and turning a thrown/parse error into a
    // log entry instead of a silent console failure (e.g. bad JSON in a demo textarea).
    run: function (label, fn) {
      appendEntry('note', label);
      try {
        fn();
      } catch (e) {
        appendEntry('error', label + ' — client-side error: ' + e.message);
      }
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var clearBtn = document.getElementById('log-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        var p = panel();
        if (p) p.innerHTML = '<div class="log-empty">Log cleared — trigger an action to see events.</div>';
      });
    }

    // Delegated on document (capture phase, ahead of SBL's own handler) so this
    // keeps working even though SBL clones/replaces data-fsc-action elements
    // after binding them, which would silently drop a listener attached directly.
    document.addEventListener('click', function (evt) {
      var el = evt.target.closest && evt.target.closest('[data-fsc-action]');
      if (!el) return;
      var action = el.getAttribute('data-fsc-action');
      var itemPath = el.getAttribute('data-fsc-item-path-value');
      var driverPath = el.getAttribute('data-fsc-driver-item-path-value');
      var detail = 'clicked data-fsc-action="' + action + '"';
      if (itemPath) detail += ' · item=' + itemPath;
      if (driverPath) detail += ' · driver=' + driverPath;
      appendEntry('note', detail);
    }, true);

    document.querySelectorAll('.copy-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var code = btn.parentElement.querySelector('code');
        if (!code) return;
        navigator.clipboard.writeText(code.textContent).then(function () {
          var original = btn.textContent;
          btn.textContent = 'Copied';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = original;
            btn.classList.remove('copied');
          }, 1400);
        }).catch(function () {
          btn.textContent = 'Copy failed';
          setTimeout(function () { btn.textContent = 'Copy'; }, 1400);
        });
      });
    });
  });
})();
