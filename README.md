# 🎨 Leon Hong Art - 藝術家個人網站

一個使用 Next.js 14 和 React 18 構建的現代藝術家個人網站，支持照片上傳、瀏覽和管理功能。

## ✨ 功能特色

- 🖼️ **照片展示** - 優雅的作品集展示，支持多種圖片格式
- 📤 **照片上傳** - 直白易用的拖放上傳界面，支持多種圖片格式
- 🗑️ **照片管理** - 快速刪除或下載已上傳的作品
- 🎨 **現代設計** - 響應式設計，在桌面、平板和手機上完美顯示
- 🚀 **高性能** - 使用 Next.js 和 Tailwind CSS 優化性能

## 🛠️ 技術棧

- **框架**: Next.js 14
- **語言**: React 18 + TypeScript
- **樣式**: Tailwind CSS
- **文件存儲**: 本地文件系統
- **API**: Next.js App Router

## 📋 支持的圖片格式

- JPG / JPEG
- PNG
- GIF
- WebP

## 📁 最大文件大小

- 50 MB

## 🚀 快速開始

### 前置要求

- Node.js 18+
- npm 或 yarn

### 安裝

1. 克隆這個倉庫
```bash
git clone https://github.com/euboneba0105/leonhong.art.git
cd leonhong.art
```

2. 安裝依賴
```bash
npm install
```

3. 運行開發服務器
```bash
npm run dev
```

4. 在瀏覽器中打開 [http://localhost:3000](http://localhost:3000)

## 📁 項目結構

```
leonhong.art/
├── app/
│   ├── layout.tsx          # 根佈局
│   ├── page.tsx            # 首頁
│   ├── globals.css         # 全局樣式
│   ├── api/
│   │   └── upload/
│   │       ├── route.ts    # 上傳和列表 API
│   │       └── [filename]/
│   │           └── route.ts # 刪除 API
│   ├── gallery/
│   │   └── page.tsx        # 作品集頁面
│   └── upload/
│       └── page.tsx        # 上傳頁面
├── public/
│   └── uploads/            # 存儲上傳的照片
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
└── postcss.config.js
```

## 🔌 API 端點

### GET /api/upload
列出所有已上傳的照片

### POST /api/upload
上傳新照片

### DELETE /api/upload/[filename]
刪除指定照片

## 🎨 頁面

### 首頁 (/)
歡迎頁面，介紹網站功能和藝術家信息。

### 作品集 (/gallery)
展示所有已上傳的照片，支持預覽、下載和刪除。

### 上傳頁面 (/upload)
用戶友好的照片上傳界面，支持拖放功能。

## 🚀 部署

### 部署到 Vercel

```bash
npm install -g vercel
vercel
```

### 部署到其他平台

1. 構建項目
```bash
npm run build
```

2. 啟動生產服務器
```bash
npm start
```

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