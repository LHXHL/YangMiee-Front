<template>
  <PageContainer>
    <!-- 任务管理面板 -->
    <div
      class="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-light-card border border-light-border"
    >
      <!-- 任务管理概览 -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-light-text-primary flex items-center">
          <i class="ri-task-line mr-3 text-primary"></i>
          任务管理中心
        </h1>
        <button
          @click="handleRefreshTasks"
          class="px-4 py-2 rounded-xl text-sm font-medium bg-white/80 hover:bg-white/90 text-light-text-secondary hover:text-primary transition-all duration-200 flex items-center border border-light-border shadow-light-card"
        >
          <i class="ri-refresh-line mr-2"></i>
          刷新任务
        </button>
      </div>

      <!-- 卡片布局：左侧任务列表，右侧创建表单 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧任务列表区域 -->
        <div class="lg:col-span-2">
          <div
            class="bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-light-card border border-light-border h-full"
          >
            <TaskList
              :tasks="tasks"
              @toggle-task="toggleTask"
              @stop-task="stopTask"
              @delete-task="handleDelete"
              @refresh-tasks="handleRefreshTasks"
              @batch-start="handleBatchStart"
              @batch-stop="handleBatchStop"
              @batch-delete="handleBatchDelete"
            />
          </div>
        </div>

        <!-- 右侧任务创建表单 -->
        <div class="lg:col-span-1">
          <div
            class="bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-light-card border border-light-border sticky top-24"
          >
            <div class="flex items-center mb-4">
              <i class="ri-add-circle-line mr-2 text-primary text-xl"></i>
              <h2 class="text-lg font-medium text-light-text-primary">创建新任务</h2>
            </div>
            <TaskForm @create-task="createTask" />
          </div>
        </div>
      </div>

      <!-- 快捷操作浮动按钮 -->
      <div class="fixed bottom-6 right-6 flex flex-col space-y-3">
        <button
          @click="scrollToTop"
          class="w-12 h-12 rounded-full bg-primary/90 hover:bg-primary text-white flex items-center justify-center shadow-light-dropdown transition-all duration-200 hover:transform hover:scale-105"
          title="返回顶部"
        >
          <i class="ri-arrow-up-line text-xl"></i>
        </button>
        <button
          @click="scrollToForm"
          class="w-12 h-12 rounded-full bg-primary/90 hover:bg-primary text-white flex items-center justify-center shadow-light-dropdown transition-all duration-200 hover:transform hover:scale-105"
          title="创建任务"
        >
          <i class="ri-add-line text-xl"></i>
        </button>
      </div>
    </div>

    <!-- 通知组件 -->
    <PopupNotification
      v-if="showNotification"
      :message="notificationMessage"
      :type="notificationType"
      @close="showNotification = false"
    />

    <!-- 确认对话框 -->
    <ConfirmDialog
      :show="showDialog"
      :title="dialogTitle"
      :message="dialogMessage"
      :confirmText="confirmText"
      :cancelText="cancelText"
      :type="dialogType"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </PageContainer>
</template>

<script>
import { ref, onMounted } from "vue";
import PageContainer from "../Utils/PageContainer.vue";
import PopupNotification from "../Utils/PopupNotification.vue";
import ConfirmDialog from "../Utils/ConfirmDialog.vue";
import api from "../../api/axiosInstance";
import { useNotification } from "../../composables/useNotification";
import { useConfirmDialog } from "../../composables/useConfirmDialog";
import TaskList from "./TaskList.vue";
import TaskForm from "./TaskForm.vue";

export default {
  name: "TaskManagement",
  components: {
    PageContainer,
    PopupNotification,
    ConfirmDialog,
    TaskList,
    TaskForm,
  },
  setup() {
    const tasks = ref([]);
    const isLoading = ref(false);

    const {
      showNotification,
      notificationMessage,
      notificationType,
      showSuccess,
      showError,
    } = useNotification();

    const {
      showDialog,
      dialogTitle,
      dialogMessage,
      dialogType,
      confirm,
      handleConfirm,
      handleCancel,
    } = useConfirmDialog();

    // 获取任务列表
    const fetchTasks = async () => {
      try {
        isLoading.value = true;
        const response = await api.get("/tasks");
        tasks.value = response.data;
      } catch (error) {
        showError("获取任务列表失败");
      } finally {
        isLoading.value = false;
      }
    };

    // 创建任务
    const createTask = async (taskData) => {
      try {
        const response = await api.post("/tasks", taskData);

        if (response.data && response.data.id) {
          // 避免完全刷新列表，只添加新任务
          tasks.value.unshift(response.data);
          showSuccess("已创建新任务");

          // 滚动到顶部查看新任务
          setTimeout(() => scrollToTop(), 300);
        } else {
          await fetchTasks(); // 备用：如果响应格式不一致则刷新整个列表
          showSuccess("已创建新任务");
        }
      } catch (error) {
        showError(error.response?.data?.message || "创建任务失败");
      }
    };

    // 切换单个任务状态
    const toggleTask = async (task) => {
      try {
        const response = await api.post("/tasks/start", {
          taskIds: [task.id],
        });
        const result = response.data.result;

        // 乐观更新UI
        const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
        if (taskIndex !== -1) {
          tasks.value[taskIndex].status = "running";
        }

        if (result.success.includes(task.id)) {
          showSuccess("已启动任务");
        } else {
          const errorMsg = result.failed[task.id] || "启动失败";
          showError(`启动任务失败: ${errorMsg}`);
          await fetchTasks(); // 恢复实际状态
        }
      } catch (error) {
        showError("启动任务失败");
        await fetchTasks(); // 恢复实际状态
      }
    };

    // 终止单个任务
    const stopTask = async (task) => {
      try {
        const response = await api.post("/tasks/stop", {
          taskIds: [task.id],
        });
        const result = response.data.result;

        // 乐观更新UI
        const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
        if (taskIndex !== -1) {
          tasks.value[taskIndex].status = "pending";
        }

        if (result.success.includes(task.id)) {
          showSuccess("已终止任务");
        } else {
          const errorMsg = result.failed[task.id] || "终止失败";
          showError(`终止任务失败: ${errorMsg}`);
          await fetchTasks(); // 恢复实际状态
        }
      } catch (error) {
        showError("终止任务失败");
        await fetchTasks(); // 恢复实际状态
      }
    };

    // 删除单个任务
    const handleDelete = async (taskId) => {
      try {
        const confirmed = await confirm({
          title: "确认删除",
          message: `是否确认删除任务 ${taskId}？此操作不可撤销。`,
          type: "danger",
        });

        if (confirmed) {
          // 乐观更新UI
          tasks.value = tasks.value.filter((task) => task.id !== taskId);

          const response = await api.delete("/tasks", {
            data: { taskIds: [taskId] },
          });
          const result = response.data.result;

          if (result.success.includes(taskId)) {
            showSuccess("已删除任务");
          } else {
            const errorMsg = result.failed[taskId] || "删除失败";
            showError(`删除任务失败: ${errorMsg}`);
            await fetchTasks(); // 恢复实际状态
          }
        }
      } catch (error) {
        showError("删除任务失败");
        await fetchTasks(); // 恢复实际状态
      }
    };

    // 批量启动任务
    const handleBatchStart = async (taskIds) => {
      if (taskIds.length === 0) {
        showError("请选择要启动的任务");
        return;
      }

      try {
        const confirmed = await confirm({
          title: "确认批量启动",
          message: `是否确认启动选中的 ${taskIds.length} 个任务？`,
          type: "warning",
        });

        if (confirmed) {
          // 乐观更新UI
          tasks.value = tasks.value.map((task) => {
            if (taskIds.includes(task.id)) {
              return { ...task, status: "running" };
            }
            return task;
          });

          const response = await api.post("/tasks/start", { taskIds });
          const result = response.data.result;

          if (result.success.length > 0) {
            showSuccess(`成功启动 ${result.success.length} 个任务`);
          }

          if (Object.keys(result.failed).length > 0) {
            showError(`${Object.keys(result.failed).length} 个任务启动失败`);
            await fetchTasks(); // 恢复实际状态
          }
        }
      } catch (error) {
        showError("批量启动任务失败");
        await fetchTasks(); // 恢复实际状态
      }
    };

    // 批量终止任务
    const handleBatchStop = async (taskIds) => {
      if (taskIds.length === 0) {
        showError("请选择要终止的任务");
        return;
      }

      try {
        const confirmed = await confirm({
          title: "确认批量终止",
          message: `是否确认终止选中的 ${taskIds.length} 个任务？`,
          type: "warning",
        });

        if (confirmed) {
          // 乐观更新UI
          tasks.value = tasks.value.map((task) => {
            if (taskIds.includes(task.id)) {
              return { ...task, status: "pending" };
            }
            return task;
          });

          const response = await api.post("/tasks/stop", { taskIds });
          const result = response.data.result;

          if (result.success.length > 0) {
            showSuccess(`成功终止 ${result.success.length} 个任务`);
          }

          if (Object.keys(result.failed).length > 0) {
            showError(`${Object.keys(result.failed).length} 个任务终止失败`);
            await fetchTasks(); // 恢复实际状态
          }
        }
      } catch (error) {
        showError("批量终止任务失败");
        await fetchTasks(); // 恢复实际状态
      }
    };

    // 批量删除任务
    const handleBatchDelete = async (taskIds) => {
      if (taskIds.length === 0) {
        showError("请选择要删除的任务");
        return;
      }

      try {
        const confirmed = await confirm({
          title: "确认批量删除",
          message: `是否确认删除选中的 ${taskIds.length} 个任务？此操作不可撤销。`,
          type: "danger",
        });

        if (confirmed) {
          // 乐观更新UI
          tasks.value = tasks.value.filter(
            (task) => !taskIds.includes(task.id)
          );

          const response = await api.delete("/tasks", {
            data: { taskIds },
          });
          const result = response.data.result;

          if (result.success.length > 0) {
            showSuccess(`成功删除 ${result.success.length} 个任务`);
          }

          if (Object.keys(result.failed).length > 0) {
            showError(`${Object.keys(result.failed).length} 个任务删除失败`);
            await fetchTasks(); // 恢复实际状态
          }
        }
      } catch (error) {
        showError("批量删除任务失败");
        await fetchTasks(); // 恢复实际状态
      }
    };

    // 刷新任务列表
    const handleRefreshTasks = async () => {
      try {
        await fetchTasks();
        showSuccess("已刷新任务列表");
      } catch (error) {
        showError("刷新任务列表失败");
      }
    };

    // 滚动到顶部
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    // 滚动到表单
    const scrollToForm = () => {
      const formElement = document.querySelector(".sticky");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth" });
      }
    };

    onMounted(fetchTasks);

    return {
      tasks,
      isLoading,
      showNotification,
      notificationMessage,
      notificationType,
      showDialog,
      dialogTitle,
      dialogMessage,
      dialogType,
      handleConfirm,
      handleCancel,
      confirmText: "确认",
      cancelText: "取消",
      createTask,
      toggleTask,
      stopTask,
      handleDelete,
      handleRefreshTasks,
      handleBatchStart,
      handleBatchStop,
      handleBatchDelete,
      scrollToTop,
      scrollToForm,
    };
  },
};
</script>

<style scoped>
.backdrop-blur-xl {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* 滚动平滑效果 */
html {
  scroll-behavior: smooth;
}

/* 卡片悬停效果 */
.bg-white\/70 {
  transition: transform 0.3s, box-shadow 0.3s;
}

.bg-white\/70:hover {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

/* 浮动按钮动画 */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
  }
}

.fixed button {
  animation: pulse 2s infinite;
}
</style>
