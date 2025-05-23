<template>
  <div class="chat-message-item" :class="['message-' + message.sender]">
    <div class="message-bubble">
      <span class="sender-name">{{ message.sender === 'user' ? 'You' : 'AI' }}</span>
      <div class="message-content">
        <p v-if="message.type === 'text'">{{ message.content }}</p>
        <div v-else-if="message.type === 'formatted'" v-html="message.content"></div>
        <div v-else-if="message.type === 'codeBlock'" class="code-block-wrapper">
          <div class="code-header">
            <span class="language">{{ message.content.language || 'code' }}</span>
            <button @click="copyCode(message.content.code)" class="copy-code-button" aria-label="Copy code">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg> 复制
            </button>
          </div>
          <pre><code :class="message.content.language ? 'language-' + message.content.language : ''">{{ message.content.code }}</code></pre>
          <span v-if="copiedFeedback" class="copied-feedback">已复制!</span>
        </div>
      </div>
      <span class="timestamp">{{ new Date(message.timestamp).toLocaleTimeString() }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  type: 'text' | 'formatted' | 'codeBlock';
  content: any; // string for text/formatted, { code: string, language?: string } for codeBlock
  timestamp: Date | string;
}
// interface CodeBlockContent { code: string; language?: string; } // Not explicitly used as a separate type here

const props = defineProps<{ message: Message }>();

const copiedFeedback = ref(false); // Feedback per item

const copyCode = async (codeToCopy: string) => {
  if (!navigator.clipboard) {
    // Fallback for older browsers or non-secure contexts if needed
    console.warn('Clipboard API not available');
    return;
  }
  try {
    await navigator.clipboard.writeText(codeToCopy);
    copiedFeedback.value = true;
    setTimeout(() => {
      copiedFeedback.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy code: ', err);
  }
};
</script>

<style scoped lang="scss">
.chat-message-item {
  margin-bottom: 10px;
  display: flex;
  
  &.message-user {
    justify-content: flex-end;
    .message-bubble {
      background-color: var(--el-color-primary-light-7, #dcf8c6);
      border-radius: 12px 12px 0 12px;
    }
  }

  &.message-ai {
    justify-content: flex-start;
    .message-bubble {
      background-color: var(--el-fill-color-light, #f1f0f0);
      border-radius: 12px 12px 12px 0;
    }
  }
}

.message-bubble {
  padding: 10px 14px;
  max-width: 75%;
  display: inline-block; 
  color: var(--el-text-color-primary, #303133);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  position: relative; // For copied-feedback positioning
}

.sender-name {
  font-weight: bold;
  font-size: 0.8em; 
  margin-bottom: 2px;
  display: block;
}

.message-content {
  p { // For message.type === 'text'
    margin: 0;
    white-space: pre-wrap;
    line-height: 1.5;
  }
  // For v-html content (message.type === 'formatted')
  // Using :deep() for scoped style penetration
  :deep(div[v-html]) { 
    line-height: 1.5;
    white-space: normal; // Let HTML control its whitespace
    ul, ol {
      padding-left: 20px;
      margin-top: 5px;
      margin-bottom: 5px;
    }
    strong { font-weight: bold; }
    em { font-style: italic; }
    a { 
      color: var(--el-color-primary, #409eff);
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.code-block-wrapper {
  margin-top: 8px;
  background-color: var(--el-fill-color-darker, #2c2f33); // Darker background for code
  color: var(--el-color-white, #fff); // Light text on dark background
  border-radius: 6px;
  overflow: hidden; 
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background-color: rgba(0,0,0,0.2); 
  font-size: 0.8em;
}

.language {
  color: var(--el-text-color-secondary-darkbg, #A3A6AD); 
}

.copy-code-button {
  background: var(--el-color-info-light-7, #58585b);
  color: var(--el-color-white, #fff);
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  &:hover {
    background: var(--el-color-info-light-5, #79797c);
  }
  svg { 
    width: 14px;
    height: 14px;
    fill: currentColor;
  }
}

.copied-feedback {
  position: absolute; 
  bottom: 5px;
  right: 5px;
  background-color: rgba(0,0,0,0.7);
  color: white;
  padding: 2px 5px;
  font-size: 0.7em;
  border-radius: 3px;
}

pre {
  margin: 0;
  padding: 10px;
  overflow-x: auto; 
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 0.85em;
  line-height: 1.6;
  background-color: transparent; 
  color: inherit; 
  white-space: pre; 
}

code { 
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  background-color: var(--el-fill-color, #eee); 
  padding: 0.1em 0.3em;
  border-radius: 3px;
  font-size: 0.9em; 
  color: var(--el-text-color-primary); 
}
pre code { 
   background-color: transparent;
   padding: 0;
   border-radius: 0;
   font-size: 1em; 
   color: inherit;
}

.timestamp {
  font-size: 0.75em;
  color: var(--el-text-color-secondary, #909399);
  display: block;
  text-align: right; 
  margin-top: 6px;
}
</style>
