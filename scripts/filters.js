/* =============================================================================
 * filters.js — 共用搜尋篩選系統（圖書借閱 / 民俗文物 / 僑務活動）
 *   - 每個「藥丸」篩選鈕掛上一個浮層面板（fixed 定位，附加於 <body>，不受卡片裁切）
 *   - 面板型別：
 *       location  地點：洲 tile → 文教中心清單（與場地頁同一份名單）
 *       multi     複選晶片（含「全部」預設）
 *       single    單選清單
 *       rating    圖像化（愛心）評價選擇
 *       date      Cally 日曆（借用 / 活動日期）
 *   - 同時間僅開啟一個面板；點面板外、捲動、改變視窗大小自動關閉 / 重新定位。
 * ========================================================================== */
(function () {
  'use strict';

  /* ---- 文教中心名單（依洲分組，與 venue.js 同步）---------------------- */
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

  /* ---- 單一開啟面板的管理 -------------------------------------------- */
  let current = null; // { pop, btn }

  const placePop = (pop, btn) => {
    const r = btn.getBoundingClientRect();
    const pw = pop.offsetWidth || 280;
    let left = r.left;
    if (left + pw > window.innerWidth - 12) left = window.innerWidth - 12 - pw;
    pop.style.left = `${Math.max(12, left)}px`;
    pop.style.top = `${r.bottom + 8}px`;
  };

  const closeOpen = () => {
    if (!current) return;
    current.pop.hidden = true;
    current.btn.setAttribute('aria-expanded', 'false');
    current.btn.classList.remove('is-open');
    current = null;
  };

  document.addEventListener('click', (e) => {
    if (!current) return;
    if (e.target.closest('.filter-pop')) return;
    if (current.btn.contains(e.target)) return;
    closeOpen();
  });
  window.addEventListener('resize', closeOpen);
  window.addEventListener('scroll', () => { if (current) placePop(current.pop, current.btn); }, true);

  /* ---- 設定鈕的標籤與「已篩選」狀態 ---------------------------------- */
  const setLabel = (btn, labelEl, text, filtered) => {
    if (labelEl) labelEl.textContent = text;
    btn.classList.toggle('is-filtered', !!filtered); // 藥丸鈕高亮
    btn.classList.toggle('has-value', !!filtered);    // vd-field 文字轉深色
  };

  /* ---- 掛載：把面板綁到鈕上 ------------------------------------------ */
  const attach = (btn, builder) => {
    if (!btn) return;
    // 取得 / 建立標籤元素（藥丸鈕自動把文字節點包進 .filter-label）
    let labelEl = btn.querySelector('.filter-label') || btn.querySelector('.vd-field-text');
    if (!labelEl) {
      const span = document.createElement('span');
      span.className = 'filter-label';
      const node = [...btn.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
      span.textContent = node ? node.textContent.trim() : '';
      if (node) btn.replaceChild(span, node); else btn.prepend(span);
      labelEl = span;
    }
    const placeholder = labelEl.textContent.trim();

    const pop = document.createElement('div');
    pop.className = 'filter-pop';
    pop.hidden = true;
    document.body.appendChild(pop);

    const api = builder({ pop, btn, labelEl, placeholder, setLabel, close: closeOpen, place: () => placePop(pop, btn) }) || {};

    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (current && current.btn === btn) { closeOpen(); return; }
      closeOpen();
      pop.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      btn.classList.add('is-open');
      current = { pop, btn };
      if (api.onOpen) api.onOpen();
      placePop(pop, btn);
    });
  };

  /* ====================================================================
   * 面板建構器
   * ================================================================= */

  /* 地點：洲 tile → 文教中心 ----------------------------------------- */
  const locationBuilder = () => ({ pop, btn, labelEl, placeholder, setLabel, close, place }) => {
    pop.classList.add('filter-pop--loc');
    pop.innerHTML = `
      <div class="fp-loc-page" data-page="zones">
        <p class="fp-title">選擇地區</p>
        <div class="fp-tile-grid"></div>
        <button type="button" class="fp-clear" data-clear>不限地區</button>
      </div>
      <div class="fp-loc-page" data-page="centers" hidden>
        <button type="button" class="fp-back">
          <span class="material-symbols-rounded text-[18px]">arrow_back</span>
          <span data-zone-name></span>
        </button>
        <ul class="fp-center-list"></ul>
      </div>`;
    const tileGrid = pop.querySelector('.fp-tile-grid');
    const centerList = pop.querySelector('.fp-center-list');
    const zoneName = pop.querySelector('[data-zone-name]');
    const showPage = (p) => pop.querySelectorAll('.fp-loc-page').forEach((el) => { el.hidden = el.dataset.page !== p; });

    tileGrid.innerHTML = ZONES.map((z, i) => `
      <button type="button" class="fp-tile" data-zone="${i}">
        <span class="material-symbols-rounded text-[22px]">public</span>
        <span class="fp-tile-name">${z.name}</span>
        <span class="fp-tile-count">${z.centers.length} 個據點</span>
      </button>`).join('');

    tileGrid.addEventListener('click', (e) => {
      const t = e.target.closest('.fp-tile'); if (!t) return;
      const z = ZONES[+t.dataset.zone];
      zoneName.textContent = z.name;
      centerList.innerHTML = z.centers.map((c) => `<li><button type="button" class="fp-center-item">${c}</button></li>`).join('');
      showPage('centers');
      place();
    });
    pop.querySelector('.fp-back').addEventListener('click', () => { showPage('zones'); place(); });
    centerList.addEventListener('click', (e) => {
      const it = e.target.closest('.fp-center-item'); if (!it) return;
      setLabel(btn, labelEl, it.textContent, true);
      close();
    });
    pop.querySelector('[data-clear]').addEventListener('click', () => {
      setLabel(btn, labelEl, placeholder, false);
      close();
    });
    return { onOpen: () => showPage('zones') };
  };

  /* 複選晶片（含「全部」預設）---------------------------------------- */
  const multiBuilder = (allLabel, options) => ({ pop, btn, labelEl, placeholder, setLabel, close }) => {
    pop.classList.add('filter-pop--multi');
    const selected = new Set();
    pop.innerHTML = `
      <div class="fp-chip-wrap">
        <button type="button" class="fp-chip is-all is-on" data-all>${allLabel}</button>
        ${options.map((o) => `<button type="button" class="fp-chip" data-v="${o}">${o}</button>`).join('')}
      </div>
      <div class="fp-actions">
        <button type="button" class="fp-reset">清除</button>
        <button type="button" class="fp-apply btn btn-neutral btn-sm rounded-full">套用</button>
      </div>`;
    const wrap = pop.querySelector('.fp-chip-wrap');
    const allBtn = wrap.querySelector('[data-all]');
    const sync = () => {
      allBtn.classList.toggle('is-on', selected.size === 0);
      wrap.querySelectorAll('.fp-chip[data-v]').forEach((c) => c.classList.toggle('is-on', selected.has(c.dataset.v)));
    };
    wrap.addEventListener('click', (e) => {
      const chip = e.target.closest('.fp-chip'); if (!chip) return;
      if (chip.hasAttribute('data-all')) selected.clear();
      else {
        const v = chip.dataset.v;
        selected.has(v) ? selected.delete(v) : selected.add(v);
      }
      sync();
    });
    pop.querySelector('.fp-reset').addEventListener('click', () => { selected.clear(); sync(); });
    pop.querySelector('.fp-apply').addEventListener('click', () => {
      if (selected.size === 0) setLabel(btn, labelEl, placeholder, false);
      else {
        const arr = [...selected];
        setLabel(btn, labelEl, arr.length === 1 ? arr[0] : `${arr[0]} +${arr.length - 1}`, true);
      }
      close();
    });
    sync();
    return {};
  };

  /* 單選清單（首項為「不限」預設）------------------------------------ */
  const singleBuilder = (options, defaultLabel) => ({ pop, btn, labelEl, placeholder, setLabel, close }) => {
    pop.classList.add('filter-pop--single');
    const all = [{ v: defaultLabel, def: true }, ...options.map((o) => ({ v: o, def: false }))];
    pop.innerHTML = `<ul class="fp-opt-list">${all.map((o, i) => `
      <li><button type="button" class="fp-opt${i === 0 ? ' is-on' : ''}" data-v="${o.v}" data-default="${o.def ? 1 : 0}">
        <span class="fp-opt-text">${o.v}</span>
        <span class="material-symbols-rounded fp-check text-[18px]">check</span>
      </button></li>`).join('')}</ul>`;
    pop.addEventListener('click', (e) => {
      const opt = e.target.closest('.fp-opt'); if (!opt) return;
      pop.querySelectorAll('.fp-opt').forEach((o) => o.classList.toggle('is-on', o === opt));
      const isDefault = opt.dataset.default === '1';
      setLabel(btn, labelEl, isDefault ? placeholder : opt.dataset.v, !isDefault);
      close();
    });
    return {};
  };

  /* 圖像化評價（愛心）------------------------------------------------ */
  const ratingBuilder = () => ({ pop, btn, labelEl, placeholder, setLabel }) => {
    pop.classList.add('filter-pop--rating');
    pop.innerHTML = `
      <p class="fp-title">評價篩選</p>
      <div class="fp-hearts" role="radiogroup" aria-label="最低評價">
        ${[1, 2, 3, 4, 5].map((v) => `
          <button type="button" class="fp-heart" data-v="${v}" aria-label="${v} 顆以上">
            <span class="material-symbols-rounded">favorite</span>
          </button>`).join('')}
      </div>
      <p class="fp-rating-label">不限評價</p>
      <button type="button" class="fp-reset">清除</button>`;
    const hearts = [...pop.querySelectorAll('.fp-heart')];
    const lab = pop.querySelector('.fp-rating-label');
    let value = 0;
    const paint = (n) => hearts.forEach((h, i) => h.classList.toggle('is-on', i < n));
    hearts.forEach((h, i) => {
      h.addEventListener('mouseenter', () => paint(i + 1));
      h.addEventListener('click', () => {
        value = i + 1;
        paint(value);
        lab.textContent = `${value} 顆以上`;
        setLabel(btn, labelEl, `${value}★ 以上`, true);
      });
    });
    pop.querySelector('.fp-hearts').addEventListener('mouseleave', () => paint(value));
    pop.querySelector('.fp-reset').addEventListener('click', () => {
      value = 0; paint(0); lab.textContent = '不限評價';
      setLabel(btn, labelEl, placeholder, false);
    });
    return {};
  };

  /* 日期：Cally 日曆 ------------------------------------------------- */
  const dateBuilder = () => ({ pop, btn, labelEl, placeholder, setLabel, close }) => {
    pop.classList.add('filter-pop--date');
    pop.innerHTML = `
      <calendar-date class="cally">
        <svg aria-label="上一月" class="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg>
        <svg aria-label="下一月" class="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg>
        <calendar-month></calendar-month>
      </calendar-date>
      <button type="button" class="fp-reset">清除</button>`;
    const cal = pop.querySelector('calendar-date');
    cal.addEventListener('change', () => {
      if (cal.value) { setLabel(btn, labelEl, cal.value.replaceAll('-', '/'), true); close(); }
    });
    pop.querySelector('.fp-reset').addEventListener('click', () => {
      cal.value = '';
      setLabel(btn, labelEl, placeholder, false);
      close();
    });
    return {};
  };

  /* ====================================================================
   * 依頁面掛載
   * ================================================================= */
  const isLib = !!document.getElementById('library-grid');
  const isArt = !!document.getElementById('artifact-grid');
  const isEv = !!document.getElementById('events-grid');
  const $ = (id) => document.getElementById(id);

  if (isLib) {
    attach($('filter-category-btn'), multiBuilder('全部分類',
      ['文學小說', '人文社科', '商業理財', '藝術設計', '生活風格', '自然科普', '親子兒少', '學習專業']));
    attach($('filter-format-btn'), singleBuilder(['實體書', '電子書'], '不限'));
    attach($('filter-rating-btn'), ratingBuilder());
    attach($('filter-site-btn'), locationBuilder());
  }

  if (isArt) {
    attach($('filter-center-btn'), locationBuilder());
    attach($('filter-category-btn'), multiBuilder('全部分類',
      ['慶典陣頭', '傳統樂器', '服飾裝扮', '文化體驗']));
    attach($('art-time-btn'), dateBuilder());
  }

  if (isEv) {
    attach($('filter-region-btn'), locationBuilder());
    attach($('filter-type-btn'), multiBuilder('全部類型',
      ['文化活動', '語言學習', '產業研習', '親子活動', '青年服務', '藝文活動', '師資培訓', '政策交流']));
    attach($('filter-status-btn'), multiBuilder('全部狀態',
      ['報名中', '即將截止', '額滿候補', '已截止']));
    attach($('ev-date-btn'), dateBuilder());
  }
})();
