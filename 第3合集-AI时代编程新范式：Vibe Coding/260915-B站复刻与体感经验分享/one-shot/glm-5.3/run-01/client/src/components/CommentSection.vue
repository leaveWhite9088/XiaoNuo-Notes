<script setup>
import { ref, onMounted } from 'vue';
import BaseIcon from './BaseIcon.vue';
import { api } from '../api/index.js';
import { formatRelativeTime, formatCount } from '../utils/format.js';
import { useUserStore } from '../stores/user.js';
import { toast } from '../composables/toast';

const props = defineProps({
  videoId: { type: String, required: true },
});

const user = useUserStore();

const comments = ref([]);
const total = ref(0);
const loading = ref(true);
const inputText = ref('');
const submitting = ref(false);
const showCount = ref(10);
const likedLocal = ref(new Set());
const replyingTo = ref(null);
const replyText = ref('');

const PAGE_STEP = 10;

async function load() {
  loading.value = true;
  try {
    const data = await api.comments(props.videoId);
    comments.value = data.list;
    total.value = data.total;
  } catch (err) {
    toast(`评论加载失败: ${err.message}`);
  } finally {
    loading.value = false;
  }
}

onMounted(load);

async function submit() {
  const text = inputText.value.trim();
  if (!text || submitting.value) return;
  submitting.value = true;
  try {
    const created = await api.postComment(props.videoId, text);
    comments.value.unshift(created);
    total.value += 1;
    inputText.value = '';
    toast('评论发表成功');
  } catch (err) {
    toast(`发表失败: ${err.message}`);
  } finally {
    submitting.value = false;
  }
}

async function submitReply() {
  const target = replyingTo.value;
  const text = replyText.value.trim();
  if (!target || !text || submitting.value) return;
  submitting.value = true;
  try {
    const created = await api.postComment(props.videoId, `回复 @${target.name}：${text}`);
    comments.value.unshift(created);
    total.value += 1;
    replyText.value = '';
    replyingTo.value = null;
    toast('回复发表成功');
  } catch (err) {
    toast(`回复失败: ${err.message}`);
  } finally {
    submitting.value = false;
  }
}

function toggleLike(c) {
  if (likedLocal.value.has(c.rpid)) {
    likedLocal.value.delete(c.rpid);
    c.like -= 1;
  } else {
    likedLocal.value.add(c.rpid);
    c.like += 1;
  }
}

function openReply(c) {
  replyingTo.value = replyingTo.value?.rpid === c.rpid ? null : c;
  replyText.value = '';
}
</script>

<template>
  <div class="comments">
    <div class="comments-head">评论 <span class="comments-count">{{ total }}</span></div>

    <div class="comment-input">
      <img class="c-avatar" :src="user.profile.face" alt="" />
      <div class="c-input-main">
        <textarea
          v-model="inputText"
          class="c-textarea"
          rows="3"
          maxlength="500"
          placeholder="发个弹幕见证当下，或写下你的评论…"
        ></textarea>
        <div class="c-input-actions">
          <span class="c-count">{{ inputText.length }}/500</span>
          <button class="c-submit" :disabled="!inputText.trim() || submitting" @click="submit">
            {{ submitting ? '发表中…' : '发表评论' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="comments-loading">评论加载中…</div>

    <template v-else>
      <div v-if="!comments.length" class="comments-empty">还没有评论，快来抢沙发吧</div>

      <ul class="comment-list">
        <li v-for="c in comments.slice(0, showCount)" :key="c.rpid" class="comment-item">
          <img class="c-avatar" :src="c.face" alt="" loading="lazy" />
          <div class="c-main">
            <div class="c-head">
              <span class="c-name" :class="{ self: c.isSelf, up: c.isUp }">{{ c.name }}</span>
              <span v-if="c.isUp" class="c-badge up-badge">UP主</span>
              <span v-if="c.isSelf" class="c-badge self-badge">我</span>
            </div>
            <p class="c-content">{{ c.content }}</p>
            <div class="c-actions">
              <span class="c-time">{{ formatRelativeTime(c.time) }}</span>
              <button class="c-action" :class="{ liked: likedLocal.has(c.rpid) }" @click="toggleLike(c)">
                <BaseIcon name="like" :size="14" />
                {{ formatCount(c.like) }}
              </button>
              <button class="c-action" @click="openReply(c)">回复</button>
            </div>

            <div v-if="replyingTo?.rpid === c.rpid" class="reply-box">
              <textarea
                v-model="replyText"
                class="c-textarea small"
                rows="2"
                maxlength="500"
                :placeholder="`回复 @${c.name}：`"
              ></textarea>
              <div class="c-input-actions">
                <button class="c-cancel" @click="replyingTo = null">取消</button>
                <button class="c-submit" :disabled="!replyText.trim() || submitting" @click="submitReply">
                  回复
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>

      <button
        v-if="showCount < comments.length"
        class="load-more-comments"
        @click="showCount += PAGE_STEP"
      >
        查看更多评论（还有 {{ comments.length - showCount }} 条）
      </button>
    </template>
  </div>
</template>

<style scoped>
.comments {
  margin-top: 20px;
  background: #fff;
  border-radius: 10px;
  padding: 20px;
}
.comments-head {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}
.comments-count {
  color: var(--text-3);
  font-size: 14px;
  margin-left: 4px;
}
.comment-input {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}
.c-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
}
.c-input-main {
  flex: 1;
}
.c-textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  resize: vertical;
  color: var(--text-1);
  background: var(--bg-page);
  transition: border-color 0.2s;
}
.c-textarea:focus {
  border-color: var(--bili-blue);
  background: #fff;
}
.c-textarea.small {
  margin-bottom: 6px;
}
.c-input-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}
.c-count {
  color: var(--text-3);
  font-size: 12px;
}
.c-submit {
  background: var(--bili-pink);
  color: #fff;
  border-radius: 6px;
  padding: 6px 18px;
  font-size: 13px;
}
.c-submit:hover:not(:disabled) {
  background: var(--bili-pink-light);
}
.c-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.c-cancel {
  color: var(--text-3);
  font-size: 13px;
  padding: 6px 12px;
}
.comments-loading,
.comments-empty {
  text-align: center;
  color: var(--text-3);
  padding: 30px 0;
  font-size: 13px;
}
.comment-list {
  display: flex;
  flex-direction: column;
}
.comment-item {
  display: flex;
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid var(--bg-page);
}
.c-main {
  flex: 1;
  min-width: 0;
}
.c-head {
  display: flex;
  align-items: center;
  gap: 6px;
}
.c-name {
  font-size: 13px;
  color: var(--bili-blue);
}
.c-name.self {
  color: var(--bili-pink);
}
.c-badge {
  font-size: 11px;
  border-radius: 3px;
  padding: 0 5px;
}
.up-badge {
  background: var(--bili-pink-bg);
  color: var(--bili-pink);
}
.self-badge {
  background: var(--bg-page);
  color: var(--text-2);
}
.c-content {
  margin-top: 4px;
  font-size: 14px;
  color: var(--text-1);
  white-space: pre-wrap;
  word-break: break-word;
}
.c-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 8px;
}
.c-time {
  color: var(--text-3);
  font-size: 12px;
}
.c-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-3);
  font-size: 12px;
}
.c-action:hover,
.c-action.liked {
  color: var(--bili-pink);
}
.reply-box {
  margin-top: 10px;
}
.load-more-comments {
  display: block;
  margin: 16px auto 0;
  color: var(--bili-blue);
  font-size: 13px;
  padding: 8px 20px;
  border: 1px solid var(--line);
  border-radius: 18px;
}
.load-more-comments:hover {
  background: var(--bg-page);
}
</style>
