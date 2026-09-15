<template>
  <header class="hdr" :class="{ solid: solid }">
    <div class="inner">
      <nav class="left">
        <router-link to="/" class="home">
          <BiliLogo :variant="solid ? 'pink' : 'white'" />
          <span>首页</span>
        </router-link>
        <router-link to="/?channel=anime">番剧</router-link>
        <router-link to="/?channel=hot">直播</router-link>
        <router-link to="/?channel=game">游戏中心</router-link>
        <a href="javascript:void(0)">会员购</a>
        <a href="javascript:void(0)">漫画</a>
        <router-link to="/?channel=sports">赛事</router-link>
        <div class="more">
          <span>下载客户端</span>
          <div class="pop download">
            <p>扫码下载哔哩哔哩客户端</p>
            <div class="qr">B</div>
            <small>也可用手机应用商店搜索「哔哩哔哩」</small>
          </div>
        </div>
      </nav>
      <SearchBox />
      <div class="right">
        <div class="more avatar-wrap">
          <img class="avatar" :src="user.profile.avatar" alt="我" />
          <div class="pop user">
            <div class="me">
              <img :src="user.profile.avatar" alt="" />
              <div>
                <strong>{{ user.profile.name }}</strong>
                <em>年度大会员</em>
              </div>
            </div>
            <a href="javascript:void(0)">个人中心</a>
            <a href="javascript:void(0)">投稿管理</a>
            <a href="javascript:void(0)">推荐服务</a>
            <a href="javascript:void(0)">退出登录</a>
          </div>
        </div>
        <a class="vip" href="javascript:void(0)">大会员</a>
        <div class="more">
          <span>消息</span>
          <div class="pop mini">
            <a href="javascript:void(0)">回复我的</a>
            <a href="javascript:void(0)">@我的</a>
            <a href="javascript:void(0)">收到的赞</a>
            <a href="javascript:void(0)">系统通知</a>
            <a href="javascript:void(0)">私信</a>
          </div>
        </div>
        <div class="more">
          <span>动态</span>
          <div class="pop feed">暂无新动态，去首页发现更多视频吧</div>
        </div>
        <div class="more">
          <span>收藏</span>
          <div class="pop list">
            <router-link
              v-for="v in user.favorites.slice(0, 5)"
              :key="v"
              :to="'/video/' + v"
            >{{ v }}</router-link>
            <p v-if="!user.favorites.length" class="empty">收藏夹还是空的</p>
          </div>
        </div>
        <div class="more">
          <span>历史</span>
          <div class="pop list">
            <router-link v-for="h in user.history.slice(0, 6)" :key="h.bvid" :to="'/video/' + h.bvid">
              {{ h.title }}
            </router-link>
            <p v-if="!user.history.length" class="empty">还没有观看记录</p>
          </div>
        </div>
        <a href="javascript:void(0)">创作中心</a>
        <div class="more">
          <button class="upload" type="button">投稿</button>
          <div class="pop mini">
            <a href="javascript:void(0)">视频投稿</a>
            <a href="javascript:void(0)">专栏投稿</a>
            <a href="javascript:void(0)">音频投稿</a>
            <a href="javascript:void(0)">贴纸投稿</a>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BiliLogo from '../common/BiliLogo.vue'
import SearchBox from '../search/SearchBox.vue'
import { useUserStore } from '../../stores/user'

const user = useUserStore()
const route = useRoute()
const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 48
}
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const solid = computed(() => route.name !== 'home' || scrolled.value)
</script>

<style scoped>
.hdr {
  position: sticky;
  top: 0;
  z-index: 40;
  height: var(--header-h);
  color: #fff;
  transition: background .2s, color .2s, box-shadow .2s;
}
.hdr.solid {
  background: #fff;
  color: var(--text-1);
  box-shadow: 0 2px 8px rgba(0,0,0,.08);
}
.inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 24px;
}
.left, .right { display: flex; align-items: center; gap: 16px; font-size: 14px; white-space: nowrap; }
.home { display: flex; align-items: center; gap: 6px; font-weight: 600; }
.left a:hover, .right > a:hover, .more > span:hover { color: var(--pink); }
.vip { color: #e7a94b; font-weight: 600; }
.avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid #fff; }
.upload {
  height: 34px;
  padding: 0 16px;
  border: 0;
  border-radius: 8px;
  background: var(--pink);
  color: #fff;
  font-size: 14px;
}
.upload:hover { background: var(--pink-hover); }
.more { position: relative; display: flex; align-items: center; height: var(--header-h); }
.more > span { cursor: pointer; }
.pop {
  display: none;
  position: absolute;
  top: 52px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  color: var(--text-1);
  border-radius: 8px;
  box-shadow: var(--shadow);
  min-width: 180px;
  padding: 8px 0;
  z-index: 20;
}
.more:hover .pop { display: block; }
.pop a, .pop p {
  display: block;
  padding: 8px 16px;
  font-size: 13px;
}
.pop a:hover { background: #f6f7f8; color: var(--pink); }
.download { width: 200px; text-align: center; padding: 16px; }
.qr {
  width: 120px; height: 120px; margin: 8px auto;
  background: repeating-conic-gradient(#18191c 0% 25%, #fff 0% 50%) 0 0 / 12px 12px;
  border-radius: 6px;
  color: var(--pink); display: grid; place-items: center; font-weight: 800; font-size: 36px;
  mix-blend-mode: multiply;
}
.user { width: 240px; padding: 12px 0; }
.me { display: flex; gap: 10px; align-items: center; padding: 8px 16px 12px; }
.me img { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
.me em { display: block; color: #e7a94b; font-size: 12px; font-style: normal; }
.feed, .list { width: 260px; }
.empty { color: var(--text-3); }
.list a {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
