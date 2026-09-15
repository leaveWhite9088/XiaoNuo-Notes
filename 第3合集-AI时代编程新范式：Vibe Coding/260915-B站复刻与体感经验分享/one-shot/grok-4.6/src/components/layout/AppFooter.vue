<template>
  <footer class="ft">
    <div class="page-wrap inner">
      <div>
        <h4>bilibili</h4>
        <p>关于我们</p>
        <p>联系我们</p>
        <p>用户协议</p>
        <p>隐私政策</p>
      </div>
      <div>
        <h4>传送门</h4>
        <p>协议公示</p>
        <p>活动中心</p>
        <p>名人堂</p>
        <p>壁纸站</p>
      </div>
      <div>
        <h4>合作</h4>
        <p>MCN 管理</p>
        <p>广告合作</p>
        <p>帮助中心</p>
        <p>侵权投诉</p>
      </div>
      <div class="copy">
        <BiliLogo variant="pink" with-word />
        <small>本项目为学习用途的 B 站首页复刻 Demo，与哔哩哔哩无关。</small>
      </div>
    </div>
  </footer>
</template>

<script setup>
import BiliLogo from '../common/BiliLogo.vue'
</script>

<style scoped>
.ft {
  background: #fff;
  border-top: 1px solid var(--line);
  color: var(--text-3);
  font-size: 13px;
  padding: 28px 0 40px;
}
.inner { display: grid; grid-template-columns: repeat(3, 140px) 1fr; gap: 24px; }
h4 { margin: 0 0 10px; color: var(--text-2); font-size: 14px; }
p { margin: 6px 0; }
.copy { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
small { max-width: 280px; text-align: right; }
</style>
