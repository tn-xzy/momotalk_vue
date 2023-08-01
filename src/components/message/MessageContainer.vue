<template>
  <div class="m-container">
    <div class="message-top">
      <el-button :icon="Back" text @click="group.change(undefined)"></el-button>
      <div>
        <div v-if="connecting">连接中{{ connecting }}</div>
        <div v-else>{{ group.groupName }}</div>
      </div>
      <div>2</div>
    </div>
    <div class="message-list" ref="messageListBox" @scroll="scrollLoad">
      <MessageItem v-for="message in messageList" :key="message.uid" :message="message"></MessageItem>
    </div>
    <div class="send-box">
      <el-button @click="sendPic" :icon="PictureFilled" text></el-button>
      <el-input v-model="message.content" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }"></el-input>
      <input type="file" ref="fileBox" @change="uploadFile" hidden>
      <el-button @click="sendMessage" :icon="Promotion" text :disabled="!message.content"></el-button>
    </div>

  </div>
</template>

<script setup>
import MessageItem from "@/components/message/MessageItem.vue";
import SockJS from 'sockjs-client/dist/sockjs.min.js';
import Stomp from 'stompjs';
import {inject, nextTick, onMounted, reactive, ref, watch} from "vue";
import {useSettings, useGroup} from '@/views/index/store/stores.js'
import {Back, PictureFilled, Promotion} from "@element-plus/icons-vue";
import Codes from "@/utils/Codes.js";
import {throttle, debounce} from "lodash";

const group = useGroup()
const settings = useSettings()
const apiPrefix = settings.apiPrefix
const messageList = ref([])
const messageListBox = ref()
const fileBox = ref()
const connecting = ref(".")
const sockjsClient = reactive({
  socket: undefined,
  stomp: undefined
})
const props = defineProps(["groupId"])
const message = reactive({
  content: undefined,
  groupId: undefined,
  type: undefined,
})
const axios = inject("$axios");
let minuid = -1
let finishLoad = false
let imgurls = []
const scrollLoad = throttle(() => {
  if (messageListBox.value.scrollTop < 5) {
    loadMessage(props.groupId)
  }
}, 500)

function loadMessage(groupId) {
  if (finishLoad) return
  axios.get('/message', {
    params: {
      groupId: groupId,
      start: minuid,
    }
  })
      .then(res => {
        if (res.data.code === Codes.SUCCESS) {
          let ml = res.data.data;
          if (ml.length === 0) {
            finishLoad = true
            console.log(ml, ml.length, finishLoad)
            return
          }
          for (let i = 0; i < ml.length; i++) {
            messageList.value.unshift(ml[i])
            // if (ml[i].type==="img")
            //   imgurls.unshift(ml[i].content)
          }
          if (minuid < 0) {
            scrollToBottom()
          }
          minuid = ml[ml.length - 1].uid
        }
      })
}

function connect(groupId) {
  let socket = new SockJS(apiPrefix + "/ws")
  sockjsClient.socket = socket
  console.log(socket)
  let stompClient = Stomp.over(socket)
  stompClient.connect({}, (frame) => {
        finishLoad = false
        minuid = -1
        connecting.value = undefined
        messageList.value = []
        imgurls = []
        loadMessage(groupId)
        stompClient.subscribe("/forward/" + props.groupId, (message) => {
          let operation = JSON.parse(message.body)
          if (operation.type === "new") {
            messageList.value.push(operation.message)
          }
        })
      }, debounce(() => {//断开连接或连接失败时执行
        console.debug("connection to " + groupId + " closed, trying to reconnect")
        connect(props.groupId)
        if (connecting.value === undefined || connecting.value.length >= 6) connecting.value = "."
        else connecting.value += "."
      }, 1000)
  )
  console.log(stompClient)
  sockjsClient.stomp = stompClient
}

function sendMessage() {
  message.type = "text"
  axios.post("/message", message)
      .then(res => {
        console.log(res)
        if (res.data.code === Codes.SUCCESS) {
          console.log("success")
          message.content = ""
          scrollToBottom()
        }
      })
}

function sendPic() {
  message.type = "img"
  fileBox.value.click()
}

function uploadFile(e) {
  console.log(e)
  const file = e.target.files[0];
  if (file === undefined) return
  const formData = new FormData();
  formData.append("file", file)
  formData.append("type", message.type)
  formData.append("groupId", message.groupId)
  axios.post("/message", formData, {
    'Content-type': 'multipart/form-data'
  }).then(res => {
    fileBox.value.value = ""
    scrollToBottom()
  })
}

function scrollToBottom() {
  nextTick(() => {
    let mListBox = messageListBox.value
    mListBox.scrollTop = mListBox.scrollHeight - mListBox.offsetHeight
  })
}

watch(() => props.groupId, (newGroupId, oldGroupId) => {
  if (newGroupId === oldGroupId) return
  else if (!newGroupId) return;
  if (sockjsClient.socket !== undefined) {
    sockjsClient.socket.close()
  }
  console.debug("watch", newGroupId, oldGroupId)
  connect()
  message.groupId = newGroupId
  console.debug("detected group change", newGroupId, oldGroupId)
})
onMounted(() => {
  connect(props.groupId)
  message.groupId = props.groupId
  console.debug(import("../group/GroupAdd.vue"))
})

</script>

<style lang="scss" scoped>
.m-container {
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  //align-items: flex-start;

  .message-top {
    border-bottom: 1px solid gray;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .message-list {
    padding: 0 10px;
    display: flex;
    flex-direction: column;
    justify-content: right;
    flex: 1;
    height: auto;
    overflow: auto;
  }

  .send-box {
    margin-top: 10px;
    display: flex;
    height: fit-content;
    align-items: end;
  }
}
</style>