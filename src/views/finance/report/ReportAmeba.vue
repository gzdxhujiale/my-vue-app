<script setup>
  import { ref, computed, nextTick, onMounted, onUnmounted, h, watch } from 'vue';
  import * as echarts from 'echarts';
  import { PieChartIcon } from 'lucide-vue-next';
  // 引入 Arco Design 图标 (仅使用已验证存在的图标)
  import {
    IconUser,
    IconSafe,
    IconApps,       // 替代仪表盘/占比
    IconLayers,
    IconCaretUp,    // 替代上升趋势
    IconCaretDown,  // 替代下降趋势
    IconDownload,
    IconRight,
    IconLeft,
    IconHome,
    IconPrinter,
    IconExport,
    IconBgColors,   // 替代利润相关
    IconBarChart    // 替代图表相关
  } from '@arco-design/web-vue/es/icon';
  
  // ================= 1. 核心数据定义 (Mock) =================
  const EXTRACTED_OPS_DATA = [
    { name: '运营部-淘宝', income: 7200000, profit: 1200000, manager: '张三' },
    { name: '运营部-抖音', income: 7600000, profit: 1350000, manager: '李四' },
    { name: '运营部-快手', income: 6800000, profit: 1050000, manager: '王五' }
  ];
  
  const COST_CENTERS = [
    { name: '商品部', income: 450000, profit: -50000, manager: '赵六' },
    { name: '开发部', income: 0, profit: -800000, manager: '钱七' },
    { name: '产研部', income: 0, profit: -1200000, manager: '孙八' },
    { name: '客服部', income: 0, profit: -300000, manager: '周九' },
    { name: '仓储部', income: 200000, profit: -150000, manager: '吴十' },
    { name: '人事部', income: 0, profit: -250000, manager: '郑十一' },
    { name: '财务部', income: 0, profit: -200000, manager: '卫十二' },
  ];
  
  const ROLES = [
    { id: 'admin', name: '超级管理员', desc: '全权限', color: '#165DFF' },
    { id: 'finance', name: '财务BP', desc: '审计视角', color: '#00B42A' },
    { id: 'operation', name: '业务运营', desc: '经营视角', color: '#FF7D00' }
  ];
  
  // ================= 2. 状态管理 =================
  const selectedYear = ref('2025');
  const selectedMonth = ref('all');
  const selectedAmeba = ref(null);
  const currentRole = ref('admin'); 
  const activeTab = ref('statement'); // 详情页 Tab 状态: statement | trend | structure
  const detailModalItem = ref(null);
  const modalVisible = ref(false);
  
  // 图表 DOM 引用
  const trendChartRef = ref(null);
  const pieChartRef = ref(null);
  let trendChartInstance = null;
  let pieChartInstance = null;
  
  // ================= 3. 计算属性与逻辑 =================
  const isSensitiveHidden = computed(() => currentRole.value === 'operation');
  
  const periodLabel = computed(() => 
    `${selectedYear.value}年 ${selectedMonth.value === 'all' ? '全年' : selectedMonth.value + '月'}`
  );
  
  // 工具函数：数字格式化
  const safeLocaleString = (val) => (val !== undefined && val !== null) ? val.toLocaleString() : '0';
  
  // 主列表数据计算
  const currentAmebaData = computed(() => {
    const factor = selectedMonth.value === 'all' ? 1 : (1/12);
    const allDepts = [...EXTRACTED_OPS_DATA, ...COST_CENTERS];
  
    return allDepts.map((dept, index) => {
      let income = Math.floor(dept.income * factor);
      let directCost, allocatedCost;
      if (dept.name.includes('运营')) {
        directCost = Math.floor(income * 0.75); 
        allocatedCost = Math.floor(income * 0.08);
      } else {
        const baseLoss = Math.abs(dept.profit * factor);
        directCost = Math.floor(baseLoss * 0.7);
        allocatedCost = Math.floor(baseLoss * 0.3);
      }
      const totalCost = directCost + allocatedCost;
      const profit = income - totalCost;
  
      return {
        id: index + 1,
        group: dept.name,
        manager: dept.manager,
        income,
        directCost,
        allocatedCost,
        totalCost,
        profit,
        ratio: income > 0 ? (profit / income * 100).toFixed(1) + '%' : '0%',
      };
    }).sort((a, b) => b.profit - a.profit);
  });
  
  // 全局 KPI
  const totalProfit = computed(() => currentAmebaData.value.reduce((acc, curr) => acc + curr.profit, 0));
  const avgRatio = computed(() => {
    const count = currentAmebaData.value.filter(d => d.income > 0).length;
    if (count === 0) return 0;
    const totalR = currentAmebaData.value.reduce((acc, curr) => acc + (curr.income > 0 ? parseFloat(curr.ratio) : 0), 0);
    return parseFloat((totalR / count).toFixed(1));
  });
  
  // KPI 卡片配置 (仿 Store 风格，修复图标引用)
  const metricCards = computed(() => [
    { 
      key: 'units', 
      title: '核算单元总数', 
      value: currentAmebaData.value.length + ' 个', 
      icon: IconLayers, 
      bgClass: 'bg-white', 
      textClass: 'text-gray', 
      iconClass: 'text-blue bg-blue-light' 
    },
    { 
      key: 'profit', 
      title: '累计核算利润', 
      value: isSensitiveHidden.value ? '***' : `¥ ${safeLocaleString(totalProfit.value)}`, 
      icon: IconBgColors, 
      bgClass: 'bg-white', 
      textClass: 'text-gray', 
      iconClass: 'text-green bg-green-light' 
    },
    { 
      key: 'ratio', 
      title: '平均利润率', 
      value: isSensitiveHidden.value ? '***' : `${avgRatio.value}%`, 
      icon: IconApps, // 修复：替换 IconPieChart 为 IconApps
      bgClass: 'bg-white', 
      textClass: 'text-gray', 
      iconClass: 'text-orange bg-orange-light' 
    }
  ]);
  
  // 面包屑路径计算 (仿 Store 风格)
  const viewPath = computed(() => {
    const path = [{ name: '经营核算总览', id: 'root' }];
    if (selectedAmeba.value) {
      path.push({ name: selectedAmeba.value.group, id: 'detail' });
    }
    return path;
  });
  
  const navigateTo = (index) => {
    const target = viewPath.value[index];
    if (target.id === 'root') {
      goBack();
    }
  };
  
  // 详情页数据 Mock
  const detailData = computed(() => {
    if (!selectedAmeba.value) return null;
    const item = selectedAmeba.value;
    
    // 模拟月度趋势
    const trend = Array.from({ length: 12 }, (_, i) => {
      const baseIncome = item.income / (selectedMonth.value === 'all' ? 1 : 12);
      const mIncome = Math.floor((baseIncome / 12) * (0.8 + Math.random() * 0.4));
      const mCost = Math.floor(mIncome * 0.85);
      return { 
        month: `${i + 1}月`, 
        income: mIncome, 
        cost: mCost, 
        profit: mIncome - mCost 
      };
    });
  
    // 模拟成本结构
    const costStructure = [
      { name: '人力成本', value: 40, itemStyle: { color: '#165DFF' } }, 
      { name: '营销推广', value: 30, itemStyle: { color: '#00B42A' } }, 
      { name: '办公分摊', value: 15, itemStyle: { color: '#FF7D00' } }, 
      { name: '其他杂项', value: 15, itemStyle: { color: '#86909C' } }
    ];
  
    // 模拟 P&L 树形表格数据
    const budgetFactor = 1.05; 
    const lastYearFactor = 0.9; 
  
    const createRow = (key, name, value, isGroup = false, children = null) => {
      const budget = Math.floor(value * budgetFactor);
      const lastYear = Math.floor(value * lastYearFactor);
      return {
        key,
        name,
        value,
        budget,
        lastYear,
        diff: value - budget, 
        yoy: ((value - lastYear) / lastYear * 100).toFixed(1),
        isGroup,
        children
      };
    };
  
    const incomeRow = createRow('1', '一、经营收入', item.income, true);
    
    const costChildren = [
      createRow('2-1', '人力成本', Math.floor(item.directCost * 0.6)),
      createRow('2-2', '业务费用', Math.floor(item.directCost * 0.3)),
      createRow('2-3', '其他直接支出', Math.floor(item.directCost * 0.1)),
    ];
    const costRow = createRow('2', '二、可控成本', item.directCost, true, costChildren);
    
    const marginRow = createRow('3', '三、边际贡献', item.income - item.directCost, true); 
    
    const allocatedRow = createRow('4', '四、分摊/交易成本', item.allocatedCost, true);
    
    const profitRow = createRow('5', '五、核算利润', item.profit, true); 
  
    return { 
      trend, 
      costStructure, 
      pnlTable: [incomeRow, costRow, marginRow, allocatedRow, profitRow] 
    };
  });
  
  // P&L 表格列配置
  const pnlColumns = [
    { title: '核算科目', dataIndex: 'name', width: 200 },
    { title: '本期实际', dataIndex: 'value', align: 'right', slotName: 'value' },
    { title: '本期预算', dataIndex: 'budget', align: 'right', slotName: 'budget' },
    { title: '预算差异', dataIndex: 'diff', align: 'right', slotName: 'diff' },
    { title: '去年同期', dataIndex: 'lastYear', align: 'right', slotName: 'lastYear' },
    { title: '同比增长', dataIndex: 'yoy', align: 'right', slotName: 'yoy', width: 100 },
  ];
  
  const modalTableData = computed(() => {
    if (!detailModalItem.value) return [];
    const total = detailModalItem.value.value;
    const name = detailModalItem.value.name;
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      date: `2025-10-${10 + i}`,
      desc: `${name} - 专项业务明细 #${1001 + i}`,
      type: name.includes('收入') ? '入账' : '支出',
      user: ['张三', '李四', '王五'][i % 3],
      amount: Math.floor(total / 10 * (0.8 + Math.random() * 0.4))
    }));
  });
  
  // 主页表格配置 
  const tableColumns = [
    { 
      title: '阿米巴单元', 
      dataIndex: 'group', 
      slotName: 'group',
    },
    { 
      title: '总收入', 
      dataIndex: 'income', 
      align: 'right', 
      slotName: 'income',
      sortable: {
        sortDirections: ['descend', 'ascend'],
        sorter: (a, b) => a.income - b.income
      }
    },
    { 
      title: '可控成本', 
      dataIndex: 'directCost', 
      align: 'right', 
      slotName: 'directCost',
      sortable: {
        sortDirections: ['descend', 'ascend'],
        sorter: (a, b) => a.directCost - b.directCost
      }
    },
    { 
      title: '分摊成本', 
      dataIndex: 'allocatedCost', 
      align: 'right', 
      slotName: 'allocatedCost',
      sortable: {
        sortDirections: ['descend', 'ascend'],
        sorter: (a, b) => a.allocatedCost - b.allocatedCost
      }
    },
    { 
      title: '核算利润', 
      dataIndex: 'profit', 
      align: 'right', 
      slotName: 'profit', 
      sortable: { 
        sortDirections: ['descend', 'ascend'],
        sorter: (a, b) => a.profit - b.profit
      } 
    },
    { 
      title: '利润率', 
      dataIndex: 'ratio', 
      align: 'right', 
      slotName: 'ratio',
      sortable: {
        sortDirections: ['descend', 'ascend'],
        sorter: (a, b) => parseFloat(a.ratio) - parseFloat(b.ratio)
      }
    },
    { title: '操作', align: 'center', width: 80, slotName: 'action' }
  ];
  
  // ================= 5. ECharts 渲染逻辑 =================
  const renderCharts = () => {
    if (!detailData.value) return;
  
    // 1. 趋势图
    if (trendChartRef.value) {
      if (trendChartInstance) trendChartInstance.dispose();
      trendChartInstance = echarts.init(trendChartRef.value);
      
      const xData = detailData.value.trend.map(d => d.month);
      const incomeData = detailData.value.trend.map(d => d.income);
      const costData = detailData.value.trend.map(d => d.cost);
      const profitData = detailData.value.trend.map(d => d.profit);
  
      const option = {
        title: { text: '月度经营趋势', left: 'center' },
        tooltip: { trigger: 'axis' },
        legend: { data: ['收入', '成本', '利润'], bottom: 0 },
        grid: { top: 40, left: 10, right: 10, bottom: 30, containLabel: true },
        xAxis: { type: 'category', data: xData },
        yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
        series: [
          { name: '收入', type: 'line', data: incomeData, smooth: true, itemStyle: { color: '#165DFF' }, lineStyle: { width: 3 } },
          !isSensitiveHidden.value ? { name: '成本', type: 'line', data: costData, smooth: true, itemStyle: { color: '#F53F3F' }, lineStyle: { type: 'dashed' } } : null,
          !isSensitiveHidden.value ? { name: '利润', type: 'bar', data: profitData, itemStyle: { color: '#00B42A' }, barWidth: 12, itemStyle: { borderRadius: [4, 4, 0, 0] } } : null
        ].filter(Boolean)
      };
      trendChartInstance.setOption(option);
    }
  
    // 2. 饼图
    if (pieChartRef.value) {
      if (pieChartInstance) pieChartInstance.dispose();
      pieChartInstance = echarts.init(pieChartRef.value);
      
      const optionPie = {
        title: { text: '成本结构分布', left: 'center' },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left', bottom: 10 },
        series: [
          {
            name: '成本结构',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
            label: { show: false, position: 'center' },
            emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
            labelLine: { show: false },
            data: detailData.value.costStructure
          }
        ]
      };
      pieChartInstance.setOption(optionPie);
    }
  };
  
  // ================= 6. 事件处理 =================
  const viewDetail = (record) => {
    selectedAmeba.value = record;
    activeTab.value = 'statement'; // 默认切到报表
  };
  
  const goBack = () => {
    selectedAmeba.value = null;
    if (trendChartInstance) trendChartInstance.dispose();
    if (pieChartInstance) pieChartInstance.dispose();
  };
  
  const openDetailModal = (item) => {
    detailModalItem.value = item;
    modalVisible.value = true;
  };
  
  // 监听 Tab 切换，渲染图表
  const handleTabChange = (key) => {
    activeTab.value = key;
    if (key === 'trend' || key === 'structure') {
      nextTick(() => renderCharts());
    }
  };
  
  const handleResize = () => {
    trendChartInstance?.resize();
    pieChartInstance?.resize();
  };
  
  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    if (trendChartInstance) trendChartInstance.dispose();
    if (pieChartInstance) pieChartInstance.dispose();
  });
  </script>
  
  <template>
  <a-layout class="permission-layout">
    <!-- 顶部通栏 -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-group">
          <div class="icon-wrapper">
            <PieChartIcon :size="24" />
          </div>
          <div>
            <h1 class="page-title">阿米巴经营核算</h1>
            <p class="page-subtitle">Departmental Profit & Loss</p>
          </div>
        </div>
        <div class="header-actions">
          <a-space>
            <a-button v-if="selectedAmeba" @click="goBack" size="small">
               <template #icon><icon-left /></template> 返回列表
            </a-button>
            <div class="filter-pill">
              <span class="label">年份</span>
              <a-select v-model="selectedYear" :style="{width:'80px'}" size="small" :bordered="false">
                <a-option value="2025">2025</a-option>
                <a-option value="2024">2024</a-option>
              </a-select>
            </div>
            <div class="filter-pill">
              <span class="label">期间</span>
              <a-select v-model="selectedMonth" :style="{width:'100px'}" size="small" :bordered="false">
                <a-option value="all">全年</a-option>
                <a-option v-for="m in 12" :key="m" :value="m">{{ m }}月</a-option>
              </a-select>
            </div>
          </a-space>
        </div>
      </div>
    </div>

    <a-layout class="page-body">
      <a-layout-content class="content-area custom-scroll">
        
        <!-- 视图切换 -->
        <transition name="fade" mode="out-in">
          
          <!-- 1. 仪表盘视图 -->
          <div v-if="!selectedAmeba" key="dashboard" class="flex flex-col gap-4">
            
            <!-- KPI 卡片  -->
            <a-grid :cols="{ xs: 1, sm: 2, md: 3 }" :col-gap="16" :row-gap="16">
              <a-grid-item v-for="metric in metricCards" :key="metric.key">
                <div class="stat-card clickable" :class="metric.bgClass">
                  <div class="icon-wrap" :class="metric.iconClass">
                    <component :is="metric.icon" />
                  </div>
                  <div class="stat-info">
                     <div class="label" :class="metric.textClass">{{ metric.title }}</div>
                     <div class="value" :class="metric.textClass">{{ metric.value }}</div>
                  </div>
                </div>
              </a-grid-item>
            </a-grid>
  
            <!-- 主数据表格 (使用 main-card 样式) -->
            <div class="main-card">
              <a-table 
                :columns="tableColumns"
                :data="currentAmebaData" 
                :pagination="{ pageSize: 10 }" 
                :bordered="{ wrapper: true, cell: false }"
                hoverable
                row-key="id"
                @row-click="viewDetail"
              >
                <template #group="{ record }">
                  <span class="font-medium text-gray-900 group-hover:text-blue-600 cursor-pointer pl-2">{{ record.group }}</span>
                </template>
  
                <template #income="{ record }">
                  <span class="mono">¥ {{ safeLocaleString(record.income) }}</span>
                </template>
                
                <template #directCost="{ record }">
                  <span class="mono text-gray-500">¥ {{ safeLocaleString(record.directCost) }}</span>
                </template>
                
                <template #allocatedCost="{ record }">
                   <span v-if="isSensitiveHidden" class="text-gray-300">***</span>
                   <span v-else class="mono text-gray-500">{{ safeLocaleString(record.allocatedCost) }}</span>
                </template>
                
                <template #profit="{ record }">
                   <span v-if="isSensitiveHidden" class="text-gray-300">***</span>
                   <span v-else :class="['mono font-bold', record.profit >= 0 ? 'text-gray-900' : 'text-red-500']">
                      ¥ {{ safeLocaleString(record.profit) }}
                    </span>
                </template>
                
                <template #ratio="{ record }">
                    <span v-if="isSensitiveHidden" class="text-gray-300">***</span>
                    <span v-else :class="parseFloat(record.ratio) > 20 ? 'text-green' : parseFloat(record.ratio) > 0 ? 'text-orange' : 'text-red'">
                      {{ record.ratio }}
                    </span>
                </template>
                
                <template #action>
                  <a-button type="text" shape="circle"><icon-right class="text-gray-400" /></a-button>
                </template>
              </a-table>
            </div>
          </div>
  
          <!-- 2. 详情视图 -->
          <div v-else key="detail">
            
            <!-- 详情页头部 -->
            <div class="bg-white border-b border-gray-200">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <a-page-header
                  :title="selectedAmeba.group"
                  :subtitle="periodLabel + ' 经营核算报表'"
                  :show-back="false"
                  class="px-0 py-2"
                >
                  <template #extra>
                     <a-button size="small" type="outline">
                        <template #icon><icon-download /></template> 导出
                     </a-button>
                  </template>
                  <template #default>
                    <a-descriptions :column="{ xs: 1, md: 3, lg: 4 }" size="small" class="mt-2">
                      <a-descriptions-item label="负责人">
                        <a-space>
                          <a-avatar :size="20">{{ selectedAmeba.manager[0] }}</a-avatar>
                          {{ selectedAmeba.manager }}
                        </a-space>
                      </a-descriptions-item>
                      <a-descriptions-item label="核算周期">{{ periodLabel }}</a-descriptions-item>
                      <a-descriptions-item label="核算币种">CNY (人民币)</a-descriptions-item>
                      <a-descriptions-item label="报表状态"><a-tag color="green" size="small" bordered>已结账</a-tag></a-descriptions-item>
                    </a-descriptions>
                  </template>
                </a-page-header>
              </div>
            </div>
  
            <!-- 详情内容区 -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
              <a-card :bordered="false" class="rounded-lg shadow-sm min-h-[600px]">
                <a-tabs v-model:active-key="activeTab" @change="handleTabChange">
                  
                  <!-- Tab 1: 经营报表 (财务核算表) -->
                  <a-tab-pane key="statement" title="经营损益表 (P&L)">
                     <div class="py-4">
                       <a-table 
                         :columns="pnlColumns" 
                         :data="detailData.pnlTable" 
                         :pagination="false" 
                         :bordered="{ cell: true }"
                         row-key="key"
                         :expandable="{ defaultExpandAllRows: true }"
                       >
                          <!-- 科目名称渲染 -->
                          <template #name="{ record }">
                             <span :class="{'font-bold text-gray-900': record.isGroup, 'pl-2': !record.isGroup}">
                               {{ record.name }}
                             </span>
                          </template>
  
                          <!-- 金额渲染 -->
                          <template #value="{ record }">
                             <span :class="{'font-bold': record.isGroup}">¥ {{ safeLocaleString(record.value) }}</span>
                          </template>
  
                          <template #budget="{ record }">
                             <span class="text-gray-500">¥ {{ safeLocaleString(record.budget) }}</span>
                          </template>
  
                          <template #diff="{ record }">
                             <span :class="record.diff >= 0 ? 'text-green-600' : 'text-red-500'">
                               {{ record.diff >= 0 ? '+' : '' }}{{ safeLocaleString(record.diff) }}
                             </span>
                          </template>
  
                          <template #lastYear="{ record }">
                             <span class="text-gray-400">¥ {{ safeLocaleString(record.lastYear) }}</span>
                          </template>
  
                          <template #yoy="{ record }">
                             <span :class="parseFloat(record.yoy) >= 0 ? 'text-red-500' : 'text-green-600'">
                               {{ record.yoy }}%
                               <icon-caret-up v-if="parseFloat(record.yoy) >= 0" />
                               <icon-caret-down v-else />
                             </span>
                          </template>
                       </a-table>
                     </div>
                  </a-tab-pane>
  
                  <!-- Tab 2: 趋势分析 -->
                  <a-tab-pane key="trend" title="经营趋势分析">
                    <div class="py-4">
                       <div ref="trendChartRef" class="chart-container" style="height: 500px;"></div>
                    </div>
                  </a-tab-pane>
  
                  <!-- Tab 3: 成本结构 -->
                  <a-tab-pane key="structure" title="成本结构分析">
                    <div class="py-4 flex justify-center">
                       <div ref="pieChartRef" class="chart-container" style="height: 500px; width: 80%;"></div>
                    </div>
                  </a-tab-pane>
  
                </a-tabs>
              </a-card>
            </div>
          </div>
        </transition>
  
        <!-- 3. 三级明细弹窗 (Modal) -->
        <a-modal v-model:visible="modalVisible" :title="detailModalItem?.name" width="700px" simple>
          <template #title>
            <div>
              <div class="text-lg font-bold">{{ detailModalItem?.name }}</div>
              <div class="text-xs text-gray-500 font-normal">科目流水明细查询</div>
            </div>
          </template>
          
          <a-table 
            :data="modalTableData" 
            :pagination="false" 
            size="small"
            :bordered="{ wrapper: true, cell: true }"
          >
            <a-table-column title="日期" data-index="date" :width="120"></a-table-column>
            <a-table-column title="摘要" data-index="desc"></a-table-column>
            <a-table-column title="经办人" data-index="user" :width="100">
              <template #cell="{ record }">
                <a-tag size="small" color="arcoblue">{{ record.user }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="金额" data-index="amount" align="right" :width="120">
              <template #cell="{ record }">
                <span :class="record.type==='入账' ? 'text-green-600' : 'text-gray-900'" class="font-mono">
                  {{ record.type==='入账' ? '+' : '-' }} ¥ {{ safeLocaleString(record.amount) }}
                </span>
              </template>
            </a-table-column>
          </a-table>
        </a-modal>
  
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
  
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
  flex-shrink: 0;
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

.header-actions {
  display: flex;
  align-items: center;
}

/* 主体布局 */
.page-body {
  flex: 1;
  padding: 16px;
  background-color: var(--color-fill-2);
  display: flex;
  flex-direction: column;
}

.content-area {
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  padding: 24px;
  border: 1px solid var(--color-border);
}

/* Filter Pill */
.filter-pill { 
  display: flex; 
  align-items: center; 
  gap: 4px; 
  font-size: 13px; 
  color: #1D2129; 
  background-color: #F2F3F5;
  padding: 2px 12px;
  border-radius: 16px;
  transition: all 0.2s;
}
.filter-pill:hover {
  background-color: #E5E6EB;
}
.filter-pill .label { 
  color: #86909C; 
  margin-right: 4px;
}
.filter-pill :deep(.arco-select-view-single) {
  background-color: transparent;
  padding-left: 0;
  padding-right: 0;
}
.filter-pill :deep(.arco-select-view-single:hover) {
  background-color: transparent;
}

/* 核心指标卡片 */
.stat-card { background: #fff; padding: 20px; border-radius: 12px; display: flex; align-items: center; gap: 16px; transition: all 0.2s; border: 1px solid transparent; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
.stat-card.bg-white { border-color: #F2F3F5; }
.clickable:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); cursor: pointer; }
.purple-gradient { background: linear-gradient(135deg, #722ED1 0%, #B37FEB 100%); border: none; }
.icon-wrap { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
.icon-white-bg { background: rgba(255,255,255,0.2); color: white; }
.bg-green-light { background: #E8FFEA; color: #00B42A; }
.bg-blue-light { background: #E8F3FF; color: #165DFF; }
.bg-orange-light { background: #FFF7E8; color: #FF7D00; }

.stat-info { display: flex; flex-direction: column; }
.stat-info .label { font-size: 12px; margin-bottom: 2px; }
.stat-info .value { font-size: 24px; font-weight: 700; line-height: 1.2; }
.text-white { color: white !important; }
.text-gray { color: #4E5969; }

/* 主表格卡片 - 仿 Store 样式 */
.main-card { 
  background: #fff; 
  border-radius: 12px; 
  padding: 24px; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.02); 
  border: 1px solid #F2F3F5;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ECharts 容器 */
.chart-container {
  width: 100%;
  height: 300px;
}

/* 覆盖 Arco 一些默认样式以适应 Dashboard */
:deep(.arco-card-body) {
  padding: 16px 20px;
}

/* 通用字体颜色 */
.text-green { color: #00B42A; }
.text-indigo { color: #165DFF; }
.text-orange { color: #FF7D00; }
.text-red { color: #F53F3F; }
.mono { font-family: 'DIN Alternate', monospace; }
</style>