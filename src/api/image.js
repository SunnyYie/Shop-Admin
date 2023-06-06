import axios from '~/axios'

export function getImageList(id, page = 1) {
  return axios.get(`/admin/image_class/${id}/image/${page}`)
}

export function updateImage(id, name) {
  return axios.post(`/admin/image/${id}`, { name })
}

export function deleteImage(ids) {
  return axios.post(`/admin/image/delete_all`, { ids })
}

export const uploadImageAction = import.meta.env.VITE_APP_BASE_API + '/admin/image/upload'
