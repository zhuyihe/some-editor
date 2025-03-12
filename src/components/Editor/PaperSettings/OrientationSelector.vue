<template>
  <div class="orientation-selector">
    <h3 class="selector-title">页面方向</h3>
    
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

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { usePaperStore } from '../../../stores/paper';

export default defineComponent({
  name: 'OrientationSelector',
  
  setup() {
    const paperStore = usePaperStore();
    
    // 计算属性：当前方向
    const orientation = computed(() => paperStore.orientation);
    
    // 设置页面方向
    const setOrientation = (newOrientation: 'portrait' | 'landscape') => {
      if (newOrientation !== orientation.value) {
        paperStore.setOrientation(newOrientation);
      }
    };
    
    return {
      orientation,
      setOrientation
    };
  }
});
</script>

<style scoped lang="scss">
.orientation-selector {
  margin-bottom: 20px;
  
  .selector-title {
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 500;
  }
  
  .orientation-options {
    display: flex;
    gap: 30px;
    
    .orientation-option {
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
      
      .orientation-preview {
        width: 70px;
        height: 90px;
        background-color: #f0f2f5;
        border: 1px solid #d9d9d9;
        margin-bottom: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        
        &.landscape {
          width: 90px;
          height: 70px;
        }
        
        .page-content {
          width: 80%;
          height: 80%;
          background-color: white;
        }
      }
      
      span {
        font-size: 14px;
      }
    }
  }
}
</style> 