<script setup>
import { DownloadIcon } from 'lucide-vue-next'

// 动态配置：通过调整数组顺序即可排序，添加对象即可新增
const toolsConfig = [
  {
    title: '窗口控制器',
    desc: '一键管理桌面窗口，提升多任务处理效率。',
    link: 'https://pan.quark.cn/s/7a89f42d2c70'
  },
  {
    title: 'ReadBook',
    desc: '沉浸式电子书阅读器，支持多种格式与笔记功能。',
    link: 'https://pan.quark.cn/s/4c0eb46b3a5d'
  },
  {
    title: '智能直播助手',
    desc: 'AI 驱动的直播间场控与互动助手，自动回复弹幕。',
    link: 'https://pan.quark.cn/s/79b9109992bc'
  },
  {
    title: 'MD Reader',
    desc: '轻量级 Markdown 阅读器，支持实时预览与大纲导航。',
    link: 'https://pan.quark.cn/s/d8bf9a214aea'
  },
  {
    title: '智聘',
    desc: '暂无描述',
    link: 'https://pan.quark.cn/s/e6a7c6fa2647'
  }
]
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">AI Coding 工具箱</h2>
      <p class="description">AI 辅助生成的实用小工具集合，提升开发与办公效率。</p>
    </div>
    
    <div class="card-grid">
      <div v-for="(tool, index) in toolsConfig" :key="index" class="card">
        <div class="card-content">
          <h3>{{ tool.title }}</h3>
          <p>{{ tool.desc }}</p>
        </div>
        <div class="card-footer">
          <a :href="tool.link" class="download-btn" target="_blank">
            <DownloadIcon :size="16" />
            <span>下载应用</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 12px;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.description {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-color: #10b981;
}

.card-content {
  flex: 1;
  margin-bottom: 24px;
}

.card h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.card p {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
  font-size: 14px;
}

.card-footer {
  margin-top: auto;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #ecfdf5;
  color: #10b981;
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  width: fit-content;
}

.download-btn:hover {
  background-color: #10b981;
  color: white;
}
</style>
