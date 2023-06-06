import store from '~/store'

function hasPermissiom(value, el = false) {
  if (!Array.isArray(value)) {
    throw new Error('需要配置权限')
  }
  const hasAuth = value.findIndex((v) => store.state.ruleNames.includes(v)) != -1
  if (el && !hasAuth) {
    el.parentNode && el.parentNode.removeChild(el)
  }
  return hasAuth
}

export default {
  install(app) {
    app.directive('permission', {
      mounted(el, binding) {
        // el 为该节点
        // binding.value = ['getStatistics3,GET']
        hasPermissiom(binding.value, el)
      },
    })
  },
}
