<script setup>
  import { ref, computed } from 'vue';
  
  // ----------------------------------------------------------------------
  // 数据常量 (保持原始数据结构 1:1)
  // ----------------------------------------------------------------------
  
  const METRICS = [
      // 收入指标
      { id: 1, category: '收入指标', name: 'GMV', alias: '商品交易总额', formula: '∑(订单金额) - 取消订单金额', unit: '元', source: 'dws_transaction_summary', desc: '统计周期内所有成交订单的总金额，不含取消订单' },
      { id: 2, category: '收入指标', name: '主营业务收入', alias: '销售收入', formula: 'GMV - 退货金额 - 平台补贴', unit: '元', source: 'ads_IncomeStatement', desc: '扣除退货和补贴后的实际销售收入' },
      { id: 3, category: '收入指标', name: '其他业务收入', alias: '非主营收入', formula: '∑(服务费 + 佣金 + 其他)', unit: '元', source: 'ads_IncomeStatement', desc: '除主营业务外的其他收入来源' },
      { id: 4, category: '收入指标', name: '实收现金', alias: '现金收入', formula: '∑(实际收到的现金款项)', unit: '元', source: 'ads_CashFlowStatement', desc: '实际收到的现金款项，包括销售商品、提供劳务收到的现金' },
      { id: 5, category: '收入指标', name: '确认收入', alias: '已确认收入', formula: '∑(符合收入确认条件的订单金额)', unit: '元', source: 'ads_IncomeStatement', desc: '按照会计准则确认的收入，需满足商品控制权转移等条件' },
      // 成本指标
      { id: 6, category: '成本指标', name: '商品成本', alias: '货品成本', formula: '∑(SKU成本 × 销售数量)', unit: '元', source: 'dwd_goods_costs', desc: '已售商品的采购成本' },
      { id: 7, category: '成本指标', name: '物流成本', alias: '运费', formula: '∑(快递费 + 仓储费 + 包装费)', unit: '元', source: 'dwd_general_expenses', desc: '商品配送相关的所有费用' },
      { id: 8, category: '成本指标', name: '营销成本', alias: '推广费', formula: '∑(广告费 + 佣金 + 活动费)', unit: '元', source: 'dwd_transaction_costs', desc: '用于推广和营销的费用支出' },
      { id: 9, category: '成本指标', name: '可控成本', alias: '直接成本', formula: '∑(人力成本 + 业务费用 + 其他直接支出)', unit: '元', source: 'dwd_ameba_costs', desc: '阿米巴单元可直接控制的成本支出' },
      { id: 10, category: '成本指标', name: '分摊成本', alias: '间接成本', formula: '∑(房租分摊 + 中台服务分摊 + 资金占用费)', unit: '元', source: 'dwd_allocated_costs', desc: '按规则分摊到各阿米巴单元的间接成本' },
      { id: 11, category: '成本指标', name: '交易成本', alias: '平台费用', formula: '∑(平台佣金 + 支付手续费 + 技术服务费)', unit: '元', source: 'dwd_transaction_costs', desc: '与交易相关的平台费用支出' },
      // 利润指标
      { id: 12, category: '利润指标', name: '毛利润', alias: '毛利', formula: '主营业务收入 - 商品成本', unit: '元', source: '计算指标', desc: '销售收入减去商品成本后的利润' },
      { id: 13, category: '利润指标', name: '毛利率', alias: 'GPM', formula: '毛利润 / 主营业务收入 × 100%', unit: '%', source: '计算指标', desc: '毛利润占销售收入的比例' },
      { id: 14, category: '利润指标', name: '净利润', alias: '纯利', formula: '毛利润 - 期间费用 - 税金', unit: '元', source: 'ads_IncomeStatement', desc: '扣除所有成本费用后的最终利润' },
      { id: 15, category: '利润指标', name: '净利率', alias: 'NPM', formula: '净利润 / 主营业务收入 × 100%', unit: '%', source: '计算指标', desc: '净利润占销售收入的比例' },
      { id: 16, category: '利润指标', name: '边际贡献', alias: '贡献毛益', formula: '经营收入 - 可控成本', unit: '元', source: '计算指标', desc: '阿米巴单元扣除可控成本后的贡献利润' },
      { id: 17, category: '利润指标', name: '核算利润', alias: '阿米巴利润', formula: '边际贡献 - 分摊成本', unit: '元', source: '计算指标', desc: '阿米巴单元最终核算的经营利润' },
      { id: 18, category: '利润指标', name: '营业利润', alias: '经营利润', formula: '营业收入 - 营业成本 - 期间费用', unit: '元', source: 'ads_IncomeStatement', desc: '企业日常经营活动产生的利润' },
      // 效率指标
      { id: 19, category: '效率指标', name: 'ROI', alias: '投资回报率', formula: '(收入 - 成本) / 成本 × 100%', unit: '%', source: '计算指标', desc: '投入产出比，衡量投资效率' },
      { id: 20, category: '效率指标', name: '客单价', alias: 'AOV', formula: 'GMV / 订单数', unit: '元', source: '计算指标', desc: '平均每笔订单的金额' },
      { id: 21, category: '效率指标', name: '退货率', alias: '退款率', formula: '退货订单数 / 总订单数 × 100%', unit: '%', source: '计算指标', desc: '退货订单占总订单的比例' },
      { id: 22, category: '效率指标', name: '利润率', alias: '经营利润率', formula: '核算利润 / 经营收入 × 100%', unit: '%', source: '计算指标', desc: '阿米巴单元的利润率' },
      // 业务量指标
      { id: 23, category: '业务量指标', name: '订单数', alias: '订单量', formula: 'COUNT(订单ID)', unit: '单', source: 'stg_onlines_transactions', desc: '统计周期内的订单总数' },
      { id: 24, category: '业务量指标', name: '发货数', alias: '发货量', formula: 'COUNT(已发货订单)', unit: '单', source: 'dwd_income', desc: '已完成发货的订单数量' },
      { id: 25, category: '业务量指标', name: '结算数', alias: '结算量', formula: 'COUNT(已结算订单)', unit: '单', source: 'dwd_income', desc: '已完成结算的订单数量' },
      { id: 26, category: '业务量指标', name: '退款数', alias: '退款量', formula: 'COUNT(退款订单)', unit: '单', source: 'dwd_transaction_costs', desc: '发生退款的订单数量' },
      // 资产负债指标
      { id: 27, category: '资产负债指标', name: '资产总计', alias: '总资产', formula: '∑(流动资产 + 非流动资产)', unit: '元', source: 'ads_BalanceSheet', desc: '企业拥有或控制的全部资产' },
      { id: 28, category: '资产负债指标', name: '负债总计', alias: '总负债', formula: '∑(流动负债 + 非流动负债)', unit: '元', source: 'ads_BalanceSheet', desc: '企业承担的全部债务' },
      { id: 29, category: '资产负债指标', name: '所有者权益', alias: '净资产', formula: '资产总计 - 负债总计', unit: '元', source: 'ads_BalanceSheet', desc: '企业资产扣除负债后的净值' },
      { id: 30, category: '资产负债指标', name: '应收账款', alias: '应收款', formula: '∑(未收回的销售款项)', unit: '元', source: 'ads_BalanceSheet', desc: '企业因销售商品、提供劳务等应收取的款项' },
      { id: 31, category: '资产负债指标', name: '存货', alias: '库存', formula: '∑(原材料 + 在产品 + 产成品)', unit: '元', source: 'ads_BalanceSheet', desc: '企业持有的各类存货价值' },
      // 现金流指标
      { id: 32, category: '现金流指标', name: '经营活动现金流', alias: '经营现金流', formula: '销售收现 - 购买支现 - 支付薪酬等', unit: '元', source: 'ads_CashFlowStatement', desc: '企业日常经营活动产生的现金流量净额' },
      { id: 33, category: '现金流指标', name: '投资活动现金流', alias: '投资现金流', formula: '收回投资 - 购建资产支出', unit: '元', source: 'ads_CashFlowStatement', desc: '企业投资活动产生的现金流量净额' },
      { id: 34, category: '现金流指标', name: '筹资活动现金流', alias: '筹资现金流', formula: '吸收投资 - 偿还债务 - 分配股利', unit: '元', source: 'ads_CashFlowStatement', desc: '企业筹资活动产生的现金流量净额' },
      { id: 35, category: '现金流指标', name: '现金净增加额', alias: '现金变动', formula: '经营现金流 + 投资现金流 + 筹资现金流', unit: '元', source: 'ads_CashFlowStatement', desc: '企业现金及现金等价物的净增加额' },
  ];
  
  const HELP_DOCS = [
      { id: 1, category: '快速入门', title: '系统概述', desc: '了解财务中心的整体架构和功能模块', icon: '📖', content: `
  ## 系统概述
  
  财务中心是一个面向电商企业的综合财务数据分析平台，主要包含以下核心模块：
  
  ### 核心功能模块
  1. **数据分析** - 三大经营仓（公司、阿米巴、店铺）提供多维度财务分析
  2. **自助数据看板** - 类Tableau的拖拽式报表配置器
  3. **权限中心** - 基于RBAC的用户权限管理
  4. **系统设置** - 配置管理、通知设置、数据字典
  
  ### 数据架构
  - 数据源：对接ERP、电商平台、财务系统
  - 数据仓库：分层架构（ODS→DWD→DWS→ADS）
  - 数据更新：T+1日更新，部分指标支持实时
  
  ### 适用角色
  财务人员、业务分析师、管理层、运营人员
      ` },
      { id: 2, category: '快速入门', title: '首次使用指南', desc: '新用户快速上手教程', icon: '🚀', content: `
  ## 首次使用指南
  
  ### 第一步：登录系统
  使用管理员分配的账号密码登录系统，首次登录建议修改密码。
  
  ### 第二步：了解导航
  - 左侧导航栏包含所有功能模块
  - 点击展开/收起子菜单
  - 常用功能可添加到收藏夹
  
  ### 第三步：查看报表
  1. 进入【数据分析】选择对应的经营仓
  2. 使用时间筛选器选择分析周期
  3. 点击数据行可查看明细
  
  ### 第四步：创建自定义报表
  1. 进入【自助数据看板】
  2. 从左侧拖拽维度和指标到配置区
  3. 系统自动生成透视表
  4. 保存报表供后续使用
  
  ### 常用快捷操作
  - 双击表头可排序
  - 右键菜单可导出数据
  - Ctrl+F 快速搜索
      ` },
      { id: 3, category: '报表使用', title: '公司经营仓使用说明', desc: '如何查看和分析三大财务报表', icon: '📊', content: `
  ## 公司经营仓使用说明
  
  ### 功能概述
  公司经营仓提供企业级财务报表分析，包含资产负债表、利润表、现金流量表和预算监控。
  
  ### 资产负债表
  - 展示企业资产、负债、所有者权益结构
  - 支持展开/收起查看明细科目
  - 点击叶子节点可查看凭证明细
  
  ### 利润表
  - 展示收入、成本、费用、利润结构
  - 支持同比/环比分析
  - 可追溯到具体业务明细
  
  ### 现金流量表
  - 展示经营、投资、筹资三大活动现金流
  - 分析企业现金健康状况
  
  ### 预算监控
  - 科目预算执行进度
  - 阿米巴部门预算监控
  - 支持预算调整功能
  
  ### 操作技巧
  - 使用时间切片快速切换分析周期
  - 开启"全部展开"查看完整报表结构
  - 选择同比/环比模式进行趋势分析
      ` },
      { id: 4, category: '报表使用', title: '阿米巴经营仓使用说明', desc: '部门核算数据查看与分析', icon: '🎯', content: `
  ## 阿米巴经营仓使用说明
  
  ### 什么是阿米巴经营
  阿米巴经营是将企业划分为最小经营单元，独立核算收入、成本、利润的管理模式。
  
  ### 核心指标说明
  - **经营收入**：阿米巴单元的全部收入
  - **可控成本**：单元可直接控制的成本（人力、业务费用等）
  - **边际贡献**：收入减去可控成本
  - **分摊成本**：按规则分摊的间接成本
  - **核算利润**：边际贡献减去分摊成本
  
  ### 功能操作
  1. **排名功能**：按利润排序，显示排名徽章
  2. **同环比分析**：对比历史同期或上期数据
  3. **详情分析**：点击行查看单元详细损益表
  4. **趋势图表**：查看月度收入成本利润趋势
  
  ### 数据钻取
  点击损益表项目可查看具体明细账，追溯到原始凭证。
      ` },
      { id: 5, category: '报表使用', title: '店铺经营仓使用说明', desc: '多平台店铺数据分析指南', icon: '🏪', content: `
  ## 店铺经营仓使用说明
  
  ### 功能概述
  店铺经营仓提供多平台（淘宝、抖音、快手等）店铺级别的经营数据分析。
  
  ### 核心指标
  - **GMV**：商品交易总额
  - **毛利率/净利率**：盈利能力指标
  - **退货率**：商品质量和服务指标
  - **ROI**：投资回报率
  - **客单价**：平均订单金额
  
  ### 分析维度
  1. **收支视图**：收入、成本、毛利趋势
  2. **效率视图**：ROI、客单价分析
  3. **业务量视图**：订单数、发货数、结算数、退款数
  
  ### 数据钻取路径
  年度概览 → 月度详情 → 日维度订单 → 商品财务明细
  
  ### 操作说明
  - 点击店铺卡片进入详情分析
  - 点击图表柱/点可钻取到下一层级
  - 点击饼图扇区查看成本/科目明细
      ` },
      { id: 6, category: '报表使用', title: '自助数据报表使用说明', desc: '拖拽式报表配置教程', icon: '📈', content: `
  ## 自助数据报表使用说明
  
  ### 功能概述
  自助数据报表是类似Tableau的拖拽式数据分析工具，支持灵活配置透视表。
  
  ### 界面布局
  - **左侧面板**：维度和度量字段列表
  - **配置区**：筛选、行、列、数值配置
  - **预览区**：实时生成的透视表
  
  ### 操作步骤
  1. 从左侧拖拽【维度】到行或列区域
  2. 从左侧拖拽【度量】到数值区域
  3. 设置筛选条件（如时间范围）
  4. 系统自动生成透视表
  5. 点击保存按钮保存报表
  
  ### 字段说明
  **维度字段**：客户、平台、店铺、日期、科目
  **度量字段**：经营利润、GMV、交易成本
  
  ### 导出功能
  点击"导出Excel"可将当前报表导出为Excel文件。
  
  ### 注意事项
  - 维度只能放在行或列区域
  - 度量只能放在数值区域
  - 建议先设置筛选条件再配置字段
      ` },
      { id: 7, category: '配置管理', title: '维度数据配置', desc: '客户、平台、店铺等维度数据管理', icon: '⚙️', content: `
  ## 维度数据配置
  
  ### 功能说明
  维度数据配置用于管理系统中的基础数据，包括客户、平台、店铺等维度信息。
  
  ### 客户管理
  - 新增/编辑/删除客户信息
  - 设置客户编码、名称、联系方式
  - 关联客户与店铺的归属关系
  
  ### 平台管理
  - 配置电商平台信息（淘宝、抖音、快手等）
  - 设置平台费率、结算周期
  - 配置平台API对接参数
  
  ### 店铺管理
  - 管理各平台店铺信息
  - 设置店铺与客户、阿米巴的关联
  - 配置店铺级别的核算规则
  
  ### 科目管理
  - 维护财务科目体系
  - 设置科目编码、名称、类型
  - 配置科目与数据源的映射关系
  
  ### 操作权限
  维度数据配置需要【数据资产管理员】或更高权限。
      ` },
      { id: 8, category: '配置管理', title: '账单映射配置', desc: '线上线下账单字段映射规则', icon: '🔗', content: `
  ## 账单映射配置
  
  ### 功能说明
  账单映射配置用于将各平台原始账单字段映射到系统标准字段。
  
  ### 映射类型
  1. **线上账单映射**：电商平台账单字段映射
  2. **线下账单映射**：ERP/财务系统账单映射
  3. **银行账单映射**：银行流水字段映射
  
  ### 配置步骤
  1. 选择数据源类型
  2. 上传样例账单文件
  3. 系统自动识别字段
  4. 手动调整映射关系
  5. 保存并测试映射规则
  
  ### 标准字段
  - 订单编号、交易时间、商品信息
  - 收入金额、成本金额、费用金额
  - 客户信息、店铺信息、平台信息
  
  ### 映射规则
  - 支持一对一、多对一映射
  - 支持字段计算和转换
  - 支持条件映射（根据值判断）
  
  ### 注意事项
  修改映射规则后需要重新执行数据同步。
      ` },
      { id: 9, category: '权限管理', title: '用户与角色管理', desc: 'RBAC权限体系说明', icon: '🔐', content: `
  ## 用户与角色管理
  
  ### RBAC权限模型
  系统采用基于角色的访问控制（RBAC）模型：
  用户 → 角色 → 权限
  
  ### 预设角色
  - **超级管理员**：全部权限
  - **运维工程师**：系统配置、数据同步
  - **数据质量管理员**：数据质量监控
  - **数据资产管理员**：维度数据管理
  - **财务BI**：财务报表查看
  - **业务BI**：业务数据分析
  - **高层管理者**：全部报表只读
  
  ### 权限类型
  - **菜单权限**：控制可见的功能模块
  - **数据权限**：控制可见的数据范围
  - **操作权限**：控制可执行的操作
  
  ### 用户管理
  - 新增/编辑/禁用用户
  - 分配用户角色
  - 设置数据权限范围
  
  ### 权限申请
  普通用户可通过【权限申请】提交权限变更申请，由管理员审批。
      ` },
      { id: 10, category: '常见问题', title: 'FAQ', desc: '常见问题解答', icon: '❓', content: `
  ## 常见问题解答
  
  ### Q1: 数据什么时候更新？
  A: 系统数据T+1日更新，每日凌晨2:00完成数据同步。部分实时指标每小时更新。
  
  ### Q2: 为什么看到的数据和平台不一致？
  A: 可能原因：
  - 数据同步延迟
  - 口径定义不同（如GMV是否含取消订单）
  - 时区差异
  建议查看数据字典确认指标口径。
  
  ### Q3: 如何导出数据？
  A: 
  - 报表页面点击"导出Excel"按钮
  - 自助报表支持导出当前配置的数据
  - 大数据量导出请联系管理员
  
  ### Q4: 忘记密码怎么办？
  A: 点击登录页"忘记密码"，通过邮箱验证重置密码。或联系管理员重置。
  
  ### Q5: 如何申请新权限？
  A: 进入【权限中心】→【权限申请】，填写申请表单，等待管理员审批。
  
  ### Q6: 报表加载很慢怎么办？
  A: 
  - 缩小时间范围
  - 减少维度字段
  - 清除浏览器缓存
  - 联系技术支持优化
  
  ### Q7: 如何联系技术支持？
  A: 发送邮件至 support@example.com 或企业微信联系IT部门。
      ` },
  ];
  
  const videoTutorials = ['系统概览介绍', '报表分析教程', '配置管理指南'];
  
  // ----------------------------------------------------------------------
  // 响应式状态 & 逻辑
  // ----------------------------------------------------------------------
  
  const activeTab = ref('metrics');
  const searchText = ref('');
  const expandedCategory = ref('收入指标');
  const selectedMetric = ref(null);
  const selectedDoc = ref(null);
  
  const categories = computed(() => [...new Set(METRICS.map(m => m.category))]);
  const docCategories = computed(() => [...new Set(HELP_DOCS.map(d => d.category))]);
  
  const filteredMetrics = computed(() => {
      return METRICS.filter(m => 
          !searchText.value || 
          m.name.includes(searchText.value) || 
          m.alias.includes(searchText.value) || 
          m.desc.includes(searchText.value)
      );
  });
  
  // 切换分类展开
  const toggleCategory = (cat) => {
      expandedCategory.value = expandedCategory.value === cat ? '' : cat;
  };
  
  // Markdown 简易解析器 (保持与 React 版本一致的展示逻辑)
  const parseDocContent = (content) => {
      if (!content) return [];
      return content.split('\n').map((line) => {
          if (line.startsWith('## ')) return { type: 'h2', text: line.replace('## ', '') };
          if (line.startsWith('### ')) return { type: 'h3', text: line.replace('### ', '') };
          if (line.startsWith('**') && line.endsWith('**')) return { type: 'bold', text: line.replace(/\*\*/g, '') };
          if (line.startsWith('- ')) return { type: 'li', text: line.replace('- ', '') };
          if (line.match(/^\d+\./)) return { type: 'li-decimal', text: line.replace(/^\d+\.\s*/, '') };
          if (line.startsWith('Q')) return { type: 'q', text: line };
          if (line.startsWith('A:')) return { type: 'a', text: line.replace('A: ', '') };
          if (line.trim() === '') return { type: 'empty' };
          return { type: 'p', text: line };
      });
  };
  
  const parsedSelectedDoc = computed(() => {
      if (!selectedDoc.value) return [];
      return parseDocContent(selectedDoc.value.content);
  });
  
  </script>
  
  <template>
    <!-- 外层容器 -->
    <div class="page-container animate-fade-in">
      <!-- 头部 Header -->
      <div class="header mb-8">
        <h2 class="title text-2xl font-bold flex items-center gap-3">
          <div class="icon-box w-10 h-10 rounded-xl flex items-center justify-center bg-violet-100">
              <!-- Icon Book -->
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-violet-600">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
              </svg>
          </div>
          数据字典与文档
        </h2>
        <p class="subtitle text-sm mt-1 ml-13">指标口径说明、帮助文档、使用教程</p>
      </div>
  
      <!-- 标签页切换 Tabs -->
      <div class="tabs flex gap-4 mb-6">
        <button 
          @click="activeTab = 'metrics'" 
          class="tab-btn px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2"
          :class="activeTab === 'metrics' ? 'active-tab shadow-lg' : 'inactive-tab'"
        >
          <!-- Icon Calculator -->
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>
          </svg>
          指标口径
        </button>
        <button 
          @click="activeTab = 'docs'" 
          class="tab-btn px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2"
          :class="activeTab === 'docs' ? 'active-tab shadow-lg' : 'inactive-tab'"
        >
          <!-- Icon HelpCircle -->
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
          </svg>
          帮助文档
        </button>
      </div>
  
      <!-- 指标口径内容 -->
      <div v-if="activeTab === 'metrics'" class="grid grid-cols-12 gap-6">
          <!-- 左侧导航 -->
          <div class="col-span-3 card rounded-2xl shadow-sm border border-slate-100 overflow-hidden bg-white">
              <div class="p-4 border-b border-slate-100">
                  <div class="relative">
                      <!-- Icon Search -->
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                      </svg>
                      <!-- 搜索框 -->
                      <input 
                          type="text" 
                          placeholder="搜索指标..." 
                          v-model="searchText"
                          class="search-input w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100" 
                      />
                  </div>
              </div>
              <div class="p-4 space-y-2">
                  <div v-for="cat in categories" :key="cat">
                      <button 
                          @click="toggleCategory(cat)" 
                          class="w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all"
                          :class="expandedCategory === cat ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'"
                      >
                          <span>{{ cat }}</span>
                          <!-- Icon Chevron -->
                          <svg v-if="expandedCategory === cat" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="m6 9 6 6 6-6"/>
                          </svg>
                          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="m9 18 6-6-6-6"/>
                          </svg>
                      </button>
                      <div v-if="expandedCategory === cat" class="ml-4 mt-1 space-y-1 animate-fade-in">
                          <button 
                              v-for="m in filteredMetrics.filter(m => m.category === cat)" 
                              :key="m.id" 
                              @click="selectedMetric = m"
                              class="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
                              :class="selectedMetric?.id === m.id ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-slate-500 hover:bg-slate-50'"
                          >
                              {{ m.name }}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
  
          <!-- 右侧详情 -->
          <div class="col-span-9 card rounded-2xl shadow-sm border border-slate-100 overflow-hidden bg-white">
              <div v-if="selectedMetric" class="p-8 animate-fade-in">
                  <div class="flex items-center gap-4 mb-6">
                      <div class="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600">
                              <rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>
                          </svg>
                      </div>
                      <div>
                          <h3 class="text-2xl font-bold text-slate-800">{{ selectedMetric.name }}</h3>
                          <p class="text-slate-400">{{ selectedMetric.alias }}</p>
                      </div>
                      <span class="ml-auto px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm">{{ selectedMetric.category }}</span>
                  </div>
                  <div class="grid grid-cols-2 gap-6 mb-6">
                      <div class="p-4 bg-slate-50 rounded-xl">
                          <div class="text-xs text-slate-400 mb-1">计算公式</div>
                          <div class="font-mono text-indigo-600 font-medium">{{ selectedMetric.formula }}</div>
                      </div>
                      <div class="p-4 bg-slate-50 rounded-xl">
                          <div class="text-xs text-slate-400 mb-1">单位</div>
                          <div class="font-medium text-slate-700">{{ selectedMetric.unit }}</div>
                      </div>
                  </div>
                  <div class="p-4 bg-slate-50 rounded-xl mb-6">
                      <div class="text-xs text-slate-400 mb-1">数据来源</div>
                      <div class="font-mono text-sm text-slate-600">{{ selectedMetric.source }}</div>
                  </div>
                  <div>
                      <div class="text-sm font-medium text-slate-600 mb-2">指标说明</div>
                      <p class="text-slate-500 leading-relaxed">{{ selectedMetric.desc }}</p>
                  </div>
              </div>
              <div v-else class="h-full flex items-center justify-center text-slate-400 p-20">
                  <div class="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 opacity-30">
                          <rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>
                      </svg>
                      <p>请从左侧选择一个指标查看详情</p>
                  </div>
              </div>
          </div>
      </div>
  
      <!-- 帮助文档内容 -->
      <div v-if="activeTab === 'docs'" class="flex flex-col gap-10">
          <div v-for="cat in docCategories" :key="cat" class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div class="p-6 border-b border-slate-100">
                  <h3 class="font-bold text-slate-800">{{ cat }}</h3>
              </div>
              <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div 
                      v-for="doc in HELP_DOCS.filter(d => d.category === cat)" 
                      :key="doc.id" 
                      @click="selectedDoc = doc" 
                      class="doc-card p-4 border border-slate-100 rounded-xl hover:bg-indigo-50 hover:bg-opacity-30 transition-all cursor-pointer group"
                  >
                      <div class="flex items-start gap-3">
                          <div class="text-2xl">{{ doc.icon }}</div>
                          <div class="flex-1">
                              <div class="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">{{ doc.title }}</div>
                              <div class="text-xs text-slate-400 mt-1">{{ doc.desc }}</div>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300 group-hover:text-indigo-400 transition-colors">
                              <path d="m9 18 6-6-6-6"/>
                          </svg>
                      </div>
                  </div>
              </div>
          </div>
  
          <!-- 视频教程区域 -->
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
              <div class="flex items-center gap-4 mb-6">
                  <!-- Icon PlayCircle -->
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
                  </svg>
                  <div>
                      <h3 class="text-xl font-bold">视频教程</h3>
                      <p class="text-indigo-200 text-sm">观看视频快速掌握系统使用方法</p>
                  </div>
              </div>
              <div class="grid grid-cols-3 gap-4">
                  <div v-for="(title, i) in videoTutorials" :key="i" class="bg-white bg-opacity-10 rounded-xl p-4 hover:bg-opacity-20 transition-all cursor-pointer">
                      <div class="aspect-video bg-black bg-opacity-20 rounded-lg mb-3 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-70">
                              <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
                          </svg>
                      </div>
                      <div class="font-medium">{{ title }}</div>
                      <div class="text-xs text-indigo-200 mt-1">时长: {{ 5 + i * 3 }} 分钟</div>
                  </div>
              </div>
          </div>
      </div>
  
      <!-- 文档详情弹窗 (Modal) -->
      <div 
          v-if="selectedDoc" 
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-40 backdrop-blur-sm animate-fade-in" 
          @click.self="selectedDoc = null"
      >
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
              <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div class="flex items-center gap-4">
                      <div class="text-4xl">{{ selectedDoc.icon }}</div>
                      <div>
                          <h3 class="text-xl font-bold text-slate-800">{{ selectedDoc.title }}</h3>
                          <p class="text-sm text-slate-500">{{ selectedDoc.desc }}</p>
                      </div>
                  </div>
                  <button @click="selectedDoc = null" class="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                      </svg>
                  </button>
              </div>
              <div class="flex-1 overflow-y-auto p-8">
                  <div class="prose prose-slate prose-sm max-w-none">
                      <template v-for="(line, i) in parsedSelectedDoc" :key="i">
                          <h2 v-if="line.type === 'h2'" class="text-xl font-bold text-slate-800 mt-6 mb-4 pb-2 border-b border-slate-100">{{ line.text }}</h2>
                          <h3 v-else-if="line.type === 'h3'" class="text-lg font-semibold text-slate-700 mt-5 mb-3">{{ line.text }}</h3>
                          <p v-else-if="line.type === 'bold'" class="font-semibold text-slate-700 mt-3">{{ line.text }}</p>
                          <li v-else-if="line.type === 'li'" class="text-slate-600 ml-4 my-1">{{ line.text }}</li>
                          <li v-else-if="line.type === 'li-decimal'" class="text-slate-600 ml-4 my-1 list-decimal">{{ line.text }}</li>
                          <p v-else-if="line.type === 'q'" class="font-semibold text-indigo-600 mt-4 mb-1">{{ line.text }}</p>
                          <p v-else-if="line.type === 'a'" class="text-slate-600 mb-3 pl-4 border-l-2 border-indigo-200">{{ line.text }}</p>
                          <div v-else-if="line.type === 'empty'" class="h-2"></div>
                          <p v-else class="text-slate-600 my-2 leading-relaxed">{{ line.text }}</p>
                      </template>
                  </div>
              </div>
              <div class="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                  <button @click="selectedDoc = null" class="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium">
                      我知道了
                  </button>
              </div>
          </div>
      </div>
    </div>
  </template>
  
  <style scoped>
  /* 全局盒模型重置 (关键点：防止在非Tailwind项目中布局崩坏)
  */
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
  
  input {
      border: none;
      outline: none;
  }
  
  /* 模拟 Tailwind CSS 类名 
    使用 Scoped CSS 保证样式不污染全局
  */
  .page-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b; /* text-slate-800 */
  }
  
  /* 动画类 */
  .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
  }
  
  @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
  }
  
  /* 颜色系统 */
  .bg-slate-50 { background-color: #f8fafc; }
  .bg-indigo-50 { background-color: #eef2ff; }
  .bg-indigo-100 { background-color: #e0e7ff; }
  .bg-violet-100 { background-color: #ede9fe; }
  .bg-indigo-600 { background-color: #4f46e5; }
  .text-slate-300 { color: #cbd5e1; }
  .text-slate-400 { color: #94a3b8; }
  .text-slate-500 { color: #64748b; }
  .text-slate-600 { color: #475569; }
  .text-slate-700 { color: #334155; }
  .text-slate-800 { color: #1e293b; }
  .text-indigo-200 { color: #c7d2fe; }
  .text-indigo-600 { color: #4f46e5; }
  .text-indigo-700 { color: #4338ca; }
  .text-violet-600 { color: #7c3aed; }
  
  /* 布局工具类 */
  .flex { display: flex; }
  .grid { display: grid; }
  .items-center { align-items: center; }
  .items-start { align-items: flex-start; }
  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
  .justify-end { justify-content: flex-end; }
  .flex-1 { flex: 1 1 0%; }
  .flex-col { flex-direction: column; }
  
  .gap-2 { gap: 0.5rem; }
  .gap-3 { gap: 0.75rem; }
  .gap-4 { gap: 1rem; }
  .gap-6 { gap: 1.5rem; }
  .gap-10 { gap: 2.5rem; } /* 新增：40px 间距 */
  
  .mb-1 { margin-bottom: 0.25rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-3 { margin-bottom: 0.75rem; }
  .mb-4 { margin-bottom: 1rem; }
  .mb-6 { margin-bottom: 1.5rem; }
  .mb-8 { margin-bottom: 2rem; }
  
  .mt-1 { margin-top: 0.25rem; }
  .mt-3 { margin-top: 0.75rem; }
  .mt-4 { margin-top: 1rem; }
  .mt-5 { margin-top: 1.25rem; }
  .mt-6 { margin-top: 1.5rem; }
  
  .ml-4 { margin-left: 1rem; }
  .ml-13 { margin-left: 3.25rem; }
  .ml-auto { margin-left: auto; }
  
  .my-1 { margin-top: 0.25rem; margin-bottom: 0.25rem; }
  .my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
  
  .p-2 { padding: 0.5rem; }
  .p-3 { padding: 0.75rem; }
  .p-4 { padding: 1rem; }
  .p-6 { padding: 1.5rem; }
  .p-8 { padding: 2rem; }
  .p-20 { padding: 5rem; }
  
  .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
  .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
  .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
  .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
  .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
  .pl-4 { padding-left: 1rem; }
  .pl-9 { padding-left: 2.25rem; }
  .pr-4 { padding-right: 1rem; }
  .pb-2 { padding-bottom: 0.5rem; }
  
  .w-full { width: 100%; }
  .h-full { height: 100%; }
  .w-10 { width: 2.5rem; }
  .h-10 { height: 2.5rem; }
  .w-14 { width: 3.5rem; }
  .h-14 { height: 3.5rem; }
  
  .rounded-lg { border-radius: 0.5rem; }
  .rounded-xl { border-radius: 0.75rem; }
  .rounded-2xl { border-radius: 1rem; }
  .rounded-full { border-radius: 9999px; }
  
  .font-medium { font-weight: 500; }
  .font-semibold { font-weight: 600; }
  .font-bold { font-weight: 700; }
  .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
  
  .text-xs { font-size: 0.75rem; line-height: 1rem; }
  .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
  .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
  .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
  .text-2xl { font-size: 1.5rem; line-height: 2rem; }
  .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
  .leading-relaxed { line-height: 1.625; }
  
  .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
  .shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
  .shadow-2xl { box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }
  
  .border { border-width: 1px; }
  .border-b { border-bottom-width: 1px; }
  .border-t { border-top-width: 1px; }
  .border-l-2 { border-left-width: 2px; }
  .border-slate-100 { border-color: #f1f5f9; }
  .border-slate-200 { border-color: #e2e8f0; }
  .border-indigo-200 { border-color: #c7d2fe; }
  
  /* Grid 列配置 */
  .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
  .col-span-3 { grid-column: span 3 / span 3; }
  .col-span-9 { grid-column: span 9 / span 9; }
  .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  
  @media (min-width: 768px) {
    .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  
  @media (min-width: 1024px) {
    .lg\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }
  
  /* 组件特定样式 */
  .active-tab {
      background-color: #4f46e5;
      color: white;
      box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);
  }
  
  .inactive-tab {
      background-color: white;
      color: #475569;
      border: 1px solid #e2e8f0;
  }
  .inactive-tab:hover {
      background-color: #f8fafc;
  }
  
  /* 弹窗样式 */
  .fixed { position: fixed; }
  .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
  .z-50 { z-index: 50; }
  .bg-slate-900 { background-color: #0f172a; }
  .bg-opacity-40 { background-color: rgba(15, 23, 42, 0.4); }
  .backdrop-blur-sm { backdrop-filter: blur(4px); }
  .overflow-hidden { overflow: hidden; }
  .overflow-y-auto { overflow-y: auto; }
  .max-w-3xl { max-width: 48rem; }
  .max-h-\[85vh\] { max-height: 85vh; }
  
  /* 渐变色 */
  .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
  .from-indigo-50 { --tw-gradient-from: #eef2ff; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(238, 242, 255, 0)); }
  .to-purple-50 { --tw-gradient-to: #faf5ff; }
  
  .from-indigo-600 { --tw-gradient-from: #4f46e5; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(79, 70, 229, 0)); }
  .to-purple-600 { --tw-gradient-to: #9333ea; }
  
  /* 透明度背景 */
  .bg-white { background-color: white; }
  .bg-opacity-10 { background-color: rgba(255, 255, 255, 0.1); }
  .bg-opacity-20 { background-color: rgba(255, 255, 255, 0.2); }
  .hover\:bg-opacity-30:hover { background-color: rgba(238, 242, 255, 0.3); }
  
  /* 列表样式 */
  .list-decimal { list-style-type: decimal; }
  
  /* 过渡动画 */
  .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
  .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
  
  /* 搜索框聚焦 */
  .search-input:focus {
      box-shadow: 0 0 0 2px #e0e7ff; /* ring-indigo-100 */
  }
  
  /* 宽高比 */
  .aspect-video { aspect-ratio: 16 / 9; }
  .opacity-70 { opacity: 0.7; }
  .opacity-30 { opacity: 0.3; }
  
  /* 悬停效果 */
  .hover\:border-indigo-200:hover { border-color: #c7d2fe; }
  .group:hover .group-hover\:text-indigo-600 { color: #4f46e5; }
  .group:hover .group-hover\:text-indigo-400 { color: #818cf8; }
  
  .hover\:bg-indigo-700:hover { background-color: #4338ca; }
  .hover\:bg-slate-50:hover { background-color: #f8fafc; }
  .hover\:bg-white:hover { background-color: #ffffff; }
  .hover\:text-slate-600:hover { color: #475569; }
  
  /* 定位 */
  .relative { position: relative; }
  .absolute { position: absolute; }
  .top-1\/2 { top: 50%; }
  .left-3 { left: 0.75rem; }
  .-translate-y-1\/2 { transform: translateY(-50%); }
  
  </style>