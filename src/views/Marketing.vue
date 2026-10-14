<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white">Marketing Partners</h1>
      <p class="text-gray-400 mt-1">Manage marketing services and partner logos</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="saveMarketing" class="space-y-6">
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

      <!-- Partners -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">Partners</h2>
          <button type="button" @click="addPartner" class="text-sm text-primary-400 hover:text-primary-300">
            + Add Partner
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="(partner, idx) in form.partners" :key="idx" class="p-4 bg-dark-200 rounded-lg">
            <div class="flex items-start justify-between mb-3">
              <span class="text-sm text-gray-400">Partner {{ idx + 1 }}</span>
              <button type="button" @click="removePartner(idx)" class="p-1 text-red-400 hover:text-red-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input v-model="partner.name" type="text" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Type</label>
                <select v-model="partner.type" class="w-full">
                  <option value="">Select Type</option>
                  <option value="Distribution">Distribution</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Streaming">Streaming</option>
                  <option value="Festival">Festival</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Post-Production">Post-Production</option>
                  <option value="Financial">Financial</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Logo</label>
                <div class="flex gap-2 mb-2">
                  <button 
                    type="button" 
                    @click="partner.logoType = 'url'" 
                    :class="['px-3 py-1 text-xs rounded-full transition-colors', (partner.logoType || 'url') === 'url' ? 'bg-primary-600 text-white' : 'bg-dark-300 text-gray-400 hover:bg-dark-100']"
                  >
                    URL
                  </button>
                  <button 
                    type="button" 
                    @click="partner.logoType = 'upload'" 
                    :class="['px-3 py-1 text-xs rounded-full transition-colors', partner.logoType === 'upload' ? 'bg-primary-600 text-white' : 'bg-dark-300 text-gray-400 hover:bg-dark-100']"
                  >
                    Upload
                  </button>
                </div>
                <div v-if="(partner.logoType || 'url') === 'url'">
                  <input v-model="partner.logo" type="url" placeholder="https://..." />
                </div>
                <div v-else>
                  <input 
                    type="file" 
                    accept="image/*" 
                    @change="(e) => handlePartnerLogoUpload(e, idx)" 
                    class="hidden" 
                    :ref="el => partnerLogoInputs[idx] = el"
                  />
                  <button 
                    type="button" 
                    @click="partnerLogoInputs[idx]?.click()" 
                    class="w-full py-2 px-4 border-2 border-dashed border-dark-100 rounded-lg text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-colors text-sm"
                    :disabled="uploadingPartnerLogo[idx]"
                  >
                    <span v-if="uploadingPartnerLogo[idx]" class="flex items-center justify-center gap-2">
                      <span class="spinner w-4 h-4"></span> Uploading...
                    </span>
                    <span v-else class="flex items-center justify-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Choose Logo
                    </span>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Website</label>
                <input v-model="partner.website" type="url" />
              </div>
              <div v-if="partner.logo" class="p-3 bg-white rounded relative">
                <img :src="partner.logo" :alt="partner.name" class="h-8 object-contain" />
                <button 
                  type="button" 
                  @click="partner.logo = ''" 
                  class="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-500"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
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
import { ref, reactive, onMounted } from 'vue'
import { marketingAPI, uploadAPI } from '@/services/api'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

const loading = ref(true)
const saving = ref(false)

// Partner logo upload refs
const partnerLogoInputs = ref({})
const uploadingPartnerLogo = reactive({})

const defaultForm = () => ({
  title: '',
  subtitle: '',
  description: '',
  services: [],
  partners: []
})

const form = ref(defaultForm())

async function fetchMarketing() {
  loading.value = true
  try {
    const response = await marketingAPI.get()
    if (response.data.data) {
      const data = response.data.data
      form.value = {
        ...defaultForm(),
        ...data,
        // Set logoType for each partner based on whether it's uploaded or external URL
        partners: (data.partners || []).map(partner => ({
          ...partner,
          logoType: partner.logo && partner.logo.startsWith('/uploads/') ? 'upload' : 'url'
        }))
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchMarketing)

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

function addPartner() {
  form.value.partners.push({
    name: '',
    type: 'Marketing',
    logo: '',
    website: '',
    logoType: 'url'
  })
}

function removePartner(index) {
  form.value.partners.splice(index, 1)
}

// Partner logo upload handler
async function handlePartnerLogoUpload(event, index) {
  const file = event.target.files[0]
  if (!file) return
  
  uploadingPartnerLogo[index] = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('category', 'partners')
    
    const response = await uploadAPI.uploadImage(formData)
    form.value.partners[index].logo = response.data.data.url
    // Keep upload tab selected after successful upload
    form.value.partners[index].logoType = 'upload'
    toast.success('Partner logo uploaded successfully')
  } catch (error) {
    toast.error('Failed to upload partner logo')
  } finally {
    uploadingPartnerLogo[index] = false
    event.target.value = ''
  }
}

async function saveMarketing() {
  saving.value = true
  try {
    // Clean up logoType field before saving (not needed in DB)
    const dataToSave = {
      ...form.value,
      partners: form.value.partners.map(p => ({
        name: p.name,
        type: p.type || 'Other',
        logo: p.logo,
        website: p.website
      }))
    }
    await marketingAPI.update(dataToSave)
    toast.success('Marketing settings saved successfully')
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to save marketing settings'
    toast.error(message)
  } finally {
    saving.value = false
  }
}
</script>
