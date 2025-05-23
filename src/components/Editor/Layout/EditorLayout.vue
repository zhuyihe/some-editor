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
      <AISidebar 
        @toggle-request="handleAiPanelToggle" 
        :show-panel="isAiPanelVisible" 
        class="integrated-ai-sidebar"
      />
    </div>
    <editor-footer />
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
  // padding: 12px; // Removed
  overflow: auto; 
  position: relative; 
  transition: width 0.3s ease-in-out; 
}

.integrated-ai-sidebar {
  // AISidebar.vue itself will be a block, its <aside> panel is conditional.
  // This class is here if any specific transition or sizing overrides were needed from parent.
  // However, AISidebar's internal styling with flex-shrink:0 and fixed width should be sufficient.
  // We can add a transition here to smoothly animate the space AISidebar *might* take
  // if its root element's width changed, rather than just the <aside> appearing/disappearing.
  // For now, this is mostly a placeholder as AISidebar's root is always there.
}

.editor-footer {
  flex-shrink: 0;
}
</style>