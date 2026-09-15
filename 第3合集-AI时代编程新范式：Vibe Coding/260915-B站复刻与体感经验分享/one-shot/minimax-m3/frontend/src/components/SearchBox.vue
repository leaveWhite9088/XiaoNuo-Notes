<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { useUIStore } from '@/stores/ui'

const router = useRouter()
const ui = useUIStore()

const kw = ref('')
const open = ref(false)
const suggests = ref<string[]>([])
const trending = ['黑神话悟空', 'iPhone 16 Pro', '葬送的芙莉莲', '原神 5.0', 'AI 绘画', '健身入门', '深夜食堂', '鬼畜全明星']
const boxRef = ref<HTMLDivElement>()

let timer: number | null = null
watch(kw, (val) => {
  if (timer) clearTimeout(timer)
  if (!val.trim()) {
    suggests.value = []
    return
  }
  timer = window.setTimeout(async () => {
    try {
      const r = await api.suggest(val)
      suggests.value = r.data.items
    } catch {
      suggests.value = []
    }
  }, 150)
})

function onSubmit() {
  const v = kw.value.trim()
  if (!v) return
  ui.pushHistory(v)
  open.value = false
  router.push({ name: 'search', query: { kw: v } })
}

function pickSuggest(s: string) {
  kw.value = s
  onSubmit()
}

function pickHistory(s: string) {
  kw.value = s
  onSubmit()
}

function highlight(text: string, kwStr: string) {
  if (!kwStr) return text
  const idx = text.toLowerCase().indexOf(kwStr.toLowerCase())
  if (idx < 0) return text
  return (
    text.slice(0, idx) +
    '<em style="color:var(--brand);font-style:normal">' +
    text.slice(idx, idx + kwStr.length) +
    '</em>' +
    text.slice(idx + kwStr.length)
  )
}

function onClickOutside(e: MouseEvent) {
  if (!boxRef.value) return
  if (!boxRef.value.contains(e.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <div class="search-box" ref="boxRef">
    <div class="search-input" :class="{ active: open }">
      <input
        v-model="kw"
        @focus="open = true"
        @keyup.enter="onSubmit"
        type="text"
        placeholder="搜索视频、UP 主、番剧…"
      />
      <button class="search-btn" @click="onSubmit" aria-label="搜索">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path
            d="M10 2a8 8 0 1 0 5.3 14.04l4.85 4.85 1.4-1.42-4.84-4.84A8 8 0 0 0 10 2zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12z"
          />
        </svg>
      </button>
    </div>

    <transition name="dropdown">
      <div v-if="open" class="dropdown">
        <!-- 建议词 -->
        <div v-if="suggests.length" class="block">
          <div class="block-title">大家都在搜</div>
          <ul>
            <li v-for="s in suggests" :key="s" @mousedown.prevent="pickSuggest(s)">
              <span class="icon-suggest">🔍</span>
              <span v-html="highlight(s, kw)" />
            </li>
          </ul>
        </div>
        <!-- 搜索历史 -->
        <div v-if="ui.searchHistory.length" class="block">
          <div class="block-title">
            <span>历史搜索</span>
            <button class="clear" @mousedown.prevent="ui.clearHistory">清空</button>
          </div>
          <ul>
            <li v-for="s in ui.searchHistory" :key="s" @mousedown.prevent="pickHistory(s)">
              <span class="icon-suggest">🕘</span>
              <span>{{ s }}</span>
            </li>
          </ul>
        </div>
        <!-- 热搜 -->
        <div class="block">
          <div class="block-title">热门搜索</div>
          <div class="trending">
            <span v-for="t in trending" :key="t" @mousedown.prevent="pickSuggest(t)" class="trend-tag">
              {{ t }}
            </span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.search-box {
  position: relative;
  width: 100%;
  max-width: 540px;
  margin: 0 24px;
}
.search-input {
  display: flex;
  align-items: center;
  height: 38px;
  border: 2px solid var(--border);
  border-radius: 19px;
  background: #f1f2f3;
  transition: border-color 0.15s, background 0.15s;
  &.active {
    background: #fff;
    border-color: var(--brand);
  }
  input {
    flex: 1;
    height: 100%;
    border: none;
    background: transparent;
    padding: 0 16px;
    font-size: 14px;
    color: var(--text);
    &::placeholder {
      color: var(--text-3);
    }
  }
  .search-btn {
    width: 56px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-2);
    &:hover {
      color: var(--brand);
    }
  }
}
.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-3);
  padding: 12px 0;
  z-index: 100;
  max-height: 480px;
  overflow: auto;
  .block {
    padding: 0 16px;
    & + .block {
      margin-top: 12px;
      border-top: 1px solid var(--border-2);
      padding-top: 12px;
    }
    .block-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--text-3);
      margin-bottom: 6px;
      .clear {
        color: var(--text-3);
        font-size: 12px;
        &:hover {
          color: var(--brand);
        }
      }
    }
    ul {
      li {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 4px;
        font-size: 14px;
        border-radius: 4px;
        cursor: pointer;
        &:hover {
          background: var(--bg-2);
        }
        .icon-suggest {
          color: var(--text-3);
        }
      }
    }
    .trending {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      .trend-tag {
        font-size: 12px;
        padding: 4px 10px;
        background: var(--bg-2);
        border-radius: 12px;
        cursor: pointer;
        color: var(--text-2);
        &:hover {
          background: var(--brand);
          color: #fff;
        }
      }
    }
  }
}
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s, transform 0.15s;
  transform-origin: top;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
