---
date: '2022-07-25 16:02'
categories: 
 - 技术
tags:
 - android
 - dex
 - exagear
 - obb
---

# 将Exagear直装版数据包放到apk的assets中以减小体积安装后的占用空间

:::tip
若只想知道怎么操作，请从[解决方案](./#解决方案)开始看
:::

## 问题描述
- 目前的exagear直装版是将数据包放到了apk的lib目录中命名为libres.so，由于apk在安装后会将自身lib文件全部解压到`/data/data/包名/lib`目录下，所以在读取数据包时将数据包路径改成libres.so所在路径即可。
- 缺点：解压后的libres.so会一直保存，相比于纯apk+外置obb的做法，使用libres.so的体积=纯apk体积+obb体积+obb体积。
- 更改：将数据包放到apk的assets目录中，由于apk不会主动解压assets目录下的文件，可以减少一份obb的体积。
## 解决过程
::: tip 整体流程
一开始的想法：

1. 反编译dex，在其中找到读取obb的代码
2. 修改其中的obb路径

---

然后发现代码中接收的是数据包的File对象，而通过`getAssets().open()`获取到apk/assets的obb只有InputStream形式的。查阅资料发现`getAssets().openFd()`获取到的AssetFileDescriptor可以获取File，不过要求存储的文件不能压缩。想了想还是用open吧。那么就要
1. 先将obb从assets提取出来
2. 提供给应用供其读取
3. 读取完了再把解压出来的obb删掉

不是很完美不过也凑活=-=
:::




1. 用jadx反编译dex，搜索字符串`.obb`，发现读取obb文件的函数为`ZipInstallerObb.findObbFile() File`。这个函数要求返回一个数据包的File对象\
再看它被调用的地方：同一个类下的`installImageFromObbIfNeeded()`，File对象交给`findObbFile`，通过`checkObbUnpackNeed`判断数据包是否需要解压。\
    ```java
    public void installImageFromObbIfNeeded() throws IOException {
        final File findObbFile = findObbFile();
        boolean checkObbUnpackNeed = checkObbUnpackNeed();
        final File path = this.exagearImage.getPath();
        if (!checkObbUnpackNeed) {
            this.callbacks.unpackingCompleted(path);
        } else if (findObbFile == null) {
            this.callbacks.noObbFound();
        } else {
            new AsyncTask() { 
                ...
            }.execute(new Object[0]);
        }
    }
    ```
2. 我们读取apk里assets文件夹下的文件，通过`context.getAssets().open(路径) InputStream`获取，只能获取到输入流。通过`context.getAssets().openFd() AssetFileDescriptor`获取，可以得到对应的File对象，但是要求文件不能压缩。\
这里我选择获取输入流。那么就要把输入流转为对象，再交给`findObbFile`。\
处理方式为读取apk/assets/obb文件夹中的唯一一个文件作为数据包，先将文件写入/data/data/包名/files文件夹，再将写入后的文件的File对象返回。

    ::: details 点击展开代码
    ```java
    static public File setTmpObb(Context ctx) throws IOException {
        Log.d("exagear", "setTmpObb: 进入生成临时数据包的函数 ");
        try{
            File destDir = ctx.getFilesDir();

            if (!destDir.exists()) {
                boolean b = destDir.mkdir();
                assert b;
            }

            String[] list = ctx.getAssets().list("obb");
            //如果目录下没有文件或者多个文件，返回null，让exagear显示报错
            if (list.length != 1)
                return null;
            //获取asstes的inputstream
            InputStream is = ctx.getAssets().open("obb/" + list[0]);
            //复制到files文件夹
    //        File.createTempFile("exa","obb",destDir);
            File newFile = new File(destDir.getAbsolutePath() + "/" + list[0]); //创建新文件

            //如果已经存在（一般不会，但是如果在第一次解压的时候强制关掉的话，第二次启动）
            if (newFile.exists()) {
                boolean b = newFile.delete();
                assert b;
            }
            //vm正常关闭（程序退出时）会删掉此文件。
            newFile.deleteOnExit();
            //创建该文件
            if (!newFile.createNewFile()) {
                return null;
            }

            FileOutputStream fos = new FileOutputStream(newFile);                   //新文件输出流
            int len = -1;
            byte[] buffer = new byte[4096];
            while ((len = is.read(buffer)) != -1) {
                fos.write(buffer, 0, len);
            }
            fos.close();
            is.close();
            return newFile;
        }catch (IOException e){
            Log.d("Exagear", "setTempObbFile: 出错："+e.getMessage());
            throw e;
        }
    }
    ```
    :::

    files里的obb用完后应该删除。

    ::: details 点击展开代码
    ```java
    static public void delTmpObb(Context ctx){
        Log.d("exagear", "setTempObbFile: 进入删除临时数据包的函数 ");

        try{
            File destDir = ctx.getFilesDir();
            String[] list = ctx.getAssets().list("obb");
            if(list.length == 1){
                File newFile = new File(destDir.getAbsolutePath() + "/" + list[0]); //创建新文件
                //如果存在，就删除
                if (newFile.exists()) {
                    boolean b = newFile.delete();
                    assert b;
                }
            }

        }catch (IOException e){
            Log.d("Exagear", "delTmpObb: 出错："+e.getMessage());
        }
    }
    ```
    :::

---

3. 观察installImageFromObbIfNeeded()函数，稍微修改其逻辑。先设置findObbFile为null，借助checkObbUnpackNeed判断是否需要，如果真的需要再将obb移动出来并返回File，否则每次启动模拟器都移动一遍；如果不需要，检查移动出来的obb是否存在并删除。注意传入参数的context，是ZipInstallerObb的成员变量`private final Context context;
`。
    ```java{2,4-8}
    public void installImageFromObbIfNeeded() throws IOException {
        final File findObbFile = null;
        boolean checkObbUnpackNeed = checkObbUnpackNeed();
        if(checkObbUnpackNeed){
            findObbFile = ExagearPrefs.setTmpObb(this.context);
        }else{
            ExagearPrefs.delTmpObb(this.context);
        }
        final File path = this.exagearImage.getPath();
        if (!checkObbUnpackNeed) {
            this.callbacks.unpackingCompleted(path);
        } else if (findObbFile == null) {
            this.callbacks.noObbFound();
        } else {
            new AsyncTask() { 
                ...
            }.execute(new Object[0]);
        }
    }
    ```
4. 将数据包放入apk/assets/obb文件夹中，测试代码正常执行。

<span id='smali修改'></span>
5. 将java代码转为smali，将[ExagearPrefs.smali](https://pan.baidu.com/s/1mDveJsMRVcKkRh9YlfUt8g?pwd=eppn )导入dex，并且修改ZipInstallerObb.smali中installImageFromObbIfNeeded的开头部分。如果手动改smali很麻烦，这里提供一份完整的[ZipInstallerObb.smali](https://pan.baidu.com/s/1IybP1cKGm1_Mo1thL00uWQ?pwd=mnxg)， 应该可以直接导入替换。但是不确定不同版本的exagear 这个smali的代码是否通用。


```smali
# virtual methods
.method public installImageFromObbIfNeeded()V
    .registers 4
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation

    .line 129
    #v0作为findObbFile，先设为null
    const/4 v0, 0x0

    .line 130
    invoke-direct {p0}, Lcom/eltechs/axs/helpers/ZipInstallerObb;->checkObbUnpackNeed()Z

    move-result v1
    #判断需要解压obb时，再获取obb
    if-eqz v1, :cond_e
    #获取自身context放入v2, 作为参数传递
    iget-object v2, p0, Lcom/eltechs/axs/helpers/ZipInstallerObb;->context:Landroid/content/Context;

    invoke-static {v2}, Lcom/example/datainsert/ExagearPrefs;->setTmpObb(Landroid/content/Context;)Ljava/io/File;

    move-result-object v0
    #分支执行完跳转
    goto :goto_13
    #如果不需要解压，检查是否需要删除临时obb
    :cond_e
    iget-object v2, p0, Lcom/eltechs/axs/helpers/ZipInstallerObb;->context:Landroid/content/Context;

    invoke-static {v2}, Lcom/example/datainsert/ExagearPrefs;->delTmpObb(Landroid/content/Context;)V

    .line 132
    
    :goto_13
    #下面开始和原始函数一样了
    
    iget-object v2, p0, Lcom/eltechs/axs/helpers/ZipInstallerObb;->exagearImage:Lcom/eltechs/axs/ExagearImageConfiguration/ExagearImage;

    invoke-virtual {v2}, Lcom/eltechs/axs/ExagearImageConfiguration/ExagearImage;->getPath()Ljava/io/File;


    #省略...
    return-void
.end method
```

6. 将obb放入exagear的apk中，测试可以解压obb。


## 解决方案

::: tip 整体流程
1. 在apk/assets/obb/目录下放入数据包，命名无要求
2. 导入`ExagearPrefs.smali`，该文件包含了解压obb并返回其File对象、和删除临时obb两个方法。
3. 在`ZipInstallerObb.smali`调用这两个方法。如果有需要则提供obb的File对象，不需要则删除obb。
:::

具体说明：
1. 将obb数据包放入apk的assets/obb/目录下，命名无要求，注意此目录下应有且仅有一个文件。\
 如果无法在apk创建文件夹，请在外部创建obb文件夹，移入数据包后再将obb文件夹移入apk。
2. 打开mt管理器的dex编辑器++，在浏览界面长按任意路径，导入[ExagearPrefs.smali](https://pan.baidu.com/s/1mDveJsMRVcKkRh9YlfUt8g?pwd=eppn )。
3. 搜索并找到`ZipInstallerObb.smali`，对比[这里](#smali修改)修改其中installImageFromObbIfNeeded的开头部分代码。\
 如果手动改smali很麻烦，这里提供一份完整的[ZipInstallerObb.smali](https://pan.baidu.com/s/1IybP1cKGm1_Mo1thL00uWQ?pwd=mnxg)， 应该可以直接导入替换。但是不保证通用。

实际结果：
左侧为放在lib中的，右侧为放在assets中的，少了一个数据包的体积（300多M）
![图1](./1.png)
## 总结

1. 将obb放入apk的assets目录下，需要时提取出来，不用了再删掉。
2. 目前代码实现的缺点是必须要在第二次启动时才能删除obb文件。deleteOnExit只有在vm正常关闭时才会触发所以没啥用。其实可以在那个函数底下，找到obb解压完成的位置，调用一次删除obb的函数，不过懒得做了=-=

