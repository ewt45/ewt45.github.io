
::: tip tips
this is an english translation of the blog [MultiWine Support](./). 
:::

[[TOC]]
## Demo video
This video shows that launching different versions of wine ,both from desktop shortcut and container's settings, works fine. It also shows you how to add a new version of wine. 

[【安卓Exagear】单apk支持多版本wine共存 大概就这样了】](https://www.bilibili.com/video/BV1bD4y1k7ch?share_source=copy_web&vd_source=de2377a6a91c81456918f0dc49bfbd5d)
<iframe src="//player.bilibili.com/player.html?aid=731433211&bvid=BV1bD4y1k7ch&cid=858758941&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="500" height="300"> 不支持iframe视频无法显示</iframe>



## Introduction
Instead of providing a finished apk, i'd like to tell you how to add this function to any exagear apk.

What i won't explain in detail:
- how to patching obb
- how to editing dex/smali from apk

Here's a tutorial about [multiwine on linux](https://askubuntu.com/a/1193281), pretty easy.Here's [my first try of multiwine](./deprecated.html).

The main idea is to add the certain wine's execute path into Environment Variables of linux when launching. The launching process is no more than calling 'wine' command . As long as the system can detect wine program file in it's Environment Variables, wine will be launched.
What was done is far from perfect, but it works so I'm  probably not gonna change it anymore.

There are also many details, let's just leave it.


## Concept
Before modifying, we need to design the view and logic.

- Usually, when tapping the plus sign on the right-top of the view, a new container is created. To support multiwine, a subMenu with some wine-version menu options should be inflated when tapping the plus sign, so that users is able to choose a certain version of wine. Considering that it should support any number of wine versions and simplify the operation of adding a new wine version, the code should read wine versions info from apk/assets/WinesVersionInfo.txt, and create the subMenu dynamicly. The writting rules of this txt are as follows:
    - File is encoded with utf-8. Don't leave any empty line.
    - Each line represents one wine version.it contains three parts: wineName, wineInstallPath and winePatternPath.Seperate each part with a blank space. \
    e.g. `wine3.0.5 /opt/wine3.0.5/opt/wine-stable /opt/guestcont-pattern/`
    - a line start with `#` represents a comment.
    - a line start with `usage:` is instructions that will be added to the subMenu as the last menu option. if clicked, a dialog will pop out and shows the instructions written by you.
- When creating a new container, exagear copys the dir /opt/guestcont-pattern to the new container. This dir can be used as presets for containers.To support multiwine, multiple pattern path should be supported.
- When launching a container, exagear calls wine command to show a virtual desktop. Nornally wine is install to default path that is already added to linux's Environment Variables, so there is no need to call it with absolute path. To support multiwine, certain wine install path should be added to Environment Variables PATH when launching. 
    - When launching from container settings it calls a command written in dex. When lauching from desktop shortcuts, it calls a command written in .desktop file.

## To modify dex(smali)
I'll just skip the process of writting java code.
In this section, how to add multiwine support(provided smali code) to any exagear apk is illustrated. If you have difficulty understanding what is going on in this section, maybe you need to get an apk that is already modified, and check the next section [To add a new version of wine](./index_EN.html/#to-add-a-new-version-of-wine)

::: warning attention
- Codes that written by me are provided as smali files. Simply import them into dex. For the codes from Exagear's dex that need to be modified, smali samples are provided. They may not be accurate so be cautious with registers and package name ,etc. The samples sometimes add some extra codes to indicate where the modified codes are, so copy codes only between `#start` and `#end`.
- The package name in provided smali and codes below are `com.eltechs.ed`. When replacing it with other package names, take care that there's a string containing this package name also needs to be repalced. 
- For some reason, if you changed the wineInstallPath in txt and reinstalled the apk, you have to remove the old container and create a new one, otherwise it won't use the new wineInstallPath.
- For some reason, exagear can't recoginze $PATH when modifying Environment Variables. So I have to write all the default PATH on my own. LD_LIBRARY_PATH is the same. If you are used to add some custom paths to PATH and LD_LIBRARY_PATH, you need to add those again in my provided smali file(Search PATH or LD_LIBRARY_PATH to locate them).
:::

----
involved classes from exagear dex
- wine-version options subMenu: class ManagerContainersFragment 
- extra background operations when creating containers: class GuestContainerConfig, GuestContainersManager
- extra background operations when launching containers: class StartGuest

----

### My Classes
[download link](https://wwn.lanzout.com/iduTq0dmf7cf). Add all classes in zip into dex.

### class ManagerContainersFragment
- deleted method `onOptionsItemSelected`
- comment out all contents of method `onCreateOptionMenu`, then add these
    ```smali
    #start. call my method to setup submenu. send in instance of menu and task
    invoke-static {p1, p0}, Lcom/example/datainsert/exagear/mutiWine/MutiWine;->setOptionMenu(Landroid/view/Menu;Lcom/eltechs/ed/fragments/ManageContainersFragment;)V
    #end
    ```
- add a new method
    ```smali
    # virtual methods
    #start add a method. call it from outside to run task of creating containers
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
    #end
    ```

### class GuestContainerConfig

- In method `loadDefaults`, add these at the end
    ```smali
    #start. add wine related info
    
    iget-object v1, p0, Lcom/eltechs/ed/guestContainers/GuestContainerConfig;->mCont:Lcom/eltechs/ed/guestContainers/GuestContainer;

    iget-object v1, v1, Lcom/eltechs/ed/guestContainers/GuestContainer;->mId:Ljava/lang/Long;
    
    invoke-static {v1}, Lcom/example/datainsert/exagear/mutiWine/MutiWine;->writeWineVerToContainerConfig(Ljava/lang/Long;)V
    #end
    ```
- In method `cloneContainerConfig`(). the registers p0 p1 are modified at the end, so add these before that.
    ```smali
    #start. copy the old container's wine related info
    # v0 old id   
    iget-object v0, p0, Lcom/eltechs/ed/guestContainers/GuestContainer;->mId:Ljava/lang/Long;

    # v1 new id
    iget-object v1, p1, Lcom/eltechs/ed/guestContainers/GuestContainer;->mId:Ljava/lang/Long;

    invoke-static {v0, v1}, Lcom/example/datainsert/exagear/mutiWine/MutiWine;->cloneWineVerToContainerConfig(Ljava/lang/Long;Ljava/lang/Long;)V
    #end
    .line 75
    iget-object p1, p1, Lcom/eltechs/ed/guestContainers/GuestContainer;->mConfig:Lcom/eltechs/ed/guestContainers/GuestContainerConfig;

    iget-object p0, p0, Lcom/eltechs/ed/guestContainers/GuestContainer;->mConfig:Lcom/eltechs/ed/guestContainers/GuestContainerConfig;

    invoke-virtual {p0}, Lcom/eltechs/ed/guestContainers/GuestContainerConfig;->getRunGuideShown()Ljava/lang/Boolean;
    ```
### class GuestContainersManager
- In method `initNewContainer`, comment out the line with string `"/opt/guestcont/pattern"`. Then add these below it
    ```smali
    # start. change the path of guestcont-pattern 
    # comment out this line
    # const-string v2, "/opt/guestcont-pattern/"
    # add these
    invoke-static {}, Lcom/example/datainsert/exagear/mutiWine/MutiWine;->getCustomPatternPath()Ljava/lang/String;

    move-result-object v2
    #end
    ```
### class StartGuest
- In method `execute`, below the line that calls iput-object to set mCont, add these

    ```smali
    iput-object v0, p0, Lcom/eltechs/ed/startupActions/StartGuest;->mCont:Lcom/eltechs/ed/guestContainers/GuestContainer;

    .line 260
    :cond_c


    #start. add wine execute path to env 
    iget-object v0, p0, Lcom/eltechs/ed/startupActions/StartGuest;->mCont:Lcom/eltechs/ed/guestContainers/GuestContainer;

    iget-object v0, v0, Lcom/eltechs/ed/guestContainers/GuestContainer;->mId:Ljava/lang/Long;

    iget-object v1, p0, Lcom/eltechs/ed/startupActions/StartGuest;->mEnv:Ljava/util/List;

    invoke-static {v0, v1}, Lcom/example/datainsert/exagear/mutiWine/MutiWine;->addEnvVars(Ljava/lang/Long;Ljava/util/List;)V

    #end
    ```
### after modifying dex
After the modification of dex, add some wines to obb(and their presets) and add  wines' info into apk/assets/WinesVersionInfo.txt.Then you can choose specific wine version when creating a container.

## To add a new version of wine
With an apk that supports multiwine, you can add many versions of wine by your choice. If you have difficulty understanding what is going on in this section, maybe you need to get an obb with multiple versions of wine already added, and just use it.

### add wine binary files into obb 
If you have the experience of creating and patching exagear obb, then you know better than me about how to add a wine. Here I'll only give a basic way to add orignal binary wine files. I'm not sure if more operations are required(Higher versions of wine for example, need more running dependencies maybe? ).

The compiled bianry package of wine can be downloaded from
[official website](https://dl.winehq.org/wine-builds/ubuntu/dists). They vary in operate systems. If the obb's linux system is ubuntu18 i386 for example, go into the [corresponding dir](https://dl.winehq.org/wine-builds/ubuntu/dists/bionic/main/binary-i386/) and choose the version you like and download the two deb —— wine.deb and wine-i386.deb(e.g. `wine-staging_4.21~bionic_i386.deb`	and `wine-staging-i386_4.21~bionic_i386.deb`). The next steps are illustrated int the demo video. Extract opt and usr folder from these two debs to a new folder named wine4.21(or whatever), and add folder wine4.21 into obb. Not sure if there is symbol link problem under android system, so extract them in linux system if permitted.

### add presets folder into obb(optional)
the pattern folder is for presets like C: driver's contents, regs, etc. If you have the experience of creating and patching exagear obb, then you know it better than me. If this version of wine doesn't require a seperate pattern content, just continue to use the default folder /opt/guestcont-pattern.

### add one line in WinesVersionInfo.txt
add a new line to apk/assets/WinesVersionInfo.txt, write three part of wine info. Seperate each part with a blank space. e.g. 

`wine4.21 /opt/wine4.21/opt/wine-staging /opt/guestcont-pattern/`

- 1st part: wineName. Custom name that used as the text of option when creating a new container.
- 2nd part: wineInstallPath. The location to find the new wine. Make sure this folder contains ./bin/wine. That is, if the absolute path of wine execute file is `/opt/wine4.21/opt/wine-staging/bin/wine`, then wineInstallPath is `/opt/wine4.21/opt/wine-staging`.
- 3rd part: winePatternPath. Presets for containers. Use `/opt/guestcont-pattern/` if this version of wine doesn't need seperate presets.

### Reinstall apk, uncompress obb, create new container
Reinstall the apk to apply changes of txt, let apk uncompress obb again to apply changes of new wine folder, create a new container to apply changes of installPath and patternPath. **Every time installPath or patternPath in txt is modified, you should create a new container to use the new path, the old containers will always use the old path.**
