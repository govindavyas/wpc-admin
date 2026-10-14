<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Movies</h1>
        <p class="text-gray-400 mt-1">Manage your film portfolio</p>
      </div>
      <router-link to="/movies/new" class="btn btn-primary">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Movie
      </router-link>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <input
        v-model="search"
        type="text"
        placeholder="Search movies..."
        class="max-w-md"
        @input="debouncedSearch"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="movies.length === 0" class="card text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
      <h3 class="text-lg font-medium text-white mb-2">No movies yet</h3>
      <p class="text-gray-400 mb-4">Get started by adding your first movie.</p>
      <router-link to="/movies/new" class="btn btn-primary">Add Movie</router-link>
    </div>

    <!-- Movies Table (Desktop) -->
    <div v-else class="hidden md:block table-container">
      <table>
        <thead>
          <tr>
            <th>Movie</th>
            <th>Year</th>
            <th>Status</th>
            <th>Featured</th>
            <th>Active</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movie in movies" :key="movie._id">
            <td>
              <div class="flex items-center gap-3">
                <div class="w-10 h-14 rounded bg-dark-200 overflow-hidden flex-shrink-0">
                  <img v-if="movie.posterUrl" :src="getApiUrl(movie.posterUrl)" :alt="movie.title" class="w-full h-full object-cover" />
                </div>
                <div>
                  <p class="font-medium text-white">{{ movie.title }}</p>
                  <p class="text-xs text-gray-500">{{ movie.language }}</p>
                </div>
              </div>
            </td>
            <td>{{ movie.year }}</td>
            <td>
              <span :class="['badge', getStatusBadge(movie.status)]">{{ movie.status }}</span>
            </td>
            <td>
              <button
                @click="setHighlight(movie)"
                :class="['p-1 rounded', movie.highlight ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400']"
                title="Set as featured"
              >
                <svg class="w-5 h-5" :fill="movie.highlight ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </td>
            <td>
              <button
                @click="toggleActive(movie)"
                :class="['relative w-10 h-6 rounded-full transition-colors', movie.isActive ? 'bg-green-600' : 'bg-gray-600']"
              >
                <span
                  :class="['absolute top-1 w-4 h-4 rounded-full bg-white transition-transform', movie.isActive ? 'left-5' : 'left-1']"
                ></span>
              </button>
            </td>
            <td class="text-right">
              <div class="flex items-center justify-end gap-2">
                <router-link
                  :to="`/movies/${movie._id}`"
                  class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="Edit"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </router-link>
                <button
                  @click="confirmDelete(movie)"
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

    <!-- Movies Cards (Mobile) -->
    <div v-if="!loading && movies.length > 0" class="md:hidden space-y-4">
      <div
        v-for="movie in movies"
        :key="movie._id"
        class="card"
      >
        <div class="flex gap-4">
          <div class="w-16 h-24 rounded-lg bg-dark-200 overflow-hidden flex-shrink-0">
            <img v-if="movie.posterUrl" :src="getApiUrl(movie.posterUrl)" :alt="movie.title" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-white truncate">{{ movie.title }}</h3>
            <p class="text-sm text-gray-400">{{ movie.year }} · {{ movie.language }}</p>
            <div class="flex items-center gap-2 mt-2">
              <span :class="['badge text-xs', getStatusBadge(movie.status)]">{{ movie.status }}</span>
              <span v-if="movie.highlight" class="text-yellow-400">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
          <div class="flex items-center gap-3">
            <button
              @click="setHighlight(movie)"
              :class="['p-2 rounded-lg', movie.highlight ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-500 hover:text-yellow-400 hover:bg-gray-700']"
              title="Set as featured"
            >
              <svg class="w-5 h-5" :fill="movie.highlight ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
            <button
              @click="toggleActive(movie)"
              :class="['relative w-10 h-6 rounded-full transition-colors', movie.isActive ? 'bg-green-600' : 'bg-gray-600']"
            >
              <span
                :class="['absolute top-1 w-4 h-4 rounded-full bg-white transition-transform', movie.isActive ? 'left-5' : 'left-1']"
              ></span>
            </button>
          </div>
          <div class="flex items-center gap-2">
            <router-link
              :to="`/movies/${movie._id}`"
              class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Edit"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </router-link>
            <button
              @click="confirmDelete(movie)"
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
        Showing {{ (currentPage - 1) * limit + 1 }} to {{ Math.min(currentPage * limit, total) }} of {{ total }} movies
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
          <h3 class="text-lg font-semibold text-white mb-2">Delete Movie</h3>
          <p class="text-gray-400 mb-6">Are you sure you want to delete "{{ movieToDelete?.title }}"? This action cannot be undone.</p>
          <div class="flex gap-3 justify-end">
            <button @click="deleteModal = false" class="btn btn-secondary">Cancel</button>
            <button @click="deleteMovie" class="btn btn-danger" :disabled="deleting">
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
import { moviesAPI } from '@/services/api'
import { useToastStore } from '@/stores/toast'
import { useDebounceFn } from '@vueuse/core'
import { getApiUrl } from '@/utils/imageUrl'

const toast = useToastStore()

const movies = ref([])
const loading = ref(true)
const search = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)
const limit = 20

const deleteModal = ref(false)
const movieToDelete = ref(null)
const deleting = ref(false)

async function fetchMovies() {
  loading.value = true
  try {
    const response = await moviesAPI.getAll({
      page: currentPage.value,
      limit,
      search: search.value || undefined
    })
    movies.value = response.data.data
    totalPages.value = response.data.totalPages
    total.value = response.data.total
  } catch (error) {
    toast.error('Failed to fetch movies')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1
  fetchMovies()
}, 300)

watch(currentPage, fetchMovies)

onMounted(fetchMovies)

function getStatusBadge(status) {
  const badges = {
    'announced': 'badge-gray',
    'pre-production': 'badge-yellow',
    'production': 'badge-blue',
    'post-production': 'badge-yellow',
    'completed': 'badge-green',
    'released': 'badge-green'
  }
  return badges[status] || 'badge-gray'
}

async function setHighlight(movie) {
  try {
    await moviesAPI.setHighlight(movie._id)
    toast.success(`"${movie.title}" set as featured`)
    fetchMovies()
  } catch (error) {
    toast.error('Failed to set featured movie')
  }
}

async function toggleActive(movie) {
  try {
    await moviesAPI.toggle(movie._id)
    movie.isActive = !movie.isActive
    toast.success(`Movie ${movie.isActive ? 'activated' : 'deactivated'}`)
  } catch (error) {
    toast.error('Failed to toggle movie status')
  }
}

function confirmDelete(movie) {
  movieToDelete.value = movie
  deleteModal.value = true
}

async function deleteMovie() {
  if (!movieToDelete.value) return
  
  deleting.value = true
  try {
    await moviesAPI.delete(movieToDelete.value._id)
    toast.success('Movie deleted successfully')
    deleteModal.value = false
    fetchMovies()
  } catch (error) {
    toast.error('Failed to delete movie')
  } finally {
    deleting.value = false
  }
}
</script>
