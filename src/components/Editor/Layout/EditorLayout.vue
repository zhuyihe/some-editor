<template>
  <div class="app-container">
    <!-- 编辑器头部菜单 -->
    <editor-header @save-content="handleSaveContent" />
    
    <!-- 工具栏区域 -->
    <div class="editor-toolbar-area">
      <slot name="toolbar"></slot>
    </div>
    
    <!-- 编辑区域 - 简化嵌套层级 -->
    <div class="editor-content-area">
      <slot></slot>
    </div>
    
    <!-- 底部状态栏 -->
    <editor-footer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EditorHeader from './EditorHeader.vue';
import EditorFooter from './EditorFooter.vue';

export default defineComponent({
  name: 'EditorLayout',
  components: {
    EditorHeader,
    EditorFooter,
  },
  emits: ['save-content'],
  setup(_, { emit }) {
    // 处理保存内容事件
    const handleSaveContent = () => {
      emit('save-content');
    };
    
    return {
      handleSaveContent
    };
  }
});
</script>

<style scoped lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: #f5f7fa;
  overflow: hidden; /* 防止容器本身产生滚动条 */
}

.editor-toolbar-area {
  padding: 4px 8px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.editor-content-area {
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
  padding: 12px;
  background-color: #e8ecf0; /* 背景色与纸张形成对比 */
  overflow: auto; /* 允许内容区域滚动 */
}
</style> 