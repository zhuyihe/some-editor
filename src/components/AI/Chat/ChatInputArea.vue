<template>
  <div class="chat-input-area-v15-layout"> <!-- Renamed root class -->
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
      <div class="textarea-send-button-wrapper"> <!-- New wrapper -->
        <ElInput
          ref="textareaEl" 
          type="textarea"
          v-model="currentInputText"
          :autosize="{ minRows: 1, maxRows: 4 }"  
          :placeholder="props.isLoading ? 'AI 正在思考...' : '输入消息或 / 获取指令...'"
          @input="handleInput" 
          @keydown.enter.exact.prevent="onEnterPress"
          @keydown.arrow-up.prevent="onArrowUp"
          @keydown.arrow-down.prevent="onArrowDown"
          @keydown.escape.prevent="onEscapePress"
          :disabled="props.isLoading"
          resize="none"
          class="chat-textarea-v15" 
        />
        <ElButton
          type="primary"
          shape="circle" 
          :icon="SendIcon" 
          @click="handleSend" 
          :disabled="!currentInputText.trim() || props.isLoading"
          class="send-button-v15" 
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
import { Promotion as SendIcon } from '@element-plus/icons-vue'; // Renamed to SendIcon
import AIModeSwitcher from './AIModeSwitcher.vue';
import SlashCommandSuggest from './SlashCommandSuggest.vue';

interface CommandSuggestion {
  name: string;
  description: string;
  parameterFormat?: string; 
  value?: string; 
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
.chat-input-area-v15-layout { // Renamed root class
  // padding: 10px; // Padding will be handled by Region D container (AISidebarPanel)
  border-top: none; 
  background-color: #FFFFFF; // Match Region D background
  display: flex;
  flex-direction: column;
  gap: 8px; 
}

.input-control-wrapper {
  position: relative; // For slash popover
}

.textarea-send-button-wrapper { // New wrapper
  position: relative; 
  display: flex; 
  align-items: flex-end; 
  gap: 8px; 
}

.chat-textarea-v15.el-textarea { // Target ElInput with new class
  :deep(.el-textarea__inner) {
    border-radius: 8px !important; 
    border-color: #E0E6ED !important; 
    padding: 10px 12px !important; 
    line-height: 1.5; 
  }
  flex-grow: 1;
}

.send-button-v15.el-button { // New class for send button
  width: 36px;  // Diameter for circle button (adjust based on icon size and padding)
  height: 36px; // Diameter for circle button
  // padding: 0; // Reset padding for circle buttons if using fixed W/H
  font-size: 18px; // Adjust icon size as needed
  // Ensure icon is white if primary button text isn't automatically white
  .el-icon { 
    color: white;
  }
  // If theme's primary is not #2B79D0, uncomment and set custom background:
  // background-color: #2B79D0;
  // border-color: #2B79D0;
  // &:hover, &:focus, &:active {
  //   background-color: lighten(#2B79D0, 10%);
  //   border-color: lighten(#2B79D0, 10%);
  // }
}
      
.mode-switcher-component { 
  margin-bottom: 8px; 
}

// Positioning for ElPopover is handled by its props.
// .slash-suggest-component { ... } 

.parameter-hint { 
  font-size: 0.8em;
  color: var(--el-text-color-secondary);
  padding: 4px 8px;
  // margin-top: 4px; // Removed, gap on parent handles spacing
  background-color: var(--el-fill-color-lighter);
  border-radius: var(--el-border-radius-base);
  text-align: left; 
  transition: opacity 0.3s ease-in-out; 
}
</style>
