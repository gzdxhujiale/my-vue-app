<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  BotIcon, CodeIcon, GitBranchIcon, HomeIcon, MenuIcon, ChevronLeftIcon, ChevronRightIcon
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

const collapsed = ref(false)

const menuItems = [
  { path: '/ai/agent', label: 'AI Agent', icon: BotIcon },
  { path: '/ai/coding', label: 'AI Coding 小工具', icon: CodeIcon },
  { path: '/ai/workflow', label: 'AI 工作流', icon: GitBranchIcon }
]

const selectedKeys = computed(() => [route.path])

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
          v-for="item in menuItems"
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
        <button class="collapse-btn" @click="toggleCollapse">
          <component :is="collapsed ? ChevronRightIcon : ChevronLeftIcon" :size="20" />
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <header class="top-bar">
        <div class="breadcrumb">
          <span class="breadcrumb-item" @click="goHome">首页</span>
          <span class="separator">/</span>
          <span class="breadcrumb-item active">AI 工具</span>
          <span class="separator">/</span>
          <span class="breadcrumb-item current">{{ menuItems.find(i => i.path === route.path)?.label }}</span>
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
  justify-content: flex-end;
}

.collapse-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
}

.collapse-btn:hover {
  color: #475569;
  background-color: #f1f5f9;
}

.sidebar.collapsed .sidebar-footer {
  justify-content: center;
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
