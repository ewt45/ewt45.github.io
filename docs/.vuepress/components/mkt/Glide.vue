<template>
    <div>滑翔翼.vue</div>
    <div>{{props.json}}</div>
</template>


<script setup>

/** 人物的json数据 */
const props = defineProps({json:Array})

</script>
<style scoped>
@import "./css/main.css";
</style>