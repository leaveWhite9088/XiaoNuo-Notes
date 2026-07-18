import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'
import { authAPI } from '@/api'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<UserInfo | null>(null)
  const isLoggedIn = computed(() => !!user.value?.is_login)
  const loading = ref(false)

  // 登录二维码
  const qrCode = ref<string>('')
  const qrCodeKey = ref<string>('')
  const qrCodeStatus = ref<string>('')

  // 获取登录二维码
  async function fetchQRCode() {
    loading.value = true
    try {
      const res = await authAPI.getQRCode() as any
      if (res.success) {
        qrCode.value = res.qrcode_image
        qrCodeKey.value = res.oauth_key
        qrCodeStatus.value = 'waiting'
      }
    } catch (e) {
      console.error('获取二维码失败', e)
    } finally {
      loading.value = false
    }
  }

  // 检查二维码状态
  async function checkQRCodeStatus() {
    if (!qrCodeKey.value) return

    try {
      const res = await authAPI.checkQRCode(qrCodeKey.value) as any
      qrCodeStatus.value = res.status

      if (res.status === 'done') {
        // 登录成功，获取用户信息
        await fetchUserInfo()
        qrCode.value = ''
        qrCodeKey.value = ''
      } else if (res.status === 'timeout') {
        // 二维码过期，重新获取
        await fetchQRCode()
      }

      return res
    } catch (e) {
      console.error('检查二维码状态失败', e)
    }
  }

  // Cookie登录
  async function loginByCookie(sessdata: string, bili_jct: string, buvid3?: string) {
    loading.value = true
    try {
      const res = await authAPI.loginByCookie({ sessdata, bili_jct, buvid3 }) as any
      if (res.success && res.data) {
        user.value = res.data
        return true
      }
      return false
    } catch (e) {
      console.error('Cookie登录失败', e)
      return false
    } finally {
      loading.value = false
    }
  }

  // 获取用户信息
  async function fetchUserInfo() {
    try {
      const res = await authAPI.getMyInfo() as any
      if (res.success && res.data) {
        user.value = res.data
      } else {
        user.value = null
      }
    } catch (e) {
      user.value = null
    }
  }

  // 退出登录
  async function logout() {
    try {
      await authAPI.logout()
      user.value = null
    } catch (e) {
      console.error('退出登录失败', e)
    }
  }

  // 初始化 - 检查登录状态
  async function init() {
    await fetchUserInfo()
  }

  return {
    user,
    isLoggedIn,
    loading,
    qrCode,
    qrCodeKey,
    qrCodeStatus,
    fetchQRCode,
    checkQRCodeStatus,
    loginByCookie,
    fetchUserInfo,
    logout,
    init
  }
})
