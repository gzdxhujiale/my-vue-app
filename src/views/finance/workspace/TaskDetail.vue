<script setup>
    import { ref, computed } from 'vue'
    import { 
      IconClockCircle, IconCheckCircle, IconArrowLeft, IconFile, 
      IconDownload, IconDelete, IconUpload, IconUser, IconApps,
      IconCalendar, IconExclamationCircle, IconCopy
    } from '@arco-design/web-vue/es/icon'
    import { Message } from '@arco-design/web-vue'
    
    const props = defineProps({
      selectedItem: { type: Object, required: true },
      goBack: { type: Function, required: true }
    })
    
    // 生成文件名
    const generateFileName = (billType) => {
      return `${props.selectedItem.period}_${props.selectedItem.platform}_${props.selectedItem.shop}_${billType}.xlsx`
    }
    
    const fileDetailData = computed(() => [
      { id: 1, type: '资金账单', status: 'pending', size: '1.2MB', progress: 80 },
      { id: 2, type: '结算账单', status: 'pending', size: '450KB', progress: 0 },
      { id: 3, type: '订单管理', status: 'done', size: '5.6MB', progress: 100 },
    ].map(file => ({
      ...file,
      name: generateFileName(file.type)
    })))
    
    const handleDownload = (file) => console.log(`下载: ${file.name}`)
    const handleDelete = (file) => console.log(`删除: ${file.name}`)
    
    // 复制文件名
    const handleCopyFileName = async (file) => {
      try {
        await navigator.clipboard.writeText(file.name)
        Message.success(`已复制: ${file.name}`)
      } catch (err) {
        Message.error('复制失败')
        console.error('复制错误:', err)
      }
    }
    </script>
      
    <template>
      <div class="detail-wrapper">
        <!-- 导航栏 -->
        <div class="nav-bar">
          <div @click="goBack" class="back-btn">
            <div class="back-icon-box">
              <IconArrowLeft />
            </div>
            <span class="back-text">返回任务列表</span>
          </div>
          
          <a-space>
            <a-button>
              <template #icon><IconClockCircle /></template> 历史记录
            </a-button>
            <a-button type="primary">
              <template #icon><IconCheckCircle /></template> 标记完成
            </a-button>
          </a-space>
        </div>
    
        <!-- 栅格布局 -->
        <a-row :gutter="24">
          <!-- 左侧：文件列表 -->
          <a-col :span="16">
            <a-card :bordered="false" class="file-list-card">
              <div class="file-list-header">
                <div>
                  <div class="title">账单文件列表</div>
                  <div class="subtitle">需上传 3 个文件</div>
                </div>
                <a-tag>Total: {{ fileDetailData.length }}</a-tag>
              </div>
              
              <a-list :bordered="false" :split="false">
                <a-list-item v-for="f in fileDetailData" :key="f.id" class="file-item">
                  <div class="file-item-content">
                    <!-- 图标 -->
                    <div class="file-icon" :class="f.status === 'done' ? 'done' : 'pending'">
                      <IconFile size="20" />
                    </div>
    
                    <!-- 信息主体 -->
                    <div class="file-info">
                      <div class="file-main">
                        <div>
                          <div class="file-name">{{ f.name }}</div>
                          <a-space size="small" style="margin-top: 4px">
                            <span class="file-meta">{{ f.type }}</span>
                            <span class="dot"></span>
                            <span class="file-meta">{{ f.size }}</span>
                          </a-space>
                        </div>
                        
                        <!-- 按钮组 -->
                        <div class="file-actions">
                           <a-button v-if="f.status === 'done'" type="text" shape="circle" size="mini" @click="handleDownload(f)"><IconDownload /></a-button>
                           <a-button v-else type="text" shape="circle" size="mini" style="color: rgb(79, 70, 229)"><IconUpload /></a-button>
                           <a-button type="text" shape="circle" size="mini" @click="handleCopyFileName(f)" style="color: var(--color-text-3)">
                             <template #icon><IconCopy /></template>
                           </a-button>
                           <a-button type="text" status="danger" shape="circle" size="mini" @click="handleDelete(f)"><IconDelete /></a-button>
                        </div>
                      </div>
    
                      <!-- 进度条 -->
                      <div style="margin-top: 8px">
                        <div v-if="f.status === 'done'" class="status-done">
                          <IconCheckCircle /> 已上传完成
                        </div>
                        <div v-else class="progress-wrapper">
                          <a-progress 
                            :percent="f.progress/100" 
                            :color="{ '0%': 'rgb(99, 102, 241)', '100%': 'rgb(79, 70, 229)' }"
                            :show-text="false"
                            size="small"
                          />
                          <span class="progress-text">{{ f.progress }}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </a-list-item>
              </a-list>
            </a-card>
          </a-col>
    
          <!-- 右侧：固定信息区 -->
          <a-col :span="8">
            <a-space direction="vertical" size="large" fill>
              <!-- 任务信息卡片 -->
              <a-card :bordered="false" class="info-card">
                <div class="card-header">
                  <div>
                    <a-typography-title :heading="5" style="margin: 0 0 8px 0">{{ selectedItem.shop }}</a-typography-title>
                    <a-space size="small">
                      <a-tag :color="selectedItem.status === 'pending' ? 'orange' : 'green'">
                        {{ selectedItem.statusText }}
                      </a-tag>
                      <a-tag color="gray">{{ selectedItem.platform }}</a-tag>
                    </a-space>
                  </div>
                  <div class="icon-header">
                    <IconApps />
                  </div>
                </div>
                
                <div class="info-list">
                  <div class="info-item">
                    <span class="label"><IconUser /> 客户名称</span>
                    <span class="value">{{ selectedItem.client }}</span>
                  </div>
                  <a-divider style="margin: 8px 0" />
                  <div class="info-item">
                    <span class="label"><IconCalendar /> 账期</span>
                    <span class="value-tag">{{ selectedItem.period }}</span>
                  </div>
                  <template v-if="selectedItem.status === 'pending'">
                    <a-divider style="margin: 8px 0" />
                    <div class="info-item">
                      <span class="label"><IconExclamationCircle /> 剩余时间</span>
                      <span class="value-urgent">{{ selectedItem.deadlineText }}</span>
                    </div>
                  </template>
                </div>
              </a-card>
              
              <!-- 快速上传区 -->
              <a-card :bordered="false" title="快速上传" class="upload-card">
                <template #extra>
                  <a-typography-text type="secondary" style="font-size: 12px">.xlsx, .csv (Max 10MB)</a-typography-text>
                </template>
                
                <div class="upload-area">
                  <div class="upload-icon-circle">
                    <IconUpload size="24" />
                  </div>
                  <span class="upload-text">点击或拖拽上传</span>
                </div>
                
                <a-button type="primary" long style="margin-top: 16px; border-radius: 8px;" size="large">
                  提交所有文件
                </a-button>
              </a-card>
            </a-space>
          </a-col>
        </a-row>
      </div>
    </template>
      
    <style scoped>
    .detail-wrapper {
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    .nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .back-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 8px;
      transition: background-color 0.2s;
    }
    
    .back-btn:hover {
      background-color: var(--color-fill-2);
    }
    
    .back-icon-box {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--color-bg-2);
      border: 1px solid var(--color-border-2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-2);
    }
    
    .back-text {
      font-weight: 500;
      color: var(--color-text-2);
    }
    
    .info-card, .upload-card, .file-list-card {
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    
    .icon-header {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background-color: var(--color-fill-2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-3);
      font-size: 20px;
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
    }
    
    .label {
      color: var(--color-text-3);
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .value {
      color: var(--color-text-1);
      font-weight: 500;
      font-size: 13px;
    }
    
    .value-tag {
      font-family: monospace;
      background: var(--color-fill-2);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }
    
    .value-urgent {
      color: rgb(220, 38, 38);
      background: rgb(254, 242, 242);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
    
    .upload-area {
      border: 2px dashed var(--color-primary-light-2);
      background-color: var(--color-primary-light-1);
      border-radius: 8px;
      height: 140px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .upload-area:hover {
      background-color: var(--color-primary-light-2);
      border-color: var(--color-primary-light-3);
    }
    
    .upload-icon-circle {
      width: 48px;
      height: 48px;
      background: var(--color-bg-2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgb(79, 70, 229);
      margin-bottom: 12px;
    }
    
    .upload-text {
      color: rgb(49, 46, 129);
      font-weight: 500;
      font-size: 14px;
    }
    
    .file-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .file-list-header .title {
      font-weight: bold;
      font-size: 16px;
      color: var(--color-text-1);
    }
    
    .file-list-header .subtitle {
      color: var(--color-text-3);
      font-size: 12px;
      margin-top: 4px;
    }
    
    .file-item {
      padding: 12px;
      border: 1px solid var(--color-border-1);
      border-radius: 8px;
      margin-bottom: 12px;
      transition: all 0.2s;
      background-color: var(--color-bg-2);
    }
    
    .file-item:hover {
      border-color: var(--color-primary-light-3);
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    
    .file-item-content {
      display: flex;
      gap: 16px;
      align-items: center;
      width: 100%;
    }
    
    .file-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .file-icon.pending { background-color: rgb(224, 231, 255); color: rgb(79, 70, 229); }
    .file-icon.done { background-color: rgb(209, 250, 229); color: rgb(5, 150, 105); }
    
    .file-info {
      flex: 1;
      min-width: 0;
    }
    
    .file-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .file-name {
      font-size: 14px;
      font-weight: bold;
      color: var(--color-text-1);
      max-width: 450px;
      word-break: break-all;
    }
    
    .file-meta {
      font-size: 12px;
      color: var(--color-text-3);
    }
    
    .dot {
      width: 4px;
      height: 4px;
      background-color: var(--color-neutral-4);
      border-radius: 50%;
    }
    
    .status-done {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: rgb(5, 150, 105);
      font-weight: 500;
    }
    
    .progress-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .progress-text {
      font-size: 12px;
      font-weight: bold;
      color: rgb(79, 70, 229);
      width: 36px;
      text-align: right;
    }
    
    .file-actions {
      display: flex;
      gap: 4px;
    }
    </style>