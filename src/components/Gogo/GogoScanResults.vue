<template>
  <div class="bg-light-gradient text-light-text-primary flex flex-col min-h-screen">
    <div class="container mx-auto px-6 py-8 flex-1">
      <!-- Gogo漏洞扫描结果面板 -->
      <div
        class="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-light-card border border-light-border"
      >
        <!-- 标题区域 -->
        <div
          class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
        >
          <div class="flex items-center">
            <div
              class="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mr-3"
            >
              <i class="ri-bug-line text-orange-500 text-xl"></i>
            </div>
            <div>
              <h2 class="text-xl font-medium tracking-wide text-light-text-primary">
                漏洞扫描结果
              </h2>
              <p class="text-sm text-light-text-secondary mt-1">
                查看和管理漏洞扫描任务的结果
              </p>
            </div>
            <div
              class="ml-4 px-3 py-1 rounded-lg bg-light-bg text-light-text-primary text-sm flex items-center"
              :class="
                filteredResults.length > 0
                  ? 'bg-orange-500/10 text-orange-500'
                  : ''
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
              class="px-4 py-2.5 rounded-xl text-sm font-medium bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 flex items-center justify-center border border-orange-500/30"
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
                class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-light-text-primary border border-light-border focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all duration-200"
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
                  class="w-full pl-10 pr-8 py-2.5 rounded-xl bg-white text-light-text-primary border border-light-border focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all duration-200 appearance-none"
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
              class="ml-2 text-orange-500 hover:text-orange-600 text-xs underline"
            >
              清除全部
            </button>
          </div>
        </div>

        <!-- Gogo漏洞扫描结果表格 -->
        <div
          class="bg-white/90 rounded-xl overflow-hidden border border-light-border shadow-sm"
          :class="{ 'opacity-50': isLoading }"
        >
          <GogoScanTable
            :gogoScanResults="filteredResults"
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
            <i class="ri-bug-line text-light-text-disabled text-3xl"></i>
          </div>
          <h3 class="text-lg font-medium text-light-text-primary mb-2">无扫描结果</h3>
          <p class="text-light-text-secondary max-w-md mb-6">
            {{
              hasActiveFilters
                ? "没有符合当前过滤条件的Gogo漏洞扫描结果，请尝试修改过滤条件或清除筛选"
                : "当前还没有任何Gogo漏洞扫描结果。创建一个新的扫描任务来检测漏洞。"
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
            class="px-4 py-2.5 rounded-xl text-sm font-medium bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 transition-all duration-200 flex items-center border border-orange-500/30"
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
import GogoScanTable from "./GogoScanTable.vue";
import PopupNotification from "../Utils/PopupNotification.vue";
import ConfirmDialog from "../Utils/ConfirmDialog.vue";
import api from "../../api/axiosInstance";
import { useNotification } from "../../composables/useNotification";
import { useConfirmDialog } from "../../composables/useConfirmDialog";

export default {
  name: "GogoScanResults",
  components: {
    GogoScanTable,
    PopupNotification,
    ConfirmDialog,
  },
  setup() {
    const router = useRouter();
    const gogoScanResults = ref([]);
    const isLoading = ref(false);
    const errorMessage = ref("");
    const searchQuery = ref("");
    const statusFilter = ref("");

    // 使用通知和确认对话框组合式API
    const {
      showNotification,
      notificationMessage,
      notificationType,
      showSuccess,
      showError,
      showWarning,
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

    // 计算属性：是否有活跃过滤器
    const hasActiveFilters = computed(
      () => searchQuery.value || statusFilter.value
    );

    // 计算属性：过滤后的结果
    const filteredResults = computed(() => {
      let results = Array.isArray(gogoScanResults.value) ? [...gogoScanResults.value] : [];

      // 应用搜索过滤
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        results = results.filter((result) => {
          return (
            (result.target && result.target.toLowerCase().includes(query)) ||
            (result.id && result.id.toLowerCase().includes(query))
          );
        });
      }

      // 应用状态过滤
      if (statusFilter.value) {
        const isRead = statusFilter.value === "true";
        results = results.filter((result) => result.is_read === isRead);
      }

      return results;
    });

    // 获取Gogo扫描结果列表
    const fetchGogoScanResults = async () => {
      isLoading.value = true;
      errorMessage.value = "";

      try {
        const response = await api.get("/results/type/Gogo");
        gogoScanResults.value = response.data;
      } catch (error) {
        console.error("Failed to fetch Gogo scan results:", error);
        errorMessage.value =
          "获取Gogo扫描结果失败：" +
          (error.response?.data?.message || error.message || "未知错误");
        showError("获取Gogo扫描结果失败");
      } finally {
        isLoading.value = false;
      }
    };

    // 刷新任务列表
    const handleRefreshTasks = () => {
      fetchGogoScanResults();
      showWarning("正在刷新Gogo扫描结果列表");
    };

    // 处理查询操作
    const handleSearch = () => {
      // 已经通过计算属性实现了过滤，这里可以做一些额外操作
      if (hasActiveFilters.value) {
        showSuccess(`过滤条件已应用，找到 ${filteredResults.value.length} 个结果`);
      }
    };

    // 清除所有过滤条件
    const clearFilters = () => {
      searchQuery.value = "";
      statusFilter.value = "";
      showWarning("已清除所有过滤条件");
    };

    // 查看扫描详情
    const handleViewDetails = (id) => {
      router.push(`/gogo-scan-detail/${id}`);
    };

    // 删除扫描结果
    const handleDeleteResult = async (id) => {
      try {
        const confirmed = await confirm({
          title: "删除确认",
          message: "确定要删除这个Gogo扫描结果吗？此操作不可恢复。",
          type: "danger",
        });

        if (!confirmed) return;
        
        isLoading.value = true;
        await api.delete(`/results/${id}`);
        gogoScanResults.value = gogoScanResults.value.filter(
          (result) => result.id !== id
        );
        showSuccess("已成功删除Gogo扫描结果");
        isLoading.value = false;
      } catch (error) {
        console.error("Failed to delete Gogo scan result:", error);
        showError(
          "删除Gogo扫描结果失败: " +
            (error.response?.data?.message || error.message || "未知错误")
        );
        isLoading.value = false;
      }
    };

    // 批量删除扫描结果
    const handleDeleteSelected = async (selectedIds) => {
      if (!selectedIds || selectedIds.length === 0) {
        showError("请选择要删除的结果");
        return;
      }
      
      try {
        const confirmed = await confirm({
          title: "批量删除确认",
          message: `确定要删除选中的 ${selectedIds.length} 个Gogo扫描结果吗？此操作不可恢复。`,
          type: "danger",
        });

        if (!confirmed) return;
        
        isLoading.value = true;
        // 批量删除请求
        const deletePromises = selectedIds.map((id) =>
          api.delete(`/results/${id}`)
        );
        await Promise.all(deletePromises);

        // 更新本地数据
        gogoScanResults.value = gogoScanResults.value.filter(
          (result) => !selectedIds.includes(result.id)
        );
        showSuccess(`已成功删除 ${selectedIds.length} 个Gogo扫描结果`);
        isLoading.value = false;
      } catch (error) {
        console.error("Failed to delete Gogo scan results:", error);
        showError(
          "批量删除Gogo扫描结果失败: " +
            (error.response?.data?.message || error.message || "未知错误")
        );
        isLoading.value = false;
      }
    };

    // 切换已读/未读状态
    const handleToggleReadStatus = async (id, is_read) => {
      try {
        await api.put(`/results/${id}/read`, { is_read });

        // 更新本地数据
        const index = gogoScanResults.value.findIndex((r) => r.id === id);
        if (index !== -1) {
          gogoScanResults.value[index].is_read = is_read;
        }

        showSuccess(
          `已将Gogo扫描结果标记为${is_read ? "已读" : "未读"}`
        );
      } catch (error) {
        console.error("Failed to update read status:", error);
        showError(
          "更新读取状态失败: " +
            (error.response?.data?.message || error.message || "未知错误")
        );
      }
    };

    // 批量标记为已读
    const handleMarkSelectedRead = async (selectedIds) => {
      if (!selectedIds || selectedIds.length === 0) return;

      try {
        const confirmed = await confirm({
          title: "批量标记",
          message: `是否将选中的 ${selectedIds.length} 项标记为已读？`,
          type: "info",
        });

        if (!confirmed) return;
        
        isLoading.value = true;
        // 批量更新请求
        const updatePromises = selectedIds.map((id) =>
          api.put(`/results/${id}/read`, { is_read: true })
        );
        await Promise.all(updatePromises);

        // 更新本地数据
        gogoScanResults.value = gogoScanResults.value.map((result) => {
          if (selectedIds.includes(result.id)) {
            return { ...result, is_read: true };
          }
          return result;
        });

        showSuccess(`已将 ${selectedIds.length} 个Gogo扫描结果标记为已读`);
        isLoading.value = false;
      } catch (error) {
        console.error("Failed to mark results as read:", error);
        showError(
          "批量标记为已读失败: " +
            (error.response?.data?.message || error.message || "未知错误")
        );
        isLoading.value = false;
      }
    };

    // 组件挂载时获取数据
    onMounted(() => {
      fetchGogoScanResults();
    });

    return {
      gogoScanResults,
      filteredResults,
      isLoading,
      errorMessage,
      searchQuery,
      statusFilter,
      hasActiveFilters,
      showNotification,
      notificationMessage,
      notificationType,
      showDialog,
      dialogTitle,
      dialogMessage,
      dialogType,
      router,
      handleRefreshTasks,
      handleSearch,
      clearFilters,
      handleViewDetails,
      handleDeleteResult,
      handleDeleteSelected,
      handleToggleReadStatus,
      handleMarkSelectedRead,
      handleConfirm,
      handleCancel,
    };
  },
};
</script>

<style scoped>
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
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