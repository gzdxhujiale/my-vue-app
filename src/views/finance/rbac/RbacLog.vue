<template>
  <div class="rbac-container">
    <!-- 顶部概览区域 -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-group">
          <div class="icon-wrapper">
            <icon-safe size="24" />
          </div>
          <div>
            <h1 class="page-title">操作审计日志</h1>
            <p class="page-subtitle">监控系统核心操作，追踪用户行为与安全风险</p>
          </div>
        </div>
        <div class="header-actions">
          <div class="stat-group">
            <div class="stat-item">
              <div class="stat-label">总日志数</div>
              <div class="stat-value">{{ statsData[0].value }}</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-label">敏感操作</div>
              <div class="stat-value text-amber">{{ statsData[1].value }}</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-label">失败记录</div>
              <div class="stat-value text-red">{{ statsData[2].value }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <a-card class="main-table-card">
      <!-- 筛选区域 -->
      <div class="filter-container">
        <a-row :gutter="24" align="center">
          <a-col :span="6">
            <a-input-search
              v-model="queryParams.keyword"
              placeholder="搜索用户 / 行为 / IP..."
              allow-clear
              search-button
              @search="handleSearch"
              @press-enter="handleSearch"
            />
          </a-col>
          <a-col :span="4">
            <a-select 
              v-model="queryParams.module" 
              placeholder="所属模块" 
              allow-clear
              @change="handleSearch"
            >
              <a-option v-for="m in filterOptions.modules" :key="m" :value="m">{{ m }}</a-option>
            </a-select>
          </a-col>
          <a-col :span="4">
            <a-select 
              v-model="queryParams.type" 
              placeholder="操作类型" 
              allow-clear
              @change="handleSearch"
            >
              <a-option v-for="t in filterOptions.types" :key="t.value" :value="t.value">{{ t.label }}</a-option>
            </a-select>
          </a-col>
          <a-col :span="4">
            <a-select 
              v-model="queryParams.status" 
              placeholder="执行状态" 
              allow-clear
              @change="handleSearch"
            >
              <a-option :value="1">成功</a-option>
              <a-option :value="0">失败</a-option>
            </a-select>
          </a-col>
          <a-col :span="6" style="text-align: right;">
            <a-space>
              <a-button type="text" @click="resetQuery" size="small">
                <template #icon><icon-loop /></template>
                重置刷新
              </a-button>
              <a-button type="text" size="small" @click="handleExport">
                <template #icon><icon-download /></template>
                导出报表
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </div>

      <a-divider style="margin: 16px 0;" />

      <!-- 表格区域 -->
      <a-table
        row-key="id"
        :loading="loading"
        :data="tableData"
        :pagination="pagination"
        :bordered="{ cell: true }"
        :stripe="true"
        @page-change="onPageChange"
      >
        <template #columns>
          <a-table-column title="日志ID" data-index="id" :width="90">
             <template #cell="{ record }">
               <span class="mono-text text-secondary">#{{ record.id }}</span>
             </template>
          </a-table-column>

          <a-table-column title="操作时间" data-index="time" :width="200">
            <template #cell="{ record }">
              <div class="time-cell">
                <icon-clock-circle style="margin-right: 6px; color: #86909c;" />
                {{ record.time }}
              </div>
            </template>
          </a-table-column>

          <a-table-column title="操作人" :width="200">
            <template #cell="{ record }">
              <div class="user-info-cell">
                <a-avatar :size="32" shape="circle" :style="{ backgroundColor: getAvatarColor(record.user) }">
                  {{ record.user.charAt(0) }}
                </a-avatar>
                <div class="user-meta">
                  <div class="user-name">{{ record.user }}</div>
                  <a-tag size="small" bordered color="arcoblue">{{ record.role }}</a-tag>
                </div>
              </div>
            </template>
          </a-table-column>

          <a-table-column title="功能模块" data-index="module" :width="140" />

          <a-table-column title="操作行为" data-index="action" :min-width="130">
             <template #cell="{ record }">
                <span style="font-weight: 500;">{{ record.action }}</span>
             </template>
          </a-table-column>

          <a-table-column title="状态" :width="100" align="center">
            <template #cell="{ record }">
              <a-badge status="processing" v-if="record.status === '成功'" color="green" text="成功" />
              <a-badge status="processing" v-else color="red" text="失败" />
            </template>
          </a-table-column>

          <a-table-column title="IP 来源" data-index="ip" :width="130">
            <template #cell="{ record }">
              <a-tooltip content="点击复制 IP">
                <span class="ip-tag" @click="copyToClipboard(record.ip)">
                  {{ record.ip }}
                </span>
              </a-tooltip>
            </template>
          </a-table-column>

          <a-table-column title="操作" :width="100" align="center" fixed="right">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="viewDetail(record)">
                详情
              </a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 详情抽屉 -->
    <a-drawer
      :visible="drawerVisible"
      :width="500"
      @ok="drawerVisible = false"
      @cancel="drawerVisible = false"
      unmount-on-close
      :footer="false"
    >
      <template #title>
        日志详情 <span class="mono-text" style="font-size: 14px; color: #86909c; margin-left: 8px;">#{{ currentLog?.id }}</span>
      </template>
      
      <div v-if="currentLog" class="drawer-content">
        <!-- 状态横幅 -->
        <div class="status-banner" :class="currentLog.status === '成功' ? 'banner-success' : 'banner-error'">
          <div class="banner-icon">
            <icon-check-circle-fill v-if="currentLog.status === '成功'" size="24" />
            <icon-close-circle-fill v-else size="24" />
          </div>
          <div class="banner-text">
            <h3>执行{{ currentLog.status }}</h3>
            <p>{{ currentLog.time }}</p>
          </div>
        </div>

        <div class="detail-group">
          <div class="section-title">基础信息</div>
          <a-descriptions :column="1" bordered size="large" layout="inline-horizontal">
            <a-descriptions-item label="操作用户">
              <a-space>
                <a-avatar :size="24">{{ currentLog.user.charAt(0) }}</a-avatar>
                {{ currentLog.user }}
                <span style="color: #86909c;">({{ currentLog.role }})</span>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="所属模块">{{ currentLog.module }}</a-descriptions-item>
            <a-descriptions-item label="操作类型">
              <a-tag :color="getTypeColor(currentLog.type)">{{ getTypeLabel(currentLog.type) }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="来源 IP">
              {{ currentLog.ip }}
              <span style="color: #86909c; font-size: 12px; margin-left: 8px;">(局域网)</span>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <div class="detail-group">
          <div class="section-title">请求详情</div>
          <div class="code-block">
            <div class="code-label">Request Params</div>
            <pre>{{ mockJson(currentLog) }}</pre>
          </div>
        </div>

        <div class="detail-group">
          <div class="section-title">业务描述</div>
          <p class="desc-text">
            {{ currentLog.detail }}
          </p>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { 
  IconSafe, IconRefresh, IconDownload, IconLoop, IconClockCircle,
  IconCheckCircleFill, IconCloseCircleFill, IconFile, IconPlus, IconEdit, IconDelete, IconClose
} from '@arco-design/web-vue/es/icon';

// ========== 1. 工具函数与模拟数据 ==========
const generateMockData = () => {
  const modules = ['用户管理', '角色权限', '菜单配置', '系统参数', '数据备份'];
  const actions = [
    { name: '新增用户', type: 'create' },
    { name: '修改权限', type: 'update' },
    { name: '删除角色', type: 'delete' },
    { name: '导出数据', type: 'export' },
    { name: '系统登录', type: 'login' },
  ];
  const users = [
    { name: 'Admin', role: '超级管理员' },
    { name: 'Sarah', role: '审计员' },
    { name: 'Mike', role: '运维人员' },
    { name: 'John', role: '业务主管' }
  ];
  const ips = ['192.168.1.10', '10.20.1.5', '172.16.0.22', '127.0.0.1'];

  return Array.from({ length: 120 }).map((_, i) => {
    const act = actions[Math.floor(Math.random() * actions.length)];
    const usr = users[Math.floor(Math.random() * users.length)];
    const isSuccess = Math.random() > 0.1;
    
    return {
      id: 10000 + i,
      time: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toLocaleString('zh-CN', { hour12: false }),
      user: usr.name,
      role: usr.role,
      ip: ips[Math.floor(Math.random() * ips.length)],
      module: modules[Math.floor(Math.random() * modules.length)],
      action: act.name,
      type: act.type,
      status: isSuccess ? '成功' : '失败',
      detail: `用户 [${usr.name}] 在模块 [${modules[Math.floor(Math.random() * modules.length)]}] 执行了 [${act.name}] 操作。${!isSuccess ? '原因：权限不足或网络超时。' : ''}`
    };
  }).sort((a, b) => b.id - a.id); // 降序
};

// ========== 2. 状态管理 ==========
const allLogs = ref([]);
const loading = ref(false);
const drawerVisible = ref(false);
const currentLog = ref(null);

// 筛选参数
const queryParams = reactive({
  keyword: '',
  module: '',
  type: '',
  status: '' // 1=成功, 0=失败, ''=全部
});

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
});

// ========== 3. 计算属性 ==========
const filterOptions = reactive({
  modules: ['用户管理', '角色权限', '菜单配置', '系统参数', '数据备份'],
  types: [
    { label: '新增', value: 'create' },
    { label: '修改', value: 'update' },
    { label: '删除', value: 'delete' },
    { label: '导出', value: 'export' },
    { label: '登录', value: 'login' },
  ]
});

// 根据条件过滤后的数据
const filteredList = computed(() => {
  return allLogs.value.filter(item => {
    const matchKey = !queryParams.keyword || 
      item.user.toLowerCase().includes(queryParams.keyword.toLowerCase()) || 
      item.action.includes(queryParams.keyword) ||
      item.ip.includes(queryParams.keyword);
    
    const matchModule = !queryParams.module || item.module === queryParams.module;
    const matchType = !queryParams.type || item.type === queryParams.type;
    
    let matchStatus = true;
    if (queryParams.status !== '' && queryParams.status !== undefined) {
      const statusText = queryParams.status === 1 ? '成功' : '失败';
      matchStatus = item.status === statusText;
    }

    return matchKey && matchModule && matchType && matchStatus;
  });
});

// 当前页数据
const tableData = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return filteredList.value.slice(start, end);
});

// 统计数据
const statsData = computed(() => {
  const list = allLogs.value;
  
  return [
    { title: '总日志数', value: list.length },
    { title: '敏感操作', value: list.filter(i => ['delete', 'update'].includes(i.type)).length },
    { title: '失败记录', value: list.filter(i => i.status === '失败').length },
  ];
});

// 监听过滤变化更新分页总数
import { watch } from 'vue';
watch(filteredList, (newVal) => {
  pagination.total = newVal.length;
  pagination.current = 1;
});

// ========== 4. 交互方法 ==========
onMounted(() => {
  refreshData();
});

const refreshData = () => {
  loading.value = true;
  // 模拟网络请求延迟
  setTimeout(() => {
    allLogs.value = generateMockData();
    pagination.total = allLogs.value.length;
    loading.value = false;
    Message.success('数据已刷新');
  }, 600);
};

const handleSearch = () => {
  // 实际上 computed 属性会自动处理，这里可以是触发后端 API 的地方
  pagination.current = 1;
};

const resetQuery = () => {
  queryParams.keyword = '';
  queryParams.module = '';
  queryParams.type = '';
  queryParams.status = '';
};

const onPageChange = (current) => {
  pagination.current = current;
};

const viewDetail = (record) => {
  currentLog.value = record;
  drawerVisible.value = true;
};

const handleExport = () => {
  Message.loading('正在准备导出文件...');
  setTimeout(() => {
    Message.success('导出成功：System_Logs_2023.xlsx');
  }, 1500);
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    Message.success(`已复制: ${text}`);
  });
};

// 样式辅助
const getAvatarColor = (name) => {
  const colors = ['#165DFF', '#00B42A', '#F53F3F', '#F7BA1E', '#722ED1'];
  return colors[name.length % colors.length];
};

const getTypeColor = (type) => {
  const map = { create: 'green', update: 'blue', delete: 'red', export: 'purple', login: 'cyan' };
  return map[type] || 'gray';
};

const getTypeLabel = (type) => {
  const map = { create: '新增', update: '修改', delete: '删除', export: '导出', login: '登录' };
  return map[type] || type;
};

// 模拟 JSON 数据展示
const mockJson = (log) => {
  return JSON.stringify({
    method: "POST",
    path: `/api/v1/${log.type}`,
    params: {
      user_id: log.user,
      timestamp: Date.now(),
      action_code: log.type.toUpperCase()
    },
    client_ip: log.ip,
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)..."
  }, null, 2);
};
</script>

<style scoped>
.rbac-container {
  min-height: 100vh;
  padding: 12px 24px;
  background-color: var(--color-fill-2);
}

/* 头部样式 */
.header-section {
  margin: -12px -24px 24px -24px;
  padding: 16px 24px;
  background-color: #fff;
  border-bottom: 1px solid var(--color-border);
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
.text-red { color: rgb(220, 38, 38); }

.stat-divider {
  width: 1px;
  height: 24px;
  background-color: var(--color-border-2);
}

/* 主卡片与表格 */
.main-table-card {
  border-radius: 8px;
}

.filter-container {
  padding: 8px 0;
}

.user-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 500;
  color: #1d2129;
}

.mono-text {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
}

.ip-tag {
  background-color: #f2f3f5;
  padding: 2px 8px;
  border-radius: 4px;
  color: #4e5969;
  font-size: 12px;
  font-family: monospace;
  cursor: copy;
  transition: all 0.2s;
}

.ip-tag:hover {
  background-color: #e5e6eb;
  color: #165dff;
}

.text-secondary {
  color: #86909c;
}

/* 抽屉详情 */
.status-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.banner-success { background-color: #e8ffea; color: #00b42a; }
.banner-error { background-color: #ffece8; color: #f53f3f; }

.banner-text h3 { margin: 0 0 4px 0; font-size: 16px; }
.banner-text p { margin: 0; opacity: 0.8; font-size: 12px; }

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
  border-left: 3px solid #165dff;
  padding-left: 12px;
  margin-bottom: 16px;
}

.detail-group {
  margin-bottom: 32px;
}

.code-block {
  background-color: #232324;
  color: #e2e2e3;
  padding: 16px;
  border-radius: 6px;
  position: relative;
}

.code-label {
  position: absolute;
  top: 8px;
  right: 12px;
  color: #6d6d6e;
  font-size: 12px;
  text-transform: uppercase;
}

.code-block pre {
  margin: 0;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.desc-text {
  background: #f7f8fa;
  padding: 16px;
  border-radius: 4px;
  color: #4e5969;
  line-height: 1.6;
  margin: 0;
}
</style>