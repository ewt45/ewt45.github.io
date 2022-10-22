---
date: '2022-10-21 15:18'
title: 使exagear支持安卓输入法的中文输入，无需在环境中安装南极星输入法
categories: 
 - 技术
 - exagear
tags:
 - x11
 - keycode
 - keysym
 - unicode
 - exagear
---

[[TOC]]

## 前言
在此之前，想在模拟器里输入中文非常困难，因为安卓输入法输入无效，只能在模拟器里装中文输入法，而模拟器支持的中文输入法也只有南极星输入法而已（[测试视频](https://www.bilibili.com/video/BV1Gd4y167kg/)）,就算成功运行了南极星输入也不是很方便。


于是研究了一下，发现添加中文输入支持还是很简单的，最主要的是**手机的输入法要支持切换成中文才行**，我之前用的谷歌Gboard输入法，切中文直接闪退，只能显示英文键盘布局，后来换成了系统内置的百度输入法才能切到中文输入法。

## 演示视频：
[【安卓Exagear】修改以支持使用安卓输入法直接输入中文，无需在模拟器安装南极星输入法 ](https://www.bilibili.com/video/BV1KW4y1E7jP?share_source=copy_web&vd_source=de2377a6a91c81456918f0dc49bfbd5d)
<iframe src="//player.bilibili.com/player.html?aid=944313799&bvid=BV1KW4y1E7jP&cid=868004364&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>

## 将此功能添加到任意apk
如果你掌握apk的基础修改知识，可以通过本小节的教程将此功能添加到你自己的apk中。如果你是小白，那么应该去找已经修改好的apk直接使用。
1. 将[CHCharSupport.smali](https://wwn.lanzout.com/iJPjE0eatq6b)导入到dex中。
2. 在`com.eltechs.axs.Keyboard`类中（注意不是`com.eltechs.axs.xserver.Keyboard`）添加一个方法 convertUnicodeToXKey2

    ::: details 点击展开代码
    ```smali
    # 修改 新建一个方法
    .method private convertUnicodeToXKey2(I)Lcom/eltechs/axs/Keyboard$XKey;
        .registers 6
        .param p1, "i"    # I

        .prologue
        const/high16 v3, 0x1000000

        .line 197
        const/4 v0, 0x0

        .line 198
        .local v0, "returnKey":Lcom/eltechs/axs/Keyboard$XKey;
        const/high16 v1, 0x10000

        if-gt p1, v1, :cond_d

        iget-object v1, p0, Lcom/eltechs/axs/Keyboard;->UnicodeToXKeyMap:[Lcom/eltechs/axs/Keyboard$XKey;

        aget-object v1, v1, p1

        if-nez v1, :cond_32

        .line 199
        :cond_d
        const-string v1, "Keyboard"

        const-string v2, "convertUnicodeToXKey: \u8d85\u51fa\u6570\u7ec465535\u8303\u56f4"

        invoke-static {v1, v2}, Landroid/util/Log;->d(Ljava/lang/String;Ljava/lang/String;)I

        .line 200
        new-instance v0, Lcom/eltechs/axs/Keyboard$XKey;

        .end local v0    # "returnKey":Lcom/eltechs/axs/Keyboard$XKey;
        sget-object v1, Lcom/ewt45/exagearsupportv7/input/CHCharSupport;->avaiKeyCode:[Lcom/eltechs/axs/KeyCodesX;

        sget v2, Lcom/ewt45/exagearsupportv7/input/CHCharSupport;->currIndex:I

        aget-object v1, v1, v2

        add-int v2, p1, v3

        invoke-direct {v0, p0, v1, v2}, Lcom/eltechs/axs/Keyboard$XKey;-><init>(Lcom/eltechs/axs/Keyboard;Lcom/eltechs/axs/KeyCodesX;I)V

        .line 201
        .restart local v0    # "returnKey":Lcom/eltechs/axs/Keyboard$XKey;
        sget v1, Lcom/ewt45/exagearsupportv7/input/CHCharSupport;->currIndex:I

        add-int/lit8 v1, v1, 0x1

        sget-object v2, Lcom/ewt45/exagearsupportv7/input/CHCharSupport;->avaiKeyCode:[Lcom/eltechs/axs/KeyCodesX;

        array-length v2, v2

        rem-int/2addr v1, v2

        sput v1, Lcom/ewt45/exagearsupportv7/input/CHCharSupport;->currIndex:I

        .line 210
        :cond_2b
        :goto_2b
        if-nez v0, :cond_31

        iget-object v1, p0, Lcom/eltechs/axs/Keyboard;->UnicodeToXKeyMap:[Lcom/eltechs/axs/Keyboard$XKey;

        aget-object v0, v1, p1

        .end local v0    # "returnKey":Lcom/eltechs/axs/Keyboard$XKey;
        :cond_31
        return-object v0

        .line 205
        .restart local v0    # "returnKey":Lcom/eltechs/axs/Keyboard$XKey;
        :cond_32
        iget-object v1, p0, Lcom/eltechs/axs/Keyboard;->UnicodeToXKeyMap:[Lcom/eltechs/axs/Keyboard$XKey;

        aget-object v1, v1, p1

        iget v1, v1, Lcom/eltechs/axs/Keyboard$XKey;->keysym:I

        if-le v1, v3, :cond_2b

        .line 206
        iget-object v1, p0, Lcom/eltechs/axs/Keyboard;->UnicodeToXKeyMap:[Lcom/eltechs/axs/Keyboard$XKey;

        aget-object v1, v1, p1

        sget-object v2, Lcom/ewt45/exagearsupportv7/input/CHCharSupport;->avaiKeyCode:[Lcom/eltechs/axs/KeyCodesX;

        sget v3, Lcom/ewt45/exagearsupportv7/input/CHCharSupport;->currIndex:I

        aget-object v2, v2, v3

        iput-object v2, v1, Lcom/eltechs/axs/Keyboard$XKey;->keycode:Lcom/eltechs/axs/KeyCodesX;

        .line 207
        sget v1, Lcom/ewt45/exagearsupportv7/input/CHCharSupport;->currIndex:I

        add-int/lit8 v1, v1, 0x1

        sget-object v2, Lcom/ewt45/exagearsupportv7/input/CHCharSupport;->avaiKeyCode:[Lcom/eltechs/axs/KeyCodesX;

        array-length v2, v2

        rem-int/2addr v1, v2

        sput v1, Lcom/ewt45/exagearsupportv7/input/CHCharSupport;->currIndex:I

        .line 208
        iget-object v1, p0, Lcom/eltechs/axs/Keyboard;->UnicodeToXKeyMap:[Lcom/eltechs/axs/Keyboard$XKey;

        aget-object v0, v1, p1

        goto :goto_2b
    .end method
    ```
    ::: 
3. 在`com.eltechs.axs.Keyboard`类中，将handleUnicodeKeyType方法中调用convertUnicodeToXKey的地方改为convertUnicodeToXKey2
    ```smali
        #将convertUnicodeToXKey改为convertUnicodeToXKey2
        #invoke-direct {p0, v3}, Lcom/eltechs/axs/Keyboard;->convertUnicodeToXKey(I)Lcom/eltechs/axs/Keyboard$XKey;
        invoke-direct {p0, v3}, Lcom/eltechs/axs/Keyboard;->convertUnicodeToXKey2(I)Lcom/eltechs/axs/Keyboard$XKey;
    ```
4. 编译，签名，重装apk。进入环境后调出键盘并切换至中文输入，此时即可正常输入中文。 
5. 这里提供一个[成品](https://wwn.lanzout.com/icaPi0ebkdla)仅供测试，不保证任何其他功能正常，请尽量不要用于测试中文输入以外的用途。

## 探索过程
这次依然是运气占了很大一部分。

之前浪费了不少时间考虑如何让调出的输入法可以切换成中文输入，不行的话就要加EditText了。后来偶然想起之前群友发的视频，里面是能直接输入中文的，于是换了一个输入法，从Gboard改成内置的百度输入法华为版，就能用中文了。。。Gboard被调起的时候默认是英文，切成中文就闪退了。再调起状态栏显示的是中文但实际上还是英文布局，输入字母也没有顶部的候选词，而且连顶部的那些输入法设置也没有，而且俄语葡萄牙语这种都tm能用就中文用不了！反正挺特殊吧，暂时不打算折腾Gboard如何调出中文输入这个了，就当做是输入法自身问题吧。

能够调出中文布局之后，测试发现输入中文没反应，然后测试了其他字符，测到emoji的时候窗口居然直接闪退了，返回到了安卓布局，幸好exa的x11是java实现的可以看到报错。

![图1](./res/1.png)

看报错是因为对应unicode码大于65536，导致数组越界。看handleUnicodeKeyType，大概就是从按键码数组（`private final XKey[] UnicodeToXKeyMap = new XKey[65536];`）中查找，然后把对应的按键发送给系统内部输入。

查了一下中文的基本汉字Unicode编码范围在4E00-9FA5。扩展B的范围是20000-2A6DF，如果从扩展B里选一个字来输入，那么窗口一样会闪退。

然后又浪费了不少时间，最终才确定XKey的两个属性keycode和keysym是啥：[linux下的keycode与keysym](https://zhuanlan.zhihu.com/p/423502840)。
- keycode是键盘对应键位的代码，查询哪个键位对应哪个数字可以看[code字段](https://elixir.bootlin.com/linux/v6.0.2/source/include/uapi/linux/input-event-codes.h)。
- keysym是键位的映射。因为有些语言比如日语，a的那个键位对应了一个片假名，那么按a的时候keycode还是a的keycode，但是keysym是那个片假名对应的keysym。这个工作不需要输入法参与。查询哪个字符或其他什么东西对应的什么keysym可以看[查询uincode码对应的keysym](https://github.com/D-Programming-Deimos/libX11/blob/master/c/X11/keysymdef.h)

KeyBoard类新建时会初始化这个数组，将特定字符的unicode码作为下标，对应下标的XKey初始化填入keycode和keysym。如图所示。

![图2](./res/2.png)

![图3](./res/3.png)

观察可知：
- 不是每个字符都初始化了对应的XKey。没有被初始化的字符在输入时会被无视掉。
- 初始XKey时用到的keycode只有a-z这些字母，猜测大概都是各种语言的键盘布局。但是中文（这里只讨论简体，26键）由于不是字母语言，所以没法简单地用26个按键+对应的键位映射实现输入。

然后又浪费了很长时间，因为没有思路了，把dex里的整个流程都看了一遍，甚至复刻了一大堆代码到自己的项目里，最后发现调用到native方法里去了，就算找到了这里，也没能找到有用的信息，唯一确定的就是各种传参的过程中，只传了keycode，keysym，以及modifier（shift这样的组合键）的mask之类的，没有直接传字符。

从已知信息出发，keycode传的是byte值肯定不能代表unicode码，keysym是int值但是主要是为键盘键位设计的，也没有查到中文字符的keysym，modifier就更跟字符没关系了。只能考虑从keysym入手。尝试了一下把中文字符的keysym设置成和unicode码一样的，并没有反应。想着再去确认一下中文基本汉字的那些u码如果keysym都没被用到，实在不行就写个linux的keysym监听吧，监听到如果keysym在中文u码范围就输入中文。结果仔细一看，发现keysym有些超大的值，比如0x1000ddf，对应unicode字符是0x0ddf，正好差了0x1000000。又看了几个发现0x1000000往上的那些貌似都是这样，低四位直接用的unicode码了，遂试了一下中文u码加0x100,0000作为keysym，竟可以输入中文了。。。。

探寻之路基本上就到此结束了。只需要在初始化XKey数组时，给中文字符初始化上对应的XKey对象，随便填入一个keycode，keysym设置成u码+0x1000000。不过在实际测试中还有一点小问题，就是一个字一个字输入没问题，输入两个字以上，所有字都会变成最后一个字。猜测是因为我所有中文的keycode都是同一个，于是在检测到输入，通过u码获取Xkey对象时，先动态修改一下其keycode再返回xkey对象。这样就差不多了。另外还有一个问题就是数组只有66536个元素，如果想输入u码大于65536的字符，可以再添加一个判断，当u码大于65536时直接新建一个xkey并返回。另外一个问题是输入回车，中文标点又会闪退，这些并不在基础汉字范围内所以对应的xkey仍然是null，所以再加个判断为null时new 一个XKey返回就好了。

## 总结
- [linux下的keycode与keysym](https://zhuanlan.zhihu.com/p/423502840)。
- 想支持中文（更多unicode字符）输入，实际上需要修改的只有XKey的keysym。
- 运气不错。
