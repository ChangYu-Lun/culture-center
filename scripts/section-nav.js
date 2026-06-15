/* =============================================================================
 * section-nav.js — 首頁章節目錄（左側中央）
 * -----------------------------------------------------------------------------
 *   - 每個 Section 一條橫條：預設 base-content/20，章節進入畫面中央時 → accent-alt
 *   - 大斷點（≥1025px）：hover 橫條群組 → 自左滑入 daisyUI 選單；點項目平滑捲動並收起
 *   - 小斷點（≤1024px）：左下浮動按鈕，點擊開合選單
 * ========================================================================== */
(function () {
  'use strict';

  /* 章節清單（依出現順序；僅保留實際存在於頁面者）*/
  var SECTIONS = [
    { id: 'hero',   label: '封面' },
    { id: 'news',   label: '最新消息' },
    { id: 'events', label: '活動公告' },
    { id: 'folk',   label: '民俗文物' },
    { id: 'venue',  label: '場地預約' },
  ].filter(function (s) { return document.getElementById(s.id); });
  if (SECTIONS.length < 2) return;

  /* ---- 建立 DOM ------------------------------------------------------- */
  var nav = document.createElement('nav');
  nav.className = 'section-nav';
  nav.setAttribute('aria-label', '頁面章節導覽');

  var rail = document.createElement('div');
  rail.className = 'section-nav-rail';

  var menuWrap = document.createElement('div');
  menuWrap.className = 'section-nav-menu';
  var ul = document.createElement('ul');
  ul.className = 'menu';

  SECTIONS.forEach(function (s) {
    var bar = document.createElement('button');
    bar.type = 'button';
    bar.className = 'section-nav-bar';
    bar.dataset.target = s.id;
    bar.setAttribute('aria-label', s.label);
    rail.appendChild(bar);

    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + s.id;
    a.dataset.target = s.id;
    a.textContent = s.label;
    li.appendChild(a);
    ul.appendChild(li);
  });
  menuWrap.appendChild(ul);

  var fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'section-nav-fab btn btn-neutral btn-circle shadow-lg';
  fab.setAttribute('aria-label', '開啟章節選單');
  fab.setAttribute('aria-expanded', 'false');
  fab.innerHTML = '<span class="material-symbols-rounded text-[22px]">list</span>';

  nav.appendChild(rail);
  nav.appendChild(menuWrap);
  nav.appendChild(fab);
  document.body.appendChild(nav);

  /* ---- 平滑捲動（扣除固定頁首高度）----------------------------------- */
  var header = document.getElementById('site-header');
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (id === SECTIONS[0].id) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    var offset = (header ? header.offsetHeight : 0) + 12;
    var y = Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset);
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  /* ---- Active 追蹤：章節跨越畫面垂直中央時點亮 ----------------------- */
  var bars = Array.prototype.slice.call(rail.querySelectorAll('.section-nav-bar'));
  var items = Array.prototype.slice.call(ul.querySelectorAll('a'));
  function setActive(id) {
    bars.forEach(function (b) { b.classList.toggle('is-active', b.dataset.target === id); });
    items.forEach(function (a) { a.classList.toggle('is-active', a.dataset.target === id); });
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
  SECTIONS.forEach(function (s) { io.observe(document.getElementById(s.id)); });

  /* ---- 點選：捲動 + 收起選單 ----------------------------------------- */
  function onPick(id, fromEl) {
    scrollToId(id);
    setActive(id);
    nav.classList.add('is-dismissed');   // 大斷點：移出選單，直到滑鼠離開
    nav.classList.remove('is-open');      // 小斷點：關閉
    fab.setAttribute('aria-expanded', 'false');
    if (fromEl && fromEl.blur) fromEl.blur();
  }
  rail.addEventListener('click', function (e) {
    var b = e.target.closest('.section-nav-bar');
    if (b) onPick(b.dataset.target, b);
  });
  ul.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-target]');
    if (!a) return;
    e.preventDefault();
    onPick(a.dataset.target, a);
  });
  nav.addEventListener('mouseleave', function () { nav.classList.remove('is-dismissed'); });

  /* ---- 小斷點：浮動按鈕開合 ------------------------------------------ */
  fab.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    fab.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', function (e) {
    if (!nav.classList.contains('is-open')) return;
    if (!nav.contains(e.target)) {
      nav.classList.remove('is-open');
      fab.setAttribute('aria-expanded', 'false');
    }
  });
})();
