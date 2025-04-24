<template>
  <div class="flex flex-col">
    <!-- Header section with title and actions -->
    <div
      class="list-header"
    >
      <h2 class="list-title">
        <i class="ri-task-line"></i>
        任务管理
      </h2>

      <div class="flex flex-wrap gap-3">
        <!-- Batch operations buttons -->
        <div v-if="selectedTasks.length > 0" class="flex gap-3 animate-fadeIn">
          <button
            @click="handleBatchStart"
            class="btn-success"
          >
            <i class="ri-play-line mr-2"></i>
            批量启动 ({{ selectedTasks.length }})
          </button>
          <button
            @click="handleBatchStop"
            class="btn-warning"
          >
            <i class="ri-stop-line mr-2"></i>
            批量终止 ({{ selectedTasks.length }})
          </button>
          <button
            @click="handleBatchDelete"
            class="btn-danger"
          >
            <i class="ri-delete-bin-line mr-2"></i>
            批量删除 ({{ selectedTasks.length }})
          </button>
        </div>

        <!-- Refresh button -->
        <button
          @click="$emit('refresh-tasks')"
          class="btn-default"
        >
          <i class="ri-refresh-line mr-2"></i>
          刷新列表
        </button>
      </div>
    </div>

    <!-- Task data section -->
    <div
      v-if="tasks?.length > 0"
      class="bg-white/80 rounded-xl border border-light-border overflow-hidden shadow-light-card"
    >
      <!-- Responsive table with horizontal scrolling -->
      <div class="overflow-x-auto scrollbar-thin">
        <table class="task-table">
          <!-- Table header -->
          <thead class="bg-light-bg">
            <tr>
              <th class="table-header w-[60px]">
                <div class="flex items-center justify-center">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                    class="checkbox-input"
                  />
                </div>
              </th>
              <th class="table-header">任务ID</th>
              <th class="table-header">描述</th>
              <th class="table-header">目标</th>
              <th class="table-header">状态</th>
              <th class="table-header">创建时间</th>
              <th class="table-header">完成时间</th>
              <th class="table-header">结果</th>
              <th class="table-header">操作</th>
            </tr>
          </thead>

          <!-- Table body -->
          <tbody>
            <tr
              v-for="task in tasks"
              :key="task.id"
              class="border-t border-light-border hover:bg-light-bg-active transition-all duration-200"
            >
              <td class="table-cell w-[60px]">
                <div class="flex items-center justify-center">
                  <input
                    type="checkbox"
                    v-model="selectedTasks"
                    :value="task.id"
                    class="checkbox-input"
                  />
                </div>
              </td>
              <td
                class="table-cell w-[120px] whitespace-nowrap font-mono text-xs"
              >
                {{ task.id }}
              </td>
              <td class="table-cell w-[140px] whitespace-nowrap">
                <div class="flex items-center">
                  <i
                    :class="getTypeIcon(task.type)"
                    class="mr-2 text-primary"
                  ></i>
                  {{ formatDescription(task.type) }}
                </div>
              </td>
              <td
                class="table-cell w-[180px] max-w-[180px]"
              >
                <div class="tooltip truncate" :data-tooltip="task.payload">
                  {{ task.payload }}
                </div>
              </td>
              <td class="table-cell w-[100px]">
                <span class="status-badge" :class="getStatusStyle(task.status)">
                  <i :class="getStatusIcon(task.status)" class="mr-1"></i>
                  {{ formatStatus(task.status) }}
                </span>
              </td>
              <td class="table-cell w-[160px] whitespace-nowrap">
                {{ formatDate(task.created_at) }}
              </td>
              <td class="table-cell w-[160px] whitespace-nowrap text-light-text-disabled">
                {{ task.completed_at ? formatDate(task.completed_at) : "—" }}
              </td>
              <td class="table-cell min-w-[120px] max-w-[200px]">
                <span
                  v-if="task.result"
                  class="tooltip"
                  :data-tooltip="task.result"
                >
                  {{ truncateText(task.result, 20) }}
                </span>
                <span v-else class="text-light-text-disabled">—</span>
              </td>
              <td class="table-cell w-[160px] whitespace-nowrap">
                <div class="flex gap-2">
                  <button
                    @click="$emit('toggle-task', task)"
                    :disabled="task.status === 'running'"
                    class="task-button"
                    :class="
                      task.status === 'running'
                        ? 'bg-light-bg text-light-text-disabled cursor-not-allowed'
                        : 'bg-primary/10 hover:bg-primary/20 text-primary'
                    "
                  >
                    <i
                      :class="
                        task.status === 'running'
                          ? 'ri-loader-2-line animate-spin'
                          : 'ri-play-line'
                      "
                    ></i>
                    {{ task.status === "running" ? "运行中" : "启动" }}
                  </button>
                  <button
                    @click="$emit('stop-task', task)"
                    :disabled="task.status !== 'running'"
                    class="task-button"
                    :class="
                      task.status !== 'running'
                        ? 'bg-light-bg text-light-text-disabled cursor-not-allowed'
                        : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-600'
                    "
                  >
                    <i class="ri-stop-line"></i>
                    终止
                  </button>
                  <button
                    @click="handleDelete(task.id)"
                    class="task-button bg-red-50 hover:bg-red-100 text-red-600"
                  >
                    <i class="ri-delete-bin-line"></i>
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty state with improved visuals -->
    <div
      v-else
      class="empty-state bg-white/80 rounded-xl border border-light-border shadow-light-card my-4"
    >
      <div class="p-6 rounded-full bg-light-bg mb-6">
        <i class="ri-file-list-3-line empty-state-icon"></i>
      </div>
      <span class="text-xl font-medium text-light-text-primary mb-3">暂无任务</span>
      <p class="empty-state-text max-w-md px-4">
        当前还没有创建任何扫描任务，可以在右方创建或前往综合扫描添加
      </p>
      <div class="flex gap-4">
        <router-link to="/under-development">
          <button
            class="empty-state-button" 
          >
            <i class="ri-focus-3-line mr-2"></i>
            综合扫描
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TaskList",
  props: {
    tasks: {
      type: Array,
      required: true,
      default: () => [], // 提供一个默认的空数组
    },
  },
  data() {
    return {
      selectedTasks: [],
    };
  },
  computed: {
    isAllSelected() {
      // 首先检查 tasks 是否存在且是数组
      if (!this.tasks || !Array.isArray(this.tasks)) {
        return false;
      }
      return (
        this.tasks.length > 0 && this.selectedTasks.length === this.tasks.length
      );
    },
  },
  methods: {
    formatStatus(status) {
      const statusMap = {
        running: "运行中",
        completed: "已完成",
        pending: "等待中",
      };
      return statusMap[status] || "未知状态";
    },
    getStatusStyle(status) {
      const styleMap = {
        running: "status-running",
        completed: "status-completed",
        pending: "status-pending",
        failed: "status-failed"
      };
      return styleMap[status] || "bg-light-bg text-light-text-secondary";
    },
    getStatusIcon(status) {
      const iconMap = {
        running: "ri-loader-2-line animate-spin",
        completed: "ri-check-line",
        pending: "ri-time-line",
      };
      return iconMap[status] || "ri-question-line";
    },
    getTypeIcon(type) {
      const iconMap = {
        subfinder: "ri-global-line",
        nmap: "ri-scan-2-line",
        ffuf: "ri-folders-line",
        gogo: "ri-bug-line",
      };
      return iconMap[type] || "ri-question-line";
    },
    formatDescription(type) {
      const descriptions = {
        subfinder: "子域名扫描",
        nmap: "端口扫描",
        ffuf: "路径扫描",
        gogo: "漏洞扫描",
      };
      return descriptions[type] || "未知任务";
    },
    formatDate(date) {
      return new Date(date).toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    truncateText(text, maxLength) {
      if (!text) return "";
      return text.length > maxLength
        ? text.substring(0, maxLength) + "..."
        : text;
    },
    handleDelete(taskId) {
      this.$emit("delete-task", taskId);
    },
    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedTasks = [];
      } else {
        this.selectedTasks = this.tasks.map((task) => task.id);
      }
    },
    handleBatchStart() {
      this.$emit("batch-start", this.selectedTasks);
    },
    handleBatchStop() {
      this.$emit("batch-stop", this.selectedTasks);
    },
    handleBatchDelete() {
      this.$emit("batch-delete", this.selectedTasks);
      this.selectedTasks = [];
    },
  },
};
</script>

<style scoped>
/* Table styling */
.table-header {
  @apply text-left py-3 px-4 text-xs font-medium text-light-text-secondary sticky top-0;
}

.table-cell {
  @apply py-3 px-4 text-sm text-light-text-primary;
}

/* Checkbox styling */
.checkbox-input {
  @apply rounded-md border-light-border bg-white text-primary
  focus:ring-primary/30 transition-all duration-200 cursor-pointer h-4 w-4;
}

/* Task buttons */
.task-button {
  @apply px-2 py-1 rounded-md text-xs font-medium transition-all duration-200
  focus:outline-none focus:ring-1 flex items-center gap-1 shadow-sm;
}

/* 列表控制按钮组 */
.control-buttons {
  @apply flex space-x-2;
}

.control-buttons button {
  @apply px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
  focus:outline-none flex items-center;
}

/* 标准按钮样式 */
.btn-default {
  @apply bg-white/80 text-light-text-secondary border border-light-border hover:bg-white hover:text-primary px-4 py-2 rounded-lg shadow-sm;
}

/* 成功按钮样式 */
.btn-success {
  @apply bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg shadow-sm;
}

/* 警告按钮样式 */
.btn-warning {
  @apply bg-yellow-50 text-yellow-600 hover:bg-yellow-100 px-4 py-2 rounded-lg shadow-sm;
}

/* 危险按钮样式 */
.btn-danger {
  @apply bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg shadow-sm;
}

.list-header {
  @apply flex flex-col md:flex-row md:items-center justify-between mb-4 pb-2 border-b border-light-border;
}

.list-title {
  @apply flex items-center text-lg font-medium text-light-text-primary;
}

.list-title i {
  @apply text-primary mr-2;
}

/* 表格样式 */
.task-table {
  @apply w-full text-left;
}

.task-table thead th {
  @apply py-3 px-4 text-xs font-medium text-light-text-secondary;
}

.task-table tbody tr {
  @apply border-t border-light-border hover:bg-light-bg-active transition-colors duration-200;
}

.task-table tbody td {
  @apply py-3 px-4 text-sm text-light-text-primary;
}

/* 状态标签 */
.status-badge {
  @apply inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap min-w-[80px];
}

.status-completed {
  @apply bg-green-50 text-green-600 border border-green-100;
}

.status-running {
  @apply bg-primary/10 text-primary border border-primary/20;
}

.status-failed {
  @apply bg-red-50 text-red-600 border border-red-100;
}

.status-pending {
  @apply bg-yellow-50 text-yellow-600 border border-yellow-100;
}

/* Tooltip */
.tooltip {
  @apply relative cursor-help;
}

.tooltip:hover::after {
  content: attr(data-tooltip);
  @apply absolute left-0 top-full mt-1 p-2 bg-white text-light-text-primary text-xs rounded-md z-10
  whitespace-pre-wrap break-all w-max max-w-[300px] shadow-light-dropdown border border-light-border;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}

/* 滚动条美化 */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

/* 空状态提示 */
.empty-state {
  @apply flex flex-col items-center justify-center py-16 text-center;
}

.empty-state-icon {
  @apply text-light-text-disabled text-5xl;
}

.empty-state-text {
  @apply text-light-text-secondary mb-6;
}

.empty-state-button {
  @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors duration-200 shadow-light-card;
}
</style>
