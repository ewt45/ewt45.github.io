<template>
  <el-space class="root" direction="vertical" :size="36">
    <div>
      <el-text size="large">
      下载此youtube视频的字幕（机翻）。点击按钮会跳转到外部网站
      <el-link href="https://downsub.com/" target="_blank">downsub</el-link>
    </el-text>
    <el-alert title="请自行鉴别外部网站内容的真实性与安全性" type="warning" show-icon :closable="false" />
    
    </div>
    <el-button type="primary" size="large" round @click="gotoDownsub">点击跳转</el-button>
  </el-space>
</template>

<script setup lang="ts">
import { YtVideo } from './types';

const prop = defineProps<{
  video: YtVideo,
}>()

const gotoDownsub = () => {
  window.open(`https://downsub.com/?url=https://www.youtube.com/watch?v=${prop.video.video_id}`, "_blank");
}
</script>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
  margin: auto;
}
</style>