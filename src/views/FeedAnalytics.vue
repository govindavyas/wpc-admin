<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Feed Analytics</h1>
        <p class="text-gray-400 mt-1">Track engagement and performance of your social feed</p>
      </div>
      <router-link to="/feed" class="btn btn-secondary">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Feed
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <template v-else>
      <!-- Overview Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div class="card">
          <p class="text-gray-400 text-sm">Total Items</p>
          <p class="text-2xl font-bold text-white">{{ overview.totalItems }}</p>
        </div>
        <div class="card">
          <p class="text-gray-400 text-sm">Published</p>
          <p class="text-2xl font-bold text-green-400">{{ overview.publishedItems }}</p>
        </div>
        <div class="card">
          <p class="text-gray-400 text-sm">Total Likes</p>
          <p class="text-2xl font-bold text-pink-400">{{ formatNumber(overview.totalLikes) }}</p>
        </div>
        <div class="card">
          <p class="text-gray-400 text-sm">Total Shares</p>
          <p class="text-2xl font-bold text-blue-400">{{ formatNumber(overview.totalShares) }}</p>
        </div>
        <div class="card">
          <p class="text-gray-400 text-sm">Total Views</p>
          <p class="text-2xl font-bold text-purple-400">{{ formatNumber(overview.totalViews) }}</p>
        </div>
        <div class="card">
          <p class="text-gray-400 text-sm">Interactions</p>
          <p class="text-2xl font-bold text-yellow-400">{{ formatNumber(overview.totalInteractions) }}</p>
        </div>
      </div>

      <!-- Platform Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="card">
          <h2 class="text-lg font-semibold text-white mb-4">Platform Distribution</h2>
          <div class="space-y-3">
            <div
              v-for="platform in platformBreakdown"
              :key="platform._id"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <span :class="['w-2 h-2 rounded-full', getPlatformColor(platform._id)]"></span>
                <span class="text-gray-300 capitalize">{{ platform._id }}</span>
              </div>
              <div class="flex items-center gap-4 text-sm">
                <span class="text-gray-400">{{ platform.count }} items</span>
                <span class="text-pink-400">{{ platform.likes }} ❤️</span>
                <span class="text-blue-400">{{ platform.shares }} 📤</span>
              </div>
            </div>
            <div v-if="platformBreakdown.length === 0" class="text-gray-500 text-center py-4">
              No platform data yet
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold text-white mb-4">Engagement Rate</h2>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-400">Likes per Item</span>
                <span class="text-white">{{ engagementRate.likesPerItem.toFixed(1) }}</span>
              </div>
              <div class="h-2 bg-dark-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-pink-500 rounded-full" 
                  :style="{ width: Math.min(engagementRate.likesPerItem * 10, 100) + '%' }"
                ></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-400">Shares per Item</span>
                <span class="text-white">{{ engagementRate.sharesPerItem.toFixed(1) }}</span>
              </div>
              <div class="h-2 bg-dark-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-blue-500 rounded-full" 
                  :style="{ width: Math.min(engagementRate.sharesPerItem * 10, 100) + '%' }"
                ></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-400">Views per Item</span>
                <span class="text-white">{{ engagementRate.viewsPerItem.toFixed(1) }}</span>
              </div>
              <div class="h-2 bg-dark-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-purple-500 rounded-full" 
                  :style="{ width: Math.min(engagementRate.viewsPerItem, 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Performing Items -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Top Performing Items</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left border-b border-gray-800">
                <th class="pb-3 text-gray-400 font-medium">Item</th>
                <th class="pb-3 text-gray-400 font-medium">Platform</th>
                <th class="pb-3 text-gray-400 font-medium text-right">Likes</th>
                <th class="pb-3 text-gray-400 font-medium text-right">Shares</th>
                <th class="pb-3 text-gray-400 font-medium text-right">Views</th>
                <th class="pb-3 text-gray-400 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in topItems" :key="item._id" class="border-b border-gray-800/50">
                <td class="py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-dark-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        v-if="item.thumbnailUrl" 
                        :src="getApiUrl(item.thumbnailUrl)" 
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div class="min-w-0">
                      <p class="text-white font-medium truncate max-w-[200px]">
                        {{ item.title || 'Untitled' }}
                      </p>
                      <a 
                        :href="item.originalUrl" 
                        target="_blank" 
                        class="text-xs text-gray-500 hover:text-primary-400 truncate block max-w-[200px]"
                      >
                        {{ item.originalUrl }}
                      </a>
                    </div>
                  </div>
                </td>
                <td class="py-3">
                  <span :class="['badge', getPlatformBadge(item.platform)]">
                    {{ item.platform }}
                  </span>
                </td>
                <td class="py-3 text-right">
                  <span class="text-pink-400">{{ formatNumber(item.analytics?.likes || 0) }}</span>
                </td>
                <td class="py-3 text-right">
                  <span class="text-blue-400">{{ formatNumber(item.analytics?.shares || 0) }}</span>
                </td>
                <td class="py-3 text-right">
                  <span class="text-purple-400">{{ formatNumber(item.analytics?.views || 0) }}</span>
                </td>
                <td class="py-3 text-right">
                  <button
                    @click="showItemDetails(item)"
                    class="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </button>
                </td>
              </tr>
              <tr v-if="topItems.length === 0">
                <td colspan="6" class="py-8 text-center text-gray-500">
                  No feed items yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Item Details Modal -->
      <Teleport to="body">
        <div v-if="selectedItem" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/70" @click="selectedItem = null"></div>
          <div class="relative bg-dark-100 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 p-6">
            <div class="flex items-start justify-between mb-6">
              <div>
                <h3 class="text-lg font-bold text-white">Item Analytics</h3>
                <p class="text-gray-400 text-sm">{{ selectedItem.title || selectedItem.originalUrl }}</p>
              </div>
              <button @click="selectedItem = null" class="text-gray-400 hover:text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Item Stats -->
            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="bg-dark-200 rounded-lg p-4 text-center">
                <p class="text-3xl font-bold text-pink-400">{{ formatNumber(selectedItem.analytics?.likes || 0) }}</p>
                <p class="text-gray-400 text-sm">Likes</p>
              </div>
              <div class="bg-dark-200 rounded-lg p-4 text-center">
                <p class="text-3xl font-bold text-blue-400">{{ formatNumber(selectedItem.analytics?.shares || 0) }}</p>
                <p class="text-gray-400 text-sm">Shares</p>
              </div>
              <div class="bg-dark-200 rounded-lg p-4 text-center">
                <p class="text-3xl font-bold text-purple-400">{{ formatNumber(selectedItem.analytics?.views || 0) }}</p>
                <p class="text-gray-400 text-sm">Views</p>
              </div>
            </div>

            <!-- Device Breakdown -->
            <div v-if="itemAnalytics?.devices" class="mb-6">
              <h4 class="text-white font-medium mb-3">Device Breakdown</h4>
              <div class="flex gap-4">
                <div 
                  v-for="device in itemAnalytics.devices" 
                  :key="device._id"
                  class="flex-1 bg-dark-200 rounded-lg p-3 text-center"
                >
                  <p class="text-xl font-bold text-white">{{ device.count }}</p>
                  <p class="text-gray-400 text-sm capitalize">{{ device._id || 'Unknown' }}</p>
                </div>
              </div>
            </div>

            <div class="flex justify-end">
              <a 
                :href="selectedItem.originalUrl" 
                target="_blank" 
                class="btn btn-secondary"
              >
                View Original Post
              </a>
            </div>
          </div>
        </div>
      </Teleport>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { feedAPI } from '@/services/api'
import { useToastStore } from '@/stores/toast'
import { getApiUrl } from '@/utils/imageUrl'

const toast = useToastStore()

// State
const loading = ref(true)
const overview = reactive({
  totalItems: 0,
  publishedItems: 0,
  totalLikes: 0,
  totalShares: 0,
  totalViews: 0,
  totalInteractions: 0
})
const platformBreakdown = ref([])
const topItems = ref([])
const selectedItem = ref(null)
const itemAnalytics = ref(null)

// Computed
const engagementRate = computed(() => {
  const items = overview.publishedItems || 1
  return {
    likesPerItem: overview.totalLikes / items,
    sharesPerItem: overview.totalShares / items,
    viewsPerItem: overview.totalViews / items
  }
})

// Fetch analytics
async function fetchAnalytics() {
  loading.value = true
  try {
    const response = await feedAPI.getAnalyticsOverview()
    const data = response.data.data

    Object.assign(overview, data.overview)
    platformBreakdown.value = data.platformBreakdown || []
    topItems.value = data.topItems || []
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    toast.error('Failed to load analytics')
  } finally {
    loading.value = false
  }
}

// Show item details
async function showItemDetails(item) {
  selectedItem.value = item
  try {
    const response = await feedAPI.getItemAnalytics(item._id)
    itemAnalytics.value = response.data.data.interactionDetails
  } catch (error) {
    console.error('Failed to fetch item analytics:', error)
  }
}

// Helpers
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

function getPlatformColor(platform) {
  const colors = {
    instagram: 'bg-pink-500',
    youtube: 'bg-red-500',
    facebook: 'bg-blue-600',
    twitter: 'bg-sky-500',
    vimeo: 'bg-cyan-500',
    tiktok: 'bg-purple-500',
    linkedin: 'bg-blue-700'
  }
  return colors[platform] || 'bg-gray-500'
}

function getPlatformBadge(platform) {
  const badges = {
    instagram: 'bg-pink-500/20 text-pink-400',
    youtube: 'bg-red-500/20 text-red-400',
    facebook: 'bg-blue-600/20 text-blue-400',
    twitter: 'bg-sky-500/20 text-sky-400',
    vimeo: 'bg-cyan-500/20 text-cyan-400',
    tiktok: 'bg-purple-500/20 text-purple-400',
    linkedin: 'bg-blue-700/20 text-blue-300'
  }
  return badges[platform] || 'bg-gray-500/20 text-gray-400'
}

onMounted(() => {
  fetchAnalytics()
})
</script>
