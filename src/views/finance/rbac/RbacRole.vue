<template>
  <div class="rbac-container">
    <div class="header-section">
      <div class="header-content">
        <div class="title-group">
          <div class="icon-wrapper">
            <icon-safe size="24" />
          </div>
          <div>
            <h1 class="page-title">角色管理</h1>
            <p class="page-subtitle">定义系统角色、配置功能权限与数据权限</p>
          </div>
        </div>
        <div class="header-actions">
          <a-button type="primary" @click="openModal('add')">
            <template #icon><icon-plus /></template>
            新增角色
          </a-button>
        </div>
      </div>
    </div>

    <div class="content-wrapper">
      <a-row :gutter="16" class="main-row" style="flex-wrap: nowrap;">
        <!-- 左侧角色列表 -->
        <a-col flex="280px" class="h-full">
          <a-card class="list-card h-full" :body-style="{ padding: '0' }">
            <div class="list-header">
              <h3 class="list-title">角色列表</h3>
              <span class="list-subtitle">点击查看详情</span>
            </div>
            <div class="role-list custom-scroll">
              <div 
                v-for="role in roles" 
                :key="role.id" 
                class="role-item"
                :class="{ 'role-active': selectedRole?.id === role.id }"
                @click="selectRole(role)"
              >
                <div class="role-item-inner">
                  <a-avatar 
                    :size="32" 
                    :style="{ backgroundColor: selectedRole?.id === role.id ? 'rgb(var(--primary-6))' : '#F2F3F5', color: selectedRole?.id === role.id ? '#FFF' : '#4E5969' }"
                    class="role-avatar"
                  >
                    {{ role.name[0] }}
                  </a-avatar>
                  <div class="role-info">
                    <div class="role-name">{{ role.name }}</div>
                    <div class="role-meta">{{ role.desc }}</div>
                  </div>
                  <div class="role-count">
                    <icon-user size="14" />
                    <span>{{ role.userCount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>

        <!-- 右侧角色详情 -->
        <a-col flex="auto" class="h-full" style="overflow: hidden; min-width: 0;">
          <a-card class="detail-card h-full" v-if="selectedRole">
            <div class="detail-header">
              <div class="detail-title-group">
                <div class="role-icon-wrapper large" :class="getColorClass(selectedRole.color)">
                  <icon-safe size="24" />
                </div>
                <div>
                  <h2 class="detail-title">{{ selectedRole.name }}</h2>
                  <p class="detail-code">{{ selectedRole.code }}</p>
                </div>
              </div>
              <div class="detail-actions">
                <a-button type="outline" class="mr-2" @click="openModal('edit', selectedRole)">
                  <template #icon><icon-edit /></template> 编辑
                </a-button>
                <a-button 
                  v-if="!selectedRole.isSystem" 
                  type="outline" 
                  status="danger"
                  @click="handleDelete(selectedRole)"
                >
                  <template #icon><icon-delete /></template> 删除
                </a-button>
              </div>
            </div>

            <div class="detail-content">
              <div class="detail-section">
                <div class="section-label">角色描述</div>
                <p class="section-text">{{ selectedRole.desc }}</p>
              </div>

              <div class="detail-section bordered">
                <div class="section-header">
                  <icon-lock class="section-icon text-indigo" />
                  <span class="section-title-text">功能权限</span>
                </div>
                <div class="permission-tags">
                  <template v-if="selectedRole.permissions.includes('all')">
                    <a-tag color="red" class="perm-tag">
                      <template #icon><icon-safe /></template>
                      拥有所有功能权限
                    </a-tag>
                  </template>
                  <template v-else-if="selectedRole.permissions.length > 0">
                    <a-tag v-for="perm in selectedRole.permissions" :key="perm" color="arcoblue" class="perm-tag">
                      {{ perm }}
                    </a-tag>
                  </template>
                  <span v-else class="empty-text">暂无功能权限</span>
                </div>
              </div>

              <div class="data-perm-grid">
                <div class="detail-section bordered">
                  <div class="section-header">
                    <icon-filter class="section-icon text-blue" />
                    <span class="section-title-text">行级权限</span>
                  </div>
                  <div class="perm-box bg-blue-light">
                    <div class="perm-name text-blue">{{ getRowPermName(selectedRole.rowPermissionId) }}</div>
                    <div class="perm-desc text-blue-sub">{{ getRowPermDesc(selectedRole.rowPermissionId) }}</div>
                  </div>
                </div>
                <div class="detail-section bordered">
                  <div class="section-header">
                    <icon-layout class="section-icon text-green" />
                    <span class="section-title-text">列级权限</span>
                  </div>
                  <div class="perm-box bg-green-light">
                    <div class="perm-name text-green">{{ getColPermName(selectedRole.columnPermissionId) }}</div>
                    <div class="perm-desc text-green-sub">{{ getColPermDesc(selectedRole.columnPermissionId) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </a-card>
          
          <div v-else class="empty-state">
            <div class="empty-content">
              <icon-safe size="48" class="empty-icon" />
              <p>请从左侧选择一个角色</p>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 编辑/新增弹窗 -->
    <a-modal
      v-model:visible="modal.visible"
      :title="modal.type === 'add' ? '新增角色' : '编辑角色'"
      width="720px"
      @ok="handleSave"
      @cancel="closeModal"
    >
      <a-form :model="form" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="name" label="角色名称" required>
              <a-input v-model="form.name" placeholder="请输入角色名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="code" label="角色编码" required>
              <a-input v-model="form.code" placeholder="如: FINANCE_BI" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="desc" label="角色描述">
          <a-textarea v-model="form.desc" placeholder="请输入角色描述" :auto-size="{minRows:2, maxRows:4}" />
        </a-form-item>
        <a-form-item field="color" label="角色颜色">
          <div class="color-picker">
            <div 
              v-for="color in colors" 
              :key="color" 
              class="color-item"
              :class="[getColorClass(color), { active: form.color === color }]"
              @click="form.color = color"
            ></div>
          </div>
        </a-form-item>

        <a-tabs type="rounded" size="medium">
          <a-tab-pane key="function" title="功能权限">
            <div class="perm-tree-container">
              <a-tree
                :data="permissionTree"
                :checkable="true"
                v-model:checked-keys="form.permissions"
                :default-expand-all="true"
              />
            </div>
          </a-tab-pane>
          <a-tab-pane key="data" title="数据权限">
            <a-row :gutter="16">
              <a-col :span="12">
                <div class="perm-select-box">
                  <div class="box-header text-blue">
                    <icon-filter /> 行级权限
                  </div>
                  <div class="box-list">
                    <div 
                      v-for="rule in rowRules" 
                      :key="rule.id"
                      class="box-item"
                      :class="{ active: form.rowPermissionId === rule.id }"
                      @click="form.rowPermissionId = rule.id"
                    >
                      <div class="item-top">
                        <span class="item-name">{{ rule.name }}</span>
                        <icon-check v-if="form.rowPermissionId === rule.id" class="text-blue" />
                      </div>
                      <div class="item-desc">{{ rule.description }}</div>
                    </div>
                  </div>
                </div>
              </a-col>
              <a-col :span="12">
                <div class="perm-select-box">
                  <div class="box-header text-green">
                    <icon-layout /> 列级权限
                  </div>
                  <div class="box-list">
                    <div 
                      v-for="rule in colRules" 
                      :key="rule.id"
                      class="box-item"
                      :class="{ active: form.columnPermissionId === rule.id }"
                      @click="form.columnPermissionId = rule.id"
                    >
                      <div class="item-top">
                        <span class="item-name">{{ rule.name }}</span>
                        <icon-check v-if="form.columnPermissionId === rule.id" class="text-green" />
                      </div>
                      <div class="item-desc">{{ rule.description }}</div>
                    </div>
                  </div>
                </div>
              </a-col>
            </a-row>
          </a-tab-pane>
        </a-tabs>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Message, Modal } from '@arco-design/web-vue';
import { 
  IconSafe, IconPlus, IconUser, IconEdit, IconDelete, 
  IconLock, IconFilter, IconLayout, IconCheck 
} from '@arco-design/web-vue/es/icon';

// ========== 数据初始化 ==========
const roles = ref([]);
const selectedRole = ref(null);
const permissionTree = ref([]);
const rowRules = ref([]);
const colRules = ref([]);

const colors = ['red', 'purple', 'blue', 'cyan', 'green', 'amber', 'indigo'];

// 默认数据（作为 Fallback）
const DEFAULT_ROLES = [
  { id: 1, name: '超级管理员', code: 'SUPER_ADMIN', desc: '拥有系统所有权限', userCount: 1, isSystem: true, color: 'red', permissions: ['all'], rowPermissionId: 'all', columnPermissionId: 'all' },
  { id: 2, name: '运维工程师', code: 'OPS_ENGINEER', desc: '负责系统运维、日志管理', userCount: 2, isSystem: true, color: 'purple', permissions: ['rbac:log:view', 'config:management:view'], rowPermissionId: 'all', columnPermissionId: 'hide_sensitive' },
  { id: 3, name: '数据质量管理员', code: 'DATA_QA', desc: '负责数据质量监控与管理', userCount: 3, isSystem: false, color: 'blue', permissions: ['report:center', 'report:company:view', 'workspace:todo:view'], rowPermissionId: 'all', columnPermissionId: 'all' },
  { id: 4, name: '数据资产管理员', code: 'DATA_ASSET', desc: '负责数据资产盘点与管理', userCount: 1, isSystem: false, color: 'cyan', permissions: ['report:center', 'report:company:view', 'config:management:view'], rowPermissionId: 'all', columnPermissionId: 'hide_sensitive' },
  { id: 5, name: '财务BI', code: 'FINANCE_BI', desc: '财务部门数据分析师', userCount: 5, isSystem: false, color: 'green', permissions: ['report:center', 'report:company:view', 'report:bi:view'], rowPermissionId: 'profit_positive', columnPermissionId: 'all' },
  { id: 6, name: '业务BI', code: 'BUSINESS_BI', desc: '业务部门数据分析师', userCount: 8, isSystem: false, color: 'amber', permissions: ['report:center', 'report:ameba:view', 'report:store:view'], rowPermissionId: 'platform_taobao', columnPermissionId: 'all' },
];

const DEFAULT_PERMISSION_TREE = [
    { id: 'report', name: '数据分析', children: [
      { id: 'report:center', name: '经营仓中心' },
      { id: 'report:company', name: '公司经营仓', children: [
        { id: 'report:company:view', name: '查看' },
        { id: 'report:company:export', name: '导出' },
      ]},
      { id: 'report:ameba', name: '阿米巴经营仓', children: [
        { id: 'report:ameba:view', name: '查看' },
        { id: 'report:ameba:export', name: '导出' },
      ]},
      { id: 'report:store', name: '店铺经营仓', children: [
        { id: 'report:store:view', name: '查看' },
        { id: 'report:store:export', name: '导出' },
      ]},
      { id: 'report:bi', name: '数据看板', children: [
        { id: 'report:bi:view', name: '查看' },
        { id: 'report:bi:edit', name: '编辑' },
        { id: 'report:bi:export', name: '导出' },
      ]},
    ]},
    { id: 'workspace', name: '工作台', children: [
      { id: 'workspace:todo', name: '待办清单', children: [
        { id: 'workspace:todo:view', name: '查看' },
        { id: 'workspace:todo:edit', name: '编辑' },
      ]},
      { id: 'workspace:history', name: '历史记录', children: [
        { id: 'workspace:history:view', name: '查看' },
      ]},
    ]},
    { id: 'rbac', name: '权限中心', children: [
      { id: 'rbac:user', name: '用户管理', children: [
        { id: 'rbac:user:view', name: '查看' },
        { id: 'rbac:user:edit', name: '编辑' },
        { id: 'rbac:user:add', name: '新增' },
        { id: 'rbac:user:delete', name: '删除' },
      ]},
      { id: 'rbac:role', name: '角色管理', children: [
        { id: 'rbac:role:view', name: '查看' },
        { id: 'rbac:role:edit', name: '编辑' },
        { id: 'rbac:role:add', name: '新增' },
        { id: 'rbac:role:delete', name: '删除' },
      ]},
      { id: 'rbac:permission', name: '权限管理', children: [
        { id: 'rbac:permission:view', name: '查看' },
        { id: 'rbac:permission:edit', name: '编辑' },
      ]},
      { id: 'rbac:log', name: '操作日志', children: [
        { id: 'rbac:log:view', name: '查看' },
      ]},
    ]},
    { id: 'config', name: '系统设置', children: [
      { id: 'config:management', name: '配置管理', children: [
        { id: 'config:management:view', name: '查看' },
        { id: 'config:management:edit', name: '编辑' },
      ]},
    ]},
];

const DEFAULT_ROW_RULES = [
    { id: 'all', name: '全部数据', description: '不限制，可查看所有行' },
    { id: 'platform_taobao', name: '淘宝平台', description: '仅淘宝平台数据' },
    { id: 'profit_positive', name: '盈利数据', description: '仅利润>0的数据' },
];

const DEFAULT_COL_RULES = [
    { id: 'all', name: '全部字段', description: '可查看所有字段' },
    { id: 'hide_sensitive', name: '隐藏敏感字段', description: '隐藏标记为敏感的字段（成本、利润等）' },
    { id: 'basic_only', name: '仅基础字段', description: '只显示非数值类基础信息' },
];

// 弹窗状态
const modal = reactive({
  visible: false,
  type: 'add'
});

const form = reactive({
  id: null,
  name: '',
  code: '',
  desc: '',
  color: 'indigo',
  permissions: [],
  rowPermissionId: 'all',
  columnPermissionId: 'all',
  isSystem: false,
  userCount: 0
});

// ========== 生命周期 ==========
onMounted(() => {
  const win = window;
  // 初始化数据
  roles.value = (win.ROLES && win.ROLES.length > 0) ? win.ROLES : DEFAULT_ROLES;
  if (roles.value.length > 0) {
    selectedRole.value = roles.value[0];
  }
  
  // 转换权限树格式适配 a-tree
  const transformTree = (nodes) => {
    return nodes.map(node => ({
      key: node.id,
      title: node.name,
      children: node.children ? transformTree(node.children) : undefined
    }));
  };
  permissionTree.value = transformTree((win.PERMISSION_TREE && win.PERMISSION_TREE.length > 0) ? win.PERMISSION_TREE : DEFAULT_PERMISSION_TREE);
  
  rowRules.value = (win.ROW_PERMISSION_RULES && win.ROW_PERMISSION_RULES.length > 0) ? win.ROW_PERMISSION_RULES : DEFAULT_ROW_RULES;
  colRules.value = (win.COLUMN_PERMISSION_RULES && win.COLUMN_PERMISSION_RULES.length > 0) ? win.COLUMN_PERMISSION_RULES : DEFAULT_COL_RULES;
});

// ========== 方法 ==========
const selectRole = (role) => {
  selectedRole.value = role;
};

const getColorClass = (color) => {
  const map = {
    red: 'bg-red',
    purple: 'bg-purple',
    blue: 'bg-blue',
    cyan: 'bg-cyan',
    green: 'bg-green',
    amber: 'bg-amber',
    indigo: 'bg-indigo'
  };
  return map[color] || 'bg-indigo';
};

const getRowPermName = (id) => rowRules.value.find(r => r.id === id)?.name || '全部数据';
const getRowPermDesc = (id) => rowRules.value.find(r => r.id === id)?.description || '可查看所有数据';
const getColPermName = (id) => colRules.value.find(c => c.id === id)?.name || '全部字段';
const getColPermDesc = (id) => colRules.value.find(c => c.id === id)?.description || '可查看所有字段';

const openModal = (type, data = null) => {
  modal.type = type;
  modal.visible = true;
  if (type === 'edit' && data) {
    Object.assign(form, JSON.parse(JSON.stringify(data)));
  } else {
    // 重置表单
    form.id = null;
    form.name = '';
    form.code = '';
    form.desc = '';
    form.color = 'indigo';
    form.permissions = [];
    form.rowPermissionId = 'all';
    form.columnPermissionId = 'all';
    form.isSystem = false;
    form.userCount = 0;
  }
};

const closeModal = () => {
  modal.visible = false;
};

const handleSave = () => {
  if (!form.name || !form.code) {
    Message.warning('请填写角色名称和编码');
    return;
  }

  if (modal.type === 'add') {
    const newRole = {
      ...form,
      id: Date.now(),
      userCount: 0,
      isSystem: false
    };
    roles.value.push(newRole);
    selectedRole.value = newRole;
    Message.success('新增角色成功');
  } else {
    const index = roles.value.findIndex(r => r.id === form.id);
    if (index !== -1) {
      roles.value[index] = { ...form };
      if (selectedRole.value?.id === form.id) {
        selectedRole.value = { ...form };
      }
      Message.success('更新角色成功');
    }
  }
  closeModal();
};

const handleDelete = (role) => {
  if (role.isSystem) {
    Message.warning('系统内置角色不可删除');
    return;
  }
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除角色 "${role.name}" 吗？此操作不可恢复。`,
    onOk: () => {
      const index = roles.value.findIndex(r => r.id === role.id);
      if (index !== -1) {
        roles.value.splice(index, 1);
        if (selectedRole.value?.id === role.id) {
          selectedRole.value = roles.value.length > 0 ? roles.value[0] : null;
        }
        Message.success('删除成功');
      }
    }
  });
};
</script>

<style scoped>
.rbac-container {
  min-height: 100vh;
  padding: 12px 24px;
  background-color: var(--color-fill-2);
}

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

.content-wrapper {
  height: calc(100vh - 140px);
}

.main-row {
  height: 100%;
}

.h-full {
  height: 100%;
}

/* 列表样式 */
.list-card {
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.list-header {
  padding: 16px;
  border-bottom: 1px solid var(--color-fill-3);
}

.list-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.list-subtitle {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
  display: block;
}

.role-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.role-item {
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  border-left: 3px solid transparent;
}

.role-item-inner {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  width: 100%;
}

.role-item:hover {
  background-color: var(--color-fill-1);
}

.role-item.role-active {
  background-color: var(--color-primary-light-1);
  border-left-color: rgb(var(--primary-6));
}

.role-avatar {
  margin-right: 12px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid var(--color-fill-3);
}

.role-info {
  flex: 1;
  min-width: 0;
}

.role-name {
  font-size: 14px;
  color: var(--color-text-1);
  font-weight: 500;
}

.role-meta {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-3);
  font-size: 12px;
}

.role-item.role-active .role-count {
    color: rgb(var(--primary-6));
}

/* 详情样式 */
.detail-card {
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.detail-header {
  padding: 20px;
  border-bottom: 1px solid #f2f3f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-title-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.role-icon-wrapper.large {
  width: 48px;
  height: 48px;
  border-radius: 12px;
}

.detail-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.detail-code {
  margin: 2px 0 0;
  font-size: 12px;
  color: #86909c;
}

.detail-content {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section.bordered {
  border: 1px solid #f2f3f5;
  border-radius: 8px;
  padding: 16px;
}

.section-label {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 8px;
}

.section-text {
  font-size: 14px;
  color: #1d2129;
  line-height: 1.6;
  margin: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.section-title-text {
  font-weight: 500;
  color: #1d2129;
}

.permission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.perm-tag {
  border: none;
}

.data-perm-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.perm-box {
  padding: 12px;
  border-radius: 6px;
}

.perm-name {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
}

.perm-desc {
  font-size: 12px;
}

/* 颜色类 */
.bg-red { background-color: #ffece8; color: #f53f3f; }
.bg-purple { background-color: #f5e8ff; color: #722ed1; }
.bg-blue { background-color: #e8f3ff; color: #165dff; }
.bg-cyan { background-color: #e8fffb; color: #0fc6c2; }
.bg-green { background-color: #e8ffea; color: #00b42a; }
.bg-amber { background-color: #fff7e8; color: #ff7d00; }
.bg-indigo { background-color: #e8f3ff; color: #165dff; } /* Arco没有indigo，用blue代替或自定义 */

.text-indigo { color: #165dff; }
.text-blue { color: #165dff; }
.text-green { color: #00b42a; }
.text-blue-sub { color: #4080ff; }
.text-green-sub { color: #27c346; }

.bg-blue-light { background-color: #e8f3ff; }
.bg-green-light { background-color: #e8ffea; }

/* 空状态 */
.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c9cdd4;
}

.empty-content {
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

/* 弹窗样式 */
.color-picker {
  display: flex;
  gap: 8px;
}

.color-item {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
}

.color-item.active {
  border-color: #86909c;
}

.perm-tree-container {
  border: 1px solid #f2f3f5;
  border-radius: 8px;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.perm-select-box {
  border: 1px solid #f2f3f5;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
}

.box-header {
  font-weight: 500;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.box-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
}

.box-item {
  padding: 8px 12px;
  border: 1px solid #f2f3f5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.box-item:hover {
  background-color: #f7f8fa;
}

.box-item.active {
  background-color: #e8f3ff;
  border-color: #165dff;
}

.item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.item-name {
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
}

.item-desc {
  font-size: 12px;
  color: #86909c;
}

.mr-2 { margin-right: 8px; }
</style>
