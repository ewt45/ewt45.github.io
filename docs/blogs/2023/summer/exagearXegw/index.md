---
date: '2023-8-1 10:41:39'
title: exagear 移植Xegw 2.0 x11服务端（termux:x11）
categories: 
 - exagear
tags:
 - xegw
 - exagear
---

[[TOC]]

Xegw作者为Twaik，现在与termux:x11完全相同。

[English Version](./index_en.html)

## 修改apk

:::warning
exagear的apk应使用未添加过xegw的，以防与xegw1.0发生冲突。
:::

### 模版apk
提供一个模版 patcher.apk ([点击下载 密码:7bz1](https://wwqv.lanzout.com/b013cni8b))，下文需要用到的smali，so等文件均从此apk中提取。**此apk不可直接安装使用**

更新历史：
- 23.09.09: **xegw 2.2**
    - 特点: 
    	- 修复键盘只输入unicode，导致部分游戏内无法识别的问题。现在keysym能回退到keycode的优先按keycode处理
	    - 删除`com.eltechs.axs.configuration.startup.actions.WaitForXClientConnection.startedDrawing()`中对`FAHelper.logXServerFirstConnectEvent(getAppContext());`的调用，以适配hugo的apk（精简apk删除了firebase相关代码，如果调用会闪退）
	    - xegw的service在手机 通知栏中显示一条固定消息，以防切换到后台后被杀。另外添加一个按钮跳可以转到电池优化界面。
    - 对应patcher: xegw_2.2_patcher_23.09.09~tx11_23.09.03.apk
        ```
        更新文件：
        com.eltechs.axs.configuration.startup.actions.WaitForXClientConnection
        com.example.datainsert.exagear.QH
        com.example.datainsert.exagear.RR
        com.termux.x11.CmdEntryPoint
        com.termux.x11.DialogOptions
        com.termux.x11.ViewForRendering
        libXlorie.so
        ```
- 23.08.20: **xegw 2.1**
    - 特点：同步termux-x11(08.16)，支持dri3，可以使用xmem修改过的turnip，无需MESA_VK_WSI_DEBUG=sw。
    - 对应patcher: xegw_2.1_patcher_23.08.19~tx11_23.08.16.apk. 变化: libXlorie.so
- 23.08.01: **xegw 2.0**
    - 对应patcher: xegw_2.0_patcher_23.08.01~tx11_23.08.01.apk


### 直接替换/添加的smali
```
com.termux.x11.*
com.eltechs.axs.configuration.startup.actions.WaitForXClientConnection
com.eltechs.axs.environmentService.components.XServerComponent
com.eltechs.axs.widgets.viewOfXServer.ViewOfXServer
com.eltechs.axs.xserver.Pointer
com.eltechs.axs.Keyboard
com.example.datainsert.exagear.QH
com.example.datainsert.exagear.RR
```
下载模版apk后，从dex中提取对应的smali。
注意：
- 涉及到包名的，本apk提供的均为`com.eltechs.ed`，请根据实际情况自行修改。
- 提取smali时，注意一并提取其附属smali，格式为 `类名 + $ + 其他文字.smali`。例如提取`RR.smali`, 可能存在`RR$1.smali`, `RR$ExternalSyntheticLambda0.smali`也要一并提取。

### 需要编辑的smali
`StartupActivity，XServerDisplayActivity, AXSEnvironment xserver.Keyboard`。需要编辑dex中对应smali。

1. ` com.eltechs.axs.activities.StartupActivity`
    - 成员变量mainActivityClass从XServerDisplayActivity改成com.termux.x11.MainActivity.class，在让其作为xserver显示activity
        ```smali
        .method protected constructor <init>(Ljava/lang/Class;)V
            #...
            #const-class v0, Lcom/eltechs/axs/activities/XServerDisplayActivity;
            const-class v0, Lcom/termux/x11/MainActivity;
            iput-object v0, p0, Lcom/eltechs/axs/activities/StartupActivity;->mainActivityClass:Ljava/lang/Class;
        ```
    - shutdownAXSApplication（boolean）结尾停止service。
        ```smali
        .method public static shutdownAXSApplication(Z)V
            #...
            invoke-static {}, Lcom/termux/x11/CmdEntryPoint;->sendStopSignalInAppProcess()V
            return-void
        .end method
        ```
2. `com.eltechs.axs.activities.XServerDisplayActivity `
    - viewOfXServer成员变量改为protected类型 供tx11的activity继承下来使用
        ```smali
        #.field private viewOfXServer:Lcom/eltechs/axs/widgets/viewOfXServer/ViewOfXServer;
        .field protected viewOfXServer:Lcom/eltechs/axs/widgets/viewOfXServer/ViewOfXServer;
        ```

3. `com.eltechs.axs.environmentService.AXSEnvironment`
    - startEnvironmentService末尾，启动service
        ```smali
        .method public startEnvironmentService(Lcom/eltechs/axs/environmentService/AXSEnvironment$StartupCallback;Lcom/eltechs/axs/environmentService/TrayConfiguration;)V
            #...
            invoke-static {}, Lcom/termux/x11/CmdEntryPoint;->sendStartSignalInAppProcess()V
            return-void
        .end method
        ```
4. `com.eltechs.axs.xserver.Keyboard`
    - 替换两个方法 keyPressed和keyReleased 的内容
        ```smali
        .method public keyPressed(BI)V
            .registers 4

            const/4 v0, 0x1

            .line 95
            invoke-static {p1, p2, v0}, Lcom/termux/x11/ViewForRendering;->keyEvent(IIZ)V

            return-void
        .end method

        .method public keyReleased(BI)V
            .registers 4

            const/4 v0, 0x0

            .line 99
            invoke-static {p1, p2, v0}, Lcom/termux/x11/ViewForRendering;->keyEvent(IIZ)V

            return-void
        .end method
        ```

### native库 (.so)
添加：
```
apk/lib/armeabi-v7a/libvirgl_test_server.so
apk/lib/armeabi-v7a/libXlorie.so
```

下载模版apk后提取其中so即可。

### AndroidManifest.xml
添加一个activity和一个service
```xml
<activity
	android:theme="@style/ThemeDefaultFullscreen"
	android:name="com.termux.x11.MainActivity"
	android:screenOrientation="sensorLandscape" />
<service
	android:name="com.termux.x11.CmdEntryPoint"
	android:exported="true"
	android:process=":xserver">
	<intent-filter>
		<action
			android:name="android.intent.action.MAIN" />
	</intent-filter>
</service>
```

## 检验结果

安装修改后的apk，可以正常打开，启动容器后正常显示画面。
- 若只显示黑屏和箭头鼠标，则需要添加`-legacy-drawing`参数启动（[详见termux:x11的issue](https://github.com/termux/termux-x11/issues/375)）。可以用ED自助补丁v0.0.6及以上版本添加悬浮操作按钮，在Xegw选项中勾选。或者修改com.termux.x11.CmdEntryPoint类，在调用start(String[])的时候传入该参数。
- 目前termux:x11需要xkb实现按键和鼠标输入。所以请确保数据包包含xkb （`/usr/share/X11/xkb`）

