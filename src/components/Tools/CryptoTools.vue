<template>
  <div class="flex p-6 text-light-text-primary h-full">
    <!-- 左侧工具列表 -->
    <div class="w-64 flex-shrink-0 pr-4 border-r border-light-border">
      <h2 class="text-xl font-medium mb-6 tracking-wide flex items-center">
        <i class="ri-lock-line mr-2 text-cyan-500"></i>加密解密工具
      </h2>
      
      <div class="space-y-1.5">
        <button
          v-for="tool in tools"
          :key="tool.action"
          @click="showModal(tool.action)"
          class="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 hover:bg-light-bg focus:bg-light-bg flex items-center"
          :class="{'bg-light-bg-active text-primary': currentAction === tool.action}"
        >
          <i
            :class="[tool.icon, {'text-primary': currentAction === tool.action}]"
            class="text-lg mr-3 text-light-text-tertiary"
          ></i>
          <span>{{ tool.name }}</span>
        </button>
      </div>
    </div>

    <!-- 右侧操作面板 -->
    <div class="flex-1 pl-6 ml-2">
      <div v-if="currentAction" class="rounded-2xl bg-white/90 backdrop-blur-sm border border-light-border p-6 h-full shadow-light-card">
        <!-- 标题和工具名称 -->
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-base font-medium">{{ currentToolName }}</h3>
        </div>

        <!-- 输入和结果区域 -->
        <div class="space-y-6">
          <!-- 输入区域 -->
          <div>
            <label
              class="block text-sm font-medium mb-2 text-light-text-secondary flex items-center"
            >
              <i class="ri-text-line mr-2 text-light-text-tertiary"></i>输入文本
            </label>
            <textarea
              v-model="inputText"
              class="w-full px-4 py-2.5 rounded-xl bg-light-bg border border-light-border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all duration-200 min-h-[120px]"
              placeholder="请输入需要处理的文本"
            ></textarea>
          </div>

          <!-- AES加密解密的密钥输入 -->
          <div v-if="['aesEncrypt', 'aesDecrypt'].includes(currentAction)">
            <label
              class="block text-sm font-medium mb-2 text-light-text-secondary flex items-center"
            >
              <i class="ri-key-2-line mr-2 text-light-text-tertiary"></i>密钥
            </label>
            <input
              v-model="key"
              type="text"
              class="w-full px-4 py-2.5 rounded-xl bg-light-bg border border-light-border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all duration-200"
              placeholder="请输入密钥"
            />
          </div>

          <!-- 操作按钮 -->
          <div class="flex space-x-3">
            <button
              @click="handleAction"
              class="flex-1 px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 border border-cyan-500/30 text-sm font-medium transition-all duration-200 flex items-center justify-center"
            >
              <i class="ri-play-line mr-2"></i>执行
            </button>
            <button
              @click="clearInputs"
              class="flex-1 px-4 py-2.5 rounded-xl bg-light-bg hover:bg-light-bg-hover text-light-text-primary text-sm font-medium transition-all duration-200 flex items-center justify-center border border-light-border"
            >
              <i class="ri-delete-bin-line mr-2"></i>清空
            </button>
          </div>

          <!-- 结果显示 -->
          <div v-if="outputText" class="space-y-3">
            <div
              class="p-4 rounded-xl bg-light-bg border border-light-border break-words"
            >
              <p class="text-sm text-light-text-secondary mb-2 flex items-center">
                <i class="ri-file-list-line mr-2"></i>处理结果：
              </p>
              <div class="max-h-[160px] overflow-y-auto overflow-x-auto custom-scrollbar">
                <p class="text-sm p-1 text-light-text-primary font-mono">{{ outputText }}</p>
              </div>
            </div>

            <button
              @click="copyToClipboard"
              class="w-full px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 border border-cyan-500/30 text-sm font-medium transition-all duration-200 flex items-center justify-center"
            >
              <i class="ri-clipboard-line mr-2"></i>
              <span>{{ copyButtonText }}</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 未选择工具时的提示 -->
      <div v-else class="h-full flex items-center justify-center text-light-text-tertiary">
        <div class="text-center">
          <i class="ri-arrow-left-line text-4xl mb-2"></i>
          <p>请从左侧选择一个工具</p>
        </div>
      </div>
    </div>

    <!-- 复制成功提示 -->
    <div
      v-if="showCopySuccess"
      class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm text-light-text-primary text-sm px-4 py-2 rounded-full shadow-light-card border border-light-border transition-all duration-300 flex items-center"
    >
      <i class="ri-check-line mr-2 text-green-500"></i>已复制到剪贴板
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import CryptoJS from "crypto-js";

export default {
  name: "CryptoTools",
  setup() {
    const inputText = ref("");
    const outputText = ref("");
    const currentAction = ref("");
    const key = ref("");
    const showCopySuccess = ref(false);
    const copyButtonText = ref("复制结果");

    const tools = [
      {
        name: "Base64 加密",
        action: "base64Encode",
        icon: "ri-lock-password-line",
      },
      {
        name: "Base64 解密",
        action: "base64Decode",
        icon: "ri-lock-unlock-line",
      },
      { name: "AES 加密", action: "aesEncrypt", icon: "ri-lock-2-line" },
      { name: "AES 解密", action: "aesDecrypt", icon: "ri-key-line" },
      { name: "MD5 加密", action: "md5Hash", icon: "ri-fingerprint-line" },
      {
        name: "SHA-256 加密",
        action: "sha256Hash",
        icon: "ri-shield-keyhole-line",
      },
      { name: "URL 编码", action: "urlEncode", icon: "ri-global-line" },
      { name: "URL 解码", action: "urlDecode", icon: "ri-search-line" },
      { name: "Hex 编码", action: "hexEncode", icon: "ri-code-box-line" },
      { name: "Hex 解码", action: "hexDecode", icon: "ri-braces-line" },
    ];

    // 获取当前工具名称
    const currentToolName = computed(() => {
      const tool = tools.find((t) => t.action === currentAction.value);
      return tool ? tool.name : "";
    });

    // 显示工具操作面板
    const showModal = (action) => {
      currentAction.value = action;
      // 不清空输入，方便用户在不同工具间切换处理同一文本
      if (outputText.value) {
        outputText.value = "";
      }
    };

    // 清空输入
    const clearInputs = () => {
      inputText.value = "";
      outputText.value = "";
      key.value = "";
    };

    // 处理加密解密操作
    const handleAction = () => {
      if (!inputText.value) return;

      switch (currentAction.value) {
        case "base64Encode":
          outputText.value = btoa(inputText.value);
          break;
        case "base64Decode":
          try {
            outputText.value = atob(inputText.value);
          } catch (e) {
            outputText.value = "无效的 Base64 输入";
          }
          break;
        case "aesEncrypt":
          if (inputText.value && key.value) {
            outputText.value = CryptoJS.AES.encrypt(
              inputText.value,
              key.value
            ).toString();
          } else {
            outputText.value = "请输入文本和密钥";
          }
          break;
        case "aesDecrypt":
          if (inputText.value && key.value) {
            try {
              const decrypted = CryptoJS.AES.decrypt(
                inputText.value,
                key.value
              ).toString(CryptoJS.enc.Utf8);
              outputText.value = decrypted || "解密失败，可能是密钥错误";
            } catch (e) {
              outputText.value = "无效的 AES 输入或密钥错误";
            }
          } else {
            outputText.value = "请输入密文和密钥";
          }
          break;
        case "md5Hash":
          outputText.value = CryptoJS.MD5(inputText.value).toString();
          break;
        case "sha256Hash":
          outputText.value = CryptoJS.SHA256(inputText.value).toString();
          break;
        case "urlEncode":
          outputText.value = encodeURIComponent(inputText.value);
          break;
        case "urlDecode":
          try {
            outputText.value = decodeURIComponent(inputText.value);
          } catch (e) {
            outputText.value = "无效的 URL 编码";
          }
          break;
        case "hexEncode":
          outputText.value = textToHex(inputText.value);
          break;
        case "hexDecode":
          try {
            outputText.value = hexToText(inputText.value);
          } catch (e) {
            outputText.value = "无效的 Hex 编码";
          }
          break;
        default:
          outputText.value = "";
      }
    };

    // 文本转 Hex
    const textToHex = (text) => {
      return text
        .split("")
        .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("");
    };

    // Hex 转文本
    const hexToText = (hex) => {
      if (!/^[0-9a-fA-F]+$/.test(hex)) {
        throw new Error("Invalid hex string");
      }

      return hex
        .match(/.{1,2}/g)
        .map((byte) => String.fromCharCode(parseInt(byte, 16)))
        .join("");
    };

    // 复制到剪贴板
    const copyToClipboard = () => {
      navigator.clipboard
        .writeText(outputText.value)
        .then(() => {
          // 更改按钮文字
          copyButtonText.value = "已复制";
          // 显示提示
          showCopySuccess.value = true;

          // 2秒后恢复按钮文字
          setTimeout(() => {
            copyButtonText.value = "复制结果";
            showCopySuccess.value = false;
          }, 2000);
        })
        .catch(() => {
          copyButtonText.value = "复制失败";
          setTimeout(() => {
            copyButtonText.value = "复制结果";
          }, 2000);
        });
    };

    return {
      inputText,
      outputText,
      currentAction,
      currentToolName,
      key,
      showCopySuccess,
      copyButtonText,
      tools,
      showModal,
      clearInputs,
      handleAction,
      copyToClipboard,
    };
  },
};
</script>

<style scoped>
/* 自定义滚动条 */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* 确保文本正确换行 */
.break-words {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* 按钮按下效果 */
button:active {
  transform: scale(0.98);
}

/* 工具列表项悬停效果 */
button:hover i {
  color: #0891b2; /* 青色 */
}
</style>
