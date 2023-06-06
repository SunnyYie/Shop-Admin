import axios from '~/axios'

export function getRuleList(pages) {
  return axios.get(`/admin/rule/${pages}`)
}

export function createRule(data) {
  return axios.post('/admin/rule', data)
}

export function updateRule(id, data) {
  return axios.post('/admin/rule/' + id, data)
}

export function updateRuleStatus(id, status) {
  return axios.post(`/admin/rule/${id}/update_status`, { status })
}

export function deleteRule(id) {
  return axios.post(`/admin/rule/${id}/delete`)
}
