/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,vue}"],
  theme: {
    extend: {
      colors: {
        // 白色主题的颜色系统
        primary: {
          light: '#40a9ff',
          DEFAULT: '#1890ff',
          dark: '#096dd9',
        },
        // 背景色系列
        'light-bg': {
          DEFAULT: '#f0f2f5',
          card: 'rgba(255, 255, 255, 0.8)',
          hover: 'rgba(255, 255, 255, 0.9)',
          active: 'rgba(24, 144, 255, 0.1)',
        },
        // 边框色系列
        'light-border': {
          DEFAULT: 'rgba(0, 0, 0, 0.06)',
          strong: 'rgba(0, 0, 0, 0.15)',
          active: 'rgba(24, 144, 255, 0.2)',
        },
        // 文本色系列
        'light-text': {
          primary: 'rgba(0, 0, 0, 0.85)',
          secondary: 'rgba(0, 0, 0, 0.65)',
          disabled: 'rgba(0, 0, 0, 0.45)',
        },
      },
      backgroundImage: {
        'light-gradient': 'linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%)',
      },
      boxShadow: {
        'light-card': '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
        'light-dropdown': '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
