// "Test card" button for every demo page: click it for the FastSpring test
// card numbers, click a value to copy it. No dependencies, no backend.
// Mounts in the page's navbar when it has one (the hub's .header-controls,
// the demo pages' .top-controls, the sbl pages' .topbar-inner, the IBM mock's
// <header>) and falls back to a small pill in the bottom-right corner.

(function () {
  if (window.__testCardMounted) return;
  window.__testCardMounted = true;

  const ROWS = [
    { label: "Success", value: "4242 4242 4242 4242", tone: "ok" },
    { label: "Decline", value: "4000 0000 0000 0002", tone: "bad" },
    { label: "Expiry", value: "Any future date", copy: "12/30", plain: true },
    { label: "CVV", value: "*UZPF" },
  ];

  const ICON =
    '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/></svg>';

  const CSS = `
.tc-ui{--tc-bg:#fff;--tc-text:#1a1d24;--tc-dim:#5c6370;--tc-border:#d9dde4;--tc-hover:rgba(0,0,0,.05);--tc-accent:#4338ca;--tc-ok:#0f9d58;--tc-bad:#dc2626;
  font-family:-apple-system,"Helvetica Neue",Helvetica,Arial,sans-serif}
.tc-ui[data-tc="dark"]{--tc-bg:#171a21;--tc-text:#e6e8eb;--tc-dim:#9aa1ad;--tc-border:#2e3340;--tc-hover:rgba(255,255,255,.07);--tc-accent:#818cf8;--tc-ok:#34d399;--tc-bad:#f87171}
.tc-btn{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 11px;border-radius:8px;border:1px solid var(--tc-border);
  background:var(--tc-bg);color:var(--tc-text);font:600 12.5px/1 inherit;font-family:inherit;cursor:pointer;white-space:nowrap;
  transition:border-color .15s,color .15s}
.tc-btn:hover,.tc-btn[aria-expanded="true"]{border-color:var(--tc-accent);color:var(--tc-text)}
.tc-btn:focus-visible{outline:2px solid var(--tc-accent);outline-offset:2px}
.tc-float{position:fixed;right:16px;bottom:16px;z-index:9998;box-shadow:0 6px 20px -6px rgba(0,0,0,.35);border-radius:8px}
.tc-panel{position:fixed;z-index:9999;width:min(320px,calc(100vw - 24px));padding:6px;border-radius:12px;
  background:var(--tc-bg);color:var(--tc-text);border:1px solid var(--tc-border);box-shadow:0 18px 44px -12px rgba(0,0,0,.4);font-size:14px;line-height:1.4}
.tc-panel[hidden]{display:none}
.tc-head{display:flex;justify-content:space-between;align-items:baseline;padding:7px 9px 5px}
.tc-title{font-weight:700;font-size:13.5px}
.tc-hint{color:var(--tc-dim);font-size:11.5px}
.tc-row{display:flex;align-items:center;justify-content:space-between;gap:14px;width:100%;padding:8px 9px;border:0;border-radius:8px;
  background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.tc-row:hover,.tc-row:focus-visible{background:var(--tc-hover);outline:none}
.tc-row:focus-visible{box-shadow:inset 0 0 0 2px var(--tc-accent)}
.tc-label{display:flex;align-items:center;gap:8px;color:var(--tc-dim);font-size:12.5px}
.tc-dot{width:8px;height:8px;border-radius:50%;background:var(--tc-dim)}
.tc-dot.ok{background:var(--tc-ok)}.tc-dot.bad{background:var(--tc-bad)}
.tc-val{font:600 13.5px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap}
.tc-val.plain{font-family:inherit;font-weight:500;color:var(--tc-dim)}
.tc-val.copied{color:var(--tc-ok)}
.tc-foot{margin-top:2px;padding:7px 9px 5px;border-top:1px solid var(--tc-border);color:var(--tc-dim);font-size:11.5px}
@media (max-width:560px){.tc-btn span{display:none}.tc-btn{padding:0;width:32px;justify-content:center}}
`;

  function el(tag, props, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else n.setAttribute(k, v);
    }
    n.append(...kids.filter(Boolean));
    return n;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = el("textarea", { style: "position:fixed;opacity:0" });
      ta.value = text;
      document.body.append(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {}
      ta.remove();
      return ok;
    }
  }

  // Dark or light, judged from what the page actually paints, so it works
  // for pages with data-theme, pages that follow the OS, and fixed-theme ones.
  function pageIsDark() {
    for (const node of [document.body, document.documentElement]) {
      const m = getComputedStyle(node).backgroundColor.match(/[\d.]+/g);
      if (m && (m.length < 4 || Number(m[3]) > 0.5)) {
        const [r, g, b] = m.map(Number);
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
      }
    }
    return matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function mount() {
    document.head.append(el("style", { text: CSS }));

    const btn = el("button", { class: "tc-btn tc-ui", type: "button", "aria-haspopup": "dialog", "aria-expanded": "false", "aria-label": "Test card" });
    btn.innerHTML = ICON;
    btn.append(el("span", { text: "Test card" }));

    const panel = el("div", { class: "tc-panel tc-ui", role: "dialog", "aria-label": "Test card details", hidden: "" });
    // Set the theme before either is inserted, so the button never paints
    // in the wrong colours first (its colour transition would show it).
    btn.dataset.tc = panel.dataset.tc = pageIsDark() ? "dark" : "light";
    panel.append(
      el("div", { class: "tc-head" }, el("span", { class: "tc-title", text: "Test card" }), el("span", { class: "tc-hint", text: "Click a value to copy" })),
      ...ROWS.map((r) => {
        const val = el("span", { class: "tc-val" + (r.plain ? " plain" : ""), text: r.value });
        const row = el("button", { class: "tc-row", type: "button", "aria-label": `Copy ${r.label}` }, el("span", { class: "tc-label" }, r.tone ? el("span", { class: "tc-dot " + r.tone }) : null, r.label), val);
        row.addEventListener("click", async () => {
          const ok = await copyText(r.copy || r.value);
          const prev = r.value;
          val.textContent = ok ? "Copied" : "Copy failed";
          val.classList.add("copied");
          setTimeout(() => {
            val.textContent = prev;
            val.classList.remove("copied");
          }, 1000);
        });
        return row;
      }),
      el("div", { class: "tc-foot", text: "Test mode only. These cards never charge anything." }),
    );
    document.body.append(panel);

    // Where the button goes.
    const flex = (last) => {
      const wrap = el("div", { style: "display:flex;align-items:center;gap:12px;margin-left:auto" });
      last.before(wrap);
      wrap.append(btn, last);
    };
    const controls = document.querySelector(".header-controls, .top-controls");
    const bar =
      document.querySelector(".topbar-inner") ||
      document.querySelector(".topbar") ||
      document.querySelector("header");
    if (controls) {
      controls.prepend(btn);
    } else if (bar && bar.children.length === 1) {
      // Brand or back link only: the bar is space-between, so the button
      // lands on the right by itself.
      btn.style.marginLeft = "auto";
      bar.append(btn);
    } else if (bar && bar.lastElementChild) {
      flex(bar.lastElementChild);
    } else {
      btn.classList.add("tc-float");
      document.body.append(btn);
    }

    function sync() {
      const mode = pageIsDark() ? "dark" : "light";
      btn.dataset.tc = mode;
      panel.dataset.tc = mode;
    }
    sync();
    // Pages animate their theme change, so re-check once it has settled.
    new MutationObserver(() => setTimeout(sync, 260)).observe(document.documentElement, { attributes: true });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => setTimeout(sync, 260));

    function place() {
      const r = btn.getBoundingClientRect();
      panel.style.right = `${Math.max(12, Math.round(innerWidth - r.right))}px`;
      if (r.top > innerHeight / 2) {
        panel.style.top = "auto";
        panel.style.bottom = `${Math.round(innerHeight - r.top + 8)}px`;
      } else {
        panel.style.bottom = "auto";
        panel.style.top = `${Math.round(r.bottom + 8)}px`;
      }
    }
    function close() {
      panel.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!panel.hidden) return close();
      sync();
      panel.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      place();
    });
    document.addEventListener("click", (e) => {
      if (!panel.hidden && !panel.contains(e.target)) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.hidden) {
        close();
        btn.focus();
      }
    });
    addEventListener("resize", () => !panel.hidden && place());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
