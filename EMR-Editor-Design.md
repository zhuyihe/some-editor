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

### 1.7 智能内容编辑交互

#### 1.7.1 加号按钮设计

加号按钮（Add Content Button）作为编辑器的核心交互元素，提供了主要的内容插入入口：

1. **定位策略**:
   - 按钮出现在当前光标所在文本块的左侧
   - 采用精确定位算法，确保按钮与文本块顶部垂直对齐
   - 考虑纸张左侧边距，确保按钮位置一致

2. **交互设计**:
   - 当鼠标悬停时，按钮呈现轻微放大和颜色变化效果，提供视觉反馈
   - 点击按钮显示浮动菜单，点击页面其他区域关闭菜单
   - 有状态交互：按钮在菜单打开时保持可见

3. **样式设计**:
   - 简约圆形设计，采用低调的默认样式（轻灰色边框、白色背景）
   - 适度的阴影效果，增强层次感但不过分夺目
   - 鼠标悬停状态转为品牌色（蓝色），增强可点击感知

4. **技术实现**:
   ```javascript
   // 定位算法核心
   const updateCursorPosition = () => {
     // 获取当前块级节点
     const node = getCurrentNode();
     if (!node) {
       cursorVisible.value = false;
       return;
     }
     
     // 计算节点位置
     const rect = node.getBoundingClientRect();
     const containerRect = editorContainerRef.value.getBoundingClientRect();
     
     // 获取左侧边距
     const contentElement = document.querySelector('.emr-editor-content');
     const computedStyle = window.getComputedStyle(contentElement);
     const leftPadding = parseInt(computedStyle.paddingLeft) || 0;
     
     // 设置按钮位置 - 与节点顶部对齐，考虑边距
     cursorPosition.value.top = rect.top - containerRect.top + 5;
     cursorPosition.value.left = rect.left - containerRect.left - 30 + leftPadding;
     
     cursorVisible.value = true;
   };
   ```

#### 1.7.2 浮动菜单系统

浮动菜单提供了丰富的内容插入和格式转换功能，是编辑器智能交互的核心部分：

1. **菜单架构**:
   - 采用数据驱动的菜单配置系统，支持灵活的菜单项组织
   - 分层设计：顶部AI助手区域、内容插入区域、节点类型转换区域
   - 完善的TypeScript接口定义，确保类型安全

   ```typescript
   interface MenuItem {
     label: string;           // 菜单项标签
     icon: string[] | string; // 菜单图标
     action: string;          // 操作标识符
     shortcut?: string;       // 快捷键提示
     hasSubmenu?: boolean;    // 是否有子菜单
   }

   interface MenuSection {
     title: string;           // 区域标题
     items: MenuItem[];       // 菜单项列表
   }
   ```

2. **菜单配置示例**:
   ```javascript
   const menuConfig = [
     {
       title: '插入新内容',
       items: [
         { label: '插入段落', icon: ['fas', 'align-left'], action: 'paragraph' },
         { label: '插入章节', icon: ['fas', 'file-alt'], action: 'section', hasSubmenu: true },
         { label: '插入模板', icon: ['fas', 'file-alt'], action: 'template', hasSubmenu: true }
       ]
     },
     {
       title: '切换节点类型',
       items: [
         { label: '标题 1', icon: ['fas', 'heading'], action: 'h1', shortcut: 'Ctrl+Alt+1' },
         { label: '标题 2', icon: ['fas', 'heading'], action: 'h2', shortcut: 'Ctrl+Alt+2' }
         // ... 更多菜单项
       ]
     }
   ];
   ```

3. **视觉设计**:
   - 清晰的视觉层次：区域标题使用小型大写文本，项目使用标准字体
   - 一致的内边距与对齐，确保整体视觉协调
   - 悬停状态提供明确的视觉反馈
   - 包含菜单箭头指示器，指向触发按钮，增强方向感知

4. **交互逻辑**:
   - 基于上下文的菜单项控制，支持根据编辑器状态显示/隐藏特定选项
   - 支持快捷键提示，增强高级用户体验
   - AI助手区域支持点击触发，提供智能编辑辅助功能
   - 菜单项点击后自动关闭菜单，保持流畅的编辑体验

5. **内容插入实现**:
   ```javascript
   const insertContent = (type) => {
     // 根据不同类型执行相应插入操作
     switch (type) {
       case 'paragraph':
         editor.chain().focus().setParagraph().run();
         break;
       case 'section':
         editor.chain().focus().setParagraph().run();
         editor.chain().focus().insertContent('<p>新的章节内容</p>').run();
         break;
       // ... 更多内容类型处理
     }
     
     // 执行后关闭菜单，保持流畅体验
     emit('close-menu');
   };
   ```

#### 1.7.3 扩展性设计

智能内容交互系统设计了良好的扩展架构，支持后续功能迭代：

1. **菜单配置外部化**:
   - 支持将菜单配置移至独立文件，便于管理和扩展
   - 可扩展为支持动态加载菜单配置，实现插件化菜单系统

2. **子菜单扩展**:
   - 现有架构支持添加多级子菜单，可用于章节模板、结构化控件等
   - 保留了子菜单状态管理系统，确保多级菜单交互流畅

3. **AI助手集成**:
   - 保留AI助手专用区域，设计为可扩展式入口
   - 点击触发事件支持进一步对接智能助手系统
   - 可扩展为上下文感知的智能提示系统

4. **自定义操作框架**:
   - 菜单操作采用类型驱动设计，便于添加自定义操作类型
   - 支持后续集成控件系统，实现结构化内容的插入

这套智能内容编辑交互系统为编辑器提供了直观、高效的内容管理方式，同时保持了良好的可扩展性，为后续功能迭代奠定了基础。

## 2. 结构化控件设计

### 2.1 控件公共接口

```typescript
interface ControlProps {
  id: string;              // 控件唯一标识
  type: string;            // 控件类型
  label?: string;          // 控件标签文本
  value: any;              // 控件值
  options?: Array<any>;    // 选项列表(适用于选择类控件)
  placeholder?: string;    // 占位文本
  required?: boolean;      // 是否必填
  disabled?: boolean;      // 是否禁用
  removable: boolean;      // 是否可删除
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

### 2.3 控件视觉呈现

控件在编辑器中的视觉呈现采用清晰明确的设计：

1. **边框与区分**:
   - 控件始终显示边框，使用轻微但可见的边框（如浅灰色1px实线）与普通文本明确区分
   - 使用浅色背景（如淡蓝色或浅灰色）进一步强化视觉区分
   - 不同类型的控件可以有轻微的视觉差异，提高可识别性

2. **状态反馈**:
   - 悬停时边框颜色加深或背景色变化，提供交互反馈
   - 选中状态使用更明显的边框（如蓝色2px实线）
   - 错误状态使用红色边框进行提示
   - 必填控件在标签后显示星号标识

3. **视觉层次**:
   - 控件整体采用内联式设计，作为文档流的一部分
   - 控件标签与控件内容清晰区分
   - 控件整体视觉重量适中，不喧宾夺主

示例视觉呈现:
```
+-------------------------------------------+
| 标签: [控件内容区域]                      |
+-------------------------------------------+
```

### 2.4 控件交互方式

控件采用与编辑器一致的交互模式：

1. **基于光标的交互**:
   - 通过浮动菜单或工具栏命令在光标位置插入控件
   - 将光标放置在控件上会自动选中整个控件
   - 单击进入控件，可直接编辑内容（如在下拉框中选择选项）

2. **键盘操作**:
   - 选中控件后按Delete或Backspace键删除（对于可删除控件）
   - 不可删除的控件会在按删除键时显示提示
   - Tab键可在控件之间和控件内容区域间导航
   - 方向键可在控件内部移动（如单选项间移动）

3. **数据操作**:
   - 控件值变更自动触发文档更新
   - 支持数据的实时验证和即时反馈
   - 控件数据作为文档结构的一部分进行保存和加载

### 2.5 Tiptap集成方案

```javascript
// 控件节点基类
const ControlNode = Node.create({
  name: 'control',
  group: 'block',
  atom: true,  // 作为不可分割的整体
  
  addAttributes() {
    return {
      id: { default: null },
      type: { default: null },
      label: { default: null },
      value: { default: null },
      options: { default: null },
      placeholder: { default: null },
      required: { default: false },
      disabled: { default: false },
      removable: { default: true }
    }
  },
  
  parseHTML() {
    return [{ tag: 'div[data-control]' }]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-control': '', ...HTMLAttributes }, 0]
  },
  
  addNodeView() {
    return VueNodeViewRenderer(ControlComponent)
  },
  
  addKeyboardShortcuts() {
    return {
      'Backspace': ({ editor }) => {
        const { selection } = editor.state
        const { node } = selection
        
        // 检查是否选中了控件节点并处理删除逻辑
        if (node && node.type.name === 'control' && !node.attrs.removable) {
          return true // 阻止默认行为
        }
        return false // 允许默认删除行为
      },
      'Delete': ({ editor }) => {
        // 同上...
        return false
      }
    }
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

### 6.6 纸张系统架构

```
+----------------------------------------------+
|                纸张系统                       |
|  +----------------+  +--------------------+  |
|  |  纸张尺寸管理   |  |    页面设置控制     |  |
|  +----------------+  +--------------------+  |
|  +----------------+  +--------------------+  |
|  |  自定义纸张支持  |  |    页眉页脚编辑    |  |
|  +----------------+  +--------------------+  |
|  +----------------+  +--------------------+  |
|  |   打印样式管理   |  |     导出服务      |  |
|  +----------------+  +--------------------+  |
+----------------------------------------------+
```

### 6.7 纸张状态管理

```typescript
// 纸张状态管理 (使用Pinia)
export interface PaperState {
  currentPaperSize: PaperSize;
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  headerSettings: {
    enabled: boolean;
    height: number;
    content: string;
    showOnFirstPage: boolean;
  };
  footerSettings: {
    enabled: boolean;
    height: number;
    content: string;
    showOnFirstPage: boolean;
  };
  customPaperSizes: Record<string, PaperSize>;
}

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
      enabled: true,
      height: 15,
      content: '<div style="text-align: center">第 {{pageNumber}} 页 / 共 {{pageCount}} 页</div>',
      showOnFirstPage: true
    },
    customPaperSizes: {}
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
    
    // 获取所有可用纸张尺寸
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
    
    // 设置方向
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
    }
  }
});
```

### 6.8 纸张尺寸管理组件设计

```vue
<!-- PaperSizeSelector.vue -->
<template>
  <div class="paper-size-selector">
    <h3>纸张尺寸</h3>
    
    <div class="paper-size-list">
      <div 
        v-for="(size, key) in availablePaperSizes" 
        :key="key"
        class="paper-size-item"
        :class="{ active: currentPaperSize.name === size.name }"
        @click="setPaperSize(key)"
      >
        <div class="paper-preview" :style="getPaperPreviewStyle(size)"></div>
        <div class="paper-info">
          <span class="paper-name">{{ size.name }}</span>
          <span class="paper-dimensions">{{ size.width }} × {{ size.height }} mm</span>
        </div>
      </div>
    </div>
    
    <button class="add-custom-button" @click="showCustomPaperDialog = true">
      <i class="el-icon-plus"></i>
      添加自定义尺寸
    </button>
    
    <!-- 自定义纸张对话框 -->
    <el-dialog
      v-model="showCustomPaperDialog"
      title="自定义纸张尺寸"
      width="400px"
    >
      <div class="custom-paper-form">
        <div class="form-group">
          <label>名称:</label>
          <el-input v-model="customPaper.name" placeholder="例如：名片尺寸" />
        </div>
        <div class="form-group">
          <label>宽度 (mm):</label>
          <el-input-number v-model="customPaper.width" :min="50" :max="1000" />
        </div>
        <div class="form-group">
          <label>高度 (mm):</label>
          <el-input-number v-model="customPaper.height" :min="50" :max="1000" />
        </div>
      </div>
      <template #footer>
        <el-button @click="showCustomPaperDialog = false">取消</el-button>
        <el-button type="primary" @click="addCustomPaper">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

### 6.9 页面方向选择组件设计

```vue
<!-- OrientationSelector.vue -->
<template>
  <div class="orientation-selector">
    <h3>页面方向</h3>
    
    <div class="orientation-options">
      <div 
        class="orientation-option" 
        :class="{ active: orientation === 'portrait' }"
        @click="setOrientation('portrait')"
      >
        <div class="orientation-preview portrait">
          <div class="page-content"></div>
        </div>
        <span>纵向</span>
      </div>
      
      <div 
        class="orientation-option" 
        :class="{ active: orientation === 'landscape' }"
        @click="setOrientation('landscape')"
      >
        <div class="orientation-preview landscape">
          <div class="page-content"></div>
        </div>
        <span>横向</span>
      </div>
    </div>
  </div>
</template>
```

### 6.10 页边距设置组件设计

```vue
<!-- MarginsEditor.vue -->
<template>
  <div class="margins-editor">
    <h3>页边距 (mm)</h3>
    
    <div class="margins-form">
      <div class="margin-group">
        <label>上边距:</label>
        <el-input-number 
          v-model="margins.top" 
          :min="5" 
          :max="50"
          @change="updateMargins"
        />
      </div>
      <div class="margin-group">
        <label>右边距:</label>
        <el-input-number 
          v-model="margins.right" 
          :min="5" 
          :max="50"
          @change="updateMargins"
        />
      </div>
      <div class="margin-group">
        <label>下边距:</label>
        <el-input-number 
          v-model="margins.bottom" 
          :min="5" 
          :max="50"
          @change="updateMargins"
        />
      </div>
      <div class="margin-group">
        <label>左边距:</label>
        <el-input-number 
          v-model="margins.left" 
          :min="5" 
          :max="50"
          @change="updateMargins"
        />
      </div>
    </div>
    
    <div class="margins-presets">
      <el-button size="small" @click="applyPreset('normal')">标准</el-button>
      <el-button size="small" @click="applyPreset('narrow')">窄边距</el-button>
      <el-button size="small" @click="applyPreset('wide')">宽边距</el-button>
    </div>
  </div>
</template>
```

### 6.11 页面预览组件设计

```vue
<!-- PagePreview.vue -->
<template>
  <div class="page-preview-container">
    <h3>预览</h3>
    
    <div class="page-preview" :style="pagePreviewStyle">
      <!-- 页眉区域 -->
      <div 
        v-if="headerSettings.enabled" 
        class="header-area"
        :style="headerAreaStyle"
      ></div>
      
      <!-- 内容区域 -->
      <div class="content-area" :style="contentAreaStyle"></div>
      
      <!-- 页脚区域 -->
      <div 
        v-if="footerSettings.enabled" 
        class="footer-area"
        :style="footerAreaStyle"
      ></div>
      
      <!-- 页边距指示线 -->
      <div class="margin-guides">
        <div class="margin-guide top" :style="topMarginGuideStyle"></div>
        <div class="margin-guide right" :style="rightMarginGuideStyle"></div>
        <div class="margin-guide bottom" :style="bottomMarginGuideStyle"></div>
        <div class="margin-guide left" :style="leftMarginGuideStyle"></div>
      </div>
    </div>
  </div>
</template>
```

### 6.12 纸张系统与编辑器集成

```typescript
// 将纸张系统集成到编辑器组件
export default defineComponent({
  name: 'EditorContent',
  // ...
  setup(props, { emit }) {
    // ...
    const paperStore = usePaperStore();
    
    // 响应式地计算纸张容器样式
    const paperContainerStyle = computed(() => {
      return {
        width: `${paperStore.effectiveWidth}mm`,
        minHeight: `${paperStore.effectiveHeight}mm`,
        paddingTop: paperStore.headerSettings.enabled 
          ? `${paperStore.headerSettings.height + paperStore.margins.top}mm` 
          : `${paperStore.margins.top}mm`,
        paddingRight: `${paperStore.margins.right}mm`,
        paddingBottom: paperStore.footerSettings.enabled 
          ? `${paperStore.footerSettings.height + paperStore.margins.bottom}mm` 
          : `${paperStore.margins.bottom}mm`,
        paddingLeft: `${paperStore.margins.left}mm`,
        position: 'relative',
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        margin: '0 auto',
        transition: 'width 0.3s, min-height 0.3s, padding 0.3s',
      };
    });
    
    // 监听纸张设置变化，触发编辑器布局更新
    watch(() => [
      paperStore.currentPaperSize,
      paperStore.orientation,
      paperStore.margins,
      paperStore.headerSettings,
      paperStore.footerSettings
    ], () => {
      nextTick(() => {
        // 纸张设置变化后，可能需要触发编辑器重新渲染
        if (editor.value) {
          editor.value.commands.focus('end');
        }
      });
    }, { deep: true });
    
    // ...
    return {
      // ...
      paperContainerStyle,
    };
  }
});
```

### 6.13 页眉页脚编辑器设计

```vue
<!-- HeaderFooterEditor.vue -->
<template>
  <div class="header-footer-editor">
    <div class="editor-section">
      <div class="section-header">
        <h3>页眉设置</h3>
        <el-switch v-model="headerEnabled" @change="updateHeaderEnabled" />
      </div>
      
      <template v-if="headerEnabled">
        <div class="form-group">
          <label>高度 (mm):</label>
          <el-input-number 
            v-model="headerHeight" 
            :min="5" 
            :max="50"
            @change="updateHeaderHeight"
          />
        </div>
        
        <div class="form-group">
          <label>显示在首页:</label>
          <el-switch v-model="headerShowOnFirstPage" @change="updateHeaderShowOnFirstPage" />
        </div>
        
        <div class="editor-container">
          <header-content-editor
            v-model="headerContent"
            @update:modelValue="updateHeaderContent"
          />
        </div>
      </template>
    </div>
    
    <div class="editor-section">
      <div class="section-header">
        <h3>页脚设置</h3>
        <el-switch v-model="footerEnabled" @change="updateFooterEnabled" />
      </div>
      
      <template v-if="footerEnabled">
        <div class="form-group">
          <label>高度 (mm):</label>
          <el-input-number 
            v-model="footerHeight" 
            :min="5" 
            :max="50"
            @change="updateFooterHeight"
          />
        </div>
        
        <div class="form-group">
          <label>显示在首页:</label>
          <el-switch v-model="footerShowOnFirstPage" @change="updateFooterShowOnFirstPage" />
        </div>
        
        <div class="editor-container">
          <footer-content-editor
            v-model="footerContent"
            @update:modelValue="updateFooterContent"
          />
        </div>
      </template>
    </div>
  </div>
</template>
```

### 6.14 纸张系统实施路径

纸张系统的实现将按照以下步骤进行：

1. **基础设置实现**
   - 创建纸张尺寸数据模型和状态存储
   - 实现纸张尺寸选择器组件
   - 开发页面方向和边距设置

2. **集成到编辑器**
   - 将纸张尺寸和方向设置应用到编辑区域
   - 实现边距控制和预览
   - 添加纸张尺寸动态调整功能

3. **高级功能开发**
   - 实现页眉页脚编辑器
   - 开发页眉页脚变量系统（页码、日期等）
   - 添加自定义纸张尺寸支持

4. **打印和导出支持**
   - 实现打印样式优化
   - 开发PDF导出功能
   - 添加打印预览功能

5. **用户体验优化**
   - 添加纸张设置预设
   - 实现设置的保存和恢复
   - 优化纸张预览和实时反馈

## 7. 开发路线图

### 7.1 第一阶段 - 核心功能

- Tiptap编辑器基础设置
- 基本文本格式化功能
- 项目结构和基础UI组件
- 智能内容编辑交互系统（加号按钮和浮动菜单）

### 7.2 第二阶段 - 结构化控件

- 五种基础控件实现
- Tiptap控件集成
- 控件数据绑定系统
- 控件与浮动菜单集成

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
- 模板系统
- 医疗术语支持
- 数据导入/导出

### 7.7 第七阶段 - AI助手功能

- AI文档助手基础架构
- 智能内容生成与建议
- 上下文感知的编辑辅助
- 医疗专业术语识别与校对
- 文档结构优化建议
- 智能模板推荐系统

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
