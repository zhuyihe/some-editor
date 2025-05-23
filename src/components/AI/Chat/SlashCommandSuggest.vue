<template>
  <div class="slash-command-suggest-wrapper" v-if="props.isVisible && props.suggestions.length > 0">
    <ul class="suggestion-list">
      <li 
        v-for="(suggestion, index) in props.suggestions" 
        :key="suggestion.name" 
        :class="{ 'suggestion-item': true, 'is-active': index === props.activeSuggestionIndex }"
        @mousedown.prevent="onSuggestionClick(suggestion)" 
        role="option"
        :aria-selected="index === props.activeSuggestionIndex"
      >
        <span class="suggestion-name">{{ suggestion.name }}</span>
        <span class="suggestion-description">{{ suggestion.description }}</span>
      </li>
    </ul>
  </div>
  <div class="slash-command-suggest-wrapper" v-if="props.isVisible && props.suggestions.length === 0">
    <div class="no-suggestions">无匹配指令</div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

interface CommandSuggestion {
  name: string; // e.g., "/生成笔记"
  description: string; // e.g., "生成病历记录 [类型] [焦点]"
  // Add other fields if needed, like an icon name or detailed parameters
}

const props = defineProps({
  isVisible: Boolean,
  suggestions: {
    type: Array as () => CommandSuggestion[],
    default: () => []
  },
  activeSuggestionIndex: { // For keyboard navigation
    type: Number,
    default: -1 // No item selected by default
  }
});

const emit = defineEmits(['selectSuggestion']);

const onSuggestionClick = (suggestion: CommandSuggestion) => {
  emit('selectSuggestion', suggestion);
};
</script>

<style scoped lang="scss">
.slash-command-suggest-wrapper {
  position: absolute;
  bottom: calc(100% + 4px); // Position above the input area with a small gap
  left: 0;
  right: 0; // Let it take available width or set a max-width
  background-color: var(--el-bg-color-overlay, #fff);
  border: 1px solid var(--el-border-color-lighter, #EBEEF5);
  border-radius: 6px;
  box-shadow: var(--el-box-shadow-light, 0px 0px 12px rgba(0,0,0,0.12));
  max-height: 250px; // Increased max-height
  overflow-y: auto;
  z-index: 20; // Ensure it's above other elements in the input area
  font-family: inherit; // Ensure it uses the application's font
}

.suggestion-list {
  list-style: none;
  padding: 4px; // Padding around the list
  margin: 0;
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px; // Rounded corners for individual items
  display: flex; // Use flex for better alignment of name and description
  flex-direction: column; // Stack name and description vertically

  .suggestion-name {
    font-weight: 600; // Make command name bold
    color: var(--el-text-color-primary, #303133);
    margin-bottom: 2px;
  }

  .suggestion-description {
    font-size: 0.85em;
    color: var(--el-text-color-secondary, #909399);
  }

  &.is-active, &:hover {
    background-color: var(--el-fill-color-light, #f5f7fa);
    color: var(--el-color-primary, #409eff); // Highlight text color as well
    .suggestion-name, .suggestion-description { // Ensure text color changes on hover too
       color: var(--el-color-primary, #409eff);
    }
  }
}
.no-suggestions {
  padding: 12px;
  text-align: center;
  color: var(--el-text-color-secondary, #909399);
  font-size: 0.9em;
}
</style>
