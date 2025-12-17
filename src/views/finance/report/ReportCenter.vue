<script setup>
import { ref } from 'vue'
import { BarChart3Icon, TrendingUpIcon, TrendingDownIcon, DollarSignIcon } from 'lucide-vue-next'

const summaryData = ref([
  { label: '本月营收', value: '¥1,234,567', change: '+12.5%', trend: 'up' },
  { label: '本月成本', value: '¥876,543', change: '+8.2%', trend: 'up' },
  { label: '毛利润', value: '¥358,024', change: '+18.3%', trend: 'up' },
  { label: '净利润率', value: '15.8%', change: '-2.1%', trend: 'down' }
])
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">
        <BarChart3Icon :size="24" class="title-icon" />
        <div>
          <h1>经营仓中心</h1>
          <p>企业经营数据总览与分析</p>
        </div>
      </div>
    </div>

    <div class="summary-grid">
      <t-card v-for="item in summaryData" :key="item.label" class="summary-card">
        <div class="summary-content">
          <div class="summary-icon"><DollarSignIcon :size="20" /></div>
          <div class="summary-info">
            <div class="summary-label">{{ item.label }}</div>
            <div class="summary-value">{{ item.value }}</div>
            <div :class="['summary-change', item.trend]">
              <component :is="item.trend === 'up' ? TrendingUpIcon : TrendingDownIcon" :size="14" />
              {{ item.change }}
            </div>
          </div>
        </div>
      </t-card>
    </div>

    <t-card title="经营趋势" class="chart-card">
      <div class="chart-placeholder">
        <BarChart3Icon :size="48" />
        <p>图表区域 - 可集成 ECharts 等图表库</p>
      </div>
    </t-card>
  </div>
</template>

<style scoped>
.page-container { max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.page-title { display: flex; align-items: center; gap: 1rem; }
.title-icon { color: #4f46e5; }
.page-title h1 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
.page-title p { font-size: 0.875rem; color: #64748b; margin: 0.25rem 0 0; }
.summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.summary-card { border-radius: 0.75rem !important; }
.summary-content { display: flex; align-items: flex-start; gap: 1rem; }
.summary-icon { width: 40px; height: 40px; border-radius: 0.5rem; background: #eef2ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; }
.summary-label { font-size: 0.875rem; color: #64748b; margin-bottom: 0.25rem; }
.summary-value { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 0.25rem; }
.summary-change { display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; font-weight: 500; }
.summary-change.up { color: #16a34a; }
.summary-change.down { color: #dc2626; }
.chart-card { border-radius: 0.75rem !important; }
.chart-placeholder { height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; background: #f8fafc; border-radius: 0.5rem; }
.chart-placeholder p { margin-top: 1rem; font-size: 0.875rem; }
@media (max-width: 768px) { .summary-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
