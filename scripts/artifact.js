/* =============================================================================
 * artifact.js — 民俗文物借用頁
 *   - 產生文物卡片網格（同 venue.js 的 .venue-card 樣式）
 *   - 格狀 / 列表檢視切換、收藏鈕
 * ========================================================================== */
(function () {
  const grid = document.getElementById('artifact-grid');
  if (!grid) return;

  const items = [
    { img: 'https://www.figma.com/api/mcp/asset/4cf252a5-ba41-4abe-ae1f-a1cf01d733b6', name: '兒童款民俗功夫裝', center: '洛杉磯華僑文教服務中心', deposit: '$500.00 USD', badge: '傳統服飾' },
    { img: 'https://www.figma.com/api/mcp/asset/d9bc1085-c45e-4d57-ae38-a99bdb1b9c3e', name: '節慶專業舞獅頭',   center: '洛杉磯華僑文教服務中心', deposit: '$300.00 USD', badge: '表演道具' },
    { img: 'https://www.figma.com/api/mcp/asset/8e4ce087-a91d-4c39-b501-c0d0cdbc5741', name: '成人漢服典藏款',   center: '洛杉磯華僑文教服務中心', deposit: '$300.00 USD', badge: '傳統服飾' },
    { img: 'https://www.figma.com/api/mcp/asset/4d962eab-5cf6-4c97-8228-4be0197354c0', name: '民族舞蹈服（黃）', center: '橙縣華僑文教服務中心',   deposit: '$100.00 USD', badge: '舞蹈服裝' },
    { img: 'https://www.figma.com/api/mcp/asset/13f70b89-4a1a-4c0d-aac3-3356ef9e200a', name: '成人旗袍（藍）',   center: '橙縣華僑文教服務中心',   deposit: '$150.00 USD', badge: '傳統服飾' },
    { img: 'https://www.figma.com/api/mcp/asset/5b1170e8-aeaa-435f-850e-41ecea18a180', name: '傳統武術道具組',   center: '舊金山華僑文教服務中心', deposit: '$200.00 USD', badge: '表演道具' },
    { img: 'https://www.figma.com/api/mcp/asset/1f1ad746-2967-49b8-b449-f0e0f3c72b06', name: '二胡（傳統弦樂）', center: '舊金山華僑文教服務中心', deposit: '$250.00 USD', badge: '傳統樂器' },
    { img: 'https://www.figma.com/api/mcp/asset/181752e1-8081-4d82-825e-91603752a19a', name: '鑼鼓組（打擊樂）', center: '洛杉磯華僑文教服務中心', deposit: '$180.00 USD', badge: '傳統樂器' },
    { img: 'https://www.figma.com/api/mcp/asset/4cf252a5-ba41-4abe-ae1f-a1cf01d733b6', name: '成人武術功夫裝',   center: '橙縣華僑文教服務中心',   deposit: '$500.00 USD', badge: '傳統服飾' },
    { img: 'https://www.figma.com/api/mcp/asset/8e4ce087-a91d-4c39-b501-c0d0cdbc5741', name: '兒童漢服（紅）',   center: '舊金山華僑文教服務中心', deposit: '$200.00 USD', badge: '傳統服飾' },
    { img: 'https://www.figma.com/api/mcp/asset/4d962eab-5cf6-4c97-8228-4be0197354c0', name: '舞龍龍頭套組',     center: '洛杉磯華僑文教服務中心', deposit: '$400.00 USD', badge: '表演道具' },
    { img: 'https://www.figma.com/api/mcp/asset/d9bc1085-c45e-4d57-ae38-a99bdb1b9c3e', name: '傳統戲曲頭冠',     center: '橙縣華僑文教服務中心',   deposit: '$350.00 USD', badge: '表演道具' },
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

  /* ---- 搜尋列：文字輸入模擬 ---------------------------------------------- */
  const keyBtn = document.getElementById('art-keyword-btn');
  const keyLabel = document.getElementById('art-keyword-label');
  if (keyBtn && keyLabel) {
    keyBtn.addEventListener('click', () => {
      const val = prompt('搜尋文物關鍵字', '');
      if (val !== null) {
        keyLabel.textContent = val || keyLabel.dataset.placeholder || '文物關鍵字';
      }
    });
  }
})();
