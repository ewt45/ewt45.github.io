import { defineClientConfig } from '@vuepress/client'
//element plus 组件全局导入。还有默认/暗黑模式的样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css'

import EmptyLayout from './layouts/EmptyLayout.vue'



export default defineClientConfig({
  enhance({ app }) {
    // app.component('CustomLayout', CustomLayout)
    app.use(ElementPlus)
  },
  layouts: {
    EmptyLayout,
  },
})
