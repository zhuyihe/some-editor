<template>
  <div class="chat-input-area">
    <AIModeSwitcher 
      class="mode-switcher-component"
      v-model="modeForSwitcher" 
    />
    <div class="input-control-wrapper">
      <ElPopover
        ref="slashPopoverRef"
        :visible="slashPopoverVisible" 
        placement="top-start"
        :width="300" 
        trigger="manual" 
        :show-arrow="false"
        popper-class="slash-command-popover" 
        :virtual-ref="textareaEl" 
        virtual-triggering 
      >
        <SlashCommandSuggest 
          :is-visible="true"  
          :suggestions="filteredSlashCommands"
          :active-suggestion-index="activeSuggestionIndex"
          @selectSuggestion="handleSelectSuggestion"
        />
      </ElPopover>
      <div class="input-wrapper">
        <ElInput
          ref="textareaEl" 
          type="textarea"
          v-model="currentInputText"
          :autosize="{ minRows: 1, maxRows: 5 }"
          :placeholder="props.isLoading ? 'AI 正在思考...' : '输入消息或 / 获取指令...'"
          @input="handleInput" 
          @keydown.enter.exact.prevent="onEnterPress"
          @keydown.arrow-up.prevent="onArrowUp"
          @keydown.arrow-down.prevent="onArrowDown"
          @keydown.escape.prevent="onEscapePress"
          :disabled="props.isLoading"
          resize="none"
          class="chat-textarea"
        />
        <ElButton
          type="primary"
          :icon="PromotionIcon" 
          @click="handleSend" 
          :disabled="!currentInputText.trim() || props.isLoading"
          class="send-button"
        />
      </div>
    </div>
    <div class="parameter-hint" v-if="showParameterHint">
      {{ parameterHintText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { ElInput, ElButton, ElPopover } from 'element-plus';
import { Promotion as PromotionIcon } from '@element-plus/icons-vue';
import AIModeSwitcher from './AIModeSwitcher.vue';
import SlashCommandSuggest from './SlashCommandSuggest.vue';

interface CommandSuggestion {
  name: string;
  description: string;
  parameterFormat?: string; 
  value?: string; // For ElAutocomplete or custom list, often same as name
}

const props = defineProps({
  modelValue: { type: String, required: true },
  isLoading: { type: Boolean, default: false },
  currentAiMode: { type: String, required: true }
});

const emit = defineEmits(['update:modelValue', 'sendMessage', 'update:currentAiMode']);

const modeForSwitcher = computed({
  get: () => props.currentAiMode,
  set: (value) => emit('update:currentAiMode', value)
});

const textareaEl = ref<InstanceType<typeof ElInput> | null>(null); // Ref for ElInput
const slashPopoverRef = ref<InstanceType<typeof ElPopover> | null>(null); // Ref for ElPopover
const activeSuggestionIndex = ref(-1);
const slashPopoverVisible = ref(false); // For ElPopover visibility

const currentInputText = computed({ // This computed prop remains the same
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const showParameterHint = ref(false);
const parameterHintText = ref('');
let parameterHintTimer: number | undefined = undefined;
const commandTextForHint = ref('');

const allSlashCommands = ref<CommandSuggestion[]>([
  { name: '/生成笔记', description: '生成病历记录', parameterFormat: '[笔记类型] [关键词]', value: '/生成笔记' },
  { name: '/查询药物', description: '查询药物信息', parameterFormat: '[药物名称] [剂量]', value: '/查询药物' },
  { name: '/安排检查', description: '为患者安排检查项目', parameterFormat: '[检查项目] [日期]', value: '/安排检查' }
]);

const filteredSlashCommands = computed(() => {
  if (!slashPopoverVisible.value || !currentInputText.value.startsWith('/')) {
    return [];
  }
  const query = currentInputText.value.substring(1).toLowerCase();
  return allSlashCommands.value.filter(cmd => 
    cmd.name.toLowerCase().includes(query) || 
    cmd.description.toLowerCase().includes(query)
  );
});

// Updated handleInput for ElInput and ElPopover
const handleInput = (value: string) => { // ElInput's input event passes the value directly
  // currentInputText.value = value; // This is handled by v-model on ElInput
  
  if (showParameterHint.value && !value.startsWith(commandTextForHint.value)) {
     showParameterHint.value = false;
     clearTimeout(parameterHintTimer);
  }

  if (value.startsWith('/')) {
    slashPopoverVisible.value = true; // Show popover
    activeSuggestionIndex.value = -1; 
  } else {
    slashPopoverVisible.value = false; // Hide popover
    activeSuggestionIndex.value = -1;
    if (showParameterHint.value) {
        showParameterHint.value = false;
        clearTimeout(parameterHintTimer);
    }
  }
};

const handleSend = () => {
  if (currentInputText.value.trim() && !props.isLoading) {
    emit('sendMessage', currentInputText.value.trim());
    emit('update:modelValue', ''); 
    slashPopoverVisible.value = false;
    activeSuggestionIndex.value = -1;
    // ElInput autosize handles height reset
  }
};

const onArrowUp = () => {
  if (slashPopoverVisible.value && filteredSlashCommands.value.length > 0) {
    activeSuggestionIndex.value = 
      (activeSuggestionIndex.value - 1 + filteredSlashCommands.value.length) % filteredSlashCommands.value.length;
    // scrollToActiveSuggestion(); // Implement if needed for popover content
  }
};

const onArrowDown = () => {
  if (slashPopoverVisible.value && filteredSlashCommands.value.length > 0) {
    activeSuggestionIndex.value = 
      (activeSuggestionIndex.value + 1) % filteredSlashCommands.value.length;
    // scrollToActiveSuggestion(); // Implement if needed
  }
};

const onEnterPress = () => {
  if (slashPopoverVisible.value && activeSuggestionIndex.value !== -1) {
    selectActiveSuggestion();
  } else {
    handleSend(); 
  }
};

const onEscapePress = () => {
  if (slashPopoverVisible.value) {
    slashPopoverVisible.value = false;
    activeSuggestionIndex.value = -1;
  } else if (showParameterHint.value) { // Also hide hint on Escape
    showParameterHint.value = false;
    clearTimeout(parameterHintTimer);
  }
};

const selectActiveSuggestion = () => {
  if (activeSuggestionIndex.value >= 0 && activeSuggestionIndex.value < filteredSlashCommands.value.length) {
    handleSelectSuggestion(filteredSlashCommands.value[activeSuggestionIndex.value]);
  }
};

// const scrollToActiveSuggestion = () => { /* ... */ }; // Placeholder

const handleSelectSuggestion = (suggestion: CommandSuggestion) => {
  const commandText = suggestion.name + ' '; 
  emit('update:modelValue', commandText); 
  commandTextForHint.value = commandText; 
  slashPopoverVisible.value = false; // Hide popover
  activeSuggestionIndex.value = -1;
  
  if (suggestion.parameterFormat) {
    parameterHintText.value = `格式: ${suggestion.parameterFormat}`;
    showParameterHint.value = true;
    clearTimeout(parameterHintTimer); 
    parameterHintTimer = window.setTimeout(() => {
      showParameterHint.value = false;
    }, 4000); 
  } else {
    showParameterHint.value = false; 
  }

  // Focus ElInput after selection
  nextTick(() => {
    textareaEl.value?.focus();
  });
};
</script>

<style scoped lang="scss">
.chat-input-area {
  padding: 10px;
  border-top: 1px solid var(--el-border-color-lighter);
  background-color: var(--el-bg-color-page);
}
.input-control-wrapper {
  position: relative;
}
.input-wrapper {
  display: flex;
  align-items: flex-end; 
  gap: 8px;
  margin-top: 8px;
}
.chat-textarea { // Class for ElInput
  flex-grow: 1;
  // ElInput's :autosize handles height. Specific inner styling below.
}
:deep(.el-textarea__inner) { 
  padding: 8px 10px; 
  line-height: 1.5;
  resize: none !important; // Override if ElInput adds resize
}
.send-button {
  // Default ElButton styling is usually good.
}
.mode-switcher-component {
  margin-bottom: 8px; 
}
// .slash-suggest-component class is no longer directly positioned here.
// Positioning is handled by ElPopover.
.parameter-hint {
  font-size: 0.8em;
  color: var(--el-text-color-secondary);
  padding: 4px 8px;
  margin-top: 4px;
  background-color: var(--el-fill-color-lighter);
  border-radius: var(--el-border-radius-base);
  text-align: left; 
  transition: opacity 0.3s ease-in-out; 
}
</style>
// Popper class styling will be added globally or via :deep in a parent if needed
// For now, assuming default ElPopover content area is fine or SlashCommandSuggest handles its own padding.
