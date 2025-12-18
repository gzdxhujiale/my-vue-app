<template>
  <div class="rbac-container">
    <!-- 1. 顶部导航 -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-group">
          <div class="icon-wrapper">
            <icon-user-group size="24" />
          </div>
          <div>
            <h1 class="page-title">用户管理</h1>
            <p class="page-subtitle">配置系统用户，管理账号状态、归属部门及角色权限分配</p>
          </div>
        </div>
        <div class="header-actions">
           <div class="stat-group">
             <div class="stat-item">
               <div class="stat-label">总用户数</div>
               <div class="stat-value">{{ users.length }}</div>
             </div>
             <div class="stat-divider"></div>
             <div class="stat-item">
               <div class="stat-label">活跃用户</div>
               <div class="stat-value text-emerald">{{ activeUserCount }}</div>
             </div>
             <div class="stat-divider"></div>
             <div class="stat-item">
               <div class="stat-label">停用账号</div>
               <div class="stat-value text-amber">{{ disabledUserCount }}</div>
             </div>
             <div class="stat-divider"></div>
             <div class="stat-item">
               <div class="stat-label">本月新增</div>
               <div class="stat-value text-indigo">8</div>
             </div>
           </div>
        </div>
      </div>
    </div>

    <!-- 3. 主内容区域 -->
    <a-card class="main-table-card">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input-search
            v-model="searchText"
            placeholder="搜索姓名 / 邮箱 / 手机号"
            style="width: 280px"
            allow-clear
          />
          <a-select
            v-model="filterRole"
            placeholder="角色筛选"
            style="width: 160px"
            allow-clear
          >
            <a-option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</a-option>
          </a-select>
          <a-select
            v-model="filterStatus"
            placeholder="状态"
            style="width: 120px"
            allow-clear
          >
            <a-option value="启用">启用</a-option>
            <a-option value="停用">停用</a-option>
          </a-select>
        </div>

        <div class="toolbar-right">
          <transition name="fade">
            <a-button 
              v-if="selectedKeys.length > 0" 
              status="danger" 
              class="mr-2"
              @click="handleBatchDelete"
            >
              <template #icon><icon-delete /></template>
              批量删除 ({{ selectedKeys.length }})
            </a-button>
          </transition>
          
          <a-button type="text" size="small" @click="openDrawer('add')">
            <template #icon><icon-plus /></template>
            新建用户
          </a-button>
          
          <a-button type="text" size="small" @click="refreshData">
            <template #icon><icon-refresh /></template>
            刷新列表
          </a-button>
          <a-button type="text" size="small">
            <template #icon><icon-download /></template>
            导出数据
          </a-button>
        </div>
      </div>

      <!-- 表格 -->
      <a-table
        row-key="id"
        :data="filteredUsers"
        :loading="loading"
        :row-selection="rowSelection"
        v-model:selectedKeys="selectedKeys"
        :pagination="{
          showTotal: true,
          showPageSize: true,
          total: filteredUsers.length,
          current: pagination.current,
          pageSize: pagination.pageSize,
        }"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        :bordered="{ cell: true }"
        stripe
      >
        <template #columns>
          <a-table-column title="用户信息" :width="300">
            <template #cell="{ record }">
              <div class="user-cell">
                <a-avatar
                  :size="40"
                  :style="{ backgroundColor: getAvatarColor(record.name) }"
                >
                  {{ record.name[0] }}
                </a-avatar>
                <div class="user-info">
                  <div class="name">{{ record.name }}</div>
                  <div class="sub-text">{{ record.email }}</div>
                </div>
              </div>
            </template>
          </a-table-column>

          <a-table-column title="部门" data-index="department" :width="150" />

          <a-table-column title="角色" :width="250">
            <template #cell="{ record }">
              <div class="role-list">
                <a-tag
                  v-for="role in record.roles.slice(0, 2)"
                  :key="role"
                  size="small"
                  :color="getRoleColor(role)"
                  bordered
                >
                  {{ role }}
                </a-tag>
                <a-popover v-if="record.roles.length > 2">
                  <a-tag size="small" class="more-tag">+{{ record.roles.length - 2 }}</a-tag>
                  <template #content>
                    <a-space direction="vertical" size="mini">
                      <a-tag v-for="r in record.roles.slice(2)" :key="r" color="gray">{{ r }}</a-tag>
                    </a-space>
                  </template>
                </a-popover>
              </div>
            </template>
          </a-table-column>

          <a-table-column title="手机号" data-index="phone" :width="160" />

          <a-table-column title="状态" :width="100">
            <template #cell="{ record }">
              <a-badge
                :status="record.status === '启用' ? 'success' : 'warning'"
                :text="record.status"
              />
            </template>
          </a-table-column>

          <a-table-column title="创建时间" data-index="createTime" :width="180">
            <template #cell="{ record }">
              <span class="date-text">{{ record.createTime }}</span>
            </template>
          </a-table-column>

          <!-- 增加 fixed="right" 固定列 -->
          <a-table-column title="操作" align="center" :width="100" fixed="right">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="openDrawer('edit', record)">
                编辑
              </a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 4. 新增/编辑抽屉 -->
    <a-drawer
      v-model:visible="drawer.visible"
      :title="drawer.title"
      :width="480"
      unmount-on-close
      @ok="handleSave"
      @cancel="drawer.visible = false"
    >
      <a-form :model="form" layout="vertical">
        <div class="form-section-title">基本信息</div>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="姓名" field="name" required>
              <a-input v-model="form.name" placeholder="请输入真实姓名">
                <template #prefix><icon-user /></template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="用户名" field="username" required>
              <a-input v-model="form.username" placeholder="登录账号" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="邮箱地址" field="email" required>
          <a-input v-model="form.email" placeholder="example@company.com" />
        </a-form-item>

        <a-form-item label="手机号码" field="phone">
          <a-input v-model="form.phone" placeholder="11位手机号" />
        </a-form-item>

        <a-divider style="margin: 24px 0" />
        
        <div class="form-section-title">组织架构与权限</div>
        
        <a-form-item label="所属部门" field="department" required>
          <a-select v-model="form.department" placeholder="选择部门">
            <a-option v-for="d in departmentOptions" :key="d" :value="d">{{ d }}</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="角色分配" field="roles">
          <a-select v-model="form.roles" multiple placeholder="选择角色权限">
            <a-option v-for="r in roleOptions" :key="r" :value="r">{{ r }}</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="账号状态" field="status">
          <a-switch 
            v-model="form.status" 
            checked-value="启用" 
            unchecked-value="停用"
            type="round"
          >
            <template #checked>启用</template>
            <template #unchecked>停用</template>
          </a-switch>
        </a-form-item>
      </a-form>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import {
  IconUser, IconUserGroup, IconCheckCircle, IconStop, IconSchedule,
  IconPlus, IconDelete, IconRefresh, IconDownload, IconArrowRise
} from '@arco-design/web-vue/es/icon';

// ========== 模拟数据 (新增5条数据) ==========
const MOCK_USERS = [
  { id: 1, name: '张三', username: 'zhangsan', email: 'zhangsan@company.com', phone: '13812345678', department: '财务部', roles: ['财务BI'], status: '启用', createTime: '2024-01-15 10:00' },
  { id: 2, name: '李四', username: 'lisi', email: 'lisi@company.com', phone: '13987654321', department: '运营部', roles: ['业务BI', '数据分析师', '初级运营'], status: '启用', createTime: '2024-02-20 14:30' },
  { id: 3, name: '王五', username: 'wangwu', email: 'wangwu@company.com', phone: '13700001111', department: '技术部', roles: ['运维工程师'], status: '停用', createTime: '2024-03-10 09:15' },
  { id: 4, name: 'Admin', username: 'admin', email: 'admin@company.com', phone: '13666668888', department: '管理层', roles: ['超级管理员'], status: '启用', createTime: '2023-12-01 08:00' },
  { id: 5, name: '赵六', username: 'zhaoliu', email: 'zhaoliu@company.com', phone: '13555554444', department: '数据部', roles: ['数据专员'], status: '启用', createTime: '2024-04-05 16:45' },
  { id: 6, name: '孙七', username: 'sunqi', email: 'sunqi@company.com', phone: '13311112222', department: '技术部', roles: ['前端工程师'], status: '启用', createTime: '2024-05-12 11:20' },
  { id: 7, name: '周八', username: 'zhouba', email: 'zhouba@company.com', phone: '13422223333', department: '产品部', roles: ['产品经理'], status: '启用', createTime: '2024-05-15 09:00' },
  { id: 8, name: '吴九', username: 'wujiu', email: 'wujiu@company.com', phone: '13133334444', department: '测试部', roles: ['测试工程师'], status: '停用', createTime: '2024-06-01 15:30' },
  { id: 9, name: '郑十', username: 'zhengshi', email: 'zhengshi@company.com', phone: '13244445555', department: '运营部', roles: ['活动运营'], status: '启用', createTime: '2024-06-10 10:15' },
  { id: 10, name: '冯十一', username: 'fengshiyi', email: 'feng@company.com', phone: '13055556666', department: '设计部', roles: ['UI设计师'], status: '启用', createTime: '2024-06-20 14:00' },
];

const ROLE_OPTIONS = ['超级管理员', '运维工程师', '业务BI', '财务BI', '数据分析师', '初级运营', '数据专员', '产品经理', 'UI设计师', '前端工程师', '测试工程师'];
const DEPT_OPTIONS = ['财务部', '运营部', '技术部', '数据部', '管理层', '人力资源', '产品部', '测试部', '设计部'];

// ========== 状态 ==========
const users = ref([]);
const loading = ref(false);
const searchText = ref('');
const filterRole = ref('');
const filterStatus = ref('');
const roleOptions = ref(ROLE_OPTIONS);
const departmentOptions = ref(DEPT_OPTIONS);

// 表格选中
const selectedKeys = ref([]);
const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false,
});

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
});

// 抽屉
const drawer = reactive({
  visible: false,
  title: '',
  type: ''
});

// 表单
const form = reactive({
  id: null,
  name: '',
  username: '',
  email: '',
  phone: '',
  department: '',
  roles: [],
  status: '启用'
});

// ========== Computed ==========
const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const matchSearch = !searchText.value ||
      u.name.includes(searchText.value) ||
      u.email.includes(searchText.value) ||
      u.phone.includes(searchText.value);
    const matchRole = !filterRole.value || u.roles.includes(filterRole.value);
    const matchStatus = !filterStatus.value || u.status === filterStatus.value;
    return matchSearch && matchRole && matchStatus;
  });
});

const activeUserCount = computed(() => users.value.filter(u => u.status === '启用').length);
const disabledUserCount = computed(() => users.value.filter(u => u.status === '停用').length);

// ========== Methods ==========
onMounted(() => {
  refreshData();
});

const refreshData = () => {
  loading.value = true;
  // 模拟网络请求
  setTimeout(() => {
    users.value = [...MOCK_USERS]; 
    loading.value = false;
    Message.success('数据已更新');
  }, 600);
};

const getAvatarColor = (name) => {
  const colors = ['#165DFF', '#00B42A', '#FF7D00', '#F53F3F', '#722ED1', '#86909C'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getRoleColor = (role) => {
  if (role.includes('管理员')) return 'arcoblue';
  if (role.includes('BI') || role.includes('经理')) return 'green';
  if (role.includes('工程师') || role.includes('设计')) return 'orange';
  return 'gray';
};

// 抽屉操作
const openDrawer = (type, data = null) => {
  drawer.type = type;
  drawer.title = type === 'add' ? '新建用户' : '编辑用户';
  drawer.visible = true;
  
  if (type === 'add') {
    Object.assign(form, {
      id: null, name: '', username: '', email: '', phone: '',
      department: '', roles: [], status: '启用'
    });
  } else {
    Object.assign(form, JSON.parse(JSON.stringify(data)));
  }
};

// 保存
const handleSave = () => {
  if (!form.name || !form.email || !form.department) {
    Message.warning('请补全必填信息');
    return;
  }
  
  loading.value = true;
  setTimeout(() => {
    if (drawer.type === 'edit') {
      const idx = users.value.findIndex(u => u.id === form.id);
      if (idx !== -1) users.value[idx] = { ...form };
      Message.success('更新成功');
    } else {
      const newUser = {
        ...form,
        id: Date.now(),
        createTime: new Date().toLocaleString()
      };
      users.value.unshift(newUser); // 添加到开头
      Message.success('创建成功');
    }
    drawer.visible = false;
    loading.value = false;
  }, 400);
};

// 批量删除
const handleBatchDelete = () => {
  loading.value = true;
  setTimeout(() => {
    users.value = users.value.filter(u => !selectedKeys.value.includes(u.id));
    selectedKeys.value = [];
    loading.value = false;
    Message.success('批量删除成功');
  }, 500);
};

// 分页事件
const onPageChange = (current) => {
  pagination.current = current;
};

const onPageSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.current = 1;
};
</script>

<style scoped>
/* 容器基础样式 */
.rbac-container {
  padding: 12px 24px;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: var(--color-fill-2);
}

/* 顶部区域 */
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
.text-emerald { color: rgb(5, 150, 105); }
.text-indigo { color: rgb(79, 70, 229); }

.stat-divider {
  width: 1px;
  height: 24px;
  background-color: var(--color-border-2);
}

/* 主表格区域 */
.main-table-card {
  border-radius: 8px;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}
.toolbar-left {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}
.icon-btn {
  padding: 0 10px;
  color: #4e5969;
  border-color: #e5e6eb;
}

/* 表格内元素 */
.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-info .name {
  font-weight: 500;
  color: #1d2129;
  font-size: 14px;
}
.user-info .sub-text {
  font-size: 12px;
  color: #86909c;
}

.role-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.more-tag {
  background-color: #f2f3f5;
  color: #86909c;
  border: none;
}
.date-text {
  color: #86909c;
  font-size: 13px;
}

/* 抽屉内样式 */
.form-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 16px;
  border-left: 3px solid #165dff;
  padding-left: 8px;
  line-height: 1.2;
}

/* 动画工具类 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 间距工具 */
.mr-2 { margin-right: 8px; }
</style>