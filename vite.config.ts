import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // 开发服务器配置
    open: true,
    // 当出现错误时，在浏览器中显示全屏报错
    hmr: { overlay: true }
  },
  // 开启详细的源码映射
  build: {
    sourcemap: true
  },
  // 开发模式下的源码映射
  css: {
    devSourcemap: true
  }
})
