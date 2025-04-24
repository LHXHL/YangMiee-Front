<template>
  <div class="bg-light-gradient text-light-text-primary flex flex-col min-h-screen">
    <div class="container mx-auto px-6 py-6 flex-1 mb-4">
      <!-- 仪表盘标题 -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <h1 class="text-xl font-medium text-light-text-primary flex items-center">
            <i class="ri-dashboard-line mr-2 text-primary"></i>
            系统仪表盘
          </h1>
        </div>
        
        <button 
          @click="refreshData" 
          class="px-4 py-2 rounded-xl text-sm font-medium bg-white/80 hover:bg-white/90 text-light-text-secondary hover:text-primary transition-all duration-200 flex items-center border border-light-border shadow-light-card"
          :disabled="isLoading"
        >
          <i class="ri-refresh-line mr-2" :class="{ 'animate-spin': isLoading }"></i>
          {{ isLoading ? '加载中...' : '刷新数据' }}
        </button>
      </div>

      <!-- 主内容区 -->
      <div class="bg-white/70 backdrop-blur-xl p-5 rounded-2xl shadow-light-card border border-light-border">
        <!-- 顶部标题 -->
        <div class="flex items-center mb-4 text-primary">
          <i class="ri-apps-line mr-2"></i>
          <h2 class="text-base font-medium text-light-text-primary">系统仪表盘</h2>
        </div>
        
        <!-- 统计数据卡片 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
          <div class="bg-white/90 rounded-lg p-4 border border-light-border flex items-center shadow-light-card">
            <div class="text-3xl text-primary p-2.5 bg-primary/10 rounded-lg mr-3">
              <i class="ri-task-line"></i>
            </div>
            <div>
              <div class="text-light-text-secondary text-xs mb-1">任务总数</div>
              <div class="text-light-text-primary text-2xl font-medium">{{ stats.taskCount }}</div>
            </div>
          </div>
          
          <div class="bg-white/90 rounded-lg p-4 border border-light-border flex items-center shadow-light-card">
            <div class="text-3xl text-primary p-2.5 bg-primary/10 rounded-lg mr-3">
              <i class="ri-global-line"></i>
            </div>
            <div>
              <div class="text-light-text-secondary text-xs mb-1">子域名</div>
              <div class="text-light-text-primary text-2xl font-medium">{{ stats.subdomainCount }}</div>
            </div>
          </div>
          
          <div class="bg-white/90 rounded-lg p-4 border border-light-border flex items-center shadow-light-card">
            <div class="text-3xl text-primary p-2.5 bg-primary/10 rounded-lg mr-3">
              <i class="ri-folders-line"></i>
            </div>
            <div>
              <div class="text-light-text-secondary text-xs mb-1">路径数量</div>
              <div class="text-light-text-primary text-2xl font-medium">{{ stats.pathCount }}</div>
            </div>
          </div>
          
          <div class="bg-white/90 rounded-lg p-4 border border-light-border flex items-center shadow-light-card">
            <div class="text-3xl text-primary p-2.5 bg-primary/10 rounded-lg mr-3">
              <i class="ri-bug-line"></i>
            </div>
            <div>
              <div class="text-light-text-secondary text-xs mb-1">漏洞</div>
              <div class="text-light-text-primary text-2xl font-medium">{{ stats.vulnCount }}</div>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
          <!-- 任务信息 -->
          <div class="bg-white/90 rounded-lg p-4 border border-light-border shadow-light-card">
            <div class="flex items-center mb-3 text-primary">
              <i class="ri-task-line mr-2"></i>
              <h2 class="text-sm font-medium text-light-text-primary">任务信息</h2>
            </div>
            
            <div v-if="tasks.length === 0 && !isLoading" class="text-center py-8 text-light-text-secondary">
              暂无任务数据
            </div>
            
            <div v-else-if="isLoading" class="text-center py-8 text-light-text-secondary">
              <i class="ri-loader-2-line animate-spin text-xl"></i>
              <p class="mt-2">加载中...</p>
            </div>
            
            <div v-else class="mt-2 overflow-x-auto max-h-80 overflow-y-auto pr-1">
              <table class="min-w-full">
                <thead class="sticky top-0 bg-white/95 z-10">
                  <tr class="border-b border-light-border text-left">
                    <th class="pb-2 pl-2 text-light-text-secondary font-medium text-xs">任务名称</th>
                    <th class="pb-2 pl-2 text-light-text-secondary font-medium text-xs">任务类型</th>
                    <th class="pb-2 pl-2 text-light-text-secondary font-medium text-xs">任务状态</th>
                    <th class="pb-2 pl-2 text-light-text-secondary font-medium text-xs">创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="task in tasks" :key="task.id" class="border-b border-light-border hover:bg-light-bg-active">
                    <td class="py-2.5 pl-2 text-light-text-primary text-sm">{{ task.id }}</td>
                    <td class="py-2.5 pl-2">
                      <span class="bg-primary/10 text-primary text-xs py-0.5 px-2 rounded-full">{{ task.type || '未知' }}</span>
                    </td>
                    <td class="py-2.5 pl-2">
                      <div class="flex items-center">
                        <div class="w-28 bg-light-bg rounded-full h-1.5 mr-2">
                          <div 
                            class="h-1.5 rounded-full" 
                            :class="getStatusColorClass(task.status)"
                            :style="{ width: getTaskProgressWidth(task.status) }"
                          ></div>
                        </div>
                        <i 
                          :class="getStatusIconClass(task.status)" 
                          class="text-sm"
                        ></i>
                      </div>
                    </td>
                    <td class="py-2.5 pl-2 text-light-text-secondary text-xs">{{ formatDate(task.created_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- 最近活动 -->
          <div class="bg-white/90 rounded-lg p-4 border border-light-border shadow-light-card">
            <div class="flex items-center mb-3 text-primary">
              <i class="ri-history-line mr-2"></i>
              <h2 class="text-sm font-medium text-light-text-primary">最近活动</h2>
            </div>
            
            <div v-if="activities.length === 0 && !isLoading" class="text-center py-8 text-light-text-secondary">
              暂无活动记录
            </div>
            
            <div v-else-if="isLoading" class="text-center py-8 text-light-text-secondary">
              <i class="ri-loader-2-line animate-spin text-xl"></i>
              <p class="mt-2">加载中...</p>
            </div>
            
            <div v-else class="space-y-3 mt-2 max-h-80 overflow-y-auto pr-1">
              <div 
                v-for="(activity, index) in activities" 
                :key="index" 
                class="flex items-start p-2.5 border border-light-border rounded-lg bg-white/70"
              >
                <div class="bg-light-bg rounded-full p-1.5 mr-3 flex-shrink-0">
                  <i class="ri-time-line text-light-text-secondary"></i>
                </div>
                <div>
                  <div class="text-light-text-primary font-medium text-sm">{{ formatTime(activity.timestamp) }}</div>
                  <div class="text-light-text-secondary text-xs flex items-center mt-1">
                    {{ activity.message }}
                    <i :class="getActivityIconClass(activity.type)" class="ml-2"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 图表区域 - 对应图片中的红框区域 -->
        <div class="bg-white/90 rounded-lg p-4 border border-light-border shadow-light-card">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center text-primary">
              <i class="ri-cloud-line mr-2"></i>
              <h2 class="text-sm font-medium text-light-text-primary">天气与每日灵感</h2>
            </div>
            <div class="flex space-x-2">
              <button 
                @click="setWeatherLocation('beijing')" 
                class="px-2 py-1 rounded text-xs" 
                :class="currentLocation === 'beijing' ? 'bg-primary text-white' : 'bg-light-bg hover:bg-light-bg-active text-light-text-secondary'"
              >北京</button>
              <button 
                @click="setWeatherLocation('shanghai')" 
                class="px-2 py-1 rounded text-xs" 
                :class="currentLocation === 'shanghai' ? 'bg-primary text-white' : 'bg-light-bg hover:bg-light-bg-active text-light-text-secondary'"
              >上海</button>
              <button 
                @click="setWeatherLocation('guangzhou')" 
                class="px-2 py-1 rounded text-xs" 
                :class="currentLocation === 'guangzhou' ? 'bg-primary text-white' : 'bg-light-bg hover:bg-light-bg-active text-light-text-secondary'"
              >广州</button>
            </div>
          </div>
          
          <!-- 天气和每日一句内容 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- 天气信息卡片 -->
            <div class="bg-white/80 rounded-lg border border-light-border p-4 shadow-light-card">
              <div v-if="isWeatherLoading" class="flex flex-col items-center justify-center h-32">
                <i class="ri-loader-2-line animate-spin text-2xl text-primary/70"></i>
                <p class="mt-2 text-light-text-secondary">加载天气信息...</p>
              </div>
              <div v-else class="flex items-center">
                <div class="mr-4 text-4xl text-primary">
                  <i :class="getWeatherIcon(weatherData.condition)"></i>
                </div>
                <div>
                  <div class="flex items-end">
                    <span class="text-3xl font-semibold text-light-text-primary">{{ weatherData.temperature }}</span>
                    <span class="text-light-text-secondary ml-1 mb-1">°C</span>
                  </div>
                  <div class="text-light-text-primary mt-1">{{ weatherData.condition }}</div>
                  <div class="text-light-text-secondary text-sm mt-2">
                    <span>湿度: {{ weatherData.humidity }}%</span>
                    <span class="mx-2">|</span>
                    <span>风速: {{ weatherData.wind }}</span>
                  </div>
                  <div class="text-light-text-disabled text-xs mt-2">{{ weatherData.location }} · {{ weatherData.updateTime }}</div>
                </div>
              </div>
            </div>
            
            <!-- 每日一句 -->
            <div class="bg-white/80 rounded-lg border border-light-border p-4 shadow-light-card">
              <div v-if="isDailyQuoteLoading" class="flex flex-col items-center justify-center h-32">
                <i class="ri-loader-2-line animate-spin text-2xl text-primary/70"></i>
                <p class="mt-2 text-light-text-secondary">加载每日灵感...</p>
              </div>
              <div v-else class="h-full flex flex-col justify-between">
                <div>
                  <p class="text-light-text-primary text-base italic">{{ dailyQuote.content }}</p>
                  <p class="text-light-text-secondary text-sm mt-3 text-right">—— {{ dailyQuote.author }}</p>
                  
                  <!-- 显示完整诗词和翻译内容（如果有） -->
                  <div v-if="dailyQuote.fullPoem && dailyQuote.fullPoem !== dailyQuote.content" 
                       class="mt-3 bg-light-bg/30 rounded p-2 text-xs text-light-text-secondary">
                    <p class="whitespace-pre-line">{{ dailyQuote.fullPoem }}</p>
                  </div>
                  
                  <div v-if="dailyQuote.translate" 
                       class="mt-2 text-xs text-light-text-secondary italic">
                    <p class="whitespace-pre-line">{{ dailyQuote.translate }}</p>
                  </div>
                </div>
                <div class="text-light-text-disabled text-xs mt-2">每日更新 · {{ dailyQuote.date }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <FooterPage />
    
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
import { ref, onMounted } from "vue";
import FooterPage from "../FooterPage.vue";
import PopupNotification from "../Utils/PopupNotification.vue";
import api from "../../api/axiosInstance";

export default {
  name: "DashboardPage",
  components: {
    FooterPage,
    PopupNotification
  },
  setup() {
    
    const isLoading = ref(false);
    const isWeatherLoading = ref(false);
    const isDailyQuoteLoading = ref(true);
    const showNotification = ref(false);
    const notificationMessage = ref("");
    const notificationType = ref("info");
    const currentLocation = ref("beijing");
    const jinrishici = require('jinrishici');
    jinrishici.load(result => {
      console.log(result);
      // 更新每日一句数据
      dailyQuote.value = {
        content: result.data.content,
        author: `${result.data.origin.author} · ${result.data.origin.title}`,
        date: formatDate(new Date()).split(" ")[0], // 只取日期部分
        // 添加翻译内容
        translate: result.data.origin.translate && result.data.origin.translate.length > 0 ? 
                  result.data.origin.translate.join('\n') : '',
        fullPoem: result.data.origin.content && result.data.origin.content.length > 0 ?
                 result.data.origin.content.join('\n') : ''
      };
      
      // 更新加载状态
      isDailyQuoteLoading.value = false;
    }, errData => {
      console.log(errData);
      // 加载失败时，显示错误并使用默认数据
      showError("获取诗词数据失败");
      isDailyQuoteLoading.value = false;
    });

    
    // 统计数据
    const stats = ref({
      taskCount: 0,
      subdomainCount: 0,
      pathCount: 0,
      vulnCount: 0
    });
    
    // 天气数据
    const weatherData = ref({
      temperature: 26,
      condition: "晴天",
      humidity: 45,
      wind: "3 级",
      location: "北京",
      updateTime: "2025-04-18 15:30"
    });
    
    // 每日一句
    const dailyQuote = ref({
      content: "安全不是产品，而是过程。",
      author: "Bruce Schneier",
      date: "2025-04-18"
    });
    
    // 任务列表
    const tasks = ref([]);
    // 最近活动
    const activities = ref([]);
    
    // 设置天气位置
    const setWeatherLocation = (location) => {
      currentLocation.value = location;
      fetchWeatherData(location);
    };
    
    // 获取天气数据
    const fetchWeatherData = async (location) => {
      isWeatherLoading.value = true;
      
      try {
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 根据location设置不同的模拟数据
        if (location === 'beijing') {
          weatherData.value = {
            temperature: 26,
            condition: "晴天",
            humidity: 45,
            wind: "3 级",
            location: "北京",
            updateTime: formatDate(new Date())
          };
        } else if (location === 'shanghai') {
          weatherData.value = {
            temperature: 22,
            condition: "多云",
            humidity: 60,
            wind: "2 级",
            location: "上海",
            updateTime: formatDate(new Date())
          };
        } else if (location === 'guangzhou') {
          weatherData.value = {
            temperature: 30,
            condition: "小雨",
            humidity: 75,
            wind: "4 级",
            location: "广州",
            updateTime: formatDate(new Date())
          };
        }
        
        // 未来可以接入真实API
        // const response = await api.get(`/weather/current?location=${location}`);
        // weatherData.value = response.data;
      } catch (error) {
        console.error("获取天气数据失败", error);
        showError("获取天气数据失败");
      } finally {
        isWeatherLoading.value = false;
      }
    };
    
    // 根据天气状况获取图标
    const getWeatherIcon = (condition) => {
      const conditionMap = {
        '晴天': 'ri-sun-line',
        '多云': 'ri-cloudy-line',
        '阴天': 'ri-cloudy-2-line',
        '小雨': 'ri-drizzle-line',
        '大雨': 'ri-heavy-showers-line',
        '雷雨': 'ri-thunderstorms-line',
        '雪': 'ri-snowy-line'
      };
      
      return conditionMap[condition] || 'ri-cloud-line';
    };
    
    // 获取任务列表
    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks");
        tasks.value = response.data || [];
        stats.value.taskCount = tasks.value.length;
        
        // 生成活动记录
        generateActivities();
      } catch (error) {
        console.error("获取任务列表失败", error);
        showError("获取任务列表失败");
      }
    };
    
    // 获取子域名数量
    const fetchSubdomainCount = async () => {
      try {
        const response = await api.get("/results/type/Subdomain");
        stats.value.subdomainCount = getSubdomainCount(response.data);
      } catch (error) {
        console.error("获取子域名数量失败", error);
        showError("获取子域名数量失败");
      }
    };
    
    // 获取路径数量
    const fetchPathCount = async () => {
      try {
        const response = await api.get("/results/type/Path");
        stats.value.pathCount = getPathCount(response.data);
      } catch (error) {
        console.error("获取路径数量失败", error);
        showError("获取路径数量失败");
      }
    };
    
    // 获取漏洞数量
    const fetchVulnCount = async () => {
      try {
        const response = await api.get("/results/type/Gogo");
        stats.value.vulnCount = getVulnsCount(response.data);
      } catch (error) {
        console.error("获取漏洞数量失败", error);
        showError("获取漏洞数量失败");
      }
    };
    
    // 根据任务生成活动记录
    const generateActivities = () => {
      activities.value = [];
      
      // 复制任务数组并按照与活动相关的时间排序
      const sortedTasks = [...tasks.value]
        .sort((a, b) => {
          // 优先使用完成时间，如果没有则使用更新时间，最后才使用创建时间
          const timeA = new Date(a.completed_at || a.updated_at || a.created_at).getTime();
          const timeB = new Date(b.completed_at || b.updated_at || b.created_at).getTime();
          return timeB - timeA;
        })
        .slice(0, 6); // 最多显示6条
      
      sortedTasks.forEach(task => {
        // 根据任务状态选择合适的时间和消息
        let timestamp;
        let message = '';
        let type = 'info';
        
        if (task.status === 'completed' && task.completed_at) {
          timestamp = new Date(task.completed_at);
          message = `任务完成：${task.id}`;
          type = 'success';
        } else if (task.status === 'running' && task.updated_at) {
          timestamp = new Date(task.updated_at);
          message = `任务进行中：${task.id}`;
          type = 'info';
        } else if (task.status === 'failed' && task.completed_at) {
          timestamp = new Date(task.completed_at);
          message = `任务失败：${task.id}`;
          type = 'error';
        } else {
          timestamp = new Date(task.created_at);
          message = `创建任务：${task.id}`;
          type = 'scan';
        }
        
        // 如果有任务类型，添加到消息中
        if (task.type) {
          message += ` (${task.type})`;
        }
        
        // 如果有扫描目标，添加到消息中
        if (task.payload) {
          message += ` - ${task.payload}`;
        }
        
        activities.value.push({
          timestamp,
          message,
          type
        });
      });
    };
    
    // 格式化日期
    const formatDate = (dateStr) => {
      if (!dateStr) return '未知时间';
      
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };
    
    // 格式化时间（只显示时分）
    const formatTime = (date) => {
      if (!date) return '未知时间';
      
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    // 显示成功通知
    const showSuccess = (message) => {
      notificationMessage.value = message;
      notificationType.value = "success";
      showNotification.value = true;
      
      // 3秒后自动关闭
      setTimeout(() => {
        showNotification.value = false;
      }, 3000);
    };
    
    // 显示错误通知
    const showError = (message) => {
      notificationMessage.value = message;
      notificationType.value = "error";
      showNotification.value = true;
      
      // 3秒后自动关闭
      setTimeout(() => {
        showNotification.value = false;
      }, 3000);
    };
    
    // 刷新所有数据
    const refreshData = async () => {
      if (isLoading.value) return;
      
      isLoading.value = true;
      isDailyQuoteLoading.value = true; // 重置诗词加载状态
      
      try {
        await Promise.all([
          fetchTasks(),
          fetchSubdomainCount(),
          fetchPathCount(),
          fetchVulnCount(),
          fetchWeatherData(currentLocation.value)
        ]);
        
        // 重新加载今日诗词
        jinrishici.load(result => {
          dailyQuote.value = {
            content: result.data.content,
            author: `${result.data.origin.author} · ${result.data.origin.title}`,
            date: formatDate(new Date()).split(" ")[0],
            translate: result.data.origin.translate && result.data.origin.translate.length > 0 ? 
                      result.data.origin.translate.join('\n') : '',
            fullPoem: result.data.origin.content && result.data.origin.content.length > 0 ?
                     result.data.origin.content.join('\n') : ''
          };
          isDailyQuoteLoading.value = false;
        }, errData => {
          console.log(errData);
          showError("获取诗词数据失败");
          isDailyQuoteLoading.value = false;
        });
        
        showSuccess("数据已更新");
      } catch (error) {
        console.error("刷新数据失败", error);
      } finally {
        isLoading.value = false;
      }
    };
    
    // 根据任务状态获取任务进度宽度
    const getTaskProgressWidth = (status) => {
      switch(status) {
        case 'completed': return '100%';
        case 'running': return '60%';
        case 'failed': return '100%';
        case 'pending': return '10%';
        default: return '0%';
      }
    };
    
    // 根据任务状态获取状态颜色类
    const getStatusColorClass = (status) => {
      switch(status) {
        case 'completed': return 'bg-green-500';
        case 'running': return 'bg-blue-500';
        case 'failed': return 'bg-red-500';
        case 'pending': return 'bg-yellow-500';
        default: return 'bg-gray-500';
      }
    };
    
    // 根据任务状态获取图标类
    const getStatusIconClass = (status) => {
      switch(status) {
        case 'completed': return 'ri-check-line text-green-500';
        case 'running': return 'ri-loader-2-line animate-spin text-blue-500';
        case 'failed': return 'ri-close-line text-red-500';
        case 'pending': return 'ri-time-line text-yellow-500';
        default: return 'ri-question-line text-gray-500';
      }
    };
    
    // 根据活动类型获取图标类
    const getActivityIconClass = (type) => {
      switch(type) {
        case 'success': return 'ri-checkbox-circle-line text-green-500';
        case 'warning': return 'ri-error-warning-line text-yellow-500';
        case 'error': return 'ri-close-circle-line text-red-500';
        case 'info': return 'ri-information-line text-blue-500';
        case 'scan': return 'ri-search-line text-gray-400';
        default: return 'ri-information-line text-gray-400';
      }
    };
    
    // 获取子域名数量
    const getSubdomainCount = (result) => {
      try {
        if (!result || !Array.isArray(result)) {
          console.error("获取子域名数据格式无效", result);
          return 0;
        }

        // 遍历所有结果，累计子域名数量
        let totalSubdomains = 0;
        
        for (const item of result) {
          if (item.data && Array.isArray(item.data)) {
            const subdomainsData = item.data.find(d => d.Key === "subdomains");
            if (subdomainsData && Array.isArray(subdomainsData.Value)) {
              totalSubdomains += subdomainsData.Value.length;
            }
          }
        }
        
        console.log("成功获取子域名数量:", totalSubdomains);
        return totalSubdomains;
      } catch (error) {
        console.error("解析子域名数据失败", error);
        return 0;
      }
    };

    // 获取路径数量
    const getPathCount = (result) => {
      try {
        if (!result || !Array.isArray(result)) {
          console.error("获取路径数据格式无效", result);
          return 0;
        }

        // 遍历所有结果，累计路径数量
        let totalPaths = 0;
        
        for (const item of result) {
          if (item.data && Array.isArray(item.data)) {
            const pathsData = item.data.find(d => d.Key === "paths");
            if (pathsData && Array.isArray(pathsData.Value)) {
              totalPaths += pathsData.Value.length;
            }
          }
        }
        
        console.log("成功获取路径数量:", totalPaths);
        return totalPaths;
      } catch (error) {
        console.error("解析路径数据失败", error);
        return 0;
      }
    };

    // 获取漏洞数量
    const getVulnsCount = (result) => {
      try {
        if (!result || !Array.isArray(result)) {
          console.error("获取漏洞数据格式无效", result);
          return 0;
        }

        // 从返回数据中统计所有漏洞数量
        let totalVulns = 0;
        
        for (const item of result) {
          if (item.data && Array.isArray(item.data)) {
            // 尝试查找漏洞字段
            const vulnsData = item.data.find(d => d.Key === "vulns");
            if (vulnsData && Array.isArray(vulnsData.Value)) {
              totalVulns += vulnsData.Value.length;
              continue;
            }
            
            // // 如果没有vulns字段，尝试从webinfo字段获取
            // const webinfoData = item.data.find(d => d.Key === "webinfo");
            // if (webinfoData && Array.isArray(webinfoData.Value)) {
            //   totalVulns += webinfoData.Value.length;
            //   continue;
            // }
            
            // // 最后尝试统计扫描到的URL数量作为漏洞数量
            // // 基于Gogo扫描结果的格式，这些都是潜在的信息泄露或攻击面
            // const data = item.data.find(d => Array.isArray(d.Value) && d.Value.some(v => Array.isArray(v)));
            // if (data && Array.isArray(data.Value)) {
            //   totalVulns += data.Value.length;
            // }
          }
        }
        
        console.log("成功获取漏洞数量:", totalVulns);
        return totalVulns;
      } catch (error) {
        console.error("解析漏洞数据失败", error);
        return 0;
      }
    };
    
    // 组件挂载时获取数据
    onMounted(() => {
      refreshData();
    });
    
    return {
      isLoading,
      isWeatherLoading,
      isDailyQuoteLoading,
      stats,
      tasks,
      activities,
      currentLocation,
      weatherData,
      dailyQuote,
      showNotification,
      notificationMessage,
      notificationType,
      setWeatherLocation,
      refreshData,
      getTaskProgressWidth,
      getStatusColorClass,
      getStatusIconClass,
      getActivityIconClass,
      getWeatherIcon,
      formatDate,
      formatTime
    };
  }
};
</script>

<style scoped>
/* 保持既有的滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 6px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* 为表格添加粘性表头 */
.sticky {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style> 