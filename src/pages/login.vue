<template>
  <el-row class="login-container">
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

    <el-col :lg="8" :md="12" class="right ">
      <h2 class="title">欢迎回来</h2>
      <div>
        <span class="line"> </span>
        <span>账号密码登录</span>
        <span class="line"> </span>
      </div>
      <el-form :model="form" :rules="formRules" ref="formRef" class="w-[250px] ">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名">
            <template #prefix>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password>
            <template #prefix>
              <el-icon>
                <lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
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

const onSubmit = () => {
  formRef.value.validate(valid => {
    if (!valid) {
      return false
    }
    loading.value = true
    store
      .dispatch('login', form)
      .then(res => {
        console.log(res) // 需要拿到res.data.data.token
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
onMounted(() => {
  document.addEventListener('keyup', onKeyUp)
})
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