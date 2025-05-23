<template>
  <div class="chat-message-list" ref="listEl">
    <ChatMessageItem 
      v-for="message in messages" 
      :key="message.id" 
      :message="message" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, defineProps } from 'vue';
import ChatMessageItem from './ChatMessageItem.vue';

interface Message { 
  id: string; 
  sender: 'user' | 'ai'; 
  type: 'text' | 'formatted' | 'codeBlock'; 
  content: any; 
  timestamp: Date | string; 
}
const props = defineProps<{ messages: Message[] }>();

const listEl = ref<HTMLDivElement | null>(null);

watch(() => props.messages, async (newMessages, oldMessages) => {
  await nextTick(); 
  if (listEl.value) {
    if (newMessages.length > (oldMessages?.length || 0) || newMessages.length === 1) {
      listEl.value.scrollTop = listEl.value.scrollHeight;
    }
  }
}, { deep: true }); 

// Scroll on initial load
watch(() => listEl.value, async (newListEl) => {
  if (newListEl) {
    await nextTick();
    newListEl.scrollTop = newListEl.scrollHeight;
  }
});
</script>

<style scoped lang="scss">
.chat-message-list {
  flex-grow: 1;
  padding: 15px; // Updated padding
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  // Custom Scrollbar Styles
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--el-border-color-darker, #c0c4cc);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background-color: var(--el-fill-color-lighter, #f5f7fa);
  }
  scrollbar-width: thin;
  scrollbar-color: var(--el-border-color-darker, #c0c4cc) var(--el-fill-color-lighter, #f5f7fa);
}
</style>
