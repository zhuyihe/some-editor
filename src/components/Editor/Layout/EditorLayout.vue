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
      <AISidebarPanel /> <!-- ADDED HERE -->
    </div>
    <editor-footer />
    <!-- REMOVE ElDrawer -->
    <!-- REMOVE FAB button class="ai-trigger-fab-layout" -->
  </div>
</template>

<script lang="ts">
// Target script section in EditorLayout.vue
import { defineComponent /* remove ref */ } from 'vue';
import EditorHeader from './EditorHeader.vue';
import EditorFooter from './EditorFooter.vue';
// import AISidebar from '../../AI/AISidebar.vue'; // REMOVE
// import { ElDrawer } from 'element-plus'; // REMOVE
import AISidebarPanel from '../../AI/AISidebarPanel.vue'; // ADD

export default defineComponent({
  name: 'EditorLayout',
  components: {
    EditorHeader,
    EditorFooter,
    // AISidebar, // REMOVE
    AISidebarPanel, // ADD
  },
  emits: ['save-content'],
  setup(_, { emit }) {
    // const isAiPanelVisible = ref(false); // REMOVE
    const handleSaveContent = () => { emit('save-content'); };
    // const handleAiPanelToggle = () => { isAiPanelVisible.value = !isAiPanelVisible.value; }; // REMOVE
    return { handleSaveContent };
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
  flex-grow: 1; // This will now share space with AISidebarPanel
  display: flex; 
  justify-content: center; 
  overflow: auto; 
  position: relative;
  // Add transition for width changes if sidebar is resizable/collapsible later
  transition: width 0.2s ease-out; // For future resizability animation
}
// AISidebarPanel will have its own width and flex-shrink:0 from its internal styles

// Removed :deep(.ai-sidebar-drawer .el-drawer__body) styles

.editor-footer {
  flex-shrink: 0;
}

// Removed SCSS rules for .ai-trigger-fab-layout and its children
</style>