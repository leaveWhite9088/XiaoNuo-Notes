<script setup lang="ts">
/** 统一图标组件：<Icon name="i-search" :size="20" /> */
withDefaults(defineProps<{ name: string; size?: number | string }>(), { size: 20 });
</script>

<template>
  <svg class="icon" :width="size" :height="size" aria-hidden="true">
    <use :href="`#${name}`" />
  </svg>
</template>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
  flex: none;
}
</style>
