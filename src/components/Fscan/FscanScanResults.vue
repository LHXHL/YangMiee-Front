<template>
  <div class="bg-gray-900 text-white flex flex-col min-h-screen">
    <HeaderPage
      title="Gogo漏洞扫描结果"
      description="Gogo漏洞扫描结果管理"
      icon="ri-shield-keyhole-line"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- 漏洞扫描结果面板 -->
        <div
          class="bg-gray-800/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700/30"
        >
          <!-- 标题区域 -->
          <div
            class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
          >
            <div class="flex items-center">
              <div
                class="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mr-3"
              >
                <i class="ri-shield-keyhole-line text-red-400 text-xl"></i>
              </div>
              <div>
                <h2 class="text-xl font-medium tracking-wide text-gray-200">
                  漏洞扫描结果
                </h2>
                <p class="text-sm text-gray-400 mt-1">
                  查看和管理漏洞扫描任务的结果
                </p>
              </div>
              <div
                class="ml-4 px-3 py-1 rounded-lg bg-gray-700/50 text-gray-200 text-sm flex items-center"
                :class="
                  filteredResults.length > 0
                    ? 'bg-red-500/20 text-red-300'
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
                class="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-600/50 flex items-center justify-center"
              >
                <i class="ri-refresh-line mr-2"></i>
                刷新列表
              </button>

              <button
                @click="router.push('/task-management')"
                class="px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500/30 hover:bg-red-600/40 text-red-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/30 flex items-center justify-center border border-red-500/30"
              >
                <i class="ri-add-line mr-2"></i>
                新建扫描
              </button>
            </div>
          </div>

          <!-- 搜索和过滤栏 -->
          <div
            class="bg-gray-800/70 p-4 rounded-xl mb-6 border border-gray-700/30"
          >
            <div class="flex flex-col md:flex-row gap-4">
              <!-- 搜索框 -->
              <div class="flex-1">
                <div class="relative rounded-md shadow-sm">
                  <div
                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  >
                    <i class="ri-search-line text-gray-400"></i>
                  </div>
                  <input
                    v-model="searchQuery"
                    type="text"
                    class="block w-full pl-10 sm:text-sm border-gray-600 bg-gray-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-white"
                    placeholder="搜索目标地址..."
                    @keyup.enter="handleSearch"
                  />
                </div>
              </div>

              <div class="flex gap-4">
                <div class="w-40">
                  <select
                    v-model="statusFilter"
                    class="block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                  >
                    <option value="">所有状态</option>
                    <option value="read">已读</option>
                    <option value="unread">未读</option>
                  </select>
                </div>
                
                <!-- 查询按钮 -->
                <button
                  @click="handleSearch"
                  class="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-600/50 flex items-center justify-center min-w-[100px]"
                >
                  <i class="ri-search-line mr-2"></i>
                  查询
                </button>
              </div>
            </div>

            <!-- 活跃过滤器提示 -->
            <div
              v-if="hasActiveFilters"
              class="flex items-center gap-2 mt-3 text-sm text-gray-400"
            >
              <i class="ri-filter-3-line"></i>
              <span>已过滤: </span>
              <div
                v-if="searchQuery"
                class="px-2 py-0.5 bg-gray-700/50 rounded-md text-gray-300 text-xs flex items-center"
              >
                搜索 "{{ searchQuery }}"
                <button
                  @click="searchQuery = ''"
                  class="ml-1 text-gray-400 hover:text-gray-200"
                >
                  <i class="ri-close-line"></i>
                </button>
              </div>
              <div
                v-if="statusFilter"
                class="px-2 py-0.5 bg-gray-700/50 rounded-md text-gray-300 text-xs flex items-center"
              >
                {{ statusFilter === "read" ? "已读" : "未读" }}
                <button
                  @click="statusFilter = ''"
                  class="ml-1 text-gray-400 hover:text-gray-200"
                >
                  <i class="ri-close-line"></i>
                </button>
              </div>
              <button
                @click="clearFilters"
                class="ml-2 text-red-400 hover:text-red-300 text-xs underline"
              >
                清除全部
              </button>
            </div>
          </div>

          <!-- 漏洞扫描结果表格 -->
          <div
            class="bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700/30"
            :class="{ 'opacity-50': isLoading }"
          >
            <FscanScanTable
              :fscanScanResults="paginatedResults"
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
              class="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4"
            >
              <i class="ri-shield-keyhole-line text-gray-500 text-3xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-300 mb-2">无扫描结果</h3>
            <p class="text-gray-400 max-w-md mb-6">
              {{
                hasActiveFilters
                  ? "没有符合当前过滤条件的漏洞扫描结果，请尝试修改过滤条件或清除筛选"
                  : "当前还没有任何漏洞扫描结果。创建一个新的扫描任务来检测潜在漏洞。"
              }}
            </p>
            <button
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 transition-all duration-200 flex items-center"
            >
              <i class="ri-filter-off-line mr-2"></i>
              清除筛选条件
            </button>
            <button
              v-else
              @click="router.push('/task-management')"
              class="px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500/30 hover:bg-red-600/40 text-red-100 transition-all duration-200 flex items-center border border-red-500/30"
            >
              <i class="ri-add-line mr-2"></i>
              新建扫描任务
            </button>
          </div>

          <!-- 错误提示 -->
          <div
            v-if="errorMessage"
            class="mt-6 p-4 bg-red-900/30 border border-red-700/30 rounded-xl text-red-300 flex items-center"
          >
            <i class="ri-error-warning-line text-xl mr-3"></i>
            <div>
              <p class="font-medium mb-1">获取数据时出错</p>
              <p class="text-sm">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页控件 -->
      <div class="flex justify-between items-center mt-6 px-4" v-if="!isLoading && filteredResults.length > 0">
        <div class="text-sm text-gray-400">
          显示 {{ filteredResults.length }} 条结果中的 {{ Math.min((currentPage - 1) * itemsPerPage + 1, filteredResults.length) }} - {{ Math.min(currentPage * itemsPerPage, filteredResults.length) }} 条
        </div>
        <div class="flex items-center space-x-3">
          <button 
            class="px-3 py-1.5 rounded-lg text-sm bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-700/30 transition-all duration-200 flex items-center" 
            @click="currentPage--" 
            :disabled="currentPage <= 1"
            :class="{'opacity-50 cursor-not-allowed': currentPage <= 1}"
          >
            <i class="ri-arrow-left-s-line mr-1"></i> 上一页
          </button>
          <span class="text-gray-300">{{ currentPage }} / {{ totalPages }}</span>
          <button 
            class="px-3 py-1.5 rounded-lg text-sm bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-700/30 transition-all duration-200 flex items-center" 
            @click="currentPage++" 
            :disabled="currentPage >= totalPages"
            :class="{'opacity-50 cursor-not-allowed': currentPage >= totalPages}"
          >
            下一页 <i class="ri-arrow-right-s-line ml-1"></i>
          </button>
          <select
            v-model="itemsPerPage"
            class="bg-gray-800/50 border border-gray-700/50 text-gray-200 text-sm rounded-lg focus:ring-blue-500/30 focus:border-blue-500/50 px-2.5 py-1.5"
          >
            <option :value="10">10条/页</option>
            <option :value="20">20条/页</option>
            <option :value="50">50条/页</option>
          </select>
        </div>
      </div>
    </HeaderPage>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import api from "../../api/axiosInstance";
import HeaderPage from "../HeaderPage.vue";
import FscanScanTable from "./FscanScanTable.vue";
import { useNotification } from "@/composables/useNotification";

export default {
  name: "FscanScanResults",
  components: {
    HeaderPage,
    FscanScanTable,
  },
  setup() {
    const router = useRouter();
    const { showSuccess: showSuccessNotification, showError: showErrorNotification } = useNotification();
    const fscanScanResults = ref([]);
    const isLoading = ref(true);
    const errorMessage = ref("");
    const searchQuery = ref("");
    const statusFilter = ref("");
    const currentPage = ref(1);
    const itemsPerPage = ref(10);

    // 获取漏洞扫描结果
    const fetchFscanResults = async () => {
      try {
        isLoading.value = true;
        errorMessage.value = "";
        
        // 仅获取Gogo类型的扫描结果
        const response = await api.get("/results/type/Gogo");
        
        // 设置结果
        fscanScanResults.value = response.data;
        
        isLoading.value = false;
      } catch (error) {
        console.error("获取漏洞扫描结果失败:", error);
        errorMessage.value = error.response?.data?.message || "获取数据失败，请稍后重试";
        isLoading.value = false;
      }
    };

    // 过滤后的结果
    const filteredResults = computed(() => {
      let results = [...fscanScanResults.value];

      // 应用关键词搜索
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        results = results.filter((result) =>
          result.target.toLowerCase().includes(query)
        );
      }

      // 应用已读/未读筛选
      if (statusFilter.value) {
        const isRead = statusFilter.value === "read";
        results = results.filter((result) => result.is_read === isRead);
      }
      
      return results;
    });

    // 是否有激活的筛选条件
    const hasActiveFilters = computed(() => {
      return searchQuery.value.trim() !== "" || statusFilter.value !== "";
    });

    // 清除所有筛选条件
    const clearFilters = () => {
      searchQuery.value = "";
      statusFilter.value = "";
    };

    // 执行搜索
    const handleSearch = () => {
      // 搜索逻辑已通过计算属性实现
      // 这个函数主要用于按钮点击事件
    };

    // 刷新任务列表
    const handleRefreshTasks = () => {
      fetchFscanResults();
    };

    // 查看详情
    const handleViewDetails = (id) => {
      router.push(`/fscan-scan-detail/${id}`);
    };

    // 删除单个结果
    const handleDeleteResult = async (id) => {
      try {
        await api.delete(`/results/${id}`);
        fscanScanResults.value = fscanScanResults.value.filter(item => item.id !== id);
        showSuccessNotification("删除成功", "已成功删除漏洞扫描结果");
      } catch (error) {
        console.error("删除漏洞扫描结果失败:", error);
        showErrorNotification("删除失败", error.response?.data?.message || "删除失败，请稍后重试");
      }
    };

    // 批量删除
    const handleDeleteSelected = async (ids) => {
      try {
        await Promise.all(ids.map(id => api.delete(`/results/${id}`)));
        fscanScanResults.value = fscanScanResults.value.filter(item => !ids.includes(item.id));
        showSuccessNotification("批量删除成功", `已成功删除 ${ids.length} 条漏洞扫描结果`);
      } catch (error) {
        console.error("批量删除漏洞扫描结果失败:", error);
        showErrorNotification("批量删除失败", error.response?.data?.message || "批量删除失败，请稍后重试");
      }
    };

    // 切换读取状态
    const handleToggleReadStatus = async (result) => {
      try {
        const newStatus = !result.is_read;
         await api.put(`/results/${result.id}/read`, {
          is_read: newStatus
        });
        
        // 更新本地状态
        const index = fscanScanResults.value.findIndex(item => item.id === result.id);
        if (index !== -1) {
          fscanScanResults.value[index].is_read = newStatus;
        }
        
        showSuccessNotification(
          "状态更新成功", 
          `已将该结果标记为${newStatus ? '已读' : '未读'}`
        );
      } catch (error) {
        console.error("更新读取状态失败:", error);
        showErrorNotification("状态更新失败", error.response?.data?.message || "更新状态失败，请稍后重试");
      }
    };

    // 批量标记为已读
    const handleMarkSelectedRead = async (ids) => {
      try {
        await Promise.all(ids.map(id => 
          api.put(`/results/${id}/read`, { is_read: true })
        ));
        
        // 更新本地状态
        fscanScanResults.value = fscanScanResults.value.map(item => {
          if (ids.includes(item.id)) {
            return { ...item, is_read: true };
          }
          return item;
        });
        
        showSuccessNotification("批量标记成功", `已将 ${ids.length} 条结果标记为已读`);
      } catch (error) {
        console.error("批量标记为已读失败:", error);
        showErrorNotification("批量标记失败", error.response?.data?.message || "批量标记失败，请稍后重试");
      }
    };

    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(filteredResults.value.length / itemsPerPage.value) || 1;
    });

    // 计算当前页的数据
    const paginatedResults = computed(() => {
      const startIndex = (currentPage.value - 1) * itemsPerPage.value;
      const endIndex = startIndex + itemsPerPage.value;
      return filteredResults.value.slice(startIndex, endIndex);
    });

    // 监听筛选条件变化，重置到第一页
    watch([searchQuery, statusFilter], () => {
      currentPage.value = 1;
    });

    onMounted(() => {
      fetchFscanResults();
    });

    return {
      router,
      fscanScanResults,
      filteredResults,
      isLoading,
      errorMessage,
      searchQuery,
      statusFilter,
      hasActiveFilters,
      clearFilters,
      handleSearch,
      handleRefreshTasks,
      handleViewDetails,
      handleDeleteResult,
      handleDeleteSelected,
      handleToggleReadStatus,
      handleMarkSelectedRead,
      currentPage,
      itemsPerPage,
      totalPages,
      paginatedResults
    };
  },
};
</script>

<style scoped>
/* 自定义组件样式 */
.checkbox-input {
  @apply rounded border-gray-700/50 bg-gray-800/50 text-red-500 focus:ring-red-500/30;
}

.action-button {
  @apply text-xs px-2 py-1 rounded flex items-center transition-all duration-200;
}

.batch-button {
  @apply text-xs px-3 py-1.5 rounded-lg flex items-center transition-all duration-200 border;
}
</style> 