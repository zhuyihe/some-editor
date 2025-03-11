<template>
  <div class="app-container">
    <!-- 编辑器头部菜单 -->
    <editor-header @save-content="handleSaveContent" />
    
    <!-- 工具栏区域 -->
    <div class="editor-toolbar-area">
      <slot name="toolbar"></slot>
    </div>
    
    <!-- 编辑区域 -->
    <div class="editor-content-area">
      <div class="editor-paper-container">
        <div class="editor-paper">
          <slot></slot>
        </div>
      </div>
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
  padding: 12px; /* 减少内容区域padding */
  background-color: #e8ecf0; /* 更深的背景色，与纸张形成更强的对比 */
  overflow: auto; /* 只在内容区域允许滚动 */
}

.editor-paper-container {
  width: 100%;
  max-width: 840px; /* 略微增大容器宽度，更好地匹配A4纸张 */
  margin: 0 auto;
  height: fit-content; /* 使容器高度适应内容 */
  display: flex;
  justify-content: center;
  overflow: visible; /* 移除此处的滚动 */
}

.editor-paper {
  width: 210mm; /* A4 宽度 */
  min-height: 297mm; /* A4 高度 */
  background: #fff;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.2); /* 更精细的阴影效果 */
  margin: 0 auto;
  padding: 20mm 30mm 20mm 30mm; /* 增加左右内边距，更符合Word的标准A4纸视觉效果 */
  box-sizing: border-box; /* 确保padding不影响整体宽度 */
  word-wrap: break-word; /* 确保长文本自动折行 */
  overflow-wrap: break-word;
  max-width: 210mm;
  flex-shrink: 0; /* 防止被挤压 */
}
</style> 