<template>
  <div class="chat-messages-container-only"> <!-- Updated root class -->
    <ChatMessageList 
      :messages="props.messages" 
      class="message-list-component"
      v-loading="isLoadingDisplay" <!-- Uses computed prop -->
      element-loading-text="AI 正在思考..."
      element-loading-svg-view-box="-10, -10, 50, 50" 
      :element-loading-spinner="svgSpinner"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'; 
import ChatMessageList from './ChatMessageList.vue';

// Message interface definition will be lifted to AISidebarPanel.vue or a types file
interface Message { id: string; sender: 'user' | 'ai'; type: 'text' | 'formatted' | 'codeBlock'; content: any; timestamp: Date | string; }

const props = defineProps<{
  messages: Message[];
  isLoadingExternally: boolean; 
}>();

const isLoadingDisplay = computed(() => props.isLoadingExternally);
      
const svgSpinner = '<svg class="circular" viewBox="0 0 20 20" style="width:20px; height:20px; stroke:var(--el-color-primary);"><circle class="path" cx="10" cy="10" r="8" fill="none" stroke-width="2" stroke-linecap="round"></circle></svg>';
</script>

<style scoped lang="scss">
.chat-messages-container-only { // Updated root class
  display: flex;
  flex-direction: column;
  height: 100%; 
  background-color: transparent; 
}
.message-list-component {
  flex-grow: 1;
}
</style>
