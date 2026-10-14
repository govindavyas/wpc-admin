import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('admin_user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(email, password) {
    const response = await authAPI.login({ email, password })
    const { token: authToken, user: userData } = response.data.data
    
    token.value = authToken
    user.value = userData
    
    localStorage.setItem('admin_token', authToken)
    localStorage.setItem('admin_user', JSON.stringify(userData))
    
    return response.data
  }

  async function fetchUser() {
    if (!token.value) return null
    
    try {
      const response = await authAPI.me()
      user.value = response.data.data
      localStorage.setItem('admin_user', JSON.stringify(user.value))
      return user.value
    } catch (error) {
      logout()
      throw error
    }
  }

  async function updateProfile(data) {
    const response = await authAPI.updateProfile(data)
    user.value = { ...user.value, ...response.data.data }
    localStorage.setItem('admin_user', JSON.stringify(user.value))
    return response.data
  }

  async function updatePassword(currentPassword, newPassword) {
    const response = await authAPI.updatePassword({ currentPassword, newPassword })
    token.value = response.data.data.token
    localStorage.setItem('admin_token', token.value)
    return response.data
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    login,
    fetchUser,
    updateProfile,
    updatePassword,
    logout
  }
})
