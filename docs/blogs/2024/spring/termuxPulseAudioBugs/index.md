---
date: '2024-5-11 20:18:36'
title: Termux的PulseAudio的Bug（华为，荣耀，三星）
categories: 
 - android
tags:
 - android
 - termux
 - pulseaudio
 - huawei
---

## 华为/荣耀手机无声音
解决办法：
参考https://github.com/termux/termux-packages/issues/11208

sles不工作但是aaudio，去配置文件里开启。
打开`/data/data/com.termux/files/usr/etc/pulse/default.pa`
最后一行`#load-module module-aaudio-sink` 前的注释 `#` 删掉。

## 三星手机（One UI 6.1） 无声音
也是sles不工作
解决办法参考
https://github.com/termux/termux-packages/issues/19623

添加环境变量
`LD_PRELOAD=/system/lib64/libskcodec.so`

----
貌似系统小更之后bug也更新了，需要新的解决办法
https://github.com/termux/termux-packages/issues/19623#issuecomment-2123168051