<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  BriefcaseIcon, SchoolIcon, MailIcon, CopyIcon, CheckIcon, MapPinIcon,
  BotIcon, DatabaseIcon, GitMergeIcon, LayoutGridIcon, BarChartBigIcon,
  GitForkIcon, AppWindowIcon, FileEditIcon, TargetIcon, ZapIcon, LayersIcon,
  AlertCircleIcon, BrainIcon, UserCheckIcon, CpuIcon, TrendingDownIcon,
  CheckCircleIcon, CodeIcon, LockIcon
} from 'lucide-vue-next'

const router = useRouter()
const emailCopied = ref(false)
const activeFilter = ref('all')
const revealedElements = ref(new Set())

// 作品展示数据
const showcaseItems = [
  { id: 1, title: '财务数据中心', desc: '数据中台', icon: BarChartBigIcon, color: 'indigo', category: 'b-side', path: '/finance' },
  { id: 2, title: 'AI智能助手', desc: 'AI Agent搭建', icon: BotIcon, color: 'emerald', category: 'ai', path: null },
  { id: 3, title: '思维导图软件', desc: '效率工具', icon: GitForkIcon, color: 'amber', category: 'tools', path: null },
  { id: 4, title: '窗口控制器', desc: '交互组件', icon: AppWindowIcon, color: 'purple', category: 'tools', path: null },
  { id: 5, title: '文档编辑器', desc: 'AI写作', icon: FileEditIcon, color: 'rose', category: 'tools', path: null }
]

// 核心竞争力数据
const competencies = [
  {
    tag: 'AI 技术边界与落地', tagColor: 'blue',
    icon: BotIcon, title: 'RPA+AI 智能客服',
    desc: '熟悉 LLM/RPA 边界，设计低代码自动化方案，实现客服工单自动分流与处理。',
    metric: '70', metricUnit: '%', metricLabel: '客服日均处理量提升',
    footer: { icon: TrendingDownIcon, text: '人力成本降低 23.5%' }
  },
  {
    tag: '数据洞察与 ROI', tagColor: 'indigo',
    icon: DatabaseIcon, title: '财务数据中台',
    desc: '拒绝虚荣指标，构建以 ROI 为核心的监控体系，打通业财数据孤岛，赋能决策。',
    metric: '4', metricUnit: '小时', metricLabel: '报表生成时效 (原3天)',
    footer: { icon: CheckCircleIcon, text: '数据准确率达 99%' }
  },
  {
    tag: '业务流程重构', tagColor: 'slate',
    icon: GitMergeIcon, title: '标准化方法论',
    desc: '深度拆解复杂业务痛点，运用 RICE 模型定优劣，将非标线下业务抽象为标准化产品。',
    tags: ['闭环思维', '结果导向'],
    footer: { icon: CodeIcon, text: 'Axure / Python / SQL' }
  }
]

// 项目经验数据
const projects = [
  {
    title: 'RPA+AI 智能客服助手',
    role: '策略中台产品经理', roleColor: 'blue',
    type: 'AI功能产品',
    date: '2025.08 - 2025.11',
    tags: ['RICE模型', 'AI Agent', '飞书多维表', '影刀RPA'],
    highlightColor: 'blue',
    highlights: [
      { icon: TargetIcon, label: '痛点', text: '商品部与客服部因"缺货通知滞后"导致协作摩擦，客户投诉频发。通过 RICE 模型定性为一级痛点。' },
      { icon: ZapIcon, label: '方案', text: '搭建聚水潭到飞书的数据管道，利用 RPA 抓取订单，AI 识别意图并智能分流。' }
    ],
    metrics: [
      { value: '30min', label: '响应时效 (原24h)' },
      { value: '+70%', label: '客服人效提升' },
      { value: '76.7%', label: '重复工作自动化' },
      { value: '23.5%', label: '人力成本降低' }
    ]
  },
  {
    title: '财务数据中心与 BI 系统',
    role: '中台产品经理', roleColor: 'purple',
    type: '数据产品',
    date: '2025.01 - 2025.07',
    tags: ['数据仓库', '星型模型', 'ETL管道', 'BI看板'],
    highlightColor: 'purple',
    highlights: [
      { icon: AlertCircleIcon, label: '痛点', text: '公司扩张期面临数据"不可用、不好用、不被用"困境，决策缺乏支撑。' },
      { icon: LayersIcon, label: '方案', text: '构建从数仓建模、元规则 ETL 到前端看板的全链路体系，实现业财贯通。' }
    ],
    metrics: [
      { value: '83.3%', label: '报表效率提升' },
      { value: 'T+1', label: '数据时效性' },
      { value: '99%', label: '数据准确率' },
      { value: '2人', label: '人力节省' }
    ]
  }
]

// 自我评价
const selfEvaluations = [
  { icon: BrainIcon, title: '结构化思维', text: '擅长拆解复杂跨部门问题，精准抽象痛点。' },
  { icon: ZapIcon, title: '高度自驱', text: '主动深入业务一线，推动方案从0到1闭环落地。' },
  { icon: TargetIcon, title: '结果导向', text: '聚焦量化成果，用数据证明价值。' }
]

// 技能栈
const skills = {
  design: ['用户访谈', 'RICE模型', 'Axure/Figma', 'PRD文档'],
  tech: ['SQL/Python', 'Tableau', '数据仓库', 'RPA+AI']
}

const copyEmail = () => {
  navigator.clipboard.writeText('2063994160@qq.com')
  emailCopied.value = true
  setTimeout(() => { emailCopied.value = false }, 2000)
}

const filterProjects = (category) => {
  activeFilter.value = category
}

const filteredShowcase = () => {
  if (activeFilter.value === 'all') return showcaseItems
  return showcaseItems.filter(item => item.category === activeFilter.value)
}

const navigateToProject = (item) => {
  if (item.path) {
    router.push(item.path)
  }
}

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealedElements.value.add(entry.target.dataset.revealId)
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
  
  document.querySelectorAll('[data-reveal-id]').forEach(el => observer.observe(el))
})
</script>


<template>
  <div class="portfolio-page">
    <!-- 导航栏 -->
    <nav class="nav-bar">
      <div class="nav-content">
        <div class="nav-logo">
          <span class="logo-icon"><BriefcaseIcon :size="16" /></span>
          胡家乐 Portfolio
        </div>
        <div class="nav-links">
          <a href="#showcase">作品展示</a>
          <a href="#projects">项目经历</a>
          <a href="#skills">专业技能</a>
        </div>
      </div>
    </nav>

    <!-- Hero 区域 -->
    <header class="hero-section">
      <div class="hero-glow"></div>
      <div class="hero-blob hero-blob-1"></div>
      <div class="hero-blob hero-blob-2"></div>
      
      <div class="hero-content">
        <div class="avatar-wrapper reveal" data-reveal-id="avatar">
          <img src="https://placehold.co/160x160/2563eb/ffffff?text=HJL" alt="胡家乐" class="avatar" />
        </div>
        <h1 class="hero-title reveal" data-reveal-id="title">胡家乐</h1>
        <p class="hero-subtitle reveal" data-reveal-id="subtitle">
          数据驱动 | 结果导向型产品经理
          <span class="hero-subtitle-sub">以数据洞察驱动决策，用 AI 技术重构流程</span>
        </p>
        <div class="hero-tags reveal" data-reveal-id="tags">
          <div class="hero-tag">
            <SchoolIcon :size="14" />
            广州大学 (2026届)
          </div>
          <button class="hero-tag hero-tag-btn" :class="{ copied: emailCopied }" @click="copyEmail">
            <MailIcon :size="14" />
            <span>{{ emailCopied ? '已复制!' : '2063994160@qq.com' }}</span>
            <component :is="emailCopied ? CheckIcon : CopyIcon" :size="12" class="copy-icon" />
          </button>
          <div class="hero-tag">
            <MapPinIcon :size="14" />
            北京
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 核心竞争力 -->
      <section class="competency-section reveal" data-reveal-id="competency">
        <div class="competency-grid">
          <div v-for="(item, index) in competencies" :key="index" class="competency-card">
            <span class="ability-tag" :class="`tag-${item.tagColor}`">{{ item.tag }}</span>
            <div class="competency-header">
              <div class="competency-icon" :class="`icon-${item.tagColor}`">
                <component :is="item.icon" :size="16" />
              </div>
              <h3>{{ item.title }}</h3>
            </div>
            <p class="competency-desc">{{ item.desc }}</p>
            
            <template v-if="item.metric">
              <div class="competency-metric">
                <span class="metric-value" :class="`text-${item.tagColor}`">{{ item.metric }}</span>
                <span class="metric-unit" :class="`text-${item.tagColor}-light`">{{ item.metricUnit }}</span>
              </div>
              <p class="metric-label">{{ item.metricLabel }}</p>
            </template>
            
            <div v-if="item.tags" class="competency-tags">
              <span v-for="tag in item.tags" :key="tag" class="small-tag">{{ tag }}</span>
            </div>
            
            <div class="competency-footer">
              <component :is="item.footer.icon" :size="12" class="footer-icon" />
              {{ item.footer.text }}
            </div>
          </div>
        </div>
      </section>

      <!-- 作品展示 -->
      <section id="showcase" class="showcase-section reveal" data-reveal-id="showcase">
        <div class="section-header">
          <h2><LayoutGridIcon :size="20" /> 作品集</h2> 
          <div class="filter-tabs">
            <button 
              v-for="tab in [{ key: 'all', label: '全部' }, { key: 'b-side', label: 'B端/数据' }, { key: 'ai', label: 'AI应用' }, { key: 'tools', label: '效率工具' }]"
              :key="tab.key"
              :class="['tab-btn', { active: activeFilter === tab.key }]"
              @click="filterProjects(tab.key)"
            >{{ tab.label }}</button>
          </div>
        </div>
        <div class="showcase-grid">
          <div 
            v-for="item in filteredShowcase()" 
            :key="item.id" 
            class="showcase-card"
            :class="{ clickable: item.path }"
            @click="navigateToProject(item)"
          >
            <div class="showcase-icon" :class="`icon-${item.color}`">
              <component :is="item.icon" :size="16" />
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
            <div v-if="!item.path" class="showcase-lock">
              <LockIcon :size="10" /> 敬请期待
            </div>
          </div>
        </div>
      </section>

      <!-- 双栏布局 -->
      <div class="two-column">
        <!-- 左栏：项目经验 -->
        <div id="projects" class="left-column">
          <h2 class="section-title reveal" data-reveal-id="projects-title">
            <BriefcaseIcon :size="20" /> 核心项目经验
          </h2>
          
          <article v-for="(project, index) in projects" :key="index" class="project-card reveal" :data-reveal-id="`project-${index}`">
            <div class="project-header">
              <div>
                <h3>{{ project.title }}</h3>
                <div class="project-meta">
                  <span class="role-tag" :class="`role-${project.roleColor}`">{{ project.role }}</span>
                  <span class="divider">|</span>
                  <span>{{ project.type }}</span>
                </div>
              </div>
              <span class="project-date">{{ project.date }}</span>
            </div>
            
            <div class="project-tags">
              <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
            
            <div class="project-highlights" :class="`highlight-${project.highlightColor}`">
              <p v-for="(h, i) in project.highlights" :key="i" class="highlight-item">
                <component :is="h.icon" :size="14" class="highlight-icon" />
                <span><strong>{{ h.label }}：</strong>{{ h.text }}</span>
              </p>
            </div>
            
            <div class="metrics-grid">
              <div v-for="(m, i) in project.metrics" :key="i" class="metric-box">
                <div class="metric-value">{{ m.value }}</div>
                <div class="metric-label">{{ m.label }}</div>
              </div>
            </div>
          </article>
        </div>

        <!-- 右栏：技能与评价 -->
        <div class="right-column">
          <!-- 自我评价 -->
          <div class="side-card reveal" data-reveal-id="evaluation">
            <h3><UserCheckIcon :size="20" /> 自我评价</h3>
            <div class="evaluation-list">
              <div v-for="(item, index) in selfEvaluations" :key="index" class="evaluation-item">
                <component :is="item.icon" :size="16" class="eval-icon" />
                <p><strong>{{ item.title }}：</strong>{{ item.text }}</p>
              </div>
            </div>
          </div>

          <!-- 技能栈 -->
          <div id="skills" class="side-card reveal" data-reveal-id="skills">
            <h3><CpuIcon :size="20" /> 技能栈</h3>
            <div class="skill-group">
              <h4>产品设计</h4>
              <div class="skill-tags">
                <span v-for="skill in skills.design" :key="skill">{{ skill }}</span>
              </div>
            </div>
            <div class="skill-group">
              <h4>数据 & 技术</h4>
              <div class="skill-tags">
                <span v-for="skill in skills.tech" :key="skill">{{ skill }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部 -->
    <footer class="footer">
      <p>&copy; 2025 胡家乐 Portfolio. Designed with Data-Driven Thinking.</p>
    </footer>
  </div>
</template>


<style scoped>
.portfolio-page {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', -apple-system, sans-serif;
}

/* 导航栏 */
.nav-bar {
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 50;
  padding: 1rem 0;
}
.nav-content {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255,255,255,0.9);
}
.nav-logo {
  font-weight: 700;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.logo-icon {
  background: rgba(255,255,255,0.1);
  padding: 0.375rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255,255,255,0.2);
  display: flex;
}
.nav-links {
  display: flex;
  gap: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
}
.nav-links a {
  color: rgba(255,255,255,0.9);
  text-decoration: none;
  transition: color 0.2s;
}
.nav-links a:hover { color: white; }

/* Hero 区域 */
.hero-section {
  background: radial-gradient(circle at 10% 20%, #2563eb 0%, #1e40af 100%);
  border-radius: 0 0 2.5rem 2.5rem;
  box-shadow: 0 20px 40px -10px rgba(30, 58, 138, 0.3);
  position: relative;
  overflow: visible;
  padding: 6rem 1rem 6rem;
  color: white;
}

.hero-glow {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 350px;
  background: radial-gradient(ellipse at center, rgba(96, 165, 250, 0.3) 0%, rgba(37, 99, 235, 0) 70%);
  pointer-events: none;
}
.hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(3rem);
  pointer-events: none;
}
.hero-blob-1 {
  top: 0; right: 0;
  width: 24rem; height: 24rem;
  background: rgba(96, 165, 250, 0.1);
  transform: translate(33%, -50%);
}
.hero-blob-2 {
  bottom: 0; left: 0;
  width: 16rem; height: 16rem;
  background: rgba(129, 140, 248, 0.1);
  transform: translate(-25%, 33%);
}
.hero-content {
  max-width: 56rem;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 10;
}
.avatar-wrapper {
  display: inline-block;
  padding: 0.375rem;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  margin-bottom: 1.25rem;
}
.avatar {
  width: 6rem; height: 6rem;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255,255,255,0.1);
}
.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
}
.hero-subtitle {
  font-size: 1.125rem;
  color: #bfdbfe;
  font-weight: 500;
  margin-bottom: 1.5rem;
}
.hero-subtitle-sub {
  display: block;
  font-size: 0.875rem;
  margin-top: 0.375rem;
  color: rgba(191, 219, 254, 0.8);
  font-weight: 400;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}
.hero-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.1);
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: 1px solid rgba(255,255,255,0.1);
  transition: background 0.2s;
}
.hero-tag-btn {
  cursor: pointer;
  color: white;
}
.hero-tag-btn:hover { background: rgba(255,255,255,0.15); }
.hero-tag-btn.copied {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.3);
}
.copy-icon { opacity: 0.6; }
.hero-tag-btn:hover .copy-icon { opacity: 1; }

/* 主内容区 */
.main-content {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem 3rem;
  position: relative;
  z-index: 20;
}

/* 核心竞争力 */
.competency-section {
  margin-top: -4rem;
  margin-bottom: 3rem;
}
.competency-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
@media (max-width: 768px) {
  .competency-grid { grid-template-columns: 1fr; }
}
.competency-card {
  background: rgba(255,255,255,0.98);
  border: 1px solid rgba(255,255,255,0.6);
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 10px 30px -5px rgba(0,0,0,0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}
.competency-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px -5px rgba(0,0,0,0.12);
}

.ability-tag {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  display: inline-block;
  margin-bottom: 0.5rem;
}
.tag-blue { background: #dbeafe; color: #1d4ed8; }
.tag-indigo { background: #e0e7ff; color: #4338ca; }
.tag-slate { background: #f1f5f9; color: #475569; }

.competency-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.competency-icon {
  width: 2rem; height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-blue { background: #eff6ff; color: #2563eb; }
.icon-indigo { background: #eef2ff; color: #4f46e5; }
.icon-slate { background: #f8fafc; color: #475569; }
.icon-emerald { background: #ecfdf5; color: #059669; }
.icon-amber { background: #fffbeb; color: #d97706; }
.icon-purple { background: #faf5ff; color: #9333ea; }
.icon-rose { background: #fff1f2; color: #e11d48; }

.competency-header h3 {
  font-weight: 700;
  font-size: 1rem;
  color: #1e293b;
}
.competency-desc {
  font-size: 0.75rem;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 1rem;
  flex-grow: 1;
}
.competency-metric {
  display: flex;
  align-items: baseline;
  margin-bottom: 0.25rem;
}
.metric-value {
  font-size: 1.875rem;
  font-weight: 700;
}
.metric-unit {
  font-size: 0.875rem;
  margin-left: 0.25rem;
  font-weight: 500;
}

.text-blue { color: #2563eb; }
.text-blue-light { color: #60a5fa; }
.text-indigo { color: #4f46e5; }
.text-indigo-light { color: #818cf8; }
.metric-label {
  font-size: 0.625rem;
  color: #94a3b8;
  margin-bottom: 0.75rem;
}
.competency-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  margin-top: 0.25rem;
}
.small-tag {
  padding: 0.25rem 0.5rem;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 0.25rem;
  font-size: 0.625rem;
  color: #64748b;
  font-weight: 500;
}
.competency-footer {
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
  margin-top: auto;
  font-size: 0.75rem;
  color: #475569;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}
.footer-icon { color: #22c55e; }

/* 作品展示 */
.showcase-section { margin-bottom: 2.5rem; }
.section-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding: 0 0.5rem;
  gap: 1rem;
}
.section-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.section-header h2 svg { color: #2563eb; }
.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tab-btn {
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn:hover { border-color: #2563eb; color: #2563eb; }
.tab-btn.active {
  background: #2563eb;
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
}
.showcase-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
}
@media (max-width: 1024px) {
  .showcase-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 640px) {
  .showcase-grid { grid-template-columns: repeat(2, 1fr); }
}
.showcase-card {
  background: white;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  text-align: center;
  transition: all 0.3s;
  position: relative;
}
.showcase-card.clickable { cursor: pointer; }
.showcase-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -5px rgba(0,0,0,0.08);
}
.showcase-card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  width: 100%; height: 3px;
  background: linear-gradient(to right, #2563eb, #4f46e5);
  transform: scaleX(0);
  transition: transform 0.4s;
  transform-origin: left;
}
.showcase-card:hover::after { transform: scaleX(1); }
.showcase-icon {
  width: 2.25rem; height: 2.25rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.5rem;
  transition: transform 0.3s;
}
.showcase-card:hover .showcase-icon { transform: scale(1.1); }

.showcase-card h3 {
  font-size: 0.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.125rem;
  transition: color 0.2s;
}
.showcase-card:hover h3 { color: #2563eb; }
.showcase-card p {
  font-size: 0.625rem;
  color: #94a3b8;
}
.showcase-lock {
  position: absolute;
  top: 0.5rem; right: 0.5rem;
  font-size: 0.5rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* 双栏布局 */
.two-column {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}
@media (max-width: 1024px) {
  .two-column { grid-template-columns: 1fr; }
}
.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding-left: 0.5rem;
}
.section-title svg { color: #2563eb; }

/* 项目卡片 */
.left-column { display: flex; flex-direction: column; gap: 1.25rem; }
.project-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid #f1f5f9;
  border-left: 4px solid #3b82f6;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  padding: 1.25rem;
  transition: all 0.3s;
}
.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -5px rgba(0,0,0,0.08);
}
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f8fafc;
}
.project-header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.project-meta {
  font-size: 0.75rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.role-tag {
  font-weight: 500;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}
.role-blue { background: #eff6ff; color: #2563eb; }
.role-purple { background: #faf5ff; color: #9333ea; }
.divider { color: #cbd5e1; }
.project-date {
  padding: 0.125rem 0.5rem;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.625rem;
  font-weight: 700;
  border-radius: 9999px;
  border: 1px solid #f1f5f9;
}
.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}
.tag {
  padding: 0.125rem 0.5rem;
  background: #f8fafc;
  color: #475569;
  font-size: 0.625rem;
  border-radius: 9999px;
  border: 1px solid #f1f5f9;
  font-weight: 500;
}
.project-highlights {
  border-radius: 0.5rem;
  padding: 0.875rem;
  margin-bottom: 1rem;
}
.highlight-blue {
  background: rgba(239, 246, 255, 0.4);
  border: 1px solid #bfdbfe;
}
.highlight-purple {
  background: rgba(250, 245, 255, 0.4);
  border: 1px solid #e9d5ff;
}
.highlight-item {
  font-size: 0.75rem;
  color: #334155;
  line-height: 1.6;
  display: flex;
  align-items: flex-start;
  gap: 0.375rem;
  margin-bottom: 0.375rem;
}
.highlight-item:last-child { margin-bottom: 0; }
.highlight-icon { flex-shrink: 0; margin-top: 0.125rem; }
.highlight-blue .highlight-icon { color: #3b82f6; }
.highlight-blue strong { color: #1e40af; }
.highlight-purple .highlight-icon { color: #a855f7; }
.highlight-purple strong { color: #7e22ce; }

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.625rem;
}
@media (max-width: 640px) {
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
}
.metric-box {
  background: linear-gradient(to bottom right, #f8fafc, #f1f5f9);
  padding: 0.625rem;
  border-radius: 0.5rem;
  text-align: center;
  border: 1px solid #f1f5f9;
  transition: border-color 0.2s;
}
.metric-box:hover { border-color: #bfdbfe; }
.metric-box .metric-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 0.125rem;
  transition: transform 0.2s;
}
.metric-box:hover .metric-value { transform: scale(1.1); }
.metric-box .metric-label {
  font-size: 0.625rem;
  color: #64748b;
  margin-bottom: 0;
}

/* 右栏卡片 */
.right-column { display: flex; flex-direction: column; gap: 1.25rem; }
.side-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  padding: 1.25rem;
  transition: all 0.3s;
}
.side-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -5px rgba(0,0,0,0.08);
}
.side-card h3 {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.side-card h3 svg { color: #2563eb; }
.evaluation-list { display: flex; flex-direction: column; gap: 0.75rem; }
.evaluation-item {
  display: flex;
  gap: 0.75rem;
}
.eval-icon { color: #94a3b8; flex-shrink: 0; margin-top: 0.125rem; }
.evaluation-item p {
  font-size: 0.75rem;
  color: #475569;
  line-height: 1.6;
}
.evaluation-item strong { color: #1e293b; }

.skill-group { margin-bottom: 1rem; }
.skill-group:last-child { margin-bottom: 0; }
.skill-group h4 {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}
.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.skill-tags span {
  background: #f8fafc;
  color: #334155;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.625rem;
  font-weight: 500;
  border: 1px solid #f1f5f9;
  transition: all 0.2s;
  cursor: default;
}
.skill-tags span:hover {
  border-color: #bfdbfe;
  color: #2563eb;
}

/* 底部 */
.footer {
  background: white;
  border-top: 1px solid #f1f5f9;
  padding: 2.5rem 1rem;
  text-align: center;
}
.footer p {
  font-size: 0.875rem;
  color: #94a3b8;
}

/* 动画 */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  filter: blur(5px);
  animation: fadeInUpBlur 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}
@keyframes fadeInUpBlur {
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}
</style>
