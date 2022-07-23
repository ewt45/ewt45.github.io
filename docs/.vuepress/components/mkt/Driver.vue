<template>
  <!-- <div>人物.vue</div> -->
  <!-- <div>{{props.json}}</div> -->
  <el-row style="width: 100vw">
    <el-col :span="12"><el-card>1</el-card></el-col>
    <el-col :span="6">2</el-col>
    <el-col :span="6">3</el-col>
    <button class="btn">anniu</button>
  </el-row>
  <!-- 用element也不太行啊 -->
  <!-- <el-descriptions :column="4" size="small">
    <el-descriptions-item :span="1" v-for="(item, index) in props.json" :key="item.Name" style="height: 280px;width: 210px;">

    </el-descriptions-item>
  </el-descriptions> -->

  <div class="flex justify-center min-w-max">
    <div class=" grid gap-1 justify-end grid-cols-4 w-screen">
      <template
        v-for="(item, index) in props.json"
        :key="item.Name"
        style="height: 280px; width: 210px"
      >
        <!-- style="height: 280px;width: 210px;" -->
        <div class="">
          <!-- min-w-max min-y-max 三张图片居中：grid justify-items-center items-center或者flex justify-center items-center  style="height: 280px; width: 210px"-->
          <div
            class="relative flex-initial grid justify-items-center items-center m-2"
            style="height: 280px; width: 210px"
          >
            <!-- \.vuepress\public\mkt\assets\main\content\driver\bbdaisy\icons\BbDaisyWholeBody_Small.png -->
            <!-- :src="'/mkt/assets/main/content/driver/'+item.Name.toLowerCase()+'/icons/' + item.Name + 'WholeBody_Small.png'" -->

            <img
              :src="
                '/mkt/assets/main/content/driver/' +
                getfolderName(item.Name) +
                '/icons/' +
                item.Name +
                'UpperBody.png'
              "
              :alt="item.Name"
              class="absolute z-10"
            />
            <img
              :src="
                '/mkt/assets/main/content/ui/texture/Rare' +
                enum1[item.Rarity] +
                'Base01.png'
              "
              alt="Rare*BaseFrame01"
              class="absolute inset-0 z-0"
            />

            <img
              :src="
                '/mkt/assets/main/content/ui/texture/Rare' +
                enum1[item.Rarity] +
                'BaseFrame01.png'
              "
              alt="Rare*BaseFrame01"
              class="absolute inset-0 z-20"
            />
            <!-- <img
            :src="
              '/mkt/assets/main/content/ui/texture/Rare' +
              enum1[item.Rarity] +
              'BaseFrame01.png'
            "
            alt="Rare*BaseFrame01"
            class=" inset-0 z-20"
            v-show="false"
          /> -->
          </div>
        </div>
      </template>
    </div>
  </div>
</template>


<script setup>
import { onMounted } from "vue";
/** 人物的json数据 */
const props = defineProps({ json: Array });

/**json稀有等级对应边框的文件名 */
const enum1 = ["Normal", "", "Ultra"];
onMounted(() => {
  console.log(props.json); //.sort((a,b)=>{return a.Id-b.Id}) y已经按游戏顺序排好了，不用排序
});

const getfolderName = (origin) => {
  let folder = "";
  folder = origin.toLowerCase();
  if (folder.indexOf("_") != -1) {
    folder = folder.substring(0, folder.indexOf("_"));
  }
  return folder;
};
</script>
<style scoped>
@import "./css/main.css";
</style>