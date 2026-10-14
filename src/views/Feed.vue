<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Feed Management</h1>
        <p class="text-gray-400 mt-1">Curate social media content for the public feed</p>
      </div>
      <div class="flex gap-2">
        <button @click="refreshData" class="btn btn-secondary flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
        <button @click="openAddModal" class="btn btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Feed Item
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" :key="statsKey">
      <div class="card">
        <p class="text-gray-400 text-sm">Total Items</p>
        <p class="text-2xl font-bold text-white">{{ stats.totalItems }}</p>
      </div>
      <div class="card">
        <p class="text-gray-400 text-sm">Published</p>
        <p class="text-2xl font-bold text-green-400">{{ stats.publishedItems }}</p>
      </div>
      <div class="card bg-gradient-to-br from-pink-500/10 to-pink-500/5">
        <div class="flex items-center justify-between mb-1">
          <p class="text-gray-400 text-sm">Total Likes</p>
          <span class="text-xs text-pink-500 animate-pulse">●</span>
        </div>
        <p class="text-2xl font-bold text-pink-400">{{ stats.totalLikes }}</p>
        <p class="text-xs text-gray-500 mt-1">Live count</p>
      </div>
      <div class="card">
        <p class="text-gray-400 text-sm">Total Shares</p>
        <p class="text-2xl font-bold text-blue-400">{{ stats.totalShares }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4 mb-6">
      <input
        v-model="search"
        type="text"
        placeholder="Search feed items..."
        class="max-w-xs"
        @input="debouncedSearch"
      />
      <select v-model="filterPlatform" @change="fetchFeed" class="max-w-xs">
        <option value="">All Platforms</option>
        <option value="instagram">Instagram</option>
        <option value="youtube">YouTube</option>
        <option value="facebook">Facebook</option>
        <option value="twitter">X/Twitter</option>
        <option value="vimeo">Vimeo</option>
        <option value="tiktok">TikTok</option>
        <option value="linkedin">LinkedIn</option>
      </select>
      <select v-model="filterStatus" @change="fetchFeed" class="max-w-xs">
        <option value="">All Status</option>
        <option value="published">Published</option>
        <option value="unpublished">Unpublished</option>
        <option value="draft">Draft</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="feedItems.length === 0" class="card text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <h3 class="text-lg font-medium text-white mb-2">No feed items yet</h3>
      <p class="text-gray-400 mb-4">Start by adding social media posts to your feed.</p>
      <button @click="openAddModal" class="btn btn-primary">Add First Item</button>
    </div>

    <!-- Feed Items Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in feedItems"
        :key="item._id"
        class="card group"
        :class="{ 'opacity-60': item.status !== 'published' }"
      >
        <!-- Badges Header -->
        <div class="flex items-center justify-between mb-2">
          <!-- Platform Badge -->
          <span :class="['badge', getPlatformBadge(item.platform)]">
            {{ item.platform }}
          </span>
          
          <!-- Status Badge -->
          <span :class="['badge', getStatusBadge(item.status)]">
            {{ item.status }}
          </span>
        </div>

        <!-- Embed Content -->
        <div 
          class="bg-dark-200 rounded-lg overflow-auto mb-3"
          :style="item.platform === 'instagram' ? 'max-height: 500px;' : 'max-height: 400px;'"
        >
          <!-- Embedded HTML from social platform -->
          <div 
            v-if="item.embedHtml" 
            v-html="sanitizeEmbed(item.embedHtml)"
            class="w-full h-full embed-container"
            :data-platform="item.platform"
          ></div>
          <!-- Fallback to thumbnail if no embed -->
          <img 
            v-else-if="item.thumbnailUrl" 
            :src="getApiUrl(item.thumbnailUrl)" 
            :alt="item.title || 'Feed item'"
            class="w-full h-full object-cover"
          />
          <!-- Fallback to platform icon -->
          <div v-else class="w-full h-full flex items-center justify-center">
            <component :is="getPlatformIcon(item.platform)" class="w-12 h-12 text-gray-600" />
          </div>
        </div>

        <!-- Content Info -->
        <div class="space-y-1.5">
          <h3 class="text-sm font-medium text-white truncate">
            {{ item.title || item.authorName || 'Untitled' }}
          </h3>
          <p class="text-xs text-gray-500 truncate">{{ item.originalUrl }}</p>
          
          <!-- Analytics -->
          <div class="flex items-center gap-3 text-xs text-gray-500">
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {{ item.analytics?.likes || 0 }}
            </span>
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {{ item.analytics?.shares || 0 }}
            </span>
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {{ item.analytics?.views || 0 }}
            </span>
          </div>

          <!-- Content Type -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500">
              {{ item.contentType === 'video' ? '🎥 Video' : item.contentType === 'image' ? '📷 Image' : '📱 Mixed' }}
            </span>
            <span v-if="!item.isValid" class="text-xs text-red-400">⚠️ Embed invalid</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
          <div class="flex items-center gap-2">
            <button
              @click="togglePublish(item)"
              :class="['p-1.5 rounded-lg transition-colors', item.status === 'published' ? 'text-green-400 bg-green-400/10' : 'text-gray-500 hover:text-green-400 hover:bg-gray-700']"
              :title="item.status === 'published' ? 'Unpublish' : 'Publish'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              @click="refreshEmbed(item)"
              class="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Refresh embed"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <a
              :href="item.originalUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="View original"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="openEditModal(item)"
              class="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Edit"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="confirmDelete(item)"
              class="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Delete"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-8">
      <div class="flex items-center gap-2">
        <button
          @click="page--; fetchFeed()"
          :disabled="page <= 1"
          class="px-4 py-2 rounded-lg bg-dark-200 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
        >
          Previous
        </button>
        <span class="text-gray-400">Page {{ page }} of {{ totalPages }}</span>
        <button
          @click="page++; fetchFeed()"
          :disabled="page >= totalPages"
          class="px-4 py-2 rounded-lg bg-dark-200 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/70" @click="closeModal"></div>
        <div class="relative bg-dark-100 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
          <div class="p-6">
            <h2 class="text-xl font-bold text-white mb-4">
              {{ editingItem ? 'Edit Feed Item' : 'Add Feed Item' }}
            </h2>

            <!-- URL Input (only for new items) -->
            <div v-if="!editingItem" class="mb-6">
              <label class="block text-sm font-medium text-gray-300 mb-2">Social Media URL</label>
              <div class="flex gap-2">
                <input
                  v-model="formData.url"
                  type="url"
                  placeholder="Paste Instagram, YouTube, Twitter, etc. URL..."
                  class="flex-1"
                  @keyup.enter="previewUrl"
                />
                <button
                  @click="previewUrl"
                  :disabled="!formData.url || previewing"
                  class="btn btn-secondary"
                >
                  {{ previewing ? 'Loading...' : 'Preview' }}
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                Supported: Instagram, YouTube, Facebook, X/Twitter, Vimeo, TikTok
              </p>
            </div>

            <!-- Preview -->
            <div v-if="preview" class="mb-6 p-4 bg-dark-200 rounded-lg">
              <div class="flex items-start gap-4">
                <div class="w-24 h-24 bg-dark-300 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    v-if="preview.thumbnailUrl" 
                    :src="getApiUrl(preview.thumbnailUrl)" 
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <span class="text-2xl">{{ getPlatformEmoji(preview.platform) }}</span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span :class="['badge', getPlatformBadge(preview.platform)]">
                      {{ preview.platform }}
                    </span>
                    <span class="text-xs text-gray-500">{{ preview.contentType }}</span>
                  </div>
                  <h4 class="font-medium text-white truncate">{{ preview.title || preview.authorName || 'Untitled' }}</h4>
                  <p v-if="preview.authorName" class="text-sm text-gray-400">by {{ preview.authorName }}</p>
                  <p v-if="preview.isValid" class="text-xs text-green-400 mt-1">✓ Embed ready</p>
                  <p v-else class="text-xs text-yellow-400 mt-1">⚠ Using fallback embed</p>
                </div>
              </div>
            </div>

            <!-- Form Fields -->
            <div v-if="preview || editingItem" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Title (optional)</label>
                <input
                  v-model="formData.title"
                  type="text"
                  placeholder="Custom title for this item..."
                  class="w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Description (optional)</label>
                <textarea
                  v-model="formData.description"
                  rows="2"
                  placeholder="Add a description..."
                  class="w-full"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select v-model="formData.status" class="w-full">
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  v-model="formData.featured"
                  class="rounded bg-dark-200 border-gray-600 text-primary-500 focus:ring-primary-500"
                />
                <label for="featured" class="text-sm text-gray-300">Featured on homepage</label>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800">
              <button @click="closeModal" class="btn btn-secondary">Cancel</button>
              <button
                @click="saveItem"
                :disabled="saving || (!preview && !editingItem)"
                class="btn btn-primary"
              >
                {{ saving ? 'Saving...' : (editingItem ? 'Update' : 'Add to Feed') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/70" @click="showDeleteConfirm = false"></div>
        <div class="relative bg-dark-100 rounded-xl max-w-md w-full p-6 border border-gray-700">
          <h3 class="text-lg font-bold text-white mb-2">Delete Feed Item?</h3>
          <p class="text-gray-400 mb-6">
            This will permanently delete this feed item and all its engagement data. This action cannot be undone.
          </p>
          <div class="flex justify-end gap-3">
            <button @click="showDeleteConfirm = false" class="btn btn-secondary">Cancel</button>
            <button @click="deleteItem" class="btn bg-red-600 hover:bg-red-700 text-white">
              Delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { feedAPI } from '@/services/api'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'
import { getApiUrl } from '@/utils/imageUrl'

const toast = useToastStore()
const auth = useAuthStore()

// State
const loading = ref(true)
const feedItems = ref([])
const statsKey = ref(0)
const stats = reactive({
  totalItems: 0,
  publishedItems: 0,
  totalLikes: 0,
  totalShares: 0
})
const page = ref(1)
const totalPages = ref(1)
const search = ref('')
const filterPlatform = ref('')
const filterStatus = ref('')

// Modal state
const showModal = ref(false)
const editingItem = ref(null)
const preview = ref(null)
const previewing = ref(false)
const saving = ref(false)
const formData = reactive({
  url: '',
  title: '',
  description: '',
  status: 'published',
  featured: false
})

// Delete confirmation
const showDeleteConfirm = ref(false)
const itemToDelete = ref(null)

// Search debounce
let searchTimeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchFeed()
  }, 300)
}

// Watch feedItems to process embeds when they change
watch(feedItems, async () => {
  await nextTick()
  processEmbeds()
}, { deep: true })

// Fetch feed items
async function fetchFeed() {
  loading.value = true
  try {
    const params = {
      page: page.value,
      limit: 12,
      search: search.value,
      platform: filterPlatform.value,
      status: filterStatus.value,
      _t: Date.now() // Cache buster
    }
    console.log('📡 Fetching feed items with params:', params)
    const response = await feedAPI.getAll(params)
    console.log('📥 Received feed items:', response.data.data.length, 'items')
    console.log('📊 Feed items analytics:', response.data.data.map(item => ({
      id: item._id,
      title: item.title,
      likes: item.analytics?.likes,
      shares: item.analytics?.shares
    })))
    feedItems.value = response.data.data
    totalPages.value = response.data.totalPages

    // Fetch analytics overview
    console.log('📡 Fetching analytics overview...')
    const analyticsRes = await feedAPI.getAnalyticsOverview()
    const overview = analyticsRes.data.data.overview
    console.log('📊 Analytics overview received:', overview)
    
    // Update stats with explicit assignment to trigger reactivity
    Object.assign(stats, {
      totalItems: overview.totalItems,
      publishedItems: overview.publishedItems,
      totalLikes: overview.totalLikes,
      totalShares: overview.totalShares
    })
    
    // Force re-render
    statsKey.value++
    
    console.log('✅ Stats updated:', JSON.stringify(stats))
    console.log('📊 Current stats state:', stats.totalLikes, 'likes,', stats.totalShares, 'shares')
  } catch (error) {
    console.error('❌ Failed to fetch feed:', error)
    toast.error('Failed to load feed items')
  } finally {
    loading.value = false
  }
}

// Manual refresh function
async function refreshData() {
  console.log('🔄 Manual refresh triggered')
  console.log('📊 Stats BEFORE refresh:', JSON.stringify(stats))
  await fetchFeed()
  console.log('📊 Stats AFTER refresh:', JSON.stringify(stats))
  toast.success(`Feed refreshed - ${stats.totalLikes} likes`)
}

// Preview URL
async function previewUrl() {
  if (!formData.url) return
  
  previewing.value = true
  try {
    const response = await feedAPI.preview(formData.url)
    preview.value = response.data.data
    formData.title = preview.value.title || ''
  } catch (error) {
    console.error('Preview failed:', error)
    toast.error(error.response?.data?.message || 'Failed to preview URL')
  } finally {
    previewing.value = false
  }
}

// Save item (create or update)
async function saveItem() {
  saving.value = true
  try {
    if (editingItem.value) {
      await feedAPI.update(editingItem.value._id, {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        featured: formData.featured
      })
      toast.success('Feed item updated')
    } else {
      await feedAPI.create({
        url: formData.url,
        title: formData.title,
        description: formData.description,
        status: formData.status,
        featured: formData.featured
      })
      toast.success('Feed item added')
    }
    closeModal()
    fetchFeed()
  } catch (error) {
    console.error('Save failed:', error)
    toast.error(error.response?.data?.message || 'Failed to save feed item')
  } finally {
    saving.value = false
  }
}

// Toggle publish status
async function togglePublish(item) {
  try {
    await feedAPI.toggle(item._id)
    item.status = item.status === 'published' ? 'unpublished' : 'published'
    toast.success(`Feed item ${item.status}`)
  } catch (error) {
    console.error('Toggle failed:', error)
    toast.error('Failed to update status')
  }
}

// Refresh embed
async function refreshEmbed(item) {
  try {
    const response = await feedAPI.refresh(item._id)
    const updated = response.data.data
    Object.assign(item, updated)
    toast.success('Embed refreshed')
  } catch (error) {
    console.error('Refresh failed:', error)
    toast.error('Failed to refresh embed')
  }
}

// Delete item
async function deleteItem() {
  if (!itemToDelete.value) return
  
  try {
    await feedAPI.delete(itemToDelete.value._id)
    toast.success('Feed item deleted')
    showDeleteConfirm.value = false
    itemToDelete.value = null
    fetchFeed()
  } catch (error) {
    console.error('Delete failed:', error)
    toast.error('Failed to delete feed item')
  }
}

// Modal helpers
function openAddModal() {
  editingItem.value = null
  preview.value = null
  Object.assign(formData, {
    url: '',
    title: '',
    description: '',
    status: 'published',
    featured: false
  })
  showModal.value = true
}

function openEditModal(item) {
  editingItem.value = item
  preview.value = null
  Object.assign(formData, {
    url: item.originalUrl,
    title: item.title,
    description: item.description,
    status: item.status,
    featured: item.featured
  })
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingItem.value = null
  preview.value = null
}

function confirmDelete(item) {
  itemToDelete.value = item
  showDeleteConfirm.value = true
}

// Platform styling helpers
function getPlatformBadge(platform) {
  const badges = {
    instagram: 'bg-pink-500/20 text-pink-400',
    youtube: 'bg-red-500/20 text-red-400',
    facebook: 'bg-blue-600/20 text-blue-400',
    twitter: 'bg-sky-500/20 text-sky-400',
    vimeo: 'bg-cyan-500/20 text-cyan-400',
    tiktok: 'bg-purple-500/20 text-purple-400',
    linkedin: 'bg-blue-700/20 text-blue-300',
    other: 'bg-gray-500/20 text-gray-400'
  }
  return badges[platform] || badges.other
}

function getStatusBadge(status) {
  const badges = {
    published: 'bg-green-500/20 text-green-400',
    unpublished: 'bg-yellow-500/20 text-yellow-400',
    draft: 'bg-gray-500/20 text-gray-400'
  }
  return badges[status] || badges.draft
}

function getPlatformEmoji(platform) {
  const emojis = {
    instagram: '📸',
    youtube: '▶️',
    facebook: '👍',
    twitter: '🐦',
    vimeo: '🎬',
    tiktok: '🎵',
    linkedin: '💼',
    other: '🔗'
  }
  return emojis[platform] || emojis.other
}

// Sanitize and prepare embed HTML
function sanitizeEmbed(embedHtml) {
  if (!embedHtml) return ''
  
  // Add responsive styling to iframes
  let html = embedHtml.replace(
    /<iframe/g, 
    '<iframe style="width:100%;height:100%;position:absolute;top:0;left:0;border:0;"'
  )
  
  return html
}

// Load platform-specific embed scripts
function ensureScript(id, src) {
  if (document.getElementById(id)) return
  
  const script = document.createElement('script')
  script.id = id
  script.src = src
  script.async = true
  document.body.appendChild(script)
}

// Process embeds after rendering
function processEmbeds() {
  // Load platform-specific scripts
  ensureScript('instagram-embed', 'https://www.instagram.com/embed.js')
  ensureScript('twitter-widgets', 'https://platform.twitter.com/widgets.js')
  ensureScript('tiktok-embed', 'https://www.tiktok.com/embed.js')
  ensureScript('facebook-sdk', 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0')
  
  // Process embeds after a short delay to ensure DOM is ready
  setTimeout(() => {
    // Instagram
    if (window.instgrm?.Embeds?.process) {
      window.instgrm.Embeds.process()
    }
    
    // Twitter
    if (window.twttr?.widgets?.load) {
      window.twttr.widgets.load()
    }
    
    // Facebook
    if (window.FB?.XFBML?.parse) {
      window.FB.XFBML.parse()
    }
  }, 500)
}

function getPlatformIcon(platform) {
  // Return a simple placeholder component
  return {
    template: `<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>`
  }
}

onMounted(() => {
  fetchFeed()
  
  // Auto-refresh when window regains focus
  const handleFocus = () => {
    console.log('🔄 Window focused - auto-refreshing feed data')
    fetchFeed()
  }
  window.addEventListener('focus', handleFocus)
  
  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('focus', handleFocus)
  })
  // Start SSE for live updates if admin
  startAdminStream()
})

let eventSource = null
function startAdminStream(passedToken) {
  try {
    // Extract token - handle both direct string and ref.value
    let tokenVal = null
    if (passedToken) {
      tokenVal = typeof passedToken === 'string' ? passedToken : (passedToken.value || null)
    } else if (auth.token && auth.token.value) {
      tokenVal = auth.token.value
    }
    
    if (!tokenVal) {
      console.log('❌ No token available for SSE connection')
      return
    }

    // Close existing connection if present
    if (eventSource) {
      try { eventSource.close() } catch (e) {}
      eventSource = null
    }

    console.log('🔌 Attempting SSE connection with token:', tokenVal.substring(0, 20) + '...')
    const url = `${import.meta.env.VITE_API_URL}/api/v1/feed/admin/stream?token=${encodeURIComponent(tokenVal)}`
    eventSource = new EventSource(url)

    eventSource.addEventListener('open', () => {
      console.log('✅ SSE connected successfully')
    })

    eventSource.addEventListener('like', (e) => {
      try {
        const payload = JSON.parse(e.data)
        console.log('📡 Received like event from SSE:', payload)
        
        // Update feedItems if present
        const idx = feedItems.value.findIndex(i => i._id === payload.feedItemId)
        if (idx !== -1) {
          const oldCount = feedItems.value[idx].analytics?.likes || 0
          feedItems.value[idx].analytics = feedItems.value[idx].analytics || {}
          feedItems.value[idx].analytics.likes = payload.likeCount
          console.log(`  Updated item ${idx}: ${oldCount} → ${payload.likeCount} likes`)
        }

        // Update total likes
        if (!payload.alreadyLiked) {
          stats.totalLikes = (stats.totalLikes || 0) + 1
          console.log(`  Incremented totalLikes: now ${stats.totalLikes}`)
        }
      } catch (err) {
        console.error('❌ Failed to handle like event', err)
      }
    })

    eventSource.onerror = (err) => {
      console.error('❌ SSE error:', err)
      // Close and attempt reconnect after a delay
      try { eventSource.close() } catch(e){}
      eventSource = null
      console.log('🔄 Reconnecting SSE in 3s...')
      setTimeout(() => startAdminStream(tokenVal), 3000)
    }
  } catch (err) {
    console.error('❌ Failed to start admin stream:', err)
  }
}

// Watch for token becoming available (e.g., after login)
watch(() => auth.token?.value, (newToken) => {
  if (newToken) {
    console.log('🔑 Token detected, starting SSE stream')
    startAdminStream(newToken)
  } else {
    console.log('🔑 Token cleared, closing SSE stream')
    if (eventSource) {
      try { eventSource.close() } catch (e) {}
      eventSource = null
    }
  }
})

onUnmounted(() => {
  if (eventSource) {
    try { eventSource.close() } catch (e) {}
  }
})
</script>

<style scoped>
.embed-container {
  position: relative;
  overflow: auto;
  min-height: 200px;
}

.embed-container :deep(iframe) {
  width: 100% !important;
  min-height: 400px !important;
  border: 0;
}

.embed-container :deep(blockquote) {
  margin: 0 !important;
  min-width: 100% !important;
  max-width: 100% !important;
  overflow: visible !important;
}

/* Instagram embed styling */
.embed-container :deep(.instagram-media) {
  min-width: 100% !important;
  max-width: 100% !important;
  width: 100% !important;
  margin: 0 !important;
}

/* Twitter/X embed styling */
.embed-container :deep(.twitter-tweet) {
  margin: 0 auto !important;
}

/* Badge styles */
.badge {
  @apply px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide;
}

.platform-badge {
  @apply inline-block px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.content-type-badge {
  @apply inline-block px-3 py-1 rounded-full text-xs backdrop-blur-sm;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
