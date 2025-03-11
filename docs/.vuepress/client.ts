import { defineClientConfig } from '@vuepress/client'
// import CustomLayout from './CustomLayout.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css';
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
