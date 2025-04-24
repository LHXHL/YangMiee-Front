<template>
  <aside class="bg-white/90 backdrop-blur-md shadow-light-card h-screen w-64 fixed left-0 top-12 z-5 border-r border-light-border overflow-y-auto">
    <div class="py-4">
      <!-- 登录状态 - 导航菜单 -->
      <template v-if="isAuthenticated">
        <!-- 主页按钮 -->
        <router-link to="/" v-slot="{ navigate, isActive }">
          <button 
            @click="navigate" 
            class="w-full text-left px-4 py-3 flex items-center transition-all duration-300"
            :class="isActive ? 'bg-primary/10 text-primary' : 'text-light-text-secondary hover:bg-primary/5 hover:text-primary'"
          >
            <i class="ri-home-line mr-3 text-lg"></i>
            <span class="font-medium text-sm">主页</span>
          </button>
        </router-link>
        
        <!-- 仪表盘按钮 -->
        <router-link to="/dashboard" v-slot="{ navigate, isActive }">
          <button 
            @click="navigate" 
            class="w-full text-left px-4 py-3 flex items-center transition-all duration-300"
            :class="isActive ? 'bg-primary/10 text-primary' : 'text-light-text-secondary hover:bg-primary/5 hover:text-primary'"
          >
            <i class="ri-dashboard-line mr-3 text-lg"></i>
            <span class="font-medium text-sm">仪表盘</span>
          </button>
        </router-link>
        
        <!-- 攻击面分类 -->
        <div class="mt-2">
          <button 
            @click="toggleMenu('attackSurface')" 
            class="w-full text-left px-4 py-2 flex items-center justify-between transition-all duration-300 text-light-text-secondary hover:bg-primary/5 hover:text-primary"
          >
            <div class="flex items-center">
              <i class="ri-radar-line mr-3 text-lg"></i>
              <span class="font-medium text-sm">攻击面</span>
            </div>
            <i 
              class="ri-arrow-down-s-line transition-transform duration-300"
              :class="{ 'transform rotate-180': expandedMenus.attackSurface }"
            ></i>
          </button>
          
          <!-- 攻击面子菜单 -->
          <div v-show="expandedMenus.attackSurface" class="overflow-hidden transition-all duration-300">
            <!-- 子域名扫描 -->
            <router-link to="/subdomain-scan-results" v-slot="{ navigate, isActive }">
              <button 
                @click="navigate" 
                class="w-full text-left px-4 py-2 flex items-center transition-all duration-300 pl-10"
                :class="isActive ? 'bg-primary/10 text-primary' : 'text-light-text-secondary hover:bg-primary/5 hover:text-primary'"
              >
                <i class="ri-global-line mr-2 text-base"></i>
                <span class="font-medium text-sm">子域名扫描</span>
              </button>
            </router-link>
            
            <!-- 端口扫描 -->
            <router-link to="/port-scan-results" v-slot="{ navigate, isActive }">
              <button 
                @click="navigate" 
                class="w-full text-left px-4 py-2 flex items-center transition-all duration-300 pl-10"
                :class="isActive ? 'bg-primary/10 text-primary' : 'text-light-text-secondary hover:bg-primary/5 hover:text-primary'"
              >
                <i class="ri-scan-2-line mr-2 text-base"></i>
                <span class="font-medium text-sm">端口扫描</span>
              </button>
            </router-link>
            
            <!-- 路径扫描 -->
            <router-link to="/path-scan-results" v-slot="{ navigate, isActive }">
              <button 
                @click="navigate" 
                class="w-full text-left px-4 py-2 flex items-center transition-all duration-300 pl-10"
                :class="isActive ? 'bg-primary/10 text-primary' : 'text-light-text-secondary hover:bg-primary/5 hover:text-primary'"
              >
                <i class="ri-folders-line mr-2 text-base"></i>
                <span class="font-medium text-sm">路径扫描</span>
              </button>
            </router-link>
            
            <!-- 漏洞扫描 -->
            <router-link to="/gogo-scan-results" v-slot="{ navigate, isActive }">
              <button 
                @click="navigate" 
                class="w-full text-left px-4 py-2 flex items-center transition-all duration-300 pl-10"
                :class="isActive ? 'bg-primary/10 text-primary' : 'text-light-text-secondary hover:bg-primary/5 hover:text-primary'"
              >
                <i class="ri-bug-line mr-2 text-base"></i>
                <span class="font-medium text-sm">漏洞扫描</span>
              </button>
            </router-link>

            <!-- 综合扫描 -->
            <router-link to="/under-development" v-slot="{ navigate, isActive }">
              <button 
                @click="navigate" 
                class="w-full text-left px-4 py-2 flex items-center transition-all duration-300 pl-10"
                :class="isActive ? 'bg-primary/10 text-primary' : 'text-light-text-secondary hover:bg-primary/5 hover:text-primary'"
              >
                <i class="ri-focus-3-line mr-2 text-base"></i>
                <span class="font-medium text-sm">综合扫描</span>
              </button>
            </router-link>
          </div>
        </div>
        
        <!-- 工具分类 -->
        <div class="mt-2">
          <button 
            @click="toggleMenu('tools')" 
            class="w-full text-left px-4 py-2 flex items-center justify-between transition-all duration-300 text-light-text-secondary hover:bg-primary/5 hover:text-primary"
          >
            <div class="flex items-center">
              <i class="ri-tools-line mr-3 text-lg"></i>
              <span class="font-medium text-sm">轻武器库</span>
            </div>
            <i 
              class="ri-arrow-down-s-line transition-transform duration-300"
              :class="{ 'transform rotate-180': expandedMenus.tools }"
            ></i>
          </button>
          
          <!-- 工具子菜单 -->
          <div v-show="expandedMenus.tools" class="overflow-hidden transition-all duration-300">
            <!-- 加解密工具箱 -->
            <router-link to="/tools/crypto" v-slot="{ navigate, isActive }">
              <button 
                @click="navigate" 
                class="w-full text-left px-4 py-2 flex items-center transition-all duration-300 pl-10"
                :class="isActive ? 'bg-primary/10 text-primary' : 'text-light-text-secondary hover:bg-primary/5 hover:text-primary'"
              >
                <i class="ri-lock-line mr-2 text-base"></i>
                <span class="font-medium text-sm">加解密工具箱</span>
              </button>
            </router-link>
            
            <!-- 网络请求工具箱 -->
            <router-link to="/tools/http-request" v-slot="{ navigate, isActive }">
              <button 
                @click="navigate" 
                class="w-full text-left px-4 py-2 flex items-center transition-all duration-300 pl-10"
                :class="isActive ? 'bg-primary/10 text-primary' : 'text-light-text-secondary hover:bg-primary/5 hover:text-primary'"
              >
                <i class="ri-global-line mr-2 text-base"></i>
                <span class="font-medium text-sm">网络请求工具箱</span>
              </button>
            </router-link>
          </div>
        </div>
        
        <!-- 系统管理 -->
        <div class="mt-2">
          <button 
            @click="toggleMenu('system')" 
            class="w-full text-left px-4 py-2 flex items-center justify-between transition-all duration-300 text-light-text-secondary hover:bg-primary/5 hover:text-primary"
          >
            <div class="flex items-center">
              <i class="ri-settings-3-line mr-3 text-lg"></i>
              <span class="font-medium text-sm">系统管理</span>
            </div>
            <i 
              class="ri-arrow-down-s-line transition-transform duration-300"
              :class="{ 'transform rotate-180': expandedMenus.system }"
            ></i>
          </button>
          
          <!-- 系统管理子菜单 -->
          <div v-show="expandedMenus.system" class="overflow-hidden transition-all duration-300">
            <!-- 任务管理 -->
            <router-link to="/task-management" v-slot="{ navigate, isActive }">
              <button 
                @click="navigate" 
                class="w-full text-left px-4 py-2 flex items-center transition-all duration-300 pl-10"
                :class="isActive ? 'bg-primary/10 text-primary' : 'text-light-text-secondary hover:bg-primary/5 hover:text-primary'"
              >
                <i class="ri-task-line mr-2 text-base"></i>
                <span class="font-medium text-sm">任务管理</span>
              </button>
            </router-link>
            
            <!-- 系统配置 -->
            <router-link to="/system-configuration" v-slot="{ navigate, isActive }">
              <button 
                @click="navigate" 
                class="w-full text-left px-4 py-2 flex items-center transition-all duration-300 pl-10"
                :class="isActive ? 'bg-primary/10 text-primary' : 'text-light-text-secondary hover:bg-primary/5 hover:text-primary'"
              >
                <i class="ri-settings-3-line mr-2 text-base"></i>
                <span class="font-medium text-sm">系统配置</span>
              </button>
            </router-link>
            
            <!-- 工具配置 -->
            <router-link to="/tool-configuration" v-slot="{ navigate, isActive }">
              <button 
                @click="navigate" 
                class="w-full text-left px-4 py-2 flex items-center transition-all duration-300 pl-10"
                :class="isActive ? 'bg-primary/10 text-primary' : 'text-light-text-secondary hover:bg-primary/5 hover:text-primary'"
              >
                <i class="ri-tools-line mr-2 text-base"></i>
                <span class="font-medium text-sm">工具配置</span>
              </button>
            </router-link>
            
            <!-- 用户管理 -->
            <router-link to="/user-management" v-slot="{ navigate, isActive }">
              <button 
                @click="navigate" 
                class="w-full text-left px-4 py-2 flex items-center transition-all duration-300 pl-10"
                :class="isActive ? 'bg-primary/10 text-primary' : 'text-light-text-secondary hover:bg-primary/5 hover:text-primary'"
              >
                <i class="ri-user-settings-line mr-2 text-base"></i>
                <span class="font-medium text-sm">用户管理</span>
              </button>
            </router-link>
          </div>
        </div>
      </template>
      
      <!-- 未登录状态下的侧边栏内容 -->
      <template v-else>
        <div class="px-6 py-8 text-center">
          <div class="text-light-text-secondary mb-4">
            <i class="ri-lock-line text-3xl"></i>
          </div>
          <p class="text-light-text-secondary mb-4">请登录以访问系统功能</p>
          <router-link to="/login" v-slot="{ navigate }">
            <button
              @click="navigate"
              class="w-full bg-primary hover:bg-primary-light text-white transition-all duration-300 py-2 rounded-lg shadow-md hover:shadow-lg font-medium text-sm"
            >
              登录
            </button>
          </router-link>
          <router-link to="/setup-2fa" v-slot="{ navigate }">
            <button
              @click="navigate"
              class="w-full mt-2 bg-white hover:bg-gray-50 text-light-text-secondary border border-light-border transition-all duration-300 py-2 rounded-lg shadow-sm hover:shadow font-medium text-sm"
            >
              注册
            </button>
          </router-link>
        </div>
      </template>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

const store = useStore();
const route = useRoute();
const isAuthenticated = computed(() => store.state.isAuthenticated);

// 子菜单展开状态
const expandedMenus = ref({
  attackSurface: false,
  tools: false,
  system: false
});

// 切换子菜单展开状态
function toggleMenu(menu) {
  expandedMenus.value[menu] = !expandedMenus.value[menu];
}

// 根据当前路由自动展开对应的菜单
onMounted(() => {
  const path = route.path;
  
  if (path.includes('/subdomain') || path.includes('/port-scan') || 
      path.includes('/path-scan') || path.includes('/gogo-scan')) {
    expandedMenus.value.attackSurface = true;
  } else if (path.includes('/tools')) {
    expandedMenus.value.tools = true;
  } else if (path.includes('/task') || path.includes('/system') || 
             path.includes('/tool-configuration') || path.includes('/user')) {
    expandedMenus.value.system = true;
  }
});
</script>

<style scoped>
/* 自定义滚动条 */
aside::-webkit-scrollbar {
  width: 5px;
}

aside::-webkit-scrollbar-track {
  background: transparent;
}

aside::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

aside::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}
</style> 