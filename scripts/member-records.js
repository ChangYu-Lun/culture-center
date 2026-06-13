/* =============================================================================
 * member-records.js — 申請紀錄
 *   - 四個分頁：書籍借閱 / 活動報名 / 文物出借 / 場地租借
 *   - 每筆紀錄一張卡片：縮圖 + 標題 + 標籤 + 日期欄位 + 狀態徽章 + 操作鈕
 *   - 狀態徽章依語意上色（badge-soft badge-{neutral,info,warning,success,error}）
 * ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('rec-list');
  const tabs = document.getElementById('rec-tabs');
  if (!list || !tabs) return;

  // 完整字面值，確保 Tailwind/daisyUI 能掃描並產出對應 badge 樣式
  const STATUS = {
    候補:   'badge-soft badge-neutral',
    審核中: 'badge-soft badge-neutral',
    待審核: 'badge-soft badge-neutral',
    已報名: 'badge-soft badge-info',
    已確認: 'badge-soft badge-info',
    未領退: 'badge-soft badge-warning',
    出借中: 'badge-soft badge-warning',
    使用中: 'badge-soft badge-warning',
    已歸還: 'badge-soft badge-success',
    已完成: 'badge-soft badge-success',
    已取消: 'badge-soft badge-error',
  };
  const statusClass = (text) => STATUS[text.replace(/\s*\d+$/, '')] || 'badge-soft badge-neutral';

  const IMG = './assets/image/';
  const TABS = {
    book: {
      info: '書籍資訊', detail: '申請細節', col1: '租借日期', col2: '到期日期', fit: 'contain',
      items: [
        { title: '台灣光華雜誌 2025 9月號', img: 'book-1.png', badges: ['電子書', '文化輔助'], d1: '2025.05.06', d2: '2025.06.06', status: '候補 2' },
        { title: '老師的話', img: 'book-3.png', badges: ['紙本書', '文化輔助'], d1: '2025.05.06', d2: '2025.06.06', status: '未領退' },
        { title: '來學華語(法文版)第一冊', img: 'book-2.png', badges: ['電子書', '外語教材'], d1: '2025.05.06', d2: '2025.06.06', status: '已歸還' },
        { title: '台灣光華雜誌 2025 10月號', img: 'book-4.png', badges: ['紙本書', '外語教材'], d1: '2025.04.18', d2: '2025.05.18', status: '已歸還' },
      ],
    },
    event: {
      info: '活動資訊', detail: '報名細節', col1: '報名日期', col2: '活動日期', fit: 'cover',
      items: [
        { title: '115年海外數位華語文推廣計畫菲律賓暨大洋洲組初階班', img: 'event-1.png', badges: ['語文研習', '線上'], d1: '2025.05.06', d2: '2025.07.01', status: '已報名' },
        { title: '2026年僑臺商智慧農業研習班', img: 'event-2.png', badges: ['產業交流', '實體'], d1: '2025.05.02', d2: '2025.06.20', status: '候補' },
        { title: '2026海內外客家後生交流營', img: 'event-3.png', badges: ['青年交流', '實體'], d1: '2025.03.11', d2: '2025.04.28', status: '已完成' },
        { title: '海外華裔青年英語服務營 志工招募', img: 'event-1.png', badges: ['志工', '實體'], d1: '2025.02.20', d2: '2025.03.15', status: '已取消' },
      ],
    },
    artifact: {
      info: '文物資訊', detail: '申請細節', col1: '出借日期', col2: '歸還日期', fit: 'cover',
      items: [
        { title: '青花纏枝蓮紋瓷瓶（仿製教學品）', img: 'image 26.png', badges: ['陶瓷', '教學展示'], d1: '2025.05.06', d2: '2025.06.06', status: '出借中' },
        { title: '客家藍衫服飾組', img: 'Venue-02.png', badges: ['織品', '文化推廣'], d1: '2025.04.30', d2: '2025.05.30', status: '審核中' },
        { title: '原住民族傳統樂器（口簧琴）', img: 'Venue-01.png', badges: ['樂器', '教學展示'], d1: '2025.03.18', d2: '2025.04.18', status: '已歸還' },
      ],
    },
    venue: {
      info: '場地資訊', detail: '申請細節', col1: '租借日期', col2: '使用日期', fit: 'cover',
      items: [
        { title: '洛杉磯華僑文教服務中心 · 第二教室', img: 'venue-detail-1.png', badges: ['教室', '時租'], d1: '2025.05.06', d2: '2025.06.06', status: '已確認' },
        { title: '多功能藝文展演廳', img: 'image 26.png', badges: ['展演廳', '日租'], d1: '2025.05.02', d2: '2025.06.18', status: '待審核' },
        { title: '文化交流會議室', img: 'Venue-02.png', badges: ['會議室', '時租'], d1: '2025.04.22', d2: '2025.05.10', status: '已完成' },
      ],
    },
  };

  const fitClass = (fit) => fit === 'contain' ? 'w-full h-full object-contain p-1.5' : 'w-full h-full object-cover';

  const cardHTML = (cfg, it) => `
    <article class="rec-card card bg-base-100 rounded-box shadow-sm">
      <div class="card-body p-0">
        <div class="flex gap-4 p-4">
          <div class="rec-thumb"><img src="${IMG}${it.img}" alt="${it.title}" class="${fitClass(cfg.fit)}" /></div>
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-base leading-snug">${it.title}</h3>
            <div class="flex flex-wrap gap-1.5 mt-1.5">
              ${it.badges.map((b, i) => `<span class="badge badge-sm ${i === 0 ? 'badge-soft badge-info' : 'badge-soft badge-neutral'}">${b}</span>`).join('')}
            </div>
            <div class="flex flex-wrap gap-x-10 gap-y-3 mt-4">
              <div><p class="text-xs text-base-content/50 mb-0.5">${cfg.col1}</p><p class="text-sm">${it.d1}</p></div>
              <div><p class="text-xs text-base-content/50 mb-0.5">${cfg.col2}</p><p class="text-sm">${it.d2}</p></div>
              <div><p class="text-xs text-base-content/50 mb-0.5">狀態</p><span class="badge badge-sm ${statusClass(it.status)}">${it.status}</span></div>
            </div>
          </div>
        </div>
        <div class="border-t border-base-content/10 px-4 py-3 flex gap-1">
          <button type="button" class="btn btn-sm btn-ghost rounded-full">${cfg.info}</button>
          <button type="button" class="btn btn-sm btn-ghost rounded-full text-primary">${cfg.detail}</button>
        </div>
      </div>
    </article>`;

  const render = (key) => {
    const cfg = TABS[key];
    list.innerHTML = cfg.items.map((it) => cardHTML(cfg, it)).join('');
  };

  tabs.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab]');
    if (!tab) return;
    tabs.querySelectorAll('[data-tab]').forEach((t) => t.classList.toggle('tab-active', t === tab));
    render(tab.dataset.tab);
  });

  render('book');
});
