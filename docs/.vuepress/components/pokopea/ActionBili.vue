<template>

  <el-tabs v-if="video_list.length > 0" v-model="activeBvid" type="card">
    <el-tab-pane v-for="video in video_list" :label="video.tag || '未命名'" :name="video.video_bvid">
    </el-tab-pane>
  </el-tabs>

  <!-- autoplay=0 禁止自动播放 -->
  <iframe v-if="activeBvid" @load="onLoad"
    :src="`//player.bilibili.com/player.html?isOutside=true&bvid=${activeBvid}&autoplay=0`" scrolling="no" border="0"
    frameborder="no" framespacing="0" allowfullscreen="true"></iframe>

</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { BiliVideo } from './types';
import { ElLoading } from 'element-plus';
// 要求 video_list 必须存在
const prop = defineProps<{ video_list: Required<BiliVideo[]> }>();
const activeBvid = ref('')
/** 加载条 */
let elloading: any = null

onMounted(() => {
  activeBvid.value = prop.video_list.length === 0 ? '' : prop.video_list[0].video_bvid

  //不知道为啥直接在iframe上写v-if不生效。只好挂载到dialog body上了
  // elloading = ElLoading.service({ target: '.el-dialog__body' })
})

const onLoad = () => {
  if (elloading) {
    elloading.close()
    elloading = null
  }
}

watch(activeBvid, (val, old) => {
  if (val !== old && !elloading)
    elloading = ElLoading.service({ target: '.el-dialog__body' })
})
</script>