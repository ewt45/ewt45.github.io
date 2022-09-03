import { defineUserConfig } from 'vuepress'
import { recoTheme } from 'vuepress-theme-reco'
import type { DefaultThemeOptions } from 'vuepress'

export default defineUserConfig({
  lang: 'zh-CN',
  title: '博客',
  description: '这是我的第一个 VuePress 站点',
  pagePatterns: ['**/*.md', '!**/README.md', '!.vuepress', '!node_modules'], //排除readme
  theme: recoTheme({
    style: '@vuepress-reco/style-default',
    // reco2 不知道怎么用的左侧栏(成功了，想在哪个页面显示左侧栏就添加一项，字符串为其父目录，数组里最好用对象形式，否则文章frontmatter里的title会默认变成左侧栏的文字。自定义显示文字用原生的sidebar，text自定义，link写相对路径，因为我的index.md 的浏览路径就是父路径，所以没办法加了个./。然后运行发现报错children.map的children为undefined，原来就算没children也要定义一个空的数组
    //还有就是原生的没有样式，reco的写法才有样式)
    series: {
      '/blogs/exagearInitContainer': [
        { text: '主篇', link: './', children: [] }
        , { text: '旧方法', link: 'detailed', children: [] }
      ]
      ,

      // '/blogs/exagearInitContainer':['./','detailed']
      // '/blogs/exagearInitContainer':[
      //   {text:'1',children:['index','detailed']},
      //   {text:'2',children:['index','detailed']},
      // ]
    },
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
      {
        text: '应用', link: '/', children: [
          { text: '批量生成b站合集的分p封面图', link: '/blogs/app/batchCover' }
        ]
      },
    ],
    componentsDir: './docs/.vuepress/components',

  }),

  open: true,

})