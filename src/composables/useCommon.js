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

  // 多选选中ID
  const multiSelectionIds = ref([])
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

// 新增，修改
export function useInitForm(opt = {}) {
  // 表单部分
  const formDrawerRef = ref(null)
  const formRef = ref(null)
  const defaultForm = opt.form
  const form = reactive({})
  const rules = opt.rules || {}
  const editId = ref(0)
  const drawerTitle = computed(() => (editId.value ? '修改' : '新增'))

  const handleSubmit = () => {
    formRef.value.validate((valid) => {
      if (!valid) return

      formDrawerRef.value.showLoading()

      let body = {}
      if (opt.beforeSubmit && typeof opt.beforeSubmit == 'function') {
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
