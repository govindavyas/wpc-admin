<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white">Licensing</h1>
      <p class="text-gray-400 mt-1">Manage licensing services and agreements</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="saveLicensing" class="space-y-6">
      <!-- Header Content -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Page Header</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input v-model="form.title" type="text" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Subtitle</label>
            <input v-model="form.subtitle" type="text" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea v-model="form.description" rows="3"></textarea>
          </div>
        </div>
      </div>

      <!-- Services -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">Services</h2>
          <button type="button" @click="addService" class="text-sm text-primary-400 hover:text-primary-300">
            + Add Service
          </button>
        </div>
        <div class="space-y-4">
          <div v-for="(service, idx) in form.services" :key="idx" class="p-4 bg-dark-200 rounded-lg">
            <div class="flex items-start justify-between mb-3">
              <span class="text-sm text-gray-400">Service {{ idx + 1 }}</span>
              <button type="button" @click="removeService(idx)" class="p-1 text-red-400 hover:text-red-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input v-model="service.title" type="text" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Icon</label>
                <input v-model="service.icon" type="text" placeholder="Icon name" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea v-model="service.description" rows="2"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Main Content</h2>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Content</label>
          <textarea v-model="form.content" rows="8" placeholder="Licensing page content..."></textarea>
        </div>
      </div>

      <!-- Contact Info -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Contact Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Contact Email</label>
            <input v-model="form.contactEmail" type="email" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Contact Phone</label>
            <input v-model="form.contactPhone" type="tel" />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4">
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <span v-if="saving" class="spinner"></span>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { licensingAPI } from '@/services/api'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

const loading = ref(true)
const saving = ref(false)

const defaultForm = () => ({
  title: '',
  subtitle: '',
  description: '',
  services: [],
  content: '',
  contactEmail: '',
  contactPhone: ''
})

const form = ref(defaultForm())

async function fetchLicensing() {
  loading.value = true
  try {
    const response = await licensingAPI.get()
    if (response.data.data) {
      form.value = {
        ...defaultForm(),
        ...response.data.data
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchLicensing)

function addService() {
  form.value.services.push({
    title: '',
    icon: '',
    description: ''
  })
}

function removeService(index) {
  form.value.services.splice(index, 1)
}

async function saveLicensing() {
  saving.value = true
  try {
    await licensingAPI.update(form.value)
    toast.success('Licensing settings saved successfully')
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to save licensing settings'
    toast.error(message)
  } finally {
    saving.value = false
  }
}
</script>
