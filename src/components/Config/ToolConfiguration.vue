<template>
  <PageContainer>
      <!-- 配置与工具状态总览 -->
      <div class="flex gap-4 mb-6">
        <div
          class="bg-white/70 backdrop-blur-xl p-4 rounded-xl border border-light-border flex-1 flex items-center justify-between shadow-light-card"
        >
          <div class="flex items-center">
            <div
              class="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3"
            >
              <i class="ri-settings-4-line text-primary"></i>
            </div>
            <div>
              <div class="text-sm text-light-text-secondary">总配置数</div>
              <div class="text-xl font-medium text-light-text-primary">{{ toolConfigs.length }}</div>
            </div>
          </div>
          <button
            @click="openCreateModal"
            class="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary hover:bg-primary-light text-white transition-all duration-200"
          >
            <i class="ri-add-line mr-1"></i>
            新建配置
          </button>
        </div>

        <div
          class="bg-white/70 backdrop-blur-xl p-4 rounded-xl border border-light-border flex-1 flex items-center justify-between shadow-light-card"
        >
          <div class="flex items-center">
            <div
              class="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center mr-3"
            >
              <i class="ri-tools-line text-green-500"></i>
            </div>
            <div>
              <div class="text-sm text-light-text-secondary">工具状态</div>
              <div class="text-xl font-medium text-light-text-primary">
                {{
                  toolsInfo
                    ? Object.values(toolsInfo.installedStatus).filter(Boolean)
                        .length
                    : "加载中"
                }}/{{
                  toolsInfo
                    ? Object.keys(toolsInfo.installedStatus).length
                    : "..."
                }}
              </div>
            </div>
          </div>
          <button
            @click="fetchToolsStatus"
            class="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/80 hover:bg-white/90 text-light-text-secondary hover:text-primary transition-all duration-200 border border-light-border group"
          >
            <i
              class="ri-refresh-line mr-1 group-hover:rotate-180 transition-transform duration-500"
            ></i>
            刷新状态
          </button>
        </div>
      </div>

      <!-- 主面板 - 使用标签页分离不同功能 -->
      <div
        class="bg-white/70 backdrop-blur-xl rounded-2xl shadow-light-card border border-light-border overflow-hidden"
      >
        <!-- 标签导航 -->
        <div class="flex border-b border-light-border">
          <button
            @click="activeMainTab = 'configs'"
            class="px-6 py-4 text-sm font-medium transition-all duration-200 relative"
            :class="
              activeMainTab === 'configs'
                ? 'text-primary'
                : 'text-light-text-secondary hover:text-light-text-primary'
            "
          >
            <i class="ri-settings-4-line mr-2"></i>
            工具配置管理
            <div
              v-if="activeMainTab === 'configs'"
              class="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
            ></div>
          </button>
          <button
            @click="activeMainTab = 'tools'"
            class="px-6 py-4 text-sm font-medium transition-all duration-200 relative"
            :class="
              activeMainTab === 'tools'
                ? 'text-green-500'
                : 'text-light-text-secondary hover:text-light-text-primary'
            "
          >
            <i class="ri-tools-line mr-2"></i>
            工具支持状态
            <div
              v-if="activeMainTab === 'tools'"
              class="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"
            ></div>
          </button>
        </div>

        <!-- 工具配置管理面板 -->
        <div v-if="activeMainTab === 'configs'" class="p-6">
          <!-- 搜索和操作区 -->
          <div class="flex justify-between mb-6">
            <div class="relative">
              <input
                v-model="configSearchQuery"
                type="text"
                placeholder="搜索配置..."
                class="bg-white border border-light-border rounded-lg pl-9 pr-4 py-2 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <i
                class="ri-search-line absolute left-3 top-2.5 text-light-text-secondary"
              ></i>
            </div>
            <div class="flex space-x-3">
              <button
                @click="fetchToolConfigs"
                class="px-3 py-2 rounded-lg text-sm font-medium bg-white/80 hover:bg-white/90 text-light-text-secondary hover:text-primary transition-all duration-200 flex items-center border border-light-border group"
              >
                <i
                  class="ri-refresh-line mr-2 group-hover:rotate-180 transition-transform duration-500"
                ></i>
                刷新配置
              </button>
              <button
                @click="openCreateModal"
                class="px-3 py-2 rounded-lg text-sm font-medium bg-primary hover:bg-primary-light text-white transition-all duration-200 flex items-center"
              >
                <i class="ri-add-line mr-2"></i>
                新建配置
              </button>
            </div>
          </div>

          <!-- 配置卡片列表 -->
          <div
            v-if="filteredConfigs.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            <div
              v-for="config in filteredConfigs"
              :key="config.id"
              class="bg-white rounded-xl border border-light-border overflow-hidden hover:shadow-light-dropdown transition-all duration-200"
            >
              <div class="p-4 flex justify-between items-start">
                <div>
                  <div class="flex items-center">
                    <h3 class="font-medium text-light-text-primary mr-2">
                      {{ config.name }}
                    </h3>
                    <span
                      v-if="config.is_default"
                      class="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/30"
                    >
                      默认
                    </span>
                  </div>
                  <p class="text-xs text-light-text-secondary mt-1">
                    {{ formatDate(config.created_at) }}
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button
                    @click="viewConfigDetails(config)"
                    class="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors duration-200"
                    title="查看详情"
                  >
                    <i class="ri-eye-line"></i>
                  </button>
                  <button
                    @click="editConfig(config)"
                    class="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-500/10 transition-colors duration-200"
                    title="编辑"
                  >
                    <i class="ri-edit-line"></i>
                  </button>
                  <button
                    v-if="!config.is_default"
                    @click="setAsDefault(config.id)"
                    class="p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors duration-200"
                    title="设为默认"
                  >
                    <i class="ri-star-line"></i>
                  </button>
                  <button
                    v-if="!config.is_default"
                    @click="confirmDelete(config)"
                    class="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors duration-200"
                    title="删除"
                  >
                    <i class="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>

              <!-- 工具启用状态指示器 -->
              <div class="px-4 pb-4">
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tool in [
                      'nmap',
                      'ffuf',
                      'subfinder',
                      'httpx',
                      'fscan',
                      'gogo',
                      'afrog',
                      'nuclei',
                    ]"
                    :key="tool"
                    :class="
                      config[`${tool}_config`].enabled
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'bg-light-bg text-light-text-disabled border-light-border'
                    "
                    class="text-xs px-2 py-0.5 rounded border"
                  >
                    {{ tool }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载中状态 -->
          <div
            v-else-if="loading"
            class="flex items-center justify-center py-12 text-sm text-light-text-secondary"
          >
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-light-text-secondary"
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
            加载中...
          </div>

          <!-- 无数据状态 -->
          <div
            v-else-if="toolConfigs.length === 0"
            class="flex flex-col items-center justify-center py-12 text-light-text-secondary"
          >
            <div
              class="w-16 h-16 bg-light-bg rounded-full flex items-center justify-center mb-4"
            >
              <i class="ri-file-list-3-line text-3xl text-light-text-disabled"></i>
            </div>
            <p>暂无配置数据</p>
            <button
              @click="openCreateModal"
              class="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-primary hover:bg-primary-light text-white transition-all duration-200"
            >
              创建第一个配置
            </button>
          </div>

          <!-- 搜索无结果 -->
          <div
            v-else
            class="flex flex-col items-center justify-center py-12 text-light-text-secondary"
          >
            <div
              class="w-16 h-16 bg-light-bg rounded-full flex items-center justify-center mb-4"
            >
              <i class="ri-search-line text-3xl text-light-text-disabled"></i>
            </div>
            <p>没有找到匹配 "{{ configSearchQuery }}" 的配置</p>
            <button
              @click="configSearchQuery = ''"
              class="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-white hover:bg-light-bg text-light-text-secondary transition-all duration-200"
            >
              清除搜索
            </button>
          </div>
        </div>

        <!-- 工具支持状态面板 -->
        <div v-if="activeMainTab === 'tools'" class="p-6">
          <!-- 工具状态网格 -->
          <div
            v-if="toolsInfo"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div
              v-for="(status, tool) in toolsInfo.installedStatus"
              :key="tool"
              :class="status ? 'border-green-500/30' : 'border-red-500/30'"
              class="relative bg-white backdrop-blur-sm border rounded-xl p-4 transition-all duration-200 overflow-hidden shadow-light-card"
            >
              <!-- 背景指示器 -->
              <div
                :class="status ? 'bg-green-500/5' : 'bg-red-500/5'"
                class="absolute inset-0 pointer-events-none"
              ></div>

              <div class="flex items-center justify-between relative z-10">
                <div class="flex items-center">
                  <div
                    :class="
                      status
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'
                    "
                    class="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                  >
                    <i class="ri-terminal-box-line text-lg"></i>
                  </div>
                  <div>
                    <h3 class="font-medium text-light-text-primary">{{ tool }}</h3>
                    <div
                      :class="status ? 'text-green-500' : 'text-red-500'"
                      class="text-sm mt-0.5 flex items-center"
                    >
                      <i
                        :class="
                          status
                            ? 'ri-checkbox-circle-line'
                            : 'ri-close-circle-line'
                        "
                        class="mr-1"
                      ></i>
                      {{ status ? "已安装" : "未安装" }}
                    </div>
                  </div>
                </div>

                <div
                  v-if="
                    toolsInfo.versions && toolsInfo.versions[tool] && status
                  "
                  class="px-2 py-0.5 bg-light-bg rounded text-xs text-light-text-secondary"
                >
                  v{{ toolsInfo.versions[tool] }}
                </div>
              </div>
            </div>
          </div>

          <!-- 加载中状态 -->
          <div
            v-else
            class="flex items-center justify-center py-12 text-sm text-light-text-secondary"
          >
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-light-text-secondary"
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
            加载中...
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

    <!-- 创建配置模态框 -->
    <div
      v-if="showConfigModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300"
      @click="showConfigModal = false"
    >
      <div
        class="bg-white rounded-2xl shadow-light-dropdown border border-light-border w-full max-w-4xl max-h-[90vh] overflow-auto transition-all duration-300 transform"
        @click.stop
      >
        <div
          class="flex items-center justify-between p-6 border-b border-light-border"
        >
          <h3 class="text-lg font-medium text-light-text-primary flex items-center">
            <i
              :class="isEditing ? 'ri-edit-line' : 'ri-add-line'"
              class="mr-2 text-primary"
            ></i>
            {{ isEditing ? "编辑配置" : "创建新配置" }}
          </h3>
          <button
            @click="showConfigModal = false"
            class="p-2 rounded-lg text-light-text-secondary hover:text-light-text-primary hover:bg-light-bg transition-colors duration-200"
          >
            <i class="ri-close-line text-lg"></i>
          </button>
        </div>

        <div class="p-6">
          <form @submit.prevent="saveConfig">
            <!-- 基础配置 -->
            <div class="bg-light-bg p-4 rounded-xl mb-6">
              <div
                class="text-sm font-medium text-light-text-primary mb-4 flex items-center"
              >
                <i class="ri-information-line mr-2 text-primary"></i>
                基本信息
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-light-text-secondary mb-1"
                    >配置名称</label
                  >
                  <input
                    v-model="currentConfig.name"
                    type="text"
                    class="w-full bg-white border border-light-border rounded-lg px-3 py-2 text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="输入配置名称"
                    required
                  />
                </div>

                <div class="flex items-end">
                  <label
                    class="flex items-center bg-white p-3 rounded-lg border border-light-border w-full"
                  >
                    <input
                      v-model="currentConfig.is_default"
                      type="checkbox"
                      class="rounded bg-white border-light-border text-primary focus:ring-primary/30 mr-2"
                    />
                    <span class="text-sm text-light-text-primary">设为默认配置</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- 工具配置选项卡 -->
            <div class="bg-light-bg rounded-xl p-4">
              <div
                class="text-sm font-medium text-light-text-primary mb-4 flex items-center"
              >
                <i class="ri-tools-line mr-2 text-primary"></i>
                工具配置
              </div>

              <div
                class="flex overflow-x-auto scrollbar-hidden space-x-1 pb-2 mb-4"
              >
                <button
                  v-for="tool in [
                    'nmap',
                    'ffuf',
                    'subfinder',
                    'httpx',
                    'fscan',
                    'gogo',
                    'afrog',
                    'nuclei',
                  ]"
                  :key="tool"
                  type="button"
                  :class="{
                    'bg-primary/10 text-primary border-primary/30':
                      activeTab === tool,
                    'text-light-text-secondary hover:text-light-text-primary border-transparent hover:bg-light-bg-active':
                      activeTab !== tool,
                  }"
                  class="py-2 px-4 text-sm font-medium border rounded-lg whitespace-nowrap transition-all duration-200"
                  @click="activeTab = tool"
                >
                  {{ tool.charAt(0).toUpperCase() + tool.slice(1) }}
                </button>
              </div>

              <!-- 工具启用状态 -->
              <div class="mb-4 pb-4 border-b border-light-border">
                <label
                  class="flex items-center bg-white p-3 rounded-lg border border-light-border"
                >
                  <input
                    v-model="currentConfig[`${activeTab}_config`].enabled"
                    type="checkbox"
                    class="rounded bg-white border-light-border text-primary focus:ring-primary/30 mr-2"
                  />
                  <span class="text-sm text-light-text-primary">
                    启用
                    {{ activeTab.charAt(0).toUpperCase() + activeTab.slice(1) }}
                  </span>
                </label>
              </div>

              <!-- Nmap 配置 -->
              <div v-if="activeTab === 'nmap'" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-light-text-secondary mb-1"
                    >端口范围</label
                  >
                  <input
                    v-model="currentConfig.nmap_config.ports"
                    type="text"
                    class="w-full bg-white border border-light-border rounded-lg px-3 py-2 text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="例如: 80,443,8080-8090"
                  />
                  <p class="mt-1 text-xs text-light-text-secondary">
                    支持单个端口，多个端口（逗号分隔）或端口范围（使用横线）
                  </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-light-text-secondary mb-1"
                      >扫描超时（秒）</label
                    >
                    <input
                      v-model.number="currentConfig.nmap_config.scan_timeout"
                      type="number"
                      min="1"
                      class="w-full bg-white border border-light-border rounded-lg px-3 py-2 text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-light-text-secondary mb-1"
                      >并发数</label
                    >
                    <input
                      v-model.number="currentConfig.nmap_config.concurrency"
                      type="number"
                      min="1"
                      class="w-full bg-white border border-light-border rounded-lg px-3 py-2 text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <!-- Ffuf 配置 -->
              <div v-if="activeTab === 'ffuf'" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-light-text-secondary mb-1"
                    >字典文件路径</label
                  >
                  <input
                    v-model="currentConfig.ffuf_config.wordlist_path"
                    type="text"
                    class="w-full bg-white border border-light-border rounded-lg px-3 py-2 text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="例如: /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt"
                  />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-light-text-secondary mb-1"
                      >扩展名</label
                    >
                    <input
                      v-model="currentConfig.ffuf_config.extensions"
                      type="text"
                      class="w-full bg-white border border-light-border rounded-lg px-3 py-2 text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="例如: php,asp,aspx,jsp"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-light-text-secondary mb-1"
                      >线程数</label
                    >
                    <input
                      v-model.number="currentConfig.ffuf_config.threads"
                      type="number"
                      min="1"
                      class="w-full bg-white border border-light-border rounded-lg px-3 py-2 text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-light-text-secondary mb-1"
                    >匹配HTTP状态码</label
                  >
                  <input
                    v-model="currentConfig.ffuf_config.match_http_code"
                    type="text"
                    class="w-full bg-white border border-light-border rounded-lg px-3 py-2 text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="例如: 200,204,301,302,307,401,403"
                  />
                </div>
              </div>

              <!-- Subfinder 配置 -->
              <div v-if="activeTab === 'subfinder'" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-light-text-secondary mb-1"
                    >配置文件路径</label
                  >
                  <input
                    v-model="currentConfig.subfinder_config.config_path"
                    type="text"
                    class="w-full bg-white border border-light-border rounded-lg px-3 py-2 text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="例如: /etc/subfinder/config.yaml"
                  />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-light-text-secondary mb-1"
                      >线程数</label
                    >
                    <input
                      v-model.number="currentConfig.subfinder_config.threads"
                      type="number"
                      min="1"
                      class="w-full bg-white border border-light-border rounded-lg px-3 py-2 text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-light-text-secondary mb-1"
                      >最大深度</label
                    >
                    <input
                      v-model.number="currentConfig.subfinder_config.max_depth"
                      type="number"
                      min="1"
                      class="w-full bg-white border border-light-border rounded-lg px-3 py-2 text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-light-text-secondary mb-1"
                      >超时（秒）</label
                    >
                    <input
                      v-model.number="currentConfig.subfinder_config.timeout"
                      type="number"
                      min="1"
                      class="w-full bg-white border border-light-border rounded-lg px-3 py-2 text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <!-- 其他工具配置 -->
              <div
                v-if="['httpx', 'fscan', 'afrog', 'nuclei'].includes(activeTab)"
                class="space-y-4"
              >
                <div>
                  <label class="block text-sm font-medium text-light-text-secondary mb-1"
                    >线程数</label
                  >
                  <input
                    v-model.number="
                      currentConfig[`${activeTab}_config`].threads
                    "
                    type="number"
                    min="1"
                    class="w-full bg-white border border-light-border rounded-lg px-3 py-2 text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              
              <!-- Gogo 工具配置 -->
              <div v-if="activeTab === 'gogo'" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-light-text-secondary mb-1"
                    >端口配置</label
                  >
                  <input
                    v-model="currentConfig.gogo_config.ports"
                    type="text"
                    class="w-full bg-white border border-light-border rounded-lg px-3 py-2 text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="例如: top2,win,db,rce"
                  />
                  <p class="mt-1 text-xs text-light-text-secondary">
                    使用预设扫描配置组合，如 top2, win, db, rce等具体可以参考<a href="https://github.com/chainreactors/templates/blob/cfc0603dd26581224e916589515c7ed12b1badc1/port.yaml" target="_blank" class="text-primary hover:underline">gogo预设port</a>
                  </p>
                      </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-light-text-secondary mb-1"
                      >线程数</label
                    >
                    <input
                      v-model.number="currentConfig.gogo_config.threads"
                      type="number"
                      min="1"
                      class="w-full bg-white border border-light-border rounded-lg px-3 py-2 text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    </div>
                  <div>
                    <label class="block text-sm font-medium text-light-text-secondary mb-1"
                      >超时（秒）</label
                    >
                    <input
                      v-model.number="currentConfig.gogo_config.timeout"
                      type="number"
                      min="1"
                      class="w-full bg-white border border-light-border rounded-lg px-3 py-2 text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                      </div>
                    </div>

                <div>
                  <label class="block text-sm font-medium text-light-text-secondary mb-1"
                    >扫描模式</label
                  >
                  <select
                    v-model="currentConfig.gogo_config.mode"
                    class="w-full bg-white border border-light-border rounded-lg px-3 py-2 text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="default">默认</option>
                    <option value="light">轻量级扫描</option>
                    <option value="aggressive">积极扫描</option>
                  </select>
                  </div>

                <div>
                  <label class="block text-sm font-medium text-light-text-secondary mb-1"
                    >输出路径</label
                  >
                  <input
                    v-model="currentConfig.gogo_config.output_path"
                    type="text"
                    class="w-full bg-white border border-light-border rounded-lg px-3 py-2 text-light-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="例如: /tmp/gogo"
                  />
                      </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      class="flex items-center bg-white p-3 rounded-lg border border-light-border"
                    >
                      <input
                        v-model="currentConfig.gogo_config.enable_exploit"
                        type="checkbox"
                        class="rounded bg-white border-light-border text-primary focus:ring-primary/30 mr-2"
                      />
                      <span class="text-sm text-light-text-primary">启用漏洞利用</span>
                    </label>
                    </div>
                  <div>
                    <label
                      class="flex items-center bg-white p-3 rounded-lg border border-light-border"
                    >
                      <input
                        v-model="currentConfig.gogo_config.verbose"
                        type="checkbox"
                        class="rounded bg-white border-light-border text-primary focus:ring-primary/30 mr-2"
                      />
                      <span class="text-sm text-light-text-primary">详细输出</span>
                    </label>
              </div>
            </div>
          </div>
        </div>

            <div class="flex justify-end space-x-3 pt-6">
          <button
                type="button"
                @click="showConfigModal = false"
                class="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-light-border hover:bg-light-bg text-light-text-secondary transition-all duration-200"
          >
                取消
          </button>
          <button
                type="submit"
                class="px-4 py-2 rounded-lg text-sm font-medium bg-primary hover:bg-primary-light text-white transition-all duration-200 flex items-center"
          >
                <i
                  :class="isEditing ? 'ri-save-line' : 'ri-add-line'"
                  class="mr-1.5"
                ></i>
                {{ isEditing ? "保存更改" : "创建配置" }}
          </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 查看详情对话框 -->
    <div
      v-if="showViewDetails"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300"
      @click="showViewDetails = false"
    >
      <div
        class="bg-white rounded-2xl shadow-light-dropdown border border-light-border w-full max-w-4xl max-h-[90vh] overflow-auto transition-all duration-300 transform"
        @click.stop
      >
        <div
          class="flex items-center justify-between p-6 border-b border-light-border"
        >
          <h3 class="text-lg font-medium text-light-text-primary flex items-center">
            <i class="ri-eye-line mr-2 text-primary"></i>
            查看配置详情
          </h3>
          <button
            @click="showViewDetails = false"
            class="p-2 rounded-lg text-light-text-secondary hover:text-light-text-primary hover:bg-light-bg transition-colors duration-200"
          >
            <i class="ri-close-line text-lg"></i>
          </button>
        </div>

        <div class="p-6">
          <div v-if="configToView" class="space-y-6">
            <!-- 基本信息 -->
            <div
              class="bg-light-bg rounded-xl p-5 border border-light-border"
            >
              <h4
                class="text-sm font-medium text-primary mb-4 flex items-center"
              >
                <i class="ri-information-line mr-2"></i>
                基本信息
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div class="space-y-1">
                  <div class="text-xs text-light-text-secondary">配置名称</div>
                  <div class="text-light-text-primary font-medium">
                    {{ configToView.name }}
                  </div>
                </div>
                <div class="space-y-1">
                  <div class="text-xs text-light-text-secondary">状态</div>
                  <div>
                    <span
                      :class="
                        configToView.is_default
                          ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                          : 'bg-light-bg text-light-text-secondary border-light-border'
                      "
                      class="px-2 py-0.5 text-xs font-medium rounded-full border"
                    >
                      {{ configToView.is_default ? "默认配置" : "普通配置" }}
                    </span>
                  </div>
                </div>
                <div class="space-y-1">
                  <div class="text-xs text-light-text-secondary">创建时间</div>
                  <div class="text-light-text-primary">
                    {{ formatDate(configToView.created_at) }}
                  </div>
                </div>
                <div class="space-y-1">
                  <div class="text-xs text-light-text-secondary">更新时间</div>
                  <div class="text-light-text-primary">
                    {{ formatDate(configToView.updated_at) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 各工具配置卡片 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="tool in [
                  'nmap',
                  'ffuf',
                  'subfinder',
                  'httpx',
                  'fscan',
                  'gogo',
                  'afrog',
                  'nuclei',
                ]"
                :key="tool"
                :class="
                  configToView[`${tool}_config`].enabled
                    ? 'border-primary/30'
                    : 'border-light-border'
                "
                class="bg-white rounded-xl p-5 border relative overflow-hidden shadow-sm"
              >
                <!-- 背景状态指示 -->
                <div
                  v-if="configToView[`${tool}_config`].enabled"
                  class="absolute inset-0 bg-primary/5 pointer-events-none"
                ></div>
                <h4
                  class="text-sm font-medium flex items-center justify-between mb-3 relative z-10"
                >
                  <span class="flex items-center text-light-text-primary">
                    <i class="ri-settings-line mr-2 text-primary"></i>
                    {{ tool.charAt(0).toUpperCase() + tool.slice(1) }}
                  </span>
                  <span
                    :class="
                      configToView[`${tool}_config`].enabled
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'bg-light-bg text-light-text-secondary border-light-border'
                    "
                    class="px-2 py-0.5 text-xs font-medium rounded-full border"
                  >
                    {{
                      configToView[`${tool}_config`].enabled
                        ? "已启用"
                        : "已禁用"
                    }}
                  </span>
                </h4>
                <!-- 通用配置项 -->
                <div
                  v-if="configToView[`${tool}_config`].threads"
                  class="grid grid-cols-2 gap-4 relative z-10"
                >
                  <div class="space-y-1">
                    <div class="text-xs text-light-text-secondary">线程数</div>
                    <div class="text-light-text-primary">
                      {{ configToView[`${tool}_config`].threads }}
                    </div>
                  </div>
                </div>
                <!-- Nmap特有配置 -->
                <div
                  v-if="tool === 'nmap'"
                  class="grid grid-cols-2 gap-4 mt-3 relative z-10"
                >
                  <div class="space-y-1">
                    <div class="text-xs text-light-text-secondary">端口范围</div>
                    <div class="text-light-text-primary break-all">
                      {{ configToView.nmap_config.ports || "未设置" }}
                    </div>
                  </div>
                  <div class="space-y-1">
                    <div class="text-xs text-light-text-secondary">扫描超时</div>
                    <div class="text-light-text-primary">
                      {{ configToView.nmap_config.scan_timeout || "0" }} 秒
                    </div>
                  </div>
                  <div class="space-y-1">
                    <div class="text-xs text-light-text-secondary">并发数</div>
                    <div class="text-light-text-primary">
                      {{ configToView.nmap_config.concurrency || "0" }}
                    </div>
                  </div>
                </div>
                <!-- Ffuf特有配置 -->
                <div
                  v-if="tool === 'ffuf'"
                  class="grid grid-cols-1 gap-4 mt-3 relative z-10"
                >
                  <div class="space-y-1">
                    <div class="text-xs text-light-text-secondary">字典文件</div>
                    <div class="text-light-text-primary break-all text-xs">
                      {{ configToView.ffuf_config.wordlist_path || "未设置" }}
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <div class="text-xs text-light-text-secondary">扩展名</div>
                      <div class="text-light-text-primary">
                        {{ configToView.ffuf_config.extensions || "未设置" }}
                      </div>
                    </div>
                    <div class="space-y-1">
                      <div class="text-xs text-light-text-secondary">HTTP状态码</div>
                      <div class="text-light-text-primary">
                        {{
                          configToView.ffuf_config.match_http_code || "未设置"
                        }}
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Subfinder特有配置 -->
                <div
                  v-if="tool === 'subfinder'"
                  class="grid grid-cols-1 gap-4 mt-3 relative z-10"
                >
                  <div class="space-y-1">
                    <div class="text-xs text-light-text-secondary">配置文件</div>
                    <div class="text-light-text-primary break-all text-xs">
                      {{
                        configToView.subfinder_config.config_path || "未设置"
                      }}
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <div class="text-xs text-light-text-secondary">最大深度</div>
                      <div class="text-light-text-primary">
                        {{ configToView.subfinder_config.max_depth || "0" }}
                      </div>
                    </div>
                    <div class="space-y-1">
                      <div class="text-xs text-light-text-secondary">超时</div>
                      <div class="text-light-text-primary">
                        {{ configToView.subfinder_config.timeout || "0" }} 秒
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Gogo特有配置 -->
                <div
                  v-if="tool === 'gogo'"
                  class="grid grid-cols-1 gap-4 mt-3 relative z-10"
                >
                  <div class="space-y-1">
                    <div class="text-xs text-light-text-secondary">端口配置</div>
                    <div class="text-light-text-primary break-all">
                      {{ configToView.gogo_config.ports || "未设置" }}
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <div class="text-xs text-light-text-secondary">超时</div>
                      <div class="text-light-text-primary">
                        {{ configToView.gogo_config.timeout || "0" }} 秒
                      </div>
                    </div>
                    <div class="space-y-1">
                      <div class="text-xs text-light-text-secondary">模式</div>
                      <div class="text-light-text-primary">
                        {{ configToView.gogo_config.mode || "默认" }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="flex justify-end p-4 border-t border-light-border bg-light-bg/20"
        >
          <button
            @click="editConfig(configToView)"
            class="px-4 py-2 rounded-lg text-sm font-medium bg-yellow-500 hover:bg-yellow-400 text-white transition-all duration-200 mr-3 flex items-center"
          >
            <i class="ri-edit-line mr-1.5"></i>
            编辑此配置
          </button>
          <button
            @click="showViewDetails = false"
            class="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-light-border hover:bg-light-bg text-light-text-secondary transition-all duration-200"
          >
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300"
      @click="showDeleteConfirm = false"
    >
      <div
        class="bg-white rounded-2xl shadow-light-dropdown border border-light-border w-full max-w-md transform transition-all duration-300"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div
              class="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center mr-3"
            >
              <i class="ri-error-warning-line text-red-500 text-xl"></i>
            </div>
            <h3 class="text-lg font-medium text-light-text-primary">
              确认删除
            </h3>
          </div>
          
          <div class="mb-6">
            <p class="ml-13 text-sm text-light-text-secondary">
              确定要删除配置 "{{ configToDelete?.name }}" 吗？此操作不可恢复。
            </p>
          </div>
          
          <div class="flex flex-col-reverse sm:flex-row justify-end space-x-0 space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
            <button
              @click="showDeleteConfirm = false"
              class="px-4 py-2.5 rounded-xl border border-light-border bg-white hover:bg-light-bg text-sm font-medium text-light-text-secondary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200 w-full sm:w-auto"
            >
              <span class="flex items-center justify-center">
                <i class="ri-close-line mr-1.5"></i>
                取消
              </span>
            </button>
            <button
              @click="handleDeleteConfirm"
              class="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 w-full sm:w-auto"
            >
              <span class="flex items-center justify-center">
                <i class="ri-delete-bin-line mr-1.5"></i>
                确认删除
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 确认对话框 -->
    <ConfirmDialog
      v-if="showDialog"
      :title="dialogTitle"
      :message="dialogMessage"
      :type="dialogType"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </PageContainer>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import api from "../../api/axiosInstance";
import PageContainer from "../Utils/PageContainer.vue";
import PopupNotification from "../Utils/PopupNotification.vue";
import ConfirmDialog from "../Utils/ConfirmDialog.vue";
import { useNotification } from "../../composables/useNotification";
import { useConfirmDialog } from "../../composables/useConfirmDialog";

export default {
  name: "ToolConfiguration",
  components: {
    PageContainer,
    PopupNotification,
    ConfirmDialog
  },
  setup() {
    const toolConfigs = ref([]);
    const toolsInfo = ref(null);
    const loading = ref(false);
    const showConfigModal = ref(false);
    const showDeleteConfirm = ref(false);
    const showViewDetails = ref(false);
    const configToDelete = ref(null);
    const configToView = ref(null);
    const isEditing = ref(false);
    const activeTab = ref("nmap");
    const activeMainTab = ref("configs");
    const configSearchQuery = ref("");

    // 筛选后的配置列表
    const filteredConfigs = computed(() => {
      if (!configSearchQuery.value) return toolConfigs.value;

      const query = configSearchQuery.value.toLowerCase();
      return toolConfigs.value.filter((config) => {
        return config.name.toLowerCase().includes(query);
      });
    });

    const {
      showNotification,
      notificationMessage,
      notificationType,
      showSuccess,
      showError,
    } = useNotification();

    const {
      showDialog,
      dialogTitle,
      dialogMessage,
      dialogType,
      handleConfirm,
      handleCancel
    } = useConfirmDialog();

    // 默认配置模板
    const defaultConfig = {
      name: "",
      is_default: false,
      nmap_config: {
        enabled: true,
        ports: "21,22,23,25,53,80,110,111,135,139,143,443,445,465,587,993,995,1080,1433,1521,3306,3389,5432,5900,6379,8080,8443",
        scan_timeout: 300,
        concurrency: 100,
      },
      ffuf_config: {
        enabled: true,
        wordlist_path:
          "/usr/share/wordlist/dicc.txt",
        extensions: "php,asp,aspx,jsp,html,js",
        threads: 50,
        match_http_code: "200,204,301,302,307,401,403",
      },
      subfinder_config: {
        enabled: true,
        config_path: "/etc/subfinder/config.yaml",
        threads: 10,
        max_depth: 2,
        timeout: 60,
      },
      httpx_config: {
        enabled: true,
        threads: 50,
        timeout: 10,
      },
      fscan_config: {
        enabled: true,
        threads: 100,
      },
      gogo_config: {
        enabled: true,
        ports: "top2,win,db,rce",
        timeout: 5,
        threads: 1000,
        mode: "default",
        enable_exploit: true,
        verbose: true,
        output_path: "/tmp/gogo"
      },
      afrog_config: {
        enabled: true,
        threads: 50,
      },
      nuclei_config: {
        enabled: true,
        threads: 50,
      },
    };

    const currentConfig = ref({ ...defaultConfig });

    const fetchToolConfigs = async () => {
      loading.value = true;
      try {
        const response = await api.get("/tools/configs");
        if (response.data?.status === "success") {
          toolConfigs.value = response.data.data || [];
          showSuccess("工具配置列表已更新");
        }
      } catch (error) {
        showError(error.response?.data?.message || "获取工具配置失败");
      } finally {
        loading.value = false;
      }
    };

    const fetchToolsStatus = async () => {
      try {
        const response = await api.get("/system/tools");
        if (
          response.data?.status === "success" &&
          response.data?.data?.toolsInfo
        ) {
          toolsInfo.value = response.data.data.toolsInfo;
          showSuccess("工具状态已更新");
        }
      } catch (error) {
        showError(error.response?.data?.message || "获取工具状态失败");
      }
    };

    const openCreateModal = () => {
      isEditing.value = false;
      currentConfig.value = { ...defaultConfig };
      showConfigModal.value = true;
      activeTab.value = "nmap";
    };

    const editConfig = (config) => {
      isEditing.value = true;
      currentConfig.value = JSON.parse(JSON.stringify(config)); // 深拷贝
      showConfigModal.value = true;
      activeTab.value = "nmap";

      // 如果在查看详情时编辑，需要关闭详情窗口
      if (showViewDetails.value) {
        showViewDetails.value = false;
      }
    };

    const saveConfig = async () => {
      try {
        if (isEditing.value) {
          await api.put(
            `/tools/configs/${currentConfig.value.id}`,
            currentConfig.value
          );
          showSuccess("配置已更新");
        } else {
          await api.post("/tools/configs", currentConfig.value);
          showSuccess("配置已创建");
        }
        showConfigModal.value = false;
        fetchToolConfigs();
      } catch (error) {
        showError(error.response?.data?.message || "保存配置失败");
      }
    };

    const confirmDelete = (config) => {
      // 添加日志记录
      console.log('准备删除配置:', config);
      
      // 保存要删除的配置
      configToDelete.value = config;
      
      // 显示自定义删除确认对话框
      showDeleteConfirm.value = true;
    };
    
    // 处理删除确认
    const handleDeleteConfirm = async () => {
      try {
        console.log('正在删除配置:', configToDelete.value.id);
        const response = await api.delete(`/tools/configs/${configToDelete.value.id}`);
        console.log('删除响应:', response);
        
        // 关闭对话框
        showDeleteConfirm.value = false;
        
        // 显示成功通知
        showSuccess("配置已删除");
        
        // 刷新配置列表
        await fetchToolConfigs();
      } catch (error) {
        console.error('删除配置失败:', error);
        showError(error.response?.data?.message || "删除配置失败");
      }
    };

    const setAsDefault = async (id) => {
      try {
        await api.put(`/tools/configs/${id}/default`);
        showSuccess("默认配置已设置");
        fetchToolConfigs();
      } catch (error) {
        showError(error.response?.data?.message || "设置默认配置失败");
      }
    };

    const viewConfigDetails = (config) => {
      // 添加日志记录
      console.log('查看配置详情:', config);
      
      // 深拷贝配置对象
      configToView.value = JSON.parse(JSON.stringify(config));
      
      // 显示详情对话框
      showViewDetails.value = true;
    };

    const formatDate = (dateString) => {
      if (!dateString) return "未知时间";
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
    };

    onMounted(() => {
      fetchToolConfigs();
      fetchToolsStatus();
    });

    return {
      toolConfigs,
      filteredConfigs,
      toolsInfo,
      loading,
      showConfigModal,
      showDeleteConfirm,
      showViewDetails,
      currentConfig,
      configToDelete,
      configToView,
      isEditing,
      activeTab,
      activeMainTab,
      configSearchQuery,
      fetchToolConfigs,
      fetchToolsStatus,
      openCreateModal,
      editConfig,
      saveConfig,
      confirmDelete,
      handleDeleteConfirm,
      setAsDefault,
      viewConfigDetails,
      formatDate,
      showNotification,
      notificationMessage,
      notificationType,
      showDialog,
      dialogTitle,
      dialogMessage,
      dialogType,
      handleConfirm,
      handleCancel
    };
  },
};
</script>

<style scoped>
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

/* 优化按钮点击效果 */
button:active {
  transform: scale(0.98);
}

/* 隐藏滚动条但保留功能 */
.scrollbar-hidden {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.scrollbar-hidden::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
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

.ml-13 {
  margin-left: 3.25rem;
}

/* 自定义动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-10px); }
  to { transform: translateY(0); }
}

.dialog-animation {
  animation: fadeIn 0.3s ease, slideIn 0.3s ease;
}
</style>
