import{_ as e,r as t,o as l,c as p,a,d as n,b as i,e as o}from"./app-DMogTwpC.js";const c={},r=a("h2",{id:"懒人教程",tabindex:"-1"},[a("a",{class:"header-anchor",href:"#懒人教程"},[a("span",null,"懒人教程")])],-1),u=a("br",null,null,-1),d={href:"https://pan.baidu.com/s/1R8dSY10dCBwzepnPd9ONWg?pwd=it4h",target:"_blank",rel:"noopener noreferrer"},m=o(`<h3 id="dex" tabindex="-1"><a class="header-anchor" href="#dex"><span>dex</span></a></h3><ul><li>下载smali.zip，打开mt管理器的dex编辑器++，在浏览界面长按任意路径，导入。</li><li>在EDMainActivity的OnCreate方法末尾，添加语句以初始化ov设置界面。<div class="language-smali line-numbers-mode" data-ext="smali" data-title="smali"><pre class="language-smali"><code><span class="line">new-instance <span class="token register variable">v0</span><span class="token punctuation">,</span> <span class="token class-name"><span class="token builtin">L</span><span class="token namespace">com<span class="token punctuation">/</span>example<span class="token punctuation">/</span>datainsert<span class="token punctuation">/</span>exagear<span class="token punctuation">/</span>virgloverlay<span class="token punctuation">/</span></span><span class="token class-name">OverlayBuildUI</span></span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">invoke-direct <span class="token punctuation">{</span><span class="token register variable">v0</span><span class="token punctuation">,</span> <span class="token register variable">p0</span><span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token class-name"><span class="token builtin">L</span><span class="token namespace">com<span class="token punctuation">/</span>example<span class="token punctuation">/</span>datainsert<span class="token punctuation">/</span>exagear<span class="token punctuation">/</span>virgloverlay<span class="token punctuation">/</span></span><span class="token class-name">OverlayBuildUI</span></span><span class="token punctuation">;</span><span class="token operator">-&gt;</span><span class="token function">&lt;init&gt;</span><span class="token punctuation">(</span><span class="token class-name"><span class="token builtin">L</span><span class="token namespace">android<span class="token punctuation">/</span>support<span class="token punctuation">/</span>v7<span class="token punctuation">/</span>app<span class="token punctuation">/</span></span><span class="token class-name">AppCompatActivity</span></span><span class="token punctuation">;</span><span class="token punctuation">)</span><span class="token builtin">V</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li>OverlayBuildUI里有个资源ID 0x7f09006e 是ed_main_content_frame对应的资源ID。不同版本ex这个值或许不同，请以实际为准。</li></ul><h3 id="so" tabindex="-1"><a class="header-anchor" href="#so"><span>so</span></a></h3><p>将overlay apk lib里的so全部复制到exa中。</p><h3 id="manifest" tabindex="-1"><a class="header-anchor" href="#manifest"><span>manifest</span></a></h3><ul><li>将overlay apk manifest里的service，32个process都复制到exa的manifest中。</li><li>添加悬浮窗权限 <code>&lt;uses-permission android:name=&quot;android.permission.SYSTEM_ALERT_WINDOW&quot; /&gt;</code></li></ul><hr><p>编译，签名apk即可</p>`,8);function k(v,h){const s=t("ExternalLinkIcon");return l(),p("div",null,[r,a("p",null,[n("先发懒人教程。自己探索的过程之后再说。"),u,a("a",d,[n("所需文件"),i(s)])]),m])}const x=e(c,[["render",k],["__file","index.html.vue"]]),_=JSON.parse('{"path":"/blogs/2022/autumn/exagearBuildInOV/","title":"将virgl overlay的apk整合入exagear","lang":"zh-CN","frontmatter":{"date":"2022-9-6 13:46:23","title":"将virgl overlay的apk整合入exagear","categories":["技术","exagear"],"tags":["android","virgl overlay","exagear"]},"headers":[{"level":2,"title":"懒人教程","slug":"懒人教程","link":"#懒人教程","children":[{"level":3,"title":"dex","slug":"dex","link":"#dex","children":[]},{"level":3,"title":"so","slug":"so","link":"#so","children":[]},{"level":3,"title":"manifest","slug":"manifest","link":"#manifest","children":[]}]}],"git":{"createdTime":1662864184000,"updatedTime":1666354376000,"contributors":[{"name":"ewt45","email":"79033456+ewt45@users.noreply.github.com","commits":2}]},"filePathRelative":"blogs/2022/autumn/exagearBuildInOV/index.md"}');export{x as comp,_ as data};