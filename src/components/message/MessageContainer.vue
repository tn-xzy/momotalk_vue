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
      <MessageItem v-for="message in messageList" :key="message.uid" :message="message" :progress="message.progress"></MessageItem>
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
const sendBySelf=reactive(new Map())
const receivedMaySelf=reactive(new Map())
console.log(receivedMaySelf)
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
let loading=false
let imgurls = []
let sendByThis=0
const scrollLoad = throttle(() => {
  if (messageListBox.value.scrollTop < 5) {
    loadMessage(props.groupId)
  }
}, 500)
async function loadMessage() {
  if (finishLoad||loading) return
  loading=true
  let res=await axios.get('/message', {
    params: {
      groupId: props.groupId,
      start: minuid,
    }
  })
  let ml = res.data.data;
  if (ml.length === 0) {
    finishLoad = true
    console.log(ml, ml.length, finishLoad)
    return
  }
  for (let i = 0; i < ml.length; i++) {
    ml[i].content=JSON.parse(ml[i].content)
    messageList.value.unshift(ml[i])
  }
  if (minuid < 0) {
    scrollToBottom()
  }
  minuid = ml[ml.length - 1].uid
  loading=false
}

async function connect() {
  stomp.stomp = new Client({
    brokerURL: "ws://192.168.1.23:8089" + "/ws",//可以不赋值，因为后面用SockJS来代替
    // connectHeaders: {"Authorization": this.token},
    debug: function (str) {
      console.log(str);
    },
    reconnectDelay: 6000,//重连时间
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });
  await stomp.stomp.activate()
  console.log(stomp)
}

function subscribe() {
  finishLoad = false
  loading=false
  minuid = -1
  connecting.value = undefined
  messageList.value =[]
  imgurls = []
  loadMessage(props.groupId)
  stomp.subscription = stomp.stomp.subscribe("/forward/" + props.groupId, (message) => {
    let operation = JSON.parse(message.body)
    console.log(operation)
    if (operation.type === "new") {
      let message=operation.message;
      message.content=JSON.parse(operation.message.content)
      if (message.sender!==localStorage.getItem("username")||sendByThis<=0){
        messageList.value.push(operation.message)
      }else if (message.sender===localStorage.getItem("username")&&sendByThis>0){
        console.debug("接收到疑似自己发送的消息")
        receivedMaySelf.set(message.uid,message)
      }else {
        console.debug("???")
      }
    }
  })
}
watch([receivedMaySelf,sendBySelf],([nr,or],[ns,os])=>{
  let UidFind=[]
  for (let [uid,m] of sendBySelf){
    if (sendByThis<=0){
      break
    }
    if (receivedMaySelf.has(uid)){
      Object.assign(m,receivedMaySelf.get(uid))
      Object.assign(m.content,receivedMaySelf.get(uid).content)
      UidFind.push(uid)
      receivedMaySelf.delete(uid)
      sendByThis--;
    }
  }
  for (let uid of UidFind) sendBySelf.delete(uid)
  if (sendByThis===0){
    for (let [k,m] of receivedMaySelf){
      messageList.value.push(m)
    }
  }
})
function sendMessage() {
  message.type = "text"
  let newMessage=Object.assign({},message)
  newMessage.sender=localStorage.getItem("username")
  newMessage.content={text:newMessage.content}
  newMessage.sending=true
  messageList.value.push(newMessage)
  sendByThis++;
  scrollToBottom()
  axios.post("/message", message)
      .then(res => {
        console.log(res)
        message.content = ""
        newMessage.uid=res.data.data
        newMessage.sending=false
        sendBySelf.set(newMessage.uid,newMessage)
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
  const file = e.target.files[0];
  if (file === undefined) return
  const formData = new FormData();
  formData.append("file", file)
  formData.append("type", message.type)
  formData.append("groupId", message.groupId)
  let newMessage=reactive({
    sender:localStorage.getItem('username'),
    progress:0
  })
  Object.assign(newMessage,message)
  if (message.type==="img"){
    let URL = window.URL || window.webkitURL;
    let imgURL = URL.createObjectURL(file);
    newMessage.content={
      imgPath:imgURL
    }

  }else if (message.type==="file"){
    let size=file.size;
    let units=["bytes","kb","mb","gb","tb"]
    let index=0;
    while (size>=1024&&index<units.length){
      size/=1024;index++;
    }
    newMessage.content={
      filename:file.name,
      size:size.toFixed(2),
      unit:units[index]
    }
  }
  messageList.value.push(newMessage)
  sendByThis++;
  scrollToBottom()
  axios.post("/message", formData, {
    'Content-type': 'multipart/form-data',
    onUploadProgress: function(progressEvent) {
      console.log(progressEvent.loaded / progressEvent.total*100)
      let progress=progressEvent.loaded / progressEvent.total*100
      newMessage.progress=Math.round(progress * 100) / 100
    }
  }).then(res => {
    fileBox.value.value = ""
    newMessage.uid=res.data.data
    newMessage.sending=false
    sendBySelf.set(newMessage.uid,newMessage)
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