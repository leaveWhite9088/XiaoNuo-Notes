<template>
  <div class="search" @focusin="open = true">
    <form class="bar" @submit.prevent="go()">
      <input
        v-model="keyword"
        :placeholder="placeholder"
        @focus="open = true"
        @input="onInput"
      />
      <button class="go" type="submit" aria-label="搜索">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/>
          <path d="M16 16.5 20 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </form>
    <div v-if="open" class="panel">
      <div v-if="!keyword && user.searchHistory.length" class="block">
        <div class="hd">
          <span>搜索历史</span>
          <button type="button" @click="user.clearSearch()">清空</button>
        </div>
        <div class="chips">
          <button v-for="h in user.searchHistory" :key="h" type="button" @click="go(h)">{{ h }}</button>
        </div>
      </div>
      <div v-if="keyword && suggests.length" class="block">
        <button
          v-for="s in suggests"
          :key="s.text"
          class="sug"
          type="button"
          @click="go(s.text)"
        >
          <span class="q">{{ s.text }}</span>
          <span class="t">{{ s.type === 'up' ? 'UP主' : s.type === 'tag' ? '标签' : '视频' }}</span>
        </button>
      </div>
      <div class="block">
        <div class="hd"><span>bilibili 热搜</span></div>
        <ol>
          <li v-for="(h, i) in hot" :key="h.word">
            <button type="button" @click="go(h.word)">
              <em :class="{ top: i < 3 }">{{ i + 1 }}</em>
              <span>{{ h.word }}</span>
              <b v-if="h.heat">{{ h.heat }}</b>
            </button>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchHot, fetchSuggest } from '../../api/client'
import { useUserStore } from '../../stores/user'

const user = useUserStore()
const router = useRouter()
const keyword = ref('')
const open = ref(false)
const hot = ref([])
const suggests = ref([])
const placeholder = ref('iPhone 17 首发评测')
let timer = 0
let rot = 0
let rotId = 0

onMounted(async () => {
  const data = await fetchHot()
  hot.value = data.list || []
  const words = hot.value.map((h) => h.word)
  rotId = setInterval(() => {
    rot = (rot + 1) % Math.max(words.length, 1)
    if (!keyword.value) placeholder.value = words[rot] || placeholder.value
  }, 3200)
  document.addEventListener('click', onDoc)
})
onUnmounted(() => {
  clearInterval(rotId)
  document.removeEventListener('click', onDoc)
})

function onDoc(e) {
  if (!e.target.closest('.search')) open.value = false
}
function onInput() {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    if (!keyword.value.trim()) {
      suggests.value = []
      return
    }
    const data = await fetchSuggest(keyword.value.trim())
    suggests.value = data.list || []
  }, 160)
}
function go(text) {
  const q = (text ?? keyword.value).trim() || placeholder.value
  keyword.value = q
  user.addSearch(q)
  open.value = false
  router.push({ name: 'search', query: { q } })
}
</script>

<style scoped>
.search { position: relative; width: min(420px, 36vw); }
.bar {
  display: flex;
  height: 40px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid transparent;
}
.bar:focus-within { border-color: var(--pink); }
input {
  flex: 1;
  border: 0;
  outline: none;
  padding: 0 14px;
  font-size: 14px;
  background: transparent;
  color: var(--text-1);
}
.go {
  width: 46px;
  border: 0;
  background: transparent;
  color: var(--text-2);
}
.go:hover { color: var(--pink); }
.panel {
  position: absolute;
  top: 46px;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: var(--shadow);
  padding: 10px 0 8px;
  z-index: 30;
}
.block { padding: 4px 0 8px; }
.hd {
  display: flex;
  justify-content: space-between;
  padding: 4px 14px 8px;
  font-size: 13px;
  color: var(--text-2);
}
.hd button { border: 0; background: none; color: var(--text-3); }
.chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 14px; }
.chips button {
  border: 0;
  background: #f1f2f3;
  border-radius: 14px;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--text-2);
}
.sug, ol button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 0;
  background: none;
  text-align: left;
  font-size: 13px;
}
.sug:hover, ol button:hover { background: #f6f7f8; }
.sug .t { margin-left: auto; color: var(--text-3); font-size: 12px; }
ol { padding: 0; margin: 0; }
em {
  width: 16px;
  font-style: normal;
  color: var(--text-3);
  font-size: 13px;
}
em.top { color: var(--pink); font-weight: 700; }
b {
  margin-left: auto;
  font-size: 11px;
  color: #fff;
  background: #f69;
  border-radius: 3px;
  padding: 0 4px;
  font-weight: 600;
}
</style>
