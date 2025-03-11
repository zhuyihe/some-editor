# 电子病历编辑器设计文档

## 目录

1. [整体架构](#1-整体架构)
2. [结构化控件设计](#2-结构化控件设计)
3. [实时分页系统](#3-实时分页系统)
4. [智能分页引擎](#4-智能分页引擎)
5. [表格分页处理](#5-表格分页处理)
6. [纸张系统](#6-纸张系统)
7. [开发路线图](#7-开发路线图)
8. [编辑器配置系统](#8-编辑器配置系统)
9. [UI设计系统](#9-UI设计系统)

## 1. 整体架构

### 1.1 技术栈

- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite
- **编辑器核心**: Tiptap 2.x
- **状态管理**: Pinia
- **UI组件库**: Element Plus / Naive UI
- **HTTP客户端**: Axios
- **CSS预处理器**: SCSS

### 1.2 系统架构

```
+--------------------------------------------------+
|                用户界面层                         |
|  +----------------+  +----------------------+    |
|  |   编辑器视图    |  |     工具栏组件       |    |
|  +----------------+  +----------------------+    |
|  +----------------+  +----------------------+    |
|  | 控件选择面板    |  |    预览/打印视图     |    |
|  +----------------+  +----------------------+    |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|                功能控制层                         |
|  +----------------+  +----------------------+    |
|  |   编辑器核心    |  |     控件管理器       |    |
|  +----------------+  +----------------------+    |
|  +----------------+  +----------------------+    |
|  |   模板系统      |  |     分页引擎         |    |
|  +----------------+  +----------------------+    |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|                数据处理层                         |
|  +----------------+  +----------------------+    |
|  |  内容存储服务   |  |      版本控制        |    |
|  +----------------+  +----------------------+    |
|  +----------------+                             |
|  |  数据转换器     |                             |
|  +----------------+                             |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|                基础设施层                         |
|  +----------------+  +----------------------+    |
|  |   API客户端    |  |     认证服务         |    |
|  +----------------+  +----------------------+    |
|  +----------------+                             |
|  |   日志系统     |                             |
|  +----------------+                             |
+--------------------------------------------------+
```

### 1.3 目录结构

```
src/
├── assets/               # 静态资源
├── components/
│   ├── Editor/           # 编辑器相关组件
│   │   ├── Core/
│   │   │   ├── Editor.vue          # 主编辑器组件
│   │   │   ├── EditorToolbar.vue   # 工具栏
│   │   │   └── EditorContent.vue   # 内容区
│   │   ├── Controls/               # 基础控件
│   │   │   ├── RadioGroup.vue      # 单选组
│   │   │   ├── Dropdown.vue        # 下拉选择
│   │   │   ├── MultiSelect.vue     # 多选下拉
│   │   │   ├── NumberInput.vue     # 数字输入
│   │   │   └── DatePicker.vue      # 日期时间选择器
│   │   ├── Pagination/             # 分页相关
│   │   │   ├── PageView.vue        # 分页视图
│   │   │   └── PrintPreview.vue    # 打印预览
│   │   └── Templates/              # 模板相关
│   │       ├── TemplateLibrary.vue # 模板库
│   │       └── TemplateEditor.vue  # 模板编辑器
│   └── common/                     # 通用UI组件
├── composables/                    # 可复用组合式函数
│   ├── useEditor.js               # 编辑器hooks
│   ├── useControls.js             # 控件hooks
│   └── usePagination.js           # 分页hooks
├── extensions/                     # Tiptap扩展
│   ├── base/                      # 基础扩展
│   ├── controls/                  # 控件扩展
│   └── pagination/                # 分页扩展
├── stores/                        # Pinia状态仓库
│   ├── editor.js                  # 编辑器状态
│   ├── controls.js                # 控件状态
│   └── pagination.js              # 分页状态
├── services/                      # API服务
├── utils/                         # 工具函数
└── views/                         # 页面视图
    ├── EditorView.vue             # 编辑器页面
    └── PrintView.vue              # 打印页面
```

## 2. 结构化控件设计

### 2.1 控件公共接口

```typescript
interface ControlProps {
  id: string;              // 控件唯一标识
  label?: string;          // 控件标签文本
  value: any;              // 控件值
  options?: Array<any>;    // 选项列表(适用于选择类控件)
  placeholder?: string;    // 占位文本
  required?: boolean;      // 是否必填
  disabled?: boolean;      // 是否禁用
  validators?: Array<Function>; // 验证函数列表
  onChange: Function;      // 值变更回调
}

interface ControlEvents {
  focus: () => void;       // 控件获取焦点
  blur: () => void;        // 控件失去焦点
  reset: () => void;       // 重置控件值
  validate: () => boolean; // 验证控件值
}
```

### 2.2 基础控件清单

1. **单选按钮组 (RadioGroup.vue)**
   - 支持水平/垂直布局
   - 支持自定义选项标签
   - 支持禁用特定选项

2. **下拉选择器 (Dropdown.vue)**
   - 支持搜索筛选
   - 支持分组选项
   - 支持自定义选项渲染

3. **多选下拉 (MultiSelect.vue)**
   - 支持标签展示已选项
   - 支持全选/清空
   - 支持选项限制数量

4. **数字输入器 (NumberInput.vue)**
   - 支持最大/最小值限制
   - 支持步长控制
   - 支持前缀/后缀单位

5. **日期/时间选择器 (DatePicker.vue)**
   - 支持日期、时间、日期时间模式
   - 支持日期范围选择
   - 支持日期格式自定义

### 2.3 Tiptap集成方案

```javascript
// 控件节点基类
const StructuredControlNode = Node.create({
  name: 'structuredControl',
  group: 'block',
  atom: true,  // 作为不可分割的整体
  
  addAttributes() {
    return {
      controlType: { default: null },
      controlId: { default: null },
      controlData: { default: {} }
    }
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-control-type]',
      }
    ]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(
      { 'data-control-type': HTMLAttributes.controlType },
      HTMLAttributes
    ), 0]
  },
  
  addNodeView() {
    return ReactiveNodeViewRenderer(ControlRenderer)
  }
})
```

## 3. 实时分页系统

### 3.1 分页模式

- **编辑模式**: 实时显示分页，连续流式编辑
- **预览模式**: 精确页面布局，显示页边距和页眉页脚
- **打印模式**: 针对打印优化的精确布局

### 3.2 分页容器组件

```vue
<!-- PagedEditor.vue 核心示例 -->
<template>
  <div class="paged-editor-container">
    <div 
      v-for="(page, index) in pages" 
      :key="index"
      class="editor-page"
      :class="{ 'current-page': currentPageIndex === index }"
      :style="getPageStyle()"
    >
      <div class="page-content" ref="pageContents">
        <slot :pageIndex="index"></slot>
      </div>
      <div class="page-footer">
        <span class="page-number">{{ index + 1 }}</span>
      </div>
    </div>
    
    <!-- 隐藏的编辑器实例，用于实际内容编辑 -->
    <div class="hidden-editor" ref="hiddenEditor">
      <slot name="editor"></slot>
    </div>
  </div>
</template>
```

### 3.3 分页控制功能

- 手动分页插入
- 页面设置调整（大小、方向、边距）
- 页眉页脚编辑
- 页面缩放控制

## 4. 智能分页引擎

### 4.1 分页引擎架构

```
+------------------------------------------+
|               分页引擎                    |
|  +----------------+  +----------------+  |
|  |   内容分析器    |  |   切割策略管理器 |  |
|  +----------------+  +----------------+  |
|  +----------------+  +----------------+  |
|  |   布局计算器    |  |   分页规则引擎   |  |
|  +----------------+  +----------------+  |
|  +----------------+  +----------------+  |
|  |   渲染适配器    |  |   分页历史管理   |  |
|  +----------------+  +----------------+  |
+------------------------------------------+
```

### 4.2 内容分析器

```typescript
interface ContentAnalyzer {
  // 分析节点类型和特性
  analyzeNode(node: Node): NodeAnalysis;
  
  // 确定节点是否可以切割
  isSplittable(node: Node): boolean;
  
  // 查找最佳切割点
  findOptimalBreakPoint(node: Node, maxHeight: number): BreakPoint | null;
  
  // 计算节点高度
  calculateNodeHeight(node: Node): number;
}
```

### 4.3 切割策略管理器

```typescript
interface SplittingStrategy {
  // 判断是否适用于当前节点
  canHandle(node: Node, analysis: NodeAnalysis): boolean;
  
  // 执行切割操作
  split(node: Node, breakPoint: BreakPoint): SplitResult;
}
```

## 5. 表格分页处理

### 5.1 表头重复配置

```typescript
interface TablePaginationOptions {
  // 控制分页后是否重复表头
  repeatHeader: 'always' | 'never' | 'auto';
  
  // 识别哪些行是表头（可以是多行表头）
  headerRows: 'first-row' | 'th-elements' | number[];
  
  // 续表标记文本和位置
  continuationText: string;
  continuationPosition: 'caption' | 'first-cell' | 'none';
}
```

### 5.2 单元格切割策略

```typescript
interface CellSplittingStrategy {
  // 单元格分页模式
  mode: 'never' | 'row-boundaries' | 'content-split';
  
  // 允许的最小剩余空间比例，低于此值将整行移到下一页
  minRemainingSpace: number;
  
  // 自动处理大尺寸单元格
  handleLargeCells: boolean;
}
```

### 5.3 表格分页处理流程

1. 获取表格分页配置选项
2. 确定表头行
3. 找到最佳切割点
4. 根据配置处理表头重复
5. 添加续表标记
6. 处理跨行单元格
7. 处理单元格内容切割（如果需要）

### 5.4 表格设置界面

提供用户友好的界面允许配置：
- 表头重复行为
- 单元格切割策略
- 续表标记文本和位置

## 6. 纸张系统

### 6.1 纸张尺寸定义

```typescript
interface PaperSize {
  name: string;       // 纸张名称，如"A4"、"Letter"
  width: number;      // 宽度，单位mm
  height: number;     // 高度，单位mm
  isPortrait: boolean; // 是否纵向
}

// 常用纸张尺寸
const PaperSizes = {
  A4: { name: 'A4', width: 210, height: 297, isPortrait: true },
  Letter: { name: 'Letter', width: 215.9, height: 279.4, isPortrait: true },
  Legal: { name: 'Legal', width: 215.9, height: 355.6, isPortrait: true },
  // 更多纸张尺寸...
}
```

### 6.2 页面设置

```typescript
interface PageSettings {
  paperSize: PaperSize;
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  headerHeight: number;
  footerHeight: number;
}
```

### 6.3 页面布局控制

```vue
<!-- PageSettings.vue 组件示例 -->
<template>
  <div class="page-settings-panel">
    <h3>页面设置</h3>
    
    <div class="form-group">
      <label>纸张大小:</label>
      <select v-model="settings.paperSize">
        <option v-for="paper in availablePaperSizes" :key="paper.name" :value="paper">
          {{ paper.name }} ({{ paper.width }}mm × {{ paper.height }}mm)
        </option>
      </select>
    </div>
    
    <div class="form-group">
      <label>方向:</label>
      <div class="radio-buttons">
        <label>
          <input type="radio" v-model="settings.orientation" value="portrait">
          纵向
        </label>
        <label>
          <input type="radio" v-model="settings.orientation" value="landscape">
          横向
        </label>
      </div>
    </div>
    
    <div class="form-group">
      <label>页边距 (mm):</label>
      <div class="margins-inputs">
        <div>
          <label>上:</label>
          <input type="number" v-model.number="settings.margins.top" min="0">
        </div>
        <div>
          <label>右:</label>
          <input type="number" v-model.number="settings.margins.right" min="0">
        </div>
        <div>
          <label>下:</label>
          <input type="number" v-model.number="settings.margins.bottom" min="0">
        </div>
        <div>
          <label>左:</label>
          <input type="number" v-model.number="settings.margins.left" min="0">
        </div>
      </div>
    </div>
    
    <div class="form-group">
      <button @click="applySettings">应用</button>
      <button @click="resetToDefaults">重置</button>
    </div>
  </div>
</template>
```

### 6.4 页眉页脚编辑

- 支持文本、日期、页码变量
- 支持多种对齐方式
- 支持添加徽标/图片
- 支持首页不同的页眉页脚

### 6.5 打印样式控制

```css
/* 打印样式示例 */
@media print {
  .page {
    page-break-after: always;
    padding: 0;
    margin: 0;
  }
  
  .page:last-child {
    page-break-after: avoid;
  }
  
  .editor-toolbar, .control-handles, .non-printable {
    display: none !important;
  }
  
  /* 表格分页控制 */
  table {
    page-break-inside: avoid;
  }
  
  /* 标题分页控制 */
  h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
  }
}
```

## 7. 开发路线图

### 7.1 第一阶段 - 核心功能

- Tiptap编辑器基础设置
- 基本文本格式化功能
- 项目结构和基础UI组件

### 7.2 第二阶段 - 结构化控件

- 五种基础控件实现
- Tiptap控件集成
- 控件数据绑定系统

### 7.3 第三阶段 - 分页功能

- 实时分页引擎基础实现
- 页面设置功能
- 手动分页控制

### 7.4 第四阶段 - 表格和复杂分页

- 表格分页处理
- 智能切割算法
- 复杂内容分页优化

### 7.5 第五阶段 - 打印和纸张系统

- 完整纸张系统
- 页眉页脚编辑器
- 打印优化功能

### 7.6 第六阶段 - 优化和集成

- 性能优化
- 导入/导出功能
- 第三方系统集成

## 8. 编辑器配置系统

### 8.1 配置系统概述

编辑器配置系统旨在提供灵活的功能定制能力，使编辑器能够适应不同科室、不同角色的医疗记录编辑需求。通过可视化配置界面，用户可以启用或禁用特定功能，调整界面布局，设置编辑规则，以及保存个人偏好设置。

配置系统的核心目标包括：
- 提供功能模块的动态启用与禁用
- 支持界面元素的自定义显示
- 允许编辑规则的灵活配置
- 保存和恢复用户偏好设置
- 支持配置预设的管理和共享

### 8.2 配置系统架构

配置系统采用分层设计，确保各组件职责清晰，便于维护和扩展。

```
+--------------------------------------------------+
|                 配置数据层                        |
|  +----------------+  +----------------------+    |
|  |  配置状态存储   |  |     配置数据模型      |    |
|  +----------------+  +----------------------+    |
|  +----------------+  +----------------------+    |
|  |  配置预设管理   |  |     持久化服务        |    |
|  +----------------+  +----------------------+    |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|                 配置服务层                        |
|  +----------------+  +----------------------+    |
|  |  配置管理器     |  |     配置验证器        |    |
|  +----------------+  +----------------------+    |
|  +----------------+  +----------------------+    |
|  |  配置观察者     |  |     配置转换器        |    |
|  +----------------+  +----------------------+    |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|                 配置界面层                        |
|  +----------------+  +----------------------+    |
|  |  配置面板组件   |  |     功能配置组件      |    |
|  +----------------+  +----------------------+    |
|  +----------------+  +----------------------+    |
|  |  界面配置组件   |  |     预设管理组件      |    |
|  +----------------+  +----------------------+    |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|                 集成应用层                        |
|  +----------------+  +----------------------+    |
|  |  编辑器适配器   |  |     扩展管理器        |    |
|  +----------------+  +----------------------+    |
|  +----------------+                             |
|  |  工具栏适配器   |                             |
|  +----------------+                             |
+--------------------------------------------------+
```

#### 8.2.1 配置数据层

- **配置状态存储**：使用Pinia管理配置状态，提供响应式数据访问
- **配置数据模型**：定义配置数据结构和类型
- **配置预设管理**：处理配置预设的保存、加载和删除
- **持久化服务**：负责将配置保存到localStorage或远程服务器

#### 8.2.2 配置服务层

- **配置管理器**：提供配置读写的统一接口
- **配置验证器**：验证配置数据的有效性
- **配置观察者**：监听配置变化并触发相应动作
- **配置转换器**：在不同配置格式间进行转换

#### 8.2.3 配置界面层

- **配置面板组件**：主配置界面，整合各类配置选项
- **功能配置组件**：控制编辑器功能的启用/禁用
- **界面配置组件**：调整界面元素的显示和布局
- **预设管理组件**：管理配置预设的保存和加载

#### 8.2.4 集成应用层

- **编辑器适配器**：将配置应用到编辑器实例
- **扩展管理器**：根据配置动态加载/卸载编辑器扩展
- **工具栏适配器**：根据配置调整工具栏显示

### 8.3 配置数据结构

配置系统的核心数据模型如下：

```typescript
export interface EditorConfig {
  // 功能模块配置
  features: {
    textFormatting: boolean;     // 文本格式化工具
    paragraphStyles: boolean;    // 段落格式工具
    lists: boolean;              // 列表功能
    tables: boolean;             // 表格功能
    images: boolean;             // 图片功能
    floatingMenu: boolean;       // 浮动菜单
    addContentButton: boolean;   // 内容添加按钮
    medicalControls: boolean;    // 医疗专用控件
  };
  
  // 界面配置
  ui: {
    showToolbar: boolean;        // 显示工具栏
    showStatusBar: boolean;      // 显示状态栏
    showSidebar: boolean;        // 显示侧边栏
    toolbarGroups: string[];     // 工具栏分组显示
    theme: 'light' | 'dark';     // 主题
  };
  
  // 编辑规则
  editRules: {
    enforceStructure: boolean;   // 强制内容结构
    termCheck: boolean;          // 医疗术语检查
    autoFormat: boolean;         // 自动格式化
    spellCheck: boolean;         // 拼写检查
  };
  
  // 用户偏好
  preferences: {
    fontSize: string;            // 默认字号
    fontFamily: string;          // 默认字体
    lineHeight: number;          // 行高
    autoSaveInterval: number;    // 自动保存间隔(秒)
    defaultParagraphSeparator: 'p' | 'div'; // 段落分隔符
  };
}
```

### 8.4 配置管理与存储

配置系统使用Pinia状态管理库实现状态管理，提供以下核心功能：

1. **配置读写**：通过ConfigStore提供统一的配置读写接口
2. **配置持久化**：使用localStorage保存用户配置
3. **配置预设**：支持保存和加载常用配置组合
4. **默认值处理**：为所有配置项提供合理默认值

```typescript
// 配置存储的核心实现
export const useConfigStore = defineStore('config', {
  state: () => ({
    config: { ...defaultConfig } as EditorConfig,
    presets: {} as Record<string, EditorConfig>,
  }),
  
  actions: {
    // 更新配置
    updateConfig(newConfig: Partial<EditorConfig>) {
      this.config = { ...this.config, ...newConfig };
      this.saveConfig();
    },
    
    // 更新特定配置节点
    updateConfigNode(path: string, value: any) {
      const parts = path.split('.');
      let current = this.config;
      
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      
      current[parts[parts.length - 1]] = value;
      this.saveConfig();
    },
    
    // 重置为默认配置
    resetToDefault() {
      this.config = { ...defaultConfig };
      this.saveConfig();
    },
    
    // 保存配置到本地存储
    saveConfig() {
      localStorage.setItem('emr-editor-config', JSON.stringify(this.config));
    },
    
    // 从本地存储加载配置
    loadConfig() {
      const saved = localStorage.getItem('emr-editor-config');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.config = { ...defaultConfig, ...parsed };
        } catch (e) {
          console.error('Failed to parse saved config', e);
        }
      }
    },
    
    // 保存当前配置为预设
    saveAsPreset(presetName: string) {
      this.presets[presetName] = { ...this.config };
      localStorage.setItem('emr-editor-presets', JSON.stringify(this.presets));
    },
    
    // 加载预设
    loadPreset(presetName: string) {
      if (this.presets[presetName]) {
        this.config = { ...this.presets[presetName] };
        this.saveConfig();
      }
    },
  },
  
  getters: {
    // 检查特定功能是否启用
    isFeatureEnabled: (state) => (feature: keyof EditorConfig['features']) => {
      return state.config.features[feature];
    },
    
    // 获取活动的工具栏组
    activeToolbarGroups: (state) => {
      return state.config.ui.toolbarGroups;
    },
  },
});
```

### 8.5 配置界面组件

配置系统的用户界面由以下主要组件构成：

1. **EditorConfigPanel**：主配置面板，整合所有配置分类
2. **FeaturesConfig**：功能模块配置组件，控制编辑器功能的启用/禁用
3. **UIConfig**：界面配置组件，控制界面元素的显示和主题
4. **RulesConfig**：编辑规则配置组件，控制内容验证和格式化规则
5. **PreferencesConfig**：用户偏好设置组件，控制默认样式和行为
6. **PresetsManager**：预设管理组件，允许保存和加载配置组合

```
+----------------------+
|  配置面板            |
|  +----------------+  |
|  | 功能 | 界面 | 规则 | 偏好 | 预设 |
|  +----------------+  |
|                      |
|  +-----------------+ |
|  | 功能模块配置内容  | |
|  |                 | |
|  | [ ] 文本格式工具  | |
|  | [ ] 段落样式工具  | |
|  | [ ] 列表功能     | |
|  | [ ] 表格功能     | |
|  |                 | |
|  +-----------------+ |
|                      |
|  重置默认设置  应用更改 |
+----------------------+
```

### 8.6 配置应用机制

编辑器配置系统通过以下机制将配置应用到编辑器实例：

1. **配置观察者模式**：监听配置变化，自动触发编辑器更新
2. **编辑器扩展动态加载**：根据配置启用/禁用特定编辑器扩展
3. **界面元素条件渲染**：基于配置状态条件性渲染UI组件
4. **CSS变量注入**：通过CSS变量实现主题和样式配置

```typescript
// 配置观察者的核心实现
export function useEditorConfig(editor: Editor | null) {
  const configStore = useConfigStore();
  
  // 监听配置变化
  watch(() => configStore.config, () => {
    if (editor) {
      applyEditorConfig(editor);
    }
  }, { deep: true });
  
  // 应用配置到编辑器
  const applyEditorConfig = (editor: Editor) => {
    const config = configStore.config;
    
    // 应用样式设置
    document.documentElement.style.setProperty('--editor-font-size', config.preferences.fontSize);
    
    // 应用主题
    if (config.ui.theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    
    // 更新编辑器选项
    editor.setOptions({
      editorProps: {
        attributes: {
          class: `font-${config.preferences.fontFamily.replace(/\s+/g, '-').toLowerCase()}`
        }
      }
    });
  };
  
  return {
    applyEditorConfig
  };
}
```

### 8.7 配置预设功能

配置预设功能允许用户保存和加载常用的配置组合，满足不同使用场景的需求：

1. **科室预设**：针对不同科室的特定需求定制配置
2. **岗位预设**：针对不同岗位职责优化的配置组合
3. **个人预设**：满足个人使用习惯的配置集合

预设系统支持的操作包括：
- 保存当前配置为命名预设
- 加载已保存的预设
- 删除不需要的预设
- 导出和导入预设（用于配置共享）

### 8.8 集成与扩展性

配置系统设计为高度可扩展的架构，支持：

1. **新功能模块集成**：系统架构支持后期添加新的配置类别和选项
2. **远程配置同步**：预留与远程服务器同步配置的接口
3. **权限管理集成**：配置系统可与权限管理系统对接，基于用户角色应用不同配置
4. **分级配置策略**：支持系统级、组织级、用户级的配置层级结构

### 8.9 实现路径

配置系统的实现将分为以下阶段：

1. **基础配置框架**：
   - 创建配置数据模型
   - 实现Pinia状态存储
   - 开发基本持久化功能

2. **配置界面开发**：
   - 设计并实现配置面板UI
   - 创建各类配置组件
   - 实现预设管理界面

3. **编辑器集成**：
   - 开发配置观察者机制
   - 实现动态扩展加载
   - 集成CSS变量系统

4. **高级功能**：
   - 添加配置导入/导出
   - 实现远程配置同步
   - 开发权限集成接口

## 9. UI设计系统

### 9.1 整体UI架构设计

#### 9.1.1 布局结构

```
+-------------------------------------------------------------+
| 品牌Logo  文件 编辑 视图 插入 格式 工具 帮助        用户信息 |  <- 主菜单栏
+-------------------------------------------------------------+
|                      工具栏（分组式）                       |  <- 功能工具栏
+-------------------------------------------------------------+
| +-------------+  +-----------------------------------+       |
| |             |  |                                   |       |
| | 侧边导航栏   |  |           编辑区域                |       |
| | - 大纲      |  |        (类纸张样式设计)            |       |
| | - 模板      |  |                                   |       |
| | - 控件      |  |                                   |       |
| | - 历史记录  |  |                                   |       |
| |             |  |                                   |       |
| +-------------+  +-----------------------------------+       |
|                                                             |
| 底部状态栏: 字数统计 | 页码 | 缩放比例 | 编辑状态          |  <- 状态栏
+-------------------------------------------------------------+
```

#### 9.1.2 色彩方案

专业医疗风格的色彩系统:

```
主色调：#3A7BD5（专业蓝）
辅助色：#00A389（医疗绿）
中性色：
  - 背景：#F5F7FA
  - 纸张：#FFFFFF
  - 文本：#2C3E50
  - 边框：#E4E7ED
强调色：
  - 警示：#E74C3C
  - 成功：#2ECC71
```

#### 9.1.3 响应式设计考虑

- **大屏幕（>1440px）**：显示完整功能集，侧边栏常驻显示，多列工具栏布局
- **中等屏幕（768px-1440px）**：折叠部分高级功能，可收起的侧边栏，单行工具栏
- **小屏幕（<768px）**：关键功能优先显示，侧边栏转为抽屉式菜单，工具栏分页显示

### 9.2 组件设计规范

#### 9.2.1 工具栏设计

```typescript
interface ToolbarGroup {
  id: string;           // 组唯一标识
  title: string;        // 组标题
  tools: ToolbarItem[]; // 包含的工具
  visible: boolean;     // 是否可见
  priority: number;     // 优先级（用于响应式）
}

interface ToolbarItem {
  id: string;           // 工具唯一标识
  icon: string;         // 图标
  title: string;        // 工具提示
  action: Function;     // 点击操作
  isActive: Function;   // 激活状态判断
  disabled: boolean;    // 是否禁用
  type: 'button' | 'dropdown' | 'color' | 'custom'; // 工具类型
}
```

**标准工具栏分组**:

1. **文本格式组**
   - 加粗、斜体、下划线、删除线
   - 字体选择、字号调整
   - 文字颜色、背景色

2. **段落格式组**
   - 标题样式 (H1-H6)
   - 对齐方式
   - 行间距、段落间距

3. **插入功能组**
   - 表格、图片、链接
   - 分页符

4. **列表功能组**
   - 有序列表、无序列表
   - 缩进增减

5. **控件功能组**
   - 医疗专用控件
   - 表单元素

**工具栏视觉样式**:
- 扁平化图标，轻微阴影
- 悬停时显示微妙的背景色变化
- 激活状态使用主色调高亮
- 分组之间使用细线分隔

#### 9.2.2 纸张编辑区设计

**纸张容器样式**:
```scss
.editor-paper-container {
  background: var(--background-color);
  padding: 30px;
  min-height: calc(100vh - 180px);
  display: flex;
  justify-content: center;
  overflow: auto;
}

.editor-paper {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: var(--paper-width);
  min-height: var(--paper-height);
  padding: var(--paper-padding);
  margin: 0 auto;
  border-radius: 2px;
  transition: all 0.3s ease;
}
```

**编辑区视觉特性**:
- 真实纸张外观，带有微妙阴影
- 内容区域留有充足白边
- 编辑时光标位置平滑滚动
- 页面边缘显示微妙的页码指示

#### 9.2.3 侧边栏设计

**侧边栏组件结构**:
```vue
<template>
  <div class="editor-sidebar" :class="{ 'collapsed': isCollapsed }">
    <div class="sidebar-toggle" @click="toggleSidebar">
      <el-icon><ArrowLeft v-if="!isCollapsed" /><ArrowRight v-else /></el-icon>
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
          <el-icon><component :is="tab.icon" /></el-icon>
          <span v-if="!isCollapsed">{{ tab.title }}</span>
        </div>
      </div>
      
      <div class="tab-content">
        <component :is="currentTabComponent" />
      </div>
    </div>
  </div>
</template>
```

**侧边栏标准选项卡**:
1. 大纲视图
2. 模板库
3. 控件面板
4. 页面设置
5. 历史记录

### 9.3 控件UI设计

#### 9.3.1 控件通用视觉风格

- 圆角边框 (4px)
- 轻微阴影 (0 2px 4px rgba(0,0,0,0.1))
- 统一的标签位置与样式
- 交互状态清晰的视觉反馈
- 错误状态醒目但不刺眼

#### 9.3.2 各类控件样式规范

1. **单选按钮组**
   ```scss
   .emr-radio-group {
     border: 1px solid var(--border-color-light);
     border-radius: 4px;
     padding: 8px 12px;
     
     .emr-radio-label {
       font-weight: 500;
       margin-bottom: 8px;
       color: var(--text-color-primary);
     }
     
     .emr-radio-options {
       display: flex;
       flex-direction: column;
       gap: 8px;
       
       &.horizontal {
         flex-direction: row;
         flex-wrap: wrap;
       }
     }
   }
   ```

2. **下拉选择器**
   ```scss
   .emr-dropdown {
     border: 1px solid var(--border-color-light);
     border-radius: 4px;
     padding: 8px 12px;
     
     .emr-dropdown-trigger {
       cursor: pointer;
       padding: 6px 10px;
       border: 1px solid var(--border-color-base);
       border-radius: 4px;
       display: flex;
       justify-content: space-between;
       align-items: center;
       
       &:hover {
         border-color: var(--primary-color);
       }
     }
   }
   ```

3. **日期选择器**、**数字输入框**等其他控件同样遵循统一的设计语言

### 9.4 主题与自定义

#### 9.4.1 主题系统

使用CSS变量实现的可切换主题系统:

```scss
:root {
  // 浅色主题（默认）
  --primary-color: #3A7BD5;
  --secondary-color: #00A389;
  --background-color: #F5F7FA;
  --paper-color: #FFFFFF;
  --text-color-primary: #2C3E50;
  --text-color-secondary: #7F8C8D;
  --border-color-base: #DCDFE6;
  --border-color-light: #E4E7ED;
  
  // 其他变量...
}

[data-theme="dark"] {
  // 深色主题
  --primary-color: #4B8CF5;
  --secondary-color: #10B99B;
  --background-color: #1E1E1E;
  --paper-color: #2D2D2D;
  --text-color-primary: #F5F5F5;
  --text-color-secondary: #BDBDBD;
  --border-color-base: #424242;
  --border-color-light: #616161;
  
  // 其他变量...
}
```

#### 9.4.2 自定义选项

提供以下用户自定义选项:

- 字体大小调整
- 行高调整
- 页边距调整
- 工具栏布局定制
- 快捷键定制

### 9.5 交互与动效设计

#### 9.5.1 微交互

- 按钮点击波纹效果
- 工具提示平滑弹出
- 面板展开/折叠动画
- 状态变化过渡效果

#### 9.5.2 页面过渡

- 页面切换时的淡入淡出效果
- 加载状态的进度指示
- 模态框的缩放进入效果

### 9.6 辅助功能设计

- 键盘导航支持
- 高对比度模式
- 屏幕阅读器兼容性
- 可调整字体大小
- 快捷键提示系统

### 9.7 实施与集成计划

UI系统将按以下步骤实施:

1. 创建基础UI组件库和样式系统
2. 实现核心布局结构和工具栏
3. 设计并实现纸张编辑区
4. 开发侧边栏组件和各功能面板
5. 实现控件库的UI部分
6. 添加主题和自定义功能
7. 优化响应式布局和移动适配
8. 完善交互动效和微动画
9. 进行可用性测试和优化

### 9.8 UI组件目录结构

```
src/
├── components/
│   ├── UI/                     // 通用UI组件
│   │   ├── Button/
│   │   ├── Dropdown/
│   │   ├── Modal/
│   │   └── ...
│   ├── Editor/
│   │   ├── Layout/             // 布局组件
│   │   │   ├── EditorLayout.vue
│   │   │   ├── EditorHeader.vue
│   │   │   ├── EditorSidebar.vue
│   │   │   └── EditorFooter.vue
│   │   ├── Toolbar/            // 工具栏组件
│   │   │   ├── EditorToolbar.vue
│   │   │   └── ... (工具栏分组)
│   │   ├── Sidebar/            // 侧边栏面板
│   │   │   ├── OutlinePanel.vue
│   │   │   ├── TemplatesPanel.vue
│   │   │   └── ...
│   │   └── Paper/              // 纸张相关
│   │       ├── PaperContainer.vue
│   │       └── PageIndicator.vue
├── assets/
│   ├── styles/
│   │   ├── theme/              // 主题系统
│   │   │   ├── variables.scss
│   │   │   ├── light-theme.scss
│   │   │   └── dark-theme.scss
│   │   ├── components/          // 组件样式
│   │   │   ├── toolbar.scss
│   │   │   ├── sidebar.scss
│   │   │   └── ...
│   │   └── base.scss           // 基础样式
│   └── icons/                  // 图标资源
```

这套UI设计系统将确保电子病历编辑器具有现代、专业和一致的用户界面，提供良好的用户体验和易用性，同时保持与医疗领域的专业性相符合。
