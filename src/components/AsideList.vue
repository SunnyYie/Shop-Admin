<template>
  <div class="aside-list" :class="{'active':active}">
    <span class="truncate">
      <slot>

      </slot>
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