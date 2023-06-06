### 目录结构

```
├── public                     # 静态资源
│   │── tinymcd                # 富文本编辑器
├── src                        # 源代码
│   ├── assets                 # 主题 字体等静态资源
│   ├── components             # 全局公共组件
│   ├── composables            # 常用工具库
│   ├── router                 # 路由
│   ├── store                  # 全局store管理
│   ├── App.vue                # 入口页面
│   ├── main.js                # 入口文件
│   ├── pages                  # 相关页面
│   ├── axios.js               
│   ├── api                    # 接口方法
│   ├── permission.js          # 全局守卫
│   ├── layout                 # 布局
│   ├── index.html             
│   ├── .env.development
│   ├── .env.production             
│   ├── index.html             
│   └── directive              # 自定义指令
├── vite.config.js             # vite 配置
└── package.json               # package.json
```

### Npm

#### 切换镜像

```bash
npm config set registry=https://registry.npmmirror.com
```

### Vite

#### 搭建 Vite 项目

使用 NPM:

```
$ npm create vite@latest
```

使用 Yarn:

```
$ yarn create vite
```

#### resolve.alias (配置文件系统路径别名)

```js
// vite.config.js
import path from 'path'

export default defineConfig({
  resolve: {
      alias: {
      '~': path.resolve(__dirname, 'src'),
    }
  }
})
```

#### 配置proxy代理

```js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://ceshi13.dishait.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [vue(), WindiCSS()],
})
```



### Element Plus

```
# NPM
$ npm install element-plus --save

# Yarn
$ yarn add element-plus
```

#### 完整引入

```typescript
// main.ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)

app.use(ElementPlus)
app.mount('#app')
```

### Windi CSS

#### 配置

```
npm i -D vite-plugin-windicss windicss
```

然后，在你的 Vite 配置中添加插件：

```javascript
//vite.config.js
import WindiCSS from 'vite-plugin-windicss'

export default {
  plugins: [
    WindiCSS(),
  ],
}
```

最后，在你的 Vite 入口文件中导入 `virtual:windi.css`：

```javascript
//main.js
import 'virtual:windi.css'
```

#### 基本使用

```html
// py=>padding top bottom px=>padding left right 
<div class="py-8 px-8 max-w-sm mx-auto bg-white rounded-xl shadow-md space-y-2 sm:(py-4 flex items-center space-y-0 space-x-6)">
  <div class="text-center space-y-2 sm:text-left">
    <div class="space-y-0.5">
      <p class="text-lg text-black font-semibold">Erin Lindford</p>
      <p class="text-gray-500 font-medium">产品经理</p>
    </div>
    <button class="px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:(text-white bg-purple-600 border-transparent) focus:(outline-none ring-2 ring-purple-600 ring-offset-2)">
      消息
    </button>
  </div>
</div>
```

![image-20230504160120746](C:\Users\86177\AppData\Roaming\Typora\typora-user-images\image-20230504160120746.png)

#### 抽离CSS

```css
// 例子

.btn{
@apply bg-purple-500 text-indigo-50 px-4 py-2 rounded-full transition-all duration-500 hover:(bg-purple-900) focus:(ring-8 ring-purple-900);
}
```

### Vue Router

#### 安装

npm

```
npm install vue-router@4
```

yarn

```
yarn add vue-router@4
```

#### 配置

```js
// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
// 1. 定义路由组件.
import Index from '~/pages/index.vue'
import Login from '~/pages/login.vue'
import NotFound from '~/pages/404.vue'

// 2. 定义一些路由
const routes = [
  { path: '/', component: Index },
  { path: '/login', component: Login },
  // 配置404路由
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

// 3. 创建路由实例并传递 `routes` 配置
const router = createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes, // `routes: routes` 的缩写
})

export default router
```

```js
// main.js
import router from './router'

app.use(router)
```

```vue
// App.vue
<template>
  <router-view></router-view>
</template>
```

#### 导航守卫

```js
import { router, addRoutes } from '~/router'
import { getToken } from '~/composables/auth'
import { toast, showFullLoading, hideFullLoading } from '~/composables/util'
import store from './store'

// 全局前置守卫
// 判断是否触发了getinfo
let hasGetInfo = false
router.beforeEach(async (to, from, next) => {
  // 显示loading
  showFullLoading()

  const token = getToken()

  // 没有登录，强制跳转回登录页
  if (!token && to.path != '/login') {
    toast('请先登录', 'error')
    return next({ path: '/login' })
  }

  // 防止重复登录
  if (token && to.path == '/login') {
    toast('请勿重复登录', 'error')
    return next({ path: from.path ? from.path : '/' })
  }

  // 如果用户登录了，自动获取用户信息，并存储在vuex当中
  let hasNewRoutes = false
  // getinfo没被调用才会触发
  if (token && !hasGetInfo) {
    let { menus } = await store.dispatch('getinfo')
    hasGetInfo = true
    // 动态添加路由
    hasNewRoutes = addRoutes(menus)
  }

  // 设置页面标题
  let title = (to.meta.title ? to.meta.title : '') + '-马场郭德纲商城后台'
  document.title = title

  hasNewRoutes ? next(to.fullPath) : next()
})

// 全局后置守卫
router.afterEach((to, from) => hideFullLoading())
```

#### 导航守卫配置

```js
// main.js
import './permission'
```

#### 动态路由

```js
// 动态路由 用于匹配菜单，动态添加路由
const asyncRoutes = [
  {
    path: '/',
    name: '/',
    component: Index,
    meta: { title: '后台首页' },
  },
  {
    path: '/goods/list',
    name: '/goods/list',
    component: GoodList,
    meta: {
      title: '商品管理',
    },
  },
  {
    path: '/category/list',
    name: '/category/list',
    component: CategoryList,
    meta: { 
      title: '分类列表' 
    },
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 定义动态添加路由的方法
export function addRoutes(menus) {
  // 是否有新的路由
  let hasNewRoutes = false
  
  const findAndAddRoutesByMenus = (arr) => {
    arr.forEach((e) => {
      // 动态路由与菜单路径匹配
      let item = asyncRoutes.find((o) => o.path == e.frontpath)
      // 如果item存在，并且未注册过此路由
      if (item && !router.hasRoute(item.path)) {
        router.addRoute('admin', item)
        hasNewRoutes = true
      }
      if (e.child && e.child.length) {
        findAndAddRoutesByMenus(e.child)
      }
    })
  }
  findAndAddRoutesByMenus(menus)
  return hasNewRoutes
}
```

#### 代码

```js
// router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'

import Index from '~/pages/index.vue'
import Login from '~/pages/login.vue'
import NotFound from '~/pages/404.vue'
import GoodList from '~/pages/goods/list.vue'
import CategoryList from '~/pages/category/list.vue'
import UserList from '~/pages/user/list.vue'
import OrderList from '~/pages/order/list.vue'
import CommentList from '~/pages/comment/list.vue'
import ImageList from '~/pages/image/list.vue'
import NoticeList from '~/pages/notice/list.vue'
import SettingBase from '~/pages/setting/base.vue'
import CouponList from '~/pages/coupon/list.vue'
import Manager from '~/pages/manager/list.vue'
import AccessList from '~/pages/access/list.vue'
import RoleList from '~/pages/role/list.vue'
import SkusList from '~/pages/skus/list.vue'
import LevelList from '~/pages/level/list.vue'
import SettingBuy from '~/pages/setting/buy.vue'
import SettingShip from '~/pages/setting/ship.vue'
import DistributionIndex from '~/pages/distribution/index.vue'
import DistributionSetting from '~/pages/distribution/setting.vue'
import Admin from '~/layouts/admin.vue'

// 默认路由 所有用户共享
const routes = [
  {
    path: '/',
    name: 'admin',
    component: Admin,
  },
  {
    path: '/login',
    component: Login,
    meta: { title: '登录页' },
  },
  // 配置404路由
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]
// 动态路由 用于匹配菜单，动态添加路由
const asyncRoutes = [
  {
    path: '/',
    name: '/',
    component: Index,
    meta: { title: '后台首页' },
  },
  {
    path: '/goods/list',
    name: '/goods/list',
    component: GoodList,
    meta: {
      title: '商品管理',
    },
  },
  {
    path: '/category/list',
    name: '/category/list',
    component: CategoryList,
    meta: { title: '分类列表' },
  },
  {
    path: '/user/list',
    name: '/user/list',
    component: UserList,
    meta: { title: '用户列表' },
  },
  {
    path: '/order/list',
    name: '/order/list',
    component: OrderList,
    meta: { title: '订单列表' },
  },
  {
    path: '/comment/list',
    name: '/comment/list',
    component: CommentList,
    meta: { title: '评价列表' },
  },
  {
    path: '/image/list',
    name: '/image/list',
    component: ImageList,
    meta: { title: '图库列表' },
  },
  {
    path: '/notice/list',
    name: '/notice/list',
    component: NoticeList,
    meta: { title: '公告列表' },
  },
  {
    path: '/setting/base',
    name: '/setting/base',
    component: SettingBase,
    meta: { title: '配置列表' },
  },
  {
    path: '/coupon/list',
    name: '/coupon/list',
    component: CouponList,
    meta: { title: '配置列表' },
  },
  {
    path: '/manager/list',
    name: '/manager/list',
    component: Manager,
    meta: { title: '管理员列表' },
  },
  {
    path: '/access/list',
    name: '/access/list',
    component: AccessList,
    meta: { title: '权限列表' },
  },
  {
    path: '/role/list',
    name: '/role/list',
    component: RoleList,
    meta: { title: '角色列表' },
  },
  {
    path: '/skus/list',
    name: '/skus/list',
    component: SkusList,
    meta: { title: '规格列表' },
  },
  {
    path: '/level/list',
    name: '/level/list',
    component: LevelList,
    meta: { title: '会员列表' },
  },
  {
    path: '/setting/buy',
    name: '/setting/buy',
    component: SettingBuy,
    meta: { title: '支付页面' },
  },
  {
    path: '/setting/ship',
    name: '/setting/ship',
    component: SettingShip,
    meta: { title: '物流页面' },
  },
  {
    path: '/distribution/index',
    name: '/distribution/index',
    component: DistributionIndex,
    meta: { title: '分销员页面' },
  },
  {
    path: '/distribution/setting',
    name: '/distribution/setting',
    component: DistributionSetting,
    meta: { title: '分销设置' },
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 定义动态添加路由的方法
export function addRoutes(menus) {
  // 是否有新的路由
  let hasNewRoutes = false
  const findAndAddRoutesByMenus = (arr) => {
    arr.forEach((e) => {
      let item = asyncRoutes.find((o) => o.path == e.frontpath)
      if (item && !router.hasRoute(item.path)) {
        router.addRoute('admin', item)
        hasNewRoutes = true
      }
      if (e.child && e.child.length) {
        findAndAddRoutesByMenus(e.child)
      }
    })
  }

  findAndAddRoutesByMenus(menus)
  return hasNewRoutes
}
```

```js
// permission.js
import { router, addRoutes } from '~/router'
import { getToken } from '~/composables/auth'
import { toast, showFullLoading, hideFullLoading } from '~/composables/util'
import store from './store'

// 全局前置守卫
let hasGetInfo = false
router.beforeEach(async (to, from, next) => {
  // 显示loading
  showFullLoading()

  const token = getToken()

  // 没有登录，强制跳转回登录页
  if (!token && to.path != '/login') {
    toast('请先登录', 'error')
    return next({ path: '/login' })
  }

  // 防止重复登录
  if (token && to.path == '/login') {
    toast('请勿重复登录', 'error')
    return next({ path: from.path ? from.path : '/' })
  }

  // 如果用户登录了，自动获取用户信息，并存储在vuex当中
  let hasNewRoutes = false
  if (token && !hasGetInfo) {
    let { menus } = await store.dispatch('getinfo')
    hasGetInfo = true
    // 动态添加路由
    hasNewRoutes = addRoutes(menus)
  }

  // 设置动态页面标题
  let title = (to.meta.title ? to.meta.title : '') + '-马场郭德纲商城后台'
  document.title = title

  hasNewRoutes ? next(to.fullPath) : next()
})

// 加载完页面就会取消loading
// 全局后置守卫
router.afterEach((to, from) => hideFullLoading())
```

### axios

#### 安装

使用 npm:

```bash
$ npm install axios
```

使用 yarn:

```bash
$ yarn add axios
```

#### 配置

```js
// axios.js
import axios from 'axios'

// 创建实例
const service = axios.create({
  baseURL: 'http://ceshi13.dishait.cn',
})

export default service
```

#### 请求拦截器和响应拦截器

请求拦截器目的：可以在请求api接口时自动将token添加到Header头上

响应拦截器目的：统一进行错误的提示处理

```js
import { toast } from '~/composables/util.js'
import { getToken } from '~/composables/auth.js'

// 添加请求拦截器
service.interceptors.request.use(
  function (config) {
    // 往header头自动添加token
    const token = getToken()
    if (token) {
      config.headers['token'] = token
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)

// 添加响应拦截器
service.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    return response.data.data // 将原来由res.data.data才能获取token简化为res就可以获取token
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    const msg = error.response.data.msg || '请求失败'
    if (msg == '非法token，请先登录！') {
      store.dispatch('logout').finally(() => {
        location.reload()
      })
    }
    toast(msg, 'error')
    return Promise.reject(error)
  },
)
```

#### 代码

```js
import axios from 'axios'
import { toast } from '~/composables/util'
import { getToken } from '~/composables/auth'
import store from './store'

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
})

// 添加请求拦截器
service.interceptors.request.use(
  function (config) {
    // 往header头自动添加token
    const token = getToken()
    if (token) {
      config.headers['token'] = token
    }

    return config
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  },
)

// 添加响应拦截器
service.interceptors.response.use(
  function (response) {
    return response.request.responseType == 'blob' ? response.data : response.data.data
  },
  function (error) {
    const msg = error.response.data.msg || '请求失败'
    if (msg == '非法token，请先登录！') {
      store.dispatch('logout').finally(() => location.reload())
    }
    toast(msg, 'error')
    return Promise.reject(error)
  },
)

export default service
```



### VueUse

#### 安装

```bash
npm i @vueuse/core
```

#### 安装cookie

```bash
npm i @vueuse/integrations
```

安装useCookies

```bash
npm i universal-cookie
```

#### 配置

```js
import { useCookies } from '@vueuse/integrations/useCookies'
    
const cookie = useCookies()
// 存储token
cookie.set('admin-token', res.data.data.token)
// 获取token
cookie.get('admin-token')
// 删除
cookie.remove('admin-token', res.data.data.token)
```

#### 全屏功能

```js
import { useFullscreen } from '@vueuse/core'

const { isFullscreen, enter, exit, toggle } = useFullscreen()
```

#### 等比例缩放功能

```js
import { useResizeObserver } from '@vueuse/core'

const el = ref(null)
useResizeObserver(el, entries => {
  myChart.resize()
})
```

#### 将时间戳转化为时间

```js
// UseDateFormat
const ship_time = computed(() => {
  if (props.info.ship_data) {
    const s = useDateFormat(
      props.info.ship_data.express_time * 1000,
      'YYYY-MM-DD HH:mm:ss'
    )
    return s.value
  }
  return ''
})
```



### Vuex

#### 安装

```
npm install vuex@next --save
```

```
yarn add vuex@next --save
```

#### 配置

```js
// src/store/index.js
import { createStore } from 'vuex'

// 创建一个新的 store 实例
const store = createStore({
  state () {
    return {
    }
  },
  mutations: {

  }
})

export default store
```

```js
// main.js
import store from './store'

app.use(store)
```

#### 代码

```js
import { createStore } from 'vuex'
import { getInfo, login } from '~/api/manager.js'
import { removeToken, setToken } from '~/composables/auth.js'

// 创建一个新的 store 实例
const store = createStore({
  state() {
    return {
      // 用户信息
      user: {},
      // 侧边宽度
      asideWidth: '250px',
      // 菜单数据
      menus: [],
      // 权限相关的数组
      ruleNames: [],
    }
  },
  mutations: {
    // 记录用户信息
    SET_USERINFO(state, user) {
      state.user = user
    },
    // 展开/收缩侧边栏
    handleAsideWidth(state) {
      state.asideWidth = state.asideWidth == '250px' ? '64px' : '250px'
    },
    // 记录菜单信息
    SET_MENUS(state, menus) {
      state.menus = menus
    },
    // 记录权限信息
    SET_RULENAMES(state, ruleNames) {
      state.ruleNames = ruleNames
    },
  },
  // 将方法提取到store中
  actions: {
    // 获取当前登录用户信息
    // commit ==> store.commit
    getinfo({ commit }) {
      return new Promise((resolve, reject) => {
        getInfo()
          .then((res) => {
            commit('SET_USERINFO', res)
            commit('SET_MENUS', res.menus)
            commit('SET_RULENAMES', res.ruleNames)
            // 成功则将用户信息传回去
            resolve(res)
          })
          .catch((err) => reject(err))
      })
    },
    // 登录
    login({ commit }, { username, password }) {
      return new Promise((resolve, reject) => {
        login(username, password)
          .then((res) => {
            setToken(res.token)
            resolve(res)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },

    // 退出登录
    logout({ commit }) {
      // 清除token
      removeToken()
      // 清除用户信息
      commit('SET_USERINFO', {})
    },
  },
})

export default store
```



### 全局loading

#### 安装

```bash
npm i nprogress
```

#### 配置

```js
// main.js
import 'nprogress/nprogress.css'
```

#### 在全局路由守卫中配置

```js
// src/permission.js
import { showLoading, hideLoading } from '~/composables/util'


// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 显示loading
  showLoading()

})

// 全局后置守卫
router.afterEach((to, from) => {
  hideLoading()
})
```

#### 修改loading样式

```vue
// App.vue

<style scoped>
#nprogress .bar {
  background-color: #f4f4f4;
  height: 3px !important;
}
</style>
```

### gsap

#### 安装

```bash
npm i gsap
```

#### 配置

```vue
//  src/components/CountTo.vue
<template>
  {{ d.num.toFixed(0) }}
</template>

<script setup>
import { reactive, watch } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  value: {
    type: Number,
    default: 0
  }
})
const d = reactive({
  num: 0
})

function AnimateToValue() {
  gsap.to(d, {
    duration: 0.5,
    num: props.value
  })
}

AnimateToValue()

watch(
  () => props.value,
  () => AnimateToValue
)
</script>

<style>
</style>
```



### Echarts

#### 安装

```bash
npm install echarts
```

#### 配置

```vue
<template>
  <el-card shadow="never">
    <template #header>
      <div class="flex justify-between">
        <span class="text-sm">订单统计</span>
        <div>
          // 可选中标签
          <el-check-tag v-for="(item,index) in options" :key="index" :checked="current == item.value" style="margin-right: 8px" @click="handleChoose(item.value)">{{item.text}}</el-check-tag>
        </div>
      </div>
    </template>
	// echarts区域
    <div ref="el" id="chart" style="width:100%; height:300px;">

    </div>
  </el-card>

</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { getStatistics3 } from '~/api/index.js'
import { useResizeObserver } from '@vueuse/core'

const current = ref('week')
const options = [
  {
    text: '近1个月',
    value: 'month'
  },
  {
    text: '近1周',
    value: 'week'
  },
  {
    text: '近24小时',
    value: 'hour'
  }
]

// 选择
const handleChoose = type => {
  current.value = type
  getData()
}

var myChart = null
// 渲染后拿到dom值
onMounted(() => {
  var chartDom = document.getElementById('chart')
  if (chartDom) {
    myChart = echarts.init(chartDom)
    getData()
  }
})
// 页面被销毁之前
onBeforeUnmount(() => {
  // 清除echart
  if (myChart) {
    echarts.dispose(myChart)
  }
})

function getData() {
  let option = {
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [],
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)'
        }
      }
    ]
  }
  myChart.showLoading()

  getStatistics3(current.value)
    .then(res => {
      option.xAxis.data = res.x
      option.series[0].data = res.y

      myChart.setOption(option)
    })
    .finally(() => {
      myChart.hideLoading()
    })
}
// 页面可以等比例缩放
const el = ref(null)
useResizeObserver(el, entries => {
  myChart.resize()
})
</script>
```

### 富文本编辑器

#### 安装

```js
npm i tinymce
npm i @tinymce/tinymce-vue
```

#### 配置

```js
// 从node_modules/tinymce复制样式文件到public目录下
// public/tinymce
```

```vue
// 新增Editor组件
// components/Editor.vue
<template>
  <editor v-model="content" tag-name="div" :init="init" />
	// 引入选择图片组件
  <ChooseImage :preview="false" ref="ChooseImageRef" :limit="9" />
</template>
<script setup>
import tinymce from 'tinymce/tinymce'
import Editor from '@tinymce/tinymce-vue'
import ChooseImage from '~/components/ChooseImage.vue'
import { ref, watch } from 'vue'
import 'tinymce/themes/silver/theme' // 引用主题文件
import 'tinymce/icons/default' // 引用图标文件
import 'tinymce/models/dom'
// tinymce插件可按自己的需要进行导入
// 更多插件参考：https://www.tiny.cloud/docs/plugins/
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/autoresize'
import 'tinymce/plugins/autosave'
import 'tinymce/plugins/charmap' // 特殊字符
import 'tinymce/plugins/code' // 查看源码
import 'tinymce/plugins/codesample' // 插入代码
import 'tinymce/plugins/directionality'
import 'tinymce/plugins/emoticons'
import 'tinymce/plugins/fullscreen' //全屏
import 'tinymce/plugins/help'
import 'tinymce/plugins/image' // 插入上传图片插件
import 'tinymce/plugins/importcss' //图片工具
import 'tinymce/plugins/insertdatetime' //时间插入
import 'tinymce/plugins/link'
import 'tinymce/plugins/lists' // 列表插件
import 'tinymce/plugins/media' // 插入视频插件
import 'tinymce/plugins/nonbreaking'
import 'tinymce/plugins/pagebreak' //分页
import 'tinymce/plugins/preview' // 预览
import 'tinymce/plugins/quickbars'
import 'tinymce/plugins/save' // 保存
import 'tinymce/plugins/searchreplace' //查询替换
import 'tinymce/plugins/table' // 插入表格插件
import 'tinymce/plugins/template' //插入模板
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/visualchars'
import 'tinymce/plugins/wordcount' // 字数统计插件
// v-model
const props = defineProps({
  modelValue: String
})
const emit = defineEmits(['update:modelValue'])
const ChooseImageRef = ref(null)
// 配置
const init = {
  language_url: '/tinymce/langs/zh-Hans.js', // 中文语言包路径
  language: 'zh-Hans',
  skin_url: '/tinymce/skins/ui/oxide', // 编辑器皮肤样式
  content_css: '/tinymce/skins/content/default/content.min.css',
  menubar: false, // 隐藏菜单栏
  autoresize_bottom_margin: 50,
  max_height: 500,
  min_height: 400,
  // height: 320,
  toolbar_mode: 'none',
  plugins:
    'wordcount visualchars visualblocks template searchreplace save quickbars preview pagebreak nonbreaking media insertdatetime importcss image help fullscreen directionality codesample code charmap link code table lists advlist anchor autolink autoresize autosave',
  	// 配置imageUpload
    toolbar:
    'formats undo redo fontsizeselect fontselect ltr rtl searchreplace media imageUpload | outdent indent aligncenter alignleft alignright alignjustify lineheight underline quicklink h2 h3 blockquote numlist bullist table removeformat forecolor backcolor bold italic strikethrough hr link preview fullscreen help ',
  content_style: 'p {margin: 5px 0; font-size: 14px}',
  fontsize_formats: '12px 14px 16px 18px 24px 36px 48px 56px 72px',
  font_formats:
    '微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方 = PingFang SC, Microsoft YaHei, sans- serif; 宋体 = simsun, serif; 仿宋体 =  FangSong, serif; 黑体 = SimHei, sans - serif; Arial = arial, helvetica, sans - serif;Arial Black = arial black, avant garde;Book Antiqua = book antiqua, palatino; ',
  branding: false,
  elementpath: false,
  resize: false, // 禁止改变大小
  statusbar: false, // 隐藏底部状态栏
  // 给富文本编辑器添加新按钮
  setup: editor => {
    editor.ui.registry.addButton('imageUpload', {
      tooltip: '插入图片',
      icon: 'image',
      onAction() {
        ChooseImageRef.value.open(data => {
          data.forEach(url => {
            editor.insertContent(`<img src="${url}" style="width:100%;"/>`)
          })
        })
      }
    })
  }
}
tinymce.init // 初始化
const content = ref(props.modelValue)
watch(props, newVal => (content.value = newVal.modelValue))
watch(content, newVal => emit('update:modelValue', newVal))
</script>

<style>
.tox-tinymce-aux {
  z-index: 9999 !important;
}
</style>
```



# 登录页面(src/pages/login.vue)

## 代码

```vue
<template>
  <el-row class="login-container">
      // lg: ≥1200px 响应式栅格数
	  // md: ≥992px  响应式栅格数
      // 左边布局
    <el-col :lg="16" :md="12" class="left">
      <div>
        <div>
          欢迎光临
        </div>
        <div>
          此站点是Vue3+Vite实战项目,马场郭德纲在线教学,开始学习
        </div>
      </div>
    </el-col>
      
	// 右边布局
    <el-col :lg="8" :md="12" class="right ">
      <h2 class="title">欢迎回来</h2>
        
      <div>
        <span class="line"> </span>
        <span>账号密码登录</span>
        <span class="line"> </span>
      </div>
        
      <el-form :model="form" :rules="formRules" ref="formRef" class="w-[250px] ">
        // 用户名输入
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名">
            <template #prefix>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
		
		// 密码输入
        <el-form-item prop="password">
            // 使用show-password属性即可得到一个可切换显示隐藏的密码框
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password>
            <template #prefix>
              <el-icon>
                <lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

		// 登录按钮
        <el-form-item>
          <el-button type="primary" @click="onSubmit" class=" w-[250px]" round color="#626aef" :loading="loading">登 录</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script  setup>
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import { toast } from '~/composables/util.js'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()

const form = reactive({
  username: '',
  password: ''
})

const formRules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 3, max: 5, message: '用户名长度必须在3到5个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, max: 15, message: 'Length should be 5 to 15', trigger: 'blur' }
  ]
}

const formRef = ref(null)
const loading = ref(false)

// 提交函数
const onSubmit = () => {
  formRef.value.validate(valid => {
    if (!valid) {
      return false
    }
    loading.value = true
    store
      .dispatch('login', form)
      .then(res => {
        toast('登陆成功', 'success')
        router.push('/')
      })
      .finally(() => {
        loading.value = false
      })
  })
}

// 监听回车事件
function onKeyUp(e) {
  if (e.key == 'Enter') {
    onSubmit()
  }
}
    
// 添加键盘监听 页面渲染之后
onMounted(() => {
  document.addEventListener('keyup', onKeyUp)
})
// 移除键盘监听 页面卸载之前
onBeforeUnmount(() => {
  document.removeEventListener('keyup', onKeyUp)
})
</script>

<style scoped>
.login-container {
  @apply bg-indigo-500 min-h-screen;
}
.left,
.right {
  @apply flex items-center justify-center;
}
.right {
  @apply bg-light-50 flex-col;
}
.left > div > div:first-child {
  @apply font-bold text-5xl text-light-50 mb-4;
}
.left > div > div:last-child {
  @apply text-gray-200 text-sm;
}
.right .title {
  @apply font-bold text-gray-800 text-3xl;
}
.right > div {
  @apply flex items-center justify-center my-5 text-gray-300 space-x-2;
}
.right div .line {
  @apply h-[1px] w-16 bg-gray-200;
}
</style>
```

### 图标的引入

安装

```
# NPM
$ npm install @element-plus/icons-vue
# Yarn
$ yarn add @element-plus/icons-vue
```

使用

```vue
 <el-input v-model="form.username" placeholder="请输入用户名">
   <template #prefix>
      <el-icon>
        <User />
      </el-icon>
   </template>
 </el-input>

 <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password>
   <template #prefix>
      <el-icon>
        <lock />
      </el-icon>
   </template>
 </el-input>
```

全局导入

```js
// main.js
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
```

### 表单验证

```vue
<template>
      <el-form :model="form" :rules="formRules" ref="formRef" class="w-[250px] ">
          // 用户名输入
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名">
          </el-input>
        </el-form-item>
		
		// 密码输入
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password>
          </el-input>
        </el-form-item>

		// 登录按钮
        <el-form-item>
          <el-button type="primary" @click="onSubmit" class=" w-[250px]" round color="#626aef" :loading="loading">登 录</el-button>
        </el-form-item>
      </el-form>
</template>

<script  setup>
import { reactive,ref } from 'vue'

const form = reactive({
  username: '',
  password: ''
})

const formRules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 3, max: 5, message: '用户名长度必须在3到5个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, max: 15, message: 'Length should be 5 to 15', trigger: 'blur' }
  ]
}

</script>
```

### 添加loading

```vue
<template>
<el-button type="primary" @click="onSubmit" class=" w-[250px]" round color="#626aef" :loading="loading">登 录</el-button>
</template>

<script setup>
const loading = ref(false)
const formRef = ref(null)

// 提交函数
const onSubmit = () => {
  formRef.value.validate(valid => {
    if (!valid) {
      return false
    }
    loading.value = true
    store
      .dispatch('login', form)
      .then(res => {
        toast('登陆成功', 'success')
        router.push('/')
      })
      .finally(() => {
        loading.value = false
      })
  })
}

// 监听回车事件
function onKeyUp(e) {
  if (e.key == 'Enter') {
    onSubmit()
  }
}

</script>
```

## 登陆页面的函数

### 表单提交函数

```js
const onSubmit = () => {
  formRef.value.validate(valid => {
    if (!valid) {
      return false
    }
    loading.value = true
    store
      .dispatch('login', form)
      .then(res => {
        toast('登陆成功', 'success')
        router.push('/')
      })
      .finally(() => {
        loading.value = false
      })
  })
}
```

### 回车事件

```js
// 监听回车事件
function onKeyUp(e) {
  if (e.key == 'Enter') {
    onSubmit()
  }
}
```

### 键盘事件

```js
import {onMounted, onBeforeUnmount } from 'vue'

// 添加键盘监听
onMounted(() => {
  document.addEventListener('keyup', onKeyUp)
})
// 移除键盘监听
onBeforeUnmount(() => {
  document.removeEventListener('keyup', onKeyUp)
})
```

## 登录页面api

### 登录

```js
export function login(username, password) {
  return axios.post('/admin/login', { username, password })
}
```

### 获取管理员信息和权限列表

```js
export function getInfo() {
  return axios.post('/admin/getinfo')
}
```

# 页面布局(src/layouts)

## 总布局

```vue
// src/layouts/admin.vue
<template>
  <el-container>
     // 头部
    <el-header>
      <f-header></f-header>
    </el-header>
	// 侧边
    <el-container>
      <el-aside :width="$store.state.asideWidth">
        <f-menu></f-menu>
      </el-aside>
      // 主容器
      <el-main>
        // 标签导航栏部分
        <f-tag-list></f-tag-list>
        // 主要内容
        <router-view v-slot="{Component}">
          // 过渡动画 加入淡入淡出效果
          <transition name="fade">
            // 页面缓存
            <keep-alive :max="10">
              <component :is="Component"></component>
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
        
    </el-container>
  </el-container>
</template>

<script setup>
import FHeader from './components/FHeader.vue'
import FMenu from './components/FMenu.vue'
import FTagList from './components/FTagList.vue'
</script>

<style scoped>
.el-aside {
  transition: all 0.2s;
}
.fade-enter-from {
  opacity: 0;
}
.fade-enter-to {
  opacity: 1;
}
.fade-leave-from {
  opacity: 1;
}
.fade-leave-to {
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s;
}
 // 进入动画延时
.fade-enter-active {
  transition-delay: 0.3s;
}
</style>
```

## 头部

```vue
// src/layouts/components/FHeader.vue
<template>
  <div class="f-header">
    // 左侧logo和名称
    <span class="logo">
      <el-icon class="mr-2">
        <ElemeFilled />
      </el-icon>
      马场郭德纲
    </span>
	
    // 收缩侧边栏
    <el-icon class="icon-btn" @click="$store.commit('handleAsideWidth')">
      <Fold v-if="$store.state.asideWidth == '250px'" />
      <Expand v-else />
    </el-icon>

    // 刷新
    <el-tooltip effect="dark" content="刷新" placement="bottom">
      <el-icon class="icon-btn" @click="handleRefresh">
        <Refresh />
      </el-icon>
    </el-tooltip>

    // 全屏
    <div class="ml-auto flex items-center">
      <el-tooltip effect="dark" content="全屏" placement="bottom">
        <el-icon class="icon-btn" @click="toggle">
          <FullScreen v-if="!isFullscreen" />
          <Aim v-else />
        </el-icon>
      </el-tooltip>
		
      // 头像和下拉菜单
      <el-dropdown class="dropdown" @command="handleCommand">
        <span class="flex items-center text-indigo-50">
          <el-avatar :size="25" :src="$store.state.user.avatar" class="mr-2" />
          {{ $store.state.user.username }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="rePassword">修改密码</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>

  <form-drawer ref="formDrawerRef" title="修改密码" destroyOnClose @submit="onSubmit">
    <el-form :model="form" :rules="formRules" ref="formRef" label-width="80px">
      <el-form-item prop="oldpassword" label="旧密码">
        <el-input v-model="form.oldpassword" placeholder="请输入旧密码">
        </el-input>
      </el-form-item>
      <el-form-item prop="password" label="新密码">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password>
        </el-input>
      </el-form-item>
      <el-form-item prop="repassword" label="确认密码">
        <el-input v-model="form.repassword" type="password" placeholder="请确认密码" show-password>
        </el-input>
      </el-form-item>
    </el-form>
  </form-drawer>

</template>

<script setup>
import { useFullscreen } from '@vueuse/core'
import FormDrawer from '~/components/FormDrawer.vue'
import { useRepassword, useLogout } from '~/composables/useManager.js'

const { isFullscreen, toggle } = useFullscreen()
const {
  formDrawerRef,
  form,
  formRules,
  formRef,
  onSubmit,
  openRePasswordForm
} = useRepassword()
const { handleLogout } = useLogout()

// 下拉菜单选项
const handleCommand = c => {
  switch (c) {
    case 'logout':
      handleLogout()
      break
    case 'rePassword':
      openRePasswordForm()
      break
    default:
      break
  }
}

// 刷新
function handleRefresh() {
  location.reload()
}
</script>

<style scoped>
.f-header {
  @apply flex items-center bg-indigo-700 text-light-50 fixed top-0 left-0 right-0;
  height: 64px;
  z-index: 1000;
}

.logo {
  width: 250px;
  @apply flex justify-center items-center text-xl font-thin;
}

.icon-btn {
  @apply flex justify-center items-center;
  width: 42px;
  height: 64px;
  cursor: pointer;
}
.icon-btn:hover {
  @apply bg-indigo-600;
}

.f-header .dropdown {
  height: 64px;
  cursor: pointer;
  @apply flex justify-center items-center mx-5;
}
</style>
```

### 头部方法

#### 刷新

```js
// 刷新
function handleRefresh() {
  location.reload()
}
```

#### 全屏

```js
import { useFullscreen } from '@vueuse/core'
const { isFullscreen, toggle } = useFullscreen()
```

#### 收缩侧边栏

```vue
<el-icon class="icon-btn" @click="$store.commit('handleAsideWidth')">
	<Fold v-if="$store.state.asideWidth == '250px'" />
	<Expand v-else />
</el-icon>

// 展开/收缩侧边栏
handleAsideWidth(state) {
	state.asideWidth = state.asideWidth == '250px' ? '64px' : '250px'
},
```

#### 下拉菜单

```js
// 下拉菜单选项
const handleCommand = c => {
  switch (c) {
    case 'logout':
      handleLogout()
      break
    case 'rePassword':
      openRePasswordForm()
      break
    default:
      break
  }
}
```

#### 退出登录

```js
import { logout, updatepassword } from '~/api/manager'

export function useLogout() {
  const router = useRouter()
  const store = useStore()
  function handleLogout() {
    showModal('是否要退出登录？').then((res) => {
      logout().finally(() => {
        store.dispatch('logout')
        // 跳转回登录页
        router.push('/login')
        // 提示退出登录成功
        toast('退出登录成功')
      })
    })
  }
  return {
    handleLogout,
  }
}
```

#### 修改密码

```js
import { logout, updatepassword } from '~/api/manager'

export function useRepassword() {
  const router = useRouter()
  const store = useStore()
  // 修改密码
  const formDrawerRef = ref(null)
  const form = reactive({
    oldpassword: '',
    password: '',
    repassword: '',
  })
  const rules = {
    oldpassword: [
      {
        required: true,
        message: '旧密码不能为空',
        trigger: 'blur',
      },
    ],
    password: [
      {
        required: true,
        message: '新密码不能为空',
        trigger: 'blur',
      },
    ],
    repassword: [
      {
        required: true,
        message: '确认密码不能为空',
        trigger: 'blur',
      },
    ],
  }

  const formRef = ref(null)
  const onSubmit = () => {
    formRef.value.validate((valid) => {
      if (!valid) {
        return false
      }
      formDrawerRef.value.showLoading()
      updatepassword(form)
        .then((res) => {
          toast('修改密码成功，请重新登录')
          store.dispatch('logout')
          // 跳转回登录页
          router.push('/login')
        })
        .finally(() => {
          formDrawerRef.value.hideLoading()
        })
    })
  }

  const openRePasswordForm = () => formDrawerRef.value.open()

  return {
    formDrawerRef,
    form,
    rules,
    formRef,
    onSubmit,
    openRePasswordForm,
  }
}
```

## 侧边

```vue
// src/layouts/components/FMenu.vue  
<template>
  <div class="f-menu" :style="{ width:$store.state.asideWidth }">
    // default-active：默认激活的index  collapse-transition:折叠动画  unique-opened：只能展开一个菜单
    <el-menu default-active="2" class="border-0" @select="handleSelect" :collapse="isCollapse" :collapse-transition="false" unique-opened  :default-active="defaultActive">
      <template v-for="(item,index) in asideMenus" :key="index">
        <el-sub-menu v-if="item.child&&item.child.length" :index="item.name">
            
          <template #title>
            <el-icon>
              <component :is="item.icon"></component>
            </el-icon>
            <span>{{item.name}}</span>
          </template>

          <el-menu-item v-for="(item2,index2) in item.child" :key="index2" :index="item2.frontpath">
            <el-icon>
              <component :is="item2.icon"></component>
            </el-icon>
            <span>{{item2.name}}</span>
          </el-menu-item>

        </el-sub-menu>

        <el-menu-item v-else :index="item.frontpath">
          <el-icon>
            <component :is="item.icon"></component>
          </el-icon>
          <span>{{item.name}}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup>
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
const router = useRouter()
const route = useRoute()
const store = useStore()

// 默认选中
const defaultActive = ref(route.path)

// 监听路由变化
onBeforeRouteUpdate((to, from) => {
  defaultActive.value = to.path
})

// 是否折叠
const isCollapse = computed(() => !(store.state.asideWidth == '250px'))
// 菜单列表
const asideMenus = computed(() => store.state.menus)

const handleSelect = e => {
  router.push(e)
}
</script>

<style scoped>
.f-menu {
  transition: all 0.2s;
  top: 64px;
  bottom: 0;
  left: 0;
  overflow-y: auto;
  overflow-x: hidden;
  @apply shadow-md fixed bg-light-50;
}
// 隐藏滚动条
.f-menu::-webkit-scrollbar {
  width: 0;
}
</style>
```

## 标签导航栏

```vue
// src/layouts/components/FTagList.vue
<template>
  <div class="f-tag-list" :style="{left:$store.state.asideWidth}">
    // 标签导航栏
    <el-tabs v-model="activeTab" type="card" class="flex-1" @tab-remove="removeTab" style="min-width:100px" @tab-change="changeTab">
      <el-tab-pane v-for="item in tabList" :key="item.path" :label="item.title" :name="item.path" :closable="item.path!='/'">
      </el-tab-pane>
    </el-tabs>
	// 下拉菜单框
    <span class="tag-btn">
      <el-dropdown @command="handleClose">
        <span class="el-dropdown-link">
          <el-icon>
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="clearOther">关闭其他</el-dropdown-item>
            <el-dropdown-item command="clearAll">全部关闭</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </span>
  </div>
  <div style="height:44px;"></div>
</template>

<script setup>
import { useTabList } from '~/composables/useTabList.js'

const { activeTab, tabList, changeTab, removeTab, handleClose } = useTabList()
</script>

<style scoped>
.f-tag-list {
  @apply fixed bg-gray-100 flex items-center px-2;
  top: 64px;
  right: 0;
  height: 44px;
  z-index: 100;
}
.tag-btn {
  @apply bg-white rounded ml-auto flex justify-center items-center px-2;
  height: 32px;
  width: 32px;
}
:deep(.el-tabs__header) {
  border: 0 !important;
  margin-bottom: -3px;
}
:deep(.el-tabs__nav) {
  border: 0 !important;
}
:deep(.el-tabs__item) {
  border: 0 !important;
  height: 32px;
  line-height: 32px;
  @apply bg-white mx-1 rounded;
}
:deep(.el-tabs__nav-next),
:deep(.el-tabs__nav-prev) {
  line-height: 32px;
  height: 32px;
}
:deep(.is-disabled) {
  cursor: not-allowed;
  @apply text-gray-300;
}
</style>
```

# 后台主页

```vue
<template>
  <el-row :gutter="20" v-permission="['getStatistics1,GET']">
    <template v-if="panels.length == 0">
      <el-col :span="6" v-for="i in 4" :key="i">
        // 骨架屏
        <el-skeleton style="width: 100%" animated loading>
          <template #template>
            <el-card shadow="hover" class="border-0">
              <template #header>
                <div class="flex justify-between">
                  <el-skeleton-item variant="text" style="width: 50%" />
                  <el-skeleton-item variant="text" style="width: 10%" />
                </div>
              </template>
              <el-skeleton-item variant="h3" style="width: 80%" />
              <el-divider></el-divider>
              <div class="flex justify-between text-sm text-gray-500">
                <el-skeleton-item variant="text" style="width: 50%" />
                <el-skeleton-item variant="text" style="width: 10%" />
              </div>
            </el-card>
          </template>
        </el-skeleton>
      </el-col>
    </template>

    <el-col :span="6" :offset="0" v-for="(item,index) in panels" :key="index">
      <el-card shadow="hover" class="border-0">
        // 头部
        <template #header>
          <div class="flex justify-between">
            <span class="text-sm">{{ item.title }}</span>
            <el-tag :type="item.unitColor" effect="plain">
              {{ item.unit }}
            </el-tag>
          </div>
        </template>
        // 中间大数字
        <span class="text-3xl font-bold text-gray-500">
          <CountTo :value="item.value"></CountTo>
        </span>
        <el-divider></el-divider>
        <div class="flex justify-between text-sm text-gray-500">
          <span>{{ item.subTitle }}</span>
          <span>{{ item.subValue }}</span>
        </div>
        <!-- card body -->
      </el-card>
    </el-col>
  </el-row>

  <IndexNav></IndexNav>

  <el-row :gutter="20" class="mt-5">
    <el-col :span="12" :offset="0">
      // v-permission自定义指令 只有含有此函数才会启用该组件，否则删除该组件
      <IndexChart v-permission="['getStatistics3,GET']"></IndexChart>
    </el-col>
    <el-col :span="12" :offset="0" v-permission="['getStatistics2,GET']">
      <IndexCard title="店铺及商品提示" tip="店铺及商品提示" :btns="goods" class="mb-3"></IndexCard>
      <IndexCard title="交易提示" tip="需要立即处理的交易订单" :btns="order"></IndexCard>
    </el-col>
  </el-row>

</template>

<script setup>
import { ref } from 'vue'
import { getStatistics1, getStatistics2 } from '~/api/index.js'
import CountTo from '~/components/CountTo.vue'
import IndexNav from '~/components/IndexNav.vue'
import IndexChart from '~/components/IndexChart.vue'
import IndexCard from '~/components/IndexCard.vue'

const panels = ref([])
// 获取支付订单，订单量，销售额，新增用户的列表
getStatistics1().then(res => {
  panels.value = res.panels
})

const goods = ref([])
const order = ref([])
getStatistics2().then(res => {
  goods.value = res.goods
  order.value = res.order
})
</script>

<style>
</style>
```

## 根据权限不同看到不同页面

```js
// directives/permission.js
import store from '~/store'

function hasPermissiom(value, el = false) {
  if (!Array.isArray(value)) {
    throw new Error('需要配置权限')
  }
  // 判断rulenames数组中是否含有此权限
  const hasAuth = value.findIndex((v) => store.state.ruleNames.includes(v)) != -1
  // 如果含有此节点，但是没有此权限，则移除该节点
  if (el && !hasAuth) {
    el.parentNode && el.parentNode.removeChild(el)
  }
  return hasAuth
}

export default {
  install(app) {
    // app就是在main.js创建的app
    app.directive('permission', {
      mounted(el, binding) {
        // el 为该节点
        // binding.value = ['getStatistics3,GET']
        hasPermissiom(binding.value, el)
      },
    })
  },
}

```

# 图库页面

```vue
// image/list.vue 
<template>
  <el-container class="bg-white rounded" :style="{height:(h+'px')}">
    <el-header class="image-header">
      <el-button type="primary" size="small" @click="handleOpenCreate">
        新增图片分类
      </el-button>
      <el-button type="warning" size="small" @click="handleOpenUpload">
        上传图片
      </el-button>
    </el-header>
      
    <el-container>
      <ImageAside ref="ImageAsideRef" @change="handleAsideChange"></ImageAside>
      <ImageMain ref="imageMainRef"></ImageMain>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import ImageAside from '~/components/ImageAside.vue'
import ImageMain from '~/components/ImageMain.vue'

// 获取浏览器高度
const windowHeight = window.innerHeight || document.body.clientHeight
const h = windowHeight - 64 - 44 - 40

const ImageAsideRef = ref(null)
// 新建图片
const handleOpenCreate = () => ImageAsideRef.value.handleCreate()

const imageMainRef = ref(null)
// 监听菜单切换
const handleAsideChange = image_class_id => {
  imageMainRef.value.loadData(image_class_id)
}
// 上传图片
const handleOpenUpload = () => {
  imageMainRef.value.openUploadFile()
}
</script>

<style scoped>
.image-header {
  border-bottom: 1px solid #eee;
  @apply flex items-center;
}

.image-aside {
  border-right: 1px solid #eee;
  position: relative;
}
.image-main {
  position: relative;
}
.image-aside .top,
.image-main .top {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 50px;
  overflow-y: auto;
}
.image-aside .bottom,
.image-main .bottom {
  position: absolute;
  bottom: 0;
  height: 50px;
  left: 0;
  right: 0;
  @apply flex items-center justify-center;
}
</style>
```

# 公告页面

```vue
// pages/notice/list.vue
<template>
  <el-card shadow="never" class="border-0">
    <!-- 新增，刷新 -->
    <ListHeader @create="handleCreate" @refresh="getData"></ListHeader>
	
    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="title" label="公告标题" />
      <el-table-column prop="create_time" label="发布时间" width="380" />
      <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" text @click="handleEdit(scope.row)">修改</el-button>
          <el-popconfirm title="是否要删除该分告" confirm-button-text="确认" cancel-button-text="取消" @confirm="handleDelete(scope.row.id)">
            <template #reference>
              <el-button type="primary" size="small" text @click="">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex items-center justify-center mt-5">
      <el-pagination background layout="prev,pager, next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData"></el-pagination>
    </div>

    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
        <el-form-item label="公告标题" prop="title">
          <el-input v-model="form.title" placeholder="公告标题"></el-input>
        </el-form-item>
        <el-form-item label="公告内容" prop="content">
          <el-input v-model="form.content" placeholder="公告内容" type="textarea" :rows="5"></el-input>
        </el-form-item>
      </el-form>
    </FormDrawer>
  </el-card>

</template>

<script setup>
import {
  getNoticeList,
  createNotice,
  updateNotice,
  deleteNotice
} from '~/api/notice'
import FormDrawer from '~/components/FormDrawer.vue'
import { useInitTable, useInitForm } from '~/composables/useCommon.js'
import ListHeader from '~/components/ListHeader.vue'

const { tableData, loading, currentPage, total, limit, getData, handleDelete } =
  useInitTable({
    getList: getNoticeList,
    delete: deleteNotice
  })

const {
  formDrawerRef,
  formRef,
  form,
  rules,
  drawerTitle,
  handleSubmit,
  handleCreate,
  handleEdit
} = useInitForm({
  form: {
    title: '',
    content: ''
  },
  rules: {
    title: [{ required: true, message: '公告标题不能为空', trigger: 'blur' }],
    content: [{ required: true, message: '公告内容不能为空', trigger: 'blur' }]
  },
  getData,
  update: updateNotice,
  create: createNotice
})
</script>

<style>
</style>
```

# 管理员页面

```vue
// manager/list.vue
<template>
  <el-card shadow="never" class="border-0">
    <!-- 搜索 -->
    <Search @search="getData" @reset="resetSearchForm" :model="searchForm">
      <SearchItem label="管理员名称">
        <el-input v-model="searchForm.keyword" placeholder="管理员昵称" clearable></el-input>
      </SearchItem>
    </Search>

    <!-- 新增，刷新 -->
    <ListHeader @create="handleCreate" @refresh="getData"></ListHeader>

    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column label="管理员" width="200">
        <template #default="{row}">
          <div class="flex items-center">
            <el-avatar :size="60" :src="row.avatar">
              <img />
            </el-avatar>
            <div class="ml-3">
              <h6>{{ row.username }}</h6>
              <small>ID:{{ row.id }}</small>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="所属角色" align="center">
        <template #default="{row}">
          {{ row.role?.name || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template #default="{row}">
          <el-switch :model-value="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange($event,row)" :loading="row.statusLoading" :disabled="row.super == 1">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
          <small v-if="scope.row.super == 1" class="text-sm text-gray-500">暂无操作</small>
          <div v-else>
            <el-button type="primary" size="small" text @click="handleEdit(scope.row)">修改</el-button>
            <el-popconfirm title="是否要删除该管理员?" confirm-button-text="确认" cancel-button-text="取消" @confirm="handleDelete(scope.row.id)">
              <template #reference>
                <el-button type="primary" size="small" text @click="">删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex items-center justify-center mt-5">
      <el-pagination background layout="prev,pager, next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData"></el-pagination>
    </div>

    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" placeholder="密码"></el-input>
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <ChooseImage></ChooseImage>
        </el-form-item>
        <el-form-item label="所属角色" prop="role_id">
          <el-select v-model="form.role_id" placeholder="选择所属角色">
            <el-option v-for="item in roles" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="content">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0">
          </el-switch>
        </el-form-item>
      </el-form>
    </FormDrawer>
  </el-card>

</template>

<script setup>
import { ref } from 'vue'
import {
  getManagerList,
  updateManagerStatus,
  createManager,
  updateManager,
  deleteManager
} from '~/api/manager'
import FormDrawer from '~/components/FormDrawer.vue'
import ChooseImage from '~/components/ChooseImage.vue'
import { useInitTable, useInitForm } from '~/composables/useCommon.js'
import ListHeader from '~/components/ListHeader.vue'
import Search from '~/components/Search.vue'
import SearchItem from '~/components/SearchItem.vue'

const roles = ref([])
const {
  searchForm,
  resetSearchForm,
  tableData,
  loading,
  currentPage,
  total,
  limit,
  getData,
  handleDelete,
  handleStatusChange
} = useInitTable({
  searchForm: { keyword: '' },
  getList: getManagerList,
  onGetListSuccess: res => {
    tableData.value = res.list.map(o => {
      o.statusLoading = false
      return o
    })
    total.value = res.totalCount
    roles.value = res.roles
  },
  delete: deleteManager,
  updateStatus: updateManagerStatus
})

const {
  formDrawerRef,
  formRef,
  form,
  rules,
  drawerTitle,
  handleSubmit,
  handleCreate,
  handleEdit
} = useInitForm({
  form: {
    username: '',
    password: '',
    role_id: 0,
    status: 1,
    avatar: ''
  },
  getData,
  update: updateManager,
  create: createManager
})
</script>

<style>
</style>
```

## 权限管理

```vue
// access/list.vue
<template>
  <el-card shadow="never" class="">
    // 新增，刷新
    <ListHeader @refresh="getData" @create="handleCreate"></ListHeader>
    // 树形组件 default-expanded-keys: 默认展开一级菜单 node-key: 树节点的唯一标识
    <el-tree :data="tableData" :props="{label:'name',children:'child'}" v-loading='loading' node-key="id" :default-expanded-keys="defaultExpandedKeys">
      <template #default="{node,data}">
        <div class="custom-tree-node"> 
          <el-tag size="small" :type="data.menu?'':'info'">{{ data.menu?'菜单':'权限' }}</el-tag>
          <el-icon v-if="data.icon" :size="16" class="ml-2">
            <component :is="data.icon"></component>
          </el-icon>
          <span>{{ data.name }}</span>
          <div class="ml-auto">
            <el-switch :model-value="data.status" :active-value="1" :inactive-value="0" @change="handleStatusChange($event,data)">
            </el-switch>
            <el-button type="primary" size="small" text @click.stop="handleEdit(data)">修改</el-button>
            <el-button type="primary" size="small" text @click.stop="addChild(data.id)">增加</el-button>
            <el-popconfirm title="是否要删除该记录?" confirm-button-text="确认" cancel-button-text="取消" @confirm="handleDelete(data.id)">
              <template #reference>
                <el-button type="primary" size="small" text @click="">删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </template>
    </el-tree>

    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
        // 级联选择器 checkStrictly：是否严格遵守父子节点互不相连 emitPath：只返回节点的值
        <el-form-item label="上级菜单" prop="rule_id">
          <el-cascader :options="options" v-model="form.rule_id" :props="{label:'name',children:'child',checkStrictly:true,emitPath:false,value:'id'}" clearable placeholder="请选择上级菜单"></el-cascader>
        </el-form-item>
        // 单选框
        <el-form-item label="菜单/规则" prop="menu">
          <el-radio-group v-model="form.menu">
            <el-radio :label="1" border>菜单</el-radio>
            <el-radio :label="0" border>规则</el-radio>
          </el-radio-group>
        </el-form-item>
        // 名称
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" style="width:30%;" placeholder="名称"></el-input>
        </el-form-item>
        // 自选图标
        <el-form-item label="菜单图标" prop="icon" v-if="form.menu == 1">
          <IconSelete v-model="form.icon"></IconSelete>
        </el-form-item>
        // 前端路由
        <el-form-item label="前端路由" prop="frontpath" v-if="form.menu == 1 && form.rule_id">
          <el-input v-model="form.frontpath" placeholder="前端路由"></el-input>
        </el-form-item>
        // 后端规则
        <el-form-item label="后端规则" prop="condition" v-if="form.menu == 0">
          <el-input v-model="form.condition" placeholder="后端规则"></el-input>
        </el-form-item>
        // 下拉框
        <el-form-item label="请求方式" prop="method" v-if="form.menu == 0">
          <el-select v-model="form.method" class="m-2" placeholder="请选择请求方式">
            <el-option v-for="item in ['GET','POST','PUT','DELETE']" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        // 数字输入框
        <el-form-item label="排序" prop="order">
          <el-input-number v-model="form.order" :min="0" :max="1000"></el-input-number>
        </el-form-item>
      </el-form>
    </FormDrawer>
  </el-card>

</template>
<script setup>
import { ref } from 'vue'
import ListHeader from '~/components/ListHeader.vue'
import {
  getRuleList,
  createRule,
  updateRule,
  updateRuleStatus,
  deleteRule
} from '~/api/rule.js'
import { useInitTable, useInitForm } from '~/composables/useCommon.js'
import FormDrawer from '~/components/FormDrawer.vue'
import IconSelete from '~/components/IconSelete.vue'

// 存储权限数据 res.rules
const options = ref([])
const defaultExpandedKeys = ref([])
const { tableData, loading, getData, handleDelete, handleStatusChange } =
  useInitTable({
    getList: getRuleList,
    onGetListSuccess: res => {
      options.value = res.rules
      tableData.value = res.list
      defaultExpandedKeys.value = res.list.map(o => o.id)
    },
    delete: deleteRule,
    updateStatus: updateRuleStatus
  })
const {
  formDrawerRef,
  formRef,
  form,
  rules,
  drawerTitle,
  handleSubmit,
  handleCreate,
  handleEdit
} = useInitForm({
  form: {
    rule_id: 0,
    menu: 0,
    name: '',
    condition: '',
    method: 'GET',
    status: 1,
    order: 50,
    icon: '',
    frontpath: ''
  },
  rules: {},
  getData,
  update: updateRule,
  create: createRule
})

// 添加子菜单 
const addChild = id => {
  handleCreate()
  form.rule_id = id
  form.status = 1
}
</script>

<style>
.custom-tree-node {
  display: flex;
  flex: 1;
  align-items: center;
  font-size: 14px;
  padding-right: 14px;
}
.el-tree-node__content {
  padding: 20px 0;
}
</style>
```

## 角色模块

```vue
// role/list.vue
<template>
  <el-card shadow="never" class="border-0">
    <!-- 新增，刷新 -->
    <ListHeader @create="handleCreate" @refresh="getData"></ListHeader>

    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="角色名称" />
      <el-table-column prop="desc" label="角色描述" width="380" />
      <el-table-column label="状态" width="120">
        <template #default="{row}">
          <el-switch :model-value="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange($event,row)" :loading="row.statusLoading" :disabled="row.super == 1">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" text @click="openSetRule(scope.row)">配置权限</el-button>
          <el-button type="primary" size="small" text @click="handleEdit(scope.row)">修改</el-button>

          <el-popconfirm title="是否要删除该分告" confirm-button-text="确认" cancel-button-text="取消" @confirm="handleDelete(scope.row.id)">
            <template #reference>
              <el-button type="primary" size="small" text @click="">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex items-center justify-center mt-5">
      <el-pagination background layout="prev,pager, next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData"></el-pagination>
    </div>
	<!-- 修改 -->
    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.title" placeholder="角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="desc">
          <el-input v-model="form.content" placeholder="角色描述" type="textarea" :rows="5"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model='form.status' :active-value="1" :inactive-value="0">
          </el-switch>
        </el-form-item>
      </el-form>
    </FormDrawer>

    <!-- 权限配置 -->
    <FormDrawer ref="setRuleformDrawerRef" title="权限配置" @submit="handleSetRuleSubmit">
      // 虚拟化树形控件 check-strictly：遵循父子不互相关联
      <el-tree-v2 node-key="id" :default-expanded-keys="defaultExpandedKeys" :props="{label:'name',children:'child'}" :data="ruleList" show-checkbox :height="treeHeight" ref="elTreeRef" @check="handleTreeCheck" :check-strictly="checkStrictly">
        <template #default="{node,data}">
          <div class="flex items-center">
            <el-tag size="small" :type="data.menu?'':'info'">{{ data.menu?'菜单':'权限' }}</el-tag>
            <span class="ml-2 text-sm">{{ data.name }}</span>
          </div>
        </template>
      </el-tree-v2>
    </FormDrawer>
  </el-card>

</template>

<script setup>
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  updateRoleStatus,
  setRoleRules
} from '~/api/role'
import FormDrawer from '~/components/FormDrawer.vue'
import { useInitTable, useInitForm } from '~/composables/useCommon.js'
import ListHeader from '~/components/ListHeader.vue'
import { ref } from 'vue'
import { getRuleList } from '~/api/rule.js'
import { toast } from '~/composables/util.js'

const {
  tableData,
  loading,
  currentPage,
  total,
  limit,
  getData,
  handleDelete,
  handleStatusChange
} = useInitTable({
  getList: getRoleList,
  delete: deleteRole,
  updateStatus: updateRoleStatus
})

const {
  formDrawerRef,
  formRef,
  form,
  rules,
  drawerTitle,
  handleSubmit,
  handleCreate,
  handleEdit
} = useInitForm({
  form: {
    name: '',
    desc: '',
    status: 1
  },
  rules: {
    name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }]
  },
  getData,
  update: updateRole,
  create: createRole
})

const setRuleformDrawerRef = ref(null)
// 权限数据
const ruleList = ref([])
// 树形控件的高度
const treeHeight = ref(0)
const roleId = ref(0)
const defaultExpandedKeys = ref([])
// 树形控件的ref
const elTreeRef = ref(null)
// 当前角色拥有的权限ID
const ruleIds = ref([])
// 父子是否关联
const checkStrictly = ref(false)

// 配置权限
const openSetRule = row => {
  // 当前角色id
  roleId.value = row.id
  treeHeight.value = window.innerHeight - 180
  checkStrictly.value = true
  getRuleList(1).then(res => {
    ruleList.value = res.list
    defaultExpandedKeys.value = res.list.map(o => o.id)
    setRuleformDrawerRef.value.open()
    // 当前角色拥有的权限id
    ruleIds.value = row.rules.map(o => o.id)
    setTimeout(() => {
      // 默认选中功能
      elTreeRef.value.setCheckedKeys(ruleIds.value)
      // 默认选中展示完后，恢复父子关联
      checkStrictly.value = false
    }, 150)
  })
}
// 权限配置提交事件
const handleSetRuleSubmit = () => {
  setRuleformDrawerRef.value.showLoading()
  setRoleRules(roleId.value, ruleIds.value)
    .then(res => {
      toast('配置成功')
      getData()
      setRuleformDrawerRef.value.close()
    })
    .finally(() => {
      setRuleformDrawerRef.value.hideLoading()
    })
}
// 选中事件
const handleTreeCheck = (...e) => {
  // 拿到选中的权限的key值和父亲权限的值
  const { checkedKeys, halfCheckedKeys } = e[1]
  ruleIds.value = [...checkedKeys, ...halfCheckedKeys]
}
</script>

<style>
</style>
```

# 商品管理

```vue
// goods/list.vue
<template>
  <div>
    // tab栏
    <el-tabs v-model="searchForm.tab" @tab-change="getData">
      <el-tab-pane :label="item.name" :name="item.key" v-for="(item, index) in tabbars" :key="index"></el-tab-pane>
    </el-tabs>

    <el-card shadow="never" class="border-0">
      <!-- 高级搜索 -->
      <Search :model="searchForm" @search="getData" @reset="resetSearchForm">
        <SearchItem label="关键词">
          <el-input v-model="searchForm.title" placeholder="商品名称" clearable></el-input>
        </SearchItem>
        <template #show>
          <SearchItem label="商品分类">
            <el-select v-model="searchForm.category_id" placeholder="请选择商品分类" clearable>
              <el-option v-for="item in category_list" :key="item.id" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
          </SearchItem>
        </template>
      </Search>

      <!-- 新增|刷新|删除|上架|下架 -->
      <ListHeader layout="create,refresh" @create="handleCreate" @refresh="getData">
        <el-button type="danger" size="small" @click="handleMultiDelete" v-if="searchForm.tab != 'delete'">批量删除</el-button>
        <el-button type="warning" size="small" @click="handleRestoreGoods" v-else>恢复商品</el-button>
        <el-popconfirm v-if="searchForm.tab == 'delete'" title="是否要彻底删除该商品？" confirmButtonText="确认" cancelButtonText="取消" @confirm="handleDestroyGoods">
          <template #reference>
            <el-button type="danger" size="small">彻底删除</el-button>
          </template>
        </el-popconfirm>
        <el-button size="small" @click="handleMultiStatusChange(1)" v-if="searchForm.tab == 'all' || searchForm.tab == 'off'">上架</el-button>
        <el-button size="small" @click="handleMultiStatusChange(0)" v-if="searchForm.tab == 'all' || searchForm.tab == 'saling'">下架</el-button>
      </ListHeader>

	  // 表格区域
      <el-table ref="multipleTableRef" @selection-change="handleSelectionChange" :data="tableData" stripe style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" />
        // 商品介绍
        <el-table-column label="商品" width="300">
          <template #default="{ row }">
            <div class="flex">
              <el-image class="mr-3 rounded" :src="row.cover" fit="cover" :lazy="true" style="width:50px;height: 50px;">
              </el-image>
              <div class="flex-1">
                <p>{{ row.title }}</p>
                <div>
                  <span class="text-rose-500">￥{{ row.min_price }}</span>
                  // 分割线
                  <el-divider direction="vertical" />
                  <span class="text-gray-500 text-xs">￥{{ row.min_oprice }}</span>
                </div>
                <p class="text-gray-400 text-xs mb-1">分类:{{ row.category ? row.category.name : "未分类" }}</p>
                <p class="text-gray-400 text-xs">创建时间：{{ row.create_time }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        // 销量
        <el-table-column label="实际销量" width="70" prop="sale_count" align="center" />
        // 商品状态
        <el-table-column label="商品状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'" size="small">{{ row.status ? '上架' : '仓库' }}</el-tag>
          </template>
        </el-table-column>
        // 审核状态
        <el-table-column label="审核状态" width="120" align="center" v-if="searchForm.tab != 'delete'">
          <template #default="{ row }">
            <div class="flex flex-col" v-if="row.ischeck == 0">
              <el-button type="success" size="small" plain>审核通过</el-button>
              <el-button class="mt-2 !ml-0" type="danger" size="small" plain>审核拒绝</el-button>
            </div>
            <span v-else>{{ row.ischeck == 1 ? '通过' : '拒绝' }}</span>
          </template>
        </el-table-column>
        // 库存
        <el-table-column label="总库存" width="90" prop="stock" align="center" />
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <div v-if="searchForm.tab != 'delete'">
              <el-button class="px-1" type="primary" size="small" text @click="handleEdit(scope.row)">修改</el-button>
              <el-button class="px-1" :type=" (scope.row.sku_type == 0 && !scope.row.sku_value) || (scope.row.sku_type == 1 && !scope.row.goods_skus.length) ? 'danger' : 'primary'" size="small" text :loading="scope.row.skusLoading" @click="handleSetGoodsSkus(scope.row)">商品规格</el-button>
              // 未设置过则显示红色
              <el-button class="px-1" :type="scope.row.goods_banner.length == 0 ? 'danger' : 'primary'" size="small" text @click="handleSetGoodsBanners(scope.row)" :loading="scope.row.bannersLoading">设置轮播图</el-button>
                
              <el-button class="px-1" :type="!scope.row.content ? 'danger' : 'primary'" size="small" text @click="handleSetGoodsContent(scope.row)" :loading="scope.row.contentLoading">商品详情</el-button>
                
              <el-popconfirm title="是否要删除该商品？" confirmButtonText="确认" cancelButtonText="取消" @confirm="handleDelete([scope.row.id])">
                <template #reference>
                  <el-button class="px-1" text type="primary" size="small">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
            <span v-else>暂无操作</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex items-center justify-center mt-5">
        <el-pagination background layout="prev, pager ,next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData" />
      </div>

      <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
        <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
          <el-form-item label="商品名称" prop="title">
            <el-input v-model="form.title" placeholder="请输入商品名称，不能超过60个字符"></el-input>
          </el-form-item>
          <el-form-item label="封面" prop="cover">
            <ChooseImage v-model="form.cover" />
          </el-form-item>
          <el-form-item label="商品分类" prop="category_id">
            <el-select v-model="form.category_id" placeholder="选择所属商品分类">
              <el-option v-for="item in category_list" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="商品描述" prop="desc">
            <el-input type="textarea" v-model="form.desc" placeholder="选填，商品卖点"></el-input>
          </el-form-item>
          <el-form-item label="单位" prop="unit">
            <el-input v-model="form.unit" placeholder="请输入单位" style="width:50%;"></el-input>
          </el-form-item>
          <el-form-item label="总库存" prop="stock">
            <el-input v-model="form.stock" type="number" style="width:40%;">
              <template #append>件</template>
            </el-input>
          </el-form-item>
          <el-form-item label="库存预警" prop="min_stock">
            <el-input v-model="form.min_stock" type="number" style="width:40%;">
              <template #append>件</template>
            </el-input>
          </el-form-item>
          <el-form-item label="最低销售价" prop="min_price">
            <el-input v-model="form.min_price" type="number" style="width:40%;">
              <template #append>元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="最低原价" prop="min_oprice">
            <el-input v-model="form.min_oprice" type="number" style="width:40%;">
              <template #append>元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="库存显示" prop="stock_display">
            <el-radio-group v-model="form.stock_display">
              <el-radio :label="0">隐藏</el-radio>
              <el-radio :label="1">显示</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="是否上架" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="0">放入仓库</el-radio>
              <el-radio :label="1">立即上架</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </FormDrawer>
    </el-card>

	// 设置完后自动刷新
    <banners ref="bannersRef" @reload-data="getData" />
    <content ref="contentRef" @reload-data="getData" />
    <skus ref="skusRef" @reload-data="getData" />

  </div>
</template>
<script setup>
import { ref } from 'vue'
import ListHeader from '~/components/ListHeader.vue'
import FormDrawer from '~/components/FormDrawer.vue'
import ChooseImage from '~/components/ChooseImage.vue'
import Search from '~/components/Search.vue'
import SearchItem from '~/components/SearchItem.vue'
import banners from './banners.vue'
import content from './content.vue'
import skus from './skus.vue'
import {
  getGoodsList,
  updateGoodsStatus,
  createGoods,
  updateGoods,
  deleteGoods,
  restoreGoods,
  destroyGoods
} from '~/api/goods'
import { getCategoryList } from '~/api/category'
import { useInitTable, useInitForm } from '~/composables/useCommon.js'
import { toast } from '~/composables/util'

const {
  handleSelectionChange,
  multipleTableRef,
  handleMultiDelete,
  searchForm,
  resetSearchForm,
  tableData,
  loading,
  currentPage,
  total,
  limit,
  getData,
  handleDelete,
  handleMultiStatusChange,
  multiSelectionIds
} = useInitTable({
  searchForm: {
    title: '',
    tab: 'all',
    category_id: null
  },
  getList: getGoodsList,
  onGetListSuccess: res => {
    tableData.value = res.list.map(o => {
      // 给设置轮播图按钮添加loading
      o.bannersLoading = false
      o.contentLoading = false
      o.skusLoading = false
      return o
    })
    total.value = res.totalCount
  },
  delete: deleteGoods,
  updateStatus: updateGoodsStatus
})

const {
  formDrawerRef,
  formRef,
  form,
  rules,
  drawerTitle,
  handleSubmit,
  handleCreate,
  handleEdit
} = useInitForm({
  form: {
    title: null, //商品名称
    category_id: null, //商品分类
    cover: null, //商品封面
    desc: null, //商品描述
    unit: '件', //商品单位
    stock: 100, //总库存
    min_stock: 10, //库存预警
    status: 1, //是否上架 0仓库1上架
    stock_display: 1, //库存显示 0隐藏1显示
    min_price: 0, //最低销售价
    min_oprice: 0 //最低原价
  },
  getData,
  update: updateGoods,
  create: createGoods
})

const tabbars = [
  {
    key: 'all',
    name: '全部'
  },
  {
    key: 'checking',
    name: '审核中'
  },
  {
    key: 'saling',
    name: '出售中'
  },
  {
    key: 'off',
    name: '已下架'
  },
  {
    key: 'min_stock',
    name: '库存预警'
  },
  {
    key: 'delete',
    name: '回收站'
  }
]

// 商品分类
const category_list = ref([])
getCategoryList().then(res => (category_list.value = res))

// 设置轮播图
const bannersRef = ref(null)
const handleSetGoodsBanners = row => bannersRef.value.open(row)

// 设置商品详情
const contentRef = ref(null)
const handleSetGoodsContent = row => contentRef.value.open(row)

// 设置商品规格
const skusRef = ref(null)
const handleSetGoodsSkus = row => skusRef.value.open(row)
// 批量恢复商品
const handleRestoreGoods = () => useMultiAction(restoreGoods, '恢复')
// 彻底删除
const handleDestroyGoods = () => useMultiAction(destroyGoods, '彻底删除')

function useMultiAction(func, msg) {
  loading.value = true
  func(multiSelectionIds.value)
    .then(res => {
      toast(msg + '成功')
      // 清空选中
      if (multipleTableRef.value) {
        multipleTableRef.value.clearSelection()
      }
      getData()
    })
    .finally(() => {
      loading.value = false
    })
}
</script>
```

## 设置商品轮播图

```vue
// goods/banners.vue
<template>
  <el-drawer title="设置轮播图" v-model="dialogVisible" size="50%" destroy-on-close>
    <el-form :model="form" label-width="80px">
      <el-form-item label="轮播图">
        <ChooseImage :limit="9" v-model="form.banners" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit" :loading="loading">提交</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup>
import { ref, reactive } from 'vue'
import ChooseImage from '~/components/ChooseImage.vue'
import { readGoods, setGoodsBanner } from '~/api/goods'
import { toast } from '~/composables/util'

const dialogVisible = ref(false)
const form = reactive({
  banners: []
})

const goodsId = ref(0)
// 打开
const open = row => {
  // 商品id
  goodsId.value = row.id
  row.bannersLoading = true
  readGoods(goodsId.value)
    .then(res => {
      form.banners = res.goodsBanner.map(o => o.url)
      dialogVisible.value = true
    })
    .finally(() => {
      row.bannersLoading = false
    })
}
// 重新刷新
const emit = defineEmits(['reloadData'])
const loading = ref(false)
const submit = () => {
  loading.value = true
  setGoodsBanner(goodsId.value, form)
    .then(res => {
      toast('设置轮播图成功')
      dialogVisible.value = false
      emit('reloadData')
    })
    .finally(() => {
      loading.value = false
    })
}

defineExpose({
  open
})
</script>
```

## 修改商品详情

```vue
// content.vue
<template>
  <FormDrawer ref="formDrawerRef" title="设置商品详情" @submit="submit" destroy-on-close>
    <el-form :model="form">
      <el-form-item>
        <Editor v-model="form.content" />
      </el-form-item>
    </el-form>
  </FormDrawer>
</template>

<script setup>
import { ref, reactive } from 'vue'
import FormDrawer from '~/components/FormDrawer.vue'
import Editor from '~/components/Editor.vue'
import { readGoods, updateGoods } from '~/api/goods'
import { toast } from '~/composables/util'

const formDrawerRef = ref(null)
const form = reactive({
  content: ''
})

const goodsId = ref(0)
const open = row => {
  goodsId.value = row.id
  row.contentLoading = true
  readGoods(goodsId.value)
    .then(res => {
      form.content = res.content
      formDrawerRef.value.open()
    })
    .finally(() => {
      row.contentLoading = false
    })
}
const emit = defineEmits(['reloadData'])

const submit = () => {
  formDrawerRef.value.showLoading()
  updateGoods(goodsId.value, form)
    .then(res => {
      toast('设置商品详情成功')
      formDrawerRef.value.close()
      emit('reloadData')    
    })
    .finally(() => {
      formDrawerRef.value.hideLoading()
    })
}

defineExpose({
  open
})
</script>

```

## 更新商品规格

```vue
// skus.vue
<template>
  <FormDrawer ref="formDrawerRef" title="设置商品规格" @submit="submit" destroy-on-close size="70%">
    <el-form :model="form">
      <el-form-item label="规格类型">
        <el-radio-group v-model="form.sku_type">
          <el-radio :label="0">单规格</el-radio>
          <el-radio :label="1">多规格</el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="form.sku_type === 0">
        <el-form-item label="市场价格">
          <el-input v-model="form.sku_value.oprice" style="width:35%;">
            <template #append>元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="销售价格">
          <el-input v-model="form.sku_value.pprice" style="width:35%;">
            <template #append>元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="成本价格">
          <el-input v-model="form.sku_value.cprice" style="width:35%;">
            <template #append>元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="商品重量">
          <el-input v-model="form.sku_value.weight" style="width:35%;">
            <template #append>公斤</template>
          </el-input>
        </el-form-item>
        <el-form-item label="商品体积">
          <el-input v-model="form.sku_value.volume" style="width:35%;">
            <template #append>立方米</template>
          </el-input>
        </el-form-item>
      </template>
      <template v-else>
        <SkuCard />
        <SkuTable />
      </template>
    </el-form>
  </FormDrawer>
</template>
<script setup>
import { ref, reactive } from 'vue'
import FormDrawer from '~/components/FormDrawer.vue'
import SkuCard from './components/SkuCard.vue'
import SkuTable from './components/SkuTable.vue'
import { readGoods, updateGoodsSkus } from '~/api/goods'
import { toast } from '~/composables/util'
import { goodsId, initSkuCardList, sku_list } from '~/composables/useSku.js'

const formDrawerRef = ref(null)

const form = reactive({
  sku_type: 0,
  sku_value: {
    oprice: 0,
    pprice: 0,
    cprice: 0,
    weight: 0,
    volume: 0
  }
})

const open = row => {
  goodsId.value = row.id
  row.skusLoading = true
  readGoods(goodsId.value)
    .then(res => {
      form.sku_type = res.sku_type
      form.sku_value = res.sku_value || {
        oprice: 0,
        pprice: 0,
        cprice: 0,
        weight: 0,
        volume: 0
      }
      initSkuCardList(res)
      formDrawerRef.value.open()
    })
    .finally(() => {
      row.skusLoading = false
    })
}
const emit = defineEmits(['reloadData'])

const submit = () => {
  formDrawerRef.value.showLoading()
  let data = {
    sku_type: form.sku_type,
    sku_value: form.sku_value
  }
  if (form.sku_type == 1) {
    data.goodsSkus = sku_list.value
  }
  updateGoodsSkus(goodsId.value, data)
    .then(res => {
      toast('设置商品规格成功')
      formDrawerRef.value.close()
      emit('reloadData')
    })
    .finally(() => {
      formDrawerRef.value.hideLoading()
    })
}

defineExpose({
  open
})
</script>
```



## 规格管理

```vue
// skus/list.vue
<template>
  <el-card shadow="never" class="border-0">
    <!-- 新增，刷新 -->
    <ListHeader @create="handleCreate" @refresh="getData" layout="create,delete,refresh" @delete="handleMultiDelete"></ListHeader>

    <el-table ref="multipleTableRef" :data="tableData" stripe style="width: 100%" v-loading="loading" @selection-change="handleSelectionChange">
      // 多选框
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="规格名称" />
      <el-table-column prop="default" label="规格值" width="380" />
      <el-table-column prop="order" label="排序" />
      <el-table-column label="状态" width="120">
        <template #default="{row}">
          <el-switch :model-value="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange($event,row)" :loading="row.statusLoading" :disabled="row.super == 1">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" text @click="handleEdit(scope.row)">修改</el-button>
          <el-popconfirm title="是否要删除该规格" confirm-button-text="确认" cancel-button-text="取消" @confirm="handleDelete(scope.row.id)">
            <template #reference>
              <el-button type="primary" size="small" text @click="">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex items-center justify-center mt-5">
      <el-pagination background layout="prev,pager, next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData"></el-pagination>
    </div>
	// destroyOnClose：销毁子组件
    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit" destroyOnClose>
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
        <el-form-item label="规格名称" prop="name">
          <el-input v-model="form.name" placeholder="规格名称"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="order">
          <el-input-number v-model="form.order" :min="0" :max="1000">
          </el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model='form.status' :active-value="1" :inactive-value="0">
          </el-switch>
        </el-form-item>
        <el-form-item label="规格值" prop="default">
          <TagInput v-model="form.default"></TagInput>
        </el-form-item>
      </el-form>
    </FormDrawer>
  </el-card>
</template>

<script setup>
import {
  getSkusList,
  createSkus,
  updateSkus,
  deleteSkus,
  updateSkusStatus
} from '~/api/skus'
import FormDrawer from '~/components/FormDrawer.vue'
import { useInitTable, useInitForm } from '~/composables/useCommon.js'
import ListHeader from '~/components/ListHeader.vue'
import { ref } from 'vue'
import { toast } from '~/composables/util.js'
import TagInput from '~/components/TagInput.vue'

const {
  tableData,
  loading,
  currentPage,
  total,
  limit,
  getData,
  handleDelete,
  handleStatusChange,
  handleSelectionChange,
  handleMultiDelete,
  multipleTableRef
} = useInitTable({
  getList: getSkusList,
  delete: deleteSkus,
  updateStatus: updateSkusStatus
})

const {
  formDrawerRef,
  formRef,
  form,
  rules,
  drawerTitle,
  handleSubmit,
  handleCreate,
  handleEdit
} = useInitForm({
  form: {
    name: '',
    default: '',
    order: 50,
    status: 1
  },
  rules: {
    name: [{ required: true, message: '规格不能为空', trigger: 'blur' }],
    default: [{ required: true, message: '规格值不能为空', trigger: 'blur' }]
  },
  getData,
  update: updateSkus,
  create: createSkus
})
</script>

<style>
</style>
```

## 优惠券管理

```vue
// coupon/list.vue
<template>
  <el-card shadow="never" class="border-0">
    <!-- 新增，刷新 -->
    <ListHeader @create="handleCreate" @refresh="getData"></ListHeader>

    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column label="优惠券名称" width="350">
        <template #default="{row}">
          <div class="border border-dashed py-2 px-4 rounded" :class="row.statusText == '领取中'?'active':'inactive'">
            <h5 class=" font-bold text-md">{{ row.name }}</h5>
            <small>{{ row.start_time }}~{{ row.end_time }}</small>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="statusText" label="状态" />
      <el-table-column label="优惠">
        <template #default="{row}">
          {{ row.type == 0 ? "满减":"折扣"}}{{ row.type == 0 ?("￥"+row.value):(row.value+"折") }}
        </template>
      </el-table-column>
      <el-table-column prop="total" label="发放数量" />
      <el-table-column prop="used" label="已使用" />
      <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
		  // 未开始则不显示修改按钮
          <el-button type="primary" size="small" text @click="handleEdit(scope.row)" v-if="scope.row.statusText == '未开始'">修改</el-button>
		  // 领取中则不显示删除
          <el-popconfirm title="是否要删除该优惠券" confirm-button-text="确认" cancel-button-text="取消" @confirm="handleDelete(scope.row.id)" v-if="scope.row.statusText != '领取中'">
            <template #reference>
              <el-button type="primary" size="small" text @click="">删除</el-button>
            </template>
          </el-popconfirm>
		  // 只有领取中显示失效
          <el-popconfirm title="是否要让该优惠券失效" confirm-button-text="失效" cancel-button-text="取消" @confirm="handleStatusChange(0,scope.row)" v-if="scope.row.statusText == '领取中'">
            <template #reference>
              <el-button type="danger" size="small" @click="">失效</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex items-center justify-center mt-5">
      <el-pagination background layout="prev,pager, next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData"></el-pagination>
    </div>

    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="form.name" placeholder="优惠券名称" style="width:50%"></el-input>
        </el-form-item>
        // 单选框
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :label="0">
              满减
            </el-radio>
            <el-radio :label="1">
              折扣
            </el-radio>
          </el-radio-group>
        </el-form-item>
        // 面值或折扣
        <el-form-item label="面值" prop="value">
          <el-input v-model="form.value" placeholder="面值" style="width:50%">
            <template #append>
              {{ form.type ? '折':'元' }}
            </template>
          </el-input>
        </el-form-item>
        // 发行量
        <el-form-item label="发行量" prop="total">
          <el-input-number v-model="form.total" :min="0" :max="10000"></el-input-number>
        </el-form-item>
        // 最低价
        <el-form-item label="最低使用价格" prop="min_price">
          <el-input v-model="form.min_price" type="number" placeholder="最低使用价格"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="order">
          <el-input-number v-model="form.order" :min="0" :max="1000"></el-input-number>
        </el-form-item>
        // 设置有效时间   editable：不可编辑
        <el-form-item label="活动时间">
          <el-date-picker v-model="timerange" type="datetimerange" range-separator="To" start-placeholder="开始时间" end-placeholder="结束时间" value-format="YYYY-MM-DD HH:mm:ss" :editable="false"></el-date-picker>
        </el-form-item>
        // 描述  
        <el-form-item label="描述" prop="desc">
          <el-input v-model="form.desc" placeholder="描述" type="textarea" :rows="5"></el-input>
        </el-form-item>
      </el-form>
    </FormDrawer>
  </el-card>
</template>

<script setup>
import {
  getCouponList,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  updateCouponStatus
} from '~/api/coupon'
import FormDrawer from '~/components/FormDrawer.vue'
import { useInitTable, useInitForm } from '~/composables/useCommon.js'
import ListHeader from '~/components/ListHeader.vue'
import { computed } from 'vue'

const {
  tableData,
  loading,
  currentPage,
  total,
  limit,
  getData,
  handleDelete,
  handleStatusChange
} = useInitTable({
  getList: getCouponList,
  delete: deleteCoupon,
  onGetListSuccess: res => {
    tableData.value = res.list.map(o => {
      // 添加优惠券状态属性
      o.statusText = formatStatus(o)
      return o
    })
    total.value = res.totalCount
  },
  updateStatus: updateCouponStatus
})

const {
  formDrawerRef,
  formRef,
  form,
  rules,
  drawerTitle,
  handleSubmit,
  handleCreate,
  handleEdit
} = useInitForm({
  form: {
    title: '',
    type: 0,
    value: 0,
    total: 100,
    min_price: 0,
    start_time: null,
    end_time: null,
    order: 50,
    desc: ''
  },
  getData,
  update: updateCoupon,
  create: createCoupon,
  // 转换成时间戳
  beforeSubmit: f => {
    if (typeof f.start_time != 'number') {
      f.start_time = new Date(f.start_time).getTime()
    }
    if (typeof f.end_time != 'number') {
      f.end_time = new Date(f.end_time).getTime()
    }
    return f
  }
})

// 判断状态
function formatStatus(row) {
  let s = '领取中'
  let start_time = new Date(row.start_time).getTime()
  let now = new Date().getTime()
  let end_time = new Date(row.end_time).getTime()
  if (start_time > now) {
    s = '未开始'
  } else if (end_time < now) {
    s = '已结束'
  } else if (row.status == 0) {
    s = '已失效'
  }
  return s
}

// 
const timerange = computed({
  get() {
    return form.start_time && form.end_time
      ? [form.start_time, form.end_time]
      : []
  },
  set(val) {
    form.start_time = val[0]
    form.end_time = val[1]
  }
})
</script>

<style>
.active {
  @apply border-rose-200 bg-rose-50 text-red-400;
}
.inactive {
  @apply border-gray-200 bg-gray-50 text-gray-400;
}
</style>
```

## 分类管理

```vue
// category/list.vue
<template>
  <el-card shadow="never" class="border-0">
    <ListHeader @create="handleCreate" @refresh="getData" />
      
    <el-tree :data="tableData" :props="{ label:'name',children:'child' }" v-loading="loading" node-key="id">
      <template #default="{ node, data }">
        <div class="custom-tree-node">
          <span>{{ data.name }}</span>

          <div class="ml-auto">
            <el-button text type="primary" size="small" @click="openGoodsDrawer(data)" :loading="data.goodsDrawerLoading">推荐商品</el-button>
            <el-switch :modelValue="data.status" :active-value="1" :inactive-value="0" @change="handleStatusChange($event,data)" />
            <el-button text type="primary" size="small" @click.stop="handleEdit(data)">修改</el-button>
            <el-popconfirm title="是否要删除该记录？" confirmButtonText="确认" cancelButtonText="取消" @confirm="handleDelete(data.id)">
              <template #reference>
                <el-button text type="primary" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </template>
    </el-tree>

    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="分类名称"></el-input>
        </el-form-item>
      </el-form>
    </FormDrawer>

    <GoodsDrawer ref="GoodsDrawerRef" />
  </el-card>
</template>
<script setup>
import { ref } from 'vue'
import ListHeader from '~/components/ListHeader.vue'
import FormDrawer from '~/components/FormDrawer.vue'
import GoodsDrawer from './components/GoodsDrawer.vue'
import {
  getCategoryList,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory
} from '~/api/category.js'

import { useInitTable, useInitForm } from '~/composables/useCommon.js'

const {
  loading,
  tableData,
  getData,

  handleDelete,
  handleStatusChange
} = useInitTable({
  getList: getCategoryList,
  onGetListSuccess: res => {
    tableData.value = res.map(o => {
      o.goodsDrawerLoading = false
      return o
    })
  },
  delete: deleteCategory,
  updateStatus: updateCategoryStatus
})

const {
  formDrawerRef,
  formRef,
  form,
  rules,
  drawerTitle,
  handleSubmit,
  handleCreate,
  handleEdit
} = useInitForm({
  form: {
    name: ''
  },
  rules: {},
  getData,
  update: updateCategory,
  create: createCategory
})

const GoodsDrawerRef = ref(null)
const openGoodsDrawer = data => GoodsDrawerRef.value.open(data)
</script>
<style>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 14px;
  padding-right: 8px;
}
.el-tree-node__content {
  padding: 20px 0;
}
</style>
```

# 用户管理

```vue
// user/list.vue
<template>
  <el-card shadow="never" class="border-0">
    <!-- 搜索 -->
    <Search :model="searchForm" @search="getData" @reset="resetSearchForm">
      <SearchItem label="关键词">
        <el-input v-model="searchForm.keyword" placeholder="手机号/邮箱/会员昵称" clearable></el-input>
      </SearchItem>
      <template #show>
        <SearchItem label="会员等级">
          <el-select v-model="searchForm.user_level_id" placeholder="请选择会员等级" clearable>
            <el-option v-for="item in user_level" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </SearchItem>
      </template>
    </Search>

    <!-- 新增|刷新 -->
    <ListHeader @create="handleCreate" @refresh="getData" />

    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column label="会员" width="200">
        <template #default="{ row }">
          <div class="flex items-center">
            <el-avatar :size="40" :src="row.avatar">
              <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
            </el-avatar>
            <div class="ml-3">
              <h6>{{ row.username }}</h6>
              <small>ID:{{ row.id }}</small>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="会员等级" align="center">
        <template #default="{ row }">
          {{ row.user_level?.name || "-" }}
        </template>
      </el-table-column>
      <el-table-column label="登录注册" align="center">
        <template #default="{ row }">
          <p v-if="row.last_login_time">
            最后登录 : {{ row.last_login_time }}
          </p>
          <p>
            注册时间 : {{ row.create_time }}
          </p>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-switch :modelValue="row.status" :active-value="1" :inactive-value="0" :loading="row.statusLoading" :disabled="row.super == 1" @change="handleStatusChange($event,row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
          <small v-if="scope.row.super == 1" class="text-sm text-gray-500">暂无操作</small>
          <div v-else>
            <el-button type="primary" size="small" text @click="handleEdit(scope.row)">修改</el-button>
            <el-popconfirm title="是否要删除该记录？" confirmButtonText="确认" cancelButtonText="取消" @confirm="handleDelete(scope.row.id)">
              <template #reference>
                <el-button text type="primary" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex items-center justify-center mt-5">
      <el-pagination background layout="prev, pager ,next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData" />
    </div>

    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" placeholder="密码"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="昵称"></el-input>
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <ChooseImage v-model="form.avatar" />
        </el-form-item>
        <el-form-item label="会员等级" prop="user_level_id">
          <el-select v-model="form.user_level_id" placeholder="选择会员等级">
            <el-option v-for="item in user_level" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="form.phone" placeholder="手机"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="邮箱"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="content">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0">
          </el-switch>
        </el-form-item>
      </el-form>
    </FormDrawer>
  </el-card>
</template>
<script setup>
import { ref } from 'vue'
import ListHeader from '~/components/ListHeader.vue'
import FormDrawer from '~/components/FormDrawer.vue'
import ChooseImage from '~/components/ChooseImage.vue'
import Search from '~/components/Search.vue'
import SearchItem from '~/components/SearchItem.vue'

import {
  getUserList,
  updateUserStatus,
  createUser,
  updateUser,
  deleteUser
} from '~/api/user'

import { useInitTable, useInitForm } from '~/composables/useCommon.js'

const roles = ref([])
const user_level = ref([])

const {
  searchForm,
  resetSearchForm,
  tableData,
  loading,
  currentPage,
  total,
  limit,
  getData,
  handleDelete,
  handleStatusChange
} = useInitTable({
  searchForm: {
    keyword: '',
    user_level_id: null
  },
  getList: getUserList,
  onGetListSuccess: res => {
    tableData.value = res.list.map(o => {
      o.statusLoading = false
      return o
    })
    total.value = res.totalCount
    user_level.value = res.user_level
  },
  delete: deleteUser,
  updateStatus: updateUserStatus
})

const {
  formDrawerRef,
  formRef,
  form,
  rules,
  drawerTitle,
  handleSubmit,
  handleCreate,
  handleEdit
} = useInitForm({
  form: {
    username: '',
    password: '',
    user_level_id: null,
    status: 1,
    avatar: '',
    nickname: '',
    phone: '',
    email: ''
  },
  getData,
  update: updateUser,
  create: createUser
})
</script>
```



## 会员等级

```vue
// level/list.vue
<template>
  <el-card shadow="never" class="border-0">
    <!-- 新增|刷新 -->
    <ListHeader @create="handleCreate" @refresh="getData" />

    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="会员等级" />
      <el-table-column prop="discount" label="折扣率" align="center" />
      <el-table-column prop="level" label="等级序号" align="center" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-switch :modelValue="row.status" :active-value="1" :inactive-value="0" :loading="row.statusLoading" :disabled="row.super == 1" @change="handleStatusChange($event, row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" text @click="handleEdit(scope.row)">修改</el-button>
          <el-popconfirm title="是否要删除该记录？" confirmButtonText="确认" cancelButtonText="取消" @confirm="handleDelete(scope.row.id)">
            <template #reference>
              <el-button text type="primary" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex items-center justify-center mt-5">
      <el-pagination background layout="prev, pager ,next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData" />
    </div>

    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
        <el-form-item label="等级名称" prop="name">
          <el-input v-model="form.name" placeholder="等级名称"></el-input>
        </el-form-item>
        <el-form-item label="等级权重" prop="level">
          <el-input type="number" v-model="form.level" placeholder="等级权重"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0">
          </el-switch>
        </el-form-item>
        <el-form-item label="升级条件">
          <div>
            <small class="text-xs mr-2">累计消费满</small>
            <el-input type="number" v-model="form.max_price" placeholder="累计消费" style="width:50%;">
              <template #append>元</template>
            </el-input>
            <small class="text-gray-400 flex">
              设置会员等级所需要的累计消费必须大于等于0,单位：元
            </small>
          </div>
          <div>
            <small class="text-xs mr-2">累计次数满</small>
            <el-input type="number" v-model="form.max_times" placeholder="累计次数" style="width:50%;">
              <template #append>%</template>
            </el-input>
            <small class="text-gray-400 flex">
              设置会员等级所需要的购买量必须大于等于0,单位：笔
            </small>
          </div>
        </el-form-item>
        <el-form-item label="折扣率(%)" prop="discount">
          <el-input type="number" v-model="form.discount" placeholder="折扣率(%)" style="width:50%;">
            <template #append>%</template>
          </el-input>
          <small class="text-gray-400 flex">
            折扣率单位为百分比，如输入90，表示该会员等级的用户可以以商品原价的90%购买
          </small>
        </el-form-item>
      </el-form>
    </FormDrawer>
  </el-card>
</template>

<script setup>
import ListHeader from '~/components/ListHeader.vue'
import FormDrawer from '~/components/FormDrawer.vue'
import {
  getUserLevelList,
  createUserLevel,
  updateUserLevel,
  deleteUserLevel,
  updateUserLevelStatus
} from '~/api/level'
import { useInitTable, useInitForm } from '~/composables/useCommon.js'

const {
  tableData,
  loading,
  currentPage,
  total,
  limit,
  getData,
  handleDelete,
  handleStatusChange
} = useInitTable({
  getList: getUserLevelList,
  delete: deleteUserLevel,
  updateStatus: updateUserLevelStatus
})

const {
  formDrawerRef,
  formRef,
  form,
  rules,
  drawerTitle,
  handleSubmit,
  handleCreate,
  handleEdit
} = useInitForm({
  form: {
    name: '',
    level: 100,
    status: 1,
    discount: 0,
    max_price: 0,
    max_times: 0
  },
  rules: {
    name: [
      {
        required: true,
        message: '会员等级名称不能为空',
        trigger: 'blur'
      }
    ]
  },
  getData,
  update: updateUserLevel,
  create: createUserLevel
})
</script>
```

# 订单管理

```vue
// order/list.vue
<template>
  <div>
    // tab栏
    <el-tabs v-model="searchForm.tab" @tab-change="getData">
      <el-tab-pane :label="item.name" :name="item.key" v-for="(item, index) in tabbars" :key="index"></el-tab-pane>
    </el-tabs>

    <el-card shadow="never" class="border-0">
      <!-- 搜索 -->
      <Search :model="searchForm" @search="getData" @reset="resetSearchForm">
        <SearchItem label="订单编号">
          <el-input v-model="searchForm.no" placeholder="订单编号" clearable></el-input>
        </SearchItem>
        <template #show>
          <SearchItem label="收货人">
            <el-input v-model="searchForm.name" placeholder="收货人" clearable></el-input>
          </SearchItem>
          <SearchItem label="手机号">
            <el-input v-model="searchForm.phone" placeholder="手机号" clearable></el-input>
          </SearchItem>
          <SearchItem label="开始时间">
            <el-date-picker v-model="searchForm.starttime" type="date" placeholder="开始日期" style="width: 90%;" value-format="YYYY-MM-DD" />
          </SearchItem>
          <SearchItem label="结束时间">
            <el-date-picker v-model="searchForm.endtime" type="date" placeholder="结束日期" style="width: 90%;" value-format="YYYY-MM-DD" />
          </SearchItem>
        </template>
      </Search>

      <!-- 新增|刷新|批量删除 -->
      <ListHeader layout="refresh,download" @refresh="getData" @download="handleExportExcel">
        <el-button type="danger" size="small" @click="handleMultiDelete">批量删除</el-button>
      </ListHeader>

      <el-table ref="multipleTableRef" @selection-change="handleSelectionChange" :data="tableData" stripe style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column label="商品" width="300">
          <template #default="{ row }">
            <div>
              <div class="flex text-sm">
                <div class="flex-1">
                  <p>订单号：</p>
                  <small>{{ row.no }}</small>
                </div>
                <div>
                  <p>下单时间：</p>
                  <small>{{ row.create_time }}</small>
                </div>
              </div>
                
              <div class="flex py-2" v-for="(item,index) in row.order_items" :key="index">
                <el-image :src="item.goods_item ? item.goods_item.cover : ''" fit="cover" :lazy="true" style="width: 30px;height: 30px;"></el-image>
                <p class="text-blue-500 ml-2">
                  {{ item.goods_item ? item.goods_item.title : '商品已被删除' }}
                </p>
              </div>
            </div>
          </template>
        </el-table-column>
          
        <el-table-column label="实际付款" width="120" prop="total_price" align="center" />
          
        <el-table-column align="center" label="买家" width="120">
          <template #default="{ row }">
            <p>{{ row.user.nickname || row.user.username }}</p>
            <small>(用户ID：{{ row.user.id }})</small>
          </template>
        </el-table-column>
          	
        <el-table-column label="交易状态" width="170" align="center">
          <template #default="{ row }">
            <div>
              付款状态：
              <el-tag v-if="row.payment_method == 'wechat'" type="success" size="small">微信支付</el-tag>
              <el-tag v-else-if="row.payment_method == 'alipay'" size="small">支付宝支付</el-tag>
              <el-tag v-else type="info" size="small">未支付</el-tag>
            </div>
            <div>
              发货状态：
              <el-tag :type="row.ship_data ? 'success' : 'info'" size="small">{{ row.ship_data ? '已发货' : '未发货' }}</el-tag>
            </div>
            <div>
              收货状态：
              <el-tag :type="row.ship_status == 'received' ? 'success' : 'info'" size="small">{{ row.ship_status == 'received' ? '已收货' : '未收货' }}</el-tag>
            </div>
          </template>
        </el-table-column>
          
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <el-button class="px-1" type="primary" size="small" text @click="openInfoModal(row)">订单详情</el-button>
            <el-button v-if="searchForm.tab === 'noship'" class="px-1" type="primary" size="small" text>订单发货</el-button>
            <el-button v-if="searchForm.tab === 'refunding'" class="px-1" type="primary" size="small" text @click="handleRefund(row.id,1)">同意退款</el-button>
            <el-button v-if="searchForm.tab === 'refunding'" class="px-1" type="primary" size="small" text @click="handleRefund(row.id,0)">拒绝退款</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex items-center justify-center mt-5">
        <el-pagination background layout="prev, pager ,next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData" />
      </div>
    </el-card>
	// 导出订单
    <ExportExcel :tabs="tabbars" ref="ExportExcelRef" />
	// 订单详情
    <InfoModal ref="InfoModalRef" :info="info" />

  </div>
</template>

<script setup>
import { ref } from 'vue'
import ListHeader from '~/components/ListHeader.vue'
import Search from '~/components/Search.vue'
import SearchItem from '~/components/SearchItem.vue'
import ExportExcel from './ExportExcel.vue'
import InfoModal from './InfoModal.vue'
import { showModal, showPrompt, toast } from '~/composables/util'
import { getOrderList, deleteOrder, refundOrder } from '~/api/order'
import { useInitTable } from '~/composables/useCommon.js'

const {
  handleSelectionChange,
  multipleTableRef,
  handleMultiDelete,
  searchForm,
  resetSearchForm,
  tableData,
  loading,
  currentPage,
  total,
  limit,
  getData,
  handleDelete,
  multiSelectionIds
} = useInitTable({
  searchForm: {
    no: '',
    tab: 'all',
    starttime: '',
    endtime: '',
    name: '',
    phone: ''
  },
  getList: getOrderList,
  onGetListSuccess: res => {
    tableData.value = res.list.map(o => {
      o.bannersLoading = false
      o.contentLoading = false
      o.skusLoading = false
      return o
    })
    total.value = res.totalCount
  },
  delete: deleteOrder
})

const tabbars = [
  {
    key: 'all',
    name: '全部'
  },
  {
    key: 'nopay',
    name: '待支付'
  },
  {
    key: 'noship',
    name: '待发货'
  },
  {
    key: 'shiped',
    name: '待收货'
  },
  {
    key: 'received',
    name: '已收货'
  },
  {
    key: 'finish',
    name: '已完成'
  },
  {
    key: 'closed',
    name: '已关闭'
  },
  {
    key: 'refunding',
    name: '退款中'
  }
]

// 导出订单
const ExportExcelRef = ref(null)
const handleExportExcel = () => ExportExcelRef.value.open()
// 订单详情
const InfoModalRef = ref(null)
const info = ref(null)
const openInfoModal = row => {
  row.order_items = row.order_items.map(o => {
    if (o.skus_type == 1 && o.goods_skus) {
      let s = []
      for (const k in o.goods_skus.skus) {
        s.push(o.goods_skus.skus[k].value)
      }
      o.sku = s.join(',')
    }
    return o
  })
  info.value = row
  InfoModalRef.value.open()
}

// 退款处理
const handleRefund = (id, agree) => {
  ;(agree
    ? showModal('是否要同意该订单退款?')
    : showPrompt('请输入拒绝的理由')
    // value是拒绝输入的理由
  ).then(({ value }) => {
    let data = { agree }
    if (!agree) {
      data.disagree_reason = value
    }
    refundOrder(id, data).then(res => {
      getData()
      toast('操作成功')
    })
  })
}
</script>
```

## 导出订单

```vue
// ExportExcel
<template>
  <el-drawer title="导出订单" v-model="dialogVisible" size="40%">
    <el-form :model="form" label-width="80px">
      <el-form-item label="订单类型">
        <el-select v-model="form.tab" placeholder="请选择">
          <el-option v-for="item in tabs" :key="item.key" :label="item.name" :value="item.key">
          </el-option>
        </el-select>
      </el-form-item>
        
      <el-form-item label="时间范围">
        <el-date-picker v-model="form.time" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />
      </el-form-item>
        
      <el-form-item>
        <el-button type="primary" @click="onSubmit" :loading="loading">导出</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { exportOrder } from '~/api/order'
import { toast } from '~/composables/util'
    
defineProps({
  tabs: Array
})
    
const dialogVisible = ref(false)
const open = () => (dialogVisible.value = true)
const close = () => (dialogVisible.value = false)

const form = reactive({
  tab: null,
  time: ''
})

const loading = ref(false)
const onSubmit = () => {
  if (!form.tab) return toast('订单类型不能为空', 'error')
  loading.value = true
  let starttime = null
  let endtime = null
  if (form.time && Array.isArray(form.time)) {
    starttime = form.time[0]
    endtime = form.time[1]
  }
  exportOrder({
    tab: form.tab,
    starttime,
    endtime
  })
    .then(data => {
      // 返回了一个在内存中指向传入参数的引用路径url字符串
      let url = window.URL.createObjectURL(new Blob([data]))
      let link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      let filename = new Date().getTime() + '.xlsx'
      // 增加一个指定名称和值的新属性
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      close()
    })
    .finally(() => {
      loading.value = false
    })
}

defineExpose({
  open
})
</script>
```

## 订单详情

```vue
// InfoModel.vue
<template>
  <el-drawer title="订单详情" v-model="dialogVisible" size="50%">
    <el-card shadow="never" class="mb-3">
      <template #header>
        <b class="text-sm">订单详情</b>
      </template>
      <el-form label-width="80px">
        <el-form-item label="订单号">
          {{ info.no }}
        </el-form-item>
        <el-form-item label="付款方式">
          {{ info.payment_method }}
        </el-form-item>
        <el-form-item label="付款时间">
          {{ info.paid_time }}
        </el-form-item>
        <el-form-item label="创建时间">
          {{ info.create_time }}
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="info.ship_data" shadow="never" class="mb-3">
      <template #header>
        <b class="text-sm">发货信息</b>
      </template>
      <el-form label-width="80px">
        <el-form-item label="物流公司">
          {{ info.ship_data.express_company }}
        </el-form-item>
        <el-form-item label="运单号">
          {{ info.ship_data.express_no }}
          <el-button type="primary" text size="small" @click="openShipInfoModal(info.id)" class="ml-3" :loading="loading">查看物流</el-button>
        </el-form-item>
        <el-form-item label="发货时间">
          {{ ship_time }}
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="mb-3">
      <template #header>
        <b class="text-sm">商品信息</b>
      </template>
      <div class="flex mb-2" v-for="(item,index) in info.order_items" :key="index">
        <el-image :src="item.goods_item?.cover ?? ''" fit="fill" :lazy="true" style="width:60px;height:60px;"></el-image>
        <div class="ml-2 text-sm">
          <p>{{ item.goods_item?.title ?? '商品已被删除' }}</p>
          // 判断是否为多规格
          <p v-if="item.sku" class="mt-1">
            <el-tag type="info" size="small">
              {{ item.sku }}
            </el-tag>
          </p>
          <p>
            <b class="text-rose-500 mr-2">￥{{ item.price }}</b>
            <span class="text-xs text-gray-500">x{{ item.num }}</span>
          </p>
        </div>
      </div>
      <el-form label-width="80px">
        <el-form-item label="成交价">
          <span class="text-rose-500 font-bold">￥{{ info.total_price }}</span>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" v-if="info.address" class="mb-3">
      <template #header>
        <b class="text-sm">收货信息</b>
      </template>
      <el-form label-width="80px">
        <el-form-item label="收货人">
          {{ info.address.name }}
        </el-form-item>
        <el-form-item label="联系方式">
          {{ info.address.phone }}
        </el-form-item>
        <el-form-item label="收货地址">
          {{ info.address.province + info.address.city + info.address.district + info.address.address }}
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" v-if="info.refund_status != 'pending'">
      <template #header>
        <b class="text-sm">退款信息</b>
        <el-button text disabled style="float: right;">{{ refund_status }}</el-button>
      </template>
      <el-form label-width="80px">
        <el-form-item label="退款理由">
          {{ info.extra.refund_reason }}
        </el-form-item>
      </el-form>
    </el-card>
  </el-drawer>

  <ShipInfoModal ref="ShipInfoModalRef" />
</template>
<script setup>
import { ref, computed } from 'vue'
import { useDateFormat } from '@vueuse/core'
import ShipInfoModal from './ShipInfoModal.vue'
const props = defineProps({
  info: Object
})
// 时间戳转换成时间
const ship_time = computed(() => {
  if (props.info.ship_data) {
    const s = useDateFormat(
      props.info.ship_data.express_time * 1000,
      'YYYY-MM-DD HH:mm:ss'
    )
    return s.value
  }
  return ''
})
// 退款状态
const refund_status = computed(() => {
  const opt = {
    pending: '未退款',
    applied: '已申请，等待审核',
    processing: '退款中',
    success: '退款成功',
    failed: '退款失败'
  }
  return props.info.refund_status ? opt[props.info.refund_status] : ''
})

const dialogVisible = ref(false)
const open = () => {
  dialogVisible.value = true
}

const ShipInfoModalRef = ref(null)
const loading = ref(false)
const openShipInfoModal = id => {
  loading.value = true
  ShipInfoModalRef.value.open(id).finally(() => (loading.value = false))
}

defineExpose({
  open
})
</script>
```

## 查看物流

```vue
// ShipInfoModal.vue
<template>
    <el-drawer title="物流信息" v-model="dialogVisible" size="40%">
        <el-card shadow="never" class="border-0 mb-3">
            <div class="flex items-center">
                <el-image :src="info.logo" fit="fill" :lazy="true" style="width: 60px;height: 60px;" class="rounded border"></el-image>
                <div class="ml-3">
                    <p>物流公司：{{ info.typename }}</p>
                    <p>物流单号：{{ info.number }}</p>
                </div>
            </div>
        </el-card>
        <el-card shadow="never" class="border-0 border-t">
            // 时间线组件
            <el-timeline class="ml-[-40px]">
                <el-timeline-item :timestamp="item.time" placement="top" 
                v-for="(item,index) in info.list" :key="index">
                    {{ item.status }}
                </el-timeline-item>
            </el-timeline>
        </el-card>
    </el-drawer>
</template>

<script setup>
import { ref } from "vue"
import { getShipInfo } from "~/api/order"
import { toast } from "~/composables/util"
    
const dialogVisible = ref(false)
const info = ref({})
const open = (id)=>{
    return getShipInfo(id).then(res=>{
        if(res.status != 0){
            return toast(res.msg,"error")
        }
        info.value = res.result
        dialogVisible.value = true
    })
}

defineExpose({
    open
})

</script>
```



## 评论管理

```vue
// comment/list.vue
<template>
  <el-card shadow="never" class="border-0">
    <!-- 搜索 -->
    <Search :model="searchForm" @search="getData" @reset="resetSearchForm">
      <SearchItem label="关键词">
        <el-input v-model="searchForm.title" placeholder="商品标题" clearable></el-input>
      </SearchItem>
    </Search>

    <el-table default-expand-all :data="tableData" stripe style="width: 100%" v-loading="loading">
      // 展开行
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="flex pl-18">
            <el-avatar :size="50" :src="row.user.avatar" fit="fill" class="mr-3"></el-avatar>
            <div class="flex-1">
              <h6 class="flex items-center">
                {{ row.user.nickname || row.user.username }}
                <small class=" text-gray-400 ml-2">{{ row.review_time }}</small>
                <el-button size="small" class="ml-auto" @click="openTextarea(row)" v-if="!row.textareaEdit && !row.extra">回复</el-button>
              </h6>
              {{ row.review.data }}
              <div class="py-2">
                <el-image v-for="(item,index) in row.review.image" :key="index" :src="item" fit="cover" :lazy="true" style="width: 100px;height: 100px;" class="rounded"></el-image>
              </div>
                
              <div v-if="row.textareaEdit">
                <el-input v-model="textarea" placeholder="请输入评价内容" type="textarea" :rows="2"></el-input>
                <div class="py-2">
                  <el-button type="primary" size="small" @click="review(row)">回复</el-button>
                  <el-button size="small" class="ml-2" @click="row.textareaEdit = false">取消</el-button>
                </div>
              </div>
                
              <template v-else>
                <div class="mt-3 bg-gray-100 p-3 rounded" v-for="(item,index) in row.extra" :key="index">
                  <h6 class="flex font-bold">
                    客服
                    <el-button type="info" size="small" class="ml-auto" @click="openTextarea(row,item.data)">修改</el-button>
                  </h6>
                  <p>{{ item.data }}</p>
                </div>
              </template>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="ID" width="70" align="center" prop="id" />
      <el-table-column label="商品" width="200">
        <template #default="{ row }">
          <div class="flex items-center">
            <el-image :src="row.goods_item ? row.goods_item.cover : ''" fit="fill" :lazy="true" style="width:50px;height:50px;" class="rounded"></el-image>
            <div class="ml-3">
              <h6>{{ row.goods_item?.title ?? '商品已被删除' }}</h6>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="评价信息" width="200">
        <template #default="{ row }">
          <div>
            <p>用户：{{ row.user.nickname || row.user.username }}</p>
            <p>
              // 评分
              <el-rate v-model="row.rating" disabled show-score text-color="#ff9900" />
            </p>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="评价时间" width="180" align="center" prop="review_time" />
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-switch :modelValue="row.status" :active-value="1" :inactive-value="0" :loading="row.statusLoading" :disabled="row.super == 1" @change="handleStatusChange($event,row)">
          </el-switch>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex items-center justify-center mt-5">
      <el-pagination background layout="prev, pager ,next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData" />
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import Search from '~/components/Search.vue'
import SearchItem from '~/components/SearchItem.vue'
import { toast } from '~/composables/util'
import {
  getGoodsCommentList,
  updateGoodsCommentStatus,
  reviewGoodsComment
} from '~/api/goods_comment'
import { useInitTable } from '~/composables/useCommon.js'

const roles = ref([])

const {
  searchForm,
  resetSearchForm,
  tableData,
  loading,
  currentPage,
  total,
  limit,
  getData,
  handleDelete,
  handleStatusChange
} = useInitTable({
  searchForm: {
    title: ''
  },
  getList: getGoodsCommentList,
  onGetListSuccess: res => {
    tableData.value = res.list.map(o => {
      o.statusLoading = false
      o.textareaEdit = false
      return o
    })
    total.value = res.totalCount
    roles.value = res.roles
  },
  updateStatus: updateGoodsCommentStatus
})

const textarea = ref('')
const openTextarea = (row, data = '') => {
  textarea.value = data
  row.textareaEdit = true
}

// 回复评论
const review = row => {
  if (textarea.value == '') {
    return toast('回复内容不能为空', 'error')
  }
  reviewGoodsComment(row.id, textarea.value).then(res => {
    row.textareaEdit = false
    toast('回复成功')
    getData()
  })
}
</script>
```

# 系统设置

## 基础设置

```vue
// setting/base.vue
<template>
  <div v-loading="loading" class="bg-white p-4 rounded">
    <el-form :model="form" label-width="160px">
      // tab栏
      <el-tabs v-model="activeName">
        <el-tab-pane label="注册与访问" name="first">
          <el-form-item label="是否允许注册会员">
            <el-radio-group v-model="form.open_reg">
              <el-radio :label="0" border>
                关闭
              </el-radio>
              <el-radio :label="1" border>
                开启
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="注册类型">
            <el-radio-group v-model="form.reg_method">
              <el-radio label="username" border>
                普通注册
              </el-radio>
              <el-radio label="phone" border>
                手机注册
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="密码最小长度">
            <el-input v-model="form.password_min" placeholder="密码最小长度" style="width: 30%;" type="number"></el-input>
          </el-form-item>
          <el-form-item label="强制密码复杂度">
            <el-checkbox-group v-model="form.password_encrypt">
              <el-checkbox label="0" border>数字</el-checkbox>
              <el-checkbox label="1" border>小写字母</el-checkbox>
              <el-checkbox label="2" border>大写字母</el-checkbox>
              <el-checkbox label="3" border>符号</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
          
        <el-tab-pane label="上传设置" name="second">
          <el-form-item label="默认上传方式">
            <el-radio-group v-model="form.upload_method">
              <el-radio label="oss" border>
                对象存储
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Bucket">
            <el-input v-model="form.upload_config.Bucket" placeholder="Bucket" style="width: 30%;"></el-input>
          </el-form-item>
          <el-form-item label="ACCESS_KEY">
            <el-input v-model="form.upload_config.ACCESS_KEY" placeholder="ACCESS_KEY" style="width: 30%;"></el-input>
          </el-form-item>
          <el-form-item label="SECRET_KEY">
            <el-input v-model="form.upload_config.SECRET_KEY" placeholder="SECRET_KEY" style="width: 30%;"></el-input>
          </el-form-item>
          <el-form-item label="空间域名">
            <el-input v-model="form.upload_config.http" placeholder="空间域名" style="width: 30%;"></el-input>
            <small class="text-gray-500 flex mt-1">请补全 http:// 或 https://</small>
          </el-form-item>
        </el-tab-pane>
          
        <el-tab-pane label="Api安全" name="third">
          <el-form-item label="是否开启API安全">
            <el-radio-group v-model="form.api_safe">
              <el-radio :label="0" border>
                关闭
              </el-radio>
              <el-radio :label="1" border>
                开启
              </el-radio>
            </el-radio-group>
            <small class="text-gray-500 flex mt-1">api安全功能开启之后调用前端api需要传输签名串</small>
          </el-form-item>
          <el-form-item label="秘钥">
            <el-input v-model="form.api_secret" placeholder="秘钥" style="width: 30%;"></el-input>
            <small class="text-gray-500 flex mt-1">秘钥设置关系系统中api调用传输签名串的编码规则，以及会员token解析，请慎重设置，注意设置之后对应会员要求重新登录获取token</small>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
      <el-form-item>
        <el-button type="primary" size="default" @click="submit">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { getSysconfig, setSysconfig } from '~/api/sysconfig'
import { toast } from '~/composables/util'

const activeName = ref('first')

const form = reactive({
  open_reg: 1, // 开启注册，0关闭1开启
  reg_method: 'username', //注册方式，username普通phone手机
  password_min: 7, //密码最小长度
  password_encrypt: [], //密码复杂度，0数字、1小写字母、2大写字母、3符号；例如0,1,2
  upload_method: 'oss', //上传方式，oss对象存储
  upload_config: {
    Bucket: '',
    ACCESS_KEY: '',
    SECRET_KEY: '',
    http: ''
  }, //上传配置 { Bucket:"", ACCESS_KEY:"", SECRET_KEY:"", http:""}
  api_safe: 1, //api安全，0关闭1开启
  api_secret: '' //秘钥
})

const loading = ref(false)
function getData() {
  loading.value = true
  getSysconfig()
    .then(res => {
      for (const k in form) {
        form[k] = res[k]
      }
      form.password_encrypt = form.password_encrypt.split(',')
    })
    .finally(() => {
      loading.value = false
    })
}

getData()

const submit = () => {
  loading.value = true
  setSysconfig({
    ...form,
    password_encrypt: form.password_encrypt.join(',')
  })
    .then(res => {
      toast('修改成功')
      getData()
    })
    .finally(() => {
      loading.value = false
    })
}
</script>
```

## 交易设置

```vue
// setting/buy.vue
<template>
  <div v-loading="loading" class="bg-white p-4 rounded">
    <el-form :model="form" label-width="160px">
      // tab栏
      <el-tabs v-model="activeName">
        <el-tab-pane label="支付设置" name="first">
          <el-table :data="tableData" border stripe>
            <el-table-column label="支付方式" align="left">
              <template #default="{ row }">
                <div class="flex items-center">
                  <el-image :src="row.src" fit="fill" :lazy="true" style="width:40px;height: 40px;" class="rounded mr-2"></el-image>
                  <div>
                    <h6>{{ row.name }}</h6>
                    <small class="flex text-gray-500 mt-1">{{row.desc }}</small>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="150">
              <template #default="{ row }">
                <el-button type="primary" size="small" text @click="open(row.key)">配置</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="购物设置" name="second">
          <el-form-item label="未支付订单">
            <div>
              <el-input v-model="form.close_order_minute" placeholder="未支付订单" type="number">
                <template #append>
                  分钟后自动关闭
                </template>
              </el-input>
              <small class="text-gray-500 flex mt-1">
                订单下单未付款，n分钟后自动关闭，设置0不自动关闭
              </small>
            </div>
          </el-form-item>
          <el-form-item label="已发货订单">
            <div>
              <el-input v-model="form.auto_received_day" placeholder="已发货订单" type="number">
                <template #append>
                  天后自动确认收货
                </template>
              </el-input>
              <small class="text-gray-500 flex mt-1">
                如果在期间未确认收货，系统自动完成收货，设置0不自动收货
              </small>
            </div>
          </el-form-item>
          <el-form-item label="已完成订单">
            <div>
              <el-input v-model="form.after_sale_day" placeholder="已完成订单" type="number">
                <template #append>
                  天内允许申请售后
                </template>
              </el-input>
              <small class="text-gray-500 flex mt-1">
                订单完成后 ，用户在n天内可以发起售后申请，设置0不允许申请售后
              </small>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="default" @click="submit">保存</el-button>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>

    <FormDrawer ref="formDrawerRef" title="配置" @submit="submit">
      <el-form v-if="drawerType == 'alipay'" :model="form" label-width="80px">
        <el-form-item label="app_id">
          <el-input v-model="form.alipay.app_id" placeholder="app_id" style="width:90%;"></el-input>
        </el-form-item>
        <el-form-item label="ali_public_key">
          <el-input v-model="form.alipay.ali_public_key" placeholder="ali_public_key" style="width:90%;" type="textarea" rows="4"></el-input>
        </el-form-item>
        <el-form-item label="private_key">
          <el-input v-model="form.alipay.private_key" placeholder="private_key" style="width:90%;" type="textarea" rows="4"></el-input>
        </el-form-item>
      </el-form>
        
      <el-form v-else :model="form" label-width="80px">
        <el-form-item label="公众号 APPID">
          <el-input v-model="form.wxpay.app_id" placeholder="app_id" style="width:90%;"></el-input>
        </el-form-item>
        <el-form-item label="小程序 APPID">
          <el-input v-model="form.wxpay.miniapp_id" placeholder="miniapp_id" style="width:90%;"></el-input>
        </el-form-item>
        <el-form-item label="小程序 secret">
          <el-input v-model="form.wxpay.secret" placeholder="secret" style="width:90%;"></el-input>
        </el-form-item>
        <el-form-item label="appid">
          <el-input v-model="form.wxpay.appid" placeholder="appid" style="width:90%;"></el-input>
        </el-form-item>
        <el-form-item label="商户号">
          <el-input v-model="form.wxpay.mch_id" placeholder="商户号" style="width:90%;"></el-input>
        </el-form-item>
        <el-form-item label="API 密钥">
          <el-input v-model="form.wxpay.key" placeholder="API 密钥" style="width:90%;"></el-input>
        </el-form-item>
        <el-form-item label="cert_client">
          <el-upload :action="uploadAction" :headers="{ token }" accept=".pem" :limit="1" :on-success="uploadClientSuccess">
            <el-button type="primary">点击上传</el-button>
            <template #tip>
              <p class="text-red-500">
                {{ form.wxpay.cert_client ?  form.wxpay.cert_client : '还未配置'}}
              </p>
              <div class="el-upload__tip">
                例如：apiclient_cert.pem
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="cert_key">
          <el-upload :action="uploadAction" :headers="{ token }" accept=".pem" :limit="1" :on-success="uploadKeySuccess">
            <el-button type="primary">点击上传</el-button>
            <template #tip>
              <p class="text-red-500">
                {{ form.wxpay.cert_key ?  form.wxpay.cert_key : '还未配置'}}
              </p>
              <div class="el-upload__tip">
                例如：apiclient_key.pem
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
    </FormDrawer>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { getSysconfig, setSysconfig, uploadAction } from '~/api/sysconfig'
import { toast } from '~/composables/util'
import { getToken } from '~/composables/auth'
import FormDrawer from '~/components/FormDrawer.vue'
    
const token = getToken()
const activeName = ref('first')
const tableData = [
  {
    name: '支付宝支付',
    desc: '该系统支持即时到账接口',
    src: '/alipay.png',
    key: 'alipay'
  },
  {
    name: '微信支付',
    desc: '该系统支持微信网页支付和扫码支付',
    src: '/wepay.png',
    key: 'wxpay'
  }
]
const form = reactive({
  close_order_minute: 30,
  auto_received_day: 7,
  after_sale_day: 23,
  alipay: {
    app_id: '****已配置****',
    ali_public_key: '****已配置****',
    private_key: '****已配置****'
  },
  wxpay: {
    app_id: '****已配置****',
    miniapp_id: '****已配置****',
    secret: '****已配置****',
    appid: '****已配置****',
    mch_id: '****已配置****',
    key: '****已配置****',
    cert_client: '****已配置****.pem',
    cert_key: '****已配置****.pem'
  }
})

const loading = ref(false)
function getData() {
  loading.value = true
  getSysconfig()
    .then(res => {
      for (const k in form) {
        form[k] = res[k]
      }
      form.password_encrypt = form.password_encrypt.split(',')
    })
    .finally(() => {
      loading.value = false
    })
}

getData()

const submit = () => {
  loading.value = true
  setSysconfig({
    ...form
  })
    .then(res => {
      toast('修改成功')
      getData()
    })
    .finally(() => {
      loading.value = false
    })
}

const drawerType = ref('alipay')
const formDrawerRef = ref(null)
const open = key => {
  drawerType.value = key
  formDrawerRef.value.open()
}
// 上传成功
function uploadClientSuccess(response, uploadFile, uploadFiles) {
  form.wxpay.cert_client = response.data
}

function uploadKeySuccess(response, uploadFile, uploadFiles) {
  form.wxpay.cert_key = response.data
}
</script>
```

## 物流设置

```vue
// ship.vue
<template>
  <div v-loading="loading" class="bg-white p-4 rounded">
    <el-form :model="form" label-width="160px">
      <el-form-item label="物流查询key">
        <div>
          <el-input v-model="form.ship" placeholder="物流查询key"></el-input>
          <small class="text-gray-500 flex mt-1">
            用于查询物流信息，接口申请（仅供参考）
          </small>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="default" @click="submit">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { getSysconfig, setSysconfig } from '~/api/sysconfig'
import { toast } from '~/composables/util'

const form = reactive({
  ship: ''
})

const loading = ref(false)
function getData() {
  loading.value = true
  getSysconfig()
    .then(res => {
      for (const k in form) {
        form[k] = res[k]
      }
      form.password_encrypt = form.password_encrypt.split(',')
    })
    .finally(() => {
      loading.value = false
    })
}

getData()

const submit = () => {
  loading.value = true
  setSysconfig({
    ...form
  })
    .then(res => {
      toast('修改成功')
      getData()
    })
    .finally(() => {
      loading.value = false
    })
}
</script>
```

# 分销模块

## 分销员管理

```vue
// distribution/index.vue
<template>
  <div>
    <panel />

    <el-card shadow="never" class="border-0">
      <!-- 搜索 -->
      <Search :model="searchForm" @search="getData" @reset="resetSearchForm">
        <SearchItem label="时间选择">
          <el-radio-group v-model="searchForm.type">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="today">今天</el-radio-button>
            <el-radio-button label="yesterday">昨天</el-radio-button>
            <el-radio-button label="last7days">最近7天</el-radio-button>
          </el-radio-group>
        </SearchItem>
        <template #show>
          <SearchItem label="开始时间">
            <el-date-picker v-model="searchForm.starttime" type="date" placeholder="开始日期" style="width: 90%;" value-format="YYYY-MM-DD" />
          </SearchItem>
          <SearchItem label="结束时间">
            <el-date-picker v-model="searchForm.endtime" type="date" placeholder="结束日期" style="width: 90%;" value-format="YYYY-MM-DD" />
          </SearchItem>
          <SearchItem label="关键词">
            <el-input v-model="searchForm.keyword" placeholder="关键词" clearable></el-input>
          </SearchItem>
        </template>
      </Search>

      <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
        <el-table-column label="ID" prop="id" align="center" />
        <el-table-column label="头像" width="65">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar">
              <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="用户信息" width="200">
          <template #default="{ row }">
            <div class="text-xs">
              <p>用户：{{ row.username }}</p>
              <p>昵称：{{ row.nickname }}</p>
              <p>姓名：{{ row.user_info.name }}</p>
              <p>电话：{{ row.phone }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="推广用户数量" prop="share_num" align="center" />
        <el-table-column label="订单数量" prop="share_order_num" align="center" />
        <el-table-column label="订单金额" prop="order_price" align="center" />
        <el-table-column label="账户佣金" prop="commission" align="center" />
        <el-table-column label="已提现金额" prop="cash_out_price" align="center" />
        <el-table-column label="提现次数" prop="cash_out_time" align="center" />
        <el-table-column label="未提现金额" prop="no_cash_out_price" align="center" />
        <el-table-column fixed="right" label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" text @click="openDataDrawer(row.id,'user')">推广人</el-button>
            <el-button type="primary" size="small" text @click="openDataDrawer(row.id,'order')">推广订单</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex items-center justify-center mt-5">
        <el-pagination background layout="prev, pager ,next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData" />
      </div>
    </el-card>

    <dataDrawer ref="dataDrawerRef" />
    <dataDrawer ref="orderDataDrawerRef" type="order" />
  </div>
</template>

<script setup>
import panel from './panel.vue'
import dataDrawer from './dataDrawer.vue'
import { ref } from 'vue'
import Search from '~/components/Search.vue'
import SearchItem from '~/components/SearchItem.vue'
import { getAgentList } from '~/api/distribution'
import { useInitTable } from '~/composables/useCommon.js'

const {
  searchForm,
  resetSearchForm,
  tableData,
  loading,
  currentPage,
  total,
  limit,
  getData
} = useInitTable({
  searchForm: {
    keyword: '',
    type: 'all',
    starttime: null,
    endtime: null
  },
  getList: getAgentList,
  onGetListSuccess: res => {
    tableData.value = res.list
    total.value = res.totalCount
  }
})

const dataDrawerRef = ref(null)
const orderDataDrawerRef = ref(null)
const openDataDrawer = (id, type) => {
  ;(type == 'user' ? dataDrawerRef : orderDataDrawerRef).value.open(id)
}
</script>
```

## 卡片组件

```vue
// distribution/panel.vue
<template>
  <el-row :gutter="20" class="mb-5">
    <template v-if="loading">
      <el-col :span="6" v-for="i in 4" :key="i">
        <el-skeleton style="width: 100%;" animated loading>
          <template #template>
            <el-card shadow="hover" class="border-0">
              <template #header>
                <div class="flex justify-between">
                  <el-skeleton-item variant="text" style="width: 50%" />
                  <el-skeleton-item variant="text" style="width: 10%" />
                </div>
              </template>
              <el-skeleton-item variant="h3" style="width: 80%" />
            </el-card>
          </template>
        </el-skeleton>
      </el-col>
    </template>

    <el-col :span="6" :offset="0" v-for="(item, index) in list" :key="index">
      <el-card shadow="never">
        <div class="flex items-center">
          <el-icon :size="20" :class="item.color" class="text-white w-[40px] h-[40px] rounded-full ">
            <User v-if="index == 0" />
            <ShoppingCart v-if="index == 1" />
            <PriceTag v-if="index == 2" />
            <Timer v-if="index == 3" />
          </el-icon>
          <div class="ml-2">
            <h2 class="text-lg font-bold">{{ item.value }}</h2>
            <small class="text-xs text-gray-400">{{ item.label }}</small>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>

</template>
<script setup>
import { ref } from 'vue'
import { getAgentStatistics } from '~/api/distribution'

const list = ref([])
const loading = ref(false)
loading.value = true
getAgentStatistics()
  .then(res => {
    list.value = res.panels
  })
  .finally(() => {
    loading.value = false
  })
</script>
```

## 推广组件

```vue
// distribution/dataDrawer.vue
<template>
  <el-drawer :title="drawerTitle" v-model="dialogVisible" size="70%">
    <!-- 搜索 -->
    <el-form :model="searchForm" size="small">
      <el-form-item label="时间选择">
        <el-radio-group v-model="searchForm.type">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="today">今天</el-radio-button>
          <el-radio-button label="yesterday">昨天</el-radio-button>
          <el-radio-button label="last7days">最近7天</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="开始时间">
        <el-date-picker v-model="searchForm.starttime" type="date" placeholder="开始日期" style="width: 90%;" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item label="结束时间">
        <el-date-picker v-model="searchForm.endtime" type="date" placeholder="结束日期" style="width: 90%;" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item label="用户类型">
        <el-radio-group v-model="searchForm.level">
          <el-radio-button :label="0">全部</el-radio-button>
          <el-radio-button :label="1">一级推广</el-radio-button>
          <el-radio-button :label="2">二级推广</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getData">搜索</el-button>
        <el-button @click="resetSearchForm">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <template v-if="type === 'user'">
        <el-table-column label="ID" prop="id" align="center" />
        <el-table-column label="头像" width="65">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar">
              <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="用户信息" prop="username" />
        <el-table-column label="推广数" prop="share_num" align="center" />
        <el-table-column label="推广订单数" prop="share_order_num" align="center" />
        <el-table-column label="绑定时间" prop="create_time" align="center" />
      </template>

      <template v-else>
        <el-table-column label="订单号">
          <template #default="{ row }">
            {{ row.order.no }}
          </template>
        </el-table-column>
        <el-table-column label="用户名|昵称|手机">
          <template #default="{ row }">
            <div v-if="!row.order.user">
              该用户已被删除
            </div>
            <div v-else>
              {{ row.order.user.username }}|{{ row.order.user.nickname }}|{{ row.order.user.phone }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="时间" prop="create_time" />
        <el-table-column label="返佣金额" prop="commission" />
      </template>
    </el-table>

    <div class="flex items-center justify-center mt-5">
      <el-pagination background layout="prev, pager ,next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData" />
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getAgentList, getAgentOrderList } from '~/api/distribution'
import { useInitTable } from '~/composables/useCommon.js'

const props = defineProps({
  type: {
    type: String,
    default: 'user'
  }
})
const drawerTitle = computed(() =>
  props.type === 'user' ? '推广人列表' : '推广订单列表'
)
const dialogVisible = ref(false)

const { searchForm, tableData, loading, currentPage, total, limit, getData } =
  useInitTable({
    searchForm: {
      type: 'all',
      starttime: null,
      endtime: null,
      level: 0,
      user_id: 0
    },
    getList: (() => {
      return props.type === 'user' ? getAgentList : getAgentOrderList
    })(),
    onGetListSuccess: res => {
      tableData.value = res.list
      total.value = res.totalCount
    }
  })
// 重置
const resetSearchForm = () => {
  searchForm.type = 'all'
  searchForm.starttime = null
  searchForm.endtime = null
  searchForm.level = 0
}

const open = id => {
  dialogVisible.value = true
  searchForm.user_id = id
  getData()
}

defineExpose({
  open
})
</script>
```

## 分销设置

```vue
// setting.vue
<template>
  <div v-loading="loading" class="bg-white p-4 rounded">
    <el-form :model="form" label-width="160px">
      <h5 class="bg-gray-100 p-3 rounded mb-5">基础设置</h5>
      <el-form-item label="分销启用">
        <el-radio-group v-model="form.distribution_open">
          <el-radio :label="0" border>
            禁用
          </el-radio>
          <el-radio :label="1" border>
            开启
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="分销海报图">
        <ChooseImage :limit="9" v-model="form.spread_banners" />
      </el-form-item>
      <h5 class="bg-gray-100 p-3 rounded mb-5">返佣设置</h5>
      <el-form-item label="一级返佣比例">
        <div>
          <el-input v-model="form.store_first_rebate" placeholder="一级返佣比例" style="width: 50%;" type="number">
            <template #append>%</template>
          </el-input>
          <small class="text-gray-500 flex mt-1">订单交易成功后给上级返佣的比例0 - 100,例:5 = 反订单金额的5%</small>
        </div>
      </el-form-item>
      <el-form-item label="二级返佣比例">
        <div>
          <el-input v-model="form.store_second_rebate" placeholder="一级返佣比例" style="width: 50%;" type="number">
            <template #append>%</template>
          </el-input>
          <small class="text-gray-500 flex mt-1">订单交易成功后给上级返佣的比例0 - 100,例:5 = 反订单金额的5%</small>
        </div>
      </el-form-item>
      <el-form-item label="自购返佣">
        <div>
          <el-radio-group v-model="form.is_self_brokerage">
            <el-radio :label="1" border>
              是
            </el-radio>
            <el-radio :label="0" border>
              否
            </el-radio>
          </el-radio-group>
          <small class="text-gray-500 flex mt-1">是否开启自购返佣（开启：分销员自己购买商品，享受一级返佣，上级享受二级返佣； 关闭：分销员自己购买商品没有返佣）</small>
        </div>
      </el-form-item>
      <h5 class="bg-gray-100 p-3 rounded mb-5">结算设置</h5>
      <el-form-item label="结算时间">
        <div>
          <el-input v-model="form.settlement_days" placeholder="结算时间" style="width: 80%;" type="number">
            <template #prepend>订单完成后</template>
            <template #append>天</template>
          </el-input>
          <small class="text-gray-500 flex mt-1">预估佣金结算后无法进行回收，请谨慎设置结算天数</small>
        </div>
      </el-form-item>
      <el-form-item label="佣金到账方式">
        <div>
          <el-radio-group v-model="form.brokerage_method">
            <el-radio label="hand" border>
              手动到账
            </el-radio>
            <el-radio label="wx" border>
              自动到微信零钱
            </el-radio>
          </el-radio-group>
          <small class="text-gray-500 flex mt-1">佣金到账方式支持线下转账和微信零钱自动转账，手动转账更安全，自动转账更方便</small>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="default" @click="submit">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { getConfig, setConfig } from '~/api/distribution'
import ChooseImage from '~/components/ChooseImage.vue'
import { toast } from '~/composables/util'

const form = reactive({
  distribution_open: 1, // 分销启用:0禁用1启用
  store_first_rebate: 10, // 一级返佣比例：0~100
  store_second_rebate: 20, // 二级返佣比例：0~100
  spread_banners: [
    'http://tangzhe123-com.oss-cn-shenzhen.aliyuncs.com/public/62710076cd93e.png'
  ], //分销海报图
  is_self_brokerage: 1, // 自购返佣:0否1是
  settlement_days: 7, // 结算时间（单位：天）
  brokerage_method: 'hand' // 佣金到账方式:hand手动,wx微信
})

const loading = ref(false)
function getData() {
  loading.value = true
  getConfig()
    .then(res => {
      for (const k in form) {
        form[k] = res[k]
      }
      form.password_encrypt = form.password_encrypt.split(',')
    })
    .finally(() => {
      loading.value = false
    })
}

getData()

const submit = () => {
  loading.value = true
  setConfig({
    ...form
  })
    .then(res => {
      toast('修改成功')
      getData()
    })
    .finally(() => {
      loading.value = false
    })
}
</script>
```



# 接口模块(src/api)

## 管理员模块

```js
// /api/manager.js
import axios from '~/axios'

// 登录
export function login(username, password) {
  return axios.post('/admin/login', { username, password })
}

// 获取管理员信息和权限菜单
export function getInfo() {
  return axios.post('/admin/getinfo')
}

// 退出登录
export function logout() {
  return axios.post('/admin/logout')
}

// 修改密码
export function updatepassword(data) {
  return axios.post('/admin/updatepassword', data)
}

// 获取管理员信息
export function getManagerList(page, query = {}) {
  let r = queryParams(query)
  return axios.get(`/admin/manager/${page}${r}`)
}

// 修改管理员状态
export function updateManagerStatus(id, status) {
  return axios.post(`/admin/manager/${id}/update_status`, { status })
}
// 新增
export function createManager(data) {
  return axios.post('/admin/manager', data)
}
// 修改管理员
export function updateManager(id, data) {
  return axios.post(`/admin/manager/${id}`, data)
}
// 删除
export function deleteManager(id) {
  return axios.post(`/admin/manager/${id}/delete`)
}

```

## 后台模块

```js
// index.js
import axios from '~/axios'

// 后台统计1
export function getStatistics1() {
  return axios.get('/admin/statistics1')
}
// echarts信息
export function getStatistics3(type) {
  return axios.get('/admin/statistics3?type=' + type)
}
// 店铺信息
export function getStatistics2() {
  return axios.get('/admin/statistics2')
}
```

## 图库分类（左侧菜单数据）

```js
// image_class.js
import axios from '~/axios'

export function getImageClassList(page) {
  return axios.get('/admin/image_class/' + page)
}
// 增加图库分类
export function createImageClass(data) {
  return axios.post('/admin/image_class', data)
}
// 修改图库分类
export function upadateImageClass(id, data) {
  return axios.post('/admin/image_class/' + id, data)
}
// 删除图库分类
export function deleteImageClass(id) {
  return axios.post(`/admin/image_class/${id}/delete`)
}
```

## 图片列表（右侧主体数据）

```js
// image.js
import axios from '~/axios'

export function getImageList(id, page = 1) {
  return axios.get(`/admin/image_class/${id}/image/${page}`)
}
// 修改图片名称
export function updateImage(id, name) {
  return axios.post(`/admin/image/${id}`, { name })
}
// 删除图片
export function deleteImage(ids) {
  return axios.post(`/admin/image/delete_all`, { ids })
}
// 上传图片
export const uploadImageAction = import.meta.env.VITE_APP_BASE_API + '/admin/image/upload'

```

## 公告数据

```js
// notice.js
import axios from '~/axios'

export function getNoticeList(pages) {
  return axios.get(`/admin/notice/${pages}`)
}

export function createNotice(data) {
  return axios.post('/admin/notice', data)
}

export function updateNotice(id, data) {
  return axios.post('/admin/notice/' + id, data)
}

export function deleteNotice(id) {
  return axios.post(`/admin/notice/${id}/delete`)
}

```

## 菜单权限

```js
// rule.js
import axios from '~/axios'

export function getRuleList(pages) {
  return axios.get(`/admin/rule/${pages}`)
}

export function createRule(data) {
  return axios.post('/admin/rule', data)
}
// 修改权限
export function updateRule(id, data) {
  return axios.post('/admin/rule/' + id, data)
}
// 修改状态
export function updateRuleStatus(id, status) {
  return axios.post(`/admin/rule/${id}/update_status`, { status })
}

export function deleteRule(id) {
  return axios.post(`/admin/rule/${id}/delete`)
}

```

## 角色模块

```js
// role.js
import axios from '~/axios'

export function getRoleList(pages) {
  return axios.get(`/admin/role/${pages}`)
}

export function createRole(data) {
  return axios.post('/admin/role', data)
}

export function updateRole(id, data) {
  return axios.post('/admin/role/' + id, data)
}

export function deleteRole(id) {
  return axios.post(`/admin/role/${id}/delete`)
}

export function updateRoleStatus(id, status) {
  return axios.post(`/admin/role/${id}/update_status`, { status })
}
// 配置权限
export function setRoleRules(id, rule_ids) {
  return axios.post(`/admin/role/set_rules`, { id, rule_ids })
}
```

## 商品规格

```js
// skus.js
import axios from '~/axios'

export function getSkusList(page) {
  return axios.get(`/admin/skus/${page}`)
}

export function createSkus(data) {
  return axios.post('/admin/skus', data)
}

export function updateSkus(id, data) {
  return axios.post('/admin/skus/' + id, data)
}

export function deleteSkus(ids) {
  ids = !Array.isArray(ids) ? [ids] : ids
  return axios.post(`/admin/skus/delete_all`, { ids })
}

export function updateSkusStatus(id, status) {
  return axios.post(`/admin/skus/${id}/update_status`, {
    status,
  })
}

```

## 优惠券

```js
// coupon.js
import axios from '~/axios'

export function getCouponList(pages) {
  return axios.get(`/admin/coupon/${pages}`)
}

export function createCoupon(data) {
  return axios.post('/admin/coupon', data)
}

export function updateCoupon(id, data) {
  return axios.post('/admin/coupon/' + id, data)
}

export function deleteCoupon(id) {
  return axios.post(`/admin/coupon/${id}/delete`)
}

export function updateCouponStatus(id) {
  return axios.post(`/admin/coupon/${id}/update_status`, { status: 0 })
}
```

## 商品管理

```js
// goods.js
import axios from '~/axios'
import { queryParams } from '~/composables/util'

export function getGoodsList(page, query = {}) {
  let r = queryParams(query)
  return axios.get(`/admin/goods/${page}${r}`)
}

// 批量上架/下架
export function updateGoodsStatus(ids, status) {
  return axios.post(`/admin/goods/changestatus`, {
    ids,
    status,
  })
}

export function createGoods(data) {
  return axios.post(`/admin/goods`, data)
}

export function updateGoods(id, data) {
  return axios.post(`/admin/goods/${id}`, data)
}
// 批量删除
export function deleteGoods(ids) {
  return axios.post(`/admin/goods/delete_all`, {
    ids,
  })
}
// 批量恢复商品
export function restoreGoods(ids) {
  return axios.post(`/admin/goods/restore`, {
    ids,
  })
}
// 彻底删除商品
export function destroyGoods(ids) {
  return axios.post(`/admin/goods/destroy`, {
    ids,
  })
}
// 查看商品资料
export function readGoods(id) {
  return axios.get(`/admin/goods/read/${id}`)
}
// 设置商品轮播图
export function setGoodsBanner(id, data) {
  return axios.post(`/admin/goods/banners/${id}`, data)
}
// 设置商品规格
export function updateGoodsSkus(id, data) {
  return axios.post(`/admin/goods/updateskus/${id}`, data)
}
// 添加商品规格选项
export function createGoodsSkusCard(data) {
  return axios.post(`/admin/goods_skus_card`, data)
}
// 修改商品规格选项
export function updateGoodsSkusCard(id, data) {
  return axios.post(`/admin/goods_skus_card/${id}`, data)
}
// 删除商品规格
export function deleteGoodsSkusCard(id) {
  return axios.post(`/admin/goods_skus_card/${id}/delete`)
}
// 排序商品规格
export function sortGoodsSkusCard(data) {
  return axios.post(`/admin/goods_skus_card/sort`, data)
}
// 添加商品规格值
export function createGoodsSkusCardValue(data) {
  return axios.post(`/admin/goods_skus_card_value`, data)
}
// 修改规格值
export function updateGoodsSkusCardValue(id, data) {
  return axios.post(`/admin/goods_skus_card_value/${id}`, data)
}

export function deleteGoodsSkusCardValue(id) {
  return axios.post(`/admin/goods_skus_card_value/${id}/delete`)
}
// 选择设置商品规格选项和值
export function chooseAndSetGoodsSkusCard(id, data) {
  return axios.post(`/admin/goods_skus_card/${id}/set`, data)
}
```

## 商品分类

```js
// category.js
import axios from '~/axios'

export function getCategoryList() {
  return axios.get('/admin/category')
}

export function createCategory(data) {
  return axios.post('/admin/category', data)
}

export function updateCategory(id, data) {
  return axios.post('/admin/category/' + id, data)
}
// 修改商品分类状态
export function updateCategoryStatus(id, status) {
  return axios.post(`/admin/category/${id}/update_status`, {
    status,
  })
}

export function deleteCategory(id) {
  return axios.post(`/admin/category/${id}/delete`)
}
// 分类关联产品列表
export function getCategoryGoods(id) {
  return axios.get(`/admin/app_category_item/list?category_id=${id}`)
}
// 删除关联产品
export function deleteCategoryGoods(id) {
  return axios.post(`/admin/app_category_item/${id}/delete`)
}
// 关联产品
export function connectCategoryGoods(data) {
  return axios.post(`/admin/app_category_item`, data)
}
```

## 会员等级

```js
// level.js
import axios from '~/axios'

// 会员等级
export function getUserLevelList(page) {
  return axios.get(`/admin/user_level/${page}`)
}

export function createUserLevel(data) {
  return axios.post('/admin/user_level', data)
}

export function updateUserLevel(id, data) {
  return axios.post('/admin/user_level/' + id, data)
}

export function deleteUserLevel(id) {
  return axios.post(`/admin/user_level/${id}/delete`)
}
// 修改会员等级状态
export function updateUserLevelStatus(id, status) {
  return axios.post(`/admin/user_level/${id}/update_status`, {
    status,
  })
}
```

## 用户管理

```js
// user.js
import axios from '~/axios'
import { queryParams } from '~/composables/util'

export function getUserList(page, query = {}) {
  let r = queryParams(query)
  return axios.get(`/admin/user/${page}${r}`)
}

export function updateUserStatus(id, status) {
  return axios.post(`/admin/user/${id}/update_status`, {
    status,
  })
}

export function createUser(data) {
  return axios.post(`/admin/user`, data)
}

export function updateUser(id, data) {
  return axios.post(`/admin/user/${id}`, data)
}

export function deleteUser(id) {
  return axios.post(`/admin/user/${id}/delete`)
}
```

## 商品评论管理

```js
// goods_comment.js
import axios from '~/axios'
import { queryParams } from '~/composables/util'

// 商品评价列表
export function getGoodsCommentList(page, query = {}) {
  let r = queryParams(query)
  return axios.get(`/admin/goods_comment/${page}${r}`)
}

export function updateGoodsCommentStatus(id, status) {
  return axios.post(`/admin/goods_comment/${id}/update_status`, {
    status,
  })
}
// 回复商品评价
export function reviewGoodsComment(id, data) {
  return axios.post(`/admin/goods_comment/review/${id}`, {
    data,
  })
}
```

##  订单管理

```js
// order.js
import axios from '~/axios'
import { queryParams } from '~/composables/util'

export function getOrderList(page, query = {}) {
  let r = queryParams(query)
  return axios.get(`/admin/order/${page}${r}`)
}
// 批量删除订单
export function deleteOrder(ids) {
  return axios.post(`/admin/order/delete_all`, {
    ids,
  })
}
// 导出订单
export function exportOrder(query = {}) {
  let r = queryParams(query)
  return axios.post(
    `/admin/order/excelexport${r}`,
    {},
    {
      responseType: 'blob',
    },
  )
}
// 查看物流
export function getShipInfo(id) {
  return axios.get(`/admin/order/${id}/get_ship_info`)
}
// 同意/拒绝退款
export function refundOrder(id, data) {
  return axios.post(`/admin/order/${id}/handle_refund`, data)
}
```

## 系统配置

```js 
// sysconfig.js
import axios from '~/axios'

export function getSysconfig() {
  return axios.get(`/admin/sysconfig`)
}
// 修改系统设置
export function setSysconfig(data) {
  return axios.post(`/admin/sysconfig`, data)
}
// 上传文件
export const uploadAction = import.meta.env.VITE_APP_BASE_API + '/admin/sysconfig/upload'
```

## 分销模块

```js
import axios from '~/axios'
import { queryParams } from '~/composables/util'
// 分校数据统计
export function getAgentList(page, query = {}) {
  let r = queryParams(query)
  return axios.get(`/admin/agent/${page}${r}`)
}
// 分析推广员列表
export function getAgentOrderList(page, query = {}) {
  let r = queryParams(query)
  return axios.get(`/admin/user_bill/${page}${r}`)
}
// 推广订单列表
export function getAgentStatistics() {
  return axios.get('/admin/agent/statistics')
}
// 获取分销配置
export function getConfig() {
  return axios.get(`/admin/distribution_setting/get`)
}
// 修改分销配置
export function setConfig(data) {
  return axios.post(`/admin/distribution_setting/set`, data)
}
```



# 常用工具库(src/composables)

## cookie相关方法

```js
// auth.js
import { useCookies } from '@vueuse/integrations/useCookies'

const tokenKey = 'admin-token'
const cookie = useCookies()

// 获取token
export function getToken() {
  return cookie.get(tokenKey)
}

// 设置token
export function setToken(token) {
  return cookie.set(tokenKey, token)
}

// 清除cookie
export function removeToken() {
  return cookie.remove(tokenKey)
}
```

## 通用模块

```js
// util.js
import { ElNotification, ElMessageBox } from 'element-plus'
import nprogress from 'nprogress'
// 消息提示
export function toast(message, type = 'success', dangerouslyUseHTMLString = true) {
  ElNotification({
    message,
    type,
    // 是否将message属性作为HTML片段处理
    dangerouslyUseHTMLString,
    duration: 3000,
  })
}

// 显示全屏loading
export function showFullLoading() {
  nprogress.start()
}

// 隐藏全屏loading
export function hideFullLoading() {
  nprogress.done()
}

// 提示框
export function showModal(content = '提示内容', type = 'warning', title = '') {
  return ElMessageBox.confirm(content, title, {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type,
  })
}

// 消息弹出框
export function showPrompt(tip, value = '') {
  return ElMessageBox.prompt(tip, '', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputValue: value,
  })
}

// 将query对象转成url参数
export function queryParams(query) {
  let q = []
  for (const key in query) {
    if (query[key]) {
      q.push(`${key}=${encodeURIComponent(query[key])}`)
    }
  }
  let r = q.join('&')
  r = r ? '?' + r : ''
  return r
}

// 上移
export function useArrayMoveUp(arr, index) {
  swapArray(arr, index, index - 1)
}

// 下移
export function useArrayMoveDown(arr, index) {
  swapArray(arr, index, index + 1)
}

function swapArray(arr, index1, index2) {
  // 从index为0的元素开始，一共删除1个元素,并且在 index=0 的前面追加1个元素
  // 当arr=[1,2,3,4] index1 = 1 index2 = 0时
  // arr.splice(index2, 1, arr[index1]) = [1]
  // arr[index1] = 1 
  // arr = [2,1,3,4]
  arr[index1] = arr.splice(index2, 1, arr[index1])[0]
  return arr
}

// sku排列算法
// 将[[{"value":"绿色"},{"value":"绿色"}],[{"value":"M"},{"value":"L"}]] 转化为 [[{"value":"绿色"},{"value":"M"}],[{"value":"绿色"},{"value":"L"}],[{"value":"黄色"},{"value":"M"}],[{"value":"黄色"},{"value":"L"}]]
export function cartesianProductOf() {
  return Array.prototype.reduce.call(
    arguments,
    function (a, b) {
      var ret = []
      a.forEach(function (a) {
        b.forEach(function (b) {
          ret.push(a.concat([b]))
        })
      })
      return ret
    },
    [[]],
  )
}
```

## 弹框表单修改密码和退出登录

```js
// src/composables/useManager.js
import { ref, reactive } from 'vue'
import { logout, updatepassword } from '~/api/manager'
import { showModal, toast } from '~/composables/util'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

export function useRepassword() {
  const router = useRouter()
  const store = useStore()
  // 修改密码
  const formDrawerRef = ref(null)
  const form = reactive({
    oldpassword: '',
    password: '',
    repassword: '',
  })

  const rules = {
    oldpassword: [
      {
        required: true,
        message: '旧密码不能为空',
        trigger: 'blur',
      },
    ],
    password: [
      {
        required: true,
        message: '新密码不能为空',
        trigger: 'blur',
      },
    ],
    repassword: [
      {
        required: true,
        message: '确认密码不能为空',
        trigger: 'blur',
      },
    ],
  }

  const formRef = ref(null)
  const onSubmit = () => {
    formRef.value.validate((valid) => {
      if (!valid) {
        return false
      }
      formDrawerRef.value.showLoading()
      updatepassword(form)
        .then((res) => {
          toast('修改密码成功，请重新登录')
          store.dispatch('logout')
          // 跳转回登录页
          router.push('/login')
        })
        .finally(() => {
          formDrawerRef.value.hideLoading()
        })
    })
  }
  const openRePasswordForm = () => formDrawerRef.value.open()

  return {
    formDrawerRef,
    form,
    rules,
    formRef,
    onSubmit,
    openRePasswordForm,
  }
}

export function useLogout() {
  const router = useRouter()
  const store = useStore()
  function handleLogout() {
    showModal('是否要退出登录？').then((res) => {
      logout().finally(() => {
        store.dispatch('logout')
        // 跳转回登录页
        router.push('/login')
        // 提示退出登录成功
        toast('退出登录成功')
      })
    })
  }
  return {
    handleLogout,
  }
}
```

## 标签导航

```js
// useTabList.js
import { ref } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { useCookies } from '@vueuse/integrations/useCookies'
import { router } from '~/router'

export function useTabList() {
  const route = useRoute()
  const cookie = useCookies()

  const activeTab = ref(route.path)
  const tabList = ref([
    {
      title: '后台首页',
      path: '/',
    },
  ])

  // 添加标签导航
  function addTab(tab) {
    // 判断有没有添加过
    let notab = tabList.value.findIndex((t) => t.path == tab.path) == -1
    if (notab) {
      tabList.value.push(tab)
    }
    cookie.set('tabList', tabList.value)
  }
  // 初始化标签导航列表
  function initTabList() {
    let tbs = cookie.get('tabList')
    if (tbs) {
      tabList.value = tbs
    }
  }
  initTabList()
  // 监听
  onBeforeRouteUpdate((to, from) => {
    // 使处于激活状态
    activeTab.value = to.path
    addTab({ title: to.meta.title, path: to.path })
  })
  // 切换标签
  const changeTab = (t) => {
	// t是path
    activeTab.value = t
    router.push(t)
  }
  // 关闭标签导航
  const removeTab = (t) => {
    let a = activeTab.value
    let tabs = tabList.value
    // 判断关闭的标签是不是当前激活的标签
    if (a == t) {
      tabs.forEach((tab, index) => {
        if (tab.path == t) {
          const nextTab = tabs[index + 1] || tabs[index - 1]
          if (nextTab) {
            a = nextTab.path
          }
        }
      })
    }
    activeTab.value = a
    tabList.value = tabList.value.filter((tab) => tab.path != t)
    cookie.set('tabList', tabList.value)
  }
  // 关闭 
  const handleClose = (c) => {
    if (c == 'clearAll') {
      // 切换回首页
      activeTab.value = '/'
      // 过滤只剩下首页
      tabList.value = [
        {
          title: '后台首页',
          path: '/',
        },
      ]
    } else if (c == 'clearOther') {
      tabList.value = tabList.value.filter((tab) => tab.path == '/' || tab.path == activeTab.value)
    }
    cookie.set('tabList', tabList.value)
  }

  return {
    activeTab,
    tabList,
    changeTab,
    removeTab,
    handleClose,
  }
}

```

## 搜索和分页

```js
// useCommon.js
import { ref, reactive, computed } from 'vue'
import { toast } from '~/composables/util'
// 列表，分页，搜索，删除，修改状态
export function useInitTable(opt = {}) {
  let searchForm = null
  let resetSearchForm = null
  if (opt.searchForm) {
    searchForm = reactive({ ...opt.searchForm })
    resetSearchForm = () => {
      for (const key in opt.searchForm) {
        searchForm[key] = opt.searchForm[key]
      }
      getData()
    }
  }

  const tableData = ref([])
  const loading = ref(false)

  // 分页
  const currentPage = ref(1)
  const total = ref(0)
  const limit = ref(10)

  // 获取数据
  function getData(p = null) {
    if (typeof p == 'number') {
      currentPage.value = p
    }

    loading.value = true
    opt
      .getList(currentPage.value, searchForm)
      .then((res) => {
        if (opt.onGetListSuccess && typeof opt.onGetListSuccess == 'function') {
          opt.onGetListSuccess(res)
        } else {
          tableData.value = res.list
          total.value = res.totalCount
        }
      })
      .finally(() => {
        loading.value = false
      })
  }

  getData()

  // 删除
  const handleDelete = (id) => {
    loading.value = true
    opt
      .delete(id)
      .then((res) => {
        toast('删除成功')
        getData()
      })
      .finally(() => {
        loading.value = false
      })
  }

  // 修改状态
  const handleStatusChange = (status, row) => {
    row.statusLoading = true
    opt
      .updateStatus(row.id, status)
      .then((res) => {
        toast('修改状态成功')
        row.status = status
      })
      .finally(() => {
        row.statusLoading = false
      })
  }

  // 多选选中的ID
  const multiSelectionIds = ref([])
  // e为选中的对象
  const handleSelectionChange = (e) => {
    multiSelectionIds.value = e.map((o) => o.id)
  }
  // 批量删除
  const multipleTableRef = ref(null)
  const handleMultiDelete = () => {
    loading.value = true
    opt
      .delete(multiSelectionIds.value)
      .then((res) => {
        toast('删除成功')
        // 清空选中
        if (multipleTableRef.value) {
          multipleTableRef.value.clearSelection()
        }
        getData()
      })
      .finally(() => {
        loading.value = false
      })
  }

  // 批量修改状态
  const handleMultiStatusChange = (status) => {
    loading.value = true
    opt
      .updateStatus(multiSelectionIds.value, status)
      .then((res) => {
        toast('修改状态成功')
        // 清空选中
        if (multipleTableRef.value) {
          multipleTableRef.value.clearSelection()
        }
        getData()
      })
      .finally(() => {
        loading.value = false
      })
  }

  return {
    searchForm,
    resetSearchForm,
    tableData,
    loading,
    currentPage,
    total,
    limit,
    getData,
    handleDelete,
    handleStatusChange,
    handleSelectionChange,
    multipleTableRef,
    handleMultiDelete,
    handleMultiStatusChange,
    multiSelectionIds,
  }
}

// 新增，修改表单
export function useInitForm(opt = {}) {
  // 表单部分
  const formDrawerRef = ref(null)
  const formRef = ref(null)
  // 接收传过来的form
  const defaultForm = opt.form
  const form = reactive({})
  const rules = opt.rules || {}	
  const editId = ref(0)
  const drawerTitle = computed(() => (editId.value ? '修改' : '新增'))
  // 提交	
  const handleSubmit = () => {
    formRef.value.validate((valid) => {
      if (!valid) return
      formDrawerRef.value.showLoading()
	  //
      let body = {}
      if (opt.beforeSubmit && typeof opt.beforeSubmit == 'function') {
       	// 传回表单
        body = opt.beforeSubmit({ ...form })
      } else {
        body = form
      }
      const fun = editId.value ? opt.update(editId.value, body) : opt.create(body)
      fun
        .then((res) => {
          toast(drawerTitle.value + '成功')
          // 修改刷新当前页，新增刷新第一页
          opt.getData(editId.value ? false : 1)
          formDrawerRef.value.close()
        })
        .finally(() => {
          formDrawerRef.value.hideLoading()
        })
    })
  }

  // 重置表单
  function resetForm(row = false) {
    if (formRef.value) formRef.value.clearValidate()
    for (const key in defaultForm) {
      form[key] = row[key]
    }
  }

  // 新增
  const handleCreate = () => {
    editId.value = 0
    resetForm(defaultForm)
    formDrawerRef.value.open()
  }

  // 编辑
  const handleEdit = (row) => {
    editId.value = row.id
    resetForm(row)
    formDrawerRef.value.open()
  }

  return {
    formDrawerRef,
    formRef,
    form,
    rules,
    editId,
    drawerTitle,
    handleSubmit,
    resetForm,
    handleCreate,
    handleEdit,
  }
}
```

## 规格

```js
// useSku.js
import { ref, nextTick, computed } from 'vue'
import { createGoodsSkusCard, updateGoodsSkusCard, deleteGoodsSkusCard, sortGoodsSkusCard, createGoodsSkusCardValue, updateGoodsSkusCardValue, deleteGoodsSkusCardValue, chooseAndSetGoodsSkusCard } from '~/api/goods.js'
import { useArrayMoveUp, useArrayMoveDown, cartesianProductOf } from '~/composables/util'

// 当前商品ID
export const goodsId = ref(0)
// 规格选项列表
export const sku_card_list = ref([])
// 表格数据
export const sku_list = ref([])
// 初始化规格选项列表
export function initSkuCardList(d) {
  sku_card_list.value = d.goodsSkusCard.map((item) => {
    item.text = item.name
    item.loading = false
    item.goodsSkusCardValue.map((v) => {
      v.text = v.value || '属性值'
      return v
    })
    return item
  })
  sku_list.value = d.goodsSkus
}

// 添加规格选项
export const btnLoading = ref(false)
export function addSkuCardEvent() {
  btnLoading.value = true
  createGoodsSkusCard({
    goods_id: goodsId.value,
    name: '规格选项',
    order: 50,
    type: 0, // 规格类型
  })
    .then((res) => {
      sku_card_list.value.push({
        ...res,
        text: res.name,
        loading: false,
        goodsSkusCardValue: [],
      })
    })
    .finally(() => {
      btnLoading.value = false
    })
}

// 修改规格选项
export function handleUpdate(item) {
  item.loading = true
  updateGoodsSkusCard(item.id, {
    goods_id: item.goods_id,
    name: item.text,
    order: item.order,
    type: 0,
  })
    .then((res) => {
      item.name = item.text
    })
    .catch((err) => {
      item.text = item.name
    })
    .finally(() => {
      item.loading = false
    })
}

// 删除规格选项
export function handleDelete(item) {
  item.loading = true
  deleteGoodsSkusCard(item.id)
  .then((res) => {
    const i = sku_card_list.value.findIndex((o) => o.id == item.id)
    if (i != -1) {
      sku_card_list.value.splice(i, 1)
    }
    getTableData()
  })
}

// 排序规格选项
export const bodyLoading = ref(false)
export function sortCard(action, index) {
  // 拷贝一份数据 
  let oList = JSON.parse(JSON.stringify(sku_card_list.value))
  let func = action == 'up' ? useArrayMoveUp : useArrayMoveDown
  func(oList, index)
  let sortData = oList.map((o, i) => {
    return {
      id: o.id,
      order: i + 1,
    }
  })
  bodyLoading.value = true
  sortGoodsSkusCard({
    sortdata: sortData,
  })
    .then((res) => {
      func(sku_card_list.value, index)
      getTableData()
    })
    .finally(() => {
      bodyLoading.value = false
    })
}

// 选择设置规格
export function handleChooseSetGoodsSkusCard(id, data) {
  let item = sku_card_list.value.find((o) => o.id == id)
  item.loading = true
  chooseAndSetGoodsSkusCard(id, data)
    .then((res) => {
      item.name = item.text = res.goods_skus_card.name
      item.goodsSkusCardValue = res.goods_skus_card_value.map((o) => {
        o.text = o.value || '属性值'
        return o
      })
      getTableData()
    })
    .finally(() => {
      item.loading = false
    })
}

// 初始化规格值
export function initSkusCardItem(id) {
  const item = sku_card_list.value.find((o) => o.id == id)
  const loading = ref(false)
  // 输入框的值
  const inputValue = ref('')
  // 是否显示输入框
  const inputVisible = ref(false)
  const InputRef = ref()

  // 删除规格值
  const handleClose = (tag) => {
    loading.value = true
    deleteGoodsSkusCardValue(tag.id)
      .then((res) => {
        let i = item.goodsSkusCardValue.findIndex((o) => o.id === tag.id)
        if (i != -1) {
          item.goodsSkusCardValue.splice(i, 1)
        }
        getTableData()
      })
      .finally(() => {
        loading.value = false
      })
  }

  // 显示输入框
  const showInput = () => {
    inputVisible.value = true
    nextTick(() => {
      InputRef.value.input.focus()
    })
  }
  // 提交tag值
  const handleInputConfirm = () => {
    if (!inputValue.value) {
      inputVisible.value = false
      return
    }
    loading.value = true
    createGoodsSkusCardValue({
      goods_skus_card_id: id,
      name: item.name,
      order: 50,
      value: inputValue.value,
    })
      .then((res) => {
        item.goodsSkusCardValue.push({
          ...res,
          text: res.value,
        })
        getTableData()
      })
      .finally(() => {
        inputVisible.value = false
        inputValue.value = ''
        loading.value = false
      })
  }

  // 输入框的值发生改变
  const handleChange = (value, tag) => {
    loading.value = true
    updateGoodsSkusCardValue(tag.id, {
      goods_skus_card_id: id,
      name: item.name,
      order: tag.order,
      value: value,
    })
      .then((res) => {
        tag.value = value
        getTableData()
      })
      .catch((err) => {
        tag.text = tag.value
      })
      .finally(() => {
        loading.value = false
      })
  }

  return {
    item,
    inputValue,
    inputVisible,
    InputRef,
    handleClose,
    showInput,
    handleInputConfirm,
    loading,
    handleChange,
  }
}

// 初始化表格
export function initSkuTable() {
  // 筛选规格值不为0的规格
  const skuLabels = computed(() => sku_card_list.value.filter((v) => v.goodsSkusCardValue.length > 0))

  // 获取表头
  const tableThs = computed(() => {
    let length = skuLabels.value.length
    return [
      {
        name: '商品规格',
        colspan: length,
        width: '',
        rowspan: length > 0 ? 1 : 2,
      },
      {
        name: '销售价',
        width: '100',
        rowspan: 2,
      },
      {
        name: '市场价',
        width: '100',
        rowspan: 2,
      },
      {
        name: '成本价',
        width: '100',
        rowspan: 2,
      },
      {
        name: '库存',
        width: '100',
        rowspan: 2,
      },
      {
        name: '体积',
        width: '100',
        rowspan: 2,
      },
      {
        name: '重量',
        width: '100',
        rowspan: 2,
      },
      {
        name: '编码',
        width: '100',
        rowspan: 2,
      },
    ]
  })

  return {
    skuLabels,
    tableThs,
    sku_list,
  }
}

// 获取规格表格数据
function getTableData() {
  setTimeout(() => {
    if (sku_card_list.value.length === 0) return []

    let list = []
    sku_card_list.value.forEach((o) => {
      if (o.goodsSkusCardValue && o.goodsSkusCardValue.length > 0) {
        list.push(o.goodsSkusCardValue)
      }
    })
    if (list.length == 0) {
      return []
    }
  
    let arr = cartesianProductOf(...list)

    // 获取之前的规格列表，将规格ID排序之后转化成字符串
    let beforeSkuList = JSON.parse(JSON.stringify(sku_list.value)).map((o) => 		{
      if (!Array.isArray(o.skus)) {
        o.skus = Object.keys(o.skus).map((k) => o.skus[k])
      }
      o.skusId = o.skus
        // 降序排列
        .sort((a, b) => a.id - b.id)
        .map((s) => s.id)
        .join(',')
      return o
    })

    sku_list.value = []
    sku_list.value = arr.map((skus) => {
      let o = getBeforeSkuItem(JSON.parse(JSON.stringify(skus)), beforeSkuList)
      return {
        code: o?.code || '',
        cprice: o?.cprice || '0.00',
        goods_id: goodsId.value,
        image: o?.image || '',
        oprice: o?.oprice || '0.00',
        pprice: o?.pprice || '0.00',
        skus,
        stock: o?.stock || 0,
        volume: o?.volume || 0,
        weight: o?.weight || 0,
      }
    })
  }, 200)
}
// 
function getBeforeSkuItem(skus, beforeSkuList) {
  let skusId = skus
    .sort((a, b) => a.id - b.id)
    .map((s) => s.id)
    .join(',')
  return beforeSkuList.find((o) => {
    if (skus.length > o.skus.length) {
      return skusId.indexOf(o.skusId) != -1
    }
    return o.skusId.indexOf(skusId) != -1
  })
}
```



# 组件模块(src/components)

## 弹框表单组件

```vue
<template>
  // destroy-on-close：关闭后是否销毁 
  <el-drawer v-model="drawer" :title="title" :size="size" :close-on-click-modal="false" :destroy-on-close="destroyOnClose">
    <div class="formDrawer">
      <div class="body">
        <slot></slot>
      </div>
      <div class="actions">
        <el-button type="primary" @click="submit" :loading="loading">{{confirmText}}</el-button>
        <el-button type="default" @click="close">取 消</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref } from 'vue'
const drawer = ref(false)

const props = defineProps({
  title: String,
  size: {
    type: String,
    default: '45%'
  },
  destroyOnClose: {
    type: Boolean,
    default: false
  },
  confirmText: {
    type: String,
    default: '提交'
  }
})

const loading = ref(false)
const showLoading = () => {
  loading.value = true
}

const hideLoading = () => {
  loading.value = false
}

// 打开
const open = () => {
  drawer.value = true
}

// 关闭
const close = () => {
  drawer.value = false
}

// 提交
const emit = defineEmits(['submit'])
const submit = () => emit('submit')

// 向父组件暴露以下方法
defineExpose({
  open,
  close,
  showLoading,
  hideLoading
})
</script>

<style>
.formDrawer {
  width: 100%;
  height: 100%;
  @apply flex flex-col;
  position: relative;
}

.formDrawer .body {
  flex: 1;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 50px;
  overflow-y: auto;
}

.formDrawer .actions {
  height: 50px;
  @apply mt-auto flex items-center;
}
</style>
```

## 标签导航组件

```js
import { ref } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { useCookies } from '@vueuse/integrations/useCookies'
import { router } from '~/router'

export function useTabList() {
  const route = useRoute()
  const cookie = useCookies()

  const activeTab = ref(route.path)
  const tabList = ref([
    {
      title: '后台首页',
      path: '/',
    },
  ])

  // 添加标签导航
  function addTab(tab) {
    let notab = tabList.value.findIndex((t) => t.path == tab.path) == -1
    if (notab) {
      tabList.value.push(tab)
    }
    cookie.set('tabList', tabList.value)
  }
  // 初始化标签导航列表
  function initTabList() {
    let tbs = cookie.get('tabList')
    if (tbs) {
      tabList.value = tbs
    }
  }

  initTabList()

  onBeforeRouteUpdate((to, from) => {
    activeTab.value = to.path
    addTab({ title: to.meta.title, path: to.path })
  })

  const changeTab = (t) => {
    activeTab.value = t
    router.push(t)
  }

  const removeTab = (t) => {
    let a = activeTab.value
    let tabs = tabList.value
    if (a == t) {
      tabs.forEach((tab, index) => {
        if (tab.path == t) {
          const nextTab = tabs[index + 1] || tabs[index - 1]
          if (nextTab) {
            a = nextTab.path
          }
        }
      })
    }
    activeTab.value = a
    tabList.value = tabList.value.filter((tab) => tab.path != t)

    cookie.set('tabList', tabList.value)
  }

  const handleClose = (c) => {
    if (c == 'clearAll') {
      // 切换回首页
      activeTab.value = '/'
      // 过滤只剩下首页
      tabList.value = [
        {
          title: '后台首页',
          path: '/',
        },
      ]
    } else if (c == 'clearOther') {
      tabList.value = tabList.value.filter((tab) => tab.path == '/' || tab.path == activeTab.value)
    }
    cookie.set('tabList', tabList.value)
  }

  return {
    activeTab,
    tabList,
    changeTab,
    removeTab,
    handleClose,
  }
}
```

## 数字滚动组件

```vue
//  src/components/CountTo.vue
<template>
  {{ d.num.toFixed(0) }}
</template>

<script setup>
import { reactive, watch } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  value: {
    type: Number,
    default: 0
  }
})
const d = reactive({
  num: 0
})

function AnimateToValue() {
  gsap.to(d, {
    duration: 0.5,
    num: props.value
  })
}

AnimateToValue()

watch(
  () => props.value,
  () => AnimateToValue
)
</script>

<style>
</style>
```

## 分类组件

```vue
// IndexNav.vue

<template>
  <el-row :gutter="20" class="mt-5">
    <el-col :span="3" :offset="0" v-for="(item,index) in iconNavs" :key="index">
      <el-card shadow="hover" @click="$router.push(item.path)">
        <div class="flex flex-col items-center justify-center cursor-pointer">
          <el-icon :size="25" :class="item.color">
            <component :is="item.icon"></component>
          </el-icon>
          <span class="text-sm mt-2">{{item.title}}</span>
        </div>
      </el-card>

    </el-col>
  </el-row>

</template>

<script setup>
const iconNavs = [
  {
    icon: 'user',
    color: 'text-light-blue-500',
    title: '用户',
    path: '/user/list'
  },
  {
    icon: 'shopping-cart',
    color: 'text-violet-500',
    title: '商品',
    path: '/goods/list'
  },
  {
    icon: 'tickets',
    color: 'text-fuchsia-500',
    title: '订单',
    path: '/order/list'
  },
  {
    icon: 'chat-dot-square',
    color: 'text-teal-500',
    title: '评价',
    path: '/comment/list'
  },
  {
    icon: 'picture',
    color: 'text-rose-500',
    title: '图库',
    path: '/image/list'
  },
  {
    icon: 'bell',
    color: 'text-green-500',
    title: '公告',
    path: '/notice/list'
  },
  {
    icon: 'set-up',
    color: 'text-grey-500',
    title: '配置',
    path: '/setting/base'
  },
  {
    icon: 'files',
    color: 'text-yellow-500',
    title: '优惠券',
    path: '/coupon/list'
  }
]
</script>
```

## Echarts组件

```vue
<template>
  <el-card shadow="never">
    <template #header>
      <div class="flex justify-between">
        <span class="text-sm">订单统计</span>
        <div>
          <el-check-tag v-for="(item,index) in options" :key="index" :checked="current == item.value" style="margin-right: 8px" @click="handleChoose(item.value)">{{item.text}}</el-check-tag>
        </div>
      </div>
    </template>

    <div ref="el" id="chart" style="width:100%; height:300px;">

    </div>
  </el-card>

</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { getStatistics3 } from '~/api/index.js'
import { useResizeObserver } from '@vueuse/core'

const current = ref('week')
const options = [
  {
    text: '近1个月',
    value: 'month'
  },
  {
    text: '近1周',
    value: 'week'
  },
  {
    text: '近24小时',
    value: 'hour'
  }
]

const handleChoose = type => {
  current.value = type
  getData()
}

var myChart = null
onMounted(() => {
  var chartDom = document.getElementById('chart')
  if (chartDom) {
    myChart = echarts.init(chartDom)
    getData()
  }
})

onBeforeUnmount(() => {
  if (myChart) {
    echarts.dispose(myChart)
  }
})

function getData() {
  let option = {
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [],
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)'
        }
      }
    ]
  }
  myChart.showLoading()

  getStatistics3(current.value)
    .then(res => {
      option.xAxis.data = res.x
      option.series[0].data = res.y

      myChart.setOption(option)
    })
    .finally(() => {
      myChart.hideLoading()
    })
}

const el = ref(null)
useResizeObserver(el, entries => {
  myChart.resize()
})
</script>
```

## 店铺信息组件

```vue
// IndexCard.vue
<template>
  <el-card shadow="never">
    <template #header>
      <div class="flex justify-between">
        <span class="text-sm">{{ title }}</span>
        <el-tag type="danger" effect="plain">
          {{ tip }}
        </el-tag>
      </div>
    </template>
    <el-row :gutter="20">
      <el-col :span="6" :offset="0" v-for="(item,index) in btns" :key="index">
        <el-card shadow="hover" class="border-0 bg-light-400">
          <div class="flex flex-col items-center justify-center">
            <span class="text-xl mb-2">{{item.value}}</span>
            <span class="text-xs text-gray-500">{{item.label}}</span>
          </div>
        </el-card>

      </el-col>
    </el-row>

  </el-card>

</template>
<script setup>
defineProps({
  title: String,
  tip: String,
  btns: Array
})
</script>
```

## 图片菜单栏组件

```vue
// ImageAside.vue
<template>
  <el-aside width="220px" class="image-aside" v-loading="loading">
     
    <div class="top">
      <AsideList v-for="(item,index) in list" :key="index" :active="activeId == item.id" @edit="handleEdit(item)" @delete="handleDelete(item.id)" @click="handleChangeActiveId(item.id)">
        {{item.name}}
      </AsideList>
    </div>
      
    <div class="bottom">
      // 分页 page-size：每页显示条数 current-change：页码发生改变时触发
      <el-pagination background layout="prev,next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData"></el-pagination>
    </div>
      
  </el-aside>

  <FormDrawer ref="fromDrawerRef" @submit="handleSubmit" :title="drawerTitle">
    <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="排序" prop="order">
        <el-input-number v-model="form.order" :min="0" :max="1000" />
      </el-form-item>
    </el-form>
  </FormDrawer>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import {
  getImageClassList,
  createImageClass,
  upadateImageClass,
  deleteImageClass
} from '~/api/image_class.js'
import AsideList from './AsideList.vue'
import FormDrawer from './FormDrawer.vue'
import { toast } from '~/composables/util.js'

// 加载动画
const loading = ref(false)
const list = ref([])
// 激活状态
const activeId = ref(0)

// 分页
// 当前的分页
const currentPage = ref(1)
const total = ref(0)
const limit = ref(10)

// 有id表示修改，没有表示新增
const editID = ref(0)
const drawerTitle = computed(() => (editID.value ? '修改' : '新增'))

// 获取数据
function getData(p = null) {
  // 判断是否传了页码
  if (typeof p == 'number') {
    currentPage.value = p
  }

  loading.value = true
  getImageClassList(currentPage.value)
    .then(res => {
      total.value = res.totalCount
      // 存储列表数据
      list.value = res.list
      let item = list.value[0]
      if (item) {
        handleChangeActiveId(item.id)
      }
    })
    .finally(() => {
      loading.value = false
    })
}

getData()

const fromDrawerRef = ref(null)
const form = reactive({
  name: '',
  order: 50
})
const rules = {
  name: [{ required: true, message: '图库分类名称不能为空', trigger: 'blur' }]
}
const formRef = ref(null)

// 提交新增图片
const handleSubmit = () => {
  formRef.value.validate(valid => {
    if (!valid) return
    fromDrawerRef.value.showLoading()
    const fun = editID.value
      ? upadateImageClass(editID.value, form)
      : createImageClass(form)

    fun
      .then(res => {
        toast(drawerTitle.value + '成功')
        // 新增则刷新第一页，修改则刷新当前页
        getData(editID.value ? currentPage.value : 1)
        fromDrawerRef.value.close()
      })
      .finally(() => {
        fromDrawerRef.value.hideLoading()
      })
  })
}
// 新增图片
const handleCreate = () => {
  editID.value = 0
  form.name = ''
  form.order = 50
  fromDrawerRef.value.open()
}


defineExpose({
  handleCreate
})

// 编辑
const handleEdit = item => {
  editID.value = item.id
  form.name = item.name
  form.order = item.order
  fromDrawerRef.value.open()
}

// 删除
const handleDelete = id => {
  loading.value = true
  deleteImageClass(id)
    .then(res => {
      toast('删除成功')
      getData()
    })
    .finally(() => {
      loading.value = false
    })
}

// 切换分类
const emit = defineEmits(['change'])
function handleChangeActiveId(id) {
  activeId.value = id
  emit('change', id)
}
</script>

<style scoped>
.image-aside {
  border-right: 1px solid #eee;
  position: relative;
}

.image-aside .top {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 50px;
  overflow-y: auto;
}
.image-aside .bottom {
  position: absolute;
  bottom: 0;
  height: 50px;
  left: 0;
  right: 0;
  @apply flex items-center justify-center;
}
.aside-list {
  border-bottom: 1px solid #f4f4f4;
  cursor: pointer;
  @apply flex items-center p-3 text-sm text-gray-600;
}
.aside-list:hover,
.active {
  @apply bg-blue-50;
}
</style>
```

## 图片主体组件

```vue
// ImageMain.vue
<template>
  <el-main class="image-main" v-loading="loading">
    <div class="top p-3">
      <el-row :gutter="10">
        <el-col :span="6" :offset="0" v-for="(item,index) in list" :key="index">
          <el-card shadow="hover" class="relative mb-3" :body-style="{'padding':0}" :class="{'border-blue-500':item.checked} ">
              // preview-src-list="[item.url]"：实现预览效果
              <el-image :src="item.url" fit="cover" class=" w-full h-[150px]" :preview-src-list="[item.url]" :initial-index="0"></el-image>
            // 图片标题
            <div class="image-title">{{ item.name }}</div>
            <div class="flex items-center justify-center p-2">
              // 
              <el-checkbox v-model="item.checked" @change="handleChooseChange(item)" v-if="openChoose"></el-checkbox>
              <el-button type="primary" size="small" text @click="handleEdit(item)">重命名</el-button>
              <el-popconfirm title="是否要删除该图片" confirm-button-text="确认" cancel-button-text="取消" @confirm='handleDelete(item.id)'>
                <template #reference>
                  <el-button type="primary" size="small" text class="!m-0">
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </el-card>
        </el-col>
      </el-row>

    </div>
	// 分页
    <div class="bottom">
      <el-pagination background layout="prev,pager,next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData"></el-pagination>
    </div>
  </el-main>

  <el-drawer v-model="drawer" title="上传图片">
    <UploadFile :data="{image_class_id}" @success="handleUploadSuccess"></UploadFile>
  </el-drawer>
</template>
<script setup>
import { computed, ref } from 'vue'
import { getImageList, updateImage, deleteImage } from '~/api/image.js'
import { showPrompt, toast } from '~/composables/util.js'
import UploadFile from './UploadFiles.vue'

// 上传图片
const drawer = ref(false)
const openUploadFile = () => {
  drawer.value = true
}

// 分页
const currentPage = ref(1)
const total = ref(0)
const limit = ref(10)
const list = ref([])
const loading = ref(false)
// 当前图库分类的id
const image_class_id = ref(0)

// 获取数据
function getData(p = null) {
  if (typeof p == 'number') {
    currentPage.value = p
  }

  loading.value = true
  getImageList(image_class_id.value, currentPage.value)
    .then(res => {
      total.value = res.totalCount
      list.value = res.list.map(o => {
        o.checked = false
        return o
      })
    })
    .finally(() => {
      loading.value = false
    })
}

// 根据分类id重新加载分类列表
const loadData = id => {
  currentPage.value = 1
  image_class_id.value = id
  getData()
}

// 重命名
const handleEdit = item => {
  // value是输入框里的值
  showPrompt('重命名', item.name).then(({ value }) => {
    loading.value = true
    updateImage(item.id, value)
      .then(res => {
        toast('修改成功')
        getData()
      })
      .finally(() => {
        loading.value = false
      })
  })
}

// 删除
const handleDelete = id => {
  loading.value = true
  deleteImage([id])
    .then(() => {
      toast('删除成功')
      getData()
    })
    .finally(() => {
      loading.value = false
    })
}

// 上传成功
const handleUploadSuccess = () => getData(1)

const props = defineProps({
  openChoose: { type: Boolean, default: false },
  // 上传图片限制的数量
  limit: { type: Number, default: 1 }
})

// 选中的图片
const emit = defineEmits(['choose'])
// 拿到选中的图片
const checkedImage = computed(() => list.value.filter(o => o.checked))
const handleChooseChange = item => {
  if (item.checked && checkedImage.value.length > props.limit) {
    item.checked = false
    return toast(`最多只能选${props.limit}张`, 'error')
  }
  emit('choose', checkedImage.value)
}

defineExpose({
  loadData,
  openUploadFile
})
</script>

<style scoped>
.image-main {
  position: relative;
}

.image-main .top {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 50px;
  overflow-y: auto;
}

.image-main .bottom {
  position: absolute;
  bottom: 0;
  height: 50px;
  left: 0;
  right: 0;
  @apply flex items-center justify-center;
}

.image-title {
  position: absolute;
  top: 122px;
  left: -1px;
  right: -1px;
  @apply text-sm truncate text-gray-100 bg-opacity-50 bg-gray-800 px-2 py-1;
}
</style>
```

## 菜单标签组件

```vue
// AsideList.vue
<template>
  <div class="aside-list" :class="{'active':active}">
    <span class="truncate">
      <slot></slot>
    </span>
    <el-button type="primary" size="small" text class="ml-auto px-1" @click.stop="$emit('edit')">
      <el-icon :size="12">
        <Edit />
      </el-icon>
    </el-button>
      
    <span @click.stop="" >
      <el-popconfirm title="是否要删除该分类" confirm-button-text="确认" cancel-button-text="取消" @confirm.stop="$emit('delete')">
        <template #reference>
          <el-button type="primary" size="small" text class="px-1">
            <el-icon :size="12">
              <Close />
            </el-icon>
          </el-button>
        </template>
      </el-popconfirm>
    </span>
  </div>
</template>

<script setup>
defineProps({
  active: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit', 'delete'])
</script>

<style scoped>
.aside-list {
  border-bottom: 1px solid #f4f4f4;
  cursor: pointer;
  @apply flex items-center p-3 text-sm text-gray-600;
}
.aside-list:hover,
.active {
  @apply bg-blue-50;
}
</style>
```

## 上传文件组件

```vue
// UploadFile.vue
<template>
  // drag：拖拽上传
  <el-upload drag :action="uploadImageAction" multiple :headers="{token}" name="img" :data="data" on-success="uploadSuccess" on-error="uploadError">
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text">
      Drop file here or <em>click to upload</em>
    </div>
    <template #tip>
      <div class="el-upload__tip">
        jpg/png files with a size less than 500kb
      </div>
    </template>
  </el-upload>
</template>

<script setup>
import { uploadImageAction } from '~/api/image'
import { getToken } from '~/composables/auth'
import { toast } from '~/composables/util.js'

const token = getToken()

defineProps({
  data: Object
})
const emit = defineEmits(['success'])
// 上传成功
const uploadSuccess = (response, uploadFile, uploadFiles) => {
  emit('success', {response, uploadFile, uploadFiles})
}
// 上传失败 
const uploadError = (error, uploadFile, uploadFiles) => {
  let msg = JSON.parse(error.message).msg || '上传失败'
  toast(msg, 'error')
}
</script>
```

## 搜索组件

```vue
// Search.vue
<template>
  <el-form :model="model" label-width="80px" class="mb-3" size="small">
    <el-row :gutter="20">
      <slot />
      <template v-if="showSearch">
        <slot name="show" />
      </template>
      <el-col :span="8" :offset="showSearch?0:8">
        <div class="flex items-center justify-end">
          <el-button type="primary" @click="$emit('search')">搜索</el-button>
          <el-button @click="$emit('reset')">重置</el-button>
          <el-button type="primary" text @click="showSearch = !showSearch" v-if="hasShowSearch">
            {{ showSearch ? '收起' : "展开" }}
            <el-icon>
              <ArrowUp v-if="showSearch"></ArrowUp>
              <ArrowDown v-else></ArrowDown>
            </el-icon>
          </el-button>
        </div>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup>
import { ref, useSlots } from 'vue'
defineEmits(['search', 'reset'])
defineProps({
  model: Object
})
// 是否展开商品分类
const showSearch = ref(false)
const slots = useSlots()
// 判断插槽show里有没有值
const hasShowSearch = ref(!!slots.show)
</script>

<style>
</style>
```

## 搜索项组件

```vue
// SearchItem.vue
<template>
  <el-col :span="8" :offset="0">
    <el-form-item :label="label">
      <slot />
    </el-form-item>
  </el-col>
</template>

<script setup>
defineProps({
  label: String
})
</script>

<style>
</style>
```

## 图片选择组件

```vue
// ChooseImage.vue
<template>
  <div v-if="modelValue && preview">
    <el-image v-if="typeof modelValue == 'string'" :src="modelValue" fit="cover" class="w-[100px] h-[100px] rounded border mr-2"></el-image>
    <div v-else class="flex flex-wrap">
      <div class="relative mx-1 mb-2 w-[100px] h-[100px]" v-for="(url,index) in modelValue" :key="index">
        <el-icon class="absolute right-[5px] top-[5px] cursor-pointer bg-white rounded-full" style="z-index: 10;" @click="removeImage(url)">
          <CircleClose />
        </el-icon>
        <el-image :src="url" fit="cover" class="w-[100px] h-[100px] rounded border mr-2"></el-image>
      </div>
    </div>
  </div>

  // 图片选择框
  <div v-if="preview" class="choose-image-btn" @click="open">
    <el-icon :size="25" class="text-gray-500">
      <Plus />
    </el-icon>
  </div>

  <el-dialog title="选择图片" v-model="dialogVisible" width="80%" top="5vh">
    <el-container class="bg-white rounded" style="height:70vh;">
      <el-header class="image-header">
        <el-button type="primary" size="small" @click="handleOpenCreate">新增图片分类</el-button>
        <el-button type="warning" size="small" @click="handleOpenUpload">上传图片</el-button>
      </el-header>
        
      <el-container>
        <ImageAside ref="ImageAsideRef" @change="handleAsideChange" />
        <ImageMain :limit="limit" openChoose ref="ImageMainRef" @choose="handleChoose" />
      </el-container>
    </el-container>

    <template #footer>
      <span>
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </el-dialog>

</template>
<script setup>
import { ref } from 'vue'
import ImageAside from '~/components/ImageAside.vue'
import ImageMain from '~/components/ImageMain.vue'
import { toast } from '~/composables/util'

const dialogVisible = ref(false)

const callbackFunction = ref(null)
// 弹出对话框
const open = (callback = null) => {
  callbackFunction.value = callback
  dialogVisible.value = true
}
const close = () => (dialogVisible.value = false)

const ImageAsideRef = ref(null)
const handleOpenCreate = () => ImageAsideRef.value.handleCreate()

const ImageMainRef = ref(null)
const handleAsideChange = image_class_id =>
  ImageMainRef.value.loadData(image_class_id)

const handleOpenUpload = () => ImageMainRef.value.openUploadFile()

const props = defineProps({
  modelValue: [String, Array],
  // 限制选择的图片数量
  limit: {
    type: Number,
    default: 1
  },
  // 隐藏选择图片框
  preview: {
    type: Boolean,
    default: true
  }
})
const emit = defineEmits(['update:modelValue'])

let urls = []
// 选中图片
const handleChoose = e => {
  urls = e.map(o => o.url)
}

const submit = () => {
  let value = []
  if (props.limit == 1) {
    value = urls[0]
  } else {
    value = props.preview ? [...props.modelValue, ...urls] : [...urls]
    if (value.length > props.limit) {
      let limit = props.preview
        ? props.limit - props.modelValue.length
        : props.limit
      return toast('最多还能选择' + limit + '张')
    }
  }
  if (value && props.preview) {
    emit('update:modelValue', value)
  }
  // 传回value
  if (!props.preview && typeof callbackFunction.value === 'function') {
    callbackFunction.value(value)
  }
  close()
}
// 删除图片
const removeImage = url =>
  emit(
    'update:modelValue',
    props.modelValue.filter(u => u != url)
  )

defineExpose({
  open
})
</script>
<style>
.image-header {
  border-bottom: 1px solid #eeeeee;
  @apply flex items-center;
}
.choose-image-btn {
  @apply w-[100px] h-[100px] rounded border flex justify-center items-center cursor-pointer hover:(bg-gray-100);
}
</style>
```

## 新增删除刷新导出组件

```vue
// ListHeader.vue
<template>
  <div class="flex items-center justify-between mb-4">
    <div>
      <el-button v-if="btns.includes('create')" type="primary" size="small" @click="$emit('create')">新增</el-button>

      <el-popconfirm v-if="btns.includes('delete')" title="是否要删除选中记录？" confirmButtonText="确认" cancelButtonText="取消" @confirm="$emit('delete')">
        <template #reference>
          <el-button type="danger" size="small">批量删除</el-button>
        </template>
      </el-popconfirm>
      <slot />
    </div>

    <div>
      <el-tooltip v-if="btns.includes('refresh')" effect="dark" content="刷新数据" placement="top">
        <el-button size="small" text @click="$emit('refresh')">
          <el-icon :size="15">
            <Refresh />
          </el-icon>
        </el-button>
      </el-tooltip>
        
      <el-tooltip v-if="btns.includes('download')" effect="dark" content="导出数据" placement="top">
        <el-button size="small" text @click="$emit('download')">
          <el-icon :size="15">
            <Download />
          </el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>
  <script setup>
import { computed } from 'vue'
const props = defineProps({
  layout: {
    type: String,
    default: 'create,refresh'
  }
})

const btns = computed(() => props.layout.split(','))

defineEmits(['create', 'refresh', 'delete', 'download'])
</script>
```

## 图标选择组件

```vue
// IconSelete.vue
<template>
  <div class="flex items-center">
    <el-icon :size="20" v-if="modelValue" class="mr-2">
      <component :is="modelValue"></component>
    </el-icon>
    // filterable：可以筛选
    <el-select filterable :modelValue="modelValue" class="m-2" placeholder="请选择请求图标" @change="handleChange">
      <el-option v-for="item in icons" :key="item" :label="item" :value="item">
        <div class="flex items-center justify-between">
          <el-icon>
            <component :is="item"></component>
          </el-icon>
          <span class=" text-gray-500">{{ item }}</span>
        </div>
      </el-option>
    </el-select>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import * as iconList from '@element-plus/icons-vue'

defineProps({
  modelValue: String
})

// 拿到所有的图标
const icons = ref(Object.keys(iconList))
const emit = defineEmits(['update:modelValue'])
// 选中值的变化
const handleChange = icon => {
  emit('update:modelValue', icon)
}
</script>
```

## Tag组件

```vue
// TagInput.vue
<template>
  <el-tag v-for="tag in dynamicTags" :key="tag" class="mx-1" closable :disable-transitions="false" @close="handleClose(tag)">
    {{ tag }}
  </el-tag>
  <el-input v-if="inputVisible" ref="InputRef" v-model="inputValue" class="ml-1 w-20" size="small" @keyup.enter="handleInputConfirm" @blur="handleInputConfirm" />
  <el-button v-else class="button-new-tag ml-1" size="small" @click="showInput">
    + 添加值
  </el-button>
</template>

<script setup>
import { nextTick, ref } from 'vue'

const props = defineProps({
  modelValue: String
})
const emit = defineEmits(['update:modelValue'])

const inputValue = ref('')
// 收到传来的字符串并转换成数组
const dynamicTags = ref(props.modelValue ? props.modelValue.split(',') : [])
const inputVisible = ref(false)
const InputRef = ref()
// 删除
const handleClose = tag => {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1)
  emit('update:modelValue', dynamicTags.value.join(','))
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value.input.focus()
  })
}
// 点击回车或失去焦点
const handleInputConfirm = () => {
  if (inputValue.value) {
    dynamicTags.value.push(inputValue.value)
    emit('update:modelValue', dynamicTags.value.join(','))
  }
  inputVisible.value = false
  inputValue.value = ''
}
</script>
```

## 规格卡片组件

```vue
// goods/components/SkuCard.vue
<template>
  <el-form-item label="规格选项" v-loading="bodyLoading">
    <el-card shadow="never" class="w-full mb-3" v-for="(item,index) in sku_card_list" :key="item.id" v-loading="item.loading">
      <template #header>
        <div class="flex items-center">
          <el-input v-model="item.text" placeholder="规格名称" style="width:200px;" @change="handleUpdate(item)">
            <template #append>
              <el-icon class="cursor-pointer" @click="handleChooseSku(item)">
                <more />
              </el-icon>
            </template>
          </el-input>
		  // 上移
          <el-button class="ml-auto" size="small" @click="sortCard('up',index)" :disabled="index == 0"><el-icon>
              <Top />
            </el-icon>
		  </el-button>
		  // 下移
          <el-button size="small" @click="sortCard('down',index)" :disabled="index === (sku_card_list.length - 1)"><el-icon>
              <Bottom />
            </el-icon>
		  </el-button>
  		  // 删除
          <el-popconfirm title="是否要删除该选项？" confirmButtonText="确认" cancelButtonText="取消" @confirm="handleDelete(item)">
            <template #reference>
              <el-button size="small"><el-icon>
                  <Delete />
                </el-icon>
              </el-button>
            </template>
          </el-popconfirm> 
        </div>
      </template>
      <SkuCardItem :skuCardId="item.id" />
    </el-card>
    <el-button type="success" size="small" :loading="btnLoading" @click="addSkuCardEvent">添加规格选项</el-button>
  </el-form-item>
  // 选择规格
  <ChooseSku ref="ChooseSkuRef" />
</template>

<script setup>
import { ref } from 'vue'
import SkuCardItem from './SkuCardItem.vue'
import ChooseSku from '~/components/ChooseSku.vue'
import {
  sku_card_list,
  addSkuCardEvent,
  btnLoading,
  handleUpdate,
  handleDelete,
  sortCard,
  bodyLoading,
  handleChooseSetGoodsSkusCard
} from '~/composables/useSku.js'

const ChooseSkuRef = ref(null)
// 展开规格选择框
const handleChooseSku = item => {
  ChooseSkuRef.value.open(value => {
    handleChooseSetGoodsSkusCard(item.id, {
      name: value.name,
      value: value.list
    })
  })
}
</script>
<style>
.el-card__header {
  @apply !p-2 bg-gray-50;
}
</style>
```

## 规格卡片项组件

```vue
// goods/components/SkuCardItem.vue
<template>
  <div v-loading="loading">
    <el-tag v-for="(tag,index) in item.goodsSkusCardValue" :key="index" class="mx-1" closable :disable-transitions="false" @close="handleClose(tag)" effect="plain">
      <el-input class="w-20 ml-[-10px]" v-model="tag.text" placeholder="选项值" size="small" @change="handleChange($event,tag)"></el-input>
    </el-tag>
    <el-input v-if="inputVisible" ref="InputRef" v-model="inputValue" class="ml-1 w-20" size="small" @keyup.enter="handleInputConfirm" @blur="handleInputConfirm" />
    <el-button v-else class="button-new-tag ml-1" size="small" @click="showInput">
      + 添加选项值
    </el-button>
  </div>
</template>
<script setup>
import { initSkusCardItem } from '~/composables/useSku.js'

const props = defineProps({
  skuCardId: [Number, String]
})

const {
  item,
  inputValue,
  inputVisible,
  InputRef,
  handleClose,
  showInput,
  handleInputConfirm,
  loading,
  handleChange
} = initSkusCardItem(props.skuCardId)
</script>
```

## 规格表格组件

```vue
// goods/components/SkuTable.vue
<template>
  <el-form-item label="规格设置">
    <table class="border">
      <thead>
        <tr>
          <th class="border" v-for="(th,thi) in tableThs" :key="thi" :width="th.width" :rowspan="th.rowspan" :colspan="th.colspan">
            {{ th.name }}
          </th>
        </tr>
        <tr>
          <th class="border" v-for="(th,thi) in skuLabels" :key="thi">
            {{ th.name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item,index) in sku_list" :key="index">
          <td width="100" class="border text-center" v-for="(sku,skuI) in item.skus" :key="skuI">
            {{ sku.value }}
          </td>
          <td class="border">
            <el-input v-model="item.pprice" size="small" type="number"></el-input>
          </td>
          <td class="border">
            <el-input v-model="item.oprice" size="small" type="number"></el-input>
          </td>
          <td class="border">
            <el-input v-model="item.cprice" size="small" type="number"></el-input>
          </td>
          <td class="border">
            <el-input v-model="item.stock" size="small" type="number"></el-input>
          </td>
          <td class="border">
            <el-input v-model="item.volume" size="small" type="number"></el-input>
          </td>
          <td class="border">
            <el-input v-model="item.weight" size="small" type="number"></el-input>
          </td>
          <td class="border">
            <el-input v-model="item.code" size="small"></el-input>
          </td>
        </tr>
      </tbody>
    </table>
  </el-form-item>
</template>
<script setup>
import { initSkuTable } from '~/composables/useSku'

const { skuLabels, tableThs, sku_list } = initSkuTable()
</script>
```

## 规格选择组件

```vue
// ChooseSku.vue
<template>
  <el-dialog title="规格选择" v-model="dialogVisible" width="80%" top="5vh">
    <el-container style="height:65vh;">
      <el-aside width="220px" class="image-aside">
        <div class="top">
          <div class="sku-list" :class="{ 'active':(activeId == item.id) }" v-for="(item,index) in tableData" :key="index" @click="handleChangeActiveId(item.id)">
            {{ item.name }}
          </div>
        </div>
         // 分页
        <div class="bottom">
          <el-pagination background layout="prev, next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData" />
        </div>
      </el-aside>
      <el-main>
        <el-checkbox-group v-model="form.list">
          <el-checkbox v-for="item in list" :key="item" :label="item" border>
            {{item}}
          </el-checkbox>
        </el-checkbox-group>
      </el-main>
    </el-container>

    <template #footer>
      <span>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { getSkusList } from '~/api/skus'
import { useInitTable } from '~/composables/useCommon'

const dialogVisible = ref(false)
const activeId = ref(0)
const { loading, currentPage, limit, total, tableData, getData } = useInitTable(
  {
    getList: getSkusList,
    onGetListSuccess: res => {
      tableData.value = res.list
      total.value = res.totalCount
      if (tableData.value.length > 0) {
        handleChangeActiveId(tableData.value[0].id)
      }
    }
  }
)

const callbackFunction = ref(null)
const open = (callback = null) => {
  callbackFunction.value = callback
  getData(1)
  dialogVisible.value = true
}

const list = ref([])
const form = reactive({
  name: '',
  list: []
})
// 切换点击事件
function handleChangeActiveId(id) {
  activeId.value = id
  list.value = []
  let item = tableData.value.find(o => o.id == id)
  if (item) {
    list.value = item.default.split(',')
    form.name = item.name
  }
}

const submit = () => {
  if (typeof callbackFunction.value === 'function') {
    callbackFunction.value(form)
  }
  dialogVisible.value = false
}

defineExpose({
  open
})
</script>

<style>
.image-aside {
  border-right: 1px solid #eeeeee;
  position: relative;
}
.image-aside .top {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 50px;
  overflow-y: auto;
}
.image-aside .bottom {
  position: absolute;
  bottom: 0;
  height: 50px;
  left: 0;
  right: 0;
  @apply flex items-center justify-center;
}
.sku-list {
  border-bottom: 1px solid #f4f4f4;
  @apply p-3 text-sm text-gray-600 flex items-center cursor-pointer;
}
.sku-list:hover,
active {
  @apply bg-blue-50;
}
</style>
```

## 推荐产品组件

```vue
// category/components/GoodsDrawer.vue
<template>
  <FormDrawer ref="formDrawerRef" title="推荐商品" @submit="handleConnect" confirmText="关联">
    <el-table :data="tableData" border stripe style="width:100%;">
      <el-table-column prop="goods_id" label="ID" width="60" />
      <el-table-column label="商品封面" width="180">
        <template #default="{ row }">
          <el-image :src="row.cover" fit="fill" :lazy="true" style="width: 64px;height: 64px;"></el-image>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商品名称" width="180" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-popconfirm title="是否要删除该记录？" confirmButtonText="确认" cancelButtonText="取消" @confirm="handleDelete(row)">
            <template #reference>
              <el-button text type="primary" size="small" :loading="row.loading">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </FormDrawer>

  <ChooseGoods ref="ChooseGoodsRef" />
</template>

<script setup>
import { ref } from 'vue'
import FormDrawer from '~/components/FormDrawer.vue'
import ChooseGoods from '~/components/ChooseGoods.vue'
import { toast } from '~/composables/util'
import {
  getCategoryGoods,
  deleteCategoryGoods,
  connectCategoryGoods
} from '~/api/category.js'

const formDrawerRef = ref(null)
const category_id = ref(0)
const tableData = ref([])

const open = item => {
  category_id.value = item.id
  item.goodsDrawerLoading = true
  getData()
    .then(res => formDrawerRef.value.open())
    .finally(() => {
      item.goodsDrawerLoading = false
    })
}

function getData() {
  return getCategoryGoods(category_id.value).then(res => {
    tableData.value = res.map(o => {
      o.loading = false
      return o
    })
  })
}

const handleDelete = row => {
  row.loading = true
  deleteCategoryGoods(row.id).then(res => {
    toast('删除成功')
    getData()
  })
}

// 关联产品
const ChooseGoodsRef = ref(null)
const handleConnect = () => {
  ChooseGoodsRef.value.open(goods_ids => {
    formDrawerRef.value.showLoading()
    connectCategoryGoods({
      category_id: category_id.value,
      goods_ids
    })
      .then(res => {
        getData()
        toast('关联成功')
      })
      .finally(() => {
        formDrawerRef.value.hideLoading()
      })
  })
}

defineExpose({
  open
})
</script>
```

## 商品选择组件

```vue
// ChooseGoods.vue
<template>
  <el-dialog title="商品选择" v-model="dialogvisible" width="80%" destroy-on-close>
    <el-table ref="multipleTableRef" @selection-change="handleSelectionChange" :data="tableData" stripe style="width: 100%" v-loading="loading" height="300px">
      <el-table-column type="selection" width="55" />
      <el-table-column label="商品">
        <template #default="{ row }">
          <div class="flex">
            <el-image class="mr-3 rounded" :src="row.cover" fit="cover" :lazy="true" style="width:50px;height: 50px;">
            </el-image>
            <div class="flex-1">
              <p>{{ row.title }}</p>
              <p class="text-gray-400 text-xs mb-1">分类:{{ row.category ? row.category.name : "未分类" }}</p>
              <p class="text-gray-400 text-xs">创建时间：{{ row.create_time }}</p>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="总库存" width="90" prop="stock" align="center" />
      <el-table-column label="价格（元）" width="150" align="center">
        <template #default="{ row }">
          <span class="text-rose-500">￥{{ row.min_price }}</span>
          <el-divider direction="vertical"></el-divider>
          <span class=" text-gray-500 text-xs">￥{{ row.min_oprice }}</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex items-center justify-center mt-5">
      <el-pagination background layout="prev, pager ,next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getData" />
    </div>

    <template #footer>
      <span>
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref } from 'vue'
import { getGoodsList } from '~/api/goods.js'
import { useInitTable } from '~/composables/useCommon.js'

const dialogvisible = ref(false)
const {
  handleSelectionChange,
  multipleTableRef,
  searchForm,
  tableData,
  loading,
  currentPage,
  total,
  limit,
  getData,
  multiSelectionIds
} = useInitTable({
  searchForm: {
    title: '',
    tab: 'all',
    category_id: null
  },
  getList: getGoodsList,
  onGetListSuccess: res => {
    tableData.value = res.list
    total.value = res.totalCount
  }
})

function close() {
  dialogvisible.value = false
}

const callbackFunction = ref(null)
const open = (callback = null) => {
  callbackFunction.value = callback
  dialogvisible.value = true
}

const submit = () => {
  if (typeof callbackFunction.value === 'function') {
    callbackFunction.value(multiSelectionIds.value)
  }
  close()
}

defineExpose({
  open
})
</script>
```
