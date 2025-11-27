<template>
  <!-- 
    應用程式根容器 
    min-h-screen: 確保至少佔滿整個螢幕高度
    bg-black: 設定黑色背景，配合外太空主題
    text-white: 設定預設文字顏色為白色
  -->
  <div class="min-h-screen bg-black text-white">
    <!-- 引入主要的天氣地球組件 -->
    <WeatherGlobe />
  </div>
</template>

<script setup>
// 引入 WeatherGlobe 組件
import WeatherGlobe from '~/components/WeatherGlobe.vue';
</script>

<style>
/* 全域樣式設定 */
body {
  margin: 0;
  padding: 0;
  overflow: hidden; /* 防止出現捲軸，保持沉浸式體驗 */
  background-color: black; /* 確保背景全黑 */
}
</style>
