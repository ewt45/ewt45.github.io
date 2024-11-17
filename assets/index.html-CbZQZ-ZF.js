import{_ as e,o as t,c as o,e as s}from"./app-DMogTwpC.js";const r="/assets/1-BGh89IA8.png",a="/assets/2-DJG0G_tS.png",c="/assets/3-CCpCafsL.png",i="/assets/4-oisIOkgs.png",d={},l=s('<h2 id="操作步骤" tabindex="-1"><a class="header-anchor" href="#操作步骤"><span>操作步骤</span></a></h2><ol><li><p>打开termux，输入<code>ln -s /data/data/com.termux/files/usr/var/lib/proot-distro/installed-rootfs/</code>并回车。 <img src="'+r+'" alt="图1"></p></li><li><p>以MT管理器（v2.13.3及以上版本）为例，左上角菜单选择<code>添加本地存储</code><img src="'+a+'" alt="图2"></p></li><li><p>在打开的文件管理器中，点击左上角，选择<code>Termux</code>，然后点击<code>使用此文件夹</code>添加该存储路径。 <img src="'+c+'" alt="图3"></p></li><li><p>点击左侧本地路径中的Termux Home，即可查看termux内部文件夹，然后进入installed-rootfs文件夹中找到你安装的proot rootfs即可。 <img src="'+i+'" alt="图4"></p></li></ol><h2 id="原理" tabindex="-1"><a class="header-anchor" href="#原理"><span>原理</span></a></h2><p>在termux中，可以通过<code>termux-setup-storage</code>命令将安卓外部存储目录<code>/storage/emulated/0/</code>整个挂载到termux应用专属目录<code>/data/data/com.termux/files/home/storage</code>，以便在termux内部查看外部存储目录下的文件。</p><p>如果要在第三方文件管理器中查看termux内部文件，就需要用到安卓的文件提供器。部分文件管理器支持添加这类存储路径（比如MT管理器v2.13.3及以上版本）。</p><p>termux自带的文件提供器向外暴露的路径为<code>/data/data/com.termux/files/home/</code>，也就是说mt管理器可以看到这个文件夹。但是proot安装路径在<code>/data/data/com.termux/files/usr/var/lib/proot-distro/installed-rootfs/</code>，不在这个被暴露的文件夹内。所以需要通过软链接的方式，将<code>installed-rootfs</code>文件夹链接到<code>home</code>文件夹中。</p>',6),m=[l];function n(p,u){return t(),o("div",null,m)}const x=e(d,[["render",n],["__file","index.html.vue"]]),_=JSON.parse('{"path":"/blogs/2023/spring/termuxCheckProotDir/","title":"在termux中安装的proot，如何在第三方文件管理器中查看其文件目录","lang":"zh-CN","frontmatter":{"date":"2023-5-12 09:50:04","title":"在termux中安装的proot，如何在第三方文件管理器中查看其文件目录","categories":["技术"],"tags":["termux","proot"]},"headers":[{"level":2,"title":"操作步骤","slug":"操作步骤","link":"#操作步骤","children":[]},{"level":2,"title":"原理","slug":"原理","link":"#原理","children":[]}],"git":{"createdTime":1683858186000,"updatedTime":1683858186000,"contributors":[{"name":"ewt45","email":"79033456+ewt45@users.noreply.github.com","commits":1}]},"filePathRelative":"blogs/2023/spring/termuxCheckProotDir/index.md"}');export{x as comp,_ as data};