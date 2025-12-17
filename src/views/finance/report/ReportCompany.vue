<template>
  <div class="page-container">
    <!-- Top Navigation & Filter -->
    <div class="top-bar">
      <div class="brand">
        <div class="logo-box"><icon-apps /></div>
        <div class="titles">
          <h1 class="main-title">公司经营驾驶舱</h1>
          <span class="sub-title">Financial & Budget Monitor</span>
        </div>
      </div>
      
      <div class="controls">
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
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="content-wrapper main-card-container">
      <a-tabs v-model:active-key="activeTab" type="line" size="large" animation class="main-tabs">
        
        <!-- Tab Extra Actions -->
        <template #extra>
          <a-space size="small" v-if="['balance', 'profit', 'cash'].includes(activeTab)">
            <a-button type="text" size="small" @click="setAllExpandState(true)">
              <template #icon><icon-expand /></template> 全部展开
            </a-button>
            <a-button type="text" size="small" @click="setAllExpandState(false)">
              <template #icon><icon-shrink /></template> 全部收起
            </a-button>
          </a-space>
        </template>

        <!-- 1. Balance Sheet -->
        <a-tab-pane key="balance">
          <template #title>
             资产负债表 
             <a-tooltip content="数据来源: ads_BalanceSheet"><icon-info-circle class="info-icon" /></a-tooltip>
          </template>
          <div class="report-content">
            <a-table
              :data="balanceData"
              :columns="reportColumns"
              :pagination="false"
              v-model:expanded-keys="expandedKeys"
              row-key="id"
              :bordered="{ wrapper: true, cell: false }"
              :hoverable="true"
              row-class="report-row"
              @row-click="handleRowClick"
            >
              <template #columns>
                <a-table-column title="项目名称" data-index="name">
                   <!-- Native Tree Data: No custom cell template needed for indentation -->
                </a-table-column>
                <a-table-column title="期末余额" data-index="value" align="right">
                  <template #cell="{ record }">
                    <span :class="['mono', record.level === 1 ? 'text-indigo bold' : 'text-gray']">
                      ¥ {{ formatNumber(record.value) }}
                    </span>
                  </template>
                </a-table-column>
                <!-- Removed Operation Column -->
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- 2. Profit & Loss -->
        <a-tab-pane key="profit">
          <template #title>
             利润表 
             <a-tooltip content="数据来源: ads_IncomeStatement"><icon-info-circle class="info-icon" /></a-tooltip>
          </template>
           <div class="report-content">
            <a-table
              :data="profitData"
              :columns="reportColumns"
              :pagination="false"
              v-model:expanded-keys="expandedKeys"
              row-key="id"
              :bordered="{ wrapper: true, cell: false }"
              row-class="report-row"
              @row-click="handleRowClick"
            >
               <template #columns>
                <a-table-column title="项目名称" data-index="name">
                   <!-- Native Tree Data -->
                </a-table-column>
                <a-table-column title="本期金额" data-index="value" align="right">
                  <template #cell="{ record }">
                    <span :class="['mono', record.level === 1 ? 'text-indigo bold' : 'text-gray', record.value < 0 ? 'text-red' : '']">
                      ¥ {{ formatNumber(record.value) }}
                    </span>
                  </template>
                </a-table-column>
                <!-- Removed Operation Column -->
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- 3. Cash Flow -->
        <a-tab-pane key="cash">
          <template #title>
             现金流量表 
             <a-tooltip content="数据来源: ads_CashFlowStatement"><icon-info-circle class="info-icon" /></a-tooltip>
          </template>
           <div class="report-content">
            <a-table
              :data="cashData"
              :columns="reportColumns"
              :pagination="false"
              v-model:expanded-keys="expandedKeys"
              row-key="id"
              :bordered="{ wrapper: true, cell: false }"
              row-class="report-row"
              @row-click="handleRowClick"
            >
              <template #columns>
                <a-table-column title="项目名称" data-index="name">
                   <!-- Native Tree Data -->
                </a-table-column>
                <a-table-column title="金额" data-index="value" align="right">
                  <template #cell="{ record }">
                    <span :class="['mono', record.level === 1 ? 'text-green bold' : 'text-gray', record.value < 0 ? 'text-red' : '']">
                      ¥ {{ formatNumber(record.value) }}
                    </span>
                  </template>
                </a-table-column>
                <!-- Removed Operation Column -->
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- 4. Budget Monitoring -->
        <a-tab-pane key="budget">
          <template #title>
             全面预算监控 
             <a-tooltip content="数据来源: ads_BudgetMonitoring"><icon-info-circle class="info-icon" /></a-tooltip>
          </template>
          <div class="budget-container">
            <div class="budget-toolbar">
               <div class="left">
                 <span class="budget-status-tag">执行中</span>
                 <span class="budget-version">版本: V2025-03-A</span>
               </div>
               <div class="right">
                 <a-button v-if="!isBudgetEditing" type="primary" status="warning" @click="isBudgetEditing = true">
                    <template #icon><icon-edit /></template> 调整预算
                 </a-button>
                 <a-space v-else>
                    <a-button @click="isBudgetEditing = false">取消</a-button>
                    <a-button type="primary" @click="saveBudget">保存生效</a-button>
                 </a-space>
               </div>
            </div>

            <div class="budget-grid">
              <!-- Left: Ameba -->
              <div class="budget-card">
                <div class="card-header">
                  <span class="card-title"><icon-user-group /> 阿米巴单元预算</span>
                </div>
                <div class="card-body">
                   <a-table 
                    :data="amebaBudgetDisplay" 
                    :pagination="false" 
                    row-key="id" 
                    :bordered="{ wrapper: true, cell: false }"
                    hoverable 
                    @row-click="openAmebaDetail"
                   >
                    <template #columns>
                      <a-table-column title="单元名称" data-index="group" :width="140"></a-table-column>
                      <a-table-column title="预算执行情况" align="left">
                        <template #cell="{ record }">
                           <div class="budget-progress-row">
                              <div class="nums">
                                <span class="spent mono">¥{{ formatNumber(record.actual) }}</span>
                                <span class="total mono"> / {{ isBudgetEditing ? '...' : formatNumber(record.budget) }}</span>
                              </div>
                              <a-input-number v-if="isBudgetEditing" v-model="record.budget" size="mini" :style="{width:'100px'}" />
                              <a-progress v-else 
                                :percent="record.percent / 100" 
                                :color="getProgressColor(record.percent)"
                                :stroke-width="6"
                                :show-text="false"
                              />
                           </div>
                        </template>
                      </a-table-column>
                      <a-table-column title="率" align="right" :width="70">
                        <template #cell="{ record }">
                           <span :style="{color: getProgressColor(record.percent), fontWeight: 'bold'}" class="mono">{{ record.percent }}%</span>
                        </template>
                      </a-table-column>
                    </template>
                  </a-table>
                </div>
              </div>

              <!-- Right: Finance Subject -->
              <div class="budget-card">
                <div class="card-header">
                  <span class="card-title"><icon-apps /> 财务科目预算</span>
                </div>
                <div class="card-body">
                   <a-table 
                    :data="companyBudgetDisplay" 
                    :pagination="false" 
                    row-key="id" 
                    :bordered="{ wrapper: true, cell: false }" 
                    hoverable 
                    @row-click="openSubjectDetail"
                   >
                    <template #columns>
                      <a-table-column title="科目名称" data-index="subject" :width="140"></a-table-column>
                      <a-table-column title="预算消耗趋势" align="left">
                         <template #cell="{ record }">
                           <div class="budget-progress-row">
                              <div class="nums">
                                <span class="spent mono">¥{{ formatNumber(record.actual) }}</span>
                                <span class="total mono"> / {{ formatNumber(record.budget) }}</span>
                              </div>
                              <a-progress 
                                :percent="record.percent / 100" 
                                :color="getProgressColor(record.percent)"
                                :stroke-width="6"
                                :show-text="false"
                              />
                           </div>
                        </template>
                      </a-table-column>
                      <a-table-column title="率" align="right" :width="70">
                         <template #cell="{ record }">
                           <span :style="{color: getProgressColor(record.percent), fontWeight: 'bold'}" class="mono">{{ record.percent }}%</span>
                        </template>
                      </a-table-column>
                    </template>
                  </a-table>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- Modal: Report Details -->
    <a-modal v-model:visible="reportDetailVisible" :title="`📄 ${reportDetailData?.name} - 明细账簿`" width="800px" :footer="false" class="custom-modal">
       <div class="modal-header-info">
         <span class="label">当前余额</span>
         <span class="value mono">¥ {{ formatNumber(reportDetailData?.value) }}</span>
       </div>
       <a-table 
        :data="reportDetailData?.details" 
        :pagination="false" 
        size="small" 
        :bordered="{wrapper: true, cell: false}"
       >
         <template #columns>
           <a-table-column title="日期" data-index="date" :width="120"></a-table-column>
           <a-table-column title="凭证号" data-index="docNo"></a-table-column>
           <a-table-column title="摘要" data-index="summary"></a-table-column>
           <a-table-column title="类型" data-index="type" :width="100">
             <template #cell="{ record }"><a-tag size="small" :color="record.type === '收款单' ? 'green' : 'arcoblue'">{{ record.type }}</a-tag></template>
           </a-table-column>
           <a-table-column title="借方" align="right">
             <template #cell="{ record }"><span class="mono">{{ record.debit > 0 ? formatNumber(record.debit) : '-' }}</span></template>
           </a-table-column>
           <a-table-column title="贷方" align="right">
             <template #cell="{ record }"><span class="mono">{{ record.credit > 0 ? formatNumber(record.credit) : '-' }}</span></template>
           </a-table-column>
         </template>
       </a-table>
    </a-modal>

    <!-- Modal: Ameba Details -->
    <a-modal v-model:visible="amebaDetailVisible" :title="`📊 ${selectedAmeba?.group} - 预算执行详情`" width="700px" :footer="false">
      <a-table :data="amebaDetailData" :pagination="false" hoverable :bordered="{wrapper: true, cell: false}" @row-click="openExpenseDetail">
        <template #columns>
          <a-table-column title="费用科目" data-index="subject"></a-table-column>
          <a-table-column title="实际支出" align="right" data-index="actual">
             <template #cell="{ record }"><span class="mono bold">¥ {{ formatNumber(record.actual) }}</span></template>
          </a-table-column>
           <a-table-column title="执行进度" :width="200">
             <template #cell="{ record }">
               <a-progress :percent="record.percent / 100" size="small" :status="record.percent > 100 ? 'danger' : 'normal'" />
             </template>
           </a-table-column>
           <a-table-column title="操作" :width="80" align="center">
             <template #cell><icon-right style="color:#C9CDD4"/></template>
           </a-table-column>
        </template>
      </a-table>
    </a-modal>
    
    <!-- Modal: Subject Details -->
    <a-modal v-model:visible="subjectDetailVisible" :title="`${selectedSubject?.subject} - 部门消耗分布`" width="600px" :footer="false">
       <div class="chart-box">
          <div v-for="(item, idx) in subjectDetailData" :key="idx" class="bar-row">
             <div class="bar-label">{{ item.dept }}</div>
             <div class="bar-track">
                <div class="bar-fill" :style="{ width: item.percent + '%' }"></div>
                <span class="bar-val mono">¥ {{ formatNumber(item.value) }}</span>
             </div>
          </div>
       </div>
    </a-modal>

    <!-- Modal: Expense Details -->
    <a-modal v-model:visible="expenseDetailVisible" :title="expenseDetailTitle" width="700px" :footer="false">
      <a-table :data="expenseDetailData" :pagination="false" size="small" stripe :bordered="{wrapper: true, cell: false}">
        <template #columns>
           <a-table-column title="日期" data-index="date"></a-table-column>
           <a-table-column title="摘要" data-index="desc"></a-table-column>
           <a-table-column title="报销人" data-index="user"></a-table-column>
           <a-table-column title="金额" align="right">
             <template #cell="{ record }"><span class="mono">¥ {{ formatNumber(record.amount) }}</span></template>
           </a-table-column>
        </template>
      </a-table>
    </a-modal>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { 
  IconCalendar, IconEdit, IconUserGroup, IconApps, IconInfoCircle, 
  IconSave, IconRight, IconExpand, IconShrink
} from '@arco-design/web-vue/es/icon';

// --- 1. Core Data (Unchanged) ---
const AMEBA_DEPARTMENTS = ['运营部-淘宝', '运营部-抖音', '运营部-快手', '商品部', '开发部', '产研部', '客服部', '仓储部', '人事部', '财务部'];

const FULL_COMPANY_REPORTS = {
    balance: [
        { id: 'asset', name: '一、资产总计', value: 58420000, level: 1, children: [
            { id: 'asset-current', name: '流动资产', value: 32500000, level: 2, children: [
                { id: 'c1', name: '货币资金', value: 15200000, level: 3 },
                { id: 'c2', name: '交易性金融资产', value: 2000000, level: 3 },
                { id: 'c3', name: '应收账款', value: 8300000, level: 3 },
                { id: 'c4', name: '预付款项', value: 1800000, level: 3 },
                { id: 'c5', name: '其他应收款', value: 1200000, level: 3 },
                { id: 'c6', name: '存货', value: 4000000, level: 3 }
            ]},
            { id: 'asset-fixed', name: '非流动资产', value: 25920000, level: 2, children: [
                { id: 'f1', name: '固定资产', value: 12500000, level: 3 },
                { id: 'f2', name: '在建工程', value: 4500000, level: 3 },
                { id: 'f3', name: '无形资产', value: 7800000, level: 3 },
                { id: 'f4', name: '长期待摊费用', value: 1120000, level: 3 }
            ]}
        ]},
        { id: 'liability', name: '二、负债合计', value: 21300000, level: 1, children: [
            { id: 'liab-current', name: '流动负债', value: 15100000, level: 2, children: [
                { id: 'l1', name: '短期借款', value: 5200000, level: 3 },
                { id: 'l2', name: '应付票据', value: 1800000, level: 3 },
                { id: 'l3', name: '应付账款', value: 6200000, level: 3 },
                { id: 'l4', name: '应付职工薪酬', value: 1400000, level: 3 },
                { id: 'l5', name: '应交税费', value: 500000, level: 3 }
            ]},
            { id: 'liab-long', name: '非流动负债', value: 6200000, level: 2, children: [
                { id: 'll1', name: '长期借款', value: 6200000, level: 3 }
            ]}
        ]},
        { id: 'equity', name: '三、所有者权益', value: 37120000, level: 1, children: [
            { id: 'e1', name: '实收资本', value: 20000000, level: 2, children: [] },
            { id: 'e2', name: '资本公积', value: 5000000, level: 2, children: [] },
            { id: 'e3', name: '盈余公积', value: 2120000, level: 2, children: [] },
            { id: 'e4', name: '未分配利润', value: 10000000, level: 2, children: [] }
        ]}
    ],
    profit: [
        { id: 'income', name: '一、营业收入', value: 85600000, level: 1, children: [
            { id: 'inc-main', name: '主营业务收入', value: 80400000, level: 2, children: [{id:'im1', name:'线上销售收入', value:60200000, level:3}, {id:'im2', name:'分销收入', value:20200000, level:3}] },
            { id: 'inc-other', name: '其他业务收入', value: 5200000, level: 2, children: [] }
        ]},
        { id: 'cost', name: '二、营业成本', value: 45800000, level: 1, children: [
            { id: 'cost-main', name: '主营业务成本', value: 42500000, level: 2, children: [] },
            { id: 'cost-other', name: '其他业务成本', value: 3300000, level: 2, children: [] }
        ]},
        { id: 'tax', name: '三、税金及附加', value: 550000, level: 1, children: [] },
        { id: 'expense', name: '四、期间费用', value: 25600000, level: 1, children: [
            { id: 'ex-sale', name: '销售费用', value: 15500000, level: 2, children: [{id:'es1', name:'广告推广费', value:8200000, level:3}, {id:'es2', name:'平台佣金', value:5100000, level:3}, {id:'es3', name:'物流运输费', value:2200000, level:3}] },
            { id: 'ex-manage', name: '管理费用', value: 8100000, level: 2, children: [{id:'em1', name:'行政薪资', value:5200000, level:3}, {id:'em2', name:'办公租赁费', value:1800000, level:3}, {id:'em3', name:'差旅交通', value:1100000, level:3}] },
            { id: 'ex-rd', name: '研发费用', value: 1600000, level: 2, children: [{id:'er1', name:'人员薪酬', value:1200000, level:3}, {id:'er2', name:'设备折旧', value:400000, level:3}] },
            { id: 'ex-fin', name: '财务费用', value: 400000, level: 2, children: [{id:'ef1', name:'利息支出', value:350000, level:3}, {id:'ef2', name:'银行手续费', value:50000, level:3}] }
        ]},
        { id: 'profit-op', name: '五、营业利润', value: 13650000, level: 1, children: [] },
        { id: 'profit-total', name: '六、利润总额', value: 14050000, level: 1, children: [{id:'non-op-in', name:'营业外收入', value:500000, level:2, children:[]}, {id:'non-op-out', name:'营业外支出', value:100000, level:2, children:[]}] },
        { id: 'profit-net', name: '七、净利润', value: 10537500, level: 1, children: [] }
    ],
    cash: [
        { id: 'c-op', name: '一、经营活动产生的现金流量', value: 12500000, level: 1, children: [
            { id: 'cop-in', name: '销售商品、提供劳务收到的现金', value: 91000000, level: 2, children: [] },
            { id: 'cop-out', name: '购买商品、接受劳务支付的现金', value: -78500000, level: 2, children: [] }
        ]},
        { id: 'c-inv', name: '二、投资活动产生的现金流量', value: -5200000, level: 1, children: [
            { id: 'cinv-in', name: '收回投资收到的现金', value: 1200000, level: 2, children: [] },
            { id: 'cinv-out', name: '购建固定资产支付的现金', value: -6400000, level: 2, children: [] }
        ]},
        { id: 'c-fin', name: '三、筹资活动产生的现金流量', value: 2800000, level: 1, children: [
            { id: 'cfin-in', name: '吸收投资收到的现金', value: 5000000, level: 2, children: [] },
            { id: 'cfin-out', name: '偿还债务支付的现金', value: -2200000, level: 2, children: [] }
        ]},
        { id: 'c-net', name: '四、现金及现金等价物净增加额', value: 10100000, level: 1, children: [] }
    ],
    budget: [
        { id: 1, subject: '销售费用', budget: 16000000, actual: 15500000, percent: 96.8 },
        { id: 2, subject: '管理费用', budget: 8500000, actual: 8100000, percent: 95.2 },
        { id: 3, subject: '研发费用', budget: 2000000, actual: 1600000, percent: 80.0 },
        { id: 4, subject: '财务费用', budget: 500000, actual: 400000, percent: 80.0 },
        { id: 5, subject: '人力成本', budget: 12000000, actual: 11500000, percent: 95.8 },
        { id: 6, subject: '办公行政', budget: 3000000, actual: 1800000, percent: 60.0 },
        { id: 7, subject: '市场推广费', budget: 5000000, actual: 4800000, percent: 96.0 },
        { id: 8, subject: '物流仓储费', budget: 4000000, actual: 2200000, percent: 55.0 },
        { id: 9, subject: '差旅交通费', budget: 1500000, actual: 1100000, percent: 73.3 },
    ]
};

const getAmebaBudgetData = () => {
    return AMEBA_DEPARTMENTS.map((name, index) => {
        const baseBudget = name.includes('运营') ? 5000000 : 1000000;
        const budget = Math.floor(baseBudget * (1 + Math.random()));
        const actual = Math.floor(budget * (0.7 + Math.random() * 0.3));
        return {
            id: index + 1, group: name, budget, actual, percent: Math.round(actual / budget * 100)
        };
    }).sort((a, b) => b.budget - a.budget);
};
const INITIAL_AMEBA_BUDGET_DATA = getAmebaBudgetData();

// --- 2. Mock Details ---
const getMockAccountDetails = (itemName, totalValue) => {
    const count = 6 + Math.floor(Math.random() * 5);
    const details = [];
    const types = ['银行转账', '报销单', '付款单', '收款单'];
    const users = ['张三', '李四', '王五', '赵六'];
    for (let i = 0; i < count; i++) {
        const amount = Math.floor(totalValue / count * (0.8 + Math.random() * 0.4));
        details.push({
            id: i + 1, date: `2025-10-${10 + i}`, docNo: `PZ-${100 + i}`,
            summary: `${itemName}-业务明细-${i + 1}`, type: types[i % 4],
            user: users[i % 4], debit: amount, credit: 0
        });
    }
    return details;
};

const getMockExpenseDetails = (dept, subj) => Array.from({length:6},(_,i)=>({id:i,date:`2025-10-${10+i}`,desc:`${dept}-${subj}-报销单${i+1}`,user:['张三','李四'][i%2],amount:Math.floor(Math.random()*5000)+200}));

// --- State ---
const activeTab = ref('balance');
const selectedYear = ref('2025');
const selectedMonth = ref('all');
const isBudgetEditing = ref(false);

const reportDetailVisible = ref(false);
const reportDetailData = ref(null);
const amebaDetailVisible = ref(false);
const selectedAmeba = ref(null);
const subjectDetailVisible = ref(false);
const selectedSubject = ref(null);
const expenseDetailVisible = ref(false);
const expenseDetailTitle = ref('');
const expenseDetailData = ref([]);
const expandedKeys = ref([]);

// --- Logic ---
const dateFactor = computed(() => selectedMonth.value === 'all' ? 1 : 1 / 12);
const scaleValue = (val) => Math.floor(val * dateFactor.value);

const transformReportData = (data) => {
    const process = (items) => items.map(item => {
        // Fix: Explicitly set children to undefined if empty to hide expand icon in native Table tree
        const hasChildren = item.children && item.children.length > 0;
        return {
            ...item,
            value: scaleValue(item.value),
            children: hasChildren ? process(item.children) : undefined
        };
    });
    return process(data);
};

const balanceData = computed(() => transformReportData(FULL_COMPANY_REPORTS.balance));
const profitData = computed(() => transformReportData(FULL_COMPANY_REPORTS.profit));
const cashData = computed(() => transformReportData(FULL_COMPANY_REPORTS.cash));

const amebaBudgetDisplay = computed(() => {
    return INITIAL_AMEBA_BUDGET_DATA.map(item => {
        const budget = scaleValue(item.budget);
        const actual = scaleValue(item.actual);
        return { ...item, budget, actual, percent: item.budget > 0 ? Math.round((actual / budget) * 100) : 0 };
    });
});

const companyBudgetDisplay = computed(() => {
    return FULL_COMPANY_REPORTS.budget.map(item => {
        const b = scaleValue(item.budget);
        const a = scaleValue(item.actual);
        return { ...item, budget: b, actual: a, percent: b > 0 ? Math.round((a / b) * 100) : 0 };
    });
});

const reportColumns = [ { title: '项目名称', dataIndex: 'name' }, { title: '金额', dataIndex: 'value', align: 'right' } ];

const getAllKeys = (data) => {
    let keys = [];
    const traverse = (items) => { items.forEach(item => { keys.push(item.id); if (item.children) traverse(item.children); }); };
    traverse(data);
    return keys;
};

// Tool: Collapse/Expand All
const setAllExpandState = (expand) => {
  let currentData = [];
  if (activeTab.value === 'balance') currentData = balanceData.value;
  else if (activeTab.value === 'profit') currentData = profitData.value;
  else if (activeTab.value === 'cash') currentData = cashData.value;
  else return;

  if (expand) {
    expandedKeys.value = getAllKeys(currentData);
  } else {
    expandedKeys.value = [];
  }
};

// Watch: Default expand
watch(activeTab, () => {
   if (['balance', 'profit', 'cash'].includes(activeTab.value)) {
     setTimeout(() => setAllExpandState(true), 0);
   }
}, { immediate: true });

const formatNumber = (num) => num ? num.toLocaleString() : '0';

const getProgressColor = (percent) => {
    if (percent > 95) return '#F53F3F';
    if (percent > 80) return '#FF7D00';
    return '#00B42A';
};

const handleRowClick = (record) => {
    // Logic: If children exist, toggle expansion. Else open detail.
    if (record.children) { 
       const index = expandedKeys.value.indexOf(record.id);
       if (index > -1) {
          expandedKeys.value.splice(index, 1);
       } else {
          expandedKeys.value.push(record.id);
       }
    } else {
       // Leaf node: open detail modal
       const details = getMockAccountDetails(record.name, record.value);
       reportDetailData.value = { name: record.name, value: record.value, details };
       reportDetailVisible.value = true;
    }
};

const openAmebaDetail = (record) => { selectedAmeba.value = record; amebaDetailVisible.value = true; };
const openSubjectDetail = (record) => { selectedSubject.value = record; subjectDetailVisible.value = true; };

const amebaDetailData = computed(() => {
    if (!selectedAmeba.value) return [];
    return FULL_COMPANY_REPORTS.budget.slice(0, 6).map((b, i) => ({
        id: i, subject: b.subject,
        actual: Math.floor(selectedAmeba.value.actual * 0.15 * (1 + Math.random())),
        percent: Math.floor(Math.random() * 40 + 60)
    }));
});

const subjectDetailData = computed(() => {
    if(!selectedSubject.value) return [];
    return AMEBA_DEPARTMENTS.slice(0, 5).map(dept => ({
        dept, value: Math.floor(selectedSubject.value.actual / 5 * (0.8 + Math.random() * 0.4)),
        percent: Math.floor(Math.random() * 80 + 20)
    })).sort((a,b) => b.value - a.value);
});

const openExpenseDetail = (record) => {
    expenseDetailTitle.value = `${selectedAmeba.value?.group} - ${record.subject} 费用明细`;
    expenseDetailData.value = getMockExpenseDetails(selectedAmeba.value?.group, record.subject);
    expenseDetailVisible.value = true;
};

const saveBudget = () => { isBudgetEditing.value = false; };
</script>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background-color: #F7F8FA;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
  color: #1D2129;
}

/* Top Bar */
.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.brand { display: flex; align-items: center; gap: 12px; }
.logo-box { width: 40px; height: 40px; background: linear-gradient(135deg, #165DFF 0%, #0E42D2 100%); border-radius: 8px; display: flex; justify-content: center; align-items: center; color: #fff; font-size: 20px; box-shadow: 0 4px 10px rgba(22,93,255,0.2); }
.main-title { font-size: 20px; font-weight: 700; margin: 0; line-height: 1.2; }
.sub-title { font-size: 12px; color: #86909C; letter-spacing: 0.5px; }

.controls { display: flex; gap: 12px; align-items: center; background: #fff; padding: 6px 16px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
.filter-pill { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #4E5969; }
.filter-pill .label { color: #86909C; }

/* Main Card */
.main-card-container {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  min-height: 600px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.02);
}

.report-content {
  padding-top: 16px;
}
.content-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.header-left { display: flex; align-items: center; gap: 8px; }
.header-actions { display: flex; align-items: center; }

.section-title { font-size: 16px; font-weight: 600; color: #1D2129; }
.info-icon { color: #C9CDD4; font-size: 16px; }

/* Table Styling */
.report-row:hover { background-color: #F7F8FA; cursor: pointer; }

/* Typography Colors */
.mono { font-family: 'Menlo', 'Monaco', 'Courier New', monospace; }
.bold { font-weight: 600; }
.text-indigo { color: #165DFF; }
.text-green { color: #00B42A; }
.text-gray { color: #86909C; }
.text-red { color: #F53F3F; }

.drill-btn { color: #C9CDD4; transition: all 0.2s; }
.report-row:hover .drill-btn { color: #165DFF; background-color: #E8F3FF; }

/* Budget */
.budget-container { display: flex; flex-direction: column; gap: 20px; padding-top: 16px; }
.budget-toolbar { display: flex; justify-content: space-between; align-items: center; background: #F7F8FA; padding: 12px 20px; border-radius: 8px; }
.budget-status-tag { background: #E8FFEA; color: #00B42A; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-right: 12px; }
.budget-version { color: #86909C; font-size: 12px; }

.budget-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.budget-card { background: #fff; border-radius: 8px; padding: 0; border: 1px solid #F2F3F5; }
.budget-card .card-header { border-bottom: 1px solid #F2F3F5; padding: 16px; font-weight: 600; background: #FAFAFA; border-top-left-radius: 8px; border-top-right-radius: 8px; }
.budget-card .card-body { padding: 16px; }
.budget-card .card-title { font-size: 15px; display: flex; align-items: center; gap: 8px; }

.budget-progress-row { display: flex; flex-direction: column; gap: 6px; }
.budget-progress-row .nums { font-size: 12px; display: flex; justify-content: space-between; }
.budget-progress-row .nums .spent { color: #1D2129; font-weight: 600; font-family: monospace; }
.budget-progress-row .nums .total { color: #86909C; }

/* Modal */
.modal-header-info { background: #F7F8FA; padding: 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.chart-box { padding: 12px 0; }
.bar-row { display: flex; align-items: center; margin-bottom: 12px; }
.bar-label { width: 100px; color: #4E5969; font-size: 13px; text-align: right; padding-right: 12px; }
.bar-track { flex: 1; height: 16px; background: #F2F3F5; border-radius: 4px; overflow: hidden; position: relative; }
.bar-fill { height: 100%; background: #165DFF; transition: width 0.5s; opacity: 0.8; }
.bar-val { position: absolute; right: 8px; top: 0; line-height: 16px; font-size: 11px; color: #1D2129; font-weight: 600; }
</style>