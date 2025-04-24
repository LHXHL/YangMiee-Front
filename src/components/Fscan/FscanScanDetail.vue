<template>
  <div class="bg-gray-900 text-white flex flex-col min-h-screen">
    <HeaderPage />

    <div class="container mx-auto px-6 py-8 flex-1 mt-16">
      <!-- 主要内容卡片 -->
      <div
        class="bg-gray-800/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700/30"
      >
        <!-- 返回按钮与面包屑导航 -->
        <div class="flex items-center text-sm text-gray-400 mb-6">
          <router-link
            to="/fscan-scan-results"
            class="hover:text-red-400 transition-colors flex items-center"
          >
            <i class="ri-arrow-left-line mr-1"></i>
            返回列表
          </router-link>
          <i class="ri-arrow-right-s-line mx-2"></i>
          <span class="text-gray-200">Gogo漏洞扫描详情</span>
        </div>

        <!-- 标题和基本信息卡片 -->
        <div
          class="bg-gray-800/60 rounded-xl border border-gray-700/30 mb-6 overflow-hidden"
        >
          <div
            class="p-5 border-b border-gray-700/30 flex items-center space-x-3"
          >
            <div
              class="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center"
            >
              <i class="ri-shield-keyhole-line text-red-400 text-xl"></i>
            </div>
            <div>
              <h2 class="text-xl font-medium tracking-wide text-gray-200">
                {{ scanResult?.target || "加载中..." }}
              </h2>
              <p class="text-sm text-gray-400 mt-1">Gogo漏洞扫描结果详情</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-5">
            <div class="flex flex-col">
              <span class="text-sm text-gray-400 mb-1 flex items-center">
                <i class="ri-fingerprint-line mr-1.5"></i>
                扫描ID
              </span>
              <div class="flex items-center">
                <span class="text-sm font-mono text-gray-200">{{
                  scanResult?.id || "-"
                }}</span>
                <button
                  v-if="scanResult?.id"
                  @click="copyToClipboard(scanResult.id)"
                  class="ml-2 text-gray-500 hover:text-gray-300 transition-colors"
                  title="复制ID"
                >
                  <i class="ri-clipboard-line text-xs"></i>
                </button>
              </div>
            </div>

            <div class="flex flex-col">
              <span class="text-sm text-gray-400 mb-1 flex items-center">
                <i class="ri-global-line mr-1.5"></i>
                目标地址
              </span>
              <div class="flex items-center">
                <span class="text-sm text-gray-200">{{
                  scanResult?.target || "-"
                }}</span>
                <button
                  v-if="scanResult?.target"
                  @click="copyToClipboard(scanResult.target)"
                  class="ml-2 text-gray-500 hover:text-gray-300 transition-colors"
                  title="复制目标"
                >
                  <i class="ri-clipboard-line text-xs"></i>
                </button>
              </div>
            </div>

            <div class="flex flex-col">
              <span class="text-sm text-gray-400 mb-1 flex items-center">
                <i class="ri-time-line mr-1.5"></i>
                扫描时间
              </span>
              <div class="flex items-center">
                <span class="text-sm text-gray-200">
                  {{ scanResult ? formatDate(scanResult.timestamp) : "-" }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 统计数据展示 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div
            class="bg-gray-800/60 rounded-xl border border-gray-700/30 p-4 flex flex-col"
          >
            <span class="text-sm text-gray-400 mb-1">开放端口</span>
            <span class="text-2xl font-medium text-blue-300">{{
              getPortsCount
            }}</span>
          </div>

          <div
            class="bg-gray-800/60 rounded-xl border border-gray-700/30 p-4 flex flex-col"
          >
            <span class="text-sm text-gray-400 mb-1">发现漏洞</span>
            <span class="text-2xl font-medium text-red-300">
              {{ getVulnsCount }}
            </span>
          </div>

          <div
            class="bg-gray-800/60 rounded-xl border border-gray-700/30 p-4 flex flex-col"
          >
            <span class="text-sm text-gray-400 mb-1">Web信息</span>
            <span class="text-2xl font-medium text-purple-300">
              {{ getWebInfoCount }}
            </span>
          </div>

          <div
            class="bg-gray-800/60 rounded-xl border border-gray-700/30 p-4 flex flex-col"
          >
            <span class="text-sm text-gray-400 mb-1">扫描状态</span>
            <span
              class="text-xl font-medium flex items-center"
              :class="scanResult?.is_read ? 'text-green-300' : 'text-yellow-300'"
            >
              <i
                :class="
                  scanResult?.is_read ? 'ri-eye-line' : 'ri-eye-off-line'
                "
                class="mr-1.5"
              ></i>
              {{ scanResult?.is_read ? "已读" : "未读" }}
            </span>
          </div>
        </div>

        <!-- 主要内容选项卡 -->
        <div class="mb-6">
          <div class="flex border-b border-gray-700/30 mb-4">
            <button
              v-for="(tab, index) in tabs"
              :key="index"
              @click="activeTab = tab.id"
              class="px-4 py-2 text-sm font-medium relative"
              :class="
                activeTab === tab.id
                  ? 'text-red-300'
                  : 'text-gray-400 hover:text-gray-300'
              "
            >
              <div class="flex items-center">
                <i :class="tab.icon" class="mr-1.5"></i>
                {{ tab.name }}
              </div>
              <div
                v-if="activeTab === tab.id"
                class="absolute bottom-0 left-0 w-full h-0.5 bg-red-500/70"
              ></div>
            </button>
          </div>

          <!-- 端口列表 -->
          <div v-if="activeTab === 'ports'" class="space-y-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-medium text-gray-200 flex items-center">
                <i class="ri-radar-line mr-2 text-blue-400"></i>
                开放端口列表
              </h3>
            </div>

            <div
              v-if="portsData.length > 0"
              class="bg-gray-800/50 rounded-xl border border-gray-700/30 overflow-hidden"
            >
              <table class="w-full">
                <thead>
                  <tr class="bg-gray-800/60 border-b border-gray-700/50">
                    <th
                      v-for="header in portsHeaders"
                      :key="header"
                      class="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                    >
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(port, index) in paginatedPorts"
                    :key="index"
                    class="border-b border-gray-700/30 transition-all duration-200 hover:bg-gray-700/40"
                    :class="index % 2 === 0 ? 'bg-gray-800/20' : ''"
                  >
                    <td class="py-3 px-4 text-sm text-gray-200">
                      <span class="font-mono">{{ getPortValue(port, 'port') }}</span>
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-200">
                      <span class="font-mono">{{ getPortValue(port, 'protocol') }}</span>
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-200">
                      <span class="font-mono">{{ getPortValue(port, 'host') || '-' }}</span>
                    </td>
                    <td class="py-3 px-4 text-sm">
                      <span
                        class="px-2 py-1 rounded-md text-xs font-medium inline-flex items-center"
                        :class="
                          getPortValue(port, 'status') === 'open'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        "
                      >
                        {{ getPortValue(port, 'status') || '-' }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-200">
                      {{ getPortValue(port, 'service') || '-' }}
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-300 max-w-xs truncate" :title="getPortValue(port, 'info')">
                      {{ getPortValue(port, 'info') || '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- 端口分页控件 -->
            <div v-if="portsData.length > 0" class="mt-4 flex flex-col gap-4">
              <!-- 端口分页 -->
              <div class="flex justify-center items-center space-x-2">
                <button
                  @click="goToPortsPage(1)"
                  :disabled="portsCurrentPage === 1"
                  class="page-button"
                  :class="{'opacity-50 cursor-not-allowed': portsCurrentPage === 1}"
                >
                  <i class="ri-arrow-left-double-line"></i>
                </button>
                <button
                  @click="prevPortsPage"
                  :disabled="portsCurrentPage === 1"
                  class="page-button"
                  :class="{'opacity-50 cursor-not-allowed': portsCurrentPage === 1}"
                >
                  <i class="ri-arrow-left-s-line"></i>
                </button>

                <!-- 当前页码 -->
                <span class="page-button bg-blue-500/30 text-blue-300 border-blue-500/50">
                  {{ portsCurrentPage }}
                </span>

                <button
                  @click="nextPortsPage"
                  :disabled="portsCurrentPage === portsTotalPages"
                  class="page-button"
                  :class="{'opacity-50 cursor-not-allowed': portsCurrentPage === portsTotalPages}"
                >
                  <i class="ri-arrow-right-s-line"></i>
                </button>
                <button
                  @click="goToPortsPage(portsTotalPages)"
                  :disabled="portsCurrentPage === portsTotalPages"
                  class="page-button"
                  :class="{'opacity-50 cursor-not-allowed': portsCurrentPage === portsTotalPages}"
                >
                  <i class="ri-arrow-right-double-line"></i>
                </button>
              </div>
            </div>
            
            <div
              v-else
              class="bg-gray-800/50 rounded-xl border border-gray-700/30 p-8 text-center"
            >
              <div class="flex flex-col items-center">
                <div
                  class="w-12 h-12 rounded-full bg-gray-800/70 flex items-center justify-center mb-3"
                >
                  <i class="ri-radar-line text-gray-500 text-2xl"></i>
                </div>
                <p class="text-gray-400">没有发现开放的端口</p>
              </div>
            </div>
          </div>

          <!-- 漏洞列表 -->
          <div v-if="activeTab === 'vulns'" class="space-y-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-medium text-gray-200 flex items-center">
                <i class="ri-error-warning-line mr-2 text-red-400"></i>
                发现的漏洞列表
              </h3>
            </div>

            <div
              v-if="vulnsData.length > 0"
              class="bg-gray-800/50 rounded-xl border border-gray-700/30 overflow-hidden"
            >
              <table class="w-full">
                <thead>
                  <tr class="bg-gray-800/60 border-b border-gray-700/50">
                    <th
                      v-for="header in vulnsHeaders"
                      :key="header"
                      class="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                    >
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(vuln, index) in paginatedVulns"
                    :key="index"
                    class="border-b border-gray-700/30 transition-all duration-200 hover:bg-gray-700/40"
                    :class="index % 2 === 0 ? 'bg-gray-800/20' : ''"
                  >
                    <td class="py-3 px-4 text-sm text-blue-300 font-medium">
                      {{ getVulnValue(vuln, 'type') || '-' }}
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-200">
                      <span class="font-mono">{{ getVulnValue(vuln, 'target') || '-' }}</span>
                    </td>
                    <td class="py-3 px-4 text-sm">
                      <span
                        class="px-2 py-1 rounded-md text-xs font-medium inline-flex items-center"
                        :class="getSeverityClass(getVulnValue(vuln, 'severity'))"
                      >
                        {{ getVulnValue(vuln, 'severity') || 'unknown' }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-300">
                      {{ getVulnValue(vuln, 'description') || '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- 漏洞分页 -->
            <div v-if="vulnsData.length > 0" class="mt-4 flex flex-col gap-4">
              <!-- 漏洞分页 -->
              <div class="flex justify-center items-center space-x-2">
                <button
                  @click="goToVulnsPage(1)"
                  :disabled="vulnsCurrentPage === 1"
                  class="page-button"
                  :class="{'opacity-50 cursor-not-allowed': vulnsCurrentPage === 1}"
                >
                  <i class="ri-arrow-left-double-line"></i>
                </button>
                <button
                  @click="prevVulnsPage"
                  :disabled="vulnsCurrentPage === 1"
                  class="page-button"
                  :class="{'opacity-50 cursor-not-allowed': vulnsCurrentPage === 1}"
                >
                  <i class="ri-arrow-left-s-line"></i>
                </button>

                <!-- 当前页码 -->
                <span class="page-button bg-blue-500/30 text-blue-300 border-blue-500/50">
                  {{ vulnsCurrentPage }}
                </span>

                <button
                  @click="nextVulnsPage"
                  :disabled="vulnsCurrentPage === vulnsTotalPages"
                  class="page-button"
                  :class="{'opacity-50 cursor-not-allowed': vulnsCurrentPage === vulnsTotalPages}"
                >
                  <i class="ri-arrow-right-s-line"></i>
                </button>
                <button
                  @click="goToVulnsPage(vulnsTotalPages)"
                  :disabled="vulnsCurrentPage === vulnsTotalPages"
                  class="page-button"
                  :class="{'opacity-50 cursor-not-allowed': vulnsCurrentPage === vulnsTotalPages}"
                >
                  <i class="ri-arrow-right-double-line"></i>
                </button>
              </div>
            </div>
            
            <div
              v-else
              class="bg-gray-800/50 rounded-xl border border-gray-700/30 p-8 text-center"
            >
              <div class="flex flex-col items-center">
                <div
                  class="w-12 h-12 rounded-full bg-gray-800/70 flex items-center justify-center mb-3"
                >
                  <i class="ri-shield-check-line text-gray-500 text-2xl"></i>
                </div>
                <p class="text-gray-400">没有发现漏洞</p>
              </div>
            </div>
          </div>

          <!-- Web信息列表 -->
          <div v-if="activeTab === 'webinfo'" class="space-y-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-medium text-gray-200 flex items-center">
                <i class="ri-global-line mr-2 text-purple-400"></i>
                Web信息列表
              </h3>
            </div>

            <div
              v-if="webInfoData.length > 0"
              class="bg-gray-800/50 rounded-xl border border-gray-700/30 overflow-hidden"
            >
              <table class="w-full">
                <thead>
                  <tr class="bg-gray-800/60 border-b border-gray-700/50">
                    <th
                      v-for="header in webInfoHeaders"
                      :key="header"
                      class="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                    >
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(webInfo, index) in paginatedWebInfo"
                    :key="index"
                    class="border-b border-gray-700/30 transition-all duration-200 hover:bg-gray-700/40"
                    :class="index % 2 === 0 ? 'bg-gray-800/20' : ''"
                  >
                    <td class="py-3 px-4 text-sm text-blue-300">
                      {{ getWebInfoValue(webInfo, 'url') || '-' }}
                    </td>
                    <td class="py-3 px-4 text-sm">
                      <span
                        class="px-2 py-1 rounded-md text-xs font-medium inline-flex items-center"
                        :class="getHttpStatusClass(getWebInfoValue(webInfo, 'code'))"
                      >
                        {{ getWebInfoValue(webInfo, 'code') || '-' }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-300 max-w-xs truncate" :title="getWebInfoValue(webInfo, 'title')">
                      {{ getWebInfoValue(webInfo, 'title') || '-' }}
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-200 max-w-xs truncate" :title="getWebInfoValue(webInfo, 'server')">
                      {{ getWebInfoValue(webInfo, 'server') || '-' }}
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-300 max-w-xs truncate" :title="getWebInfoValue(webInfo, 'framework')">
                      {{ getWebInfoValue(webInfo, 'framework') || '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Web信息分页控件 -->
            <div v-if="webInfoData.length > 0" class="mt-4 flex flex-col gap-4">
              <!-- Web信息分页 -->
              <div class="flex justify-center items-center space-x-2">
                <button
                  @click="goToWebInfoPage(1)"
                  :disabled="webInfoCurrentPage === 1"
                  class="page-button"
                  :class="{'opacity-50 cursor-not-allowed': webInfoCurrentPage === 1}"
                >
                  <i class="ri-arrow-left-double-line"></i>
                </button>
                <button
                  @click="prevWebInfoPage"
                  :disabled="webInfoCurrentPage === 1"
                  class="page-button"
                  :class="{'opacity-50 cursor-not-allowed': webInfoCurrentPage === 1}"
                >
                  <i class="ri-arrow-left-s-line"></i>
                </button>

                <!-- 当前页码 -->
                <span class="page-button bg-blue-500/30 text-blue-300 border-blue-500/50">
                  {{ webInfoCurrentPage }}
                </span>

                <button
                  @click="nextWebInfoPage"
                  :disabled="webInfoCurrentPage === webInfoTotalPages"
                  class="page-button"
                  :class="{'opacity-50 cursor-not-allowed': webInfoCurrentPage === webInfoTotalPages}"
                >
                  <i class="ri-arrow-right-s-line"></i>
                </button>
                <button
                  @click="goToWebInfoPage(webInfoTotalPages)"
                  :disabled="webInfoCurrentPage === webInfoTotalPages"
                  class="page-button"
                  :class="{'opacity-50 cursor-not-allowed': webInfoCurrentPage === webInfoTotalPages}"
                >
                  <i class="ri-arrow-right-double-line"></i>
                </button>
              </div>
            </div>
            
            <div
              v-else
              class="bg-gray-800/50 rounded-xl border border-gray-700/30 p-8 text-center"
            >
              <div class="flex flex-col items-center">
                <div
                  class="w-12 h-12 rounded-full bg-gray-800/70 flex items-center justify-center mb-3"
                >
                  <i class="ri-global-line text-gray-500 text-2xl"></i>
                </div>
                <p class="text-gray-400">没有Web信息数据</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载中状态 -->
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50"
    >
      <div class="flex flex-col items-center">
        <div class="w-16 h-16 relative">
          <div
            class="w-16 h-16 rounded-full border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"
          ></div>
          <div
            class="w-12 h-12 absolute top-2 left-2 rounded-full border-4 border-r-red-400 border-t-transparent border-b-transparent border-l-transparent animate-spin"
          ></div>
        </div>
        <p class="mt-4 text-gray-300">加载漏洞扫描结果...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import HeaderPage from "../HeaderPage.vue";
import { useNotification } from "@/composables/useNotification";
import api from "@/api/axiosInstance";

export default {
  name: "FscanScanDetail",
  components: {
    HeaderPage,
  },
  setup() {
    const route = useRoute();
    const scanId = route.params.id;
    const { showSuccess: showSuccessNotification, showError: showErrorNotification } = useNotification();
    const scanResult = ref(null);
    const isLoading = ref(true);
    const errorMessage = ref("");
    const activeTab = ref("vulns"); // 默认显示漏洞信息
    
    // 分页相关
    const pageSizeOptions = [10, 20, 50, 100]; // 每页条数选项
    
    // 端口分页
    const portsCurrentPage = ref(1);
    const portsPageSize = ref(10); // 默认每页10条
    
    // 漏洞分页
    const vulnsCurrentPage = ref(1);
    const vulnsPageSize = ref(10); // 默认每页10条
    
    // Web信息分页
    const webInfoCurrentPage = ref(1);
    const webInfoPageSize = ref(10); // 默认每页10条

    // 选项卡配置
    const tabs = [
      { id: "vulns", name: "漏洞信息", icon: "ri-error-warning-line" },
      { id: "ports", name: "端口信息", icon: "ri-radar-line" },
      { id: "webinfo", name: "Web信息", icon: "ri-global-line" },
    ];

    // 表头配置
    const portsHeaders = ["端口", "协议", "主机", "状态", "服务", "详细信息"];
    const vulnsHeaders = ["漏洞类型", "目标", "严重性", "描述"];
    const webInfoHeaders = ["URL", "状态码", "标题", "服务器", "框架"];

    // 获取漏洞扫描结果详情
    const fetchScanDetail = async () => {
      try {
        isLoading.value = true;
        errorMessage.value = "";
        const response = await api.get(`/results/${scanId}`);
        scanResult.value = response.data;
        
        // 如果是未读状态，标记为已读
        if (scanResult.value && !scanResult.value.is_read) {
          await markAsRead();
        }
        
        isLoading.value = false;
      } catch (error) {
        console.error("获取漏洞扫描结果详情失败:", error);
        errorMessage.value = error.response?.data?.message || "获取数据失败，请稍后重试";
        isLoading.value = false;
      }
    };

    // 标记为已读
    const markAsRead = async () => {
      try {
        await api.put(`/results/${scanId}/read`, {
          is_read: true
        });
        if (scanResult.value) {
          scanResult.value.is_read = true;
        }
      } catch (error) {
        console.error("标记为已读失败:", error);
      }
    };

    // 复制到剪贴板
    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text).then(
        () => {
          showSuccessNotification("复制成功", "已复制到剪贴板");
        },
        () => {
          showErrorNotification("复制失败", "无法复制到剪贴板");
        }
      );
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

    // 提取端口数据
    const portsData = computed(() => {
      if (!scanResult.value || !scanResult.value.data) return [];
      
      const portsItem = scanResult.value.data.find(item => item.Key === "ports");
      if (!portsItem || !portsItem.Value) return [];
      
      return portsItem.Value;
    });
    
    // 端口分页数据
    const portsTotalPages = computed(() => {
      return Math.ceil(portsData.value.length / portsPageSize.value) || 1;
    });
    
    const paginatedPorts = computed(() => {
      const start = (portsCurrentPage.value - 1) * portsPageSize.value;
      const end = start + portsPageSize.value;
      return portsData.value.slice(start, end);
    });

    // 提取漏洞数据
    const vulnsData = computed(() => {
      if (!scanResult.value || !scanResult.value.data) return [];
      
      const vulnsItem = scanResult.value.data.find(item => item.Key === "vulns");
      if (!vulnsItem || !vulnsItem.Value) return [];
      
      return vulnsItem.Value;
    });
    
    // 漏洞分页数据
    const vulnsTotalPages = computed(() => {
      return Math.ceil(vulnsData.value.length / vulnsPageSize.value) || 1;
    });
    
    const paginatedVulns = computed(() => {
      const start = (vulnsCurrentPage.value - 1) * vulnsPageSize.value;
      const end = start + vulnsPageSize.value;
      return vulnsData.value.slice(start, end);
    });

    // 提取Web信息数据
    const webInfoData = computed(() => {
      if (!scanResult.value || !scanResult.value.data) return [];
      
      const webinfoItem = scanResult.value.data.find(item => item.Key === "webinfo");
      if (!webinfoItem || !webinfoItem.Value) return [];
      
      return webinfoItem.Value;
    });
    
    // Web信息分页数据
    const webInfoTotalPages = computed(() => {
      return Math.ceil(webInfoData.value.length / webInfoPageSize.value) || 1;
    });
    
    const paginatedWebInfo = computed(() => {
      const start = (webInfoCurrentPage.value - 1) * webInfoPageSize.value;
      const end = start + webInfoPageSize.value;
      return webInfoData.value.slice(start, end);
    });

    // 获取端口值
    const getPortValue = (port, key) => {
      if (!port) return null;
      const item = port.find(item => item.Key === key);
      // 后端API已更新，不再包含ANSI颜色代码
      return item ? item.Value : null;
    };

    // 获取漏洞值
    const getVulnValue = (vuln, key) => {
      if (!vuln) return null;
      const item = vuln.find(item => item.Key === key);
      // 后端API已更新，不再包含ANSI颜色代码
      return item ? item.Value : null;
    };

    // 获取Web信息值
    const getWebInfoValue = (webInfo, key) => {
      if (!webInfo) return null;
      const item = webInfo.find(item => item.Key === key);
      // 后端API已更新，不再包含ANSI颜色代码
      return item ? item.Value : null;
    };

    // 获取严重性等级的样式类
    const getSeverityClass = (severity) => {
      switch (severity?.toLowerCase()) {
        case 'critical':
          return 'bg-red-500/20 text-red-300 border border-red-500/30';
        case 'high':
          return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
        case 'medium':
          return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
        case 'low':
          return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
        case 'info':
          return 'bg-green-500/20 text-green-300 border border-green-500/30';
        default:
          return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
      }
    };

    // 获取HTTP状态码的样式类
    const getHttpStatusClass = (code) => {
      if (!code) return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
      
      code = Number(code);
      if (code >= 200 && code < 300) {
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      } else if (code >= 300 && code < 400) {
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      } else if (code >= 400 && code < 500) {
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      } else if (code >= 500) {
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      }
      return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    };
    
    // 端口分页方法
    const goToPortsPage = (page) => {
      if (page < 1) page = 1;
      if (page > portsTotalPages.value) page = portsTotalPages.value;
      portsCurrentPage.value = page;
    };
    
    const nextPortsPage = () => {
      if (portsCurrentPage.value < portsTotalPages.value) {
        portsCurrentPage.value++;
      }
    };
    
    const prevPortsPage = () => {
      if (portsCurrentPage.value > 1) {
        portsCurrentPage.value--;
      }
    };
    
    const changePortsPageSize = (size) => {
      portsPageSize.value = size;
      portsCurrentPage.value = 1; // 重置到第一页
    };
    
    // 漏洞分页方法
    const goToVulnsPage = (page) => {
      if (page < 1) page = 1;
      if (page > vulnsTotalPages.value) page = vulnsTotalPages.value;
      vulnsCurrentPage.value = page;
    };
    
    const nextVulnsPage = () => {
      if (vulnsCurrentPage.value < vulnsTotalPages.value) {
        vulnsCurrentPage.value++;
      }
    };
    
    const prevVulnsPage = () => {
      if (vulnsCurrentPage.value > 1) {
        vulnsCurrentPage.value--;
      }
    };
    
    const changeVulnsPageSize = (size) => {
      vulnsPageSize.value = size;
      vulnsCurrentPage.value = 1; // 重置到第一页
    };
    
    // Web信息分页方法
    const goToWebInfoPage = (page) => {
      if (page < 1) page = 1;
      if (page > webInfoTotalPages.value) page = webInfoTotalPages.value;
      webInfoCurrentPage.value = page;
    };
    
    const nextWebInfoPage = () => {
      if (webInfoCurrentPage.value < webInfoTotalPages.value) {
        webInfoCurrentPage.value++;
      }
    };
    
    const prevWebInfoPage = () => {
      if (webInfoCurrentPage.value > 1) {
        webInfoCurrentPage.value--;
      }
    };
    
    const changeWebInfoPageSize = (size) => {
      webInfoPageSize.value = size;
      webInfoCurrentPage.value = 1; // 重置到第一页
    };
    
    // 获取各类数据的数量
    const getPortsCount = computed(() => portsData.value.length);
    const getVulnsCount = computed(() => vulnsData.value.length);
    const getWebInfoCount = computed(() => webInfoData.value.length);

    onMounted(() => {
      fetchScanDetail();
    });

    return {
      scanResult,
      isLoading,
      errorMessage,
      activeTab,
      tabs,
      portsHeaders,
      vulnsHeaders,
      webInfoHeaders,
      portsData,
      vulnsData,
      webInfoData,
      formatDate,
      copyToClipboard,
      getPortValue,
      getVulnValue,
      getWebInfoValue,
      getSeverityClass,
      getHttpStatusClass,
      getPortsCount,
      getVulnsCount,
      getWebInfoCount,
      
      // 分页相关
      pageSizeOptions,
      
      // 端口分页
      portsCurrentPage,
      portsPageSize,
      portsTotalPages,
      paginatedPorts,
      goToPortsPage,
      nextPortsPage,
      prevPortsPage,
      changePortsPageSize,
      
      // 漏洞分页
      vulnsCurrentPage,
      vulnsPageSize,
      vulnsTotalPages,
      paginatedVulns,
      goToVulnsPage,
      nextVulnsPage,
      prevVulnsPage,
      changeVulnsPageSize,
      
      // Web信息分页
      webInfoCurrentPage,
      webInfoPageSize,
      webInfoTotalPages,
      paginatedWebInfo,
      goToWebInfoPage,
      nextWebInfoPage,
      prevWebInfoPage,
      changeWebInfoPageSize,
    };
  },
};
</script>

<style scoped>
.action-button {
  @apply text-xs px-2 py-1 rounded flex items-center transition-all duration-200;
}

.tool-button {
  @apply px-3 py-1.5 text-sm font-medium rounded-lg flex items-center transition-all duration-200 border focus:outline-none;
}

/* 分页按钮样式 */
.page-button {
  @apply flex items-center justify-center w-8 h-8 rounded-md
  bg-gray-800/50 text-gray-300 border border-gray-700/30
  hover:bg-gray-700/50 hover:text-gray-100 transition-all duration-200
  focus:outline-none focus:ring-1 focus:ring-blue-500/30;
}
</style> 