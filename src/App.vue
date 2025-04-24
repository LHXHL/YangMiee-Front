<template>
  <div class="min-h-screen bg-light-bg">
    <HeaderPage />
    <SideBar v-if="isAuthenticated" />
    
    <!-- 主要内容区域 -->
    <div :class="{ 'pl-64': isAuthenticated, 'pl-0': !isAuthenticated }" class="pt-12 transition-all duration-300">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import HeaderPage from '@/components/HeaderPage.vue'
import SideBar from '@/components/SideBar.vue'

const store = useStore()
const isAuthenticated = computed(() => store.state.isAuthenticated)
</script>

<style scoped>
/* 添加一些全局样式效果 */
:deep(.transition-all) {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.duration-300) {
  transition-duration: 300ms;
}
</style>
