// class VideoInfo {
//     name: string; //标题
//     cover?: string; //封面
//     videoLink?: string; //原视频链接
//     subtitleLink?: string; //字幕下载链接
//     translation?: [VideoInfo] //翻译
// }

import {Ref} from 'vue'

type VideoType = 'youtube' | 'bilibili'

/** 卡片操作 */
type ActionType = 'Yt' | 'Bili' | 'Sub' | 'Info'

interface CardAction { name: ActionType, iconComp: any, }

interface BiliVideo {
    video_bvid: string;
    /** e.g. 全熟，切熟 */
    tag: string;
    added_at: string;
}

// 定义视频数据的类型
interface YtVideo {
    /** 频道名 */
    channel_title: string;
    video_id: string;
    title: string;
    published_at: string;
    duration: string;

    /** 熟肉 */
    zh?: BiliVideo[];
}

interface DisplayVideoData {
    /** json读取出的全部yt视频 */
    orignal: YtVideo[],
    /** 对videos筛选后的yt视频 */
    filtered: YtVideo[]
}

/** 工具菜单的选项 */
type ToolMenuValue = 'none' | 'filter' | 'info_link'

type FilterTranslatedOnly = 'all' | 'zh' | 'ja'
type FilterSortBy = 'published_at' | 'added_at'
type FilterSort = {
    by: FilterSortBy,
    /** 降序排列（从新到旧） */
    descending: boolean
}

interface FilterData {
    /** 筛选熟肉/生肉 */
    translatedOnly: FilterTranslatedOnly;
    /** 搜索. 为空时不筛选 */
    searchText: string;
    /** 排序 */
    sort: FilterSort;
    /** 频道名 为空时不筛选 */
    channelTitle: string;
}

/** provide/inject获取 videos数据的key */
const videoInjectKey = Symbol()
/** provide/inject获取 videos数据的类型 */
type VideoInjectType = {
    videos: Ref<DisplayVideoData>,
    updateVideos: (filterd: YtVideo[]) => void
}

export type {
    YtVideo,
    DisplayVideoData,
    VideoInjectType,
    ActionType,
    BiliVideo, CardAction,
    FilterData, FilterTranslatedOnly,
    FilterSort,
    ToolMenuValue,
};

export {
    videoInjectKey,
}