/* =============================================================================
 * venue.js — 場地預約頁
 *   - 產生場地卡片網格（同步執行，於 main.js 進場觀察器啟動前完成 DOM）
 *   - 格狀 / 列表檢視切換、收藏鈕、分頁/搜尋（雛形互動）
 * ========================================================================== */
(function () {
  const grid = document.getElementById('venue-grid');
  if (!grid) return;

  const imgs = ['Venue-01.png', 'image 26.png', 'Venue-02.png'];
  const names = [
    '華語文數位教室', '多功能藝文展演廳', '文化交流會議室', '親子共學教室',
    '書法研習教室', '社區活動中心', '多媒體錄製室', '舞蹈律動教室',
    '長者關懷據點', '青年創業沙龍', '美術創作工坊', '音樂排練室',
    '視訊會議廳', '料理示範教室', '展覽藝廊', '戶外庭園廣場',
  ];
  const centers = ['菲華文教服務中心', '駐溫哥華辦事處', '舊金山華僑文教中心', '全球僑社據點'];
  const prices = ['$ 340 /小時起', '$ 280 /小時起', '$ 420 /小時起', '$ 500 /小時起', '免費借用'];

  const cardHTML = (i) => {
    const img = imgs[i % imgs.length];
    const name = names[i % names.length];
    const center = centers[i % centers.length];
    const price = prices[i % prices.length];
    return `
      <article class="venue-card">
        <div class="venue-thumb aspect-[3/2]"><img src="./assets/image/${img}" alt="${name}" /></div>
        <div class="venue-card-body pt-5">
          <div class="flex items-center gap-2">
            <h3 class="venue-title flex-1">${name}</h3>
            <button class="btn btn-ghost btn-circle btn-sm fav-btn" aria-label="加入收藏" aria-pressed="false">
              <span class="material-symbols-rounded text-[20px]">star</span>
            </button>
          </div>
          <p class="text-base text-base-content/60">${center}</p>
          <p class="text-base">${price}</p>
        </div>
      </article>`;
  };

  grid.innerHTML = Array.from({ length: 16 }, (_, i) => cardHTML(i)).join('');

  /* ---- 收藏鈕：點擊切換填色 ------------------------------------------- */
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.fav-btn');
    if (!btn) return;
    const on = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', String(!on));
    const icon = btn.querySelector('.material-symbols-rounded');
    icon.style.fontVariationSettings = !on ? '"FILL" 1' : '"FILL" 0';
    icon.classList.toggle('text-amber-500', !on);
  });

  /* ---- 格狀 / 列表 檢視切換 ------------------------------------------- */
  const toggle = document.getElementById('view-toggle');
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-view]');
      if (!btn) return;
      const view = btn.dataset.view;
      grid.classList.toggle('is-list', view === 'list');
      toggle.querySelectorAll('button[data-view]').forEach((b) => {
        const active = b === btn;
        b.setAttribute('aria-pressed', String(active));
        b.classList.toggle('btn-neutral', active);
        b.classList.toggle('btn-outline', !active);
      });
    });
  }
})();
