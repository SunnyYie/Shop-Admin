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
      //
      menus: [],
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
    SET_MENUS(state, menus) {
      state.menus = menus
    },
    SET_RULENAMES(state, ruleNames) {
      state.ruleNames = ruleNames
    },
  },
  actions: {
    // 获取当前用户登录信息
    getinfo({ commit }) {
      return new Promise((resolve, reject) => {
        getInfo()
          .then((res) => {
            commit('SET_USERINFO', res)
            commit('SET_MENUS', res.menus)
            commit('SET_RULENAMES', res.ruleNames)
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
