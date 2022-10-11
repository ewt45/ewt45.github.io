---
date: '2022-10-11 14:22:16'
title: 向exagear数据包中添加任意个数的不同wine版本
categories: 
 - 技术
tags:
 - android
 - wine
 - linux
 - exagear
---

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

这是第二次修改了，方法用的是添加环境变量。第一次用的方法是使用绝对路径调用wine，文章在这里[向exagear数据包中添加任意个数的不同wine版本(旧)](./deprecated.html)。里面讲了一些了wine的基础知识，exagear启动容器时相关的函数，修改共存的设计思路和修改流程等，本篇不再说了。

## 思路
- exagear创建容器的方法为在容器管理界面点击右上角加号。如果改为多wine支持，应该在点击加号后显示几个菜单项以供用户选择wine版本。为了制作者添加一个数据包的所需操作最少，采用从apk/assets/WinesVersionInfo.txt中读取wine信息，动态创建菜单项的方法。并为txt内容书写制定以下规则：
    - 文本采用utf-8编码，不留空行。
    - 每一行就是一个wine版本信息，记录wine名字（自定义，用于菜单项的显示），wine安装路径（比如wine执行文件的路径为/opt/wine-stable/bin/wine，那么这一项就填/opt/wine-stable），wine预设容器路径。三条信息两两之间用空格分隔。举例：`wine3.0.5 /opt/wine3.0.5/opt/wine-stable /opt/guestcont-pattern`
    - 以#开头的一行是注释。
    - 以usage:开头的一行是说明，作为最后一个菜单项和wine版本菜单项一起出现。
- exagear创建容器时，会将/opt/guestcont-pattern目录下的虚拟windows系统复制到新容器中，这个文件夹用来做一些预制环境。对如果改为多wine支持，应支持设置不同的预制环境目录。
- exagear启动容器时，会调用命令 wine 来显示虚拟桌面。由于一般wine的安装路径都包含在环境变量PATH中（如/usr/bin），所以无需指定wine程序的绝对路径。如果改为多wine支持，就要手动向环境变量PATH中添加对应版本的wine的路径。
    - exa从容器设置启动容器时调用wine命令写在了dex中，而从快捷方式启动的调用wine命令写在快捷方式文件中。
## 修改dex(smali)
编写java代码的思路先略过了。

:::warning 注意事项
修改时可能需要注意一下几点
- 我自己写的代码部分，提供smali文件，直接导入即可。ex的dex需要修改的部分，提供smali修改样例仅供参考，实际修改请注意寄存器，包名等。
- 下面提供的代码里使用的均为原版包名即`com.eltechs.ed`。修改包名时除了类名所属包名要改，注意有个字符串也带包名记得修改。
- 如果测试时发现wine路径写错了，改了txt之后应删掉容器重新建，否则wine路径不会变化。
- 因为需要修改环境变量，测试又发现无法识别$PATH，所以我只好把默认的那些PATH都写上了，如果制作者的linux系统的PATH包含其他路径，需要在com.example.datainsert.exagear.mutiWine.MutiWine中找到PATH字符串并手动添加。
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
- onOptionsItemSelected方法整个删掉。
- onCreateOptionMenu方法，注释掉原有语句，添加
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

#### GuestContainerConfig类
- loadDefaults()方法。在末尾添加
    ```smali
    #添加wine版本信息
    
    iget-object v1, p0, Lcom/eltechs/ed/guestContainers/GuestContainerConfig;->mCont:Lcom/eltechs/ed/guestContainers/GuestContainer;

    iget-object v1, v1, Lcom/eltechs/ed/guestContainers/GuestContainer;->mId:Ljava/lang/Long;
    
    invoke-static {v1}, Lcom/example/datainsert/exagear/mutiWine/MutiWine;->writeWineVerToContainerConfig(Ljava/lang/Long;)V
    ```
- cloneContainerConfig()方法，由于末尾调用getRunGuideShown()那里把p0 p1改了，而调用的自己的函数需要用到p0 p1, 所以要在这之前添加
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
- initNewContainer方法里，注释掉字符串“opt/guestcont-pattern”那一行并在下面添加
    ```smali
     # const-string v2, "/opt/guestcont-pattern/"
    #修改 guestcont-pattern的路径
    invoke-static {}, Lcom/example/datainsert/exagear/mutiWine/MutiWine;->getCustomPatternPath()Ljava/lang/String;

    move-result-object v2
    ```
### StartGuest类
execute()方法，iput-object设置完mCont的下面，添加对应版本的wine的环境变量
```smali
iput-object v0, p0, Lcom/eltechs/ed/startupActions/StartGuest;->mCont:Lcom/eltechs/ed/guestContainers/GuestContainer;

.line 260
:cond_c

#添加 将启动容器的id写入pref
#  iget-object v1, p0, Lcom/eltechs/ed/startupActions/StartGuest;->mCont:Lcom/eltechs/ed/guestContainers/GuestContainer;

# iget-object v1, v1, Lcom/eltechs/ed/guestContainers/GuestContainer;->mId:Ljava/lang/Long;

#  invoke-static {v1}, Lcom/example/datainsert/exagear/mutiWine/MutiWine;->writeIdToTmp(Ljava/lang/Long;)V

#添加 结束

#添加 将wine执行路径添加到环境变量
iget-object v0, p0, Lcom/eltechs/ed/startupActions/StartGuest;->mCont:Lcom/eltechs/ed/guestContainers/GuestContainer;

iget-object v0, v0, Lcom/eltechs/ed/guestContainers/GuestContainer;->mId:Ljava/lang/Long;

iget-object v1, p0, Lcom/eltechs/ed/startupActions/StartGuest;->mEnv:Ljava/util/List;

invoke-static {v0, v1}, Lcom/example/datainsert/exagear/mutiWine/MutiWine;->addEnvVars(Ljava/lang/Long;Ljava/util/List;)V

#添加 结束
```
### 改完dex
改完dex之后，向数据包中添加多个版本wine（和预设WINEPREFIX）并做成数据包，在apk/assets/WinesVersionInfo.txt里写上每个wine的版本信息，在创建容器时就可以选择wine版本进行创建了。
