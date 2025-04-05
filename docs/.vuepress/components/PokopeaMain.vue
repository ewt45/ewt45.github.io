<template>
  <el-space fill direction="vertical" :size="24" alignment="center" style=" width:100%; padding:10px;">

    <!-- 工具菜单 -->
    <ToolMenus />

    <!-- 视频列表 -->
    <el-skeleton :rows="5" animated :loading="videos.orignal.length === 0" :throttle="{ leading: 500, initVal: true }">
      <el-row :gutter="8" class="video-list">
        <el-col :xs="12" :sm="12" :md="8" :lg="6" style="padding-bottom: 8px;" v-for="video in paginatedVideos"
          :key="video.video_id">
          <el-card shadow="hover">
            <div class="card-img-wrapper">
              <img :src="`https://i.ytimg.com/vi/${video.video_id}/mqdefault.jpg`" alt="thumbnail" loading="lazy" />
              <div class="card-img-bottom-shadow">
                <el-row>
                  <el-col :span="12">{{ formatDate(video.published_at) }}</el-col>
                  <el-col :span="12" style="text-align: end;">{{ formatDuration(video.duration) }}</el-col>
                </el-row>
              </div>
            </div>
            <div style="padding: 6px 6px 0px 6px;">
              <h3 :title="video.title">{{ video.title }}</h3>
              <el-text size="small" line-clamp="1" truncated>{{ video.channel_title }}</el-text>
            </div>
            <!-- 卡片底部可点图标 -->
            <template #footer>
              <el-row class="card-footer">
                <template v-for="action in cardActions" :key="action.name">
                  <el-col :span="6" v-if="is_card_action_display(action, video)"
                    @click="card_action_click(action.name, video)">
                    <component :is="action.iconComp"></component>
                  </el-col>
                </template>
              </el-row>
            </template>
          </el-card>
        </el-col>
      </el-row>
    </el-skeleton>

    <!-- 分页 这个宽度怎么这么长。。。 -->
    <div class="width-center">
      <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="videos.filtered.length"
        layout="pager" :pager-count="5" background :size="paginationSize" />
    </div>

    <!-- 操作按钮点击后弹窗 -->
    <ActionDialog v-model="dialogInfo.visible">
      <ActionYt v-if="dialogInfo.type === 'Yt'" :video_id="dialogInfo.videoData.video_id" />
      <ActionBili v-else-if="dialogInfo.type === 'Bili'" :video_list="dialogInfo.videoData.zh!" />
      <ActionSub v-else-if="dialogInfo.type === 'Sub'" :video="dialogInfo.videoData" />
      <ActionInfo v-else-if="dialogInfo.type === 'Info'" :video="dialogInfo.videoData" />
    </ActionDialog>
  </el-space>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, Ref, ref, provide, } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { ActionType, YtVideo, CardAction, FilterData, FilterTranslatedOnly, FilterSort, ToolMenuValue, DisplayVideoData, videoInjectKey, VideoInjectType, } from './pokopea/types';
import { formatDate, formatDuration } from './pokopea/utils';
import IconYt from './pokopea/IconYt.vue'
import IconBili from './pokopea/IconBili.vue';
import IconInfo from './pokopea/IconInfo.vue'
import IconSub from './pokopea/IconSub.vue'
import ActionDialog from './pokopea/ActionDialog.vue';
import ActionYt from './pokopea/ActionYt.vue';
import ActionBili from './pokopea/ActionBili.vue';
import ActionSub from './pokopea/ActionSub.vue';
import ActionInfo from './pokopea/ActionInfo.vue';
import ToolMenus from './pokopea/ToolMenus.vue';

/** 视频数据。全部与筛选的 */
const videos = ref<DisplayVideoData>({
  orignal: [],
  filtered: [],
})
/** 提供给子组件使用。子组件更新数据时调用此函数 */
const updateVideos = (filtered: typeof videos.value.filtered) => { videos.value.filtered = filtered }
provide<VideoInjectType>(videoInjectKey, { videos: videos, updateVideos, })

const currentPage = ref<number>(1)
/** 每页显示的视频数量 */
const pageSize = ref<number>(8)

/** 对话框相关数据 */
const dialogInfo = ref({
  visible: false,
  type: 'Yt' as ActionType, // Yt, Bili, Info, Sub
  videoData: {} as YtVideo,
})

/** 卡片底部按钮数据 */
const cardActions: CardAction[] = [
  { name: 'Yt', iconComp: IconYt, },
  { name: 'Bili', iconComp: IconBili, },
  { name: 'Sub', iconComp: IconSub, },
  { name: 'Info', iconComp: IconInfo, }
]

/** 当前页的视频 */
const paginatedVideos = computed<YtVideo[]>(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return videos.value.filtered.slice(start, end)
});

/** 分页组件的大小 onMount时检测窗口宽度如果过小就改成 small*/
let paginationSize = ref('default')

// 视频卡片点击事件
const card_action_click = (name: ActionType, video: YtVideo) => {
  dialogInfo.value.visible = !dialogInfo.value.visible
  dialogInfo.value.videoData = video
  dialogInfo.value.type = name
}

/** 卡片的操作按钮是否显示 */
const is_card_action_display = (action: CardAction, video: YtVideo): Boolean => {
  if (action.name === 'Bili') {
    return (video.zh && video.zh.length > 0) ? true : false
  } else {
    return true
  }
}

// 从本地 JSON 文件加载数据
const fetchVideos = async () => {
  try {
    const response = await fetch("/ppk/videos.json");
    if (!response.ok) throw new Error("无法加载视频数据");
    const data = await response.json();
    videos.value.orignal = Object.values(data)
    videos.value.filtered = [...videos.value.orignal]
  } catch (error) {
    ElMessage.error(error.message || "加载视频数据失败");
  }
};


onMounted(async () => {
  fetchVideos();
  paginationSize.value = window && window.innerWidth < 768 ? 'small' : 'default'
});


</script>


<style scoped>
@import './pokopea/style.css';

.video-list {
  width: 100%;
}

.video-list .el-card {
  --el-card-padding: 0px;
}

.video-list .el-card:hover,
.video-list .el-card:focus {
  box-shadow: var(--el-box-shadow-dark);
}

/* 视频标题 */
.video-list .el-card h3 {
  all: unset;
  font-size: 15px;
  /* margin: 10px 6px 10px 6px; */
  line-height: 20px;
  height: 40px;
  letter-spacing: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  /* 多行文本末尾省略： */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  /* 限制显示两行 */
  line-clamp: 2;
  /* 设置盒子为垂直排列 */
  -webkit-box-orient: vertical;

}

.video-list .card-img-wrapper {
  position: relative;
  /* 图片未加载时也会留出高度 */
  aspect-ratio: 16 / 9;
}


.video-list .el-card img {
  width: 100%;
  height: auto;

}

.card-img-bottom-shadow {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 42px;
  font-size: 13px;
  line-height: 18px;
  z-index: 2;
  padding: 16px 10px 10px 10px;
  background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%);
  color: #fff;
  opacity: 1;
  white-space: nowrap;
}

/* 卡片底部图标 */
.card-footer .el-col {
  padding: 8px;
  max-height: 40px;
  display: flex;
  align-content: center;
  justify-content: center;
  transition: box-shadow 0.3s ease;
  /* 添加过渡效果 */
}

.card-footer .el-col:hover,
.card-footer .el-col:active {
  box-shadow: var(--el-box-shadow);
  /* 添加灰色阴影 */
  cursor: pointer;
  /* 鼠标悬停时显示手型 */
}

.card-footer .el-col>svg {
  width: auto;
  height: auto;
  aspect-ratio: 1 / 1;
  /* 保持宽高比为 1:1 */
  max-width: 100%;
  /* 最大宽度不超过父容器 */
  max-height: 100%;
  margin: auto;
}




.width-center {
  display: flex;
  justify-content: center;
}
</style>
