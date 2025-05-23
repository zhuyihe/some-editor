<template>
  <ElScrollbar ref="scrollbarRef" class="chat-message-list-scrollbar" @scroll="handleScroll">
    <div ref="innerListRef" class="chat-message-list-content">
      <template v-if="messages && messages.length > 0">
        <ChatMessageItem 
          v-for="message in messages" 
          :key="message.id" 
          :message="message" 
        />
      </template>
      <ElEmpty v-else description="暂无消息，开始对话吧！" />
    </div>
  </ElScrollbar>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, defineProps } from 'vue';
import { ElScrollbar, ElEmpty } from 'element-plus'; // Import ElEmpty
import ChatMessageItem from './ChatMessageItem.vue';

interface Message { 
  id: string; 
  sender: 'user' | 'ai'; 
  type: 'text' | 'formatted' | 'codeBlock'; 
  content: any; 
  timestamp: Date | string; 
}
const props = defineProps<{ messages: Message[] }>();

const scrollbarRef = ref<InstanceType<typeof ElScrollbar> | null>(null);
const innerListRef = ref<HTMLDivElement | null>(null);

watch(() => props.messages, async (newMessages, oldMessages) => {
  await nextTick(); 
  if (scrollbarRef.value && innerListRef.value) {
    const messagesContainer = innerListRef.value;
    scrollbarRef.value.setScrollTop(messagesContainer.scrollHeight);
  }
}, { deep: true }); 

onMounted(async () => {
  await nextTick();
  if (scrollbarRef.value && innerListRef.value) {
    const messagesContainer = innerListRef.value;
    scrollbarRef.value.setScrollTop(messagesContainer.scrollHeight);
  }
});

const handleScroll = (event: { scrollLeft: number, scrollTop: number }) => {
  // Placeholder for future use (e.g., show "scroll to bottom" button)
  // console.log('Scrolled:', event.scrollTop);
};
</script>

<style scoped lang="scss">
.chat-message-list-scrollbar {
  height: 100%; 
  background-color: var(--el-bg-color, #fff); 
}
.chat-message-list-content {
  padding: 15px; 
  // display: flex; // Not needed if ChatMessageItem is block and list flows naturally
  // flex-direction: column;
}
</style>
