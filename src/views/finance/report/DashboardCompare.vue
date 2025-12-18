<script setup>
import { ConstructionIcon } from 'lucide-vue-next'
</script>

<template>
  <div class="page-container">
    <div class="maintenance-wrapper">
      <div class="maintenance-card">
        <ConstructionIcon :size="64" class="maintenance-icon" />
        <h2 class="maintenance-title">功能维护中</h2>
        <p class="maintenance-desc">该功能正在开发完善中，敬请期待</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container { 
  max-width: 1200px; 
  margin: 0 auto;
  padding: 24px;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.maintenance-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.maintenance-card {
  text-align: center;
  padding: 60px 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-width: 500px;
}

.maintenance-icon {
  color: #FF7D00;
  margin-bottom: 24px;
}

.maintenance-title {
  font-size: 24px;
  font-weight: 600;
  color: #1D2129;
  margin: 0 0 12px 0;
}

.maintenance-desc {
  font-size: 14px;
  color: #86909C;
  margin: 0;
}
</style>
