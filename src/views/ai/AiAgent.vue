<script setup>
import { BotIcon, LockIcon } from 'lucide-vue-next'

const agents = [
  {
    title: '智能客服助手',
    desc: '基于 LLM 的智能客服，自动识别用户意图并分流。',
    disabled: true
  },
  {
    title: '数据分析 Agent',
    desc: '自然语言查询数据库，自动生成报表。',
    disabled: true
  },
  {
    title: '财务数据中心问答',
    desc: '基于 RAG 技术的财务知识库问答，精准检索财务指标与政策。',
    disabled: true
  }
]
</script>

<template>
  <div class="page-container">
    <div class="header">
      <div class="icon-wrapper">
        <BotIcon :size="32" />
      </div>
      <h1>AI Agent</h1>
    </div>
    <div class="content">
      <p class="description">这里展示 AI Agent 相关的自动化方案和演示。</p>
      <div class="card-grid">
        <div 
          v-for="(agent, index) in agents" 
          :key="index" 
          class="card"
          :class="{ 'is-disabled': agent.disabled }"
        >
          <div class="card-header">
            <h3>{{ agent.title }}</h3>
            <LockIcon v-if="agent.disabled" :size="16" class="lock-icon" />
          </div>
          <p>{{ agent.desc }}</p>
          <div v-if="agent.disabled" class="status-badge">
            <span>维护中</span>
          </div>
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
  background-color: #ecfdf5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
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
  border-color: #10b981;
}

.card.is-disabled {
  background-color: #f8fafc;
  cursor: not-allowed;
  border-color: #e2e8f0;
}

.card.is-disabled:hover {
  box-shadow: none;
  border-color: #e2e8f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card h3 {
  margin: 0;
  font-size: 18px;
  color: #0f172a;
}

.lock-icon {
  color: #94a3b8;
}

.status-badge {
  margin-top: 16px;
}

.status-badge span {
  display: inline-block;
  font-size: 12px;
  color: #ef4444;
  background: #fef2f2;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #fee2e2;
}

.card p {
  margin: 0;
  color: #64748b;
  line-height: 1.5;
}
</style>
