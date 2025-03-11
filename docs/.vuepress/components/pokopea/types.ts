class VideoInfo {
    name: string; //标题
    cover?: string; //封面
    videoLink?: string; //原视频链接
    subtitleLink?: string; //字幕下载链接
    translation?: [VideoInfo] //翻译
}