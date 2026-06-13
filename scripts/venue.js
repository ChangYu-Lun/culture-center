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
        <a href="./venue-detail.html" class="venue-link" aria-label="查看「${name}」詳情"></a>
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

/* =============================================================================
 * 場地搜尋卡：地點 / 時間 / 人數 三個客製下拉面板
 *   - 點擊欄位：外層容器底色變 base-300、該欄位白底＋shadow＋略放大
 *   - 地點：兩頁（洲 tile → 文教中心清單）
 *   - 時間：daisyUI Cally 日曆 + 起訖時間下拉
 *   - 人數：雙端點橫條（最少 / 最多），與下方數字欄位連動
 * ========================================================================== */
(function () {
  const search = document.getElementById('venue-search');
  if (!search) return;
  const $ = (id) => document.getElementById(id);

  /* ---- 文教中心名單（依洲分組）--------------------------------------- */
  const ZONES = [
    { name: '亞洲', centers: ['菲華文教服務中心'] },
    { name: '北美洲', centers: [
      '多倫多華僑文教服務中心', '華府華僑文教服務中心', '亞特蘭大華僑文教服務中心',
      '波士頓華僑文教服務中心', '芝加哥華僑文教服務中心', '休士頓華僑文教服務中心',
      '洛杉磯華僑文教服務中心', '橙縣華僑文教服務中心', '紐約華僑文教服務中心',
      '金山華僑文教服務中心', '金山灣區華僑文教服務中心', '西雅圖華僑文教服務中心',
    ] },
    { name: '南美洲', centers: ['巴西聖保羅華僑文教服務中心'] },
    { name: '大洋洲', centers: ['澳洲布里斯本華僑文教服務中心', '澳洲雪梨華僑文教服務中心'] },
  ];

  const fields = [...search.querySelectorAll('.vd-field')];
  const panelOf = (name) => search.querySelector(`.vd-panel[data-panel="${name}"]`);

  const setFieldValue = (name, text) => {
    const field = search.querySelector(`.vd-field[data-field="${name}"]`);
    const span = field.querySelector('.vd-field-text');
    span.textContent = text;
    field.classList.add('has-value');
  };

  /* ---- 開 / 關 面板 -------------------------------------------------- */
  let openField = null;
  const positionPanel = (panel, field) => {
    const cw = search.clientWidth;
    const pw = panel.offsetWidth;
    let left = field.offsetLeft;
    if (left + pw > cw) left = Math.max(0, cw - pw);
    panel.style.left = `${left}px`;
  };
  const closePanel = () => {
    if (!openField) return;
    panelOf(openField.dataset.field).hidden = true;
    openField.classList.remove('is-active');
    openField.setAttribute('aria-expanded', 'false');
    search.classList.remove('is-open');
    openField = null;
  };
  const openPanel = (field) => {
    if (openField === field) { closePanel(); return; }
    closePanel();
    const panel = panelOf(field.dataset.field);
    if (field.dataset.field === 'location') showLocPage('zones');
    search.classList.add('is-open');
    field.classList.add('is-active');
    field.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    positionPanel(panel, field);
    openField = field;
  };

  // 欄位點擊切換；搜尋鈕關閉面板
  search.addEventListener('click', (e) => {
    const field = e.target.closest('.vd-field');
    if (field) { openPanel(field); return; }
    if (e.target.closest('#venue-search-btn')) closePanel();
  });
  // 點面板外關閉
  document.addEventListener('click', (e) => { if (!e.target.closest('#venue-search')) closePanel(); });
  window.addEventListener('resize', () => { if (openField) positionPanel(panelOf(openField.dataset.field), openField); });

  /* ---- 地點：洲 tile → 文教中心 ------------------------------------- */
  const locPanel = panelOf('location');
  const zoneGrid = locPanel.querySelector('[data-zone-grid]');
  const centerList = locPanel.querySelector('[data-center-list]');
  const zoneNameEl = locPanel.querySelector('[data-zone-name]');

  const showLocPage = (page) => {
    locPanel.querySelectorAll('.vd-loc-page').forEach((p) => { p.hidden = p.dataset.page !== page; });
    if (openField) positionPanel(locPanel, openField);
  };

  // 第一頁：洲 tiles
  zoneGrid.innerHTML = ZONES.map((z, i) => `
    <button type="button" class="vd-tile" data-zone="${i}">
      <span class="material-symbols-rounded text-[22px]">public</span>
      <span class="vd-tile-name">${z.name}</span>
      <span class="vd-tile-count">${z.centers.length} 個據點</span>
    </button>`).join('');

  zoneGrid.addEventListener('click', (e) => {
    const tile = e.target.closest('.vd-tile');
    if (!tile) return;
    const zone = ZONES[+tile.dataset.zone];
    zoneNameEl.textContent = zone.name;
    centerList.innerHTML = zone.centers.map((c) =>
      `<li><button type="button" class="vd-center-item" data-center="${c}">${c}</button></li>`).join('');
    showLocPage('centers');
  });
  locPanel.querySelector('[data-loc-back]').addEventListener('click', () => showLocPage('zones'));
  centerList.addEventListener('click', (e) => {
    const item = e.target.closest('.vd-center-item');
    if (!item) return;
    setFieldValue('location', item.dataset.center);
    closePanel();
  });

  /* ---- 時間：Cally 日曆 + 起訖時間 ---------------------------------- */
  const cal = $('vd-search-cal');
  const startSel = $('vd-search-start');
  const endSel = $('vd-search-end');
  const OPEN = { start: 8, end: 22 };
  const fmt12 = (h) => `${h < 12 ? '上午' : '下午'} ${String(h).padStart(2, '0')}:00`;
  const fillSel = (sel, from, to, val) => {
    sel.innerHTML = '';
    for (let h = from; h <= to; h++) {
      const o = document.createElement('option');
      o.value = h; o.textContent = fmt12(h);
      sel.appendChild(o);
    }
    sel.value = val;
  };
  fillSel(startSel, OPEN.start, OPEN.end - 1, 13);
  fillSel(endSel, OPEN.start + 1, OPEN.end, 16);

  const updateTimeField = () => {
    let s = +startSel.value, en = +endSel.value;
    if (en <= s) { en = s + 1; fillSel(endSel, OPEN.start + 1, OPEN.end, en); }
    const st = fmt12(s), et = fmt12(en);
    const d = cal && cal.value ? cal.value.replaceAll('-', '/') : '';
    setFieldValue('time', d ? `${d}　${st}-${et}` : `${st}-${et}`);
  };
  if (cal) cal.addEventListener('change', updateTimeField);
  startSel.addEventListener('change', updateTimeField);
  endSel.addEventListener('change', updateTimeField);

  /* ---- 人數：雙端點橫條 --------------------------------------------- */
  const minR = $('vd-people-min'), maxR = $('vd-people-max');
  const minN = $('vd-people-min-num'), maxN = $('vd-people-max-num');
  const fill = $('vd-dr-fill');
  const MINP = 1, MAXP = 60;
  const clamp = (v) => Math.max(MINP, Math.min(MAXP, Math.round(v) || MINP));
  const syncFill = () => {
    const lo = +minR.value, hi = +maxR.value;
    fill.style.left = `${((lo - MINP) / (MAXP - MINP)) * 100}%`;
    fill.style.width = `${((hi - lo) / (MAXP - MINP)) * 100}%`;
  };
  const updatePeopleField = () => {
    const lo = +minR.value, hi = +maxR.value;
    setFieldValue('people', `${lo} - ${hi}${hi >= MAXP ? '+' : ''} 人`);
  };
  minR.addEventListener('input', () => {
    if (+minR.value > +maxR.value) minR.value = maxR.value;
    minN.value = minR.value; syncFill(); updatePeopleField();
  });
  maxR.addEventListener('input', () => {
    if (+maxR.value < +minR.value) maxR.value = minR.value;
    maxN.value = maxR.value; syncFill(); updatePeopleField();
  });
  minN.addEventListener('change', () => {
    let v = clamp(+minN.value); if (v > +maxR.value) v = +maxR.value;
    minN.value = v; minR.value = v; syncFill(); updatePeopleField();
  });
  maxN.addEventListener('change', () => {
    let v = clamp(+maxN.value); if (v < +minR.value) v = +minR.value;
    maxN.value = v; maxR.value = v; syncFill(); updatePeopleField();
  });
  syncFill();
})();
