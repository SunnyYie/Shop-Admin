import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import 'virtual:windi.css'
import { router } from './router'
import store from './store'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './permission'
import 'nprogress/nprogress.css'
import permission from '~/directive/permission.js'

const app = createApp(App)

app.use(store)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(router)
app.use(permission)

app.mount('#app')
