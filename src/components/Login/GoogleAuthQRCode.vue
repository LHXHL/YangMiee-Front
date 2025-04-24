<template>
  <div class="bg-light-gradient flex items-center justify-center min-h-screen p-4">
    <div
      class="bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-light-card w-full max-w-md border border-light-border register-card"
    >
      <div class="space-y-6">
        <!-- 标题区域 -->
        <div class="flex flex-col items-center text-center space-y-3">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 shadow-inner"
          >
            <i class="ri-shield-keyhole-line text-2xl text-emerald-500"></i>
          </div>
          <div>
            <h2 class="text-xl font-medium tracking-wide text-light-text-primary">
              设置双重认证
            </h2>
            <p class="text-light-text-tertiary text-sm mt-1">
              通过扫描二维码创建您的安全账户
            </p>
          </div>
        </div>

        <!-- 接口关闭状态 -->
        <div
          v-if="interfaceClosed"
          class="text-center p-6 bg-red-500/5 rounded-xl border border-red-500/20"
        >
          <div
            class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-3"
          >
            <i class="ri-close-circle-line text-xl text-red-500"></i>
          </div>
          <p class="text-red-500 text-sm font-medium mb-1">注册通道已关闭</p>
          <p class="text-light-text-secondary text-sm">系统维护中，请稍后重试</p>
        </div>

        <!-- 正常状态 -->
        <div v-else class="space-y-6">
          <!-- 二维码显示区域 -->
          <div v-if="qrCodeUrl" class="space-y-4">
            <div
              class="bg-light-bg p-6 rounded-2xl border border-light-border flex flex-col items-center qr-container hover:border-emerald-500/30 transition-colors duration-300"
            >
              <div class="qr-overlay flex items-center justify-center">
                <button @click="fetchQRCode" class="refresh-qr-button">
                  <i class="ri-refresh-line mr-1.5"></i>
                  刷新二维码
                </button>
              </div>
              <img
                :src="qrCodeUrl"
                alt="认证二维码"
                class="mx-auto w-48 h-48 qr-image"
              />
              <p class="text-xs text-light-text-tertiary mt-2">
                <i class="ri-time-line mr-1"></i>
                二维码有效期为10分钟
              </p>
            </div>

            <!-- 账户信息区域 -->
            <div
              class="bg-light-bg p-5 rounded-xl space-y-3 border border-light-border"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm text-light-text-tertiary">账户名称</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-light-text-primary font-mono">{{
                    accountName
                  }}</span>
                  <button
                    @click="copyAccountName"
                    class="p-1.5 hover:bg-light-bg-hover rounded-lg transition-colors relative"
                    :class="{ copied: copied }"
                    :title="copied ? '已复制' : '复制账户名'"
                  >
                    <i
                      class="ri-file-copy-line text-light-text-tertiary group-hover:text-light-text-secondary"
                    ></i>
                    <span v-if="copied" class="copy-indicator"></span>
                  </button>
                </div>
              </div>
              <div
                class="flex items-center gap-1.5 text-xs text-light-text-tertiary bg-blue-500/5 p-2 rounded-lg"
              >
                <i class="ri-information-line text-blue-500"></i>
                <span>请妥善保管账户名称，用于登录验证</span>
              </div>
            </div>
          </div>

          <!-- 加载状态 -->
          <div
            v-else-if="loading"
            class="flex flex-col items-center justify-center py-12"
          >
            <div class="loading-spinner mb-4"></div>
            <p class="text-sm text-light-text-secondary">正在生成二维码...</p>
          </div>

          <!-- 初始状态 -->
          <div
            v-else
            class="bg-light-bg p-5 rounded-xl border border-light-border space-y-4"
          >
            <div class="flex items-start gap-3">
              <div
                class="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"
              >
                <i class="ri-google-line"></i>
              </div>
              <div>
                <h3 class="text-sm font-medium text-light-text-primary mb-1">
                  使用 Google Authenticator
                </h3>
                <p class="text-xs text-light-text-tertiary leading-relaxed">
                  扫描二维码以启用双重认证，增强账户安全性
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div
                class="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"
              >
                <i class="ri-lock-password-line"></i>
              </div>
              <div>
                <h3 class="text-sm font-medium text-light-text-primary mb-1">
                  安全登录保障
                </h3>
                <p class="text-xs text-light-text-tertiary leading-relaxed">
                  通过验证码进行二次验证，有效防止未授权访问
                </p>
              </div>
            </div>
          </div>

          <!-- 按钮区域 -->
          <div class="space-y-3 pt-2">
            <button
              v-if="!qrCodeUrl"
              @click="fetchQRCode"
              :disabled="loading"
              class="primary-button"
            >
              <i class="ri-qr-code-line mr-1.5"></i>
              生成二维码
            </button>

            <button @click="goToLogin" class="secondary-button">
              <i class="ri-login-circle-line mr-1.5"></i>
              去登录
            </button>
          </div>
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useNotification } from "../../composables/useNotification";
import api from "../../api/axiosInstance";
import PopupNotification from "../Utils/PopupNotification.vue";

export default {
  name: "GoogleAuthQRCode",
  components: {
    PopupNotification,
  },
  setup() {
    const router = useRouter();
    const qrCodeUrl = ref("");
    const loading = ref(false);
    const interfaceClosed = ref(false);
    const accountName = ref("");
    const copied = ref(false);

    const {
      showNotification,
      notificationMessage,
      notificationType,
      showSuccess,
      showError,
    } = useNotification();

    const copyAccountName = async () => {
      try {
        await navigator.clipboard.writeText(accountName.value);
        copied.value = true;
        showSuccess("账户名已复制到剪贴板");
        setTimeout(() => {
          copied.value = false;
        }, 2000);
      } catch (err) {
        showError("复制失败，请手动复制");
      }
    };

    const fetchQRCode = async () => {
      loading.value = true;
      try {
        const response = await api.get("/auth/qrcode");
        const { qrcode, account } = response.data;
        qrCodeUrl.value = `data:image/png;base64,${qrcode}`;
        accountName.value = account;
        interfaceClosed.value = false;
        showSuccess("二维码已成功生成");
      } catch (error) {
        console.error("获取二维码失败:", error);
        interfaceClosed.value = true;

        if (error.response?.data?.error === "二维码接口已关闭") {
          showError("注册接口暂时关闭，请稍后再试");
        } else {
          showError("生成二维码失败，请重试");
        }
      } finally {
        loading.value = false;
      }
    };

    const goToLogin = () => {
      router.push("/login");
    };

    return {
      qrCodeUrl,
      loading,
      interfaceClosed,
      accountName,
      copied,
      fetchQRCode,
      copyAccountName,
      showNotification,
      notificationMessage,
      notificationType,
      goToLogin,
    };
  },
};
</script>

<style scoped>
/* 卡片动画 */
.register-card {
  animation: card-appear 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transform: translateY(20px);
  opacity: 0;
}

@keyframes card-appear {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 按钮样式 */
.primary-button {
  @apply w-full px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed;
}

.secondary-button {
  @apply w-full px-4 py-3 rounded-xl bg-light-bg hover:bg-light-bg-hover text-light-text-primary text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 flex items-center justify-center gap-2 border border-light-border;
}

/* 二维码样式 */
.qr-container {
  position: relative;
  overflow: hidden;
}

.qr-image {
  transition: filter 0.3s ease;
  filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.1));
}

.qr-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
  cursor: pointer;
}

.qr-container:hover .qr-overlay {
  opacity: 1;
}

.refresh-qr-button {
  @apply px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium transition-all duration-200 hover:bg-emerald-600 flex items-center;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

/* 复制指示器 */
.copy-indicator {
  position: absolute;
  width: 6px;
  height: 6px;
  background-color: #10b981;
  border-radius: 50%;
  bottom: 1px;
  right: 1px;
}

/* 加载动画 */
.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(16, 185, 129, 0.1);
  border-radius: 50%;
  border-top-color: #10b981;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}
</style>
