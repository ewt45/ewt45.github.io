import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  lang: 'zh-CN',
  title: 'gerenbo',
  description: '这是我的第一个 VuePress 站点',
  pagePatterns:['**/*.md', '!**/README.md', '!.vuepress', '!node_modules'], //排除readme
})