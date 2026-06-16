/* =============================================================================
 * artifact.js — 民俗文物借用頁
 *   - 產生文物卡片網格（同 venue.js 的 .venue-card 樣式）
 *   - 格狀 / 列表檢視切換、收藏鈕
 * ========================================================================== */
(function () {
  const grid = document.getElementById('artifact-grid');
  if (!grid) return;

  const items = [
    { img: './assets/image/artifact01.png', name: '節慶專業舞獅頭',           center: '洛杉磯華僑文教服務中心', deposit: '$300.00 USD', badge: '表演道具' },
    { img: './assets/image/artifact02.png', name: '二十四節令鼓',             center: '洛杉磯華僑文教服務中心', deposit: '$350.00 USD', badge: '傳統樂器' },
    { img: './assets/image/artifact03.png', name: '改良式典雅女款旗袍',       center: '橙縣華僑文教服務中心',   deposit: '$150.00 USD', badge: '傳統服飾' },
    { img: './assets/image/artifact04.png', name: '兒童款民俗功夫裝',         center: '洛杉磯華僑文教服務中心', deposit: '$500.00 USD', badge: '傳統服飾' },
    { img: './assets/image/artifact05.png', name: '傳統木雕布袋戲偶',         center: '舊金山華僑文教服務中心', deposit: '$400.00 USD', badge: '表演道具' },
    { img: './assets/image/artifact06.png', name: '校園培訓專用扯鈴（培鈴款）', center: '橙縣華僑文教服務中心',   deposit: '$120.00 USD', badge: '表演道具' },
    { img: './assets/image/artifact07.png', name: '台灣原住民服飾套組（阿美族）', center: '舊金山華僑文教服務中心', deposit: '$300.00 USD', badge: '傳統服飾' },
    { img: './assets/image/artifact08.png', name: '客家油紙傘',               center: '洛杉磯華僑文教服務中心', deposit: '$180.00 USD', badge: '民俗工藝' },
    { img: './assets/image/artifact09.png', name: '電音三太子神偶服',         center: '橙縣華僑文教服務中心',   deposit: '$450.00 USD', badge: '表演道具' },
    { img: './assets/image/artifact10.png', name: '古典中式大型大紅燈籠',     center: '舊金山華僑文教服務中心', deposit: '$200.00 USD', badge: '民俗工藝' },
    { img: './assets/image/artifact01.png', name: '節慶專業舞獅頭',           center: '橙縣華僑文教服務中心',   deposit: '$300.00 USD', badge: '表演道具' },
    { img: './assets/image/artifact02.png', name: '二十四節令鼓',             center: '舊金山華僑文教服務中心', deposit: '$350.00 USD', badge: '傳統樂器' },
  ];

  const cardHTML = ({ img, name, center, deposit, badge }) => `
    <article class="venue-card">
      <a href="./artifact-detail.html" class="venue-link" aria-label="查看「${name}」詳情"></a>
      <div class="venue-thumb aspect-square">
        <img src="${img}" alt="${name}" loading="lazy" />
      </div>
      <div class="venue-card-body pt-4">
        <div class="flex items-start gap-1">
          <h3 class="venue-title flex-1 text-base">${name}</h3>
          <button class="btn btn-ghost btn-circle btn-sm fav-btn shrink-0" aria-label="加入收藏" aria-pressed="false">
            <span class="material-symbols-rounded text-[20px]">star</span>
          </button>
        </div>
        <p class="text-sm text-base-content/60 mt-0.5">${center}</p>
        <div class="flex items-center gap-2 mt-1 flex-wrap">
          <p class="text-sm font-medium">保證金 ${deposit}</p>
          <span class="badge badge-outline text-xs">${badge}</span>
        </div>
      </div>
    </article>`;

  grid.innerHTML = items.map(cardHTML).join('');

  /* ---- 收藏鈕 ----------------------------------------------------------- */
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.fav-btn');
    if (!btn) return;
    const on = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', String(!on));
    const icon = btn.querySelector('.material-symbols-rounded');
    icon.style.fontVariationSettings = on ? "'FILL' 0" : "'FILL' 1";
    icon.style.color = on ? '' : 'var(--color-accent-alt, #845409)';
  });

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
