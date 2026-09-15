<script setup>
/** 极简线性图标集（24x24，stroke=currentColor）。filled 集合使用填充路径。 */
import { computed } from 'vue';

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 18 },
});

const FILLED = new Set(['play', 'pause', 'star-fill', 'dots', 'rank-hot']);

const PATHS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  play: '<path d="M8 5.2v13.6L19 12z"/>',
  pause: '<path d="M7 5h3.4v14H7zM13.6 5H17v14h-3.4z"/>',
  like: '<path d="M7 11v9"/><path d="M7 11l3.7-6.6c.4-.8 1.4-1 2.1-.6.7.4 1 1.2.8 2L12.6 10h4.7c1.3 0 2.2 1.2 2 2.4l-1.1 5.9c-.2 1-1 1.7-2 1.7H7"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.2"/>',
  star: '<path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.6l-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/>',
  'star-fill': '<path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.6l-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/>',
  share: '<circle cx="6" cy="12" r="2.5"/><circle cx="17.6" cy="5.6" r="2.5"/><circle cx="17.6" cy="18.4" r="2.5"/><path d="M8.3 10.9l6.9-4.1M8.3 13.1l6.9 4.1"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.2 2"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  history: '<path d="M3.6 12a8.4 8.4 0 1 0 2.5-6"/><path d="M3.6 3.6V8H8"/><path d="M12 8v4.2l3 1.8"/>',
  message: '<path d="M4 6.6A2.6 2.6 0 0 1 6.6 4h10.8A2.6 2.6 0 0 1 20 6.6v7.8a2.6 2.6 0 0 1-2.6 2.6H9.6L5 20.4v-3.4A2.6 2.6 0 0 1 4 15V6.6z"/>',
  dynamic: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5"/>',
  vip: '<path d="M4 8l4 3.6L12 5l4 6.6L20 8l-1.6 11H5.6z"/>',
  upload: '<path d="M12 16V4.5M8 8.5l4-4 4 4"/><path d="M4.5 15v3A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5v-3"/>',
  'chevron-down': '<path d="M6 9l6 6 6-6"/>',
  fire: '<path d="M12 3.5c.6 2.6-.9 4.2-2.4 5.7S7 12 7 14.2a5 5 0 0 0 10 0c0-4.8-3.4-5.9-5-10.7z"/>',
  trash: '<path d="M4 7h16M9.5 7V4.8h5V7M6.5 7l.9 13.2h9.2L17.5 7"/><path d="M10 11v5.5M14 11v5.5"/>',
  send: '<path d="M21 3L10.5 13.5M21 3l-6.8 18-3.7-7.5L3 9.8z"/>',
  danmaku: '<path d="M4 6.6A2.6 2.6 0 0 1 6.6 4h10.8A2.6 2.6 0 0 1 20 6.6v7.8a2.6 2.6 0 0 1-2.6 2.6H10l-4.6 3.4V17h-.8A2.6 2.6 0 0 1 4 15.6z"/><path d="M8 9h8M8 12.2h5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
  dots: '<circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/>',
  'rank-hot': '<path d="M12 3.5c.6 2.6-.9 4.2-2.4 5.7S7 12 7 14.2a5 5 0 0 0 10 0c0-4.8-3.4-5.9-5-10.7z"/>',
  arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  reply: '<path d="M4 6.6A2.6 2.6 0 0 1 6.6 4h10.8A2.6 2.6 0 0 1 20 6.6v7.8a2.6 2.6 0 0 1-2.6 2.6H9.6L5 20.4v-3.4A2.6 2.6 0 0 1 4 15V6.6z"/><path d="M9 12h6"/>',
};

const filled = computed(() => FILLED.has(props.name));
const inner = computed(() => PATHS[props.name] || PATHS.dots);
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    :fill="filled ? 'currentColor' : 'none'"
    :stroke="filled ? 'none' : 'currentColor'"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="inner"
  />
</template>
