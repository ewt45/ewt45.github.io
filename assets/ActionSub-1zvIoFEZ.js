import{g as b,_ as F,r as u,k as f,o as B,f as o,a as m,b as t,e as r}from"./app-CAedSY9P.js";const w=b({__name:"ActionSub",props:{video:{}},setup(a,{expose:e}){e();const n=a,s={prop:n,gotoDownsub:()=>{window.open(`https://downsub.com/?url=https://www.youtube.com/watch?v=${n.video.video_id}`,"_blank")}};return Object.defineProperty(s,"__isScriptSetup",{enumerable:!1,value:!0}),s}});function v(a,e,n,l,s,A){const _=u("el-link"),c=u("el-text"),p=u("el-alert"),i=u("el-button"),d=u("el-space");return B(),f(d,{class:"root",direction:"vertical",size:36},{default:o(()=>[m("div",null,[t(c,{size:"large"},{default:o(()=>[e[1]||(e[1]=r(" 下载此youtube视频的字幕（机翻）。点击按钮会跳转到外部网站 ")),t(_,{href:"https://downsub.com/",target:"_blank"},{default:o(()=>e[0]||(e[0]=[r("downsub")])),_:1})]),_:1}),t(p,{title:"请自行鉴别外部网站内容的真实性与安全性",type:"warning","show-icon":"",closable:!1})]),t(i,{type:"primary",size:"large",round:"",onClick:l.gotoDownsub},{default:o(()=>e[2]||(e[2]=[r("点击跳转")])),_:1})]),_:1})}const g=F(w,[["render",v],["__scopeId","data-v-d683e4c4"],["__file","ActionSub.vue"]]);export{g as default};
