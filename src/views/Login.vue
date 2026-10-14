<template>
  <div class="min-h-screen flex items-center justify-center bg-dark-300 p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="text-white font-bold text-2xl">N</span>
        </div>
        <h1 class="text-2xl font-bold text-white">WHITE PANDA CREATIONS</h1>
        <p class="text-gray-400 mt-1">Admin Portal</p>
      </div>

      <!-- Login Form -->
      <div class="card">
        <h2 class="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="email">Email address</label>
            <input
              id="email"
              type="email"
              v-model="email"
              placeholder="admin@whitepandacreations.com"
              required
              :disabled="loading"
            />
          </div>

          <div>
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              v-model="password"
              placeholder="Enter your password"
              required
              :disabled="loading"
            />
          </div>

          <div v-if="error" class="p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <p class="text-sm text-red-400">{{ error }}</p>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner"></span>
            <span v-else>Sign in</span>
          </button>
        </form>
      </div>

      <!-- Footer -->
      <p class="text-center text-gray-500 text-sm mt-6">
        © {{ new Date().getFullYear() }} WHITE PANDA CREATIONS. All rights reserved.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (loading.value) return
  
  loading.value = true
  error.value = ''

  try {
    await authStore.login(email.value, password.value)
    
    // Redirect to intended page or dashboard
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>


