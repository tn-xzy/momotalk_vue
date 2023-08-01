<template>
  <div class="message-text" v-if="message.type!=='system'"
       :style="self===message.sender?'flex-direction: row-reverse;':''">
    <div class="avatar-box">
      <el-avatar v-if="!message.avatar">
        {{ message.sender.charAt(0) }}
      </el-avatar>
    </div>
    <div class="message-box">
      <div class="message-top" :style="self===message.sender?'flex-direction: row-reverse;':''">
        <span>{{ message.sender }}</span>
        <span v-if="false">{{ time }}</span>
      </div>
      <div class="message-content" v-if="message.type==='text'">
        {{ message.content }}
      </div>
      <div class="message-content" v-if="message.type==='img'">
        <el-image :src="apiPrefix+message.content" style="height: 30vw;cursor: pointer;" loading="lazy" @click="show.openOverScreenBoxWithParams(ShowImage,apiPrefix+message.content)"></el-image>
      </div>
    </div>
  </div>
  <div class="message-system" v-if="message.type==='system'">
    <span class="message-text">{{ message.content }}</span>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import {reactive, ref, onMounted, computed} from "vue";
import {useGroup, useOverScreenBox} from "@/views/index/store/stores.js";
import ShowImage from "@/components/showbox/ShowImage.vue";

const apiPrefix = import.meta.env.VITE_API_URL
const group = useGroup()
const self = group.self
console.log("self", group.self)
const props = defineProps(['message'])
const message = props.message
const show=useOverScreenBox()

const time = computed(() => {
  let uid = BigInt(message.uid)
  let timeOffset = uid >> 31n;
  let time = dayjs("2016-09-20", "YYYY-MM-DD").unix()
  time += Number(timeOffset)
  return dayjs.unix(time).format("HH:mm")
})
</script>

<style lang="scss" scoped>
.message-text {

  display: flex;
  //flex-direction: row-reverse;
  .avatar-box {

  }

  .message-box {
    margin: 0 10px;
    display: flex;
    flex-direction: column;

    .message-top {
      display: flex;
      justify-content: space-between;
    }

    .message-content {
      padding: 10px;
      margin-top: 5px;
      border-radius: 10px;
      //box-shadow: var(--el-box-shadow-light);
      background: rgb(102, 104, 104);
      color: white;
      word-wrap: break-word;
      word-break: break-all;
      white-space: pre-wrap;
    }
  }
}

.message-system {
  display: flex;
  justify-content: center;
  align-items: center;


  .message-text {
    padding: 5px;
    margin: 5px;
    background: #d3d3d3;
    border-radius: 10px;
  }
}
</style>