---
date: '2022-10-11 14:22:16'
title: 向exagear数据包中添加任意个数的不同wine版本
categories: 
 - 技术
 - exagear
tags:
 - android
 - wine
 - linux
 - exagear
---

::: tip tips
if you have trouble reading Chinese, maybe [this English version](./index_EN.html) suits you better
:::

[[TOC]]
## 视频演示
测试了从容器设置启动和快捷方式启动不同版本wine，添加一个新版本wine。

[【安卓Exagear】单apk支持多版本wine共存 大概就这样了】](https://www.bilibili.com/video/BV1bD4y1k7ch?share_source=copy_web&vd_source=de2377a6a91c81456918f0dc49bfbd5d)
<iframe src="//player.bilibili.com/player.html?aid=731433211&bvid=BV1bD4y1k7ch&cid=858758941&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="500" height="300"> 不支持iframe视频无法显示</iframe>



## 前言
由于现在exagear的apk种类繁多，所以与其提供成品，不如讲一下如何将需要用到的代码添加到apk中，以方便各路制作者。

本文可能不会详细讲解：
- 打包数据包
- dex/smali修改基础知识

linux上wine共存的方法参考了[参考教程](https://askubuntu.com/a/1193281)，因为是32位系统不用下amd64那个。

这是第二次修改了，方法用的是添加环境变量。第一次用的方法是使用绝对路径调用wine，文章在这里[向exagear数据包中添加任意个数的不同wine版本(旧)](./deprecated.html)。里面讲了一些了wine的基础知识，exagear启动容器时相关的函数，修改共存的设计思路和修改流程等，本篇不再说了。虽然修改的思路依然不尽如人意，但好歹结果是实现了这个功能，暂时不打算改了。

## 思路
本节主要讲了一下修改的整体思路，不全。

- exagear创建容器的方法为在容器管理界面点击右上角加号。如果改为多wine支持，应该在点击加号后显示几个菜单项以供用户选择wine版本。考虑到应支持任意多个而非固定个数的wine版本，并使制作者添加一个数据包的所需操作最少，采用从apk/assets/WinesVersionInfo.txt中读取wine信息，动态创建菜单项的方法。并为txt内容书写制定以下规则：
    - 文本采用utf-8编码，不留空行。
    - 每一行就是一个wine版本信息，记录wine名字（自定义，用于菜单项的显示），wine安装路径（比如wine执行文件的路径为/opt/wine-stable/bin/wine，那么这一项就填/opt/wine-stable），wine预设容器路径。三条信息两两之间用空格分隔。举例：`wine3.0.5 /opt/wine3.0.5/opt/wine-stable /opt/guestcont-pattern/`
    - 以`#`开头的一行是注释。
    - 以`usage:`开头的一行是说明，作为最后一个菜单项和wine版本菜单项一起出现。制作者可以在这里写上一些wine的版本介绍和注意事项。
- exagear创建容器时，会将/opt/guestcont-pattern目录下的虚拟windows系统复制到新容器中，这个文件夹用来做一些预制环境。对如果改为多wine支持，应支持设置不同的预制环境目录。
- exagear启动容器时，会调用命令 wine 来显示虚拟桌面。由于一般wine的安装路径都包含在环境变量PATH中（如/usr/bin），所以无需指定wine程序的绝对路径。如果改为多wine支持，就要手动向环境变量PATH中添加对应版本的wine的路径。
    - exa从容器设置启动容器时调用wine命令写在了dex中，而从快捷方式启动的调用wine命令写在快捷方式文件中。
## 修改dex(smali)
编写java代码的思路先略过了。\
本节介绍如何修改dex以使任意一个exagear的apk支持多wine版本共存。如果本节内容对于你来说太难，那么你可能需要的是一个已经添加好多wine共存功能的apk，然后看下一节[如何添加一个新的wine版本](./#如何添加一个新的wine版本)

:::warning 注意事项
修改时可能需要注意一下几点
- 我自己写的代码部分，提供smali文件，直接导入即可。ex的dex需要修改的部分，提供smali修改样例仅供参考，实际修改请注意寄存器，包名等。样例中为表明添加代码的位置可能会加几行原dex中的代码，复制的时候只需复制`#添加/修改`到`#添加/修改结束`的部分，原代码请自行剔除。
- 下面提供的代码里使用的均为原版包名即`com.eltechs.ed`。修改包名时除了类名所属包名要改，注意有个字符串也带包名记得修改。
- 如果测试时发现wine路径写错了，改了txt之后应删掉容器重新建，否则wine路径不会变化。
- 因为需要修改环境变量，测试又发现无法识别$PATH（如果添加一条PATH=/opt/wine-stable/bin, 原来那些/usr/bin, /usr/local/bin啥的都会被顶掉），所以我只好把默认的那些PATH都写上了，如果制作者的linux系统的PATH包含其他路径（或LD_LIBRARY_PATH），需要在我提供的smali中手动添加一遍（搜PATH或LD_LIBRARY_PATH即可找到位置）。
:::

- ---
修改涉及的类：
- 修改wine选项弹窗，涉及ManagerContainersFragment类
- 修改创建容器时操作，涉及GuestContainerConfig,GuestContainersManager类
- 修改启动容器时操作，涉及StartGuest类

----

### 我自己写的类
[下载地址](https://wwn.lanzout.com/iduTq0dmf7cf)。将压缩包中全部类添加到dex中即可
### ManagerContainersFragment类
- `onOptionsItemSelected`方法整个删掉。
- `onCreateOptionMenu`方法，注释掉原有语句，添加
    ```smali
    #修改 调用自己的方法设置菜单，传入menu和task实例
    invoke-static {p1, p0}, Lcom/example/datainsert/exagear/mutiWine/MutiWine;->setOptionMenu(Landroid/view/Menu;Lcom/eltechs/ed/fragments/ManageContainersFragment;)V
    ```
- 新建一个方法
    ```smali
    # virtual methods
    # 添加方法 用于从外部调用，执行创建容器的task
    .method public callToCreateNewContainer()V
        .registers 3

        .prologue
        const/4 v1, 0x0

        .line 58
        new-instance v0, Lcom/eltechs/ed/fragments/ManageContainersFragment$ContAsyncTask;

        invoke-direct {v0, p0, v1}, Lcom/eltechs/ed/fragments/ManageContainersFragment$ContAsyncTask;-><init>(Lcom/eltechs/ed/fragments/ManageContainersFragment;I)V

        new-array v1, v1, [Lcom/eltechs/ed/guestContainers/GuestContainer;

        invoke-virtual {v0, v1}, Lcom/eltechs/ed/fragments/ManageContainersFragment$ContAsyncTask;->execute([Ljava/lang/Object;)Landroid/os/AsyncTask;

        .line 59
        return-void
    .end method
    ```

### GuestContainerConfig类
- `loadDefaults`方法。在末尾添加
    ```smali
    #添加wine版本信息
    
    iget-object v1, p0, Lcom/eltechs/ed/guestContainers/GuestContainerConfig;->mCont:Lcom/eltechs/ed/guestContainers/GuestContainer;

    iget-object v1, v1, Lcom/eltechs/ed/guestContainers/GuestContainer;->mId:Ljava/lang/Long;
    
    invoke-static {v1}, Lcom/example/datainsert/exagear/mutiWine/MutiWine;->writeWineVerToContainerConfig(Ljava/lang/Long;)V
    ```
- `cloneContainerConfig`方法，由于末尾调用getRunGuideShown()那里把p0 p1改了，而调用的自己的函数需要用到p0 p1, 所以要在这之前添加
    ```smali
    #添加 复制容器的wine版本信息 放在p0 p1被修改之前吧
    # v0旧id   
    iget-object v0, p0, Lcom/eltechs/ed/guestContainers/GuestContainer;->mId:Ljava/lang/Long;

    # v1新id
    iget-object v1, p1, Lcom/eltechs/ed/guestContainers/GuestContainer;->mId:Ljava/lang/Long;

    invoke-static {v0, v1}, Lcom/example/datainsert/exagear/mutiWine/MutiWine;->cloneWineVerToContainerConfig(Ljava/lang/Long;Ljava/lang/Long;)V
    #添加 结束
    .line 75
    iget-object p1, p1, Lcom/eltechs/ed/guestContainers/GuestContainer;->mConfig:Lcom/eltechs/ed/guestContainers/GuestContainerConfig;

    iget-object p0, p0, Lcom/eltechs/ed/guestContainers/GuestContainer;->mConfig:Lcom/eltechs/ed/guestContainers/GuestContainerConfig;

    invoke-virtual {p0}, Lcom/eltechs/ed/guestContainers/GuestContainerConfig;->getRunGuideShown()Ljava/lang/Boolean;
    ```
### GuestContainersManager类
- `initNewContainer`方法里，注释掉字符串`"opt/guestcont-pattern"`那一行并在下面添加
    ```smali
     # const-string v2, "/opt/guestcont-pattern/"
    #修改 guestcont-pattern的路径
    invoke-static {}, Lcom/example/datainsert/exagear/mutiWine/MutiWine;->getCustomPatternPath()Ljava/lang/String;

    move-result-object v2
    ```
### StartGuest类
`execute`方法，iput-object设置完mCont的下面，添加对应版本的wine的环境变量
```smali
iput-object v0, p0, Lcom/eltechs/ed/startupActions/StartGuest;->mCont:Lcom/eltechs/ed/guestContainers/GuestContainer;

.line 260
:cond_c

#添加 将wine执行路径添加到环境变量
iget-object v0, p0, Lcom/eltechs/ed/startupActions/StartGuest;->mCont:Lcom/eltechs/ed/guestContainers/GuestContainer;

iget-object v0, v0, Lcom/eltechs/ed/guestContainers/GuestContainer;->mId:Ljava/lang/Long;

iget-object v1, p0, Lcom/eltechs/ed/startupActions/StartGuest;->mEnv:Ljava/util/List;

invoke-static {v0, v1}, Lcom/example/datainsert/exagear/mutiWine/MutiWine;->addEnvVars(Ljava/lang/Long;Ljava/util/List;)V

#添加 结束
```
### 改完dex。
改完dex之后，向数据包中添加多个版本wine（和预设WINEPREFIX），在apk/assets/WinesVersionInfo.txt里写上每个wine的版本信息，在创建容器时就可以选择wine版本进行创建了。

## 如何添加一个新的wine版本
拥有一个支持多wine版本的apk后，就可以向其中添加任意多个wine版本了。如果本节内容对于你来说太难，那么你可能需要的是一个已经添加好多wine版本的数据包，直接使用。


添加一个新的wine版本，大概就是这三步：
### 将wine二进制包加入obb中
对于数据包制作者，应该比我更清楚如何向数据包中添加一个wine
所以这里只说明添加原始的wine二进制包的方法，不确定制作obb时是否需要对wine进行修改或者添加其他文件。（比如高版本wine也许需要安装更多运行时依赖？）\
已编译好的wine二进制包可以从[官网下载](https://dl.winehq.org/wine-builds/ubuntu/dists)，需要根据obb底包的系统进行选择，以ubuntu18 i386为例，[进到这里](https://dl.winehq.org/wine-builds/ubuntu/dists/bionic/main/binary-i386/)。然后下载对应版本（如4.21）和对应种类（devel/staging/stable）的wine.deb和wine-i386.deb这两个包（例如`wine-staging_4.21~bionic_i386.deb`和	`wine-staging-i386_4.21~bionic_i386.deb`），接下来的操作可以参考博客开头的演示视频，将两个deb中的opt和usr文件夹解压到同一个文件夹（比如叫wine4.21)，然后将wine4.21文件夹添加到obb/opt中。不确定在安卓解压是否会有符号链接的问题，有条件最好在linux系统下解压。
### 添加预置环境（可选）
预置环境主要是预置c盘内容、注册表项之类的，数据包制作者应该比我更清楚。如果不需要为此wine版本单独做一份预置环境，那么就用默认的/opt/guestcont-pattern里的也行。
### 在WinesVersionInfo.txt中添加一行
在apk/assets/WinesVersionInfo.txt中添加一行，填入三段信息，每段间用空格分隔。例如

`wine4.21 /opt/wine4.21/opt/wine-staging /opt/guestcont-pattern/`
- 第一段：wineName。自定义的名字，用于创建容器时的wine版本选择。
- 第二段：wineInstallPath。根据刚才解压出来的文件夹放在数据包中的位置填写，请确保wineInstallPath目录下的bin文件夹中包含wine执行文件。也就是说如果将wine二进制包添加到obb中之后，wine执行文件的路径为`/opt/wine4.21/opt/wine-staging/bin/wine`，那么这一段就写`/opt/wine4.21/opt/wine-staging`。
- 第三段：winePatternPath。预设环境（c盘），exagear默认的pattern路径是`/opt/guestcont-pattern/`，如果需要为不同的wine版本配置不同的预设环境，可以修改这个路径。

### 重装apk，重新解压obb，新建环境
修改重装apk以更新txt，重新解压obb以将新添加的wine解压到镜像目录下，新建环境以使新的installPath和patternPath生效。
注意目前的代码有点问题，**如果修改txt中的installPath和patternPath，修改后的路径只能在新建的环境中生效，之前的环境还是用的旧路径**

## 更新历史
### 22.10.22
更新了章节[如何添加一个新的wine版本](./#如何添加一个新的wine版本)