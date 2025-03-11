<template>
  <h1>{{ msg }}</h1>
  <el-input v-model="msg" />

  <p>
    <el-icon color="var(--el-color-primary)">
      <ElementPlus />
    </el-icon>
    Element Plus {{ epVersion }} + Vue {{ vueVersion }}
  </p>


  <div>
    <div>
      外部链接：
      <el-link href="https://zh.moegirl.org.cn/甲贺流忍者Ponpoko" target="_blank">萌娘百科: 甲贺流忍者Ponpoko</el-link>
      <el-link href="https://youtube.com/@pokopea" target="_blank">YouTube: ぽんぽこちゃんねる</el-link>
    </div>
    <div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ElementPlus } from '@element-plus/icons-vue'
import { version as epVersion } from 'element-plus'
import { onMounted, ref, version as vueVersion } from 'vue'

const msg = ref('Hello World!')
onMounted(() => {
  // document.querySelectorAll("link[rel='stylesheet']").forEach((link) => link.remove());
  // document.querySelectorAll("style").forEach((style) => style.remove());
});
</script>


<style scoped>
.el-link {
  margin-right: 8px;
}

.el-link .el-icon--right.el-icon {
  vertical-align: text-bottom;
}
</style>