<template>
  <div class="">
    <!-- vue组件
    <button @click="handleClick">按钮</button>
    {{ times }} -->
    <!-- 切换图鉴 -->
    <div
      class="
        sticky
        top-0
        bg-black bg-opacity-75
        backdrop-filter backdrop-blur-lg
        py-5
        mb-4
        w-full
        min-y-max
        flex flex-row
        justify-around
        items-center
        z-50
      "
    >
      <template v-for="item in headerMenu">
        <img
          :src="
            '/mkt/assets/main/content/ui/texture/menu/Menu' + item + '00.png'
          "
          :alt="item"
          @click="changeRoute(item)"
        />
      </template>
    </div>
    <!-- 图鉴主体 -->
    <!-- <div class="flex justify-center  w-screen"> -->
    <div class="">
      <keep-alive>
        <component
          :is="'mkt-' + body"
          :json="mainJson[enum1[body]]"
          class=""
        />
      </keep-alive>
      <!-- 获取对象的属性可以用obj.a或obj[a] -->
      <!-- <div>{{mainJson[enum1[body]]}}</div> -->
    </div>
  </div>
</template>
<script setup>
import { reactive, ref, onMounted, shallowRef } from "vue";
// import MKTData from "/mkt/data/PiranhaPlantTour_alldata_multilang.json"
import axios from "axios";

const times = ref(0);
/**顶部切换菜单选项，角色，卡丁车， 滑翔翼 */
const headerMenu = ["Driver", "Machine", "Glide"];

/**当前选择显示的内容 */
const body = ref(headerMenu[0]); //shallowRef(Driver);

/**数据json courses,drivers,gliders,karts,skills,tour*/
let mainJson = ref({}); //reactive之后再说

/**用于枚举，查找header数组中元素对应json中属性名 */
const enum1 = { Driver: "drivers", Machine: "karts", Glide: "gliders" };

/**获取数据json，貌似只能用axios， */
onMounted(() => {
  axios
    .get("/mkt/data/PiranhaPlantTour_alldata_multilang.json")
    .then((res) => {
      mainJson.value = res.data;
      // console.log(res, mainJson.value);
    })
    .catch((e) => {
      console.log("获取json失败", e);
    });
});

const handleClick = () => {
  // console.log("click");
  times.value++;
};

/**切换图鉴内容 */
const changeRoute = (component) => {
  console.log(component);
  body.value = component;
};
</script>
<style scoped>
@import "./css/main.css";
</style>

