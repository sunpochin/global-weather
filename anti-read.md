# Global Weather Project Analysis

這是一個基於 **Nuxt 3** 的互動式 3D 地球天氣應用程式。

## 1. 技術棧 (Tech Stack)

- **核心框架**: [Nuxt 3](https://nuxt.com/) (v4.2.1) - 使用 Vue 3 的全端框架。
- **UI 框架**: [Vue 3](https://vuejs.org/) (v3.5.25) - 組合式 API (Composition API)。
- **樣式庫**: [Tailwind CSS](https://tailwindcss.com/) - 用於快速切版與響應式設計。
- **3D 視覺化**: [globe.gl](https://github.com/vasturiano/globe.gl) - 基於 Three.js 的地球視覺化庫。
- **天氣資料**: [Open-Meteo API](https://open-meteo.com/) - 免費的天氣預報 API (無需 Key)。
- **套件管理**: [Bun](https://bun.sh/) - 快速的 JavaScript 執行環境與套件管理器。

## 2. 專案結構 (Project Structure)

```
/
├── app.vue                 # 應用程式入口點
├── components/
│   └── WeatherGlobe.vue    # 核心組件：包含 3D 地球與天氣邏輯
├── nuxt.config.ts          # Nuxt 設定檔 (SSR disabled)
├── package.json            # 專案依賴定義
└── public/                 # 靜態資源 (目前似乎未被大量使用)
```

## 3. 核心邏輯分析

### `nuxt.config.ts`
- **SSR Disabled**: 設定了 `ssr: false`。這是因為 `globe.gl` 依賴瀏覽器的 `window` 和 WebGL 環境，無法在伺服器端渲染。

### `components/WeatherGlobe.vue`
這是整個應用最核心的部分：

1.  **初始化 (Initialization)**:
    - 使用 `process.client` 檢查，確保只在客戶端載入 `globe.gl`。
    - 載入地球貼圖 (Blue Marble)、地形圖 (Topology) 和背景星空圖。

2.  **城市資料 (City Data)**:
    - 內建一個 `cities` 陣列，包含主要城市 (台北、紐約、倫敦等) 的經緯度與人口資訊。
    - 這些城市被繪製為地球上的「點」(`pointsData`) 和「標籤」(`labelsData`)。

3.  **互動 (Interaction)**:
    - **點擊事件**: 點擊城市時，會觸發 `fetchWeather` 函數。
    - **視角移動**: 使用 `globe.pointOfView` 平滑飛行到選定的城市上方。

4.  **天氣獲取 (Data Fetching)**:
    - `fetchWeather(lat, lng)`: 發送請求到 Open-Meteo API。
    - 獲取當前溫度、天氣代碼 (Weather Code)、風速等資訊。
    - `getWeatherDescription`: 將 WMO 天氣代碼轉換為文字描述 (如 "Clear sky", "Rain")。

5.  **UI 展示**:
    - 有一個懸浮的卡片 (Modal) 顯示選定城市的天氣資訊。
    - 包含 Loading 狀態與錯誤處理。

## 4. 資料流 (Data Flow)

1.  **User Action**: 使用者點擊地球上的城市。
2.  **Event**: 觸發 `onPointClick` 或 `onLabelClick`。
3.  **API Call**: 前端直接 fetch `api.open-meteo.com`。
4.  **State Update**: 更新 `weatherData` ref。
5.  **Re-render**: Vue 響應式更新 UI，顯示天氣卡片。

## 5. 潛在優化建議

- **組件拆分**: `WeatherGlobe.vue` 稍顯龐大，可以將「天氣卡片」拆分為獨立組件 `WeatherCard.vue`。
- **環境變數**: 目前 API URL 是硬編碼的，雖然 Open-Meteo 免費，但若未來更換 API，建議移至 `runtimeConfig`。
- **類型定義**: 目前使用 JavaScript，若能補上 TypeScript 介面 (如 `City`, `WeatherData`) 會更穩健。
