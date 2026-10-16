# 工作室網站：專案協作指引

## 溝通方式

- 預設使用繁體中文，並以沒有大量程式經驗的設計師也容易理解的方式說明。
- 未經使用者明確要求，不自行 Commit、Push、Merge、建立 Pull Request 或移除公開內容。

## Repository 與發布架構

工作室網站與《送禮大作戰》由同一個 GitHub 帳號維護，但使用兩個獨立的 Repository，Git branch、Commit、Push 與 Pull Request 都必須分開處理：

- [`tutu-playlab/tutu-playlab.github.io`](https://github.com/tutu-playlab/tutu-playlab.github.io) 管理工作室共用內容，包括網站根目錄首頁、`/privacy/` 隱私權政策及 `/components/` 共用元件。
- [`tutu-playlab/gift-game`](https://github.com/tutu-playlab/gift-game) 管理《送禮大作戰》，發布到 `/gift-game/`，包含遊戲、遊戲專屬文章與相關素材。
- 兩個 Repository 發布後會組合在同一個 GitHub Pages 網域：工作室首頁為 `https://tutu-playlab.github.io/`，遊戲為 `https://tutu-playlab.github.io/gift-game/`。
- 影響兩邊的修改，例如團隊品牌、共用頁尾版本、共用導覽或隱私權連結，必須分別建立 branch、Commit、Push 與 Pull Request，並確認兩個 `main` 都完成部署。
- 分享給玩家時使用正式網站網址；分享給協作者檢查程式或修改時使用對應的 Repository 或 Pull Request 連結。`localhost`、`127.0.0.1` 與 `file://` 只供本機預覽，不能當成對外分享連結。

## 正式宣傳與廣告上線提醒

- 在進行正式宣傳、申請或啟用 AdSense、啟用 GA4、加入 Cookie 同意工具，或移除頁面的 `noindex` 前，必須先完整閱讀並逐項檢查 `docs/launch-checklist.md`。
- 取得 AdSense Publisher ID 後，必須在網站根目錄新增 Google 提供的正式 `ads.txt` 紀錄，確認 `https://tutu-playlab.github.io/ads.txt` 可正常開啟；取得 ID 前不要放假資料或佔位內容。
- 只要檢查表仍有未完成項目，協作者就要主動提醒使用者，不能把「網站已經可以公開瀏覽」誤當成「已經適合正式宣傳或申請廣告」。
- 每個項目必須完成，或由使用者明確決定暫緩及接受影響，才可以視為已處理。
- 新增或修改分析、廣告、Cookie、聯絡表單、贊助、第三方嵌入、裝置儲存或其他可能影響資料處理的功能時，必須同步檢查實際程式、隱私權政策、Cookie 同意介面與 `docs/launch-checklist.md` 是否一致。

## 文件維護

- `AGENTS.md` 保存會長期反覆適用的協作規則。
- `docs/launch-checklist.md` 保存目前尚未完成、完成後可勾選的上線事項；狀態改變時更新該檔案，不在這份規則中累積已完成的暫時待辦。

## 共用頁尾元件

- 工作室首頁、隱私權政策及各遊戲共用唯一一份頁尾元件，原始檔位於本專案的 `components/site-footer.js` 與 `components/site-footer.css`。
- 所有頁面都以網站根目錄絕對路徑 `/components/site-footer.js?v={版本號}` 載入元件，不在遊戲專案複製或另外維護頁尾內容與樣式。
- 修改共用頁尾後，必須使用尚未使用過的新版本號，並同步更新所有載入頁面的 `?v=`，避免瀏覽器繼續使用舊快取。
- 各頁以 `<site-footer current-page="...">` 標示目前頁面；必要的寬度差異由共用 CSS 依 `current-page` 控制。
