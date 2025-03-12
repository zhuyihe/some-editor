<template>
  <el-drawer
    v-model="drawerVisible"
    title="页面设置"
    direction="rtl"
    size="380px"
    :destroy-on-close="false"
  >
    <div class="page-settings-panel">
      <paper-size-selector />
      <orientation-selector />
      <margins-editor />
      
      <div class="paper-preview">
        <h3 class="preview-title">预览</h3>
        <div class="preview-container">
          <div 
            class="paper-preview-box" 
            :style="{
              width: `${previewWidth}px`,
              height: `${previewHeight}px`,
              padding: `${previewMargins.top}px ${previewMargins.right}px ${previewMargins.bottom}px ${previewMargins.left}px`
            }"
          >
            <div class="content-area"></div>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { ElDrawer } from 'element-plus';
import PaperSizeSelector from './PaperSizeSelector.vue';
import OrientationSelector from './OrientationSelector.vue';
import MarginsEditor from './MarginsEditor.vue';
import { usePaperStore } from '../../../stores/paper';

export default defineComponent({
  name: 'PageSettingsPanel',
  components: {
    ElDrawer,
    PaperSizeSelector,
    OrientationSelector,
    MarginsEditor
  },
  
  setup() {
    const paperStore = usePaperStore();
    const drawerVisible = ref(false);
    
    // 监听抽屉显示状态，同步到store
    watch(drawerVisible, (newValue) => {
      paperStore.setSettingsOpen(newValue);
    });
    
    // 预览尺寸的缩放因子
    const PREVIEW_SCALE = 0.5;
    
    // 计算预览尺寸
    const previewWidth = computed(() => {
      return paperStore.effectiveWidth * PREVIEW_SCALE;
    });
    
    const previewHeight = computed(() => {
      return paperStore.effectiveHeight * PREVIEW_SCALE;
    });
    
    // 计算预览边距
    const previewMargins = computed(() => {
      return {
        top: paperStore.margins.top * PREVIEW_SCALE,
        right: paperStore.margins.right * PREVIEW_SCALE,
        bottom: paperStore.margins.bottom * PREVIEW_SCALE,
        left: paperStore.margins.left * PREVIEW_SCALE
      };
    });
    
    // 打开面板
    const openPanel = () => {
      drawerVisible.value = true;
      paperStore.setSettingsOpen(true);
    };
    
    // 关闭面板
    const closePanel = () => {
      drawerVisible.value = false;
      paperStore.setSettingsOpen(false);
    };
    
    return {
      drawerVisible,
      previewWidth,
      previewHeight,
      previewMargins,
      openPanel,
      closePanel
    };
  }
});
</script>

<style scoped lang="scss">
.page-settings-panel {
  padding: 10px;
  
  .preview-title {
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 500;
  }
  
  .preview-container {
    display: flex;
    justify-content: center;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 4px;
    
    .paper-preview-box {
      background-color: white;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      border: 1px solid #e4e7ed;
      
      .content-area {
        width: 100%;
        height: 100%;
        background-color: rgba(64, 158, 255, 0.1);
        border: 1px dashed #409eff;
      }
    }
  }
}
</style> 