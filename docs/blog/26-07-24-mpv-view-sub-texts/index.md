---
createTime: 2026/07/24 09:05
title: mpv 脚本：字幕浏览器
categories:
  - linux
  - 应用
tags:
  - mpv
  - linux
  - ffmpeg
  - 扩展
  - 字幕
permalink: /blog/2026/07/24-mpv-view-sub-texts/index/
---

## 前言
之前写过 vlc 的脚本，非常痛苦。ubuntu 的 deb 源过时导致脚本属性和函数都不一致，没有文档可以参考。

这次尝试了 mpv 的脚本，语言采用 javascript（只支持 ES5），界面有 uosc，在 gemini 的加持下非常轻松就实现了。flatpak 版保证是最新的，而且官方文档单页面且非常清晰。

成品展示：  
https://github.com/ewt45/mpv-scripts/view_sub_texts （更多见内 README）  
![view_sub_texts.avif](https://files.seeusercontent.com/2026/07/31/jY2s/view_sub_texts.avif)


参考：
- [几种字幕格式](https://www.quicklrc.com/subtitle-formats)
- [ass 字幕格式规范](https://github.com/weizhenye/ASS/wiki/ASS-字幕格式规范)
- [uosc 菜单使用](https://github.com/tomasklaen/uosc/wiki/Menu-API)



## 用户操作逻辑
1. 显示 mpv 中的全部字幕轨道。
2. 点击轨道，显示对应的字幕文本。
3. 对于每行字幕文本，用户可以跳转到当前时间或复制文字。对于全部字幕文本，用户可以导出到视频同目录或复制到剪切板。
4. 显示字幕文本时，若为当前播放器选中的首选字幕轨，则初始时跳转到当前时间对应的字幕行，后续同步高亮当前字幕行。

## 实现思路
- 获取 mpv 全部字幕轨道：
	- `mp.get_property_native("track-list")`
	- 筛选出 `track.type === 'sub'`
 

- 获取轨道 id：
	- 视频内封：`track.id`. 注意该 id 为 mpv 分配，文件内原始 id 为 `track[src-id]`
	- 外部文件：`track["ff-index"]`.
	  是否为外部文件：`track.external`.
	  外部文件名：` track["external-filename"]`


- 编码类型先只考虑文本类型的。


- 提取原始文本：
	- 视频内封：
	  `['ffmpeg', '-y', '-v', 'quiet', '-i', filepath, '-map', '0:' + trackId, '-f', outFormat, '-']`.
	  `outFormat` 为编码对应的文件格式，如 srt, ass.
	  `-` 表示输出到 stdout.
	- 外部文件直接读取: `mp.read_file()`
 

- 用 ffmpeg 将原始文本统一转为 srt 格式，这样只需要编写一种格式的解析器就可以了。原始文本也保留一份，用于导出。：
	`['ffmpeg', '-y', '-v', 'quiet', '-i', 'pipe:', '-f', 'srt', '-']`
	`pipe:` 表示从 stdin 接收输入。
	`-f srt` 强制转为 srt 格式。

## 向外暴露自身
1. 向 mpv 范围内导出一个命令名称，可以通过 mpv 的 command 使用，或 input.conf 中绑定快捷键。
`mp.add_key_binding(null, 命令名称, showSubTracksMenu);`
	- 在 input.conf 中绑定：`Ctrl+S script-binding 脚本名/命令名称`。注意大写 S 表示 shift + s.
	- 在外部调用自身命令 `mp.commandv('script-message-to', 脚本名, 命令名称);`

2. 向 uosc 的底部控制条导出一个按钮名称，这样用户后续可以手动向 `script-opts/usoc.conf` 中添加按钮 `button:自定义名称` 而不用写一长串了。
https://github.com/tomasklaen/uosc/wiki#set-button-name-data_json
`mp.commandv('script-message-to', 'uosc', 'set-button', 'btn-name', JSON.stringify({配置});`



## mp 内置函数
参考 [mpv 手册](https://mpv.io/manual/master)

- 获取公共属性
[一些可以通过 mp.get_property_ 获取的属性](https://mpv.io/manual/master/#property-list) 。
另外 [options](https://mpv.io/manual/master/#options) 也可以作为属性获取，但有一些[区别](https://mpv.io/manual/master/#inconsistencies-between-options-and-properties).

- 监听属性变化 `mp.observe_property`

- 启动子进程，调用外部二进制文件：
	```js
	var r = mp.command_native({
	        name: "subprocess",
	        args: ["ffmpeg", "-help"],
	        playback_only: true, // 没有视频在播放了就结束
	        capture_stdout : true, // 如果设置为 true, 不会直接输出而是保存到 r.stdout 中。
	        apture_stderr : true,
	    })
	```
	可以指定 `stdin_data` 作为输入。
	输出内容从 `r.stdout/stderr` 获取。


## uosc 菜单使用
https://github.com/tomasklaen/uosc/wiki/Menu-API#callback-mode
1. 使用 open-menu 显示菜单，传入 menu
    mp.commandv('script-message-to', 'uosc', 'open-menu', JSON.stringify(menu))
2. menu.callback 指定回调，然后注册菜单事件监听回调
    mp.register_script_message('menu-event', function (jsonStr) {...})
3. item 旁显示按钮（action）
    menu.item_actions 指定所有 item 的按钮，或 item.actions 指定单个 item 的按钮。
    同样使用回调模式，回调中 event.action 为 item 中指定的 action.name.
    图标使用 https://fonts.google.com/icons 中的名称，小写 + 下划线连接。
4. 特殊图标： spinner. 可以用于显示‘加载中’占位项
5. 使用 update-menu 更新菜单内容。同样将 menu 转为 json 传入，注意保持 menu.type 一致。
6. 子菜单
    如果 menu.items 的项不是 Item 而是 Submenu，即指定 {.items} 而不是 {.value}，
    那么点击会在右侧显示子菜单，原菜单左移。
    但是这种方法点击子菜单时没有回调，所以没法用于点击子菜单后立即更新内容，只能点击子菜单再点击子菜单中的选项触发更新。
7. 多行文本
    单个 Item 高度固定，多行文字显示不全。可以拆分成多个 Item, 并设置最后一个 item.separator = true. 
    这样看起来像在一行。不过 action 还是按单个 Item 来的所以注意给每个 Item 设置相同的完整 value.


## flatpak 版限制
1. 写入限制：flatpak 限制程序的可读写目录。
	查看：`flatpak info --show-permissions io.mpv.Mpv`.
	发现可写入的只有 `xdg-pictures;/tmp;xdg-videos;` （图片，视频文件夹）， 所以导出字幕文件时大概率失败，没权限时就回退到复制到剪切板吧。

2. ffmpeg 获取限制：获取到的应该是 flatpak 内的（还是 mpv 自带的？） ffmpeg 而不是外部环境的。