<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">News</h1>
        <p class="text-gray-400 mt-1">Manage news articles</p>
      </div>
      <router-link to="/news/new" class="btn btn-primary">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Article
      </router-link>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <input
        v-model="search"
        type="text"
        placeholder="Search news..."
        class="max-w-md"
        @input="debouncedSearch"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="news.length === 0" class="card text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
      <h3 class="text-lg font-medium text-white mb-2">No news articles yet</h3>
      <p class="text-gray-400 mb-4">Get started by adding your first article.</p>
      <router-link to="/news/new" class="btn btn-primary">Add Article</router-link>
    </div>

    <!-- News Table (Desktop) -->
    <div v-else class="hidden md:block table-container">
      <table>
        <thead>
          <tr>
            <th>Article</th>
            <th>Date</th>
            <th>Category</th>
            <th>Dashboard</th>
            <th>Active</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in news" :key="article._id">
            <td>
              <div class="flex items-center gap-3">
                <div class="w-16 h-12 rounded bg-dark-200 overflow-hidden flex-shrink-0">
                  <img v-if="article.imageUrl || article.thumbnailUrl" :src="getApiUrl(article.thumbnailUrl || article.imageUrl)" :alt="article.title" class="w-full h-full object-cover" />
                </div>
                <div class="max-w-xs">
                  <p class="font-medium text-white truncate">{{ article.title }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ article.summary }}</p>
                </div>
              </div>
            </td>
            <td>{{ formatDate(article.date) }}</td>
            <td>
              <span class="badge badge-blue">{{ article.category || 'General' }}</span>
            </td>
            <td>
              <button
                @click="toggleDashboard(article)"
                :class="['p-1 rounded', article.showOnDashboard ? 'text-green-400' : 'text-gray-500 hover:text-green-400']"
                title="Show on dashboard"
              >
                <svg class="w-5 h-5" :fill="article.showOnDashboard ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
            </td>
            <td>
              <button
                @click="toggleActive(article)"
                :class="['relative w-10 h-6 rounded-full transition-colors', article.isActive ? 'bg-green-600' : 'bg-gray-600']"
              >
                <span
                  :class="['absolute top-1 w-4 h-4 rounded-full bg-white transition-transform', article.isActive ? 'left-5' : 'left-1']"
                ></span>
              </button>
            </td>
            <td class="text-right">
              <div class="flex items-center justify-end gap-2">
                <router-link
                  :to="`/news/${article._id}`"
                  class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="Edit"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </router-link>
                <button
                  @click="confirmDelete(article)"
                  class="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Delete"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- News Cards (Mobile) -->
    <div v-if="!loading && news.length > 0" class="md:hidden space-y-4">
      <div
        v-for="article in news"
        :key="article._id"
        class="card"
      >
        <div class="flex gap-4">
          <div class="w-20 h-16 rounded-lg bg-dark-200 overflow-hidden flex-shrink-0">
            <img v-if="article.imageUrl || article.thumbnailUrl" :src="getApiUrl(article.thumbnailUrl || article.imageUrl)" :alt="article.title" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-white line-clamp-2">{{ article.title }}</h3>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-gray-400">{{ formatDate(article.date) }}</span>
              <span class="badge badge-blue text-xs">{{ article.category || 'General' }}</span>
            </div>
          </div>
        </div>
        <p v-if="article.summary" class="text-sm text-gray-400 mt-3 line-clamp-2">{{ article.summary }}</p>
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
          <div class="flex items-center gap-3">
            <button
              @click="toggleDashboard(article)"
              :class="['p-2 rounded-lg', article.showOnDashboard ? 'text-green-400 bg-green-400/10' : 'text-gray-500 hover:text-green-400 hover:bg-gray-700']"
              title="Show on dashboard"
            >
              <svg class="w-5 h-5" :fill="article.showOnDashboard ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
            <button
              @click="toggleActive(article)"
              :class="['relative w-10 h-6 rounded-full transition-colors', article.isActive ? 'bg-green-600' : 'bg-gray-600']"
            >
              <span
                :class="['absolute top-1 w-4 h-4 rounded-full bg-white transition-transform', article.isActive ? 'left-5' : 'left-1']"
              ></span>
            </button>
          </div>
          <div class="flex items-center gap-2">
            <router-link
              :to="`/news/${article._id}`"
              class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Edit"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </router-link>
            <button
              @click="confirmDelete(article)"
              class="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Delete"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
      <p class="text-sm text-gray-400 text-center sm:text-left">
        Showing {{ (currentPage - 1) * limit + 1 }} to {{ Math.min(currentPage * limit, total) }} of {{ total }} articles
      </p>
      <div class="flex gap-2 justify-center sm:justify-end">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="btn btn-secondary btn-sm"
        >
          Previous
        </button>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="btn btn-secondary btn-sm"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Delete Modal -->
    <Teleport to="body">
      <div v-if="deleteModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-100 rounded-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-white mb-2">Delete Article</h3>
          <p class="text-gray-400 mb-6">Are you sure you want to delete "{{ articleToDelete?.title }}"? This action cannot be undone.</p>
          <div class="flex gap-3 justify-end">
            <button @click="deleteModal = false" class="btn btn-secondary">Cancel</button>
            <button @click="deleteArticle" class="btn btn-danger" :disabled="deleting">
              <span v-if="deleting" class="spinner"></span>
              <span v-else>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { newsAPI } from '@/services/api'
import { useToastStore } from '@/stores/toast'
import { useDebounceFn } from '@vueuse/core'
import { getApiUrl } from '@/utils/imageUrl'

const toast = useToastStore()

const news = ref([])
const loading = ref(true)
const search = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)
const limit = 20

const deleteModal = ref(false)
const articleToDelete = ref(null)
const deleting = ref(false)

async function fetchNews() {
  loading.value = true
  try {
    const response = await newsAPI.getAll({
      page: currentPage.value,
      limit,
      search: search.value || undefined
    })
    news.value = response.data.data
    totalPages.value = response.data.totalPages
    total.value = response.data.total
  } catch (error) {
    toast.error('Failed to fetch news')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1
  fetchNews()
}, 300)

watch(currentPage, fetchNews)

onMounted(fetchNews)

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

async function toggleDashboard(article) {
  try {
    await newsAPI.update(article._id, { showOnDashboard: !article.showOnDashboard })
    article.showOnDashboard = !article.showOnDashboard
    toast.success(`Article ${article.showOnDashboard ? 'added to' : 'removed from'} dashboard`)
  } catch (error) {
    toast.error('Failed to update article')
  }
}

async function toggleActive(article) {
  try {
    await newsAPI.toggle(article._id)
    article.isActive = !article.isActive
    toast.success(`Article ${article.isActive ? 'activated' : 'deactivated'}`)
  } catch (error) {
    toast.error('Failed to toggle article status')
  }
}

function confirmDelete(article) {
  articleToDelete.value = article
  deleteModal.value = true
}

async function deleteArticle() {
  if (!articleToDelete.value) return
  
  deleting.value = true
  try {
    await newsAPI.delete(articleToDelete.value._id)
    toast.success('Article deleted successfully')
    deleteModal.value = false
    fetchNews()
  } catch (error) {
    toast.error('Failed to delete article')
  } finally {
    deleting.value = false
  }
}
</script>
