<template>
  <div class="root">
    <!-- 油管视频 -->
    <el-descriptions title="原视频信息" :column="1" border>
      <el-descriptions-item label="原网址">
        <el-link :href="getYtVideoLink()" target="_blank">{{ getYtVideoLink() }}</el-link>
      </el-descriptions-item>
      <el-descriptions-item label="标题">{{ video.title }}</el-descriptions-item>
      <el-descriptions-item label="频道">{{ video.channel_title }}</el-descriptions-item>
      <el-descriptions-item label="封面">
        <el-space size="large">
          <el-link :href="`https://i.ytimg.com/vi/${video.video_id}/mqdefault.jpg`" target="_blank">小</el-link>
          <el-link :href="`https://i.ytimg.com/vi/${video.video_id}/sddefault.jpg`" target="_blank">中</el-link>
          <el-link :href="`https://i.ytimg.com/vi/${video.video_id}/maxresdefault.jpg`" target="_blank">大</el-link>
        </el-space>
      </el-descriptions-item>
      <el-descriptions-item label="发布时间">
        {{ video.published_at.replace("T", ' ').replace("Z", '') }}
      </el-descriptions-item>
      <el-descriptions-item label="时长">
        {{ formatDuration(video.duration) }}
      </el-descriptions-item>
      <el-descriptions-item label="熟肉">
        <template v-if="!video.zh">无</template>
        <template v-else>
          <template v-for="zhVideo in video.zh">
            <el-link :href="getBlVideoLink(zhVideo.video_bvid)" target="_blank">
              {{ zhVideo.tag || '未命名' }}
            </el-link>
            <br>
          </template>
        </template>
      </el-descriptions-item>
    </el-descriptions>

  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { YtVideo } from './types';
import { formatDuration } from './utils';

const prop = defineProps<{
  video: YtVideo,
}>()

// const selectedBvid = ref('')
// const selected_zhVideo = computed(() => {
//   if (!prop.video.zh || !selectedBvid) return undefined
//   else return prop.video.zh.find(val => val.video_bvid === selectedBvid.value)
// }) 

const getYtVideoLink = () => `https://www.youtube.com/watch?v=${prop.video.video_id}`

const getBlVideoLink = (bvid: string) => `https://www.bilibili.com/video/${bvid}/`
</script>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
  margin: auto;
}
</style>