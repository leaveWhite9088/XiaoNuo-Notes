import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import VideoCard from '@/components/video/VideoCard.vue';
import type { VideoCard as VideoCardType } from '@/types';

const video = {
  bvid: 'BV1bxYV6BEwS',
  title: '《对三骗王炸》',
  cover: '/media/covers/x.webp',
  videoUrl: '/media/videos/sample-1.mp4',
  duration: 78,
  durationText: '01:18',
  pubdate: 1,
  pubdateText: '2026-09-12 11:00',
  timeAgo: '3小时前',
  tname: '日常',
  categorySlug: 'life',
  description: '简介',
  play: 1_450_000,
  playText: '145万',
  danmaku: 676,
  danmakuText: '676',
  like: 100,
  likeText: '100',
  coin: 1,
  favorite: 1,
  reply: 1,
  share: 1,
  owner: { mid: 1, name: '中国火箭军', avatar: '' },
} as VideoCardType;

function mountCard(props: Record<string, unknown> = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/video/:bvid', name: 'video', component: { template: '<div />' } },
      { path: '/search', name: 'search', component: { template: '<div />' } },
      { path: '/category/:slug', name: 'category', component: { template: '<div />' } },
    ],
  });
  return {
    router,
    wrapper: mount(VideoCard, {
      props: { video, ...props },
      global: { plugins: [router] },
      attachTo: document.body,
    }),
  };
}

describe('VideoCard', () => {
  it('hover 时切换 hover 态：封面放大、标题变粉、出现稍后再看与弹幕数', async () => {
    const { wrapper } = mountCard();
    expect(wrapper.find('.card__title').classes()).not.toContain('is-hover');

    await wrapper.trigger('mouseenter');
    expect(wrapper.find('.card__title').classes()).toContain('is-hover');
    expect(wrapper.find('.card__play-mask').classes()).toContain('is-show');
    expect(wrapper.find('.card__later').classes()).toContain('is-show');
    expect(wrapper.find('.card__danmaku').classes()).toContain('is-show');

    await wrapper.trigger('mouseleave');
    expect(wrapper.find('.card__title').classes()).not.toContain('is-hover');
    wrapper.unmount();
  });

  it('点击卡片跳转到视频详情', async () => {
    const { wrapper, router } = mountCard();
    const push = vi.spyOn(router, 'push');
    await wrapper.trigger('click');
    expect(push).toHaveBeenCalledWith({ name: 'video', params: { bvid: video.bvid } });
    wrapper.unmount();
  });

  it('点击 UP 主 / 分区标签时不会误触发详情跳转', async () => {
    const { wrapper, router } = mountCard();
    const push = vi.spyOn(router, 'push');

    await wrapper.find('.card__cat').trigger('click');
    expect(push).toHaveBeenCalledWith({ name: 'category', params: { slug: 'life' } });
    expect(push).not.toHaveBeenCalledWith({ name: 'video', params: { bvid: video.bvid } });

    push.mockClear();
    await wrapper.find('.card__owner').trigger('click');
    expect(push).toHaveBeenCalledWith({ name: 'search', query: { keyword: '中国火箭军' } });
    wrapper.unmount();
  });

  it('稍后再看按钮只切换本地状态、不跳转', async () => {
    const { wrapper, router } = mountCard();
    const push = vi.spyOn(router, 'push');
    await wrapper.find('.card__later').trigger('click');
    expect(wrapper.find('.card__later').text()).toContain('已添加');
    expect(push).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('mini 变体展示精简信息，rank 变体展示名次', () => {
    const { wrapper } = mountCard({ variant: 'mini', rank: 1 });
    expect(wrapper.classes()).toContain('card--mini');
    expect(wrapper.find('.card__rank').text()).toBe('1');
    wrapper.unmount();
  });
});
