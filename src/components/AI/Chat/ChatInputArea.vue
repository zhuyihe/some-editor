<template>
  <div class="chat-input-area">
    <AIModeSwitcher 
      class="mode-switcher-component"
      v-model="modeForSwitcher" 
    />
    <div class="input-control-wrapper"> <!-- New wrapper -->
      <SlashCommandSuggest 
        :is-visible="showSlashCommands" 
        :suggestions="filteredSlashCommands"
        :active-suggestion-index="activeSuggestionIndex"
        @selectSuggestion="handleSelectSuggestion"
        class="slash-suggest-component"
      />
      <div class="input-wrapper"> <!-- This was the old .input-wrapper -->
        <textarea 
          ref="textareaEl"
          v-model="currentInputText"
          placeholder="输入消息或 / 获取指令..."
          @input="handleInput"
          @keydown.enter.exact.prevent="onEnterPress"
          @keydown.arrow-up.prevent="onArrowUp"
          @keydown.arrow-down.prevent="onArrowDown"
          @keydown.escape.prevent="onEscapePress" 
          :disabled="props.isLoading"
        ></textarea>
        <button @click="handleSend" :disabled="!currentInputText.trim() || props.isLoading">发送</button>
      </div>
    </div>
    <div class="parameter-hint" v-if="showParameterHint">
      {{ parameterHintText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'; // Added nextTick from previous turn, ensure it's here.
import AIModeSwitcher from './AIModeSwitcher.vue';
import SlashCommandSuggest from './SlashCommandSuggest.vue';

interface CommandSuggestion {
  name: string;
  description: string;
  parameterFormat?: string; // Added for parameter hints
}

const props = defineProps({
  modelValue: { 
    type: String,
    required: true
  },
  isLoading: { 
    type: Boolean,
    default: false
  },
  currentAiMode: { 
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'sendMessage', 'update:currentAiMode']);

const modeForSwitcher = computed({
  get: () => props.currentAiMode,
  set: (value) => emit('update:currentAiMode', value)
});

const textareaEl = ref<HTMLTextAreaElement | null>(null);
const activeSuggestionIndex = ref(-1);

const currentInputText = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const showSlashCommands = ref(false);
const showParameterHint = ref(false); // New state for parameter hint
const parameterHintText = ref(''); // New state
let parameterHintTimer: number | undefined = undefined; // New state
const commandTextForHint = ref(''); // New state

const allSlashCommands = ref<CommandSuggestion[]>([
  { 
    name: '/生成笔记', 
    description: '生成病历记录', 
    parameterFormat: '[笔记类型 (SOAP|病程|...)] [可选: "关键词"]' 
  },
  { 
    name: '/查询药物', 
    description: '查询药物信息', 
    parameterFormat: '[药物名称] [可选: 剂量]' 
  },
  { 
    name: '/安排检查', 
    description: '为患者安排检查项目', 
    parameterFormat: '[检查项目名称] 日期: [日期] [可选: 注意事项]'
  }
]);

const filteredSlashCommands = computed(() => {
  if (!showSlashCommands.value || !currentInputText.value.startsWith('/')) {
    return [];
  }
  const query = currentInputText.value.substring(1).toLowerCase();
  return allSlashCommands.value.filter(cmd => 
    cmd.name.toLowerCase().includes(query) || 
    cmd.description.toLowerCase().includes(query)
  );
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  const currentValue = target.value;
  emit('update:modelValue', currentValue);

  target.style.height = 'auto';
  target.style.height = `${target.scrollHeight}px`;

  if (showParameterHint.value && !currentValue.startsWith(commandTextForHint.value)) {
     showParameterHint.value = false;
     clearTimeout(parameterHintTimer);
  }

  if (currentValue.startsWith('/')) {
    showSlashCommands.value = true;
    activeSuggestionIndex.value = -1; 
  } else {
    showSlashCommands.value = false;
    activeSuggestionIndex.value = -1;
    // If input is cleared or no longer a command, also hide hint
    if (showParameterHint.value) {
        showParameterHint.value = false;
        clearTimeout(parameterHintTimer);
    }
  }
};

const handleSend = () => {
  if (currentInputText.value.trim() && !props.isLoading) {
    emit('sendMessage', currentInputText.value.trim());
    emit('update:modelValue', ''); // Clear input
    showSlashCommands.value = false;
    activeSuggestionIndex.value = -1;
    if (textareaEl.value) {
      textareaEl.value.style.height = 'auto';
    }
  }
};

const onArrowUp = () => {
  if (showSlashCommands.value && filteredSlashCommands.value.length > 0) {
    activeSuggestionIndex.value = 
      (activeSuggestionIndex.value - 1 + filteredSlashCommands.value.length) % filteredSlashCommands.value.length;
    scrollToActiveSuggestion();
  }
};

const onArrowDown = () => {
  if (showSlashCommands.value && filteredSlashCommands.value.length > 0) {
    activeSuggestionIndex.value = 
      (activeSuggestionIndex.value + 1) % filteredSlashCommands.value.length;
    scrollToActiveSuggestion();
  }
};

const onEnterPress = () => {
  if (showSlashCommands.value && activeSuggestionIndex.value !== -1) {
    selectActiveSuggestion();
  } else {
    handleSend(); 
  }
};

const onEscapePress = () => {
  if (showSlashCommands.value) {
    showSlashCommands.value = false;
    activeSuggestionIndex.value = -1;
  }
};

const selectActiveSuggestion = () => {
  if (activeSuggestionIndex.value >= 0 && activeSuggestionIndex.value < filteredSlashCommands.value.length) {
    handleSelectSuggestion(filteredSlashCommands.value[activeSuggestionIndex.value]);
  }
};

const scrollToActiveSuggestion = () => {
  console.log("Scrolling to active suggestion index:", activeSuggestionIndex.value);
  // Placeholder for actual scroll logic if list becomes long
};

const handleSelectSuggestion = (suggestion: CommandSuggestion) => {
  const commandText = suggestion.name + ' '; // Add space
  emit('update:modelValue', commandText); 
  commandTextForHint.value = commandText; // Store for hint logic
  showSlashCommands.value = false;
  activeSuggestionIndex.value = -1;
  
  // Parameter Hint Logic
  if (suggestion.parameterFormat) {
    parameterHintText.value = `格式: ${suggestion.parameterFormat}`;
    showParameterHint.value = true;
    clearTimeout(parameterHintTimer); // Clear previous timer if any
    parameterHintTimer = window.setTimeout(() => {
      showParameterHint.value = false;
    }, 4000); // Show hint for 4 seconds
  } else {
    showParameterHint.value = false; // No format for this command
  }

  textareaEl.value?.focus();
  // Auto-grow after selection
  nextTick(() => {
    if (textareaEl.value) {
      textareaEl.value.style.height = 'auto';
      textareaEl.value.style.height = `${textareaEl.value.scrollHeight}px`;
    }
  });
};

// nextTick was already imported from previous turn's changes.

</script>

<style scoped lang="scss">
.chat-input-area {
  padding: 10px;
  border-top: 1px solid #ccc;
  background-color: #f9f9f9;
  // position: relative; // No longer needed here, moved to wrapper
}
.input-control-wrapper { // New wrapper style
  position: relative;
}
.input-wrapper {
  display: flex;
  align-items: flex-end; 
  margin-top: 8px;
}
textarea {
  flex-grow: 1;
  min-height: 30px; 
  max-height: 120px; 
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: none; 
  overflow-y: auto; 
  line-height: 1.4;
  transition: height 0.2s ease-in-out;
  &:disabled { 
    background-color: #e9ecef; 
    cursor: not-allowed; 
  }
}
button {
  padding: 8px 15px;
  margin-left: 8px;
  border: none;
  background-color: var(--primary-color, #409eff);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  &:disabled {
    background-color: #a0cfff; 
    opacity: 0.7; 
    cursor: not-allowed;
  }
}
.mode-switcher-component {
  margin-bottom: 8px; 
}
.slash-suggest-component {
  position: absolute; // Crucial for positioning within .input-control-wrapper
  bottom: 100%; 
  left: 0;
  right: 0;
  margin-bottom: 4px; 
  z-index: 20; 
}
.parameter-hint {
  font-size: 0.8em;
  color: var(--el-text-color-secondary, #909399);
  padding: 4px 8px;
  margin-top: 4px;
  background-color: var(--el-fill-color-lighter, #f5f7fa);
  border-radius: 4px;
  text-align: left; 
  transition: opacity 0.3s ease-in-out; 
}
</style>
