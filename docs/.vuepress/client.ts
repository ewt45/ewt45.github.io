import { defineClientConfig } from '@vuepress/client'
// import CustomLayout from './CustomLayout.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css';



export default defineClientConfig({
  enhance({ app }) {
    // app.component('CustomLayout', CustomLayout)
    app.use(ElementPlus)
  },
})