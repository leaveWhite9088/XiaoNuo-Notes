<template>
  <div class="comment-item">
    <img class="c-avatar" :src="comment.avatar" :alt="comment.nickname" />
    <div class="c-body">
      <div class="c-head">
        <span class="c-nick">{{ comment.nickname }}</span>
        <span class="c-time">{{ comment.time }}</span>
      </div>
      <p class="c-content">{{ comment.content }}</p>
      <div class="c-actions">
        <button class="c-like" :class="{ liked }" @click="toggle">
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path d="M7 22 V10 M7 10 L12 2 q2 0 1.6 2.4 L12.8 9 H19 a2 2 0 0 1 2 2.4 l-1.5 8 A2 2 0 0 1 17.5 21 H7"
              :fill="liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
          </svg>
          {{ likeCount }}
        </button>
        <button class="c-reply">回复</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  comment: { type: Object, required: true },
});

const liked = ref(false);
const likeCount = ref(props.comment.likes);

function toggle() {
  liked.value = !liked.value;
  likeCount.value += liked.value ? 1 : -1;
}
</script>

<style scoped>
.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-gray);
}

.c-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.c-body {
  flex: 1;
  min-width: 0;
}

.c-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.c-nick {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-sub);
}

.c-time {
  font-size: 12px;
  color: var(--text-light);
}

.c-content {
  margin-top: 6px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-main);
}

.c-actions {
  display: flex;
  gap: 18px;
  margin-top: 8px;
}

.c-like,
.c-reply {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-light);
}

.c-like:hover,
.c-reply:hover {
  color: var(--bili-pink);
}

.c-like.liked {
  color: var(--bili-pink);
}
</style>
