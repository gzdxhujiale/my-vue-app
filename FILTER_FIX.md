# 🐛 筛选逻辑修复说明

## 问题描述
用户反馈：选择了筛选项后，数据反而不可见了。

## 根本原因

### 1. **日期聚合函数不一致** ⚠️ 
**问题：** `initFilter` 函数内部定义了一个局部的 `aggregateDate` 函数，与 Store 导出的 `aggregateDate` 不完全一致。

**后果：**
- 初始化筛选器时使用局部函数生成选项
- 实际筛选数据时使用 Store 函数比较值
- 两者格式不匹配 → 筛选失败

**示例：**
```javascript
// ❌ 修复前：initFilter 中的局部函数
const aggregateDate = (dateStr, aggType) => {
  // 没有处理 'day' 的情况
  // quarter 计算方式略有不同
}

// ✅ 修复后：统一使用 Store 的 aggregateDate
uniqueValues = [...new Set(rawData.map(row => {
  return aggregateDate(dateStr, field.dateAgg) // 使用同一个函数
}))]
```

---

### 2. **日期聚合改变时筛选器未更新** ⚠️
**问题：** 用户改变日期聚合方式（如从"月"切换到"年"）时：
- ✅ 字段的 `dateAgg` 更新了
- ✅ 图表数据重新聚合了
- ❌ **筛选器的选项和已选值没有更新**

**后果：**
```
用户操作：将"日期"从"月"改为"年"

筛选器选项仍然是：
  ✓ 2024-01
  ✓ 2024-02
  ✓ 2024-03
  ...

实际数据已经按"年"聚合：
  2024
  2023

结果：筛选器中的 "2024-01" 无法匹配数据中的 "2024" → 数据被过滤掉！
```

---

## 修复方案

### ✅ 修复 1：统一日期聚合函数
将 `aggregateDate` 函数移到 store 顶部，所有功能共用同一个实现。

```javascript
// biStore.js
export const useBiStore = defineStore('bi', () => {
  // ... 状态定义
  
  // ✅ 日期聚合函数（统一实现）
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
  
  // ✅ initFilter 直接使用上面的函数
  const initFilter = (fieldKey, field = null, rawData = []) => {
    // ...
    uniqueValues = [...new Set(rawData.map(row => {
      return aggregateDate(dateStr, field.dateAgg) // 使用统一函数
    }))]
  }
})
```

---

### ✅ 修复 2：添加日期聚合更新方法
新增 `updateDateAggregation` 方法，在聚合方式改变时同步更新筛选器。

```javascript
// biStore.js
const updateDateAggregation = (fieldKey, newDateAgg, rawData) => {
  if (state.filters[fieldKey] && state.filters[fieldKey].fieldType === 'dim') {
    // 重新计算聚合后的唯一值
    const uniqueValues = [...new Set(rawData.map(row => {
      const dateStr = row[fieldKey]
      return aggregateDate(dateStr, newDateAgg)
    }))].filter(v => v !== null && v !== undefined)
    
    // 更新筛选器
    state.filters[fieldKey].options = uniqueValues.sort()
    state.filters[fieldKey].selected = [...uniqueValues] // 重新全选
    state.filters[fieldKey].dateAgg = newDateAgg
  }
}
```

```javascript
// SelfServiceBi.vue
const handleDateAggChange = (field, newAgg) => {
  field.dateAgg = newAgg
  
  // ✅ 同步更新筛选器
  if (field.key === '日期') {
    updateDateAggregation('日期', newAgg, rawData.value)
  }
  
  renderViz()
}
```

---

## 修复验证

### 测试步骤：

1. **打开自助分析页面**
2. **拖拽"日期"到列或行架**（默认按"月"聚合）
3. **检查筛选器**：
   - 应该显示所有月份（如 2024-01, 2024-02...）
   - 默认全部选中
4. **取消选择某些月份**（如取消 2024-01）
   - ✅ 数据应该正常过滤，只显示选中月份的数据
5. **改变聚合方式为"年"**
   - ✅ 筛选器选项应该自动更新为年份（如 2024, 2023）
   - ✅ 所有年份默认选中
   - ✅ 数据正常显示
6. **取消选择某个年份**
   - ✅ 数据应该正常过滤

---

## 代码变更总结

### biStore.js
- ✅ 将 `aggregateDate` 函数提前到 `initFilter` 之前定义
- ✅ 移除 `initFilter` 中的局部 `aggregateDate` 函数
- ✅ 新增 `updateDateAggregation` 方法
- ✅ 导出 `updateDateAggregation` 方法

### SelfServiceBi.vue
- ✅ 导入 `updateDateAggregation` 方法
- ✅ 在 `handleDateAggChange` 中调用该方法更新筛选器

---

## 预期效果

### 修复前 ❌
```
用户操作：选择日期 = "2024-01", "2024-02"

实际筛选：
  - 初始化时用的聚合格式可能不一致
  - 改变聚合方式后筛选器选项未更新
  - 结果：数据不可见或显示错误

```

### 修复后 ✅
```
用户操作：选择日期 = "2024-01", "2024-02"

实际筛选：
  - ✅ 统一使用同一个 aggregateDate 函数
  - ✅ 格式完全一致（初始化和筛选时）
  - ✅ 改变聚合方式时自动更新筛选器选项
  - ✅ 数据正确过滤和显示

改变聚合为"年"：
  - ✅ 筛选器自动更新为 "2024", "2023"
  - ✅ 全部选中
  - ✅ 数据正常显示
```

---

## 技术要点

1. **函数复用** - 避免在不同地方重复实现相同逻辑
2. **响应式更新** - 状态改变时同步更新相关数据
3. **数据一致性** - 确保筛选条件和数据使用相同的格式

修复完成！🎉
