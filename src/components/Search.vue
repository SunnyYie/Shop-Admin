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

const showSearch = ref(false)
const slots = useSlots()
const hasShowSearch = ref(!!slots.show)
</script>

<style>
</style>