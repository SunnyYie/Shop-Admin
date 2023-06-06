<template>
  <div class="f-header">
    <span class="logo">
      <el-icon class="mr-2">
        <ElemeFilled />
      </el-icon>
      马场郭德纲
    </span>

    <el-icon class="icon-btn" @click="$store.commit('handleAsideWidth')">
      <Fold v-if="$store.state.asideWidth == '250px'" />
      <Expand v-else />
    </el-icon>

    <el-tooltip effect="dark" content="刷新" placement="bottom">
      <el-icon class="icon-btn" @click="handleRefresh">
        <Refresh />
      </el-icon>
    </el-tooltip>

    <div class="ml-auto flex items-center">
      <el-tooltip effect="dark" content="全屏" placement="bottom">
        <el-icon class="icon-btn" @click="toggle">
          <FullScreen v-if="!isFullscreen" />
          <Aim v-else />
        </el-icon>
      </el-tooltip>

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