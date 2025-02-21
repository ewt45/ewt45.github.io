---
date: '2025-02-20 21:42'
title: python通过网页/api检查安卓app新版本
categories: 
 - 技术
 - 脚本
tags:
 - python
 - selenium
---

## 前言
有一些我正在使用/特别关注/收藏的安卓应用，想检测其每个新版本的更新。

安卓支持侧载安装，所以一般应用官网都有最新版的下载地址，基本逻辑就是selenium打开网页，点击下载按钮，获取下载链接。部分应用可能需要从app内获取下载链接。

步骤：
1. 定时运行，获取当前app的可下载的最新版本。
2. 与本地存储的数据进行比较，判断是否有新版本，并将最新数据存入本地。
3. 如果有新版本，或获取时出现异常，显示GUI窗口，显示日志及更新链接。
4. 一个更新被处理后，将其勾选，则下次不会再显示。


## 数据存储
本地存储一些数据。
- 格式为json. 对应python类型是一个字典
- 每个key就是一个app的名称，对应value是该app的基本信息及历史获取到的版本
- 历史版本为一个数组，每个元素对应一个版本。包含版本号，下载链接，和是否已处理。未处理的版本会显示在GUI窗口中。

示例。
```json
{
    "植物大战僵尸2拓维版": {
        "name": "植物大战僵尸2拓维版",
        "init_url": "https://pvz2.hrgame.com.cn/",
        "versions": [
            {
                "version_name": "3.6.2",
                "download_link": "https://pvz2apk-cdn.ditwan.cn/362/baokai_3.6.2_1630_81_dj2.0-2.0.0.apk",
                "handled": true
            },
            {
                "version_name": "3.6.3",
                "download_link": "https://pvz2apk-cdn.ditwan.cn/363/baokai_3.6.3_1632_83_dj2.0-2.0.0.apk",
                "handled": true
            }
        ]
    }
}
```

## 获取直接下载链接

### selenium基本使用

```py
def new_chrom_driver() -> WebDriver:
    """
    返回一个chrome浏览器实例
    """
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  # 无头模式
    options.set_capability("goog:loggingPrefs", {"performance": "ALL"})

    options.add_experimental_option("prefs", {
        # "download.prompt_for_download": False,  # 禁用下载弹窗
        # "download.directory_upgrade": True,
        "safebrowsing.enabled": True,
        "download_restrictions": 3,  # 禁止所有文件下载 https://stackoverflow.com/questions/44144502
    })

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    return driver
```

- 使用无头模式时，不会显示浏览器的GUI窗口。
- `options.set_capability("goog:loggingPrefs", {"performance": "ALL"})` 需要设置这个，以便从日志中获取直接下载链接。
- `"download_restrictions": 3` 禁止所有文件下载，参考：[Is it possible to disable file download in chrome using selenium](https://stackoverflow.com/questions/44144502)。因为点击下载按钮后会自动开始下载文件，所以每检查一次更新就会下载一次文件，需要把这个禁用掉。


---
最后需要通过 `driver.quit()` 退出浏览器。由于执行过程中可能会出现异常，所以退出代码放在try的finally中。
```py
if __name__ == "__main__":
    driver = my_utils.new_chrom_driver()
    try:
        ###
    finally:
        driver.quit()
```

---
网络代理
```py
if Consts.USE_SYS_PROXY:
    os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7897'
    os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7897'
```
访问部分国外网站时需要使用到代理（我用的clash）。这部分在网上搜了很多方法，实际尝试都没成功。最后通过最原始的方法 设置环境变量，解决了。

---
每次检查一个app, 开头新建一个标签页，结尾关闭这个标签页

有些网站需要移动版UA才能获取到下载链接，所以访问网址前 先设置成安卓UA.

```py
# 每次检查一个app, 开头新建一个标签页，结尾关闭这个标签页
_driver.switch_to.window(_driver.window_handles[0])
_driver.execute_script("window.open('');")
_driver.switch_to.window(_driver.window_handles[1])

# 设置安卓UA
_driver.execute_cdp_cmd("Emulation.setUserAgentOverride", {"userAgent": Consts.UA_ANDROID})
_driver.get(init_url)

# 关闭当前标签页
_driver.close()
```
### 从网站的下载按钮获取更新
首先要保证这个应用可以从官网的网页下载。

大致分两种
- 网页的下载按钮对应一个中间地址，访问这个中间地址后，再跳转到最新版本的apk实际下载地址
- 下载按钮直接对应实际下载地址

第二种直接筛选html元素即可获取到。第一种比较麻烦，没找到拦截跳转的方法，只能让它先正常跳转过去，进入直接下载链接，然后下载文件，然后禁用文件下载防止它真的下载到本地，然后每1秒查询一次历史日志，直到找出跳转到直接链接的那条。

获取日志（调用一次get_log后会清空缓存，所以下一次再获取的日志不包含上一次获取到的）
```py
logs = _driver.get_log("performance")
for log in logs:
    try:
        if ".apk" in log['message']:
            stop = 1
        msg = json.loads(log['message'])['message']
        if msg['method'] != "Network.responseReceivedExtraInfo":
            continue
        location: str = my_utils.chains_dict_value(msg, 'params', 'headers', ['Location', 'location'])
        if location is None:
            continue
        location = location.split('?')[0]  # 去掉问号后的查询参数
        if location.startswith("https://") and location.endswith(".apk"):
            try:
                return location, get_version_by_link(location)
            except Exception as e:
                my_utils.error("获取版本号失败", e, traceback.format_exc())
                return location, ""

    except Exception:
        pass
```

一条log是一个字典，主要内容都在`log['message']`中，这个是一个字符串，所以先通过`json.loads`转为字典 `msg`。然后判断两个条件：
1. `msg['method']` 为`Network.responseReceivedExtraInfo`
2. `msg['params']['headers']['location']` 跳转地址，掉问号后的查询参数，以 `https://` 开头，`.apk` 结尾。注意最后一的`location`可能为大写`L`, 似乎没有固定规范。

有关方法`Network.responseReceivedExtraInfo`,可以参考[chrome开发者网站](https://chromedevtools.github.io/devtools-protocol/tot/Network/#event-responseReceivedExtraInfo)的函数介绍。

### 从play商店获取更新

一些应用只能从谷歌商店下载，例如PvZ Free. 想从谷歌商店获取直接下载链接非常困难，但是获取个版本号信息还是可以的。 

一个第三方工具 [google_play_scraper](https://github.com/JoMingyu/google-play-scraper)

使用起来也是非常的方便

```py
try:
    result = google_play_scraper.app('com.ea.game.pvzfree_row')
    version = result['version']
except Exception as e:
    pass
```

### 从github获取更新

github官方提供了各种api,所以直接使用即可。

旧版api不需要帐号，但是有速率限制，新版api功能更多但是需要帐号，省事起见就用旧版吧。

另外，由于api返回的是json,所以可以不用selenium,直接`requests.get`即可。非要用selenium的话也不是不行，我用的chrome浏览器会套一层美化输出的选项，所以先找到json内容 `_driver.find_element(By.TAG_NAME, 'pre').text` 再转为py对象即可。

我要检测的winlator, 检测releases即可
- api：`https://api.github.com/repos/brunodev85/winlator/releases/latest`
- 遍历 `jdata['assets']` ，找到以 `.apk` 结尾的文件。注意由于assets可以多次修改，所以应该注意文件上传日期 ` jdata['tag_name'] + '_' + asset['updated_at']`


### 从其他方式获取更新

某app没有网页下载入口，不过应用内有检查更新的选项。想从dex中获取下载地址，发现所有字符串都被替换成了一个函数调用，传入两个字符串，返回解密后的实际字符串，好在app既没有加固也没有签名校验，在这个函数内加一行输出实际字符串就获取到了。

## GUI窗口显示可更新内容

使用tkinter（python3-tik）来编写gui.

大致要求就是显示全部可更新的app。每个版本对应一个勾选框和按钮。点击按钮显示对话框，包含版本号和下载链接。勾选了勾选框之后 将该版本设为已处理，下次不会再显示。

```python gui.py
import tkinter as tk
from tkinter import ttk

from check_app_update import my_utils
from check_app_update.my_types import AppInfo, AppVersionInfo


def on_checkbox_toggle(ver: AppVersionInfo, var):
    """更新对应的字典项的handled值"""
    def func(_ver: AppVersionInfo, _var):
        _ver['handled'] = _var.get()
    return lambda : func(ver, var)



def create_scroll_canvas(window: tk.Tk):
    """
    创建一个可垂直滚动的canvas
    """
    # 创建 Canvas 控件
    canvas = tk.Canvas(window)
    canvas.pack_configure(side="left", fill="both", expand=True, padx=10, pady=10)

    # 创建垂直滚动条
    scrollbar = tk.Scrollbar(window, orient="vertical", command=canvas.yview)
    scrollbar.pack_configure(side="right", fill="y")

    # 将滚动条与 Canvas 绑定
    canvas.config(yscrollcommand=scrollbar.set)
    return canvas

def show_link_dialog(window:tk.Tk, ver: AppVersionInfo):
    def func(_window: tk.Tk, _ver: AppVersionInfo):
        """
        显示下载链接的对话框。文本可复制
        """
        # 创建一个新的 Toplevel 窗口（对话框）
        dialog = tk.Toplevel(_window, )
        dialog.title("下载链接")

        version_text = tk.Text(dialog, wrap="word", padx=10, pady=10, height=1, width=60)  # height=6, width=30
        version_text.insert(tk.END, _ver['version_name'])  # 插入文本
        version_text.pack()

        link_text = tk.Text(dialog, wrap="word", padx=10, pady=10, width=60)  # height=6, width=30
        link_text.insert(tk.END, _ver['download_link'])  # 插入文本
        link_text.pack()
        #link_text.config(state='normal')  # 允许编辑和选择

    return lambda : func(window, ver)




def create_window(data: dict[str, AppInfo], error_log: list[str]):
    window = tk.Tk()
    window.title("可更新的app")
    window.geometry("700x500")

    # 设置全局字体
    style = ttk.Style()
    style.configure(".", font=("Arial", 13), achor="w")  # 设置所有 ttk 控件的字体大小

    # 创建一个滚动框架以容纳复选框和文本
    canvas  = create_scroll_canvas(window)
    root_frame = ttk.Frame(canvas,)
    canvas.create_window((0, 0), window=root_frame, anchor="nw") # 可垂直滚动

    ttk.Label(root_frame, text="显示未处理的版本。勾选后标记为已处理，下次不会再显示。", font=("Arial", 10)).pack()

    # 检查更新时的错误日志
    # TODO ??为啥my_utils.log_history在main里还好好的，这里获取到的就变成空的了啊。只能参数传过来了
    if len(error_log) > 0:
        error_log_text = tk.Text(root_frame, wrap="word", padx=10, pady=10, height=7)
        error_log_text.insert(tk.END, "错误日志:\n\n" + "\n\n----------------\n\n".join(error_log))
        error_log_text.pack_configure(expand = True, fill="y")

    # 有新版本的app
    ttk.Label(root_frame, text="").pack(pady=5)

    for app in data.values():
        if all(ver['handled'] for ver in app['versions']):
            continue

        app_frame = ttk.Frame(root_frame, )
        app_frame.pack(fill="x",)

        # Label 用于显示标题
        title_label = ttk.Label(app_frame, text=app['name'], font=("Arial", 16, "bold"))
        title_label.pack_configure(side="top", anchor="w", pady=(20, 10))  # pady 用来设置上下间距

        # Checkbutton 显示未处理的版本
        for ver in app['versions']:
            if ver['handled']:
                continue

            # 有关点击事件，如果直接写lambda 执行内容时调用函数传入ver,那么传入的永远是最后一次循环的ver
            # 所以改成在此处直接执行一个函数func_a并传入ver, func_a返回一个使用了ver的lambda函数，这样ver就会固定下来
            bool_var = tk.BooleanVar(value=False)
            checkbox = ttk.Checkbutton(app_frame, text=ver['version_name'], variable=bool_var, command=on_checkbox_toggle(ver, bool_var))
            checkbox.pack(side="left", anchor="w", padx=10)
            # 复制按钮
            # 这里定义lmd时，必须要通过参数_link=ver['download_link'] 传入链接，如果直接
            # lambda: show_link_dialog(window, ver['download_link'])
            # 所有按钮的链接都会变成最后一次循环时的链接
            link_button = tk.Button(app_frame, text="链接", command=show_link_dialog(window, ver))
            link_button.pack_configure(side="left", padx=10)


    ttk.Label(root_frame, text="").pack(pady=5)
    # 更新 Canvas 的滚动区域
    root_frame.update_idletasks()  # 更新后，才能获取内容的总高度
    canvas.config(scrollregion=canvas.bbox("all"), highlightthickness=0)

    window.mainloop()

    # 退出时更新handled状态
    my_utils.save_local_data(data)


if __name__ == "__main__":
    create_window(my_utils.read_local_data(), ["测试1","测试2","测试3"])

```

## 总结
- 使用selenium/requests/第三方工具 从网页/api获取app更新信息
- 如果有更新，则使用tkinter显示gui，以便处理。