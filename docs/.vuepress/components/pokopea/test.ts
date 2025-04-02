// class Video {
//     /** 视频平台 */
//     type: VideoType;
//     video_id: string;
//     title: string;
//     published_at: string;
//     duration: string;

//     constructor (type: VideoType) {
//         this.type = type
//     }
// }

// type VideoType = 'youtube' | 'bilibili'

// class YtVideo extends Video {
//     constructor() {
//         super('youtube')
//     }
// }

// const jsonStr = `
// {
//     "mK34jaJ6bnI": {
//         "video_id": "mK34jaJ6bnI",
//         "title": "【号泣】便秘VTuberが本格足つぼマッサージ体験してみた。",
//         "published_at": "2025-03-28T12:01:13Z",
//         "duration": "PT10M23S"
//     }
// }
// `

// const ytVideo : YtVideo = JSON.parse(jsonStr)
// console.log('转成data', ytVideo)