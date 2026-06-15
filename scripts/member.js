/* =============================================================================
 * member.js — 會員總覽：我的行事曆（FullCalendar v7）
 *   - 四種事件類型各自顏色：圖書借還 / 場地使用 / 僑務活動 / 文物借還
 *   - 可切換 月 / 週 / 天 / 清單 檢視
 *   - 點擊事件開啟 daisyUI Modal 顯示概要資訊
 *   - 視覺風格貼近本專案（樣式見 page.css 的 FullCalendar 主題覆蓋）
 * ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('member-calendar');
  if (!el || typeof FullCalendar === 'undefined') return;

  /* ---- 事件類型與顏色 ------------------------------------------------- */
  const TYPES = {
    book:     { label: '圖書借還', color: '#2f7a4f' },
    venue:    { label: '場地使用', color: '#1f6f8b' },
    event:    { label: '僑務活動', color: '#c05621' },
    artifact: { label: '文物借還', color: '#8a3a72' },
  };

  /* ---- 圖例 ---------------------------------------------------------- */
  const legend = document.getElementById('member-calendar-legend');
  if (legend) {
    legend.innerHTML = Object.values(TYPES).map((t) =>
      `<span class="inline-flex items-center gap-1.5"><span class="inline-block size-3 rounded-[4px]" style="background:${t.color}"></span>${t.label}</span>`
    ).join('');
  }

  /* ---- 示範事件（2026 年 6 月）-------------------------------------- */
  const raw = [
    { type: 'book',     title: '《台灣光華雜誌》可取書通知', start: '2026-06-10', allDay: true,
      location: '菲華文教服務中心 圖書區', note: '預約書籍已到館，請於 7 日內持 i僑卡至櫃台取書。' },
    { type: 'book',     title: '《來學華語》續借截止', start: '2026-06-08', allDay: true,
      location: '線上會員系統', note: '可於到期前一日上線辦理續借一次（14 天）。' },
    { type: 'book',     title: '《老師的話》借閱到期', start: '2026-06-15', allDay: true,
      location: '菲華文教服務中心 圖書區', note: '請於到期日前歸還，逾期將暫停借閱權益。' },
    { type: 'event',    title: '青年僑生交流會', start: '2026-06-13T10:00:00', end: '2026-06-13T12:00:00',
      location: '洛杉磯華僑文教服務中心 大禮堂', note: '海內外青年面對面交流，現場備有茶點。' },
    { type: 'venue',    title: '第二教室 場地使用', start: '2026-06-18T13:00:00', end: '2026-06-18T16:00:00',
      location: '洛杉磯華僑文教服務中心 · 第二教室', note: '時租 3 小時，請提早 10 分鐘報到並出示預約證明。' },
    { type: 'event',    title: '端午文化講座', start: '2026-06-20T14:00:00', end: '2026-06-20T16:00:00',
      location: '舊金山華僑文教中心', note: '主題：節慶民俗與僑鄉記憶，名額有限。' },
    { type: 'venue',    title: '多功能藝文展演廳 彩排', start: '2026-06-22T09:00:00', end: '2026-06-22T12:00:00',
      location: '駐溫哥華辦事處 藝文廳', note: '社團年度成果發表前置彩排。' },
    { type: 'artifact', title: '文物《青花瓷瓶》歸還', start: '2026-06-25', allDay: true,
      location: '文物典藏組', note: '借展文物歸還日，請確認包裝完整並完成點交。' },
    { type: 'event',    title: '僑務委員會線上座談', start: '2026-06-28T19:00:00', end: '2026-06-28T20:30:00',
      location: '線上視訊（Webex）', note: '會前一日將以 email 寄送會議連結。' },
    // 6/13 多筆事件：示範「+N 更多」→ 點擊切換到當日「日」視圖
    { type: 'venue',    title: '大禮堂 場佈', start: '2026-06-13T08:00:00', end: '2026-06-13T09:30:00',
      location: '洛杉磯華僑文教服務中心 大禮堂', note: '交流會前場地佈置。' },
    { type: 'book',     title: '《剪紙藝術》到期', start: '2026-06-13', allDay: true,
      location: '菲華文教服務中心 圖書區', note: '請於到期日前歸還。' },
    { type: 'event',    title: '志工行前說明會', start: '2026-06-13T13:30:00', end: '2026-06-13T14:30:00',
      location: '洛杉磯華僑文教服務中心 第一教室', note: '當日協助活動之志工請出席。' },
    { type: 'artifact', title: '文物《織錦》點交', start: '2026-06-13T15:00:00', end: '2026-06-13T16:00:00',
      location: '文物典藏組', note: '借展文物點交。' },
  ];

  const events = raw.map((e) => ({
    title: e.title,
    start: e.start,
    end: e.end,
    allDay: !!e.allDay,
    extendedProps: { type: e.type, typeLabel: TYPES[e.type].label, color: TYPES[e.type].color, location: e.location, note: e.note },
  }));

  /* ---- Modal -------------------------------------------------------- */
  const modal = document.getElementById('event-modal');
  const pad = (n) => String(n).padStart(2, '0');
  const fmtDate = (d) => `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}（${'日一二三四五六'[d.getDay()]}）`;
  const fmtTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const openModal = (ev) => {
    const p = ev.extendedProps;
    document.getElementById('em-dot').style.backgroundColor = p.color;
    document.getElementById('em-type').textContent = p.typeLabel;
    document.getElementById('em-title').textContent = ev.title;
    document.getElementById('em-date').textContent = fmtDate(ev.start);
    const timeRow = document.getElementById('em-time-row');
    if (ev.allDay) {
      timeRow.hidden = true;
    } else {
      timeRow.hidden = false;
      const endTxt = ev.end ? `–${fmtTime(ev.end)}` : '';
      document.getElementById('em-time').textContent = `${fmtTime(ev.start)}${endTxt}`;
    }
    document.getElementById('em-loc').textContent = p.location || '—';
    document.getElementById('em-note').textContent = p.note || '';
    if (modal && modal.showModal) modal.showModal();
  };

  /* ---- FullCalendar ------------------------------------------------- */
  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
  const DESKTOP_RIGHT = 'dayGridMonth,timeGridWeek,timeGridDay,listMonth';
  const mobileToolbar  = { left: 'prev,next', center: 'title', right: 'today' };
  const desktopToolbar = { left: 'prev,next', center: 'title', right: 'today ' + DESKTOP_RIGHT };

  const calendar = new FullCalendar.Calendar(el, {
    initialView: 'dayGridMonth',
    initialDate: '2026-06-13',
    locale: 'zh-tw',
    height: 'auto',
    firstDay: 0,
    headerToolbar: isMobile() ? mobileToolbar : desktopToolbar,
    buttonText: { today: '今天', month: '月', week: '週', day: '天', list: '清單' },
    // 一天事件過多時收合為「+N 更多」，點擊切換到該日「日」視圖檢視全部
    dayMaxEvents: 3,
    moreLinkClick: 'timeGridDay',
    moreLinkContent: (arg) => '+' + arg.num + ' 更多',
    nowIndicator: true,
    events,
    // v7 以 --fc-event-color 變數決定事件顏色：依類型逐一設定
    eventDidMount(info) {
      const c = info.event.extendedProps.color;
      if (c) info.el.style.setProperty('--fc-event-color', c);
    },
    eventClick(info) {
      info.jsEvent.preventDefault();
      openModal(info.event);
    },
  });
  calendar.render();

  /* ---- 行動版檢視切換 <select>（注入 legend 列右側）------------------ */
  const legendEl = document.getElementById('member-calendar-legend');
  if (legendEl) {
    const sel = document.createElement('select');
    sel.id = 'fc-view-select';
    sel.className = 'select select-sm';
    sel.setAttribute('aria-label', '切換視圖');
    [['dayGridMonth','月'],['timeGridWeek','週'],['timeGridDay','天'],['listMonth','活動列表']]
      .forEach(([v, t]) => {
        const o = document.createElement('option');
        o.value = v; o.textContent = t;
        sel.appendChild(o);
      });
    sel.value = calendar.view.type;
    sel.addEventListener('change', () => calendar.changeView(sel.value));
    calendar.on('viewDidMount', ({ view }) => { sel.value = view.type; });
    legendEl.appendChild(sel);
  }

  /* ---- 視口切換：mobile ↔ desktop toolbar -------------------------- */
  const mq = window.matchMedia('(max-width: 767px)');
  const syncToolbar = () => {
    calendar.setOption('headerToolbar', mq.matches ? mobileToolbar : desktopToolbar);
  };
  mq.addEventListener('change', syncToolbar);
});
