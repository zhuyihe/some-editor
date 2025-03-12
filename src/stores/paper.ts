import { defineStore } from 'pinia';
import type { PaperSize } from '../types/paper';
import { PAPER_SIZES } from '../types/paper';

/**
 * 纸张设置状态接口
 */
export interface PaperState {
  // 当前纸张尺寸
  currentPaperSize: PaperSize;
  // 页面方向: portrait(纵向), landscape(横向)
  orientation: 'portrait' | 'landscape';
  // 页边距（单位: mm）
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  // 页眉设置
  headerSettings: {
    enabled: boolean;
    height: number;
    content: string;
    showOnFirstPage: boolean;
  };
  // 页脚设置
  footerSettings: {
    enabled: boolean;
    height: number;
    content: string;
    showOnFirstPage: boolean;
  };
  // 自定义纸张尺寸
  customPaperSizes: Record<string, PaperSize>;
  // 设置面板是否打开
  isSettingsOpen: boolean;
}

/**
 * 纸张设置状态存储
 */
export const usePaperStore = defineStore('paper', {
  state: (): PaperState => ({
    currentPaperSize: PAPER_SIZES.A4,
    orientation: 'portrait',
    margins: {
      top: 25,
      right: 20,
      bottom: 25,
      left: 20
    },
    headerSettings: {
      enabled: false,
      height: 15,
      content: '',
      showOnFirstPage: true
    },
    footerSettings: {
      enabled: false,
      height: 15,
      content: '<div style="text-align: center">第 {{pageNumber}} 页 / 共 {{pageCount}} 页</div>',
      showOnFirstPage: true
    },
    customPaperSizes: {},
    isSettingsOpen: false
  }),
  
  getters: {
    // 计算有效宽度（考虑当前方向）
    effectiveWidth(): number {
      return this.orientation === 'portrait' 
        ? this.currentPaperSize.width 
        : this.currentPaperSize.height;
    },
    
    // 计算有效高度（考虑当前方向）
    effectiveHeight(): number {
      return this.orientation === 'portrait' 
        ? this.currentPaperSize.height 
        : this.currentPaperSize.width;
    },
    
    // 计算内容区域尺寸
    contentDimensions(): { width: number; height: number } {
      let totalHeight = this.effectiveHeight;
      
      // 减去上下边距
      totalHeight -= (this.margins.top + this.margins.bottom);
      
      // 如果启用了页眉，减去页眉高度
      if (this.headerSettings.enabled) {
        totalHeight -= this.headerSettings.height;
      }
      
      // 如果启用了页脚，减去页脚高度
      if (this.footerSettings.enabled) {
        totalHeight -= this.footerSettings.height;
      }
      
      return {
        width: this.effectiveWidth - this.margins.left - this.margins.right,
        height: totalHeight
      };
    },
    
    // 获取所有可用纸张尺寸（包括自定义尺寸）
    availablePaperSizes(): Record<string, PaperSize> {
      return { ...PAPER_SIZES, ...this.customPaperSizes };
    }
  },
  
  actions: {
    // 设置纸张尺寸
    setPaperSize(paperSizeKey: string) {
      const paperSize = this.availablePaperSizes[paperSizeKey];
      if (paperSize) {
        this.currentPaperSize = paperSize;
      }
    },
    
    // 切换页面方向
    toggleOrientation() {
      this.orientation = this.orientation === 'portrait' ? 'landscape' : 'portrait';
    },
    
    // 设置页面方向
    setOrientation(orientation: 'portrait' | 'landscape') {
      this.orientation = orientation;
    },
    
    // 设置页边距
    setMargins(margins: Partial<PaperState['margins']>) {
      this.margins = { ...this.margins, ...margins };
    },
    
    // 添加自定义纸张尺寸
    addCustomPaperSize(paperSize: PaperSize) {
      const safeName = paperSize.name.trim() || `自定义 ${Object.keys(this.customPaperSizes).length + 1}`;
      this.customPaperSizes[safeName] = { ...paperSize, name: safeName };
    },
    
    // 删除自定义纸张尺寸
    removeCustomPaperSize(name: string) {
      if (this.customPaperSizes[name]) {
        const newCustomSizes = { ...this.customPaperSizes };
        delete newCustomSizes[name];
        this.customPaperSizes = newCustomSizes;
      }
    },
    
    // 更新页眉设置
    updateHeaderSettings(settings: Partial<PaperState['headerSettings']>) {
      this.headerSettings = { ...this.headerSettings, ...settings };
    },
    
    // 更新页脚设置
    updateFooterSettings(settings: Partial<PaperState['footerSettings']>) {
      this.footerSettings = { ...this.footerSettings, ...settings };
    },
    
    // 应用预设边距
    applyMarginsPreset(preset: 'normal' | 'narrow' | 'wide') {
      switch (preset) {
        case 'normal':
          this.margins = { top: 25, right: 20, bottom: 25, left: 20 };
          break;
        case 'narrow':
          this.margins = { top: 12.7, right: 12.7, bottom: 12.7, left: 12.7 };
          break;
        case 'wide':
          this.margins = { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 };
          break;
      }
    },
    
    // 设置面板打开状态
    setSettingsOpen(isOpen: boolean) {
      this.isSettingsOpen = isOpen;
    }
  }
}); 