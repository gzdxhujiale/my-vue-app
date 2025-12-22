<script setup>
import { ArrowRightIcon } from 'lucide-vue-next'

// 动态配置：通过调整数组顺序即可排序，添加对象即可新增
const workflowConfig = [
  {
    title: '内容生成工作流',
    desc: '从选题到大纲，再到正文生成的全自动流程。'
  },
  {
    title: '研报分析工作流',
    desc: '自动抓取研报，提取关键信息并生成摘要。'
  }
]
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">AI 工作流编排</h2>
      <p class="description">基于 AI 的自动化工作流，串联多个任务节点，实现复杂业务流程的自动化执行。</p>
    </div>

    <div class="card-grid">
      <div v-for="(item, index) in workflowConfig" :key="index" class="card">
        <div class="card-content">
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </div>
        <div class="card-footer">
          <span class="action-text">配置工作流</span>
          <ArrowRightIcon :size="16" class="arrow-icon" />
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
  cursor: pointer;
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
  display: flex;
  align-items: center;
  gap: 8px;
  color: #10b981;
  font-weight: 500;
  font-size: 14px;
}

.arrow-icon {
  transition: transform 0.2s;
}

.card:hover .arrow-icon {
  transform: translateX(4px);
}
</style>
