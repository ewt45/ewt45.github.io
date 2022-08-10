<template>
  <el-upload :before-upload="handleMainImgUpload">
    <el-button>选择封面图</el-button>
  </el-upload>
  <canvas
    style="border-style: solid; border-width: 1px"
    ref="canvasRef"
    :width="200"
    :height="200"
  >
    浏览器不支持canvas
  </canvas>
</template>
<script lang='ts' setup>
import { ref, nextTick } from "vue";
const canvasRef = ref<HTMLCanvasElement>();
const mainImg = new Image();
nextTick(() => {
  if (!canvasRef.value) return false;
  let ctx = canvasRef.value.getContext("2d");
  if (!ctx) return false;
  // ctx.font = "bold 30px HarmonyOS Sans SC";
  // ctx.fillStyle = "white";
  // ctx.shadowColor='aqua';
  // ctx.shadowOffsetX = 3;
  // ctx.shadowOffsetY=3;
  // ctx.shadowBlur=4;

  ctx.fillStyle='black'
  someOption(ctx)
  ctx.fillRect(0,0,100,100)

  
});

const someOption=(ctx: CanvasRenderingContext2D)=>{
  // ctx.save()
  ctx.fillStyle = 'blue'
  ctx.fillRect(100,100,30,30)
  // ctx.restore()
}
const handleMainImgUpload = (file: File) => {
  mainImg.src = URL.createObjectURL(file);
  let ctx = canvasRef.value.getContext("2d");
  mainImg.onload = ()=>{
    ctx.drawImage(mainImg,100,0,100,100);
    ctx.drawImage(mainImg,0,0,200,200,0,0,100,100);
  }
  return false;
};

const text = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  ctx.font = "bold 30px HarmonyOS Sans SC";
  ctx.textAlign = "end";
  ctx.textBaseline = "hanging";
  ctx.fillStyle = "#234554";
  ctx.fillText("文本1", 200, 0);
  ctx.restore();
};

const path = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(40, 40);
  ctx.lineTo(20, 80);
  ctx.stroke();
  ctx.restore();
};

const arc = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  ctx.arc(50, 50, 20, 0, 360);
  ctx.fillStyle = "blue";
  ctx.fill();
  ctx.restore();
};

const gradientRect = (ctx: CanvasRenderingContext2D) => {
  let gradient = ctx.createLinearGradient(100, 0, 150, 0);
  gradient.addColorStop(0, "black");
  gradient.addColorStop(1, "#00000000");
  ctx.fillStyle = gradient;
  ctx.fillRect(100, 0, 150, 200);
};

const drawTextBorder = (
  ctx: CanvasRenderingContext2D,
  str: string,
  x: number,
  y: number,
  size: number
) => {
  ctx.save();
  ctx.fillStyle = "aqua";

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
</script>