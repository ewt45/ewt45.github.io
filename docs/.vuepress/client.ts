import { defineClientConfig } from '@vuepress/client'
// import CustomLayout from './CustomLayout.vue'
import ElementPlus from 'element-plus'




export default defineClientConfig({
  enhance({ app }) {
    // app.component('CustomLayout', CustomLayout)
    app.use(ElementPlus)
  },
})