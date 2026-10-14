<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <router-link to="/news" class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </router-link>
      <div>
        <h1 class="text-2xl font-bold text-white">{{ isEdit ? 'Edit Article' : 'Add Article' }}</h1>
        <p class="text-gray-400 mt-1">{{ isEdit ? 'Update article details' : 'Create a new news article' }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loadingData" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="saveArticle" class="space-y-6">
      <!-- Main Content -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Article Content</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Title *</label>
            <input v-model="form.title" type="text" required />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Slug *</label>
              <input v-model="form.slug" type="text" required placeholder="article-slug" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select v-model="form.category">
                <option value="General">General</option>
                <option value="Announcement">Announcement</option>
                <option value="Production">Production</option>
                <option value="Casting">Casting</option>
                <option value="Music">Music</option>
                <option value="Release">Release</option>
                <option value="Awards">Awards</option>
                <option value="Events">Events</option>
                <option value="Behind The Scenes">Behind The Scenes</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Summary *</label>
            <textarea v-model="form.summary" rows="2" required placeholder="Brief summary of the article (max 500 chars)..." maxlength="500"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Tags</label>
            <input
              v-model="tagsInput"
              type="text"
              placeholder="production, teaser, marathi cinema"
            />
            <p class="text-xs text-gray-500 mt-1">Enter tags separated by commas.</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Full Text *</label>
            <textarea v-model="form.fullText" rows="10" required placeholder="Full article content..."></textarea>
          </div>
        </div>
      </div>

      <!-- Media -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Media</h2>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Featured Image</label>
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
            <input v-model="form.imageUrl" type="url" placeholder="https://..." />
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
                  Choose Featured Image
                </span>
              </button>
            </div>
          </div>
          <div v-if="form.imageUrl" class="mt-2 relative inline-block">
            <img :src="getApiUrl(form.imageUrl)" alt="Article image preview" class="w-48 h-32 object-cover rounded" />
            <button 
              type="button" 
              @click="form.imageUrl = ''; form.thumbnailUrl = ''" 
              class="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-500"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Meta -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Publication Details</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Date</label>
            <input v-model="form.date" type="date" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Author</label>
            <input v-model="form.author" type="text" placeholder="Author name" />
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
            <input v-model="form.showOnDashboard" type="checkbox" class="w-4 h-4 rounded bg-dark-200 border-dark-100" />
            <span class="text-gray-300">Show on Dashboard</span>
          </label>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4">
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <span v-if="saving" class="spinner"></span>
          <span v-else>{{ isEdit ? 'Update Article' : 'Create Article' }}</span>
        </button>
        <router-link to="/news" class="btn btn-secondary">Cancel</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { newsAPI, uploadAPI } from '@/services/api'
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
const tagsInput = ref('')

const defaultForm = () => ({
  title: '',
  slug: '',
  summary: '',
  fullText: '',
  imageUrl: '',
  thumbnailUrl: '',
  category: 'General',
  date: new Date().toISOString().split('T')[0],
  author: '',
  tags: [],
  isActive: true,
  showOnDashboard: false
})

const form = ref(defaultForm())

// Auto-generate slug from title
watch(() => form.value.title, (newTitle) => {
  if (!isEdit.value && newTitle) {
    form.value.slug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
})

async function fetchArticle() {
  if (!isEdit.value) return
  
  loadingData.value = true
  try {
    const response = await newsAPI.getById(route.params.id)
    const article = response.data.data
    form.value = {
      ...defaultForm(),
      ...article,
      date: article.date ? new Date(article.date).toISOString().split('T')[0] : defaultForm().date
    }
    tagsInput.value = Array.isArray(article.tags) ? article.tags.join(', ') : ''
    
    // Set image type based on whether it's an uploaded file or external URL
    if (article.imageUrl && article.imageUrl.startsWith('/uploads/')) {
      imageType.value = 'upload'
    } else {
      imageType.value = 'url'
    }
  } catch (error) {
    toast.error('Failed to load article')
    router.push('/news')
  } finally {
    loadingData.value = false
  }
}

function parseTags(value) {
  if (!value || typeof value !== 'string') return []
  return [...new Set(value
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean))]
}

onMounted(fetchArticle)

// Image upload handler
async function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  uploadingImage.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('category', 'news')
    formData.append('thumbnailWidth', '800')
    formData.append('thumbnailQuality', '80')
    if (form.value.title) {
      formData.append('seoName', form.value.title)
    }
    
    const response = await uploadAPI.uploadImage(formData)
    form.value.imageUrl = response.data.data.url
    form.value.thumbnailUrl = response.data.data.thumbnailUrl
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

async function saveArticle() {
  saving.value = true
  try {
    const payload = {
      ...form.value,
      tags: parseTags(tagsInput.value)
    }

    if (isEdit.value) {
      await newsAPI.update(route.params.id, payload)
      toast.success('Article updated successfully')
    } else {
      await newsAPI.create(payload)
      toast.success('Article created successfully')
    }
    router.push('/news')
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to save article'
    toast.error(message)
  } finally {
    saving.value = false
  }
}
</script>
