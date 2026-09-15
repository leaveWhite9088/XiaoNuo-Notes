<template>
  <div class="banner">
    <img src="/images/banner.jpg" alt="" />
    <div class="mask"></div>
    <router-link to="/" class="wordmark" aria-label="哔哩哔哩">
      <BiliLogo variant="white" with-word />
    </router-link>
  </div>
</template>

<script setup>
import BiliLogo from '../common/BiliLogo.vue'
</script>

<style scoped>
.banner {
  position: relative;
  height: calc(var(--header-h) + var(--banner-h));
  margin-top: calc(-1 * var(--header-h));
  overflow: hidden;
  background: #c99a72;
}
img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
}
.mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,.28) 0%, transparent 42%, rgba(0,0,0,.18) 100%);
  pointer-events: none;
}
.wordmark {
  position: absolute;
  left: 28px;
  bottom: 18px;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,.25));
}
.wordmark :deep(.tv) { width: 42px; height: 42px; }
.wordmark :deep(.word) { font-size: 34px; }
</style>
