import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/my-vue-app/', // GitHub Pages 基础路径
  build: {
    // 构建输出目录
    outDir: 'dist',
    // 静态资源目录
    assetsDir: 'assets',
    // 生成相对路径，确保在不同环境下都能正确加载
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  }
})
