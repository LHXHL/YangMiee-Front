<template>
  <PageContainer>
    <!-- 系统运行信息卡片 -->
    <div
      class="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-light-card border border-light-border"
    >
      <!-- 标题和刷新按钮 -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-3">
          <div
            class="h-10 w-10 flex items-center justify-center bg-primary/10 rounded-lg"
          >
            <i class="ri-dashboard-3-line text-primary text-xl"></i>
          </div>
          <h2 class="text-xl font-medium tracking-wide text-light-text-primary">
            系统状态
          </h2>
        </div>
        <button
          @click="fetchSystemInfo"
          class="px-4 py-2.5 rounded-xl text-sm font-medium bg-white hover:bg-primary/5 text-light-text-secondary hover:text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 flex items-center group border border-light-border"
        >
          <i
            class="ri-refresh-line mr-2 group-hover:rotate-180 transition-transform duration-500"
          ></i>
          刷新信息
        </button>
      </div>

      <!-- 系统信息概览 -->
      <div
        class="mb-10 flex items-center justify-between bg-white/60 p-4 rounded-xl border border-light-border"
      >
        <div class="flex items-center">
          <div
            class="h-12 w-12 flex items-center justify-center bg-primary/10 rounded-full mr-4"
          >
            <i class="ri-server-line text-primary text-xl"></i>
          </div>
          <div>
            <p class="text-sm text-light-text-secondary">系统概览</p>
            <h3 class="text-lg font-medium text-light-text-primary">
              {{ systemInfo?.osDistribution || "加载中..." }}
            </h3>
          </div>
        </div>

        <div class="flex space-x-6">
          <div>
            <p class="text-sm text-light-text-secondary">内核版本</p>
            <p class="text-lg font-medium text-light-text-primary">
              {{ systemInfo?.kernelVersion || "加载中..." }}
            </p>
          </div>
          <div>
            <p class="text-sm text-light-text-secondary">运行权限</p>
            <p
              class="text-lg font-medium"
              :class="{ 'text-primary': systemInfo?.privileges === 'root' }"
            >
              {{ systemInfo?.privileges || "加载中..." }}
            </p>
          </div>
        </div>
      </div>

      <!-- 系统信息卡片 -->
      <div v-if="systemInfo">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- 当前路径卡片 -->
          <div class="info-card flex flex-col">
            <div class="flex items-center mb-3">
              <div
                class="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center mr-3"
              >
                <i class="ri-folder-line text-primary"></i>
              </div>
              <h3 class="text-sm font-medium text-light-text-secondary">程序运行目录</h3>
            </div>
            <div class="flex-1 flex items-center">
              <p class="text-sm text-light-text-primary overflow-hidden text-ellipsis">
                {{ systemInfo.currentDirectory }}
              </p>
            </div>
            <button
              @click="copyToClipboard(systemInfo.currentDirectory)"
              class="mt-3 text-xs text-light-text-secondary hover:text-primary transition-colors duration-300 flex items-center self-end"
            >
              <i class="ri-file-copy-line mr-1"></i> 复制路径
            </button>
          </div>

          <!-- 本机IP卡片 -->
          <div class="info-card">
            <div class="flex items-center mb-3">
              <div
                class="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center mr-3"
              >
                <i class="ri-computer-line text-primary"></i>
              </div>
              <h3 class="text-sm font-medium text-light-text-secondary">本机 IP</h3>
            </div>
            <div class="flex items-center">
              <p class="text-xl font-medium text-light-text-primary">
                {{ systemInfo.localIP }}
              </p>
            </div>
            <div class="mt-3 text-xs text-light-text-disabled">内部网络地址</div>
          </div>

          <!-- 外网IP卡片 -->
          <div class="info-card">
            <div class="flex items-center mb-3">
              <div
                class="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center mr-3"
              >
                <i class="ri-global-line text-primary"></i>
              </div>
              <h3 class="text-sm font-medium text-light-text-secondary">外网 IP</h3>
            </div>
            <div class="flex items-center">
              <p class="text-xl font-medium text-light-text-primary">
                {{ systemInfo.publicIP }}
              </p>
            </div>
            <div class="mt-3 text-xs text-light-text-disabled">公网访问地址</div>
          </div>
        </div>

        <!-- 系统信息图表部分 -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- CPU使用率图表（示例） -->
          <div
            class="bg-white/60 backdrop-blur-sm border border-light-border rounded-xl p-6 transition-all duration-200"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-medium text-light-text-secondary">CPU 使用率</h3>
              <span class="text-sm text-light-text-secondary">最近24小时</span>
            </div>
            <div class="h-40 flex items-end space-x-1">
              <div
                v-for="i in 24"
                :key="i"
                class="bg-primary/60 h-[80%] w-full rounded-t-sm"
                :style="`height: ${Math.floor(Math.random() * 80 + 10)}%`"
              ></div>
            </div>
            <div class="mt-2 grid grid-cols-4 text-xs text-light-text-disabled">
              <span>24h前</span>
              <span class="text-center">18h前</span>
              <span class="text-center">12h前</span>
              <span class="text-right">现在</span>
            </div>
          </div>

          <!-- 内存使用图表（示例） -->
          <div
            class="bg-white/60 backdrop-blur-sm border border-light-border rounded-xl p-6 transition-all duration-200"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-medium text-light-text-secondary">内存使用情况</h3>
              <span class="text-primary text-sm font-medium">68% 可用</span>
            </div>
            <div class="relative h-40 flex items-center justify-center">
              <div class="absolute inset-0 flex items-center justify-center">
                <svg class="w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    fill="none"
                    stroke="#f0f2f5"
                    stroke-width="8"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    fill="none"
                    stroke="#1890ff"
                    stroke-width="8"
                    stroke-dasharray="377"
                    stroke-dashoffset="120"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <div class="text-center z-10">
                <p class="text-2xl font-bold text-primary">68%</p>
                <p class="text-xs text-light-text-secondary">可用内存</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-16 text-sm text-light-text-secondary"
      >
        <svg
          class="animate-spin mb-4 h-10 w-10 text-primary/70"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p>获取系统信息中...</p>
        <p class="mt-2 text-xs text-light-text-disabled">这可能需要几秒钟时间</p>
      </div>
    </div>

    <PopupNotification
      v-if="showNotification"
      :message="notificationMessage"
      :type="notificationType"
      @close="showNotification = false"
    />
  </PageContainer>
</template>

<script>
import { ref, onMounted } from "vue";
import api from "../../api/axiosInstance";
import PageContainer from "../Utils/PageContainer.vue";
import PopupNotification from "../Utils/PopupNotification.vue";
import { useNotification } from "../../composables/useNotification";

export default {
  name: "SystemConfiguration",
  components: {
    PageContainer,
    PopupNotification,
  },
  setup() {
    const systemInfo = ref(null);

    const {
      showNotification,
      notificationMessage,
      notificationType,
      showSuccess,
      showError,
    } = useNotification();

    const systemInfoCards = {
      currentDirectory: { title: "程序运行目录", key: "currentDirectory" },
      localIP: { title: "本机 IP", key: "localIP" },
      publicIP: { title: "外网 IP", key: "publicIP" },
      kernelVersion: { title: "系统内核", key: "kernelVersion" },
      osDistribution: { title: "系统版本", key: "osDistribution" },
      privileges: { title: "运行权限", key: "privileges" },
    };

    const fetchSystemInfo = async () => {
      // 设置为null以显示加载状态
      systemInfo.value = null;

      try {
        const response = await api.get("/system/info");
        if (response.data?.data?.systemInfo) {
          // 延迟一点显示，让加载动画看起来更自然
          setTimeout(() => {
            systemInfo.value = response.data.data.systemInfo;
            showSuccess("系统信息已更新");
          }, 600);
        }
      } catch (error) {
        showError("获取系统信息失败");
      }
    };

    const copyToClipboard = (text) => {
      navigator.clipboard
        .writeText(text)
        .then(() => showSuccess("已复制到剪贴板"))
        .catch(() => showError("复制失败"));
    };

    onMounted(() => {
      fetchSystemInfo();
    });

    return {
      systemInfo,
      systemInfoCards,
      fetchSystemInfo,
      copyToClipboard,
      showNotification,
      notificationMessage,
      notificationType,
    };
  },
};
</script>

<style scoped>
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

/* 信息卡片通用样式 */
.info-card {
  @apply bg-white/70 backdrop-blur-sm border border-light-border rounded-xl p-6 transition-all duration-200 hover:shadow-light-dropdown hover:border-primary/20;
}

/* 优化按钮点击效果 */
button:active {
  transform: scale(0.98);
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
</style>
