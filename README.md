# 海外文教中心數位服務平台 — 首頁雛形

中華民國僑務委員會「海外文教中心數位服務平台」首頁，用於**雛形展示（prototype）**。
依 [Figma 設計稿](https://www.figma.com/design/gmit0dOiGb5OIpfZNlXjWh/sys%EF%BC%9A%E6%B5%B7%E5%A4%96%E6%96%87%E6%95%99%E4%B8%AD%E5%BF%83%E6%95%B8%E4%BD%8D%E6%9C%8D%E5%8B%99%E5%B9%B3%E5%8F%B0?node-id=24126-2) 製作，
並採用 [DaisyUI 母元件庫](https://github.com/ChangYu-Lun/master-component-library) 作為設計系統。

## 技術棧

- **HTML + 原生 JS**（無框架）
- **Tailwind CSS v4（CLI build）** + **daisyUI 5.5.20（鎖版）** — 與母元件庫一致
- **Swiper v11** — 輪播套件（Hero 與各內容區）
- 字型：Inter + Noto Sans TC（對應 `theme.css` 的 `--font-sans`）
- Icon：Material Symbols Outlined

## 設計系統與 Token

色彩 / 字型 / 圓角等 Token 來自 `tokens/theme.css`（即母元件庫的 Token 層，
依附件 CSS 設定）。元件結構客製層 `styles/custom.css` 直接取自母元件庫。
**調整主題時原則上只改 `tokens/theme.css`**，改完需重新編譯。

## 資料夾結構

```
.
├── index.html            # 首頁
├── venue.html            # 場地預約頁（搜尋 Banner + 結果列表 + 分頁）
├── tokens/theme.css      # 設計 Token（Tailwind 編譯輸入，依附件 CSS）
├── styles/
│   ├── custom.css        # 母元件庫元件客製層（button / badge / tile ...）
│   └── page.css          # 各頁專屬版型樣式
├── scripts/
│   ├── components.js     # 共用版面元件（Web Components）：<site-header> / <site-footer> / <side-panel>
│   ├── main.js           # 共用：Swiper、進場動畫、導覽列、回頂部、評分
│   ├── venue.js          # 場地預約頁：卡片網格、格狀/列表切換、收藏
│   ├── build.ps1         # Windows 編譯輔助（會掃描所有 *.html）
│   └── watch.ps1         # 監看 theme.css 變更自動重編
├── dist/styles.css       # 編譯輸出（Tailwind + daisyUI）
└── assets/               # 圖片與 icon（圖層名稱對應檔名）
```

## 快速開始

```bash
npm install --ignore-scripts   # 安裝相依（見下方「為何要 --ignore-scripts」）
npm run build:win              # 編譯 theme.css → dist/styles.css（Windows 輔助腳本）
npm run serve                  # 啟動靜態伺服器預覽（或直接開 index.html）
```

## 改了 `theme.css` 之後，怎麼讓網頁同步更新？

Token（顏色 / 字型 / 圓角）寫在 `tokens/theme.css`，**瀏覽器讀的是編譯後的
`dist/styles.css`**，所以改完 `theme.css` 一定要「重新編譯」再重新整理頁面：

1. **手動編譯一次**
   ```bash
   npm run build:win
   ```
   （等同 `powershell -ExecutionPolicy Bypass -File scripts/build.ps1`）
   跑完回到瀏覽器按 F5 / Ctrl+R 重新整理即可看到新顏色。

2. **自動監看（存檔即重編）** — 一邊開著它，改 `theme.css` 存檔就自動重編：
   ```bash
   npm run watch:win
   ```
   （Ctrl+C 結束。重編後一樣到瀏覽器重新整理。）

> 兩個指令底層都會呼叫 `scripts/build.ps1`（處理中文路徑問題，見下方）。
> 若把專案移到純英數路徑下，可直接用標準的 `npm run build` / `npm run dev`。

### 為何安裝要加 `--ignore-scripts`

`@parcel/watcher`（Tailwind watch 模式用）的原生編譯 `build-from-source` 在本機
會 segfault 並回滾整個安裝。它**只在 `--watch` 模式才需要**，故以 `--ignore-scripts`
跳過其安裝腳本即可正常編譯。

### 為何編譯要用 `scripts/build.ps1`

本專案路徑含非 ASCII 字元（「僑委會」），`@tailwindcss/oxide` 原生掃描器會
存取違規（`0xC0000005`）而崩潰。`build.ps1` 會把編譯輸入鏡像到純 ASCII 的暫存
資料夾編譯，再把 `dist/styles.css` 複製回專案。
（若專案移到純英數路徑下，可直接用 `npm run build`。）

## 圖片對應

`index.html` 內的圖片依「Figma 圖層名稱 ↔ `assets/` 檔名」引用，例如
`News-1` → `assets/image/News-1.png`、`Venue-01` → `assets/image/Venue-01.png`。

> 精選藏書的 4 本書封在 `assets/` 中原無對應檔，已自 Figma 匯出為
> `assets/image/book-1.png` ～ `book-4.png`。

## 內容區塊

導覽列 ・ Hero 輪播（含播放控制與進度條）・ 最新消息 Latest News ・
活動公告 Events ・ 精選藏書 Curated Books ・ 場地預約 Venue Booking ・
頁尾 ・ 右側浮動快捷面板（檔期查詢 / 近期活動 / 回頂部）。

## 共用版面元件（元件化）

導覽列、頁尾、浮動面板以 **Web Components**（`scripts/components.js`）元件化，
確保每一頁長得一模一樣（單一真實來源，以首頁版本為準）。各頁只需放標籤：

```html
<site-header active="venue"></site-header>   <!-- active 標示目前頁：venue / events ... -->
<site-footer></site-footer>
<side-panel></side-panel>
```

採 light DOM 渲染並 `display:contents`，維持既有 CSS 與 `main.js` 的 `#site-header`／
`#nav-spacer` 等選取器運作；`components.js` 需在 `main.js` 之前載入。

> 內頁頁首 Banner 使用通用 class **`.page-hero`**（非場地預約專屬），方便其他內頁共用。

## 互動與動態

- **Icon**：全站採 Material Symbols **Rounded**。
- **導覽列**：固定置頂；向下捲動移出畫面、向上捲動移入畫面。
- **標題進場**：區段標題以 Clip Text Reveal（由下往上揭開）進場。
- **卡片進場**：互動卡片（最新消息 / 活動 / 藏書 / 場地）滾動進入視線時，
  由 `opacity 0→1` 並從下方些微上移到定位淡入。
- **輪播**：Hero 自動播放（含播放控制與進度條）；最新消息 / 活動 / 藏書 /
  場地四區**不自動輪播**，僅以箭頭手動切換。
- **減少動態**：以上進場與 Hero 自動播放皆尊重作業系統
  「減少動態（prefers-reduced-motion）」偏好。
- **評分**：採 daisyUI `rating` 元件（`rating-half` + `mask mask-heart`），愛心底色 amber-500。
- 本站為單一淺色主題，**不含明暗模式切換**。
