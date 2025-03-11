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
      console.log('设置content:', content.substring(0, 20) + '...');
      if (this.content !== content) {
        this.content = content;
        this.isDirty = true;
        console.log('内容已更新，isDirty=true');
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
      // 在保存前先确认一下要保存的内容
      console.log('准备保存内容 [内容长度]:', this.content ? this.content.length : 0);
      console.log('内容预览:', this.content ? this.content.substring(0, 50) + '...' : '空');
      
      if (!this.content || this.content.trim() === '') {
        console.warn('保存失败: 内容为空');
        return false;
      }
      
      try {
        this.isSaving = true;
        
        // 先转为字符串确保保存的内容格式正确
        const contentToSave = String(this.content);
        
        // 保存到localStorage前先检查是否可用
        try {
          localStorage.setItem('test-storage', 'test');
          localStorage.removeItem('test-storage');
        } catch (e) {
          console.error('localStorage不可用:', e);
          this.isSaving = false;
          return false;
        }
        
        // 保存内容和时间戳
        console.log(`正在保存内容到localStorage(${STORAGE_KEY})...`);
        localStorage.setItem(STORAGE_KEY, contentToSave);
        
        const saveTime = new Date();
        localStorage.setItem(STORAGE_KEY_LAST_SAVED, saveTime.toISOString());
        
        // 验证是否保存成功
        const savedContent = localStorage.getItem(STORAGE_KEY);
        if (!savedContent) {
          console.error('内容保存验证失败');
          this.isSaving = false;
          return false;
        }
        
        console.log('验证保存结果 [长度]:', savedContent.length);
        console.log('保存的内容预览:', savedContent.substring(0, 50) + '...');
        
        // 更新状态
        this.lastSaved = saveTime;
        this.isDirty = false;
        
        console.log('保存完成:', this.formattedLastSaved);
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
        console.log('从localStorage加载内容...');
        
        // 从localStorage加载内容
        const savedContent = localStorage.getItem(STORAGE_KEY);
        console.log('localStorage中的内容:', savedContent ? `获取到内容，长度${savedContent.length}` : '无内容');
        
        if (savedContent) {
          this.content = savedContent;
          
          // 加载最后保存时间
          const lastSavedStr = localStorage.getItem(STORAGE_KEY_LAST_SAVED);
          if (lastSavedStr) {
            this.lastSaved = new Date(lastSavedStr);
            console.log('最后保存时间:', this.formattedLastSaved);
          }
          
          this.isDirty = false;
          console.log('内容加载成功，已更新到store');
          return true;
        } else {
          console.log('localStorage中没有找到内容');
          return false;
        }
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