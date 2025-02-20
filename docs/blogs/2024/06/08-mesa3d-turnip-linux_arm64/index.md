---
date: '2024-6-8 20:20:50'
title: 编译安卓PRoot用的turnip（linux_arm64架构）
categories: 
 - android
 - 技术
tags:
 - android
 - termux
 - mesa
 - proot
 - turnip
---

## 前言
[mesa3d官网 编译说明](https://docs.mesa3d.org/meson.html)


## 1 编译流程与结果测试
### 1.1 meson构建系统
mesa3d使用meson作为构建系统。其作用是检查编译环境/依赖是否符合条件，更改配置参数。

执行meson命令时一般都是在源码根目录下。

**生成一个基础的构建目录**\
`meson setup 构建目录`
- 构建目录用于保存本次构建的配置，编译后的文件也存在这里。
- 个构建目录彼此独立，互不干扰。

**修改构建参数**\
`meson configure 构建目录 参数`
- 当构建目录已经存在时，想要修改参数可以使用`configure`。参数格式为`-Dkey=value`, `-D`后有没有空格都行。`value`中，数组的多个值用逗号隔开，空数组用中括号或啥也不写。
- 不带任何参数执行 `meson configure 构建目录` 即可查看全部可设置的参数及其当前值。旧版是直接打印全部内容然后退出。最新版mesa(24的)的话是需要手动按方向键往上下滚动显示，按`q`退出。

**编译阶段**\
`ninja -C 构建目录 [install]`
- 这是真正开始编译了。
- 如果带`install`，就会在编译后将需要导出的文件安装到某个目录下，可以在配置阶段通过`-D prefix=`进行设置。

### 1.2 turnip编译参数
根据alex的教程，参数大概长这样。编译时有1800多条。

```sh
meson configure build-turnip/ \
-D prefix=/root/mesa \
-D buildtype=release \
-D dri3=enabled \
-D egl=enabled \
-D platforms=x11 \
-D gallium-drivers=swrast,virgl,zink,freedreno \
-D vulkan-drivers=freedreno \
-D opengl=false \
-D glx=disabled \
-D osmesa=true \
-D gles1=disabled \
-D gles2=enabled \
-D glvnd=true \
-D libunwind=disabled \
-D shared-glapi=enabled \
-D microsoft-clc=disabled \
-D valgrind=disabled \
-D freedreno-kmds=kgsl
```


又自己精简了一下，变为1100多条。
```sh
meson configure build-turnip/ \
-D prefix=/root/mesa \
-D buildtype=release \
-D dri3=enabled \
-D platforms=x11 \
-D gallium-drivers=freedreno \
-D vulkan-drivers=freedreno \
-D freedreno-kmds=kgsl \
-D opengl=false \
-D glx=disabled \
-D osmesa=false \
-D egl=disabled \
-D gles1=disabled \
-D gles2=disabled \
-D glvnd=false \
-D libunwind=disabled \
-D shared-glapi=disabled \
-D microsoft-clc=disabled \
-D valgrind=disabled
```

### 1.3 编译成功后测试vulkan
两个环境变量。
```sh
export VK_ICD_FILENAMES=$prefix/share/vulkan/icd.d/freedreno_icd.aarch64.json
export MESA_VK_WSI_DEBUG=sw
```
- `VK_ICD_FILENAMES` 用于指定vulkan类型。我们将其指定为freedreno，即turnip。
    - 实际上这个已经被废弃了，推荐用的是`VK_DRIVER_FILES`，但不确定新的是什么时候加上的，所以还是先用旧的了。
    - `$prefix`请替换为实际有意义的值。默认是`/usr`，但这个是全局生效的路径，所以一般在测试自己编译的文件时，会在配置构建阶段 通过参数`-D prefix=xxx` 指定一个别的路径，例如我上面提供的编译参数指定的路径为`/root/mesa`。
- `MESA_VK_WSI_DEBUG` 最开始alex研究turnip+dxvk的时候，就要将这个变量的值设为`sw`才能正常使用vulkan。后来好像xmem写了一个补丁，可以不用这个参数也能正常运行。我把这个给忘了，结果白折腾好几天。


然后确保x11环境正常，能正常打开x11应用。（启动termux-x11，导出环境变量DISPLAY=:n）。

安装测试工具`apt install vulkan-tools`

运行`vulkaninfo`，应该会正常输出一堆信息。

运行`vkcube`，应该会正常显示图形画面。

## 2 在不同平台上进行编译
### 2.1 x86_64电脑

正好有一台装了ubuntu22的笔记本。拿来编译x86_64的turnip，没啥问题。但是想要编译手机上用的（proot环境），就得编译arm64架构的。

虽然meson支持交叉编译，但是那个配置文件我是在搞不明白。所以干脆用arm64的rootfs，qemu提供转译支持就行了。这样相当于本地编译，缺点是速度奇慢。

借助docker来完成。

1. 新建一个空文件夹作为工作目录，进入。
2. 下载[mesa源码](https://gitlab.freedesktop.org/mesa/mesa/-/tags)，解压，并将文件夹重命名为`mesa`。进入mesa文件夹后应该存在`meson_options.txt`。
3. 创建`Dockerfile`文件。内容如下
    ```Dockerfile
    FROM arm64v8/ubuntu:24.04 As dev-image
    WORKDIR /root
    # 为了能apt build-dep需要添加deb-src。不确定security添加了src会不会有问题，但也不知道怎么排除。
    RUN sed -i 's/Types: deb/Types:deb deb-src/g' /etc/apt/sources.list.d/ubuntu.sources \
    && apt update \
    && apt-get build-dep mesa -y \
    && apt install -y cbindgen python3-certifi python3-pycparser
    # mesa源码
    COPY mesa mesa-source
    # 配置构建目录。手动复制drm头文件
    RUN cp -r /usr/include/drm/* /usr/include \
    && cd mesa-source \
    && meson setup build-turnip/ \
    -D prefix=/root/mesa \
    -D buildtype=release \
    -D dri3=enabled \
    -D platforms=x11 \
    -D gallium-drivers=freedreno \
    -D vulkan-drivers=freedreno \
    -D freedreno-kmds=kgsl \
    -D opengl=false \
    -D glx=disabled \
    -D osmesa=false \
    -D egl=disabled \
    -D gles1=disabled \
    -D gles2=disabled \
    -D glvnd=false \
    -D libunwind=disabled \
    -D shared-glapi=disabled \
    -D microsoft-clc=disabled \
    -D valgrind=disabled \
    # 开始编译
    && ninja -C build-turnip/ \
    # 编译好后安装，收尾工作（例如创建符号链接）
    && ninja -C build-turnip/ install
    
    # 导出编译后的文件
    FROM scratch AS out-image
    COPY --from=dev-image /root/mesa /root/mesa
    ```
    稍微解释一下
    - `FROM arm64v8/ubuntu:24.04` 指定基础镜像。这个是官方提供的，可以在hub上找到：https://hub.docker.com/r/arm64v8/ubuntu/
    - `sed -i 's/Types: deb/Types:deb deb-src/g' /etc/apt/sources.list.d/ubuntu.sources` 由于需要`apt build-dep`下载构建时依赖，所以需要修改apt源，在原有`deb`基础上添加`deb-src`。ubuntu24改了apt源的文件和语法要注意下。
    - 然后就是常规的安装依赖，复制mesa源码到镜像内，开始构建。由于部分旧版本会有无法找到drm头文件的问题，所以手动复制一下。
    - `FROM scratch AS out-image` scratch表示一个空的镜像，什么都没有。`As`后为该镜像的别名。由于我想在构建后自动导出文件，所以需要在`docker build`命令加上参数`--output`，但该参数只能导出完整镜像，所以要另起一个阶段，仅把所需文件复制进去。
    - `COPY --from=dev-image /root/mesa /root/mesa` 将编译好的文件复制到空镜像中准备导出。`--from`指定了复制哪个镜像的文件。第一个路径是原镜像中位置，第二个是新镜像中位置。这里保留了目录结构，因为icd文件中要用到。
4. 启动qemu-static，注册binfmt。这样当所执行程序无法本地运行时，就会自动使用qemu来运行。\
    `docker run --rm --privileged multiarch/qemu-user-static --reset -p yes` 
5. 开始docker构建阶段。\
    `docker build --output type=tar,dest=mesa-turnip.tar --target=out-image .`
    - `--output` 指定构建结束后，导出镜像到指定路径，而非保存为docker的普通镜像。
    - `type`可以指定local或tar，tar就是打包成一个文件，默认是local。
    - `dest`是在宿主机中的路径。这里存为当前目录下的`mesa-turnip.tar`。
    - `--target`指定要导出哪个阶段的镜像。指定的名称为Dockerfile中`AS`设置的别名。


经过三个小时（docker提示是11382s），终于构建完成。


### 2.2 termux proot
借助proot-distro安装ubuntu24

由于手机本身就是arm架构，所以不用交叉编译了，终于不用忍受慢吞吞的qemu。

编译流程还是和在电脑上一样的。参考Dockerfile中RUN的内容即可。

:::info
最好环境变量PATH里去掉termux的bin路径，否则一些程序可能会调用成termux而非proot内linux的，如llvm。
:::

### 2.3 github action
本地空间比较紧张，不如让github来代劳。

github运行的系统也是x86架构的。所以还是和电脑上编译一个思路，用docker+qemu运行arm的镜像。docker提供了一个[action](https://github.com/docker/setup-qemu-action)，可以用来开启qemu支持。

可以在workflow_dispatch中开启inputs，以便自定义输入内容。可以用来灵活设置mesa版本号。

1. 在仓库内新建`mesa-turnip/Dockerfile-linux-arm64`文件，内容就是上面电脑编译时的`Dockerfile`的内容。

2. 新建workflow文件并运行，等待完成即可。
```yml
name: turnip驱动

on:
  workflow_dispatch:
    inputs:
      mesa-version:
        description: |
          e.g. mesa-24.1.1  
          https://gitlab.freedesktop.org/mesa/mesa/-/tags
        required: true
        default: 'mesa-23.2.1'
        type: string

jobs:
  linux-arm64:
    runs-on: ubuntu-24.04
    steps:
    
    - name: 克隆仓库
      uses: actions/checkout@v4
        
    - name: 重命名Dockerfile
      run: mv mesa-turnip/Dockerfile-linux-arm64 Dockerfile
      
    - name: 下载mesa源码
      run: |
        wget https://gitlab.freedesktop.org/mesa/mesa/-/archive/${{ inputs.mesa-version }}/mesa-${{ inputs.mesa-version }}.tar.gz
        tar xf mesa-${{ inputs.mesa-version }}.tar.gz
        mv mesa-${{ inputs.mesa-version }} mesa
        
    - name: 使用action设置docker qemu #（不需要自己手动放qemu了）
      uses: docker/setup-qemu-action@v3
      
    - name: docker开始构建
      run: docker build --output type=tar,dest=mesa-turnip.tar --target=out-image .
        
    - name: 上传artifact
      uses: actions/upload-artifact@v4.3.3
      with:
        name: turnip-linux-arm64-${{ inputs.mesa-version }}
        path: mesa-turnip.tar
```
