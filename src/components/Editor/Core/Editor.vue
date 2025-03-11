<template>
  <div class="emr-editor-container">
    <div class="emr-editor-toolbar">
      <!-- 工具栏将在后续任务中实现 -->
      <slot name="toolbar"></slot>
    </div>
    <div class="emr-editor-content-container">
      <emr-editor-content 
        v-model:content="content"
        :editable="editable"
        :autofocus="autofocus"
        @editor-ready="handleEditorReady"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import EMREditorContent from './EditorContent.vue';

export default defineComponent({
  name: 'Editor',
  components: {
    EMREditorContent
  },
  props: {
    modelValue: {
      type: String,
      default: '<p>请开始编辑...</p>'
    },
    editable: {
      type: Boolean,
      default: true
    },
    autofocus: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'editor-ready'],
  setup(props, { emit }) {
    const content = ref(props.modelValue);
    const editor = ref(null);
    // 用于跟踪最后一次更新的内容，避免循环更新
    const lastEmittedContent = ref(props.modelValue);

    // 监听内容变化
    watch(content, (newContent) => {
      // 避免重复和循环更新
      if (newContent !== lastEmittedContent.value) {
        lastEmittedContent.value = newContent;
        emit('update:modelValue', newContent);
      }
    });

    // 监听外部内容变化
    watch(() => props.modelValue, (newValue) => {
      // 避免循环更新
      if (newValue !== content.value) {
        content.value = newValue;
        lastEmittedContent.value = newValue;
      }
    });

    // 编辑器就绪处理
    const handleEditorReady = (editorInstance: any) => {
      editor.value = editorInstance;
      emit('editor-ready', editorInstance);
    };

    return {
      content,
      handleEditorReady
    };
  }
});
</script>

<style scoped lang="scss">
.emr-editor-container {
  height: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  
  .emr-editor-content-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}
</style> 