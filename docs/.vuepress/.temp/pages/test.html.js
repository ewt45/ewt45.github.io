export const data = JSON.parse("{\"key\":\"v-953546a4\",\"path\":\"/test.html\",\"title\":\"docs/test/md\",\"lang\":\"zh-CN\",\"frontmatter\":{},\"excerpt\":\"\",\"headers\":[{\"level\":2,\"title\":\"h2\",\"slug\":\"h2\",\"children\":[]}],\"git\":{\"createdTime\":1656148069000,\"updatedTime\":1656148069000,\"contributors\":[{\"name\":\"ewt45\",\"email\":\"79033456+ewt45@users.noreply.github.com\",\"commits\":1}]},\"filePathRelative\":\"test.md\"}")

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updatePageData) {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ data }) => {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  })
}
