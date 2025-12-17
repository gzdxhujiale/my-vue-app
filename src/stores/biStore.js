import { defineStore } from 'pinia'
import { ref, reactive, shallowRef } from 'vue'

export const useBiStore = defineStore('bi', () => {
  // --- 基础状态 ---
  const state = reactive({
    cols: [], // 列架 (Columns Shelf)
    rows: [], // 行架 (Rows Shelf)
    filters: {}, // 筛选器 - 格式: { fieldKey: { selected: [], options: [] } }
    chartType: 'table', // 默认图表类型
    colorPalette: 'default'
  })

  // --- 数据源配置（新增）---
  const rawData = ref([]) // 原始数据，支持动态加载
  const dimensions = shallowRef([]) // 使用 shallowRef 避免深度响应式（包含组件对象）
  const measures = shallowRef([]) // 使用 shallowRef 避免深度响应式（包含组件对象）

  // --- 图表配置选项（新增）---
  const chartTypes = ref([
    { label: '柱状图', value: 'bar' },
    { label: '折线图', value: 'line' },
    { label: '面积图', value: 'area' },
    { label: '明细表', value: 'table' },
  ])

  const dateAggOptions = ref([
    { value: 'day', label: '日' },
    { value: 'month', label: '月' },
    { value: 'quarter', label: '季度' },
    { value: 'year', label: '年' }
  ])

  // --- 日期聚合工具函数（移到顶部，供其他函数使用）---
  const aggregateDate = (dateStr, aggType) => {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const q = Math.ceil((date.getMonth() + 1) / 3)
    
    switch(aggType) {
      case 'day': return dateStr
      case 'month': return `${y}-${m}`
      case 'quarter': return `${y}-Q${q}`
      case 'year': return `${y}`
      default: return dateStr
    }
  }

  // 自动筛选器相关
  const activeFilters = ref(new Set()) // 当前激活的筛选器字段
  const expandedFilters = ref(new Set()) // 当前展开的筛选器

  // --- 筛选器管理函数 ---
  const initFilter = (fieldKey, field = null, rawData = []) => {
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
          return aggregateDate(dateStr, field.dateAgg) // 使用统一的 aggregateDate 函数
        }))].filter(v => v !== null && v !== undefined)
      } else {
        // 普通字段：从原始数据获取该字段的所有唯一值
        uniqueValues = [...new Set(rawData.map(row => row[fieldKey]))].filter(v => v !== null && v !== undefined)
      }
      
      // 使用深度响应式数组替代Set
      state.filters[fieldKey] = {
        selected: [...uniqueValues], // 使用数组，默认全选
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
    expandedFilters.value.delete(fieldKey)
  }

  const updateDateAggregation = (fieldKey, newDateAgg, rawData) => {
    // 更新筛选器中的日期聚合并重新计算选项
    if (state.filters[fieldKey] && state.filters[fieldKey].fieldType === 'dim') {
      const uniqueValues = [...new Set(rawData.map(row => {
        const dateStr = row[fieldKey]
        return aggregateDate(dateStr, newDateAgg)
      }))].filter(v => v !== null && v !== undefined)
      
      state.filters[fieldKey].options = uniqueValues.sort()
      state.filters[fieldKey].selected = [...uniqueValues] // 重新全选
      state.filters[fieldKey].dateAgg = newDateAgg
    }
  }

  const toggleFilterDropdown = (fieldKey, visible) => {
    if (visible) {
      expandedFilters.value.add(fieldKey)
    } else {
      expandedFilters.value.delete(fieldKey)
    }
  }

  const toggleOption = (fieldKey, option) => {
    if (state.filters[fieldKey] && state.filters[fieldKey].fieldType === 'dim') {
      const filter = state.filters[fieldKey]
      const index = filter.selected.indexOf(option)
      if (index > -1) {
        filter.selected.splice(index, 1) // 移除
      } else {
        filter.selected.push(option) // 添加
      }
    }
  }

  const toggleSelectAll = (fieldKey) => {
    if (!state.filters[fieldKey]) return
    
    const filter = state.filters[fieldKey]
    
    // 只对维度字段执行全选/取消全选操作
    if (filter.fieldType !== 'dim') return
    
    const allSelected = filter.selected.length === filter.options.length
    
    if (allSelected) {
      filter.selected.splice(0) // 清空数组（全部取消选择）
    } else {
      filter.selected.splice(0, filter.selected.length, ...filter.options) // 全部选择
    }
  }

  const updateFilterSelection = (fieldKey, selectedValues) => {
    if (state.filters[fieldKey] && state.filters[fieldKey].fieldType === 'dim') {
      state.filters[fieldKey].selected.splice(0, state.filters[fieldKey].selected.length, ...selectedValues)
    }
  }

  const updateMeasureFilter = (fieldKey, operator, value, minValue, maxValue) => {
    if (state.filters[fieldKey] && state.filters[fieldKey].fieldType === 'measure') {
      state.filters[fieldKey].operator = operator
      state.filters[fieldKey].value = value
      state.filters[fieldKey].minValue = minValue
      state.filters[fieldKey].maxValue = maxValue
    }
  }

  // --- 数据初始化（新增）---
  const initializeDataSource = (data, dims, meas) => {
    rawData.value = data
    dimensions.value = dims
    measures.value = meas
  }

  // --- 数据聚合逻辑（新增）---
  const aggregateData = (aq, dims, metrics) => {
    if (!aq || rawData.value.length === 0) {
      return { keys: [], groups: {} }
    }

    // 1. 筛选数据
    let filteredData = rawData.value.filter(row => {
      for (const [key, filter] of Object.entries(state.filters)) {
        if (filter.fieldType === 'measure') {
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
          }
        } else {
          // 维度筛选逻辑
          if (!filter.selected || filter.selected.length === 0) {
            // 如果没有选中任何值，过滤掉所有数据
            return false
          }
          
          let valueToCheck = row[key]
          if (filter.dateAgg && key === '日期') {
            valueToCheck = aggregateDate(row[key], filter.dateAgg)
          }
          
          if (!filter.selected.includes(valueToCheck)) {
            return false
          }
        }
      }
      return true
    })

    // 2. 创建 Arquero 表
    let table = aq.from(filteredData)

    // 3. 派生字段（日期聚合）
    dims.forEach(d => {
      if (d.key === '日期' && d.dateAgg) {
        const aggKey = `${d.key}_agg`
        table = table.derive({
          [aggKey]: aq.escape(row => aggregateDate(row[d.key], d.dateAgg))
        })
      }
    })

    // 4. 定义分组键
    const groupFields = dims.map(d => {
      if (d.key === '日期' && d.dateAgg) {
        return `${d.key}_agg`
      }
      return d.key
    })

    // 5. 定义聚合操作
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

    // 7. 转换输出格式
    const result = table.objects()
    const groups = {}

    result.forEach(row => {
      const rowKey = dims.map(d => {
        const fieldName = (d.key === '日期' && d.dateAgg) ? `${d.key}_agg` : d.key
        return row[fieldName]
      }).join(' / ') || '总计'

      groups[rowKey] = {
        meta: {},
        values: {},
        count: 1
      }

      dims.forEach(d => {
        const fieldName = (d.key === '日期' && d.dateAgg) ? `${d.key}_agg` : d.key
        groups[rowKey].meta[d.key] = row[fieldName]
      })

      metrics.forEach(m => {
        groups[rowKey].values[m.key] = row[m.key] || 0
      })
    })

    const sortedKeys = Object.keys(groups).sort()
    return { keys: sortedKeys, groups }
  }

  // --- 导出数据（新增）---
  const exportToCSV = (aggregatedData, allDims, metrics) => {
    const { keys, groups } = aggregatedData
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
    URL.revokeObjectURL(url)
  }

  return {
    // 状态
    state,
    activeFilters,
    expandedFilters,
    rawData,
    dimensions,
    measures,
    chartTypes,
    dateAggOptions,
    
    // 筛选器方法
    initFilter,
    removeFilter,
    updateDateAggregation,
    toggleFilterDropdown,
    toggleOption,
    toggleSelectAll,
    updateFilterSelection,
    updateMeasureFilter,
    
    // 数据处理方法（新增）
    initializeDataSource,
    aggregateDate,
    aggregateData,
    exportToCSV
  }
})