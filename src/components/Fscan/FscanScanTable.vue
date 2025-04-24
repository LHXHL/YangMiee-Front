<template>
  <div class="space-y-6">
    <!-- 结果表格 -->
    <div v-if="fscanScanResults?.length > 0">
      <div
        class="relative overflow-x-auto rounded-xl border border-gray-700/30 bg-gray-800/30"
      >
        <table class="w-full">
          <thead>
            <tr class="bg-gray-800/60 border-b border-gray-700/50">
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
                class="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(result, index) in fscanScanResults"
              :key="result.id"
              class="border-b border-gray-700/30 transition-all duration-200 hover:bg-gray-700/40"
              :class="index % 2 === 0 ? 'bg-gray-800/20' : ''"
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
              <td class="py-3 px-4 text-sm font-mono text-gray-300">
                {{ result.id }}
              </td>
              <td class="py-3 px-4 text-sm text-gray-200">
                <span class="flex items-center">
                  <i class="ri-global-line mr-2 text-blue-400"></i>
                  {{ result.target }}
                </span>
              </td>
              <td class="py-3 px-4 text-sm text-gray-300">
                <span class="flex items-center">
                  <i class="ri-time-line mr-2 text-gray-500"></i>
                  {{ formatDate(result.timestamp) }}
                </span>
              </td>
              <td class="py-3 px-4 text-sm text-gray-200">
                <span
                  class="px-2 py-1 rounded-md bg-red-500/10 text-red-300 border border-red-500/20 inline-flex items-center"
                >
                  <i class="ri-error-warning-line mr-1.5"></i>
                  {{ getVulnCount(result) }} 个
                </span>
              </td>
              <td class="py-3 px-4">
                <span
                  class="px-2 py-1 rounded-md text-xs font-medium inline-flex items-center"
                  :class="
                    result.is_read
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
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
                    class="action-button bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30"
                  >
                    <i class="ri-eye-line mr-1.5"></i>
                    查看
                  </button>
                  <button
                    @click="handleToggleRead(result)"
                    class="action-button"
                    :class="
                      result.is_read
                        ? 'bg-gray-700/50 text-gray-300 border border-gray-600/30'
                        : 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30'
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
                    class="action-button bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
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
        class="flex items-center justify-between flex-wrap gap-4 p-4 rounded-xl border border-gray-700/30 bg-gray-800/30 mt-6"
      >
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-400">
            <template v-if="hasSelected">
              已选择
              <span class="text-white font-medium">{{
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
                ? 'bg-gray-700/50 text-gray-400 border-gray-600/30 cursor-not-allowed'
                : 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30',
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
                ? 'bg-gray-700/50 text-gray-400 border-gray-600/30 cursor-not-allowed'
                : 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30',
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
  name: "FscanScanTable",
  props: {
    fscanScanResults: {
      type: Array,
      required: true,
      default: () => [], // 设置默认值为空数组
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "view-details",
    "delete-result",
    "delete-selected",
    "toggle-read-status",
    "mark-selected-read",
  ],
  setup(props, { emit }) {
    const tableHeaders = [
      "ID",
      "目标",
      "扫描时间",
      "发现漏洞",
      "状态",
      "操作",
    ];
    const selectedResults = ref([]);

    // 是否全选
    const isAllSelected = computed(() => {
      return (
        props.fscanScanResults.length > 0 &&
        selectedResults.value.length === props.fscanScanResults.length
      );
    });

    // 是否有选中项
    const hasSelected = computed(() => {
      return selectedResults.value.length > 0;
    });

    // 全选/取消全选
    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedResults.value = [];
      } else {
        selectedResults.value = props.fscanScanResults.map(
          (result) => result.id
        );
      }
    };

    // 查看详情
    const handleViewDetails = (id) => {
      emit("view-details", id);
    };

    // 删除单个结果
    const handleDelete = (id) => {
      emit("delete-result", id);
    };

    // 批量删除
    const handleBatchDelete = () => {
      emit("delete-selected", selectedResults.value);
      selectedResults.value = [];
    };

    // 切换读取状态
    const handleToggleRead = (result) => {
      emit("toggle-read-status", result);
    };

    // 批量标记为已读
    const handleBatchRead = () => {
      emit("mark-selected-read", selectedResults.value);
      selectedResults.value = [];
    };

    // 获取漏洞数量
    const getVulnCount = (result) => {
      if (!result.data) return 0;
      
      const vulnsItem = result.data.find(item => item.Key === "vulns");
      if (!vulnsItem || !vulnsItem.Value) return 0;
      
      return vulnsItem.Value.length;
    };

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return "-";
      
      try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(date);
      } catch (error) {
        console.error("日期格式化错误:", error);
        return dateString;
      }
    };

    // 当结果列表变化时，清空选中状态
    watch(
      () => props.fscanScanResults,
      () => {
        selectedResults.value = [];
      }
    );

    return {
      tableHeaders,
      selectedResults,
      isAllSelected,
      hasSelected,
      toggleSelectAll,
      handleViewDetails,
      handleDelete,
      handleBatchDelete,
      handleToggleRead,
      handleBatchRead,
      getVulnCount,
      formatDate,
    };
  },
};
</script>

<style scoped>
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