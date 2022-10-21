---
date: '2022-9-6 13:46:23'
title: 将virgl overlay的apk整合入exagear
categories: 
 - 技术
 - exagear
tags:
 - android
 - virgl overlay
 - exagear
---

## 懒人教程
先发懒人教程。自己探索的过程之后再说。\
[所需文件](https://pan.baidu.com/s/1R8dSY10dCBwzepnPd9ONWg?pwd=it4h)
### dex
- 下载smali.zip，打开mt管理器的dex编辑器++，在浏览界面长按任意路径，导入。
- 在EDMainActivity的OnCreate方法末尾，添加语句以初始化ov设置界面。
    ```smali 
    new-instance v0, Lcom/example/datainsert/exagear/virgloverlay/OverlayBuildUI;

    invoke-direct {v0, p0}, Lcom/example/datainsert/exagear/virgloverlay/OverlayBuildUI;-><init>(Landroid/support/v7/app/AppCompatActivity;)V
    ```
- OverlayBuildUI里有个资源ID 0x7f09006e 是ed_main_content_frame对应的资源ID。不同版本ex这个值或许不同，请以实际为准。
### so
将overlay apk lib里的so全部复制到exa中。

### manifest
- 将overlay apk manifest里的service，32个process都复制到exa的manifest中。
- 添加悬浮窗权限 `<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />`
----
编译，签名apk即可