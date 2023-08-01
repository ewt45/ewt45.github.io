
[[TOC]]

Xegw is developed by Twaik，now it's completely same with termux:x11.

## Modify apk

:::warning
apk of exagear should be none-xegw, in case what are going to be added inflict with xegw 1.0.
:::
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

After downloading the apk, extract the corresponding smali from the dex.
Attention:
- When it comes to package name, the ones provided in this apk are `com.eltechs.ed`, please modify them according to the actual situation.
- When extracting smali, please pay attention to extract its dependent smali together, the format is `class name + $ + other text.smali`. For example, if you extract `RR.smali`, there may be `RR$1.smali`, `RR$ExternalSyntheticLambda0.smali` should also be extracted together.


[download link](https://wwqv.lanzout.com/iKdw81428yxi)：https://wwqv.lanzout.com/iKdw81428yxi

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
Add：apk/lib/armeabi-v7a/libXlorie.so

Extract the .so file from downloaded apk.

[download link](https://wwqv.lanzout.com/iKdw81428yxi)：https://wwqv.lanzout.com/iKdw81428yxi
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
- The keys and mouses input require xkb. Please make sure there's `/usr/share/X11//xkb` in obb.