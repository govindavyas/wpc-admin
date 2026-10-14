<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <router-link to="/team" class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </router-link>
      <div>
        <h1 class="text-2xl font-bold text-white">{{ isEdit ? 'Edit Team Member' : 'Add Team Member' }}</h1>
        <p class="text-gray-400 mt-1">{{ isEdit ? 'Update team member details' : 'Create a new team member profile' }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loadingData" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="saveTeamMember" class="space-y-6">
      <!-- Basic Info -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Basic Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-300 mb-1">Name *</label>
            <input v-model="form.name" type="text" required placeholder="Enter full name" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Role *</label>
            <select v-model="form.role" required class="w-full">
              <option value="" disabled>Select a role</option>
              <optgroup label="Producers">
                <option value="Producer">Producer</option>
                <option value="Executive Producer">Executive Producer</option>
                <option value="Co-Producer">Co-Producer</option>
                <option value="Associate Producer">Associate Producer</option>
                <option value="Line Producer">Line Producer</option>
              </optgroup>
              <optgroup label="Creative">
                <option value="Director">Director</option>
                <option value="Writer">Writer</option>
                <option value="Actor">Actor</option>
              </optgroup>
              <optgroup label="Technical">
                <option value="Editor">Editor</option>
                <option value="Cinematographer">Cinematographer</option>
                <option value="Music Director">Music Director</option>
                <option value="Sound Designer">Sound Designer</option>
                <option value="Art Director">Art Director</option>
                <option value="Costume Designer">Costume Designer</option>
                <option value="VFX Supervisor">VFX Supervisor</option>
              </optgroup>
              <optgroup label="Custom">
                <option value="Other">Other (Custom)</option>
              </optgroup>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              Custom Role
              <span v-if="form.role === 'Other'" class="text-red-400">*</span>
            </label>
            <input 
              v-model="form.customRole" 
              type="text" 
              :required="form.role === 'Other'"
              :disabled="form.role !== 'Other'"
              :placeholder="form.role === 'Other' ? 'Enter custom role name' : 'Only for Other role'"
              :class="{ 'opacity-50 cursor-not-allowed': form.role !== 'Other' }"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input v-model="form.title" type="text" placeholder="CEO, Founder, etc." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Company</label>
            <input v-model="form.company" type="text" placeholder="Company or studio name" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-300 mb-1">Short Bio</label>
            <input v-model="form.shortBio" type="text" placeholder="Brief one-liner about the person" maxlength="500" />
            <p class="text-xs text-gray-500 mt-1">{{ form.shortBio?.length || 0 }}/500 characters</p>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-300 mb-1">Full Bio</label>
            <textarea v-model="form.bio" rows="4" placeholder="Detailed biography..."></textarea>
          </div>
        </div>
      </div>

      <!-- Image -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Profile Image</h2>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Image</label>
          <div class="flex gap-2 mb-2">
            <button 
              type="button" 
              @click="imageType = 'url'" 
              :class="['px-3 py-1 text-xs rounded-full transition-colors', imageType === 'url' ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:bg-dark-100']"
            >
              URL
            </button>
            <button 
              type="button" 
              @click="imageType = 'upload'" 
              :class="['px-3 py-1 text-xs rounded-full transition-colors', imageType === 'upload' ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:bg-dark-100']"
            >
              Upload
            </button>
          </div>
          <div v-if="imageType === 'url'">
            <input v-model="form.image" type="url" placeholder="https://..." />
          </div>
          <div v-else>
            <div class="relative">
              <input 
                type="file" 
                accept="image/*" 
                @change="handleImageUpload" 
                class="hidden" 
                ref="imageInput"
              />
              <button 
                type="button" 
                @click="$refs.imageInput.click()" 
                class="w-full py-2 px-4 border-2 border-dashed border-dark-100 rounded-lg text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-colors"
                :disabled="uploadingImage"
              >
                <span v-if="uploadingImage" class="flex items-center justify-center gap-2">
                  <span class="spinner w-4 h-4"></span> Uploading...
                </span>
                <span v-else class="flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Choose Profile Image
                </span>
              </button>
            </div>
          </div>
          <div v-if="form.image" class="mt-2 relative inline-block">
            <img :src="getApiUrl(form.thumbnailUrl || form.image)" alt="Profile image preview" class="w-24 h-24 object-cover rounded-lg" />
            <button 
              type="button" 
              @click="clearImage" 
              class="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-500"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Social Links -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Social Links</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Website</label>
            <input v-model="form.social.website" type="url" placeholder="https://..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Instagram</label>
            <input v-model="form.social.instagram" type="url" placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Twitter / X</label>
            <input v-model="form.social.twitter" type="url" placeholder="https://twitter.com/..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">LinkedIn</label>
            <input v-model="form.social.linkedin" type="url" placeholder="https://linkedin.com/..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">IMDB</label>
            <input v-model="form.social.imdb" type="url" placeholder="https://imdb.com/name/..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input v-model="form.email" type="email" placeholder="contact@example.com" />
          </div>
        </div>
      </div>

      <!-- Settings -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Settings</h2>
        <div class="flex flex-wrap gap-6">
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.isActive" type="checkbox" class="w-4 h-4 rounded bg-dark-200 border-dark-100" />
            <span class="text-gray-300">Active (visible on website)</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.showOnHomepage" type="checkbox" class="w-4 h-4 rounded bg-dark-200 border-dark-100" />
            <span class="text-gray-300">Show on Homepage</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.featured" type="checkbox" class="w-4 h-4 rounded bg-dark-200 border-dark-100" />
            <span class="text-gray-300">Featured Member</span>
          </label>
        </div>
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-300 mb-1">Display Order</label>
          <input v-model.number="form.order" type="number" min="0" class="w-32" placeholder="0" />
          <p class="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4">
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <span v-if="saving" class="spinner"></span>
          <span v-else>{{ isEdit ? 'Update Team Member' : 'Create Team Member' }}</span>
        </button>
        <router-link to="/team" class="btn btn-secondary">Cancel</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { teamAPI, uploadAPI } from '@/services/api'
import { useToastStore } from '@/stores/toast'
import { getApiUrl } from '@/utils/imageUrl'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const isEdit = computed(() => route.params.id && route.params.id !== 'new')
const loadingData = ref(false)
const saving = ref(false)

// Image type toggle
const imageType = ref('url')
const uploadingImage = ref(false)

const defaultForm = () => ({
  name: '',
  role: '',
  customRole: '',
  title: '',
  company: '',
  shortBio: '',
  bio: '',
  image: '',
  thumbnailUrl: '',
  email: '',
  social: {
    website: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    imdb: ''
  },
  isActive: true,
  showOnHomepage: false,
  featured: false,
  order: 0
})

const form = ref(defaultForm())

// Clear customRole when role changes from 'Other'
watch(() => form.value.role, (newRole) => {
  if (newRole !== 'Other') {
    form.value.customRole = ''
  }
})

async function fetchTeamMember() {
  if (!isEdit.value) return
  
  loadingData.value = true
  try {
    const response = await teamAPI.getById(route.params.id)
    const member = response.data.data
    form.value = {
      ...defaultForm(),
      ...member,
      // Map photoUrl from API to image for the form
      image: member.photoUrl || member.image || '',
      thumbnailUrl: member.thumbnailUrl || '',
      social: {
        ...defaultForm().social,
        ...(member.social || {})
      }
    }
    
    // Set image type based on whether it's an uploaded file or external URL
    const imageUrl = member.photoUrl || member.image || ''
    if (imageUrl && imageUrl.startsWith('/uploads/')) {
      imageType.value = 'upload'
    } else {
      imageType.value = 'url'
    }
  } catch (error) {
    toast.error('Failed to load team member')
    router.push('/team')
  } finally {
    loadingData.value = false
  }
}

onMounted(fetchTeamMember)

// Clear image
function clearImage() {
  form.value.image = ''
  form.value.thumbnailUrl = ''
}

// Image upload handler
async function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  uploadingImage.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('category', 'team')
    formData.append('thumbnailWidth', '400')
    formData.append('thumbnailQuality', '85')
    if (form.value.name) {
      formData.append('seoName', form.value.name)
    }
    
    const response = await uploadAPI.uploadImage(formData)
    // Store both original and thumbnail URLs
    form.value.image = response.data.data.url
    form.value.thumbnailUrl = response.data.data.thumbnailUrl || response.data.data.url
    // Keep upload tab selected after successful upload
    imageType.value = 'upload'
    toast.success('Image uploaded successfully')
  } catch (error) {
    toast.error('Failed to upload image')
  } finally {
    uploadingImage.value = false
    event.target.value = ''
  }
}

async function saveTeamMember() {
  // Validate custom role if 'Other' is selected
  if (form.value.role === 'Other' && !form.value.customRole?.trim()) {
    toast.error('Please enter a custom role name')
    return
  }

  saving.value = true
  try {
    // Map form fields to API expected format
    const payload = {
      name: form.value.name,
      role: form.value.role,
      customRole: form.value.role === 'Other' ? form.value.customRole : null,
      title: form.value.title,
      company: form.value.company,
      shortBio: form.value.shortBio,
      bio: form.value.bio,
      photoUrl: form.value.image,
      thumbnailUrl: form.value.thumbnailUrl,
      email: form.value.email,
      social: form.value.social,
      isActive: form.value.isActive,
      showOnHomepage: form.value.showOnHomepage,
      featured: form.value.featured,
      order: form.value.order
    }
    
    if (isEdit.value) {
      await teamAPI.update(route.params.id, payload)
      toast.success('Team member updated successfully')
    } else {
      await teamAPI.create(payload)
      toast.success('Team member created successfully')
    }
    router.push('/team')
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to save team member'
    toast.error(message)
  } finally {
    saving.value = false
  }
}
</script>
