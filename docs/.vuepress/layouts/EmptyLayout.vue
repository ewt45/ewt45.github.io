<!-- 
此页面为空页面，可以在只想显示自定义组件时使用
使用方法： 在md文件中添加 frontmatter. layout设置为EmptyLayout, component设置为要显示的组件名
e.g.
---
date: '2025-03-09'
title: 狸猫花生
layout: EmptyLayout
categories: 
 - 应用
component: PokopeaMain
---

 -->
<template>
  <div>
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