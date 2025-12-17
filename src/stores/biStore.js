import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useBiStore = defineStore('bi', () => {
  // --- 基础状态 ---
  const state = reactive({
    cols: [], // 列架 (Columns Shelf)
    rows: [], // 行架 (Rows Shelf)
    filters: {}, // 筛选器 - 格式: { fieldKey: { selected: [], options: [] } }
    chartType: 'table', // 默认图表类型
    colorPalette: 'default'
  })

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
        const aggregateDate = (dateStr, aggType) => {
          if (!dateStr) return ''
          const date = new Date(dateStr)
          if (isNaN(date.getTime())) return dateStr
          
          switch (aggType) {
            case 'year': return date.getFullYear().toString()
            case 'month': return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            case 'quarter': return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`
            default: return dateStr
          }
        }
        
        uniqueValues = [...new Set(rawData.map(row => {
          const dateStr = row[fieldKey]
          return aggregateDate(dateStr, field.dateAgg)
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

  return {
    // 状态
    state,
    activeFilters,
    expandedFilters,
    
    // 方法
    initFilter,
    removeFilter,
    toggleFilterDropdown,
    toggleOption,
    toggleSelectAll,
    updateFilterSelection,
    updateMeasureFilter
  }
})