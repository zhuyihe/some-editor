<template>
  <div class="editor-floating-menu">
    <div class="menu-container">
      <div class="menu-header" @click="handleAiAssistantClick">
        <div class="ai-helper clickable">
          <font-awesome-icon :icon="['fas', 'robot']" class="ai-icon" />
          <span>AI 文档助手</span>
        </div>
      </div>
      
      <div class="menu-section">
        <template v-for="(section, sectionIndex) in menuConfig" :key="sectionIndex">
          <div class="section-divider"></div>
          <div class="section-title">{{ section.title }}</div>
          
          <div 
            v-for="(item, itemIndex) in section.items" 
            :key="`${sectionIndex}-${itemIndex}`"
            class="menu-item"
            @click="insertContent(item.action)"
          >
            <font-awesome-icon :icon="item.icon" />
            <span>{{ item.label }}</span>
            
            <font-awesome-icon 
              v-if="item.hasSubmenu" 
              :icon="['fas', 'chevron-right']" 
              class="submenu-arrow" 
            />
            
            <span v-if="item.shortcut" class="shortcut">{{ item.shortcut }}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Editor } from '@tiptap/vue-3';

interface MenuItem {
  label: string;
  icon: string[] | string;
  action: string;
  shortcut?: string;
  hasSubmenu?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default defineComponent({
  name: 'EditorFloatingMenu',
  props: {
    editor: {
      type: Object as () => Editor,
      required: true
    }
  },
  emits: ['close-menu', 'ai-assistant'],
  setup(props, { emit }) {
    const activeSubmenu = ref<string | null>(null);
    
    const menuConfig = ref<MenuSection[]>([
      {
        title: '插入新内容',
        items: [
          { 
            label: '插入段落', 
            icon: ['fas', 'align-left'], 
            action: 'paragraph' 
          },
          { 
            label: '插入章节', 
            icon: ['fas', 'file-alt'], 
            action: 'section',
            hasSubmenu: true
          },
          { 
            label: '插入模板', 
            icon: ['fas', 'file-alt'], 
            action: 'template',
            hasSubmenu: true
          }
        ]
      },
      {
        title: '切换节点类型',
        items: [
          { 
            label: '标题 1', 
            icon: ['fas', 'heading'], 
            action: 'h1',
            shortcut: 'Ctrl+Alt+1'
          },
          { 
            label: '标题 2', 
            icon: ['fas', 'heading'], 
            action: 'h2',
            shortcut: 'Ctrl+Alt+2'
          },
          { 
            label: '标题 3', 
            icon: ['fas', 'heading'], 
            action: 'h3',
            shortcut: 'Ctrl+Alt+3'
          },
          { 
            label: '无序列表', 
            icon: ['fas', 'list'], 
            action: 'bulletList',
            shortcut: 'Ctrl+Shift+8'
          },
          { 
            label: '有序列表', 
            icon: ['fas', 'list-ol'], 
            action: 'orderedList',
            shortcut: 'Ctrl+Shift+9'
          },
          { 
            label: '引用', 
            icon: ['fas', 'quote-left'], 
            action: 'blockquote',
            shortcut: 'Ctrl+Shift+B'
          }
        ]
      }
    ]);
    
    const handleAiAssistantClick = () => {
      emit('ai-assistant');
    };
    
    const insertContent = (type: string) => {
      if (!props.editor) return;
      
      props.editor.chain().focus();
      
      switch (type) {
        case 'paragraph':
          props.editor.chain().focus().setParagraph().run();
          break;
        case 'section':
          props.editor.chain().focus().setParagraph().run();
          props.editor.chain().focus().insertContent('<p>新的章节内容</p>').run();
          break;
        case 'template':
          props.editor.chain().focus().insertContent('<p>模板示例内容</p>').run();
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
      
      props.editor.chain().focus();
      emit('close-menu');
    };
    
    return {
      insertContent,
      activeSubmenu,
      menuConfig,
      handleAiAssistantClick
    };
  }
});
</script>

<style scoped lang="scss">
.editor-floating-menu {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  overflow: visible;
  width: 220px;
  user-select: none;
  
  .menu-container {
    display: flex;
    flex-direction: column;
  }
  
  .menu-header {
    display: flex;
    flex-direction: column;
    padding: 12px 16px 8px;
    border-bottom: none;
    
    .ai-helper {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      
      &.clickable {
        cursor: pointer;
        transition: all 0.2s;
        padding: 4px 8px;
        border-radius: 4px;
        margin: -4px -8px;
        
        &:hover {
          background-color: #e6f7ff;
        }
      }
      
      .ai-icon {
        color: #1890ff;
        font-size: 16px;
        margin-right: 8px;
      }
      
      span {
        font-size: 13px;
        font-weight: 500;
        color: #1890ff;
      }
    }
  }
  
  .section-divider {
    height: 1px;
    background-color: #ebeef5;
    margin: 0;
  }
  
  .section-title {
    padding: 12px 16px 4px;
    font-size: 12px;
    font-weight: 500;
    color: #909399;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .menu-section {
    padding: 8px 0;
  }
  
  .menu-item {
    padding: 10px 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
    position: relative;
    
    &:hover {
      background-color: #f5f7fa;
    }
    
    svg {
      margin-right: 10px;
      width: 16px;
      color: #606266;
      
      &.submenu-arrow {
        margin-right: 0;
        margin-left: 8px;
        width: 12px;
        color: #909399;
      }
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