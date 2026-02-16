# 🎨 Leon Hong Art - 藝術家個人網站

一個使用 Next.js 16 和 React 18 構建的現代藝術家個人網站，支持靜態 HTML 頁面和 Supabase 動態畫廊。

## ✨ 功能特色

- 🖼️ **靜態網站** - HTML、CSS 和 JavaScript 靜態頁面
- 🎨 **動態画廊** - Supabase 驅動的作品集管理系統
- 📸 **圖片優化** - Next.js Image 組件自動優化
- 🎯 **分類排序** - 按 sort_order 排列的作品展示
- 📱 **響應式設計** - 在桌面、平板和手機上完美顯示
- 🚀 **Vercel 部署** - 一鍵部署到 Vercel
- ♿ **性能優先** - 服務端渲染、圖片對比和懶加載

## 🛠️ 技術棧

- **框架**: Next.js 16 (App Router)
- **語言**: React 18 + TypeScript
- **資料庫**: Supabase (PostgreSQL)
- **樣式**: CSS Modules
- **部署**: Vercel
- **圖片服務**: Supabase Storage + Next.js Image

## 📁 項目結構

```
leonhong.art/
├── app/                    # Next.js App Router
│   ├── artworks/          # 動態畫廊頁面
│   ├── page.tsx           # 首頁
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局樣式
├── components/            # React 組件
│   ├── ArtworkGrid.tsx    # 網格容器
│   └── ArtworkCard.tsx    # 作品卡片
├── lib/                   # 工具函數
│   └── supabaseClient.ts  # Supabase 客戶端
├── styles/               # CSS Modules
│   ├── home.module.css    # 首頁樣式
│   └── artworks.module.css # 畫廊樣式
├── public/               # 靜態資產
│   ├── index.html        # 靜態首頁
│   ├── about.html        # 關於頁面
│   └── portfolio.html    # 靜態作品集
└── SUPABASE_SETUP.md    # 詳細設置說明
```

## 🚀 快速開始

### 前置要求

- Node.js 18+
- npm 或 yarn
- Supabase 項目 ([免費建立](https://supabase.com))
- Vercel 帳戶 ([免費註冊](https://vercel.com))

### 本地開發

1. 克隆這個倉庫
```bash
git clone https://github.com/euboneba0105/leonhong.art.git
cd leonhong.art
```

2. 安裝依賴
```bash
npm install
```

3. 設置環境變數
```bash
# 創建 .env.local 文件
cp .env.example .env.local

# 編輯 .env.local，添加你的 Supabase 憑證
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

4. 運行開發服務器
```bash
npm run dev
```

訪問 `http://localhost:3000`### 前置要求

- Node.js 18+
- npm 或 yarn
- Supabase 項目 ([免費建立](https://supabase.com))
- Vercel 帳戶 ([免費註冊](https://vercel.com))

### 本地開發

1. 克隆這個倉庫
```bash
git clone https://github.com/euboneba0105/leonhong.art.git
cd leonhong.art
```

2. 安裝依賴
```bash
npm install
```

3. 設置環境變數
```bash
# 創建 .env.local 文件
cp .env.example .env.local

# 編輯 .env.local，添加你的 Supabase 憑證
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

4. 運行開發服務器
```bash
npm run dev
```

訪問 `http://localhost:3000`

## 📖 詳細設置指南

請參閱 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 了解：

- ✅ 如何設置 Supabase 資料庫
- 🖼️ 如何上傳圖片到 Supabase Storage
- 🔑 環境變數配置
- 🎨 添加作品到數據庫
- 🐛 故障排除

## 🚀 部署

### 部署到 Vercel

```bash
# 使用 Vercel CLI
npm i -g vercel
vercel

# 或連接 GitHub repo 到 Vercel 儀表板
# https://vercel.com/new
```

### 部署步驟

1. 推送到 GitHub
```bash
git add .
git commit -m "Add Supabase integration"
git push origin main
```

2. 在 Vercel 儀表板連接 GitHub
3. 設置環境變數：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 點擊部署

### 本地構建和測試

```bash
npm run build
npm run start
```

## 🎯 URL 結構

- `/` - 首頁（Next.js）
- `/artworks` - 動態作品畫廊（Supabase）
- `/index.html` - 靜態首頁
- `/about.html` - 靜態關於頁面
- `/portfolio.html` - 靜態作品集

## 📊 Supabase 資料庫結構

### artworks 表

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | uuid | 主鍵 |
| title | text | 作品標題 |
| year | int | 創建年份 |
| medium | text | 媒介（油畫、水彩等） |
| size | text | 尺寸（例：100cm x 150cm） |
| description | text | 作品描述 |
| image_url | text | 圖片 URL（Supabase Storage） |
| sort_order | int | 排序順序（低到高） |
| created_at | timestamptz | 創建時間 |

## 🎨 設計特色

- **黑白極簡風格** - 專業的藝術畫廊設計
- **響應式網格** - 自動適應不同屏幕尺寸
- **懶加載圖片** - 提升頁面性能
- **加載骨架屏** - 更好的用戶體驗
- **暗色首頁** - 現代化設計

## 🔒 環境變數

這些是公開的 Supabase 變數（前綴有 `NEXT_PUBLIC_`）：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**重要**：不要提交 `.env.local` 文件到 Git。使用 `.gitignore`。

## 📚 資源鏈接

- [Next.js 文檔](https://nextjs.org/docs)
- [Supabase 文檔](https://supabase.com/docs)
- [Vercel 部署指南](https://vercel.com/docs)
- [Next.js Image 組件](https://nextjs.org/docs/app/api-reference/components/image)

## 🆘 故障排除

### 圖片未加載

1. 檢查 `image_url` 是否正確
2. 確保 Supabase Storage 存儲桶設置為公開
3. 檢查 `next.config.js` 中的 `remotePatterns` 配置

### Supabase 連接失敗

1. 驗證環境變數是否正確設置
2. 確保 Supabase 項目不在睡眠狀態
3. 檢查防火牆/網絡設置

## 📄 許可證

專有 - Leon's Art Studio 2026

---

**需要幫助？** 查看 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 或檢查組件中的 TypeScript 型別定義。

## 📝 環境變量

在 `.env.local` 文件中配置：

```env
MAX_FILE_SIZE=52428800
ALLOWED_FORMATS=jpg,jpeg,png,gif,webp
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## ⚠️ 注意事項

- 上傳的文件存儲在本地 `public/uploads` 目錄中
- 如需持久化存儲，建議集成雲存儲服務（如 AWS S3、Cloudinary 等）
- 部署時請考慮文件存儲的安全性和備份

## 🔒 安全考慮

- ✅ 文件類型驗證
- ✅ 文件大小限制
- ✅ 防止路徑遍歷攻擊
- ⚠️ 建議添加用戶認證和授權

## 📄 許可證

MIT 許可證

## 👨‍💻 作者

Leon Hong

---

**訪問網站**: [leonhong.art](https://leonhong.art)