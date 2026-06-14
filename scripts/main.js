/* =============================================================================
 * main.js — 首頁互動
 *   - Swiper 輪播（Hero + 最新消息 / 活動 / 藏書 / 場地）
 *   - 進場動畫（標題 Clip Reveal、卡片淡入上移）以 IntersectionObserver 觸發
 *   - 全站動態效果開關（無障礙：暫停輪播與進場動畫）
 *   - 導覽列向下捲隱藏 / 向上捲顯示、回到頂部、愛心評分
 * ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const swipers = [];            // 所有 Swiper 實例
  let heroSwiper = null;

  /* ---- 評分：daisyUI rating 元件（唯讀展示，amber-500 愛心）------------
   * 以 data-rating 產生 daisyUI 官方 rating 結構（rating-half + mask mask-heart）。
   * class 皆為完整字面值，確保 Tailwind / daisyUI 能掃描並產出對應樣式。 */
  document.querySelectorAll('.rating-hearts').forEach((el) => {
    const score = Math.max(0, Math.min(5, parseFloat(el.dataset.rating || '0')));
    const name = 'rate-' + Math.random().toString(36).slice(2, 8);
    let inner = `<input type="radio" name="${name}" class="rating-hidden" disabled aria-label="無評分" />`;
    for (let i = 1; i <= 10; i++) {
      const val = i * 0.5;
      const cls = (i % 2 === 1)
        ? 'mask mask-heart mask-half-1 bg-amber-500'
        : 'mask mask-heart mask-half-2 bg-amber-500';
      const checked = Math.abs(val - score) < 0.001 ? ' checked' : '';
      inner += `<input type="radio" name="${name}" class="${cls}" disabled${checked} aria-label="${val} 顆心" />`;
    }
    el.classList.remove('rating-hearts');
    el.classList.add('rating', 'rating-half', 'rating-md');
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', `評分 ${score} / 5`);
    el.innerHTML = inner;
  });

  /* ---- Hero 輪播 ------------------------------------------------------- */
  const heroEl = document.querySelector('.hero-swiper');
  if (heroEl) {
    const current = document.querySelector('.hero-current');
    const total = document.querySelector('.hero-total');
    const progress = document.querySelector('.hero-progress');
    const pad = (n) => String(n).padStart(2, '0');
    const slideCount = heroEl.querySelectorAll('.swiper-slide').length;
    if (total) total.textContent = pad(slideCount);

    heroSwiper = new Swiper(heroEl, {
      loop: true,
      speed: 600,
      autoplay: { delay: 5000, disableOnInteraction: false },
      navigation: { prevEl: '.hero-prev', nextEl: '.hero-next' },
      on: {
        afterInit() { if (current) current.textContent = pad(1); },
        realIndexChange(sw) { if (current) current.textContent = pad(sw.realIndex + 1); },
        autoplayTimeLeft(_sw, _time, progressRatio) {
          if (progress) progress.style.width = `${(1 - progressRatio) * 100}%`;
        },
      },
    });
    swipers.push(heroSwiper);

    // Hero 自身的 暫停 / 播放 鈕
    const toggleBtn = document.querySelector('.hero-toggle');
    if (toggleBtn) {
      const icon = toggleBtn.querySelector('[data-icon-play]');
      toggleBtn.addEventListener('click', () => {
        if (heroSwiper.autoplay.running) { heroSwiper.autoplay.stop(); icon.textContent = 'play_arrow'; }
        else { heroSwiper.autoplay.start(); icon.textContent = 'pause'; }
      });
    }
  }

  /* ---- 內容區輪播 ----------------------------------------------------- */
  const makeSwiper = (selector, prevEl, nextEl, perView, perViewSm) => {
    const sw = new Swiper(selector, {
      slidesPerView: perViewSm,
      spaceBetween: 24,
      autoplay: false,   // 最新消息 / 活動 / 書 / 場地：不自動輪播，僅手動箭頭切換
      loop: false,
      navigation: { prevEl, nextEl },
      breakpoints: {
        640: { slidesPerView: Math.min(2, perView), spaceBetween: 32 },
        1024: { slidesPerView: perView, spaceBetween: 44 },
      },
    });
    swipers.push(sw);
    return sw;
  };
  if (document.querySelector('.news-swiper')) makeSwiper('.news-swiper', '.news-prev', '.news-next', 3, 1.1);
  if (document.querySelector('.events-swiper')) makeSwiper('.events-swiper', '.events-prev', '.events-next', 3, 1.1);
  if (document.querySelector('.books-swiper')) makeSwiper('.books-swiper', '.books-prev', '.books-next', 4, 1.4);
  if (document.querySelector('.venue-swiper')) makeSwiper('.venue-swiper', '.venue-prev', '.venue-next', 3, 1.1);

  /* ---- 進場動畫：卡片依序錯開 ----------------------------------------- */
  document.querySelectorAll('.swiper').forEach((sw) => {
    sw.querySelectorAll('.reveal-up').forEach((card, i) => {
      card.style.transitionDelay = `${(i % 4) * 0.08}s`;
    });
  });

  /* ---- 進場揭開：IntersectionObserver + 捲動保險 ----------------------
   * threshold:0 任何像素進入即觸發；另以捲動保險處理「快速滑動越過」與
   * 「停在畫面底部死角」時 IO 只回報未相交、導致標題卡在隱藏的情況。 */
  const reveal = (el) => { el.classList.add('is-in'); io.unobserve(el); };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // 相交、或已捲過上緣（top < 視窗高）都視為「進入過視線」→ 揭開
      if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
        reveal(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.reveal-clip, .reveal-up').forEach((el) => io.observe(el));

  // 捲動保險：凡進入視窗上方 92% 區域且尚未揭開者，立即揭開
  const revealPassed = () => {
    document.querySelectorAll('.reveal-clip:not(.is-in), .reveal-up:not(.is-in)').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) reveal(el);
    });
  };
  window.addEventListener('scroll', revealPassed, { passive: true });
  window.addEventListener('resize', revealPassed, { passive: true });
  // 初次載入 / 由錨點跳轉而已在視線內者，立即揭開（不需等捲動事件）
  requestAnimationFrame(revealPassed);
  window.addEventListener('load', revealPassed);

  // 內容區輪播 autoplay 一律為 false；僅 Hero 依設定自動播放（Swiper 自行啟動）。
  // 若使用者系統偏好「減少動態」，停掉 Hero 自動播放。
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && heroSwiper && heroSwiper.autoplay) {
    heroSwiper.autoplay.stop();
  }

  /* ---- 導覽列：固定置頂、向下捲隱藏 / 向上捲顯示 ---------------------- */
  const header = document.getElementById('site-header');
  const spacer = document.getElementById('nav-spacer');
  if (header && spacer) {
    // 內頁頁首 Banner（若有）：頁首浮在 hero 之上，spacer 收為 0 讓 hero 上移貼齊頂端
    const hero = document.querySelector('.page-hero');
    const sizeSpacer = () => { spacer.style.height = hero ? '0px' : `${header.offsetHeight}px`; };
    sizeSpacer();
    window.addEventListener('resize', sizeSpacer);

    // 頁首在 hero 之上時背景透明；捲過 hero 後恢復底色
    const updateHeaderBg = () => {
      if (!hero) return;
      const overHero = hero.getBoundingClientRect().bottom > header.offsetHeight;
      header.classList.toggle('nav-over-hero', overHero);
    };
    updateHeaderBg();
    window.addEventListener('resize', updateHeaderBg);
    window.addEventListener('load', updateHeaderBg);

    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      updateHeaderBg();
      if (Math.abs(y - lastY) < 6) return;
      if (y > lastY && y > header.offsetHeight) header.classList.add('nav-hidden');   // 向下：移出
      else header.classList.remove('nav-hidden');                                     // 向上：移入
      lastY = y;
    }, { passive: true });
  }

  /* ---- 回到頂部 ------------------------------------------------------- */
  const backTop = document.getElementById('back-to-top');
  if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---- 換頁進場：浮現（.intro → html.is-loaded）-----------------------
   * 正常情況由 transition.js 於「筆畫退場」完成後觸發 is-loaded，使浮現
   * 接續在筆畫換頁效果之後。此處僅保留加長的安全 timeout 作為後備
   * （transition.js 缺失或動畫卡住時仍會浮現）；is-loaded 重複加為冪等。*/
  const markLoaded = () => document.documentElement.classList.add('is-loaded');
  setTimeout(markLoaded, 1500);
});
