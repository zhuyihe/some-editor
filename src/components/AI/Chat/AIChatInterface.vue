<template>
  <div class="ai-chat-interface">
    <ChatMessageList 
      :messages="messages" 
      class="message-list-component"
      v-loading="isLoadingAIResponse"
      element-loading-text="AI 正在思考..."
      element-loading-svg-view-box="-10, -10, 50, 50" 
      :element-loading-spinner="svgSpinner"
    />
    <!-- Removed old ai-thinking-indicator -->
    <ChatInputArea 
      v-model="currentInput" 
      v-model:currentAiMode="currentMode"
      @sendMessage="handleUserMessageSend"
      :is-loading="isLoadingAIResponse"
      class="input-area-component" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus'; // Import ElMessage
import ChatMessageList from './ChatMessageList.vue';
import ChatInputArea from './ChatInputArea.vue';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  type: 'text' | 'formatted' | 'codeBlock';
  content: any;
  timestamp: Date | string;
}

const svgSpinner = `<svg class="circular" viewBox="0 0 20 20" style="width:20px; height:20px; stroke:var(--el-color-primary);"> <circle class="path" cx="10" cy="10" r="8" fill="none" stroke-width="2" stroke-linecap="round"></circle> </svg>`;

const messages = ref<Message[]>([
  { id: '1', sender: 'user', type: 'text', content: '你好，AI助手。', timestamp: new Date(Date.now() - 1000 * 60 * 10) },
  { id: '2', sender: 'ai', type: 'text', content: '你好！有什么可以帮助您的吗？', timestamp: new Date(Date.now() - 1000 * 60 * 9) },
  { id: 'user-formatted', sender: 'user', type: 'text', content: 'Show me <strong>bold</strong> and <em>italic</em> text, and a list:\n- Item 1\n- Item 2', timestamp: new Date(Date.now() - 1000*60*8) },
  { 
    id: 'ai-formatted', 
    sender: 'ai', 
    type: 'formatted', 
    content: '<p>当然，这是 <strong>加粗文本</strong>, 这是 <em>斜体文本</em>。</p><ul><li>列表项 1</li><li>列表项 2</li></ul><p>链接示例: <a href=\"#\" target=\"_blank\">点击这里</a></p>', 
    timestamp: new Date(Date.now() - 1000 * 60 * 5) 
  },
  { 
    id: 'ai-codeblock', 
    sender: 'ai', 
    type: 'codeBlock', 
    content: { 
      code: "function greet(name) {\n  console.log('Hello, ' + name + '!');\n}", 
      language: 'javascript' 
    }, 
    timestamp: new Date(Date.now() - 1000 * 60 * 2) 
  },
  { id: 'user-soap', sender: 'user', type: 'text', content: '/生成笔记 SOAP "头痛"', timestamp: new Date(Date.now() - 1000 * 60 *1) },
  { id: 'ai-soap-reply', sender: 'ai', type: 'text', content: '正在为您执行指令 "/生成笔记"... (参数: SOAP, 头痛)', timestamp: new Date() },
]);

const currentInput = ref('');
const isLoadingAIResponse = ref(false); 
const currentMode = ref('ask'); 

const commandRegistry: Array<{ name: string, requiredParams: string[], paramHint: string }> = [
  { name: '/生成笔记', requiredParams: ['笔记类型'], paramHint: '请提供笔记类型 (例如 SOAP, 病程记录)。' },
  { name: '/查询药物', requiredParams: ['药物名称'], paramHint: '请提供药物名称。' },
  { name: '/安排检查', requiredParams: ['检查项目名称', '日期'], paramHint: '请提供检查项目名称和日期。'}
];

const handleUserMessageSend = (messageText: string) => {
  if (!messageText) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    sender: 'user',
    type: 'text',
    content: messageText,
    timestamp: new Date()
  };
  messages.value.push(userMessage);

  isLoadingAIResponse.value = true;
  
  let aiFollowUpQuestion = '';
  const parts = messageText.trim().split(' ');
  const commandName = parts[0];
  const commandArgs = parts.slice(1).filter(arg => arg.trim() !== '');
  const matchedCommand = commandRegistry.find(cmd => cmd.name === commandName);

  if (matchedCommand) {
    if (commandArgs.length < matchedCommand.requiredParams.length) {
      aiFollowUpQuestion = matchedCommand.paramHint;
    }
  }

  setTimeout(() => {
    let aiResponseContent: string;
    if (aiFollowUpQuestion) {
      aiResponseContent = aiFollowUpQuestion;
    } else if (matchedCommand) {
      aiResponseContent = `正在为您执行指令 "${matchedCommand.name}"... (参数: ${commandArgs.join(', ')})`;
    } else {
      aiResponseContent = `AI (模拟回复): "${messageText}"`;
    }

    const aiResponseMessage: Message = {
      id: Date.now().toString(),
      sender: 'ai',
      type: 'text',
      content: aiResponseContent,
      timestamp: new Date()
    };
    messages.value.push(aiResponseMessage);
    
    // Simulate Operation Results/Errors with ElMessage
    if (messageText.includes("error_test")) { 
      ElMessage({
        message: '模拟操作失败：无法处理您的请求。',
        type: 'error',
        duration: 3000,
      });
    } else if (messageText.startsWith('/')) {
        ElMessage({
        message: `指令 "${matchedCommand ? matchedCommand.name : commandName}" 执行模拟完成。`,
        type: 'success',
        duration: 2000,
      });
    }
    isLoadingAIResponse.value = false; 
  }, 1000 + Math.random() * 1000);
};
</script>

<style scoped lang="scss">
.ai-chat-interface {
  display: flex;
  flex-direction: column;
  height: 100%; 
  background-color: #fff;
}
.message-list-component {
  flex-grow: 1;
  // overflow-y: auto; // Handled by ElScrollbar inside ChatMessageList
}
.input-area-component {
  flex-shrink: 0;
}
// .ai-thinking-indicator styles removed as the div is removed
</style>
