---
date: '2022-9-27 09:24:39'
title: 向exagear数据包中添加任意个数的不同wine版本(旧)
categories: 
 - 技术
tags:
 - android
 - wine
 - linux
 - exagear
---
[[TOC]]

## 1 利用现成代码，修改手头上的apk
### 1.1 修改之前要了解的知识
#### 1.1.1 本文可能不会详细讲的知识
- 打包数据包
- dex/smali修改基础知识

#### 1.1.2 不同版本的wine如何在linux上共存？
- 测试的环境：VirtualBox+Ubuntu Server 18 i386。32位ubuntu18是官网找的netboot镜像mini.iso。
- [参考教程1](https://askubuntu.com/a/1193281) [参考教程2](https://wiki.winehq.org/FAQ#Can_I_install_more_than_one_Wine_version_on_my_system.3F) [参考教程3](https://wiki.winehq.org/Ubuntu#Notes)。参考教程2自己编译太费时间了，我选择参考教程1里的直接解压deb安装包。
    - ---
1. winehq官网deb包的安装位置都是默认的/usr/bin，也就是说安装后wine执行文件的绝对路径是/usr/bin/wine，如果安装第二个版本，它还是安到这个路径覆盖上一个版本。解决办法是，要么自己下载源码编译，编译前自己指定一个安装路径，编译好安装到自定义的目录再运行，要么编译之后不安装，直接从编译后的目录运行。
2. 鉴于我对linux不熟悉，不如直接用官网已编译好的二进制安装包。参考上面的参考教程1，去[官网下载地址](https://dl.winehq.org/wine-builds/ubuntu/dists/bionic/main/binary-i386/)下载wine-stable-i386.deb和wine-stable.deb。关于wine、wine-i386、winehq的区别可以看参考教程3。将两个deb中的opt和usr文件夹解压到同一目录下，如/usr/wines/wine6.0.4。若想启动wine，使用绝对路径调用即可，如`/usr/wines/wine6.0.4/opt/wine-stable/bin/wine winecfg`。
3. 此时wine可能无法正常启动，因为可能缺少依赖库。最简单的办法，就是反正已经有deb了，先dpkg安装一遍，遇到依赖报错就apt install -f补全缺失的依赖，直到能安装成功，就可以卸载了=-=。
4. 然后测试能正常打开winecfg和植物大战僵尸年度版，就没照着参考教程1里设置LD_LIBRARY_PATH了，不确定是否有其他影响。
5. 如果想添加另一个版本的wine，一样只需下载两个deb包，解压，使用绝对路径启动wine即可。
    - ---
- WINEPREFIX：在启动wine时可以使用该参数指定虚拟windows系统安装的路径，默认在/home/user/.wine。使用不同版本wine的时候最好分别指定不同的WINEPREFIX。这个文件夹exagear也会用于创建新容器时添加预设内容，所以应注意一下。
#### 1.1.3 exagear启动wine的流程？
- 使用jadx反编译dex，查看java代码。
1. ManageContainersFragment类
    - 是一个fragment类，用于显示容器管理界面。其重写的父类的方法onCreateOptionsMenu()用于初始化右上角的新建容器按钮。
    - 包含内部类ContAsyncTask，用于执行创建/复制/删除容器的具体操作。创建容器时，会调用GuestContainersManager.cloneContainer()。
2. GuestContainersManager类\
initNewContainer()方法用于创建容器，主要看它的内容。
    1. 新建一个容器，容器目录为内部files/image/home/xdroid_n，n从1开始。其中内部files/image为linux系统所在目录，后面省略。
    2. 把/opt/guestcont-pattern里的文件复制到容器目录下。guestcont-pattern里有.wine文件夹，是WINEPREFIX路径。
    3. 把opt/recipe/run/simple.sh 复制到容器目录/.wine/run.sh。
    4. 填写容器设置的sharedpreference。调用GuestContainerConfig.loadDefaults()或cloneContainerConfig()，sharePref命名格式为 包名.CONTAINER_CONFIG_n.xml
    5. 容器序号+1，新容器添加到容器数组中
3. StartGuest类\
看完了创建容器的过程，再看一下启动容器的过程。
    1. 有几个构造函数，传入参数为InstallApp/RunXDGLink/RunExplorer。后两个是从“桌面”界面启动和从“容器”界面启动，第一个也许是从“开始菜单”启动？没见过，主要看从“容器”界面启动的吧。
    2. public StartGuest(RunExplorer runExplorer)构造函数中，初始化成员变量。有一个字符串很明显是调用wine的语句`this.mExeArgv.addAll(Arrays.asList(getRecipeGuestPath("run/simple.sh"), "eval \"wine /opt/exec_wrapper.exe /opt/TFM.exe D:/\""));`。这个eval后面跟着的字符串wine+程序名就是启动容器时执行的命令，然后进入容器后就会打开对应程序。
    3. execute()函数是真正执行操作的函数，这里会读取容器设置的sharedPreference，并且根据这些设置参数，启动容器。无论用哪个构造函数，最后都会调用此方法。
    4. 启动时会创建/home/xdroid到xdroid_n的链接，这样不管启动哪个容器，WINEPREFIX直接设置为/home/xdroid即可。
### 1.2 需要修改的地方有？
- 首先考虑wine在u18上的共存。其实非常简单，只需解压安装包到任意目录即可。唯一的要求就是使用绝对路径调用wine。非强制性要求是为不同版本wine指定不同的WINEPREFIX路径。
- 然后考虑exagear对多版本wine的识别。根据上面所说的，其实需要修改的地方就是StartGuest中调用wine的那个命令行，从相对路径wine改为绝对路径（自己解压的位置），就能正常启动容器了。
- 由于每个容器存放在xdroid_n文件夹下，所以WINEPREFIX自然是不同的，不需要我们手动指定。但是要注意一点，在创建容器时是会复制一个文件夹/opt/guestcont-pattern到WINEPREFIX下的，这个pattern文件夹相当于预设容器，用于配置一些预设内容来替代wine默认的配置。由于有些d3d好像仅支持某些版本的wine，所以也应修改代码以支持根据wine版本复制不同的pattern文件夹。
### 1.3 设计方案
1. 在创建容器时，点击加号应该弹出wine版本选项以供用户选择。注意那个加号已经是一个菜单项而不是按钮，所以没法简单地用PopupMenu。
2. 用户点击对应wine版本创建容器，程序应该根据版本记录对应的wine执行路径，以便启动容器时的eval可以正确调用wine。由于每个容器都有各自的wine执行路径，而exagear本身就创建了每个容器设置的SharedPref xml，不如直接将该信息记录到容器设置的xml中。
3. 用户启动容器（仅考虑从“容器”界面启动的情况），程序应该从容器设置xml中读取wine执行程序的绝对路径以代替eval中的“wine”。
4. 代码添加完成之后，应保证在修改者添加一个新版本wine时操作尽量简便，即仅需最少量的修改dex，arsc，xml的操作。思路：在apk/assets/WinesVersionInfo.txt中记录全部wine版本，在用户点击加号时读取该txt中的内容并动态创建菜单项。这样修改者无需手动修改布局的菜单xml、手动添加各种资源id或者手写smali了。
5. 基于第四点的想法，简单制定一些txt中文本规则：
    - 文本采用utf-8编码，不能留有空行。
    - 每一行就是一个wine版本信息，记录wine名字（自定义，用于菜单项的显示），wine执行路径，wine预设容器路径。三条信息两两之间用空格分隔。
    - 以#开头的是注释。
    - 以usage:开头的是说明，作为最后一个菜单项和wine版本菜单项一起出现。
### 1.4 编写代码
略
### 1.5 java反编译为smali并添加入dex
- 自己写的代码部分，提供smali文件。ex的dex需要修改的部分，提供smali修改样例，不保证适用不同版本。
- 提供的代码里使用的均为原版包名即`com.eltechs.ed`。修改包名时，注意有个字符串也带包名记得修改。
- 如果测试时发现wine路径写错了，改了txt之后应删掉容器重新建，否则wine路径不会变化。
- 从快捷方式启动时eval的wine路径没写在dex中，而是写在了.desktop快捷方式文件中，请自行修改文件中的wine为绝对路径。模拟器内创建快捷方式时默认都是wine，**所以如果用户自行创建了快捷方式就会无法从快捷方式启动模拟器，暂时不知道怎么解决。**
    - ---
- 修改wine选项弹窗，涉及ManagerContainersFragment类
- 修改创建容器时操作，涉及GuestContainerConfig,GuestContainersManager类
- 修改启动容器时操作，涉及StartGuest类
#### 1.5.1 ManagerContainersFragment类
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
#### 1.5.2 GuestContainerConfig类
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
#### 1.5.3 GuestContainersManager类
- initNewContainer方法里，注释掉字符串“opt/guestcont-pattern”那一行并在下面添加
    ```smali
     # const-string v2, "/opt/guestcont-pattern/"
    #修改 guestcont-pattern的路径
    invoke-static {}, Lcom/example/datainsert/exagear/mutiWine/MutiWine;->getCustomPatternPath()Ljava/lang/String;

    move-result-object v2
    ```

#### 1.5.4 StartGuest类
- init构造方法，传RunExplorer那个, 注释掉原先的eval字符串，并添加
```smali
.method public constructor <init>(Lcom/eltechs/ed/startupActions/StartGuest$RunExplorer;)V
    #...
    #修改 eval的wine执行路径
    
    iget-object v0, p0, Lcom/eltechs/ed/startupActions/StartGuest;->mCont:Lcom/eltechs/ed/guestContainers/GuestContainer;
    
    iget-object v0, v0, Lcom/eltechs/ed/guestContainers/GuestContainer;->mId:Ljava/lang/Long;
    
    invoke-static {v0}, Lcom/example/datainsert/exagear/mutiWine/MutiWine;->getExeEvalArgv(Ljava/lang/Long;)Ljava/lang/String;

    move-result-object v0
    
    #const-string v0, "eval \"wine /opt/exec_wrapper.exe /opt/TFM.exe D:/\""

    #修改结束
```
#### 1.5.5 改完dex
改完dex之后，向linux中添加多个版本wine（和预设WINEPREFIX）并做成数据包，在apk/assets/WinesVersionInfo.txt里写上每个wine的版本信息，在创建容器时就可以选择wine版本进行创建了。
## 一些探索过程记录
### wine的安装，共存
### exagear的dex中，跟启动容器相关的一些操作