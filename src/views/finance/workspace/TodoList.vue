<script setup>
import { ref, computed } from 'vue'
import TaskDetail from './TaskDetail.vue'
import {
  IconApps, IconClockCircle, IconCheckCircle, IconSearch, 
  IconRefresh, IconRight, IconFilter
} from '@arco-design/web-vue/es/icon'

// --- 数据常量 ---
const CLIENT_OPTIONS = ['客户A', '客户B', '客户C']
const PLATFORM_OPTIONS = ['抖音', '快手', '淘宝']
const SHOP_SUFFIXES = ['1号店', '2号店', '3号店']
const PERIOD_OPTIONS = ['2025.06', '2025.07', '2025.08', '2025.09', '2025.10', '2025.11']

// --- 生成模拟数据 ---
const generateTodoData = () => {
  const data = []
  let id = 1
  
  // 当前月份（2025.11）
  const currentPeriod = '2025.11'
  
  // 状态配置：待上传、已上传、已初级校验、已加载
  const statusConfig = [
    { status: 'pending', statusText: '待上传', hasDeadline: true },
    { status: 'uploaded', statusText: '已上传', hasDeadline: false },
    { status: 'verified', statusText: '已初级校验', hasDeadline: false },
    { status: 'loaded', statusText: '已加载', hasDeadline: false }
  ]
  
  // 所有店铺组合（3客户 x 3平台 x 3店铺 = 27个店铺，取前20个）
  const allShops = []
  CLIENT_OPTIONS.forEach(client => {
    PLATFORM_OPTIONS.forEach(platform => {
      SHOP_SUFFIXES.forEach(suffix => {
        allShops.push({ client, platform, shop: `${client}${platform}${suffix}` })
      })
    })
  })
  const shops = allShops.slice(0, 20) // 取前20个店铺
  
  // 为每个账期生成20条数据
  PERIOD_OPTIONS.forEach((period, periodIdx) => {
    shops.forEach((shopInfo, shopIdx) => {
      let statusObj
      let deadline = null
      let deadlineText = '-'
      
      if (period === currentPeriod) {
        // 当前月份：随机分配4种状态
        const rand = Math.random()
        if (rand < 0.35) {
          statusObj = statusConfig[0] // 待上传 35%
          deadline = Math.floor(Math.random() * 20) + 1
          deadlineText = `剩 ${deadline} 天`
        } else if (rand < 0.6) {
          statusObj = statusConfig[1] // 已上传 25%
        } else if (rand < 0.8) {
          statusObj = statusConfig[2] // 已初级校验 20%
        } else {
          statusObj = statusConfig[3] // 已加载 20%
        }
      } else {
        // 其他月份：全部是已加载
        statusObj = statusConfig[3]
      }
      
      data.push({
        id: id++,
        period,
        client: shopInfo.client,
        platform: shopInfo.platform,
        shop: shopInfo.shop,
        status: statusObj.status,
        statusText: statusObj.statusText,
        deadline,
        deadlineText
      })
    })
  })
  
  return data
}

// --- 响应式数据 ---
const todoData = ref(generateTodoData())

const view = ref('list') // 'list' | 'detail'
const selectedItem = ref(null)
const filters = ref({ period: '2025.11', client: '', platform: '', shop: '', search: '' })

// --- 计算属性 ---
// 动态计算可选店铺
const availableShops = computed(() => {
  if (filters.value.client && filters.value.platform) {
    return SHOP_SUFFIXES.map(suffix => `${filters.value.client}${filters.value.platform}${suffix}`)
  }
  return []
})

const filteredData = computed(() => todoData.value.filter(i =>
  (!filters.value.period || i.period === filters.value.period) &&
  (!filters.value.client || i.client === filters.value.client) &&
  (!filters.value.platform || i.platform === filters.value.platform) &&
  (!filters.value.shop || i.shop === filters.value.shop) &&
  (!filters.value.search || i.shop.toLowerCase().includes(filters.value.search.toLowerCase()))
))

const stats = computed(() => ({
  total: filteredData.value.length,
  pending: filteredData.value.filter(i => i.status === 'pending').length,
  done: filteredData.value.filter(i => ['uploaded', 'verified', 'loaded'].includes(i.status)).length
}))

// Arco Table 列配置
const columns = [
  { title: '账期', dataIndex: 'period', width: 100 },
  { title: '客户', dataIndex: 'client', width: 90 },
  { title: '平台', dataIndex: 'platform', slotName: 'platform', width: 100 },
  { title: '店铺名称', dataIndex: 'shop' },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 120 },
  { title: '剩余时间', dataIndex: 'deadline', slotName: 'deadline', width: 120 },
  { title: '操作', slotName: 'op', align: 'center', width: 80 }
]

// --- 方法 ---
const resetFilters = () => {
  filters.value = { period: '2025.11', client: '', platform: '', shop: '', search: '' }
}

const goToDetail = (item) => {
  selectedItem.value = item
  view.value = 'detail'
}

const goBack = () => {
  view.value = 'list'
  setTimeout(() => { selectedItem.value = null }, 300)
}

// 辅助方法：获取平台对应的颜色标签
const getPlatformColor = (platform) => {
  const map = { '淘宝': 'orange', '抖音': 'arcoblue', '快手': 'red' }
  return map[platform] || 'gray'
}
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      
      <!-- Header 区域 -->
      <header v-if="view === 'list'" class="page-header">
        <div class="header-left">
          <a-typography-title :heading="3" class="main-title">工作台</a-typography-title>
          <a-typography-text type="secondary" class="sub-title">高效处理您的财务数据上传任务</a-typography-text>
        </div>
        
        <!-- 统计条：重构为扁平化通栏设计，更紧凑 -->
        <div class="stat-bar">
          <div class="stat-item">
            <div class="stat-icon bg-indigo"><IconApps /></div>
            <div class="stat-info">
              <span class="stat-label">总任务</span>
              <span class="stat-value">{{ stats.total }}</span>
            </div>
          </div>
          
          <div class="stat-divider"></div>

          <div class="stat-item">
            <div class="stat-icon bg-amber"><IconClockCircle /></div>
            <div class="stat-info">
              <span class="stat-label">待处理</span>
              <span class="stat-value">{{ stats.pending }}</span>
            </div>
          </div>

          <div class="stat-divider"></div>
          
          <div class="stat-item">
            <div class="stat-icon bg-emerald"><IconCheckCircle /></div>
            <div class="stat-info">
              <span class="stat-label">已完成</span>
              <span class="stat-value">{{ stats.done }}</span>
            </div>
          </div>
        </div>
      </header>

      <transition name="fade" mode="out-in">
        <!-- 列表视图容器 -->
        <a-card 
          v-if="view === 'list'" 
          class="main-card" 
          :bordered="false"
        >
          <!-- 工具栏 -->
          <div class="toolbar">
            <div class="toolbar-left">
              <span class="section-title">当月任务</span>
              <a-tag color="arcoblue" size="small" class="month-tag">OCT</a-tag>
            </div>
            
            <div class="toolbar-right">
              <!-- 胶囊式筛选器 -->
              <div class="filter-capsule">
                 <IconFilter class="filter-icon" />
                 
                 <!-- 账期 -->
                 <a-select 
                   v-model="filters.period" 
                   placeholder="账期" 
                   :bordered="false" 
                   size="small"
                   :style="{width:'120px'}"
                   allow-clear
                 >
                   <a-option v-for="p in PERIOD_OPTIONS" :key="p" :value="p">{{p}}</a-option>
                 </a-select>
                 
                 <div class="divider"></div>
                 
                 <!-- 客户 -->
                 <a-select 
                   v-model="filters.client" 
                   placeholder="客户" 
                   :bordered="false" 
                   size="small"
                   :style="{width:'100px'}"
                   allow-clear
                   @change="filters.shop = ''"
                 >
                   <a-option v-for="c in CLIENT_OPTIONS" :key="c" :value="c">{{c}}</a-option>
                 </a-select>
                 
                 <div class="divider"></div>
                 
                 <!-- 平台 -->
                 <a-select 
                   v-model="filters.platform" 
                   placeholder="平台" 
                   :bordered="false"
                   size="small" 
                   :style="{width:'100px'}"
                   allow-clear
                   @change="filters.shop = ''"
                 >
                   <a-option v-for="p in PLATFORM_OPTIONS" :key="p" :value="p">{{p}}</a-option>
                 </a-select>

                 <div class="divider"></div>

                 <!-- 店铺 -->
                 <a-select 
                   v-model="filters.shop" 
                   placeholder="店铺" 
                   :bordered="false"
                   size="small" 
                   :style="{width:'100px'}"
                   allow-clear
                   :disabled="!filters.client || !filters.platform"
                 >
                   <a-option v-for="s in availableShops" :key="s" :value="s">{{s}}</a-option>
                 </a-select>
              </div>

              <a-input-search 
                v-model="filters.search" 
                placeholder="搜索..." 
                class="search-input"
                allow-clear
              />
              
              <a-button class="refresh-btn" @click="resetFilters">
                <template #icon><IconRefresh /></template>
              </a-button>
            </div>
          </div>
          
          <!-- 表格：标准表格样式，更和谐统一 -->
          <a-table 
            :data="filteredData" 
            :columns="columns" 
            :pagination="{ pageSize: 12 }"
            :bordered="{ cell: true }"
            row-key="id"
            hoverable
            class="custom-table"
          >
            <!-- 平台列 -->
            <template #platform="{ record }">
               <a-tag :color="getPlatformColor(record.platform)" size="small">
                 {{ record.platform }}
               </a-tag>
            </template>

            <!-- 状态列 -->
            <template #status="{ record }">
              <a-badge 
                :status="record.status === 'pending' ? 'warning' : record.status === 'uploaded' ? 'processing' : record.status === 'verified' ? 'success' : 'default'" 
                :text="record.statusText" 
              />
            </template>

            <!-- 剩余时间 -->
            <template #deadline="{ record }">
              <span 
                v-if="record.status === 'pending'" 
                class="deadline-tag"
                :class="{ 'urgent': record.deadline <= 3 }"
              >
                {{ record.deadlineText }}
              </span>
              <span v-else class="text-placeholder">-</span>
            </template>

            <!-- 操作列 -->
            <template #op="{ record }">
              <a-button type="text" size="small" class="action-btn" @click="goToDetail(record)">
                <template #icon><IconRight /></template>
              </a-button>
            </template>
          </a-table>
        </a-card>
  
        <!-- 详情视图 -->
        <TaskDetail 
          v-else 
          :selected-item="selectedItem" 
          :go-back="goBack" 
        />
      </transition>
    </div>
  </div>
</template>

<style scoped>
/* 页面容器 */
.page-container {
  min-height: 100vh;
  background-color: var(--color-fill-2);
  padding: 32px;
  box-sizing: border-box;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* 头部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 24px;
}

.main-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: var(--color-text-1);
  letter-spacing: -0.5px;
}

.sub-title {
  font-size: 14px;
  color: var(--color-text-3);
}

/* --- 统计条重构样式 --- */
.stat-bar {
  display: flex;
  align-items: center;
  background: var(--color-bg-2);
  padding: 12px 24px;
  border-radius: 12px;
  border: 1px solid var(--color-border-2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 100px; /* 紧凑宽度 */
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.bg-indigo { background-color: rgb(238, 242, 255); color: rgb(79, 70, 229); }
.bg-amber { background-color: rgb(255, 251, 235); color: rgb(217, 119, 6); }
.bg-emerald { background-color: rgb(236, 253, 245); color: rgb(5, 150, 105); }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-3);
  line-height: 1.2;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-1);
  line-height: 1.2;
}

.stat-divider {
  width: 1px;
  height: 24px;
  background-color: var(--color-border-2);
}

/* 主卡片与工具栏 */
.main-card {
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  margin-bottom: 0;
  flex-wrap: wrap;
  gap: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-1);
}

.month-tag {
  font-weight: bold;
  border-radius: 4px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 胶囊筛选器 - 瘦身版 */
.filter-capsule {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border-2);
  border-radius: 18px; 
  padding: 1px 8px; /* 减少内边距 */
  background-color: var(--color-bg-1);
  transition: border-color 0.2s;
}

.filter-capsule:hover {
  border-color: var(--color-primary-light-3);
}

.filter-icon {
  color: var(--color-text-4);
  margin-right: 4px;
  font-size: 12px;
}

.divider {
  width: 1px;
  height: 12px;
  background-color: var(--color-border-2);
  margin: 0 2px;
}

.search-input {
  width: 240px; /* 增加到1.5倍：原160px -> 240px */
  background-color: var(--color-fill-2);
  border-radius: 18px;
  border: 1px solid transparent;
}
.search-input:hover {
  background-color: var(--color-fill-3);
}

.refresh-btn {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-3);
}

/* 表格视觉优化 */
.custom-table {
  margin-top: 12px;
}

:deep(.arco-table-th) {
  background-color: var(--color-fill-1);
  color: var(--color-text-2);
  font-weight: 600;
}

:deep(.arco-table-td) {
  color: var(--color-text-2);
}

.deadline-tag {
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 4px;
  background-color: var(--color-fill-2);
  color: var(--color-text-2);
}

.deadline-tag.urgent {
  background-color: rgb(254, 242, 242);
  color: rgb(220, 38, 38);
}

.text-placeholder {
  color: var(--color-text-4);
}

.action-btn {
  color: var(--color-text-3);
}
.action-btn:hover {
  color: rgb(79, 70, 229);
  background-color: rgb(238, 242, 255);
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>