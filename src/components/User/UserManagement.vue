<template>
  <PageContainer>
    <!-- 管理概览卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- 用户统计 -->
      <div
        class="bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-light-card border border-light-border flex items-center"
      >
        <div
          class="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center mr-4"
        >
          <i class="ri-user-line text-xl text-blue-500"></i>
        </div>
        <div>
          <h3 class="text-light-text-secondary text-sm font-medium">总用户数</h3>
          <p class="text-2xl font-semibold text-light-text-primary">{{ users.length }}</p>
        </div>
      </div>

      <!-- 二维码接口控制 -->
      <div
        class="bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-light-card border border-light-border flex items-center justify-between"
      >
        <div class="flex items-center">
          <div
            class="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center mr-4"
          >
            <i class="ri-qr-code-line text-xl text-purple-500"></i>
          </div>
          <div>
            <h3 class="text-light-text-secondary text-sm font-medium">二维码登录</h3>
            <p class="text-lg font-medium text-light-text-primary">
              {{ qrcodeEnabled ? "已启用" : "已禁用" }}
            </p>
          </div>
        </div>
        <button
          @click="toggleQRCodeStatus"
          class="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none"
          :class="qrcodeEnabled ? 'bg-purple-500/70' : 'bg-light-bg'"
        >
          <span
            class="absolute left-1 top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300"
            :class="qrcodeEnabled ? 'transform translate-x-7' : ''"
          ></span>
        </button>
      </div>
    </div>

    <!-- 用户列表卡片 -->
    <div
      class="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-light-card border border-light-border"
    >
      <!-- 列表标题和操作栏 -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 class="text-xl font-medium tracking-wide flex items-center text-light-text-primary">
          <i class="ri-user-settings-line mr-2 text-blue-500"></i>
          用户管理
        </h2>

        <div class="flex items-center gap-3">
          <!-- 搜索框 -->
          <div class="relative">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="搜索用户..."
              class="bg-white border border-light-border rounded-xl py-2 pl-10 pr-4 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
            />
            <i
              class="ri-search-line absolute left-3 top-2.5 text-light-text-secondary"
            ></i>
          </div>

          <!-- 批量删除按钮 -->
          <button
            v-if="selectedUsers.length > 0"
            @click="handleBatchDelete"
            class="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/50 hover:bg-red-600/60 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 flex items-center"
          >
            <i class="ri-delete-bin-line mr-2"></i>
            批量删除 ({{ selectedUsers.length }})
          </button>
        </div>
      </div>

      <!-- 用户数据表格 -->
      <div class="overflow-x-auto rounded-xl border border-light-border">
        <table class="w-full">
          <thead>
            <tr class="bg-light-bg">
              <th
                class="text-left py-3 px-4 text-sm font-medium text-light-text-secondary"
              >
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                  class="rounded border-light-border text-blue-500 focus:ring-blue-500/50 bg-white"
                />
              </th>
              <th
                class="text-left py-3 px-4 text-sm font-medium text-light-text-secondary"
              >
                用户名
              </th>
              <th
                class="text-left py-3 px-4 text-sm font-medium text-light-text-secondary"
              >
                登录次数
              </th>
              <th
                class="text-left py-3 px-4 text-sm font-medium text-light-text-secondary"
              >
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in filteredUsers"
              :key="user.account"
              class="border-t border-light-border hover:bg-light-bg transition-colors duration-200"
            >
              <td class="py-3 px-4">
                <input
                  type="checkbox"
                  v-model="selectedUsers"
                  :value="user.account"
                  class="rounded border-light-border text-blue-500 focus:ring-blue-500/50 bg-white"
                />
              </td>
              <td class="py-3 px-4 text-sm text-light-text-primary flex items-center">
                <div
                  class="w-8 h-8 bg-blue-500/10 rounded-full mr-3 flex items-center justify-center text-blue-500"
                >
                  {{ user.account.charAt(0).toUpperCase() }}
                </div>
                {{ user.account }}
              </td>
              <td class="py-3 px-4 text-sm">
                <span
                  class="px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 flex items-center w-fit"
                >
                  <i class="ri-login-circle-line mr-2"></i>
                  {{ user.loginCount }}
                </span>
              </td>
              <td class="py-3 px-4">
                <button
                  @click="handleDelete(user.account)"
                  class="p-2 rounded-lg text-sm font-medium bg-red-500/20 hover:bg-red-500/30 text-red-600 transition-all duration-200 focus:outline-none"
                  title="删除用户"
                >
                  <i class="ri-delete-bin-line"></i>
                </button>
              </td>
            </tr>
            <!-- 空状态显示 -->
            <tr v-if="filteredUsers.length === 0">
              <td colspan="4" class="py-12 text-center text-light-text-secondary">
                <div class="flex flex-col items-center justify-center">
                  <i
                    class="ri-user-search-line text-4xl mb-3 text-light-text-disabled"
                  ></i>
                  <p v-if="searchQuery">
                    未找到匹配 "{{ searchQuery }}" 的用户
                  </p>
                  <p v-else>暂无用户数据</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 表格底部信息 -->
      <div
        class="mt-4 text-sm text-light-text-secondary flex justify-between items-center"
      >
        <p>共 {{ filteredUsers.length }} 个用户</p>
        <div class="flex items-center space-x-2">
          <span>每页显示:</span>
          <select
            v-model="perPage"
            class="bg-white border border-light-border rounded-md px-2 py-1 text-light-text-primary text-sm"
          >
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
        </div>
      </div>
    </div>


    <!-- 通知和确认对话框组件 -->
    <PopupNotification
      v-if="showNotification"
      :message="notificationMessage"
      :type="notificationType"
      @close="showNotification = false"
    />

    <ConfirmDialog
      :show="showDialog"
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
  name: "UserManagement",
  components: {
    PageContainer,
    PopupNotification,
    ConfirmDialog,
  },
  setup() {
    const users = ref([]);
    const selectedUsers = ref([]);
    const qrcodeEnabled = ref(false);
    const searchQuery = ref("");
    const perPage = ref(10);

    // 使用通知钩子
    const {
      showNotification,
      notificationMessage,
      notificationType,
      showSuccess,
      showError,
    } = useNotification();

    // 使用确认对话框钩子
    const {
      showDialog,
      dialogTitle,
      dialogMessage,
      dialogType,
      confirm,
      handleConfirm,
      handleCancel,
    } = useConfirmDialog();

    // 过滤用户列表
    const filteredUsers = computed(() => {
      if (!searchQuery.value) return users.value;

      return users.value.filter((user) =>
        user.account.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    // 获取用户列表
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        users.value = response.data;
      } catch (error) {
        showError("获取用户列表失败");
      }
    };

    // 批量删除用户
    const handleBatchDelete = async () => {
      if (selectedUsers.value.length === 0) return;

      try {
        const confirmed = await confirm({
          title: "确认批量删除",
          message: `是否确认删除选中的 ${selectedUsers.value.length} 个用户？此操作不可撤销。`,
          type: "danger",
        });

        if (confirmed) {
          const response = await api.delete("/users", {
            data: { accounts: selectedUsers.value },
          });

          // 处理删除结果
          const result = response.data.result;
          if (result.success.length > 0) {
            showSuccess(`成功删除 ${result.success.length} 个用户`);
          }

          if (Object.keys(result.failed).length > 0) {
            const failedCount = Object.keys(result.failed).length;
            showError(`${failedCount} 个用户删除失败`);
          }

          // 清空选择并刷新列表
          selectedUsers.value = [];
          await fetchUsers();
        }
      } catch (error) {
        showError("批量删除用户失败");
      }
    };

    // 单个删除用户
    const handleDelete = async (account) => {
      try {
        const confirmed = await confirm({
          title: "确认删除",
          message: `是否确认删除用户 ${account}？此操作不可撤销。`,
          type: "danger",
        });

        if (confirmed) {
          const response = await api.delete("/users", {
            data: { accounts: [account] },
          });

          const result = response.data.result;
          if (result.success.includes(account)) {
            showSuccess(`已删除用户 ${account}`);
          } else {
            showError(`删除用户 ${account} 失败：${result.failed[account]}`);
          }

          await fetchUsers();
        }
      } catch (error) {
        showError(`删除用户 ${account} 失败`);
      }
    };

    // 切换二维码接口状态
    const toggleQRCodeStatus = async () => {
      try {
        await api.post("/auth/qrcode/status", {
          enabled: !qrcodeEnabled.value,
        });
        qrcodeEnabled.value = !qrcodeEnabled.value;
        showSuccess(`二维码登录已${qrcodeEnabled.value ? "启用" : "禁用"}`);
      } catch (error) {
        showError("更新二维码接口状态失败");
      }
    };

    // 获取二维码接口状态
    const getQRCodeStatus = async () => {
      try {
        const response = await api.get("/auth/qrcode/status");
        qrcodeEnabled.value = response.data.enabled;
      } catch (error) {
        showError("获取二维码接口状态失败");
      }
    };

    const isAllSelected = computed(() => {
      return (
        filteredUsers.value.length > 0 &&
        selectedUsers.value.length === filteredUsers.value.length
      );
    });

    // 切换全选状态
    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedUsers.value = [];
      } else {
        selectedUsers.value = filteredUsers.value.map((user) => user.account);
      }
    };

    onMounted(() => {
      fetchUsers();
      getQRCodeStatus();
    });

    return {
      users,
      filteredUsers,
      selectedUsers,
      isAllSelected,
      qrcodeEnabled,
      searchQuery,
      perPage,
      showNotification,
      notificationMessage,
      notificationType,
      showDialog,
      dialogTitle,
      dialogMessage,
      dialogType,
      handleConfirm,
      handleCancel,
      handleDelete,
      handleBatchDelete,
      toggleSelectAll,
      toggleQRCodeStatus,
    };
  },
};
</script>

<style scoped>
/* 背景模糊效果 */
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

/* 表格行交替颜色 */
tr:nth-child(odd) {
  background-color: rgba(249, 250, 251, 0.5);
}

/* 切换按钮动画 */
button:active {
  transform: scale(0.98);
}

/* 表格悬停效果 */
tbody tr:hover td {
  background-color: rgba(243, 244, 246, 0.8);
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
