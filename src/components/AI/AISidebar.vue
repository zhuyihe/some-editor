<template>
  <div>
    <!-- AI Trigger Icon (Floating Action Button) -->
    <button
      class="ai-trigger-fab"
      @click="toggleSidebar"
      :class="{ 'is-active': isSidebarOpen }"
      aria-label="Toggle AI Assistant"
    >
      <!-- SVG Icon Concept 1 (Abstract Geometric Brain/Chip) - Inlined or as a component -->
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

    <!-- Collapsible Sidebar Panel -->
    <aside class="ai-sidebar" :class="{ 'is-open': isSidebarOpen }">
      <!-- Sidebar Header -->
      <header class="sidebar-header">
        <h3 class="header-title">AI 助手</h3>
        <div class="header-actions">
          <button
            class="action-button history-button"
            @click="toggleHistoryPopover"
            aria-label="View Chat History"
          >
            <!-- History (Clock) SVG Icon -->
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
              <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
          </button>
          <!-- History Popover -->
          <div class="history-popover" v-if="showHistoryPopover">
            <div class="popover-content">
              聊天历史功能开发中...
            </div>
          </div>
          <button
            class="action-button close-button"
            @click="closeSidebar"
            aria-label="Close AI Assistant"
          >
            <!-- Close (X) SVG Icon -->
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Sidebar Content Area -->
      <div class="sidebar-content">
        <p>AI 聊天界面加载中...</p>
      </div>
    </aside>

    <!-- Optional: Overlay for clicking outside to close -->
    <div
      class="sidebar-overlay"
      v-if="isSidebarOpen"
      @click="closeSidebar"
    ></div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isSidebarOpen = ref(false);
const showHistoryPopover = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  if (isSidebarOpen.value) {
    // When sidebar opens, ensure history popover is closed
    showHistoryPopover.value = false; 
  }
};

const openSidebar = () => {
  isSidebarOpen.value = true;
  showHistoryPopover.value = false; 
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
  showHistoryPopover.value = false; 
};

const toggleHistoryPopover = (event: MouseEvent) => {
  event.stopPropagation(); // Prevent sidebar from closing if overlay is used
  showHistoryPopover.value = !showHistoryPopover.value;
};

// Optional: Close popover when clicking outside of it
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

// Optional: Close sidebar with Escape key
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isSidebarOpen.value) {
    closeSidebar();
  } else if (event.key === 'Escape' && showHistoryPopover.value) {
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
// It's good practice to ensure SCSS variables are available.
// Assuming Vite setup might provide global SCSS variables,
// or they are imported via vite.config.js css preprocessorOptions.
// Fallbacks are provided if variables are not defined.

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
// Using Element Plus variable names as a guide for popover styling consistency
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
      // Main circle of SVG is now transparent, button bg shows through
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

  &:active, &.is-active { 
    transform: scale(1);
    // background-color: darken($primary-color, 10%); // Consider a darker shade if $primary-color is a SASS variable
  }
}

.ai-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: $sidebar-width;
  height: 100vh;
  background-color: $background-color-base;
  border-left: 1px solid $border-color-base;
  box-shadow: none; 
  transform: translateX(100%);
  visibility: hidden;
  // Delay visibility hide to allow transform animation to complete
  transition: transform 0.3s ease-in-out, visibility 0s 0.3s, box-shadow 0.3s ease-in-out; 
  display: flex;
  flex-direction: column;
  z-index: 1000;

  &.is-open {
    transform: translateX(0);
    visibility: visible;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    // Ensure visibility transition is immediate when opening
    transition: transform 0.3s ease-in-out, visibility 0s 0s, box-shadow 0.3s ease-in-out; 
  }
}

.sidebar-header {
  height: $header-height;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid $border-color-light;
  flex-shrink: 0; 

  .header-title {
    font-size: 18px;
    font-weight: 600;
    color: $text-color-primary;
    margin: 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px; 
    position: relative; 

    .action-button {
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      color: $text-color-secondary;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: $primary-color;
        // background-color: rgba($primary-color, 0.1); // Use rgba if $primary-color is hex
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }
  }
}

.history-popover {
  position: absolute;
  top: calc(100% + 8px); 
  right: 0; 
  min-width: 200px;
  background-color: $background-color-paper;
  border: 1px solid $border-color-light;
  border-radius: 4px;
  box-shadow: $box-shadow-light;
  z-index: 1010; 
  padding: 8px;

  .popover-content {
     padding: 8px 12px; 
     font-size: 14px;
     color: $text-color-regular; 
  }
}

.sidebar-content {
  flex-grow: 1; 
  padding: 16px;
  overflow-y: auto;
  color: $text-color-secondary;
  display: flex;
  align-items: center; 
  justify-content: center; 

  p {
    margin: 0;
  }
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2); 
  z-index: 999; 
  transition: opacity 0.3s ease-in-out;
  opacity: 1;

  &.v-enter-from, &.v-leave-to { // For Vue transition classes if used with <Transition>
    opacity: 0;
  }
}
</style>
