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
下载apk后，从dex中提取对应的smali。
注意：
- 涉及到包名的，本apk提供的均为`com.eltechs.ed`，请根据实际情况自行修改。
- 提取smali时，注意一并提取其附属smali，格式为 `类名 + $ + 其他文字.smali`。例如提取`RR.smali`, 可能存在`RR$1.smali`, `RR$ExternalSyntheticLambda0.smali`也要一并提取。


[下载地址](https://wwqv.lanzout.com/iKdw81428yxi)：https://wwqv.lanzout.com/iKdw81428yxi

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
添加：apk/lib/armeabi-v7a/libXlorie.so

下载apk后提取其中so即可。

[下载地址](https://wwqv.lanzout.com/iKdw81428yxi)：https://wwqv.lanzout.com/iKdw81428yxi
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
- 目前termux:x11需要xkb实现按键和鼠标输入。所以请确保数据包包含xkb （`/usr/share/X11//xkb`）

