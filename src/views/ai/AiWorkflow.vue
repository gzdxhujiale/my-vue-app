<script setup>
import { GitBranchIcon } from 'lucide-vue-next'
</script>

<template>
  <div class="page-container">
    <div class="header">
      <div class="icon-wrapper">
        <GitBranchIcon :size="32" />
      </div>
      <h1>AI 工作流</h1>
    </div>
    <div class="content">
      <p class="description">基于 AI 的工作流编排与自动化。</p>
      <div class="card-grid">
        <div class="card">
          <h3>内容生成工作流</h3>
          <p>从选题到大纲，再到正文生成的全自动流程。</p>
        </div>
        <div class="card">
          <h3>研报分析工作流</h3>
          <p>自动抓取研报，提取关键信息并生成摘要。</p>
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
  background-color: #f5f3ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b5cf6;
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
  border-color: #8b5cf6;
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
</style>
