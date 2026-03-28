# Ariel Todolist - MVP 版本 (本地端)

一個前後端分離的待辦事項管理網頁（MVP），展示基礎的 REST API 與前端互動。

後端為跟隨線上課程實作，並於 Notion 撰寫學習筆記；此份專案以觀念及基礎實作學習為目的，並逐步修改或新添加功能，透過 GitHub Copilot & Chat 協同完成。

## 專案結構

```
project_todolist/
├── todolist_backend/          # 後端（Node.js HTTP 伺服器）
│   ├── server.js              # RESTful API 伺服器
│   ├── errorHandle.js         # 錯誤處理模組
│   ├── package.json           # 依賴配置
│   └── node_modules/          # 已安裝依賴
│
├── todolist_frontend/         # 前端（靜態 HTML/CSS/JS）
│   ├── index.html             # 頁面結構
│   ├── all.js                 # 核心邏輯（API 呼叫、事件處理、DOM 渲染）
│   ├── style.css              # 樣式表
│   └── (image/assets 可選)
│
└── README.md                  # 本檔案
```

---

## 目前功能（MVP）

### 前端功能
- **查看待辦清單** - 頁面載入時從後端取得所有待辦事項
- **新增待辦** - 輸入標題後點擊「新增」按鈕發送 POST 請求
- **編輯待辦** - 點擊每項的「編輯」按鈕彈窗修改標題（PATCH 請求）
- **刪除單項** - 點擊「刪除」按鈕移除指定待辦（DELETE 請求）
- **清除全部** - 點擊「清除全部」按鈕清空所有待辦（DELETE 請求）
- **即時回饋** - 操作完成後顯示成功/失敗狀態

### 後端 API 端點
所有端點基於 `http://localhost:3005`（本地）

| 方法 | 路由 | 功能 | 請求體 | 回應例 |
|------|------|------|--------|-------|
| GET | `/todos` | 取得所有待辦 | 無 | `{ status: "success", data: [{id, title}, ...] }` |
| POST | `/todos` | 新增待辦 | `{ title: "..." }` | `{ status: "success", data: [...] }` |
| PATCH | `/todos/:id` | 更新待辦 | `{ title: "..." }` | `{ status: "success", data: [...] }` |
| DELETE | `/todos/:id` | 刪除單項 | 無 | `{ status: "success", data: [...] }` |
| DELETE | `/todos` | 清除全部 | 無 | `{ status: "success", data: [] }` |

### 近期調整的功能與技術
- **DOM 選擇器優化** - 將原本的 `getElementById` 改為 `querySelector` 使用 class 選擇器
- **資料寫入 Google Sheets** - 新增待辦時同步將資料寫入 Google Sheets，使用 googleapis 套件與服務帳號驗證，欄位包含 id 與 title，支援錯誤處理與環境變數配置

---

## 技術堆疊 (tech stack)

- **後端**：Node.js (無框架)
- **前端**：原生 HTML5, CSS3, JavaScript (ES6+)
- **通訊**：Fetch API, RESTful API, JSON
- **其他**：UUID (for ID generation), googleapis (for Google Sheets)

---

## 快速開始

### 前置要求
- **Node.js** v24.x（推薦）或更高版本
- 任何現代瀏覽器（Chrome, Firefox, Edge 等）

### 安裝與運行

#### 1️⃣ 安裝後端依賴
```powershell
cd c:\Users\使用者名稱\Desktop\project_todolist\todolist_backend
npm install
```

#### 2️⃣ 啟動後端伺服器
```powershell
node server.js
```
伺服器監聽 `http://localhost:3005`

#### 3️⃣ 啟動前端

**選項 A：使用 http-server**
```powershell
cd c:\Users\使用者名稱\Desktop\project_todolist\todolist_frontend
npx http-server -p 8080
# 瀏覽器開啟: http://localhost:8080
```

**選項 B：直接開啟檔案（Quick Test）**
- 雙擊 `todolist_frontend/index.html`（可能遇到跨域警告）

**選項 C：直接點選 Go Live (Click to run live server)**


#### 4️⃣ 測試 API（Postman）
**取得所有待辦**
-Uri 'http://localhost:3005/todos'

-Method GET

**新增待辦**
-Uri 'http://localhost:3005/todos'

-Method POST 

**刪除全部**
-Uri 'http://localhost:3005/todos'

-Method DELETE

---

## 檔案說明

### 後端檔案

**`server.js`**
- 純 Node.js HTTP 伺服器（無框架）
- 在記憶體中儲存待辦（重啟後遺失）
- 已啟用 CORS（允許跨域請求）
- 監聽連接埠：`process.env.PORT || 3005`

**`errorHandle.js`**
- 統一錯誤回應處理
- 回傳 400 狀態碼與錯誤資訊 JSON

**`package.json`**
- dependencies：`uuid` (用於產生唯一 ID)
- scripts: `npm start` → `node server.js`

**`.gitignore`**
- 忽略不需版本控制的檔案，如 `node_modules/`、`.env` (環境變數) 檔案
- 保護敏感資訊（如 Google Sheets API 金鑰）不被提交到 Git

---

### 前端檔案

**`index.html`**
- 頁面骨架與 DOM 容器
- Class（用於 JS 選取）：
  - `.todo-form` - 輸入表單
  - `.todo-input` - 輸入框
  - `.add-btn` - 新增按鈕
  - `.clear-btn` - 清除全部按鈕
  - `.status` - 狀態資訊顯示區
  - `.todos-list` - 待辦清單容器

**`all.js`（核心邏輯）**
- `baseUrl = 'http://localhost:3005/todos'` - 後端地址（需要時可修改）
- 關鍵函式：
  - `fetchTodos()` - GET 請求，取得待辦
  - `addTodo(title)` - POST 請求，新增
  - `editTodo(id, title)` - PATCH 請求，編輯
  - `deleteTodo(id)` - DELETE 請求，刪除單項
  - `clearAll()` - DELETE 請求，清空全部
  - `renderTodos(todos)` - 渲染 DOM 清單
  - `setStatus(msg)` - 顯示狀態資訊

**`style.css`**
- 簡單 CSS Grid/Flexbox 佈局
- 按鈕與清單樣式

---

## Google Sheets API 申請與設定

請依照以下步驟操作：

1. **進入 Google Cloud Console：**
   前往 [console.cloud.google.com](https://console.cloud.google.com/) 並登入 Google 帳號。

2. **建立新專案：**
   點擊左上角的專案選單 →「建立新專案」→ 取名為 `自己喜歡的名字` → 建立。

3. **啟用 Google Sheets API：**
   - 點擊左上角漢堡選單 (≡) → **API 和服務** → **已啟用的 API 和服務**。
   - 點擊上方 **「啟用 API 和服務」**。
   - 搜尋 `Google Sheets API` → 點擊進入 → 按下 **「啟用」**。

4. **建立憑證 (Credentials)：**
   - 啟用後，點擊右上角的 **「建立憑證」**。
   - **選取 API：** Google Sheets API。
   - **存取資料來源：** 應用程式資料 (Application Data)。
   - 按下「下一步」。

5. **建立服務帳號 (Service Account)：**
   - **服務帳號名稱：** 例如 `sheet-manager`。
   - 會看到系統生成一個類似 email 的 ID：`sheet-manager@專案ID.iam.gserviceaccount.com` (**⚠️ 把這個 email 複製下來，等一下要用**)。
   - 按下「建立並繼續」→ 角色選「擁有者」或是略過 → 完成。

6. **下載金鑰 (JSON)：**
   - 回到「憑證」頁面，下方會看到剛剛建立的服務帳號。
   - 點擊那個 email 進入詳細頁面。
   - 切換到 **「金鑰 (Keys)」** 分頁。
   - 點擊 **「新增金鑰」** → **「建立新金鑰」**。
   - 選擇 **JSON** → 點擊 **「建立」**。
   - **電腦會自動下載一個 `.json` 檔案。最高機密鑰匙，妥善保存！**

7. **設定 Google Sheet 權限（重要！）：**
   - 建立一個新的 Google Sheet。
   - 在 Google Sheet 右上角點擊「共用」。
   - 將剛剛複製的 **服務帳號 Email** 貼上。
   - 權限設為 **「編輯者」**，然後傳送。
   - 複製網址中的 ID（`d/` 和 `/edit` 中間的那串字串），填入 `.env` 的 `GOOGLE_SHEET_ID`。

---

## 未來可擴展功能
### 1. **Google Sheets 完整同步**
   - 新增待辦時寫入 Google Sheets（已實作）
   - 編輯待辦時更新 Google Sheets 對應列的 title
   - 刪除待辦時從 Google Sheets 移除對應列
   - 清除全部時清空 Google Sheets 工作表
   - 使用 Sheets API 的 update/delete 方法，需追蹤行號或以 id 查找

### 2. **管理員後台（ADMIN 帳密）**
   - 建立管理員帳號/密碼登入機制
   - 管理員可查看/管理所有使用者待辦（跨帳號）
   - 後端實作權限判斷（admin vs user）
   - 前端加入管理員登入頁面

### 3. **使用者認證系統**
   - 新增登入/註冊功能
   - 後端實作 JWT (JSON Web Token) 或 Session
   - 每個使用者擁有自己的待辦清單
   - 修改 DB schema：`todos` table 增加 `userId` 外鍵

### 4. **資料持久化**
   - 從記憶體遷移到資料庫
   - 建議選項：
     - **SQLite** - 輕量、無需另外配置 DB 伺服器
     - **PostgreSQL** - 生產級別
     - **MongoDB** - NoSQL 靈活性
   - 使用 ORM：`Sequelize` (SQL) 或 `Mongoose` (MongoDB)

### 5. **任務優先級與分類**
   - 為每個待辦新增 `priority` (高/中/低)、`category`、`dueDate` 欄位
   - 前端顯示與過濾功能

### 6. **任務完成狀態**
   - 新增 `completed` 布林欄位
   - 前端上的勾選框切換狀態
   - API 支援 PATCH `/todos/:id` 更新狀態

### 7. **搜尋與篩選**
   - 後端支援查詢參數：`GET /todos?search=關鍵字&category=工作`
   - 前端搜尋框與過濾器

### 8. **後端框架升級**
   - 從原生 `http` 遷移到 **Express.js** 或 **Fastify**
   - 簡化路由、中間件管理
   - 更好的錯誤處理與日誌

### 9. **前端框架升級**
   - 遷移到 **React** / **Vue.js** / **Svelte**
   - 元件化架構
   - 更容易的狀態管理

### 10. **使用 Axios 進行 API 請求**
   - 將前端 Fetch API 改為 **axios** 套件
   - 安裝：`npm install axios`（前端專案）
   - 優點：更簡潔的語法、內建請求/響應攔截器、更好的錯誤處理
   - 統一配置 baseURL、timeout、headers 等
   - 支援請求取消、並發請求等高級功能

### 11. **Discord API 每日早報推送**
   - 整合 Discord Webhook 或 Bot API
   - 後端定時任務（每日早上特定時間）推送待辦清單摘要到 Discord 頻道
   - 推送內容：總待辦數、未完成任務列表、優先級統計
   - 需配置 Discord 伺服器、建立 Webhook 或 Bot Token
   - 使用 `node-schedule` 或 `node-cron` 實作定時功能
   - 環境變數配置：`DISCORD_WEBHOOK_URL` 或 `DISCORD_BOT_TOKEN`

### 12. **匯出與分享**
   - 將待辦匯出為 PDF / CSV
   - 分享清單連結給其他使用者

### 13. **行動端適配**
   - 完善響應式設計
   - 考慮開發 React Native / Flutter 行動應用

### 14. **測試覆蓋**
   - 後端：Jest / Mocha 單元測試
   - 前端：Jest / Cypress E2E 測試
   - CI/CD 流程（GitHub Actions）

---

## 常見問題

### Q: 後端啟動後為什麼沒有輸出？
**A:** Node.js 原生 `http` 模組啟動成功時不輸出任何資訊。透過發送 API 請求測試即可確認運行狀態。

### Q: 前端顯示「無法連接到後端」怎麼辦？
**A:**
1. 確認後端已啟動：`node server.js` 在 `todolist_backend` 目錄運行
2. 查看瀏覽器 Console（F12）檢查錯誤資訊
3. 確認前端 JS 中的 `baseUrl` 是否正確指向後端地址（例如 `http://localhost:3005/todos`）
4. 若用 `file://` 開啟前端，推薦改用 `http-server` 或 Python 伺服器

### Q: 待辦資料在瀏覽器重新整理後消失，為什麼？
**A:** MVP 版本中，資料只儲存在後端記憶體中（運行時`todos` 陣列）。若要持久化，需要連接資料庫。

### Q: 如何修改後端連接埠？
**A:** 在啟動前設定環境變數：
```powershell
$env:PORT=4000; node server.js
```
然後前端 `all.js` 中的 `baseUrl` 也要相應修改。

---

## 部署建議

### 本地開發
- 後端：`node server.js`（或 nodemon 自動重啟）
- 前端：`npx http-server` 

### 生產部署
- **後端**：Heroku / Railway / Vercel (Node)
  - 需要連接遠端資料庫
  - 使用環境變數管理敏感資訊
- **前端**：Netlify / Vercel / GitHub Pages
  - 修改前端中的 `baseUrl` 指向生產後端 URL
  - 配置 CORS 確保跨域存取

---

**最後更新**：2026 年 3 月
