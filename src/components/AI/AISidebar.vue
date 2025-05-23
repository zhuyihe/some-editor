<template>
  <div> <!-- Root div, always rendered if AISidebar component is in parent DOM -->
    <!-- AI Trigger Icon (Floating Action Button) - Always rendered -->
    <button
      class="ai-trigger-fab"
      @click="$emit('toggle-request')"
      aria-label="Toggle AI Assistant"
    >
      <!-- SVG content for FAB -->
      <svg class="fab-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
        <circle cx="50" cy="50" r="45" class="fab-icon-background"/>
        <circle cx="50" cy="50" r="12" class="fab-icon-foreground"/>
        <circle cx="50" cy="25" r="6" class="fab-icon-foreground"/>
        <circle cx="75" cy="40" r="6" class="fab-icon-foreground"/>
        <circle cx="75" cy="60" r="6" class="fab-icon-foreground"/>
        <circle cx="50" cy="75" r="6" class="fab-icon-foreground"/>
        <circle cx="25" cy="60" r="6" class="fab-icon-foreground"/>
        <circle cx="25" cy="40" r="6" class="fab-icon-foreground"/>
        <line x1="50" y1="50" x2="50" y2="25" class="fab-icon-lines"/>
        <line x1="50" y1="50" x2="75" y2="40" class="fab-icon-lines"/>
        <line x1="50" y1="50" x2="75" y2="60" class="fab-icon-lines"/>
        <line x1="50" y1="50" x2="50" y2="75" class="fab-icon-lines"/>
        <line x1="50" y1="50" x2="25" y2="60" class="fab-icon-lines"/>
        <line x1="50" y1="50" x2="25" y2="40" class="fab-icon-lines"/>
      </svg>
    </button>

    <!-- Collapsible Sidebar Panel - No longer conditional on props.showPanel -->
    <Transition name="ai-panel-slide">
      <aside class="ai-sidebar"> 
        <header class="sidebar-header">
          <h3 class="header-title">AI 助手</h3>
          <div class="header-actions">
            <ElTooltip content="聊天历史" placement="bottom" :hide-after="0">
              <ElButton 
                type="text" 
                :icon="Files" 
                @click="toggleHistoryPopover" 
                aria-label="聊天历史"
                class="header-action-btn" 
              />
            </ElTooltip>
            <div class="history-popover" v-if="showHistoryPopover">
              <div class="popover-content">
                聊天历史功能开发中...
              </div>
            </div>
            <ElTooltip content="关闭侧边栏" placement="bottom" :hide-after="0">
              <ElButton 
                type="text" 
                :icon="Close" 
                @click="$emit('toggle-request')" 
                aria-label="关闭侧边栏"
                class="header-action-btn"
              />
            </ElTooltip>
          </div>
        </header>
      <div class="sidebar-content">
        <AIChatInterface />
      </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'; // defineProps removed as props were removed
import AIChatInterface from './Chat/AIChatInterface.vue';
import { Clock, Close, Files } from '@element-plus/icons-vue'; // Added icon imports

// Define emitted events
const emit = defineEmits(['toggle-request']);

const showHistoryPopover = ref(false);

const toggleHistoryPopover = (event: MouseEvent) => {
  event.stopPropagation(); 
  showHistoryPopover.value = !showHistoryPopover.value;
};

const handleClickOutsidePopover = (event: MouseEvent) => {
  const popover = document.querySelector('.history-popover');
  const historyButton = document.querySelector('.history-button');
  if (
    showHistoryPopover.value &&
    popover &&
    !popover.contains(event.target as Node) &&
    historyButton &&
    !historyButton.contains(event.target as Node)
  ) {
    showHistoryPopover.value = false;
  }
};

const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showHistoryPopover.value) {
    showHistoryPopover.value = false;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscKey);
  document.addEventListener('click', handleClickOutsidePopover); 
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey);
  document.removeEventListener('click', handleClickOutsidePopover);
});
</script>

<style scoped lang="scss">
// SCSS content remains the same as previous version where it was adapted for integrated panel
$sidebar-width: 360px; 
$fab-size: 56px;
$fab-icon-size: 28px;
$header-height: 60px; 
$primary-color: var(--primary-color, #409eff); 
$text-color-primary: var(--text-color-primary, #303133);
$text-color-secondary: var(--text-color-secondary, #909399);
$text-color-regular: var(--text-color-regular, #606266);
$background-color-base: var(--background-color-base, #f5f7fa);
$border-color-base: var(--border-color-base, #dcdfe6);
$border-color-light: var(--border-color-light, #e4e7ed);
$background-color-paper: var(--el-bg-color-overlay, #FFFFFF); 
$box-shadow-light: var(--el-box-shadow-light, 0px 0px 12px rgba(0, 0, 0, 0.12));

.ai-trigger-fab {
  position: fixed; 
  bottom: 30px;
  right: 30px;
  width: $fab-size;
  height: $fab-size;
  background-color: $primary-color;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease-in-out, background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  z-index: 1050;

  .fab-icon {
    width: $fab-icon-size;
    height: $fab-icon-size;
    .fab-icon-background {
      fill: transparent; 
    }
    .fab-icon-foreground {
      fill: white; 
    }
    .fab-icon-lines {
      stroke: white; 
      stroke-width: 4; 
    }
  }

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active { 
    transform: scale(1);
  }
}

.ai-sidebar {
  // width: $sidebar-width; // Removed, ElDrawer controls width
  height: 100%; 
  background-color: $background-color-base;
  // border-left: 1px solid $border-color-base; // Removed, ElDrawer has border
  // box-shadow: -2px 0 5px rgba(0,0,0,0.05); // Removed, ElDrawer has shadow
  display: flex;
  flex-direction: column;
  flex-shrink: 0; 
  overflow: hidden;
  // Note: Vue's <Transition> handles the direct animation.
  // The transform property is now managed by the transition classes.
}

// Transitions for the AI Panel slide
.ai-panel-slide-enter-active,
.ai-panel-slide-leave-active {
  transition: transform 0.3s ease-in-out;
}

.ai-panel-slide-enter-from,
.ai-panel-slide-leave-to {
  transform: translateX(100%); // Slide from/to the right
}

.sidebar-header {
  // height: $header-height; // Keep if fixed height is desired
  padding: 0 10px 0 16px; // Adjust padding for ElButtons
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color-lighter, #EBEEF5); // Use Element Plus variable
  flex-shrink: 0;

  .header-title {
    font-size: var(--el-font-size-large, 18px); // Use Element Plus variable
    font-weight: 600;
    color: var(--el-text-color-primary, #303133);
    margin: 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 4px; // Reduced gap for text/icon buttons

    .el-button.header-action-btn { // Targeting ElButton specifically
      font-size: 18px; // Icon size
      padding: 6px; // Make click area decent
      color: var(--el-text-color-regular, #606266); // Default icon color
      
      &:hover, &:focus {
        color: var(--el-color-primary, #409eff);
        background-color: var(--el-fill-color-light, #f5f7fa); // Subtle background on hover
      }
    }
    
    // Keep .history-popover styles as they are for now
    .history-popover { 
      position: absolute;
      top: calc(100% + 8px); 
      right: 0; 
      min-width: 200px;
      background-color: var(--el-bg-color-overlay, #FFFFFF);
      border: 1px solid var(--el-border-color-light, #e4e7ed);
      border-radius: var(--el-border-radius-base, 4px);
      box-shadow: var(--el-box-shadow-light, 0px 0px 12px rgba(0,0,0,0.12));
      z-index: 20; // Above buttons
      padding: 8px;

      .popover-content {
        padding: 8px 12px; 
        font-size: 14px;
        color: var(--el-text-color-regular); 
      }
    }
  }
}

.sidebar-content {
  flex-grow: 1;
  // padding: 16px; // Remove padding if AIChatInterface handles it
  padding: 0; // Let AIChatInterface manage its own padding
  overflow-y: hidden; // AIChatInterface's list will scroll
  display: flex; // To make AIChatInterface take full height if it's also flex
  flex-direction: column; // To make AIChatInterface take full height if it's also flex

  // Remove align-items and justify-content if AIChatInterface is full bleed
  // align-items: center;
  // justify-content: center;

  // p tag is no longer a direct child, so this style is not needed here.
  // p {
  //   margin: 0;
  // }
}
</style>
