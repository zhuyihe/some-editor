# 电子病历编辑器

基于Vue 3、TypeScript和Tiptap的现代化电子病历编辑器，支持结构化控件和智能分页功能。

## 技术栈

- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite
- **编辑器核心**: Tiptap 2.x
- **状态管理**: Pinia
- **UI组件库**: Element Plus
- **HTTP客户端**: Axios
- **CSS预处理器**: SCSS

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── assets/               # 静态资源
├── components/
│   ├── Editor/           # 编辑器相关组件
│   │   ├── Core/         # 核心编辑器组件
│   │   ├── Controls/     # 结构化控件
│   │   ├── Pagination/   # 分页相关组件
│   │   └── Templates/    # 模板相关组件
│   └── common/           # 通用UI组件
├── composables/          # 可复用组合式函数
├── extensions/           # Tiptap扩展
├── stores/               # Pinia状态仓库
├── services/             # API服务
├── utils/                # 工具函数
└── views/                # 页面视图
```

## 功能特点

- 基于Tiptap的富文本编辑
- 结构化控件集成
- 实时分页功能
- 智能表格分页处理
- 完整的纸张和打印系统
