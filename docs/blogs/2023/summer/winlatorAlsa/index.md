---
date: '2023-8-27 16:55:22'
title: 在exagear中使用winlator的alsa插件
categories: 
 - exagear
tags:
 - exagear
 - winlator
 - alsa-plugins
---

## 前言
winlator自己实现了一个alsa的插件，在容器设置中，将dx组件 - directSound和directMusic改为native（windows）后，播放音频不会出现爆音。

在winlator的github页面，提供了[alsa插件的源码以及编译脚本](https://github.com/brunodev85/winlator/tree/main/audio_plugin )：。尝试将其移植到exagear中，以尝试解决exa的alsa插件爆音问题。
## 从winlator移植到exagear
### 分析
- java代码中，需要有alsa声音播放相关的代码。exa中为`com.eltechs.axs.alsaServer`包，winlator中为`com.winlator.alsaserver`包。由于winlator java代码大幅度借鉴exa，所以很方便移植。
- winlator在github上提供的代码仅为linux端的alsa插件，编译出的名字是`libasound_module_pcm_android_aserver.so`。在wlt数据包中搜索，发现该文件位于`/usr/lib/${arch}linux-gnu/alsa-lib`中，其中arch是架构名称。搜索exa的数据包发现也有alsa-lib目录，且其中还有很多其他的so，网络搜索发现是[通过alsa-plugins安装](https://archlinux.org/packages/extra/x86_64/alsa-plugins/files/)的。
- 安卓声音与linux声音需要以某种方式关联起来。观察代码了解到，是建立了socket连接。socket文件，exa中为`String.format("%s%d", SocketPaths.ALSA_SERVER, Integer.valueOf(this.productId)`，仅以ed301为例，是`"/tmp/.sound/AS12"`，而winlator是`"/tmp/.sound/AS0"`。winlator alsa插件中（c代码）接收该路径的方式是通过环境变量。exa也有设置此环境变量，但二者变量名略有不同，exa为`AXS_SOUND_SERVER_PORT`，winlator为`ANDROID_ALSA_SERVER`
- winlator中如果想要解决爆音，必不可少的一步就是将dx组件的声音dll设置为native(windows)。
- github页还提供了两个conf，在wlt的数据包中搜索可确定其放置位置。`android_aserver.conf` 放在`/etc/alsa/conf.d`，其内容中的type是编译的so文件名后半部分。`alsa.conf` 放在 `/usr/share/alsa` ,其内容是记录`android_aserver.conf`的路径。具体编写格式尚未了解。
:::tip
下文需要的文件，可以从此链接中下载：https://wwqv.lanzout.com/b013gl1yh 密码:9gbq
:::

### 修改apk
需要修改apk的dex。
- 直接替换
    ```
    com.eltechs.axs.alsaServer.*
    com.eltechs.axs.environmentService.components.ALSAServerComponent
    ```
    下载smali.zip并解压，覆盖原有的smali

- 手动修改

    `com.eltechs.axs.configuration.UBTLaunchConfiguration.smali`中，`addArgumentsToEnvironment()`方法中，字符串 `"AXS_SOUND_SERVER_PORT=%s"` 改为 `"ANDROID_ALSA_SERVER=%s"`
### 修改obb
所谓数据包其实就是rootfs，下文均对解压后的数据包，即z盘进行操作。
- alsa相关：下载winlator-alsa-plugin.zip，解压其中内容到z盘，覆盖同名文件夹。
- 注册表：打开winecfg - libraries 找到dsound dmusic 等dll，点击编辑，选择native(windows)；若没有则需要在上方空白处手动输入并添加，再编辑。完整的dll列表可以参考`winlator.apk/assets/dxcomponents.json`。directsound和directmusic肯定是声音相关的，show和play不确定。
```json
{
    "direct3d" : ["d3dcompiler_33", "d3dcompiler_34", "d3dcompiler_35", "d3dcompiler_36", "d3dcompiler_37", "d3dcompiler_38", "d3dcompiler_39", "d3dcompiler_40", "d3dcompiler_41", "d3dcompiler_42", "d3dcompiler_43", "d3dcompiler_46", "d3dcompiler_47", "d3dcsx_42", "d3dcsx_43", "d3dx10", "d3dx10_33", "d3dx10_34", "d3dx10_35", "d3dx10_36", "d3dx10_37", "d3dx10_38", "d3dx10_39", "d3dx10_40", "d3dx10_41", "d3dx10_42", "d3dx10_43", "d3dx11_42", "d3dx11_43", "d3dx9_24", "d3dx9_25", "d3dx9_26", "d3dx9_27", "d3dx9_28", "d3dx9_29", "d3dx9_30", "d3dx9_31", "d3dx9_32", "d3dx9_33", "d3dx9_34", "d3dx9_35", "d3dx9_36", "d3dx9_37", "d3dx9_38", "d3dx9_39", "d3dx9_40", "d3dx9_41", "d3dx9_42", "d3dx9_43"],
    "directsound" : ["dsound"],
    "directmusic" : ["dmband", "dmcompos", "dmime", "dmloader", "dmscript", "dmstyle", "dmsynth", "dmusic", "dmusic32", "dswave"],
    "directshow" : ["amstream", "qasf", "qcap", "qdvd", "qedit", "quartz"],
    "directplay" : ["dplaysvr.exe", "dplayx", "dpmodemx", "dpnet", "dpnhpast", "dpnhupnp", "dpnsvr.exe", "dpwsockx"]
}
```

## 测试结果
- 测试游戏-镜之边缘，wine7.0.2

先将system32中的dsound.dll设置为纯净wineprefix中的dll（也就是builtin的dll？）。

- winlator alsa，dll为native,builtin时，和exa一样爆音，视频声音正常。dll为native时，不爆音，但无法播放视频声音等。
- pulseaudio，dll为native,builtin时，不爆音 ，视频声音正常。dll为native时，不爆音，缺少视频声音。
- exagear alsa，dll为native,built时，爆音，视频声音正常，dll为native时没有任何声音，但dsound换为302k后native无爆音且可播放视频声音。 但这几种winecfg里测试音频都没声。
- 根据老虎山所说，winlator比exa的优势在于没有大叔音，爆音基本相同。
- 关于native和builtin的说明：https://www.hu60.cn/q.php/bbs.topic.103014.html

<!-- - dll必须设置native。如果设置成native,builtin，winlator alsa不会生效，还是会爆音。
- 不确定是缺解码库，还是dsound.dll被替换过的原因，还是其他原因，在dll设置为native时，游戏内播放视频（本地也存储的是视频格式）时无法播放视频声音，dll设置为native,builtin的时候可以播放视频声音，但winlator alsa就无法生效，出现爆音。 -->
