<template>
  <!-- 组件宽度尽量占满，最大700px -->
  <el-form :model="filterData" label-width="auto" style="max-width: 700px; width: 100%;">
    <el-form-item label="语言">
      <el-radio-group v-model="filterData.translatedOnly">
        <el-radio value="all">全部</el-radio>
        <el-radio value="zh">熟肉</el-radio>
        <el-radio value="ja">生肉</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="排序">
      <el-radio-group v-model="filterData.sort.by">
        <el-radio value='published_at'>上传时间</el-radio>
        <el-tooltip content="本页面收录某视频的时间，仅对熟肉（b站视频）有效">
          <el-radio value="added_at">添加时间</el-radio>
        </el-tooltip>
      </el-radio-group>
    </el-form-item>
    <!-- 正序/倒序尚未实现 -->

    <el-form-item label="频道名">
      <el-autocomplete v-model="filterData.channelTitle" :fetch-suggestions="channelTitles" clearable />
    </el-form-item>


    <el-form-item label="搜索内容">
      <el-tooltip content="可搜索b站视频bv号，油管视频id, 视频标题">
        <el-input v-model="filterData.searchText" placeholder="输入搜索内容" />
      </el-tooltip>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="doFilter(filterData)">
        筛选
      </el-button>
    </el-form-item>
  </el-form>

</template>

<script setup lang="ts">
import { computed, inject, reactive } from 'vue';
import { DisplayVideoData, FilterData, FilterTranslatedOnly, videoInjectKey, VideoInjectType, YtVideo } from './types';
import { ElLoading, ElMessage } from 'element-plus';

/** 筛选选项 */
const filterData = reactive<FilterData>({
  translatedOnly: 'all',
  searchText: '',
  sort: { by: 'published_at', descending: true, },
  channelTitle: '',
})

/** 视频数据 */
const { videos, updateVideos } = inject<VideoInjectType>(videoInjectKey)!

// const prop = defineProps<{
//   onSubmit: (form: FilterData) => void,
// }>()

/** 全部可选的频道名[{value:名},] */
const channelTitles = computed(() => {
  const countMap = new Map<string, number>();
  videos.value.orignal.forEach(val => countMap.set(val.channel_title, (countMap.get(val.channel_title) || 0) + 1));
  return [...countMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(item => ({ value: item[0] }))
})

/** 执行筛选 */
const doFilter = (filter: FilterData) => {
  //显示加载遮罩
  const loading = ElLoading.service({ fullscreen: true, })
  new Promise(resolve => {
    const translateOnly = (val: FilterTranslatedOnly, vid: YtVideo) => {
      if (val === 'ja') return vid.zh ? false : true
      else if (val === 'zh') return vid.zh ? true : false
      else return true
    }
    /** 搜索内容。无搜索文字时固定返回true.有搜索文字时 搜索到返回true 否则返回false */
    const searchText = (val: string, vid: YtVideo): boolean => {
      const str = val.trim().toLowerCase() //转为小写比较
      if (!str) return true
      else return vid.video_id.toLowerCase() === str
        || (vid.zh?.some(bili => bili.video_bvid.toLowerCase() === str) || false)
        || vid.title.toLowerCase().includes(str)
    }
    const channelTitle = (val: string, vid: YtVideo): boolean => {
      if (!val) return true
      else return vid.channel_title === val
    }
    /** 获取一个ytvideo的熟肉视频中，添加时间最新的那个 */
    const latestZhVideoTime = (vid: YtVideo): number => {
      const latest = vid.zh!.reduce((previous, curr) => new Date(curr.added_at) > new Date(previous.added_at) ? curr : previous).added_at
      return new Date(latest).getTime()
    }

    let processingVideos = videos.value.orignal.filter((vid, idx) => {
      if (vid.video_id === 'r8fq4YN0o_Q') {
        console.log('为啥沒筛选出来？？？', vid, filter, translateOnly(filter.translatedOnly, vid), searchText(filter.searchText, vid))
      }
      return translateOnly(filter.translatedOnly, vid)
        && searchText(filter.searchText, vid)
        && channelTitle(filter.channelTitle, vid)
        && true;
    }).sort((a, b) => {
      let sub: number = 0
      if (filter.sort.by === 'published_at') {
        sub = new Date(a.published_at).getTime() - new Date(b.published_at).getTime()
      } else if (filter.sort.by === 'added_at') {
        if (!a.zh && b.zh) sub = -1
        else if (a.zh && !b.zh) sub = 1
        else if (a.zh && b.zh) sub = latestZhVideoTime(a) - latestZhVideoTime(b)
      }
      return filter.sort.descending ? -sub : sub
    })

    videos.value.filtered = processingVideos
    loading.close()
    resolve(null)
  }).catch(error => {
    ElMessage.error(error.message)
  })
}

</script>