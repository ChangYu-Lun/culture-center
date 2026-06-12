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
      const isActive = key === active;
      const cls = isActive
        ? 'btn btn-ghost btn-sm md:btn-md rounded-full font-semibold text-primary'
        : 'btn btn-ghost btn-sm md:btn-md rounded-full font-medium';
      const cur = isActive ? ' aria-current="page"' : '';
      return `<a data-nav="${key}" href="${href}" class="${cls}"${cur}>${label}</a>`;
    };

    this.innerHTML = `
      <header id="site-header" class="navbar-wrapper fixed top-0 left-0 right-0 z-40 bg-base-200">
        <div class="page-container flex items-center justify-between gap-4 py-4">
          <a href="./index.html" class="shrink-0">
            <img src="./assets/image/Logo-light.svg" alt="中華民國僑務委員會 海外文教中心數位服務平台" class="h-12 md:h-[58px] w-auto" />
          </a>

          <div class="flex flex-col items-end gap-2">
            <div class="hidden lg:flex items-center gap-4 text-sm">
              <a href="./index.html#news" class="link link-hover text-base-content/70">最新消息</a>
              <a href="#" class="link link-hover text-base-content/70">網站導覽</a>
              <span class="text-base-content/20">|</span>
              <button class="flex items-center gap-1 text-base-content/70 hover:text-base-content">
                <span class="material-symbols-rounded text-[18px]">language</span>
                <span>中文 TW</span>
              </button>
            </div>

            <nav class="flex items-center gap-1 md:gap-2">
              ${navItem('library', '#', '圖書借閱')}
              ${navItem('folk', '#', '民俗文物')}
              ${navItem('venue', './venue.html', '場地預約')}
              ${navItem('events', './index.html#events', '僑務活動')}
              <a href="#" class="btn btn-neutral btn-sm md:btn-md rounded-full px-6">登入</a>
            </nav>
          </div>
        </div>
      </header>
      <div id="nav-spacer" aria-hidden="true"></div>`;
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

customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);
customElements.define('side-panel', SidePanel);
