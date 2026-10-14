<template>
  <div class="fade-in">
    <!-- Welcome Section -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-white">Welcome back, {{ user?.name?.split(' ')[0] || 'Admin' }}! 👋</h1>
      <p class="text-gray-400 mt-1">Here's what's happening with your content today.</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="stat in stats" :key="stat.label" class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-white mt-1">{{ stat.value }}</p>
          </div>
          <div :class="['p-3 rounded-lg', stat.bgColor]">
            <component :is="stat.icon" class="w-6 h-6" :class="stat.iconColor" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent News -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">Recent News</h2>
          <router-link to="/news" class="text-sm text-primary-400 hover:text-primary-300">View all →</router-link>
        </div>
        <div v-if="loadingNews" class="py-8 flex justify-center">
          <div class="spinner"></div>
        </div>
        <div v-else-if="recentNews.length === 0" class="py-8 text-center text-gray-500">
          No news articles yet
        </div>
        <div v-else class="space-y-4">
          <div v-for="news in recentNews" :key="news._id" class="flex gap-4">
            <div class="w-16 h-16 rounded-lg bg-dark-200 overflow-hidden flex-shrink-0">
              <img
                v-if="news.imageUrl"
                :src="getApiUrl(news.imageUrl)"
                :alt="news.title"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-white font-medium truncate">{{ news.title }}</h3>
              <p class="text-gray-400 text-sm mt-0.5">{{ formatDate(news.date) }}</p>
              <span :class="['badge mt-1', getCategoryBadge(news.category)]">{{ news.category }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div class="grid grid-cols-2 gap-3">
          <router-link
            v-for="action in quickActions"
            :key="action.to"
            :to="action.to"
            class="p-4 bg-dark-200 rounded-lg hover:bg-dark-100 transition-colors text-center group"
          >
            <component :is="action.icon" class="w-8 h-8 mx-auto text-gray-400 group-hover:text-primary-400 transition-colors" />
            <p class="text-sm text-gray-300 mt-2">{{ action.label }}</p>
          </router-link>
        </div>
      </div>

      <!-- Movies Overview -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">Movies</h2>
          <router-link to="/movies" class="text-sm text-primary-400 hover:text-primary-300">Manage →</router-link>
        </div>
        <div v-if="loadingMovies" class="py-8 flex justify-center">
          <div class="spinner"></div>
        </div>
        <div v-else-if="movies.length === 0" class="py-8 text-center text-gray-500">
          No movies yet
        </div>
        <div v-else class="space-y-3">
          <div v-for="movie in movies" :key="movie._id" class="flex items-center gap-4 p-3 bg-dark-200 rounded-lg">
            <div class="w-12 h-16 rounded bg-dark-100 overflow-hidden flex-shrink-0">
              <img
                v-if="movie.posterUrl"
                :src="getApiUrl(movie.posterUrl)"
                :alt="movie.title"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-white font-medium truncate">{{ movie.title }}</h3>
              <p class="text-gray-400 text-sm">{{ movie.year }}</p>
            </div>
            <span :class="['badge', getStatusBadge(movie.status)]">{{ movie.status }}</span>
          </div>
        </div>
      </div>

      <!-- System Info -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">System Info</h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between py-2 border-b border-gray-800">
            <span class="text-gray-400">API Status</span>
            <span class="badge badge-green">Online</span>
          </div>
          <div class="flex items-center justify-between py-2 border-b border-gray-800">
            <span class="text-gray-400">Database</span>
            <span class="badge badge-green">Connected</span>
          </div>
          <div class="flex items-center justify-between py-2 border-b border-gray-800">
            <span class="text-gray-400">Your Role</span>
            <span class="badge badge-blue capitalize">{{ user?.role || 'Unknown' }}</span>
          </div>
          <div class="flex items-center justify-between py-2">
            <span class="text-gray-400">Last Login</span>
            <span class="text-gray-300 text-sm">{{ formatDateTime(user?.lastLogin) || 'N/A' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { moviesAPI, newsAPI, teamAPI } from '@/services/api'
import { getApiUrl } from '@/utils/imageUrl'

// Icon components - defined first to avoid initialization errors
const FilmIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" /></svg>`
}
const NewsIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>`
}
const UsersIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>`
}
const ImageIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>`
}
const PlusFilmIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>`
}
const PlusNewsIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>`
}
const PlusUserIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>`
}
const UploadIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>`
}

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const loadingNews = ref(true)
const loadingMovies = ref(true)
const recentNews = ref([])
const movies = ref([])
const movieCount = ref(0)
const newsCount = ref(0)
const teamMemberCount = ref(0)

const stats = computed(() => [
  { 
    label: 'Total Movies', 
    value: movieCount.value, 
    icon: FilmIcon, 
    bgColor: 'bg-primary-900/50', 
    iconColor: 'text-primary-400' 
  },
  { 
    label: 'News Articles', 
    value: newsCount.value, 
    icon: NewsIcon, 
    bgColor: 'bg-green-900/50', 
    iconColor: 'text-green-400' 
  },
  { 
    label: 'Team Members', 
    value: teamMemberCount.value, 
    icon: UsersIcon, 
    bgColor: 'bg-purple-900/50', 
    iconColor: 'text-purple-400' 
  },
  { 
    label: 'Active Users', 
    value: '—', 
    icon: ImageIcon, 
    bgColor: 'bg-yellow-900/50', 
    iconColor: 'text-yellow-400' 
  }
])

const quickActions = [
  { to: '/movies/new', label: 'Add Movie', icon: PlusFilmIcon },
  { to: '/news/new', label: 'Add News', icon: PlusNewsIcon },
  { to: '/team/new', label: 'Add Team Member', icon: PlusUserIcon },
  { to: '/company', label: 'Company Info', icon: UploadIcon }
]

onMounted(async () => {
  // Fetch recent news
  try {
    console.log('Fetching news...')
    const response = await newsAPI.getAll({ limit: 5 })
    console.log('News response:', response)
    recentNews.value = response.data?.data || []
    newsCount.value = response.data?.total || recentNews.value.length
  } catch (error) {
    console.error('Failed to fetch news:', error)
    recentNews.value = []
  } finally {
    loadingNews.value = false
  }

  // Fetch movies
  try {
    console.log('Fetching movies...')
    const response = await moviesAPI.getAll({ limit: 5 })
    console.log('Movies response:', response)
    movies.value = response.data?.data || []
    movieCount.value = response.data?.total || movies.value.length
  } catch (error) {
    console.error('Failed to fetch movies:', error)
    movies.value = []
  } finally {
    loadingMovies.value = false
  }

  // Fetch team member count
  try {
    console.log('Fetching team members...')
    const response = await teamAPI.getAll()
    console.log('Team members response:', response)
    teamMemberCount.value = response.data?.total || response.data?.data?.length || 0
  } catch (error) {
    console.error('Failed to fetch team members:', error)
  }
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

function formatDateTime(date) {
  if (!date) return null
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getCategoryBadge(category) {
  const badges = {
    'Production': 'badge-blue',
    'Casting': 'badge-green',
    'Music': 'badge-yellow',
    'Announcement': 'badge-gray'
  }
  return badges[category] || 'badge-gray'
}

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
</script>
