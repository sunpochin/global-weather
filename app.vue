<template>
  <div class="min-h-screen bg-black text-white">
    <WeatherGlobe />
  </div>
</template>

<script setup>
import WeatherGlobe from '~/components/WeatherGlobe.vue';
</script>

<style>
body {
  margin: 0;
  padding: 0;
  overflow: hidden; /* Prevent scrollbars */
  background-color: black;
}
</style>
