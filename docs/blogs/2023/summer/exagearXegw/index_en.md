
[[TOC]]

Xegw is developed by Twaik，now it's completely same with termux:x11.

## Modify apk

:::warning
apk of exagear should be none-xegw, in case what are going to be added inflict with xegw 1.0.
:::

### patcher
here provides a patcher.apk ([download link. password:7bz1](https://wwqv.lanzout.com/b013cni8b)). the smali, so .etc files required in the following steps, should be extracted from it. **this apk is not able to be installed directly**

update histroy:
- 23.09.09: **xegw 2.2**
    - 特点: 
    	- fix: keyboard input will be translated only into unicode keys, which result in some game not recoginzing these keys. Now most regular keys will be tranlsated as linux keycode.
        - delete `FAHelper` call in `WaitForXClientConnection`, so that hugo apk won't crash after updated to xegw (FAHelper related codes are deleted in hugo's apk.)
	    - the service of xegw will display a notification in the phone's notification bar, in case that it is killed when switching  to background, and only a black screen is left when switching back. If it doesn't work, there's a button to disable battery optmization.
    - patcher: xegw_2.2_patcher_23.09.09~tx11_23.09.03.apk
        ```
        difference:
        com.eltechs.axs.configuration.startup.actions.WaitForXClientConnection
        com.exagear.datainsert.exagear.QH
        com.exagear.datainsert.exagear.RR
        com.termux.x11.CmdEntryPoint
        com.termux.x11.DialogOptions
        com.termux.x11.ViewForRendering
        libXlorie.so
        ```
- 23.08.20: **xegw 2.1**
    - feature：sync termux-x11(08.16)，support dri3, is able to use turnip patched by xmem, no need of MESA_VK_WSI_DEBUG=sw。
    - patcher: xegw_2.1_patcher_23.08.19~tx11_23.08.16.apk. difference: libXlorie.so
- 23.08.01: **xegw 2.0**
    - patcher: xegw_2.0_patcher_23.08.01~tx11_23.08.01.apk

### smali need to be replaced/added
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

After downloading the patcher apk, extract the corresponding smali from the dex.
Attention:
- When it comes to package name, the ones provided in this apk are `com.eltechs.ed`, please modify them according to the actual situation.
- When extracting smali, please pay attention to extract its dependent smali together, the format is `class name + $ + other text.smali`. For example, if you extract `RR.smali`, there may be `RR$1.smali`, `RR$ExternalSyntheticLambda0.smali` should also be extracted together.


### smali need to be edited

1. ` com.eltechs.axs.activities.StartupActivity`
    - Change `mainActivityClass` from `XServerDisplayActivity` to `com.termux.x11.MainActivity.class`.
        ```smali
        .method protected constructor <init>(Ljava/lang/Class;)V
            #...
            #const-class v0, Lcom/eltechs/axs/activities/XServerDisplayActivity;
            const-class v0, Lcom/termux/x11/MainActivity;
            iput-object v0, p0, Lcom/eltechs/axs/activities/StartupActivity;->mainActivityClass:Ljava/lang/Class;
        ```
    - At the end of method `shutdownAXSApplication（boolean）` stop service.
        ```smali
        .method public static shutdownAXSApplication(Z)V
            #...
            invoke-static {}, Lcom/termux/x11/CmdEntryPoint;->sendStopSignalInAppProcess()V
            return-void
        .end method
        ```
2. `com.eltechs.axs.activities.XServerDisplayActivity `
    - field viewOfXServer changed from private to protected.
        ```smali
        #.field private viewOfXServer:Lcom/eltechs/axs/widgets/viewOfXServer/ViewOfXServer;
        .field protected viewOfXServer:Lcom/eltechs/axs/widgets/viewOfXServer/ViewOfXServer;
        ```

3. `com.eltechs.axs.environmentService.AXSEnvironment`
    - At the end of method `startEnvironmentService`, start service.
        ```smali
        .method public startEnvironmentService(Lcom/eltechs/axs/environmentService/AXSEnvironment$StartupCallback;Lcom/eltechs/axs/environmentService/TrayConfiguration;)V
            #...
            invoke-static {}, Lcom/termux/x11/CmdEntryPoint;->sendStartSignalInAppProcess()V
            return-void
        .end method
        ```
4. `com.eltechs.axs.xserver.Keyboard`
    - replace these two method  keyPressed and keyReleased.
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

### native libs (.so)
Add：
```
apk/lib/armeabi-v7a/libvirgl_test_server.so
apk/lib/armeabi-v7a/libXlorie.so
```

Extract the .so file from patcher apk.

### AndroidManifest.xml
Add: an activity and a service.
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

## Test results

Install the modified apk, it should open normally and display the screen normally after starting the container.
- If it only shows black screen and arrow mouse, you need to add `-legacy-drawing` paramete ([see termux:x11 issue for details](https://github.com/termux/termux-x11/issues/375)). You can add float action button with EDPatch v0.0.6 and above, checking the Xegw option. Or modify com.termux.x11.CmdEntryPoint class to pass this parameter when calling start(String[]).
- The keys and mouses input require xkb. Please make sure there's `/usr/share/X11/xkb` in obb.
