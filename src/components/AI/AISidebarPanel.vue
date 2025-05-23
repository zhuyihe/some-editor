<template>
<template>
  <ElContainer direction="vertical" class="ai-sidebar-panel-v21">
    <!-- Region B (v2.1): Top Header & Control Area -->
    <ElHeader class="region-b-header-v21">
      <span class="header-title-v21">AI 助手</span>
      <div class="header-controls-v21">
        <ElTooltip content="清除当前对话" placement="bottom" :hide-after="0">
          <ElButton :icon="Delete" @click="clearConversation" circle aria-label="清除对话" class="control-btn-v21" />
        </ElTooltip>
        <ElTooltip content="聊天历史" placement="bottom" :hide-after="0">
          <ElButton :icon="Clock" @click="showHistory" circle aria-label="聊天历史" class="control-btn-v21" />
        </ElTooltip>
        <ElTooltip content="设置" placement="bottom" :hide-after="0">
          <ElButton :icon="Setting" @click="openSettings" circle aria-label="设置" class="control-btn-v21" />
        </ElTooltip>
        <ElTooltip :content="isCollapsed ? '展开侧边栏' : '收起侧边栏'" placement="bottom" :hide-after="0">
          <ElButton 
            :icon="isCollapsed ? Expand : Fold" 
            @click="toggleCollapse" 
            circle 
            aria-label="收起/展开侧边栏"
            class="control-btn-v21"
          />
        </ElTooltip>
      </div>
    </ElHeader>

    <!-- Region C (v2.1): Main Content / Chat History Area -->
    <ElMain class="region-c-main-content-v21">
      <ElScrollbar class="chat-history-scrollbar-v21">
        <AIChatInterface /> 
        <!-- Note: AIChatInterface still contains ChatInputArea.
             This will be architecturally refactored when Region E (Input) is built,
             so ChatInputArea moves out of AIChatInterface and into Region E.
             For now, AIChatInterface as a whole goes here. -->
      </ElScrollbar>
    </ElMain>
    
    <ElFooter class="region-e-input-area-v21">
      Input Function Area (Region E) <!-- Placeholder -->
    </ElFooter>
    <ElFooter class="region-f-bottom-tool-v21">
      Bottom Tool Area (Region F)
    </ElFooter>
  </ElContainer>
</template>

<script setup lang="ts">
// Existing imports: ElContainer, ElHeader, ElMain, ElFooter
// Add for Region B:
import { ref } from 'vue';
// ElScrollbar was already imported if we followed previous steps of v1.5 panel, ensure it's here for v2.1
import { ElContainer, ElHeader, ElMain, ElFooter, ElButton, ElIcon, ElTooltip, ElScrollbar } from 'element-plus';
import { Setting, Expand, Fold, Delete, Clock } from '@element-plus/icons-vue';
import AIChatInterface from './Chat/AIChatInterface.vue'; // Ensure this is imported for Region C

const isCollapsed = ref(false); 
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  console.log('Toggle collapse/expand. New state isCollapsed:', isCollapsed.value);
};
const openSettings = () => console.log('Open AI Assistant settings');
const clearConversation = () => {
  console.log('Clear conversation clicked');
  // ElMessage.success('对话已清除 (模拟)'); // Requires ElMessage import & setup
};
const showHistory = () => console.log('Show chat history');
</script>

<style scoped lang="scss">
.ai-sidebar-panel-v21 {
  width: 100%; // Will be controlled by ElAside in parent
  height: 100vh;
  background-color: #F8FAFD; // v2.1 overall background
  // border-left: 1px solid #E0E6ED; // This border will be on ElAside instead for resizing
  display: flex; // Already an ElContainer, but good for clarity
  flex-direction: column;
  overflow: hidden;
}

.region-b-header-v21 { // Was: .region-b-header-placeholder
  height: 56px; // v2.1 spec
  // background-color: #fff; // v2.1 spec (white or primary 10%) - Let's use white
  background-color: var(--el-bg-color-overlay, #fff);
  // border-bottom: 1px solid #E0E6ED; // Spec: "明显底部阴影"
  box-shadow: var(--el-box-shadow-light, 0px 2px 12px rgba(0,0,0,0.07)); // Element Plus light shadow
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 0 16px; // Adjusted padding
  flex-shrink: 0;
  z-index: 10; // Ensure shadow is above content if content scrolls under
}

.header-title-v21 {
  font-size: 18px; // v2.1 spec
  font-weight: 600; // v2.1 "字重更粗" (semi-bold)
  color: var(--el-text-color-primary, #303133);
}

.header-controls-v21 {
  display: flex;
  align-items: center;
  gap: 6px; // Space between circle buttons
}

.control-btn-v21.el-button.is-circle { // Target ElButton circle
  font-size: 18px; // v2.1 icon size
  // ElButton circle with only icon usually handles padding well.
  // width: 32px; // Ensure circle buttons are nicely sized
  // height: 32px;
  // For default small circle buttons:
  // ElButton with `circle` prop and just an icon usually defaults to a good size.
  // Element Plus default circle button padding is around 8px, for an icon-only button.
  // If we need a specific size, we might need to adjust padding or use custom width/height.
  // Let's rely on Element Plus default circle button sizing for now.
  // type="default" is implicit
  border: none; // Make them truly flat if not using type="text"
  background-color: transparent;

  &:hover, &:focus {
    color: var(--el-color-primary, #346EF2); // Use v2.1 primary color
    background-color: var(--el-color-primary-light-9, #ecf5ff); // EP primary light bg for hover
  }
   &:active {
      border-color: var(--el-color-primary) !important; // EP active border
  }
}

// Placeholder styles for other regions remain
.region-c-main-content-v21 { // This is an ElMain
  // ElMain takes flex-grow: 1 by default in a vertical ElContainer
  background-color: #FFFFFF; // v2.1 spec: 纯白
  padding: 0; // Remove ElMain's default padding, ElScrollbar's view or AIChatInterface will have it
  overflow: hidden; // Necessary for ElScrollbar to manage scrolling within ElMain
  display: flex; // Ensure ElScrollbar can fill this area
  flex-direction: column; // Ensure ElScrollbar can fill this area
}

.chat-history-scrollbar-v21 {
  flex-grow: 1; // Make ElScrollbar fill the .region-c-main-content
  width: 100%;
  :deep(.el-scrollbar__view) {
    // This is the content view within ElScrollbar
    padding: 16px; // v2.1 spec: 内边距：上 16px, 下 16px, 左 16px, 右 16px
    // If AIChatInterface itself needs to be height 100% of this view:
    // > .ai-chat-interface-fill-panel { height: 100%; } // Assuming this class is on AIChatInterface's root
  }
}

.region-e-input-area-v21 {
  min-height: 56px; // v2.1 spec (adaptive 56-120px)
  max-height: 120px; // Will be handled by ElInput autosize later
  height: auto; // Start with auto, content will define it
  padding: 0; // Padding will be inside for ChatInputArea
  flex-shrink: 0;
  background-color: #fff; // v2.1 spec
  display: flex; // To manage ChatInputArea layout
  flex-direction: column;
  text-align: center; color: #999; font-size:0.9em; // Placeholder text style
  border-top: 1px solid #E0E6ED; // Placeholder
}

.region-f-bottom-tool-v21 {
  height: 48px; // v2.1 spec
  line-height: 48px;
  padding: 0 16px;
  flex-shrink: 0;
  background-color: #fff; // v2.1 spec
  border-top: 1px solid #E0E6ED; // v2.1 spec
  text-align: center; color: #999; font-size:0.9em; // Placeholder text style
}
</style>
