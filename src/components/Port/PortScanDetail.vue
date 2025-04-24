<template>
  <div class="bg-light-gradient text-light-text-primary flex flex-col min-h-screen">
    <HeaderPage />

    <div class="container mx-auto px-6 py-8 flex-1 mt-16">
      <!-- 主要内容卡片 -->
      <div
        class="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-light-card border border-light-border"
      >
        <!-- 返回按钮与面包屑导航 -->
        <div class="flex items-center text-sm text-light-text-secondary mb-6">
          <router-link
            to="/port-scan-results"
            class="hover:text-blue-500 transition-colors flex items-center"
          >
            <i class="ri-arrow-left-line mr-1"></i>
            返回列表
          </router-link>
          <i class="ri-arrow-right-s-line mx-2"></i>
          <span class="text-light-text-primary">端口扫描详情</span>
        </div>

        <!-- 标题和基本信息卡片 -->
        <div
          class="bg-light-bg rounded-xl border border-light-border mb-6 overflow-hidden"
        >
          <div
            class="p-5 border-b border-light-border flex items-center space-x-3"
          >
            <div
              class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"
            >
              <i class="ri-scan-2-line text-blue-500 text-xl"></i>
            </div>
            <div>
              <h2 class="text-xl font-medium tracking-wide text-light-text-primary">
                {{ scanResult?.target || "加载中..." }}
              </h2>
              <p class="text-sm text-light-text-secondary mt-1">端口扫描结果详情</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-5">
            <div class="flex flex-col">
              <span class="text-sm text-light-text-secondary mb-1 flex items-center">
                <i class="ri-fingerprint-line mr-1.5"></i>
                扫描ID
              </span>
              <div class="flex items-center">
                <span class="text-sm font-mono text-light-text-primary">{{
                  scanResult?.id || "-"
                }}</span>
                <button
                  v-if="scanResult?.id"
                  @click="copyToClipboard(scanResult.id)"
                  class="ml-2 text-light-text-tertiary hover:text-light-text-secondary transition-colors"
                  title="复制ID"
                >
                  <i class="ri-clipboard-line text-xs"></i>
                </button>
              </div>
            </div>

            <div class="flex flex-col">
              <span class="text-sm text-light-text-secondary mb-1 flex items-center">
                <i class="ri-global-line mr-1.5"></i>
                目标地址
              </span>
              <div class="flex items-center">
                <span class="text-sm text-light-text-primary">{{
                  scanResult?.target || "-"
                }}</span>
                <button
                  v-if="scanResult?.target"
                  @click="copyToClipboard(scanResult.target)"
                  class="ml-2 text-light-text-tertiary hover:text-light-text-secondary transition-colors"
                  title="复制目标"
                >
                  <i class="ri-clipboard-line text-xs"></i>
                </button>
              </div>
            </div>

            <div class="flex flex-col">
              <span class="text-sm text-light-text-secondary mb-1 flex items-center">
                <i class="ri-time-line mr-1.5"></i>
                扫描时间
              </span>
              <div class="flex items-center">
                <span class="text-sm text-light-text-primary">
                  {{ scanResult ? formatDate(scanResult.timestamp) : "-" }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 统计数据展示 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div
            class="bg-light-bg rounded-xl border border-light-border p-4 flex flex-col"
          >
            <span class="text-sm text-light-text-secondary mb-1">总端口数</span>
            <span class="text-2xl font-medium text-light-text-primary">{{
              filteredPorts.length
            }}</span>
          </div>

          <div
            class="bg-light-bg rounded-xl border border-light-border p-4 flex flex-col"
          >
            <span class="text-sm text-light-text-secondary mb-1">开放端口</span>
            <span class="text-2xl font-medium text-green-600">
              {{
                filteredPorts.filter((p) => getPortValue(p, "state") === "open")
                  .length
              }}
            </span>
          </div>

          <div
            class="bg-light-bg rounded-xl border border-light-border p-4 flex flex-col"
          >
            <span class="text-sm text-light-text-secondary mb-1">已探测HTTP</span>
            <span class="text-2xl font-medium text-purple-600">
              {{
                filteredPorts.filter((p) => getPortValue(p, "http_status"))
                  .length
              }}
            </span>
          </div>

          <div
            class="bg-light-bg rounded-xl border border-light-border p-4 flex flex-col"
          >
            <span class="text-sm text-light-text-secondary mb-1">已读状态</span>
            <span class="text-2xl font-medium text-blue-500">
              {{
                filteredPorts.filter((p) => getPortValue(p, "is_read")).length
              }}
            </span>
          </div>
        </div>

        <!-- 批量操作工具栏 -->
        <div
          class="bg-light-bg rounded-xl border border-light-border p-4 mb-6"
        >
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center mr-2">
              <input
                type="checkbox"
                @change="toggleSelectAll"
                v-model="selectAll"
                class="rounded border-light-border bg-white text-blue-500 focus:ring-blue-500/30 mr-2"
                id="select-all"
              />
              <label
                for="select-all"
                class="text-sm text-light-text-primary cursor-pointer"
              >
                全选
              </label>
            </div>

            <span class="text-sm text-light-text-secondary" v-if="selectedPorts.length > 0">
              已选择 {{ selectedPorts.length }} 项
            </span>

            <!-- 批量操作按钮组 -->
            <div class="flex flex-wrap gap-3 ml-auto">
              <!-- HTTP探测按钮 -->
              <button
                @click="probePort(selectedPorts)"
                :disabled="selectedPorts.length === 0 || isProbing"
                class="tool-button bg-purple-500/10 border-purple-500/30 text-purple-600 hover:bg-purple-500/20"
                :class="{
                  'opacity-60 cursor-not-allowed':
                    selectedPorts.length === 0 || isProbing,
                }"
              >
                <i class="ri-search-eye-line mr-1.5"></i>
                {{ isProbing ? "正在探测..." : "HTTPX探测" }}
              </button>

              <!-- 路径扫描按钮 -->
              <button
                @click="sendToPathScan(selectedPorts)"
                :disabled="selectedPorts.length === 0"
                class="tool-button bg-blue-500/10 border-blue-500/30 text-blue-500 hover:bg-blue-500/20"
                :class="{
                  'opacity-60 cursor-not-allowed': selectedPorts.length === 0,
                }"
              >
                <i class="ri-folders-line mr-1.5"></i>
                发送到路径扫描
              </button>
            </div>
          </div>
        </div>

        <!-- 端口信息表格 -->
        <div
          class="bg-white/90 rounded-xl border border-light-border overflow-hidden mb-4 shadow-sm"
        >
          <div class="relative overflow-x-auto custom-scrollbar">
            <table class="w-full">
              <thead>
                <tr class="bg-light-bg border-b border-light-border">
                  <th class="py-3 px-4 text-left">
                    <span class="sr-only">选择</span>
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
                  v-for="(port, index) in paginatedPorts"
                  :key="getPortValue(port, '_id')"
                  class="border-t border-light-border transition-colors duration-200"
                  :class="[
                    index % 2 === 0 ? 'bg-light-bg/50' : 'bg-transparent',
                    'hover:bg-light-bg/70',
                  ]"
                >
                  <td class="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      v-model="selectedPorts"
                      :value="getPortValue(port, '_id')"
                      class="rounded border-light-border bg-white text-blue-500 focus:ring-blue-500/30"
                    />
                  </td>
                  <td class="py-3 px-4 text-xs font-mono text-light-text-primary w-20">
                    {{ getPortValue(port, "_id") }}
                  </td>
                  <td class="py-3 px-4 text-sm text-light-text-primary w-16">
                    <span class="flex items-center">
                      <i class="ri-door-lock-line mr-2 text-blue-500"></i>
                      {{ getPortValue(port, "number") }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-sm text-light-text-primary w-20">
                    {{ getPortValue(port, "protocol") }}
                  </td>
                  <td class="py-3 px-4 text-sm text-light-text-primary w-24">
                    {{ getPortValue(port, "service") }}
                  </td>
                  <td class="py-3 px-4 w-20">
                    <span
                      class="status-badge"
                      :class="{
                        'bg-green-500/10 text-green-600 border-green-500/30':
                          getPortValue(port, 'state') === 'open',
                        'bg-red-500/10 text-red-600 border-red-500/30':
                          getPortValue(port, 'state') === 'closed',
                        'bg-yellow-500/10 text-yellow-600 border-yellow-500/30':
                          getPortValue(port, 'state') === 'filtered',
                      }"
                    >
                      <i class="ri-checkbox-blank-circle-fill mr-1 text-xs"></i>
                      {{ getPortValue(port, "state") }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-sm w-24">
                    <div
                      v-if="getPortValue(port, 'http_status')"
                      class="flex items-center"
                    >
                      <span
                        :class="[
                          'status-badge',
                          getHttpStatusClass(getPortValue(port, 'http_status')),
                        ]"
                      >
                        <i class="ri-earth-line mr-1"></i>
                        {{ getPortValue(port, "http_status") }}
                      </span>
                    </div>
                    <button
                      v-else
                      @click="probePort([getPortValue(port, '_id')])"
                      class="status-button bg-purple-500/10 text-purple-600 border-purple-500/30"
                    >
                      <i class="ri-search-eye-line mr-1"></i>
                      探测
                    </button>
                  </td>
                  <td class="py-3 px-4 text-sm text-light-text-primary w-48">
                    <div
                      class="truncate"
                      :title="getPortValue(port, 'http_title')"
                    >
                      {{ getPortValue(port, "http_title") || "-" }}
                    </div>
                  </td>
                  <td class="py-3 px-4 w-20">
                    <span
                      class="status-badge"
                      :class="
                        getPortValue(port, 'is_read')
                          ? 'bg-green-500/10 text-green-600 border-green-500/30'
                          : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
                      "
                    >
                      <i
                        :class="[
                          getPortValue(port, 'is_read')
                            ? 'ri-eye-line'
                            : 'ri-eye-off-line',
                          'mr-1',
                        ]"
                      ></i>
                      {{ getPortValue(port, "is_read") ? "已读" : "未读" }}
                    </span>
                  </td>
                  <td class="py-3 px-4 w-48">
                    <div class="flex gap-2">
                      <button
                        @click="toggleReadStatus(port)"
                        class="action-button"
                        :class="
                          getPortValue(port, 'is_read')
                            ? 'bg-light-bg text-light-text-primary border-light-border'
                            : 'bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20'
                        "
                      >
                        <i
                          :class="[
                            getPortValue(port, 'is_read')
                              ? 'ri-eye-off-line'
                              : 'ri-eye-line',
                          ]"
                        ></i>
                        {{
                          getPortValue(port, "is_read")
                            ? "标为未读"
                            : "标为已读"
                        }}
                      </button>
                      <button
                        @click="sendToPathScan([getPortValue(port, '_id')])"
                        class="action-button bg-blue-500/10 text-blue-500 border-blue-500/30 hover:bg-blue-500/20"
                      >
                        <i class="ri-folders-line"></i>
                        路径扫描
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 分页控件 -->
        <div v-if="filteredPorts.length > 0" class="mt-4 flex flex-col gap-4">
          <!-- 每页条数选择和分页统计 -->
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <span class="text-sm text-light-text-secondary">每页显示:</span>
              <select
                v-model="pageSize"
                @change="changePageSize(pageSize)"
                class="bg-white border border-light-border text-light-text-primary text-sm rounded-lg focus:ring-blue-500/30 focus:border-blue-500/50 px-2.5 py-1"
              >
                <option v-for="size in pageSizeOptions" :key="size" :value="size">
                  {{ size }}
                </option>
              </select>
            </div>
            <div class="text-sm text-light-text-secondary">
              显示 {{ filteredPorts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1 }}
              - {{ Math.min(currentPage * pageSize, filteredPorts.length) }}
              共 {{ filteredPorts.length }} 条
            </div>
          </div>

          <!-- 分页按钮 -->
          <div class="flex justify-center items-center space-x-2">
            <button
              @click="goToPage(1)"
              :disabled="currentPage === 1"
              class="page-button"
              :class="{'opacity-50 cursor-not-allowed': currentPage === 1}"
            >
              <i class="ri-arrow-left-double-line"></i>
            </button>
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="page-button"
              :class="{'opacity-50 cursor-not-allowed': currentPage === 1}"
            >
              <i class="ri-arrow-left-s-line"></i>
            </button>

            <!-- 当前页码 -->
            <span class="page-button bg-blue-500/30 text-blue-500 border-blue-500/50">
              {{ currentPage }}
            </span>

            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="page-button"
              :class="{'opacity-50 cursor-not-allowed': currentPage === totalPages}"
            >
              <i class="ri-arrow-right-s-line"></i>
            </button>
            <button
              @click="goToPage(totalPages)"
              :disabled="currentPage === totalPages"
              class="page-button"
              :class="{'opacity-50 cursor-not-allowed': currentPage === totalPages}"
            >
              <i class="ri-arrow-right-double-line"></i>
            </button>
          </div>
        </div>

        <!-- 空状态展示 -->
        <div
          v-if="filteredPorts.length === 0 && !errorMessage"
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <div
            class="w-16 h-16 rounded-full bg-light-bg flex items-center justify-center mb-4"
          >
            <i class="ri-search-line text-light-text-disabled text-3xl"></i>
          </div>
          <h3 class="text-lg font-medium text-light-text-primary mb-2">无端口数据</h3>
          <p class="text-light-text-secondary max-w-md mb-6">
            该扫描结果中没有发现端口数据，或正在加载中...
          </p>
        </div>

        <!-- 错误提示 -->
        <div
          v-if="errorMessage"
          class="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center"
        >
          <i class="ri-error-warning-line text-red-500 mr-2 text-lg"></i>
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

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { usePortScan } from "../../composables/usePortScan";
import HeaderPage from "../HeaderPage.vue";
import PopupNotification from "../Utils/PopupNotification.vue";
import ConfirmDialog from "../Utils/ConfirmDialog.vue";

const route = useRoute();
const isProbing = ref(false); // 用于跟踪探测状态

// 表头配置
const tableHeaders = [
  "ID",
  "端口",
  "协议",
  "服务",
  "状态",
  "HTTP状态",
  "HTTP标题",
  "读取状态",
  "操作",
];

// 从组合式函数中解构所需的状态和方法
const {
  // 基础数据
  scanResult,
  errorMessage,
  selectedPorts,
  selectAll,
  filteredPorts,
  
  // 分页相关
  currentPage,
  pageSize,
  pageSizeOptions,
  totalPages,
  paginatedPorts,
  goToPage,
  nextPage,
  prevPage,
  changePageSize,

  // 方法
  getPortValue,
  toggleReadStatus,
  toggleSelectAll,
  sendToPathScan,
  fetchScanResult,
  probePort,
  getHttpStatusClass,
  copyToClipboard,

  // 通知状态和方法
  showNotification,
  notificationMessage,
  notificationType,

  // 确认对话框状态和方法
  showDialog,
  dialogTitle,
  dialogMessage,
  dialogType,
  handleConfirm,
  handleCancel,
} = usePortScan();

// 格式化日期函数
const formatDate = (timestamp) => {
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

// 在组件挂载时获取数据
onMounted(() => {
  fetchScanResult(route.params.id);
});
</script>

<style scoped>
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

/* 自定义工具按钮 */
.tool-button {
  @apply px-4 py-2 rounded-lg text-xs font-medium
  transition-all duration-200 flex items-center
  focus:outline-none focus:ring-1 border;
}

/* 状态标签 */
.status-badge {
  @apply px-2 py-1 rounded-md text-xs font-medium
  whitespace-nowrap inline-flex items-center border;
}

/* 小型状态按钮 */
.status-button {
  @apply px-2 py-1 rounded-md text-xs font-medium
  transition-all duration-200 flex items-center justify-center
  whitespace-nowrap border focus:outline-none;
}

/* 操作按钮 */
.action-button {
  @apply px-2 py-1 text-xs rounded-md flex items-center
  justify-center whitespace-nowrap transition-all duration-200
  border focus:outline-none;
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
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* 优化按钮点击效果 */
button:active:not(:disabled) {
  transform: scale(0.98);
}

/* 分页按钮样式 */
.page-button {
  @apply flex items-center justify-center w-8 h-8 rounded-md
  bg-light-bg text-light-text-primary border border-light-border
  hover:bg-light-bg-hover hover:text-light-text-primary transition-all duration-200
  focus:outline-none focus:ring-1 focus:ring-blue-500/30;
}
</style>
