<template>
  <div class="chat-message-item" :class="['message-' + message.sender, 'message-type-' + message.type]">
    <ElAvatar 
      :icon="message.sender === 'user' ? UserIcon : RobotIcon" 
      :size="32" 
      class="message-avatar"
    />
    <div class="message-bubble">
      <span class="sender-name">{{ message.sender === 'user' ? 'You' : 'AI' }}</span>
      <div class="message-content">
        <p v-if="message.type === 'text'">{{ message.content }}</p>
        <div v-else-if="message.type === 'formatted'" v-html="message.content"></div>
        <div v-else-if="message.type === 'codeBlock'" class="code-block-wrapper">
          <div class="code-header">
            <span class="language">{{ message.content.language || 'code' }}</span>
            <ElButton 
              type="primary" 
              link 
              size="small" 
              :icon="CopyDocumentIcon" 
              @click="copyCode(message.content.code)"
              class="copy-code-el-button"
            >复制</ElButton>
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
import { ElAvatar, ElButton } from 'element-plus';
import { User as UserIcon, Cpu as RobotIcon, CopyDocument as CopyDocumentIcon } from '@element-plus/icons-vue';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  type: 'text' | 'formatted' | 'codeBlock';
  content: any; 
  timestamp: Date | string;
}

const props = defineProps<{ message: Message }>();
const copiedFeedback = ref(false);

const copyCode = async (codeToCopy: string) => {
  if (!navigator.clipboard) {
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
  margin-bottom: 15px; // Increased margin
  display: flex;
  gap: 8px; // Space between avatar and bubble

  &.message-user {
    flex-direction: row-reverse; // Avatar on right, bubble on left
    .message-bubble {
      background-color: var(--el-color-primary-light-9, #e1eaff); // Lighter EP blue
      border-radius: 12px 0px 12px 12px; // Adjusted for user
      color: var(--el-color-primary-dark-2, #3375b9); // Darker text for primary bg
    }
    // Sender name and timestamp color for user messages might need to be adjusted
    // if the default doesn't contrast well with the primary-light-9 background.
    // For now, assume default text color is fine, or it's handled by global EP styles.
  }

  &.message-ai {
    flex-direction: row; // Avatar on left, bubble on right
    .message-bubble {
      background-color: var(--el-fill-color-light, #f0f2f5); // Default EP light fill
      border-radius: 0px 12px 12px 12px; // Adjusted for AI
    }
  }
}

.message-avatar {
  flex-shrink: 0;
  &.el-avatar--icon { // Specific styling for default icon avatars
    background-color: var(--el-color-info-light-3, #c8c9cc); 
    color: var(--el-color-white);
  }
}

.message-bubble {
  padding: 10px 14px;
  max-width: calc(100% - 32px - 8px); // Full width minus avatar and gap
  display: inline-block; 
  box-shadow: var(--el-box-shadow-lighter, 0px 0px 12px rgba(0,0,0,0.06));
  position: relative; 
}

.sender-name {
  font-weight: bold;
  font-size: 0.8em; 
  margin-bottom: 4px; // Slightly more space
  display: block;
  color: var(--el-text-color-regular); // Ensure sender name is consistently colored
}

.message-content {
  p { 
    margin: 0;
    white-space: pre-wrap;
    line-height: 1.5;
  }
  :deep(div[v-html]) { 
    line-height: 1.5;
    white-space: normal; 
    ul, ol {
      padding-left: 20px;
      margin: 5px 0;
    }
    strong { font-weight: var(--el-font-weight-primary); }
    em { font-style: italic; }
    a { 
      color: var(--el-color-primary);
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.code-block-wrapper {
  margin-top: 8px;
  background-color: var(--el-fill-color-darker, #141414); // Darker for code
  color: #e0e0e0; // Light text on dark background
  border-radius: var(--el-border-radius-base, 4px);
  overflow: hidden; 
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background-color: var(--el-bg-color-page, #2a2a2a); // Slightly lighter than code block bg
  font-size: 0.8em;
}

.language {
  color: var(--el-text-color-disabled, #848486); // Muted color for language hint
  font-family: var(--el-font-family-mono);
}

.copy-code-el-button {
  // ElButton with type="primary" link has its own color, adjust if needed
  // Example: color: var(--el-color-info-light-5, #a6a9ad); 
  // &:hover { color: var(--el-color-info-light-3, #c8c9cc); }
  // For now, rely on ElButton's default link styling.
  font-size: 12px; // Make icon/text slightly smaller
}

.copied-feedback {
  position: absolute; 
  bottom: 8px; // Adjusted to be more inside
  right: 8px;  // Adjusted
  background-color: var(--el-overlay-color-lighter, rgba(0,0,0,0.7));
  color: var(--el-color-white);
  padding: 3px 6px;
  font-size: 0.75em;
  border-radius: var(--el-border-radius-small);
}

pre {
  margin: 0;
  padding: 12px; // Increased padding
  overflow-x: auto; 
  font-family: var(--el-font-family-mono, "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace);
  font-size: 0.875em; // Slightly larger for readability
  line-height: 1.6;
  background-color: transparent !important; // Ensure no other bg interferes
  color: inherit; 
  white-space: pre; 
}

// Reset for inline code if needed, though less common in chat directly
code:not(pre > code) { 
  font-family: var(--el-font-family-mono);
  background-color: var(--el-fill-color-light); 
  padding: 0.1em 0.3em;
  border-radius: var(--el-border-radius-small);
  font-size: 0.9em; 
  color: var(--el-text-color-primary); 
}
// Ensure pre > code inherits correctly
pre code { 
   background-color: transparent;
   padding: 0;
   border-radius: 0;
   font-size: 1em; // Inherit pre's font size
   color: inherit;
   font-family: inherit; // Inherit pre's font family
}

.timestamp {
  font-size: 0.75em;
  color: var(--el-text-color-placeholder, #A8ABB2); // Use placeholder color
  display: block;
  text-align: right; 
  margin-top: 8px; // Increased margin
}
</style>
