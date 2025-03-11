<template>
  <div>
    <!-- <section class="page-404-wrapper">
      <div class="content">
        <h1>404</h1>
        <p>Oops! Page does not exist.</p>
        <div class="xicon-container">Go Home</div>
      </div>
    </section> -->
    <component :is="targetComponent"></component>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { usePageData } from 'vuepress/client';

// import GenericContainer from 'vuepress-theme-reco' //这句导入会导致报错？

// import { useRouteLocale } from 'vuepress/client';
// import { useThemeLocaleData } from 'vuepress-theme-reco/lib/client/composables/index.js';

// const routeLocale = useRouteLocale()
// const themeLocal = useThemeLocaleData()

const pageData = usePageData()
const targetComponent = ref(pageData.value.frontmatter['component'])
// console.log("找到目标组件？", targetComponent.value, pageData.value.frontmatter['component'])

</script>