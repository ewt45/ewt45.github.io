export const themeData = JSON.parse("{\"sidebar\":{\"/blogs/\":[\"/blogs/blog1\",\"/blogs/blog2\"]},\"subSidebar\":\"auto\",\"navbar\":[{\"text\":\"导航1\",\"link\":\"/blogs/blog2.html\",\"icon\":\"reco-home\"},{\"text\":\"导航2\",\"link\":\"/\",\"icon\":\"reco-document\"}]}")

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
