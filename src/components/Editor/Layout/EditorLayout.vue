<template>
  <div class="app-container-layout">
    <editor-header @save-content="handleSaveContent" />
    <div class="editor-toolbar-area">
      <slot name="toolbar"></slot>
    </div>
    <div class="editor-main-flex-container">
      <div class="main-editor-content-wrapper">
        <slot></slot> 
      </div>
      <!-- AISidebar is NO LONGER here in the flex container -->
    </div>
    <editor-footer />

    <ElDrawer
      v-model="isAiPanelVisible"
      direction="rtl"
      size="380px" 
      :with-header="false" 
      :destroy-on-close="false" 
      class="ai-sidebar-drawer"
    >
      <AISidebar @toggle-request="handleAiPanelToggle" />
    </ElDrawer>

    <!-- ADDED FAB HERE -->
    <button
      class="ai-trigger-fab-layout"
      @click="handleAiPanelToggle"
      aria-label="Toggle AI Assistant"
    >
      <svg class="fab-icon-layout" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
        <circle cx="50" cy="50" r="45" class="fab-icon-background-layout"/>
        <circle cx="50" cy="50" r="12" class="fab-icon-foreground-layout"/>
        <circle cx="50" cy="25" r="6" class="fab-icon-foreground-layout"/>
        <circle cx="75" cy="40" r="6" class="fab-icon-foreground-layout"/>
        <circle cx="75" cy="60" r="6" class="fab-icon-foreground-layout"/>
        <circle cx="50" cy="75" r="6" class="fab-icon-foreground-layout"/>
        <circle cx="25" cy="60" r="6" class="fab-icon-foreground-layout"/>
        <circle cx="25" cy="40" r="6" class="fab-icon-foreground-layout"/>
        <line x1="50" y1="50" x2="50" y2="25" class="fab-icon-lines-layout"/>
        <line x1="50" y1="50" x2="75" y2="40" class="fab-icon-lines-layout"/>
        <line x1="50" y1="50" x2="75" y2="60" class="fab-icon-lines-layout"/>
        <line x1="50" y1="50" x2="50" y2="75" class="fab-icon-lines-layout"/>
        <line x1="50" y1="50" x2="25" y2="60" class="fab-icon-lines-layout"/>
        <line x1="50" y1="50" x2="25" y2="40" class="fab-icon-lines-layout"/>
      </svg>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import EditorHeader from './EditorHeader.vue';
import EditorFooter from './EditorFooter.vue';
import AISidebar from '../../AI/AISidebar.vue'; 

export default defineComponent({
  name: 'EditorLayout',
  components: {
    EditorHeader,
    EditorFooter,
    AISidebar, 
  },
  emits: ['save-content'],
  setup(_, { emit }) {
    const isAiPanelVisible = ref(false); 

    const handleSaveContent = () => {
      emit('save-content');
    };

    const handleAiPanelToggle = () => {
      isAiPanelVisible.value = !isAiPanelVisible.value;
    };
    
    return {
      handleSaveContent,
      isAiPanelVisible,
      handleAiPanelToggle,
    };
  }
});
</script>

<style scoped lang="scss">
.app-container-layout { 
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: #f5f7fa;
  overflow: hidden; 
}

.editor-toolbar-area {
  padding: 4px 8px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  z-index: 10; 
  flex-shrink: 0; 
}

.editor-main-flex-container { 
  flex: 1; 
  display: flex;
  flex-direction: row; 
  align-items: stretch; 
  overflow: hidden; 
  background-color: #e8ecf0; 
}

.main-editor-content-wrapper {
  flex-grow: 1; 
  display: flex; 
  justify-content: center; 
  overflow: auto; 
  position: relative; 
  // transition: width 0.3s ease-in-out; // REMOVE THIS - ElDrawer overlays
}

// .integrated-ai-sidebar {} // Removed as AISidebar is now in ElDrawer

// Style for ElDrawer itself if needed
:deep(.ai-sidebar-drawer .el-drawer__body) {
  padding: 0;
  display: flex; // To make AISidebar fill height
  flex-direction: column; // To make AISidebar fill height
}

.editor-footer {
  flex-shrink: 0;
}

// FAB Styles (as provided in prompt for EditorLayout.vue)
$fab-size-layout: 56px;
$fab-icon-size-layout: 28px;
$primary-color-layout: var(--el-color-primary, #3478F6); // Use Element Plus primary color

.ai-trigger-fab-layout {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: $fab-size-layout;
  height: $fab-size-layout;
  background-color: $primary-color-layout;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--el-box-shadow, 0px 12px 32px 4px rgba(0, 0, 0, .04), 0px 8px 20px rgba(0, 0, 0, .08));
  transition: transform 0.2s ease-in-out, background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  z-index: 2050; // Ensure it's above ElDrawer's default z-index if needed (ElDrawer default is 2000)

  .fab-icon-layout {
    width: $fab-icon-size-layout;
    height: $fab-icon-size-layout;
    .fab-icon-background-layout {
      fill: transparent; 
    }
    .fab-icon-foreground-layout {
      fill: white; 
    }
    .fab-icon-lines-layout {
      stroke: white; 
      stroke-width: 4; 
    }
  }

  &:hover {
    transform: scale(1.1);
    box-shadow: var(--el-box-shadow-dark, 0px 16px 48px 16px rgba(0, 0, 0, .08), 0px 12px 32px rgba(0, 0, 0, .12), 0px 8px 16px -8px rgba(0, 0, 0, .16));
  }

  &:active { 
    transform: scale(1);
    // Slightly darken background on active, if $primary-color-layout is a SASS variable
    // background-color: darken($primary-color-layout, 5%); 
  }
}
</style>