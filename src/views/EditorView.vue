<template>
  <editor-layout @save-content="saveContent">
    <template #toolbar>
      <editor-toolbar v-if="editor" :editor="editor" />
    </template>
    
    <editor-content
      v-model="editorContent"
      @editor-ready="handleEditorReady"
      :autofocus="true"
    />
  </editor-layout>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useEditorStore } from '../stores/editor';
import EditorLayout from '../components/Editor/Layout/EditorLayout.vue';
import EditorContent from '../components/Editor/Core/EditorContent.vue';
import EditorToolbar from '../components/Editor/Toolbar/EditorToolbar.vue';

export default defineComponent({
  name: 'EditorView',
  components: {
    EditorLayout,
    EditorContent,
    EditorToolbar
  },
  setup() {
    const editorStore = useEditorStore();
    const editorContent = ref('<h2>欢迎使用电子病历编辑器</h2><p>这是一个基于 Tiptap 的富文本编辑器，支持结构化控件和智能分页功能。</p>');
    const editor = ref(null);
    const autoSaveTimer = ref<number | null>(null);
    
    // 编辑器就绪处理
    const handleEditorReady = (editorInstance: any) => {
      editor.value = editorInstance;
      console.log('编辑器实例准备就绪');
      
      // 编辑器就绪后，确保内容正确加载
      if (editorStore.content) {
        console.log('编辑器就绪，设置内容:', editorStore.content.substring(0, 30));
        editorContent.value = editorStore.content;
        
        // 延迟一下再次设置内容，确保编辑器内部状态完全准备好
        setTimeout(() => {
          console.log('再次确认内容设置');
          if (editorInstance.commands) {
            editorInstance.commands.setContent(editorStore.content, false);
          }
        }, 200);
      }
    };

    // 保存内容
    const saveContent = async () => {
      try {
        // 获取编辑器的最新内容，而不是使用可能过时的editorContent变量
        let contentToSave = editorContent.value;
        
        // 如果编辑器实例可用，从编辑器实例获取最新内容
        if (editor.value && editor.value.getHTML) {
          contentToSave = editor.value.getHTML();
          console.log('从编辑器实例获取最新内容:', contentToSave.substring(0, 30));
          // 保持editorContent同步，确保v-model是最新的
          editorContent.value = contentToSave;
        } else {
          console.log('编辑器实例不可用，使用editorContent变量:', contentToSave.substring(0, 30));
        }
        
        // 设置内容到store，然后保存
        editorStore.setContent(contentToSave);
        const result = await editorStore.saveContent();
        
        if (result) {
          ElMessage.success({
            message: '内容已保存',
            duration: 1500
          });
        }
      } catch (error) {
        console.error('保存失败:', error);
        ElMessage.error({
          message: '保存失败，请重试',
          duration: 3000
        });
      }
    };
    
    // 加载保存的内容
    const loadSavedContent = () => {
      console.log('开始加载保存的内容');
      const loaded = editorStore.loadContent();
      console.log('loadContent结果:', loaded, '内容长度:', editorStore.content?.length);
      
      if (loaded && editorStore.content) {
        console.log('设置编辑器内容为保存的内容:', editorStore.content.substring(0, 50));
        // 确保内容已经被更新到store
        editorContent.value = editorStore.content;
        
        // 显示加载成功的消息
        if (editorStore.lastSaved) {
          ElMessage.success({
            message: `已加载上次保存的内容（${editorStore.formattedLastSaved}）`,
            duration: 3000
          });
        }
      } else {
        console.warn('没有找到保存的内容或加载失败');
      }
    };
    
    // 设置自动保存
    const setupAutoSave = () => {
      // 清除已有的定时器
      if (autoSaveTimer.value) {
        clearInterval(autoSaveTimer.value);
      }
      
      // 如果启用了自动保存，设置定时器
      if (editorStore.autoSaveEnabled) {
        autoSaveTimer.value = window.setInterval(() => {
          if (editorStore.isDirty && editorStore.content) {
            editorStore.saveContent().then(saved => {
              if (saved) {
                console.log('自动保存成功:', editorStore.formattedLastSaved);
              }
            });
          }
        }, editorStore.autoSaveInterval * 1000);
      }
    };
    
    // 监听内容变化
    watch(() => editorContent.value, (newContent) => {
      console.log('内容变更:', newContent);
      if (newContent !== editorStore.content) {
        console.log('更新store内容');
        editorStore.setContent(newContent);
      }
    });
    
    // 监听自动保存设置变化
    watch(
      [() => editorStore.autoSaveEnabled, () => editorStore.autoSaveInterval],
      () => setupAutoSave()
    );

    // 添加Ctrl+S快捷键保存功能
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检测Ctrl+S组合键
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // 阻止浏览器默认保存行为
        saveContent();
      }
    };

    // 初始化
    onMounted(() => {
      console.log('组件挂载，开始初始化');
      
      // 1. 先尝试加载已保存的内容
      loadSavedContent();
      
      // 2. 设置默认内容（如果没有保存的内容）
      if (!editorStore.content) {
        console.log('设置默认内容');
        editorContent.value = '<h2>欢迎使用电子病历编辑器</h2><p>这是一个基于 Tiptap 的富文本编辑器，支持结构化控件和智能分页功能。</p>';
      } else {
        console.log('使用已加载的内容');
      }
      
      // 3. 初始化自动保存
      setupAutoSave();
      
      // 4. 添加键盘事件监听器
      window.addEventListener('keydown', handleKeyDown);
    });
    
    // 组件销毁前清理
    onBeforeUnmount(() => {
      if (autoSaveTimer.value) {
        clearInterval(autoSaveTimer.value);
      }
      
      // 移除键盘事件监听器
      window.removeEventListener('keydown', handleKeyDown);
    });

    return {
      editorContent,
      editor,
      handleEditorReady,
      saveContent,
      loadSavedContent
    };
  }
});
</script>

<style scoped lang="scss">
.editor-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  h1 {
    margin-bottom: 20px;
    color: var(--text-color-primary);
  }
  
  .editor-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .preview-card {
    margin-top: 30px;
    
    .content-preview {
      padding: 16px;
      min-height: 200px;
      border: 1px solid var(--border-color-light);
      border-radius: 4px;
      background-color: #fff;
    }
  }
}
</style> 