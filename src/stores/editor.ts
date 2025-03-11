import { defineStore } from 'pinia';
import { formatDateTime } from '../utils/editor-utils';

// 存储键名常量
const STORAGE_KEY = 'emr-editor-content';
const STORAGE_KEY_LAST_SAVED = 'emr-editor-last-saved';

export interface EditorState {
  content: string;
  isEditing: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // 以秒为单位
  isDirty: boolean; // 标记内容是否有未保存的更改
}

export const useEditorStore = defineStore('editor', {
  state: (): EditorState => ({
    content: '',
    isEditing: false,
    isSaving: false,
    lastSaved: null,
    autoSaveEnabled: true,
    autoSaveInterval: 30, // 默认30秒自动保存一次
    isDirty: false
  }),
  
  getters: {
    // 获取格式化的最后保存时间
    formattedLastSaved(): string {
      if (!this.lastSaved) return '尚未保存';
      return formatDateTime(this.lastSaved, 'YYYY-MM-DD HH:mm:ss');
    },
    
    // 内容保存状态
    saveStatus(): 'saved' | 'saving' | 'unsaved' {
      if (this.isSaving) return 'saving';
      if (this.isDirty) return 'unsaved';
      return 'saved';
    }
  },
  
  actions: {
    // 设置编辑器内容
    setContent(content: string) {
      if (this.content !== content) {
        this.content = content;
        this.isDirty = true;
      }
    },
    
    // 开始编辑
    startEditing() {
      this.isEditing = true;
    },
    
    // 停止编辑
    stopEditing() {
      this.isEditing = false;
      
      // 如果启用了自动保存，退出编辑时也保存内容
      if (this.autoSaveEnabled && this.isDirty) {
        this.saveContent();
      }
    },
    
    // 保存内容到本地存储
    async saveContent() {
      if (!this.content) return false;
      
      try {
        this.isSaving = true;
        
        // 保存到localStorage
        localStorage.setItem(STORAGE_KEY, this.content);
        localStorage.setItem(STORAGE_KEY_LAST_SAVED, new Date().toISOString());
        
        // 更新状态
        this.lastSaved = new Date();
        this.isDirty = false;
        
        return true;
      } catch (error) {
        console.error('保存内容失败:', error);
        return false;
      } finally {
        this.isSaving = false;
      }
    },
    
    // 加载保存的内容
    loadContent() {
      try {
        // 从localStorage加载内容
        const savedContent = localStorage.getItem(STORAGE_KEY);
        if (savedContent) {
          this.content = savedContent;
        }
        
        // 加载最后保存时间
        const lastSavedStr = localStorage.getItem(STORAGE_KEY_LAST_SAVED);
        if (lastSavedStr) {
          this.lastSaved = new Date(lastSavedStr);
        }
        
        this.isDirty = false;
        return true;
      } catch (error) {
        console.error('加载内容失败:', error);
        return false;
      }
    },
    
    // 设置自动保存间隔
    setAutoSaveInterval(seconds: number) {
      if (seconds >= 5) { // 至少5秒
        this.autoSaveInterval = seconds;
      }
    },
    
    // 启用/禁用自动保存
    setAutoSaveEnabled(enabled: boolean) {
      this.autoSaveEnabled = enabled;
    },
    
    // 清除所有保存的内容
    clearSavedContent() {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY_LAST_SAVED);
      this.lastSaved = null;
    }
  }
}); 