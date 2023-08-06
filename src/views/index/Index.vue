<script setup>
import {onMounted, reactive, ref, watch} from "vue";
import MessageContainer from "@/components/message/MessageContainer.vue";
import GroupContainer from "@/components/group/GroupContainer.vue";
import {useGroup,useOverScreenBox} from "@/views/index/store/stores.js";
import GroupAdd from "@/components/group/GroupAdd.vue";

const group = useGroup()
const overScreenBox=useOverScreenBox()
const wideWindow = ref(false)
const showTool=ref(false)
const toolBox=ref()
const toolBack=ref()
function judgeWide() {
  let width = document.body.clientWidth
  let height = document.body.clientHeight
  wideWindow.value = width > height
}
function closeToolBox(e){
    if (e.target===toolBack.value)
        overScreenBox.closeOverScreenBox()
}
onMounted(() => {
  judgeWide()
  window.onresize = () => {
    judgeWide()
  }
})

</script>

<template>
    <div class="main-box">
        <GroupContainer class="group-box" v-if="wideWindow || !group.groupId"></GroupContainer>
        <MessageContainer class="message-box" :group-id="group.groupId" v-show="group.groupId"></MessageContainer>
        <div class="empty-box" v-show="!group.groupId && wideWindow">
            <span>选择一个群组开始对话</span>
        </div>
        <div class="tool-background" v-if="overScreenBox.showOverScreenBox" ref="toolBack" @click="closeToolBox">
            <component :is="overScreenBox.overScreenComponent"></component>
        </div>
    </div>
</template>

<style lang="scss" scoped>
$left-box: 30%;
$right-box: 70%;
.main-box {
  display: flex;
  height: 100%;
  position: relative;

  .group-box {
    flex-basis: 25%;
    flex-grow: 1;
    height: 100%;
    border-right: 1px gray solid;
  }

  .message-box {
    flex-basis: 75%;
    flex-grow: 3;
    height: 100%;
  }

  .empty-box {
    flex-basis: 75%;
    flex-grow: 3;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .tool-background {
    background: rgba(201, 200, 200, 0.8);
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    .tool-box {
      padding: 10px;
      width: fit-content;
      background: white;
      border: 1px solid gray;
      border-radius: 10px;
    }
  }
}
</style>
