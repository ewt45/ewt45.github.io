<template>
  <!-- 防止还没获取数据时渲染出错 -->
  <template
    v-if="!mainJson || userOwn.drivers.length == 0 || !userOwn.drivers[0].Key"
  >
    <el-row>
      <div>数据加载中。。。</div>
    </el-row>
  </template>
  <template v-else>
    <!-- 导入和导出按钮 -->
    <el-row>
      <el-col :span="5">
        <el-button @click="clickExport">导出</el-button>
      </el-col>
      <el-col :span="5">
        <el-upload :before-upload="clickImport">
          <el-button>导入</el-button>
        </el-upload>
      </el-col>
    </el-row>

    <!-- 人伞车数据显示 -->
    <el-collapse v-model="collapseName">
      <el-collapse-item title="人">
        <el-button @click="clickQueryDrivers('drivers')">查询</el-button>
        <!-- <img
          v-if="userOwn.queryData.drivers.length > 0"
          :src="getImgSrcByKey(userOwn.queryData.drivers[0].Key, 'drivers')"
        /> -->
        <!-- 显示查询结果未拥有的哪个覆盖最多 -->
        <template v-if="userOwn.queryData.drivers.cards.length > 0">
          <!-- 图片信息 -->
          <el-row>
            <el-col
              v-for="(item, index) in userOwn.queryData.drivers.cards"
              :span="4"
            >
              <el-card v-if="index < 6">
                <img :src="getImgSrcByKey(item.Key, 'drivers')" />
                <!-- src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png" -->
                <div style="padding: 14px">
                  {{ item.Translation }}
                  <br />
                  新增图数:{{ item.UnCovered.length }}
                </div>
              </el-card>
            </el-col>
          </el-row>
          <!-- 文字信息 -->
          <h3>全部未拥有卡片信息</h3>
          <el-row
            v-for="item in userOwn.queryData.drivers.cards"
            :key="item.Key"
            >{{ item }}</el-row
          >
          <h3>全部未覆盖赛道信息</h3>
          <el-row
            v-for="item in Array.from(userOwn.queryData.drivers.courses).sort()"
            >{{ item }}</el-row
          >
          <!-- <img :src="getImgSrcByKey(item.Key, 'drivers')" /> -->
        </template>
        <!-- 已拥有的数据填写 -->
        <h3>全部卡牌等级信息</h3>
        <template v-for="(item, index) in mainJson.drivers" :key="item.Key">
          <el-row>
            <el-col :span="12">
              {{ item.Translations.CNzh }}
            </el-col>
            <el-col :span="12">
              <el-input-number
                :min="0"
                :max="8"
                v-model="userOwn.drivers[index].Level"
              />
            </el-col>
          </el-row>
        </template>
      </el-collapse-item>

      <el-collapse-item title="伞">
        <el-button @click="clickQueryDrivers('gliders')">查询</el-button>
        <!-- 显示查询结果未拥有的哪个覆盖最多 -->
        <template v-if="userOwn.queryData.gliders.cards.length > 0">
          <el-row>
            <!-- 图片信息 -->
            <el-col
              v-for="(item, index) in userOwn.queryData.gliders.cards"
              :span="4"
            >
              <el-card v-if="index < 6">
                <img :src="getImgSrcByKey(item.Key, 'gliders')" />
                <!-- src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png" -->
                <div style="padding: 14px">
                  {{ item.Translation }}
                  <br />
                  新增图数:{{ item.UnCovered.length }}
                </div>
              </el-card>
            </el-col>
          </el-row>
          <!-- 文字信息 -->
          <h3>全部未拥有卡片信息</h3>
          <el-row
            v-for="item in userOwn.queryData.gliders.cards"
            :key="item.Key"
            >{{ item }}</el-row
          >
          <h3>全部未覆盖赛道信息</h3>
          <el-row
            v-for="item in Array.from(userOwn.queryData.gliders.courses).sort()"
            >{{ item }}</el-row
          >
          <!-- <img :src="getImgSrcByKey(item.Key, 'drivers')" /> -->
        </template>
        <!-- 已拥有的数据填写 -->
        <h3>全部卡牌等级信息</h3>
        <template v-for="(item, index) in mainJson.gliders" :key="item.Key">
          <el-row>
            <el-col :span="12">
              {{ item.Translations.CNzh }}
            </el-col>
            <el-col :span="12">
              <el-input-number
                :min="0"
                :max="8"
                v-model="userOwn.gliders[index].Level"
              />
            </el-col>
          </el-row>
        </template>
      </el-collapse-item>
      <el-collapse-item title="车">
        <el-button @click="clickQueryDrivers('karts')">查询</el-button>
        <!-- 显示查询结果未拥有的哪个覆盖最多 -->
        <template v-if="userOwn.queryData.karts.cards.length > 0">
          <el-row>
            <!-- 图片信息 -->
            <el-col
              v-for="(item, index) in userOwn.queryData.karts.cards"
              :span="4"
            >
              <el-card v-if="index < 6">
                <img :src="getImgSrcByKey(item.Key, 'karts')" />
                <!-- src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png" -->
                <div style="padding: 14px">
                  {{ item.Translation }}
                  <br />
                  新增图数:{{ item.UnCovered.length }}
                </div>
              </el-card>
            </el-col>
          </el-row>
          <!-- 文字信息 -->
          <h3>全部未拥有卡片信息</h3>
          <el-row
            v-for="item in userOwn.queryData.karts.cards"
            :key="item.Key"
            >{{ item }}</el-row
          >
          <h3>全部未覆盖赛道信息</h3>
          <el-row
            v-for="item in Array.from(userOwn.queryData.karts.courses).sort()"
            >{{ item }}</el-row
          >
          <!-- <img :src="getImgSrcByKey(item.Key, 'drivers')" /> -->
        </template>
        <!-- 已拥有的数据填写 -->
        <h3>全部卡牌等级信息</h3>

        <!-- 已拥有的数据填写 -->
        <template v-for="(item, index) in mainJson.karts" :key="item.Key">
          <el-row>
            <el-col :span="12">
              {{ item.Translations.CNzh }}
            </el-col>
            <el-col :span="12">
              <el-input-number
                :min="0"
                :max="8"
                v-model="userOwn.karts[index].Level"
              />
            </el-col>
          </el-row>
        </template>
      </el-collapse-item>
    </el-collapse>
  </template>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref, reactive } from "vue";
import axios from "axios";
import { UserOwn, MKTAllData, queryedData } from "./hold";
import FileSaver from "file-saver";
import { UploadRawFile } from "element-plus";
import { file } from "@babel/types";
/**数据json courses,drivers,gliders,karts,skills,tour*/
const mainJson = ref<MKTAllData>(); //reactive之后再说
const userOwn = reactive<UserOwn>(new UserOwn());
/**获取数据json，貌似只能用axios， */
onBeforeMount(async () => {
  mainJson.value = await getMainJson();

  //设置用户已有卡牌
  for (let i = 0; i < mainJson.value.drivers.length; i++) {
    userOwn.drivers.push({ Key: mainJson.value.drivers[i].Key, Level: 0 });
  }
  for (let i = 0; i < mainJson.value.gliders.length; i++) {
    userOwn.gliders.push({ Key: mainJson.value.gliders[i].Key, Level: 0 });
  }
  for (let i = 0; i < mainJson.value.karts.length; i++) {
    userOwn.karts.push({ Key: mainJson.value.karts[i].Key, Level: 0 });
  }

  console.log("onbeforemount", mainJson.value, userOwn);
});

/**改成同步函数 获取json试试 */
const getMainJson = () => {
  return new Promise<MKTAllData>((resolve, reject) => {
    axios
      .get("/mkt/data/alldata.json")
      .then((res) => {
        // mainJson.value = res.data;
        // console.log(res.data);
        resolve(res.data);
      })
      .catch((e) => {
        console.log("获取json失败", e);
      });
  });
};
/**用于标记折叠列表折叠或展开的数组 */
const collapseName = ref(["1"]);

/**点击导出用户已填入的数据 */
const clickExport = () => {
  let data = JSON.stringify(userOwn);
  let blob = new Blob([data], { type: "application/json" });
  FileSaver.saveAs(blob, `config.json`);
};
/**点击导入用户的已有数据 */
const clickImport = (files: UploadRawFile) => {
  files.text().then((str: string) => {
    //获取新数据
    console.log("导入文件：", str);
    let userOwnNew: UserOwn = JSON.parse(str);

    userOwn.drivers.forEach((item) => {
      let ifFind = userOwnNew.drivers.find((value) =>
        value.Key == item.Key ? true : false
      );
      item.Level = ifFind ? ifFind.Level : 0;
      if(!ifFind) console.log("该卡牌等级未记录，记为0："+item.Key)
    });
    userOwn.gliders.forEach((item) => {
      let ifFind = userOwnNew.gliders.find((value) =>
        value.Key == item.Key ? true : false
      );
      item.Level = ifFind ? ifFind.Level : 0;
      if(!ifFind) console.log("该卡牌等级未记录，记为0："+item.Key)
    });
    userOwn.karts.forEach((item) => {
      let ifFind = userOwnNew.karts.find((value) =>
        value.Key == item.Key ? true : false
      );
      item.Level = ifFind ? ifFind.Level : 0;
      if(!ifFind) console.log("该卡牌等级未记录，记为0："+item.Key)
    });

    // for (let i = 0; i < userOwn.karts.length; i++) {
    //   userOwn.karts[i].Level = userOwnNew.karts.find((value) => {
    //     return value.Key == userOwn.karts[i].Key ? true : false;
    //   })?.Level;
    // }
  });
  // let reader = new FileReader();
  // reader.readAsText(files);
  // reader.onload = (e:ProgressEvent<FileReader>)=>{
  //     console.log("导入文件：",e.target.result);
  // }

  return false;
};

const clickQueryDrivers = (type: string) => {
  if (type != "drivers" && type != "gliders" && type != "karts") {
    console.log("无效查询类型");
    return;
  }
  let coverdCourseSet = new Set<string>(); //已覆盖的三级赛道
  let darkCardArr = new queryedData(); //未拥有的人物
  if (!mainJson.value || !userOwn) return;

  let jsonData = mainJson.value[type];

  //获取已覆盖的三级赛道和未拥有的人物
  for (let i = 0; i < jsonData.length; i++) {
    //如果用户未填写该卡牌等级或未拥有，跳过
    if (!userOwn[type][i] || userOwn[type][i].Level == 0) {
      continue;
    }
    //如果用户已拥有该卡牌, 将已覆盖赛道添加到set
    //三级，没有等级限制的直接加入
    jsonData[i].CourseMoreGoodAtDetail.forEach((e) => {
      coverdCourseSet.add(e);
    });
    //二级但满足等级要求可以升到三级的，看到没到等级
    jsonData[i].CourseGoodAtDetail.forEach((o) => {
      if (o.PromotionLevel > 0 && o.PromotionLevel <= userOwn[type][i].Level) {
        coverdCourseSet.add(o.Key);
      }
    });
  }
  //一个未拥有的人物，所有的三级赛道减去已覆盖的三级赛道（减去需要提升等级才解锁的三级赛道），剩下的赛道就是该人物购买后即可覆盖的赛道数
  for (let i = 0; i < jsonData.length; i++) {
    //找未拥有的人物
    if (userOwn[type][i] && userOwn[type][i].Level > 0) continue;
    //忽略掉二级需要等级要求可以升到三级的那些赛道吧）
    let countNewCover = new Array<string>(); //计算购买后新覆盖赛道数
    jsonData[i].CourseMoreGoodAtDetail.forEach((str) => {
      if (!coverdCourseSet.has(str)) {
        countNewCover.push(mainJson.value?.courses[str].Translations.CNzh); //该人物新覆盖的赛道
        darkCardArr.courses.add(mainJson.value?.courses[str].Translations.CNzh); //当前所有未覆盖的赛道
      }
    });
    //加入未拥有人物的数组
    darkCardArr.cards.push({
      Key: jsonData[i].Key,
      UnCovered: countNewCover,
      Translation: jsonData[i].Translations.CNzh,
    });
  }

  //根据覆盖赛道数排序
  darkCardArr.cards.sort((a, b) => {
    return b.UnCovered.length - a.UnCovered.length;
  });

  // console.log("排序后结果", darkCardArr.slice(0, 10));
  userOwn.queryData[type] = darkCardArr;
};

/** 在数组中找出包含该key的对应元素的下标 */
const getIndexFromKey = (key: string, type: string) => {
  return userOwn[type].findIndex((value) => {
    if (value.Key == key) return true;
    else return false;
  });
};

/** 根据名字 ，获取图片地址 */
const getImgSrcByKey = (key: string, type: string): string => {
  let returnStr = "";
  if (type == "drivers") {
    let one = mainJson.value?.drivers.find((value) => {
      return value.Key == key ? true : false;
    });
    returnStr =
      "https://www.mkttoolbox.com/cm/showfiles.php/textures/saved/" +
      one?.Name +
      "WholeBody.png";
  } else if (type == "gliders") {
    let one = mainJson.value?.gliders.find((value) => {
      return value.Key == key ? true : false;
    });
    returnStr =
      "https://www.mkttoolbox.com/cm/showfiles.php/textures/saved/" +
      one?.Name +
      "_Small.png";
  } else if (type == "karts") {
    let one = mainJson.value?.karts.find((value) => {
      return value.Key == key ? true : false;
    });
    returnStr =
      "https://www.mkttoolbox.com/cm/showfiles.php/textures/saved/Machine_" +
      one?.Key.slice(4, 9) +
      "_Small.png";
  }

  return returnStr;
};
</script>


