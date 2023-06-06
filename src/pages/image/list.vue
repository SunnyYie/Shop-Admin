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

const windowHeight = window.innerHeight || document.body.clientHeight
const h = windowHeight - 64 - 44 - 40

const ImageAsideRef = ref(null)
const handleOpenCreate = () => ImageAsideRef.value.handleCreate()

const imageMainRef = ref(null)
const handleAsideChange = image_class_id => {
  imageMainRef.value.loadData(image_class_id)
}

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