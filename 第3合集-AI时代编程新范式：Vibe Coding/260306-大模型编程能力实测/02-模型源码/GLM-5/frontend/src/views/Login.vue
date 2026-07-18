<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const loginMethod = ref<'qrcode' | 'cookie'>('qrcode')
const cookieForm = ref({
  sessdata: '',
  bili_jct: '',
  buvid3: ''
})

let checkTimer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  // 如果已登录，跳转首页
  if (userStore.isLoggedIn) {
    router.push({ name: 'Home' })
    return
  }

  await userStore.fetchQRCode()
  startCheckTimer()
})

onUnmounted(() => {
  stopCheckTimer()
})

// 开始检查二维码状态
const startCheckTimer = () => {
  checkTimer = setInterval(async () => {
    const result = await userStore.checkQRCodeStatus()
    if (result?.status === 'done') {
      stopCheckTimer()
      router.push({ name: 'Home' })
    }
  }, 2000)
}

// 停止检查
const stopCheckTimer = () => {
  if (checkTimer) {
    clearInterval(checkTimer)
    checkTimer = null
  }
}

// 刷新二维码
const refreshQRCode = async () => {
  stopCheckTimer()
  await userStore.fetchQRCode()
  startCheckTimer()
}

// Cookie登录
const handleCookieLogin = async () => {
  if (!cookieForm.value.sessdata || !cookieForm.value.bili_jct) {
    alert('请填写必要的Cookie信息')
    return
  }

  const success = await userStore.loginByCookie(
    cookieForm.value.sessdata,
    cookieForm.value.bili_jct,
    cookieForm.value.buvid3
  )

  if (success) {
    router.push({ name: 'Home' })
  } else {
    alert('登录失败，请检查Cookie是否正确')
  }
}

// 切换登录方式
const switchMethod = (method: 'qrcode' | 'cookie') => {
  loginMethod.value = method
  if (method === 'qrcode' && !userStore.qrCode) {
    refreshQRCode()
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>登录 Bilibili</h1>
      <p class="subtitle">登录后可使用收藏、评论等更多功能</p>

      <!-- 登录方式切换 -->
      <div class="method-tabs">
        <button
          :class="['tab', { active: loginMethod === 'qrcode' }]"
          @click="switchMethod('qrcode')"
        >
          扫码登录
        </button>
        <button
          :class="['tab', { active: loginMethod === 'cookie' }]"
          @click="switchMethod('cookie')"
        >
          Cookie登录
        </button>
      </div>

      <!-- 二维码登录 -->
      <div v-if="loginMethod === 'qrcode'" class="qrcode-login">
        <div v-if="userStore.qrCode" class="qrcode-container">
          <img :src="userStore.qrCode" alt="登录二维码" />
          <div class="qrcode-status">
            <template v-if="userStore.qrCodeStatus === 'waiting'">
              请使用 Bilibili APP 扫描二维码登录
            </template>
            <template v-else-if="userStore.qrCodeStatus === 'scanned'">
              已扫描，请在手机上确认登录
            </template>
            <template v-else-if="userStore.qrCodeStatus === 'timeout'">
              二维码已过期
              <button class="refresh-btn" @click="refreshQRCode">点击刷新</button>
            </template>
          </div>
        </div>
        <div v-else class="loading">
          <div class="loading-spinner"></div>
        </div>
      </div>

      <!-- Cookie登录 -->
      <div v-else class="cookie-login">
        <div class="form-group">
          <label>SESSDATA <span class="required">*</span></label>
          <input
            v-model="cookieForm.sessdata"
            type="text"
            placeholder="请输入SESSDATA"
          />
        </div>
        <div class="form-group">
          <label>bili_jct <span class="required">*</span></label>
          <input
            v-model="cookieForm.bili_jct"
            type="text"
            placeholder="请输入bili_jct"
          />
        </div>
        <div class="form-group">
          <label>buvid3</label>
          <input
            v-model="cookieForm.buvid3"
            type="text"
            placeholder="可选"
          />
        </div>
        <div class="cookie-tip">
          <p>💡 如何获取Cookie？</p>
          <ol>
            <li>在浏览器中打开 bilibili.com 并登录</li>
            <li>按 F12 打开开发者工具</li>
            <li>切换到 Application/存储 选项卡</li>
            <li>在 Cookies 中找到 bilibili.com</li>
            <li>复制 SESSDATA 和 bili_jct 的值</li>
          </ol>
        </div>
        <button class="btn btn-primary login-btn" @click="handleCookieLogin">
          登录
        </button>
      </div>

      <div class="back-home">
        <router-link to="/">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: var(--spacing-xl);
}

.login-card {
  width: 100%;
  max-width: 400px;
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-xl);
}

.login-card h1 {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: var(--spacing-xs);
}

.subtitle {
  text-align: center;
  color: var(--text-tertiary);
  font-size: 14px;
  margin-bottom: var(--spacing-lg);
}

.method-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.tab {
  flex: 1;
  padding: var(--spacing-sm);
  background-color: var(--bg-secondary);
  border: none;
  border-radius: var(--border-radius);
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab:hover {
  background-color: var(--bg-hover);
}

.tab.active {
  background-color: var(--bili-pink);
  color: white;
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-container img {
  width: 200px;
  height: 200px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
}

.qrcode-status {
  margin-top: var(--spacing-md);
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
}

.refresh-btn {
  display: block;
  margin-top: var(--spacing-sm);
  background: none;
  color: var(--bili-pink);
  font-size: 14px;
  cursor: pointer;
}

.refresh-btn:hover {
  text-decoration: underline;
}

.loading {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
}

.required {
  color: var(--bili-pink);
}

.form-group input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 14px;
}

.cookie-tip {
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  font-size: 12px;
  color: var(--text-secondary);
}

.cookie-tip p {
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
}

.cookie-tip ol {
  margin-left: var(--spacing-md);
}

.cookie-tip li {
  margin-bottom: 4px;
}

.login-btn {
  width: 100%;
  padding: var(--spacing-md);
}

.back-home {
  text-align: center;
  margin-top: var(--spacing-lg);
}

.back-home a {
  color: var(--text-tertiary);
  font-size: 14px;
}

.back-home a:hover {
  color: var(--bili-pink);
}
</style>
