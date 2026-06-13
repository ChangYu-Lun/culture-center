/* =============================================================================
 * venue-detail.js — 場地詳情頁互動
 *   - 時租 / 日租 切換（segmented toggle）
 *   - 日期（datepicker）＋ 起訖時間（下拉選單，格式 上午/下午 XX:XX）
 *   - 選擇日期 / 時間後，下方「可預約時段時間軸」與「租金明細」即時更新
 *   - 空間介紹「顯示更多內容」展開 / 收合
 *   - 儲存（收藏）切換（填色星號）
 * ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ====================== 預約面板（日期 / 時間 / 時間軸 / 租金）========= */
  const OPEN = { start: 8, end: 22 };          // 開放時段 08:00 - 22:00（共 14 小時）
  const RATE = { hour: 25, day: 180 };         // 時租 / 日租（USD）
  let mode = 'hour';

  const $ = (id) => document.getElementById(id);
  const calEl = $('vd-cal'), dateLabel = $('vd-date-label'), startEl = $('vd-start'), endEl = $('vd-end');
  const timeline = $('vd-timeline'), ticks = $('vd-ticks'), timeRow = $('vd-time-row');
  const unitPrice = $('vd-unit-price'), unitLabel = $('vd-unit-label');
  const sumLine = $('vd-sum-line'), sumAmount = $('vd-sum-amount'), totalEl = $('vd-total');

  // 預約面板存在時才啟用（其他頁面共用本檔時安全略過）
  if (calEl && startEl && endEl && timeline) {
    const money = (n) => `$${n.toFixed(2)} USD`;
    const fmt12 = (h) => `${h < 12 ? '上午' : '下午'} ${String(h).padStart(2, '0')}:00`;
    const fmt24 = (h) => `${String(h).padStart(2, '0')}:00`;

    // 依日期決定「不可預約」時段（雛形：以日期決定的固定樣式，讓不同日期呈現不同檔期）
    const bookedSet = (dateStr) => {
      const patterns = [[10, 17, 18], [11, 12, 16], [9, 10, 15, 16], [8, 13, 14, 19], [12, 13, 20, 21]];
      const d = new Date(`${dateStr || ''}T00:00:00`);
      const day = isNaN(d.getTime()) ? 6 : d.getDate();
      return new Set(patterns[day % patterns.length]);
    };

    const addOption = (sel, h) => {
      const o = document.createElement('option');
      o.value = h;
      o.textContent = fmt12(h);
      sel.appendChild(o);
    };

    // 開始時間選單：排除「不可預約」時段（不能在已被預約的時段起租）
    const fillStart = (booked, want) => {
      const vals = [];
      for (let h = OPEN.start; h < OPEN.end; h++) if (!booked.has(h)) vals.push(h);
      startEl.innerHTML = '';
      vals.forEach((h) => addOption(startEl, h));
      const start = vals.includes(want) ? want : vals[0];
      startEl.value = start;
      return start;
    };

    // 結束時間選單：上限為「開始時間之後的第一個不可預約時段」，
    // 確保整段 [開始, 結束) 連續且不跨越任何不可預約時段
    const fillEnd = (booked, start, want) => {
      let endMax = OPEN.end;
      for (let h = start + 1; h <= OPEN.end; h++) { if (booked.has(h)) { endMax = h; break; } }
      const vals = [];
      for (let h = start + 1; h <= endMax; h++) vals.push(h);
      endEl.innerHTML = '';
      vals.forEach((h) => addOption(endEl, h));
      const end = (want > start && want <= endMax) ? want : vals[0];
      endEl.value = end;
      return end;
    };

    const render = () => {
      const booked = bookedSet(calEl.value);
      let start = Number(startEl.value);
      let end = Number(endEl.value);
      if (end <= start) { end = start + 1; endEl.value = end; }

      // 時間軸：每小時一格，已選擇(綠) > 不可預約(白) > 可預約(base-300)
      timeline.innerHTML = '';
      const types = [];
      for (let h = OPEN.start; h < OPEN.end; h++) {
        let t;
        if (booked.has(h)) t = 'booked';
        else if (mode === 'day' || (h >= start && h < end)) t = 'selected';
        else t = 'available';
        types.push(t);
        const span = document.createElement('span');
        span.style.gridColumn = String(h - OPEN.start + 1);
        span.className = t === 'selected' ? 'bg-primary' : t === 'booked' ? 'bg-base-100' : 'bg-base-300';
        timeline.appendChild(span);
      }

      // 邊界刻度：起點、每次顏色變化處、終點
      ticks.innerHTML = '';
      const span14 = OPEN.end - OPEN.start;
      const addTick = (h) => {
        const s = document.createElement('span');
        s.className = 'vd-tick';
        s.style.left = `${((h - OPEN.start) / span14) * 100}%`;
        s.textContent = String(h);
        ticks.appendChild(s);
      };
      addTick(OPEN.start);
      for (let i = 1; i < types.length; i++) if (types[i] !== types[i - 1]) addTick(OPEN.start + i);
      addTick(OPEN.end);

      // 租金
      if (mode === 'day') {
        unitPrice.textContent = money(RATE.day);
        unitLabel.textContent = '/日';
        sumLine.textContent = `${money(RATE.day)} x 1 日（全日）`;
        sumAmount.textContent = money(RATE.day);
        totalEl.textContent = money(RATE.day);
      } else {
        unitPrice.textContent = money(RATE.hour);
        unitLabel.textContent = '/小時';
        // 選單已排除不可預約時段，故 [開始, 結束) 必為連續可預約時段
        const hrs = end - start;
        const amt = hrs * RATE.hour;
        sumLine.textContent = `${money(RATE.hour)} x ${hrs} 小時（${fmt24(start)}-${fmt24(end)}）`;
        sumAmount.textContent = money(amt);
        totalEl.textContent = money(amt);
      }
    };

    // 初始：預設 13:00–16:00（對應設計稿；選單已排除當日不可預約時段）
    {
      const booked = bookedSet(calEl.value);
      const s = fillStart(booked, 13);
      fillEnd(booked, s, 16);
    }
    render();

    startEl.addEventListener('change', () => {
      // 開始時間變動 → 重算可選的結束時間（不得跨越不可預約時段）
      fillEnd(bookedSet(calEl.value), Number(startEl.value), Number(endEl.value));
      render();
    });
    endEl.addEventListener('change', render);

    // Cally 日曆：選擇日期後更新標籤、收合彈出層，並依當日檔期重建可選時段
    calEl.addEventListener('change', () => {
      if (dateLabel) dateLabel.textContent = (calEl.value || '').replaceAll('-', '/') || '選擇日期';
      document.getElementById('vd-cal-popover')?.hidePopover?.();
      const booked = bookedSet(calEl.value);
      const s = fillStart(booked, Number(startEl.value));
      fillEnd(booked, s, Number(endEl.value));
      render();
    });

    /* ---- 時租 / 日租 切換 ---------------------------------------------- */
    const rateToggle = $('vd-rate-toggle');
    if (rateToggle) {
      rateToggle.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-rate]');
        if (!btn) return;
        mode = btn.dataset.rate;
        rateToggle.querySelectorAll('[data-rate]').forEach((t) => {
          const on = t === btn;
          t.classList.toggle('is-active', on);
          t.classList.toggle('bg-base-100', on);
          t.classList.toggle('shadow-sm', on);
          t.classList.toggle('text-base-content/50', !on);
          t.setAttribute('aria-selected', String(on));
        });
        // 日租：起訖時間不適用，淡化並停用
        timeRow.classList.toggle('opacity-50', mode === 'day');
        timeRow.classList.toggle('pointer-events-none', mode === 'day');
        render();
      });
    }
  }

  /* ====================== 空間介紹：顯示更多 / 收合 ===================== */
  const more = document.getElementById('vd-more');
  const intro = document.getElementById('vd-intro');
  if (more && intro) {
    more.addEventListener('click', () => {
      const open = intro.classList.toggle('is-open');
      more.setAttribute('aria-expanded', String(open));
      more.textContent = open ? '收合內容' : '顯示更多內容';
    });
  }

  /* ====================== 儲存（收藏）切換 ============================= */
  const save = document.getElementById('vd-save');
  if (save) {
    const icon = save.querySelector('[data-save-icon]');
    save.addEventListener('click', () => {
      const on = save.getAttribute('aria-pressed') !== 'true';
      save.setAttribute('aria-pressed', String(on));
      icon.style.fontVariationSettings = on
        ? '"FILL" 1, "wght" 500, "GRAD" 0, "opsz" 24'
        : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24';
      icon.classList.toggle('text-accent-alt', on);
    });
  }

});
