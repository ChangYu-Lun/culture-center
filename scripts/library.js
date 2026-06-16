/* =============================================================================
 * library.js — 圖書借閱列表頁
 *   - 產生圖書卡片網格（同 venue.js 的 .venue-card 樣式）
 *   - 愛心評分、格狀 / 列表檢視切換、收藏鈕
 * ========================================================================== */
(function () {
  const grid = document.getElementById('library-grid');
  if (!grid) return;

  const books = [
    { img: './assets/image/book-1.png', title: '台灣光華雜誌 2025 9月號', author: '光華雜誌社', tags: ['實體書', '文化輔助'], rating: 4 },
    { img: './assets/image/book-2.png', title: '來學華語(法文版)第一冊', author: '行政院僑務委員會', tags: ['電子書', '文化輔助'], rating: 4 },
    { img: './assets/image/book-3.png', title: '老師的話', author: '淡江大學外國語文學院', tags: ['實體書', '文化輔助'], rating: 5 },
    { img: './assets/image/book-4.png', title: '台灣光華雜誌 2025 10月號', author: '光華雜誌社', tags: ['電子書', '文化輔助'], rating: 4 },
    { img: './assets/image/book-3.png', title: '老師的話（教師手冊）', author: '淡江大學外國語文學院', tags: ['實體書', '文化輔助'], rating: 5 },
    { img: './assets/image/book-1.png', title: '台灣光華雜誌 2025 9月號（典藏）', author: '光華雜誌社', tags: ['電子書', '文化輔助'], rating: 4 },
    { img: './assets/image/book-4.png', title: '台灣光華雜誌 2025 10月號', author: '光華雜誌社', tags: ['實體書', '文化輔助'], rating: 5 },
    { img: './assets/image/book-2.png', title: '來學華語(法文版)第一冊', author: '行政院僑務委員會', tags: ['電子書', '外語教材'], rating: 5 },
    { img: './assets/image/book-1.png', title: '台灣光華雜誌 2025 10月號', author: '光華雜誌社', tags: ['實體書', '文化輔助'], rating: 5 },
    { img: './assets/image/book-4.png', title: '台灣光華雜誌 2025 9月號', author: '光華雜誌社', tags: ['電子書', '文化輔助'], rating: 5 },
    { img: './assets/image/book-2.png', title: '來學華語(法文版)第一冊', author: '行政院僑務委員會', tags: ['電子書', '文化輔助'], rating: 5 },
    { img: './assets/image/book-3.png', title: '老師的話', author: '淡江大學外國語文學院', tags: ['實體書', '文化輔助'], rating: 5 },
  ];

  /* 卡片樣式對齊首頁「精選藏書」.book-card：書封 contain + 陰影、daisyUI
   * 愛心評分（.rating-hearts 由 main.js 轉成 amber 心）、.book-title。
   * 額外保留列表頁需要的：整卡可點（.venue-link）、雙標籤、作者、收藏鈕。*/
  const cardHTML = ({ img, title, author, tags, rating }) => `
    <article class="book-card relative">
      <a href="./library-detail.html" class="venue-link" aria-label="查看「${title}」詳情"></a>
      <div class="book-thumb relative">
        <img src="${img}" alt="${title}" loading="lazy" />
      </div>
      <div>
        <div class="flex items-center gap-1.5 flex-wrap">
          ${tags.map(t => `<span class="badge badge-soft badge-neutral">${t}</span>`).join('')}
        </div>
        <div class="flex items-start gap-1">
          <h3 class="book-title flex-1">${title}</h3>
          <button class="btn btn-ghost btn-circle btn-sm fav-btn shrink-0 z-[2]" aria-label="加入收藏" aria-pressed="false">
            <span class="material-symbols-rounded text-[20px]">star</span>
          </button>
        </div>
        <p class="text-sm text-base-content/60 -mt-1 mb-2">${author}</p>
        <div class="rating-hearts rating-sm" data-rating="${rating}"></div>
      </div>
    </article>`;

  grid.innerHTML = books.map(cardHTML).join('');

  /* 收藏鈕由 main.js 的全站統一處理器負責（星星 + amber-500） */

  /* ---- 格狀 / 列表切換 -------------------------------------------------- */
  const toggle = document.getElementById('view-toggle');
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-view]');
      if (!btn) return;
      toggle.querySelectorAll('[data-view]').forEach(b => {
        b.classList.toggle('btn-neutral', b === btn);
        b.classList.toggle('btn-outline', b !== btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      grid.classList.toggle('is-list', btn.dataset.view === 'list');
    });
  }
})();
