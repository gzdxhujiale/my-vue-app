import { createRouter, createWebHashHistory } from 'vue-router'

// 主页（作品集）
import Portfolio from '../views/Portfolio.vue'

// 财务中心布局
import FinanceLayout from '../views/finance/FinanceLayout.vue'

// 财务中心子页面
import TodoList from '../views/finance/workspace/TodoList.vue'
import HistoryList from '../views/finance/workspace/HistoryList.vue'
import ReportCenter from '../views/finance/report/ReportCenter.vue'
import ReportCompany from '../views/finance/report/ReportCompany.vue'
import ReportAmeba from '../views/finance/report/ReportAmeba.vue'
import ReportStore from '../views/finance/report/ReportStore.vue'
import BiCenter from '../views/finance/report/BiCenter.vue'
import SelfServiceBi from '../views/finance/report/SelfServiceBi.vue'
import DashboardCompare from '../views/finance/report/DashboardCompare.vue'
import RbacUser from '../views/finance/rbac/RbacUser.vue'
import RbacRole from '../views/finance/rbac/RbacRole.vue'
import RbacPermission from '../views/finance/rbac/RbacPermission.vue'
import RbacLog from '../views/finance/rbac/RbacLog.vue'
import RbacApply from '../views/finance/rbac/RbacApply.vue'
import ConfigManagement from '../views/finance/config/ConfigManagement.vue'
import ConfigNotification from '../views/finance/config/ConfigNotification.vue'
import ConfigDictionary from '../views/finance/config/ConfigDictionary.vue'

// AI 工具布局
import AiLayout from '../views/ai/AiLayout.vue'
import AiAgent from '../views/ai/AiAgent.vue'
import AiCoding from '../views/ai/AiCoding.vue'
import AiWorkflow from '../views/ai/AiWorkflow.vue'

const routes = [
  {
    path: '/',
    name: 'Portfolio',
    component: Portfolio
  },
  {
    path: '/ai',
    component: AiLayout,
    redirect: '/ai/agent',
    children: [
      { path: 'agent', name: 'AiAgent', component: AiAgent },
      { path: 'coding', name: 'AiCoding', component: AiCoding },
      { path: 'workflow', name: 'AiWorkflow', component: AiWorkflow }
    ]
  },
  {
    path: '/finance',
    component: FinanceLayout,
    redirect: '/finance/todo',
    children: [
      // 工作台
      { path: 'todo', name: 'Todo', component: TodoList },
      { path: 'history', name: 'History', component: HistoryList },
      // 数据分析
      { path: 'report-center', name: 'ReportCenter', component: ReportCenter },
      { path: 'report-company', name: 'ReportCompany', component: ReportCompany },
      { path: 'report-ameba', name: 'ReportAmeba', component: ReportAmeba },
      { path: 'report-store', name: 'ReportStore', component: ReportStore },
      { path: 'bi-center', name: 'BiCenter', component: BiCenter },
      { path: 'self-service-bi', name: 'SelfServiceBi', component: SelfServiceBi },
      { path: 'dashboard-compare', name: 'DashboardCompare', component: DashboardCompare },
      // 权限中心
      { path: 'rbac-user', name: 'RbacUser', component: RbacUser },
      { path: 'rbac-role', name: 'RbacRole', component: RbacRole },
      { path: 'rbac-permission', name: 'RbacPermission', component: RbacPermission },
      { path: 'rbac-log', name: 'RbacLog', component: RbacLog },
      { path: 'rbac-apply', name: 'RbacApply', component: RbacApply },
      // 系统设置
      { path: 'config-management', name: 'ConfigManagement', component: ConfigManagement },
      { path: 'config-notification', name: 'ConfigNotification', component: ConfigNotification },
      { path: 'config-dictionary', name: 'ConfigDictionary', component: ConfigDictionary }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
