<template>
<div class="group-box">
    <div class="group-top">
        <el-button :icon="Plus" text @click="show.openOverScreenBox(GroupAdd)"></el-button>
    </div>
    <div class="group-list">
        <GroupItem v-for="group in groupList" :key="group.groupId" :group="group" @click="changeGroup(group.groupId,group.groupName)"></GroupItem>
    </div>
</div>
</template>

<script setup>
import {inject, onMounted, onUnmounted, ref,getCurrentInstance} from "vue";
import GroupItem from "@/components/group/GroupItem.vue";
import {useGroup,useOverScreenBox} from '@/views/index/store/stores.js'
import {Plus} from "@element-plus/icons-vue";
import GroupAdd from "@/components/group/GroupAdd.vue";
import bus from "@/utils/EventBus.js";
const group=useGroup()
const show=useOverScreenBox()
const groupList=ref([])
const axios = inject("$axios");

function loadGroupList(){
  axios.get("/group")
      .then(res=>{
        console.debug(res)
        groupList.value=res.data.data
      })
}
function changeGroup(groupId,groupName) {
  console.debug(groupId,groupName)
  group.change(groupId,groupName)
}
onMounted(()=>{
  loadGroupList()
  bus.on('groupChange',() =>{
    loadGroupList()
  })

})
onUnmounted(()=>{
  bus.off('groupChange')

})
</script>

<style scoped>
.group-box{
    .group-top{
        border-bottom: 1px solid gray;
    }
    .group-list{

    }
}
</style>