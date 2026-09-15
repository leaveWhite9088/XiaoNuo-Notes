<template>
  <section class="comments">
    <div class="comments__head">
      <span class="comments__title">评论 <em>{{ total }}</em></span>
      <div class="comments__sort">
        <button
          v-for="item in sorts"
          :key="item.key"
          class="comments__sort-btn"
          :class="{ 'is-active': sort === item.key }"
          @click="changeSort(item.key)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div class="comment-editor">
      <img class="comment-editor__avatar" :src="me.face" alt="" referrerpolicy="no-referrer" />
      <div class="comment-editor__main">
        <textarea
          v-model="draft"
          class="comment-editor__input"
          rows="2"
          maxlength="300"
          placeholder="发一条友善的评论"
        />
        <div class="comment-editor__foot">
          <span class="comment-editor__count">{{ draft.length }}/300</span>
          <button class="btn-primary" :disabled="!draft.trim() || posting" @click="submit">
            {{ posting ? '发布中...' : '发布' }}
          </button>
        </div>
      </div>
    </div>

    <ul class="comment-list">
      <li v-for="comment in list" :key="comment.id" class="comment-item">
        <img class="comment-item__avatar" :src="comment.user.face || me.face" alt="" referrerpolicy="no-referrer" />
        <div class="comment-item__body">
          <p class="comment-item__name">{{ comment.user.name }}</p>
          <p class="comment-item__content">{{ comment.content }}</p>
          <div class="comment-item__foot">
            <span class="comment-item__time">{{ comment.ctimeText }} · {{ comment.location || '未知' }}</span>
            <span class="comment-item__like"><SvgIcon name="like" :size="14" />{{ comment.likeText }}</span>
          </div>
        </div>
      </li>
      <li v-if="!list.length" class="comment-empty">还没有评论，来抢沙发吧 ~</li>
    </ul>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import SvgIcon from '@/components/common/SvgIcon.vue';
import { videoApi, userApi } from '@/api/http.js';

/**
 * 评论区：真实评论展示 + 本地发表评论（写入 SQLite，刷新后仍在）。
 */
const props = defineProps({
  bvid: { type: String, required: true },
  initialComments: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
});

const sorts = [
  { key: 'hot', label: '最热' },
  { key: 'new', label: '最新' },
];

const list = ref(props.initialComments);
const sort = ref('hot');
const draft = ref('');
const posting = ref(false);
const me = ref({ face: 'https://i0.hdslb.com/bfs/face/member/noface.jpg' });

async function changeSort(key) {
  sort.value = key;
  const res = await videoApi.comments(props.bvid, { sort: key, limit: 20 });
  list.value = res.list || [];
}

async function submit() {
  if (!draft.value.trim()) return;
  posting.value = true;
  try {
    const comment = await videoApi.addComment(props.bvid, {
      content: draft.value.trim(),
      userName: me.value.name || '我',
    });
    list.value = [comment, ...list.value];
    draft.value = '';
  } finally {
    posting.value = false;
  }
}

onMounted(async () => {
  try {
    me.value = { ...me.value, ...(await userApi.me()) };
  } catch {
    /* 忽略 */
  }
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.comments {
  padding: 16px;
  background: #fff;
  border-radius: $radius-lg;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: $text-1;

    em {
      font-style: normal;
      font-size: 13px;
      font-weight: 400;
      color: $text-3;
      margin-left: 4px;
    }
  }

  &__sort {
    display: flex;
    gap: 4px;
  }

  &__sort-btn {
    padding: 4px 10px;
    font-size: 13px;
    color: $text-3;
    border-radius: $radius-md;

    &:hover {
      color: $brand-blue;
    }

    &.is-active {
      color: #fff;
      background: $brand-blue;
    }
  }
}

.comment-editor {
  display: flex;
  gap: 12px;
  padding-bottom: 18px;
  border-bottom: 1px solid $border-line;

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  &__main {
    flex: 1;
  }

  &__input {
    width: 100%;
    padding: 10px 12px;
    font-size: 14px;
    line-height: 20px;
    color: $text-1;
    background: $bg-card;
    border-radius: $radius-md;
    border: 1px solid transparent;
    resize: vertical;
    font-family: inherit;

    &:focus {
      background: #fff;
      border-color: $brand-blue;
      outline: none;
    }
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;
  }

  &__count {
    font-size: 12px;
    color: $text-3;
  }

  .btn-primary[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.comment-list {
  display: flex;
  flex-direction: column;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px dashed $border-line;

  &:last-child {
    border-bottom: none;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    flex: none;
    border-radius: 50%;
    object-fit: cover;
    background: $bg-card;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 13px;
    font-weight: 600;
    color: $brand-blue;
  }

  &__content {
    margin: 4px 0 8px;
    font-size: 14px;
    line-height: 22px;
    color: $text-1;
    word-break: break-word;
  }

  &__foot {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 12px;
    color: $text-3;
  }

  &__like {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    cursor: pointer;

    &:hover {
      color: $brand-pink;
    }
  }
}

.comment-empty {
  padding: 30px 0;
  text-align: center;
  font-size: 13px;
  color: $text-3;
}
</style>
