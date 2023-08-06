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
      <el-button @click="sendFile" :icon="Paperclip" text></el-button>
      <el-input v-model="message.content" @keyup.enter.native="sendMessage" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }"></el-input>
      <input type="file" ref="fileBox" @change="uploadFile" hidden>
      <el-button @click="sendMessage" :icon="Promotion" text :disabled="!message.content"></el-button>
    </div>

  </div>
</template>

<script setup>
import MessageItem from "@/components/message/MessageItem.vue";
// import SockJS from 'sockjs-client/dist/sockjs.min.js';
import {Client} from '@stomp/stompjs'
import {inject, nextTick, onMounted, reactive, ref, watch} from "vue";
import {useSettings, useGroup} from '@/views/index/store/stores.js'
import {Back, FolderAdd, Paperclip, PictureFilled, Promotion} from "@element-plus/icons-vue";
import {throttle, debounce} from "lodash";

const group = useGroup()
const settings = useSettings()
const apiPrefix = settings.apiPrefix
const messageList = ref([])
const messageListBox = ref()
const fileBox = ref()
const connecting = ref(".")
const stomp = reactive({
  subscription: undefined,
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

function loadMessage() {
  if (finishLoad) return
  axios.get('/message', {
    params: {
      groupId: props.groupId,
      start: minuid,
    }
  })
      .then(res => {
        let ml = res.data.data;
        if (ml.length === 0) {
          finishLoad = true
          console.log(ml, ml.length, finishLoad)
          return
        }
        for (let i = 0; i < ml.length; i++) {
          ml[i].content=JSON.parse(ml[i].content)
          messageList.value.unshift(ml[i])
          // if (ml[i].type==="img")
          //   imgurls.unshift(ml[i].content)
        }
        if (minuid < 0) {
          scrollToBottom()
        }
        minuid = ml[ml.length - 1].uid

      })
}

async function connect() {
  stomp.stomp = new Client({
    brokerURL: "ws://localhost:8089" + "/ws",//可以不赋值，因为后面用SockJS来代替
    // connectHeaders: {"Authorization": this.token},
    debug: function (str) {
      console.log(str);
    },
    reconnectDelay: 6000,//重连时间
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });
  // stompClient.webSocketFactory=function (){
  //   return new SockJS(apiPrefix + "/ws")
  // }
  // stomp.stomp.onConnect=(frame) => {
  //   finishLoad = false
  //   minuid = -1
  //   connecting.value = undefined
  //   messageList.value = []
  //   imgurls = []
  //   loadMessage(groupId)
  // }
  await stomp.stomp.activate()
  console.log(stomp)
}

function subscribe() {
  finishLoad = false
  minuid = -1
  connecting.value = undefined
  messageList.value = []
  imgurls = []
  loadMessage(props.groupId)
  stomp.subscription = stomp.stomp.subscribe("/forward/" + props.groupId, (message) => {
    let operation = JSON.parse(message.body)
    if (operation.type === "new") {
      operation.message.content=JSON.parse(operation.message.content)
      messageList.value.push(operation.message)
    }
  })
}

function sendMessage() {
  message.type = "text"
  axios.post("/message", message)
      .then(res => {
        console.log(res)
        message.content = ""
        scrollToBottom()
      })
}

function sendPic() {
  message.type = "img"
  fileBox.value.click()
}

function sendFile() {
  message.type = "file"
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
  if (stomp.subscription !== undefined) {
    stomp.subscription.unsubscribe()
  }
  subscribe()
  console.debug("watch", newGroupId, oldGroupId)
  message.groupId = newGroupId
  console.debug("detected group change", newGroupId, oldGroupId)
})
onMounted(() => {
  message.groupId = props.groupId
  console.debug("mount")
  connect()
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