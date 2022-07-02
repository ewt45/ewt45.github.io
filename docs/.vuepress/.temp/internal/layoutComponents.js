import { defineAsyncComponent } from 'vue'

export const layoutComponents = {
  "404": defineAsyncComponent(() => import("D:/code_data/VSCode/ewt45.github.io/node_modules/vuepress-theme-reco/lib/client/layouts/404.vue")),
  "Categories": defineAsyncComponent(() => import("D:/code_data/VSCode/ewt45.github.io/node_modules/vuepress-theme-reco/lib/client/layouts/Categories.vue")),
  "Layout": defineAsyncComponent(() => import("D:/code_data/VSCode/ewt45.github.io/node_modules/vuepress-theme-reco/lib/client/layouts/Layout.vue")),
  "Post": defineAsyncComponent(() => import("D:/code_data/VSCode/ewt45.github.io/node_modules/vuepress-theme-reco/lib/client/layouts/Post.vue")),
  "Timeline": defineAsyncComponent(() => import("D:/code_data/VSCode/ewt45.github.io/node_modules/vuepress-theme-reco/lib/client/layouts/Timeline.vue")),
}
