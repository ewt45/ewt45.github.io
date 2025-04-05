<template>
  <!-- 父布局是flex-grow:1 填满宽度 -->

  <div class="content-width-center toolmenu-root">
    <!-- 用space-between 使子布局一个靠左一个靠右。只能有两个子布局 -->
    <div class="titlebar">
      <el-text style="font-size: 25px;">狸猫花生</el-text>
      <ToolDarkMode />
    </div>

    <div class="content-width-center">
      <el-segmented v-model="currTool" :options="toolOptions" @change="onChange">
        <template #default="scope: { item: ToolOption }">
          <el-icon size="20" style="min-width: 30px;">
            <component :is="scope.item.icon" />
          </el-icon>
        </template>
      </el-segmented>
    </div>

    <!-- 具体的工具内容 -->
    <div class="content-width-center">
      <!-- <slot :currToolValue="currTool"></slot> -->

      <el-collapse-transition>
        <div style="height: 10px;" v-show="currTool !== 'none'"></div>
      </el-collapse-transition>

      <el-collapse-transition>
        <ToolInfoLink v-show="currTool === 'info_link'" />
      </el-collapse-transition>

      <!-- 筛选选项 -->
      <el-collapse-transition>
        <FilterOptions v-show="currTool === 'filter'" />
      </el-collapse-transition>
    </div>

    <!-- <el-space  direction="vertical" :size="10" alignment="center" fill style="margin:10px;">
      
    </el-space> -->

  </div>
  <el-space direction="vertical" :size="24" alignment="center" fill>


  </el-space>
</template>

<script setup lang="ts">
import { ToolMenuValue } from './types';
import { Link, Filter, CircleClose, } from '@element-plus/icons-vue'
import FilterOptions from './ToolFilter.vue';
import ToolInfoLink from './ToolInfoLink.vue';
import ToolDarkMode from './ToolDarkMode.vue';
type ToolOption = { label: string, value: ToolMenuValue, icon: any }

const currTool = defineModel<ToolMenuValue>({ default: 'none' })

/** 可选选项 */
const toolOptions: ToolOption[] = [
  {
    label: '外部链接',
    value: 'info_link',
    icon: Link,
  },
  {
    label: '筛选',
    value: 'filter',
    icon: Filter,
  },
  {
    label: '无',
    value: 'none',
    icon: CircleClose,
  },
]

/** 工具栏切换时 */
const onChange = (val: ToolMenuValue) => {

}

</script>
<style scoped>
@import './style.css';

.toolmenu-root>* {
  flex-grow: 1;
  width: 100%;
}

.titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px;
}

.titlebar-left {
  flex-grow: 1;
}

.titlebar-right {
  margin-left: auto;
}
</style>