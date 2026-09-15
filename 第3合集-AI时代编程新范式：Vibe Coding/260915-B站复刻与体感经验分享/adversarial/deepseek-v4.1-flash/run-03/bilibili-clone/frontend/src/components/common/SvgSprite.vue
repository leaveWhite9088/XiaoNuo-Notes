<script setup lang="ts">
/**
 * 全局 SVG 图标精灵：所有图标集中定义，Icon 组件通过 <use> 引用。
 * UI 图标使用 currentColor，分区图标带品牌色。
 */
</script>

<template>
  <svg class="svg-sprite" aria-hidden="true">
    <defs>
      <!-- ===== UI 图标 ===== -->
      <symbol id="i-search" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14"
        />
      </symbol>
      <symbol id="i-play" viewBox="0 0 24 24">
        <path fill="currentColor" d="M8 5v14l11-7z" />
      </symbol>
      <symbol id="i-pause" viewBox="0 0 24 24">
        <path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z" />
      </symbol>
      <symbol id="i-danmaku" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M20 3H4a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h5v3l4-3h7a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1M8 11H6V9h2zm4 0h-2V9h2zm6 0h-5V9h5z"
        />
      </symbol>
      <symbol id="i-like" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M20 8h-5.6l.9-4.3A1.6 1.6 0 0 0 13.8 2h-1.3a1 1 0 0 0-.9.6L8.2 9H3v11h17a1.5 1.5 0 0 0 1.5-1.2l1.4-8A1.5 1.5 0 0 0 21.5 9a1.5 1.5 0 0 0-1.5-1M6.5 18A1.5 1.5 0 1 1 8 16.5 1.5 1.5 0 0 1 6.5 18"
        />
      </symbol>
      <symbol id="i-coin" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m2.7 8.7A1.3 1.3 0 0 0 13.4 12h-1.2a.2.2 0 0 1 0-.4h1.9a1 1 0 1 0 0-2h-.4V9a1 1 0 0 0-2 0v.6h-.4a2.2 2.2 0 0 0 0 4.4h1.2a.2.2 0 1 1 0 .4H10.3a1 1 0 1 0 0 2h.6V17a1 1 0 1 0 2 0v-.6h.4a2.2 2.2 0 0 0 2.2-2.2 2.2 2.2 0 0 0-1-1.5"
        />
      </symbol>
      <symbol id="i-favorite" viewBox="0 0 24 24">
        <path fill="currentColor" d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
      </symbol>
      <symbol id="i-share" viewBox="0 0 24 24">
        <path fill="currentColor" d="M14 5v4C7 9.6 4.6 14.6 4 19c2.6-3.6 5.6-4.5 10-4.5V19l8-7z" />
      </symbol>
      <symbol id="i-message" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 3c5 0 9 3.1 9 7s-4 7-9 7a12 12 0 0 1-2.6-.3L5 19l.8-2.9C4.1 14.9 3 12.6 3 10c0-3.9 4-7 9-7"
        />
      </symbol>
      <symbol id="i-dynamic" viewBox="0 0 24 24">
        <path fill="currentColor" d="M4 5h16v2.2H4zm0 5.9h16v2.2H4zM4 16.8h10v2.2H4z" />
      </symbol>
      <symbol id="i-history" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 4a8 8 0 1 1-7.4 5H2.4A10 10 0 1 0 12 2v3l4-4-4-4zm1 4h-2v6l5 2 .9-1.6-3.9-1.6z"
        />
      </symbol>
      <symbol id="i-crown" viewBox="0 0 24 24">
        <path fill="currentColor" d="m3 8 4 3 5-7 5 7 4-3-2 11H5z" />
      </symbol>
      <symbol id="i-upload" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 3 6.5 9h3.6v6h3.8V9h3.6zM4 17h16v3H4z" />
      </symbol>
      <symbol id="i-user" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5m0 2c-4 0-9 2-9 5v3h18v-3c0-3-5-5-9-5" />
      </symbol>
      <symbol id="i-more" viewBox="0 0 24 24">
        <path fill="currentColor" d="M5 10.5a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 5 10.5m7 0A1.5 1.5 0 1 0 13.5 12 1.5 1.5 0 0 0 12 10.5m7 0A1.5 1.5 0 1 0 20.5 12 1.5 1.5 0 0 0 19 10.5" />
      </symbol>
      <symbol id="i-close" viewBox="0 0 24 24">
        <path fill="currentColor" d="m18.3 5.7-1.4-1.4L12 9.2 7.1 4.3 5.7 5.7l4.9 4.9-4.9 4.9 1.4 1.4 4.9-4.9 4.9 4.9 1.4-1.4-4.9-4.9z" />
      </symbol>
      <symbol id="i-left" viewBox="0 0 24 24">
        <path fill="currentColor" d="M15.4 4.6 8 12l7.4 7.4 1.4-1.4L10.8 12l6-6z" />
      </symbol>
      <symbol id="i-right" viewBox="0 0 24 24">
        <path fill="currentColor" d="m8.6 19.4 7.4-7.4-7.4-7.4L7.2 6l6 6-6 6z" />
      </symbol>
      <symbol id="i-top" viewBox="0 0 24 24">
        <path fill="currentColor" d="m12 4 8 8h-5v8H9v-8H4z" />
      </symbol>
      <symbol id="i-volume" viewBox="0 0 24 24">
        <path fill="currentColor" d="M4 9h4l5-4v14l-5-4H4zm12.5 3a3.5 3.5 0 0 1-1.5 2.9V9.1a3.5 3.5 0 0 1 1.5 2.9m-1.5-7.6v2.1a6.5 6.5 0 0 1 0 11v2.1a8.5 8.5 0 0 0 0-15.2" />
      </symbol>
      <symbol id="i-muted" viewBox="0 0 24 24">
        <path fill="currentColor" d="M4 9h4l5-4v14l-5-4H4zm16.5-1.1-1.4-1.4-2.1 2.1-2.1-2.1-1.4 1.4L15.6 10l-2.1 2.1 1.4 1.4 2.1-2.1 2.1 2.1 1.4-1.4L18.4 10z" />
      </symbol>
      <symbol id="i-fullscreen" viewBox="0 0 24 24">
        <path fill="currentColor" d="M4 9h2V6h3V4H4zm13-3h3v3h2V4h-5zM6 15H4v5h5v-2H6zm14 0h-2v3h-3v2h5z" />
      </symbol>
      <symbol id="i-clock" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m1 5h-2v6l5 3 1-1.7-4-2.3z" />
      </symbol>
      <symbol id="i-fire" viewBox="0 0 24 24">
        <path fill="currentColor" d="M13 2c1 4-3 5-3 9a4 4 0 0 0 8 0c0-1.5-.5-2.7-1.2-3.8C19 9 21 11.6 21 14.5A7.5 7.5 0 0 1 6 20c-.6-1.3-1-2.7-1-4 0-4 3-6 5-8.5 1.6-2 2.6-3.6 3-5.5" />
      </symbol>
      <symbol id="i-live" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6m0 3.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5M6 19l-3 3 1.5-4.5zM18 19l3 3-1.5-4.5z" />
      </symbol>
      <symbol id="i-bilibili" viewBox="0 0 40 28">
        <path
          fill="currentColor"
          d="M9.7 1 5 6.2v2.6h30V6.2L30.3 1h-3.9l-2.6 2.9h-.4L20.8 1h-3.6l-2.6 2.9h-.4L11.6 1zM5 11.5V25a2 2 0 0 0 2 2h26a2 2 0 0 0 2-2V11.5zm9 4.6h2v4.4h-2zm10 0h2v4.4h-2z"
        />
      </symbol>

      <!-- ===== 分区图标（带品牌色） ===== -->
      <symbol id="c-home" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#FB7299" />
        <path d="M10 16.5 16 11l6 5.5V23h-4v-4h-4v4h-4z" fill="#fff" />
      </symbol>
      <symbol id="c-douga" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#FF8CB2" />
        <path d="M10 12h12v10H10z" fill="#fff" />
        <path d="M12 8l2 3.5M20 8l-2 3.5" stroke="#fff" stroke-width="2" fill="none" />
      </symbol>
      <symbol id="c-music" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#7C4DFF" />
        <path d="M20 9v9.5a3.5 3.5 0 1 1-2-3.2V12l-6 1.4v8.1a3.5 3.5 0 1 1-2-3.2V11z" fill="#fff" />
      </symbol>
      <symbol id="c-dance" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#FF5C8A" />
        <circle cx="16" cy="11" r="2.6" fill="#fff" />
        <path d="M16 14.5c2 0 3 1.4 3 3.2l-1.4 6h-1.4l.4-4.4-1.8 4.4h-3l2-4.6c.3-2.4 1.4-4.6 2.2-4.6" fill="#fff" />
      </symbol>
      <symbol id="c-game" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#00AEEC" />
        <rect x="9" y="12" width="14" height="9" rx="4" fill="#fff" />
        <path d="M12.5 15v3M11 16.5h3M19 15.5h1.6M19 18h1.6" stroke="#00AEEC" stroke-width="1.6" stroke-linecap="round" />
      </symbol>
      <symbol id="c-knowledge" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#FF9F0A" />
        <path d="M8 12h16v9H8z" fill="#fff" />
        <path d="M10 14h6v1.6h-6zM10 17h10v1.6H10z" fill="#FF9F0A" />
      </symbol>
      <symbol id="c-tech" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#00C48C" />
        <rect x="9" y="10" width="14" height="10" rx="1.5" fill="#fff" />
        <path d="M12 23h8" stroke="#fff" stroke-width="2" stroke-linecap="round" />
        <path d="M12 13h8v1.4h-8z" fill="#00C48C" />
      </symbol>
      <symbol id="c-sports" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#FF6B35" />
        <circle cx="16" cy="16" r="7" fill="#fff" />
        <path d="M16 9c2 2 2 12 0 14M9 16h14" stroke="#FF6B35" stroke-width="1.6" fill="none" />
      </symbol>
      <symbol id="c-car" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#4A90E2" />
        <path d="M9 18h14l-1.6-5H10.6z" fill="#fff" />
        <circle cx="12" cy="20" r="1.8" fill="#fff" />
        <circle cx="20" cy="20" r="1.8" fill="#fff" />
      </symbol>
      <symbol id="c-life" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#FFB020" />
        <path d="M12 22V10h5a3 3 0 0 1 0 6h-3v6z" fill="#fff" />
      </symbol>
      <symbol id="c-food" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#FF7A45" />
        <path d="M10 15h12a6 6 0 0 1-6 6 6 6 0 0 1-6-6" fill="#fff" />
        <path d="M11 22h10v1.6H11z" fill="#fff" />
      </symbol>
      <symbol id="c-animal" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#F2994A" />
        <path d="M11 12l1.5 4h7L21 12l1.5 5.5c0 3.5-2.8 5.5-6.5 5.5S9.5 21 9.5 17.5z" fill="#fff" />
      </symbol>
      <symbol id="c-kichiku" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#9B51E0" />
        <circle cx="13" cy="14.5" r="1.8" fill="#fff" />
        <circle cx="19" cy="14.5" r="1.8" fill="#fff" />
        <path d="M11 19c2 2.4 8 2.4 10 0" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" />
      </symbol>
      <symbol id="c-fashion" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#E64A9B" />
        <path d="M16 9l4 3-1.5 3.5V23h-5v-7.5L12 12z" fill="#fff" />
      </symbol>
      <symbol id="c-ent" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#F2C94C" />
        <path d="M11 11h10v10H11z" fill="#fff" />
        <path d="M13.5 13.5h5v5h-5z" fill="#F2C94C" />
      </symbol>
      <symbol id="c-movie" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#5B6BF0" />
        <path d="M9 12h14v9H9z" fill="#fff" />
        <path d="M9 12l2.5 2.5L12 12M16 12l2.5 2.5L19 12M9 18.5l2.5 2.5 1.5-2.5" stroke="#5B6BF0" stroke-width="1.2" fill="none" />
      </symbol>
      <symbol id="c-documentary" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#2D9CDB" />
        <circle cx="16" cy="16" r="5" fill="#fff" />
        <path d="M16 8v3M16 21v3M8 16h3M21 16h3" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
      </symbol>
    </defs>
  </svg>
</template>

<style scoped>
.svg-sprite {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}
</style>
