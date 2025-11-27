// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // 設定相容性日期，用於 Nuxt 內部的版本控制與功能標記
  compatibilityDate: '2024-04-03',

  // 啟用開發者工具 (DevTools)，方便在瀏覽器中除錯與查看狀態
  devtools: { enabled: true },

  // 註冊使用的模組
  // @nuxtjs/tailwindcss: 整合 Tailwind CSS 用於快速切版
  modules: ['@nuxtjs/tailwindcss'],

  // 伺服器端渲染 (Server-Side Rendering) 設定
  // 設為 false (SPA 模式)，因為 globe.gl 依賴瀏覽器的 window 物件與 WebGL，
  // 無法在 Node.js 伺服器環境中執行。
  ssr: false 
})
