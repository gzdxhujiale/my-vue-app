<script setup>
  import { ref, computed } from 'vue'
  import { HistoryIcon } from 'lucide-vue-next'
  import { 
    IconUser, IconApps, IconFilter, IconRefresh, IconRight,
    IconFile, IconCalendar, IconClockCircle
  } from '@arco-design/web-vue/es/icon'
  
  // 数据常量
  const CLIENT_OPTIONS = ['客户A', '客户B', '客户C']
  const PLATFORM_OPTIONS = ['抖音', '快手', '淘宝']
  const SHOP_SUFFIXES = ['1号店', '2号店', '3号店']
  const PERIOD_OPTIONS = ['2025.06', '2025.07', '2025.08', '2025.09', '2025.10']
  const USERS = ['家乐', '系统自动', '张三', '李四']
  const BILL_TYPES = ['资金账单', '结算账单', '订单管理']
  
  // 生成历史数据
  const generateHistoryData = () => {
    const data = []
    let id = 101
    
    // 所有店铺组合
    const allShops = []
    CLIENT_OPTIONS.forEach(client => {
      PLATFORM_OPTIONS.forEach(platform => {
        SHOP_SUFFIXES.forEach(suffix => {
          allShops.push({ client, platform, shop: `${client}${platform}${suffix}` })
        })
      })
    })
    
    // 生成历史记录：每个店铺每个账期3条记录（3种账单类型），共生成10个组合 × 3 = 30条
    const shopCount = 10 // 取前10个店铺
    for (let i = 0; i < shopCount; i++) {
      const shopInfo = allShops[i % allShops.length]
      const period = PERIOD_OPTIONS[Math.floor(Math.random() * PERIOD_OPTIONS.length)]
      
      // 为每个店铺生成3种账单类型
      BILL_TYPES.forEach(billType => {
        const user = USERS[Math.floor(Math.random() * USERS.length)]
        
        // 生成随机日期（在对应账期的下个月）
        const periodParts = period.split('.')
        const year = parseInt(periodParts[0])
        const month = parseInt(periodParts[1])
        const nextMonth = month === 12 ? 1 : month + 1
        const nextYear = month === 12 ? year + 1 : year
        const day = Math.floor(Math.random() * 28) + 1
        const hour = Math.floor(Math.random() * 24)
        const minute = Math.floor(Math.random() * 60)
        const date = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        
        data.push({
          id: id++,
          period,
          client: shopInfo.client,
          platform: shopInfo.platform,
          shop: shopInfo.shop,
          billType,
          date,
          user
        })
      })
    }
    
    // 按日期倒序排序
    return data.sort((a, b) => new Date(b.date) - new Date(a.date))
  }
  
  const historyData = ref(generateHistoryData())
  const filters = ref({ period: '', client: '', platform: '', shop: '', search: '' })
  
  // Drawer 状态管理
  const drawerVisible = ref(false)
  const selectedRecord = ref(null)
  
  // 打开详情抽屉
  const openDrawer = (record) => {
    selectedRecord.value = record
    drawerVisible.value = true
  }
  
  // 关闭抽屉
  const closeDrawer = () => {
    drawerVisible.value = false
    setTimeout(() => {
      selectedRecord.value = null
    }, 300)
  }
  
  // 动态计算可选店铺
  const availableShops = computed(() => {
    if (filters.value.client && filters.value.platform) {
      return SHOP_SUFFIXES.map(suffix => `${filters.value.client}${filters.value.platform}${suffix}`)
    }
    return []
  })
  
  // 筛选后的数据
  const filteredData = computed(() => historyData.value.filter(i =>
    (!filters.value.period || i.period === filters.value.period) &&
    (!filters.value.client || i.client === filters.value.client) &&
    (!filters.value.platform || i.platform === filters.value.platform) &&
    (!filters.value.shop || i.shop === filters.value.shop) &&
    (!filters.value.search || i.shop.toLowerCase().includes(filters.value.search.toLowerCase()))
  ))
  
  // 统计数据
  const stats = computed(() => ({
    total: filteredData.value.length
  }))
  
  // 重置筛选器
  const resetFilters = () => {
    filters.value = { period: '', client: '', platform: '', shop: '', search: '' }
  }
  
  const columns = [
    { title: '完成时间', dataIndex: 'date', width: 180 },
    { title: '账期', dataIndex: 'period', width: 100 },
    { title: '客户', dataIndex: 'client', width: 100 },
    { title: '平台', dataIndex: 'platform', slotName: 'platform', width: 100 },
    { title: '店铺', dataIndex: 'shop' },
    { title: '账单类型', dataIndex: 'billType', width: 120 },
    { title: '操作人', dataIndex: 'user', slotName: 'user', width: 140 },
    { title: '状态', slotName: 'status', align: 'right', width: 100 },
    { title: '详情', slotName: 'detail', align: 'center', width: 80 }
  ]
  
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
            <HistoryIcon :size="24" />
          </div>
          <div>
            <h1 class="page-title">历史记录</h1>
            <p class="page-subtitle">查看已归档的任务记录</p>
          </div>
        </div>
        <div class="header-actions">
          <div class="stat-pill">
            <span class="label">总记录</span>
            <span class="value">{{ stats.total }}</span>
          </div>
        </div>
      </div>
    </div>

    <a-layout class="page-body">
      <a-layout-content class="content-area custom-scroll">
          <!-- 工具栏 -->
          <div class="toolbar">
            <div class="toolbar-left">
              <span class="section-title">归档记录</span>
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
          
          <!-- 表格：标准表格样式 -->
          <a-table 
            :data="filteredData" 
            :columns="columns" 
            :pagination="{ pageSize: 13 }"
            :bordered="{ cell: true }"
            row-key="id"
            hoverable
            class="custom-table"
          >
            <!-- 平台列样式 -->
            <template #platform="{ record }">
              <a-tag :color="getPlatformColor(record.platform)">
                {{ record.platform }}
              </a-tag>
            </template>
  
            <!-- 用户列样式 -->
            <template #user="{ record }">
              <div class="user-cell">
                <div class="user-avatar">
                  <IconUser size="12" />
                </div>
                <span class="user-name">{{ record.user }}</span>
              </div>
            </template>
  
            <!-- 状态列样式 -->
            <template #status>
               <span class="status-tag">已归档</span>
            </template>
            
            <!-- 详情列 -->
            <template #detail="{ record }">
              <a-button type="text" size="small" class="action-btn" @click="openDrawer(record)">
                <template #icon><IconRight /></template>
              </a-button>
            </template>
          </a-table>
        
        <!-- 详情抽屉 -->
        <a-drawer
          v-model:visible="drawerVisible"
          :width="600"
          title="账单上传详情"
          @cancel="closeDrawer"
          unmountOnClose
        >
          <div v-if="selectedRecord" class="drawer-content">
            <!-- 基本信息卡片 -->
            <a-card :bordered="false" class="info-card">
              <div class="info-header">
                <div>
                  <a-typography-title :heading="5" style="margin: 0 0 8px 0">{{ selectedRecord.shop }}</a-typography-title>
                  <a-space size="small">
                    <a-tag color="green">已归档</a-tag>
                    <a-tag :color="getPlatformColor(selectedRecord.platform)">{{ selectedRecord.platform }}</a-tag>
                  </a-space>
                </div>
                <div class="icon-header">
                  <IconApps />
                </div>
              </div>
              
              <a-divider style="margin: 16px 0" />
              
              <div class="info-list">
                <div class="info-item">
                  <span class="label"><IconUser /> 客户名称</span>
                  <span class="value">{{ selectedRecord.client }}</span>
                </div>
                <a-divider style="margin: 8px 0" />
                <div class="info-item">
                  <span class="label"><IconCalendar /> 账期</span>
                  <span class="value-tag">{{ selectedRecord.period }}</span>
                </div>
                <a-divider style="margin: 8px 0" />
                <div class="info-item">
                  <span class="label"><IconFile /> 账单类型</span>
                  <span class="value">{{ selectedRecord.billType }}</span>
                </div>
                <a-divider style="margin: 8px 0" />
                <div class="info-item">
                  <span class="label"><IconClockCircle /> 完成时间</span>
                  <span class="value">{{ selectedRecord.date }}</span>
                </div>
                <a-divider style="margin: 8px 0" />
                <div class="info-item">
                  <span class="label"><IconUser /> 操作人</span>
                  <span class="value">{{ selectedRecord.user }}</span>
                </div>
              </div>
            </a-card>
            
            <!-- 文件信息 -->
            <a-card :bordered="false" class="file-card" style="margin-top: 16px">
              <template #title>
                <span style="font-size: 14px; font-weight: 600">文件信息</span>
              </template>
              
              <div class="file-detail">
                <div class="file-icon-box">
                  <IconFile size="24" />
                </div>
                <div class="file-info-detail">
                  <div class="file-name">{{ selectedRecord.period }}_{{ selectedRecord.billType }}.xlsx</div>
                  <div class="file-meta">
                    <span>文件大小: {{ ['1.2MB', '450KB', '5.6MB'][Math.floor(Math.random() * 3)] }}</span>
                    <span class="dot"></span>
                    <span>上传时间: {{ selectedRecord.date }}</span>
                  </div>
                </div>
              </div>
              
              <a-divider style="margin: 16px 0" />
              
              <div class="status-info">
                <div class="status-item">
                  <span class="status-label">上传状态</span>
                  <a-tag color="green">已完成</a-tag>
                </div>
                <div class="status-item">
                  <span class="status-label">校验状态</span>
                  <a-tag color="green">已通过</a-tag>
                </div>
                <div class="status-item">
                  <span class="status-label">加载状态</span>
                  <a-tag color="green">已加载</a-tag>
                </div>
              </div>
            </a-card>
          </div>
          
          <template #footer>
            <a-button @click="closeDrawer">关闭</a-button>
          </template>
        </a-drawer>
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

/* Stat Pill in Header */
.stat-pill {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.stat-pill .label {
  font-size: 12px;
  color: var(--color-text-3);
}
.stat-pill .value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-1);
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

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px; /* Adjusted padding */
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

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 胶囊筛选器 */
.filter-capsule {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border-2);
  border-radius: 18px;
  padding: 1px 8px;
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
  width: 240px;
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
  margin-top: 0; /* Removed margin */
}

:deep(.arco-table-th) {
  background-color: var(--color-fill-1);
  color: var(--color-text-2);
  font-weight: 600;
}

:deep(.arco-table-td) {
  color: var(--color-text-2);
}

/* 用户列 */
.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--color-fill-3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-3);
}

.user-name {
  color: var(--color-text-2);
  font-size: 14px;
}

/* 状态列 */
.status-tag {
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  background-color: var(--color-fill-2);
  color: var(--color-text-3);
  border: 1px solid var(--color-border-2);
}

/* 详情按钮 */
.action-btn {
  color: var(--color-text-3);
}
.action-btn:hover {
  color: rgb(79, 70, 229);
  background-color: rgb(238, 242, 255);
}

/* Drawer 内容 */
.drawer-content {
  padding: 0;
}

.info-card, .file-card {
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.icon-header {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: var(--color-fill-2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-3);
  font-size: 20px;
}

.info-list {
  margin-top: 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.label {
  color: var(--color-text-3);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.value {
  color: var(--color-text-1);
  font-weight: 500;
  font-size: 13px;
}

.value-tag {
  font-family: monospace;
  background: var(--color-fill-2);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.file-detail {
  display: flex;
  gap: 16px;
  align-items: center;
}

.file-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-color: rgb(209, 250, 229);
  color: rgb(5, 150, 105);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-info-detail {
  flex: 1;
}

.file-name {
  font-size: 14px;
  font-weight: bold;
  color: var(--color-text-1);
  margin-bottom: 4px;
}

.file-meta {
  font-size: 12px;
  color: var(--color-text-3);
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 4px;
  height: 4px;
  background-color: var(--color-neutral-4);
  border-radius: 50%;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  font-size: 13px;
  color: var(--color-text-2);
}
</style>