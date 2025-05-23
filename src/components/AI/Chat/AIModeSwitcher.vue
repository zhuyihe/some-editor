<template>
  <div class="ai-mode-switcher-ep">
    <ElRadioGroup v-model="selectedMode" size="small">
      <ElRadioButton label="ask">提问 Ask</ElRadioButton>
      <ElRadioButton label="agent">代理 Agent</ElRadioButton>
    </ElRadioGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElRadioGroup, ElRadioButton } from 'element-plus';

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
.ai-mode-switcher-ep {
  display: flex;
  // align-items: center; // ElRadioGroup usually handles its own alignment
  // gap: 8px; 
  // padding: 4px 0; // May not be needed if parent handles padding

  // Example of deeper styling if needed:
  // :deep(.el-radio-button__inner) { 
  //   padding: 6px 12px; 
  //   font-size: 0.9em; 
  // }
}
</style>
