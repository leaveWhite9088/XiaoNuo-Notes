import { ref } from 'vue';
import { api } from '../api';

/** 分类数据共享缓存：头部"分区"大菜单与首页分类条共用一份；加载失败暴露 failed 供消费端展示重试 */
const chips = ref([]);
const menu = ref([]);
const failed = ref(false);
let loaded = false;
let inflight = null;

async function load() {
  failed.value = false;
  inflight = api
    .categories()
    .then((res) => {
      chips.value = res.chips;
      menu.value = res.menu;
      loaded = true;
    })
    .catch(() => {
      failed.value = true;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useCategories() {
  if (!loaded && !inflight && !failed.value) load();
  return { chips, menu, failed, reload: load };
}
