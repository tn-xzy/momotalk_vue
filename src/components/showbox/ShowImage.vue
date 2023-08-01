<script setup>
import {useOverScreenBox} from "@/views/index/store/stores.js";

const show=useOverScreenBox()
const imgurl=show.params
</script>

<template>
<vue-easy-lightbox :visible="true" :imgs="imgurl" @hide="show.closeOverScreenBox()">
</vue-easy-lightbox>
</template>

<style scoped lang="scss">
.img-box{
  max-height: 90vh;
  max-width: 90vw;
  overflow: auto;
}
</style>