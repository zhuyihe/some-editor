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
</style>