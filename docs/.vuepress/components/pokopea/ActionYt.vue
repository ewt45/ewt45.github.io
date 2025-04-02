<template>
    <iframe @load="onLoad" :src="'https://www.youtube.com/embed/' + video_id" title="video player" frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { ElLoading } from 'element-plus'

const prop = defineProps({
    video_id: {
        type: String,
        default: ''
    }
});

let elloading: any = null

onMounted(() => {
    //不知道为啥直接在iframe上写v-if不生效。只好挂载到dialog body上了
    elloading = ElLoading.service({ target: '.el-dialog__body' })
})

const onLoad = () => {
    elloading && elloading.close()
}

</script>