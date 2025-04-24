<template>
  <div class="space-y-6">
    <!-- 结果表格 -->
    <div v-if="validResults.length > 0">
      <div
        class="relative overflow-x-auto rounded-xl border border-light-border bg-white/90 shadow-sm"
      >
        <table class="w-full">
          <thead>
            <tr class="bg-light-bg border-b border-light-border">
              <th class="py-3 px-4 text-left w-10">
                <input
                  type="checkbox"
                  @change="toggleSelectAll"
                  :checked="isAllSelected"
                  class="checkbox-input"
                  id="select-all-header"
                  title="全选/取消全选"
                />
                <label for="select-all-header" class="sr-only"
                  >全选/取消全选</label
                >
              </th>
              <th
                v-for="header in tableHeaders"
                :key="header"
                class="py-3 px-4 text-left text-xs font-medium text-light-text-secondary uppercase tracking-wider"
              >
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(result, index) in validResults"
              :key="result.id"
              class="border-b border-light-border transition-all duration-200 hover:bg-light-bg/70"
              :class="index % 2 === 0 ? 'bg-light-bg/50' : 'bg-white'"
            >
              <td class="py-3 px-4">
                <input
                  type="checkbox"
                  v-model="selectedResults"
                  :value="result.id"
                  class="checkbox-input"
                  :id="`select-result-${result.id}`"
                />
                <label :for="`select-result-${result.id}`" class="sr-only"
                  >选择此结果</label
                >
              </td>
              <td class="py-3 px-4 text-sm font-mono text-light-text-primary">
                {{ result.id }}
              </td>
              <td class="py-3 px-4 text-sm text-light-text-primary">
                <span class="flex items-center">
                  <i class="ri-global-line mr-2 text-orange-500"></i>
                  {{ result.target }}
                </span>
              </td>
              <td class="py-3 px-4 text-sm text-light-text-primary">
                <span class="flex items-center">
                  <i class="ri-time-line mr-2 text-gray-400"></i>
                  {{ formatDate(result.timestamp) }}
                </span>
              </td>
              <td class="py-3 px-4 text-sm text-light-text-primary">
                <span
                  class="px-2 py-1 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 inline-flex items-center"
                >
                  <i class="ri-error-warning-line mr-1.5"></i>
                  {{ getVulnsCount(result) }} 个
                </span>
              </td>
              <td class="py-3 px-4 text-sm text-light-text-primary">
                <span
                  class="px-2 py-1 rounded-md bg-orange-500/10 text-orange-500 border border-orange-500/20 inline-flex items-center"
                >
                  <i class="ri-scan-2-line mr-1.5"></i>
                  {{ getPortsCount(result) }} 个
                </span>
              </td>
              <td class="py-3 px-4">
                <span
                  class="px-2 py-1 rounded-md text-xs font-medium inline-flex items-center"
                  :class="
                    result.is_read
                      ? 'bg-green-500/10 text-green-600 border border-green-500/30'
                      : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/30'
                  "
                >
                  <i
                    :class="result.is_read ? 'ri-eye-line' : 'ri-eye-off-line'"
                    class="mr-1.5"
                  ></i>
                  {{ result.is_read ? "已读" : "未读" }}
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="flex gap-2 flex-wrap">
                  <button
                    @click="handleViewDetails(result.id)"
                    class="action-button bg-orange-500/10 text-orange-500 border border-orange-500/30 hover:bg-orange-500/20"
                  >
                    <i class="ri-eye-line mr-1.5"></i>
                    查看
                  </button>
                  <button
                    @click="handleToggleRead(result)"
                    class="action-button"
                    :class="
                      result.is_read
                        ? 'bg-light-bg text-light-text-primary border border-light-border'
                        : 'bg-green-500/10 text-green-600 border border-green-500/30 hover:bg-green-500/20'
                    "
                  >
                    <i
                      :class="[
                        result.is_read ? 'ri-eye-off-line' : 'ri-eye-line',
                        'mr-1.5',
                      ]"
                    ></i>
                    {{ result.is_read ? "标为未读" : "标为已读" }}
                  </button>
                  <button
                    @click="handleDelete(result.id)"
                    class="action-button bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20"
                  >
                    <i class="ri-delete-bin-line mr-1.5"></i>
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 批量操作工具栏 -->
      <div
        class="flex items-center justify-between flex-wrap gap-4 p-4 rounded-xl border border-light-border bg-light-bg mt-6"
      >
        <div class="flex items-center gap-3">
          <span class="text-sm text-light-text-secondary">
            <template v-if="hasSelected">
              已选择
              <span class="text-light-text-primary font-medium">{{
                selectedResults.length
              }}</span>
              项
            </template>
            <template v-else> 请选择要操作的项目 </template>
          </span>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            @click="handleBatchRead"
            :disabled="!hasSelected"
            class="batch-button"
            :class="[
              !hasSelected
                ? 'bg-light-bg-disabled text-light-text-disabled border-light-border cursor-not-allowed'
                : 'bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20',
            ]"
          >
            <i class="ri-eye-line mr-2"></i>
            标记已读
            <span v-if="hasSelected">({{ selectedResults.length }})</span>
          </button>
          <button
            @click="handleBatchDelete"
            :disabled="!hasSelected"
            class="batch-button"
            :class="[
              !hasSelected
                ? 'bg-light-bg-disabled text-light-text-disabled border-light-border cursor-not-allowed'
                : 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20',
            ]"
          >
            <i class="ri-delete-bin-line mr-2"></i>
            批量删除
            <span v-if="hasSelected">({{ selectedResults.length }})</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";

export default {
  name: "GogoScanTable",
  props: {
    gogoScanResults: {
      type: Array,
      required: true,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    "view-details",
    "delete-result",
    "delete-selected",
    "toggle-read-status",
    "mark-selected-read",
  ],
  setup(props, { emit }) {
    // 表格头部配置
    const tableHeaders = [
      "ID",
      "目标地址",
      "扫描时间",
      "漏洞数量",
      "端口数量",
      "状态",
      "操作",
    ];

    // 计算属性：确保结果是有效数组
    const validResults = computed(() => {
      return Array.isArray(props.gogoScanResults) ? props.gogoScanResults : [];
    });

    // 选中的结果ID列表
    const selectedResults = ref([]);

    // 计算属性：是否有选中项
    const hasSelected = computed(() => selectedResults.value.length > 0);

    // 计算属性：是否全选
    const isAllSelected = computed(() => {
      if (!validResults.value.length) return false;
      return selectedResults.value.length === validResults.value.length;
    });

    // 格式化日期时间
    const formatDate = (timestamp) => {
      if (!timestamp) return "-";
      try {
        return new Date(timestamp).toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        return timestamp || "未知时间";
      }
    };

    // 获取漏洞数量
    const getVulnsCount = (result) => {
      if (!result || !result.data || !Array.isArray(result.data)) {
        return 0;
      }
      const vulnsGroup = result.data.find((group) => group.Key === "vulns");
      return vulnsGroup?.Value?.length || 0;
    };

    // 获取端口数量
    const getPortsCount = (result) => {
      if (!result || !result.data || !Array.isArray(result.data)) {
        return 0;
      }
      const portsGroup = result.data.find((group) => group.Key === "ports");
      return portsGroup?.Value?.length || 0;
    };

    // 全选/取消全选
    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedResults.value = [];
      } else {
        selectedResults.value = validResults.value.map((r) => r.id);
      }
    };

    // 查看详情
    const handleViewDetails = (id) => {
      emit("view-details", id);
    };

    // 标记已读/未读
    const handleToggleRead = (result) => {
      emit("toggle-read-status", result.id, !result.is_read);
    };

    // 删除
    const handleDelete = (id) => {
      emit("delete-result", id);
    };

    // 批量标记已读
    const handleBatchRead = () => {
      emit("mark-selected-read", selectedResults.value);
    };

    // 批量删除
    const handleBatchDelete = () => {
      emit("delete-selected", selectedResults.value);
    };

    // 在结果列表变化时，重置选中状态
    watch(
      () => validResults.value,
      () => {
        selectedResults.value = [];
      }
    );

    return {
      tableHeaders,
      validResults,
      selectedResults,
      hasSelected,
      isAllSelected,
      formatDate,
      getVulnsCount,
      getPortsCount,
      toggleSelectAll,
      handleViewDetails,
      handleToggleRead,
      handleDelete,
      handleBatchRead,
      handleBatchDelete,
    };
  },
};
</script>

<style scoped>
.checkbox-input {
  @apply rounded-md border-light-border bg-white 
  text-orange-500 focus:ring-orange-500/30 h-4 w-4 cursor-pointer;
}

.action-button {
  @apply px-3 py-1.5 rounded-md text-xs font-medium 
  transition-all duration-200 inline-flex items-center
  focus:outline-none focus:ring-1 focus:ring-opacity-50
  disabled:opacity-50 disabled:cursor-not-allowed;
}

.batch-button {
  @apply px-3 py-2 rounded-lg text-xs font-medium 
  transition-all duration-200 inline-flex items-center border
  focus:outline-none focus:ring-1 focus:ring-opacity-50
  disabled:opacity-50 disabled:cursor-not-allowed;
}

/* 优化按钮点击效果 */
.batch-button:active:not(:disabled),
.action-button:active:not(:disabled) {
  transform: scale(0.98);
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