import { defineUserConfig } from 'vuepress'
import { recoTheme } from 'vuepress-theme-reco'
import type { DefaultThemeOptions } from 'vuepress'

export default defineUserConfig({
  lang: 'zh-CN',
  title: '博客',
  description: '这是我的第一个 VuePress 站点',
  pagePatterns: ['**/*.md', '!**/README.md', '!.vuepress', '!node_modules'], //排除readme
  theme: recoTheme({
    //reco2 不知道怎么用的左侧栏
    // series: {
    //   '/blogs/': ['/blogs/blog1', '/blogs/blog2']
    // },
    //vuepress2 不知道怎么用的左侧边栏
    // sidebar:  {
    //   '/blogs/':[
    //     '/blogs/blog1','/blogs/blog2'
    //   ]
    // },
    // type: 'blog',
    //reco1 右侧栏，当前文章的章节
    subSidebar: 'auto',
    //顶部导航栏
    navbar: [
      { text: '首页', link: '/', icon: 'reco-home' },
    ],
    componentsDir:'./docs/.vuepress/components',

  }),

})