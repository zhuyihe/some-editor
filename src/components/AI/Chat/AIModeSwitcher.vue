<template>
  <div class="ai-mode-switcher">
    <label for="mode-select" class="mode-label">AI 模式:</label>
    <select id="mode-select" v-model="selectedMode">
      <option value="ask">提问 Ask</option>
      <option value="agent">代理 Agent</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
    validator: (value: string) => ['ask', 'agent'].includes(value)
  }
});

const emit = defineEmits(['update:modelValue']);

const selectedMode = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script>

<style scoped lang="scss">
.ai-mode-switcher {
  display: flex;
  align-items: center;
  gap: 8px; // Space between label and select
  padding: 4px 0; // Some vertical padding if it's standalone
}
.mode-label {
  font-size: 0.9em;
  color: var(--el-text-color-regular, #606266);
}
select {
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  background-color: #fff;
  font-size: 0.9em;
  min-width: 120px; // Give it some base width

  &:focus {
    border-color: var(--el-color-primary, #409eff);
    box-shadow: 0 0 0 2px rgba(64,158,255, 0.2); // Using direct RGB for el-color-primary-rgb fallback
  }
}
</style>
