<template>
  <div class="paper-size-selector">
    <h3 class="selector-title">纸张尺寸</h3>
    
    <div class="paper-size-list">
      <div 
        v-for="(size, key) in availablePaperSizes" 
        :key="key"
        class="paper-size-item"
        :class="{ active: isCurrentSize(size) }"
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
      <font-awesome-icon :icon="['fas', 'plus']" />
      <span>添加自定义尺寸</span>
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

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { ElDialog, ElInput, ElInputNumber, ElButton } from 'element-plus';
import { usePaperStore } from '../../../stores/paper';
import type { PaperSize } from '../../../types/paper';

export default defineComponent({
  name: 'PaperSizeSelector',
  components: {
    FontAwesomeIcon,
    ElDialog,
    ElInput,
    ElInputNumber,
    ElButton
  },
  
  setup() {
    const paperStore = usePaperStore();
    const showCustomPaperDialog = ref(false);
    
    // 自定义纸张表单数据
    const customPaper = ref<PaperSize>({
      name: '',
      width: 210,
      height: 297,
      isPortrait: true
    });
    
    // 计算属性：所有可用纸张尺寸
    const availablePaperSizes = computed(() => paperStore.availablePaperSizes);
    
    // 判断是否是当前选中的纸张尺寸
    const isCurrentSize = (size: PaperSize) => {
      return paperStore.currentPaperSize.name === size.name;
    };
    
    // 设置纸张尺寸
    const setPaperSize = (key: string) => {
      paperStore.setPaperSize(key);
    };
    
    // 获取纸张预览样式
    const getPaperPreviewStyle = (size: PaperSize) => {
      const scaleFactor = 0.25; // 缩放因子，使预览更小
      const aspectRatio = size.height / size.width;
      const width = size.width * scaleFactor;
      const height = size.width * aspectRatio * scaleFactor;
      
      return {
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: 'white',
        border: '1px solid #ddd'
      };
    };
    
    // 添加自定义纸张
    const addCustomPaper = () => {
      if (customPaper.value.width > 0 && customPaper.value.height > 0) {
        paperStore.addCustomPaperSize({
          ...customPaper.value,
          isPortrait: true
        });
        showCustomPaperDialog.value = false;
        
        // 重置表单
        customPaper.value = {
          name: '',
          width: 210,
          height: 297,
          isPortrait: true
        };
      }
    };
    
    return {
      availablePaperSizes,
      showCustomPaperDialog,
      customPaper,
      isCurrentSize,
      setPaperSize,
      getPaperPreviewStyle,
      addCustomPaper
    };
  }
});
</script>

<style scoped lang="scss">
.paper-size-selector {
  margin-bottom: 20px;
  
  .selector-title {
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 500;
  }
  
  .paper-size-list {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 15px;
    
    .paper-size-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      padding: 10px;
      border-radius: 4px;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      &.active {
        background-color: #e6f7ff;
        border: 1px solid #91d5ff;
      }
      
      .paper-preview {
        margin-bottom: 8px;
      }
      
      .paper-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .paper-name {
          font-weight: 500;
          font-size: 14px;
        }
        
        .paper-dimensions {
          font-size: 12px;
          color: #666;
        }
      }
    }
  }
  
  .add-custom-button {
    padding: 8px 15px;
    background-color: #f0f2f5;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-size: 14px;
    
    &:hover {
      color: #1890ff;
      border-color: #1890ff;
    }
  }
  
  .custom-paper-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    
    .form-group {
      display: flex;
      align-items: center;
      
      label {
        width: 100px;
      }
    }
  }
}
</style> 