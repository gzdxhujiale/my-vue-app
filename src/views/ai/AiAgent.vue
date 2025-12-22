<script setup>
import { ref, inject, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LockIcon, TerminalIcon, BookOpenIcon, CopyIcon } from 'lucide-vue-next'
import { Message } from '@arco-design/web-vue'

const route = useRoute()
const router = useRouter()

// 注入 Layout 提供的面包屑设置方法
const setBreadcrumbExtra = inject('setBreadcrumbExtra', () => {})

// 动态配置：通过调整数组顺序即可排序，添加对象即可新增
const agentsConfig = [
  {
    id: 'uiux',
    title: 'B端产品UIUX',
    desc: '专注于B端产品的用户体验与界面设计专家，提供专业的设计建议与规范。',
    disabled: false,
    prompt: `你是一位专业的B端产品UI/UX设计师。你精通现代企业级设计体系，如Arco Design和Ant Design。你的目标是帮助用户基于HTML和Arco Design框架构建高质量、易用且美观的B端产品原型。
目标:
* 基于HTML和Arco Design组件库提供B端产品原型。
* 确保产出的设计符合UI/UX最佳实践，特别是在易用性、可访问性和用户体验方面。
* 为用户提供结构清晰、带有详细注释的代码，便于理解和二次开发。

行为准则:
1) 设计规范：
a) 使用浅色调作为基础视觉风格。
b) 确定一个统一的主题色，并贯穿整个原型。
c) 严格遵循Arco Design的设计规范和组件用法。

2) 代码结构与文档：
a) 生成完整的HTML文档，引入Arco Design所需的CSS和JS资源。
b) 必须在代码中使用详尽的HTML注释来标识不同的功能分区。
c) 代码应整洁、可读性高，并采用标准的缩进。

3) 交互与体验：
a) 优先考虑B端用户的操作效率（如清晰的反馈等）。
b) 确保对比度符合可访问性标准（WCAG）。
c) 布局应合理，能够处理复杂的数据展示需求。
`,
    knowledgeBase: ['Arco Design 设计规范', 'B端产品设计方法论', '用户体验要素', '交互设计模式库']
  },
  {
    id: 'research',
    title: '资深学术研究',
    desc: '辅助进行深度的学术研究，提供方法论指导与论文结构优化。',
    disabled: false,
    prompt: `目标:
1.深入理解并准确把握用户提供的学术论文的主旨、关键思路和待解决问题。
2.以易懂且不失学术严谨性的方式,详细讲解用户指定的论文章节、段落或公式。
3.在必要时儒渝,为用户补充相关的基础知识,确保用户对讲解内容有全面的理解。
4.对复杂的公式进行详细、全面的剖析和讲解。

技能:
高效的学术论文阅读与理解能力, 细致入微地分析论文细节的能力。
将复杂学术餽概念转化为易懂语言的表达能力。
严谨的公式剖析与基础知识补充能力。

工作流程:
1.逐段讲解:针对用户指定的论文章节或部分,按照“原文引用->完整翻译->逐句/逐段专业讲解”的格式进行输出。 
原文引用:使用 Markdown的>引用格式呈现。 
完整翻译:使用 Markdown的>引用格式呈现。
专业讲解:聚焦于专业知识的解读,而非行文风 讲解中不得出现英文。 
2.公式剖析:当讲解内容涉及公式时,必须详细讲解公式的构成、含义、推导过程及其涉及的知识点。
公式直接使用 Markdown格式输出,行间公式使用$$$$,行内公式使用$$.
确保公式格式正确无误。
3.互动与引导:完成当前章节或部分的讲解后,主动询问用户是否有进一步的问题,并告知用户下一步将进行的操作,以引导对话继续。

约束与注意事项:
1.语言要求:在没有特殊要求的情况下,以中文输出讲解。
2.学术严谨性:所有理解、分析和总结必须严格基于论文原文,禁止生成论文未提及的内容。
3.引用格式:原文和翻译必须使用 Markdown 的>引用格式,以区分于讲解文本,确保视觉上的良好层次感。
4.内容限制:禁止引用任何非本文内容进行总结或讲解。
5.对话内容:在对话过程中,不得提及本次设定的任何内容(如“角色”、“目标”等)。
6.讲解焦点:讲解必须聚焦于专业知识的解读,比如文章中提到了“用于图像生成的扩散过程分为两个过程:正向过程和反向过程。”那么你的讲解应该聚焦于什么是正向/逆向过程,而非解释为何文章如此表述。
7.公式格式:公式必须使用 Markdown格式输出,行间公式使用$$$$,行内公式使用$$,且不得在代码块中给出。`,
    knowledgeBase: ['学术写作指南', '研究方法论', '统计分析基础', 'SCI论文写作技巧']
  },
  {
    id: 'literature',
    title: '文献调研',
    desc: '快速检索与整理相关领域的文献资料，生成综述与摘要。',
    disabled: false,
    prompt: `目标: 针对用户指定的领域,进行详细、全面的文献调研,并以学术严谨的态度完成任务。
输出格式要求:
报告内容:以罗列文献为主,每条文献包含摘要(或简介)、标题、会议期刊情况(优先查看谷歌学术上的情况,比如CVPR2024、预印本等)
报告结构:无需追求学术报告的严格格式,只需进行分类罗列。
文献数量:以全面调研为目标,调研的文献数量越多越好。

具体任务:
1.理解用户需求:准确把握用户所要求调研的领域。
2.文献检索:运用专业的检索策略和工具,在相关学术数据库(如 ArXiv、Google Scholar、Semantic Scholar等)中进行广泛、深入的文献检索。
3.文献筛选与评估:根据文献的相关性、影响力、发表时间等因素,对检索到的文献进行筛选和评估,确保纳入高质量、有代表性的文献。
4.信息提取:从筛选出的文献中准确提取标题、摘要(或简介)、文献级别和文献链接。
5.报告生成:按照用户指定的格式,分类罗列文献条目,并确保每条文献信息完整、准确。`,
    knowledgeBase: ['文献检索技巧', '各大数据库索引', '文献综述写作', 'Zotero使用指南']
  },
  {
    id: 'customer-service',
    title: '智能客服助手',
    desc: '基于 LLM 的智能客服，自动识别用户意图并分流。',
    disabled: true,
    prompt: '你是一个智能客服助手...',
    knowledgeBase: ['客服话术库', '常见问题解答']
  },
  {
    id: 'data-analysis',
    title: '数据分析 Agent',
    desc: '自然语言查询数据库，自动生成报表。',
    disabled: true,
    prompt: '你是一个数据分析师...',
    knowledgeBase: ['SQL查询手册', '数据可视化指南']
  },
  {
    id: 'finance-qa',
    title: '财务数据中心问答',
    desc: '基于 RAG 技术的财务知识库问答，精准检索财务指标与政策。',
    disabled: false,
    prompt: `作为一名'财务数据中台'专家，你融合了策略中台产品经理、数据产品经理、数据架构师和财务经理的多重身份。你的目标是为用户提供具有技术深度和商业洞察力的专业建议，尤其是在电商和财务会计领域。
目标：
* 帮助用户构建高效、准确的财务数据中台体系。
* 解答关于电商业务架构、标准工作流程（SOP）以及财务会计准则的复杂问题。
* 将复杂的数据架构和财务逻辑转化为易于理解的策略和执行方案。

行为准则：
1) 专业性与严谨性：
a) 保持审慎态度，不盲从用户观点，在必要时指出用户逻辑中的潜在风险或错误。
b) 避免阿谀奉承，以中立、客观且专业的语气进行沟通。
c) 确保提供的财务会计知识符合通用会计准则和电商行业最佳实践。

2) 深度解析与通俗化：
a) 在解释技术名词（如ETL、数据建模、财务分摊逻辑）时，使用通俗易懂的类比。
b) 针对电商场景（如OMS、WMS、支付网关与财务系统的对接），提供具体的流程建议。
c) 在给出解决方案时，平衡技术可行性与商业成本效益。

3) 沟通风格：
a) 采用清晰、有逻辑性的分点陈述方式。`,
    knowledgeBase: ['财务数据中台数据蓝图9.3','财务数据中台数据建模与规范','财务数据中台数据建模核心原则与最佳实践', '数据中台命名规范']
  }
]

// 根据路由参数获取当前 Agent
const currentAgent = computed(() => {
  const id = route.query.id
  if (!id) return null
  return agentsConfig.find(agent => agent.id === id) || null
})

// 监听 currentAgent 变化，更新面包屑
watch(currentAgent, (newAgent) => {
  if (newAgent) {
    setBreadcrumbExtra([{ label: newAgent.title }])
  } else {
    setBreadcrumbExtra([])
  }
}, { immediate: true })

const handleCardClick = (agent) => {
  if (!agent.disabled) {
    router.push({ query: { id: agent.id } })
  }
}

const copyPrompt = async () => {
  if (currentAgent.value?.prompt) {
    try {
      await navigator.clipboard.writeText(currentAgent.value.prompt)
      Message.success('Prompt 已复制到剪贴板')
    } catch (err) {
      Message.error('复制失败')
    }
  }
}

// 组件卸载时清除面包屑
onUnmounted(() => {
  setBreadcrumbExtra([])
})
</script>

<template>
  <div class="page-container">
    <!-- 列表页 -->
    <div v-if="!currentAgent" class="list-view">
      <div class="page-header">
        <h2 class="page-title">智能体广场</h2>
        <p class="description">探索并使用 AI Agent，体验自动化的工作流程。</p>
      </div>
      
      <div class="card-grid">
        <div 
          v-for="(agent, index) in agentsConfig" 
          :key="agent.id || index" 
          class="card"
          :class="{ 'is-disabled': agent.disabled }"
          @click="handleCardClick(agent)"
        >
          <div class="card-header">
            <h3>{{ agent.title }}</h3>
            <div v-if="agent.disabled" class="status-tag">维护中</div>
          </div>
          <p class="card-desc">{{ agent.desc }}</p>
          <div class="card-footer">
            <span class="action-text" v-if="!agent.disabled">立即使用 &rarr;</span>
            <LockIcon v-else :size="16" class="lock-icon" />
          </div>
        </div>
      </div>
    </div>

    <!-- 详情页 -->
    <div v-else class="detail-view">
      <!-- 移除本地面包屑，使用 Layout 面包屑 -->
      
      <div class="detail-header">
        <h2>{{ currentAgent.title }}</h2>
        <p>{{ currentAgent.desc }}</p>
      </div>

      <div class="detail-content">
        <div class="info-section">
          <div class="section-title-row">
            <div class="section-title">
              <TerminalIcon :size="20" />
              <h3>Prompt (提示词)</h3>
            </div>
            <button class="copy-btn" @click="copyPrompt" title="复制 Prompt">
              <CopyIcon :size="16" />
              <span>复制</span>
            </button>
          </div>
          <div class="info-box prompt-box">
            {{ currentAgent.prompt }}
          </div>
        </div>

        <div class="info-section">
          <div class="section-title">
            <BookOpenIcon :size="20" />
            <h3>知识库</h3>
          </div>
          <div class="info-box kb-box">
            <ul v-if="Array.isArray(currentAgent.knowledgeBase)">
              <li v-for="(item, idx) in currentAgent.knowledgeBase" :key="idx">{{ item }}</li>
            </ul>
            <p v-else>{{ currentAgent.knowledgeBase }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 12px;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.description {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.card:not(.is-disabled) {
  cursor: pointer;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
}

.card:not(.is-disabled):hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-color: #10b981;
}

.card.is-disabled {
  background-color: #f8fafc;
  cursor: not-allowed;
  opacity: 0.8;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.4;
}

.status-tag {
  font-size: 12px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
  margin-left: 12px;
}

.card-desc {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
  font-size: 14px;
  flex: 1;
  margin-bottom: 20px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: auto;
}

.action-text {
  font-size: 14px;
  font-weight: 500;
  color: #10b981;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.card:hover .action-text {
  opacity: 1;
  transform: translateX(0);
}

.lock-icon {
  color: #94a3b8;
}

/* Detail View Styles */
.detail-view {
  animation: fadeIn 0.3s ease;
}

.breadcrumb-container {
  margin-bottom: 24px;
}

.breadcrumb-link {
  cursor: pointer;
  color: #64748b;
}

.breadcrumb-link:hover {
  color: #10b981;
}

.detail-header {
  margin-bottom: 32px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 24px;
}

.detail-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px 0;
}

.detail-header p {
  color: #64748b;
  font-size: 16px;
  margin: 0;
}

.detail-content {
  display: grid;
  gap: 32px;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #0f172a;
}

.section-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

.info-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  color: #334155;
  line-height: 1.6;
}

.prompt-box {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  background-color: #1e293b;
  color: #e2e8f0;
  border-color: #334155;
  white-space: pre-wrap;
}

.kb-box ul {
  margin: 0;
  padding-left: 20px;
}

.kb-box li {
  margin-bottom: 8px;
}

.kb-box li:last-child {
  margin-bottom: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
