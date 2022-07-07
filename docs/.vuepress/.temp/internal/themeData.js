export const themeData = JSON.parse("{\"sidebar\":{\"/blogs/\":[\"/blogs/blog1\",\"/blogs/blog2\"]},\"subSidebar\":\"auto\",\"navbar\":[{\"text\":\"首页\",\"link\":\"/\",\"icon\":\"reco-home\"}]}")

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updateThemeData) {
    __VUE_HMR_RUNTIME__.updateThemeData(themeData)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ themeData }) => {
    __VUE_HMR_RUNTIME__.updateThemeData(themeData)
  })
}
