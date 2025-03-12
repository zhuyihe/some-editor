/**
 * 纸张尺寸接口
 */
export interface PaperSize {
  name: string;       // 纸张名称，如"A4"、"Letter"
  width: number;      // 宽度，单位mm
  height: number;     // 高度，单位mm
  isPortrait: boolean; // 是否纵向
}

/**
 * 常用纸张尺寸预设
 */
export const PAPER_SIZES: Record<string, PaperSize> = {
  A4: { name: 'A4', width: 210, height: 297, isPortrait: true },
  A5: { name: 'A5', width: 148, height: 210, isPortrait: true },
  B5: { name: 'B5', width: 176, height: 250, isPortrait: true },
  Letter: { name: 'Letter', width: 215.9, height: 279.4, isPortrait: true },
  Legal: { name: 'Legal', width: 215.9, height: 355.6, isPortrait: true },
  A3: { name: 'A3', width: 297, height: 420, isPortrait: true }
}; 