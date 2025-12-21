<script setup>
import { CodeIcon } from 'lucide-vue-next'

const tools = [
  {
    title: '窗口控制器',
    desc: '一键管理桌面窗口布局，提升多任务处理效率。',
    link: '/downloads/窗口控制器.exe'
  },
  {
    title: 'ReadBook',
    desc: '沉浸式电子书阅读器，支持多种格式与笔记功能。',
    link: '/downloads/readbook.exe'
  },
  {
    title: '智能直播助手',
    desc: 'AI 驱动的直播间场控与互动助手，自动回复弹幕。',
    link: '#'
  },
  {
    title: 'MD Reader',
    desc: '轻量级 Markdown 阅读器，支持实时预览与大纲导航。',
    link: '#'
  },
  {
    title: '智聘',
    desc: '智能简历解析与人岗匹配工具，自动化招聘流程。',
    link: '/downloads/智聘.exe'
  }
]
</script>

<template>
  <div class="page-container">
    <div class="header">
      <div class="icon-wrapper">
        <CodeIcon :size="32" />
      </div>
      <h1>AI Coding 小工具</h1>
    </div>
    <div class="content">
      <p class="description">AI Coding 生成的实用小工具集合。</p>
      <div class="card-grid">
        <div v-for="(tool, index) in tools" :key="index" class="card">
          <h3>{{ tool.title }}</h3>
          <p>{{ tool.desc }}</p>
          <a :href="tool.link" class="download-btn" target="_blank">下载应用</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  background-color: #eff6ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
}

h1 {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.description {
  color: #64748b;
  margin-bottom: 24px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-color: #3b82f6;
}

.card h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #0f172a;
}

.card p {
  margin: 0;
  color: #64748b;
  line-height: 1.5;
}

.download-btn {
  display: inline-block;
  margin-top: 16px;
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.download-btn:hover {
  background-color: #2563eb;
}
</style>
