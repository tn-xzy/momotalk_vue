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
        <el-icon v-if="message.sending" class="is-loading"><Loading /></el-icon>{{ message.content.text }}
      </div>
      <div class="message-image" v-else-if="message.type==='img'">
        <el-image v-if="message.content.imgPath!==undefined&&!message.content.imgPath.startsWith('blob')" :src="apiPrefix+message.content.imgPath" style="height: 30vw;cursor: pointer;" loading="lazy" @click="show.openOverScreenBoxWithParams(ShowImage,apiPrefix+message.content.imgPath)"></el-image>
        <el-image v-else :src="message.content.imgPath" style="height: 30vw;cursor: pointer;" loading="lazy" @click="show.openOverScreenBoxWithParams(ShowImage,message.content.imgPath)"></el-image>
      </div>
      <div class="message-content message-file" v-else-if="message.type==='file'">
        <div class="message-file-button">
          <el-icon :size="24" color="#409EFC" @click="courseDownload(apiPrefix+message.content.filepath,message.content.filename)"><Bottom /></el-icon>
        </div>
        <div class="message-file-info">
          <span class="message-file-info-name">{{ message.content.filename }}</span>
          <span>{{ message.content.size+" "+message.content.unit }}</span>
        </div>

      </div>
      <div style="margin: 0 10px">
        <el-progress v-if="props.progress!==undefined&& props.progress<100" :percentage="props.progress" />
      </div>
    </div>
  </div>
  <div class="message-system" v-if="message.type==='system'">
    <span class="message-text">{{ message.content }}</span>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import {reactive, ref, onMounted, computed, watch} from "vue";
import {useGroup, useOverScreenBox} from "@/views/index/store/stores.js";
import ShowImage from "@/components/showbox/ShowImage.vue";
import courseDownload from "@/utils/File.js";

const apiPrefix = import.meta.env.VITE_API_URL
const group = useGroup()
const self = group.self
console.log("self", group.self)
const props = defineProps(['message','progress'])
const message = props.message
const show=useOverScreenBox()

const time = computed(() => {
  let uid = BigInt(message.uid)
  let timeOffset = uid >> 31n;
  let time = dayjs("2016-09-20", "YYYY-MM-DD").unix()
  time += Number(timeOffset)
  return dayjs.unix(time).format("HH:mm")
})
watch(() => props.progress, (newP, oldP) => {
  console.debug(newP,oldP)
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
      display: flex;
      align-items: center;
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
    .message-file{
      display: flex;
      align-items: center;
      .message-file-button{
        width: 40px;
        height: 40px;
        background: white;
        border-radius: 50%;
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 10px;
        cursor: pointer;
      }
      .message-file-info{
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        width: 100%; /* 容器宽度 */
        //white-space: nowrap; /* 强制文本在一行显示 */
        overflow: hidden; /* 隐藏超出容器范围的文本 */
        -o-text-overflow: ellipsis;
        //.message-file-info-name{
        //
        //}
      }
    }
    .message-image{
      border-radius: 10px;
      overflow: hidden;
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