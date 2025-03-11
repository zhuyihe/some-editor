<template>
  <div class="editor-header">
    <div class="brand">
      <h1 class="logo">电子病历编辑器</h1>
    </div>
    
    <div class="main-menu">
      <div class="menu-item">
        <span>开始</span>
      </div>
      <div class="menu-item">
        <span>插入</span>
      </div>
      <div class="menu-item">
        <span>表格</span>
      </div>
      <div class="menu-item">
        <span>工具</span>
      </div>
      <div class="menu-item">
        <span>页面</span>
      </div>
      <div class="menu-item">
        <span>导出</span>
      </div>
    </div>
    
    <div class="right-section">
      <!-- 保存状态指示器 -->
      <div class="save-status-indicator" v-if="editorStore.lastSaved">
        <span class="status-dot" :class="saveStatusClass"></span>
        <span class="status-text">{{ saveStatusText }}</span>
        <span class="last-saved-time">{{ editorStore.formattedLastSaved }}</span>
      </div>
      
      <!-- 保存按钮 -->
      <el-button
        type="success"
        size="small"
        :loading="editorStore.isSaving"
        :disabled="editorStore.isSaving"
        @click="saveContent"
      >
        <font-awesome-icon icon="file-alt" />
        {{ editorStore.isSaving ? '保存中...' : '保存文档 (Ctrl+S)' }}
      </el-button>
      
      <el-button type="primary" size="small" @click="showSettings = true">
        <font-awesome-icon icon="cog" />
        设置
      </el-button>
    </div>
    
    <!-- 编辑器设置对话框 -->
    <el-dialog
      v-model="showSettings"
      title="编辑器设置"
      width="400px"
    >
      <el-form label-position="top">
        <el-form-item label="自动保存">
          <el-switch v-model="autoSaveEnabled" />
        </el-form-item>
        
        <el-form-item label="自动保存间隔（秒）" v-if="autoSaveEnabled">
          <el-input-number
            v-model="autoSaveInterval"
            :min="5"
            :max="300"
            :step="5"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showSettings = false">取消</el-button>
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useEditorStore } from '../../../stores/editor';

export default defineComponent({
  name: 'EditorHeader',
  emits: ['save-content'],
  setup(_, { emit }) {
    const editorStore = useEditorStore();
    const showSettings = ref(false);
    const autoSaveEnabled = ref(editorStore.autoSaveEnabled);
    const autoSaveInterval = ref(editorStore.autoSaveInterval);
    
    // 保存状态样式和文本
    const saveStatusClass = computed(() => {
      if (editorStore.isSaving) return 'saving';
      if (editorStore.isDirty) return 'unsaved';
      return 'saved';
    });
    
    const saveStatusText = computed(() => {
      if (editorStore.isSaving) return '保存中...';
      if (editorStore.isDirty) return '未保存';
      return '已保存';
    });
    
    // 保存内容
    const saveContent = () => {
      emit('save-content');
    };
    
    // 保存设置
    const saveSettings = () => {
      editorStore.setAutoSaveEnabled(autoSaveEnabled.value);
      editorStore.setAutoSaveInterval(autoSaveInterval.value);
      showSettings.value = false;
      
      ElMessage.success('设置已保存');
    };
    
    return {
      editorStore,
      showSettings,
      autoSaveEnabled,
      autoSaveInterval,
      saveStatusClass,
      saveStatusText,
      saveContent,
      saveSettings
    };
  }
});
</script>

<style scoped lang="scss">
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 16px;
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  
  .brand {
    display: flex;
    align-items: center;
    
    .logo {
      font-size: 16px;
      font-weight: 500;
      margin: 0;
      color: #3a8ee6;
    }
  }
  
  .main-menu {
    display: flex;
    flex: 1;
    margin: 0 20px;
    
    .menu-item {
      padding: 0 15px;
      font-size: 14px;
      line-height: 50px;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        background-color: #f5f7fa;
        color: #409eff;
      }
    }
  }
  
  .right-section {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  .save-status-indicator {
    display: flex;
    align-items: center;
    margin-right: 8px;
    font-size: 12px;
    color: #606266;
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 4px;
      
      &.saving {
        background-color: #e6a23c;
        animation: pulse 1.5s infinite;
      }
      
      &.saved {
        background-color: #67c23a;
      }
      
      &.unsaved {
        background-color: #f56c6c;
      }
    }
    
    .status-text {
      margin-right: 8px;
    }
    
    .last-saved-time {
      color: #909399;
    }
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style> 