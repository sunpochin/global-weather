<template>
  <div class="relative w-full h-screen bg-black overflow-hidden">
    <!-- 3D 地球的掛載容器 -->
    <div ref="globeContainer" class="w-full h-full"></div>

    <!-- 載入中遮罩 (Loading Overlay) -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10 pointer-events-none">
      <div class="text-white text-xl font-bold animate-pulse">Loading Globe...</div>
    </div>

    <!-- 天氣資訊卡片 (Weather Modal) -->
    <!-- 當 selectedCity 有值時顯示 -->
    <div v-if="selectedCity" class="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-2xl text-white max-w-sm w-full transition-all duration-300 z-20">
      <div class="flex justify-between items-start mb-4">
        <div>
          <!-- 城市名稱與經緯度 -->
          <h2 class="text-2xl font-bold">{{ selectedCity.name }}</h2>
          <p class="text-sm text-gray-300">Lat: {{ selectedCity.lat.toFixed(2) }}, Lng: {{ selectedCity.lng.toFixed(2) }}</p>
        </div>
        <!-- 關閉按鈕 -->
        <button @click="selectedCity = null" class="text-gray-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 天氣資料顯示區 -->
      <div v-if="weatherData" class="space-y-4">
        <div class="flex items-center justify-between">
          <!-- 溫度 -->
          <div class="text-4xl font-bold">{{ weatherData.current_weather.temperature }}°C</div>
          <div class="text-right">
            <!-- 天氣描述 (如: Clear sky) -->
            <div class="text-lg font-medium">{{ getWeatherDescription(weatherData.current_weather.weathercode) }}</div>
            <!-- 風速 -->
            <div class="text-sm text-gray-300">Wind: {{ weatherData.current_weather.windspeed }} km/h</div>
          </div>
        </div>
        
        <div class="border-t border-white/10 pt-4 mt-4">
           <div class="grid grid-cols-2 gap-4 text-sm">
             <div>
               <span class="block text-gray-400">Elevation</span>
               <span class="font-medium">{{ weatherData.elevation }}m</span>
             </div>
             <div>
               <span class="block text-gray-400">Time</span>
               <span class="font-medium">{{ new Date(weatherData.current_weather.time).toLocaleTimeString() }}</span>
             </div>
           </div>
        </div>
      </div>
      <!-- 資料載入中顯示 Spinner -->
      <div v-else class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    </div>
    
    <!-- 底部提示文字 -->
    <div class="absolute bottom-4 left-4 text-white/50 text-xs pointer-events-none">
      Click on a city to view weather
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// Globe 變數，稍後動態引入 (因為 globe.gl 不支援 SSR)
let Globe = null;

// Refs 定義
const globeContainer = ref(null); // DOM 參考
const loading = ref(true);        // 載入狀態
const selectedCity = ref(null);   // 當前選中的城市
const weatherData = ref(null);    // API 回傳的天氣資料
const globeInstance = ref(null);  // Globe 實例

// 範例城市資料 (Sample City Data)
// 包含名稱、經緯度與人口數
const cities = [
  { name: 'Taipei', lat: 25.0330, lng: 121.5654, population: 2600000 },
  { name: 'New York', lat: 40.7128, lng: -74.0060, population: 8400000 },
  { name: 'London', lat: 51.5074, lng: -0.1278, population: 8900000 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, population: 14000000 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, population: 5300000 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, population: 2100000 },
  { name: 'Moscow', lat: 55.7558, lng: 37.6173, population: 12600000 },
  { name: 'Beijing', lat: 39.9042, lng: 116.4074, population: 21500000 },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357, population: 9900000 },
  { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, population: 6700000 },
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241, population: 4300000 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, population: 20000000 },
];

// WMO 天氣代碼轉換表 (WMO Weather interpretation codes)
// 參考: https://open-meteo.com/en/docs
const getWeatherDescription = (code) => {
  const codes = {
    0: 'Clear sky',
    1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog',
    51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
    61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
    71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
    95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail'
  };
  return codes[code] || 'Unknown';
};

// 獲取天氣資料 (Fetch Weather Data)
// 使用 Open-Meteo 免費 API
const fetchWeather = async (lat, lng) => {
  weatherData.value = null; // 重置資料以顯示 Loading
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
    const data = await response.json();
    weatherData.value = data;
  } catch (error) {
    console.error('Error fetching weather:', error);
  }
};

// 組件掛載後執行
onMounted(async () => {
  // 僅在客戶端執行 (Client-side only)
  if (process.client) {
    // 動態引入 globe.gl 模組
    const module = await import('globe.gl');
    Globe = module.default;

    // 初始化 Globe
    const globe = Globe()
      (globeContainer.value)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg') // 地球貼圖
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')     // 地形凹凸圖
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')    // 背景星空
      .pointsData(cities)           // 設定點資料
      .pointAltitude(0.05)          // 點的高度
      .pointColor(() => '#ffcc00')  // 點的顏色 (黃色)
      .pointRadius(0.5)             // 點的半徑
      .pointsMerge(true)            // 效能優化：合併幾何體
      .onPointClick((point) => {    // 點擊事件處理
        selectedCity.value = point;
        fetchWeather(point.lat, point.lng);
        
        // 視角飛行動畫
        globe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 2 }, 1000);
      })
      .pointLabel(d => `
        <div style="background: rgba(0,0,0,0.8); color: white; padding: 4px 8px; border-radius: 4px; font-family: sans-serif;">
          <b>${d.name}</b>
        </div>
      `); // 滑鼠懸停時的標籤 (Tooltip)

    // 添加文字標籤 (Labels) 以增加可讀性
    globe
      .labelsData(cities)
      .labelLat(d => d.lat)
      .labelLng(d => d.lng)
      .labelText(d => d.name)
      .labelSize(1.5)
      .labelDotRadius(0.5)
      .labelColor(() => 'white')
      .labelResolution(2)
      .onLabelClick((d) => { // 點擊文字標籤也觸發相同行為
          selectedCity.value = d;
          fetchWeather(d.lat, d.lng);
          globe.pointOfView({ lat: d.lat, lng: d.lng, altitude: 2 }, 1000);
      });

    // 自動旋轉設定
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.5;

    globeInstance.value = globe;
    loading.value = false; // 隱藏 Loading 遮罩
    
    // 監聽視窗大小改變，調整 Globe 大小
    window.addEventListener('resize', () => {
      globe.width(window.innerWidth);
      globe.height(window.innerHeight);
    });
  }
});

onBeforeUnmount(() => {
    // 清理工作 (Cleanup)
    // globe.gl 沒有嚴格的 destroy 方法，主要依賴 Vue 的組件銷毀機制與垃圾回收
    // 這裡可以移除事件監聽器等
});
</script>

<style>
/* 確保 Tooltip 不會被遮擋 */
.scene-tooltip {
  z-index: 1000;
}
</style>
