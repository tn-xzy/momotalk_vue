import { createApp } from 'vue'
import {createPinia} from "pinia";
import App from './Index.vue'
import '@/views/style.css'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import axios from "axios";
import mitt from "mitt";
import VueEasyLightbox from "vue-easy-lightbox";
import {ElMessageBox} from "element-plus";
import Codes from "@/utils/Codes.js";
axios.interceptors.request.use(function (config) {
  const baseURL = import.meta.env.VITE_API_URL
  config.url = baseURL + config.url
  console.debug("拦截响应-请求配置"+config.url, config)
  return config
})
axios.interceptors.response.use(function (res) {
  if (res.data.code!==Codes.SUCCESS)
    window.location="/login.html"
  return res
}, function (error) {
  console.debug("拦截响应-请求报错", error)
  ElMessageBox.alert(`<p>简要描述:${error.message}</p>
    <p>错误信息:${error}</p>`, `错误类型：${error.code}`, {
    confirmButtonText: 'OK',
    dangerouslyUseHTMLString: true,
  })
});
const pinia = createPinia()
const app=createApp(App)
app.provide('$axios', axios)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(pinia)
app.use(VueEasyLightbox)
app.mount('#app')

app.config.globalProperties.mittBus = new mitt()