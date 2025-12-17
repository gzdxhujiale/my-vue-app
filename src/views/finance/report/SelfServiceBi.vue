<script setup>
  import { ref, reactive, onMounted } from 'vue'
  import { 
    IconCalendar, IconUser, IconApps, IconFile, 
    IconBarChart, IconOrderedList, IconSettings,
    IconDragDotVertical, IconClose, IconRefresh,
    IconCaretDown
  } from '@arco-design/web-vue/es/icon'
  import * as echarts from 'echarts'
  
  // 假设项目中已安装这些依赖
  import * as aq from 'arquero'
  import { createGrid, ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
  import 'ag-grid-community/styles/ag-grid.css'
  import 'ag-grid-community/styles/ag-theme-alpine.css'
  
  // 注册 AG Grid 模块
  ModuleRegistry.registerModules([AllCommunityModule])
  
  // 引入同目录下的数据文件 (请确保 ecommerce_data.js 使用 export const ECOMMERCE_DATA = ... 导出)
  import { ECOMMERCE_DATA } from './ecommerce_data.js'
  
  // --- 数据源 ---
  const rawData = ECOMMERCE_DATA
  
  // --- 常量定义 ---
  const dimensions = [
    { key: '日期', type: 'date', icon: IconCalendar, allowAgg: true },
    { key: '客户', type: 'string', icon: IconUser },
    { key: '平台', type: 'string', icon: IconApps },
    { key: '店铺名称', type: 'string', icon: IconFile }
  ]
  
  const measures = [
    { key: 'GMV', type: 'number', icon: IconBarChart },
    { key: '订单数', type: 'number', icon: IconOrderedList },
    { key: '销售件数', type: 'number', icon: IconBarChart },
    { key: '退款金额', type: 'number', icon: IconBarChart },
    { key: '退款件数', type: 'number', icon: IconOrderedList },
    { key: '支付用户数', type: 'number', icon: IconUser },
    { key: '访客数', type: 'number', icon: IconUser },
    { key: '浏览量', type: 'number', icon: IconBarChart },
    { key: '加购次数', type: 'number', icon: IconOrderedList },
    { key: '收藏次数', type: 'number', icon: IconOrderedList },
    { key: '商品成本', type: 'number', icon: IconBarChart },
    { key: '广告费', type: 'number', icon: IconBarChart },
    { key: '平台费用', type: 'number', icon: IconBarChart },
    { key: '运费', type: 'number', icon: IconBarChart },
    { key: '其他费用', type: 'number', icon: IconBarChart },
    { key: '毛利率', type: 'number', icon: IconBarChart },
    { key: '净利率', type: 'number', icon: IconBarChart },
    { key: '退货率', type: 'number', icon: IconBarChart },
    { key: 'ROI', type: 'number', icon: IconBarChart },
    { key: '客单价', type: 'number', icon: IconBarChart }
  ]
  
  const chartTypes = [
    { label: '柱状图', value: 'bar' },
    { label: '折线图', value: 'line' },
    { label: '面积图', value: 'area' },
    { label: '明细表', value: 'table' },
  ]
  
  const dateAggOptions = [
    { value: 'day', label: '日' },
    { value: 'month', label: '月' },
    { value: 'quarter', label: '季度' },
    { value: 'year', label: '年' }
  ]
  
  // --- 状态管理 ---
  const state = reactive({
    cols: [], // 列架 (Columns Shelf)
    rows: [], // 行架 (Rows Shelf)
    filters: {}, // 筛选器 - 格式: { fieldKey: { selected: Set, options: [] } }
    chartType: 'table', // 默认图表类型
    colorPalette: 'default'
  })
  
  // 自动筛选器相关
  const activeFilters = ref(new Set()) // 当前激活的筛选器字段
  const expandedFilters = ref(new Set()) // 当前展开的筛选器
  
  // 拖拽相关
  const draggedField = ref(null)
  
  // DOM 引用
  const vizContainer = ref(null)
  let chartInstance = null
  let gridApi = null
  
  // --- 工具函数：日期处理 ---
  const aggregateDate = (dateStr, aggType) => {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    // const d = String(date.getDate()).padStart(2, '0')
    const q = Math.ceil((date.getMonth() + 1) / 3)
    
    switch(aggType) {
      case 'day': return dateStr
      case 'month': return `${y}-${m}`
      case 'quarter': return `${y}-Q${q}`
      case 'year': return `${y}`
      default: return dateStr
    }
  }
  
  // --- 筛选器管理函数 ---
  const initFilter = (fieldKey, field = null) => {
    if (state.filters[fieldKey]) return
    
    const fieldType = field ? field.fieldType : 'dim'
    
    if (fieldType === 'measure') {
      // 度量字段：创建数值范围筛选
      const values = rawData.map(row => row[fieldKey]).filter(v => v !== null && v !== undefined && !isNaN(v))
      const min = Math.min(...values)
      const max = Math.max(...values)
      
      state.filters[fieldKey] = {
        fieldType: 'measure',
        operator: 'all', // 'all', 'gt', 'lt', 'between', 'eq'
        value: null,
        minValue: null,
        maxValue: null,
        rangeMin: min,
        rangeMax: max
      }
    } else {
      // 维度字段：创建多选筛选
      let uniqueValues = []
      
      // 特殊处理：如果是日期字段且有聚合，使用聚合后的值
      if (field && field.key === '日期' && field.dateAgg) {
        uniqueValues = [...new Set(rawData.map(row => {
          const dateStr = row[fieldKey]
          return aggregateDate(dateStr, field.dateAgg)
        }))].filter(v => v !== null && v !== undefined)
      } else {
        // 普通字段：从原始数据获取该字段的所有唯一值
        uniqueValues = [...new Set(rawData.map(row => row[fieldKey]))].filter(v => v !== null && v !== undefined)
      }
      
      state.filters[fieldKey] = {
        selected: new Set(uniqueValues), // 默认全选
        options: uniqueValues.sort(),
        fieldType: 'dim',
        dateAgg: field?.dateAgg // 记录日期聚合类型
      }
    }
    
    activeFilters.value.add(fieldKey)
  }
  
  const removeFilter = (fieldKey) => {
    delete state.filters[fieldKey]
    activeFilters.value.delete(fieldKey)
    expandedFilters.value.delete(fieldKey) // 同时移除展开状态
  }
  
  const toggleFilterExpansion = (fieldKey) => {
    if (expandedFilters.value.has(fieldKey)) {
      expandedFilters.value.delete(fieldKey)
    } else {
      expandedFilters.value.add(fieldKey)
    }
  }
  
  const updateFilterSelection = (fieldKey, selectedValues) => {
    if (state.filters[fieldKey]) {
      state.filters[fieldKey].selected = new Set(selectedValues)
      renderViz()
    }
  }
  
  const updateMeasureFilter = (fieldKey, operator, value, minValue, maxValue) => {
    if (state.filters[fieldKey] && state.filters[fieldKey].fieldType === 'measure') {
      state.filters[fieldKey].operator = operator
      state.filters[fieldKey].value = value
      state.filters[fieldKey].minValue = minValue
      state.filters[fieldKey].maxValue = maxValue
      renderViz()
    }
  }
  
  const toggleSelectAll = (fieldKey) => {
    if (!state.filters[fieldKey]) return
    
    const filter = state.filters[fieldKey]
    const allSelected = filter.selected.size === filter.options.length
    
    if (allSelected) {
      filter.selected = new Set() // 全部取消选择
    } else {
      filter.selected = new Set(filter.options) // 全部选择
    }
    renderViz()
  }
  
  // --- 导出功能 ---
  const exportData = () => {
    // 准备维度和度量列表
    const allDims = [...state.cols, ...state.rows].filter(f => f.fieldType === 'dim')
    const metrics = [...state.cols, ...state.rows].filter(f => f.fieldType === 'measure')
    
    if (allDims.length === 0 && metrics.length === 0) {
      alert('请先配置维度和度量')
      return
    }
    
    // 获取聚合后的数据
    const aggregatedData = aggregateWithArquero(rawData, allDims, metrics)
    const { keys, groups } = aggregatedData
    
    // 构造导出数据
    const exportRows = []
    
    // 表头
    const headers = [
      ...allDims.map(d => d.key),
      ...metrics.map(m => m.key)
    ]
    exportRows.push(headers.join(','))
    
    // 数据行
    keys.forEach(k => {
      const row = []
      allDims.forEach(d => row.push(groups[k].meta[d.key] || ''))
      metrics.forEach(m => row.push(groups[k].values[m.key] || 0))
      exportRows.push(row.join(','))
    })
    
    // 下载CSV
    const csvContent = exportRows.join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `自助分析数据_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // --- 核心聚合逻辑 (基于 Arquero) ---
  // 移植自 self_service_bi.html 中的 aggregateWithArquero
  const aggregateWithArquero = (data, dims, metrics) => {
    console.log('聚合函数调用:', { data: data.length, dims, metrics })
    
    if (!aq) {
      console.error('Arquero 未加载，无法聚合数据')
      return { keys: [], groups: {} }
    }
  
    // 1. 筛选 (Filtering)
    let filteredData = data.filter(row => {
      // 遍历所有筛选器
      for (const [key, filter] of Object.entries(state.filters)) {
        
        if (filter.fieldType === 'measure') {
          // 度量筛选逻辑
          const value = parseFloat(row[key])
          if (isNaN(value)) continue
          
          switch (filter.operator) {
            case 'gt':
              if (filter.value !== null && value <= filter.value) return false
              break
            case 'lt':
              if (filter.value !== null && value >= filter.value) return false
              break
            case 'eq':
              if (filter.value !== null && value !== filter.value) return false
              break
            case 'between':
              if (filter.minValue !== null && value < filter.minValue) return false
              if (filter.maxValue !== null && value > filter.maxValue) return false
              break
            case 'all':
            default:
              // 不筛选
              break
          }
        } else {
          // 维度筛选逻辑
          if (!filter.selected || filter.selected.size === 0) continue
          
          let valueToCheck = row[key]
          
          // 特殊处理：如果是日期字段且有聚合设置，需要对比聚合后的值
          if (filter.dateAgg && key === '日期') {
            valueToCheck = aggregateDate(row[key], filter.dateAgg)
          }
          
          if (!filter.selected.has(valueToCheck)) {
            return false
          }
        }
      }
      return true
    })
  
    // 2. 创建 Arquero 表
    let table = aq.from(filteredData)
    console.log('Arquero 表创建成功，行数:', table.numRows())
  
    // 3. 派生字段 (Derived Fields) - 主要用于日期聚合
    dims.forEach(d => {
      if (d.key === '日期' && d.dateAgg) {
        const aggKey = `${d.key}_agg`
        // 使用 Arquero 的 escape 逃逸函数处理自定义 JS 逻辑
        table = table.derive({
          [aggKey]: aq.escape(row => aggregateDate(row[d.key], d.dateAgg))
        })
      }
    })
  
    // 4. 定义分组键 (Group Keys)
    const groupFields = dims.map(d => {
      if (d.key === '日期' && d.dateAgg) {
        return `${d.key}_agg`
      }
      return d.key
    })
  
    // 5. 定义聚合操作 (Rollup Specs)
    const rollupSpec = {}
    metrics.forEach(m => {
      rollupSpec[m.key] = aq.op.sum(m.key)
    })
  
    // 6. 执行分组与聚合
    if (groupFields.length > 0) {
      table = table.groupby(groupFields).rollup(rollupSpec)
    } else {
      table = table.rollup(rollupSpec)
    }
  
    // 7. 转换输出格式 (Transform to Format suitable for Rendering)
    // 将扁平的 Arquero 对象转换为按 Key 分组的 Map 结构，方便 AG Grid 交叉表和 ECharts 渲染
    const result = table.objects()
    console.log('Arquero 聚合结果:', result)
    const groups = {}
  
    result.forEach(row => {
      // 生成唯一行 Key (用于 ECharts X轴 或 AG Grid 行)
      const rowKey = dims.map(d => {
        const fieldName = (d.key === '日期' && d.dateAgg) ? `${d.key}_agg` : d.key
        return row[fieldName]
      }).join(' / ') || '总计'
  
      groups[rowKey] = {
        meta: {},   // 存储维度信息
        values: {}, // 存储度量值
        count: 1
      }
  
      // 填充 Meta
      dims.forEach(d => {
        const fieldName = (d.key === '日期' && d.dateAgg) ? `${d.key}_agg` : d.key
        groups[rowKey].meta[d.key] = row[fieldName]
      })
  
      // 填充 Values
      metrics.forEach(m => {
        groups[rowKey].values[m.key] = row[m.key] || 0
      })
    })
  
    const sortedKeys = Object.keys(groups).sort()
    return { keys: sortedKeys, groups }
  }
  
  // --- 渲染引擎：图表 ---
  const renderEChart = (container, aggregatedData, metrics, chartType) => {
    if (metrics.length === 0) return
    const { keys, groups } = aggregatedData
    
    if (chartInstance) { chartInstance.dispose(); chartInstance = null }
    
    const chartDiv = document.createElement('div')
    chartDiv.style.width = '100%'
    chartDiv.style.height = '100%'
    chartDiv.style.minHeight = '400px'
    container.appendChild(chartDiv)
    
    chartInstance = echarts.init(chartDiv)
    
    const isBar = chartType === 'bar'
    
    // 构造 Series
    const seriesData = metrics.map(m => ({
      name: m.key,
      type: isBar ? 'bar' : 'line',
      data: keys.map(k => groups[k].values[m.key]),
      smooth: !isBar,
      areaStyle: chartType === 'area' ? { opacity: 0.5 } : undefined,
      emphasis: { focus: 'series' }
    }))
    
    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: isBar ? 'shadow' : 'line' } },
      legend: { data: metrics.map(m => m.key), bottom: 0 },
      grid: { left: '3%', right: '4%', bottom: '15%', top: 20, containLabel: true },
      xAxis: { 
        type: 'category', 
        data: keys, 
        boundaryGap: isBar,
        axisLabel: { interval: 0, rotate: keys.length > 8 ? 30 : 0 }
      },
      yAxis: { type: 'value' },
      series: seriesData,
      animationDuration: 500
    }
    
    chartInstance.setOption(option)
  }
  
  // --- 渲染引擎：AG Grid ---
  const renderAgGrid = (container, aggregatedData, allDims, metrics) => {
    // 销毁旧实例
    if (gridApi) { gridApi.destroy(); gridApi = null }
    if (chartInstance) { chartInstance.dispose(); chartInstance = null }
  
    const { keys, groups } = aggregatedData
    
    // 区分：列维度 和 行维度
    const colDims = state.cols.filter(f => f.fieldType === 'dim')
    const rowDims = state.rows.filter(f => f.fieldType === 'dim')
    
    // 创建容器
    const gridDiv = document.createElement('div')
    gridDiv.id = 'ag-grid-container'
    gridDiv.className = 'ag-theme-alpine'
    gridDiv.style.width = '100%'
    gridDiv.style.height = '100%'
    container.appendChild(gridDiv)
  
    // 场景 A: 简单列表 (没有列维度) -> 直接展示
    if (colDims.length === 0) {
      const columnDefs = [
        ...allDims.map(d => ({ 
          headerName: d.key, 
          field: d.key, 
          pinned: 'left',
          width: 80, // 4个中文字符宽度 (约20px/字符)
          minWidth: 80,
          maxWidth: 120
        })),
        ...metrics.map(m => ({ 
          headerName: m.key, 
          field: m.key, 
          type: 'numericColumn',
          valueFormatter: p => p.value ? Math.round(p.value).toLocaleString() : '',
          minWidth: 66 // 减少1/3，从100减少到66
        }))
      ]
      const rowData = keys.map(k => {
        const row = {}
        allDims.forEach(d => row[d.key] = groups[k].meta[d.key])
        metrics.forEach(m => row[m.key] = groups[k].values[m.key])
        return row
      })
      
      gridApi = createGrid(gridDiv, { 
        columnDefs, 
        rowData, 
        defaultColDef: { flex: 1, minWidth: 100, sortable: true, resizable: true },
        theme: "legacy"
      })
      return
    }
  
    // 场景 B: 交叉表 (Pivot Table) (有列维度) -> 需要转换数据结构
    // 逻辑移植自 renderAgGridCross
    const colValues = new Set()
    const rowGroups = {}
  
    Object.keys(groups).forEach(key => {
      const meta = groups[key].meta
      // 生成列头 Key (e.g., "2023-01 / 淘宝")
      const colKey = colDims.map(d => meta[d.key]).join(' / ')
      // 生成行头 Key (e.g., "橘子")
      const rowKey = rowDims.length > 0 ? rowDims.map(d => meta[d.key]).join(' / ') : '总计'
      
      colValues.add(colKey)
      
      if (!rowGroups[rowKey]) {
        rowGroups[rowKey] = { meta: {}, cols: {} }
        rowDims.forEach(d => rowGroups[rowKey].meta[d.key] = meta[d.key])
      }
      rowGroups[rowKey].cols[colKey] = groups[key].values
    })
  
    const sortedColValues = Array.from(colValues).sort()
    const sortedRowKeys = Object.keys(rowGroups).sort()
  
    // 构造 AG Grid Columns
    const columnDefs = rowDims.map(d => ({ 
      headerName: d.key, 
      field: d.key, 
      pinned: 'left',
      width: 80, // 4个中文字符宽度
      minWidth: 80,
      maxWidth: 120
    }))
    
    sortedColValues.forEach(cv => {
      if (metrics.length === 1) {
        columnDefs.push({ 
          headerName: cv, 
          field: `${cv}_${metrics[0].key}`,
          type: 'numericColumn',
          valueFormatter: p => p.value ? Math.round(p.value).toLocaleString() : '',
          minWidth: 66 // 减少1/3
        })
      } else {
        columnDefs.push({
          headerName: cv,
          children: metrics.map(m => ({
            headerName: m.key,
            field: `${cv}_${m.key}`,
            type: 'numericColumn',
            valueFormatter: p => p.value ? Math.round(p.value).toLocaleString() : '',
            minWidth: 66 // 减少1/3
          }))
        })
      }
    })
  
    // 构造 AG Grid Row Data
    const rowData = sortedRowKeys.map(rowKey => {
      const row = {}
      rowDims.forEach(d => row[d.key] = rowGroups[rowKey].meta[d.key])
      sortedColValues.forEach(colKey => {
        const colData = rowGroups[rowKey].cols[colKey] || {}
        metrics.forEach(m => row[`${colKey}_${m.key}`] = colData[m.key] || 0)
      })
      return row
    })
  
    gridApi = createGrid(gridDiv, { 
      columnDefs, 
      rowData, 
      defaultColDef: { minWidth: 100, sortable: true, resizable: true },
      theme: "legacy"
    })
  }
  
  // --- 渲染入口 ---
  const renderViz = () => {
    if (!vizContainer.value) return
    
    // 准备维度和度量列表
    const allDims = [...state.cols, ...state.rows].filter(f => f.fieldType === 'dim')
    const metrics = [...state.cols, ...state.rows].filter(f => f.fieldType === 'measure')
    
    console.log('渲染函数调用:', { allDims, metrics, state: state.cols, rows: state.rows })
  
    // 空状态
    if (allDims.length === 0 && metrics.length === 0) {
      if (chartInstance) { chartInstance.dispose(); chartInstance = null }
      if (gridApi) { gridApi.destroy(); gridApi = null }
      vizContainer.value.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon"><svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 36V42H42V36M6 24V30H42V24M6 12V18H42V12"/></svg></span>
          <p>将维度和度量拖放到行和列架</p>
        </div>`
      return
    }
  
    // 清空容器
    if (chartInstance) { chartInstance.dispose(); chartInstance = null }
    if (gridApi) { gridApi.destroy(); gridApi = null }
    vizContainer.value.innerHTML = ''

    // 1. Arquero 聚合
    const aggregatedData = aggregateWithArquero(rawData, allDims, metrics)
    console.log('准备渲染:', { aggregatedData, chartType: state.chartType })

    // 2. 路由渲染
    if (state.chartType === 'table') {
      renderAgGrid(vizContainer.value, aggregatedData, allDims, metrics)
    } else if (['bar', 'line', 'area'].includes(state.chartType)) {
      renderEChart(vizContainer.value, aggregatedData, metrics, state.chartType)
    }
  }
  
  // --- 交互处理 ---
  const handleDragStart = (field, type) => {
    draggedField.value = { ...field, fieldType: type }
  }
  
  const handleDrop = (targetShelf) => {
    if (!draggedField.value) return
    
    const field = { 
      ...draggedField.value, 
      uid: Date.now(),
      dateAgg: draggedField.value.key === '日期' ? 'month' : undefined 
    } 
    
    if (targetShelf === 'cols') state.cols.push(field)
    if (targetShelf === 'rows') state.rows.push(field)
    
    // 自动创建筛选器（维度和度量都支持）
    initFilter(field.key, field) // 传递field对象
    
    draggedField.value = null
    renderViz()
  }
  
  const removeField = (shelf, index) => {
    let removedField = null
    
    if (shelf === 'cols') {
      removedField = state.cols[index]
      state.cols.splice(index, 1)
    }
    if (shelf === 'rows') {
      removedField = state.rows[index]
      state.rows.splice(index, 1)
    }
    
    // 检查该字段是否还在其他架子上，如果没有则移除筛选器
    if (removedField && removedField.fieldType === 'dim') {
      const stillInUse = [...state.cols, ...state.rows].some(f => f.key === removedField.key)
      if (!stillInUse) {
        removeFilter(removedField.key)
      }
    }
    
    renderViz()
  }
  
  const handleDateAggChange = (field, newAgg) => {
    field.dateAgg = newAgg
    renderViz()
  }
  
  onMounted(() => {
    // 设置默认布局：列=日期(月聚合)，行=客户、平台、GMV
    const defaultCols = [
      { key: '日期', fieldType: 'dim', uid: Date.now() + 1, dateAgg: 'month' }
    ]
    
    const defaultRows = [
      { key: '客户', fieldType: 'dim', uid: Date.now() + 2 },
      { key: '平台', fieldType: 'dim', uid: Date.now() + 3 },
      { key: 'GMV', fieldType: 'measure', uid: Date.now() + 4 }
    ]
    
    state.cols = defaultCols
    state.rows = defaultRows
    
    // 为字段初始化筛选器，传递field对象以正确处理聚合
    initFilter('日期', defaultCols[0]) // 传递日期field对象，包含dateAgg
    initFilter('客户', defaultRows[0])  
    initFilter('平台', defaultRows[1])
    initFilter('GMV', defaultRows[2]) // 为GMV度量添加筛选器
    
    // 渲染初始视图
    renderViz()
    
    window.addEventListener('resize', () => {
      chartInstance && chartInstance.resize()
    })
  })
  </script>
  
  <template>
    <div class="bi-container">
      <!-- 顶部工具栏 -->
      <header class="bi-header">
        <div class="brand">
          <div class="logo-grid">
            <span class="bg-blue"></span><span class="bg-orange"></span>
            <span class="bg-red"></span><span class="bg-teal"></span>
          </div>
          <span class="title">自助分析 <small>Self-Service BI</small></span>
        </div>
        <a-space>
          <a-button size="small" type="primary" @click="exportData">
            <template #icon><IconFile /></template> 导出
          </a-button>
          <a-button size="small" type="secondary" @click="renderViz">
            <template #icon><IconRefresh /></template> 刷新
          </a-button>
          <a-button size="small" status="danger" @click="() => { state.cols=[]; state.rows=[]; activeFilters.clear(); state.filters={}; renderViz() }">
            <template #icon><IconClose /></template> 清空
          </a-button>
        </a-space>
      </header>
  
      <div class="workspace">
        <!-- 左侧：数据面板 -->
        <div class="sidebar">
          <div class="section-title">数据源：电商销售表</div>
          
          <!-- 维度列表 -->
          <div class="field-group">
            <div class="group-header">维度 (Dimensions)</div>
            <div 
              v-for="dim in dimensions" 
              :key="dim.key"
              class="field-item dim"
              draggable="true"
              @dragstart="handleDragStart(dim, 'dim')"
            >
              <component :is="dim.icon" class="field-icon" />
              <span>{{ dim.key }}</span>
            </div>
          </div>
  
          <a-divider style="margin: 12px 0" />
  
          <!-- 度量列表 -->
          <div class="field-group">
            <div class="group-header">度量 (Measures)</div>
            <div 
              v-for="measure in measures" 
              :key="measure.key"
              class="field-item measure"
              draggable="true"
              @dragstart="handleDragStart(measure, 'measure')"
            >
              <component :is="measure.icon" class="field-icon" />
              <span>{{ measure.key }}</span>
            </div>
          </div>
        </div>
  
        <!-- 中间：控制卡片 -->
        <div class="controls-column">
          <!-- 标记卡 -->
          <a-card class="control-card" title="标记" size="small" :bordered="true">
            <template #extra>Automatic</template>
            <a-select v-model="state.chartType" @change="renderViz" size="small">
              <a-option v-for="t in chartTypes" :key="t.value" :value="t.value">{{ t.label }}</a-option>
            </a-select>
            
            <div class="marks-grid">
              <div class="mark-btn"><IconSettings />颜色</div>
              <div class="mark-btn"><IconDragDotVertical />大小</div>
            </div>
          </a-card>
  
          <!-- 筛选器卡 -->
          <a-card class="control-card flex-1" title="筛选器" size="small" :bordered="true">
            <div v-if="activeFilters.size === 0" class="empty-filter">拖拽维度至此筛选</div>
            
            <div v-else class="filters-container">
              <div 
                v-for="fieldKey in Array.from(activeFilters)" 
                :key="fieldKey"
                class="filter-item"
                :class="{ 'expanded': expandedFilters.has(fieldKey) }"
              >
                <div class="filter-header" @click="toggleFilterExpansion(fieldKey)">
                  <span class="filter-title">{{ fieldKey }}</span>
                  <div class="filter-header-actions">
                    <span class="selected-count" v-if="!expandedFilters.has(fieldKey)">
                      <template v-if="state.filters[fieldKey]?.fieldType === 'dim'">
                        {{ state.filters[fieldKey]?.selected?.size || 0 }}/{{ state.filters[fieldKey]?.options?.length || 0 }}
                      </template>
                      <template v-else>
                        {{ state.filters[fieldKey]?.operator === 'all' ? '无筛选' : state.filters[fieldKey]?.operator }}
                      </template>
                    </span>
                    <IconCaretDown 
                      class="expand-icon" 
                      :class="{ 'rotated': expandedFilters.has(fieldKey) }"
                    />
                    <a-button 
                      size="mini" 
                      type="text" 
                      @click.stop="removeFilter(fieldKey)"
                      class="remove-btn"
                    >
                      <template #icon><IconClose style="font-size: 10px" /></template>
                    </a-button>
                  </div>
                </div>
                
                <div class="filter-content" v-show="expandedFilters.has(fieldKey)">
                  <!-- 维度筛选 -->
                  <template v-if="state.filters[fieldKey]?.fieldType === 'dim'">
                    <div class="filter-controls">
                      <a-button 
                        size="mini" 
                        type="text" 
                        @click="toggleSelectAll(fieldKey)"
                        class="select-all-btn"
                      >
                        {{ state.filters[fieldKey]?.selected.size === state.filters[fieldKey]?.options.length ? '取消全选' : '全选' }}
                      </a-button>
                    </div>
                    
                    <a-select
                      :model-value="Array.from(state.filters[fieldKey]?.selected || [])"
                      @update:model-value="(vals) => updateFilterSelection(fieldKey, vals)"
                      multiple
                      size="mini"
                      :max-tag-count="2"
                      placeholder="选择筛选值"
                      style="width: 100%;"
                    >
                      <a-option 
                        v-for="option in state.filters[fieldKey]?.options || []" 
                        :key="option" 
                        :value="option"
                      >
                        {{ option }}
                      </a-option>
                    </a-select>
                  </template>
                  
                  <!-- 度量筛选 -->
                  <template v-else-if="state.filters[fieldKey]?.fieldType === 'measure'">
                    <div class="measure-filter">
                      <div class="filter-operator">
                        <a-select 
                          :model-value="state.filters[fieldKey]?.operator || 'all'"
                          @update:model-value="(op) => updateMeasureFilter(fieldKey, op, state.filters[fieldKey]?.value, state.filters[fieldKey]?.minValue, state.filters[fieldKey]?.maxValue)"
                          size="mini"
                          style="width: 100%; margin-bottom: 8px;"
                        >
                          <a-option value="all">不筛选</a-option>
                          <a-option value="gt">大于</a-option>
                          <a-option value="lt">小于</a-option>
                          <a-option value="eq">等于</a-option>
                          <a-option value="between">区间</a-option>
                        </a-select>
                      </div>
                      
                      <!-- 单值输入 -->
                      <div v-if="['gt', 'lt', 'eq'].includes(state.filters[fieldKey]?.operator)" class="single-value">
                        <a-input-number 
                          :model-value="state.filters[fieldKey]?.value"
                          @update:model-value="(val) => updateMeasureFilter(fieldKey, state.filters[fieldKey]?.operator, val, state.filters[fieldKey]?.minValue, state.filters[fieldKey]?.maxValue)"
                          size="mini"
                          style="width: 100%;"
                          placeholder="输入数值"
                        />
                      </div>
                      
                      <!-- 区间输入 -->
                      <div v-if="state.filters[fieldKey]?.operator === 'between'" class="range-values">
                        <a-input-number 
                          :model-value="state.filters[fieldKey]?.minValue"
                          @update:model-value="(val) => updateMeasureFilter(fieldKey, 'between', state.filters[fieldKey]?.value, val, state.filters[fieldKey]?.maxValue)"
                          size="mini"
                          style="width: 48%; margin-bottom: 4px;"
                          placeholder="最小值"
                        />
                        <span style="margin: 0 2%;">到</span>
                        <a-input-number 
                          :model-value="state.filters[fieldKey]?.maxValue"
                          @update:model-value="(val) => updateMeasureFilter(fieldKey, 'between', state.filters[fieldKey]?.value, state.filters[fieldKey]?.minValue, val)"
                          size="mini"
                          style="width: 48%;"
                          placeholder="最大值"
                        />
                      </div>
                      
                      <!-- 显示数据范围信息 -->
                      <div class="range-info">
                        范围: {{ Math.round(state.filters[fieldKey]?.rangeMin || 0).toLocaleString() }} ~ {{ Math.round(state.filters[fieldKey]?.rangeMax || 0).toLocaleString() }}
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </a-card>
        </div>
  
        <!-- 右侧：分析画板 -->
        <div class="canvas-area">
          <!-- 行列架 -->
          <div class="shelves">
            <div class="shelf-row">
              <div class="shelf-label">列 (Columns)</div>
              <div 
                class="shelf-dropzone" 
                @dragover.prevent 
                @drop="handleDrop('cols')"
              >
                <div 
                  v-for="(field, idx) in state.cols" 
                  :key="field.uid"
                  class="field-pill-wrapper"
                >
                  <!-- 支持日期聚合下拉菜单 -->
                  <a-dropdown v-if="field.dateAgg" @select="(val) => handleDateAggChange(field, val)">
                     <a-tag color="arcoblue" closable @close="removeField('cols', idx)" class="field-pill">
                       {{ field.key }} 
                       <span class="agg-tag">({{ dateAggOptions.find(o => o.value === field.dateAgg)?.label }})</span>
                       <IconCaretDown style="margin-left: 4px; font-size: 10px"/>
                     </a-tag>
                     <template #content>
                       <a-doption v-for="opt in dateAggOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</a-doption>
                     </template>
                  </a-dropdown>
                  
                  <a-tag v-else 
                     :color="field.fieldType === 'dim' ? 'arcoblue' : 'green'" 
                     closable 
                     @close="removeField('cols', idx)"
                     class="field-pill"
                  >
                    {{ field.key }}
                  </a-tag>
                </div>
              </div>
            </div>
            <div class="shelf-row">
              <div class="shelf-label">行 (Rows)</div>
              <div 
                class="shelf-dropzone" 
                @dragover.prevent 
                @drop="handleDrop('rows')"
              >
                 <div 
                  v-for="(field, idx) in state.rows" 
                  :key="field.uid"
                  class="field-pill-wrapper"
                >
                  <a-dropdown v-if="field.dateAgg" @select="(val) => handleDateAggChange(field, val)">
                     <a-tag color="arcoblue" closable @close="removeField('rows', idx)" class="field-pill">
                       {{ field.key }} 
                       <span class="agg-tag">({{ dateAggOptions.find(o => o.value === field.dateAgg)?.label }})</span>
                       <IconCaretDown style="margin-left: 4px; font-size: 10px"/>
                     </a-tag>
                     <template #content>
                       <a-doption v-for="opt in dateAggOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</a-doption>
                     </template>
                  </a-dropdown>
                  
                  <a-tag v-else 
                     :color="field.fieldType === 'dim' ? 'arcoblue' : 'green'" 
                     closable 
                     @close="removeField('rows', idx)"
                     class="field-pill"
                  >
                    {{ field.key }}
                  </a-tag>
                </div>
              </div>
            </div>
          </div>
  
          <!-- 图表容器 -->
          <div class="viz-wrapper">
            <div ref="vizContainer" class="viz-container">
              <!-- Initial content handled by renderViz logic -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <style scoped>
  /* 整体布局 */
  .bi-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--color-fill-2);
    color: var(--color-text-1);
  }
  
  .bi-header {
    height: 48px;
    background: var(--color-bg-2);
    border-bottom: 1px solid var(--color-border-2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
  }
  
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .logo-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 20px;
    height: 20px;
    gap: 2px;
  }
  .logo-grid span { border-radius: 2px; }
  .bg-blue { background: #4e79a7; }
  .bg-orange { background: #f28e2b; }
  .bg-red { background: #e15759; }
  .bg-teal { background: #76b7b2; }
  
  .title {
    font-weight: 600;
    font-size: 16px;
  }
  .title small {
    font-weight: normal;
    color: var(--color-text-3);
    font-size: 12px;
    margin-left: 4px;
  }
  
  .workspace {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
  
  /* 侧边栏 */
  .sidebar {
    width: 220px;
    background: var(--color-bg-2);
    border-right: 1px solid var(--color-border-2);
    display: flex;
    flex-direction: column;
    padding: 12px 0;
  }
  
  .section-title {
    padding: 0 12px;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-2);
    margin-bottom: 12px;
  }
  
  .group-header {
    padding: 4px 12px;
    font-size: 11px;
    color: var(--color-text-3);
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .field-item {
    padding: 6px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: grab;
    transition: background 0.1s;
    font-size: 13px;
  }
  .field-item:hover {
    background-color: var(--color-fill-2);
  }
  .field-item.dim .field-icon { color: rgb(22, 93, 255); }
  .field-item.measure .field-icon { color: rgb(0, 180, 42); }
  
  /* 控制栏 */
  .controls-column {
    width: 180px;
    background: var(--color-bg-1);
    border-right: 1px solid var(--color-border-2);
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .control-card :deep(.arco-card-header) {
    padding: 8px 12px;
    height: auto;
    font-size: 12px;
  }
  
  .marks-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 12px;
  }
  .mark-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 11px;
    color: var(--color-text-3);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
  }
  .mark-btn:hover { background: var(--color-fill-2); }
  
  .empty-filter {
    font-size: 12px;
    color: var(--color-text-4);
    text-align: center;
    margin-top: 20px;
  }
  
  .filters-container {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .filter-item {
    margin-bottom: 8px;
    border: 1px solid var(--color-border-3);
    border-radius: 6px;
    background: var(--color-fill-1);
    overflow: hidden;
    transition: all 0.2s ease;
  }
  
  .filter-item:hover {
    border-color: var(--color-border-2);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    user-select: none;
    border-bottom: 1px solid transparent;
    transition: all 0.2s ease;
  }
  
  .filter-item.expanded .filter-header {
    border-bottom-color: var(--color-border-3);
    background: var(--color-fill-2);
  }
  
  .filter-header:hover {
    background: var(--color-fill-2);
  }
  
  .filter-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-2);
  }
  
  .filter-header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .selected-count {
    font-size: 10px;
    color: var(--color-text-3);
    background: var(--color-fill-3);
    padding: 2px 6px;
    border-radius: 10px;
  }
  
  .expand-icon {
    font-size: 12px;
    color: var(--color-text-3);
    transition: transform 0.2s ease;
  }
  
  .expand-icon.rotated {
    transform: rotate(180deg);
  }
  
  .remove-btn {
    opacity: 0.6;
    transition: opacity 0.2s ease;
  }
  
  .remove-btn:hover {
    opacity: 1;
  }
  
  .filter-content {
    padding: 8px 12px;
    border-top: 1px solid var(--color-border-3);
    background: var(--color-bg-1);
  }
  
  .filter-controls {
    margin-bottom: 8px;
    display: flex;
    justify-content: flex-end;
  }
  
  .select-all-btn {
    font-size: 10px;
    padding: 2px 4px;
    height: auto;
  }
  
  .measure-filter {
    padding: 4px 0;
  }
  
  .range-values {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
  }
  
  .range-info {
    font-size: 10px;
    color: var(--color-text-4);
    margin-top: 4px;
    text-align: center;
    padding: 4px;
    background: var(--color-fill-2);
    border-radius: 3px;
  }
  
  /* 画板区域 */
  .canvas-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--color-bg-1);
  }
  
  .shelves {
    background: var(--color-bg-2);
    border-bottom: 1px solid var(--color-border-2);
    padding: 8px 12px;
  }
  
  .shelf-row {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    min-height: 32px;
  }
  
  .shelf-label {
    width: 60px;
    text-align: right;
    font-size: 12px;
    color: var(--color-text-3);
    margin-right: 12px;
  }
  
  .shelf-dropzone {
    flex: 1;
    border: 1px solid var(--color-border-2);
    border-radius: 4px;
    min-height: 32px;
    background: var(--color-bg-1);
    display: flex;
    align-items: center;
    padding: 2px 4px;
    gap: 4px;
    flex-wrap: wrap;
  }
  
  .field-pill-wrapper {
    margin-right: 4px;
    margin-bottom: 2px;
  }
  
  .field-pill {
    border-radius: 12px;
    cursor: default;
  }
  
  .agg-tag {
    font-size: 10px;
    opacity: 0.8;
    margin-left: 2px;
  }
  
  .viz-wrapper {
    flex: 1;
    padding: 24px;
    background: var(--color-fill-2);
    overflow: hidden;
  }
  
  .viz-container {
    width: 100%;
    height: 100%;
    background: var(--color-bg-2);
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    border-radius: 4px;
    border: 1px solid var(--color-border-2);
    position: relative;
  }
  
  .empty-state {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--color-text-4);
  }
  .empty-icon {
    font-size: 48px;
    color: var(--color-fill-4);
    margin-bottom: 16px;
  }
  </style>