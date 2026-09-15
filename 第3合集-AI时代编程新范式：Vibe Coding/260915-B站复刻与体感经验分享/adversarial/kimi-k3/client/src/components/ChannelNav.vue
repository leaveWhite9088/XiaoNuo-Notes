<template>
  <section class="channel-nav container">
    <div class="channel-list">
      <a v-for="c in channels" :key="c.name" class="channel-item" href="javascript:;">
        <span class="channel-icon" :style="{ background: c.bg }">{{ c.icon }}</span>
        <span class="channel-name">{{ c.name }}</span>
      </a>
    </div>
    <div class="channel-extra">
      <a class="extra-item" href="javascript:;">
        <span class="extra-icon">📈</span>热门
      </a>
      <a class="extra-item" href="javascript:;">
        <span class="extra-icon">🕐</span>动态
      </a>
      <a class="extra-item" href="javascript:;">
        <span class="extra-icon">🏆</span>每周必看
      </a>
      <a class="extra-item" href="javascript:;">
        <span class="extra-icon">📺</span>入站必刷
      </a>
    </div>
  </section>
</template>

<script setup>
const channels = [
  { name: '首页', icon: '🏠', bg: '#ffe4ec' },
  { name: '番剧', icon: '🌸', bg: '#ffe9f0' },
  { name: '直播', icon: '📡', bg: '#e8f4ff' },
  { name: '游戏中心', icon: '🎮', bg: '#e9f7ef' },
  { name: '会员购', icon: '🛍️', bg: '#fff3e0' },
  { name: '漫画', icon: '📖', bg: '#f3e8ff' },
  { name: '赛事', icon: '🏅', bg: '#e8faff' },
  { name: '放映厅', icon: '🎬', bg: '#fdeeee' },
  { name: '课堂', icon: '🎓', bg: '#eef7e8' },
  { name: '专栏', icon: '✏️', bg: '#fff8e1' },
  { name: '新歌热榜', icon: '🎵', bg: '#ffeef7' },
  { name: '热门活动', icon: '🎉', bg: '#fdeaea' },
];
</script>

<style scoped>
.channel-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 10px;
  gap: 16px;
}

.channel-list {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  flex: 1;
}

.channel-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  transition: background 0.2s;
  flex-shrink: 0;
}

.channel-item:hover {
  background: #fff;
}

.channel-item:hover .channel-name {
  color: var(--bili-pink);
}

.channel-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.channel-name {
  font-size: 13px;
  color: var(--text-main);
  white-space: nowrap;
}

.channel-extra {
  display: flex;
  gap: 18px;
  flex-shrink: 0;
  padding-left: 16px;
  border-left: 1px solid var(--border-gray);
}

.extra-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--text-sub);
  white-space: nowrap;
}

.extra-item:hover {
  color: var(--bili-pink);
}

.extra-icon {
  font-size: 16px;
}

@media (max-width: 900px) {
  .channel-extra {
    display: none;
  }
}
</style>
