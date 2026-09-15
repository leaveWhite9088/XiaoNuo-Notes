<script setup>
import { ICONS } from '../icons/index.js';

defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 16 },
});
</script>

<template>
  <svg
    class="base-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    v-html="ICONS[name] || ''"
  />
</template>

<style scoped>
.base-icon {
  flex-shrink: 0;
  vertical-align: -0.125em;
}
</style>
