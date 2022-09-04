---
date: '2022-09-04 10:30'
title: 解决安卓11和12无法通过音量键+调出游戏键盘
categories: 
 - 技术
tags:
 - android
 - 游戏键盘
 - 输入法
 - 安卓12
---
## 解决办法
连android studio, logcat选游戏键盘的包，发现报错。
```
Unexpected null in startExtractingText : mExtractedText = null, input connection = InputConnectionWrapper{idHash=#721e24 mMissingMethods=}
```
emmm找了很多资料，甚至自己抄了一个输入法，后来发现这个报错貌似不解决也没什么关系。\
看了下游戏键盘的dex（居然还有混淆），调出输入法有两个showsoftinputfrommethod 和 showSoftInput，给这两个方法里加个log，发现用的是前者。然后as里调用这个方法，发现在安卓9之后被废弃了，建议用requestshowself。\
于是用了这个，就解决了。。。\
那个Unexpected null的报错还在。
## 演示
解决前：\
![图1](./res/1.gif)

解决后\
![图2](./res/2.gif)

视频及修复后的apk下载地址：
[解决exagear 安卓12 无法调出键盘](https://www.bilibili.com/video/BV1TN4y1F7Pi)