<template>
  <footer class="app-footer">
    <div class="container footer-inner">
      <div class="footer-cols">
        <div class="col">
          <h4>哔哩哔哩</h4>
          <a>关于我们</a><a>用户协议</a><a>隐私政策</a><a>联系我们</a>
        </div>
        <div class="col">
          <h4>传送门</h4>
          <a>高级弹幕</a><a>活动专题</a><a>帮助中心</a><a>侵权申诉</a>
        </div>
        <div class="col">
          <h4>下载 App</h4>
          <div class="qr-row">
            <div class="qr">iOS<br />& Android</div>
            <div class="qr-text">扫码下载哔哩哔哩 App<br />看视频、刷弹幕、追番一气呵成</div>
          </div>
        </div>
      </div>
      <div class="copyright">© 2026 bilibili-mock ｜ 仅作前端复刻演示，无任何商业用途 ｜ 视频源/封面来自公开测试集</div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
.app-footer {
  background: #f6f7f8;
  border-top: 1px solid $bili-border;
  margin-top: 40px;
  padding: 32px 0 24px;
  font-size: 12px;
  color: $bili-text-3;
}
.footer-cols {
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr;
  gap: 32px;
}
.col {
  h4 { color: $bili-text; font-size: 14px; margin-bottom: 12px; font-weight: 500; }
  a {
    display: block;
    line-height: 26px;
    color: $bili-text-2;
    &:hover { color: $bili-pink; }
  }
}
.qr-row { display: flex; gap: 12px; align-items: center; }
.qr {
  width: 72px;
  height: 72px;
  background: #fff;
  border: 1px solid $bili-border;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: $bili-text-3;
  text-align: center;
  line-height: 1.4;
}
.qr-text { font-size: 12px; color: $bili-text-2; line-height: 1.6; }
.copyright {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid $bili-border;
  text-align: center;
}
</style>
