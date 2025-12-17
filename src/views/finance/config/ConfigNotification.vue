<script setup>
  import { reactive, h } from 'vue';
  
  // ----------------------------------------------------------------------
  // 图标组件 (使用 h 函数渲染 SVG，避免 JSX 插件依赖)
  // ----------------------------------------------------------------------
  const createIcon = (size, children, className = '') => {
      return () => h('svg', {
          xmlns: "http://www.w3.org/2000/svg",
          width: size,
          height: size,
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          class: className
      }, children);
  };
  
  const IconBell = createIcon("20", [
      h('path', { d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" }),
      h('path', { d: "M10.3 21a1.94 1.94 0 0 0 3.4 0" })
  ], "text-orange-600");
  
  const IconMail = createIcon("20", [
      h('rect', { width: "20", height: "16", x: "2", y: "4", rx: "2" }),
      h('path', { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" })
  ], "text-blue-600");
  
  const IconMessageSquare = createIcon("20", [
      h('path', { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" })
  ], "text-green-600");
  
  const IconAlertTriangle = (colorClass) => createIcon("20", [
      h('path', { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" }),
      h('path', { d: "M12 9v4" }),
      h('path', { d: "M12 17h.01" })
  ], colorClass);
  
  const IconSave = createIcon("18", [
      h('path', { d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" }),
      h('polyline', { points: "17 21 17 13 7 13 7 21" }),
      h('polyline', { points: "7 3 7 8 15 8" })
  ]);
  
  const IconTestTube = createIcon("16", [
      h('path', { d: "M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5h0c-1.4 0-2.5-1.1-2.5-2.5V2" }),
      h('path', { d: "M8.5 2h7" }),
      h('path', { d: "M14.5 16h-5" })
  ]);
  
  // ----------------------------------------------------------------------
  // 状态管理
  // ----------------------------------------------------------------------
  const settings = reactive({
      // 预算预警
      budgetWarningEnabled: true,
      budgetThreshold80: true,
      budgetThreshold90: true,
      budgetThreshold100: true,
      // 数据异常预警
      dataAnomalyEnabled: true,
      returnRateWarning: true,
      profitDropWarning: true,
      // 邮件通知
      emailEnabled: true,
      emailRecipients: 'finance@company.com, manager@company.com',
      emailFrequency: 'realtime',
      // 企微通知
      wechatEnabled: true,
      wechatWebhook: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx-xxx-xxx',
      wechatMentionAll: false,
  });
  
  // ----------------------------------------------------------------------
  // 交互逻辑
  // ----------------------------------------------------------------------
  const handleSave = () => {
      alert('设置已保存！');
      // 实际项目中这里会调用 API 保存 settings
  };
  
  const handleTest = (type) => {
      alert(`${type === 'email' ? '邮件' : '企微'}测试通知已发送！`);
  };
  
  </script>
  
  <template>
    <div class="page-container animate-fade-in">
      <!-- 头部 -->
      <div class="header mb-8 flex justify-between items-end">
        <div>
          <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <component :is="IconBell" />
            </div>
            通知设置
          </h2>
          <p class="text-slate-500 text-sm mt-1 ml-13">配置预算预警、数据异常告警及通知渠道</p>
        </div>
        <button @click="handleSave" class="btn-primary flex items-center gap-2">
          <component :is="IconSave" /> 保存设置
        </button>
      </div>
  
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- 1. 预算超支预警 -->
        <div class="card">
          <div class="card-header">
            <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <component :is="IconAlertTriangle('text-amber-600')" />
            </div>
            <div>
              <h3 class="font-bold text-slate-800">预算超支预警</h3>
              <p class="text-xs text-slate-400">当预算执行达到阈值时发送预警</p>
            </div>
            <div class="ml-auto">
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.budgetWarningEnabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div class="card-body" :class="{ 'opacity-50 pointer-events-none': !settings.budgetWarningEnabled }">
            
            <div class="setting-item bg-slate-50">
              <div>
                <div class="font-medium text-slate-700">预算执行率 ≥ 80%</div>
                <div class="text-xs text-slate-400">提前预警，提醒关注</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.budgetThreshold80" />
                <span class="toggle-slider"></span>
              </label>
            </div>
  
            <div class="setting-item bg-slate-50">
              <div>
                <div class="font-medium text-slate-700">预算执行率 ≥ 90%</div>
                <div class="text-xs text-slate-400">警告级别，需要控制支出</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.budgetThreshold90" />
                <span class="toggle-slider"></span>
              </label>
            </div>
  
            <div class="setting-item bg-red-50 border-red-100">
              <div>
                <div class="font-medium text-red-700">预算执行率 ≥ 100%</div>
                <div class="text-xs text-red-400">超支预警，立即处理</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.budgetThreshold100" />
                <span class="toggle-slider"></span>
              </label>
            </div>
  
          </div>
        </div>
  
        <!-- 2. 数据异常预警 -->
        <div class="card">
          <div class="card-header">
            <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <component :is="IconAlertTriangle('text-red-600')" />
            </div>
            <div>
              <h3 class="font-bold text-slate-800">数据异常预警</h3>
              <p class="text-xs text-slate-400">监控关键指标异常波动</p>
            </div>
            <div class="ml-auto">
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.dataAnomalyEnabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div class="card-body" :class="{ 'opacity-50 pointer-events-none': !settings.dataAnomalyEnabled }">
            
            <div class="setting-item bg-slate-50">
              <div>
                <div class="font-medium text-slate-700">退货率异常</div>
                <div class="text-xs text-slate-400">退货率环比上升超过 20%</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.returnRateWarning" />
                <span class="toggle-slider"></span>
              </label>
            </div>
  
            <div class="setting-item bg-slate-50">
              <div>
                <div class="font-medium text-slate-700">利润下降预警</div>
                <div class="text-xs text-slate-400">利润率环比下降超过 15%</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.profitDropWarning" />
                <span class="toggle-slider"></span>
              </label>
            </div>
  
          </div>
        </div>
  
        <!-- 3. 邮件通知 -->
        <div class="card">
          <div class="card-header">
            <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <component :is="IconMail" />
            </div>
            <div>
              <h3 class="font-bold text-slate-800">邮件通知</h3>
              <p class="text-xs text-slate-400">通过邮件发送预警通知</p>
            </div>
            <div class="ml-auto">
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.emailEnabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div class="card-body" :class="{ 'opacity-50 pointer-events-none': !settings.emailEnabled }">
            
            <div class="form-group">
              <label>收件人邮箱</label>
              <textarea 
                v-model="settings.emailRecipients" 
                rows="2"
                placeholder="多个邮箱用逗号分隔"
                class="form-input resize-none"
              ></textarea>
            </div>
  
            <div class="form-group">
              <label>发送频率</label>
              <select v-model="settings.emailFrequency" class="form-input bg-white">
                <option value="realtime">实时发送</option>
                <option value="hourly">每小时汇总</option>
                <option value="daily">每日汇总</option>
              </select>
            </div>
  
            <button @click="handleTest('email')" class="btn-outline-blue flex items-center justify-center gap-2">
              <component :is="IconTestTube" /> 发送测试邮件
            </button>
  
          </div>
        </div>
  
        <!-- 4. 企微通知 -->
        <div class="card">
          <div class="card-header">
            <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <component :is="IconMessageSquare" />
            </div>
            <div>
              <h3 class="font-bold text-slate-800">企业微信通知</h3>
              <p class="text-xs text-slate-400">通过企微机器人发送预警</p>
            </div>
            <div class="ml-auto">
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.wechatEnabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div class="card-body" :class="{ 'opacity-50 pointer-events-none': !settings.wechatEnabled }">
            
            <div class="form-group">
              <label>Webhook 地址</label>
              <input 
                type="text"
                v-model="settings.wechatWebhook" 
                placeholder="企微机器人 Webhook URL"
                class="form-input font-mono text-xs"
              />
            </div>
  
            <div class="setting-item bg-slate-50">
              <div>
                <div class="font-medium text-slate-700">@所有人</div>
                <div class="text-xs text-slate-400">紧急预警时 @所有人</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.wechatMentionAll" />
                <span class="toggle-slider"></span>
              </label>
            </div>
  
            <button @click="handleTest('wechat')" class="btn-outline-green flex items-center justify-center gap-2">
              <component :is="IconTestTube" /> 发送测试消息
            </button>
  
          </div>
        </div>
  
      </div>
    </div>
  </template>
  
  <style scoped>
  /* 全局基础重置 */
  * {
      box-sizing: border-box;
  }
  
  button {
      background: transparent;
      border: none;
      cursor: pointer;
  }
  
  /* 布局容器 */
  .page-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
  }
  
  /* Header */
  .ml-13 { margin-left: 3.25rem; }
  
  /* Grid */
  .grid { display: grid; }
  .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .gap-6 { gap: 1.5rem; }
  
  @media (min-width: 1024px) {
      .lg\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  
  /* Card Styles */
  .card {
      background-color: white;
      border-radius: 2rem; /* rounded-[2rem] */
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      border: 1px solid #f1f5f9; /* border-slate-100 */
      overflow: hidden;
      display: flex;
      flex-direction: column;
  }
  
  .card-header {
      padding: 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      gap: 0.75rem;
  }
  
  .card-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem; /* space-y-4 */
      transition: opacity 0.3s ease;
  }
  
  /* Setting Item (Rows inside cards) */
  .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-radius: 0.75rem; /* rounded-xl */
  }
  
  /* Form Elements */
  .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
  }
  
  .form-group label {
      display: block;
      font-size: 0.875rem; /* text-sm */
      font-weight: 500;
      color: #475569; /* text-slate-600 */
  }
  
  .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #e2e8f0; /* border-slate-200 */
      border-radius: 0.75rem; /* rounded-xl */
      font-size: 0.875rem; /* text-sm */
      outline: none;
      transition: box-shadow 0.2s;
  }
  
  .form-input:focus {
      box-shadow: 0 0 0 2px #e0e7ff; /* ring-indigo-100 */
      border-color: #a5b4fc; /* border-indigo-300 */
  }
  
  /* Buttons */
  .btn-primary {
      padding: 0.625rem 1.25rem;
      background-color: #4f46e5; /* bg-indigo-600 */
      color: white;
      border-radius: 0.75rem; /* rounded-xl */
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2);
      transition: all 0.2s;
  }
  .btn-primary:hover {
      background-color: #4338ca;
  }
  
  .btn-outline-blue {
      width: 100%;
      padding: 0.625rem 0;
      border: 1px solid #bfdbfe; /* border-blue-200 */
      color: #2563eb; /* text-blue-600 */
      border-radius: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background-color 0.2s;
  }
  .btn-outline-blue:hover {
      background-color: #eff6ff; /* hover:bg-blue-50 */
  }
  
  .btn-outline-green {
      width: 100%;
      padding: 0.625rem 0;
      border: 1px solid #bbf7d0; /* border-green-200 */
      color: #16a34a; /* text-green-600 */
      border-radius: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background-color 0.2s;
  }
  .btn-outline-green:hover {
      background-color: #f0fdf4; /* hover:bg-green-50 */
  }
  
  /* Toggle Switch (CSS from original file) */
  .toggle-switch {
      position: relative;
      width: 44px;
      height: 24px;
      display: inline-block;
  }
  .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
  }
  .toggle-slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background-color: #cbd5e1;
      transition: .3s;
      border-radius: 24px;
  }
  .toggle-slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .3s;
      border-radius: 50%;
  }
  input:checked + .toggle-slider {
      background-color: #6366f1;
  }
  input:checked + .toggle-slider:before {
      transform: translateX(20px);
  }
  
  /* Utilities */
  .bg-slate-50 { background-color: #f8fafc; }
  .bg-slate-100 { background-color: #f1f5f9; }
  .bg-red-50 { background-color: #fef2f2; }
  .bg-orange-100 { background-color: #ffedd5; }
  .bg-amber-100 { background-color: #fef3c7; }
  .bg-red-100 { background-color: #fee2e2; }
  .bg-blue-100 { background-color: #dbeafe; }
  .bg-green-100 { background-color: #dcfce7; }
  
  .text-slate-400 { color: #94a3b8; }
  .text-slate-500 { color: #64748b; }
  .text-slate-700 { color: #334155; }
  .text-slate-800 { color: #1e293b; }
  .text-orange-600 { color: #ea580c; }
  .text-amber-600 { color: #d97706; }
  .text-red-600 { color: #dc2626; }
  .text-red-700 { color: #b91c1c; }
  .text-red-400 { color: #f87171; }
  .text-blue-600 { color: #2563eb; }
  .text-green-600 { color: #16a34a; }
  
  .border-red-100 { border-color: #fee2e2; }
  
  .ml-auto { margin-left: auto; }
  .w-10 { width: 2.5rem; }
  .h-10 { height: 2.5rem; }
  .rounded-xl { border-radius: 0.75rem; }
  .flex { display: flex; }
  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
  .font-bold { font-weight: 700; }
  .font-medium { font-weight: 500; }
  .text-xs { font-size: 0.75rem; }
  .text-2xl { font-size: 1.5rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-8 { margin-bottom: 2rem; }
  .mt-1 { margin-top: 0.25rem; }
  .opacity-50 { opacity: 0.5; }
  .pointer-events-none { pointer-events: none; }
  .font-mono { font-family: monospace; }
  
  /* Animations */
  .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
  }
  @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
  }
  </style>