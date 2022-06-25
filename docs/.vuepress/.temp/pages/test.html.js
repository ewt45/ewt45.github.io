export const data = JSON.parse("{\"key\":\"v-953546a4\",\"path\":\"/test.html\",\"title\":\"docs/test/md\",\"lang\":\"zh-CN\",\"frontmatter\":{},\"excerpt\":\"\",\"headers\":[{\"level\":2,\"title\":\"h2\",\"slug\":\"h2\",\"children\":[]}],\"git\":{},\"filePathRelative\":\"test.md\"}")

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
