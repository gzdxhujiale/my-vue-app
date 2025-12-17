<script setup>
  import { ref, reactive, computed, watch, nextTick, h } from 'vue';
  
  // ----------------------------------------------------------------------
  // 图标组件 (使用 Vue 渲染函数 h() 代替 JSX 以避免编译器报错)
  // ----------------------------------------------------------------------
  const createIcon = (size, children) => {
      return () => h('svg', {
          xmlns: "http://www.w3.org/2000/svg",
          width: size,
          height: size,
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
      }, children);
  };
  
  const IconEdit = createIcon("15", [
      h('path', { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }),
      h('path', { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })
  ]);
  
  const IconTrash2 = createIcon("15", [
      h('path', { d: "M3 6h18" }),
      h('path', { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
      h('path', { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" })
  ]);
  
  const IconPlus = createIcon("18", [
      h('path', { d: "M5 12h14" }),
      h('path', { d: "M12 5v14" })
  ]);
  
  const IconX = createIcon("20", [
      h('path', { d: "M18 6 6 18" }),
      h('path', { d: "m6 6 12 12" })
  ]);
  
  const IconCheck = createIcon("16", [
      h('polyline', { points: "20 6 9 17 4 12" })
  ]);
  
  // ----------------------------------------------------------------------
  // 初始数据定义 (保持原始结构)
  // ----------------------------------------------------------------------
  const INITIAL_DIM_DATA = {
      customer: [
          { id: 1, code: 'PJT-5001', name: '橘子树去哪儿', contact: '李经理', phone: '13800138000', status: '启用' },
          { id: 2, code: 'PJT-5002', name: '饭饭又饿了', contact: '王总', phone: '13900139000', status: '启用' },
          { id: 3, code: 'PJT-5003', name: '小美严选', contact: '张三', phone: '13700137000', status: '停用' }
      ],
      platform: [
          { id: 1, name: '抖音', code: 'PLAT-DY', type: '电商', status: '启用' },
          { id: 2, name: '淘宝', code: 'PLAT-TB', type: '电商', status: '启用' },
          { id: 3, name: '快手', code: 'PLAT-KS', type: '电商', status: '启用' },
          { id: 4, name: '拼多多', code: 'PLAT-PDD', type: '电商', status: '启用' }
      ],
      store: [
          { id: 1, code: 'SHP-4001', name: '橘子树一号店', customer: '橘子树去哪儿', platform: '淘宝', department: '运营部-淘宝', status: '启用', effectiveDate: '2024-01-01' },
          { id: 2, code: 'SHP-4002', name: '饭饭四号店', customer: '饭饭又饿了', platform: '抖音', department: '运营部-抖音', status: '启用', effectiveDate: '2024-03-15' },
          { id: 3, code: 'SHP-4003', name: '小美严选一店', customer: '小美严选', platform: '拼多多', department: '运营部-拼多多', status: '启用', effectiveDate: '2024-06-01' },
          { id: 4, code: 'SHP-4004', name: '橘子树三号店', customer: '橘子树去哪儿', platform: '快手', department: '运营部-快手', status: '启用', effectiveDate: '2024-02-20' }
      ],
      department: [
          { id: 1, code: 'DPT-1001', name: '总经办', parent: '-', manager: '张总', financeAttr: '管理费用', status: '启用' },
          { id: 2, code: 'DPT-2001', name: '运营部-淘宝', parent: '运营中心', manager: '李经理', financeAttr: '销售费用', status: '启用' },
          { id: 3, code: 'DPT-2002', name: '研发部', parent: '产研中心', manager: '王工', financeAttr: '研发费用', status: '启用' },
          { id: 4, code: 'DPT-3001', name: '供应链部', parent: '-', manager: '赵主管', financeAttr: '生产成本', status: '启用' }
      ],
      employee: [
          { id: 1, name: '张三', code: 'EMP-001', dept: '财务部', title: '会计', status: '在职' },
          { id: 2, name: '李四', code: 'EMP-002', dept: '运营部', title: '运营专员', status: '在职' },
          { id: 3, name: '王五', code: 'EMP-003', dept: '人事部', title: 'HRBP', status: '离职' },
          { id: 4, name: '赵六', code: 'EMP-004', dept: '开发部', title: '工程师', status: '在职' }
      ],
      product: [
          { id: 1, sku: 'SKU-001', name: '纯棉T恤', cost: 25.00, brand: '自营', category: '服装' },
          { id: 2, sku: 'SKU-002', name: '运动水壶', cost: 12.50, brand: '运动家', category: '百货' },
          { id: 3, sku: 'SKU-003', name: '蓝牙耳机', cost: 85.00, brand: '极客', category: '数码' }
      ],
      subject: [
          { id: 1, code: '6602', name: '管理费用', parent: '期间费用', level: 2, category: '费用' },
          { id: 2, code: '6601', name: '销售费用', parent: '期间费用', level: 2, category: '费用' },
          { id: 3, code: '6001', name: '主营业务收入', parent: '营业收入', level: 2, category: '收入' },
          { id: 4, code: '1001', name: '库存现金', parent: '货币资金', level: 2, category: '资产' }
      ]
  };
  
  const INITIAL_ONLINE_MAPPING_RULES = [
      { id: 1, platform: '快手', type: '结算账单', sourceField: '订单实付(元)', logic: '取值', targetTable: 'F_INCOME', subject: '销售收入', code: '4010101', condition: '' },
      { id: 2, platform: '快手', type: '结算账单', sourceField: '政府补贴+支付营销补贴', logic: '加和', targetTable: 'F_INCOME', subject: '营业外收入', code: '403', condition: '' },
      { id: 3, platform: '快手', type: '结算账单', sourceField: '订单退款(元)+支付营销', logic: '加和', targetTable: 'F_TRANSACTION_COSTS', subject: '销售退回', code: '40102', condition: '' },
      { id: 4, platform: '抖音', type: '结算账单', sourceField: '用户实付', logic: '取值', targetTable: 'F_INCOME', subject: '销售收入', code: '4010101', condition: 'value > 0' },
      { id: 5, platform: '抖音', type: '结算账单', sourceField: '用户实付', logic: '取值', targetTable: 'F_INCOME', subject: '销售退回', code: '40102', condition: 'value < 0' },
      { id: 6, platform: '淘宝', type: '结算账单', sourceField: '订单实际金额(元)', logic: '取值', targetTable: 'F_INCOME', subject: '销售收入', code: '4010101', condition: '' },
  ];
  
  const INITIAL_ONLINE_STRUCTURE_RULES = [
      { id: 1, checkId: 'CHK-001', platform: '快手', type: '结算账单', colName: '订单号', colOrder: 1, valueType: '文本', allowNull: '否', regex: '^[0-9]+$', status: '启用' },
      { id: 2, checkId: 'CHK-002', platform: '快手', type: '结算账单', colName: '实付金额', colOrder: 2, valueType: '数值', allowNull: '否', regex: '', status: '启用' },
      { id: 3, checkId: 'CHK-003', platform: '抖音', type: '订单管理', colName: '订单ID', colOrder: 1, valueType: '文本', allowNull: '否', regex: '', status: '启用' }
  ];
  
  const INITIAL_OFFLINE_MAIN = [
      { id: 1, dimId: 'FlvqbVbIma8So...', dataId: 'tblfsn2XLGxCT60f', date: '付款计划_计划日期', amount: '付款计划_计划金额', category: '支出类别', mapTable: '潮前审批申请单多维表格-A' },
      { id: 2, dimId: '', dataId: 'tblhzDobx7bBgGaU', date: '付款计划_计划日期', amount: '付款计划_计划金额', category: '支出类别', mapTable: '潮前审批申请单多维表格-A' }
  ];
  
  const INITIAL_OFFLINE_FIELD = [
      { id: 1, mapName: '潮前审批申请单多维表格-A', sourceField: '发起人部门', standardDim: '部门名称', status: true },
      { id: 2, mapName: '潮前审批申请单多维表格-A', sourceField: '发起人', standardDim: '员工姓名', status: true }
  ];
  
  const INITIAL_OFFLINE_SUBJECT = [
      { id: 1, dictId: 'DIC-001', dictName: '费用类型字典', sourceValue: '差旅费', targetTable: 'F_COST', targetCode: '660101' },
      { id: 2, dictId: 'DIC-001', dictName: '费用类型字典', sourceValue: '办公用品', targetTable: 'F_COST', targetCode: '660102' },
      { id: 3, dictId: 'DIC-002', dictName: '支出类别字典', sourceValue: '采购付款', targetTable: 'F_COST', targetCode: '6401' }
  ];
  
  // 下拉选项
  const BILL_TYPES = ['订单管理', '结算账单', '资金账单', '保证金账单'];
  const CALC_LOGICS = ['取值', '加和'];
  const TARGET_TABLES = [{ name: '交易收入表', code: 'F_INCOME' }, { name: '交易成本表', code: 'F_TRANSACTION_COSTS' }];
  
  // 表单 Schemas
  const FORM_SCHEMAS = {
      customer: [
          { key: 'code', label: '客户ID', type: 'text', disabled: true, placeholder: '自动生成' },
          { key: 'name', label: '客户名称', type: 'text' },
          { key: 'contact', label: '联系人', type: 'text' },
          { key: 'phone', label: '联系电话', type: 'text' },
          { key: 'status', label: '状态', type: 'select', options: ['启用', '停用'] }
      ],
      platform: [
          { key: 'name', label: '平台名称', type: 'text' },
          { key: 'code', label: '编码', type: 'text' },
          { key: 'type', label: '平台类型', type: 'select', options: ['电商', '社交', '线下'] },
          { key: 'status', label: '状态', type: 'select', options: ['启用', '停用'] }
      ],
      store: [
          { key: 'code', label: '店铺ID', type: 'text', disabled: true },
          { key: 'name', label: '店铺名称', type: 'text' },
          { key: 'customer', label: '归属客户', type: 'select', options: INITIAL_DIM_DATA.customer.map(c=>c.name) },
          { key: 'platform', label: '归属平台', type: 'select', options: INITIAL_DIM_DATA.platform.map(p=>p.name) },
          { key: 'department', label: '归属部门', type: 'select', options: INITIAL_DIM_DATA.department.map(d=>d.name) },
          { key: 'status', label: '状态', type: 'select', options: ['启用', '停用'] },
          { key: 'effectiveDate', label: '生效日期', type: 'date' }
      ],
      department: [
          { key: 'code', label: '部门ID', type: 'text' },
          { key: 'name', label: '部门名称', type: 'text' },
          { key: 'parent', label: '上级部门', type: 'text' },
          { key: 'manager', label: '部门负责人', type: 'text' },
          { key: 'financeAttr', label: '财务属性', type: 'select', options: ['管理费用', '销售费用', '研发费用', '生产成本'] },
          { key: 'status', label: '状态', type: 'select', options: ['启用', '停用'] }
      ],
      employee: [
          { key: 'name', label: '员工姓名', type: 'text' },
          { key: 'code', label: '工号', type: 'text' },
          { key: 'dept', label: '所属部门', type: 'select', options: INITIAL_DIM_DATA.department.map(d=>d.name) },
          { key: 'title', label: '岗位', type: 'text' },
          { key: 'status', label: '状态', type: 'select', options: ['在职', '离职'] }
      ],
      product: [
          { key: 'sku', label: '商品SKU', type: 'text' },
          { key: 'name', label: '商品名称', type: 'text' },
          { key: 'cost', label: '商品成本', type: 'number' },
          { key: 'brand', label: '品牌', type: 'text' },
          { key: 'category', label: '品类', type: 'text' }
      ],
      subject: [
          { key: 'code', label: '科目编码', type: 'text' },
          { key: 'name', label: '科目名称', type: 'text' },
          { key: 'parent', label: '上级科目', type: 'text' },
          { key: 'level', label: '科目层级', type: 'number' },
          { key: 'category', label: '科目类别', type: 'select', options: ['资产', '负债', '权益', '收入', '成本', '费用'] }
      ],
      online_mapping: [
          { key: 'platform', label: '源平台', type: 'select', options: INITIAL_DIM_DATA.platform.map(p=>p.name) },
          { key: 'type', label: '源账单类型', type: 'select', options: BILL_TYPES },
          { key: 'sourceField', label: '源字段名', type: 'text' },
          { key: 'logic', label: '计算逻辑', type: 'select', options: CALC_LOGICS },
          { key: 'targetTable', label: '目标事实表', type: 'select', options: TARGET_TABLES.map(t=>t.name) },
          { key: 'subject', label: '财务科目', type: 'select', options: INITIAL_DIM_DATA.subject.map(s=>s.name) },
          { key: 'condition', label: '过滤条件', type: 'text', placeholder: '如: value > 0' }
      ],
      online_structure: [
          { key: 'checkId', label: '校验ID', type: 'text', disabled: true, placeholder: '自动生成' },
          { key: 'platform', label: '平台名称', type: 'select', options: INITIAL_DIM_DATA.platform.map(p=>p.name) },
          { key: 'type', label: '账单类型', type: 'select', options: BILL_TYPES },
          { key: 'colName', label: '列名', type: 'text' },
          { key: 'colOrder', label: '列顺序', type: 'number' },
          { key: 'valueType', label: '期望数值类型', type: 'select', options: ['文本', '数值', '布尔值'] },
          { key: 'allowNull', label: '是否允许为空', type: 'select', options: ['是', '否'] },
          { key: 'regex', label: '校验正则表达式', type: 'text' },
          { key: 'status', label: '状态', type: 'select', options: ['启用', '停用'] }
      ],
      offline_main: [
           { key: 'dimId', label: '多维表ID', type: 'text' },
           { key: 'dataId', label: '数据表ID', type: 'text' },
           { key: 'date', label: '日期字段', type: 'text' },
           { key: 'amount', label: '报销金额字段', type: 'text' },
           { key: 'category', label: '支出类别字段', type: 'text' },
           { key: 'mapTable', label: '字段映射表', type: 'text' }
      ],
      offline_field: [
           { key: 'mapName', label: '映射集名称', type: 'text' },
           { key: 'sourceField', label: '源表字段名', type: 'text' },
           { key: 'standardDim', label: '中台标准维度', type: 'text' },
           { key: 'status', label: '状态', type: 'select', options: [{value: true, label: '启用'}, {value: false, label: '停用'}] }
      ],
      offline_subject: [
           { key: 'dictId', label: '字典ID', type: 'text' },
           { key: 'dictName', label: '字典名称', type: 'text' },
           { key: 'sourceValue', label: '源业务值', type: 'text' },
           { key: 'targetTable', label: '目标事实表', type: 'text' },
           { key: 'targetCode', label: '目标科目编码', type: 'text' }
      ]
  };
  
  // ----------------------------------------------------------------------
  // 响应式状态
  // ----------------------------------------------------------------------
  const activeTab = ref('dimension');
  const dimensionSubTab = ref('customer');
  const offlineSubTab = ref('main');
  const onlineSubTab = ref('mapping');
  
  const dimData = reactive({ ...INITIAL_DIM_DATA });
  const onlineRules = ref([...INITIAL_ONLINE_MAPPING_RULES]);
  const onlineStructure = ref([...INITIAL_ONLINE_STRUCTURE_RULES]);
  
  const offlineMainData = ref([...INITIAL_OFFLINE_MAIN]);
  const offlineFieldData = ref([...INITIAL_OFFLINE_FIELD]);
  const offlineSubjectData = ref([...INITIAL_OFFLINE_SUBJECT]);
  
  const modal = reactive({
      isOpen: false,
      title: '',
      fields: [],
      initialData: null,
      type: '',
      formData: {} // 内部状态
  });
  
  // ----------------------------------------------------------------------
  // 逻辑方法
  // ----------------------------------------------------------------------
  
  // 监听弹窗打开，初始化表单数据
  watch(() => modal.isOpen, (newVal) => {
      if (newVal) {
          modal.formData = modal.initialData ? { ...modal.initialData } : {};
      }
  });
  
  const openModal = (type, data = null) => {
      let fields = [];
      let title = data ? '编辑配置' : '新增配置';
  
      if (activeTab.value === 'dimension') {
          fields = FORM_SCHEMAS[dimensionSubTab.value];
          // 简单映射 获取中文名
          const map = {customer:'客户', platform:'平台', store:'店铺', department:'部门', employee:'员工', product:'商品', subject:'科目'};
          title = `${data ? '编辑' : '新增'}${map[dimensionSubTab.value]}数据`;
      } else if (activeTab.value === 'online') {
          if (onlineSubTab.value === 'mapping') fields = FORM_SCHEMAS['online_mapping'];
          if (onlineSubTab.value === 'structure') fields = FORM_SCHEMAS['online_structure'];
      } else if (activeTab.value === 'offline') {
          if (offlineSubTab.value === 'main') fields = FORM_SCHEMAS['offline_main'];
          if (offlineSubTab.value === 'field') fields = FORM_SCHEMAS['offline_field'];
          if (offlineSubTab.value === 'subject') fields = FORM_SCHEMAS['offline_subject'];
      }
  
      modal.title = title;
      modal.fields = fields;
      modal.initialData = data;
      modal.type = type;
      modal.isOpen = true;
  };
  
  const handleModalChange = (key, value) => {
      modal.formData[key] = value;
      
      // 特殊联动: 选择财务科目名称自动填充编码
      if (key === 'subject') {
          const subj = INITIAL_DIM_DATA.subject.find(s => s.name === value);
          if (subj) {
              modal.formData.subject = value;
              modal.formData.code = subj.code;
          }
      }
  };
  
  const handleSave = () => {
      const formData = modal.formData;
      const isEdit = !!formData.id;
      const newData = { ...formData, id: formData.id || Date.now() };
  
      if (activeTab.value === 'dimension') {
          const list = dimData[dimensionSubTab.value];
          if (isEdit) {
              dimData[dimensionSubTab.value] = list.map(item => item.id === newData.id ? newData : item);
          } else {
              dimData[dimensionSubTab.value] = [...list, newData];
          }
      } else if (activeTab.value === 'online') {
          if (onlineSubTab.value === 'mapping') {
              onlineRules.value = isEdit ? onlineRules.value.map(item => item.id === newData.id ? newData : item) : [...onlineRules.value, newData];
          } else {
              onlineStructure.value = isEdit ? onlineStructure.value.map(item => item.id === newData.id ? newData : item) : [...onlineStructure.value, newData];
          }
      } else if (activeTab.value === 'offline') {
          if (offlineSubTab.value === 'main') {
              offlineMainData.value = isEdit ? offlineMainData.value.map(item => item.id === newData.id ? newData : item) : [...offlineMainData.value, newData];
          }
          if (offlineSubTab.value === 'field') {
              offlineFieldData.value = isEdit ? offlineFieldData.value.map(item => item.id === newData.id ? newData : item) : [...offlineFieldData.value, newData];
          }
          if (offlineSubTab.value === 'subject') {
              offlineSubjectData.value = isEdit ? offlineSubjectData.value.map(item => item.id === newData.id ? newData : item) : [...offlineSubjectData.value, newData];
          }
      }
      modal.isOpen = false;
  };
  
  const handleDelete = (id) => {
      if(!confirm('确定要删除吗？')) return;
      
      if (activeTab.value === 'dimension') {
          dimData[dimensionSubTab.value] = dimData[dimensionSubTab.value].filter(i => i.id !== id);
      } else if (activeTab.value === 'online') {
          if (onlineSubTab.value === 'mapping') onlineRules.value = onlineRules.value.filter(i => i.id !== id);
          else onlineStructure.value = onlineStructure.value.filter(i => i.id !== id);
      } else if (activeTab.value === 'offline') {
          if (offlineSubTab.value === 'main') offlineMainData.value = offlineMainData.value.filter(i => i.id !== id);
          if (offlineSubTab.value === 'field') offlineFieldData.value = offlineFieldData.value.filter(i => i.id !== id);
          if (offlineSubTab.value === 'subject') offlineSubjectData.value = offlineSubjectData.value.filter(i => i.id !== id);
      }
  };
  
  const getOptionLabel = (opt) => {
      return typeof opt === 'object' ? opt.label : opt;
  };
  const getOptionValue = (opt) => {
      return typeof opt === 'object' ? opt.value : opt;
  };
  
  </script>
  
  <template>
    <div class="page-container animate-fade-in">
      <!-- Header -->
      <div class="header mb-8 flex justify-between items-end">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">配置管理</h2>
          <p class="text-slate-500 text-sm mt-1">集中管理系统维度数据与业务规则映射</p>
        </div>
        <button @click="openModal('add')" class="add-btn px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm font-medium">
          <component :is="IconPlus" /> 新增配置
        </button>
      </div>
  
      <!-- Main Tabs -->
      <div class="flex border-b border-slate-200 mb-6">
        <button 
          @click="activeTab = 'dimension'" 
          class="main-tab-btn" 
          :class="activeTab === 'dimension' ? 'active-tab' : 'inactive-tab'"
        >维度数据管理</button>
        <button 
          @click="activeTab = 'online'" 
          class="main-tab-btn" 
          :class="activeTab === 'online' ? 'active-tab' : 'inactive-tab'"
        >线上账单配置</button>
        <button 
          @click="activeTab = 'offline'" 
          class="main-tab-btn" 
          :class="activeTab === 'offline' ? 'active-tab' : 'inactive-tab'"
        >线下账单配置</button>
      </div>
  
      <!-- Content Area -->
      <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden min-h-[600px] flex flex-col">
          
          <!-- 1. Dimension Data Management -->
          <div v-if="activeTab === 'dimension'" class="flex flex-col h-full">
              <div class="flex border-b border-slate-100 px-6 gap-2 bg-slate-50 overflow-x-auto">
                  <button 
                      v-for="key in ['customer', 'platform', 'store', 'department', 'employee', 'product', 'subject']" 
                      :key="key"
                      @click="dimensionSubTab = key"
                      class="sub-tab-btn"
                      :class="dimensionSubTab === key ? 'sub-tab-active' : 'sub-tab-inactive'"
                  >
                      {{ {customer:'客户', platform:'平台', store:'店铺', department:'部门', employee:'员工', product:'商品', subject:'科目'}[key] }}管理
                  </button>
              </div>
              <div class="flex-1 overflow-auto">
                  <table class="w-full text-sm">
                      <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider text-left sticky top-0 z-10 shadow-sm">
                          <tr>
                              <th class="px-6 py-3 w-10"><input type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/></th>
                              <template v-if="dimensionSubTab === 'customer'">
                                  <th class="px-6 py-3">ID</th><th class="px-6 py-3">客户名称</th><th class="px-6 py-3">联系人</th><th class="px-6 py-3">电话</th><th class="px-6 py-3">状态</th>
                              </template>
                              <template v-if="dimensionSubTab === 'platform'">
                                  <th class="px-6 py-3">平台名称</th><th class="px-6 py-3">编码</th><th class="px-6 py-3">类型</th><th class="px-6 py-3">状态</th>
                              </template>
                              <template v-if="dimensionSubTab === 'store'">
                                  <th class="px-6 py-3">店铺名称</th><th class="px-6 py-3">编码</th><th class="px-6 py-3">平台</th><th class="px-6 py-3">客户</th><th class="px-6 py-3">部门</th><th class="px-6 py-3">状态</th><th class="px-6 py-3">生效日期</th>
                              </template>
                              <template v-if="dimensionSubTab === 'department'">
                                  <th class="px-6 py-3">部门名称</th><th class="px-6 py-3">编码</th><th class="px-6 py-3">上级</th><th class="px-6 py-3">负责人</th><th class="px-6 py-3">财务属性</th><th class="px-6 py-3">状态</th>
                              </template>
                              <template v-if="dimensionSubTab === 'employee'">
                                  <th class="px-6 py-3">姓名</th><th class="px-6 py-3">工号</th><th class="px-6 py-3">部门</th><th class="px-6 py-3">岗位</th><th class="px-6 py-3">状态</th>
                              </template>
                              <template v-if="dimensionSubTab === 'product'">
                                  <th class="px-6 py-3">SKU</th><th class="px-6 py-3">名称</th><th class="px-6 py-3">成本</th><th class="px-6 py-3">品牌</th><th class="px-6 py-3">品类</th>
                              </template>
                              <template v-if="dimensionSubTab === 'subject'">
                                  <th class="px-6 py-3">编码</th><th class="px-6 py-3">名称</th><th class="px-6 py-3">上级</th><th class="px-6 py-3">层级</th><th class="px-6 py-3">类别</th>
                              </template>
                              <th class="px-6 py-3 text-right w-24">操作</th>
                          </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                          <tr v-for="row in dimData[dimensionSubTab]" :key="row.id" class="hover:bg-slate-50 transition-colors group">
                              <td class="px-6 py-4"><input type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/></td>
                              
                              <template v-if="dimensionSubTab === 'customer'">
                                  <td class="px-6 py-4 text-slate-500">{{ row.code }}</td>
                                  <td class="px-6 py-4 font-medium text-slate-800">{{ row.name }}</td>
                                  <td class="px-6 py-4">{{ row.contact }}</td>
                                  <td class="px-6 py-4 font-mono text-slate-500">{{ row.phone }}</td>
                                  <td class="px-6 py-4"><span class="status-chip" :class="row.status === '启用' ? 'status-active' : 'status-inactive'">{{ row.status }}</span></td>
                              </template>
  
                              <template v-if="dimensionSubTab === 'platform'">
                                  <td class="px-6 py-4 font-medium">{{ row.name }}</td>
                                  <td class="px-6 py-4 font-mono text-slate-500">{{ row.code }}</td>
                                  <td class="px-6 py-4"><span class="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs">{{ row.type }}</span></td>
                                  <td class="px-6 py-4"><span class="status-chip" :class="row.status === '启用' ? 'status-active' : 'status-inactive'">{{ row.status }}</span></td>
                              </template>
  
                              <template v-if="dimensionSubTab === 'store'">
                                  <td class="px-6 py-4 font-medium">{{ row.name }}</td>
                                  <td class="px-6 py-4 font-mono text-slate-500">{{ row.code }}</td>
                                  <td class="px-6 py-4">{{ row.platform }}</td>
                                  <td class="px-6 py-4">{{ row.customer }}</td>
                                  <td class="px-6 py-4 text-indigo-600">{{ row.department }}</td>
                                  <td class="px-6 py-4"><span class="status-chip" :class="row.status === '启用' ? 'status-active' : 'status-inactive'">{{ row.status }}</span></td>
                                  <td class="px-6 py-4 font-mono text-xs">{{ row.effectiveDate }}</td>
                              </template>
                              
                              <template v-if="dimensionSubTab === 'department'">
                                  <td class="px-6 py-4 font-medium">{{ row.name }}</td>
                                  <td class="px-6 py-4 font-mono text-slate-500">{{ row.code }}</td>
                                  <td class="px-6 py-4">{{ row.parent }}</td>
                                  <td class="px-6 py-4">{{ row.manager }}</td>
                                  <td class="px-6 py-4 text-slate-500"><span class="bg-slate-100 rounded px-2 w-fit">{{ row.financeAttr }}</span></td>
                                  <td class="px-6 py-4"><span class="status-chip" :class="row.status === '启用' ? 'status-active' : 'status-inactive'">{{ row.status }}</span></td>
                              </template>
  
                              <template v-if="dimensionSubTab === 'employee'">
                                  <td class="px-6 py-4 font-medium">{{ row.name }}</td>
                                  <td class="px-6 py-4 font-mono text-slate-500">{{ row.code }}</td>
                                  <td class="px-6 py-4">{{ row.dept }}</td>
                                  <td class="px-6 py-4">{{ row.title }}</td>
                                  <td class="px-6 py-4"><span class="status-chip" :class="row.status === '在职' ? 'status-active' : 'status-inactive'">{{ row.status }}</span></td>
                              </template>
  
                              <template v-if="dimensionSubTab === 'product'">
                                  <td class="px-6 py-4 font-mono text-slate-500">{{ row.sku }}</td>
                                  <td class="px-6 py-4 font-medium">{{ row.name }}</td>
                                  <td class="px-6 py-4 font-mono">¥ {{ row.cost.toFixed(2) }}</td>
                                  <td class="px-6 py-4">{{ row.brand }}</td>
                                  <td class="px-6 py-4">{{ row.category }}</td>
                              </template>
  
                              <template v-if="dimensionSubTab === 'subject'">
                                  <td class="px-6 py-4 font-mono text-slate-500">{{ row.code }}</td>
                                  <td class="px-6 py-4 font-medium">{{ row.name }}</td>
                                  <td class="px-6 py-4">{{ row.parent }}</td>
                                  <td class="px-6 py-4"><span class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">{{ row.level }}</span></td>
                                  <td class="px-6 py-4 text-indigo-600">{{ row.category }}</td>
                              </template>
  
                              <td class="px-6 py-4 text-right flex justify-end gap-2">
                                  <button @click="openModal('edit', row)" class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="编辑"><component :is="IconEdit" /></button>
                                  <button @click="handleDelete(row.id)" class="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="删除"><component :is="IconTrash2" /></button>
                              </td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>
  
          <!-- 2. Online Bill Config -->
          <div v-if="activeTab === 'online'" class="flex flex-col h-full animate-fade-in">
               <div class="flex border-b border-slate-100 px-6 gap-8 bg-slate-50">
                  <button 
                      @click="onlineSubTab = 'mapping'"
                      class="sub-tab-btn"
                      :class="onlineSubTab === 'mapping' ? 'sub-tab-active' : 'sub-tab-inactive'"
                  >科目映射表</button>
                  <button 
                      @click="onlineSubTab = 'structure'"
                      class="sub-tab-btn"
                      :class="onlineSubTab === 'structure' ? 'sub-tab-active' : 'sub-tab-inactive'"
                  >账单结构定义表</button>
              </div>
              <div class="p-0 overflow-auto flex-1">
                  <table class="w-full text-sm">
                      <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider text-left sticky top-0 z-10 shadow-sm">
                          <tr>
                              <th class="px-6 py-3 w-10"><input type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/></th>
                              <template v-if="onlineSubTab === 'mapping'">
                                  <th class="px-6 py-3">源平台</th><th class="px-6 py-3">账单类型</th><th class="px-6 py-3">源字段名</th><th class="px-6 py-3">逻辑</th><th class="px-6 py-3">目标表</th><th class="px-6 py-3">财务科目</th><th class="px-6 py-3">科目编码</th><th class="px-6 py-3">条件</th>
                              </template>
                              <template v-if="onlineSubTab === 'structure'">
                                  <th class="px-6 py-3">校验ID</th><th class="px-6 py-3">平台</th><th class="px-6 py-3">账单类型</th><th class="px-6 py-3">列名</th><th class="px-6 py-3">顺序</th><th class="px-6 py-3">类型</th><th class="px-6 py-3">允许空</th><th class="px-6 py-3">正则校验</th><th class="px-6 py-3">状态</th>
                              </template>
                              <th class="px-6 py-3 text-right w-24">操作</th>
                          </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                          <template v-if="onlineSubTab === 'mapping'">
                              <tr v-for="row in onlineRules" :key="row.id" class="hover:bg-slate-50 transition-colors group">
                                  <td class="px-6 py-4"><input type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/></td>
                                  <td class="px-6 py-4 font-medium">{{ row.platform }}</td>
                                  <td class="px-6 py-4 text-slate-600">{{ row.type }}</td>
                                  <td class="px-6 py-4"><span class="font-mono text-xs text-slate-500 bg-slate-50 p-1 rounded w-fit">{{ row.sourceField }}</span></td>
                                  <td class="px-6 py-4"><span class="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs font-bold">{{ row.logic }}</span></td>
                                  <td class="px-6 py-4 text-slate-600">{{ row.targetTable }}</td>
                                  <td class="px-6 py-4 font-medium text-slate-700">{{ row.subject }}</td>
                                  <td class="px-6 py-4 font-mono text-slate-500">{{ row.code }}</td>
                                  <td class="px-6 py-4 font-mono text-xs text-amber-600">{{ row.condition }}</td>
                                  <td class="px-6 py-4 text-right flex justify-end gap-2">
                                      <button @click="openModal('edit', row)" class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"><component :is="IconEdit" /></button>
                                      <button @click="handleDelete(row.id)" class="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><component :is="IconTrash2" /></button>
                                  </td>
                              </tr>
                          </template>
                           <template v-if="onlineSubTab === 'structure'">
                              <tr v-for="row in onlineStructure" :key="row.id" class="hover:bg-slate-50 transition-colors group">
                                  <td class="px-6 py-4"><input type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/></td>
                                  <td class="px-6 py-4 font-mono text-slate-500 text-xs">{{ row.checkId }}</td>
                                  <td class="px-6 py-4 font-medium">{{ row.platform }}</td>
                                  <td class="px-6 py-4 text-slate-600">{{ row.type }}</td>
                                  <td class="px-6 py-4 font-medium">{{ row.colName }}</td>
                                  <td class="px-6 py-4 text-center"><span class="bg-slate-100 px-2 rounded text-xs">{{ row.colOrder }}</span></td>
                                  <td class="px-6 py-4 text-slate-600">{{ row.valueType }}</td>
                                  <td class="px-6 py-4 text-slate-600">{{ row.allowNull }}</td>
                                  <td class="px-6 py-4 font-mono text-xs text-slate-400 truncate max-w-[100px]" :title="row.regex">{{ row.regex }}</td>
                                  <td class="px-6 py-4"><span class="status-chip" :class="row.status === '启用' ? 'status-active' : 'status-inactive'">{{ row.status }}</span></td>
                                  <td class="px-6 py-4 text-right flex justify-end gap-2">
                                      <button @click="openModal('edit', row)" class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"><component :is="IconEdit" /></button>
                                      <button @click="handleDelete(row.id)" class="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><component :is="IconTrash2" /></button>
                                  </td>
                              </tr>
                          </template>
                      </tbody>
                  </table>
              </div>
          </div>
  
          <!-- 3. Offline Bill Config -->
          <div v-if="activeTab === 'offline'" class="flex flex-col h-full animate-fade-in">
              <div class="flex border-b border-slate-100 px-6 gap-8 bg-slate-50">
                  <button @click="offlineSubTab = 'main'" class="sub-tab-btn" :class="offlineSubTab === 'main' ? 'sub-tab-active' : 'sub-tab-inactive'">主流程规则表</button>
                  <button @click="offlineSubTab = 'field'" class="sub-tab-btn" :class="offlineSubTab === 'field' ? 'sub-tab-active' : 'sub-tab-inactive'">字段映射表</button>
                  <button @click="offlineSubTab = 'subject'" class="sub-tab-btn" :class="offlineSubTab === 'subject' ? 'sub-tab-active' : 'sub-tab-inactive'">科目映射表</button>
              </div>
              <div class="flex-1 overflow-auto p-0">
                  <table class="w-full text-sm">
                      <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider text-left sticky top-0 z-10 shadow-sm">
                          <tr>
                              <th class="px-6 py-3 w-10"><input type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/></th>
                              <template v-if="offlineSubTab === 'main'">
                                  <th class="px-6 py-3">多维表ID</th><th class="px-6 py-3">数据表ID</th><th class="px-6 py-3">日期字段</th><th class="px-6 py-3">金额字段</th><th class="px-6 py-3">类别字段</th><th class="px-6 py-3">映射表</th>
                              </template>
                              <template v-if="offlineSubTab === 'field'">
                                  <th class="px-6 py-3">映射集名称</th><th class="px-6 py-3">源表字段</th><th class="px-6 py-3">中台标准维度</th><th class="px-6 py-3">状态</th>
                              </template>
                              <template v-if="offlineSubTab === 'subject'">
                                  <th class="px-6 py-3">字典ID</th><th class="px-6 py-3">字典名称</th><th class="px-6 py-3">源值</th><th class="px-6 py-3">目标表</th><th class="px-6 py-3">目标科目</th>
                              </template>
                              <th class="px-6 py-3 text-right w-24">操作</th>
                          </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                           <template v-if="offlineSubTab === 'main'">
                               <tr v-for="row in offlineMainData" :key="row.id" class="hover:bg-slate-50 transition-colors group">
                                  <td class="px-6 py-4"><input type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/></td>
                                  <td class="px-6 py-4 font-mono text-xs text-slate-400 truncate max-w-[100px]">{{ row.dimId || '-' }}</td>
                                  <td class="px-6 py-4 font-mono text-xs text-slate-800">{{ row.dataId }}</td>
                                  <td class="px-6 py-4 text-slate-600">{{ row.date }}</td>
                                  <td class="px-6 py-4 text-slate-600">{{ row.amount }}</td>
                                  <td class="px-6 py-4 text-slate-600">{{ row.category }}</td>
                                  <td class="px-6 py-4 text-xs text-indigo-600">{{ row.mapTable }}</td>
                                  <td class="px-6 py-4 text-right flex justify-end gap-2">
                                      <button @click="openModal('edit', row)" class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"><component :is="IconEdit" /></button>
                                      <button @click="handleDelete(row.id)" class="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><component :is="IconTrash2" /></button>
                                  </td>
                               </tr>
                           </template>
                           <template v-if="offlineSubTab === 'field'">
                               <tr v-for="row in offlineFieldData" :key="row.id" class="hover:bg-slate-50 transition-colors group">
                                  <td class="px-6 py-4"><input type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/></td>
                                  <td class="px-6 py-4 font-medium text-slate-800">{{ row.mapName }}</td>
                                  <td class="px-6 py-4 text-slate-600">{{ row.sourceField }}</td>
                                  <td class="px-6 py-4"><span class="text-indigo-600 bg-indigo-50 w-fit px-2 rounded">{{ row.standardDim }}</span></td>
                                  <td class="px-6 py-4 text-emerald-500"><component :is="IconCheck" v-if="row.status"/></td>
                                  <td class="px-6 py-4 text-right flex justify-end gap-2">
                                      <button @click="openModal('edit', row)" class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"><component :is="IconEdit" /></button>
                                      <button @click="handleDelete(row.id)" class="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><component :is="IconTrash2" /></button>
                                  </td>
                               </tr>
                           </template>
                           <template v-if="offlineSubTab === 'subject'">
                               <tr v-for="row in offlineSubjectData" :key="row.id" class="hover:bg-slate-50 transition-colors group">
                                  <td class="px-6 py-4"><input type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/></td>
                                  <td class="px-6 py-4 font-mono text-slate-400 text-xs">{{ row.dictId }}</td>
                                  <td class="px-6 py-4 font-medium">{{ row.dictName }}</td>
                                  <td class="px-6 py-4 text-indigo-600 font-medium">{{ row.sourceValue }}</td>
                                  <td class="px-6 py-4 font-mono text-slate-500">{{ row.targetTable }}</td>
                                  <td class="px-6 py-4"><span class="font-mono text-slate-700 bg-slate-100 w-fit px-2 rounded">{{ row.targetCode }}</span></td>
                                  <td class="px-6 py-4 text-right flex justify-end gap-2">
                                      <button @click="openModal('edit', row)" class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"><component :is="IconEdit" /></button>
                                      <button @click="handleDelete(row.id)" class="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><component :is="IconTrash2" /></button>
                                  </td>
                               </tr>
                           </template>
                      </tbody>
                  </table>
              </div>
          </div>
  
      </div>
  
      <!-- Dynamic Modal -->
      <div v-if="modal.isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-40 backdrop-blur-sm animate-fade-in" @click="modal.isOpen = false">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-slide-up" @click.stop>
              <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 class="text-lg font-bold text-slate-800">{{ modal.title }}</h3>
                  <button @click="modal.isOpen = false" class="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><component :is="IconX" /></button>
              </div>
              <div class="p-6 max-h-[70vh] overflow-y-auto">
                  <div class="grid grid-cols-1 gap-5">
                      <div v-for="field in modal.fields" :key="field.key">
                          <label class="block text-sm font-medium text-slate-600 mb-1">{{ field.label }}</label>
                          <select 
                              v-if="field.type === 'select'"
                              :value="modal.formData[field.key] !== undefined ? modal.formData[field.key] : ''"
                              @change="e => handleModalChange(field.key, field.options.every(o => typeof o === 'object') && field.key === 'status' ? (e.target.value === 'true') : e.target.value)"
                              class="form-input bg-white"
                              :disabled="field.disabled"
                          >
                              <option value="">请选择</option>
                              <option v-for="(opt, i) in field.options" :key="i" :value="getOptionValue(opt)">{{ getOptionLabel(opt) }}</option>
                          </select>
                          <textarea
                              v-else-if="field.type === 'textarea'"
                              :value="modal.formData[field.key] || ''"
                              @input="e => handleModalChange(field.key, e.target.value)"
                              class="form-input min-h-[80px]"
                              :placeholder="field.placeholder"
                          />
                          <input 
                              v-else
                              :type="field.type || 'text'"
                              :value="modal.formData[field.key] || ''"
                              @input="e => handleModalChange(field.key, e.target.value)"
                              class="form-input"
                              :placeholder="field.placeholder"
                              :disabled="field.disabled"
                          />
                      </div>
                  </div>
              </div>
               <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button @click="modal.isOpen = false" class="px-5 py-2.5 text-slate-600 text-sm font-medium hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg transition-all">取消</button>
                  <button @click="handleSave" class="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">保存配置</button>
              </div>
          </div>
      </div>
    </div>
  </template>
  
  <style scoped>
  /* 全局盒模型重置 */
  * {
      box-sizing: border-box;
  }
  
  button {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      margin: 0;
  }
  
  input, select, textarea {
      outline: none;
  }
  
  /* 颜色 & 基础类 */
  .page-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
  }
  
  .text-slate-400 { color: #94a3b8; }
  .text-slate-500 { color: #64748b; }
  .text-slate-600 { color: #475569; }
  .text-slate-800 { color: #1e293b; }
  .text-indigo-600 { color: #4f46e5; }
  .text-red-600 { color: #dc2626; }
  .text-blue-600 { color: #2563eb; }
  .text-emerald-500 { color: #10b981; }
  .text-amber-600 { color: #d97706; }
  
  .bg-slate-50 { background-color: #f8fafc; }
  .bg-slate-100 { background-color: #f1f5f9; }
  .bg-white { background-color: #ffffff; }
  .bg-indigo-50 { background-color: #eef2ff; }
  .bg-indigo-600 { background-color: #4f46e5; }
  .bg-blue-50 { background-color: #eff6ff; }
  .bg-green-50 { background-color: #f0fdf4; }
  .bg-slate-900 { background-color: #0f172a; }
  
  .hover\:bg-indigo-50:hover { background-color: #eef2ff; }
  .hover\:bg-red-50:hover { background-color: #fef2f2; }
  .hover\:bg-slate-50:hover { background-color: #f8fafc; }
  .hover\:bg-slate-200:hover { background-color: #e2e8f0; }
  
  .border { border-width: 1px; }
  .border-b { border-bottom-width: 1px; }
  .border-t { border-top-width: 1px; }
  .border-slate-100 { border-color: #f1f5f9; }
  .border-slate-200 { border-color: #e2e8f0; }
  
  .rounded { border-radius: 0.25rem; }
  .rounded-md { border-radius: 0.375rem; }
  .rounded-lg { border-radius: 0.5rem; }
  .rounded-xl { border-radius: 0.75rem; }
  .rounded-2xl { border-radius: 1rem; }
  .rounded-full { border-radius: 9999px; }
  
  /* 布局 */
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .justify-end { justify-content: flex-end; }
  .gap-2 { gap: 0.5rem; }
  .gap-3 { gap: 0.75rem; }
  .gap-5 { gap: 1.25rem; }
  .gap-8 { gap: 2rem; }
  .mb-1 { margin-bottom: 0.25rem; }
  .mb-6 { margin-bottom: 1.5rem; }
  .mb-8 { margin-bottom: 2rem; }
  .mt-1 { margin-top: 0.25rem; }
  .p-0 { padding: 0; }
  .p-1 { padding: 0.25rem; }
  .p-2 { padding: 0.5rem; }
  .p-6 { padding: 1.5rem; }
  .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
  .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
  .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
  .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
  .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
  
  .w-full { width: 100%; }
  .h-full { height: 100%; }
  .w-fit { width: fit-content; }
  
  /* Main Tabs */
  .main-tab-btn {
      padding: 1rem 1.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
      border-bottom: 2px solid transparent;
  }
  .active-tab {
      border-bottom-color: #4f46e5;
      color: #4f46e5;
      font-weight: 600;
  }
  .inactive-tab {
      color: #64748b;
  }
  .inactive-tab:hover {
      color: #334155;
  }
  
  /* Sub Tabs */
  .sub-tab-btn {
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
      white-space: nowrap;
      border-bottom-width: 2px;
  }
  .sub-tab-active {
      color: #4f46e5;
      border-color: #4f46e5;
      background-color: rgba(238, 242, 255, 0.5);
  }
  .sub-tab-inactive {
      color: #64748b;
      border-color: transparent;
  }
  .sub-tab-inactive:hover {
      color: #334155;
      background-color: #f8fafc;
  }
  
  /* Table */
  table {
      border-collapse: collapse;
  }
  
  /* Status Chip */
  .status-chip {
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
  }
  .status-active {
      background-color: #f0fdf4;
      color: #15803d;
  }
  .status-inactive {
      background-color: #f1f5f9;
      color: #64748b;
  }
  
  /* Form Input */
  .form-input {
      width: 100%;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      transition: all 0.2s;
      color: #1e293b;
  }
  .form-input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  .form-input:disabled {
      background-color: #f1f5f9;
      color: #94a3b8;
      cursor: not-allowed;
  }
  
  /* Modal */
  .fixed { position: fixed; }
  .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
  .z-50 { z-index: 50; }
  .bg-opacity-40 { background-color: rgba(15, 23, 42, 0.4); }
  .backdrop-blur-sm { backdrop-filter: blur(4px); }
  
  /* Animation */
  .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
  }
  .animate-slide-up {
      animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
  }
  @keyframes slideUp {
      0% { transform: translateY(20px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
  }
  
  .shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
  .shadow-2xl { box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }
  
  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  
  </style>