<script setup>
/** 响应式视频网格 + 无限滚动哨兵 + 骨架屏。
 *  哨兵观察器常驻不断开：加载条件在回调里判断。列表/加载态每次变化后再做一次
 *  手动可见性检查，覆盖"上一分类已到底、切到新分类时哨兵仍在视口内"的场景。 */
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import VideoCard from './VideoCard.vue';

const props = defineProps({
  videos: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  hasMore: { type: Boolean, default: true },
  skeletonCount: { type: Number, default: 12 },
});
const emit = defineEmits(['load-more', 'dislike']);

const sentinel = ref(null);
let io = null;

function sentinelNearViewport() {
  const el = sentinel.value;
  if (!el) return false;
  return el.getBoundingClientRect().top < window.innerHeight + 600;
}

function maybeLoad() {
  if (!props.loading && props.hasMore && sentinelNearViewport()) emit('load-more');
}

onMounted(() => {
  io = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) maybeLoad();
    },
    { rootMargin: '600px 0px' },
  );
  if (sentinel.value) io.observe(sentinel.value);
});
onBeforeUnmount(() => io?.disconnect());

// 列表替换、追加、hasMore 恢复、loading 翻转后都可能需要补加载
watch(
  () => [props.videos.length, props.hasMore, props.loading],
  () => nextTick(maybeLoad),
);
</script>

<template>
  <div>
    <div class="grid">
      <VideoCard v-for="v in videos" :key="v.bvid" :video="v" @dislike="(id) => emit('dislike', id)" />
    </div>

    <div v-if="loading" class="grid">
      <div v-for="i in skeletonCount" :key="'sk' + i" class="skeleton-card">
        <div class="skeleton cover" />
        <div class="skeleton line" style="width: 92%" />
        <div class="skeleton line" style="width: 55%" />
      </div>
    </div>

    <div ref="sentinel" class="sentinel" />
    <div v-if="!hasMore && videos.length" class="end-mark">— 到底啦，换 个分区逛逛吧 —</div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 20px 16px;
}
.sentinel { height: 1px; }
.end-mark { text-align: center; color: var(--text-3); font-size: 13px; padding: 28px 0 40px; }
.skeleton-card .cover { aspect-ratio: 16 / 9; }
.skeleton-card .line { height: 16px; margin-top: 10px; }
</style>
