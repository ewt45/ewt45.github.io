<template>
  <el-dialog v-model="visible" class="ppk-action-dialog" fullscreen destroy-on-close>
    <slot></slot>
  </el-dialog>
</template>

<script setup lang="ts">

//定义一个双向绑定数据，别的组件引用自己的时候 v-model: 值。这里不能用prop定义因为prop只能读不能写
const visible = defineModel<Boolean>({ required: true, default: false, })
</script>

<!-- 在 SFC 文件中使用对话框，scope 样式不会生效。
 https://github.com/element-plus/element-plus/issues/10515
 所以这部分写成全局样式 -->
<style>
/* 点击卡片按钮后显示的弹窗 */
.ppk-action-dialog {
  display: flex;
  flex-direction: column;
}

.ppk-action-dialog .el-dialog__header {
  /* 确保高度不受下面挤压 */
  flex-shrink: 0;
  margin-bottom: 20px;

}


.ppk-action-dialog .el-dialog__body {
  /* 占据剩余空间 */
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* 播放器占满屏幕剩余宽高。
此方法需要iframe的父布局是display: flex。本vue内只能设置body为flex
如果子组件中dialog不是直接在template下则需要手动将其父布局设置为flex 
*/
.ppk-action-dialog iframe {
  /* 填满宽度。iframe宽高比无所谓，内部视频元素会自动按比例缩放 */
  width: 100%;
  height: auto;
  /** 父布局为flex且竖向排列，则flex-grow:1 会填满剩余高度 */
  flex-grow: 1;
  margin: auto;
}
</style>