# Global Weather 專案分析文件

## 1. 專案概述

**專案名稱：** Nuxt Globe Weather

**專案描述：** 這是一個互動式 3D 地球視覺化應用程式，展示全球主要城市的即時天氣資訊。

**核心功能：**
- 3D 地球視覺化（使用真實的地球紋理和地形凸起）
- 12 個主要城市標記（台北、紐約、倫敦、東京、雪梨、巴黎、莫斯科、北京、開羅、里約熱內盧、開普敦、孟買）
- 即時天氣資料取得（透過 Open-Meteo API）
- 點擊城市查看詳細天氣資訊
- 自動旋轉地球功能

---

## 2. 專案結構

```
global-weather/
├── .git/                   # Git 版本控制
├── .gitignore             # Git 忽略設定
├── .nuxt/                 # Nuxt 建置產物（自動產生）
├── .output/               # 正式環境建置輸出
│   ├── server/
│   └── public/
├── components/            # Vue 元件
│   └── WeatherGlobe.vue  # 主要的地球視覺化元件
├── node_modules/          # 相依套件（307MB）
├── public/                # 靜態資源
│   ├── favicon.ico       # 網站圖示
│   └── robots.txt        # SEO 爬蟲設定
├── app.vue                # 根應用程式元件
├── bun.lock              # Bun 套件管理器鎖定檔案
├── LICENSE               # GNU GPL v3 授權
├── nuxt.config.ts        # Nuxt 設定檔
├── package.json          # 專案相依性和腳本
├── README.md             # 專案文件
├── tailwind.config.js    # Tailwind CSS 設定
└── tsconfig.json         # TypeScript 設定
```

**結構特點：**
- 沒有 `pages/` 目錄（使用單頁面 app.vue 方式）
- 沒有 `server/` 目錄（無自訂 API 路由）
- 沒有 `layouts/` 目錄（無自訂版面配置）
- 極簡的元件結構（只有一個自訂元件）

---

## 3. 技術棧

### 核心框架
- **Nuxt 4.2.1** - Vue.js 全端元框架
- **Vue 3.5.25** - 漸進式 JavaScript 框架
- **Vue Router 4.6.3** - Vue.js 官方路由器

### 視覺化函式庫
- **globe.gl 2.45.0** - 基於 WebGL 的 3D 地球視覺化函式庫（底層使用 Three.js）
  - 從 unpkg CDN 載入地球紋理圖片

### 樣式
- **@nuxtjs/tailwindcss 6.14.0** - Nuxt 的 Tailwind CSS 模組
- **Tailwind CSS** - 實用優先的 CSS 框架

### 開發工具
- **TypeScript** - 型別安全的 JavaScript
- **Bun** - 快速的 JavaScript 執行環境和套件管理器

### 外部 API
- **Open-Meteo API** - 免費天氣 API（無需 API 金鑰）
  - 端點：`https://api.open-meteo.com/v1/forecast`
  - 基於座標提供當前天氣資料

---

## 4. 核心元件詳解

### A. app.vue（根元件）

**位置：** `/Users/pac/codes/global-weather/app.vue`

**作用：**
- 應用程式進入點
- 設定全螢幕黑色背景
- 匯入並渲染 WeatherGlobe 元件
- 防止頁面捲動

**程式碼結構：**
```vue
<template>
  <div class="h-screen w-screen overflow-hidden bg-black">
    <WeatherGlobe />
  </div>
</template>
```

---

### B. WeatherGlobe.vue（主元件）

**位置：** `/Users/pac/codes/global-weather/components/WeatherGlobe.vue`

**作用：** 核心視覺化和互動邏輯

**狀態管理（Vue Composition API）：**
- `globeContainer`: DOM 元素參照，用於掛載地球
- `loading`: 載入狀態指示器
- `selectedCity`: 目前選中的城市物件
- `weatherData`: 取得的天氣資訊
- `globeInstance`: globe.gl 實例參照

**資料：**
- `cities`: 包含 12 個城市物件的陣列（緯度/經度/人口）
- `getWeatherDescription`: WMO 天氣代碼解釋器

**主要方法：**
- `fetchWeather(lat, lng)`: 非同步函式，從 API 取得天氣
- 在 `onMounted` 生命週期鉤子中動態初始化地球

**功能特性：**
- 僅客戶端渲染（`process.client` 檢查）
- 動態匯入 globe.gl 以相容 SSR
- 城市點標記和標籤
- 點擊處理器（處理點和標籤）
- 自動旋轉控制
- 視窗大小調整處理
- 天氣顯示的模態覆蓋層

---

## 5. 設定檔說明

### package.json
```json
{
  "name": "nuxt-globe-weather",
  "type": "module",
  "scripts": {
    "dev": "nuxt dev",           // 開發伺服器
    "build": "nuxt build",       // 正式環境建置
    "generate": "nuxt generate", // 靜態產生
    "preview": "nuxt preview"    // 預覽建置結果
  }
}
```

### nuxt.config.ts
```typescript
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  ssr: false // 關鍵：停用 SSR 以相容 globe.gl
})
```

**重要設定：**
- `ssr: false` - 停用伺服器端渲染，對於 WebGL 函式庫至關重要
- 啟用 Vue devtools
- 整合 Tailwind CSS 模組

---

## 6. 應用程式流程

### 進入點
```
app.vue → components/WeatherGlobe.vue
```

### 應用程式流程

1. **初始載入**
   ```
   使用者造訪網站
   → Nuxt 載入 app.vue
   → WeatherGlobe 元件掛載
   → 顯示載入狀態
   ```

2. **地球初始化**（僅客戶端）
   ```
   onMounted 生命週期鉤子
   → 動態匯入 globe.gl
   → 建立 Globe 實例
   → 設定地球：
      - 地球紋理（從 unpkg CDN）
      - 城市點和標籤
      - 自動旋轉
      - 事件處理器
   → 隱藏載入覆蓋層
   ```

3. **使用者互動**
   ```
   使用者點擊城市標記/標籤
   → selectedCity 更新
   → 相機動畫到城市位置
   → 呼叫 fetchWeather()
   → 向 Open-Meteo 發送 API 請求
   → weatherData 更新
   → 模態框顯示天氣資訊
   ```

4. **天氣資料取得**
   ```
   fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`)
   → 接收 JSON 回應
   → 顯示：
      - 溫度（°C）
      - 天氣描述（從 WMO 代碼）
      - 風速
      - 海拔
      - 時間戳記
   ```

---

## 7. 架構設計特點

### A. 停用 SSR 架構
- **決策：** nuxt.config.ts 中設定 `ssr: false`
- **原因：** globe.gl 需要瀏覽器 API（WebGL、Canvas），在 Node.js 中不可用
- **影響：** 整個應用程式在客戶端渲染，無伺服器端預渲染
- **權衡：**
  - ✅ 簡化 WebGL 整合
  - ❌ SEO 限制
  - ❌ 初始載入較慢

### B. 動態匯入模式
```javascript
if (process.client) {
  const module = await import('globe.gl');
  Globe = module.default;
}
```
- **目的：** 即使在客戶端渲染時也防止 SSR 問題
- **好處：** 優雅處理僅瀏覽器的函式庫

### C. 單元件架構
- **模式：** 極簡的元件結構（只有一個自訂元件）
- **理由：** 簡單的應用程式，功能專注
- **權衡：** 容易理解但模組化程度較低

### D. Vue 3 Composition API
- **模式：** 使用 `<script setup>` 語法
- **優勢：**
  - 程式碼更簡潔
  - 更好的 TypeScript 推斷
  - 改進的 tree-shaking

### E. 客戶端資料取得
- **模式：** 在元件中使用 fetch() 直接呼叫 API
- **替代方案：** 可以使用 Nuxt 的 `useFetch` 組合式函式
- **權衡：** 簡單但無 SSR 資料預取

### F. 無狀態管理
- **觀察：** 使用本地元件狀態（ref）
- **適當性：** 小型應用程式，無共享狀態需求

### G. 基於 CDN 的資源
- **模式：** 從 unpkg.com CDN 載入地球紋理
- **URL：**
  - `//unpkg.com/three-globe/example/img/earth-blue-marble.jpg`
  - `//unpkg.com/three-globe/example/img/earth-topology.png`
  - `//unpkg.com/three-globe/example/img/night-sky.png`
- **權衡：** 減少套件大小但依賴外部 CDN

### H. 硬編碼城市資料
- **模式：** 12 個城市定義為 const 陣列
- **替代方案：** 可以從資料庫/API 取得
- **權衡：** 簡單但不靈活

### I. 無錯誤處理 UI
- **觀察：** 天氣取得錯誤僅 console.log
- **改進機會：** 可以顯示使用者友善的錯誤訊息

### J. 效能最佳化
- 使用 `pointsMerge: true` 提升 globe.gl 效能
- 視窗大小調整事件監聽器，實現響應式渲染

---

## 8. 天氣代碼對應

專案使用 WMO（世界氣象組織）天氣代碼：

```javascript
const getWeatherDescription = (code) => {
  if (code === 0) return '晴朗'
  if (code <= 3) return '部分多雲'
  if (code <= 48) return '有霧'
  if (code <= 67) return '下雨'
  if (code <= 77) return '下雪'
  if (code <= 82) return '陣雨'
  if (code <= 86) return '雨夾雪'
  return '雷暴'
}
```

---

## 9. 城市清單

應用程式展示的 12 個主要城市：

| 城市 | 緯度 | 經度 | 人口 |
|------|------|------|------|
| 台北 | 25.0330 | 121.5654 | 2,700,000 |
| 紐約 | 40.7128 | -74.0060 | 8,336,817 |
| 倫敦 | 51.5074 | -0.1278 | 8,982,000 |
| 東京 | 35.6762 | 139.6503 | 13,960,000 |
| 雪梨 | -33.8688 | 151.2093 | 5,312,000 |
| 巴黎 | 48.8566 | 2.3522 | 2,161,000 |
| 莫斯科 | 55.7558 | 37.6173 | 12,500,000 |
| 北京 | 39.9042 | 116.4074 | 21,540,000 |
| 開羅 | 30.0444 | 31.2357 | 20,900,000 |
| 里約熱內盧 | -22.9068 | -43.1729 | 6,748,000 |
| 開普敦 | -33.9249 | 18.4241 | 4,618,000 |
| 孟買 | 19.0760 | 72.8777 | 20,400,000 |

---

## 10. 開發指南

### 安裝相依套件
```bash
bun install
```

### 啟動開發伺服器
```bash
bun run dev
```
造訪：`http://localhost:3000`

### 建置正式環境版本
```bash
bun run build
```

### 產生靜態網站
```bash
bun run generate
```

### 預覽正式環境建置
```bash
bun run preview
```

---

## 11. 專案優勢

✅ **簡單清晰的架構** - 容易理解和維護
✅ **現代技術棧** - Vue 3、Nuxt 4、TypeScript
✅ **良好的關注點分離** - 元件職責明確
✅ **有效使用 Composition API** - 程式碼簡潔且型別安全
✅ **免費的天氣 API** - 無需申請金鑰
✅ **視覺效果出色** - 3D 地球視覺化引人注目

---

## 12. 改進建議

### 使用者體驗
- ⚠️ 新增錯誤處理 UI（目前只有 console.log）
- ⚠️ 為天氣取得新增載入狀態
- ⚠️ 新增鍵盤導覽支援
- ⚠️ 考慮快取天氣資料（避免重複請求）

### 功能擴充
- 📈 新增更多城市或使城市清單可設定
- 📈 支援使用者搜尋任意地點
- 📈 新增天氣預報（不僅僅是當前天氣）
- 📈 新增更多天氣指標（濕度、氣壓等）

### SEO 和無障礙性
- 🔍 新增 meta 標籤最佳化 SEO
- 🔍 新增 ARIA 標籤提升無障礙性
- 🔍 考慮新增伺服器端渲染的靜態頁面

### 程式碼品質
- 🧪 新增單元測試和整合測試
- 🧪 新增 ESLint 和 Prettier 設定
- 🧪 考慮新增 CI/CD 流程

---

## 13. 授權

GNU General Public License v3.0 - 開源 copyleft 授權

---

## 總結

這是一個**乾淨、專注的單頁應用程式**，展示了：
- 現代 Vue 3 和 Nuxt 4 模式
- 使用 globe.gl 進行 3D WebGL 視覺化
- 即時 API 整合
- 響應式、互動式 UI

專案非常適合作為互動式天氣視覺化展示，並為進一步開發提供了堅實的基礎。程式碼結構清晰，技術棧現代，適合學習和擴充。
