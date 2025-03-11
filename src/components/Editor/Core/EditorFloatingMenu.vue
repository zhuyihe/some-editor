<template>
  <div class="editor-floating-menu">
    <div class="menu-container">
      <div class="menu-header">
        <span>插入内容</span>
        <button class="close-button" @click="$emit('close-menu')">×</button>
      </div>
      
      <div class="menu-section">
        <div class="menu-item" @click="insertContent('paragraph')">
          <font-awesome-icon :icon="['fas', 'paragraph']" />
          <span>段落</span>
          <span class="shortcut">Ctrl+Alt+0</span>
        </div>
        
        <div class="submenu-item" @mouseenter="activeSubmenu = 'heading'" @mouseleave="activeSubmenu = null">
          <font-awesome-icon :icon="['fas', 'heading']" />
          <span>标题</span>
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="submenu-arrow" />
          
          <div class="submenu" v-if="activeSubmenu === 'heading'">
            <div class="submenu-item-child" @click="insertContent('h1')">
              <span>标题 1</span>
              <span class="shortcut">Ctrl+Alt+1</span>
            </div>
            <div class="submenu-item-child" @click="insertContent('h2')">
              <span>标题 2</span>
              <span class="shortcut">Ctrl+Alt+2</span>
            </div>
            <div class="submenu-item-child" @click="insertContent('h3')">
              <span>标题 3</span>
              <span class="shortcut">Ctrl+Alt+3</span>
            </div>
          </div>
        </div>
        
        <div class="submenu-item" @mouseenter="activeSubmenu = 'list'" @mouseleave="activeSubmenu = null">
          <font-awesome-icon :icon="['fas', 'list']" />
          <span>列表</span>
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="submenu-arrow" />
          
          <div class="submenu" v-if="activeSubmenu === 'list'">
            <div class="submenu-item-child" @click="insertContent('bulletList')">
              <font-awesome-icon :icon="['fas', 'list']" />
              <span>无序列表</span>
              <span class="shortcut">Ctrl+Shift+8</span>
            </div>
            <div class="submenu-item-child" @click="insertContent('orderedList')">
              <font-awesome-icon :icon="['fas', 'list-ol']" />
              <span>有序列表</span>
              <span class="shortcut">Ctrl+Shift+9</span>
            </div>
          </div>
        </div>
        
        <div class="menu-item" @click="insertContent('blockquote')">
          <font-awesome-icon :icon="['fas', 'quote-left']" />
          <span>引用</span>
          <span class="shortcut">Ctrl+Shift+B</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Editor } from '@tiptap/vue-3';

export default defineComponent({
  name: 'EditorFloatingMenu',
  props: {
    editor: {
      type: Object as () => Editor,
      required: true
    }
  },
  emits: ['close-menu'],
  setup(props) {
    const activeSubmenu = ref<string | null>(null);
    
    const insertContent = (type: string) => {
      if (!props.editor) return;
      
      props.editor.chain().focus();
      
      switch (type) {
        case 'paragraph':
          props.editor.chain().focus().setParagraph().run();
          break;
        case 'h1':
          props.editor.chain().focus().toggleHeading({ level: 1 }).run();
          break;
        case 'h2':
          props.editor.chain().focus().toggleHeading({ level: 2 }).run();
          break;
        case 'h3':
          props.editor.chain().focus().toggleHeading({ level: 3 }).run();
          break;
        case 'bulletList':
          props.editor.chain().focus().toggleBulletList().run();
          break;
        case 'orderedList':
          props.editor.chain().focus().toggleOrderedList().run();
          break;
        case 'blockquote':
          props.editor.chain().focus().toggleBlockquote().run();
          break;
        default:
          break;
      }
    };
    
    return {
      insertContent,
      activeSubmenu
    };
  }
});
</script>

<style scoped lang="scss">
.editor-floating-menu {
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  overflow: visible;
  width: 200px;
  user-select: none;
  margin-left: 10px;
  
  .menu-container {
    display: flex;
    flex-direction: column;
  }
  
  .menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    border-bottom: 1px solid #ebeef5;
    
    span {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }
    
    .close-button {
      border: none;
      background: none;
      font-size: 18px;
      color: #909399;
      cursor: pointer;
      width: 20px;
      height: 20px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:hover {
        color: #606266;
      }
    }
  }
  
  .menu-section {
    padding: 5px 0;
  }
  
  .menu-item {
    padding: 8px 12px;
    display: flex;
    align-items: center;
    cursor: pointer;
    position: relative;
    
    &:hover {
      background-color: #f5f7fa;
    }
    
    svg {
      margin-right: 8px;
      width: 16px;
      color: #606266;
    }
    
    span {
      flex: 1;
      font-size: 14px;
      color: #303133;
      
      &.shortcut {
        flex: none;
        font-size: 12px;
        color: #909399;
        margin-left: 8px;
      }
    }
  }
  
  .submenu-item {
    padding: 8px 12px;
    display: flex;
    align-items: center;
    cursor: pointer;
    position: relative;
    
    &:hover {
      background-color: #f5f7fa;
    }
    
    svg {
      margin-right: 8px;
      width: 16px;
      color: #606266;
      
      &.submenu-arrow {
        margin-right: 0;
        margin-left: auto;
        width: 12px;
        color: #909399;
      }
    }
    
    span {
      flex: 1;
      font-size: 14px;
      color: #303133;
    }
    
    .submenu {
      position: absolute;
      left: 100%;
      top: 0;
      background-color: #ffffff;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
      width: 200px;
      z-index: 100;
      
      .submenu-item-child {
        padding: 8px 12px;
        display: flex;
        align-items: center;
        cursor: pointer;
        
        &:hover {
          background-color: #f5f7fa;
        }
        
        span {
          flex: 1;
          font-size: 14px;
          color: #303133;
          
          &.shortcut {
            flex: none;
            font-size: 12px;
            color: #909399;
            margin-left: 8px;
          }
        }
        
        svg {
          margin-right: 8px;
          width: 16px;
          color: #606266;
        }
      }
    }
  }
}
</style> 