<template>
  <div class="bg-light-gradient text-light-text-primary flex flex-col min-h-screen">
    <div class="container mx-auto px-6 py-8 flex-1">
      <!-- 路径扫描结果面板 -->
      <div
        class="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-light-card border border-light-border"
      >
        <!-- 标题区域 -->
        <div
          class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
        >
          <div class="flex items-center">
            <div class="flex items-center">
              <div
                class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mr-3"
              >
                <i class="ri-folders-line text-blue-500 text-xl"></i>
              </div>
              <div>
                <h2 class="text-xl font-medium tracking-wide text-light-text-primary">
                  路径扫描结果
                </h2>
                <p class="text-sm text-light-text-secondary mt-1">管理和查看路径发现结果</p>
              </div>
            </div>
            <div
              class="ml-4 px-3 py-1 rounded-lg bg-light-bg text-light-text-primary text-sm flex items-center"
              :class="
                filteredResults.length > 0 ? 'bg-blue-500/10 text-blue-500' : ''
              "
            >
              <i class="ri-database-2-line mr-1.5"></i>
              {{ filteredResults.length }} 个结果
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="handleRefreshTasks"
              class="px-4 py-2.5 rounded-xl text-sm font-medium bg-light-bg hover:bg-light-bg-hover text-light-text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-light-border flex items-center justify-center"
            >
              <i class="ri-refresh-line mr-2"></i>
              刷新列表
            </button>

            <button
              @click="router.push('/task-management')"
              class="px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 flex items-center justify-center border border-blue-500/30"
            >
              <i class="ri-add-line mr-2"></i>
              新建扫描
            </button>
          </div>
        </div>

        <!-- 搜索和过滤栏 -->
        <div
          class="bg-light-bg p-4 rounded-xl mb-6 border border-light-border"
        >
          <div class="flex flex-col md:flex-row gap-4">
            <!-- 搜索框 -->
            <div class="flex-1 relative">
              <i class="ri-search-line absolute left-4 top-3 text-light-text-tertiary"></i>
              <input
                v-model.trim="searchQuery"
                type="text"
                placeholder="搜索目标地址..."
                class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-light-text-primary border border-light-border focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
              />
            </div>

            <div class="flex gap-4">
              <!-- 状态过滤下拉框 -->
              <div class="relative min-w-[140px]">
                <i
                  class="ri-filter-line absolute left-4 top-3 text-light-text-tertiary"
                ></i>
                <select
                  v-model="statusFilter"
                  class="w-full pl-10 pr-8 py-2.5 rounded-xl bg-white text-light-text-primary border border-light-border focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 appearance-none"
                >
                  <option value="">所有状态</option>
                  <option value="true">已读</option>
                  <option value="false">未读</option>
                </select>
                <i
                  class="ri-arrow-down-s-line absolute right-4 top-3 text-light-text-tertiary pointer-events-none"
                ></i>
              </div>

              <!-- 查询按钮 -->
              <button
                @click="handleSearch"
                class="px-4 py-2.5 rounded-xl text-sm font-medium bg-light-bg hover:bg-light-bg-hover text-light-text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-light-border flex items-center justify-center min-w-[100px]"
              >
                <i class="ri-search-line mr-2"></i>
                查询
              </button>
            </div>
          </div>

          <!-- 活跃过滤器提示 -->
          <div
            v-if="hasActiveFilters"
            class="flex items-center gap-2 mt-3 text-sm text-light-text-secondary"
          >
            <i class="ri-filter-3-line"></i>
            <span>已过滤: </span>
            <div
              v-if="searchQuery"
              class="px-2 py-0.5 bg-light-bg-hover rounded-md text-light-text-primary text-xs flex items-center"
            >
              搜索 "{{ searchQuery }}"
              <button
                @click="searchQuery = ''"
                class="ml-1 text-light-text-tertiary hover:text-light-text-secondary"
              >
                <i class="ri-close-line"></i>
              </button>
            </div>
            <div
              v-if="statusFilter"
              class="px-2 py-0.5 bg-light-bg-hover rounded-md text-light-text-primary text-xs flex items-center"
            >
              {{ statusFilter === "true" ? "已读" : "未读" }}
              <button
                @click="statusFilter = ''"
                class="ml-1 text-light-text-tertiary hover:text-light-text-secondary"
              >
                <i class="ri-close-line"></i>
              </button>
            </div>
            <button
              @click="clearFilters"
              class="ml-2 text-blue-500 hover:text-blue-600 text-xs underline"
            >
              清除全部
            </button>
          </div>
        </div>

        <!-- 路径扫描结果表格 -->
        <div
          class="bg-white/90 rounded-xl overflow-hidden border border-light-border shadow-sm"
          :class="{ 'opacity-50': isLoading }"
        >
          <PathScanTable
            :pathScanResults="filteredResults"
            :loading="isLoading"
            @view-details="handleViewDetails"
            @delete-result="handleDeleteResult"
            @delete-selected="handleDeleteSelected"
            @toggle-read-status="handleToggleReadStatus"
            @mark-selected-read="handleMarkSelectedRead"
          />
        </div>

        <!-- 空状态展示 -->
        <div
          v-if="!isLoading && filteredResults.length === 0"
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <div
            class="w-16 h-16 rounded-full bg-light-bg flex items-center justify-center mb-4"
          >
            <i class="ri-folders-line text-light-text-disabled text-3xl"></i>
          </div>
          <h3 class="text-lg font-medium text-light-text-primary mb-2">无扫描结果</h3>
          <p class="text-light-text-secondary max-w-md mb-6">
            {{
              hasActiveFilters
                ? "没有符合当前过滤条件的路径扫描结果，请尝试修改过滤条件或清除筛选"
                : "当前还没有任何路径扫描结果。创建一个新的扫描任务来发现目标路径。"
            }}
          </p>
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="px-4 py-2.5 rounded-xl text-sm font-medium bg-light-bg hover:bg-light-bg-hover text-light-text-primary transition-all duration-200 flex items-center"
          >
            <i class="ri-filter-off-line mr-2"></i>
            清除筛选条件
          </button>
          <button
            v-else
            @click="router.push('/task-management')"
            class="px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition-all duration-200 flex items-center border border-blue-500/30"
          >
            <i class="ri-add-line mr-2"></i>
            新建扫描任务
          </button>
        </div>

        <!-- 错误提示 -->
        <div
          v-if="errorMessage"
          class="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center"
        >
          <i class="ri-error-warning-line text-red-500 mr-2"></i>
          <p class="text-sm text-red-500">{{ errorMessage }}</p>
        </div>
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
      :type="dialogType"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../../api/axiosInstance";
import PathScanTable from "./PathScanTable.vue";
import PopupNotification from "../Utils/PopupNotification.vue";
import ConfirmDialog from "../Utils/ConfirmDialog.vue";
import { useNotification } from "../../composables/useNotification";
import { useConfirmDialog } from "../../composables/useConfirmDialog";

export default {
  name: "PathScanResults",
  components: {
    PathScanTable,
    PopupNotification,
    ConfirmDialog,
  },
  setup() {
    const router = useRouter();
    const pathScanResults = ref([]);
    const errorMessage = ref("");
    const searchQuery = ref("");
    const statusFilter = ref("");
    const isLoading = ref(false);

    // 使用通知钩子
    const {
      showNotification,
      notificationMessage,
      notificationType,
      showSuccess,
      showError,
    } = useNotification();

    // 使用确认对话框钩子
    const {
      showDialog,
      dialogTitle,
      dialogMessage,
      dialogType,
      confirm,
      handleConfirm,
      handleCancel,
    } = useConfirmDialog();

    // 检查是否有活跃的过滤条件
    const hasActiveFilters = computed(() => {
      return searchQuery.value.trim() !== "" || statusFilter.value !== "";
    });

    // 过滤后的结果
    const filteredResults = computed(() => {
      if (!pathScanResults.value || !Array.isArray(pathScanResults.value))
        return [];

      let filtered = [...pathScanResults.value];

      // 搜索过滤
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        filtered = filtered.filter(
          (result) =>
            result.target && result.target.toLowerCase().includes(query)
        );
      }

      // 状态过滤
      if (statusFilter.value !== "") {
        const is_read = statusFilter.value === "true";
        filtered = filtered.filter((result) => result.is_read === is_read);
      }

      // 按时间戳排序
      return filtered.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });

    // 获取扫描结果
    const fetchPathScanResults = async () => {
      try {
        isLoading.value = true;
        errorMessage.value = "";

        const response = await api.get("/results/type/Path");
        pathScanResults.value = response.data;

        showSuccess("已刷新扫描结果");
      } catch (error) {
        errorMessage.value = "获取扫描结果失败，请重试或联系管理员";
        showError("获取扫描结果失败");
      } finally {
        isLoading.value = false;
      }
    };

    // 处理搜索
    const handleSearch = () => {
      // 这里只是触发一次动画效果，实际过滤是通过计算属性实时完成的
      isLoading.value = true;
      setTimeout(() => {
        isLoading.value = false;
      }, 300);
    };

    // 清除所有过滤条件
    const clearFilters = () => {
      searchQuery.value = "";
      statusFilter.value = "";
      handleSearch();
    };

    // 查看详情
    const handleViewDetails = (id) => {
      router.push({ name: "PathScanDetail", params: { id } });
    };

    // 删除单个结果
    const handleDeleteResult = async (id) => {
      try {
        const confirmed = await confirm({
          title: "确认删除",
          message: "是否确认删除此扫描结果？此操作不可撤销。",
          type: "danger",
        });

        if (confirmed) {
          isLoading.value = true;
          await api.delete(`/results/${id}`);
          await fetchPathScanResults();
          showSuccess("已删除扫描结果");
        }
      } catch (error) {
        showError("删除扫描结果失败");
        isLoading.value = false;
      }
    };

    // 切换已读状态
    const handleToggleReadStatus = async (id, is_read) => {
      try {
        isLoading.value = true;
        await api.put(`/results/${id}/read`, { is_read });

        // 乐观更新UI，避免完全刷新
        const index = pathScanResults.value.findIndex(
          (result) => result.id === id
        );
        if (index !== -1) {
          pathScanResults.value[index].is_read = is_read;
        }

        showSuccess("已更新状态");
        isLoading.value = false;
      } catch (error) {
        showError("更新状态失败");
        await fetchPathScanResults(); // 出错时刷新以保持一致性
      }
    };

    // 批量标记已读
    const handleMarkSelectedRead = async (selectedIds) => {
      if (selectedIds.length === 0) {
        showError("请选择要标记的结果");
        return;
      }

      try {
        isLoading.value = true;
        await Promise.all(
          selectedIds.map((id) =>
            api.put(`/results/${id}/read`, { is_read: true })
          )
        );
        await fetchPathScanResults();
        showSuccess(`已将 ${selectedIds.length} 个结果标记为已读`);
      } catch (error) {
        showError("批量标记失败");
      } finally {
        isLoading.value = false;
      }
    };

    // 批量删除
    const handleDeleteSelected = async (selectedIds) => {
      if (selectedIds.length === 0) {
        showError("请选择要删除的结果");
        return;
      }

      try {
        const confirmed = await confirm({
          title: "批量删除",
          message: `是否确认删除选中的 ${selectedIds.length} 个结果？此操作不可撤销。`,
          type: "danger",
        });

        if (confirmed) {
          isLoading.value = true;
          await Promise.all(
            selectedIds.map((id) => api.delete(`/results/${id}`))
          );
          await fetchPathScanResults();
          showSuccess(`已删除 ${selectedIds.length} 个结果`);
        }
      } catch (error) {
        showError("批量删除失败");
        isLoading.value = false;
      }
    };

    onMounted(fetchPathScanResults);

    return {
      router,
      pathScanResults,
      errorMessage,
      showNotification,
      notificationMessage,
      notificationType,
      showDialog,
      dialogTitle,
      dialogMessage,
      dialogType,
      searchQuery,
      statusFilter,
      filteredResults,
      isLoading,
      hasActiveFilters,
      handleConfirm,
      handleCancel,
      handleRefreshTasks: fetchPathScanResults,
      handleViewDetails,
      handleDeleteResult,
      handleDeleteSelected,
      handleToggleReadStatus,
      handleMarkSelectedRead,
      handleSearch,
      clearFilters,
    };
  },
};
</script>

<style scoped>
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

/* 平滑过渡效果 */
.opacity-50 {
  transition: opacity 0.3s ease;
}

/* 输入框样式增强 */
input:focus,
select:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 自定义滚动条 */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>
