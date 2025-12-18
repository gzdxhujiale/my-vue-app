import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import './data.js' // 导入模拟数据
import App from './App.vue'
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(TDesign)
app.use(ArcoVue)
app.use(router)
app.mount('#app')
