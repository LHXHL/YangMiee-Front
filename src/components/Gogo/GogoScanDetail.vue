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
            to="/gogo-scan-results"
            class="hover:text-orange-500 transition-colors flex items-center"
          >
            <i class="ri-arrow-left-line mr-1"></i>
            返回列表
          </router-link>
          <i class="ri-arrow-right-s-line mx-2"></i>
          <span class="text-light-text-primary">漏洞扫描详情</span>
        </div>

        <!-- 标题和基本信息卡片 -->
        <div
          class="bg-white/90 rounded-xl border border-light-border mb-6 overflow-hidden shadow-sm"
        >
          <div
            class="p-5 border-b border-light-border flex items-center space-x-3"
          >
            <div
              class="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center"
            >
              <i class="ri-bug-line text-orange-500 text-xl"></i>
            </div>
            <div>
              <h2 class="text-xl font-medium tracking-wide text-light-text-primary">
                {{ scanResult?.target || "加载中..." }}
              </h2>
              <p class="text-sm text-light-text-secondary mt-1">漏洞扫描结果详情</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-5">
            <div class="flex flex-col">
              <span class="text-sm text-light-text-tertiary mb-1 flex items-center">
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
              <span class="text-sm text-light-text-tertiary mb-1 flex items-center">
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
              <span class="text-sm text-light-text-tertiary mb-1 flex items-center">
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
            class="bg-white/90 rounded-xl border border-light-border p-4 flex flex-col shadow-sm"
          >
            <span class="text-sm text-light-text-tertiary mb-1">端口数量</span>
            <span class="text-2xl font-medium text-light-text-primary">{{ portsCount }}</span>
          </div>

          <div
            class="bg-white/90 rounded-xl border border-light-border p-4 flex flex-col shadow-sm"
          >
            <span class="text-sm text-light-text-tertiary mb-1">HTTP服务</span>
            <span class="text-2xl font-medium text-purple-500">
              {{ httpServiceCount }}
            </span>
          </div>

          <div
            class="bg-white/90 rounded-xl border border-light-border p-4 flex flex-col shadow-sm"
          >
            <span class="text-sm text-light-text-tertiary mb-1">漏洞数量</span>
            <span class="text-2xl font-medium text-red-500">
              {{ vulnsCount }}
            </span>
          </div>

          <div
            class="bg-white/90 rounded-xl border border-light-border p-4 flex flex-col shadow-sm"
          >
            <span class="text-sm text-light-text-tertiary mb-1">扫描耗时</span>
            <span class="text-2xl font-medium text-blue-500">
              {{ scanDuration }} 秒
            </span>
          </div>
        </div>

        <!-- 内容TAB标签切换 -->
        <div class="mb-6 border-b border-light-border">
          <div class="flex overflow-x-auto hide-scrollbar">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="px-5 py-3 font-medium text-sm whitespace-nowrap transition-all duration-200 border-b-2 mx-1 first:ml-0"
              :class="
                activeTab === tab.id
                  ? 'text-orange-500 border-orange-500'
                  : 'text-light-text-tertiary border-transparent hover:text-light-text-secondary hover:border-light-border'
              "
            >
              <i :class="[tab.icon, 'mr-2']"></i>
              {{ tab.name }}
              <span
                v-if="tab.count !== undefined"
                class="ml-2 text-xs py-0.5 px-2 rounded-full bg-light-bg"
                :class="
                  activeTab === tab.id ? 'text-orange-500' : 'text-light-text-tertiary'
                "
              >
                {{ tab.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- 漏洞信息Tab -->
        <div v-if="activeTab === 'vulns'" class="space-y-4">
          <div
            class="bg-white/90 rounded-xl border border-light-border overflow-hidden shadow-sm"
          >
            <div class="p-4 border-b border-light-border flex justify-between">
              <h3 class="font-medium text-light-text-primary">
                <i class="ri-error-warning-line mr-2 text-red-500"></i>
                漏洞信息
              </h3>
            </div>

            <div class="divide-y divide-light-border">
              <div
                v-for="(vuln, index) in vulnerabilityList"
                :key="index"
                class="p-4 transition-colors hover:bg-light-bg/50"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center mb-2">
                      <span
                        class="px-2 py-0.5 text-xs font-medium rounded-md mr-2"
                        :class="{
                          'bg-red-500/10 text-red-500 border border-red-500/30':
                            vuln.severity === 'high',
                          'bg-yellow-500/10 text-yellow-600 border border-yellow-500/30':
                            vuln.severity === 'medium',
                          'bg-blue-500/10 text-blue-500 border border-blue-500/30':
                            vuln.severity === 'low',
                        }"
                      >
                        {{ getSeverityText(vuln.severity) }}
                      </span>
                      <h4 class="font-medium text-light-text-primary">
                        {{ vuln.type || "未知漏洞类型" }}
                      </h4>
                    </div>
                    <p class="text-sm text-light-text-secondary mt-1">
                      {{ vuln.description || "无详细描述" }}
                    </p>
                    <div class="mt-2 text-sm text-light-text-tertiary">
                      <span class="font-mono">目标: {{ vuln.target }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="vulnerabilityList.length === 0"
                class="p-8 text-center text-light-text-tertiary"
              >
                <i class="ri-shield-check-line text-3xl mb-2 block"></i>
                <p>未发现漏洞信息</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 端口信息Tab -->
        <div v-if="activeTab === 'ports'" class="space-y-4">
          <div
            class="bg-white/90 rounded-xl border border-light-border overflow-hidden shadow-sm"
          >
            <div class="p-4 border-b border-light-border flex justify-between">
              <h3 class="font-medium text-light-text-primary">
                <i class="ri-door-open-line mr-2 text-orange-500"></i>
                开放端口列表
              </h3>
            </div>

            <div class="divide-y divide-light-border">
              <div v-if="portsList.length === 0" class="p-8 text-center text-light-text-tertiary">
                <i class="ri-door-lock-line text-3xl mb-2 block"></i>
                <p>未检测到开放端口</p>
              </div>

              <div
                v-else
                class="relative overflow-x-auto"
              >
                <table class="min-w-full divide-y divide-light-border">
                  <thead class="bg-light-bg">
                    <tr>
                      <th
                        v-for="header in portTableHeaders"
                        :key="header"
                        class="px-4 py-3 text-left text-xs font-medium text-light-text-secondary uppercase tracking-wider"
                      >
                        {{ header }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-light-border">
                    <tr
                      v-for="(port, index) in portsList"
                      :key="index"
                      class="hover:bg-light-bg/50 transition-colors"
                    >
                      <td class="px-4 py-3 text-sm font-medium text-light-text-primary">
                        <div class="flex items-center">
                          <span
                            class="w-2 h-2 rounded-full mr-2"
                            :class="
                              getPortValue(port, 'status') === 'open'
                                ? 'bg-green-500'
                                : 'bg-red-500'
                            "
                          ></span>
                          {{ getPortValue(port, 'port') }}
                        </div>
                      </td>
                      <td class="px-4 py-3 text-sm text-light-text-primary font-mono lowercase">
                        {{ getPortValue(port, 'protocol') || 'tcp' }}
                      </td>
                      <td class="px-4 py-3 text-sm text-light-text-primary font-mono">
                        {{ getPortValue(port, 'host') || '-' }}
                      </td>
                      <td class="px-4 py-3 text-sm text-light-text-primary">
                        {{ getPortValue(port, 'service') || '-' }}
                      </td>
                      <td class="px-4 py-3 text-sm text-light-text-primary">
                        {{ getPortValue(port, 'status') || '-' }}
                      </td>
                      <td class="px-4 py-3 text-sm text-light-text-primary">
                        <div class="max-w-md truncate">
                          {{ getPortValue(port, 'info') || '-' }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Web信息Tab -->
        <div v-if="activeTab === 'webinfo'" class="space-y-4">
          <div
            class="bg-white/90 rounded-xl border border-light-border overflow-hidden shadow-sm"
          >
            <div class="p-4 border-b border-light-border flex justify-between">
              <h3 class="font-medium text-light-text-primary">
                <i class="ri-global-line mr-2 text-blue-500"></i>
                Web服务信息
              </h3>
            </div>

            <div class="divide-y divide-light-border">
              <div v-if="webInfoList.length === 0" class="p-8 text-center text-light-text-tertiary">
                <i class="ri-global-off-line text-3xl mb-2 block"></i>
                <p>未检测到Web服务</p>
              </div>

              <div
                v-for="(webInfo, index) in webInfoList"
                :key="index"
                class="p-4 transition-colors hover:bg-light-bg/50"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center mb-2">
                      <span
                        class="px-2 py-0.5 text-xs font-medium rounded-md mr-2"
                        :class="{
                          'bg-green-500/10 text-green-600 border border-green-500/30':
                            getWebInfoValue(webInfo, 'code') >= 200 &&
                            getWebInfoValue(webInfo, 'code') < 300,
                          'bg-yellow-500/10 text-yellow-600 border border-yellow-500/30':
                            getWebInfoValue(webInfo, 'code') >= 300 &&
                            getWebInfoValue(webInfo, 'code') < 400,
                          'bg-red-500/10 text-red-500 border border-red-500/30':
                            getWebInfoValue(webInfo, 'code') >= 400,
                        }"
                      >
                        HTTP {{ getWebInfoValue(webInfo, 'code') }}
                      </span>
                      <h4 class="font-medium text-light-text-primary font-mono break-all">
                        {{ getWebInfoValue(webInfo, 'url') }}
                      </h4>
                    </div>
                    <div class="mt-2 text-sm text-light-text-secondary grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <span class="text-light-text-tertiary">标题:</span>
                        {{ getWebInfoValue(webInfo, 'title') || '-' }}
                      </div>
                      <div>
                        <span class="text-light-text-tertiary">服务器:</span>
                        {{ getWebInfoValue(webInfo, 'server') || '-' }}
                      </div>
                      <div>
                        <span class="text-light-text-tertiary">框架:</span>
                        {{ getWebInfoValue(webInfo, 'framework') || '-' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 原始数据Tab -->
        <div v-if="activeTab === 'raw'" class="space-y-4">
          <div
            class="bg-white/90 rounded-xl border border-light-border overflow-hidden shadow-sm"
          >
            <div class="p-4 border-b border-light-border flex justify-between">
              <h3 class="font-medium text-light-text-primary">
                <i class="ri-code-box-line mr-2 text-light-text-tertiary"></i>
                原始扫描数据
              </h3>
              <button
                @click="copyToClipboard(JSON.stringify(scanResult, null, 2))"
                class="text-xs bg-light-bg hover:bg-light-bg-hover text-light-text-primary px-3 py-1 rounded-md flex items-center"
              >
                <i class="ri-clipboard-line mr-1.5"></i>
                复制JSON
              </button>
            </div>
            <div class="p-4 max-h-[500px] overflow-auto custom-scrollbar">
              <pre
                class="text-xs text-light-text-primary font-mono whitespace-pre-wrap bg-light-bg p-4 rounded-lg"
              >{{ JSON.stringify(scanResult, null, 2) }}</pre>
            </div>
          </div>
        </div>

        <!-- 操作按钮区 -->
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="router.push('/gogo-scan-results')"
            class="px-4 py-2.5 rounded-xl text-sm font-medium bg-light-bg hover:bg-light-bg-hover text-light-text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-light-border flex items-center"
          >
            <i class="ri-arrow-left-line mr-2"></i>
            返回列表
          </button>
          
          <button
            @click="handleMarkAsRead"
            v-if="scanResult && !scanResult.is_read"
            class="px-4 py-2.5 rounded-xl text-sm font-medium bg-green-500/10 hover:bg-green-500/20 text-green-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 flex items-center border border-green-500/30"
          >
            <i class="ri-check-line mr-2"></i>
            标记为已读
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
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import HeaderPage from "../HeaderPage.vue";
import PopupNotification from "../Utils/PopupNotification.vue";
import api from "../../api/axiosInstance";
import { useNotification } from "../../composables/useNotification";

export default {
  name: "GogoScanDetail",
  components: {
    HeaderPage,
    PopupNotification,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const scanId = route.params.id;
    const scanResult = ref(null);
    const isLoading = ref(true);
    const errorMessage = ref("");
    const activeTab = ref("vulns");

    const { showNotification, notificationMessage, notificationType, showSuccess, showError} =
      useNotification();

    // 获取扫描详情
    const fetchScanDetail = async () => {
      isLoading.value = true;
      errorMessage.value = "";

      try {
        const response = await api.get(`/results/${scanId}`);
        scanResult.value = response.data;
      } catch (error) {
        console.error("Failed to fetch scan details:", error);
        errorMessage.value =
          "获取扫描详情失败：" +
          (error.response?.data?.message || error.message || "未知错误");
        showError("获取扫描详情失败", "error");
      } finally {
        isLoading.value = false;
      }
    };

    // 复制到剪贴板
    const copyToClipboard = (text) => {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          showSuccess("已复制到剪贴板", "success");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
          showError("复制失败", "error");
        });
    };

    // 格式化日期
    const formatDate = (timestamp) => {
      if (!timestamp) return "-";
      try {
        return new Date(timestamp).toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      } catch (e) {
        return timestamp || "未知时间";
      }
    };

    // 获取端口列表
    const portsList = computed(() => {
      if (!scanResult.value || !scanResult.value.data) return [];
      const portsGroup = scanResult.value.data.find(
        (group) => group.Key === "ports"
      );
      return portsGroup ? portsGroup.Value || [] : [];
    });

    // 获取漏洞列表
    const vulnerabilityList = computed(() => {
      if (!scanResult.value || !scanResult.value.data) return [];
      const vulnsGroup = scanResult.value.data.find(
        (group) => group.Key === "vulns"
      );
      
      if (!vulnsGroup || !vulnsGroup.Value) return [];
      
      return vulnsGroup.Value.map(vuln => {
        const vulnObj = {};
        vuln.forEach(item => {
          vulnObj[item.Key] = item.Value;
        });
        return vulnObj;
      });
    });

    // 获取Web信息列表
    const webInfoList = computed(() => {
      if (!scanResult.value || !scanResult.value.data) return [];
      const webInfoGroup = scanResult.value.data.find(
        (group) => group.Key === "webinfo"
      );
      return webInfoGroup ? webInfoGroup.Value || [] : [];
    });

    // 处理标记为已读
    const handleMarkAsRead = async () => {
      try {
        await api.put(`/results/${scanId}/read`, { is_read: true });
        scanResult.value.is_read = true;
        showSuccess("已将扫描结果标记为已读");
      } catch (error) {
        console.error("Failed to mark as read:", error);
        showError(
          "标记为已读失败: " +
            (error.response?.data?.message || error.message || "未知错误")
        );
      }
    };

    // 计算端口数量
    const portsCount = computed(() => portsList.value.length);

    // 计算HTTP服务数量
    const httpServiceCount = computed(() => {
      return portsList.value.filter(port => {
        const protocol = getPortValue(port, 'protocol');
        return protocol === 'http' || protocol === 'https';
      }).length;
    });

    // 计算漏洞数量
    const vulnsCount = computed(() => vulnerabilityList.value.length);

    // 获取扫描耗时
    const scanDuration = computed(() => {
      if (!scanResult.value || !scanResult.value.data) return '-';
      const durationGroup = scanResult.value.data.find(
        (group) => group.Key === "scanduration"
      );
      if (!durationGroup) return '-';
      return parseFloat(durationGroup.Value).toFixed(2);
    });

    // 获取端口详情中的指定字段值
    const getPortValue = (port, field) => {
      if (!port || !Array.isArray(port)) return null;
      const fieldItem = port.find((item) => item.Key === field);
      return fieldItem ? fieldItem.Value : null;
    };

    // 获取Web信息中的指定字段值
    const getWebInfoValue = (webInfo, field) => {
      if (!webInfo || !Array.isArray(webInfo)) return null;
      const fieldItem = webInfo.find((item) => item.Key === field);
      return fieldItem ? fieldItem.Value : null;
    };

    // 获取漏洞严重性文本
    const getSeverityText = (severity) => {
      switch (severity) {
        case 'high':
          return '高危';
        case 'medium':
          return '中危';
        case 'low':
          return '低危';
        default:
          return '未知';
      }
    };

    // 端口表格头部
    const portTableHeaders = [
      "端口",
      "协议",
      "主机",
      "服务",
      "状态",
      "详细信息"
    ];

    // 标签页定义
    const tabs = computed(() => [
      {
        id: "vulns",
        name: "漏洞信息",
        icon: "ri-error-warning-line",
        count: vulnsCount.value,
      },
      {
        id: "ports",
        name: "端口信息",
        icon: "ri-door-open-line",
        count: portsCount.value,
      },
      {
        id: "webinfo",
        name: "Web服务",
        icon: "ri-global-line",
        count: webInfoList.value.length,
      },
      {
        id: "raw",
        name: "原始数据",
        icon: "ri-code-box-line",
      },
    ]);

    onMounted(() => {
      fetchScanDetail();
    });

    return {
      scanResult,
      isLoading,
      errorMessage,
      activeTab,
      portsList,
      vulnerabilityList,
      webInfoList,
      showNotification,
      notificationMessage,
      notificationType,
      router,
      tabs,
      portsCount,
      httpServiceCount,
      vulnsCount,
      scanDuration,
      portTableHeaders,
      formatDate,
      copyToClipboard,
      handleMarkAsRead,
      getPortValue,
      getWebInfoValue,
      getSeverityText,
    };
  },
};
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

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