import {defineStore} from "pinia";

export const useGroup = defineStore('group',{
  state: () => ({
    groupId:undefined,
    self:localStorage.getItem("username"),
    groupName:undefined
  }),
  actions:{
    change(newGroupId,newGroupName){
      this.groupId=newGroupId
      this.groupName=newGroupName
    }
  }
})
export const useOverScreenBox = defineStore('OverScreenBox',{
  state: () => ({
    showOverScreenBox:false,
    overScreenComponent:undefined,
    params:undefined
  }),
  actions:{
    openOverScreenBox(overScreenComponent){
      this.showOverScreenBox=true
      this.overScreenComponent=overScreenComponent
    },
    openOverScreenBoxWithParams(overScreenComponent,params){
      this.showOverScreenBox=true
      this.params=params
      this.overScreenComponent=overScreenComponent
    },
    closeOverScreenBox(){
      this.showOverScreenBox=false
      this.overScreenComponent=undefined
      this.params=undefined
    }
  }
})

export const useSettings = defineStore('settings',{
  state: () => ({
    apiPrefix:"/api"
  })
})
