<template>
  <ElContainer direction="horizontal" class="editor-layout-v21-root">
    <!-- Main Application Content Area -->
    <ElMain class="main-app-content-v21">
      <div class="app-container-layout"> <!-- This is the original root, now for main content -->
        <editor-header @save-content="handleSaveContent" />
        <div class="editor-toolbar-area">
          <slot name="toolbar"></slot>
        </div>
        <!-- Original main content area (where editor itself is) -->
        <div class="main-editor-content-wrapper-slot"> 
            <slot></slot> 
        </div>
        <editor-footer />
      </div>
    </ElMain>

    <!-- AI Sidebar Panel Area -->
    <ElAside class="ai-sidebar-aside-v21" :width="sidebarWidth + 'px'">
      <div class="sidebar-drag-handle" @mousedown="dragHandleMouseDown"></div>
      <AISidebarPanel />
    </ElAside>
  </ElContainer>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'; // Add ref, onMounted, onUnmounted
import EditorHeader from './EditorHeader.vue';
import EditorFooter from './EditorFooter.vue';
import { ElContainer, ElAside, ElMain } from 'element-plus'; 
import AISidebarPanel from '../../AI/AISidebarPanel.vue'; 

export default defineComponent({
  name: 'EditorLayout',
  components: {
    EditorHeader,
    EditorFooter,
    AISidebarPanel, 
    ElContainer, ElAside, ElMain, 
  },
  emits: ['save-content'],
  setup(_, { emit }) {
    const handleSaveContent = () => { emit('save-content'); };

    const sidebarWidth = ref(300); 
    const isResizing = ref(false);
    const initialMouseX = ref(0);
    const initialSidebarWidth = ref(0);

    const dragHandleMouseDown = (event: MouseEvent) => {
      isResizing.value = true;
      initialMouseX.value = event.clientX;
      initialSidebarWidth.value = sidebarWidth.value;
      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);
      document.body.style.userSelect = 'none'; 
      event.preventDefault(); 
    };

    const handleDocumentMouseMove = (event: MouseEvent) => {
      if (!isResizing.value) return;
      const deltaX = event.clientX - initialMouseX.value;
      let newWidth = initialSidebarWidth.value - deltaX; 

      const minWidth = 48; 
      const maxWidth = window.innerWidth * 0.7; 
      if (newWidth < minWidth) newWidth = minWidth;
      if (newWidth > maxWidth) newWidth = maxWidth;
      
      sidebarWidth.value = newWidth;
    };

    const handleDocumentMouseUp = () => {
      if (isResizing.value) {
        isResizing.value = false;
        document.removeEventListener('mousemove', handleDocumentMouseMove);
        document.removeEventListener('mouseup', handleDocumentMouseUp);
        document.body.style.userSelect = ''; 
      }
    };
    
    onUnmounted(() => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
      document.body.style.userSelect = ''; 
    });

    return { 
      handleSaveContent,
      sidebarWidth, // Expose to template
      dragHandleMouseDown // Expose to template
    };
  }
});
</script>

<style scoped lang="scss">
.editor-layout-v21-root {
  height: 100vh;
  width: 100vw; 
  overflow: hidden; 
}

.main-app-content-v21 {
  padding: 0; // ElMain might have default padding
  overflow: hidden; // Let internal content scroll
  display: flex; // To make .app-container-layout fill it
  flex-direction: column;
}

.app-container-layout { 
  display: flex;
  flex-direction: column;
  height: 100%; // Fill ElMain
  width: 100%;
  background-color: #f5f7fa; // Original background
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

// .editor-main-flex-container { // This class is no longer used for the main content area + sidebar
//   flex: 1; 
//   display: flex;
//   flex-direction: row; 
//   align-items: stretch; 
//   overflow: hidden; 
//   background-color: #e8ecf0; 
// }

.main-editor-content-wrapper-slot { // Replaces old .editor-main-flex-container and .main-editor-content-wrapper
    flex: 1;
    position: relative;
    display: flex;
    justify-content: center;
    padding: 12px; // Original padding for editor paper area
    background-color: #e8ecf0; 
    overflow: auto;
}
// AISidebarPanel will have its own width and flex-shrink:0 from its internal styles

.editor-footer {
  flex-shrink: 0;
}

.ai-sidebar-aside-v21 {
  position: relative; // For positioning the drag handle
  // width is now dynamic via :width prop
  // border-left: 1px solid #E0E6ED; // Border is now part of the handle or handle is the border
  box-shadow: -2px 0 5px rgba(0,0,0,0.05); 
  transition: width 0.3s ease-in-out; // Keep for collapse/expand animations
  overflow: hidden; 
  display: flex; // Ensure AISidebarPanel fills it
}

.sidebar-drag-handle {
  position: absolute;
  left: -2px; // Position over the left edge, or at 0 if border is desired
  top: 0;
  bottom: 0;
  width: 5px; // Clickable area for resizing
  cursor: col-resize;
  z-index: 10; // Ensure it's above other content if overlapping
  // background-color: #E0E6ED; // Make it look like a border
  &:hover {
    background-color: var(--el-color-primary-light-7, #a0cfff); // Highlight on hover
  }
}
// AISidebarPanel should have width: 100% to fill the ElAside
:deep(.ai-sidebar-panel-v21) { // If AISidebarPanel is a direct child
    width: 100%; 
}
</style>