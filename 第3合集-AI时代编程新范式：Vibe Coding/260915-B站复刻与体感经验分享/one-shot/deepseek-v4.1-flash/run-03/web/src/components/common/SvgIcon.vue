<template>
  <svg
    class="svg-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    :fill="filled ? 'currentColor' : 'none'"
    :stroke="filled ? 'none' : 'currentColor'"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="(d, i) in paths" :key="i" :d="d" />
  </svg>
</template>

<script setup>
import { computed } from 'vue';

/**
 * 轻量图标组件：内置一套 24x24 线性图标，避免引入整包图标库。
 */
const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 18 },
  filled: { type: Boolean, default: false },
  strokeWidth: { type: [Number, String], default: 1.8 },
});

const ICONS = {
  search: ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z', 'M20 20l-3.6-3.6'],
  home: ['M3 10.5 12 3l9 7.5', 'M5.5 9.5V20h13V9.5', 'M9.5 20v-5h5v5'],
  play: ['M8 5.5v13l10-6.5-10-6.5Z'],
  playFill: ['M8 5.5v13l10-6.5-10-6.5Z'],
  pause: ['M9 5v14', 'M15 5v14'],
  game: ['M7 8h10a5 5 0 0 1 0 10H7A5 5 0 0 1 7 8Z', 'M9.5 12v2', 'M8.5 13h2', 'M15 12.5h.01', 'M16.5 13.5h.01'],
  danmaku: ['M4 5h16v11H9l-4 3v-3H4V5Z', 'M8 9h7', 'M8 12h4'],
  like: ['M7 10v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Z',
    'M7 10l4-7a2 2 0 0 1 2 2v3h5.2a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17 19H7'],
  coin: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 8v8', 'M9 11h6'],
  favorite: ['M12 20s-7-4.6-7-9.4A4 4 0 0 1 12 8a4 4 0 0 1 7 2.6C19 15.4 12 20 12 20Z'],
  share: ['M14 4h6v6', 'M20 4 10 14', 'M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5'],
  message: ['M4 5h16v11H9l-4 3v-3H4V5Z'],
  history: ['M12 7v5l3 2', 'M3.5 12a8.5 8.5 0 1 0 2.6-6.1', 'M3.5 4.5V9H8'],
  collect: ['M6 3h12v18l-6-4.2L6 21V3Z'],
  create: ['M12 5v14', 'M5 12h14'],
  upload: ['M12 19V5', 'M6 11l6-6 6 6'],
  download: ['M12 4v10', 'M8 11l4 4 4-4', 'M5 19h14'],
  arrowRight: ['M9 5l7 7-7 7'],
  arrowLeft: ['M15 5l-7 7 7 7'],
  arrowUp: ['M12 19V5', 'M5 12l7-7 7 7'],
  arrowDown: ['M12 5v14', 'M19 12l-7 7-7-7'],
  more: ['M6 12h.01', 'M12 12h.01', 'M18 12h.01'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  fullscreen: ['M4 9V4h5', 'M20 9V4h-5', 'M4 15v5h5', 'M20 15v5h-5'],
  volume: ['M11 5 6 9H3v6h3l5 4V5Z', 'M16 9a4 4 0 0 1 0 6', 'M18.5 6.5a8 8 0 0 1 0 11'],
  mute: ['M11 5 6 9H3v6h3l5 4V5Z', 'M17 9l4 6', 'M21 9l-4 6'],
  setting: ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    'M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 13.9H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7.5l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 3.6V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.6 1.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z'],
  dynamic: ['M4 6h16', 'M4 12h10', 'M4 18h7', 'M18 12v6', 'M15 15h6'],
  popular: ['M12 3c1 3 4 4 4 7a4 4 0 0 1-8 0c0-1 .4-1.8 1-2.6C8 9 7 11 7 13a5 5 0 0 0 10 0c0-4-3-6-5-10Z'],
  channel: ['M4 5h16v14H4z', 'M4 10h16', 'M9 10v9'],
  column: ['M5 4h14v16H5z', 'M8 8h8', 'M8 12h8', 'M8 16h5'],
  activity: ['M4 12h4l2-5 4 10 2-5h4'],
  community: ['M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M3 20a6 6 0 0 1 12 0', 'M16 11a3 3 0 1 0 0-6', 'M17 20a6 6 0 0 0-2-4.5'],
  live: ['M4 7h16v12H4z', 'M8 4 5 7', 'M16 4l3 3', 'M12 11v4l3-2-3-2Z'],
  playlist: ['M4 6h11', 'M4 12h11', 'M4 18h8', 'M17 14l4 3-4 3v-6Z'],
  vip: ['M4 7l4 4 4-6 4 6 4-4v10H4V7Z'],
  bell: ['M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16Z', 'M10 20a2 2 0 0 0 4 0'],
  fire: ['M12 3c1 3 4 4 4 7a4 4 0 0 1-8 0c0-1 .4-1.8 1-2.6C8 9 7 11 7 13a5 5 0 0 0 10 0c0-4-3-6-5-10Z'],
  refresh: ['M20 12a8 8 0 1 1-2.3-5.7', 'M20 4v5h-5'],
  eye: ['M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
  picture: ['M4 5h16v14H4z', 'M4 15l4-4 4 4 3-3 5 5', 'M8.5 9.5h.01'],
  lightning: ['M13 3 5 14h6l-1 7 8-11h-6l1-7Z'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7v5l3 2'],
  banner: ['M4 6h16v12H4z', 'M4 10h16'],
};

const paths = computed(() => ICONS[props.name] || ICONS.play);
</script>

<style scoped>
.svg-icon {
  display: block;
  flex: none;
}
</style>
