<script setup>
  import { ref } from 'vue'
  import { IconUser } from '@arco-design/web-vue/es/icon'
  
  const historyData = ref([
    { id: 101, period: '2025.09', client: '橘子', platform: '淘宝', shop: '淘宝A店', date: '2025-10-01 14:30', user: '家乐' },
    { id: 102, period: '2025.09', client: '苹果', platform: '抖音', shop: '抖音A店', date: '2025-10-02 09:15', user: '家乐' },
    { id: 103, period: '2025.09', client: '香蕉', platform: '快手', shop: '快手B店', date: '2025-10-02 11:20', user: '系统自动' },
    { id: 104, period: '2025.08', client: '橘子', platform: '淘宝', shop: '淘宝C店', date: '2025-09-05 16:45', user: '家乐' },
  ])
  
  const columns = [
    { title: '完成时间', dataIndex: 'date', width: 180 },
    { title: '账期', dataIndex: 'period', width: 100 },
    { title: '客户', dataIndex: 'client', width: 100 },
    { title: '平台', dataIndex: 'platform', slotName: 'platform', width: 100 },
    { title: '店铺', dataIndex: 'shop' },
    { title: '操作人', dataIndex: 'user', slotName: 'user', width: 140 },
    { title: '状态', slotName: 'status', align: 'right', width: 100 }
  ]
  
  const getPlatformClass = (platform) => {
    if (platform === '淘宝') return 'platform-taobao'
    if (platform === '抖音') return 'platform-douyin'
    if (platform === '快手') return 'platform-kuaishou'
    return ''
  }
  </script>
  
  <template>
    <div class="page-container">
      <div class="content-wrapper">
        <div class="header">
          <h2 class="page-title">历史记录</h2>
          <p class="page-subtitle">查看已归档的任务记录</p>
        </div>
  
        <a-card class="table-card" :bordered="false">
          <a-table 
            :data="historyData" 
            :columns="columns" 
            :bordered="{ wrapper: false, cell: false }"
            :pagination="false"
            hoverable
          >
            <!-- 平台列样式 -->
            <template #platform="{ record }">
              <span class="platform-tag" :class="getPlatformClass(record.platform)">
                {{ record.platform }}
              </span>
            </template>
  
            <!-- 用户列样式 -->
            <template #user="{ record }">
              <div class="user-cell">
                <div class="user-avatar">
                  <IconUser size="12" />
                </div>
                <span class="user-name">{{ record.user }}</span>
              </div>
            </template>
  
            <!-- 状态列样式 -->
            <template #status>
               <span class="status-tag">已归档</span>
            </template>
          </a-table>
        </a-card>
      </div>
    </div>
  </template>
  
  <style scoped>
  .page-container {
    min-height: 100vh;
    background-color: var(--color-fill-2);
    padding: 32px;
  }
  
  .content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .header {
    margin-bottom: 24px;
  }
  
  .page-title {
    font-size: 24px;
    font-weight: bold;
    color: var(--color-text-1);
    margin: 0 0 8px 0;
  }
  
  .page-subtitle {
    color: var(--color-text-3);
    font-size: 14px;
    margin: 0;
  }
  
  .table-card {
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
  
  /* 平台标签自定义 */
  .platform-tag {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid;
  }
  
  .platform-taobao {
    background-color: rgb(255, 247, 237);
    color: rgb(234, 88, 12);
    border-color: rgb(255, 237, 213);
  }
  
  .platform-douyin {
    background-color: var(--color-fill-2);
    color: var(--color-text-2);
    border-color: var(--color-border-2);
  }
  
  .platform-kuaishou {
    background-color: rgb(254, 242, 242);
    color: rgb(220, 38, 38);
    border-color: rgb(254, 226, 226);
  }
  
  /* 用户列 */
  .user-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .user-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: var(--color-fill-3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-3);
  }
  
  .user-name {
    color: var(--color-text-2);
    font-size: 14px;
  }
  
  /* 状态列 */
  .status-tag {
    padding: 4px 10px;
    border-radius: 99px;
    font-size: 12px;
    font-weight: 600;
    background-color: var(--color-fill-2);
    color: var(--color-text-3);
    border: 1px solid var(--color-border-2);
  }
  </style>