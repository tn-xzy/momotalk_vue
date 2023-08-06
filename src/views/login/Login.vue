<script setup>
import {reactive} from "vue";
import axios from "axios";
import {ResultCodes} from "@/utils/Codes.js";
const apiPrefix=import.meta.env.VITE_API_URL

const loginInfo=reactive({
  username:undefined,
  password:undefined
})
function login(){
  axios.get(apiPrefix+"/user",{
    params:loginInfo
  }).then(res=>{
    // console.log("login",res,res.data.code,ResultCodes.SUCCESS)
    if (res.data.code===ResultCodes.SUCCESS){
      localStorage.setItem("username",loginInfo.username)
      window.location.href="/index.html"
    }
  })
}
</script>

<template>
  <el-form :model="loginInfo" class="login-info" label-width="80px">
    <el-form-item label="用户名">
      <el-input v-model="loginInfo.username"></el-input>
    </el-form-item>
    <el-form-item label="密码">
      <el-input v-model="loginInfo.password"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="login">登录</el-button>
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped>
.login-info{
  display: flex;
  flex-direction: column;
  width: fit-content;
}
</style>
