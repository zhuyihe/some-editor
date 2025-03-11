<template>
  <div class="emr-editor-toolbar">
    <!-- 基本编辑区 -->
    <div class="toolbar-section">
      <el-tooltip content="撤销 (Ctrl+Z)" placement="bottom">
        <button 
          class="toolbar-button"
          @click="editor.chain().focus().undo().run()"
          :disabled="!editor.can().chain().focus().undo().run()"
        >
          <font-awesome-icon icon="undo" />
        </button>
      </el-tooltip>
      
      <el-tooltip content="重做 (Ctrl+Y)" placement="bottom">
        <button 
          class="toolbar-button"
          @click="editor.chain().focus().redo().run()"
          :disabled="!editor.can().chain().focus().redo().run()"
        >
          <font-awesome-icon icon="redo" />
        </button>
      </el-tooltip>
    </div>

    <div class="toolbar-divider"></div>
    
    <!-- 字体设置区 -->
    <div class="toolbar-section">
      <el-select v-model="fontSize" size="small" placeholder="字号" style="width: 80px">
        <el-option v-for="size in fontSizes" :key="size.value" :label="size.label" :value="size.value"></el-option>
      </el-select>
    </div>

    <div class="toolbar-divider"></div>
    
    <!-- 文本格式区 -->
    <div class="toolbar-section">
      <el-tooltip content="加粗 (Ctrl+B)" placement="bottom">
        <button 
          class="toolbar-button" 
          :class="{ 'is-active': editor.isActive('bold') }"
          @click="editor.chain().focus().toggleBold().run()"
          :disabled="!editor.can().chain().focus().toggleBold().run()"
        >
          <font-awesome-icon icon="bold" />
        </button>
      </el-tooltip>
      
      <el-tooltip content="斜体 (Ctrl+I)" placement="bottom">
        <button 
          class="toolbar-button" 
          :class="{ 'is-active': editor.isActive('italic') }"
          @click="editor.chain().focus().toggleItalic().run()"
          :disabled="!editor.can().chain().focus().toggleItalic().run()"
        >
          <font-awesome-icon icon="italic" />
        </button>
      </el-tooltip>
      
      <el-tooltip content="下划线 (Ctrl+U)" placement="bottom">
        <button 
          class="toolbar-button" 
          :class="{ 'is-active': editor.isActive('underline') }"
          @click="editor.chain().focus().toggleUnderline().run()"
          :disabled="!editor.can().chain().focus().toggleUnderline().run()"
        >
          <font-awesome-icon icon="underline" />
        </button>
      </el-tooltip>
      
      <el-tooltip content="删除线" placement="bottom">
        <button 
          class="toolbar-button" 
          :class="{ 'is-active': editor.isActive('strike') }"
          @click="editor.chain().focus().toggleStrike().run()"
          :disabled="!editor.can().chain().focus().toggleStrike().run()"
        >
          <font-awesome-icon icon="strikethrough" />
        </button>
      </el-tooltip>
    </div>
    
    <div class="toolbar-divider"></div>
    
    <!-- 段落格式区 -->
    <div class="toolbar-section">
      <el-button-group>
        <el-tooltip content="正文" placement="bottom">
          <el-button 
            size="small" 
            :type="!editor.isActive('heading') ? 'primary' : ''" 
            @click="editor.chain().focus().setParagraph().run()"
          >
            正文
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="标题1" placement="bottom">
          <el-button 
            size="small" 
            :type="editor.isActive('heading', { level: 1 }) ? 'primary' : ''" 
            @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          >
            H1
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="标题2" placement="bottom">
          <el-button 
            size="small" 
            :type="editor.isActive('heading', { level: 2 }) ? 'primary' : ''" 
            @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          >
            H2
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="标题3" placement="bottom">
          <el-button 
            size="small" 
            :type="editor.isActive('heading', { level: 3 }) ? 'primary' : ''" 
            @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
          >
            H3
          </el-button>
        </el-tooltip>
      </el-button-group>
      
      <el-button-group>
        <el-tooltip content="左对齐" placement="bottom">
          <el-button 
            size="small" 
            :type="editor.isActive({ textAlign: 'left' }) ? 'primary' : ''" 
            @click="editor.chain().focus().setTextAlign('left').run()"
          >
            <font-awesome-icon icon="align-left" />
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="居中对齐" placement="bottom">
          <el-button 
            size="small" 
            :type="editor.isActive({ textAlign: 'center' }) ? 'primary' : ''" 
            @click="editor.chain().focus().setTextAlign('center').run()"
          >
            <font-awesome-icon icon="align-center" />
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="右对齐" placement="bottom">
          <el-button 
            size="small" 
            :type="editor.isActive({ textAlign: 'right' }) ? 'primary' : ''" 
            @click="editor.chain().focus().setTextAlign('right').run()"
          >
            <font-awesome-icon icon="align-right" />
          </el-button>
      </el-tooltip>
      </el-button-group>
    </div>
    
    <div class="toolbar-divider"></div>
    
    <!-- 列表功能区 -->
    <div class="toolbar-section">
      <el-tooltip content="有序列表" placement="bottom">
        <button 
          class="toolbar-button" 
          :class="{ 'is-active': editor.isActive('orderedList') }"
          @click="editor.chain().focus().toggleOrderedList().run()"
          :disabled="!editor.can().chain().focus().toggleOrderedList().run()"
        >
          <font-awesome-icon icon="list-ol" />
        </button>
      </el-tooltip>
      
      <el-tooltip content="无序列表" placement="bottom">
        <button 
          class="toolbar-button" 
          :class="{ 'is-active': editor.isActive('bulletList') }"
          @click="editor.chain().focus().toggleBulletList().run()"
          :disabled="!editor.can().chain().focus().toggleBulletList().run()"
        >
          <font-awesome-icon icon="list" />
        </button>
      </el-tooltip>
    </div>
    
    <div class="toolbar-divider"></div>
    
    <!-- 插入功能区 -->
    <div class="toolbar-section">
      <el-tooltip content="插入表格" placement="bottom">
        <button 
          class="toolbar-button"
          @click="insertTable"
        >
          <font-awesome-icon icon="table" />
        </button>
      </el-tooltip>
      
      <el-tooltip content="插入图片" placement="bottom">
        <button 
          class="toolbar-button"
          @click="insertImage"
        >
          <font-awesome-icon icon="image" />
        </button>
      </el-tooltip>
    </div>
    
    <div class="toolbar-divider"></div>
    
    <!-- 导入导出区 -->
    <div class="toolbar-section">
      <el-tooltip content="导入Word" placement="bottom">
        <button class="toolbar-button-wide">
          <font-awesome-icon icon="file-word" class="fa-icon" />
          导入 Word
        </button>
      </el-tooltip>
      
      <el-tooltip content="复制Markdown" placement="bottom">
        <button class="toolbar-button-wide">
          <font-awesome-icon icon="clone" class="fa-icon" />
          Markdown
        </button>
      </el-tooltip>
      
      <el-tooltip content="查找替换" placement="bottom">
        <button class="toolbar-button-wide">
          <font-awesome-icon icon="search" class="fa-icon" />
          查找替换
        </button>
      </el-tooltip>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Editor } from '@tiptap/vue-3';

export default defineComponent({
  name: 'EditorToolbar',
  props: {
    editor: {
      type: Object as () => Editor,
      required: true
    }
  },
  setup(props) {
    const fontSize = ref('14px');
    const fontSizes = [
      { value: '12px', label: '12px' },
      { value: '14px', label: '14px' },
      { value: '16px', label: '16px' },
      { value: '18px', label: '18px' },
      { value: '20px', label: '20px' },
      { value: '24px', label: '24px' },
      { value: '28px', label: '28px' },
      { value: '32px', label: '32px' },
    ];
    
    // 设置文本对齐方式
    const setTextAlign = (align: string) => {
      if (props.editor) {
        props.editor.chain().focus().setTextAlign(align as 'left' | 'center' | 'right').run();
      }
    };
    
    // 插入表格
    const insertTable = () => {
      if (props.editor) {
        props.editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      }
    };
    
    // 插入图片
    const insertImage = () => {
      if (props.editor) {
        const url = window.prompt('输入图片URL');
        if (url) {
          props.editor.chain().focus().setImage({ src: url }).run();
        }
      }
    };
    
    return {
      fontSize,
      fontSizes,
      setTextAlign,
      insertTable,
      insertImage
    };
  }
});
</script>

<style scoped lang="scss">
.emr-editor-toolbar {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  height: 40px;
  padding: 0 8px;
  overflow-x: auto;
  
  /* Font Awesome 图标相关样式 */
  .fa-icon, .font-awesome-icon {
    margin-right: 5px;
    width: 16px;
    height: 16px;
  }
  
  .toolbar-section {
    display: flex;
    align-items: center;
    height: 100%;
  }
  
  .toolbar-divider {
    width: 1px;
    height: 24px;
    background-color: #e4e7ed;
    margin: 0 8px;
  }
  
  .toolbar-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    margin: 0 2px;
    border: 1px solid transparent;
    border-radius: 3px;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: #f2f6fc;
    }
    
    &.is-active {
      color: #409eff;
      background-color: #ecf5ff;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  .toolbar-button-special {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    margin: 0 2px;
    padding: 0 8px;
    border: 1px solid #dcdfe6;
    border-radius: 3px;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 13px;
    
    &:hover {
      background-color: #f2f6fc;
    }
  }
  
  .toolbar-button-wide {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    margin: 0 2px;
    padding: 0 10px;
    border: 1px solid #dcdfe6;
    border-radius: 3px;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 13px;
    
    .fa-icon {
      margin-right: 6px;
    }
    
    &:hover {
      background-color: #f2f6fc;
    }
  }
  
  .toolbar-dropdown {
    width: auto;
    padding: 0 8px;
    
    span {
      margin-right: 4px;
      font-size: 13px;
    }
    
    .dropdown-icon {
      font-size: 12px;
    }
  }
}
</style> 