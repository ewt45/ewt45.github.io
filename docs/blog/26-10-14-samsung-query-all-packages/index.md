---
title: 三星申请浏览应用列表（查询所有软件包）权限
categories:
  - android
tags:
  - 三星
  - 权限
createTime: 2026/10/14 11:30:01
permalink: /blog/26-10-14-samsung-query-all-packages/index/
---

参考文档
- https://developer.android.com/training/package-visibility?hl=zh-cn

# 前言


读取所有应用列表有点侵犯隐私，所以谷歌规定：targetSdk 在安卓 11 及以上，则默认无法查询所有软件包，必须要在清单声明权限 `android.permission.QUERY_ALL_PACKAGES`。 这个权限是安装时权限，安装完自动获取无需运行时授予。

但直接声明这个权限并非最佳做法，应该改用 `queries` 标签来筛选出必要的可见应用列表，没必要的就不可见。 Play 商店也会限制拥有这个权限的应用上架。

# 问题
理想很美好，现实很迷惑。声明权限，在三星 One UI 6.1 上打开 app, 结果是仍然弹出权限申请弹窗（这个弹窗非常有迷惑性，以至于一开始我以为查询所有软件包是运行时权限）， 而且 `checkSelfPermission` 永远返回 true. 

您猜怎么着？三星在自己的桌面上又叠了一层运行时权限，安卓官方的 `QUERY_ALL_PACKAGES` 是自动授予了没错，但三星自己的没授予也不行。

# 解决方法
- 绕圈子：一开始是获取应用列表为空认作没授权。但由于我写的代码在 Resume 时会重新检查权限，而获取应用列表又会离开 activity, 导致无限循环。
- 免权限：然后看了安卓的参考文档，改为用 `queries` 标签，筛选条件是所有带 `ACTION_MAIN` 的 intent 的应用，约等于所有应用。搭配 `queryIntentActivities` 结果还真可以获取到列表。（吐槽：所以谷歌你设置这个权限有什么用呢，整这一出还是和以前一样无权限查询所有包）
- 正统：用 `adb shell dumpsys package 包名` 查看，发现原来三星的那个权限叫 `com.samsung.android.permission.GET_APP_LIST`, 在运行时权限那一栏里边。理论上用常规方式申请这个权限就行了，但都有免权限的方法了我还费这劲干嘛呢？