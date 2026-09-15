<script setup lang="ts">
/** 视频卡片骨架屏 */
</script>

<template>
  <div class="skeleton">
    <div class="skeleton__cover"></div>
    <div class="skeleton__info">
      <div class="skeleton__line skeleton__line--title"></div>
      <div class="skeleton__line skeleton__line--title short"></div>
      <div class="skeleton__line skeleton__line--meta"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  display: flex;
  gap: 12px;
  padding: 8px;
}
.skeleton__cover {
  width: 200px;
  aspect-ratio: 16 / 10;
  border-radius: var(--radius);
  flex: none;
  background: linear-gradient(90deg, #f1f2f3 25%, #e8eaec 37%, #f1f2f3 63%);
  background-size: 400% 100%;
  animation: shimmer 1.3s ease infinite;
}
.skeleton__info {
  flex: 1;
  padding-top: 4px;
}
.skeleton__line {
  height: 14px;
  border-radius: 4px;
  margin-bottom: 10px;
  background: linear-gradient(90deg, #f1f2f3 25%, #e8eaec 37%, #f1f2f3 63%);
  background-size: 400% 100%;
  animation: shimmer 1.3s ease infinite;
}
.skeleton__line--title {
  width: 92%;
}
.skeleton__line--title.short {
  width: 60%;
}
.skeleton__line--meta {
  width: 38%;
  height: 12px;
  margin-top: 18px;
}
@keyframes shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
