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

  /* 筆畫轉場僅在「離開首頁」時播放：
   *   - 從首頁前往其他頁  → 播放筆畫（離場覆蓋 + 目的頁退場揭開）
   *   - 前往首頁          → 不播放筆畫，直接導頁（首頁只走內容淡入浮現）
   *   - 其餘頁面之間       → 直接導頁
   * 任何情況下，目的頁的 .intro 淡入浮現動畫都會照常觸發。 */
  function pageKey(path) {
    var seg = (path || '').split('/').pop() || 'index';
    return seg.replace(/\.html$/, '') || 'index';
  }
  function isIndex(path) { return pageKey(path) === 'index'; }
  var HERE_IS_INDEX = isIndex(window.location.pathname);

  /* 本頁進場是否該播放筆畫退場：僅當「由首頁導來的非首頁」才播放。
   * 抵達首頁本身不播筆畫（只浮現）；來源頁以 document.referrer 判斷。 */
  function enterShouldStroke() {
    if (HERE_IS_INDEX) return false;
    try {
      var ref = document.referrer;
      if (ref) {
        var refUrl = new URL(ref);
        if (refUrl.origin === window.location.origin && isIndex(refUrl.pathname)) return true;
      }
    } catch (_) {}
    return false;
  }
  var ENTER_STROKE = enterShouldStroke();

  /* 參考 repo 的波浪路徑（viewBox 0 0 1316 664）*/
  var PATH_D = 'M13.4746 291.27C13.4746 291.27 100.646 -18.6724 255.617 16.8418C410.588 52.356 61.0296 431.197 233.017 546.326C431.659 679.299 444.494 21.0125 652.73 100.784C860.967 180.556 468.663 430.709 617.216 546.326C765.769 661.944 819.097 48.2722 988.501 120.156C1174.21 198.957 809.424 543.841 988.501 636.726C1189.37 740.915 1301.67 149.213 1301.67 149.213';

  var COVER_WIDTH = 900;   // 覆蓋峰值筆寬（viewBox 單位，需大到填滿畫面）
  var DRAW_WIDTH = 120;    // 運筆軌跡筆寬（看得出繪畫軌跡）
  var THIN_WIDTH = 2;      // 退場後筆寬

  /* ---- 關鍵 CSS（內聯，不依賴 dist）-------------------------------------- */
  var style = document.createElement('style');
  style.textContent =
    '#page-transition{position:fixed;inset:0;z-index:999;pointer-events:none;' +
    'display:flex;align-items:center;justify-content:center;opacity:0;overflow:hidden}' +
    '#page-transition.is-covering{opacity:1}' +
    '#page-transition svg{width:100%;height:100%;transform:scale(1.35)}' +
    '#page-transition path{stroke:var(--color-accent,#f9b664);fill:none}' +
    /* 等待資源就緒時的 4 球 loading（球色用 base-100，疊在覆蓋層中央）*/
    '#page-transition .loader{position:absolute;left:50%;top:50%;' +
    'transform:translate(-50%,-50%);height:30px;aspect-ratio:2.5;' +
    '--_g:no-repeat radial-gradient(farthest-side,var(--color-base-100,#fff) 90%,#0000);' +
    'background:var(--_g),var(--_g),var(--_g),var(--_g);background-size:20% 50%;' +
    'animation:l43 1s infinite linear;opacity:0;transition:opacity .2s}' +
    '#page-transition.is-loading .loader{opacity:1}' +
    '@keyframes l43{' +
    '0%{background-position:calc(0*100%/3) 50%,calc(1*100%/3) 50%,calc(2*100%/3) 50%,calc(3*100%/3) 50%}' +
    '16.67%{background-position:calc(0*100%/3) 0,calc(1*100%/3) 50%,calc(2*100%/3) 50%,calc(3*100%/3) 50%}' +
    '33.33%{background-position:calc(0*100%/3) 100%,calc(1*100%/3) 0,calc(2*100%/3) 50%,calc(3*100%/3) 50%}' +
    '50%{background-position:calc(0*100%/3) 50%,calc(1*100%/3) 100%,calc(2*100%/3) 0,calc(3*100%/3) 50%}' +
    '66.67%{background-position:calc(0*100%/3) 50%,calc(1*100%/3) 50%,calc(2*100%/3) 100%,calc(3*100%/3) 0}' +
    '83.33%{background-position:calc(0*100%/3) 50%,calc(1*100%/3) 50%,calc(2*100%/3) 50%,calc(3*100%/3) 100%}' +
    '100%{background-position:calc(0*100%/3) 50%,calc(1*100%/3) 50%,calc(2*100%/3) 50%,calc(3*100%/3) 50%}' +
    '}';
  (document.head || document.documentElement).appendChild(style);

  /* ---- Overlay（append 到 <html>，先於 body 繪製）----------------------- */
  var overlay = document.createElement('div');
  overlay.id = 'page-transition';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML =
    '<svg viewBox="0 0 1316 664" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">' +
    '<path d="' + PATH_D + '" pathLength="100" stroke-linecap="round" stroke-linejoin="round" ' +
    'stroke-width="' + THIN_WIDTH + '" stroke-dasharray="100" stroke-dashoffset="100"></path>' +
    '</svg>' +
    '<div class="loader" aria-hidden="true"></div>';
  document.documentElement.appendChild(overlay);

  var path = overlay.querySelector('path');

  /* 進場前：把 overlay 設為「已覆蓋」狀態（筆畫繪滿 + 加粗 + 不透明）*/
  function setCovered() {
    overlay.classList.add('is-covering');
    path.style.strokeDashoffset = '0';
    path.style.strokeWidth = COVER_WIDTH;
  }
  if (!REDUCED && ENTER_STROKE) setCovered();

  var EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';

  /* ---- 觸發既有浮現（html.is-loaded）------------------------------------ */
  function markLoaded() {
    document.documentElement.classList.add('is-loaded');
  }

  /* ---- enter：退場揭開 --------------------------------------------------
   * 筆畫先快速縮細（0→0.3 露出運筆軌跡）再退收；overlay 於中段淡出。
   * 內容浮現（is-loaded）在 overlay 開始淡出時即提前觸發，使其頭部與
   * 筆畫退場的尾部時間序重疊，銜接更柔順。*/
  /* 筆畫退場揭開（覆蓋層淡出 + 浮現），僅在資源就緒後呼叫 */
  function reveal() {
    overlay.classList.remove('is-loading');
    var p1 = path.animate(
      [{ strokeDashoffset: 0,    strokeWidth: COVER_WIDTH + 'px', offset: 0 },
       {                         strokeWidth: DRAW_WIDTH  + 'px', offset: 0.3 },
       { strokeDashoffset: -100, strokeWidth: THIN_WIDTH  + 'px', offset: 1 }],
      { duration: 1100, easing: EASE, fill: 'forwards' }
    );
    overlay.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 550, delay: 450, easing: EASE, fill: 'forwards' }
    );
    // 提前觸發浮現：與筆畫退場尾段重疊
    setTimeout(markLoaded, 450);
    p1.onfinish = function () {
      overlay.classList.remove('is-covering');
      overlay.style.opacity = '0';
      // 重置 path 供下次 leave 使用
      path.style.strokeDashoffset = '100';
      path.style.strokeWidth = THIN_WIDTH;
      markLoaded();
    };
  }

  var LOADER_DELAY = 200;   // 超過此時間仍未載完才顯示 loader（避免快速載入時閃爍）
  var MAX_WAIT = 5000;      // 等待資源最長時間（逾時保險，仍會退場）

  /* enter：覆蓋狀態下先等資源就緒（期間顯示 loader），再退場揭開 */
  function playEnter() {
    if (REDUCED || !ENTER_STROKE) { markLoaded(); return; }
    if (document.readyState === 'complete') { reveal(); return; }

    var done = false;
    var loaderTimer = setTimeout(function () {
      if (!done) overlay.classList.add('is-loading');
    }, LOADER_DELAY);

    function go() {
      if (done) return;
      done = true;
      clearTimeout(loaderTimer);
      clearTimeout(maxTimer);
      window.removeEventListener('load', go);
      reveal();
    }
    var maxTimer = setTimeout(go, MAX_WAIT);
    window.addEventListener('load', go);
  }

  /* ---- leave：覆蓋舊頁後導頁 --------------------------------------------
   * 筆畫以細線繪出運筆軌跡，接近填滿（offset 0.6 之後）才加粗成覆蓋面。*/
  var navigating = false;
  function playLeave(href) {
    // 僅「離開首頁」時播放筆畫；前往首頁或其餘頁面間 → 直接導頁（淡入浮現仍由目的頁觸發）
    if (REDUCED || !HERE_IS_INDEX) { window.location.href = href; return; }
    if (navigating) return;
    navigating = true;
    overlay.classList.add('is-covering');
    overlay.style.opacity = '';            // 交由 WAAPI 控制
    path.style.strokeDashoffset = '100';
    path.style.strokeWidth = DRAW_WIDTH;
    overlay.animate([{ opacity: 0 }, { opacity: 1 }],
      { duration: 300, easing: EASE, fill: 'forwards' });
    var draw = path.animate(
      [{ strokeDashoffset: 100, strokeWidth: DRAW_WIDTH  + 'px', offset: 0 },
       {                        strokeWidth: DRAW_WIDTH  + 'px', offset: 0.6 },
       { strokeDashoffset: 0,   strokeWidth: COVER_WIDTH + 'px', offset: 1 }],
      { duration: 850, easing: EASE, fill: 'forwards' }
    );
    draw.onfinish = function () { window.location.href = href; };
    // 保險：動畫卡住也要導頁
    setTimeout(function () { if (navigating) window.location.href = href; }, 1200);
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
      overlay.classList.remove('is-covering', 'is-loading');
      overlay.style.opacity = '0';
      path.style.strokeDashoffset = '100';
      path.style.strokeWidth = THIN_WIDTH;
    }
  });
})();
