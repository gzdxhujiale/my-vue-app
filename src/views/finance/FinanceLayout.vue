<script setup>
  import { ref, computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  // 引入 Lucide Vue 图标 (替换 Arco 图标)
  import {
    LayoutGridIcon, ListTodoIcon, HistoryIcon, BarChart3Icon, Building2Icon,
    PieChartIcon, ShoppingBagIcon, SettingsIcon, PresentationIcon, ShieldIcon,
    UsersIcon, UserCogIcon, KeyIcon, FileTextIcon, SendIcon, BellIcon, BookIcon,
    TableIcon, InfoIcon
  } from 'lucide-vue-next'
  
  const router = useRouter()
  const route = useRoute()
  
  const collapsed = ref(false)
  const showCopyrightModal = ref(true)
  
  // 菜单配置数据 (图标已替换为 Arco 组件)
  const menuGroups = [
    {
      title: '工作台',
      children: [
        { path: '/finance/todo', label: '待办清单', icon: ListTodoIcon },
        { path: '/finance/history', label: '历史记录', icon: HistoryIcon }
      ]
    },
    {
      title: '数据分析',
      children: [
        { 
          path: '/finance/report-center', 
          label: '经营仓中心', 
          icon: BarChart3Icon,
          children: [
            { path: '/finance/report-company', label: '公司经营仓', icon: Building2Icon },
            { path: '/finance/report-ameba', label: '阿米巴经营仓', icon: PieChartIcon },
            { path: '/finance/report-store', label: '店铺经营仓', icon: ShoppingBagIcon }
          ]
        },
        { 
          path: '/finance/bi-center', 
          label: '数据看板', 
          icon: PresentationIcon,
          children: [
            { path: '/finance/self-service-bi', label: '自助报表', icon: TableIcon },
            { path: '/finance/dashboard-compare', label: '对比分析', icon: BarChart3Icon }
          ]
        }
      ]
    },
    {
      title: '权限中心',
      children: [
        { 
          path: '/finance/rbac-center', // 父级菜单，不对应实际路由
          label: '权限管理', 
          icon: ShieldIcon,
          children: [
            { path: '/finance/rbac-user', label: '用户管理', icon: UsersIcon },
            { path: '/finance/rbac-role', label: '角色管理', icon: UserCogIcon },
            { path: '/finance/rbac-permission', label: '权限配置', icon: KeyIcon },
            { path: '/finance/rbac-log', label: '操作日志', icon: FileTextIcon },
            { path: '/finance/rbac-apply', label: '权限申请', icon: SendIcon }
          ]
        }
      ]
    },
    {
      title: '系统设置',
      children: [
        { path: '/finance/config-management', label: '配置管理', icon: SettingsIcon },
        { path: '/finance/config-notification', label: '通知设置', icon: BellIcon },
        { path: '/finance/config-dictionary', label: '数据字典', icon: BookIcon }
      ]
    }
  ]
  
  // 计算当前选中的菜单项 Key
  const selectedKeys = computed(() => {
    return [route.path]
  })
  
  // 路由跳转
  const handleMenuItemClick = (key) => {
    // key 就是路径本身
    const actualPath = key
    
    // 检查是否是父级菜单项（有子菜单的项）
    for (const group of menuGroups) {
      for (const item of group.children) {
        if (item.path === actualPath && item.children) {
          // 如果是父级菜单项，跳转到第一个子菜单
          router.push(item.children[0].path)
          return
        }
      }
    }
    
    // 普通菜单项直接跳转
    router.push(actualPath)
  }
  
  const goBack = () => router.push('/')
  const closeCopyrightModal = () => { showCopyrightModal.value = false }
  </script>
  
  <template>
    <div class="finance-layout-wrapper">
      <a-modal
        v-model:visible="showCopyrightModal"
        :footer="false"
        :width="420"
        title-align="start"
      >
        <template #title>关于本演示系统</template>
        <div class="copyright-content">
          <div class="copyright-icon">
            <InfoIcon :size="24" />
          </div>
          <p class="copyright-title">演示项目，旨在展示数据可视化及业务流程逻辑。</p>
          <ul class="copyright-list">
            <li>所有数据均为脱敏模拟数据，不涉及真实商业机密。</li>
            <li>离职后本人经复盘后重新构建，与原产品有较大差异。</li>
          </ul>
          <a-button type="primary" long @click="closeCopyrightModal">我已了解</a-button>
        </div>
      </a-modal>
  
      <a-layout class="layout-container">
        <a-layout-sider
          hide-trigger
          collapsible
          :collapsed="collapsed"
          :width="256"
          :collapsed-width="64"
          class="custom-sider"
        >
          <div class="sidebar-header">
            <div class="logo-wrapper" @click="collapsed = !collapsed">
              <div class="logo">
                <LayoutGridIcon :size="20" />
              </div>
            </div>
            <transition name="fade">
              <h1 v-show="!collapsed" class="logo-text">财务中心</h1>
            </transition>
            
            </div>
  
          <div class="menu-wrapper">
            <a-menu
              :selected-keys="selectedKeys"
              :collapsed="collapsed"
              :auto-open-selected="true"
              :level-indent="16"
              @menu-item-click="handleMenuItemClick"
            >
              <template v-for="group in menuGroups" :key="group.title">
                <a-menu-item-group v-if="!collapsed" :title="group.title">
                  <template v-for="item in group.children" :key="item.path">
                    
                    <a-sub-menu v-if="item.children" :key="item.path">
                      <template #icon><component :is="item.icon" /></template>
                      <template #title>{{ item.label }}</template>
                      
                      <a-menu-item v-for="sub in item.children" :key="sub.path">
                        <template #icon><component :is="sub.icon" /></template>
                        {{ sub.label }}
                      </a-menu-item>
                    </a-sub-menu>
  
                    <a-menu-item v-else :key="item.path">
                      <template #icon><component :is="item.icon" /></template>
                      {{ item.label }}
                    </a-menu-item>
  
                  </template>
                </a-menu-item-group>
  
                <template v-else>
                   <template v-for="item in group.children" :key="item.path">
                      <a-sub-menu v-if="item.children" :key="item.path">
                        <template #icon><component :is="item.icon" /></template>
                        <template #title>{{ item.label }}</template>
                        <a-menu-item v-for="sub in item.children" :key="sub.path">
                           {{ sub.label }}
                        </a-menu-item>
                      </a-sub-menu>
                      <a-menu-item v-else :key="item.path">
                        <template #icon><component :is="item.icon" /></template>
                        {{ item.label }}
                      </a-menu-item>
                   </template>
                </template>
  
              </template>
            </a-menu>
          </div>
  
          <div class="sidebar-footer">
            <div class="user-info" @click="goBack" title="返回首页">
              <div class="user-avatar">JL</div>
              <transition name="fade">
                <div v-show="!collapsed" class="user-detail">
                  <p class="user-name">家乐</p>
                  <p class="user-role">财务专员</p>
                </div>
              </transition>
            </div>
          </div>
        </a-layout-sider>
  
        <a-layout>
          <a-layout-content class="main-content-area">
             <router-view :key="$route.path" />
          </a-layout-content>
        </a-layout>
      </a-layout>
    </div>
  </template>
  
  <style scoped>
  .finance-layout-wrapper {
    height: 100vh;
    width: 100vw;
    background-color: var(--color-fill-2);
  }
  
  .layout-container {
    height: 100%;
  }
  
  /* Sider 自定义样式 */
  .custom-sider {
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.02);
    z-index: 10;
    background: var(--color-bg-2);
    display: flex;
    flex-direction: column;
  }
  
  /* 需要覆盖 Arco Sider 默认的 display:block 才能让 flex 生效 */
  :deep(.arco-layout-sider-children) {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .sidebar-header {
    height: 72px;
    padding: 0 16px; /* 匹配 collapsed-width 居中 */
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  
  .logo-wrapper {
    display: flex;
    justify-content: center;
    width: 32px; /* 对应 collapsed 状态下的宽度控制 */
  }
  
  .logo {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, rgb(var(--primary-6)), rgb(var(--primary-5)));
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(var(--primary-6), 0.3);
    transition: all 0.2s;
  }
  
  .logo:hover {
    transform: translateY(-1px);
  }
  
  .logo-text {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text-1);
    white-space: nowrap;
    margin: 0;
  }
  
  .menu-wrapper {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }
  
  /* 隐藏滚动条 */
  .menu-wrapper::-webkit-scrollbar {
    display: none;
  }
  
  /* 自定义 Arco Menu 样式以匹配原设计感 */
  :deep(.arco-menu-light) {
    background-color: transparent;
  }
  
  :deep(.arco-menu-item), :deep(.arco-menu-inline-header) {
    margin-bottom: 4px;
    border-radius: 8px;
  }
  
  /* 用户底部区域 */
  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid var(--color-border-1);
    flex-shrink: 0;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .user-info:hover {
    background-color: var(--color-fill-2);
  }
  
  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ec4899, #f43f5e);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
  }
  
  .user-detail {
    min-width: 0;
    overflow: hidden;
  }
  
  .user-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-1);
    margin: 0;
  }
  
  .user-role {
    font-size: 12px;
    color: var(--color-text-3);
    margin: 0;
  }
  
  /* 内容区域 */
  .main-content-area {
    padding: 12px;
    background-color: var(--color-fill-1);
    overflow-y: auto;
    height: 100%;
  }
  
  /* 弹窗内容样式 */
  .copyright-content {
    text-align: center;
    padding: 12px 0;
  }
  
  .copyright-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgb(var(--primary-1));
    color: rgb(var(--primary-6));
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }
  
  .copyright-title {
    font-weight: 600;
    color: var(--color-text-1);
    margin-bottom: 16px;
  }
  
  .copyright-list {
    background: var(--color-fill-2);
    border: 1px solid var(--color-border-2);
    border-radius: 8px;
    padding: 12px 16px 12px 32px;
    margin-bottom: 24px;
    text-align: left;
    font-size: 12px;
    color: var(--color-text-3);
  }
  
  .copyright-list li {
    margin-bottom: 4px;
  }
  
  /* 动画 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease, width 0.2s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    width: 0;
  }
  
  .page-fade-enter-active,
  .page-fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .page-fade-enter-from,
  .page-fade-leave-to {
    opacity: 0;
  }
  </style>