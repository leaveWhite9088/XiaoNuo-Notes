<template>
  <footer class="app-footer">
    <div class="container footer-inner">
      <div class="col">
        <h4>哔哩哔哩</h4>
        <p>（演示）首页复刻 MVP</p>
        <p>所有数据均为模拟数据，仅供学习与原型展示。</p>
      </div>
      <div class="col">
        <h4>内容</h4>
        <a>动画</a>
        <a>音乐</a>
        <a>游戏</a>
        <a>知识</a>
        <a>生活</a>
      </div>
      <div class="col">
        <h4>帮助</h4>
        <a>关于</a>
        <a>反馈</a>
        <a>协议</a>
      </div>
      <div class="col">
        <h4>技术栈</h4>
        <p>Vue 3 · Vite · Express · TypeScript</p>
        <p>© {{ new Date().getFullYear() }} bilibili-clone</p>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  background: var(--bg-2);
  border-top: 1px solid var(--border-2);
  padding: 32px 0 24px;
  margin-top: 48px;
  color: var(--text-2);
  font-size: 13px;
}
.footer-inner {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr;
  gap: 32px;
  h4 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 8px;
  }
  .col {
    display: flex;
    flex-direction: column;
    gap: 4px;
    p {
      margin: 0;
      line-height: 1.7;
    }
    a {
      color: var(--text-2);
      cursor: pointer;
      &:hover {
        color: var(--brand);
      }
    }
  }
}
@media (max-width: 768px) {
  .footer-inner {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
