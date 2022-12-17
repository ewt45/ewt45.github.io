---
date: '2022-12-13 18:52:37'
title: 为exagear添加选择d盘路径功能
categories: 
 - exagear
tags:
 - wine
 - TextInputEditText
---

[[TOC]]
## 前言
允许用户手动指定wine的d盘对应安卓文件路径的位置。
获取sd卡方法参照了hugo的apk。最早能找到的出处应该是这个~~https://www.youtube.com/watch?v=QLD7tqMWK9s~~ 应该是[gfoxsh](https://4pda.to/forum/index.php?showtopic=992239&st=1360#entry98298500)

其实在写代码的过程中发现了这个Exagear自带的Action类`CreatePutYourApplicationsHereDirectory`，不过没看见调用的地方。也没细研究了。

![图1](./res/2.gif)
## 演示视频：
[【Exagear】可手动切换d盘路径的功能](https://www.bilibili.com/video/BV1P24y1D7fY/)


## 将此功能添加到apk
 见[为exagear添加一个悬浮操作按钮](/blogs/2022/winter/exagearFab#将此功能添加到apk)的对应章节
## 探索过程
本节为自用，主要记录实现java代码的过程。

### 获取文件路径
[官网关于存储空间的简易说明](https://developer.android.google.cn/training/data-storage?hl=zh-cn)
1. 一般路径分这三种：
    - 外部存储
        - 路径：`/storage/emulated/0`
        - 说明：exagear默认会从这个路径找Download文件夹或ExaGear文件夹。
        - 获取：`Environment.getExternalStorageDirectory();`
    - 外部存储的应用专属目录
        - 路径：`/storage/emulated/0/Android/data/包名/files`
        - 说明：安卓11及以上，游戏在非应用专属目录下加载速度奇慢。解决方法是将游戏复制到应用专属目录（c/z盘），或将d盘路径直接设置为应用专属目录。
        - 获取：`Globals.getAppContext().getExternalFilesDir(null);`
    - 外置SD卡的应用专属目录
        - 路径：`/???/Android/data/包名/files`。前面的？？？不固定，可能的格式有：/storage/数字字母，/storage/sdcard1 , mnt/ext_sdcard 等
        - 说明：在高版本安卓上，获取外置SD卡的非应用专属目录读写权限可能没那么容易，所以不搞=-=。
        - 获取：`Globals.getAppContext().getExternalFilesDirs(null)[1];`。**从大神那抄来的，没想到啊，还能这么获取。**

    **应用专属目录，在应用卸载时会一同被删除。**


2. 大小写敏感：

    极少部分情况是大小写敏感的。比如默认读取的是ExaGear文件夹，写成了exagear会不识别。

    顺带一提，在CreateTypicalWineLaunchConfiguration类中发现了一段代码
    ```java
    if (FileHelpers.checkCaseInsensitivityInDirectory(new File(exagearRootFromPath))) {
        uBTLaunchConfiguration.addEnvironmentVariable("EXADROID_FS_CASE_INSENSITIVE", "y");
    }

    ```
    不过checkCaseInsensitivityInDirectory始终返回的是false =-=

3. 浏览文件夹：

    本来是想写个功能，设置好路径之后点击按钮跳转到文件管理器查看这个文件夹。但是
    - `file://`：这个uri的前缀被废弃了，所以高版本安卓没法用。
    - `content://`：这个高版本安卓可以用但是要用FileProvider，修改manifest和xml，麻烦。

    放弃。

### 文本框
原本用的是最基础的textview+edittext放到一个LinearLayout里，后来发现一个官方的material组件库。改成了TextInputLayout和TextInputEditText。

1. 组件样式参考：
    - https://github.com/material-components/material-components-android/tree/master/docs/components
    - https://www.jianshu.com/p/533b397c63f0
    - https://www.digitalocean.com/community/tutorials/android-textinputlayout-example

    设置标题的话，给内部的edittext设置hint就行。不需要手动写textview+edittext再放到LinearLayout里了。

2. 自动填充建议：

    需求为：用户点击edittext输入框后，弹出几个预设的选项，用户点击预设选项后editext被自动填入数据。

    尝试了AutoCompleteText，发现需要手动输入至少一个字母才能弹出来，不符合需求。而Material组件库里虽然官方给了一个示例是只选择不能手动输入的，但那个要最新的库+样式，ex没自带就算了。

    所以用的还是PopupMenu。禁用调起输入法的方法为`edittext.setInputType(InputType.TYPE_NULL);`

3. 文件夹路径和文件夹名称

    一共两个edittext，一个父路径，只能选择不能手动输入，另一个文件夹名，可以选择可以手写。二者内容更新时都应调用checkCurrDirAvailable函数检查更新路径的可用性。
    - 父路径在popupmenu点击item之后更新成员变量currentParDir（int），edittext文字显示和检查可用性。
    - 文件夹名在addTextChangedListener中更新成员变量currentDstDirName（String）并检查可用性。

4. 存在的bug

    原本自己的项目测试的挺好的，结果搬到ex中，clearFocus的时候也会获取focus，导致popupMenu一直弹出来。

    后来把自己项目最小sdk和目标sdk与ex同步了，发现自己项目也会出现这个问题，只好取消掉clearFocus的代码，并且从普通EditText换成TextInputEditText。

### 检查可用性
在用户修改路径后应该检查可用性，一开始是设置一个按钮点击检查，后来去掉了按钮，改成实时检查。应当在edittext有任何变化时都调用checkCurrDirAvailable。
1. 判断文件夹是否存在且可读写

    可用性检查内容：
    - 若两个父路径无法获取，或文件夹没填写，显示“无法获取路径”
    - 否则正常获取文件夹，然后检查文件夹五个权限，参考https://blog.csdn.net/zfking86/article/details/7995532，用位运算记录一下五个函数的结果，然后显示到textview上。如果符合条件就加对号，否则加错号。

2. 设置检查结果颜色

    在textview中使用span
    https://developer.android.com/develop/ui/views/text-and-emoji/spans#appearance-spans
    textview.settext，传参数是spannableString，构造的时候用SpannableStringBuilder，和普通stringbuilder一样。

    需要设置某个字符颜色的时候,`str.setSpan(new ForegroundColorSpan(0xffF56C6C),str.length()-1,str.length(),Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);` EXCLUSIVE_EXCLUSIVE意思大概是不管是往这个位置插入字符，还是结尾又添加新字符，都不会将颜色设置到新插入的文字上。

    对号显示绿色，错号显示红色，如果检查到某个是错号了，那么往下一定是错号，不显示错号该显示删除线`new StyleSpan(Typeface.BOLD)`

### 关闭对话框修改偏好
1. 修改偏好

    fragment实现接口DialogInterface.OnClickListener，当which==BUTTON_POSITIVE且设置的路径可用，则写入偏好。
    
    整个dialog应该只有在点击确定按钮并关闭的时候才会向sharedPreference中写入数据

2. 提示消息
    用SnackBar，在底部弹出。带action。
    需要附着到一个view上，snackbar会自动从这个view往上找到根布局附着上，由于dialog马上就要关了，所以不能设置到dialog的view。应该设置fab按钮的那个view，也就是fab初始化时添加到的那个父view。所以调用一下fab中的静态方法。
    ```java
    Snackbar.make(FabMenu.getMainFrameView((AppCompatActivity) requireActivity()), S.f(E.DriveD_SncBrTxt), Snackbar.LENGTH_LONG)
            .setAction(S.f(E.DriveD_SncBrBtn), v -> android.os.Process.killProcess(android.os.Process.myPid()))
            .show();
    ```

### wine修改d盘路径的方法

添加自己的代码，把mUserAreaDir初始化时改为调用自己的函数获取路径。

不过这还没完，因为修改dex后，把d盘路径从Exagear改为Download，发现只有新创建的容器的路径是改变的。

d盘在Exagear的老容器，看`/home/xdroid/.wine/dosdevices`中，发现`d:`符号链接指向路径没变，而且还有一个文件叫`d_`，也不是符号链接，打开发现是个文本，里面写了Exagear的路径。\
查看z盘，发现Download已经挂载上了，于是打开winecfg手动设置一下，发现这两个d的文件都变成Download的了。

去winehq官网查了一下[驱动器的说明](https://wiki.winehq.org/Wine_User%27s_Guide#Drive_Settings)，得知想切换驱动器路径，只需要改符号链接即可，并不需要其他特别的操作。\
手头又没linux，搞了个在线版linux手动操作了一下符号链接，才发现问题原因：把A被作为B的符号链接后，如果想把A作为C的符号链接，则需要先清除A当前的符号链接，不清除直接设置的话A的符号链接还是B的不会变。dex中就是没有清除原有符号链接。

由于每次启动的时候Exagear都会把对应容器的xdroid_n链接到xdroid，这个是没问题的，就看了一下这部分的代码，结果发现是直接获取xdroid的file调用`file.delete()`了。问了老虎山大佬，安卓上删符号链接文件是不会影响真文件的，所以那就放心大胆的删吧 ^ ^

CreateLaunchConfiguration中是建立cdez盘符号链接的。在建立d盘符号链接之前先delete()一下 224行

```smali
    invoke-direct {v3, v4, v5}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V
    #这里删除文件吧，不知道安不安全
    invoke-virtual {v3}, Ljava/io/File;->delete()Z

    invoke-virtual {v3}, Ljava/io/File;->getAbsolutePath()Ljava/lang/String;
```
测试了一下，是不会删除真目录的。

### 测试结果
- 设置路径后重启app，即可正常切换。
- 原先的路径还会链接到镜像根目录下，不过不删也无所谓吧
- 手机没有sd卡插槽，没法测试sd卡，在虚拟机上测试是可以获取目录的读取权限。用的方法是别人的，应该不会有问题。

## 总结
- wine切换盘符的路径其实就是更换软链接。这么一看甚至没必要改安卓dex了=-=算了反正有用户友好提示也不错
- TextInputLayout挺不错的，自带标题，也可以加edittext
- 写完这篇博客才想起来去找一下获取sd卡方法的出处，看到vividotg视频标题还有个获取u盘的方法，结果看视频是sd卡和u盘同时存在，读的是sd卡，sd卡弹出就读u盘。猜测那个方法获取到的数组，第二个元素往后都是连接的外部存储设备，只不过懒得再测试了。。。

