<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <p class="text-gray-400 mt-1">Track visitor behavior and understand your audience</p>
      </div>
      
      <!-- Date Range Selector -->
      <div class="flex flex-wrap items-center gap-3">
        <select
          v-model="dateRange"
          @change="fetchAllData"
          class="input-field w-40"
        >
          <option value="today">Today</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="12m">Last 12 months</option>
        </select>
        <button
          @click="fetchAllData"
          class="btn btn-secondary flex items-center gap-2"
          :disabled="loading"
        >
          <RefreshIcon class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          Refresh
        </button>
        <button
          @click="exportData"
          class="btn btn-secondary flex items-center gap-2"
          title="Export analytics data as JSON"
        >
          <DownloadIcon class="w-4 h-4" />
          Export
        </button>
        <button
          @click="showClearModal = true"
          class="btn btn-secondary flex items-center gap-2 text-red-400 hover:text-red-300"
          title="Clear old analytics data"
        >
          <TrashIcon class="w-4 h-4" />
          Clear Old Data
        </button>
      </div>
    </div>

    <!-- Analytics Status Banner -->
    <div v-if="!analyticsEnabled" class="mb-6 card bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-700/50">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
          <svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="font-semibold text-yellow-400">Analytics Tracking is Disabled</p>
          <p class="text-sm text-gray-400 mt-1">
            No visitor data is being collected. Enable analytics tracking in 
            <router-link to="/settings" class="text-yellow-500 hover:text-yellow-400 underline">Settings</router-link> 
            to start collecting data.
          </p>
        </div>
      </div>
    </div>
    <div v-else class="mb-6 card bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-700/50">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="font-semibold text-green-400">Analytics Tracking is Active</p>
          <p class="text-sm text-gray-400 mt-1">Visitor data is being collected and analyzed in real-time.</p>
        </div>
      </div>
    </div>

    <!-- Realtime Banner -->
    <div class="mb-6 card bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-700/50">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="relative">
            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div class="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
          </div>
          <div>
            <p class="text-sm text-gray-400">Active right now</p>
            <p class="text-3xl font-bold text-white">{{ realtime.activeVisitors }}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-400">Most active page</p>
          <p class="text-white font-medium">{{ realtime.activePages[0]?.path || 'N/A' }}</p>
        </div>
      </div>
    </div>

    <!-- Overview Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      <div v-for="stat in overviewStats" :key="stat.label" class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-white mt-1">{{ stat.value }}</p>
            <div v-if="stat.change !== undefined" class="flex items-center gap-1 mt-1">
              <component 
                :is="parseFloat(stat.change) >= 0 ? TrendingUpIcon : TrendingDownIcon" 
                class="w-4 h-4"
                :class="parseFloat(stat.change) >= 0 ? 'text-green-500' : 'text-red-500'"
              />
              <span 
                class="text-sm"
                :class="parseFloat(stat.change) >= 0 ? 'text-green-500' : 'text-red-500'"
              >
                {{ Math.abs(parseFloat(stat.change)).toFixed(1) }}%
              </span>
            </div>
          </div>
          <div :class="['p-3 rounded-lg', stat.bgColor]">
            <component :is="stat.icon" class="w-6 h-6" :class="stat.iconColor" />
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Page Views Chart -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Page Views Over Time</h2>
        <div v-if="loadingPageViews" class="h-64 flex items-center justify-center">
          <div class="spinner"></div>
        </div>
        <div v-else-if="pageViewsChart.length === 0" class="h-64 flex items-center justify-center text-gray-500">
          No data available
        </div>
        <div v-else class="h-64">
          <div class="flex flex-col h-full">
            <!-- Simple bar chart representation -->
            <div class="flex-1 flex items-end gap-1">
              <div 
                v-for="(item, index) in pageViewsChart.slice(-14)" 
                :key="index"
                class="flex-1 bg-primary-600 rounded-t hover:bg-primary-500 transition-colors relative group"
                :style="{ height: `${getBarHeight(item.views)}%` }"
              >
                <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                  {{ formatDate(item.date) }}: {{ item.views }} views
                </div>
              </div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-2">
              <span>{{ formatDate(pageViewsChart[Math.max(0, pageViewsChart.length - 14)]?.date) }}</span>
              <span>{{ formatDate(pageViewsChart[pageViewsChart.length - 1]?.date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Device Breakdown -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Device Breakdown</h2>
        <div v-if="loadingDevices" class="h-64 flex items-center justify-center">
          <div class="spinner"></div>
        </div>
        <div v-else-if="devices.devices.length === 0" class="h-64 flex items-center justify-center text-gray-500">
          No data available
        </div>
        <div v-else class="space-y-4">
          <div v-for="device in devices.devices" :key="device.device" class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-300 capitalize flex items-center gap-2">
                <component :is="getDeviceIcon(device.device)" class="w-4 h-4" />
                {{ device.device }}
              </span>
              <span class="text-white font-medium">{{ device.count }} ({{ getDevicePercentage(device.count) }}%)</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-2">
              <div 
                class="h-2 rounded-full"
                :class="getDeviceColor(device.device)"
                :style="{ width: `${getDevicePercentage(device.count)}%` }"
              ></div>
            </div>
          </div>
          
          <!-- Browser breakdown -->
          <div class="border-t border-gray-700 pt-4 mt-4">
            <h3 class="text-sm font-medium text-gray-400 mb-3">Top Browsers</h3>
            <div class="space-y-2">
              <div v-for="browser in devices.browsers.slice(0, 5)" :key="browser.browser" class="flex justify-between text-sm">
                <span class="text-gray-300">{{ browser.browser }}</span>
                <span class="text-gray-400">{{ browser.count }}</span>
              </div>
            </div>
          </div>
          
          <!-- OS breakdown -->
          <div v-if="devices.os && devices.os.length > 0" class="border-t border-gray-700 pt-4 mt-4">
            <h3 class="text-sm font-medium text-gray-400 mb-3">Operating Systems</h3>
            <div class="space-y-2">
              <div v-for="os in devices.os.slice(0, 5)" :key="os.os" class="flex justify-between text-sm">
                <span class="text-gray-300">{{ os.os || 'Unknown' }}</span>
                <span class="text-gray-400">{{ os.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Pages & Referrers -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Top Pages -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Top Pages</h2>
        <div v-if="loadingTopPages" class="py-8 flex justify-center">
          <div class="spinner"></div>
        </div>
        <div v-else-if="topPages.length === 0" class="py-8 text-center text-gray-500">
          No page data available
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-xs text-gray-500 uppercase tracking-wider">
                <th class="pb-3">#</th>
                <th class="pb-3">Page</th>
                <th class="pb-3 text-right">Views</th>
                <th class="pb-3 text-right">Unique</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              <tr v-for="page in topPages" :key="page.path" class="border-t border-gray-800">
                <td class="py-3 text-gray-500">{{ page.rank }}</td>
                <td class="py-3">
                  <p class="text-white truncate max-w-[200px]" :title="page.title">{{ page.title || page.path }}</p>
                  <p class="text-xs text-gray-500 truncate max-w-[200px]">{{ page.path }}</p>
                </td>
                <td class="py-3 text-right text-white font-medium">{{ formatNumber(page.views) }}</td>
                <td class="py-3 text-right text-gray-400">{{ formatNumber(page.uniqueVisitors) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top Referrers -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Traffic Sources</h2>
        <div v-if="loadingReferrers" class="py-8 flex justify-center">
          <div class="spinner"></div>
        </div>
        <div v-else-if="referrers.length === 0" class="py-8 text-center text-gray-500">
          No referrer data available
        </div>
        <div v-else class="space-y-3">
          <div v-for="referrer in referrers.slice(0, 8)" :key="referrer.source" class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-dark-200 flex items-center justify-center flex-shrink-0">
              <component 
                :is="referrer.type === 'direct' ? DirectIcon : LinkIcon" 
                class="w-4 h-4 text-gray-400"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white text-sm truncate">{{ referrer.source }}</p>
              <div class="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                <div 
                  class="bg-primary-500 h-1.5 rounded-full"
                  :style="{ width: `${getReferrerPercentage(referrer.visits)}%` }"
                ></div>
              </div>
            </div>
            <span class="text-gray-400 text-sm">{{ formatNumber(referrer.visits) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Events & User Flow -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Events Breakdown -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">User Interactions</h2>
        <div v-if="loadingEvents" class="py-8 flex justify-center">
          <div class="spinner"></div>
        </div>
        <div v-else-if="events.byType.length === 0" class="py-8 text-center text-gray-500">
          No event data available
        </div>
        <div v-else>
          <!-- Event Types -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <div v-for="event in events.byType.slice(0, 6)" :key="event.type" class="bg-dark-200 rounded-lg p-3 text-center">
              <p class="text-xl font-bold text-white">{{ formatNumber(event.count) }}</p>
              <p class="text-xs text-gray-400 capitalize">{{ event.type.replace('_', ' ') }}</p>
            </div>
          </div>
          
          <!-- Top Events -->
          <h3 class="text-sm font-medium text-gray-400 mb-3">Top Events</h3>
          <div class="space-y-2">
            <div v-for="event in events.topEvents.slice(0, 5)" :key="`${event.category}-${event.action}`" class="flex items-center justify-between text-sm py-2 border-b border-gray-800 last:border-0">
              <div>
                <span class="text-white">{{ event.action }}</span>
                <span class="text-gray-500 ml-2">({{ event.category }})</span>
              </div>
              <span class="text-primary-400 font-medium">{{ formatNumber(event.count) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- User Flow -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">User Journey</h2>
        <div v-if="loadingUserFlow" class="py-8 flex justify-center">
          <div class="spinner"></div>
        </div>
        <div v-else-if="userFlow.entryPages.length === 0" class="py-8 text-center text-gray-500">
          No user flow data available
        </div>
        <div v-else class="space-y-6">
          <!-- Entry Pages -->
          <div>
            <h3 class="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <EnterIcon class="w-4 h-4" />
              Top Entry Pages
            </h3>
            <div class="space-y-2">
              <div v-for="page in userFlow.entryPages.slice(0, 5)" :key="page.page" class="flex items-center justify-between text-sm">
                <span class="text-gray-300 truncate max-w-[60%]">{{ page.page }}</span>
                <div class="text-right">
                  <span class="text-white">{{ page.sessions }}</span>
                  <span class="text-gray-500 ml-2">({{ page.bounceRate }}% bounce)</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Exit Pages -->
          <div>
            <h3 class="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <ExitIcon class="w-4 h-4" />
              Top Exit Pages
            </h3>
            <div class="space-y-2">
              <div v-for="page in userFlow.exitPages.slice(0, 5)" :key="page.page" class="flex items-center justify-between text-sm">
                <span class="text-gray-300 truncate max-w-[60%]">{{ page.page }}</span>
                <span class="text-white">{{ page.sessions }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- UTM Campaigns -->
    <div class="card mb-8">
      <h2 class="text-lg font-semibold text-white mb-4">Campaign Performance</h2>
      <div v-if="loadingUTM" class="py-8 flex justify-center">
        <div class="spinner"></div>
      </div>
      <div v-else-if="utmCampaigns.length === 0" class="py-8 text-center text-gray-500">
        <p>No campaign data available</p>
        <p class="text-sm mt-2">UTM parameters will appear here when visitors come from tracked campaigns</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-xs text-gray-500 uppercase tracking-wider">
              <th class="pb-3">Source</th>
              <th class="pb-3">Medium</th>
              <th class="pb-3">Campaign</th>
              <th class="pb-3 text-right">Sessions</th>
              <th class="pb-3 text-right">Page Views</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr v-for="(campaign, index) in utmCampaigns" :key="index" class="border-t border-gray-800">
              <td class="py-3 text-white">{{ campaign.source || 'N/A' }}</td>
              <td class="py-3 text-gray-300">{{ campaign.medium || 'N/A' }}</td>
              <td class="py-3 text-gray-300">{{ campaign.campaign || 'N/A' }}</td>
              <td class="py-3 text-right text-white font-medium">{{ formatNumber(campaign.sessions) }}</td>
              <td class="py-3 text-right text-gray-400">{{ formatNumber(campaign.pageViews) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="card">
      <h2 class="text-lg font-semibold text-white mb-4">Recent Visitors</h2>
      <div v-if="realtime.recentPageViews.length === 0" class="py-8 text-center text-gray-500">
        No recent activity
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-xs text-gray-500 uppercase tracking-wider">
              <th class="pb-3">Page</th>
              <th class="pb-3">Device</th>
              <th class="pb-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr v-for="(view, index) in realtime.recentPageViews" :key="index" class="border-t border-gray-800">
              <td class="py-3">
                <p class="text-white truncate max-w-[300px]">{{ view.title || view.path }}</p>
                <p class="text-xs text-gray-500">{{ view.path }}</p>
              </td>
              <td class="py-3">
                <span class="badge capitalize" :class="getDeviceBadge(view.device)">{{ view.device }}</span>
              </td>
              <td class="py-3 text-right text-gray-400">{{ formatTimeAgo(view.timestamp) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Clear Data Modal -->
    <Teleport to="body">
      <div v-if="showClearModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
        <div class="card max-w-md w-full">
          <h3 class="text-xl font-bold text-white mb-4">Clear Old Analytics Data</h3>
          <p class="text-gray-400 mb-4">
            This will permanently delete analytics data older than the specified number of days.
            This action cannot be undone.
          </p>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-400 mb-2">
              Delete data older than (days)
            </label>
            <select v-model="clearDays" class="input-field w-full">
              <option :value="30">30 days</option>
              <option :value="60">60 days</option>
              <option :value="90">90 days</option>
              <option :value="180">180 days</option>
              <option :value="365">1 year</option>
            </select>
          </div>
          
          <div class="flex gap-3 justify-end">
            <button
              @click="showClearModal = false"
              class="btn btn-secondary"
              :disabled="clearingData"
            >
              Cancel
            </button>
            <button
              @click="clearOldData"
              class="btn bg-red-600 hover:bg-red-500 text-white"
              :disabled="clearingData"
            >
              {{ clearingData ? 'Clearing...' : 'Clear Data' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { analyticsAPI, settingsAPI } from '@/services/api'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

// Icon components
const RefreshIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>`
}
const TrendingUpIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>`
}
const TrendingDownIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" /></svg>`
}
const EyeIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`
}
const UsersIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>`
}
const ClockIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
}
const ChartIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>`
}
const DesktopIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>`
}
const MobileIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>`
}
const TabletIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25v-15a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z" /></svg>`
}
const DirectIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>`
}
const LinkIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>`
}
const EnterIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>`
}
const ExitIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>`
}
const DownloadIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>`
}
const TrashIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>`
}

// State
const loading = ref(false)
const dateRange = ref('30d')
const analyticsEnabled = ref(true)
const overview = ref({})
const pageViewsChart = ref([])
const topPages = ref([])
const referrers = ref([])
const devices = ref({ devices: [], browsers: [], os: [] })
const events = ref({ byType: [], byCategory: [], topEvents: [] })
const userFlow = ref({ entryPages: [], exitPages: [] })
const utmCampaigns = ref([])
const realtime = ref({ activeVisitors: 0, recentPageViews: [], activePages: [] })

// Loading states
const loadingPageViews = ref(false)
const loadingTopPages = ref(false)
const loadingReferrers = ref(false)
const loadingDevices = ref(false)
const loadingEvents = ref(false)
const loadingUserFlow = ref(false)
const loadingUTM = ref(false)

// Modal states
const showClearModal = ref(false)
const clearingData = ref(false)
const clearDays = ref(90)

// Computed
const overviewStats = computed(() => [
  {
    label: 'Page Views',
    value: formatNumber(overview.value.pageViews || 0),
    change: overview.value.pageViewsChange,
    icon: EyeIcon,
    bgColor: 'bg-primary-600/20',
    iconColor: 'text-primary-400'
  },
  {
    label: 'Unique Visitors',
    value: formatNumber(overview.value.uniqueVisitors || 0),
    change: overview.value.visitorsChange,
    icon: UsersIcon,
    bgColor: 'bg-green-600/20',
    iconColor: 'text-green-400'
  },
  {
    label: 'Sessions',
    value: formatNumber(overview.value.sessions || 0),
    change: overview.value.sessionsChange,
    icon: ChartIcon,
    bgColor: 'bg-blue-600/20',
    iconColor: 'text-blue-400'
  },
  {
    label: 'Bounce Rate',
    value: `${overview.value.bounceRate || 0}%`,
    icon: ClockIcon,
    bgColor: 'bg-orange-600/20',
    iconColor: 'text-orange-400'
  },
  {
    label: 'Avg. Session Duration',
    value: formatDuration(overview.value.avgSessionDuration || 0),
    icon: ClockIcon,
    bgColor: 'bg-purple-600/20',
    iconColor: 'text-purple-400'
  },
  {
    label: 'Pages / Session',
    value: overview.value.avgPageViews || '0',
    icon: ChartIcon,
    bgColor: 'bg-cyan-600/20',
    iconColor: 'text-cyan-400'
  }
])

// Methods
async function fetchAllData() {
  loading.value = true
  try {
    // Check analytics status
    await checkAnalyticsStatus()
    
    await Promise.all([
      fetchOverview(),
      fetchPageViews(),
      fetchTopPages(),
      fetchReferrers(),
      fetchDevices(),
      fetchEvents(),
      fetchUserFlow(),
      fetchUTM(),
      fetchRealtime()
    ])
  } catch (error) {
    console.error('Error fetching analytics:', error)
    toast.error('Failed to load analytics data')
  } finally {
    loading.value = false
  }
}

async function checkAnalyticsStatus() {
  try {
    const response = await settingsAPI.get()
    analyticsEnabled.value = response.data.data?.enableAnalytics !== false
  } catch (error) {
    console.error('Error checking analytics status:', error)
    analyticsEnabled.value = true // Default to enabled if can't check
    loading.value = false
  }
}

async function fetchOverview() {
  try {
    const response = await analyticsAPI.getOverview(dateRange.value)
    overview.value = response.data.data.overview
  } catch (error) {
    console.error('Error fetching overview:', error)
  }
}

async function fetchPageViews() {
  loadingPageViews.value = true
  try {
    const response = await analyticsAPI.getPageViews(dateRange.value)
    pageViewsChart.value = response.data.data
  } catch (error) {
    console.error('Error fetching page views:', error)
  } finally {
    loadingPageViews.value = false
  }
}

async function fetchTopPages() {
  loadingTopPages.value = true
  try {
    const response = await analyticsAPI.getTopPages(dateRange.value)
    topPages.value = response.data.data
  } catch (error) {
    console.error('Error fetching top pages:', error)
  } finally {
    loadingTopPages.value = false
  }
}

async function fetchReferrers() {
  loadingReferrers.value = true
  try {
    const response = await analyticsAPI.getReferrers(dateRange.value)
    referrers.value = response.data.data
  } catch (error) {
    console.error('Error fetching referrers:', error)
  } finally {
    loadingReferrers.value = false
  }
}

async function fetchDevices() {
  loadingDevices.value = true
  try {
    const response = await analyticsAPI.getDevices(dateRange.value)
    devices.value = response.data.data
  } catch (error) {
    console.error('Error fetching devices:', error)
  } finally {
    loadingDevices.value = false
  }
}

async function fetchEvents() {
  loadingEvents.value = true
  try {
    const response = await analyticsAPI.getEvents(dateRange.value)
    events.value = response.data.data
  } catch (error) {
    console.error('Error fetching events:', error)
  } finally {
    loadingEvents.value = false
  }
}

async function fetchUserFlow() {
  loadingUserFlow.value = true
  try {
    const response = await analyticsAPI.getUserFlow(dateRange.value)
    userFlow.value = response.data.data
  } catch (error) {
    console.error('Error fetching user flow:', error)
  } finally {
    loadingUserFlow.value = false
  }
}

async function fetchUTM() {
  loadingUTM.value = true
  try {
    const response = await analyticsAPI.getUTM(dateRange.value)
    utmCampaigns.value = response.data.data
  } catch (error) {
    console.error('Error fetching UTM:', error)
  } finally {
    loadingUTM.value = false
  }
}

async function fetchRealtime() {
  try {
    const response = await analyticsAPI.getRealtime()
    realtime.value = response.data.data
  } catch (error) {
    console.error('Error fetching realtime:', error)
  }
}

// Export analytics data as JSON
function exportData() {
  const exportPayload = {
    exportDate: new Date().toISOString(),
    dateRange: dateRange.value,
    overview: overview.value,
    pageViews: pageViewsChart.value,
    topPages: topPages.value,
    referrers: referrers.value,
    devices: devices.value,
    events: events.value,
    userFlow: userFlow.value,
    campaigns: utmCampaigns.value
  }
  
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics-export-${dateRange.value}-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  toast.success('Analytics data exported successfully')
}

// Clear old analytics data
async function clearOldData() {
  clearingData.value = true
  try {
    const beforeDate = new Date()
    beforeDate.setDate(beforeDate.getDate() - clearDays.value)
    
    const response = await analyticsAPI.clearData('all', beforeDate.toISOString())
    const { pageViews = 0, events = 0, sessions = 0 } = response.data.data || {}
    
    toast.success(`Cleared ${pageViews} page views, ${events} events, and ${sessions} sessions older than ${clearDays.value} days`)
    showClearModal.value = false
    
    // Refresh data
    await fetchAllData()
  } catch (error) {
    console.error('Error clearing data:', error)
    toast.error('Failed to clear analytics data')
  } finally {
    clearingData.value = false
  }
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num?.toString() || '0'
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0s'
  
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hrs > 0) {
    return `${hrs}h ${mins}m`
  } else if (mins > 0) {
    return `${mins}m ${secs}s`
  }
  return `${secs}s`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTimeAgo(date) {
  if (!date) return ''
  const now = new Date()
  const d = new Date(date)
  const diff = now - d
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

function getBarHeight(views) {
  const maxViews = Math.max(...pageViewsChart.value.map(p => p.views), 1)
  return Math.max((views / maxViews) * 100, 5)
}

function getDevicePercentage(count) {
  const total = devices.value.devices.reduce((sum, d) => sum + d.count, 0)
  return total > 0 ? ((count / total) * 100).toFixed(1) : 0
}

function getReferrerPercentage(visits) {
  const maxVisits = Math.max(...referrers.value.map(r => r.visits), 1)
  return (visits / maxVisits) * 100
}

function getDeviceIcon(device) {
  switch (device) {
    case 'mobile': return MobileIcon
    case 'tablet': return TabletIcon
    default: return DesktopIcon
  }
}

function getDeviceColor(device) {
  switch (device) {
    case 'mobile': return 'bg-green-500'
    case 'tablet': return 'bg-blue-500'
    default: return 'bg-primary-500'
  }
}

function getDeviceBadge(device) {
  switch (device) {
    case 'mobile': return 'badge-green'
    case 'tablet': return 'badge-blue'
    default: return 'badge-purple'
  }
}

// Realtime polling
let realtimeInterval = null

onMounted(() => {
  fetchAllData()
  // Poll realtime data every 30 seconds
  realtimeInterval = setInterval(fetchRealtime, 30000)
})

onUnmounted(() => {
  if (realtimeInterval) {
    clearInterval(realtimeInterval)
  }
})
</script>
