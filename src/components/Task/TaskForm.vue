<template>
  <!-- 标题和说明 -->
  <div class="mb-6">
    <h2 class="text-lg font-medium text-light-text-primary flex items-center">
      <i class="ri-add-line mr-2 text-primary"></i>
      创建任务
    </h2>
    <p class="text-sm text-light-text-secondary mt-1">填写以下信息以创建新的扫描任务</p>
  </div>

  <div class="space-y-6">
    <!-- 选择任务类型 -->
    <div class="form-group">
      <label class="form-label flex items-center">
        <i class="ri-bar-chart-horizontal-line mr-1.5"></i>
        任务类型
      </label>
      <div class="relative">
        <select
          v-model="newTaskType"
          class="form-select pl-10"
        >
          <option value="" disabled>选择任务类型</option>
          <option
            v-for="(label, value) in taskTypes"
            :key="value"
            :value="value"
          >
            {{ label }}
          </option>
        </select>
        <div
          class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
        >
          <i :class="getTaskTypeIcon(newTaskType)" class="text-light-text-secondary text-lg"></i>
        </div>
      </div>
      <div class="form-hint" v-if="newTaskType">
        {{ getTaskTypeDescription(newTaskType) }}
      </div>
    </div>

    <!-- 输入目标地址 -->
    <div class="form-group">
      <label class="form-label flex items-center">
        <i class="ri-focus-3-line mr-1.5"></i>
        目标地址
      </label>
      <div class="relative">
        <input
          v-model="newTaskAddress"
          type="text"
          :placeholder="getAddressPlaceholder(newTaskType)"
          class="form-input pl-10"
        />
        <div
          class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
        >
          <i class="ri-global-line text-light-text-secondary text-lg"></i>
        </div>
      </div>
    </div>

    <!-- 创建按钮 -->
    <button
      @click="handleCreateTask"
      :disabled="!isValidInput"
      class="submit-button group w-full"
      :class="!isValidInput ? 'opacity-60 cursor-not-allowed' : ''"
    >
      <i
        class="ri-add-circle-line mr-2 group-hover:animate-pulse"
        v-if="isValidInput"
      ></i>
      <i class="ri-error-warning-line mr-2" v-else></i>
      {{ isValidInput ? "创建任务" : "请完善任务信息" }}
    </button>
  </div>

  <!-- 任务类型快速选择 -->
  <div class="mt-8 pt-6 border-t border-light-border">
    <p class="text-sm text-light-text-secondary mb-4">快速选择任务类型:</p>
    <div class="grid grid-cols-3 gap-3">
      <button
        v-for="(label, value) in taskTypes"
        :key="value"
        @click="selectTaskType(value)"
        class="type-button flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200"
        :class="
          newTaskType === value
            ? 'bg-primary/10 border-primary/30 text-primary'
            : 'bg-white border-light-border text-light-text-secondary hover:bg-light-bg-active'
        "
      >
        <i :class="getTaskTypeIcon(value)" class="text-xl mb-2"></i>
        <span class="text-xs font-medium">{{ label }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useNotification } from "../../composables/useNotification";

export default {
  name: "TaskForm",
  setup(props, { emit }) {
    // 使用通知钩子
    const { showSuccess, showError } = useNotification();

    // 表单数据
    const newTaskType = ref("");
    const newTaskAddress = ref("");

    // 任务类型选项
    const taskTypes = {
      subfinder: "子域名扫描",
      nmap: "端口扫描",
      ffuf: "路径扫描",
      gogo: "漏洞扫描",
    };

    // 获取任务类型图标
    const getTaskTypeIcon = (type) => {
      const icons = {
        subfinder: "ri-global-line",
        nmap: "ri-scan-2-line",
        ffuf: "ri-folders-line",
        gogo: "ri-bug-line",
        "": "ri-question-line",
      };
      return icons[type] || "ri-question-line";
    };

    // 获取任务类型描述
    const getTaskTypeDescription = (type) => {
      const descriptions = {
        subfinder: "扫描目标域名的所有子域名，帮助发现攻击面",
        nmap: "扫描目标主机开放的端口和服务信息",
        ffuf: "对Web应用进行路径扫描，发现隐藏资源",
        gogo: "对目标进行漏洞扫描，发现安全漏洞",
      };
      return descriptions[type] || "";
    };

    // 获取地址输入框的占位文本
    const getAddressPlaceholder = (type) => {
      const placeholders = {
        subfinder: "example.com",
        nmap: "192.168.1.1 或 example.com",
        ffuf: "https://example.com/",
        gogo: "10.8.1.1 or 10.8.1.0/24",
        "": "输入目标地址",
      };
      return placeholders[type] || "输入目标地址";
    };

    // 选择任务类型
    const selectTaskType = (type) => {
      newTaskType.value = type;
    };

    // 输入验证
    const isValidInput = computed(() => {
      return (
        newTaskType.value.trim() !== "" && newTaskAddress.value.trim() !== ""
      );
    });

    // 创建任务处理
    const handleCreateTask = () => {
      if (!isValidInput.value) {
        showError("请填写完整信息");
        return;
      }

      try {
        emit("create-task", {
          type: newTaskType.value,
          payload: newTaskAddress.value,
        });

        // 重置表单
        newTaskType.value = "";
        newTaskAddress.value = "";

        showSuccess("任务已创建");
      } catch (error) {
        showError("创建任务失败");
      }
    };

    return {
      newTaskType,
      newTaskAddress,
      taskTypes,
      isValidInput,
      handleCreateTask,
      getTaskTypeIcon,
      getTaskTypeDescription,
      getAddressPlaceholder,
      selectTaskType,
    };
  },
};
</script>

<style scoped>
.type-button {
  transition: transform 0.2s, box-shadow 0.2s;
}

.type-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.type-button:active {
  transform: translateY(0);
}

/* 表单分组 */
.form-group {
  @apply mb-4;
}

/* 表单标签 */
.form-label {
  @apply block text-sm font-medium text-light-text-secondary mb-1.5;
}

/* 表单输入框 */
.form-input {
  @apply w-full px-3 py-2 bg-white border border-light-border rounded-lg text-light-text-primary
  placeholder-light-text-disabled focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30
  transition-all duration-200;
  padding-left: 2.5rem;
}

/* 表单选择器 */
.form-select {
  @apply w-full px-3 py-2 bg-white border border-light-border rounded-lg text-light-text-primary
  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30
  transition-all duration-200 cursor-pointer appearance-none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  padding-left: 2.5rem;
}

/* 提交按钮 */
.submit-button {
  @apply px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
  bg-primary text-white hover:bg-primary-light 
  focus:ring-2 focus:ring-primary/40 shadow-light-card focus:outline-none flex items-center justify-center;
}

/* 表单提示信息 */
.form-hint {
  @apply text-light-text-disabled text-xs mt-1;
}

/* 按钮按下效果 */
.submit-button:active:not(:disabled) {
  transform: scale(0.98);
}
</style>
