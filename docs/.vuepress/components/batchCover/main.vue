<template>
  <!-- <meta name="referrer" content="no-referrer" /> -->
  <div class="bg-black">测试tw</div>
  <el-divider />
  <!-- <input type="file" webkitdirectory /> -->
  <div>1. 获取当前视频封面。请输入视频所属合集（小节）的第一个视频的bv号</div>

  <el-row>
    <!-- <el-button >获取当前视频封面</el-button> -->
    <el-input
      style="width: 150px"
      v-model="customEdit.inPutBvid"
      placeholder="bv号"
      @change="handleBvidChange"
    />
  </el-row>
  <!-- <el-row>
    <el-descriptions border :column="1">
      <el-descriptions-item label="右图路径">
        {{ customEdit.subImgSrc }}
      </el-descriptions-item>
    </el-descriptions>
  </el-row> -->
  <div>2. 上传主封面图</div>
  <el-row>
    <el-col>
      <el-upload :before-upload="handleMainImgUpload">
        <el-button>选择封面图</el-button>
      </el-upload>
    </el-col>
  </el-row>
  <div>3. 选择输出图片文件夹(未实现)</div>
  <!-- <input
    type="file"
    ref="inputDirRef"
    webkitdirectory
    @change="handleSelectDlFolder()"
  /> -->
  <!-- 封面效果预览画布 -->
  <el-row :gutter="20" align="middle">
    <el-col :span="12">
      <canvas
        style="width: 100%; border-style: solid; border-width: 1px"
        ref="canvasRef"
        :width="customEdit.fullWidth"
        :height="customEdit.fullHeight"
        class="border"
      >
        浏览器不支持canvas
      </canvas>
    </el-col>
    <!-- 封面效果调节选项 -->
    <el-col :span="12">
      <el-row>
        <!-- 两图分割位置 -->
        <el-col :span="12">
          <el-row>
            <el-col :span="6">
              <span>左图占比</span>
            </el-col>
            <el-col :span="18">
              <el-slider
                :step="0.01"
                :max="1"
                v-model="customEdit.toLeftRatio"
              />
            </el-col>
          </el-row>
        </el-col>
        <!-- 副标题宽度 -->
        <el-col :span="12">
          <el-row>
            <el-col :span="6">
              <span>副标题宽度</span>
            </el-col>
            <el-col :span="18">
              <el-slider :step="0.01" :max="1" v-model="customEdit.subTiW" />
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <!-- 图片调节 -->
      <el-row :gutter="10">
        <!-- 左图位移和缩放调节 -->
        <el-col :span="12">
          <el-row><span>左图属性</span></el-row>

          <el-row>
            <el-col :span="6">
              <span>位移x</span>
            </el-col>
            <el-col :span="18">
              <el-slider
                :min="-customEdit.fullWidth"
                :max="customEdit.fullWidth"
                v-model="customEdit.mainImgProps.off[0]"
              />
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="6">
              <span>位移y</span>
            </el-col>
            <el-col :span="18">
              <el-slider
                :min="-customEdit.fullHeight"
                :max="customEdit.fullHeight"
                v-model="customEdit.mainImgProps.off[1]"
              />
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="6">
              <span>缩放</span>
            </el-col>
            <el-col :span="18">
              <el-slider
                :max="2"
                :step="0.01"
                v-model="customEdit.mainImgProps.scale"
              />
            </el-col>
          </el-row>
        </el-col>
        <!-- 右图位移和缩放调节 -->
        <el-col :span="12">
          <el-row><span>右图属性</span></el-row>
          <el-row>
            <el-col :span="6">
              <span>位移x</span>
            </el-col>
            <el-col :span="18">
              <el-slider
                :min="-customEdit.fullWidth"
                :max="customEdit.fullWidth"
                v-model="customEdit.subImgProps.off[0]"
              />
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="6">
              <span>位移y</span>
            </el-col>
            <el-col :span="18">
              <el-slider
                :min="-customEdit.fullHeight"
                :max="customEdit.fullHeight"
                v-model="customEdit.subImgProps.off[1]"
              />
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="6">
              <span>缩放</span>
            </el-col>
            <el-col :span="18">
              <el-slider
                :max="2"
                :step="0.01"
                v-model="customEdit.subImgProps.scale"
              />
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <!-- 文本位置调节（暂未实现） -->
      <!-- 步骤按钮 -->
      <el-row>
        <!-- 选择第几个视频 -->
        <el-col :span="12">
          <!-- 这个vmodel绑定的有问题，vue提示循环响应 不知道怎么改（知道了，max值不能小于min值） -->
          <el-input-number
            v-model="customEdit.currEpisodeIndex"
            :min="0"
            :max="customEdit.epCnt >= 1 ? customEdit.epCnt - 1 : 0"
          />
        </el-col>
        <el-col :span="12">
          <el-button @click="handleDlCover">生成图片</el-button>
          <a href="" download ref="dlARef"></a>
          <a href="" ref="upARef"></a>
        </el-col>
      </el-row>
    </el-col>
  </el-row>

  <!-- 画布转图像 -->
  <img :src="c2ImgSrc" />
</template>
<script lang="ts" setup>
import { ref, reactive, computed, nextTick, watch, onMounted } from "vue";
import { ElMessage, UploadProps } from "element-plus"; //试试ts，可以引入定义好的数据类型挺好的
import fetchJsonp from "fetch-jsonp"; //它说只能用require，是怕浅拷贝修改原对象么(好吧是不能加大括号用from) 傻逼代码（对不起是我自己傻逼）
import { jsonp } from "vue-jsonp";
import axios from "axios";
import { CustomEdit, MyThrottle } from "./1";
/**画布实例 */
const canvasRef = ref<HTMLCanvasElement>();
/**用于jsonp的script标签元素实例 */
const scriptRef = ref();
/**初始新建两个image标签吧，不每次绘制都新建了,防止频繁发送请求 */
const mainImg = new Image();
const subImg = new Image();
/**canvas转换为图片后的地址 */
const c2ImgSrc = ref("");
/**当前小节视频个数 */
const epCnt = ref(0);
/**当前处理的视频分p */
let test1 = 0; //currEpIdx
/**记录编辑封面图的属性 */
const customEdit = reactive(new CustomEdit());
/**选择本地文件夹  input ref对象*/
const inputDirRef = ref();
/**用于下载图片的a标签 ref */
const dlARef = ref<HTMLAnchorElement>();
/**用于跳转到投稿界面的a标签 */
const upARef = ref<HTMLAnchorElement>();
/**用于节流，防止请求过快被ban */
const throttle = new MyThrottle();
nextTick(() => {
  let m = customEdit;
  //设置image标签no-refer 否则会403（怪了为啥第一天没403）
  mainImg.referrerPolicy = "no-referrer";
  subImg.referrerPolicy = "no-referrer";
  subImg.crossOrigin = "Anonymous"; //设置crossOrigin属性 否则包含跨域图片的画布无法转为图像
  subImg.src = "";
  // console.log("nextTick:canvas应该加载完了吧", canvasRef.value);
  let ctx = canvasRef.value.getContext("2d");

  console.log("nexttick结束");
});

/**上传封面图之后生成图片链接，显示在画布上 */
/**试试能不能自动更新画布 */

watch(customEdit, () => {
  updCanvas();
});

/**更新一次画布内容
 * promise: 往下传递m:customEdit。从then开始用async await
 * 当前promise顺序：
 *  判断是否支持canvas->左图地址是否改变->右图地址是否改变->绘制左图->绘制右图->绘制分界线及阴影->绘制文字
 *
 */
const updCanvas = () => {
  if (!canvasRef.value) return false;

  let ctx: CanvasRenderingContext2D = canvasRef.value.getContext("2d");

  //改一下promise，开头是判断currentEpisodeIndex，如果不一样修改右图在customEdit的src
  //判断当前时间间隔，符合则发送请求，否则等一会再发
  new Promise((resolve, reject) => {
    //ctx在promise首部判断一下是否存在
    if (!ctx) {
      reject("无法获取ctx，浏览器可能不支持canvas2d？");
    }
    //customEdit简写，通过resolve传递
    let m = customEdit;
    resolve(m);
  })
    //如果左图地址有变化，重新加载图片
    .then(async (m: CustomEdit) => {
      await new Promise((resolve, reject) => {
        if (m.mainImgSrc != mainImg.src) {
          mainImg.src = m.mainImgSrc;
          mainImg.onload = () => {
            resolve(m);
          };
          mainImg.onerror = () => {
            reject("左侧图加载错误"); //加载错误的话就不进行下一步了
          };
        } else {
          resolve(m);
        }
      }).catch((e) => {
        throw new Error(e);
      });
      return m;
    })
    //如果右图地址有变化，重新加载图片(注意两次请求时间间隔)
    .then(async (m: CustomEdit) => {
      if (!m.videoInfo || !m.videoInfo.ugc_season) {
        return m;
      }
      await new Promise((resolve, reject) => {
        let currVidSrc: string =
          customEdit.videoInfo.ugc_season.sections[customEdit.sectionIndex]
            .episodes[customEdit.currEpisodeIndex].arc.pic +
          "@" +
          customEdit.fullWidth +
          "w";
        // console.log(subImg.src,m.subImgSrc,currVidSrc)
        if (subImg.src != currVidSrc) {
          //如果两次请求间隔过短直接跳过
          if (!throttle.valid(1000)) {
            ElMessage.warning("切换速度过快，封面不会更新");
            return m;
          }
          subImg.src = currVidSrc;
          subImg.onload = () => {
            resolve(m);
          };
          subImg.onerror = () => {
            reject("加载右图错误");
          };
        } else {
          resolve(m);
        }
      }).catch((e) => {
        throw new Error(e);
      });

      return m; //then中返回m就能给下一个then用了
    })
    //绘制左图
    .then(async (m: CustomEdit) => {
      //试试clip(草这个裁切好用啊，比直接裁切图片省事多了(啊没法裁切多个，要用save/restore也挺麻烦，干脆不裁切了吧))
      await new Promise((resolve, reject) => {
        if (mainImg.src == "") {
          resolve(false);
        }
        //先绘制用于裁剪的圆角矩形
        drawRadiusRect(ctx, false);
        //这里用atop吧，在drawradiusrect函数里用in剪切到只剩矩形
        ctx.globalCompositeOperation = "source-atop";
        //绘制圆角矩形并设置仅重叠部分叠加，绘制完图形后再改回来
        ctx.drawImage(
          mainImg,
          m.mainImgProps.off[0],
          m.mainImgProps.off[1],
          mainImg.naturalWidth * m.mainImgProps.scale,
          mainImg.naturalHeight * m.mainImgProps.scale
        );

        ctx.globalCompositeOperation = "source-over";

        resolve(true);
      });
      return m;
    })
    //绘制右侧图
    .then(async (m: CustomEdit) => {
      await new Promise((resolve, reject) => {
        if (subImg.src == "") {
          resolve(false);
        }

        //绘制到与画布现有区域不重叠的地方,绘制在底层
        ctx.globalCompositeOperation = "destination-over";
        ctx.drawImage(
          subImg,
          m.subImgProps.off[0] + m.fullWidth * m.toLeftRatio,
          m.subImgProps.off[1],
          subImg.naturalWidth * m.subImgProps.scale,
          subImg.naturalHeight * m.subImgProps.scale
        );
        ctx.globalCompositeOperation = "source-over";
        resolve(true);
      });
      return m;
    })
    //绘制分界线阴影。之后试着改进一下看能不能只通过边界实现渐变，现在渐变宽度和透明度都和边框挂钩
    .then((m: CustomEdit) => {
      drawRadiusRect(ctx, true);
      return m;
    })
    //绘制文本标题
    .then((m: CustomEdit) => {
      if (!m.videoInfo) return false;

      ctx.textAlign = "end"; //设置文本的中心位置
      ctx.textBaseline = "middle"; //设置文本绘制的xy位置为水平中心轴

      //合集标题
      let seasonTitle = m.videoInfo.ugc_season.title;
      //小节信息 对象格式
      let section = m.videoInfo.ugc_season.sections[m.sectionIndex];
      //小节标题
      let sectionTitle = "[" + seasonTitle + "]" + section.title;
      //分p标题
      let episodeTitle = section.episodes[m.currEpisodeIndex].title;

      //设置阴影效果
      ctx.shadowColor = "#8c9fb0";
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      //绘制合集+小节标题作为第一行
      ctx.font = "bold 80px HarmonyOS Sans SC";
      //向对角移动四次作为描边(草，加了阴影之后移动出来还挺好看)
      ctx.fillStyle = "white";
      drawTextBorder(ctx, sectionTitle, m.fullWidth - 100, 200, 5);
      ctx.fillStyle = "black";
      ctx.fillText(sectionTitle, m.fullWidth - 100, 200);
      //先将分p标题裁切到合适宽度
      episodeTitle = cutTextWidth(
        ctx,
        episodeTitle,
        m.fullWidth * m.subTiW,
        ctx.font
      );
      //绘制分p标题作为第二行
      ctx.font = "bold 60px HarmonyOS Sans SC";

      //向对角移动四次作为描边
      ctx.fillStyle = "white";
      drawTextBorder(ctx, episodeTitle, m.fullWidth - 100, 320, 3);
      ctx.fillStyle = "white";
      ctx.fillText(episodeTitle, m.fullWidth - 100, 320);

      //绘制当前分p数
      let mw = ctx.measureText(episodeTitle).width;
      //beginPath会清空子路径列表。不清空的话会和那个分割线阴影连上，填充出错.不知道为啥
      //知道了，arc()是画路径，调用fill()的时候会自动调用closePath()把当前所有未封闭的路径都给封闭上
      ctx.beginPath();
      ctx.arc(m.fullWidth - mw - 100 - 70, 320, 60, 0, 360);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "black";
      ctx.fillText(
        "P" + (m.currEpisodeIndex + 1),
        m.fullWidth - mw - 100 - 70,
        320
      );
      //取消阴影样式
      ctx.shadowColor = "#00000000";
      return m;
    })
    .then(() => {
      // c2ImgSrc.value = canvasRef.value.toDataURL();
    })

    .catch((e) => {
      console.error("修改画布时异常：", e);
    });
};

/** 点击生成图片后 将canvas转为图片下载*/
const handleDlCover = () => {
  //试一下canvas画布转为图片
  c2ImgSrc.value = canvasRef.value.toDataURL();

  new Promise((resolve, reject) => {
    if (!dlARef.value) {
      reject("无法获取下载链接");
    }
    //调用点击a标签，下载图片
    dlARef.value.href = canvasRef.value.toDataURL();
    dlARef.value.download = customEdit.currEpisodeIndex + ".png";
    dlARef.value.click();
    ElMessage.success("图片已下载");
    resolve(true);
  })
    .then(() => {
      console.log("then");
      //调用点击a标签，跳转到b站投稿界面
      if (!customEdit.videoInfo || !customEdit.videoInfo.ugc_season) {
        throw new Error("未找到视频信息");
      }
      upARef.value.href =
        "https://member.bilibili.com/platform/upload/video/frame?type=edit&bvid=" +
        customEdit.videoInfo.ugc_season.sections[customEdit.sectionIndex]
          .episodes[customEdit.currEpisodeIndex].bvid;
      upARef.value.target = "_blank";
      // dlARef.value.removeAttribute('download') //移除下载标签
      console.log("点击跳转");
      upARef.value.click();
    })
    .catch((e) => {
      ElMessage.error(e.message ? e.message : e);
    });
};

/**输入bv号后获取视频信息和封面，设置到customEdit */
const handleBvidChange = (value: String) => {
  // console.log('input change:',value)
  // 不符合规范
  if (value.substring(0, 2).toLowerCase() != "bv") {
    ElMessage.error("请输入bv号");
    return false;
  }
  //axios发送请求，获取合集数据。axios没法跨域，用jsonp试试吧(插件都没法设置mimetype，先试试iframe)（原来是要加载参数里，表明是jsonp，这个得看服务器端的设置，这个接口是jsonp=jsonp 不是type）

  //草！！！连接里加上参数jsonp=jsonp就行了，之前抄的别人的type=jsonp一直没生效
  jsonp("https://api.bilibili.com/x/web-interface/view?bvid=" + value, {
    jsonp: "jsonp",
  })
    .then((res) => {
      //保存视频信息
      customEdit.videoInfo = res.data;
    })
    .then(() => {
      //获取视频所在合集的小节
      //没有合集的话返回0
      if (!customEdit.videoInfo || !customEdit.videoInfo.ugc_season) {
        customEdit.sectionIndex = -1;
        customEdit.epCnt = 0;
        return 0;
      }
      //有合集的话先找到视频所属小节
      let sections = customEdit.videoInfo.ugc_season.sections;
      let sectionIndex = 0; //当前视频所属小节序号
      //每个小节里，查找所有分p，如果和当前bv号匹配则退出循环
      for (; sectionIndex < sections.length; sectionIndex++) {
        if (
          sections[sectionIndex].episodes.some((value) => {
            return value.bvid == customEdit.inPutBvid ? true : false;
          })
        ) {
          // console.log("找到视频所属小节：", sectionIndex);
          break;
        }
      }
      //拿到视频所属小节序号了
      customEdit.sectionIndex = sectionIndex; //小节在合集中的序号
      customEdit.currEpisodeIndex = 0; //当前处理的分p序号
      customEdit.epCnt = sections[sectionIndex].episodes.length; //小节总分p数
    })
    .catch((e) => console.log(e));
};

/**修改副标题的宽度
 * @params ctx 画布ctx
 * @params input 完整副标题
 * @params limit 限制最大宽度
 * @params style 要绘制的字体样式
 */
const cutTextWidth = (
  ctx: CanvasRenderingContext2D,
  input: string,
  limit: number,
  style: string
) => {
  ctx.save();
  let output = input;
  //测量现有宽度
  ctx.font = style;
  //如果限制宽度过窄
  if (ctx.measureText("...").width > limit) {
    output = "...";
  } else {
    let subTimes = 0;
    while (ctx.measureText(output).width > limit) {
      if (subTimes == 0) {
        output = output + "...";
      }
      output = output.substring(0, output.length - 4) + "...";
      subTimes++;
    }
  }

  ctx.restore();
  return output;
};

/**canvas绘制四角白色边框
 * @params ctx 画布ctx
 * @params str 要绘制的文字
 * @params x 绘制坐标x
 * @params y 绘制坐标y
 * @params size 边框宽度
 */
const drawTextBorder = (
  ctx: CanvasRenderingContext2D,
  str: string,
  x: number,
  y: number,
  size: number
) => {
  ctx.save();
  ctx.fillStyle = "white";

  // 先添加一个右下角的阴影
  ctx.shadowColor = "#00000084";
  ctx.fillText(str, x + size, y + size);
  ctx.shadowColor = "#00000000";
  //移动填充吧
  for (let offx = -size; offx <= size; offx++) {
    for (let offy = -size; offy <= size; offy++) {
      ctx.fillText(str, x + offx, y + offy);
    }
  }
  ctx.restore();
};

/**绘制左图的圆角矩形 */
const drawRadiusRect = (ctx: CanvasRenderingContext2D, stroke: boolean) => {
  // ctx.restore() //先恢复设置到初始状态？
  // console.log("画圆角矩形进入");
  const radius = 70;
  let m = customEdit;

  ctx.beginPath();
  ctx.moveTo(stroke ? m.fullWidth * m.toLeftRatio : 0, 0);
  ctx.lineTo(m.fullWidth * m.toLeftRatio, 0);
  ctx.quadraticCurveTo(
    m.fullWidth * m.toLeftRatio + radius,
    0,
    m.fullWidth * m.toLeftRatio + radius,
    radius
  ); //画二次贝叶斯曲线，第一个坐标是直角的坐标，第二个是目标位置
  // ctx.lineTo(m.fullWidth * m.toLeftRatio,radius)
  ctx.lineTo(m.fullWidth * m.toLeftRatio + radius, m.fullHeight - radius);
  ctx.quadraticCurveTo(
    m.fullWidth * m.toLeftRatio + radius,
    m.fullHeight,
    m.fullWidth * m.toLeftRatio,
    m.fullHeight
  );
  if (!stroke) {
    ctx.lineTo(0, m.fullHeight);
    ctx.lineTo(0, 0);
  }

  ctx.globalCompositeOperation = "source-over";

  //非stroke用于裁切圆角，stroke用于仅绘制阴影
  if (!stroke) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, m.fullWidth, m.fullHeight);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  } else {
    ctx.shadowColor = "black"; //"rgba(0,0,0,0.75)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 5;
    ctx.strokeStyle = "#000000a0";
    ctx.lineWidth = 15;
    ctx.stroke();

    ctx.shadowColor = "#00000000"; //阴影颜色调为透明就不会被绘制
  }
  //调回默认设置
  // ctx.restore();

  // console.log("画圆角矩形结束");
};

//给要裁切的两张图片设置一下属性，然后compute 自动更新canvas？
const handleMainImgUpload: UploadProps["beforeUpload"] = (file) => {
  customEdit.mainImgSrc = URL.createObjectURL(file);
  return false;
};

/**选择要保存到的本地文件夹 */
const handleSelectDlFolder = (event) => {
  console.log("onchange:", inputDirRef.value.files);
};
</script>


<style scoped>
/* @tailwind base;

@tailwind components;
@tailwind utilities; */

/* @import 'element-plus/dist/index.css'; */
</style>

<!-- 原customEdit直接声明的对象格式 -->
<!-- {
  /**全图宽 */
  fullWidth: 1280,
  /**16:10的全图高 */
  fullHeight: 800,
  /**16:9的全图高 */
  fullHeightShort: 720,
  /**左侧图占全图的比例 */
  toLeftRatio: 0.3,
  /**主图url */
  mainImgSrc: "",
  /**分p图url */
  subImgSrc: "",
  /**要修改的合集的第一个视频的bv号 */
  bvid: "",
  /**获取到的视频信息 */
  videoInfo: null,
  /**主图缩放和位移信息 */
  mainImgProps: {
    /**以左上角为原点的x和y偏移值 */
    off: [0, 0],
    /**缩放倍率 */
    scale: 1,
  },
  /**分p图缩放和位移信息 */
  subImgProps: {
    /**以左上角为原点的x和y偏移值 */
    off: [0, 0],
    /**缩放倍率 */
    scale: 1,
  },
  /**文本 */
  titleText: "[幕后花絮] 坏蛋联盟",
  subTitleText: "Maraschino Ruby",
  /**副标题宽度占画布宽度百分比 */
  subTiW: 0.7,
} -->

<!-- 线性渐变 -->
    <!-- // .then(() => {
    //   return new Promise((resolve, reject) => {
    //     //再做个渐变当做左图阴影
    //     let m = customEdit;
    //     let gradient = ctx.createLinearGradient(
    //       m.fullWidth * m.toLeftRatio,
    //       0,
    //       m.fullWidth * (m.toLeftRatio + 0.02),
    //       0
    //     );
    //     gradient.addColorStop(0, "black");
    //     gradient.addColorStop(1, "#00000000");
    //     ctx.fillStyle = gradient;
    //     ctx.fillRect(
    //       m.fullWidth * m.toLeftRatio,
    //       0,
    //       m.fullWidth * 0.02,
    //       m.fullHeight
    //     );
    //     resolve(true);
    //   });
    // }) -->

<!-- // //添加矩形背景 -->
<!-- 
        // //添加矩形背景
        // ctx.fillStyle = "white";
        // ctx.font = "80px HarmonyOS Sans SC";
        // let titleWidth = ctx.measureText(
        //   seasonTitle + " " + sectionTitle
        // ).width;
        // ctx.fillRect(
        //   customEdit.fullWidth - 100 - titleWidth - 10,
        //   200 - 10,
        //   titleWidth + 20,
        //   80 + 20
        // );
        // ctx.font = "60px HarmonyOS Sans SC";
        // titleWidth = ctx.measureText(episodeTitle).width;
        // ctx.fillRect(
        //   customEdit.fullWidth - 100 - titleWidth - 10,
        //   320 - 10,
        //   titleWidth + 20,
        //   60 + 20
        // ); -->

<!-- 原裁切图片方法，通过drawimage裁切，算起来非常费劲 -->
<!-- .then(() => {
      //绘制左侧图
      return new Promise((resolve, reject) => {
        if (customEdit.mainImgSrc != "") {
          mainImg.src = customEdit.mainImgSrc;
          mainImg.onerror = () => {
            //加载错误的话就不进行下一步了
            reject("左侧图加载错误");
          };
          mainImg.onload = () => {
            let sx, sy, sw, sh, x, y, w, h;
            //起始位置x固定为0
            x = 0;
            y = 0 + customEdit.mainImgProps.off[1];
            //裁切起点应该可以是负数
            sx = 0 - customEdit.mainImgProps.off[0];
            sy = 0;
            // 裁切宽度为左图宽，如果有缩放就除以缩放倍率
            sw =
              (customEdit.fullWidth * customEdit.toLeftRatio) /
              customEdit.mainImgProps.scale;

            sh = (customEdit.fullHeight - y) / customEdit.mainImgProps.scale; //纵向应该不需要裁切(好吧加上缩放也要裁切，画布高-偏移y的值除以缩放倍率)

            //计算缩放(啊原来缩放要在裁切那里计算才能铺满屏幕)
            w = sw * customEdit.mainImgProps.scale;
            h = sh * customEdit.mainImgProps.scale;
            //糟了，这个缩放是裁切后的缩放，那就不要了吧(不写还不行。。那就直接写两遍sw和sh)
            ctx.drawImage(mainImg, sx, sy, sw, sh, x, y, w, h);
            // console.log(x,y)
            resolve(true);
          };
        }
      });
    })

    .then((res) => {
      return new Promise((resolve, reject) => {
        //绘制右侧图

        if (customEdit.subImgSrc != "") {
          //要加这个禁止传来源否则获取图片会403
          subImg.referrerPolicy = "no-referrer";
          subImg.src = customEdit.subImgSrc;
          subImg.onerror = () => {
            reject("右侧图加载错误");
          };
          subImg.onload = () => {
            let sx, sy, sw, sh, x, y, w, h;
            //起始位置加上偏移值
            x =
              customEdit.fullWidth * customEdit.toLeftRatio +
              (customEdit.subImgProps.off[0] > 0
                ? customEdit.subImgProps.off[0]
                : 0);
            y = 0 + customEdit.subImgProps.off[1];
            //裁切先以左上角为原点吧(超出画框可以省略不裁)
            sx = 0 - customEdit.subImgProps.off[0];
            sy = 0;
            // 裁的宽度=画布右图宽 缩放的话再除以一个缩放倍率
            sw =
              (customEdit.fullWidth * (1 - customEdit.toLeftRatio)) /
              customEdit.subImgProps.scale;

            sh = (customEdit.fullHeight - y) / customEdit.subImgProps.scale;

            //计算缩放，以裁切宽高为基准(啊原来缩放要在裁切那里计算才能铺满屏幕)
            w = sw * customEdit.subImgProps.scale;
            h = sh * customEdit.subImgProps.scale;

            ctx.drawImage(subImg, sx, sy, sw, sh, x, y, w, h);
            resolve(true);
          };
        } else {
          resolve(true);
        }
      });
    }) -->