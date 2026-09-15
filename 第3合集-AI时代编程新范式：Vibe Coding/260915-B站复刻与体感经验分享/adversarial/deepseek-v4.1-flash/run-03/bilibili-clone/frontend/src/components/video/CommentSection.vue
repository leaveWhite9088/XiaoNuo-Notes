<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Icon from '@/components/common/Icon.vue';
import { videoApi } from '@/api';
import { useUiStore } from '@/stores/ui';
import type { CommentItem } from '@/types';
import { avatarColor, nameInitial } from '@/utils';

/** 评论区：发表 / 点赞 / 分页加载 */
const props = defineProps<{ bvid: string; replyCount: number }>();

const ui = useUiStore();
const comments = ref<CommentItem[]>([]);
const loadError = ref('');
const total = ref(0);
const page = ref(0);
const hasMore = ref(false);
const loading = ref(false);
const posting = ref(false);
const draft = ref('');
const hint = ref('');
const likedIds = ref<Set<number>>(new Set());
const showEmoji = ref(false);

const EMOJIS = ['(๑•̀ㅂ•́)و✧', '(゜-゜)つロ', '哈哈哈哈', '泪目', '前排', '爷青回', 'awsl', '名场面', '三连了', '高能预警'];

const placeholder = computed(() => `发一条友善的评论（${total.value} 条评论）`);

async function load(reset = false) {
  if (loading.value) return;
  if (!reset && !hasMore.value && page.value > 0) return;
  loading.value = true;
  loadError.value = '';
  try {
    const next = reset ? 1 : page.value + 1;
    const data = await videoApi.comments(props.bvid, next);
    comments.value = reset ? data.list : [...comments.value, ...data.list];
    total.value = data.total;
    page.value = next;
    hasMore.value = data.hasMore;
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : '评论加载失败';
  } finally {
    loading.value = false;
  }
}

async function submit() {
  const content = draft.value.trim();
  if (!content || posting.value) return;
  posting.value = true;
  hint.value = '';
  try {
    const created = await videoApi.addComment(props.bvid, content);
    comments.value = [created, ...comments.value];
    total.value += 1;
    draft.value = '';
    showEmoji.value = false;
    hint.value = '评论发布成功';
  } catch (err) {
    hint.value = err instanceof Error ? err.message : '评论失败';
  } finally {
    posting.value = false;
  }
}

async function like(item: CommentItem) {
  if (likedIds.value.has(item.id)) return;
  try {
    await videoApi.likeComment(item.id);
    likedIds.value = new Set(likedIds.value).add(item.id);
    item.like += 1;
    item.likeText = String(item.like);
  } catch (err) {
    ui.error(err instanceof Error ? err.message : '点赞失败');
  }
}

function appendEmoji(e: string) {
  draft.value += e;
  showEmoji.value = false;
}

onMounted(() => {
  void load(true);
});
</script>

<template>
  <section class="comments">
    <header class="comments__head">
      <h2>评论 <em>{{ total }}</em></h2>
    </header>

    <!-- 发表评论 -->
    <div class="editor">
      <span class="editor__avatar">哔</span>
      <div class="editor__body">
        <textarea
          v-model="draft"
          :placeholder="placeholder"
          rows="2"
          maxlength="300"
          @focus="showEmoji = false"
        ></textarea>
        <div class="editor__bar">
          <button class="editor__emoji" @click="showEmoji = !showEmoji">
            <Icon name="i-dynamic" :size="16" />表情
          </button>
          <div v-show="showEmoji" class="editor__emoji-list">
            <button v-for="e in EMOJIS" :key="e" @click="appendEmoji(e)">{{ e }}</button>
          </div>
          <span class="editor__count">{{ draft.length }}/300</span>
          <button class="btn-primary editor__submit" :disabled="!draft.trim() || posting" @click="submit">
            {{ posting ? '发布中...' : '发布' }}
          </button>
        </div>
        <p v-if="hint" class="editor__hint">{{ hint }}</p>
      </div>
    </div>

    <div v-if="loadError" class="comments__error">
      <span>{{ loadError }}</span>
      <button class="btn-ghost" @click="load(true)">重试</button>
    </div>

    <!-- 列表 -->
    <ul class="list">
      <li v-for="item in comments" :key="item.id" class="list__item">
        <span
          class="list__avatar"
          :style="{ background: avatarColor(item.author) }"
          >{{ nameInitial(item.author) }}</span
        >
        <div class="list__body">
          <div class="list__author">{{ item.author }}</div>
          <p class="list__content">{{ item.content }}</p>
          <div class="list__meta">
            <span>{{ item.timeAgo }}</span>
            <span class="list__divider">·</span>
            <span>回复</span>
            <button
              class="list__like"
              :class="{ 'is-liked': likedIds.has(item.id) }"
              @click="like(item)"
            >
              <Icon name="i-like" :size="14" />{{ item.like }}
            </button>
          </div>
        </div>
      </li>
    </ul>

    <div class="comments__more">
      <button v-if="hasMore" class="btn-ghost" :disabled="loading" @click="load(false)">
        {{ loading ? '加载中...' : '加载更多评论' }}
      </button>
      <span v-else-if="comments.length" class="comments__end">没有更多评论了</span>
    </div>
  </section>
</template>

<style scoped>
.comments {
  margin-top: 24px;
}
.comments__head h2 {
  font-size: 18px;
  font-weight: 600;
}
.comments__head em {
  font-style: normal;
  font-size: 13px;
  color: var(--text-3);
  margin-left: 4px;
}

.editor {
  display: flex;
  gap: 12px;
  margin: 16px 0 22px;
}
.editor__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fb7299, #00aeec);
  color: #fff;
  flex: none;
}
.editor__body {
  flex: 1;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg-gray);
  transition: all 0.2s;
}
.editor__body:focus-within {
  background: #fff;
  border-color: var(--bili-pink);
}
.editor__body textarea {
  width: 100%;
  padding: 10px 12px 4px;
  background: transparent;
  font-size: 14px;
  resize: none;
  color: var(--text-1);
}
.editor__bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px 8px;
}
.editor__emoji {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-3);
}
.editor__emoji:hover {
  color: var(--bili-pink);
}
.editor__emoji-list {
  position: absolute;
  bottom: 40px;
  left: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: 300px;
  padding: 10px;
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow-2);
  z-index: 5;
}
.editor__emoji-list button {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: var(--bg-gray);
  font-size: 12px;
}
.editor__emoji-list button:hover {
  background: var(--bili-pink-light);
  color: var(--bili-pink);
}
.editor__count {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-3);
}
.editor__submit {
  padding: 6px 16px;
  font-size: 13px;
  border-radius: var(--radius);
}
.editor__submit:disabled {
  background: var(--line);
  color: var(--text-3);
  cursor: not-allowed;
}
.editor__hint {
  padding: 0 12px 8px;
  font-size: 12px;
  color: var(--bili-pink);
}

.comments__error {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  font-size: 13px;
  color: #fe2d46;
}
.comments__error button {
  padding: 4px 12px;
  font-size: 12px;
}

.list__item {
  display: flex;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--line-light);
}
.list__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 15px;
  flex: none;
}
.list__body {
  flex: 1;
  min-width: 0;
}
.list__author {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
}
.list__content {
  margin-top: 4px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}
.list__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-3);
}
.list__divider {
  color: var(--text-4);
}
.list__like {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-3);
  font-size: 12px;
}
.list__like:hover,
.list__like.is-liked {
  color: var(--bili-pink);
}
.comments__more {
  padding: 18px 0;
  text-align: center;
}
.comments__more button {
  padding: 8px 24px;
  font-size: 13px;
}
.comments__end {
  font-size: 12px;
  color: var(--text-4);
}
</style>
