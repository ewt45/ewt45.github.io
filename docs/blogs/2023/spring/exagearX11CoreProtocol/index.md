---
date: '2023-4-20 10:35:24'
title: 完善Exagear XServer的X11核心协议, 解决wine8.6和wine5.0+ staging无法在ex的xserver上使用的问题
categories: 
 - exagear
 - 技术
tags:
 - XServer
 - exagear
 - Core X11 Protocol
---

[[TOC]]
## 前言
wine更新了8.6（目前只有Kron4ek的编译版本，不知道为啥官网没更新）。使用ex的xserver打开后，直接闪退了，并在x86-stderr.txt中出现了如下报错。Wine staging5.0以上也会出现类似报错。
```
X Error of failed request:  BadRequest (invalid request code or no such operation)
  Major opcode of failed request:  49 (X_ListFonts)
  Serial number of failed request:  6
  Current serial number in output stream:  6
```
观察ex的dex，发现在`Opcodes`类中定义了ListFonts常量恰好为49，而且同包名（`com.eltechs.axs.requestHandlers.core`）下，有很多类，里面的方法带着注解`@RequestHandler(opcode = 数字)`，也就是对应opcode的函数实现。

查阅资料，发现这个是X11的核心协议的一部分，看来是exagear没有实现全，那么就要手动添加上了。

- [官方对于xlib的说明及完整列表](https://www.x.org/releases/X11R7.7/doc/libX11/libX11/libX11.html)
- [接收的参数信息和返回的参数信息](https://cgit.freedesktop.org/xorg/proto/xproto/tree/Xproto.h)
- [有关opcode的说明](https://www.x.org/wiki/Development/Documentation/Protocol/OpCodes/)


## 将已写好的补充函数添加到apk

使用MT管理器等工具编辑dex，添加压缩包中的smali，如果有重名则覆盖。\
[点击下载文件](https://wwqv.lanzout.com/iyFyv0thllti)


## 探索过程
本节为自用，主要记录实现java代码的过程。

有关资料，可以在前言中寻找。
### 处理函数的函数层注解
在前言中提到了注解，一个完整的函数长这样
```java
@RequestHandler(opcode = 45)
public void OpenFont(
        @RequestParam int i,
        @RequestParam @ParamName("nameLength") short s,
        @RequestParam short s2,
        @ParamLength("nameLength") @RequestParam String str) {
    if (!str.equals("cursor")) {
        Assert.notImplementedYet(String.format("OpenFont supports only font='cursor', but got '%s'.", str));
    }
}
```
@ReuqestHandler作用在函数上，表明该函数对应的opcode。之前想尝试解决鼠标偏移的时候误打误撞研究过这里，发现原来是可以通过注解
在RootXRequestHandlerConfigurer类中配置这些函数。
相关代码如下。可以看到，先获取对象的全部方法，然后尝试获取方法的注解，如果有RequestHandler注解，则将此方法添加到数组中。之后就可以随时从数组中获取。
```java
public void configureDispatcher(Object... objArr) {
    Method[] methods;
    for (Object obj : objArr) 
        for (Method method : obj.getClass().getMethods()) 
            RequestHandler requestHandler = method.getAnnotation(RequestHandler.class);
            if (requestHandler != null) 
                processOneHandler(requestHandler.opcode(), obj, method);
}


public void installRequestHandler(int i, OpcodeHandler opcodeHandler) {
    if (this.opcodeHandlers.length <= i) {
        OpcodeHandler[] opcodeHandlerArr = new OpcodeHandler[i + 1];
        System.arraycopy(this.opcodeHandlers, 0, opcodeHandlerArr, 0, this.opcodeHandlers.length);
        this.opcodeHandlers = opcodeHandlerArr;
    }
    Assert.state(this.opcodeHandlers[i] == null, String.format("A handler for the opcode %d is already registered.", Integer.valueOf(i)));
    this.opcodeHandlers[i] = opcodeHandler;
}
```
### 处理函数的参数层注解

然后ex的xserver应该是用socket通信，所以接收到Request的时候，会拿到一个字节数组。在AnnotationDrivenOpcodeHandler类中，通过method.invoke调用对应的处理方法。主要内容如下。
```java
@Override // com.eltechs.axs.proto.input.OpcodeHandler
public void handleRequest(XClient xClient, int length, byte minorOpCode, XRequest xRequest, XResponse xResponse) throws XProtocolError, IOException {
    try {
        LocksManager.XLock lock = this.xServer.getLocksManager().lock(this.locks);
        this.handlerMethod.invoke(this.handlerObject, this.requestParser.getRequestHandlerParameters(xClient, this.xServer, xRequest, xResponse, length, minorOpCode));
        lock.close();
    } catch (IllegalAccessException | InvocationTargetException e) {
    }
}
```
其中XClient，XResponse如果在处理方法中声明为参数就传进去，没有就不传。然后获取处理方法参数的注解，如果该参数带`@RequestParam`，就从字节数组中读取一些字节作为该参数的值。如果全部处理完带该注解的参数，字节数组还有剩余，则会抛出异常，所以要确定好参数的个数和类型。



有关处理方法的参数注解，`@ParamName("nameLength")`和`@ParamLength("nameLength")`组合使用，可以读取指定长度的字符作为字符串，如下示例。
```
@RequestParam @ParamName("nameLength") short s,
@ParamLength("nameLength") @RequestParam String str
```
还有一个`@ParamWidth(数字)`,数字只能是1或2或4，用于读取指定长度的字节作为一个基础类型的参数值。

### 处理函数的返回值
在参考规范中，可以看到很多处理函数都是带返回值的，但是ex中的函数没有直接return返回，而是通过XResponse类，写入socket来返回值。

再看两个简单的例子
```java
@RequestHandler(opcode = GetPointerControl)
public void GetPointerControl(XResponse xResponse) throws IOException {
    xResponse.sendSimpleSuccessReply((byte) 0, new XResponse.ResponseDataWriter() { // from class: com.eltechs.axs.requestHandlers.core.PointerRelatedRequests.2
        @Override // com.eltechs.axs.xconnectors.BufferFiller
        public void write(ByteBuffer byteBuffer) {
            byteBuffer.putShort((short) 1);
            byteBuffer.putShort((short) 1);
            byteBuffer.putShort((short) 0);
        }
    });
}

@Locks({"INPUT_DEVICES"})
@RequestHandler(opcode = 44)
public void QueryKeymap(XResponse xResponse) throws IOException {
    xResponse.sendSimpleSuccessReply((byte) 0, new byte[32]);
}
```

这里我没仔细研究过写入格式是啥，反正大概就是将返回值写入字节数组。

注意如果该处理函数需要有返回值，而没调用xResponse发送一个socket的话，那么请求方就会一直等着。测试发现，比如在初始化时有一个返回值没返回，ex就会卡在启动环境后的加载中那个界面。

### 自己编写处理函数

对于wine8.6 缺的是ListFonts。添加函数：
```java
@RequestHandler(opcode = 49)
public void ListFonts(
        XClient xClient,
        XResponse xResponse ,
        @RequestParam @Unsigned @Width(2) int maxNames,
        @RequestParam @ParamName("patternLength") short length,
        @ParamLength("patternLength") @RequestParam String pattern
        ) throws IOException {
    Log.d("TAG", "看看要求的pattern是啥？"+pattern);
    String[] fontLists = new String[0];
    xResponse.sendSimpleSuccessReply((byte) 0, new XResponse.ResponseDataWriter() { // from class: com.eltechs.axs.requestHandlers.core.AtomManipulationRequests.1
        @Override // com.eltechs.axs.xconnectors.BufferFiller
        public void write(ByteBuffer byteBuffer) {

        }
    });
}
```

对于wine5.0以上staging，缺的是GetPointerMapping。添加函数
```java
@RequestHandler(opcode = GetPointerMapping)
public void GetPointerMapping(XResponse xResponse) throws IOException {
    xResponse.sendSimpleSuccessReply(
            (byte) 0,
            new XResponse.ResponseDataWriter() {
                @Override
                public void write(ByteBuffer byteBuffer) {
                    byteBuffer.putShort((short) 7);
                    byteBuffer.putShort((short) 1);
                    byteBuffer.putShort((short) 2);
                    byteBuffer.putShort((short) 3);
                    byteBuffer.putShort((short) 4);
                    byteBuffer.putShort((short) 5);
                    byteBuffer.putShort((short) 6);
                    byteBuffer.putShort((short) 7);

                }
            }
    );
}
```

需要说一点，如果写的处理函数参数格式不正确，是会直接报错的，再加上我现在ex的dex基本反编译完了，这块调试很方便，所以可以确定参数是没问题的。\
~~但是返回值没有研究过传哪去了，也不知道怎么调试，所以不敢保证自己写的函数返回值正确。从结果来看，添加函数之后不会报错，不会闪退，可以正常进入环境。~~
写这篇博客的时候搜了一下，找到返回值结构了。。。

#### 分析请求参数
如果想查看request传入的字节数组具体内容的话，可以在`RootXRequestHandler.handleNormalRequest()`打log。数组最开头两位分别是majorOpcode和minorOpcode。拿个ListFonts传入的字节数组为例
`[49, 0, 4, 0, 1, 0, 5, 0, 102, 105, 120, 101, 100, 0, 0, 0]`


在`https://cgit.freedesktop.org/xorg/proto/xproto/tree/Xproto.h`中查找，可找到ListFonts的请求数据格式和返回数据格式。（在写这篇博客之前，也就是写函数的时候我还不知道在这里能查数据格式orz）
```c
//请求数据格式
typedef struct {
    CARD8 reqType;
    BYTE pad;
    CARD16 length B16;
    CARD16 maxNames B16;
    CARD16 nbytes B16;  /* followed immediately by string bytes */
} xListFontsReq;

//返回数据格式
typedef struct {
    BYTE type;  /* X_Reply */
    BYTE pad1;
    CARD16 sequenceNumber B16;
    CARD32 length B32;
    CARD16 nFonts B16;
    CARD16 pad2 B16;
    CARD32 pad3 B32;
    CARD32 pad4 B32;
    CARD32 pad5 B32;
    CARD32 pad6 B32;
    CARD32 pad7 B32;
    } xListFontsReply;
```
[Xlib页面](https://www.x.org/releases/X11R7.7/doc/libX11/libX11/libX11.html#XListFonts)的函数介绍
```
char **XListFonts(Display *display, char *pattern, int maxnames, int *actual_count_return);

display         Specifies the connection to the X server.
pattern         Specifies the null-terminated pattern string that can contain wildcard characters.
maxnames        Specifies the maximum number of names to be returned.
actual_count_return     Returns the actual number of font names.
```
看字节数组，49是majorcode，0是minorcode，接下来的4跟剩余字节个数有关，设它为n
```
int n = 4;
int i = (n != 0) ? 4 : 8;
int remaning = (n * 4) - i;
```
算出remaning=12，正好是剩下的字节个数。所以这个4大概对应结构体中的`length`？在往下，小端序读取两个字节 = 01，对应结构体中的`maxNames`，即最多可返回的字符串个数。再读两个字节 = 05，对应结构体的`nbytes`，即应往下读取五个字节作为接下来的字符串参数`pattern`，手动将ascii转字符，可得字符串为`fixed`。完毕。


## 总结
- exgear自制的xserver，在`com.eltechs.axs.requestHandlers`包下实现了大部分的X11核心协议，和一小部分伪装的扩展协议，用于处理request，但是并不全。
- 处理协议的函数，接收和发送数据都是利用socket，也就是需要从接收字节转为参数，再把返回值转为字节发送。通过在函数头加上注解@RequestHandler，将处理函数与对应的Xlib操作关联起来。
- 某些没有实现的核心协议，如果用到了会抛出严重异常，xserver会直接关闭，扩展协议的话基础使用可以不用到，但是3d渲染很多都会需要，所以exagear里用3d渲染挺麻烦的，尤其是硬件渲染。
- 补齐处理函数，可以先在x86-stderr.txt中查一下majorcode和函数名，然后在Xlib界面查找对应的函数介绍（https://www.x.org/releases/X11R7.7/doc/libX11/libX11/libX11.html ），根据请求和返回数据格式（ https://cgit.freedesktop.org/xorg/proto/xproto/tree/Xproto.h ）编写函数，通过@RequestParam注明要接收的参数，通过xResponse将返回值写入字节数组中。
