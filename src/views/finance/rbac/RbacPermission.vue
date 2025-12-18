<template>
  <a-layout class="permission-layout">
    <!-- 顶部通栏 -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-group">
          <div class="icon-wrapper">
            <icon-safe size="24" />
          </div>
          <div>
            <h1 class="page-title">权限配置中心</h1>
            <p class="page-subtitle">管理角色功能授权与数据访问策略</p>
          </div>
        </div>
        <div class="header-actions">
          <a-radio-group type="button" v-model="activeTab" size="large">
            <a-radio value="function">功能权限</a-radio>
            <a-radio value="data">数据权限</a-radio>
          </a-radio-group>
        </div>
      </div>
    </div>

    <a-layout class="page-body">
      <!-- 左侧边栏：角色列表 -->
      <a-layout-sider :width="280" class="role-sider">
        <div class="list-header">
          <h3 class="list-title">角色列表</h3>
          <span class="list-subtitle">点击查看详情</span>
        </div>
        <div class="role-list custom-scroll">
          <div 
            v-for="role in roles" 
            :key="role.id" 
            class="role-item"
            :class="{ 'role-active': selectedRole.id === role.id }"
            @click="handleRoleSelect(role)"
          >
            <div class="role-item-inner">
              <a-avatar 
                :size="32" 
                :style="{ backgroundColor: selectedRole.id === role.id ? 'rgb(var(--primary-6))' : '#F2F3F5', color: selectedRole.id === role.id ? '#FFF' : '#4E5969' }"
                class="role-avatar"
              >
                {{ role.name[0] }}
              </a-avatar>
              <div class="role-info">
                <div class="role-name">{{ role.name }}</div>
                <div class="role-meta">{{ role.desc }}</div>
              </div>
              <div class="role-count">
                <icon-lock size="14" />
                <span>{{ role.permissions.includes('all') ? 'All' : role.permissions.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </a-layout-sider>

      <!-- 右侧内容区 -->
      <a-layout-content class="content-area">
        <transition name="fade-slide" mode="out-in">
          
          <!-- 场景一：功能权限配置 -->
          <div v-if="activeTab === 'function'" key="function" class="view-container">
            <div class="view-header">
              <div class="view-title">
                <span class="title-text">功能菜单授权</span>
                <a-tag color="arcoblue" class="ml-2">{{ selectedRole.name }}</a-tag>
              </div>
              <a-space>
                <a-input-search v-model="searchText" placeholder="过滤菜单节点" style="width: 240px" allow-clear />
                <a-button @click="toggleAllNodes">
                  <template #icon><icon-expand /></template>
                  {{ isAllExpanded ? '折叠全部' : '展开全部' }}
                </a-button>
              </a-space>
            </div>
            
            <div class="view-body custom-scroll">
              <a-alert v-if="selectedRole.permissions.includes('all')" type="warning" show-icon class="mb-4">
                当前角色拥有 <b>超级管理员</b> 权限，默认拥有所有功能访问权，无需单独配置。
              </a-alert>
              
              <div class="permission-tree-wrap">
                <!-- 使用递归组件渲染树 -->
                <div v-for="node in permissionTree" :key="node.id">
                  <TreeNode 
                    :node="node" 
                    :level="0" 
                    :expanded-nodes="expandedNodes"
                    :selected-role="selectedRole"
                    :search-text="searchText"
                    @toggle="toggleExpand"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 场景二：数据权限配置 -->
          <div v-else key="data" class="view-container data-view-layout">
            <!-- 数据表列表 (Master) -->
            <div class="data-sider custom-scroll">
              <div class="ds-header">数据资源列表</div>
              <div class="ds-list">
                <div 
                  v-for="table in tables" 
                  :key="table.id"
                  class="ds-item"
                  :class="{ 
                    'ds-active': selectedTable === table.id && hasTableAccess(table.id),
                    'ds-disabled': !hasTableAccess(table.id)
                  }"
                  @click="hasTableAccess(table.id) && (selectedTable = table.id)"
                >
                  <div class="ds-status-dot" :class="hasTableAccess(table.id) ? 'bg-success' : 'bg-gray'"></div>
                  <div class="ds-info">
                    <div class="ds-name">{{ table.name }}</div>
                    <div class="ds-id">{{ table.id }}</div>
                  </div>
                  <div class="ds-icon">
                    <icon-lock v-if="!hasTableAccess(table.id)" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 详细配置与预览 (Detail) -->
            <div class="data-main custom-scroll">
              <div v-if="!selectedTable" class="empty-placeholder">
                <a-empty description="请从左侧选择一个数据表查看权限详情">
                  <template #image>
                    <div class="icon-empty-box">
                      <icon-storage size="48" />
                    </div>
                  </template>
                </a-empty>
              </div>

              <div v-else class="data-detail-wrap">
                <!-- 头部统计 (去除了大块蓝色，改为清爽风格) -->
                <div class="clean-stats-header">
                  <div class="stats-main">
                    <h3 class="stats-title">{{ getTableById(selectedTable).name }}</h3>
                    <p class="stats-sub">
                      行数: {{ (tableData[selectedTable] || []).length }} · 列数: {{ Object.keys(getTableById(selectedTable).fields).length }}
                    </p>
                  </div>
                  <div class="stats-cards">
                    <div class="mini-stat">
                      <div class="label">行级规则</div>
                      <div class="value text-primary">{{ getRowRuleName(selectedTable) }}</div>
                    </div>
                    <div class="v-divider"></div>
                    <div class="mini-stat">
                      <div class="label">列级规则</div>
                      <div class="value text-success">{{ getColRuleName(selectedTable) }}</div>
                    </div>
                  </div>
                </div>

                <!-- 规则与预览 -->
                <div class="dd-content">
                  
                  <!-- 过滤条件展示 -->
                  <div v-if="getCurrentRowRuleFilter(selectedTable)" class="filter-alert mb-6">
                    <icon-filter class="text-primary mr-2" />
                    <span>当前行级过滤条件：</span>
                    <span class="code-text">{{ getFilterDisplay(selectedTable) }}</span>
                  </div>

                  <!-- 字段权限矩阵 -->
                  <div class="section-block">
                    <div class="section-header">
                      <span class="section-title">字段可见性</span>
                      <div class="legend">
                        <span class="legend-item"><span class="dot green"></span>可见</span>
                        <span class="legend-item"><span class="dot orange"></span>敏感</span>
                        <span class="legend-item"><span class="dot gray"></span>隐藏</span>
                      </div>
                    </div>
                    <div class="field-matrix">
                      <a-tag 
                        v-for="(field, fieldId) in getTableById(selectedTable).fields" 
                        :key="fieldId"
                        class="field-tag"
                        :color="isColumnVisible(selectedTable, fieldId) ? (field.sensitive ? 'orange' : 'green') : 'gray'"
                        size="medium"
                        bordered
                      >
                        <template #icon>
                          <icon-eye-invisible v-if="field.sensitive && isColumnVisible(selectedTable, fieldId)" />
                          <icon-close v-if="!isColumnVisible(selectedTable, fieldId)" />
                          <icon-check v-if="isColumnVisible(selectedTable, fieldId) && !field.sensitive" />
                        </template>
                        {{ field.label }}
                      </a-tag>
                    </div>
                  </div>

                  <!-- 真实数据预览 -->
                  <div class="section-block">
                    <div class="section-header flex-between">
                      <span class="section-title">数据预览 (Top 10)</span>
                      <a-tag size="small">模拟数据</a-tag>
                    </div>
                    <a-table 
                      :data="getFilteredData(selectedTable).slice(0, 10)" 
                      :pagination="false" 
                      :bordered="{ cell: true }"
                      size="small"
                      class="preview-table"
                    >
                      <template #columns>
                        <a-table-column 
                          v-for="(field, fieldId) in getTableById(selectedTable).fields" 
                          :key="fieldId" 
                          :title="field.label"
                        >
                          <template #cell="{ record }">
                            <span v-if="isColumnVisible(selectedTable, fieldId)" :class="{'text-sensitive': field.sensitive}">
                              {{ typeof record[fieldId] === 'number' ? record[fieldId].toLocaleString() : record[fieldId] }}
                            </span>
                            <span v-else class="cell-masked">******</span>
                          </template>
                        </a-table-column>
                      </template>
                    </a-table>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </transition>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, reactive, onMounted, defineComponent, h } from 'vue';
import { 
  IconSafe, IconStorage, IconFolder, IconFile, IconRight, IconDown, 
  IconCheck, IconLock, IconFilter, IconLayout, 
  IconEyeInvisible, IconClose, IconSearch, IconExpand
} from '@arco-design/web-vue/es/icon';

// 递归树节点组件 (修复响应性问题)
const TreeNode = defineComponent({
  props: ['node', 'level', 'expandedNodes', 'selectedRole', 'searchText'],
  emits: ['toggle'],
  setup(props, { emit }) {
    // 权限判断逻辑
    const hasPermission = (nodeId) => {
        // 在 Render 函数中直接使用 props 确保响应性，这里仅作为辅助函数
        if (props.selectedRole.permissions.includes('all')) return true;
        return props.selectedRole.permissions.includes(nodeId);
    };

    const hasAnyChildPermission = (node) => {
        if (props.selectedRole.permissions.includes('all')) return true;
        if (hasPermission(node.id)) return true;
        if (node.children) return node.children.some(child => hasAnyChildPermission(child));
        return false;
    };

    return () => {
      // 关键修复：直接从 props 获取最新值，不要在 setup 顶部解构
      const { node, level, expandedNodes, searchText } = props;
      
      const isExpanded = expandedNodes.includes(node.id);
      const hasChildren = node.children && node.children.length > 0;
      const isFolder = node.icon === 'folder';
      const hasPerm = hasPermission(node.id);
      const hasChildPerm = hasAnyChildPermission(node);

      // 搜索过滤
      if (searchText && !node.name.includes(searchText) && !node.id.includes(searchText)) {
          if (!hasChildren || !node.children.some(c => c.name.includes(searchText) || c.id.includes(searchText))) return null;
      }

      return h('div', { class: 'tree-node-wrapper' }, [
        h('div', {
          class: `tree-row ${hasPerm ? 'row-active' : ''} ${!hasPerm && !hasChildPerm ? 'row-dimmed' : ''}`,
          style: { paddingLeft: `${level * 24 + 12}px` },
          onClick: () => {
             // 点击整行都可以切换展开状态
             if (hasChildren) emit('toggle', node.id);
          }
        }, [
          h('span', { class: 'tree-icon-expand mr-2' }, 
            hasChildren ? (isExpanded ? h(IconDown) : h(IconRight)) : h('span', { class: 'spacer' })
          ),
          
          // Checkbox for selection state
          // 优化：仅在叶子节点显示复选框，减少视觉干扰
          (!hasChildren) ? h('div', { class: `checkbox-wrapper mr-3 ${hasPerm ? 'checked' : ''}` }, [
             hasPerm ? h(IconCheck, { size: 12, style: { color: '#fff' } }) : null
          ]) : null,

          isFolder ? h(IconFolder, { class: 'tree-icon-type text-amber mr-2' }) : h(IconFile, { class: 'tree-icon-type text-gray mr-2' }),
          h('span', { class: 'tree-text flex-1' }, node.name),
          
          node.type === 'menu' && h('span', { class: 'type-tag' }, '菜单'),
          node.type === 'action' && h('span', { class: 'type-tag action' }, '操作')
        ]),
        (hasChildren && isExpanded) 
          ? h('div', { class: 'tree-children' }, node.children.map(child => h(TreeNode, {
              node: child,
              level: level + 1,
              expandedNodes,
              selectedRole: props.selectedRole, // 传递完整的 props
              searchText,
              onToggle: (id) => emit('toggle', id)
            })))
          : null
      ]);
    };
  }
});

// ========== 数据定义 (保留逻辑，仅模拟数据) ==========
const PERMISSION_TREE = [
    { id: 'report', name: '数据分析', icon: 'folder', children: [
      { id: 'report:center', name: '经营仓中心', icon: 'file', type: 'menu' },
      { id: 'report:company', name: '公司经营仓', icon: 'file', type: 'menu', children: [
        { id: 'report:company:view', name: '查看', type: 'action' },
        { id: 'report:company:export', name: '导出', type: 'action' },
      ]},
      { id: 'report:ameba', name: '阿米巴经营仓', icon: 'file', type: 'menu', children: [
        { id: 'report:ameba:view', name: '查看', type: 'action' },
        { id: 'report:ameba:export', name: '导出', type: 'action' },
      ]},
      { id: 'report:store', name: '店铺经营仓', icon: 'file', type: 'menu', children: [
        { id: 'report:store:view', name: '查看', type: 'action' },
        { id: 'report:store:export', name: '导出', type: 'action' },
      ]},
      { id: 'report:bi', name: '数据看板', icon: 'file', type: 'menu', children: [
        { id: 'report:bi:view', name: '查看', type: 'action' },
        { id: 'report:bi:edit', name: '编辑', type: 'action' },
        { id: 'report:bi:export', name: '导出', type: 'action' },
      ]},
    ]},
    { id: 'workspace', name: '工作台', icon: 'folder', children: [
      { id: 'workspace:todo', name: '待办清单', icon: 'file', type: 'menu', children: [
        { id: 'workspace:todo:view', name: '查看', type: 'action' },
        { id: 'workspace:todo:edit', name: '编辑', type: 'action' },
      ]},
      { id: 'workspace:history', name: '历史记录', icon: 'file', type: 'menu', children: [
        { id: 'workspace:history:view', name: '查看', type: 'action' },
      ]},
    ]},
    { id: 'rbac', name: '权限中心', icon: 'folder', children: [
      { id: 'rbac:user', name: '用户管理', icon: 'file', type: 'menu', children: [
        { id: 'rbac:user:view', name: '查看', type: 'action' },
        { id: 'rbac:user:add', name: '新增', type: 'action' },
        { id: 'rbac:user:edit', name: '编辑', type: 'action' },
        { id: 'rbac:user:delete', name: '删除', type: 'action' },
      ]},
      { id: 'rbac:role', name: '角色管理', icon: 'file', type: 'menu', children: [
        { id: 'rbac:role:view', name: '查看', type: 'action' },
        { id: 'rbac:role:add', name: '新增', type: 'action' },
        { id: 'rbac:role:edit', name: '编辑', type: 'action' },
        { id: 'rbac:role:delete', name: '删除', type: 'action' },
      ]},
      { id: 'rbac:permission', name: '权限管理', icon: 'file', type: 'menu', children: [
        { id: 'rbac:permission:view', name: '查看', type: 'action' },
        { id: 'rbac:permission:edit', name: '编辑', type: 'action' },
      ]},
    ]},
    { id: 'config', name: '系统设置', icon: 'folder', children: [
      { id: 'config:management', name: '配置管理', icon: 'file', type: 'menu', children: [
        { id: 'config:management:view', name: '查看', type: 'action' },
        { id: 'config:management:edit', name: '编辑', type: 'action' },
      ]},
    ]},
];

const ROLES = [
    { id: 1, name: '超级管理员', desc: '拥有系统所有权限', permissions: ['all'] },
    { id: 2, name: '运维工程师', desc: '负责系统运维、日志管理', permissions: ['rbac:log:view', 'config:management:view'] },
    { id: 3, name: '数据质量管理员', desc: '负责数据质量监控与管理', permissions: ['report:center', 'report:company:view', 'workspace:todo:view'] },
    { id: 4, name: '数据资产管理员', desc: '负责数据资产盘点与管理', permissions: ['report:center', 'report:company:view', 'config:management:view'] },
    { id: 5, name: '财务BI', desc: '财务部门数据分析师', permissions: ['report:center', 'report:company:view', 'report:bi:view'] },
    { id: 6, name: '业务BI', desc: '业务部门数据分析师', permissions: ['report:center', 'report:ameba:view', 'report:store:view'] },
];

const DATA_TABLES = [
    { 
      id: 'shop_sales', name: '店铺销售明细', 
      fields: {
        customer: { label: '客户', type: 'string', sensitive: false },
        platform: { label: '平台', type: 'string', sensitive: false },
        shopName: { label: '店铺', type: 'string', sensitive: false },
        gmv: { label: 'GMV', type: 'number', sensitive: false },
      }
    },
    { 
      id: 'finance_report', name: '财务报表', 
      fields: {
        customer: { label: '客户', type: 'string', sensitive: false },
        gmv: { label: '收入', type: 'number', sensitive: false },
        cost: { label: '成本', type: 'number', sensitive: true },
        profit: { label: '利润', type: 'number', sensitive: true },
      }
    },
    { 
      id: 'platform_analysis', name: '平台分析表', 
      fields: {
        platform: { label: '平台', type: 'string', sensitive: false },
        totalGmv: { label: '总GMV', type: 'number', sensitive: false },
        totalProfit: { label: '总利润', type: 'number', sensitive: true },
      }
    },
];

const ROW_PERMISSION_RULES = [
    { id: 'all', name: '全部数据', description: '不限制，可查看所有行' },
    { id: 'platform_taobao', name: '淘宝平台', description: '仅淘宝平台数据', filter: { field: 'platform', operator: 'eq', value: '淘宝' } },
    { id: 'profit_positive', name: '盈利数据', description: '仅利润>0的数据', filter: { field: 'profit', operator: 'gt', value: 0 } },
];

const COLUMN_PERMISSION_RULES = [
    { id: 'all', name: '全部字段', description: '可查看所有字段' },
    { id: 'hide_sensitive', name: '隐藏敏感字段', description: '隐藏标记为敏感的字段（成本、利润等）' },
    { id: 'basic_only', name: '仅基础字段', description: '只显示非数值类基础信息' },
];

const ROLE_DATA_PERMISSIONS = {
    1: { tables: { shop_sales: { access: true, rowRule: 'all', columnRule: 'all' }, finance_report: { access: true, rowRule: 'all', columnRule: 'all' }, platform_analysis: { access: true, rowRule: 'all', columnRule: 'all' } } },
    2: { tables: { platform_analysis: { access: true, rowRule: 'all', columnRule: 'hide_sensitive' } } },
    3: { tables: { shop_sales: { access: true, rowRule: 'all', columnRule: 'all' } } },
    4: { tables: { shop_sales: { access: true, rowRule: 'all', columnRule: 'all' }, finance_report: { access: true, rowRule: 'all', columnRule: 'hide_sensitive' } } },
    5: { tables: { finance_report: { access: true, rowRule: 'profit_positive', columnRule: 'all' } } },
    6: { tables: { shop_sales: { access: true, rowRule: 'platform_taobao', columnRule: 'all' } } },
};

const TABLE_DATA = {
    shop_sales: [
        { customer: '客户A', platform: '淘宝', shopName: '店铺1', gmv: 10000 },
        { customer: '客户B', platform: '抖音', shopName: '店铺2', gmv: 20000 },
        { customer: '客户C', platform: '快手', shopName: '店铺3', gmv: 15000 },
    ],
    finance_report: [
        { customer: '客户A', gmv: 10000, cost: 8000, profit: 2000 },
        { customer: '客户B', gmv: 20000, cost: 22000, profit: -2000 },
        { customer: '客户C', gmv: 15000, cost: 10000, profit: 5000 },
    ],
    platform_analysis: [
        { platform: '淘宝', totalGmv: 50000, totalProfit: 10000 },
        { platform: '抖音', totalGmv: 80000, totalProfit: 20000 },
    ]
};

// ========== Vue 组件逻辑 ==========
const activeTab = ref('function');
const selectedRole = ref(ROLES[0]);
const expandedNodes = ref(['report', 'workspace', 'rbac', 'config']);
const searchText = ref('');
const selectedTable = ref(null);

const permissionTree = ref(PERMISSION_TREE);
const roles = ref(ROLES);
const tables = ref(DATA_TABLES);
const rowRules = ref(ROW_PERMISSION_RULES);
const columnRules = ref(COLUMN_PERMISSION_RULES);
const roleDataPerms = ref(ROLE_DATA_PERMISSIONS);
const tableData = ref(TABLE_DATA);

const currentRoleDataPerm = computed(() => roleDataPerms.value[selectedRole.value.id] || { tables: {} });
const isAllExpanded = computed(() => expandedNodes.value.length > 5); // 简单判断

onMounted(() => {
    // 尝试从window同步数据
    if(window.PERMISSION_TREE) permissionTree.value = window.PERMISSION_TREE;
    if(window.ROLES) roles.value = window.ROLES;
    if(window.DATA_TABLES) tables.value = window.DATA_TABLES;
    if(window.ROW_PERMISSION_RULES) rowRules.value = window.ROW_PERMISSION_RULES;
    if(window.COLUMN_PERMISSION_RULES) columnRules.value = window.COLUMN_PERMISSION_RULES;
    if(window.ROLE_DATA_PERMISSIONS) roleDataPerms.value = window.ROLE_DATA_PERMISSIONS;
    if(window.TABLE_DATA) tableData.value = window.TABLE_DATA;
    
    selectedRole.value = roles.value[0];
});

const handleRoleSelect = (role) => {
    selectedRole.value = role;
    selectedTable.value = null;
};

const toggleExpand = (id) => {
    if (expandedNodes.value.includes(id)) {
        expandedNodes.value = expandedNodes.value.filter(n => n !== id);
    } else {
        expandedNodes.value.push(id);
    }
};

const toggleAllNodes = () => {
    if (isAllExpanded.value) {
        expandedNodes.value = [];
    } else {
        const getAllIds = (nodes) => {
            let ids = [];
            nodes.forEach(n => {
                ids.push(n.id);
                if (n.children) ids = ids.concat(getAllIds(n.children));
            });
            return ids;
        }
        expandedNodes.value = getAllIds(permissionTree.value);
    }
};

const hasTableAccess = (tableId) => {
    const perm = currentRoleDataPerm.value.tables[tableId];
    return perm && perm.access;
};

const getRowRuleName = (tableId) => {
    const perm = currentRoleDataPerm.value.tables[tableId];
    if (!perm) return '-';
    const rule = rowRules.value.find(r => r.id === perm.rowRule);
    return rule ? rule.name : '全部';
};

const getColRuleName = (tableId) => {
    const perm = currentRoleDataPerm.value.tables[tableId];
    if (!perm) return '-';
    const rule = columnRules.value.find(r => r.id === perm.columnRule);
    return rule ? rule.name : '全部';
};

const getRoleColor = (id) => {
    // 简单的颜色生成
    const colors = ['#165dff', '#00b42a', '#ff7d00', '#f53f3f', '#722ed1', '#009a29'];
    return colors[id % colors.length];
};

const getVisibleColumns = (tableId) => {
    const tablePerm = currentRoleDataPerm.value.tables[tableId];
    if (!tablePerm || !tablePerm.access) return [];
    const table = tables.value.find(t => t.id === tableId);
    if (!table) return [];
    
    const allFields = Object.keys(table.fields);
    if (tablePerm.columnRule === 'all') return allFields;
    if (tablePerm.columnRule === 'hide_sensitive') {
        return allFields.filter(f => !table.fields[f].sensitive);
    }
    if (tablePerm.columnRule === 'basic_only') {
        return allFields.filter(f => table.fields[f].type === 'string');
    }
    return allFields;
};

const isColumnVisible = (tableId, fieldId) => {
    return getVisibleColumns(tableId).includes(fieldId);
};

const getFilteredData = (tableId) => {
    const tablePerm = currentRoleDataPerm.value.tables[tableId];
    if (!tablePerm || !tablePerm.access) return [];
    const data = tableData.value[tableId] || [];
    if (tablePerm.rowRule === 'all' || !tablePerm.rowRule) return data;
    
    const rule = rowRules.value.find(r => r.id === tablePerm.rowRule);
    if (!rule || !rule.filter) return data;
    
    const { field, operator, value } = rule.filter;
    return data.filter(row => {
        if (operator === 'eq') return row[field] === value;
        if (operator === 'gt') return row[field] > value;
        if (operator === 'lt') return row[field] < value;
        return true;
    });
};

const getTableById = (id) => tables.value.find(t => t.id === id);

const getCurrentRowRuleFilter = (tableId) => {
    const perm = currentRoleDataPerm.value.tables[tableId];
    if(!perm) return null;
    const rule = rowRules.value.find(r => r.id === perm.rowRule);
    return rule && rule.filter ? rule : null;
};

const getFilterDisplay = (tableId) => {
    const rule = getCurrentRowRuleFilter(tableId);
    if(!rule) return '';
    const table = getTableById(tableId);
    const label = table.fields[rule.filter.field]?.label || rule.filter.field;
    const op = rule.filter.operator === 'eq' ? ' = ' : rule.filter.operator === 'gt' ? ' > ' : ' < ';
    return `${label}${op}"${rule.filter.value}"`;
};
</script>

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

/* 主体布局 */
.page-body {
  flex: 1;
  overflow: hidden;
  padding: 16px;
  background-color: var(--color-fill-2);
  display: flex;
  flex-direction: row;
  gap: 16px;
}

/* 左侧边栏 */
.role-sider {
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  overflow: hidden;
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

/* 内容区域 */
.content-area {
  background: #fff;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
}

.view-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
}

.view-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-1);
  display: flex;
  align-items: center;
}

.view-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* 功能权限树 */
.permission-tree-wrap {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px;
  background: #fff;
}

:deep(.tree-row) {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text-2);
  border: 1px solid transparent;
}

:deep(.tree-row:hover) { 
  background-color: var(--color-fill-2); 
}

:deep(.tree-row.row-active) { 
  /* 去除背景高亮，仅保留文字颜色变化，减少视觉干扰 */
  background-color: transparent; 
  color: rgb(var(--primary-6)); 
  font-weight: 500;
}

:deep(.tree-row.row-dimmed) { 
  opacity: 0.6; 
}

:deep(.checkbox-wrapper) {
  width: 16px;
  height: 16px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  transition: all 0.2s;
}

:deep(.checkbox-wrapper.checked) {
  background-color: rgb(var(--primary-6));
  border-color: rgb(var(--primary-6));
}

:deep(.spacer) { width: 16px; display: inline-block; }
:deep(.tree-icon-expand) { font-size: 12px; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; transition: background 0.2s; }
:deep(.tree-icon-expand:hover) { background-color: var(--color-fill-3); }

:deep(.tree-text) { font-size: 14px; font-weight: 500; }

:deep(.type-tag) {
  margin-left: auto;
  font-size: 12px;
  background-color: var(--color-fill-2);
  padding: 2px 8px;
  border-radius: 4px;
  color: var(--color-text-3);
}
:deep(.type-tag.action) {
  background-color: var(--color-primary-light-1);
  color: rgb(var(--primary-6));
}

/* 数据权限布局 */
.data-view-layout {
  flex-direction: row;
}

.data-sider {
  width: 240px;
  border-right: 1px solid var(--color-border);
  background-color: var(--color-fill-1);
  display: flex;
  flex-direction: column;
}

.ds-header {
  padding: 12px 16px;
  font-weight: 500;
  color: var(--color-text-3);
  font-size: 12px;
  border-bottom: 1px solid var(--color-border);
}

.ds-item {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  position: relative;
}

.ds-item:hover { background-color: var(--color-bg-2); }
.ds-item.ds-active { background-color: #fff; border-left: 3px solid rgb(var(--primary-6)); }
.ds-item.ds-active::after {
  content: '';
  position: absolute;
  right: -1px;
  top: 0; bottom: 0;
  width: 2px;
  background: #fff; /* Cover border right */
}

.ds-status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  margin-right: 10px;
}
.bg-success { background-color: rgb(var(--success-6)); }
.bg-gray { background-color: var(--color-text-4); }

.ds-info { flex: 1; min-width: 0; }
.ds-name { font-size: 14px; color: var(--color-text-1); font-weight: 500; margin-bottom: 2px; }
.ds-id { font-size: 12px; color: var(--color-text-3); font-family: monospace; }
.ds-icon { color: var(--color-text-4); font-size: 12px; }

/* 数据权限主内容 */
.data-main {
  flex: 1;
  background-color: #fff;
  overflow-y: auto;
}

.empty-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-empty-box {
  width: 80px; height: 80px;
  background: var(--color-fill-2);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-4);
  margin-bottom: 16px;
}

.data-detail-wrap {
  padding-bottom: 40px;
}

.clean-stats-header {
  padding: 24px 32px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background-color: #fff;
}

.stats-title { font-size: 20px; font-weight: 600; color: var(--color-text-1); margin: 0 0 8px 0; }
.stats-sub { color: var(--color-text-3); font-size: 13px; margin: 0; }

.stats-cards {
  display: flex;
  background: var(--color-fill-1);
  padding: 12px 20px;
  border-radius: 8px;
  align-items: center;
}

.mini-stat .label { font-size: 12px; color: var(--color-text-3); margin-bottom: 4px; }
.mini-stat .value { font-size: 15px; font-weight: 600; }
.text-primary { color: rgb(var(--primary-6)); }
.text-success { color: rgb(var(--success-6)); }
.v-divider { width: 1px; height: 24px; background: var(--color-border); margin: 0 20px; }

.dd-content { padding: 24px 32px; }

.filter-alert {
  background: var(--color-primary-light-1);
  border: 1px solid var(--color-primary-light-2);
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 13px;
  color: var(--color-text-2);
  display: flex;
  align-items: center;
}
.code-text { font-family: monospace; font-weight: 600; margin-left: 8px; color: rgb(var(--primary-6)); }

.section-block {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-1);
  border-left: 3px solid rgb(var(--primary-6));
  padding-left: 10px;
}

.legend { font-size: 12px; color: var(--color-text-3); }
.legend-item { margin-left: 12px; }
.dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 4px; vertical-align: middle; }
.dot.green { background: rgb(var(--success-6)); }
.dot.orange { background: rgb(var(--warning-6)); }
.dot.gray { background: var(--color-text-4); }

.field-matrix {
  background: var(--color-fill-1);
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.preview-table {
  border: 1px solid var(--color-border);
  border-radius: 4px;
}
.preview-table :deep(.arco-table-cell) { font-size: 13px; }
.text-sensitive { color: rgb(var(--warning-6)); }
.cell-masked { color: var(--color-text-4); letter-spacing: 2px; }

/* 通用工具类 */
.custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scroll::-webkit-scrollbar-thumb { background-color: var(--color-fill-3); border-radius: 3px; }
.custom-scroll::-webkit-scrollbar-track { background-color: transparent; }

.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateX(10px); }
.fade-slide-leave-to { opacity: 0; transform: translateX(-10px); }

.ml-2 { margin-left: 8px; }
.mr-2 { margin-right: 8px; }
</style>