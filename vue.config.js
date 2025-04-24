const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 设置publicPath为相对路径，这样打包后的资源引用路径是相对的
  publicPath: './',
  // 可以自定义输出目录，默认是dist
  outputDir: 'dist',
  // 确保打包后的静态资源放在正确目录
  assetsDir: 'assets',
  // 生产环境不生成sourcemap，减小体积
  productionSourceMap: false
})
