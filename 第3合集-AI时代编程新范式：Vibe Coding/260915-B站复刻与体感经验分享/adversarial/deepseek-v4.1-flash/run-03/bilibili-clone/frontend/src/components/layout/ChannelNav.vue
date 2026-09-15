<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Icon from '@/components/common/Icon.vue';
import type { Category } from '@/types';

/** 首页分区导航：hover 展开二级分区浮层（菜单展开交互） */
const props = defineProps<{ categories: Category[] }>();
const router = useRouter();

const activeSlug = ref<string | null>(null);
let hideTimer: ReturnType<typeof setTimeout> | null = null;

/** 各分区下的二级分区（静态配置，贴近真实分区结构） */
const SUB_CHANNELS: Record<string, string[]> = {
  douga: ['MAD·AMV', 'MMD·3D', '短片·手书·配音', '手办·模玩', '特摄', '动漫杂谈'],
  music: ['原创音乐', '翻唱', 'VOCALOID·UTAU', '演奏', 'MV', '音乐现场', '音乐综合'],
  dance: ['宅舞', '街舞', '明星舞蹈', '中国舞', '舞蹈教程', '舞蹈综合'],
  game: ['单机游戏', '网络游戏', '电子竞技', '手机游戏', '桌游棋牌', 'GMV', '音游'],
  knowledge: ['科学科普', '社科人文', '财经商业', '校园学习', '职业职场', '野生技术协会'],
  tech: ['数码', '软件应用', '计算机技术', '科工机械', 'DIY硬件', '手机平板'],
  sports: ['篮球', '足球', '健身', '竞技体育', '运动综合', '极限运动'],
  car: ['汽车生活', '汽车知识', '赛车', '摩托车', '改装玩车', '二手车'],
  life: ['日常', '搞笑', '手工', '绘画', '亲子', '出行', '三农'],
  food: ['美食制作', '美食侦探', '美食测评', '田园美食', '深夜食堂', '美食综合'],
  animal: ['喵星人', '汪星人', '大熊猫', '野生动物', '爬宠', '动物综合'],
  kichiku: ['鬼畜调教', '音MAD', '人力VOCALOID', '鬼畜剧场', '教程演示'],
  fashion: ['美妆护肤', '穿搭', '时尚潮流', '仿妆cos', '健身塑形', '时尚综合'],
  ent: ['综艺', '明星综合', '娱乐杂谈', '粉丝创作', '搞笑娱乐', '娱乐综合'],
  movie: ['影视杂谈', '影视剪辑', '预告·资讯', '电影', '电视剧', '纪录片'],
  documentary: ['人文历史', '科学探险', '美食纪录片', '自然', '社会观察', '人物传记'],
};

function show(slug: string) {
  if (hideTimer) clearTimeout(hideTimer);
  activeSlug.value = slug;
}
function hide() {
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    activeSlug.value = null;
  }, 140);
}

function go(slug: string) {
  activeSlug.value = null;
  void router.push({ name: 'category', params: { slug } });
}

function goKeyword(slug: string, kw: string) {
  activeSlug.value = null;
  void router.push({ name: 'search', query: { keyword: kw, category: slug } });
}
</script>

<template>
  <nav class="channel-nav">
    <div
      v-for="cat in props.categories"
      :key="cat.slug"
      class="channel"
      @mouseenter="show(cat.slug)"
      @mouseleave="hide"
    >
      <button class="channel__btn" :class="{ 'is-active': activeSlug === cat.slug }" @click="go(cat.slug)">
        <Icon :name="`c-${cat.icon}`" :size="28" class="channel__icon" />
        <span class="channel__name">{{ cat.name }}</span>
      </button>

      <!-- 二级分区浮层 -->
      <Transition name="fade">
        <div v-show="activeSlug === cat.slug" class="channel__panel">
          <div class="channel__panel-head">
            <Icon :name="`c-${cat.icon}`" :size="22" />
            <b>{{ cat.name }}</b>
            <button class="channel__more" @click="go(cat.slug)">进入分区 ›</button>
          </div>
          <div class="channel__tags">
            <button
              v-for="tag in SUB_CHANNELS[cat.slug] ?? ['综合']"
              :key="tag"
              class="channel__tag"
              @click="goKeyword(cat.slug, tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<style scoped>
.channel-nav {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
  gap: 6px;
  padding: 14px 0 6px;
}
.channel {
  position: relative;
}
.channel__btn {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 8px 4px;
  border-radius: var(--radius);
  color: var(--text-1);
  transition: all 0.18s;
}
.channel__btn:hover,
.channel__btn.is-active {
  background: var(--bg-gray);
  color: var(--bili-pink);
  transform: translateY(-1px);
}
.channel__icon {
  width: 28px;
  height: 28px;
}
.channel__name {
  font-size: 13px;
  white-space: nowrap;
}

.channel__panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  width: 340px;
  padding: 14px 16px 16px;
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-3);
  z-index: 50;
}
.channel__panel-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line-light);
  color: var(--bili-pink);
}
.channel__panel-head b {
  font-size: 15px;
  color: var(--text-1);
}
.channel__more {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-3);
}
.channel__more:hover {
  color: var(--bili-pink);
}
.channel__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.channel__tag {
  padding: 4px 10px;
  border-radius: 12px;
  background: var(--bg-gray);
  color: var(--text-2);
  font-size: 12px;
  transition: all 0.15s;
}
.channel__tag:hover {
  background: var(--bili-pink);
  color: #fff;
}
</style>
