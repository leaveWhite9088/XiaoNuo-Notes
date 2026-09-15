<script setup>
/** 视频详情页：真实播放 + 弹幕 + 点赞/投币/收藏/分享 + UP 信息 + 评论 + 相关推荐 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../api';
import BIcon from '../components/BIcon.vue';
import DanmakuPlayer from '../components/DanmakuPlayer.vue';
import { useUserStore } from '../stores/user';
import { useToastStore } from '../stores/toast';
import { formatCount, formatDate, timeAgo } from '../utils/format';

const route = useRoute();
const router = useRouter();
const user = useUserStore();
const toast = useToastStore();

const video = ref(null);
const related = ref([]);
const comments = ref([]);
const danmaku = ref([]);
const totalComments = ref(0);
const error = ref('');
const loading = ref(true);
const descExpanded = ref(false);

const commentSort = ref('hot'); // hot | new
const commentText = ref('');
const commentLiked = ref({}); // 本会话点赞的评论 id -> true
const coinModalOpen = ref(false);
const playerRef = ref(null);

const liked = computed(() => !!user.likes[video.value?.bvid]);
const coined = computed(() => (user.coins[video.value?.bvid] || 0) > 0);
const faved = computed(() => user.hasFavorite(video.value?.bvid));
const followed = computed(() => !!user.followed[video.value?.owner?.mid]);
const fansText = computed(() => {
  const mid = video.value?.owner?.mid || 1;
  return `${((mid % 8800) / 100 + 1.2).toFixed(1)}万`; // 演示数据：粉丝数本地合成
});

const mergedComments = computed(() => {
  const local = user.localComments[video.value?.bvid] || [];
  const server = comments.value.map((c) => ({ ...c, likes: c.likes + (commentLiked.value[c.id] ? 1 : 0), liked: !!commentLiked.value[c.id] }));
  const all = [...local, ...server];
  return commentSort.value === 'hot' ? all.sort((a, b) => b.likes - a.likes) : all;
});

// 代际令牌：相关推荐连续跳转（A→B）时，旧详情响应一律丢弃，只允许最新 id 提交状态与历史
let loadGen = 0;
const DEFAULT_TITLE = '哔哩哔哩 (゜-゜)つロ 干杯~-bilibili（复刻演示）';

async function load(id) {
  const g = ++loadGen;
  loading.value = true;
  error.value = '';
  try {
    const res = await api.video(id);
    if (g !== loadGen) return;
    const v = res.video;
    // 计数基线并入本地已有的互动增量，保证多次进出页面时数字不回退、不重复叠加
    v.stat.like += user.likes[v.bvid] ? 1 : 0;
    v.stat.coin += user.coins[v.bvid] || 0;
    v.stat.favorite += user.hasFavorite(v.bvid) ? 1 : 0;
    video.value = v;
    related.value = res.related;
    comments.value = res.comments;
    danmaku.value = res.danmaku;
    totalComments.value = res.totalComments;
    user.recordHistory(v);
    document.title = `${v.title}_哔哩哔哩（复刻演示）`;
  } catch (e) {
    if (g !== loadGen) return;
    error.value = e.message || '视频加载失败';
  } finally {
    if (g === loadGen) loading.value = false;
  }
}

onBeforeUnmount(() => {
  loadGen += 1; // 组件卸载后到达的响应不再提交
  document.title = DEFAULT_TITLE;
});

watch(
  () => route.params.id,
  (id) => {
    if (id && route.name === 'video') {
      playerRef.value?.reset();
      load(id);
      window.scrollTo({ top: 0 });
    }
  },
);
onMounted(() => load(route.params.id));

function toggleLike() {
  if (!video.value) return;
  const on = user.toggleLike(video.value.bvid);
  video.value.stat.like += on ? 1 : -1;
}
function openCoin() {
  if (coined.value) {
    toast.show('已经投过硬币啦');
    return;
  }
  coinModalOpen.value = true;
}
function giveCoin(n) {
  user.addCoins(video.value.bvid, n);
  video.value.stat.coin += n;
  coinModalOpen.value = false;
  toast.show(`投出 ${n} 枚硬币，感谢支持！`, 'success');
}
function toggleFav() {
  const on = user.toggleFavorite(video.value);
  toast.show(on ? '已加入收藏夹' : '已取消收藏', on ? 'success' : 'info');
}
async function share() {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    toast.show('链接已复制，快去分享吧', 'success');
  } catch {
    toast.show('复制失败，请手动复制地址栏链接');
  }
}
function toggleFollow() {
  const on = user.toggleFollow(video.value.owner.mid);
  toast.show(on ? `已关注 ${video.value.owner.name}` : '已取消关注');
}
function goCategory(key) {
  router.push({ name: 'home', query: { category: key } });
}
function submitComment() {
  const text = commentText.value.trim();
  if (!text) {
    toast.show('评论内容不能为空');
    return;
  }
  user.addLocalComment(video.value.bvid, text);
  commentText.value = '';
  toast.show('评论发布成功', 'success');
}
function likeComment(c) {
  if (c.isMine) {
    user.toggleCommentLike(video.value.bvid, c.id);
    return;
  }
  commentLiked.value = { ...commentLiked.value, [c.id]: !commentLiked.value[c.id] };
}
</script>

<template>
  <div class="detail-wrap">
    <div v-if="loading" class="detail-loading">
      <div class="skeleton" style="aspect-ratio: 16/9; width: 100%" />
      <div class="skeleton" style="height: 26px; width: 70%; margin-top: 16px" />
      <div class="skeleton" style="height: 18px; width: 40%; margin-top: 12px" />
    </div>

    <div v-else-if="error" class="detail-error">
      <p>{{ error }}</p>
      <button @click="router.push('/')">返回首页</button>
    </div>

    <div v-else-if="video" class="detail-layout">
      <!-- 左列：播放器与视频信息 -->
      <section class="main-col">
        <DanmakuPlayer ref="playerRef" :video="video" :danmaku="danmaku" />

        <h1 class="v-title">{{ video.title }}</h1>

        <div class="v-meta">
          <span><BIcon name="play" :size="14" />{{ formatCount(video.stat.view) }}播放</span>
          <span><BIcon name="danmaku" :size="14" />{{ formatCount(video.stat.danmaku) }}弹幕</span>
          <span>{{ formatDate(video.pubdate) }}</span>
          <a class="crumb" href="javascript:;" @click="goCategory(video.region)">
            {{ video.regionLabel }}<template v-if="video.tname"> / {{ video.tname }}</template>
          </a>
        </div>

        <!-- UP 主信息 -->
        <div class="up-card">
          <img class="up-avatar" :src="video.owner.face" :alt="video.owner.name" />
          <div class="up-info">
            <a class="up-name" href="javascript:;" @click="router.push({ name: 'search', query: { q: video.owner.name } })">
              {{ video.owner.name }}
            </a>
            <span class="up-fans">{{ fansText }}粉丝</span>
          </div>
          <div class="up-actions">
            <button class="ghost-btn" @click="toast.show('演示项目未接入私信')">发消息</button>
            <button class="follow-btn" :class="{ followed }" @click="toggleFollow">
              {{ followed ? '已关注' : '+ 关注' }}
            </button>
          </div>
        </div>

        <!-- 互动区 -->
        <div class="action-bar">
          <button class="act" :class="{ on: liked }" @click="toggleLike">
            <BIcon name="like" :size="19" /><span>{{ formatCount(video.stat.like) }}</span>
          </button>
          <button class="act coin" :class="{ on: coined }" @click="openCoin">
            <BIcon name="coin" :size="19" /><span>{{ formatCount(video.stat.coin) }}</span>
          </button>
          <button class="act fav" :class="{ on: faved }" @click="toggleFav">
            <BIcon name="star" :size="19" /><span>{{ formatCount(video.stat.favorite) }}</span>
          </button>
          <button class="act" @click="share">
            <BIcon name="share" :size="18" /><span>分享</span>
          </button>
        </div>

        <!-- 简介 -->
        <div class="v-desc" :class="{ expanded: descExpanded }">
          <p class="desc-text" :class="{ clamp: !descExpanded }">
            {{ video.desc || '暂无简介' }}
          </p>
          <button v-if="(video.desc || '').length > 60" class="expand-btn" @click="descExpanded = !descExpanded">
            {{ descExpanded ? '收起' : '展开更多' }}
          </button>
        </div>

        <!-- 评论区 -->
        <div class="comments">
          <div class="comments-head">
            <span class="comments-total">评论 {{ formatCount(totalComments + (user.localComments[video.bvid]?.length || 0)) }}</span>
            <div class="sort-tabs">
              <button :class="{ active: commentSort === 'hot' }" @click="commentSort = 'hot'">最热</button>
              <button :class="{ active: commentSort === 'new' }" @click="commentSort = 'new'">最新</button>
            </div>
          </div>

          <div class="comment-box">
            <span class="me">客</span>
            <div class="box-right">
              <textarea v-model="commentText" placeholder="发一条友善的评论吧" rows="2" maxlength="200" />
              <div class="box-foot">
                <span>{{ commentText.length }}/200</span>
                <button class="submit-btn" :disabled="!commentText.trim()" @click="submitComment">发布</button>
              </div>
            </div>
          </div>

          <div class="comment-list">
            <div v-for="c in mergedComments" :key="c.id" class="comment">
              <img v-if="c.user.face" class="c-avatar" :src="c.user.face" :alt="c.user.name" loading="lazy" />
              <span v-else class="c-avatar mine">客</span>
              <div class="c-body">
                <div class="c-head">
                  <b>{{ c.user.name }}</b>
                  <i v-if="c.isMine" class="c-mine">我</i>
                  <time>{{ c.time }}</time>
                </div>
                <p class="c-content">{{ c.content }}</p>
                <div class="c-actions">
                  <button :class="{ liked: c.liked }" @click="likeComment(c)">
                    <BIcon name="like" :size="14" />{{ c.likes || '' }}
                  </button>
                  <button @click="toast.show('演示项目未接入回复功能')"><BIcon name="reply" :size="14" />回复</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 右列：相关推荐 -->
      <aside class="related-col">
        <div class="related-head">相关推荐</div>
        <a
          v-for="r in related"
          :key="r.bvid"
          class="related-item"
          href="javascript:;"
          @click="router.push({ name: 'video', params: { id: r.bvid } })"
        >
          <div class="r-thumb">
            <img :src="r.cover" :alt="r.title" loading="lazy" />
          </div>
          <div class="r-info">
            <p class="clamp-2">{{ r.title }}</p>
            <small>{{ formatCount(r.stat.view) }}播放 · {{ formatCount(r.stat.danmaku) }}弹幕</small>
          </div>
        </a>
      </aside>
    </div>

    <!-- 投币弹窗 -->
    <div v-if="coinModalOpen" class="coin-mask" @click.self="coinModalOpen = false">
      <div class="coin-modal">
        <p class="coin-title">给这个视频投一枚硬币吧</p>
        <p class="coin-sub">当前硬币余额：512</p>
        <div class="coin-btns">
          <button @click="giveCoin(1)"><BIcon name="coin" :size="26" />1 枚</button>
          <button @click="giveCoin(2)"><BIcon name="coin" :size="26" /><BIcon name="coin" :size="26" />2 枚</button>
        </div>
        <button class="coin-cancel" @click="coinModalOpen = false">取消</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-wrap { padding: 16px 24px 60px; }
.detail-inner { max-width: 1660px; margin: 0 auto; }
.detail-layout {
  max-width: 1660px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.main-col { flex: 1; min-width: 0; max-width: 1080px; }
.related-col {
  width: 380px;
  flex-shrink: 0;
  background: var(--white);
  border-radius: 10px;
  padding: 14px 12px;
  position: sticky;
  top: calc(var(--header-h) + 16px);
  max-height: calc(100vh - var(--header-h) - 32px);
  overflow-y: auto;
}

.detail-loading { max-width: 1080px; margin: 0 auto; }
.detail-error { text-align: center; padding: 100px 0; color: var(--text-2); }
.detail-error button {
  margin-top: 14px;
  border: none;
  background: var(--bili-pink);
  color: #fff;
  padding: 8px 28px;
  border-radius: 8px;
  cursor: pointer;
}

.v-title { font-size: 21px; line-height: 30px; margin: 16px 0 6px; font-weight: 600; }
.v-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--text-3);
  font-size: 13px;
}
.v-meta span { display: inline-flex; align-items: center; gap: 4px; }
.crumb { margin-left: auto; color: var(--bili-blue); }
.crumb:hover { color: var(--bili-pink); }

.up-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  padding: 14px 16px;
  background: var(--white);
  border-radius: 10px;
}
.up-avatar { width: 48px; height: 48px; border-radius: 50%; border: 1px solid var(--line); }
.up-info { display: flex; flex-direction: column; gap: 4px; }
.up-name { color: var(--text-1); font-weight: 600; font-size: 15px; }
.up-name:hover { color: var(--bili-blue); }
.up-fans { color: var(--text-3); font-size: 12.5px; }
.up-actions { margin-left: auto; display: flex; gap: 10px; }
.ghost-btn {
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--text-2);
  border-radius: 8px;
  padding: 7px 16px;
  cursor: pointer;
}
.ghost-btn:hover { color: var(--bili-pink); border-color: var(--bili-pink); }
.follow-btn {
  border: none;
  background: var(--bili-pink);
  color: #fff;
  border-radius: 8px;
  padding: 8px 20px;
  cursor: pointer;
}
.follow-btn:hover { background: var(--bili-pink-hover); }
.follow-btn.followed { background: var(--bg-2); color: var(--text-3); }

.action-bar {
  display: flex;
  margin-top: 14px;
  background: var(--white);
  border-radius: 10px;
  padding: 6px 8px;
}
.act {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  background: transparent;
  color: var(--text-2);
  font-size: 14.5px;
  padding: 12px 0;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.15s;
}
.act + .act { border-left: 1px solid var(--bg-2); }
.act:hover { background: var(--bg-2); }
.act.on { color: var(--bili-blue); }
.act.coin.on { color: var(--gold); }
.act.fav.on { color: var(--gold); }

.v-desc {
  margin-top: 14px;
  background: var(--white);
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 14px;
  color: var(--text-2);
  line-height: 22px;
}
.desc-text.clamp {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.desc-text { margin: 0; white-space: pre-wrap; }
.expand-btn {
  border: none;
  background: transparent;
  color: var(--bili-blue);
  cursor: pointer;
  padding: 6px 0 0;
  font-size: 13.5px;
}

.comments { margin-top: 14px; background: var(--white); border-radius: 10px; padding: 18px 16px; }
.comments-head { display: flex; align-items: center; justify-content: space-between; }
.comments-total { font-size: 16px; font-weight: 600; }
.sort-tabs { display: flex; gap: 2px; }
.sort-tabs button { border: none; background: transparent; color: var(--text-3); font-size: 13.5px; padding: 4px 12px; border-radius: 6px; cursor: pointer; }
.sort-tabs button.active { color: var(--bili-pink); background: var(--bili-pink-light); font-weight: 600; }

.comment-box { margin-top: 14px; display: flex; gap: 12px; }
.box-right { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.me {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, var(--bili-pink), #ffa5c0);
  color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.comment-box textarea {
  flex: 1;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 13.5px;
  resize: vertical;
  outline: none;
  min-width: 0;
}
.comment-box textarea:focus { border-color: var(--bili-pink); }
.box-foot { display: flex; align-items: center; justify-content: flex-end; gap: 14px; margin-top: 8px; }
.box-foot span { color: var(--text-3); font-size: 12.5px; }
.submit-btn {
  border: none;
  background: var(--bili-pink);
  color: #fff;
  border-radius: 8px;
  padding: 7px 24px;
  cursor: pointer;
  font-size: 13.5px;
}
.submit-btn:disabled { background: #e7e9eb; color: var(--text-3); cursor: not-allowed; }
.submit-btn:not(:disabled):hover { background: var(--bili-pink-hover); }

.comment-list { margin-top: 8px; }
.comment { display: flex; gap: 12px; padding: 16px 0 6px; border-bottom: 1px solid var(--bg-2); }
.c-avatar { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; }
.c-avatar.mine {
  background: linear-gradient(135deg, var(--bili-pink), #ffa5c0);
  color: #fff; display: flex; align-items: center; justify-content: center;
}
.c-body { flex: 1; min-width: 0; }
.c-head { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.c-head b { color: var(--text-2); font-weight: 500; }
.c-mine {
  font-style: normal;
  background: var(--bili-pink);
  color: #fff;
  font-size: 11px;
  padding: 0 5px;
  border-radius: 3px;
  line-height: 16px;
}
.c-head time { color: var(--text-3); font-size: 12px; }
.c-content { margin: 6px 0 8px; font-size: 14.5px; line-height: 22px; color: var(--text-1); white-space: pre-wrap; }
.c-actions { display: flex; gap: 20px; }
.c-actions button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: none;
  background: transparent;
  color: var(--text-3);
  font-size: 13px;
  cursor: pointer;
  padding: 2px 0;
}
.c-actions button:hover, .c-actions button.liked { color: var(--bili-blue); }

.related-head { font-size: 15px; font-weight: 600; padding: 2px 6px 10px; }
.related-item { display: flex; gap: 10px; padding: 7px 6px; border-radius: 8px; }
.related-item:hover { background: var(--bg-2); }
.r-thumb { position: relative; width: 168px; aspect-ratio: 16/9; border-radius: 6px; overflow: hidden; flex-shrink: 0; background: #e7e9eb; }
.r-thumb img { width: 100%; height: 100%; object-fit: cover; }
.r-info { display: flex; flex-direction: column; gap: 8px; font-size: 13.5px; line-height: 18px; min-width: 0; justify-content: center; }
.r-info small { color: var(--text-3); font-size: 12px; }

.coin-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.coin-modal {
  background: var(--white);
  border-radius: 14px;
  padding: 26px 30px;
  width: 330px;
  text-align: center;
  animation: coin-pop 0.18s ease;
}
@keyframes coin-pop { from { transform: scale(0.92); opacity: 0; } }
.coin-title { margin: 0; font-size: 16px; font-weight: 600; }
.coin-sub { margin: 8px 0 18px; color: var(--text-3); font-size: 13px; }
.coin-btns { display: flex; gap: 12px; justify-content: center; }
.coin-btns button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px solid var(--line);
  background: var(--white);
  border-radius: 10px;
  padding: 14px 0;
  cursor: pointer;
  color: var(--gold);
  font-size: 14px;
}
.coin-btns button:hover { border-color: var(--gold); background: #fffaf0; }
.coin-cancel { margin-top: 16px; border: none; background: transparent; color: var(--text-3); cursor: pointer; font-size: 13px; }

@media (max-width: 1100px) {
  .related-col { display: none; }
}
</style>
