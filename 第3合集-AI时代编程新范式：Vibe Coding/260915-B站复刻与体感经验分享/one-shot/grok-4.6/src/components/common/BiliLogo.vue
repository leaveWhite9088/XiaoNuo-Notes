<template>
  <span class="logo" :class="variant">
    <svg class="tv" viewBox="0 0 28 28" aria-hidden="true">
      <path d="M8.2 5.2 6.1 2.4M19.8 5.2l2.1-2.8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      <rect x="2.2" y="6.2" width="23.6" height="17.2" rx="5" fill="currentColor"/>
      <ellipse cx="10.2" cy="14.6" rx="2.4" ry="3.1" fill="#fff"/>
      <ellipse cx="17.8" cy="14.6" rx="2.4" ry="3.1" fill="#fff"/>
    </svg>
    <span v-if="withWord" class="word">bilibili</span>
  </span>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'pink' },
  withWord: { type: Boolean, default: false }
})
</script>

<style scoped>
.logo { display: inline-flex; align-items: center; gap: 6px; }
.tv { width: 22px; height: 22px; display: block; }
.pink { color: #fb7299; }
.white { color: #fff; }
.word {
  font-weight: 800;
  letter-spacing: -0.6px;
  font-size: 22px;
  font-family: "Trebuchet MS", "PingFang SC", sans-serif;
}
</style>
