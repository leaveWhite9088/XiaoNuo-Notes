<template>
  <footer class="app-footer">
    <div class="layout">
      <div class="app-footer__top">
        <div class="app-footer__brand">
          <div class="brand-logo">
            <SvgIcon name="home" :size="26" />
            <span>哔哩哔哩</span>
          </div>
          <p class="app-footer__slogan">(゜-゜)つロ 干杯~</p>
          <div class="app-footer__links">
            <a v-for="link in quickLinks" :key="link" href="#" @click.prevent>{{ link }}</a>
          </div>
        </div>

        <div v-for="group in groups" :key="group.title" class="app-footer__group">
          <p class="app-footer__title">{{ group.title }}</p>
          <ul>
            <li v-for="item in group.items" :key="item">
              <a href="#" @click.prevent>{{ item }}</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="app-footer__bottom">
        <p>
          本站为 B站首页的界面与交互复刻练习项目，数据来自哔哩哔哩公开接口，仅用于技术演示，非官方站点。
        </p>
        <p class="app-footer__copy">
          沪ICP备13002172号-3 · 沪公网安备31010502000438号 · 服务条款 · 隐私政策
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import SvgIcon from '@/components/common/SvgIcon.vue';

const quickLinks = ['关于我们', '帮助中心', '用户反馈', '加入我们'];
const groups = [
  { title: '传送门', items: ['AcFun', 'biligame', '联系我们', '友情链接'] },
  { title: '开发者', items: ['开放平台', 'API 文档', '创作激励', 'UP主工具'] },
  { title: '社区', items: ['社区规则', '小黑屋', '举报中心', '版权申诉'] },
];
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.app-footer {
  margin-top: 40px;
  padding: 36px 0 24px;
  background: #fff;
  border-top: 1px solid $border-line;

  &__top {
    display: flex;
    gap: 60px;
    padding-bottom: 26px;
    border-bottom: 1px solid $border-line;
  }

  &__brand {
    flex: 1;
    min-width: 260px;
  }

  &__slogan {
    margin: 8px 0 14px;
    font-size: 13px;
    color: $text-3;
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;

    a {
      font-size: 13px;
      color: $text-2;

      &:hover {
        color: $brand-blue;
      }
    }
  }

  &__group {
    min-width: 130px;

    ul {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    a {
      font-size: 13px;
      color: $text-3;

      &:hover {
        color: $brand-blue;
      }
    }
  }

  &__title {
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
    color: $text-1;
  }

  &__bottom {
    padding-top: 20px;
    font-size: 12px;
    line-height: 1.9;
    color: $text-3;
  }

  &__copy {
    margin-top: 4px;
  }
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: $brand-pink;
}
</style>
