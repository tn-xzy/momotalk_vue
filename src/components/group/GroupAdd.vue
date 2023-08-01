<template>
    <div class="group-add-box">
        <div class="group-add-top">
            <el-button :icon="Close" text @click="show.closeOverScreenBox()"></el-button>
        </div>
        <div class="group-add-info">
            <el-form :model="groupInfo" class="group-add-form">
                <div class="group-form-input">
                    <el-image :src="groupInfo.groupAvatar" class="group-avatar" @click="avatarBox.click()"></el-image>
                    <el-form-item label="群组名称" style="margin: 0">
                        <el-input v-model="groupInfo.groupName"></el-input>
                    </el-form-item>
                </div>
                <div class="group-form-ope">
                  <input type="file" ref="avatarBox" @change="uploadAvatar" hidden>
                    <el-button type="primary" @click="createGroup">Create</el-button>
                    <el-button>Cancel</el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import {Close, Camera} from "@element-plus/icons-vue";
import {inject, reactive, ref,getCurrentInstance, toRefs} from "vue";
import {useOverScreenBox} from "@/views/index/store/stores.js";
import bus from "@/utils/EventBus.js";
const avatarBox=ref()
const show = useOverScreenBox()
const groupInfo = reactive({
  groupName: "",
  groupAvatar: "/camera.png",
})
const axios = inject("$axios");
function uploadAvatar(e){
  const file = e.target.files[0];
  groupInfo.groupAvatar=file
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = function(e) {
    groupInfo.groupAvatar=e.target.result;
  };
}
function  createGroup(){
  const formData = new FormData();
  formData.append("file",groupInfo.groupAvatar)
  formData.append("groupName",groupInfo.groupName)
  axios.post("/group", formData, {
    'Content-type': 'multipart/form-data'
  }).then(res=>{
    groupInfo.groupName=""
    groupInfo.groupAvatar=""
    bus.emit("groupChange")
    show.closeOverScreenBox()
  })
}
</script>

<style lang="scss" scoped>
.group-add-box {
  padding: 10px;
  background: white;
  border: 1px solid gray;
  border-radius: 10px;

  .group-add-top {
    display: flex;
    justify-content: end;
  }

  .group-add-info {
    .group-add-form {
      display: flex;
      flex-direction: column;

      .group-form-input {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        .group-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          margin-right: 10px;
        }

      }

      .group-form-ope {
        display: flex;
        justify-content: end;
      }

    }
  }
}
</style>