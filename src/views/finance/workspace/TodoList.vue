<script setup>
import { ref, computed } from 'vue'
import TaskDetail from './TaskDetail.vue'
import { ListTodoIcon } from 'lucide-vue-next'
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
  <a-layout class="permission-layout">
    <!-- 顶部通栏 -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-group">
          <div class="icon-wrapper">
            <ListTodoIcon :size="24" />
          </div>
          <div>
            <h1 class="page-title">待办清单</h1>
            <p class="page-subtitle">高效处理您的财务数据上传任务</p>
          </div>
        </div>
        <div class="header-actions">
           <div class="stat-group">
             <div class="stat-item">
               <div class="stat-label">总任务</div>
               <div class="stat-value">{{ stats.total }}</div>
             </div>
             <div class="stat-divider"></div>
             <div class="stat-item">
               <div class="stat-label">待处理</div>
               <div class="stat-value text-amber">{{ stats.pending }}</div>
             </div>
             <div class="stat-divider"></div>
             <div class="stat-item">
               <div class="stat-label">已完成</div>
               <div class="stat-value text-emerald">{{ stats.done }}</div>
             </div>
           </div>
        </div>
      </div>
    </div>

    <a-layout class="page-body">
      <a-layout-content class="content-area custom-scroll">
      <transition name="fade" mode="out-in">
        <!-- 列表视图容器 -->
        <div v-if="view === 'list'" key="list" class="list-view">
        
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
        </div>
  
        <!-- 详情视图 -->
        <TaskDetail 
          v-else 
          :selected-item="selectedItem" 
          :go-back="goBack" 
        />
      </transition>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
/* 全局变量与布局 */
.permission-layout {
  min-height: 100vh;
  background-color: var(--color-bg-1);
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.header-section {
  padding: 16px 24px;
  background-color: #fff;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-group {
  display: flex;
  gap: 16px;
  align-items: center;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #165dff 0%, #3c7eff 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 10px rgba(22, 93, 255, 0.2);
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
  line-height: 1.4;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #86909c;
}

.header-actions {
  display: flex;
  align-items: center;
}

.stat-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
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

.text-amber { color: rgb(217, 119, 6); }
.text-emerald { color: rgb(5, 150, 105); }

.stat-divider {
  width: 1px;
  height: 24px;
  background-color: var(--color-border-2);
}

/* 主体布局 */
.page-body {
  flex: 1;
  padding: 16px;
  background-color: var(--color-fill-2);
  display: flex;
  flex-direction: column;
}

.content-area {
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  padding: 24px;
  border: 1px solid var(--color-border);
  flex: 1; /* Fill remaining space */
}

/* --- 统计条重构样式 --- */
/* Removed old stat-bar styles */

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
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
  margin-top: 0;
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