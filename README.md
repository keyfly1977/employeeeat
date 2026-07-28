# 警衛出勤與訂餐即時儀表板 (Intranet Attendance & Meal Ordering Dashboard)

本專案是一個專為公司警衛設計的**出勤與訂餐即時看板**。透過串接公司內部的 104 HR Max API，在每日 08:30 訂餐截止時間前，協助警衛即時、精確地掌握今日請假與打卡狀況，並自動計算出葷食與素食的訂餐份數。

---

## 🌟 核心特色
1. **毛玻璃視覺風格 (Glassmorphism)**：精美直覺的深色儀表板，支援 RWD 響應式排版（適合平板、電腦）。
2. **模擬測試模式 (Mock Mode)**：若尚未配置 API 帳密，系統會自動載入模擬數據，方便您與警衛立即體驗與測試。
3. **一鍵複製 LINE 訂餐訊息**：自動產生整齊的出勤與便當統計文字，點擊按鈕即可直接貼進 LINE 群組。
4. **素食名單自訂**：若 HR 系統中無葷素記錄，可在設定檔中直接填入素食同仁姓名，系統會自動在打卡名單中進行統計分類。

---

## 🛠️ 開啟與執行步驟

因為您的電腦已經安裝了 Node.js，您只需按照以下步驟即可啟動儀表板：

### 1. 啟動伺服器
請在您的終端機（PowerShell 或 命令提示字元）中，切換到本專案資料夾，並執行以下命令：

```bash
npm start
```
或是：
```bash
node server.js
```

啟動成功後，您會看到以下提示：
```text
=========================================
警衛出勤訂餐看板伺服器啟動完成！
網址: http://localhost:5000
設定檔狀態: ⚠️ 模擬測試模式 (尚未填寫 API 帳密)
=========================================
```

### 2. 開啟儀表板
打開瀏覽器（如 Chrome、Edge），輸入以下網址即可查看：
👉 **[http://localhost:5000](http://localhost:5000)**

---

## ⚙️ 欄位設定說明 (`config.json`)

專案資料夾下的 [config.json](file:///c:/Users/ryan.hsu/Downloads/出勤上班/config.json) 檔案可供您設定 API 連線與素食同仁名單：

```json
{
  "HR_API_BASE": "http://192.168.8.11:3001",
  "CO_ID": null,
  "USER_ACCOUNT": "",
  "USER_PWD": "",
  "PORT": 5000,
  "VEGETARIAN_NAMES": ["陳春嬌", "黃秋月"]
}
```

* **真實模式設定**：請將 `CO_ID`（數字）、`USER_ACCOUNT` 與 `USER_PWD` 填入您的 HR Open API 帳密。填寫後**重新啟動 Node.js 服務**，儀表板即會切換為真實內網數據連線。
* **素食名單設定**：在 `VEGETARIAN_NAMES` 中填入「素食員工姓名」，當該員工打卡上班時，系統會自動在訂餐統計中計入「素食便當」，並相應扣除「葷食便當」數量。

---

## 📂 檔案目錄結構

* [server.js](file:///c:/Users/ryan.hsu/Downloads/出勤上班/server.js) - 輕量 Express 後端，處理 API 轉發、JWT 認證與數據快取。
* [config.json](file:///c:/Users/ryan.hsu/Downloads/出勤上班/config.json) - API 連線與素食名單設定檔。
* `public/` - 前端靜態網頁資源。
  * [index.html](file:///c:/Users/ryan.hsu/Downloads/出勤上班/public/index.html) - 看板 HTML 結構與 inline SVGs。
  * [index.css](file:///c:/Users/ryan.hsu/Downloads/出勤上班/public/index.css) - 毛玻璃視覺效果與動畫。
  * [app.js](file:///c:/Users/ryan.hsu/Downloads/出勤上班/public/app.js) - 搜尋篩選、狀態計數、以及一鍵複製剪貼簿邏輯。
