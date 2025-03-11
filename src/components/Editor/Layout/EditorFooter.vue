<template>
  <div class="editor-footer">
    <div class="left-section">
      <span class="footer-item">页码: {{ currentPage }}/{{ totalPages }}</span>
      <span class="footer-item">字数: {{ wordCount }}</span>
    </div>
    
    <div class="right-section">
      <div class="zoom-control">
        <span>缩放: {{ zoom }}%</span>
        <el-button-group>
          <el-button size="small" text @click="decreaseZoom">
            <font-awesome-icon icon="minus" />
          </el-button>
          <el-button size="small" text @click="resetZoom">
            <span>{{ zoom }}%</span>
          </el-button>
          <el-button size="small" text @click="increaseZoom">
            <font-awesome-icon icon="plus" />
          </el-button>
        </el-button-group>
      </div>
      
      <div class="footer-item view-mode">
        <el-tooltip content="全屏显示" placement="top">
          <font-awesome-icon icon="expand" class="view-icon" />
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'EditorFooter',
  setup() {
    const wordCount = ref(0);
    const currentPage = ref(1);
    const totalPages = ref(1);
    const zoom = ref(100);
    
    const increaseZoom = () => {
      if (zoom.value < 200) {
        zoom.value += 25;
      }
    };
    
    const decreaseZoom = () => {
      if (zoom.value > 50) {
        zoom.value -= 25;
      }
    };
    
    const resetZoom = () => {
      zoom.value = 100;
    };
    
    return {
      wordCount,
      currentPage,
      totalPages,
      zoom,
      increaseZoom,
      decreaseZoom,
      resetZoom
    };
  }
});
</script>

<style scoped lang="scss">
.editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  border-top: 1px solid #e4e7ed;
  background-color: #fff;
  padding: 0 16px;
  font-size: 12px;
  color: #606266;
  
  .left-section, .right-section {
    display: flex;
    align-items: center;
  }
  
  .footer-item {
    margin-right: 16px;
    display: flex;
    align-items: center;
    
    &:last-child {
      margin-right: 0;
    }
  }
  
  .zoom-control {
    display: flex;
    align-items: center;
    margin-right: 16px;
    
    span {
      margin-right: 8px;
    }
  }
  
  .view-mode {
    cursor: pointer;
    
    .view-icon {
      font-size: 16px;
      
      &:hover {
        color: #409eff;
      }
    }
  }
}
</style> 