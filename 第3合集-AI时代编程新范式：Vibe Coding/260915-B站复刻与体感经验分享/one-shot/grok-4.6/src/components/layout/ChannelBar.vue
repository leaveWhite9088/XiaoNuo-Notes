<template>
  <div class="bar">
    <div class="icons">
      <button
        v-for="c in channels"
        :key="c.id"
        class="icon"
        :class="{ on: modelValue === c.id }"
        type="button"
        @click="$emit('update:modelValue', c.id)"
      >
        <i :style="{ background: c.color }">{{ c.icon }}</i>
        <span>{{ c.name }}</span>
      </button>
    </div>
    <div class="links">
      <a v-for="l in extra" :key="l.name" href="javascript:void(0)">{{ l.name }}</a>
    </div>
  </div>
</template>

<script setup>
defineProps({
  channels: { type: Array, default: () => [] },
  extra: { type: Array, default: () => [] },
  modelValue: { type: String, default: 'recommend' }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.bar {
  display: flex;
  gap: 24px;
  align-items: stretch;
  padding: 18px 0 8px;
}
.icons {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 10px 8px;
}
.icon {
  border: 0;
  background: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--text-2);
  font-size: 13px;
}
.icon i {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-style: normal;
  font-size: 22px;
  box-shadow: 0 6px 14px rgba(24, 25, 28, 0.08);
}
.icon.on, .icon:hover { color: var(--pink); }
.icon.on i { outline: 2px solid #fff; box-shadow: 0 0 0 2px var(--pink); }
.links {
  width: 168px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  align-content: start;
  padding-top: 4px;
  border-left: 1px solid var(--line);
  padding-left: 20px;
  font-size: 13px;
  color: var(--text-2);
}
.links a:hover { color: var(--pink); }
</style>
