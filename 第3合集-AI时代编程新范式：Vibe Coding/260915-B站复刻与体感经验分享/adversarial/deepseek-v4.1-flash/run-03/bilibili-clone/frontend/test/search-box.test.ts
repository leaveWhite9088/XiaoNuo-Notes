import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import SearchBox from '@/components/layout/SearchBox.vue';
import type { SuggestResult } from '@/types';

const suggest = vi.fn<(keyword: string) => Promise<SuggestResult>>();

vi.mock('@/api', () => ({
  searchApi: {
    suggest: (keyword: string) => suggest(keyword),
    search: vi.fn(async () => ({ list: [], total: 0, page: 1, pageSize: 24, hasMore: false })),
    hot: vi.fn(async () => ['热搜一', '热搜二']),
  },
}));

const HOT: SuggestResult = {
  keyword: '',
  mode: 'hot',
  hotSearch: ['热搜一', '热搜二', '热搜三'],
  suggestions: [],
};

const SUGGEST: SuggestResult = {
  keyword: '凡人',
  mode: 'suggest',
  hotSearch: ['热搜一'],
  suggestions: [
    { type: 'video', text: '凡人修仙传 第 191 集', bvid: 'BV1EmYm6HE57', cover: '/media/covers/x.webp' },
    { type: 'up', text: '哔哩哔哩国创', mid: 1 },
  ],
};

function mountBox() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/video/:bvid', name: 'video', component: { template: '<div />' } },
      { path: '/search', name: 'search', component: { template: '<div />' } },
    ],
  });
  return {
    router,
    wrapper: mount(SearchBox, { global: { plugins: [router] }, attachTo: document.body }),
  };
}

describe('SearchBox 搜索建议', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    suggest.mockReset();
  });

  it('聚焦即展开热搜榜', async () => {
    suggest.mockResolvedValue(HOT);
    const { wrapper } = mountBox();
    await wrapper.find('input').trigger('focus');
    await new Promise((r) => setTimeout(r, 20));
    await wrapper.vm.$nextTick();

    expect(suggest).toHaveBeenCalledWith('');
    expect(wrapper.findAll('.hot-list li').length).toBe(3);
    expect(wrapper.find('.search-panel__title').text()).toContain('热搜');
    wrapper.unmount();
  });

  it('输入后展示建议并支持键盘选择跳转视频', async () => {
    suggest.mockImplementation(async (kw: string) => (kw ? SUGGEST : HOT));
    const { wrapper, router } = mountBox();
    const push = vi.spyOn(router, 'push');

    await wrapper.find('input').trigger('focus');
    await wrapper.find('input').setValue('凡人');
    await new Promise((r) => setTimeout(r, 320));
    await wrapper.vm.$nextTick();

    const rows = wrapper.findAll('.suggest-list li');
    expect(rows.length).toBe(2);
    expect(rows[0]!.text()).toContain('凡人修仙传');

    // ↓ 高亮第一条，回车直接进入视频详情
    await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' });
    await wrapper.find('input').trigger('keydown', { key: 'Enter' });
    expect(push).toHaveBeenCalledWith({ name: 'video', params: { bvid: 'BV1EmYm6HE57' } });
    wrapper.unmount();
  });

  it('没有高亮时回车走搜索页', async () => {
    suggest.mockImplementation(async (kw: string) => (kw ? SUGGEST : HOT));
    const { wrapper, router } = mountBox();
    const push = vi.spyOn(router, 'push');

    await wrapper.find('input').setValue('凡人');
    await new Promise((r) => setTimeout(r, 320));
    await wrapper.find('input').trigger('keydown', { key: 'Enter' });

    expect(push).toHaveBeenCalledWith({ name: 'search', query: { keyword: '凡人' } });
    wrapper.unmount();
  });

  it('接口失败时降级为热搜且不抛未处理异常', async () => {
    suggest.mockRejectedValue(new Error('网络异常'));
    const { wrapper } = mountBox();
    await wrapper.find('input').trigger('focus');
    await wrapper.find('input').setValue('凡人');
    await new Promise((r) => setTimeout(r, 320));
    await wrapper.vm.$nextTick();

    // 没有 suggestion 行，但输入框仍可用
    expect(wrapper.findAll('.suggest-list li').length).toBe(0);
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('凡人');
    wrapper.unmount();
  });
});
