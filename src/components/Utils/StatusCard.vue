<!-- StatusCard.vue -->
<template>
  <div class="bg-white/80 backdrop-blur-sm px-5 py-3 rounded-full flex items-center shadow-light-card border border-light-border">
    <div 
      class="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
      :class="iconBackgroundClass"
    >
      <i 
        class="text-lg"
        :class="iconClass"
      ></i>
    </div>
    <p class="text-sm font-medium text-light-text-primary">{{ message }}</p>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: "StatusCard",
  props: {
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "success",
      validator: (value) => 
        ["success", "error", "warning", "info"].includes(value),
    },
  },
  setup(props) {
    // 计算图标背景颜色
    const iconBackgroundClass = computed(() => {
      return {
        success: "bg-green-500/10 text-green-500",
        error: "bg-red-500/10 text-red-500",
        warning: "bg-yellow-500/10 text-yellow-600",
        info: "bg-blue-500/10 text-blue-500",
      }[props.type] || "bg-light-bg text-light-text-tertiary";
    });

    // 计算图标类名
    const iconClass = computed(() => {
      return {
        success: "ri-check-line",
        error: "ri-error-warning-line",
        warning: "ri-alert-line",
        info: "ri-information-line",
      }[props.type] || "ri-notification-line";
    });

    return {
      iconBackgroundClass,
      iconClass
    };
  }
};
</script>

<style scoped>
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
</style>
