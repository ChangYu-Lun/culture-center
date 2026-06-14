/* =============================================================================
 * transition.js — SVG 筆畫換頁動畫
 * -----------------------------------------------------------------------------
 * 參考 agentPritam47/svg-page-transition（GSAP DrawSVGPlugin）的視覺效果，
 * 以原生 JS（SVG pathLength + stroke-dashoffset + Web Animations API）重現：
 *
 *   1. leave  — 點擊內部連結時，一條 accent 波浪筆畫快速繪製並加粗到填滿畫面，
 *               覆蓋舊頁 → 導向新頁。
 *   2. enter  — 新頁一進入即為「覆蓋中」狀態，筆畫退場揭開頁面。
 *   3. 浮現    — 退場完成後加 html.is-loaded，鏈接觸發既有 .intro 階梯淡入。
 *
 * 本檔放在各頁 <head>（同步、無 defer），於 body 解析前就把 overlay 掛到
 * documentElement，確保新頁「首次繪製」即被覆蓋、無白閃。
 * ========================================================================== */
(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 參考 repo 的波浪路徑（viewBox 0 0 1316 664）*/
  var PATH_D = 'M13.4746 291.27C13.4746 291.27 100.646 -18.6724 255.617 16.8418C410.588 52.356 61.0296 431.197 233.017 546.326C431.659 679.299 444.494 21.0125 652.73 100.784C860.967 180.556 468.663 430.709 617.216 546.326C765.769 661.944 819.097 48.2722 988.501 120.156C1174.21 198.957 809.424 543.841 988.501 636.726C1189.37 740.915 1301.67 149.213 1301.67 149.213';

  var COVER_WIDTH = 900;   // 覆蓋峰值筆寬（viewBox 單位，需大到填滿畫面）
  var THIN_WIDTH = 2;      // 退場後筆寬

  /* ---- 關鍵 CSS（內聯，不依賴 dist）-------------------------------------- */
  var style = document.createElement('style');
  style.textContent =
    '#page-transition{position:fixed;inset:0;z-index:999;pointer-events:none;' +
    'display:flex;align-items:center;justify-content:center;opacity:0;overflow:hidden}' +
    '#page-transition.is-covering{opacity:1}' +
    '#page-transition svg{width:100%;height:100%;transform:scale(1.35)}' +
    '#page-transition path{stroke:var(--color-accent,#f9b664);fill:none}';
  (document.head || document.documentElement).appendChild(style);

  /* ---- Overlay（append 到 <html>，先於 body 繪製）----------------------- */
  var overlay = document.createElement('div');
  overlay.id = 'page-transition';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML =
    '<svg viewBox="0 0 1316 664" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">' +
    '<path d="' + PATH_D + '" pathLength="100" stroke-linecap="round" stroke-linejoin="round" ' +
    'stroke-width="' + THIN_WIDTH + '" stroke-dasharray="100" stroke-dashoffset="100"></path>' +
    '</svg>';
  document.documentElement.appendChild(overlay);

  var path = overlay.querySelector('path');

  /* 進場前：把 overlay 設為「已覆蓋」狀態（筆畫繪滿 + 加粗 + 不透明）*/
  function setCovered() {
    overlay.classList.add('is-covering');
    path.style.strokeDashoffset = '0';
    path.style.strokeWidth = COVER_WIDTH;
  }
  if (!REDUCED) setCovered();

  var EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';

  /* ---- 觸發既有浮現（html.is-loaded）------------------------------------ */
  function markLoaded() {
    document.documentElement.classList.add('is-loaded');
  }

  /* ---- enter：退場揭開 -------------------------------------------------- */
  function playEnter() {
    if (REDUCED) { markLoaded(); return; }
    // 筆畫退收 + 縮細（1.2s），overlay 於後段淡出
    var p1 = path.animate(
      [{ strokeDashoffset: 0, strokeWidth: COVER_WIDTH + 'px' },
       { strokeDashoffset: -100, strokeWidth: THIN_WIDTH + 'px' }],
      { duration: 1200, easing: EASE, fill: 'forwards' }
    );
    var p2 = overlay.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 500, delay: 700, easing: EASE, fill: 'forwards' }
    );
    p2.onfinish = function () {
      overlay.classList.remove('is-covering');
      overlay.style.opacity = '0';
      // 重置 path 供下次 leave 使用
      path.style.strokeDashoffset = '100';
      path.style.strokeWidth = THIN_WIDTH;
      markLoaded();
    };
  }

  /* ---- leave：覆蓋舊頁後導頁 -------------------------------------------- */
  var navigating = false;
  function playLeave(href) {
    if (REDUCED) { window.location.href = href; return; }
    if (navigating) return;
    navigating = true;
    overlay.classList.add('is-covering');
    overlay.style.opacity = '';            // 交由 WAAPI 控制
    path.style.strokeDashoffset = '100';
    path.style.strokeWidth = THIN_WIDTH;
    overlay.animate([{ opacity: 0 }, { opacity: 1 }],
      { duration: 350, easing: EASE, fill: 'forwards' });
    var draw = path.animate(
      [{ strokeDashoffset: 100, strokeWidth: THIN_WIDTH + 'px' },
       { strokeDashoffset: 0, strokeWidth: COVER_WIDTH + 'px' }],
      { duration: 700, easing: EASE, fill: 'forwards' }
    );
    draw.onfinish = function () { window.location.href = href; };
    // 保險：動畫卡住也要導頁
    setTimeout(function () { if (navigating) window.location.href = href; }, 1100);
  }

  /* ---- 連結攔截 --------------------------------------------------------- */
  function isInternalNav(a, e) {
    if (!a) return false;
    if (e.defaultPrevented) return false;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return false;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
    var url;
    try { url = new URL(a.href, window.location.href); } catch (_) { return false; }
    if (url.origin !== window.location.origin) return false;     // 外部連結
    // 純錨點（同頁 #）不轉場
    if (url.pathname === window.location.pathname && url.hash && url.search === window.location.search) return false;
    return true;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!isInternalNav(a, e)) return;
    e.preventDefault();
    playLeave(a.href);
  });

  /* ---- enter 觸發 + bfcache ---------------------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', playEnter);
  } else {
    playEnter();
  }

  // 返回（bfcache 還原）時 overlay 可能停在覆蓋狀態 → 重置隱藏
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      navigating = false;
      overlay.classList.remove('is-covering');
      overlay.style.opacity = '0';
      path.style.strokeDashoffset = '100';
      path.style.strokeWidth = THIN_WIDTH;
    }
  });
})();
