<script setup>
import { PresentationIcon, BarChart3Icon, PieChartIcon, TrendingUpIcon } from 'lucide-vue-next'
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">
        <PresentationIcon :size="24" class="title-icon" />
        <div>
          <h1>数据看板</h1>
          <p>可视化数据展示与分析</p>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <t-card class="dashboard-card">
        <div class="chart-placeholder">
          <BarChart3Icon :size="32" />
          <p>营收趋势图</p>
        </div>
      </t-card>
      <t-card class="dashboard-card">
        <div class="chart-placeholder">
          <PieChartIcon :size="32" />
          <p>成本构成图</p>
        </div>
      </t-card>
      <t-card class="dashboard-card">
        <div class="chart-placeholder">
          <TrendingUpIcon :size="32" />
          <p>利润走势图</p>
        </div>
      </t-card>
      <t-card class="dashboard-card">
        <div class="chart-placeholder">
          <BarChart3Icon :size="32" />
          <p>店铺对比图</p>
        </div>
      </t-card>
    </div>
  </div>
</template>

<style scoped>
.page-container { max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.page-title { display: flex; align-items: center; gap: 1rem; }
.title-icon { color: #4f46e5; }
.page-title h1 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
.page-title p { font-size: 0.875rem; color: #64748b; margin: 0.25rem 0 0; }
.dashboard-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.dashboard-card { border-radius: 0.75rem !important; }
.chart-placeholder { height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; background: #f8fafc; border-radius: 0.5rem; }
.chart-placeholder p { margin-top: 0.75rem; font-size: 0.875rem; }
</style>
