/* =============================================================================
 * components.js — 共用版面元件（Web Components）
 * -----------------------------------------------------------------------------
 * 把 site-header / footer / 浮動面板「元件化」，確保每一頁長得一模一樣，
 * 單一真實來源（以首頁版本為準）。各頁只需放對應自訂標籤即可：
 *   <site-header active="venue"></site-header>
 *   <site-footer></site-footer>
 *   <side-panel></side-panel>
 *
 * 採「light DOM」渲染（innerHTML），維持既有 CSS（page.css / dist）與 main.js
 * 以 #site-header / #nav-spacer 等選取器運作；自訂標籤本身 display:contents，
 * 不影響版面（樣式見 page.css）。
 *
 * 載入順序：本檔需在 main.js 之前載入，元件於 DOMContentLoaded 前就完成注入。
 * ========================================================================== */

/* ---- 共用導覽列 ------------------------------------------------------------
 * active 屬性對應主選單的 data-nav：library / folk / venue / events
 * -------------------------------------------------------------------------- */
class SiteHeader extends HTMLElement {
  connectedCallback() {
    const active = this.getAttribute('active') || '';
    const navItem = (key, href, label) => {
      const cur = key === active ? ' aria-current="page"' : '';
      return `<a data-nav="${key}" href="${href}" class="btn btn-ghost btn-sm xl:btn-md rounded-full font-medium"${cur}>${label}</a>`;
    };

    const mobileItem = (key, href, label) => {
      const cur = key === active ? ' aria-current="page"' : '';
      return `<a data-nav="${key}" href="${href}" class="py-2.5 px-2 font-medium"${cur}>${label}</a>`;
    };

    /* 登入狀態（以 localStorage 模擬）：未登入顯示「登入」鈕，已登入顯示頭像選單 */
    let loggedIn = false, userName = '會員';
    try {
      loggedIn = localStorage.getItem('cc-logged-in') === '1';
      userName = localStorage.getItem('cc-user-name') || '會員';
    } catch (_) {}
    const initial = userName.slice(0, 1);

    const authNode = (btnSize) => loggedIn
      ? `<div class="dropdown dropdown-end">
           <div tabindex="0" role="button" class="btn btn-ghost btn-circle" aria-label="會員選單">
             <span class="flex items-center justify-center w-9 h-9 rounded-full bg-neutral text-neutral-content font-medium">${initial}</span>
           </div>
           <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box shadow-lg mt-2 w-44 z-50 p-2">
             <li><a href="./member.html">會員總覽</a></li>
             <li><a href="./member-records.html">申請紀錄</a></li>
             <li><a href="./member-favorites.html">我的收藏</a></li>
             <li><a href="./member-notifications.html">會員通知</a></li>
             <li><a href="./member-profile.html">會員資料</a></li>
             <li><div class="divider my-1"></div></li>
             <li><button type="button" data-logout>會員登出</button></li>
           </ul>
         </div>`
      : `<a href="./login.html" class="btn btn-neutral ${btnSize} rounded-full px-6">登入</a>`;

    this.innerHTML = `
      <header id="site-header" class="navbar-wrapper fixed top-0 left-0 right-0 z-40">
        <div class="page-container flex items-center justify-between gap-4 py-4">
          <a href="./index.html" class="shrink-0">
            <img src="./assets/image/Logo-light.svg" alt="中華民國僑務委員會 海外文教中心數位服務平台" class="h-12 md:h-[58px] w-auto" />
          </a>

          <!-- 桌面選單（≥ lg）-->
          <div class="hidden lg:flex flex-col items-end gap-2">
            <div class="flex items-center gap-4 text-sm">
              <a href="./index.html#news" class="link link-hover text-base-content/70">最新消息</a>
              <a href="#" class="link link-hover text-base-content/70">網站導覽</a>
              <span class="text-base-content/20">|</span>
              <button class="flex items-center gap-1 text-base-content/70 hover:text-base-content">
                <span class="material-symbols-rounded text-[18px]">language</span>
                <span>中文 TW</span>
              </button>
            </div>

            <nav class="flex items-center gap-1 xl:gap-2">
              ${navItem('library', './library.html', '圖書借閱')}
              ${navItem('folk', './artifact.html', '民俗文物')}
              ${navItem('venue', './venue.html', '場地預約')}
              ${navItem('events', './events.html', '僑務活動')}
              ${authNode('btn-sm xl:btn-md')}
            </nav>
          </div>

          <!-- 右側：登入/頭像 + 漢堡（< lg）-->
          <div class="flex items-center gap-2 lg:hidden">
            ${authNode('btn-sm')}
            <button type="button" id="nav-toggle" class="btn btn-ghost btn-circle" aria-label="開啟選單" aria-expanded="false" aria-controls="mobile-menu">
              <span class="material-symbols-rounded text-[28px]" id="nav-toggle-icon">menu</span>
            </button>
          </div>
        </div>

        <!-- 行動版選單面板（< lg）：僅放主選單與工具連結，登入/頭像留在 navbar -->
        <div id="mobile-menu" class="lg:hidden hidden border-t border-base-content/10 bg-base-100">
          <nav class="page-container flex flex-col py-3">
            ${mobileItem('library', './library.html', '圖書借閱')}
            ${mobileItem('folk', './artifact.html', '民俗文物')}
            ${mobileItem('venue', './venue.html', '場地預約')}
            ${mobileItem('events', './events.html', '僑務活動')}
            <div class="divider my-2 before:bg-base-content/10 after:bg-base-content/10"></div>
            <a href="./index.html#news" class="py-2.5 px-2 text-base-content/70">最新消息</a>
            <a href="#" class="py-2.5 px-2 text-base-content/70">網站導覽</a>
            <button class="flex items-center gap-1 py-2.5 px-2 text-base-content/70">
              <span class="material-symbols-rounded text-[18px]">language</span><span>中文 TW</span>
            </button>
          </nav>
        </div>
      </header>
      <div id="nav-spacer" aria-hidden="true"></div>`;

    /* 漢堡選單開合 */
    const toggle = this.querySelector('#nav-toggle');
    const menu = this.querySelector('#mobile-menu');
    const icon = this.querySelector('#nav-toggle-icon');
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('hidden') === false;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
        icon.textContent = open ? 'close' : 'menu';
      });
    }

    /* 登出 */
    this.addEventListener('click', (e) => {
      if (e.target.closest('[data-logout]')) {
        try { localStorage.removeItem('cc-logged-in'); } catch (_) {}
        window.location.href = './index.html';
      }
    });
  }
}

/* ---- 共用頁尾 ------------------------------------------------------------ */
class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="bg-neutral text-neutral-content">
        <div class="page-container py-16">
          <div class="flex flex-col items-start gap-8">
            <img src="./assets/image/Logo-dark.svg" alt="中華民國僑務委員會 海外文教中心數位服務平台" class="self-start h-[58px] w-auto" />

            <div class="flex flex-col gap-2 text-base text-neutral-content/90">
              <p class="flex items-center gap-2"><span class="material-symbols-rounded text-[18px]">location_on</span>10055台北市徐州路五號三、十五、十六、十七樓</p>
              <p class="flex items-center gap-2"><span class="material-symbols-rounded text-[18px]">call</span>886-2-2327-2600（週一至週五 08:30~17:30）</p>
              <p class="flex items-center gap-2"><span class="material-symbols-rounded text-[18px]">print</span>886-2-2356-6354</p>
            </div>

            <div class="flex items-center gap-3">
              <a href="#" class="social-link" aria-label="Facebook"><img src="./assets/icon/Facebook.svg" alt="Facebook" /></a>
              <a href="#" class="social-link" aria-label="Line"><img src="./assets/icon/Line.svg" alt="Line" /></a>
              <a href="#" class="social-link" aria-label="Youtube"><img src="./assets/icon/Youtube.svg" alt="Youtube" /></a>
              <a href="#" class="social-link" aria-label="Instagram"><img src="./assets/icon/Instagram.svg" alt="Instagram" /></a>
              <a href="#" class="social-link" aria-label="X"><img src="./assets/icon/X.svg" alt="X" /></a>
            </div>

            <div class="divider before:bg-neutral-content/20 after:bg-neutral-content/20 my-0"></div>

            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-neutral-content/80">
              <p>Copyright © 中華民國僑務委員會・Overseas Community Affairs Council, R.O.C. (TAIWAN)</p>
              <div class="flex items-center gap-6">
                <a href="#" class="link link-hover">隱私權及安全政策</a>
                <img src="./assets/image/image 11.png" alt="無障礙網站標章 2.1" class="h-11 w-auto" />
              </div>
            </div>
          </div>
        </div>
      </footer>`;
  }
}

/* ---- 共用浮動快捷面板 ---------------------------------------------------- */
class SidePanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <aside class="quick-panel">
        <button class="quick-item" type="button">
          <span class="quick-icon"><span class="material-symbols-rounded">manage_search</span></span>
          <span class="quick-label">檔期查詢</span>
        </button>
        <button class="quick-item" type="button">
          <span class="quick-icon"><span class="material-symbols-rounded">calendar_month</span></span>
          <span class="quick-label">近期活動</span>
        </button>
        <div class="quick-divider"></div>
        <button class="btn btn-circle btn-neutral btn-ghost btn-sm" id="back-to-top" aria-label="回到頂部">
          <span class="material-symbols-rounded text-[20px]">keyboard_arrow_up</span>
        </button>
      </aside>`;
  }
}

/* ---- 會員專區導覽（側邊選單 lg + 底部 Dock < lg）------------------------
 * 五頁共用：以 active 屬性標示當前頁；會員通知有未讀時於選單加紅點。
 * 未讀狀態以 localStorage 'cc-unread' 模擬（預設視為有未讀）。
 * -------------------------------------------------------------------------- */
class MemberNav extends HTMLElement {
  connectedCallback() {
    const active = this.getAttribute('active') || '';
    let unread = true;
    try { unread = localStorage.getItem('cc-unread') !== '0'; } catch (_) {}
    const dot = unread
      ? '<span class="inline-block size-2 rounded-full bg-error" aria-label="有未讀通知"></span>'
      : '';

    const items = [
      { key: 'overview',      href: './member.html',               icon: 'grid_view',    label: '會員總覽', short: '總覽' },
      { key: 'records',       href: './member-records.html',       icon: 'receipt_long', label: '申請紀錄', short: '紀錄' },
      { key: 'favorites',     href: './member-favorites.html',     icon: 'favorite',     label: '我的收藏', short: '收藏' },
      { key: 'notifications', href: './member-notifications.html', icon: 'notifications', label: '會員通知', short: '通知', badge: true },
      { key: 'profile',       href: './member-profile.html',       icon: 'person',       label: '會員資料', short: '資料' },
    ];

    const menu = items.map((it) => {
      const cur = it.key === active ? ' is-active' : '';
      const badge = it.badge ? dot : '';
      return `<a href="${it.href}" class="member-menu-item flex items-center justify-between gap-2${cur}">
        <span>${it.label}</span>${badge}
      </a>`;
    }).join('');

    const dock = items.map((it) => {
      const cur = it.key === active ? ' class="dock-active"' : '';
      const badge = it.badge && unread
        ? '<span class="absolute -top-0.5 right-1.5 size-2 rounded-full bg-error"></span>' : '';
      return `<a href="${it.href}"${cur} aria-label="${it.label}">
        <span class="relative inline-flex"><span class="material-symbols-rounded">${it.icon}</span>${badge}</span>
        <span class="dock-label">${it.short}</span>
      </a>`;
    }).join('');

    this.innerHTML = `
      <aside class="intro intro-d2 w-full lg:w-[260px] lg:shrink-0 lg:sticky lg:top-28 hidden lg:block">
        <div class="card bg-base-100 rounded-box shadow-md">
          <div class="card-body p-4">
            <nav class="member-menu w-full">${menu}</nav>
          </div>
        </div>
      </aside>
      <nav class="dock lg:hidden">${dock}</nav>`;
  }
}

customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);
customElements.define('side-panel', SidePanel);
customElements.define('member-nav', MemberNav);
