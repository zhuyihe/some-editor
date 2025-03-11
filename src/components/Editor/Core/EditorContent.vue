<template>
  <div class="emr-editor-content-wrapper">
    <editor-content :editor="editor" class="emr-editor-content" />
    
    <!-- 基于光标位置动态显示加号按钮 -->
    <div class="add-content-button" 
         @click="showFloatingMenu = !showFloatingMenu" 
         v-if="editor && cursorVisible"
         :style="buttonPosition">
      <font-awesome-icon :icon="['fas', 'plus']" />
    </div>
    
    <!-- 修改浮动菜单为点击触发，菜单位置也基于光标位置 -->
    <div class="custom-floating-menu" 
         v-if="showFloatingMenu && editor"
         :style="menuPosition">
      <editor-floating-menu :editor="editor" @close-menu="showFloatingMenu = false" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, watch, ref, computed, onMounted } from 'vue';
import { useEditor, EditorContent as TiptapEditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import { useEditorStore } from '../../../stores/editor';
import EditorFloatingMenu from './EditorFloatingMenu.vue';

export default defineComponent({
  name: 'EMREditorContent',
  components: {
    EditorContent: TiptapEditorContent,
    EditorFloatingMenu
  },
  props: {
    content: {
      type: String,
      default: '',
    },
    editable: {
      type: Boolean,
      default: true,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:content', 'editor-ready'],
  setup(props, { emit }) {
    // 获取编辑器状态管理
    const editorStore = useEditorStore();
    
    // 跟踪上次内容，避免重复更新
    const lastContent = ref(props.content);
    
    // 控制浮动菜单的显示
    const showFloatingMenu = ref(false);
    
    // 跟踪光标位置
    const cursorTop = ref(0);
    const cursorLeft = ref(0);
    const cursorVisible = ref(false);
    
    // 计算加号按钮位置
    const buttonPosition = computed(() => {
      return {
        top: `${cursorTop.value}px`,
        left: '-40px', // 增加与内容的距离，适应更宽的边距
      }
    });
    
    // 计算菜单位置
    const menuPosition = computed(() => {
      return {
        top: `${cursorTop.value - 10}px`, // 上移更多，避免遮挡当前行
        left: '-290px', // 确保菜单完全显示在加号左侧，适应新位置
      }
    });
    
    // 更新光标位置的函数
    const updateCursorPosition = () => {
      if (!editor.value) return;
      
      // 获取选区信息
      const { view } = editor.value;
      const { state } = view;
      const { selection } = state;
      const { empty, from } = selection;
      
      // 如果没有选区，隐藏光标指示器
      if (empty && from === 0) {
        cursorVisible.value = false;
        return;
      }
      
      // 获取当前节点位置，而不是光标位置
      try {
        // 获取当前选中位置所在的节点DOM元素
        const posNode = view.domAtPos(from);
        const currentNode: Element = posNode.node.nodeType === 3 
          ? posNode.node.parentNode as Element 
          : posNode.node as Element;
        // 获取最近的块级父元素（段落、标题等）
        let blockNode: Element | null = currentNode;
        while (blockNode && !['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'BLOCKQUOTE'].includes(blockNode.nodeName)) {
          blockNode = blockNode.parentElement;
        }
        // 使用当前块级元素的位置，如果找不到就使用当前元素
        const nodeToUse: Element = blockNode || currentNode;
        const editorEl = document.querySelector('.emr-editor-content');
        
        if (editorEl && nodeToUse) {
          // 获取节点位置
          const nodeRect = nodeToUse.getBoundingClientRect();
          const editorRect = editorEl.getBoundingClientRect();
          
          // 使用节点的顶部位置，而不是光标位置
          cursorTop.value = nodeRect.top - editorRect.top + (nodeRect.height / 2) - 12; // 垂直居中对齐节点
          cursorLeft.value = 0; // 固定在左侧
          cursorVisible.value = true;
        }
      } catch (error) {
        console.error('Error updating cursor position:', error);
        cursorVisible.value = false;
      }
    };
    
    // 创建编辑器实例
    const editor = useEditor({
      content: props.content,
      extensions: [
        StarterKit,
        Underline,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
          alignments: ['left', 'center', 'right'],
          defaultAlignment: 'left',
        }),
        Image.configure({
          inline: true,
          allowBase64: true,
        }),
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableCell,
        TableHeader,
        Placeholder.configure({
          placeholder: '请输入文档内容...',
          showOnlyWhenEditable: true,
        }),
      ],
      editable: props.editable,
      autofocus: props.autofocus,
      onUpdate: ({ editor: editorInstance }) => {
        const html = editorInstance.getHTML();
        console.log('编辑器内容更新 [长度]:', html.length); 
        console.log('内容预览:', html.substring(0, 30));
        
        // 避免不必要的更新
        if (html !== lastContent.value) {
          // 存储最新内容
          lastContent.value = html;
          
          // 更新到父组件 (v-model)
          emit('update:content', html);
          
          // 确保内容也更新到store
          // 使用延迟是为了确保不会和父组件的更新冲突
          // 父组件会通过v-model先触发更新
          setTimeout(() => {
            console.log('同步内容到store [延迟]');
            editorStore.setContent(html);
          }, 0);
        }
        
        // 更新光标位置
        updateCursorPosition();
      },
      onSelectionUpdate: () => {
        // 选中内容变化时更新光标位置
        updateCursorPosition();
      },
      onFocus: () => {
        editorStore.startEditing();
        // 获得焦点时更新光标位置
        updateCursorPosition();
        // 获得焦点时自动收起菜单
        showFloatingMenu.value = false;
      },
      onBlur: () => {
        editorStore.stopEditing();
      },
    });
    
    // 当编辑器准备好时发出事件
    watch(
      () => editor.value,
      (newValue) => {
        if (newValue) {
          emit('editor-ready', newValue);
          // 初始化后更新光标位置
          setTimeout(updateCursorPosition, 100);
        }
      }
    );

    // 监听传入的内容变化
    watch(
      () => props.content,
      (newContent) => {
        console.log('内容props变化检测:', newContent?.substring(0, 30) || '空内容');
        // 只有当新内容与当前内容不同且编辑器存在时才更新
        if (editor.value && newContent) {
          console.log('设置编辑器内容:', newContent.substring(0, 30));
          // 直接使用setContent命令而不是延迟
          lastContent.value = newContent;
          // 使用false作为第二个参数以保持选择状态
          editor.value.commands.setContent(newContent, false);
          // 内容更新后更新光标位置
          setTimeout(updateCursorPosition, 100);
        } else {
          console.log('编辑器未初始化或内容为空，无法更新编辑器内容');
        }
      },
      { immediate: true } // 立即执行，确保初始内容也被处理
    );

    // 监听传入的可编辑状态变化
    watch(
      () => props.editable,
      (editable) => {
        if (editor.value) {
          editor.value.setEditable(editable);
        }
      }
    );
    
    // 监听窗口大小变化，更新光标位置
    onMounted(() => {
      window.addEventListener('resize', updateCursorPosition);
      // 初始设置一个默认位置
      setTimeout(updateCursorPosition, 500);
    });

    // 组件销毁前销毁编辑器实例和事件监听
    onBeforeUnmount(() => {
      if (editor.value) {
        editor.value.destroy();
      }
      window.removeEventListener('resize', updateCursorPosition);
    });

    return {
      editor,
      showFloatingMenu,
      buttonPosition,
      menuPosition,
      cursorVisible
    };
  },
});
</script>

<style scoped lang="scss">
.emr-editor-content-wrapper {
  position: relative;
  flex: 1;
  overflow: visible; /* 改为visible，避免创建额外的滚动区域 */
  height: 100%;
  width: 100%; /* 确保包装器占据全部可用宽度 */
  box-sizing: border-box; /* 确保一致的盒模型计算 */
  
  .emr-editor-content {
    height: 100%;
    padding: 0; /* 移除内容区域padding，避免与纸张padding重叠 */
    outline: none;
    width: 100%; /* 确保编辑器内容区域固定宽度 */
    position: relative; /* 建立新的定位上下文 */
    
    /* 基础编辑器内容样式 */
    :deep(.ProseMirror) {
      outline: none;
      height: 100%;
      min-height: 200px;
      color: #333;
      font-size: 16px; /* 更改默认字号为16px */
      line-height: 1.6;
      overflow: visible; /* 确保内容不产生自己的滚动条 */
      width: 100%; /* 确保内容区域占满容器宽度 */
      box-sizing: border-box; /* 确保padding不会影响宽度计算 */
      padding: 0;
      background-color: transparent; /* 确保编辑器背景是透明的 */
      max-width: 100%; /* 限制最大宽度，防止内容撑开 */
      overflow-x: hidden; /* 防止水平溢出 */
      
      > * {
        margin-left: 0;
        margin-right: 0;
        width: 100%; /* 确保所有顶级元素宽度100% */
        box-sizing: border-box;
        max-width: 100%; /* 限制所有元素最大宽度 */
      }
      
      p {
        margin: 1em 0;
        width: 100%; /* 确保段落宽度固定 */
        box-sizing: border-box;
        transition: background-color 0.2s; /* 平滑背景色变化 */
        
        &:hover {
          background-color: rgba(245, 247, 250, 0.4); /* 鼠标悬停时突出显示段落 */
        }
      }
      
      /* 占位符样式 */
      p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: #94a3b8; /* 调整占位符颜色，更柔和 */
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
        width: 100%; /* 确保标题宽度固定 */
        box-sizing: border-box;
      }
      
      h1 { font-size: 1.8em; }
      h2 { font-size: 1.5em; }
      h3 { font-size: 1.3em; }
      
      ul, ol {
        padding-left: 1.5em;
        width: 100%; /* 确保列表宽度固定 */
        box-sizing: border-box;
      }
      
      blockquote {
        border-left: 3px solid #dcdfe6;
        padding-left: 1em;
        color: #606266;
        font-style: italic;
        width: 100%; /* 确保引用宽度固定 */
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
        width: 100%; /* 确保代码块宽度固定 */
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
        table-layout: fixed; /* 使表格宽度固定 */
        
        td, th {
          border: 1px solid #dcdfe6;
          padding: 0.5em;
          word-break: break-word; /* 防止长文本撑开表格 */
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
    background-color: #f5f5f5; /* 稍微灰色背景，与纸张形成对比 */
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    z-index: 20;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: #e6e6e6;
      transform: scale(1.1); /* 悬停时有轻微放大效果 */
    }
    
    svg {
      font-size: 14px;
      color: #606266;
    }
  }
  
  /* 自定义浮动菜单容器 */
  .custom-floating-menu {
    position: absolute;
    z-index: 30;
    transition: all 0.2s ease;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.12)); /* 添加轻微阴影效果 */
  }
}
</style> 