<template>
  <nav
    class="bg-white/80 backdrop-blur-md py-2 px-4 shadow-light-card fixed w-full z-10 transition-all duration-500 border-b border-light-border"
  >
    <div class="flex justify-between items-center">
      <!-- Logo区域 -->
      <div
        class="text-xl font-medium text-light-text-primary tracking-tight flex items-center group"
      >
        <a href="/" class="flex items-center hover:opacity-90 transition-opacity">
          <svg width="220" height="40" viewBox="0 0 220 40" class="h-10 mr-2">
            <title>YangMiee 攻击面梳理平台</title>
            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g>
                <!-- 月亮图标和星星 -->
                <path 
                  d="M22,5 C22,5 15,7 12,14 C9,21 11,30 19,35 C27,40 35,38 35,38 C35,38 29,31 28,24 C27,17 29,10 35,5 C28,5 22,5 22,5 Z" 
                  fill="#2F54EB" 
                  transform="translate(-4, -3)"
                />
                
                <!-- 星星1 - 小 -->
                <path
                  d="M40,8 L41.5,11 L45,11.5 L42.5,14 L43,17.5 L40,16 L37,17.5 L37.5,14 L35,11.5 L38.5,11 L40,8 Z"
                  fill="#4285F4"
                  transform="scale(0.6) translate(10, -5)"
                />
                
                <!-- 星星2 - 中 -->
                <path
                  d="M40,8 L41.5,11 L45,11.5 L42.5,14 L43,17.5 L40,16 L37,17.5 L37.5,14 L35,11.5 L38.5,11 L40,8 Z"
                  fill="#9277CD"
                  transform="scale(0.5) translate(20, 30)"
                />
                
                <!-- 星星3 - 闪烁效果 -->
                <path
                  d="M40,8 L41.5,11 L45,11.5 L42.5,14 L43,17.5 L40,16 L37,17.5 L37.5,14 L35,11.5 L38.5,11 L40,8 Z"
                  fill="#E57373"
                  transform="scale(0.4) translate(75, 15)"
                >
                  <animate 
                    attributeName="opacity" 
                    values="0.5;1;0.5" 
                    dur="3s" 
                    repeatCount="indefinite" 
                  />
                </path>
              </g>
              <!-- YangMiee文字 -->
              <g transform="translate(44.000000, 0.000000)">
                <defs>
                  <linearGradient id="yangmieeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#4285F4" />
                    <stop offset="50%" stop-color="#9277CD" />
                    <stop offset="100%" stop-color="#E57373" />
                  </linearGradient>
                </defs>
                <g font-family="Futura-MediumItalic, Futura" font-size="18" font-style="italic" font-weight="400">
                  <text fill="url(#yangmieeGradient)">
                    <tspan x="0" y="19">YangMiee</tspan>
                  </text>
                </g>
                <g transform="translate(0.000000, 23.000000)" font-size="12" font-style="italic" font-family="Futura-MediumItalic, Futura" font-weight="400">
                  <text fill="url(#yangmieeGradient)">
                    <tspan x="0" y="13">攻击面梳理平台</tspan>
                  </text>
                </g>
              </g>
            </g>
          </svg>
        </a>
      </div>

      <!-- 右侧操作区域 -->
      <div class="flex items-center space-x-3">
        <!-- 帮助文档按钮 -->
        <button
          @click="openHelpDocs"
          class="text-sm font-medium text-light-text-secondary hover:text-primary transition-all duration-300 px-2 py-1 rounded-lg hover:bg-primary/5 flex items-center"
        >
          <i class="ri-question-line"></i>
        </button>

        <!-- 未登录状态 -->
        <template v-if="!isAuthenticated">
          <router-link to="/login" v-slot="{ navigate }">
            <button
              @click="navigate"
              class="text-sm font-medium text-light-text-secondary hover:text-primary transition-all duration-300 px-3 py-1 rounded-lg hover:bg-primary/5"
            >
              <i class="ri-login-box-line mr-1"></i>
              登录
            </button>
          </router-link>
        </template>

        <!-- 登录状态 - 用户信息 -->
        <template v-else>
          <!-- 用户头像和下拉菜单 -->
          <div class="relative">
            <button
              @click="toggleDropdown('userMenu')"
              class="flex items-center space-x-1 text-light-text-secondary rounded-full hover:bg-primary/5 p-1 transition-all duration-300"
            >
              <div class="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <i class="ri-user-3-line"></i>
              </div>
              <i
                class="ri-arrow-down-s-line text-xs transition-transform duration-300"
                :class="{ 'rotate-180': dropdowns.userMenu }"
              ></i>
            </button>
            
            <!-- 用户菜单下拉内容 -->
            <div
              v-show="dropdowns.userMenu"
              class="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-lg shadow-light-dropdown p-2 border border-light-border"
              :class="{ 'dropdown-active': dropdowns.userMenu }"
            >
              <router-link to="/under-development" v-slot="{ navigate }">
                <button @click="navigate" class="dropdown-item">
                  <i class="ri-user-line mr-2"></i>
                  个人资料
                </button>
              </router-link>
              <router-link to="/under-development" v-slot="{ navigate }">
                <button @click="navigate" class="dropdown-item">
                  <i class="ri-settings-4-line mr-2"></i>
                  账户设置
                </button>
              </router-link>
              <div class="border-t border-light-border my-1"></div>
              <button @click="handleLogout" class="dropdown-item text-red-500 hover:text-red-600">
                <i class="ri-logout-box-line mr-2"></i>
                登出
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 通知组件 -->
    <PopupNotification
      v-if="showNotification"
      :message="notificationMessage"
      :emoji="notificationEmoji"
      :type="notificationType"
      @close="showNotification = false"
    />
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import PopupNotification from "./Utils/PopupNotification.vue";

// 组件状态
const router = useRouter();
const store = useStore();
const isAuthenticated = computed(() => store.state.isAuthenticated);
const showNotification = ref(false);
const notificationMessage = ref("");
const notificationEmoji = ref("");
const notificationType = ref("success");

// 下拉菜单状态
const dropdowns = ref({
  userMenu: false
});

// 切换下拉菜单
function toggleDropdown(menu) {
  dropdowns.value[menu] = !dropdowns.value[menu];
  
  // 关闭其他菜单
  Object.keys(dropdowns.value).forEach(key => {
    if (key !== menu) dropdowns.value[key] = false;
  });
}

// 点击外部关闭下拉菜单
function handleClickOutside(event) {
  if (!event.target.closest('.dropdown-menu') && !event.target.closest('button')) {
    Object.keys(dropdowns.value).forEach(key => {
      dropdowns.value[key] = false;
    });
  }
}

// 登出处理
async function handleLogout() {
  await store.dispatch('logout');
  showNotification.value = true;
  notificationMessage.value = "您已成功登出系统";
  notificationEmoji.value = "👋";
  notificationType.value = "info";
  router.push('/login');
}

// 打开帮助文档
function openHelpDocs() {
  // 实现帮助文档逻辑
  showNotification.value = true;
  notificationMessage.value = "帮助文档即将推出";
  notificationEmoji.value = "📚";
  notificationType.value = "info";
}

// 生命周期钩子
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* 导航菜单按钮 */
.nav-button {
  @apply text-sm font-medium text-light-text-secondary hover:text-primary transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-primary/5;
}

/* 下拉菜单项目 */
.dropdown-item {
  @apply flex items-center w-full text-left text-light-text-secondary hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-md text-sm transition-all duration-300;
}

/* 下拉菜单分类标题 */
.dropdown-category {
  @apply text-xs text-gray-400 font-medium px-3 py-1.5 uppercase tracking-wider;
}

/* 下拉菜单容器 */
.dropdown-menu {
  @apply absolute right-0 mt-2 bg-white/95 backdrop-blur-md rounded-lg shadow-light-dropdown p-2 border border-light-border transition-all duration-300 ease-out z-20 transform opacity-0 scale-95 origin-top;
}

/* 下拉菜单活动状态 */
.dropdown-active {
  @apply transform opacity-100 scale-100;
}
</style>
