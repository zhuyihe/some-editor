<template>
  <div class="margins-editor">
    <h3 class="editor-title">页边距 (mm)</h3>
    
    <div class="margins-form">
      <div class="margin-group">
        <label>上边距:</label>
        <el-input-number 
          v-model="margins.top" 
          :min="5" 
          :max="50"
          size="small"
          @change="updateMargins"
        />
      </div>
      <div class="margin-group">
        <label>右边距:</label>
        <el-input-number 
          v-model="margins.right" 
          :min="5" 
          :max="50"
          size="small"
          @change="updateMargins"
        />
      </div>
      <div class="margin-group">
        <label>下边距:</label>
        <el-input-number 
          v-model="margins.bottom" 
          :min="5" 
          :max="50"
          size="small"
          @change="updateMargins"
        />
      </div>
      <div class="margin-group">
        <label>左边距:</label>
        <el-input-number 
          v-model="margins.left" 
          :min="5" 
          :max="50"
          size="small"
          @change="updateMargins"
        />
      </div>
    </div>
    
    <div class="margins-presets">
      <span class="presets-label">快速设置:</span>
      <el-button size="small" @click="applyPreset('normal')">标准</el-button>
      <el-button size="small" @click="applyPreset('narrow')">窄边距</el-button>
      <el-button size="small" @click="applyPreset('wide')">宽边距</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from 'vue';
import { ElInputNumber, ElButton } from 'element-plus';
import { usePaperStore } from '../../../stores/paper';
import type { PaperState } from '../../../stores/paper';

export default defineComponent({
  name: 'MarginsEditor',
  components: {
    ElInputNumber,
    ElButton
  },
  
  setup() {
    const paperStore = usePaperStore();
    
    // 本地状态，用于跟踪页边距
    const margins = reactive({
      top: paperStore.margins.top,
      right: paperStore.margins.right,
      bottom: paperStore.margins.bottom,
      left: paperStore.margins.left
    });
    
    // 监听存储中的边距变化，同步到本地状态
    watch(() => paperStore.margins, (newMargins) => {
      margins.top = newMargins.top;
      margins.right = newMargins.right;
      margins.bottom = newMargins.bottom;
      margins.left = newMargins.left;
    }, { deep: true });
    
    // 更新边距
    const updateMargins = () => {
      paperStore.setMargins(margins);
    };
    
    // 应用预设边距
    const applyPreset = (preset: 'normal' | 'narrow' | 'wide') => {
      paperStore.applyMarginsPreset(preset);
    };
    
    return {
      margins,
      updateMargins,
      applyPreset
    };
  }
});
</script>

<style scoped lang="scss">
.margins-editor {
  margin-bottom: 20px;
  
  .editor-title {
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 500;
  }
  
  .margins-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 15px;
    
    .margin-group {
      display: flex;
      align-items: center;
      
      label {
        width: 70px;
        font-size: 14px;
      }
    }
  }
  
  .margins-presets {
    display: flex;
    align-items: center;
    gap: 10px;
    
    .presets-label {
      font-size: 14px;
      color: #606266;
    }
  }
}
</style> 