<template>
  <Teleport to="body">
    <Transition name="notification">
      <div
        v-if="show"
        class="fixed top-6 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div
          :class="[
            'px-5 py-3 rounded-xl shadow-light-card max-w-md',
            'backdrop-blur-xl border',
            'flex items-center space-x-3',
            typeClasses,
          ]"
          role="alert"
        >
          <!-- 状态图标 -->
          <div
            :class="[
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
              iconBackgroundClass,
            ]"
          >
            <i :class="[iconClass, 'text-lg']"></i>
          </div>

          <!-- 消息文本 -->
          <div class="text-sm font-medium text-light-text-primary py-0.5">
            {{ message }}
          </div>

          <!-- 关闭按钮 -->
          <button
            v-if="showCloseButton"
            @click="closeNotification"
            class="ml-2 text-light-text-tertiary hover:text-light-text-secondary transition-colors duration-150 focus:outline-none"
            aria-label="关闭通知"
          >
            <i class="ri-close-line text-lg"></i>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted, onUnmounted } from "vue";

// eslint-disable-next-line no-undef
const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    default: 3000,
  },
  type: {
    type: String,
    default: "success",
    validator: (value) =>
      ["success", "error", "warning", "info"].includes(value),
  },
  showCloseButton: {
    type: Boolean,
    default: false,
  },
});

// eslint-disable-next-line no-undef
const emit = defineEmits(["close"]);

const show = ref(false);
let timer = null;

// 根据类型计算样式
const typeClasses = computed(() => {
  return (
    {
      success: "bg-white/90 border-green-500/30",
      error: "bg-white/90 border-red-500/30",
      warning: "bg-white/90 border-yellow-500/30",
      info: "bg-white/90 border-blue-500/30",
    }[props.type] || "bg-white/90 border-light-border"
  );
});

// 计算图标背景颜色
const iconBackgroundClass = computed(() => {
  return (
    {
      success: "bg-green-500/10 text-green-500",
      error: "bg-red-500/10 text-red-500",
      warning: "bg-yellow-500/10 text-yellow-600",
      info: "bg-blue-500/10 text-blue-500",
    }[props.type] || "bg-light-bg text-light-text-tertiary"
  );
});

// 计算图标类名
const iconClass = computed(() => {
  return (
    {
      success: "ri-check-line",
      error: "ri-error-warning-line",
      warning: "ri-alert-line",
      info: "ri-information-line",
    }[props.type] || "ri-notification-line"
  );
});

// 关闭通知
const closeNotification = () => {
  show.value = false;
  clearTimeout(timer);
  setTimeout(() => {
    emit("close");
  }, 300); // 等待淡出动画完成
};

// 设置自动关闭计时器
watchEffect(() => {
  if (props.duration > 0 && show.value) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      closeNotification();
    }, props.duration);
  }
});

// 显示通知
onMounted(() => {
  // 使用 nextTick 确保 DOM 已更新
  setTimeout(() => {
    show.value = true;
  }, 0);
});

// 清除计时器
onUnmounted(() => {
  clearTimeout(timer);
});
</script>

<style scoped>
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px);
}

.notification-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

/* 为了确保动画平滑，添加硬件加速 */
.fixed {
  will-change: transform;
  -webkit-font-smoothing: antialiased;
}
</style>
