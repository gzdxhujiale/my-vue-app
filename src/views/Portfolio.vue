<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  BriefcaseIcon, SchoolIcon, MailIcon, CopyIcon, CheckIcon, MapPinIcon,
  BotIcon, LayoutGridIcon, FileEditIcon, TargetIcon, ZapIcon, LayersIcon,
  AlertCircleIcon, BrainIcon, UserCheckIcon, CpuIcon, TrendingDownIcon,
  CheckCircleIcon, ArrowRightIcon, BookOpenIcon
} from 'lucide-vue-next'

const router = useRouter()
const emailCopied = ref(false)
const revealedElements = ref(new Set())

// 作品交付物（首页三卡）
const deliverables = [
  {
    tag: '作品集', tagColor: 'indigo',
    icon: LayoutGridIcon,
    title: '高保真原型图',
    desc: '可交互原型演示与信息架构，突出流程闭环与可用性。',
    tags: ['信息架构', '交互流程', '高保真页面'],
    footer: { icon: ArrowRightIcon, text: '查看原型演示' },
    path: '/finance'
  },
  {
    tag: '作品集', tagColor: 'slate',
    icon: FileEditIcon,
    title: 'PRD 文档',
    desc: '需求背景、目标、方案与验收口径，强调可落地与可衡量。',
    tags: ['需求拆解', '验收标准', '数据口径'],
    footer: { icon: AlertCircleIcon, text: '维护中' },
    path: 'https://baidu.com',
    disabled: true
  },
  {
    tag: '作品集', tagColor: 'emerald',
    icon: BotIcon,
    title: 'AI Agent',
    desc: 'AI Agent / 自动化方案演示，体现提效与流程重构能力。',
    tags: ['AI Agent', '工作流', 'AI coding'],
    footer: { icon: ArrowRightIcon, text: '查看应用列表' },
    path: '/ai'
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
      { value: '76.7%', label: '重复工作自动化' },
      { value: '23.5%', label: '人力成本降低' },
      { value: '+70%', label: '客服人效提升' },
      { value: '30min', label: '响应时效 (原24h)' }
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
      { value: '99%', label: '数据准确率' },
      { value: '83.3%', label: '报表效率提升' },
      { value: 'T+1', label: '数据时效性' },
      { value: '10+个', label: '指标统一' }
    ]
  }
]

// 自我评价
const selfEvaluations = [
  { icon: BrainIcon, title: '结构化思维', text: '擅长拆解复杂跨部门问题，精准抽象痛点。' },
  { icon: ZapIcon, title: '高度自驱', text: '主动深入业务一线，推动方案从0到1闭环落地。' },
  { icon: TargetIcon, title: '结果导向', text: '聚焦量化成果，用数据证明价值。' }
]

// 产品方法论
const methodologies = {
  design: ['RICE模型', 'KANO模型', 'MVP思维'],
  tech: ['敏捷开发', '数据治理', 'A/B测试']
}

// 技能栈
const skills = {
  design: ['Axure', 'Figma'],
  tech: ['SQL', 'Python', 'Excel', 'Tableau']
}

const copyEmail = () => {
  navigator.clipboard.writeText('2063994160@qq.com')
  emailCopied.value = true
  setTimeout(() => { emailCopied.value = false }, 2000)
}

const navigateToDeliverable = (item) => {
  if (item.disabled) {
    alert('维护中，暂时不可查看')
    return
  }
  if (item?.path) {
    if (item.path.startsWith('http')) {
      window.open(item.path, '_blank')
    } else {
      router.push(item.path)
    }
  }
}

const scrollToSection = (id) => {
  const element = document.querySelector(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
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
          <a href="#deliverables" @click.prevent="scrollToSection('#deliverables')">作品集</a>
          <a href="#projects" @click.prevent="scrollToSection('#projects')">项目经历</a>
          <a href="#skills" @click.prevent="scrollToSection('#skills')">专业技能</a>
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
          <img src="/hjl.png" alt="胡家乐" class="avatar" />
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
      <!-- 作品交付物（优先展示） -->
      <section id="deliverables" class="competency-section reveal" data-reveal-id="competency">
        <div class="competency-grid">
          <div
            v-for="(item, index) in deliverables"
            :key="index"
            class="competency-card clickable"
            :class="`card-${item.tagColor}`"
            @click="navigateToDeliverable(item)"
          >
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

      <!-- 双栏布局 -->
      <div class="two-column">
        <!-- 左栏：项目经验 -->
        <div id="projects" class="left-column">
          <h2 class="section-title reveal" data-reveal-id="projects-title">
            <BriefcaseIcon :size="20" /> 核心项目经验
          </h2>
          
          <article v-for="(project, index) in projects" :key="index" class="project-card reveal" :class="`border-${project.roleColor}`" :data-reveal-id="`project-${index}`">
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
                <div class="metric-value" :class="`text-${project.roleColor}`">{{ m.value }}</div>
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
          <div class="side-card reveal" data-reveal-id="methodologies">
            <h3><BookOpenIcon :size="20" /> 产品方法论</h3>
            <div class="skill-group">
              <h4>产品设计</h4>
              <div class="skill-tags">
                <span v-for="item in methodologies.design" :key="item">{{ item }}</span>
              </div>
            </div>
            <div class="skill-group">
              <h4>数据 & 技术</h4>
              <div class="skill-tags">
                <span v-for="item in methodologies.tech" :key="item">{{ item }}</span>
              </div>
            </div>
          </div>

          <div id="skills" class="side-card reveal" data-reveal-id="skills">
            <h3><CpuIcon :size="20" /> 技术栈</h3>
            <div class="skill-group">
              <h4>产品设计</h4>
              <div class="skill-tags">
                <span v-for="skill in skills.design" :key="skill">{{ skill }}</span>
              </div>
            </div>
            <div class="skill-group">
              <h4>数据分析与可视化</h4>
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
  margin-top: 0.5rem;
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
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.hero-tag-btn {
  cursor: pointer;
  color: white;
}
.hero-tag-btn:hover { 
  background: rgba(255,255,255,0.25);
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}
.hero-tag-btn.copied {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.3);
}
.hero-tag:not(.hero-tag-btn):hover {
  background: rgba(255,255,255,0.25);
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
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
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 10px 30px -5px rgba(0,0,0,0.08);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
.competency-card.clickable { cursor: pointer; }
.competency-card:hover {
  transform: translateY(-5px);
}
.card-indigo:hover { border-color: #818cf8; box-shadow: 0 20px 40px -5px rgba(79, 70, 229, 0.15); }
.card-blue:hover { border-color: #60a5fa; box-shadow: 0 20px 40px -5px rgba(37, 99, 235, 0.15); }
.card-emerald:hover { border-color: #34d399; box-shadow: 0 20px 40px -5px rgba(5, 150, 105, 0.15); }

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
.tag-emerald { background: #e8fff3; color: #047857; }
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
.text-purple { color: #9333ea; }
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
  background: #f8fafc;
  margin: 1rem -1.25rem -1.25rem;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #f1f5f9;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.2s;
}
.competency-card:hover .competency-footer {
  background: #f1f5f9;
  color: #334155;
}
.footer-icon { color: #94a3b8; transition: transform 0.2s; }
.competency-card:hover .footer-icon { transform: translateX(4px); color: inherit; }

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
  border-left: 4px solid transparent;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  padding: 1.25rem;
  transition: all 0.3s;
}
.border-blue { border-left-color: #3b82f6; }
.border-purple { border-left-color: #9333ea; }
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
  margin-bottom: 0.125rem;
  transition: transform 0.2s;
}
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
