/* =============================================================================
 * events.js — 僑務活動列表頁
 *   - 產生活動卡片網格
 *   - 格狀 / 列表切換
 * ========================================================================== */
(function () {
  const grid = document.getElementById('events-grid');
  if (!grid) return;

  const STATUS = {
    open:   { label: '報名中',   cls: 'badge-success' },
    soon:   { label: '即將截止', cls: 'badge-warning' },
    full:   { label: '額滿候補', cls: 'badge-error'   },
    ended:  { label: '已截止',   cls: 'badge-neutral' },
  };

  const events = [
    {
      img: './assets/image/event-1.png',
      date: '2026.07.15',
      title: '115年海外數位華語文推廣計畫菲律賓暨大洋洲組初階班',
      center: '菲華文教服務中心',
      type: '語言學習',
      seats: '剩餘 12 名',
      status: 'open',
    },
    {
      img: './assets/image/event-2.png',
      date: '2026.07.20',
      title: '2026年僑臺商智慧農業研習班',
      center: '駐溫哥華辦事處僑務組',
      type: '產業研習',
      seats: '剩餘 5 名',
      status: 'soon',
    },
    {
      img: './assets/image/event-3.png',
      date: '2026.08.01',
      title: '2026海內外客家後生交流營',
      center: '全球僑社',
      type: '文化交流',
      seats: '額滿',
      status: 'full',
    },
    {
      img: './assets/image/event-1.png',
      date: '2026.08.10',
      title: '海外華裔青年英語服務營 志工招募',
      center: '全球僑社',
      type: '青年服務',
      seats: '剩餘 28 名',
      status: 'open',
    },
    {
      img: './assets/image/event-2.png',
      date: '2026.08.15',
      title: '2026年台灣文化節海外巡迴 — 洛杉磯場',
      center: '洛杉磯華僑文教服務中心',
      type: '文化活動',
      seats: '剩餘 50 名',
      status: 'open',
    },
    {
      img: './assets/image/event-3.png',
      date: '2026.08.22',
      title: '僑二代臺灣文化體驗夏令營',
      center: '橙縣華僑文教服務中心',
      type: '親子活動',
      seats: '剩餘 8 名',
      status: 'soon',
    },
    {
      img: './assets/image/event-1.png',
      date: '2026.09.05',
      title: '海外僑社數位轉型實務研習班',
      center: '舊金山華僑文教服務中心',
      type: '產業研習',
      seats: '剩餘 15 名',
      status: 'open',
    },
    {
      img: './assets/image/event-2.png',
      date: '2026.09.12',
      title: '中華民族傳統節慶文化推廣工作坊',
      center: '洛杉磯華僑文教服務中心',
      type: '文化活動',
      seats: '剩餘 30 名',
      status: 'open',
    },
    {
      img: './assets/image/event-3.png',
      date: '2026.06.01',
      title: '2026年海外僑校師資培訓研習會',
      center: '全球僑社',
      type: '師資培訓',
      seats: '已截止',
      status: 'ended',
    },
    {
      img: './assets/image/event-1.png',
      date: '2026.09.28',
      title: '海外客家文化節藝術展演徵件',
      center: '全球僑社',
      type: '藝文活動',
      seats: '剩餘 20 名',
      status: 'open',
    },
    {
      img: './assets/image/event-2.png',
      date: '2026.10.03',
      title: '第十屆海外華語文能力競賽報名開始',
      center: '菲華文教服務中心',
      type: '語言學習',
      seats: '剩餘 40 名',
      status: 'open',
    },
    {
      img: './assets/image/event-3.png',
      date: '2026.10.15',
      title: '2026僑務委員擴大會議海外参訪行程',
      center: '全球僑社',
      type: '政策交流',
      seats: '受邀制',
      status: 'ended',
    },
  ];

  const cardHTML = ({ img, date, title, center, type, seats, status }) => {
    const st = STATUS[status];
    return `
    <article class="event-card">
      <a href="./event-detail.html" class="event-link" aria-label="查看「${title}」詳情"></a>
      <div class="news-card-thumb relative aspect-[4/3] overflow-hidden rounded-lg border border-base-content/10 bg-base-200">
        <img src="${img}" alt="${title}" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" loading="lazy" />
        <span class="event-date-badge">${date}</span>
      </div>
      <div class="event-body pt-4 flex flex-col gap-2 flex-1">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="event-tag-badge">
            <span class="material-symbols-rounded text-[13px]" style="font-variation-settings:'FILL' 0">sell</span>
            ${type}
          </span>
          <span class="badge badge-soft ${st.cls} text-xs">${st.label}</span>
        </div>
        <h3 class="news-card-title">${title}</h3>
        <p class="text-sm text-base-content/60 leading-snug">${center}</p>
        <div class="flex items-center gap-1 text-xs text-base-content/50 mt-auto pt-1">
          <span class="material-symbols-rounded text-[14px]">person</span>
          ${seats}
        </div>
      </div>
    </article>`;
  };

  grid.innerHTML = events.map(cardHTML).join('');

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
