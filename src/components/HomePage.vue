<template>
  <div
    class="bg-light-gradient text-light-text-primary flex flex-col min-h-screen"
  >
    <div class="container mx-auto px-6 pt-6 pb-20 flex-1">
      <!-- 欢迎信息区域 - 移除底部线条，改用更精致的设计 -->
      <div class="text-center mb-16 relative">
        <div
          class="absolute inset-0 bg-gradient-to-r from-primary/5 via-blue-500/5 to-primary/5 blur-3xl -z-10"
        ></div>
        <h1 class="text-4xl font-medium mb-4 tracking-tight text-light-text-primary">
          YangMiee 攻击面梳理平台
        </h1>
        <p
          class="text-lg text-light-text-secondary font-light tracking-wide max-w-2xl mx-auto"
        >
          简单、高效、专业的资产扫描工具
        </p>

        <!-- 添加行动按钮 -->
        <div class="mt-8 flex justify-center space-x-4">
          <button
            class="px-6 py-2.5 bg-primary hover:bg-primary-light rounded-lg shadow-light-card transition-all duration-300 text-sm font-medium flex items-center text-white"
          >
            <i class="ri-rocket-line mr-2"></i>
            开始使用
          </button>
          <button
            class="px-6 py-2.5 bg-white/80 hover:bg-white/90 border border-light-border rounded-lg shadow-light-card transition-all duration-300 text-sm font-medium flex items-center"
          >
            <i class="ri-information-line mr-2"></i>
            了解更多
          </button>
        </div>
      </div>

      <!-- 功能分类标题 - 重新设计，移除底部线条 -->
      <div class="mb-8 text-center">
        <h2
          class="text-xl font-medium tracking-wide text-light-text-primary inline-flex items-center"
        >
          <span
            class="bg-white/50 h-8 w-8 rounded-lg flex items-center justify-center mr-2"
          >
            <i class="ri-apps-line text-primary"></i>
          </span>
          主要功能
        </h2>
      </div>

      <!-- 功能卡片网格 - 优化布局和动效 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(card, index) in cards"
          :key="index"
          class="feature-card group relative"
        >
          <!-- 背景光晕效果 -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-primary/5 group-hover:to-primary/10 transition-all duration-500 rounded-2xl"
          ></div>

          <div class="flex items-start space-x-4 relative z-10">
            <div class="feature-icon-wrapper">
              <i :class="card.icon" class="feature-icon"></i>
            </div>
            <div class="flex-1">
              <h3
                class="text-base font-medium tracking-wide group-hover:text-primary-dark transition-colors duration-300"
              >
                {{ card.title }}
              </h3>
              <p
                class="text-light-text-secondary text-sm leading-relaxed mt-2 group-hover:text-light-text-primary transition-colors duration-300"
              >
                {{ card.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加底部技术特点部分 - 重新设计标题 -->
      <div
        class="mt-16 bg-white/70 backdrop-blur-lg p-8 rounded-2xl border border-light-border shadow-light-card"
      >
        <h2
          class="text-xl font-medium tracking-wide text-light-text-primary mb-6 text-center flex items-center justify-center"
        >
          <span
            class="bg-white/80 h-8 w-8 rounded-lg flex items-center justify-center mr-2"
          >
            <i class="ri-line-chart-line text-primary"></i>
          </span>
          技术优势
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div
            v-for="(stat, index) in stats"
            :key="index"
            class="text-center p-4 rounded-lg bg-white/60 hover:bg-white/90 transition-all duration-300 border border-light-border shadow-light-card"
          >
            <div class="text-2xl font-bold text-primary mb-2">
              {{ stat.value }}
            </div>
            <div class="text-sm text-light-text-secondary">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref } from "vue";

const cards = ref([
  {
    icon: "ri-radar-line",
    title: "资产发现",
    description: "快速准确的子域名扫描，全面掌握数字资产分布。",
  },
  {
    icon: "ri-scan-2-line",
    title: "端口扫描",
    description: "高效的端口检测，精准识别开放服务和组件。",
  },
  {
    icon: "ri-folders-line",
    title: "路径扫描",
    description: "深度探索网站结构，发现隐藏资源和目录。",
  },
  {
    icon: "ri-fingerprint-line",
    title: "指纹识别",
    description: "准确识别技术组件和版本，提供详细分析。",
  },
  {
    icon: "ri-bug-line",
    title: "漏洞扫描",
    description: "检测常见安全漏洞，提前发现潜在风险。",
  },
  {
    icon: "ri-shield-keyhole-line",
    title: "漏洞利用",
    description: "验证漏洞可利用性，评估实际安全风险。",
  },
  {
    icon: "ri-dashboard-3-line",
    title: "可视化面板",
    description: "直观的数据展示，清晰的扫描进度管理。",
  },
  {
    icon: "ri-task-line",
    title: "任务管理",
    description: "灵活的任务调度系统，高效利用资源。",
  },
  {
    icon: "ri-settings-3-line",
    title: "系统配置",
    description: "全面的配置选项，按需调整扫描参数。",
  },
]);

// 新增技术指标数据
const stats = ref([
  { value: "99.8%", label: "扫描准确率" },
  { value: "2000+", label: "并发扫描能力" },
  { value: "15+", label: "集成工具" },
  { value: "24/7", label: "全天候运行" },
]);
</script>

<style scoped>
/* 功能卡片样式 */
.feature-card {
  @apply bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-light-card hover:shadow-light-dropdown transition-all duration-300 ease-out border border-light-border;
  transform: translateY(0);
}

.feature-card:hover {
  @apply bg-white/80 border-primary/20;
  transform: translateY(-2px);
}

/* 图标样式 */
.feature-icon-wrapper {
  @apply flex-shrink-0 p-2.5 bg-primary/10 rounded-lg;
}

.feature-icon {
  @apply text-xl text-primary group-hover:text-primary-dark transition-colors duration-300;
}

/* 添加波纹动画效果 */
@keyframes pulse-border {
  0% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.1);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
  }
}

.feature-card:hover .feature-icon-wrapper {
  animation: pulse-border 2s infinite;
}

/* 按钮悬停效果 */
button:active {
  transform: scale(0.98);
}

/* 整体渐变光效 */
.container {
  position: relative;
}

.container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  background: radial-gradient(
    circle at 50% 0%,
    rgba(24, 144, 255, 0.08),
    transparent 70%
  );
}
</style>
