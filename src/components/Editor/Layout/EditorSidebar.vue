<template>
  <div class="editor-sidebar" :class="{ 'collapsed': collapsed }">
    <div class="sidebar-toggle" @click="toggleSidebar">
      <el-icon v-if="!collapsed"><arrow-left /></el-icon>
      <el-icon v-else><arrow-right /></el-icon>
    </div>
    
    <div class="sidebar-content">
      <div class="sidebar-tabs">
        <div 
          v-for="tab in tabs" 
          :key="tab.id" 
          class="sidebar-tab"
          :class="{ 'active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <el-tooltip :content="tab.title" placement="right" :disabled="!collapsed">
            <el-icon><component :is="tab.icon" /></el-icon>
            <span v-if="!collapsed" class="tab-title">{{ tab.title }}</span>
          </el-tooltip>
        </div>
      </div>
      
      <div v-if="!collapsed" class="tab-content">
        <component :is="currentTabComponent" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { 
  ArrowLeft, 
  ArrowRight, 
  Document, 
  List, 
  Collection, 
  Setting,
  Timer
} from '@element-plus/icons-vue';

// 侧边栏面板占位组件
const PlaceholderPanel = defineComponent({
  template: `<div class="panel-placeholder">{{ title }} 面板内容</div>`,
  props: {
    title: {
      type: String,
      default: '功能'
    }
  }
});

export default defineComponent({
  name: 'EditorSidebar',
  components: {
    ArrowLeft,
    ArrowRight,
    Document,
    List,
    Collection,
    Setting,
    Timer,
    OutlinePanel: PlaceholderPanel,
    TemplatesPanel: PlaceholderPanel,
    ControlsPanel: PlaceholderPanel,
    SettingsPanel: PlaceholderPanel,
    HistoryPanel: PlaceholderPanel
  },
  props: {
    collapsed: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:collapsed'],
  setup(props, { emit }) {
    const activeTab = ref('outline');
    
    const tabs = [
      { id: 'outline', title: '大纲', icon: 'Document', component: 'OutlinePanel' },
      { id: 'templates', title: '模板', icon: 'List', component: 'TemplatesPanel' },
      { id: 'controls', title: '控件', icon: 'Collection', component: 'ControlsPanel' },
      { id: 'settings', title: '设置', icon: 'Setting', component: 'SettingsPanel' },
      { id: 'history', title: '历史', icon: 'Timer', component: 'HistoryPanel' }
    ];
    
    const currentTabComponent = computed(() => {
      const tab = tabs.find(t => t.id === activeTab.value);
      return tab ? tab.component : null;
    });
    
    const toggleSidebar = () => {
      emit('update:collapsed', !props.collapsed);
    };
    
    return {
      activeTab,
      tabs,
      currentTabComponent,
      toggleSidebar
    };
  }
});
</script>

<style scoped lang="scss">
.editor-sidebar {
  display: flex;
  flex-direction: column;
  position: relative;
  
  .sidebar-toggle {
    position: absolute;
    top: 10px;
    right: -12px;
    width: 24px;
    height: 24px;
    background: var(--paper-color);
    border: 1px solid var(--border-color-light);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    box-shadow: var(--box-shadow-light);
  }
  
  .sidebar-content {
    display: flex;
    height: 100%;
  }
  
  .sidebar-tabs {
    display: flex;
    flex-direction: column;
    padding: 16px 0;
    border-right: 1px solid var(--border-color-lighter);
  }
  
  .sidebar-tab {
    padding: 12px;
    cursor: pointer;
    border-left: 3px solid transparent;
    display: flex;
    align-items: center;
    
    &.active {
      border-left-color: var(--primary-color);
      color: var(--primary-color);
      background-color: rgba(58, 123, 213, 0.1);
    }
    
    .tab-title {
      margin-left: 8px;
    }
  }
  
  .tab-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }
  
  &.collapsed {
    .sidebar-tabs {
      border-right: none;
    }
  }
}

.panel-placeholder {
  color: var(--text-color-secondary);
  font-style: italic;
  padding: 20px;
  text-align: center;
  border: 1px dashed var(--border-color-light);
  border-radius: var(--border-radius-base);
  margin-top: 20px;
}
</style> 