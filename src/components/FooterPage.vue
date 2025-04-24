<template>
  <footer class="bg-white/80 backdrop-blur-md text-light-text-secondary border-t border-light-border py-6">
    <div class="container mx-auto px-6 flex flex-col items-center justify-center">
      <!-- 版权信息 -->
      <div class="flex flex-col items-center space-y-2 text-center">
        <h3 class="text-sm font-medium text-light-text-primary mb-2">© 2025 YangMiee 攻击面梳理平台</h3>
        <p class="text-xs">
          我们致力于为安全团队提供高效、易用的攻击面梳理工具
        </p>
        <div class="flex items-center space-x-4 mt-2">
          <a
            href="#"
            class="text-light-text-secondary hover:text-primary transition-colors duration-300"
          >
            <i class="ri-github-fill text-lg"></i>
          </a>
          <a
            href="#"
            class="text-light-text-secondary hover:text-primary transition-colors duration-300"
          >
            <i class="ri-twitter-x-fill text-lg"></i>
          </a>
          <a
            href="#"
            class="text-light-text-secondary hover:text-primary transition-colors duration-300"
          >
            <i class="ri-mail-fill text-lg"></i>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// 使用 script setup 风格
</script>

<style scoped>
footer {
  min-height: 80px;
}

/* 链接悬停效果 */
a {
  position: relative;
}

a::after {
  content: "";
  position: absolute;
  width: 0;
  height: 1px;
  bottom: -2px;
  left: 0;
  background-color: rgba(156, 163, 175, 0.5);
  transition: width 0.3s ease;
}

a:hover::after {
  width: 100%;
}
</style>
