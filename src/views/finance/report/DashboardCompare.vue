<script setup>
import { BarChart3Icon } from 'lucide-vue-next'
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">
        <BarChart3Icon :size="24" class="title-icon" />
        <div>
          <h1>对比分析</h1>
          <p>多维度数据对比分析</p>
        </div>
      </div>
    </div>
    <t-card class="content-card">
      <div class="compare-section">
        <t-row :gutter="16">
          <t-col :span="6">
            <t-select placeholder="选择对比维度" style="width: 100%">
              <t-option value="store" label="按店铺" />
              <t-option value="time" label="按时间" />
              <t-option value="product" label="按产品" />
            </t-select>
          </t-col>
          <t-col :span="6">
            <t-date-range-picker style="width: 100%" />
          </t-col>
          <t-col :span="4">
            <t-button theme="primary" block>开始对比</t-button>
          </t-col>
        </t-row>
      </div>
      <div class="chart-placeholder">
        <BarChart3Icon :size="48" />
        <p>对比图表区域</p>
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
.content-card { border-radius: 0.75rem !important; }
.compare-section { margin-bottom: 1.5rem; }
.chart-placeholder { height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; background: #f8fafc; border-radius: 0.5rem; }
.chart-placeholder p { margin-top: 1rem; font-size: 0.875rem; }
</style>
