<template>
  <a-layout class="permission-layout">
    <!-- 顶部通栏 -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-group">
          <div class="icon-wrapper">
            <ShoppingBagIcon :size="24" />
          </div>
          <div>
            <h1 class="page-title">店铺经营分析</h1>
            <p class="page-subtitle">E-commerce Store Performance</p>
          </div>
        </div>
        <div class="header-actions">
          <a-space>
            <a-button v-if="currentStore" @click="navigateTo(0)" size="small">
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
                <a-option v-for="m in 12" :key="m" :value="String(m)">{{ m }}月</a-option>
              </a-select>
            </div>

          </a-space>
        </div>
      </div>
    </div>

    <a-layout class="page-body">
      <a-layout-content class="content-area custom-scroll">
      
      <!-- 视图 1: 首页仪表盘 -->
      <transition name="fade" mode="out-in">
        <div v-if="!currentStore" key="dashboard" class="dashboard-view">
          <!-- 核心指标卡片 -->
          <a-row :gutter="16" class="mb-2">
            <a-col :span="6" v-for="metric in metricCards" :key="metric.key">
              <div 
                class="stat-card clickable" 
                :class="metric.bgClass" 
                @click="showMetricDetail(metric)"
              >
                <div class="icon-wrap" :class="metric.iconClass">
                  <component :is="metric.icon" />
                </div>
                <div class="stat-info">
                   <div class="label" :class="metric.textClass">{{ metric.title }}</div>
                   <div class="value" :class="metric.textClass">{{ metric.value }}</div>
                </div>
              </div>
            </a-col>
          </a-row>

          <!-- 主表格区 -->
          <div class="main-card">
            <a-table 
              :data="currentStoreList" 
              :pagination="{ pageSize: 13 }" 
              :bordered="{wrapper: true, cell: false}"
              hoverable 
              row-class="cursor-pointer"
              @row-click="enterStoreDetail"
            >
              <template #columns>
                <a-table-column title="店铺名称" data-index="shopName" :width="220">
                   <template #cell="{ record }">
                     <span class="store-name pl-2">{{ record.shopName }}</span>
                   </template>
                </a-table-column>

                <a-table-column 
                  title="平台" 
                  data-index="platform" 
                  :width="90"
                  align="center"
                  :filterable="{
                    filters: [{text: '淘宝', value: '淘宝'}, {text: '抖音', value: '抖音'}, {text: '快手', value: '快手'}],
                    filter: (value, record) => record.platform.includes(value),
                    multiple: true
                  }"
                >
                  <template #cell="{ record }">
                    <a-tag size="small" :color="getPlatformColor(record.platform)">{{ record.platform }}</a-tag>
                  </template>
                </a-table-column>

                <a-table-column 
                  title="GMV" 
                  align="right" 
                  :sortable="{
                    sortDirections: ['ascend', 'descend'],
                    sorter: (a, b) => a.gmv - b.gmv
                  }"
                >
                  <template #cell="{ record }"><span class="mono bold">¥ {{ formatNumber(record.gmv) }}</span></template>
                </a-table-column>

                <a-table-column 
                  title="成本" 
                  align="right"
                  :sortable="{
                    sortDirections: ['ascend', 'descend'],
                    sorter: (a, b) => a.cost - b.cost
                  }"
                >
                   <template #cell="{ record }"><span class="text-gray mono">¥ {{ formatNumber(record.cost) }}</span></template>
                </a-table-column>

                <a-table-column 
                  title="毛利率" 
                  align="right" 
                  data-index="grossMargin" 
                  :sortable="{
                    sortDirections: ['ascend', 'descend'],
                    sorter: (a, b) => parseFloat(a.grossMargin) - parseFloat(b.grossMargin)
                  }"
                >
                   <template #cell="{ record }"><span class="text-green">{{ record.grossMargin }}%</span></template>
                </a-table-column>

                <a-table-column 
                  title="净利率" 
                  align="right" 
                  data-index="netMargin"
                  :sortable="{
                    sortDirections: ['ascend', 'descend'],
                    sorter: (a, b) => parseFloat(a.netMargin) - parseFloat(b.netMargin)
                  }"
                >
                   <template #cell="{ record }"><span class="bold text-indigo">{{ record.netMargin }}%</span></template>
                </a-table-column>

                <a-table-column 
                  title="客单价" 
                  align="right" 
                  :sortable="{
                    sortDirections: ['ascend', 'descend'],
                    sorter: (a, b) => a.aov - b.aov
                  }"
                >
                   <template #cell="{ record }">¥ {{ record.aov }}</template>
                </a-table-column>

                <a-table-column 
                  title="转化率" 
                  align="right" 
                  :sortable="{
                    sortDirections: ['ascend', 'descend'],
                    sorter: (a, b) => parseFloat(a.conversionRate) - parseFloat(b.conversionRate)
                  }"
                >
                   <template #cell="{ record }">{{ record.conversionRate }}%</template>
                </a-table-column>

                <a-table-column title="操作" align="center" :width="80">
                   <template #cell><icon-right class="arrow-icon" /></template>
                </a-table-column>
              </template>
            </a-table>
          </div>
        </div>

        <!-- 视图 2: 店铺详情视图 -->
        <div v-else key="detail" class="detail-view">
           <div class="mb-4">
             <div class="flex justify-between items-center mb-4">
                <div class="flex flex-col gap-1">
                   <div class="flex items-center gap-3">
                      <h1 class="text-2xl font-bold m-0">{{ currentStore.shopName }}</h1>
                      <a-tag size="small" :color="getPlatformColor(currentStore.platform)">{{ currentStore.platform }}</a-tag>
                   </div>
                   <div class="text-gray-500 text-xs">
                     客户: {{ currentStore.customer }} <span class="mx-2">|</span> 数据更新于: 2025-12-16 12:00
                   </div>
                </div>
                
                <!-- 简单的操作按钮或状态 -->
                <div class="flex items-center gap-3">
                   <a-button size="small" type="outline">
                      <template #icon><icon-download /></template> 导出
                   </a-button>
                   <a-tag color="green" bordered>经营正常</a-tag>
                </div>
             </div>

             <!-- 六个核心指标小卡片 -->
             <a-row :gutter="16">
               <a-col :span="4" v-for="(d, idx) in storeDetailMetrics" :key="idx">
                 <div class="detail-metric-card">
                    <div class="dm-label">{{ d.label }}</div>
                    <div class="dm-value" :class="d.colorClass">{{ d.prefix }}{{ d.value }}{{ d.suffix }}</div>
                    <div class="dm-trend" v-if="d.trend">
                       <span :class="d.trend > 0 ? 'text-red' : 'text-green'">
                          {{ d.trend > 0 ? '+' : ''}}{{ d.trend }}%
                          <icon-caret-up v-if="d.trend > 0" /><icon-caret-down v-else />
                       </span>
                       <span class="text-gray-400 ml-1">同比</span>
                    </div>
                 </div>
               </a-col>
             </a-row>
           </div>

           <!-- 图表区域 -->
           <div class="main-card mb-4">
             <div class="chart-header">
               <!-- 修改：图表标题改为面包屑导航 -->
               <div class="ch-left breadcrumb-chart">
                  <span 
                    class="bc-item" 
                    :class="{ 'active': !viewState.month, 'clickable': viewState.month }"
                    @click="viewState.month = null"
                  >
                    年度经营趋势
                  </span>
                  <template v-if="viewState.month">
                    <span class="bc-sep">/</span>
                    <span class="bc-item active">{{ viewState.month }} 经营详情</span>
                  </template>
                  <span class="ch-sub text-gray-500 text-xs ml-3" v-if="!viewState.month">
                    (点击柱状图下钻)
                  </span>
               </div>
               <a-radio-group type="button" v-model="chartMode" size="small">
                 <a-radio value="scale">收支视图</a-radio>
                 <a-radio value="efficiency">效率视图</a-radio>
                 <a-radio value="order">流量视图</a-radio>
               </a-radio-group>
             </div>
             
             <!-- ECharts 主图表容器 -->
             <div class="chart-box" ref="mainChartRef" style="height: 280px;"></div>
           </div>

           <a-row :gutter="16">
            <a-col :span="12">
              <div class="main-card">
                <div class="card-title mb-4 flex justify-between">
                   <span>成本构成分析</span>
                   <icon-right class="text-gray-400" />
                </div>
                <div class="h-40 flex justify-center items-center">
                   <!-- ECharts 饼图容器 -->
                   <div ref="costChartRef" style="width: 100%; height: 160px;"></div>
                </div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="main-card">
                 <div class="card-title mb-4 flex justify-between">
                   <span>科目构成分析</span>
                   <icon-right class="text-gray-400" />
                </div>
                <div class="h-40 flex justify-center items-center">
                   <!-- ECharts 环形图容器 -->
                   <div ref="subjectChartRef" style="width: 100%; height: 160px;"></div>
                </div>
              </div>
            </a-col>
           </a-row>
        </div>
      </transition>
    <!-- </div> -->

    <!-- 弹窗部分 -->
    <a-modal v-model:visible="metricVisible" :title="currentMetric?.title" :footer="false">
      <div class="metric-modal-content">
         <div class="formula-box">
            <div class="label">计算公式</div>
            <div class="formula">{{ currentMetric?.formula }}</div>
         </div>
         <a-list size="small" :bordered="false">
           <template #header><span class="text-gray-500">构成明细</span></template>
           <a-list-item v-for="(item, idx) in currentMetric?.items" :key="idx">
             <div class="flex justify-between w-full">
               <span>{{ item.name }}</span>
               <span class="font-bold">{{ item.value }}</span>
             </div>
           </a-list-item>
         </a-list>
      </div>
    </a-modal>
    
    <a-modal v-model:visible="dayDetailVisible" :title="`${selectedDay} - 订单明细`" width="800px" :footer="false">
       <a-table :data="dayOrderList" :pagination="false" size="small" hoverable @row-click="openProductDetail" :bordered="{wrapper: true, cell: false}">
         <template #columns>
           <a-table-column title="订单号" data-index="id"></a-table-column>
           <a-table-column title="时间" data-index="time"></a-table-column>
           <a-table-column title="商品" data-index="product"></a-table-column>
           <a-table-column title="状态" data-index="status">
             <template #cell="{ record }">
               <a-tag size="small" :color="record.status === '已结算' ? 'green' : 'gray'">{{ record.status }}</a-tag>
             </template>
           </a-table-column>
           <a-table-column title="金额" align="right">
             <template #cell="{ record }"><span class="mono">¥ {{ record.amount }}</span></template>
           </a-table-column>
         </template>
       </a-table>
    </a-modal>

    <a-modal v-model:visible="productDetailVisible" :title="`订单财务模型: ${selectedOrder?.id}`" :footer="false">
      <div v-if="selectedOrder" class="product-finance-box">
        <a-descriptions :column="1" bordered size="large">
           <a-descriptions-item label="商品编码">{{ selectedOrder.sku }}</a-descriptions-item>
           <a-descriptions-item label="商品成本"><span class="text-gray">¥ {{ selectedOrder.cost }}</span></a-descriptions-item>
           <a-descriptions-item label="销售收入"><span class="text-green font-bold">¥ {{ selectedOrder.amount }}</span></a-descriptions-item>
           <a-descriptions-item label="平台扣点"><span class="text-orange">- ¥ {{ (selectedOrder.amount * 0.05).toFixed(2) }}</span></a-descriptions-item>
           <a-descriptions-item label="物流运费"><span class="text-orange">- ¥ 12.00</span></a-descriptions-item>
           <a-descriptions-item label="实际毛利">
             <span class="text-indigo font-bold text-lg">¥ {{ (selectedOrder.amount * 0.95 - selectedOrder.cost - 12).toFixed(2) }}</span>
           </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>

      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, reactive, watch, nextTick, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { ShoppingBagIcon } from 'lucide-vue-next';
import { 
  IconBgColors, IconCaretUp, IconCaretDown, IconBarChart, 
  IconRight, IconLeft, IconApps, IconDownload
} from '@arco-design/web-vue/es/icon';

// --- 数据生成逻辑 (Mock Data) ---
const platforms = ["淘宝", "快手", "抖音"];
const customers = ["客户A", "客户B", "客户C"];
const months = ["1月","2月","3月","4月","5月","6月","7月","8月"];

function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

const generateMockData = () => {
    const data = [];
    customers.forEach((cust, cIdx) => {
        platforms.forEach((plat, pIdx) => {
            [1, 2, 3].forEach(num => {
                const shopName = `${cust}${plat}${num}号店`;
                months.forEach((m, mIdx) => {
                    const seed = cIdx * 100 + pIdx * 10 + num + mIdx;
                    let baseGmv = 80000 + seededRandom(seed) * 40000;
                    if (cust === "客户A") baseGmv *= 1.3;
                    if (plat === "淘宝") baseGmv *= 1.2;
                    if (num === 1) baseGmv *= 1.1;
                    const gmv = Math.round(baseGmv);
                    const cost = Math.round(gmv * (0.6 + seededRandom(seed + 1) * 0.15));
                    const profit = gmv - cost;
                    const orders = Math.round(gmv / 100);
                    const visitors = Math.round(orders * 15);
                    data.push({ shopName, customer: cust, platform: plat, month: m, gmv, cost, profit, orders, visitors });
                });
            });
        });
    });
    return data;
};

const rawData = generateMockData();

// State
const selectedYear = ref('2025');
const selectedMonth = ref('all');
const metricVisible = ref(false);
const dayDetailVisible = ref(false);
const productDetailVisible = ref(false);

const currentStore = ref(null);
const currentMetric = ref(null);
const selectedDay = ref(null);
const selectedOrder = ref(null);

const viewState = reactive({ month: null });
const chartMode = ref('scale');
const hoveredIdx = ref(null);

// ECharts Refs
const mainChartRef = ref(null);
const costChartRef = ref(null);
const subjectChartRef = ref(null);
let mainChartInstance = null;
let costChartInstance = null;
let subjectChartInstance = null;

// 面包屑
const viewPath = computed(() => {
    const path = [{ name: '店铺经营仓', id: 'root' }];
    if (currentStore.value) {
        path.push({ name: currentStore.value.shopName, id: 'store' });
    }
    if (viewState.month) {
        path.push({ name: `${viewState.month}数据`, id: 'month' });
    }
    return path;
});

const navigateTo = (index) => {
    const target = viewPath.value[index];
    if (target.id === 'root') {
        currentStore.value = null;
        viewState.month = null;
    } else if (target.id === 'store') {
        viewState.month = null;
    }
};

const enterStoreDetail = (record) => {
    currentStore.value = record;
    viewState.month = null;
};

// --- Computed Data ---
const currentStoreList = computed(() => {
    const storeMap = {};
    rawData.forEach(r => {
        if (!storeMap[r.shopName]) {
            storeMap[r.shopName] = { 
                shopName: r.shopName, customer: r.customer, platform: r.platform,
                gmv: 0, cost: 0, profit: 0, orders: 0, visitors: 0 
            };
        }
        storeMap[r.shopName].gmv += r.gmv;
        storeMap[r.shopName].cost += r.cost;
        storeMap[r.shopName].profit += r.profit;
        storeMap[r.shopName].orders += r.orders;
        storeMap[r.shopName].visitors += r.visitors;
    });
    
    return Object.values(storeMap).map(s => {
        const totalCost = s.cost + (s.gmv * 0.05); 
        return {
            ...s,
            grossMargin: ((s.gmv - s.cost) / s.gmv * 100).toFixed(1),
            netMargin: ((s.gmv - totalCost) / s.gmv * 100).toFixed(1),
            roi: (s.gmv / (s.gmv * 0.2)).toFixed(1),
            aov: Math.round(s.gmv / s.orders),
            conversionRate: ((s.orders / s.visitors) * 100).toFixed(2)
        };
    }).sort((a,b) => b.gmv - a.gmv);
});

// 计算店铺详情页的指标数据
const storeDetailMetrics = computed(() => {
   if (!currentStore.value) return [];
   const s = currentStore.value;
   const randomTrend = () => (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 20);
   
   return [
      { label: '累计 GMV', value: formatNumber(s.gmv), prefix: '¥', colorClass: 'text-gray-900', trend: randomTrend() },
      { label: '净利润', value: formatNumber(Math.round(s.gmv * (s.netMargin/100))), prefix: '¥', colorClass: 'text-indigo', trend: randomTrend() },
      { label: '净利率', value: s.netMargin, suffix: '%', colorClass: 'text-indigo', trend: randomTrend() },
      { label: '毛利率', value: s.grossMargin, suffix: '%', colorClass: 'text-green', trend: randomTrend() },
      { label: '客单价', value: s.aov, prefix: '¥', colorClass: 'text-gray-700', trend: randomTrend() },
      { label: '转化率', value: s.conversionRate, suffix: '%', colorClass: 'text-gray-700', trend: randomTrend() },
   ];
});

const metrics = computed(() => {
    const total = currentStoreList.value.reduce((acc, s) => ({
        gmv: acc.gmv + s.gmv,
        cost: acc.cost + s.cost,
        profit: acc.profit + s.profit
    }), { gmv: 0, cost: 0, profit: 0 });
    
    return {
        gmv: total.gmv,
        grossMargin: ((total.gmv - total.cost) / total.gmv * 100).toFixed(1) + '%',
        netMargin: ((total.gmv - total.cost * 1.2) / total.gmv * 100).toFixed(1) + '%',
        returnRate: '6.7%'
    };
});

const metricCards = computed(() => [
  { key: 'gmv', title: '总 GMV', value: '¥ ' + formatNumber(metrics.value.gmv), icon: IconBgColors, bgClass: 'purple-gradient', textClass: 'text-white', iconClass: 'icon-white-bg', formula: '∑(各渠道销售额)', items: [] },
  { key: 'gm', title: '平均毛利率', value: metrics.value.grossMargin, icon: IconCaretUp, bgClass: 'bg-white', textClass: 'text-gray', iconClass: 'text-green bg-green-light', formula: '(收入-成本)/收入', items: [] },
  { key: 'nm', title: '平均净利率', value: metrics.value.netMargin, icon: IconBarChart, bgClass: 'bg-white', textClass: 'text-gray', iconClass: 'text-blue bg-blue-light', formula: '(毛利-费用)/收入', items: [] },
  { key: 'rr', title: '平均退货率', value: metrics.value.returnRate, icon: IconCaretDown, bgClass: 'bg-white', textClass: 'text-gray', iconClass: 'text-orange bg-orange-light', formula: '退货单数 / 发货单数', items: [] },
]);

const costStructureData = [
   { label: '商品成本', percent: 0.45, color: '#6366f1' },
   { label: '物流履约', percent: 0.25, color: '#3b82f6' },
   { label: '营销推广', percent: 0.20, color: '#f59e0b' },
   { label: '其他', percent: 0.10, color: '#cbd5e1' }
];

const subjectStructureData = [
   { label: '主营收入', percent: 0.60, color: '#10b981' },
   { label: '服务费', percent: 0.15, color: '#34d399' },
   { label: '其他', percent: 0.25, color: '#6ee7b7' }
];

// Helpers
function formatNumber(n) { return n ? n.toLocaleString() : '0'; }
function getPlatformColor(p) { return p === '淘宝' ? 'orange' : p === '抖音' ? 'arcoblue' : 'red'; }
function getPlatformClass(p) { return p === '淘宝' ? 'bg-orange-100 text-orange-600' : p === '抖音' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'; }

// Actions
const showMetricDetail = (metric) => {
    currentMetric.value = metric;
    metricVisible.value = true;
};

const handleChartClick = (params) => {
    const label = params.name;
    if(!isMonthly.value) {
        viewState.month = label; 
    } else {
        selectedDay.value = label; 
        dayDetailVisible.value = true;
    }
};

const openProductDetail = (order) => {
    selectedOrder.value = { ...order, sku: 'SKU-88842-X', cost: (order.amount * 0.4).toFixed(2) };
    productDetailVisible.value = true;
};

// Chart Logic
const isMonthly = computed(() => !!viewState.month);
const chartData = computed(() => {
    if (!currentStore.value) return [];
    
    if (isMonthly.value) {
        return Array.from({ length: 30 }, (_, i) => ({
            label: `${i+1}日`,
            income: Math.floor(Math.random()*5000) + 2000,
            cost: Math.floor(Math.random()*3000) + 1000,
            profit: Math.floor(Math.random()*2000),
            roi: (1.5 + Math.random() * 2).toFixed(1),
            aov: Math.floor(100 + Math.random() * 50),
            orders: Math.floor(Math.random() * 50) + 10,
            visitors: Math.floor(Math.random() * 1000) + 200
        }));
    }

    const storeRaw = rawData.filter(r => r.shopName === currentStore.value.shopName);
    return storeRaw.map(r => ({
        label: r.month,
        income: r.gmv,
        cost: r.cost,
        profit: r.profit,
        roi: (r.gmv / (r.cost * 0.3)).toFixed(1),
        aov: Math.round(r.gmv / r.orders),
        orders: r.orders,
        visitors: r.visitors
    }));
});

// Mock Day Data
const dayOrderList = computed(() => Array.from({length: 10}, (_, i) => ({
    id: `ORD-${20251001 + i}`,
    time: '10:23',
    product: `SKU-ITEM-${i}`,
    status: i % 3 === 0 ? '已退款' : '已结算',
    amount: Math.floor(Math.random() * 200) + 50
})));

// --- ECharts Initialization & Update ---

const initCharts = () => {
    // 增加防御性检查：如果 currentStore 在延时期间被清空（用户退出了），则不执行初始化
    if (!currentStore.value) return;

    if (mainChartRef.value) {
        mainChartInstance = echarts.init(mainChartRef.value);
        mainChartInstance.on('click', handleChartClick);
        updateMainChart();
    }
    if (costChartRef.value) {
        costChartInstance = echarts.init(costChartRef.value);
        updatePieCharts();
    }
    if (subjectChartRef.value) {
        subjectChartInstance = echarts.init(subjectChartRef.value);
        updatePieCharts();
    }
    
    window.addEventListener('resize', resizeCharts);
};

const resizeCharts = () => {
    mainChartInstance?.resize();
    costChartInstance?.resize();
    subjectChartInstance?.resize();
};

const disposeCharts = () => {
    window.removeEventListener('resize', resizeCharts);
    mainChartInstance?.dispose();
    costChartInstance?.dispose();
    subjectChartInstance?.dispose();
    mainChartInstance = null;
    costChartInstance = null;
    subjectChartInstance = null;
};

const updateMainChart = () => {
    if (!mainChartInstance) return;
    
    const xData = chartData.value.map(d => d.label);
    const mode = chartMode.value;
    
    let series = [];
    let yAxis = [];
    let tooltip = { trigger: 'axis', axisPointer: { type: 'shadow' } };
    
    if (mode === 'scale') {
        yAxis = [{ type: 'value', name: '金额' }];
        series = [
            {
                name: '利润',
                type: 'bar',
                data: chartData.value.map(d => d.profit),
                itemStyle: { 
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#34D399' },
                        { offset: 1, color: '#10B981' }
                    ]),
                    borderRadius: [4, 4, 0, 0]
                },
                barMaxWidth: 30
            },
            {
                name: '收入',
                type: 'line',
                data: chartData.value.map(d => d.income),
                itemStyle: { color: '#6366f1' },
                smooth: true,
                symbol: 'circle',
                symbolSize: 6
            },
            {
                name: '成本',
                type: 'line',
                data: chartData.value.map(d => d.cost),
                itemStyle: { color: '#FF7D00' },
                smooth: true,
                symbol: 'circle',
                symbolSize: 6
            }
        ];
    } else if (mode === 'efficiency') {
        yAxis = [
            { type: 'value', name: '客单价', position: 'left' },
            { type: 'value', name: 'ROI', position: 'right', splitLine: { show: false } }
        ];
        series = [
            {
                name: '客单价',
                type: 'bar',
                data: chartData.value.map(d => d.aov),
                itemStyle: { color: '#F59E0B', borderRadius: [4, 4, 0, 0] },
                barMaxWidth: 30,
                yAxisIndex: 0
            },
            {
                name: 'ROI',
                type: 'line',
                data: chartData.value.map(d => d.roi),
                itemStyle: { color: '#8B5CF6' },
                smooth: true,
                yAxisIndex: 1
            }
        ];
    } else if (mode === 'order') {
        yAxis = [
            { type: 'value', name: '订单数', position: 'left' },
            { type: 'value', name: '访客数', position: 'right', splitLine: { show: false } }
        ];
        series = [
            {
                name: '订单数',
                type: 'bar',
                data: chartData.value.map(d => d.orders),
                itemStyle: { color: '#3B82F6', borderRadius: [4, 4, 0, 0] },
                barMaxWidth: 30,
                yAxisIndex: 0
            },
            {
                name: '访客数',
                type: 'line',
                data: chartData.value.map(d => d.visitors),
                itemStyle: { color: '#CBD5E1' },
                lineStyle: { type: 'dashed' },
                smooth: true,
                yAxisIndex: 1
            }
        ];
    }

    const option = {
        grid: { top: 40, right: 40, bottom: 20, left: 40, containLabel: true },
        tooltip,
        legend: { bottom: 0 },
        xAxis: { type: 'category', data: xData, axisLine: { lineStyle: { color: '#E5E6EB' } }, axisLabel: { color: '#86909C' } },
        yAxis,
        series
    };
    
    mainChartInstance.setOption(option, true); // true = not merge (reset)
};

const updatePieCharts = () => {
    // Cost Pie Chart
    if (costChartInstance) {
        costChartInstance.setOption({
            tooltip: { trigger: 'item' },
            legend: { orient: 'vertical', right: 0, top: 'center', icon: 'circle' },
            series: [
                {
                    name: '成本构成',
                    type: 'pie',
                    radius: '70%',
                    center: ['40%', '50%'],
                    data: costStructureData.map(d => ({ value: d.percent, name: d.label, itemStyle: { color: d.color } })),
                    label: { show: false }
                }
            ]
        });
    }
    
    // Subject Donut Chart
    if (subjectChartInstance) {
        subjectChartInstance.setOption({
            tooltip: { trigger: 'item' },
            legend: { orient: 'vertical', right: 0, top: 'center', icon: 'circle' },
             title: {
                text: '100%',
                left: '38%',
                top: '46%',
                textAlign: 'center',
                textStyle: { fontWeight: 'bold', fontSize: 16 }
            },
            series: [
                {
                    name: '科目构成',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['40%', '50%'],
                    data: subjectStructureData.map(d => ({ value: d.percent, name: d.label, itemStyle: { color: d.color } })),
                    label: { show: false }
                }
            ]
        });
    }
};

// Watchers
watch(() => currentStore.value, (val) => {
  if (val) {
      // 关键修改：使用 setTimeout 替代 nextTick
      // 因为 transition mode="out-in" 会导致旧元素先淡出 (0.2s)，然后新元素才挂载
      // nextTick 会在数据变化瞬间触发，此时新元素还没挂载，Ref 为空，导致图表初始化失败
      // 这里延时 300ms 确保 DOM 已经完全就绪
      setTimeout(() => {
          initCharts();
      }, 300);
  } else {
      disposeCharts();
  }
});

watch([chartData, chartMode], () => {
    if (mainChartInstance) updateMainChart();
});

onUnmounted(() => {
    disposeCharts();
});

</script>

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

/* 主表格卡片 */
.main-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
.store-name { font-weight: 600; color: #1D2129; }
.arrow-icon { color: #C9CDD4; }

.bg-orange-100 { background: #FFF7E8; color: #FF7D00; }
.bg-blue-100 { background: #E8F3FF; color: #165DFF; }
.bg-red-100 { background: #FFECE8; color: #F53F3F; }

/* 详情页新 UI */
.detail-metric-card {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
    border: 1px solid #F2F3F5;
    transition: all 0.2s;
}
.detail-metric-card:hover {
    border-color: #165DFF;
    transform: translateY(-2px);
}
.dm-label { font-size: 12px; color: #86909C; margin-bottom: 4px; }
.dm-value { font-size: 22px; font-weight: 700; font-family: 'DIN Alternate', sans-serif; }
.dm-trend { font-size: 12px; margin-top: 4px; display: flex; align-items: center; }
.text-red { color: #F53F3F; }
.text-green { color: #00B42A; }
.text-indigo { color: #165DFF; }
.text-gray-900 { color: #1D2129; }
.text-gray-700 { color: #4E5969; }

/* 图表区 */
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.ch-title { font-size: 16px; font-weight: 600; }
.chart-box { width: 100%; overflow: hidden; }
.main-svg { width: 100%; height: auto; user-select: none; }
.chart-col { cursor: pointer; transition: opacity 0.2s; }

/* 面包屑导航 - 图表内部 */
.breadcrumb-chart {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}
.bc-item {
  color: #1D2129;
  transition: color 0.2s;
}
.bc-item.clickable {
  color: #86909C;
  cursor: pointer;
}
.bc-item.clickable:hover {
  color: #165DFF;
}
.bc-item.active {
  color: #1D2129;
  cursor: default;
}
.bc-sep {
  margin: 0 8px;
  color: #C9CDD4;
  font-weight: normal;
}

/* 通用字体颜色 */
.text-green { color: #00B42A; }
.text-indigo { color: #165DFF; }
.text-orange { color: #FF7D00; }
.text-gray-500 { color: #86909C; }
.mono { font-family: 'DIN Alternate', monospace; }
.bold { font-weight: 600; }
.mb-6 { margin-bottom: 24px; }
.mb-4 { margin-bottom: 16px; }

/* 动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>