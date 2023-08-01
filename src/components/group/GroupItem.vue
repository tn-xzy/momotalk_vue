<template>
    <div class="group-item">
        <el-avatar v-if="!groupInfo.avatar">{{ groupInfo.groupName }}</el-avatar>
      <el-avatar v-else :src="groupInfo.avatar"></el-avatar>
        <span class="group-name">{{ groupInfo.groupName }}</span>
    </div>
</template>

<script setup>
import {reactive} from "vue";

const props = defineProps(["group"])
const groupInfo = props.group
</script>

<style lang="scss" scoped>
.group-item {
  display: flex;
  align-items: center;
  border-bottom: 1px solid gray;
  padding: 10px;

  .group-name {
    margin-left: 10px;
  }
}
</style>