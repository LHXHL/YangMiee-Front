<template>
  <PageContainer>
    <div class="bg-white/90 backdrop-blur-sm shadow-light-card rounded-2xl p-6 border border-light-border">
      <!-- 标题和介绍 -->
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-medium text-light-text-primary mb-2">
          <i class="ri-tools-line mr-2 text-primary"></i>轻量武器库
        </h1>
        <p class="text-light-text-secondary text-sm">提供常用的技术工具，助您快速完成日常工作</p>
      </div>

      <!-- 工具标签页 -->
      <div class="mb-6">
        <div class="flex border-b border-light-border">
          <router-link 
            v-for="tab in tabs" 
            :key="tab.id"
            :to="tab.route"
            custom
            v-slot="{ isActive, navigate }"
          >
            <button 
              @click="navigate"
              class="px-4 py-2 flex items-center text-sm font-medium transition-colors duration-200"
              :class="isActive ? 'text-primary border-b-2 border-primary' : 'text-light-text-secondary hover:text-primary'"
            >
              <i :class="tab.icon" class="mr-2"></i>
              {{ tab.name }}
            </button>
          </router-link>
        </div>
      </div>

      <!-- 工具内容区域 - 使用router-view显示子路由组件 -->
      <div class="border border-light-border rounded-xl overflow-hidden bg-gray-50/50">
        <router-view></router-view>
      </div>
    </div>
  </PageContainer>

</template>

<script>
import PageContainer from "../Utils/PageContainer.vue";
export default {
  name: 'ToolsContainer',
  components: {
    PageContainer,
  },
  setup() {
    const tabs = [
      { id: 'crypto', name: '加解密工具箱', icon: 'ri-lock-line', route: '/tools/crypto' },
      { id: 'http', name: '网络请求工具箱', icon: 'ri-global-line', route: '/tools/http-request' }
    ];

    return {
      tabs
    };
  }
};
</script>

<style scoped>
/* 自定义滚动条样式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style> 