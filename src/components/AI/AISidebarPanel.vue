<template>
  <div class="ai-sidebar-panel-v15">
    <header class="region-a-header">
      <span class="header-title">AI 助手</span>
      <div class="header-controls">
        <ElTooltip content="设置" placement="bottom" :hide-after="0">
          <ElButton type="text" :icon="Setting" @click="openSettings" aria-label="设置" class="control-button" />
        </ElTooltip>
        <ElTooltip :content="isCollapsed ? '展开侧边栏' : '收起侧边栏'" placement="bottom" :hide-after="0">
          <ElButton 
            type="text" 
            :icon="isCollapsed ? Expand : Fold" 
            @click="toggleCollapse" 
            aria-label="收起/展开侧边栏"
            class="control-button"
          />
        </ElTooltip>
      </div>
    </header>

    <main class="region-b-main-content">
      <ElScrollbar class="chat-history-scrollbar">
        <AIChatInterface /> 
      </ElScrollbar>
    </main>
    
    <div class="region-c-chat-control">
      <ElSelect 
        v-model="selectedHistorySession" 
        placeholder="历史会话" 
        size="small"
        class="history-select"
      >
        <ElOption
          v-for="item in chatHistorySessions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </ElSelect>
      <ElButton 
        type="text" 
        :icon="Delete" 
        @click="clearConversation"
        class="clear-button"
      >
        清除对话
      </ElButton>
    </div>
          
    <section class="region-d-input-area">
      <!-- Placeholder for ChatInputArea, which is currently part of AIChatInterface in Region B -->
      <!-- This region is now styled as per spec. -->
    </section>
    <div class="region-e-bottom-tool-placeholder">Region E: Bottom Tool Area (48px)</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// ElIcon is not directly used in template but ElButton might use it implicitly via :icon prop.
import { ElButton, ElIcon, ElTooltip, ElScrollbar, ElSelect, ElOption, ElMessage } from 'element-plus'; 
import { Setting, Expand, Fold, Delete } from '@element-plus/icons-vue'; // Added Delete icon
import AIChatInterface from './Chat/AIChatInterface.vue'; 

const isCollapsed = ref(false); 
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  console.log('Toggle collapse/expand. New state isCollapsed:', isCollapsed.value);
};
const openSettings = () => {
  console.log('Open AI Assistant settings');
};

// Placeholder data and methods for chat history and clear
const chatHistorySessions = ref([
  { id: '1', name: '今日会话 1 (10:30)' },
  { id: '2', name: '昨日会话 (15:45)' },
  { id: '3', name: '更早的会话...' },
]);
const selectedHistorySession = ref('');
const clearConversation = () => {
  console.log('Clear conversation clicked');
  ElMessage.info('对话已清除 (模拟)');
};
</script>

<style scoped lang="scss">
.ai-sidebar-panel-v15 {
  width: 300px; 
  height: 100vh; 
  background-color: #F8FAFD; 
  border-left: 1px solid #E0E6ED; 
  display: flex;
  flex-direction: column;
  overflow: hidden; 
  flex-shrink: 0; 
}

// Remove placeholder style for region-a-header-placeholder

.region-a-header {
  height: 56px; // Fixed height
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px; // Standard padding
  flex-shrink: 0; // Prevent shrinking
  border-bottom: 1px solid #E0E6ED; 
}

.header-title {
  font-size: 16px;
  font-weight: 600; // semi-bold
  color: #303133;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 8px; // Space between buttons
}

.control-button.el-button { // Targeting ElButton specifically
  font-size: 16px; // Icon size
  padding: 6px; 
  color: var(--el-text-color-regular, #606266);
  border-radius: var(--el-border-radius-base, 4px); // Consistent border radius

  &:hover, &:focus {
    color: var(--el-color-primary, #2B79D0); // Use v1.5 primary color
    background-color: var(--el-fill-color-light, #f5f7fa);
  }
}

// Styles for other placeholder regions remain for now
.region-e-bottom-tool-placeholder {
  flex-shrink: 0;
  border-bottom: 1px dashed #ccc; 
  padding: 5px;
  font-size: 0.8em;
  text-align: center;
}
// Height definitions for fixed placeholders
// .region-c-chat-control-placeholder { height: 40px; } // Removed
.region-e-bottom-tool-placeholder { height: 48px; }
// .region-d-input-placeholder { flex-shrink: 0; min-height: 56px; } // Removed

// Styles for Region B (from previous step)
.region-b-main-content {
  flex-grow: 1; 
  background-color: #FFFFFF; 
  padding: 16px; 
  overflow: hidden; 
  display: flex; 
  flex-direction: column; 
}
.chat-history-scrollbar {
  flex-grow: 1; 
  :deep(.el-scrollbar__view) {
    // AIChatInterface is expected to fill this.
  }
}

// Styles for Region C (from previous step)
.region-c-chat-control {
  height: 40px; 
  background-color: #FFFFFF; 
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px; 
  border-top: 1px solid #E0E6ED;
  border-bottom: 1px solid #E0E6ED;
  flex-shrink: 0;
}
.history-select {
  :deep(.el-input__wrapper) { 
      font-size: 0.9em; 
  }
}
.clear-button.el-button { 
  font-size: 0.9em; 
  color: var(--el-text-color-secondary, #909399); 
  &:hover, &:focus {
    color: var(--el-color-danger, #F56C6C); 
    background-color: var(--el-color-danger-light-9, #FEF0F0); 
  }
  .el-icon {
    margin-right: 4px;
  }
}

// New styles for Region D
.region-d-input-area {
  min-height: 56px;    // Spec: Adaptive height, min 56px
  max-height: 120px;   // Spec: Adaptive height, max 120px (ElInput autosize will manage this)
  background-color: #FFFFFF; // Spec: Background #FFFFFF
  padding: 16px;       // Spec: Padding 16px
  flex-shrink: 0;
  display: flex;       // To allow ChatInputArea (or its wrapper in AIChatInterface) to fill it
  flex-direction: column; // To allow ChatInputArea (or its wrapper in AIChatInterface) to fill it
  // border-top: 1px solid #E0E6ED; // Optional: if a visual separator is needed above input area
                                    // ChatInputArea itself has a top border in its current styling
}
</style>
