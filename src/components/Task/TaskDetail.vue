<template>
  <div v-if="selectedTask" class="task-detail">
    <!-- 任务状态标题栏 -->
    <div class="status-header" :class="taskStatusClass">
      <div class="flex items-center">
        <i :class="taskStatusIcon" class="text-xl mr-2"></i>
        <div>
          <h3 class="text-lg font-medium">{{ selectedTask.id }}</h3>
          <div class="text-sm opacity-90 flex items-center">
            <span>{{ taskStatusText }}</span>
            <i v-if="taskInProgress" class="ri-loader-4-line ml-2 animate-spin"></i>
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <button
          @click="handleRestartTask"
          class="action-btn restart-btn"
          v-tooltip="'重新启动任务'"
        >
          <i class="ri-restart-line"></i>
        </button>
        <button
          @click="handleDeleteTask"
          class="action-btn delete-btn"
          v-tooltip="'删除任务'"
        >
          <i class="ri-delete-bin-line"></i>
        </button>
        <button
          @click="$emit('close-detail')"
          class="action-btn close-btn"
          v-tooltip="'关闭详情'"
        >
          <i class="ri-close-line"></i>
        </button>
      </div>
    </div>

    <!-- 任务信息 -->
    <div class="info-section">
      <div class="info-item">
        <div class="info-label">
          <i class="ri-calendar-line text-light-text-secondary mr-1.5"></i>
          创建时间
        </div>
        <div class="info-value">{{ formatDate(selectedTask.created_at) }}</div>
      </div>

      <div class="info-item">
        <div class="info-label">
          <i class="ri-bar-chart-horizontal-line text-light-text-secondary mr-1.5"></i>
          任务类型
        </div>
        <div class="info-value">
          <span class="task-type-badge" :class="getTaskTypeClass(selectedTask.type)">
            <i :class="getTaskTypeIcon(selectedTask.type)" class="mr-1"></i>
            {{ getTaskTypeName(selectedTask.type) }}
          </span>
        </div>
      </div>

      <div class="info-item">
        <div class="info-label">
          <i class="ri-global-line text-light-text-secondary mr-1.5"></i>
          目标
        </div>
        <div class="info-value">
          <code class="target-code">{{ selectedTask.payload }}</code>
        </div>
      </div>
    </div>

    <!-- 任务结果 -->
    <div class="result-section">
      <div class="result-header">
        <div class="flex items-center">
          <i class="ri-file-list-3-line text-primary mr-2"></i>
          <h3 class="text-base font-medium text-light-text-primary">任务结果</h3>
        </div>
        <div class="flex items-center space-x-2">
          <span
            class="text-xs text-light-text-secondary flex items-center"
            v-if="selectedTask.results && selectedTask.results.length > 0"
          >
            <i class="ri-bookmark-line mr-1"></i>
            共 {{ selectedTask.results.length }} 项结果
          </span>
          <button
            @click="handleExportResults"
            class="export-btn"
            v-if="selectedTask.results && selectedTask.results.length > 0"
            v-tooltip="'导出结果'"
          >
            <i class="ri-download-line mr-1"></i>
            导出
          </button>
        </div>
      </div>

      <div v-if="!selectedTask.results || selectedTask.results.length === 0" class="no-results">
        <div class="flex flex-col items-center justify-center py-10">
          <i class="ri-file-search-line text-4xl text-light-text-disabled mb-3"></i>
          <p class="text-light-text-secondary">
            {{ taskInProgress ? "任务正在执行中，请等待结果..." : "暂无任务结果" }}
          </p>
          <button
            v-if="!taskInProgress && selectedTask.status !== 'success'"
            @click="handleRestartTask"
            class="mt-4 btn-primary-outline"
          >
            <i class="ri-restart-line mr-1"></i>
            重新启动任务
          </button>
        </div>
      </div>

      <div v-else class="results-container">
        <div class="results-list">
          <div
            v-for="(result, index) in selectedTask.results"
            :key="index"
            class="result-item"
          >
            <template v-if="selectedTask.type === 'subfinder'">
              <div class="text-light-text-primary font-mono">{{ result }}</div>
            </template>
            
            <template v-else-if="selectedTask.type === 'nmap'">
              <div class="flex justify-between w-full">
                <div class="font-mono text-light-text-primary">{{ result.port }}</div>
                <div class="text-light-text-secondary">{{ result.service }}</div>
              </div>
            </template>
            
            <template v-else-if="selectedTask.type === 'ffuf'">
              <div class="flex justify-between w-full">
                <div class="font-mono text-light-text-primary truncate flex-1 mr-3">
                  {{ result.path }}
                </div>
                <div class="text-light-text-secondary whitespace-nowrap">
                  {{ result.status_code }}
                  <span 
                    class="ml-1 px-1.5 py-0.5 text-xs rounded" 
                    :class="getStatusCodeClass(result.status_code)"
                  >
                    {{ getStatusCodeText(result.status_code) }}
                  </span>
                </div>
              </div>
            </template>
            
            <template v-else-if="selectedTask.type === 'gogo'">
              <div class="w-full">
                <div class="flex justify-between mb-1">
                  <div class="font-medium text-light-text-primary">{{ result.title }}</div>
                  <div
                    class="ml-2 px-1.5 py-0.5 text-xs rounded-full"
                    :class="getVulnSeverityClass(result.severity)"
                  >
                    {{ result.severity }}
                  </div>
                </div>
                <div class="text-sm text-light-text-secondary mb-1">
                  {{ result.description || "无描述" }}
                </div>
                <div class="flex justify-between text-xs font-mono">
                  <div class="text-light-text-disabled">{{ result.target }}</div>
                  <div
                    v-if="result.remediation"
                    @click="showRemediationInfo(result)"
                    class="text-primary cursor-pointer hover:underline"
                  >
                    查看修复建议
                  </div>
                </div>
              </div>
            </template>
            
            <template v-else>
              <div class="text-light-text-primary">{{ JSON.stringify(result) }}</div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="no-task-selected">
    <div class="flex flex-col items-center justify-center py-20">
      <i class="ri-file-list-3-line text-6xl text-light-text-disabled mb-4"></i>
      <p class="text-lg text-light-text-secondary mb-2">未选择任务</p>
      <p class="text-sm text-light-text-disabled">请从左侧列表中选择一个任务查看详情</p>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { useNotification } from "../../composables/useNotification";

export default {
  name: "TaskDetail",
  props: {
    selectedTask: {
      type: Object,
      default: null
    }
  },
  setup(props, { emit }) {
    const { showSuccess, showError, showInfo } = useNotification();

    // 状态计算属性
    const taskStatusText = computed(() => {
      if (!props.selectedTask) return "";
      
      const statusMap = {
        "pending": "等待执行",
        "running": "正在执行",
        "success": "执行成功",
        "failed": "执行失败"
      };
      
      return statusMap[props.selectedTask.status] || props.selectedTask.status;
    });

    const taskStatusIcon = computed(() => {
      if (!props.selectedTask) return "";
      
      const iconMap = {
        "pending": "ri-time-line",
        "running": "ri-loader-4-line",
        "success": "ri-check-line",
        "failed": "ri-error-warning-line"
      };
      
      return iconMap[props.selectedTask.status] || "ri-question-line";
    });

    const taskStatusClass = computed(() => {
      if (!props.selectedTask) return "";
      
      const classMap = {
        "pending": "bg-yellow-50 text-yellow-600",
        "running": "bg-primary/10 text-primary",
        "success": "bg-green-50 text-green-600",
        "failed": "bg-red-50 text-red-600"
      };
      
      return classMap[props.selectedTask.status] || "bg-gray-50 text-gray-600";
    });

    const taskInProgress = computed(() => {
      return props.selectedTask && (props.selectedTask.status === "pending" || props.selectedTask.status === "running");
    });

    // 任务类型相关
    const getTaskTypeName = (type) => {
      const typeMap = {
        "subfinder": "子域名扫描",
        "nmap": "端口扫描",
        "ffuf": "路径扫描",
        "gogo": "漏洞扫描"
      };
      return typeMap[type] || type;
    };

    const getTaskTypeIcon = (type) => {
      const iconMap = {
        "subfinder": "ri-global-line",
        "nmap": "ri-scan-2-line",
        "ffuf": "ri-folders-line",
        "gogo": "ri-bug-line"
      };
      return iconMap[type] || "ri-question-line";
    };

    const getTaskTypeClass = (type) => {
      const classMap = {
        "subfinder": "bg-blue-500/10 text-blue-500 border-blue-500/30",
        "nmap": "bg-purple-500/10 text-purple-500 border-purple-500/30",
        "ffuf": "bg-orange-500/10 text-orange-500 border-orange-500/30",
        "gogo": "bg-red-500/10 text-red-500 border-red-500/30"
      };
      return classMap[type] || "bg-gray-500/10 text-gray-500 border-gray-500/30";
    };

    // HTTP状态码相关
    const getStatusCodeClass = (code) => {
      if (code >= 200 && code < 300) {
        return "bg-green-500/20 text-green-500";
      } else if (code >= 300 && code < 400) {
        return "bg-blue-500/20 text-blue-500";
      } else if (code >= 400 && code < 500) {
        return "bg-orange-500/20 text-orange-500";
      } else if (code >= 500) {
        return "bg-red-500/20 text-red-500";
      }
      return "bg-gray-500/20 text-gray-500";
    };

    const getStatusCodeText = (code) => {
      if (code >= 200 && code < 300) {
        return "成功";
      } else if (code >= 300 && code < 400) {
        return "重定向";
      } else if (code >= 400 && code < 500) {
        return "客户端错误";
      } else if (code >= 500) {
        return "服务器错误";
      }
      return "未知";
    };

    // 漏洞严重程度相关
    const getVulnSeverityClass = (severity) => {
      const severityMap = {
        "严重": "bg-red-500/20 text-red-500",
        "高危": "bg-orange-500/20 text-orange-500",
        "中危": "bg-yellow-500/20 text-yellow-500",
        "低危": "bg-blue-500/20 text-blue-500",
        "信息": "bg-gray-500/20 text-gray-500",
      };
      return severityMap[severity] || "bg-gray-500/20 text-gray-500";
    };

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return "未知时间";
      const date = new Date(dateString);
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    };

    // 处理任务操作
    const handleRestartTask = () => {
      if (!props.selectedTask) return;
      emit("restart-task", props.selectedTask.id);
      showInfo(`正在重新启动任务: ${props.selectedTask.id}`);
    };

    const handleDeleteTask = () => {
      if (!props.selectedTask) return;
      if (confirm(`确定要删除任务 ${props.selectedTask.id} 吗？`)) {
        emit("delete-task", props.selectedTask.id);
        showSuccess(`已删除任务: ${props.selectedTask.id}`);
      }
    };

    const handleExportResults = () => {
      if (!props.selectedTask || !props.selectedTask.results) return;
      
      try {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(props.selectedTask.results, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `task-${props.selectedTask.id}-results.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showSuccess("结果已导出");
      } catch (error) {
        showError("导出失败: " + error.message);
      }
    };

    const showRemediationInfo = (result) => {
      alert(`修复建议：\n${result.remediation || "暂无修复建议"}`);
    };

    return {
      taskStatusText,
      taskStatusIcon,
      taskStatusClass,
      taskInProgress,
      getTaskTypeName,
      getTaskTypeIcon,
      getTaskTypeClass,
      getStatusCodeClass,
      getStatusCodeText,
      getVulnSeverityClass,
      formatDate,
      handleRestartTask,
      handleDeleteTask,
      handleExportResults,
      showRemediationInfo
    };
  }
};
</script>

<style scoped>
.task-detail {
  @apply h-full flex flex-col;
  min-height: 0;
}

.status-header {
  @apply flex justify-between items-center p-4 rounded-lg mb-4;
}

.action-btn {
  @apply p-2 rounded-full transition-all duration-200 flex items-center justify-center;
  @apply hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20;
}

.restart-btn {
  @apply hover:text-primary;
}

.delete-btn {
  @apply hover:text-red-600;
}

.close-btn {
  @apply hover:text-light-text-primary;
}

.info-section {
  @apply bg-white/80 rounded-lg p-4 mb-4 shadow-sm;
}

.info-item {
  @apply flex flex-col py-2 border-b border-light-border last:border-none;
}

.info-label {
  @apply text-sm text-light-text-secondary flex items-center mb-1;
}

.info-value {
  @apply text-light-text-primary;
}

.task-type-badge {
  @apply inline-flex items-center px-2 py-1 text-sm rounded-md border;
}

.target-code {
  @apply font-mono bg-light-bg-active px-2 py-1 rounded text-sm break-all;
}

.result-section {
  @apply bg-white/80 rounded-lg flex-1 flex flex-col shadow-sm overflow-hidden;
  min-height: 0;
}

.result-header {
  @apply flex justify-between items-center p-4 border-b border-light-border;
}

.export-btn {
  @apply text-xs bg-primary/10 text-primary px-2 py-1 rounded
  hover:bg-primary/20 transition-colors duration-200 flex items-center;
}

.no-results {
  @apply flex-1 flex items-center justify-center text-light-text-disabled;
}

.results-container {
  @apply flex-1 overflow-hidden;
}

.results-list {
  @apply h-full overflow-y-auto p-4;
}

.result-item {
  @apply p-3 rounded-lg mb-2 bg-light-bg flex items-center;
  @apply hover:bg-light-bg-active transition-colors duration-200;
  @apply border border-light-border/50;
}

.no-task-selected {
  @apply h-full flex items-center justify-center;
}

.btn-primary-outline {
  @apply px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
  bg-primary/10 text-primary border border-primary/20
  hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/30
  flex items-center;
}
</style> 