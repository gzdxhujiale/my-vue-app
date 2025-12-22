<script setup>
import { ref, computed, provide, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  BotIcon, CodeIcon, GitBranchIcon, HomeIcon, MenuIcon, ChevronLeftIcon, ChevronRightIcon
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

const collapsed = ref(false)

// 动态配置侧边栏导航
const sidebarConfig = [
  { path: '/ai/agent', label: 'AI Agent', icon: BotIcon },
  { path: '/ai/coding', label: 'AI Coding 小工具', icon: CodeIcon },
  { path: '/ai/workflow', label: 'AI 工作流', icon: GitBranchIcon }
]

// 面包屑扩展状态
const breadcrumbExtra = ref([])
const setBreadcrumbExtra = (items) => {
  breadcrumbExtra.value = items
}
provide('setBreadcrumbExtra', setBreadcrumbExtra)

// 监听路由变化，清空扩展面包屑（防止跨页面残留）
watch(() => route.path, () => {
  breadcrumbExtra.value = []
})

const handleMenuItemClick = (path) => {
  router.push(path)
}

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="ai-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed }">
      <div class="sidebar-header">
        <div class="logo-area" @click="goHome">
          <BotIcon class="logo-icon" />
          <span v-if="!collapsed" class="logo-text">AI 工具箱</span>
        </div>
      </div>

      <nav class="sidebar-menu">
        <div
          v-for="item in sidebarConfig"
          :key="item.path"
          class="menu-item"
          :class="{ active: route.path === item.path }"
          @click="handleMenuItemClick(item.path)"
        >
          <component :is="item.icon" class="menu-icon" :size="20" />
          <span v-if="!collapsed" class="menu-label">{{ item.label }}</span>
          <div v-if="route.path === item.path" class="active-indicator"></div>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="menu-item footer-home" @click="goHome">
          <HomeIcon class="menu-icon" :size="20" />
          <span v-if="!collapsed" class="menu-label">返回首页</span>
        </div>
        <button class="collapse-btn" @click="toggleCollapse">
          <component :is="collapsed ? ChevronRightIcon : ChevronLeftIcon" :size="20" />
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <header class="top-bar">
        <div class="breadcrumb">
          <span class="breadcrumb-item active">AI 工具</span>
          <span class="separator">/</span>
          
          <!-- 如果有扩展面包屑，则当前模块名为链接，否则为文本 -->
          <span 
            v-if="breadcrumbExtra.length > 0"
            class="breadcrumb-item link" 
            @click="router.push(route.path)"
          >
            {{ sidebarConfig.find(i => i.path === route.path)?.label }}
          </span>
          <span 
            v-else
            class="breadcrumb-item current"
          >
            {{ sidebarConfig.find(i => i.path === route.path)?.label }}
          </span>
          
          <template v-for="(item, index) in breadcrumbExtra" :key="index">
            <span class="separator">/</span>
            <span class="breadcrumb-item current">{{ item.label }}</span>
          </template>
        </div>
      </header>
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>
.ai-layout {
  display: flex;
  height: 100vh;
  background-color: #f8fafc;
  color: #334155;
}

/* 侧边栏样式 */
.sidebar {
  width: 240px;
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  z-index: 10;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e2e8f0;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 0 16px;
  width: 100%;
  justify-content: center;
}

.logo-icon {
  color: #10b981; /* Emerald-500 */
  width: 28px;
  height: 28px;
}

.logo-text {
  font-weight: 700;
  font-size: 18px;
  color: #0f172a;
  white-space: nowrap;
}

.sidebar-menu {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  color: #64748b;
}

.menu-item:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.menu-item.active {
  background-color: #ecfdf5; /* Emerald-50 */
  color: #059669; /* Emerald-600 */
}

.menu-icon {
  flex-shrink: 0;
}

.menu-label {
  margin-left: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
}

.active-indicator {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #10b981;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-home {
  flex: 1;
  margin-right: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.footer-home:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.sidebar.collapsed .footer-home {
  margin-right: 0;
  justify-content: center;
  padding: 8px;
}

.collapse-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-btn:hover {
  color: #475569;
  background-color: #f1f5f9;
}

.sidebar.collapsed .sidebar-footer {
  flex-direction: column;
  gap: 8px;
  padding: 16px 8px;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  height: 64px;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #64748b;
}

.breadcrumb-item {
  cursor: pointer;
}

.breadcrumb-item:hover {
  color: #0f172a;
}

.breadcrumb-item.active {
  cursor: default;
  color: #64748b;
}

.breadcrumb-item.link {
  cursor: pointer;
  color: #64748b;
  transition: color 0.2s;
}

.breadcrumb-item.link:hover {
  color: #10b981;
}

.breadcrumb-item.current {
  cursor: default;
  color: #0f172a;
  font-weight: 500;
}

.separator {
  margin: 0 8px;
  color: #cbd5e1;
}

.content-wrapper {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}



/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
