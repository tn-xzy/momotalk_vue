import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import path,{ resolve } from 'path';
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from "unplugin-vue-components/resolvers";

// https://vitejs.dev/config/
export default defineConfig(({mode})=>{
  const env = loadEnv(mode, process.cwd())
  return{
    resolve:{
      alias:[
        {
          find: '@',
          replacement: resolve(__dirname, "src"),
        },

      ]
    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    build: {
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'index.html'),
          login: path.resolve(__dirname, 'login.html'),
        }, output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: "js/[name]-[hash].js",
          assetFileNames: "[ext]/name-[hash].[ext]"
        }
      },
    },
    server: {
      proxy: {
        [env.VITE_API_URL]: {
          target: "http://localhost:8089",
          changeOrigin: true,
          ws:true,
          rewrite: (path) => path.replace(env.VITE_API_URL, ""),
        },
      },
    },
}
})
