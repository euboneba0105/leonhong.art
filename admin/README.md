# Admin (CMS) — 設定說明

本資料夾包含用於管理內容的介面相關檔案（Decap CMS / Netlify CMS）。

快速啟用流程：

1. 部署到 Netlify（或可支援 Git Gateway 的平台）。
2. 於 Netlify 站台設定中啟用 `Identity`（Identity > Enable Identity）。
3. 在 Identity 的設定中啟用 `Git Gateway`（Identity > Services > Git Gateway）。
4. 確認 `admin/config.yml` 的 `backend.branch` 與站台發布分支一致（預設為 `main`）。
5. 至 Netlify Identity 邀請使用者或允許註冊，用戶登入後即可透過 CMS 編輯內容。

本 repo 關鍵檔案：

- [admin/index.html](admin/index.html) — CMS UI 入口，包含 Netlify Identity widget 與登入按鈕。
- [admin/config.yml](admin/config.yml) — Decap CMS 的設定（collections、media、backend 等）。

本地測試提示：

- 使用 Netlify CLI 的 `netlify dev` 可以在本機模擬 Identity/Git Gateway 行為。

參考：Decap CMS 與 Netlify Identity 文件（請依實際平台檔案為準）。
