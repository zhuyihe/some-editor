<template>
  <div class="emr-editor-content-wrapper">
    <!-- 编辑器内容区域 - 现在包含加号按钮和浮动菜单 -->
    <div ref="editorContainerRef" class="editor-container" @click="updateCursorPosition">
      <editor-content 
        :editor="editor" 
        class="emr-editor-content" 
        :style="paperStyle" 
      />
      
      <!-- 加号按钮 - 显示在当前段落左侧 -->
      <div
        v-if="cursorVisible && !isDialogOpen"
        class="add-content-button"
        :style="buttonPosition"
        @click.stop="toggleFloatingMenu"
      >
        <font-awesome-icon :icon="['fas', 'plus']" />
      </div>
      
      <!-- 浮动菜单 -->
      <div
        v-if="showFloatingMenu && editor"
        class="custom-floating-menu"
        :style="menuPosition"
        @click.stop
      >
        <editor-floating-menu :editor="editor" @close-menu="showFloatingMenu = false" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onBeforeUnmount, watch, toRefs, inject, useAttrs, nextTick } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { usePaperStore } from '../../../stores/paper';
import EditorFloatingMenu from './EditorFloatingMenu.vue';

export default defineComponent({
  name: 'EMREditorContent',
  components: {
    EditorContent,
    EditorFloatingMenu
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入内容...'
    },
    autofocus: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'editor-ready'],
  setup(props, { emit }) {
    // Paper Store
    const paperStore = usePaperStore();
    
    // 引用props
    const { modelValue, placeholder, autofocus } = toRefs(props);
    
    // 编辑器实例
    const editor = ref(null);
    
    // 状态变量
    const cursorVisible = ref(false);
    const showFloatingMenu = ref(false);
    const cursorPosition = ref({ top: 0, left: 0 });
    const isDialogOpen = ref(false);
    
    // 监听对话框打开状态
    watch(() => paperStore.isSettingsOpen, (newValue) => {
      isDialogOpen.value = newValue;
    });
    
    // 编辑器样式 - 基于纸张设置
    const paperStyle = computed(() => {
      return {
        width: `${paperStore.effectiveWidth}mm`,
        minHeight: `${paperStore.effectiveHeight}mm`,
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.2)',
        margin: '0 auto',
        boxSizing: 'border-box',
        border: 'none',
        position: 'relative',
        padding: `${paperStore.margins.top}mm ${paperStore.margins.right}mm ${paperStore.margins.bottom}mm ${paperStore.margins.left}mm`
      };
    });
    
    // 编辑器容器引用
    const editorContainerRef = ref(null);
    const cursorRef = ref(null);
    
    // 获取当前选区所在的块级节点
    const getCurrentNode = () => {
      if (!editor.value) return null;
      
      try {
        const { view, state } = editor.value;
        const { empty, from } = state.selection;
        
        // 如果选区为空，使用当前位置
        if (empty) {
          // 查找当前位置所在的块级节点(paragraph, heading等)
          const resolvedPos = state.doc.resolve(from);
          const blockPos = resolvedPos.before(1);
          return view.nodeDOM(blockPos);
        }
        return null;
      } catch (error) {
        console.log("获取节点错误:", error);
        return null;
      }
    };
    
    // 按钮位置 - 左侧对齐，不垂直居中
    const buttonPosition = computed(() => {
      return {
        top: `${cursorPosition.value.top}px`,
        left: `${cursorPosition.value.left}px`,
        transform: 'none', // 不使用变换，按钮位置精确定位
      };
    });
    
    // 菜单位置 - 改为显示在加号按钮的左侧，避免覆盖文档内容
    const menuPosition = computed(() => {
      return {
        top: `${cursorPosition.value.top - 10}px`, // 稍微上移一点，保持菜单整体居中
        left: `${cursorPosition.value.left - 235}px`, // 放置在按钮左侧，为菜单宽度预留足够空间
      };
    });
    
    // 初始化编辑器
    const initEditor = () => {
      editor.value = new Editor({
        content: modelValue.value,
        extensions: [
          StarterKit,
          Underline,
          TextAlign.configure({
            types: ['heading', 'paragraph'],
            alignments: ['left', 'center', 'right'],
          }),
          Image,
          Table.configure({
            resizable: true,
          }),
          TableRow,
          TableHeader,
          TableCell,
          Placeholder.configure({
            placeholder: placeholder.value,
            emptyEditorClass: 'is-editor-empty',
          }),
          Link.configure({
            openOnClick: false,
          }),
        ],
        autofocus: autofocus.value,
        onUpdate: ({ editor }) => {
          emit('update:modelValue', editor.getHTML());
        },
        onSelectionUpdate: ({ editor }) => {
          updateCursorPosition();
        },
      });
      
      // 通知父组件编辑器已准备好
      emit('editor-ready', editor.value);
    };
    
    // 更新光标位置，基于当前节点而非光标
    const updateCursorPosition = () => {
      // 获取编辑器视图的DOM元素
      const editorDOM = editorContainerRef.value;
      if (!editorDOM) return;
      
      // 获取编辑器容器的边界矩形
      const editorRect = editorDOM.getBoundingClientRect();
      
      // 获取编辑器内容区域，以计算padding
      const contentElement = editorDOM.querySelector('.emr-editor-content');
      if (!contentElement) return;
      
      const computedStyle = window.getComputedStyle(contentElement);
      const paddingLeft = parseFloat(computedStyle.paddingLeft);
      // 调整位置计算，保持适当距离
      const leftPosition = paddingLeft > 0 ? paddingLeft - 35 : 15; // 与文本保持适当距离
      
      // 获取当前节点的DOM元素
      const currentNode = getCurrentNode();
      if (!currentNode) {
        // 如果找不到当前节点，使用备用方法找到第一个段落
        const firstParagraph = contentElement.querySelector('p, h1, h2, h3, h4, h5, h6');
        if (firstParagraph) {
          const paragraphRect = firstParagraph.getBoundingClientRect();
          cursorPosition.value = {
            top: paragraphRect.top - editorRect.top + (paragraphRect.height / 2) - 12, // 垂直居中对齐
            left: leftPosition // 使按钮放在左侧固定位置
          };
          cursorVisible.value = true;
        }
        return;
      }

      // 获取节点的边界矩形
      const nodeRect = currentNode.getBoundingClientRect();

      // 更新光标位置
      cursorPosition.value = {
        top: nodeRect.top - editorRect.top + (nodeRect.height / 2) - 12, // 垂直居中对齐，减12是按钮半径
        left: leftPosition // 使按钮放在左侧固定位置
      };
      
      cursorVisible.value = true;
    };
    
    // 监听内容变化
    watch(modelValue, (newValue) => {
      // 避免内容变化时的无限循环
      if (editor.value && newValue !== editor.value.getHTML()) {
        editor.value.commands.setContent(newValue, false);
      }
    });
    
    // 监听点击事件来隐藏浮动菜单
    const handleClickOutside = (event) => {
      if (showFloatingMenu.value) {
        showFloatingMenu.value = false;
      }
    };
    
    // 切换浮动菜单的显示状态
    const toggleFloatingMenu = () => {
      showFloatingMenu.value = !showFloatingMenu.value;
      // 如果打开菜单，确保按钮保持可见状态
      if (showFloatingMenu.value) {
        cursorVisible.value = true;
      }
    };
    
    // 生命周期钩子
    onMounted(() => {
      initEditor();
      document.addEventListener('click', handleClickOutside);
    });
    
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
      if (editor.value) {
        editor.value.destroy();
      }
    });
    
    return {
      editor,
      cursorVisible,
      showFloatingMenu,
      buttonPosition,
      menuPosition,
      updateCursorPosition,
      paperStyle,
      editorContainerRef,
      toggleFloatingMenu,
      isDialogOpen
    };
  }
});
</script>

<style scoped lang="scss">
.emr-editor-content-wrapper {
  position: relative;
  flex: 1;
  overflow: auto; /* 允许内容滚动 */
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 20px;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  
  .editor-container {
    position: relative;
    width: auto;
    height: auto;
  }
  
  .emr-editor-content {
    position: relative;
    outline: none;
    margin: 0 auto;
    background-color: white;
    transition: all 0.3s ease;
    overflow: visible;
    
    /* 基础编辑器内容样式 */
    :deep(.ProseMirror) {
      outline: none;
      min-height: 200px;
      color: #333;
      font-size: 16px;
      line-height: 1.6;
      overflow: visible;
      width: 100%;
      box-sizing: border-box;
      background-color: transparent;
      max-width: 100%;
      padding-left: 25px; /* 增加左侧内边距，为加号按钮留出更多空间 */
      
      > * {
        margin-left: 0;
        margin-right: 0;
        width: 100%;
        box-sizing: border-box;
        max-width: 100%;
      }
      
      p {
        margin: 1em 0;
        width: 100%;
        box-sizing: border-box;
        transition: background-color 0.2s;
        position: relative; /* 添加相对定位，作为加号按钮的参考 */
        
        &:hover {
          background-color: rgba(245, 247, 250, 0.4);
        }
      }
      
      /* 占位符样式 */
      p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: #94a3b8;
        pointer-events: none;
        height: 0;
        opacity: 0.8;
      }
      
      h1, h2, h3, h4, h5, h6 {
        line-height: 1.3;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        color: #222;
        font-weight: 500;
        width: 100%;
        box-sizing: border-box;
        position: relative; /* 添加相对定位，作为加号按钮的参考 */
      }
      
      h1 { font-size: 1.8em; }
      h2 { font-size: 1.5em; }
      h3 { font-size: 1.3em; }
      
      ul, ol {
        padding-left: 1.5em;
        width: 100%;
        box-sizing: border-box;
      }
      
      blockquote {
        border-left: 3px solid #dcdfe6;
        padding-left: 1em;
        color: #606266;
        font-style: italic;
        width: 100%;
        box-sizing: border-box;
      }
      
      code {
        background-color: #f5f7fa;
        border-radius: 3px;
        padding: 0.2em 0.4em;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      }
      
      pre {
        background-color: #f5f7fa;
        border-radius: 4px;
        padding: 0.75em 1em;
        overflow-x: auto;
        width: 100%;
        box-sizing: border-box;
      }
      
      img {
        max-width: 100%;
        height: auto;
      }
      
      /* 表格样式 */
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
        table-layout: fixed;
        
        td, th {
          border: 1px solid #dcdfe6;
          padding: 0.5em;
          word-break: break-word;
        }
        
        th {
          background-color: #f5f7fa;
          font-weight: 500;
        }
      }
      
      /* 文本对齐样式 */
      .text-left {
        text-align: left;
      }
      
      .text-center {
        text-align: center;
      }
      
      .text-right {
        text-align: right;
      }
      
      /* 下划线样式 */
      u {
        text-decoration: underline;
      }
    }
  }
  
  /* 加号按钮样式 */
  .add-content-button {
    position: absolute;
    width: 24px;
    height: 24px;
    background-color: #ffffff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    z-index: 100;
    transition: all 0.2s ease;
    border: 1px solid #dcdfe6;
    opacity: 0.85;
    
    &:hover {
      background-color: #409eff;
      transform: scale(1.1);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
      opacity: 1;
      
      svg {
        color: #ffffff;
      }
    }
    
    svg {
      font-size: 14px;
      color: #409eff;
    }
  }
  
  /* 自定义浮动菜单容器 */
  .custom-floating-menu {
    position: absolute;
    z-index: 200; /* 提高z-index确保在最顶层 */
    transition: all 0.2s ease;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    width: 220px;
    padding: 0; /* 移除内边距，由内部组件控制 */
    
    &::before {
      content: '';
      position: absolute;
      top: 10px; /* 调整位置到中间 */
      right: -6px; /* 改为指向右侧 */
      width: 12px;
      height: 12px;
      background-color: white;
      transform: rotate(45deg);
      box-shadow: 2px -2px 5px rgba(0, 0, 0, 0.04); /* 调整阴影方向 */
    }
  }
}

// 打印样式
@media print {
  .emr-editor-content-wrapper {
    overflow: visible;
    height: auto;
    padding: 0;
    background: none;
    
    .emr-editor-content {
      width: 100% !important;
      min-height: auto !important;
      box-shadow: none;
      margin: 0;
    }
    
    .add-content-button,
    .custom-floating-menu {
      display: none !important;
    }
  }
}
</style> 