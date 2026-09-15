<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { api, type Section, type Video } from '@/api'
import SectionBoard from '@/components/SectionBoard.vue'
import VideoCard from '@/components/VideoCard.vue'
import RankList from '@/components/RankList.vue'

const sections = ref<Section[]>([])
const hot = ref<Video[]>([])
const recommend = ref<Video[]>([])
const loading = ref(true)

// 推广 banner
const banners = [
  { title: '黑神话：悟空 全流程攻略', sub: '新发布 · 限时', tint: 'linear-gradient(135deg, #ff8a3d 0%, #fb7299 100%)' },
  { title: 'iPhone 16 Pro 深度评测', sub: '数码区', tint: 'linear-gradient(135deg, #4dabff 0%, #00aeec 100%)' },
  { title: '一周热门视频盘点', sub: '本周精选', tint: 'linear-gradient(135deg, #b48bf2 0%, #fb7299 100%)' },
  { title: 'AI 绘画入门 30 分钟速成', sub: '知识区', tint: 'linear-gradient(135deg, #2ed8a7 0%, #00aeec 100%)' },
]
const bannerIdx = ref(0)

onMounted(async () => {
  try {
    const [home, hotR, recR] = await Promise.all([api.home(), api.hot(8), api.channel(0, 1, 20)])
    sections.value = home.data.sections
    hot.value = hotR.data.items
    recommend.value = recR.data.items
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

// 轮播
let timer: number | null = null
onMounted(() => {
  timer = window.setInterval(() => {
    bannerIdx.value = (bannerIdx.value + 1) % banners.length
  }, 4000)
})

const recommendSection = computed<Section | undefined>(() =>
  sections.value.find((s) => s.id === 'promote'),
)
</script>

<template>
  <div class="home">
    <div class="container">
      <!-- 顶部推广 banner -->
      <div class="promo">
        <div class="promo-banner">
          <transition name="banner" mode="out-in">
            <div class="banner-item" :key="bannerIdx" :style="{ background: banners[bannerIdx].tint }">
              <div class="bi-title">{{ banners[bannerIdx].title }}</div>
              <div class="bi-sub">{{ banners[bannerIdx].sub }}</div>
            </div>
          </transition>
          <div class="banner-dots">
            <span v-for="(b, i) in banners" :key="i" :class="{ active: i === bannerIdx }" @click="bannerIdx = i" />
          </div>
        </div>
        <div class="promo-side">
          <div class="side-card">
            <div class="sc-title">热门话题</div>
            <ul class="sc-list">
              <li v-for="(h, i) in hot.slice(0, 5)" :key="h.bvid">
                <span class="sc-no" :class="{ top3: i < 3 }">{{ i + 1 }}</span>
                <span class="sc-text ellipsis-1">{{ h.title }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div v-if="loading" class="placeholder">加载中…</div>

      <!-- 推荐流 -->
      <section v-if="recommend && recommend.length" class="recommend">
        <div class="rec-head">
          <h2 class="title">为你推荐</h2>
          <span class="subtitle">基于模拟数据的精选流</span>
          <div class="refresh">
            <button @click="recommend = [...recommend].reverse()">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M17.65 6.35A8 8 0 1 0 19.73 14h-2.1A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
              </svg>
              换一换
            </button>
          </div>
        </div>
        <div class="rec-grid">
          <VideoCard v-for="v in recommend" :key="v.bvid" :video="v" />
        </div>
      </section>

      <div class="two-col">
        <div class="col-main">
          <SectionBoard v-for="s in sections" :key="s.id" :section="s" />
        </div>
        <aside class="col-side">
          <RankList title="热门榜" :limit="10" />
          <div style="height: 16px"></div>
          <RankList :rid="1" title="动画热播" :limit="8" />
          <div style="height: 16px"></div>
          <RankList :rid="4" title="游戏热播" :limit="8" />
        </aside>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home {
  padding: 16px 0 32px;
}
.promo {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 16px;
  margin-bottom: 24px;
}
.promo-banner {
  position: relative;
  height: 180px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-1);
  .banner-item {
    position: absolute;
    inset: 0;
    color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 48px;
    .bi-title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    .bi-sub {
      font-size: 14px;
      opacity: 0.9;
    }
  }
  .banner-dots {
    position: absolute;
    bottom: 12px;
    right: 16px;
    display: flex;
    gap: 6px;
    span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: background 0.15s;
      &.active {
        background: #fff;
      }
    }
  }
}
.promo-side .side-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 16px;
  height: 100%;
  box-shadow: var(--shadow-1);
  .sc-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  .sc-list {
    li {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
      font-size: 13px;
      .sc-no {
        color: var(--text-3);
        font-weight: 600;
        width: 18px;
        font-family: 'Helvetica Neue', sans-serif;
        &.top3 {
          color: var(--brand);
        }
      }
      .sc-text {
        flex: 1;
        color: var(--text);
      }
      &:hover .sc-text {
        color: var(--brand);
      }
    }
  }
}
.placeholder {
  text-align: center;
  padding: 40px 0;
  color: var(--text-3);
}
.recommend {
  margin-bottom: 32px;
  .rec-head {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 16px;
    .title {
      font-size: 20px;
      font-weight: 600;
      margin: 0;
    }
    .subtitle {
      font-size: 13px;
      color: var(--text-3);
    }
    .refresh {
      margin-left: auto;
      button {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: var(--text-2);
        padding: 4px 10px;
        border-radius: var(--radius);
        &:hover {
          background: var(--bg-2);
          color: var(--brand);
        }
      }
    }
  }
  .rec-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px 12px;
  }
}
.two-col {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
}
.col-side {
  position: sticky;
  top: calc(var(--header-h) + 16px);
  align-self: start;
}
@media (max-width: 1100px) {
  .promo {
    grid-template-columns: 1fr;
  }
  .promo-side .side-card {
    display: none;
  }
  .two-col {
    grid-template-columns: 1fr;
  }
  .col-side {
    position: static;
  }
  .recommend .rec-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 640px) {
  .recommend .rec-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.banner-enter-active,
.banner-leave-active {
  transition: opacity 0.4s;
}
.banner-enter-from,
.banner-leave-to {
  opacity: 0;
}
</style>
