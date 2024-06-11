---
date: '2024-5-20 21:51:45'
title: 安卓上proot运行legendary（第三方开源Epic游戏启动器）
categories: 
 - android
tags:
 - legendary
 - Epic
---
[[TOC]]

## 前言
box64+wine，运行windows版steam有很多人测试过了，但没人测试epic。试了一下发现果然不行（电脑上倒是可以）。

偶然发现有个叫heroic的第三方客户端，不过使用electron写的，而且没有arm构建。看简介，发现它的epic管理用的是legendary，一个命令行版的第三方epic启动器，决定尝试一下。legendary可以登录epic账号，下载运行游戏，同步云存档等。

- [heroic](https://heroicgameslauncher.com/)
- [legendary](https://github.com/derrod/legendary)

## 安装
运行环境为termux的proot-distro, ubuntu 23

legendary运行要求：
- python3.9+
- pypi packages：requests，（pywebview，setuptools，wheel）


使用apt安装依赖。**ubuntu23无法使用`pip`（`error: externally-managed-environment`），参考网上解决方案用了pipx**
```sh
sudo apt install python3 pipx
pipx ensurepath #添加到环境变量
```

然后通过pipx安装legendary-gl\
`pipx install legendary-gl`

## 使用

**登录**

`legendary auth`

会跳转到浏览器（如果PATH包含了termux的$PREFIX/bin，会自动使用`termux-open-url`打开安卓浏览器）

登录后复制要求的json字段(`authorizationCode`)，粘贴即可。\
如果之前登录过，那么直接显示json的可能是过期的，粘贴到legendary会登录失败。刷新一下网页就会出现一个新的`authorizationCode`，用新的即可。

**查看游戏库**

`legendary list`

每一行开头是游戏标题，然后后面用中括号括起来内容，第一个就是App name。但是App name好多都是md5值，而非有意义的单词。

**安装游戏**

`legendary install xxx`（xxx为list里的app name）

**启动游戏**

`legendary launch xxx`

## 配置
由于手机是arm架构，需要使用box64搭配wine。所以需要修改配置。

配置文件在`~/.config/legendary/config.ini`\
分号开头是注释\
参考github给出的示例，以下是修改后的内容

```ini
[Legendary]
; Disables the automatic update check
disable_update_check = false
; Disables the notice about an available update on exit
disable_update_notice = true
log_level = debug

[Legendary.aliases]
tbc = 573b2b742fa04eda83ea73cb17d7abc0

[default]
wine_executable = /usr/bin/boxandwine.sh
;wrapper = /usr/bin/boxandwine.sh
```

- `[Legendary.aliases]`：给app name起个别名。我想下的the big con的app name是一串md5，所以起个好写的名字。之后启动的时候可以直接 `legendary launch tbc`
- `[default]`：游戏的全局配置。通过`wine_executable` 指定wine执行文件路径，由于我需要先启动box64，所以这里替换成一个脚本文件`/usr/bin/boxandwine.sh`，其内容是
	```sh
	#!/bin/sh
	box64 wine64 "$@"
	```
	注意，
	- 由于legendary使用python3执行wine可执行文件，导致脚本开头必须指定shebang为shell脚本，否则会报错执行文件格式错误
	- 由于之后传入的参数中，exe路径可能包含空格，所以需要把`$@`加上引号。虽然不是很理解，但是不加的话，即使外面传入参数用引号括上还是会被分割开。
- `[default.env]`：这里放环境变量
- `[AppName]`：这里为某个游戏的单独配置

## 启动游戏
然后启动the big con 

`legendary launch tbc` 就可以了（上面配置了别名为tbc）

由于是unity游戏，所以最好导出box64的环境变量

`BOX64_DYNAREC_BLEEDING_EDGE=1` 和 `BOX64_DYNAREC=0`

第一个变量会在检测到monoBleedingEdge的时候，自动设置
```
BOX64_DYNAREC_STRONGMEM=1
BOX64_DYNAREC_BIGBLOCK=0
```

否则unity游戏使用box64时容易崩溃，弹出那个crashHandler的红色惊叹号窗口。

----
由于这游戏不支持epic云存档，就没测试legendary的云存档好不好用了（又下了几个体积小的游戏，貌似也都不支持云存档）

## 总结
- 可以使用linux版的legendary 第三方epic客户端。
- ubuntu23 需要使用pipx而非pip来安装leendary-gl。
- 登录epic时会跳转到浏览器，获取一个token，之后浏览器的登录不会退出。
- 由于需要借助box64，所以修改配置里的wine执行文件为脚本（shebang行指定为shell脚本），来启动box64和wine。