<template>
  <div class="rbac-container">
    <a-page-header :show-back="false" class="page-header">
      <template #title>
        <span class="header-title">权限申请中心</span>
      </template>
      <template #subtitle>
        统一管理数据与功能权限的申请、审批流转
      </template>
      <template #extra>
        <a-space>
          <a-input-search 
            v-model="searchText" 
            placeholder="搜索申请人/部门..." 
            style="width: 260px" 
            allow-clear
          />
          <a-button type="primary" @click="openDrawer('new')">
            <template #icon><icon-plus /></template>
            发起申请
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="content-wrapper">
      <a-row :gutter="20" class="stat-row">
        <a-col :span="6">
          <a-card class="stat-card" :bordered="false" hoverable>
            <a-statistic title="全部申请" :value="applications.length" show-group-separator>
              <template #suffix><span class="stat-unit">条</span></template>
            </a-statistic>
            <div class="stat-icon-bg bg-blue"><icon-apps /></div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card" :bordered="false" hoverable>
            <a-statistic title="待审批" :value="pendingCount" :value-style="{ color: '#ff7d00' }">
              <template #suffix><span class="stat-unit">条</span></template>
            </a-statistic>
            <div class="stat-icon-bg bg-orange"><icon-clock-circle /></div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card" :bordered="false" hoverable>
            <a-statistic title="已通过" :value="approvedCount" :value-style="{ color: '#00b42a' }">
              <template #suffix><span class="stat-unit">条</span></template>
            </a-statistic>
            <div class="stat-icon-bg bg-green"><icon-check-circle /></div>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card" :bordered="false" hoverable>
            <a-statistic title="已拒绝" :value="rejectedCount" :value-style="{ color: '#f53f3f' }">
              <template #suffix><span class="stat-unit">条</span></template>
            </a-statistic>
            <div class="stat-icon-bg bg-red"><icon-close-circle /></div>
          </a-card>
        </a-col>
      </a-row>

      <a-card class="list-card" :bordered="false">
        <a-tabs v-model:active-key="activeTab" type="rounded" size="medium" animation>
          <a-tab-pane key="pending">
            <template #title>
              待审批 <a-badge :count="pendingCount" :offset="[6, -2]" dot />
            </template>
          </a-tab-pane>
          <a-tab-pane key="approved" title="已通过" />
          <a-tab-pane key="rejected" title="已拒绝" />
          <a-tab-pane key="all" title="全部记录" />
        </a-tabs>

        <a-list 
          :data="filteredApps" 
          :bordered="false" 
          :pagination="paginationProps"
          class="custom-list"
        >
          <template #empty>
            <a-empty description="暂无相关申请记录" />
          </template>
          <template #item="{ item }">
            <a-list-item class="list-item-hover" action-layout="vertical">
              <template #actions>
                <a-space v-if="item.status === 'pending'">
                  <a-button type="text" status="success" size="small" @click="openApprovalModal('approve', item)">
                    <template #icon><icon-check /></template> 通过
                  </a-button>
                  <a-button type="text" status="danger" size="small" @click="openApprovalModal('reject', item)">
                    <template #icon><icon-close /></template> 拒绝
                  </a-button>
                  <a-divider direction="vertical" />
                  <a-button type="text" size="small" @click="openDrawer('view', item)">详情</a-button>
                </a-space>
                <a-button v-else type="secondary" size="small" @click="openDrawer('view', item)">
                  <template #icon><icon-eye /></template> 查看详情
                </a-button>
              </template>

              <a-list-item-meta>
                <template #avatar>
                  <a-avatar :style="{ backgroundColor: getAvatarColor(item.applicant) }" :size="48">
                    {{ item.applicant[0] }}
                  </a-avatar>
                </template>
                <template #title>
                  <div class="list-title-row">
                    <span class="item-name">{{ item.applicant }}</span>
                    <a-tag size="small" class="dept-tag">{{ item.department }}</a-tag>
                    <span class="item-time">{{ item.createTime }}</span>
                  </div>
                </template>
                <template #description>
                  <div class="list-desc-content">
                    <a-descriptions :column="2" layout="inline-horizontal" size="small" class="mini-desc">
                      <a-descriptions-item label="申请角色">
                        <a-space wrap size="mini">
                          <a-tag v-for="role in item.requestRoles" :key="role" color="arcoblue" size="small">
                            {{ role }}
                          </a-tag>
                        </a-space>
                      </a-descriptions-item>
                      <a-descriptions-item label="当前状态">
                        <a-tag :color="getStatusConfig(item.status).color" size="small" bordered>
                           <template #icon><component :is="getStatusConfig(item.status).icon" /></template>
                           {{ getStatusConfig(item.status).label }}
                        </a-tag>
                      </a-descriptions-item>
                    </a-descriptions>
                    <div class="reason-preview text-truncate">
                      <span class="label">理由：</span>{{ item.reason }}
                    </div>
                  </div>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </a-card>
    </div>

    <a-drawer 
      :visible="drawer.visible" 
      :width="520" 
      :title="drawer.type === 'new' ? '发起新申请' : '申请单详情'" 
      unmount-on-close
      @cancel="closeDrawer"
      @ok="handleDrawerOk"
      :footer="drawer.type === 'new'"
      ok-text="提交申请"
    >
      <div v-if="drawer.type === 'new'">
        <a-alert type="info" class="mb-20">请准确选择所需角色，并详细说明业务背景以加快审批。</a-alert>
        <a-form :model="formData" layout="vertical" ref="formRef">
          <a-form-item label="申请角色" field="requestRoles" required>
            <a-select 
              v-model="formData.requestRoles" 
              placeholder="请选择角色（可多选）" 
              multiple 
              allow-clear
              allow-search
            >
              <a-option v-for="role in roles" :key="role" :value="role">{{ role }}</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="申请理由" field="reason" required>
            <a-textarea 
              v-model="formData.reason" 
              placeholder="例如：因负责X项目数据分析，需申请Y数据的查看权限..." 
              :auto-size="{ minRows: 5, maxRows: 8 }"
              show-word-limit
              :max-length="200"
            />
          </a-form-item>
        </a-form>
      </div>

      <div v-else-if="drawer.type === 'view' && drawer.data" class="detail-container">
        <div class="status-banner" :class="drawer.data.status">
          <div class="status-icon-wrapper">
            <component :is="getStatusConfig(drawer.data.status).icon" size="24" />
          </div>
          <div class="status-info">
            <div class="status-title">{{ getStatusConfig(drawer.data.status).label }}</div>
            <div class="status-desc" v-if="drawer.data.status === 'pending'">正在等待管理员审核</div>
            <div class="status-desc" v-else>审批人：{{ drawer.data.approver || '系统自动' }}</div>
          </div>
        </div>

        <a-divider orientation="left">申请信息</a-divider>
        <a-descriptions :column="1" size="large" bordered table-layout="fixed">
          <a-descriptions-item label="申请人">{{ drawer.data.applicant }} ({{ drawer.data.department }})</a-descriptions-item>
          <a-descriptions-item label="申请时间">{{ drawer.data.createTime }}</a-descriptions-item>
          <a-descriptions-item label="目标角色">
             <a-tag v-for="r in drawer.data.requestRoles" :key="r" color="arcoblue" class="mr-4">{{ r }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="申请理由">
            <div class="reason-box">{{ drawer.data.reason }}</div>
          </a-descriptions-item>
        </a-descriptions>

        <a-divider orientation="left">审批流转</a-divider>
        <a-timeline>
          <a-timeline-item label="提交申请" :time="drawer.data.createTime">
            {{ drawer.data.applicant }} 发起流程
          </a-timeline-item>
          
          <a-timeline-item 
            v-if="drawer.data.status !== 'pending'" 
            :label="drawer.data.status === 'approved' ? '审批通过' : '审批拒绝'"
            :dot-color="drawer.data.status === 'approved' ? '#00B42A' : '#F53F3F'"
            :time="drawer.data.approveTime"
          >
            <div class="timeline-content">
              <span>操作人：{{ drawer.data.approver }}</span>
              <div class="timeline-comment" v-if="drawer.data.comment">
                <icon-message /> 意见：{{ drawer.data.comment }}
              </div>
            </div>
          </a-timeline-item>
          
          <a-timeline-item v-else label="等待审批" dot-color="var(--color-neutral-4)" line-type="dashed">
            当前处于待审批状态
          </a-timeline-item>
        </a-timeline>

        <div class="drawer-footer-actions" v-if="drawer.data.status === 'pending'">
          <a-button type="primary" status="success" long @click="openApprovalModal('approve', drawer.data)">
            <template #icon><icon-check /></template> 通过
          </a-button>
          <a-button type="primary" status="danger" long @click="openApprovalModal('reject', drawer.data)">
            <template #icon><icon-close /></template> 拒绝
          </a-button>
        </div>
      </div>
    </a-drawer>

    <a-modal 
      v-model:visible="approveModal.visible" 
      :title="approveModal.type === 'approve' ? '确认通过' : '确认拒绝'"
      :title-align="'start'"
      width="400px"
      @ok="handleApproveConfirm"
      @cancel="closeApprovalModal"
    >
      <div class="approve-content">
        <p v-if="approveModal.data">
          您正在对 <strong>{{ approveModal.data.applicant }}</strong> 的权限申请执行
          <span :class="approveModal.type === 'approve' ? 'text-success' : 'text-danger'">
            {{ approveModal.type === 'approve' ? '通过' : '拒绝' }}
          </span> 操作。
        </p>
        <a-textarea 
          v-model="approveComment" 
          placeholder="请输入审批意见（选填）" 
          class="mt-12"
          :auto-size="{ minRows: 3, maxRows: 3 }"
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
// 引入图标
import { 
  IconApps, IconClockCircle, IconCheckCircle, IconCloseCircle, 
  IconPlus, IconCheck, IconClose, IconEye, IconMessage, IconSearch
} from '@arco-design/web-vue/es/icon';

// ========== 模拟数据 (保持业务逻辑不变) ==========
const DEFAULT_ROLES = [
  '运维工程师', '数据质量管理员', '数据资产管理员', 
  '财务BI', '业务BI', '高层管理者'
];

const DEFAULT_APPLICATIONS = [
  { id: 1001, applicant: '张三', department: '财务部', currentRoles: ['财务BI'], requestRoles: ['数据资产管理员'], reason: '需要查看数据资产目录，进行财务数据血缘分析', status: 'pending', createTime: '2025-12-09 09:30', approver: null, approveTime: null, comment: null },
  { id: 1002, applicant: '李四', department: '运营部', currentRoles: ['业务BI'], requestRoles: ['高层管理者'], reason: '晋升为运营总监，需要查看全公司经营数据', status: 'pending', createTime: '2025-12-08 14:20', approver: null, approveTime: null, comment: null },
  { id: 1003, applicant: '王五', department: '技术部', currentRoles: ['运维工程师'], requestRoles: ['数据质量管理员'], reason: '负责数据质量监控系统开发，需要相关权限进行测试', status: 'approved', createTime: '2025-12-07 10:15', approver: '孙八', approveTime: '2025-12-07 16:30', comment: '同意，有效期3个月' },
  { id: 1004, applicant: '赵六', department: '数据部', currentRoles: ['数据资产管理员'], requestRoles: ['超级管理员'], reason: '临时需要超级管理员权限进行系统配置', status: 'rejected', createTime: '2025-12-06 11:00', approver: '孙八', approveTime: '2025-12-06 15:45', comment: '超级管理员权限不可申请，请联系系统管理员' },
];

// ========== 状态管理 ==========
const applications = ref([]);
const roles = ref([]);
const activeTab = ref('pending');
const searchText = ref(''); // 新增搜索状态

// 抽屉控制
const drawer = reactive({
  visible: false,
  type: '', // 'new' | 'view'
  data: null
});

// 审批弹窗控制
const approveModal = reactive({
  visible: false,
  type: '', 
  data: null
});
const approveComment = ref('');

// 表单数据
const formData = reactive({
  requestRoles: [],
  reason: ''
});

// 分页配置
const paginationProps = {
  pageSize: 5,
};

// ========== 生命周期 ==========
onMounted(() => {
  const win = window;
  applications.value = (win.APPLICATIONS && win.APPLICATIONS.length > 0) 
    ? win.APPLICATIONS 
    : DEFAULT_APPLICATIONS;
  
  const allRoles = (win.ROLE_NAMES && win.ROLE_NAMES.length > 0)
    ? win.ROLE_NAMES
    : DEFAULT_ROLES;
  roles.value = allRoles.filter(r => r !== '超级管理员');
});

// ========== 计算属性 ==========
const filteredApps = computed(() => {
  let result = applications.value;
  
  // Tab 过滤
  if (activeTab.value !== 'all') {
    result = result.filter(a => a.status === activeTab.value);
  }
  
  // 搜索过滤
  if (searchText.value) {
    const key = searchText.value.toLowerCase();
    result = result.filter(a => 
      a.applicant.toLowerCase().includes(key) || 
      a.department.toLowerCase().includes(key)
    );
  }
  return result;
});

const pendingCount = computed(() => applications.value.filter(a => a.status === 'pending').length);
const approvedCount = computed(() => applications.value.filter(a => a.status === 'approved').length);
const rejectedCount = computed(() => applications.value.filter(a => a.status === 'rejected').length);

// ========== 方法 ==========
const getStatusConfig = (status) => {
  const map = {
    pending: { label: '待审批', color: 'orange', icon: 'icon-clock-circle' },
    approved: { label: '已通过', color: 'green', icon: 'icon-check-circle' },
    rejected: { label: '已拒绝', color: 'red', icon: 'icon-close-circle' },
  };
  return map[status] || map.pending;
};

// 生成随机头像背景色
const getAvatarColor = (name) => {
  const colors = ['#165DFF', '#722ED1', '#F77234', '#00B42A', '#F53F3F', '#86909C'];
  const index = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[index];
};

// 打开抽屉
const openDrawer = (type, data = null) => {
  drawer.type = type;
  drawer.data = data;
  drawer.visible = true;
  if (type === 'new') {
    formData.requestRoles = [];
    formData.reason = '';
  }
};

const closeDrawer = () => {
  drawer.visible = false;
};

const handleDrawerOk = () => {
  if (drawer.type === 'new') handleSubmitNew();
  else closeDrawer();
};

// 提交新申请
const handleSubmitNew = () => {
  if (formData.requestRoles.length === 0 || !formData.reason) {
    Message.warning('请填写完整的申请信息');
    return;
  }
  
  const newApp = {
    id: Date.now(),
    applicant: '当前用户',
    department: '技术部', // Mock
    currentRoles: [],
    requestRoles: [...formData.requestRoles],
    reason: formData.reason,
    status: 'pending',
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    approver: null,
    approveTime: null,
    comment: null
  };
  
  applications.value = [newApp, ...applications.value];
  Message.success('申请已提交，请等待审批');
  closeDrawer();
  activeTab.value = 'pending';
};

// 打开审批弹窗
const openApprovalModal = (type, data) => {
  approveModal.type = type;
  approveModal.data = data;
  approveComment.value = '';
  approveModal.visible = true;
};

const closeApprovalModal = () => {
  approveModal.visible = false;
};

// 确认审批
const handleApproveConfirm = () => {
  const isApproved = approveModal.type === 'approve';
  const appId = approveModal.data.id;
  const index = applications.value.findIndex(a => a.id === appId);
  
  if (index !== -1) {
    const updatedApp = {
      ...applications.value[index],
      status: isApproved ? 'approved' : 'rejected',
      approver: 'Admin', // Mock
      approveTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      comment: approveComment.value || (isApproved ? '同意' : '不符合要求')
    };
    applications.value[index] = updatedApp;
    applications.value = [...applications.value]; // 触发更新
  }
  
  Message.success(isApproved ? '已通过该申请' : '已拒绝该申请');
  closeApprovalModal();
  if (drawer.visible) closeDrawer(); // 如果详情抽屉打开，也一并关闭
};
</script>

<style scoped>
.rbac-container {
  background-color: #f7f8fa; /* 统一的灰底背景 */
  min-height: 100vh;
}

.page-header {
  background: #fff;
  border-bottom: 1px solid #f2f3f5;
  padding: 16px 32px;
}

.header-title {
  font-size: 20px;
  font-weight: 500;
  color: #1d2129;
}

.content-wrapper {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 24px;
}

/* 统计卡片样式 */
.stat-row {
  margin-bottom: 24px;
}

.stat-card {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  transition: all 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stat-unit {
  font-size: 12px;
  color: #86909c;
  margin-left: 4px;
}

/* 统计图标背景装饰 */
.stat-icon-bg {
  position: absolute;
  right: -10px;
  top: -10px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  opacity: 0.12;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  pointer-events: none;
}
.bg-blue { background: #165DFF; color: #165DFF; }
.bg-orange { background: #FF7D00; color: #FF7D00; }
.bg-green { background: #00B42A; color: #00B42A; }
.bg-red { background: #F53F3F; color: #F53F3F; }

/* 列表卡片样式 */
.list-card {
  border-radius: 4px;
}

.list-item-hover {
  padding: 20px 16px;
  transition: background-color 0.2s;
}

.list-item-hover:hover {
  background-color: #fafafa;
}

.list-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.item-name {
  font-weight: 600;
  font-size: 16px;
  margin-right: 8px;
  color: #1d2129;
}

.item-time {
  margin-left: auto;
  color: #86909c;
  font-size: 13px;
}

.dept-tag {
  color: #4e5969;
}

/* 列表描述微调 */
.mini-desc :deep(.arco-descriptions-item-label) {
  padding-right: 8px;
  color: #86909c;
}

.reason-preview {
  margin-top: 10px;
  background: #f7f8fa;
  padding: 6px 12px;
  border-radius: 4px;
  color: #4e5969;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.reason-preview .label { color: #86909c; }

/* 详情抽屉样式 */
.detail-container {
  padding-bottom: 60px; /* 为底部固定按钮留出空间 */
}

.status-banner {
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.status-banner.pending { background: #fff7e8; color: #ff7d00; }
.status-banner.approved { background: #e8ffea; color: #00b42a; }
.status-banner.rejected { background: #ffece8; color: #f53f3f; }

.status-icon-wrapper {
  margin-top: 2px;
}

.status-title {
  font-size: 18px;
  font-weight: bold;
  line-height: 1.4;
}

.status-desc {
  font-size: 13px;
  opacity: 0.8;
  margin-top: 4px;
}

.reason-box {
  background: #f7f8fa;
  padding: 12px;
  border-radius: 4px;
  color: #1d2129;
  line-height: 1.5;
}

/* 时间轴内容 */
.timeline-content {
  background: #f7f8fa;
  padding: 8px 12px;
  border-radius: 4px;
  margin-top: 6px;
  font-size: 13px;
  color: #4e5969;
}

.timeline-comment {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed #e5e6eb;
  color: #1d2129;
  display: flex;
  align-items: center;
  gap: 4px;
}

.drawer-footer-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  background: #fff;
  border-top: 1px solid #f2f3f5;
  display: flex;
  gap: 16px;
  z-index: 10;
}

/* 辅助类 */
.mb-20 { margin-bottom: 20px; }
.mt-12 { margin-top: 12px; }
.mr-4 { margin-right: 8px; }
.text-success { color: #00b42a; font-weight: bold; }
.text-danger { color: #f53f3f; font-weight: bold; }
</style>