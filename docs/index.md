---
home: true
modules: # 指定首页展示模块
  - Banner
  - Blog
  - MdContent
  - Footer
banner: # banner 模块的配置
  heroText: 博客
  tagline: 靡不有初 鲜克有终
#   heroImage: /logo.png
#   heroImageStyle:
#     maxWidth: 200px
#     margin: 0 auto 2rem
  bgImage: /banner.jpg
  bgImageStyle:
    height: 70vh
blog: # blog 模块的配置
  socialLinks: # 社交 icon 请到 [Xions](https://www.xicons.org/#/zh-CN) 页面的 tabler 下获取，复制名称即可
    - { icon: 'LogoGithub', link: 'https://github.com/ewt45' }
    # - { icon: 'BrandTwitter', link: 'https://twitter.com/reco_luan' }
footer: # 底部模块的配置
#   record: 域名备案文案
#   recordLink: 域名备案地址
#   cyberSecurityRecord: 公安备案文案
#   cyberSecurityLink: 公安备案地址
  startYear: 2022
---


<!-- # Hello VuePress
yarn docs:dev
<router-link to="/test">test</router-link> 


升级依赖: 修改package.json中依赖的版本号。然后yarn upgrade。 可能需要先yarn install
yarn upgrade说明：
根据 package.json 文件中指定的版本范围将依赖更新到最新版本。 yarn.lock 文件也将被重新创建。
可以选择指定一个或多个包名称。 当指定包名称时，只有那些包才会被升级。 当不指定包名时，所有依赖都会被升级。 

-->