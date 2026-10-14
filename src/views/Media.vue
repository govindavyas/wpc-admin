<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Media Library</h1>
        <p class="text-gray-400 mt-1">Manage all uploaded files on the server</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Bulk Delete -->
        <button
          v-if="selectedFiles.length > 0"
          @click="confirmBulkDelete"
          class="btn btn-danger"
        >
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete {{ selectedFiles.length }} Selected
        </button>
        <!-- Refresh -->
        <button @click="loadData" class="btn btn-secondary">
          <svg class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="card p-4">
        <div class="text-sm text-gray-400">Total Files</div>
        <div class="text-2xl font-bold text-white">{{ stats.totalFiles || 0 }}</div>
      </div>
      <div class="card p-4">
        <div class="text-sm text-gray-400">Total Size</div>
        <div class="text-2xl font-bold text-primary">{{ stats.totalSizeFormatted || '0 Bytes' }}</div>
      </div>
      <div class="card p-4">
        <div class="text-sm text-gray-400">Images</div>
        <div class="text-2xl font-bold text-white">{{ getImageCount() }}</div>
      </div>
      <div class="card p-4">
        <div class="text-sm text-gray-400">Videos</div>
        <div class="text-2xl font-bold text-white">{{ stats.categories?.videos?.count || 0 }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-4 mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <!-- Category Filter -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm text-gray-400 mb-1">Category</label>
          <select v-model="filters.category" class="w-full">
            <option value="">All Categories</option>
            <option value="images">Images</option>
            <option value="posters">Posters</option>
            <option value="gallery">Gallery</option>
            <option value="news">News</option>
            <option value="team">Team</option>
            <option value="producers">Producers</option>
            <option value="partners">Partners</option>
            <option value="videos">Videos</option>
            <option value="resumes">Resumes</option>
          </select>
        </div>
        <!-- Search -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm text-gray-400 mb-1">Search</label>
          <input v-model="filters.search" type="text" placeholder="Search by filename..." />
        </div>
        <!-- Sort -->
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm text-gray-400 mb-1">Sort By</label>
          <select v-model="filters.sort">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="largest">Largest First</option>
            <option value="smallest">Smallest First</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
        <!-- View Mode -->
        <div class="flex items-end gap-2">
          <button
            @click="viewMode = 'grid'"
            class="p-2 rounded-lg transition-colors"
            :class="viewMode === 'grid' ? 'bg-primary text-white' : 'bg-dark-200 text-gray-400 hover:text-white'"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            @click="viewMode = 'list'"
            class="p-2 rounded-lg transition-colors"
            :class="viewMode === 'list' ? 'bg-primary text-white' : 'bg-dark-200 text-gray-400 hover:text-white'"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredFiles.length === 0" class="card p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-gray-400 text-lg">No media files found</p>
      <p class="text-gray-500 text-sm mt-1">Upload files through the respective sections (Movies, News, etc.)</p>
    </div>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      <div
        v-for="file in filteredFiles"
        :key="file.id"
        class="card group relative overflow-hidden cursor-pointer"
        @click="toggleSelect(file)"
      >
        <!-- Selection Checkbox -->
        <div class="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            :checked="isSelected(file)"
            @click.stop="toggleSelect(file)"
            class="w-5 h-5 rounded bg-dark-200 border-dark-100 text-primary focus:ring-primary cursor-pointer"
          />
        </div>

        <!-- Thumbnail -->
        <div class="aspect-square bg-dark-200 relative overflow-hidden">
          <img
            v-if="isImage(file)"
            :src="getApiUrl(file.thumbnailUrl || file.url)"
            :alt="file.filename"
            class="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
            @error="handleImageError"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <svg v-if="isVideo(file)" class="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else class="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <!-- Category Badge -->
          <div class="absolute top-2 right-2">
            <span class="px-2 py-1 text-xs rounded bg-dark-100/80 text-gray-300 backdrop-blur-sm">
              {{ file.category }}
            </span>
          </div>

          <!-- Hover Overlay -->
          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              @click.stop="viewFile(file)"
              class="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="View"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              @click.stop="openRenameModal(file)"
              class="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Rename"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click.stop="copyUrl(file)"
              class="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Copy URL"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
            <button
              @click.stop="confirmDelete(file)"
              class="p-2 rounded-lg bg-red-500/50 hover:bg-red-500/70 text-white transition-colors"
              title="Delete"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- File Info -->
        <div class="p-3">
          <p class="text-sm text-white truncate" :title="file.filename">{{ file.filename }}</p>
          <p class="text-xs text-gray-500">{{ file.sizeFormatted }}</p>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="card overflow-hidden">
      <table class="w-full">
        <thead class="bg-dark-200">
          <tr>
            <th class="p-4 text-left w-12">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll"
                class="w-4 h-4 rounded bg-dark-300 border-dark-100 text-primary"
              />
            </th>
            <th class="p-4 text-left text-sm font-medium text-gray-400">Preview</th>
            <th class="p-4 text-left text-sm font-medium text-gray-400">Filename</th>
            <th class="p-4 text-left text-sm font-medium text-gray-400 hidden md:table-cell">Category</th>
            <th class="p-4 text-left text-sm font-medium text-gray-400 hidden lg:table-cell">Size</th>
            <th class="p-4 text-left text-sm font-medium text-gray-400 hidden xl:table-cell">Date</th>
            <th class="p-4 text-right text-sm font-medium text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-dark-100">
          <tr v-for="file in filteredFiles" :key="file.id" class="hover:bg-dark-200/50 transition-colors">
            <td class="p-4">
              <input
                type="checkbox"
                :checked="isSelected(file)"
                @change="toggleSelect(file)"
                class="w-4 h-4 rounded bg-dark-300 border-dark-100 text-primary"
              />
            </td>
            <td class="p-4">
              <div class="w-12 h-12 rounded overflow-hidden bg-dark-200">
                <img
                  v-if="isImage(file)"
                  :src="getApiUrl(file.thumbnailUrl || file.url)"
                  :alt="file.filename"
                  class="w-full h-full object-cover"
                  loading="lazy"
                  @error="handleImageError"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-500">
                  <svg v-if="isVideo(file)" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </td>
            <td class="p-4">
              <p class="text-white font-medium truncate max-w-[200px]" :title="file.filename">{{ file.filename }}</p>
              <p class="text-xs text-gray-500">.{{ file.extension }}</p>
            </td>
            <td class="p-4 hidden md:table-cell">
              <span class="px-2 py-1 text-xs rounded bg-dark-100 text-gray-300">{{ file.category }}</span>
            </td>
            <td class="p-4 hidden lg:table-cell text-gray-400">{{ file.sizeFormatted }}</td>
            <td class="p-4 hidden xl:table-cell text-gray-400">{{ formatDate(file.created) }}</td>
            <td class="p-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <button @click="viewFile(file)" class="p-2 text-gray-400 hover:text-white transition-colors" title="View">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button @click="openRenameModal(file)" class="p-2 text-gray-400 hover:text-white transition-colors" title="Rename">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="copyUrl(file)" class="p-2 text-gray-400 hover:text-white transition-colors" title="Copy URL">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button @click="confirmDelete(file)" class="p-2 text-red-400 hover:text-red-300 transition-colors" title="Delete">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Preview Modal -->
    <Teleport to="body">
      <div v-if="previewFile" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" @click="previewFile = null">
        <div class="relative max-w-5xl max-h-[90vh] w-full" @click.stop>
          <button @click="previewFile = null" class="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            v-if="isImage(previewFile)"
            :src="getApiUrl(previewFile.url)"
            :alt="previewFile.filename"
            class="max-w-full max-h-[85vh] mx-auto rounded-lg"
          />
          <video
            v-else-if="isVideo(previewFile)"
            :src="getApiUrl(previewFile.url)"
            controls
            class="max-w-full max-h-[85vh] mx-auto rounded-lg"
          ></video>
          <div v-else class="bg-dark-100 p-8 rounded-lg text-center">
            <svg class="w-24 h-24 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-white text-lg">{{ previewFile.filename }}</p>
            <p class="text-gray-400">{{ previewFile.sizeFormatted }}</p>
            <a :href="getApiUrl(previewFile.url)" download class="btn btn-primary mt-4 inline-flex">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-100 rounded-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-red-400 mb-2">Delete File{{ deleteTarget.length > 1 ? 's' : '' }}</h3>
          <p class="text-gray-400 mb-4">
            <template v-if="deleteTarget.length === 1">
              Are you sure you want to delete <span class="text-white font-medium">{{ deleteTarget[0].filename }}</span>?
            </template>
            <template v-else>
              Are you sure you want to delete <span class="text-white font-medium">{{ deleteTarget.length }} files</span>?
            </template>
            <br><span class="text-red-400 text-sm">This action cannot be undone.</span>
          </p>
          <div class="flex gap-3 justify-end">
            <button @click="showDeleteModal = false" class="btn btn-secondary">Cancel</button>
            <button @click="executeDelete" class="btn btn-danger" :disabled="deleting">
              <span v-if="deleting" class="spinner mr-2"></span>
              Delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- Rename Modal -->
    <Teleport to="body">
      <div v-if="showRenameModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-100 rounded-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-white mb-2">Rename Media</h3>
          <p class="text-gray-400 text-sm mb-4">
            Renaming <span class="text-white">{{ renameTarget?.filename }}</span>.<br>
            <span class="text-xs text-gray-500">Links in the database will be automatically updated.</span>
          </p>
          <div class="mb-4">
            <label class="block text-sm text-gray-400 mb-1">New SEO Name (without extension)</label>
            <input 
              v-model="newFileNameInput" 
              type="text" 
              class="w-full text-white bg-dark-200" 
              placeholder="e.g. latest-movie-poster" 
              @keyup.enter="executeRename"
            />
          </div>
          <div class="flex gap-3 justify-end">
            <button @click="showRenameModal = false" class="btn btn-secondary">Cancel</button>
            <button @click="executeRename" class="btn btn-primary" :disabled="!newFileNameInput.trim() || renaming">
              <span v-if="renaming" class="spinner mr-2"></span>
              Rename
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { mediaAPI } from '@/services/api'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'
import { getApiUrl } from '@/utils/imageUrl'

const toast = useToastStore()
const authStore = useAuthStore()

// Check admin access
const isAdmin = computed(() => authStore.user?.role === 'admin')

const loading = ref(true)
const files = ref([])
const stats = ref({})
const selectedFiles = ref([])
const viewMode = ref('grid')
const previewFile = ref(null)
const showDeleteModal = ref(false)
const deleteTarget = ref([])
const deleting = ref(false)

const filters = ref({
  category: '',
  search: '',
  sort: 'newest'
})

const showRenameModal = ref(false)
const renameTarget = ref(null)
const newFileNameInput = ref('')
const renaming = ref(false)

// Computed filtered files
const filteredFiles = computed(() => {
  let result = [...files.value]
  
  // Filter by category
  if (filters.value.category) {
    result = result.filter(f => f.category === filters.value.category)
  }
  
  // Filter by search
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(f => f.filename.toLowerCase().includes(search))
  }
  
  // Sort
  switch (filters.value.sort) {
    case 'newest':
      result.sort((a, b) => new Date(b.created) - new Date(a.created))
      break
    case 'oldest':
      result.sort((a, b) => new Date(a.created) - new Date(b.created))
      break
    case 'largest':
      result.sort((a, b) => b.size - a.size)
      break
    case 'smallest':
      result.sort((a, b) => a.size - b.size)
      break
    case 'name':
      result.sort((a, b) => a.filename.localeCompare(b.filename))
      break
  }
  
  return result
})

const allSelected = computed(() => {
  return filteredFiles.value.length > 0 && filteredFiles.value.every(f => isSelected(f))
})

async function loadData() {
  loading.value = true
  try {
    const [filesRes, statsRes] = await Promise.all([
      mediaAPI.getAll(),
      mediaAPI.getStats()
    ])
    
    files.value = filesRes.data?.data || []
    stats.value = statsRes.data?.data || {}
  } catch (error) {
    toast.error('Failed to load media files')
    console.error(error)
  } finally {
    loading.value = false
  }
}

function getImageCount() {
  const imageCategories = ['images', 'posters', 'gallery', 'news', 'team', 'producers', 'partners']
  let count = 0
  if (stats.value.categories) {
    imageCategories.forEach(cat => {
      count += stats.value.categories[cat]?.count || 0
    })
  }
  return count
}

function isImage(file) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
  return imageExtensions.includes(file.extension?.toLowerCase())
}

function isVideo(file) {
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi']
  return videoExtensions.includes(file.extension?.toLowerCase())
}

function handleImageError(e) {
  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23333"/></svg>'
}

function isSelected(file) {
  return selectedFiles.value.some(f => f.id === file.id)
}

function toggleSelect(file) {
  const index = selectedFiles.value.findIndex(f => f.id === file.id)
  if (index > -1) {
    selectedFiles.value.splice(index, 1)
  } else {
    selectedFiles.value.push(file)
  }
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedFiles.value = []
  } else {
    selectedFiles.value = [...filteredFiles.value]
  }
}

function viewFile(file) {
  previewFile.value = file
}

async function copyUrl(file) {
  try {
    const fullUrl = getApiUrl(file.url)
    await navigator.clipboard.writeText(fullUrl)
    toast.success('URL copied to clipboard')
  } catch (error) {
    toast.error('Failed to copy URL')
  }
}

function confirmDelete(file) {
  deleteTarget.value = [file]
  showDeleteModal.value = true
}

function confirmBulkDelete() {
  deleteTarget.value = [...selectedFiles.value]
  showDeleteModal.value = true
}

async function executeDelete() {
  deleting.value = true
  try {
    if (deleteTarget.value.length === 1) {
      const file = deleteTarget.value[0]
      await mediaAPI.delete(file.category, file.filename)
      toast.success('File deleted successfully')
    } else {
      const filesToDelete = deleteTarget.value.map(f => ({
        category: f.category,
        filename: f.filename
      }))
      await mediaAPI.deleteBulk(filesToDelete)
      toast.success(`${deleteTarget.value.length} files deleted successfully`)
    }
    
    // Remove deleted files from state
    const deletedIds = deleteTarget.value.map(f => f.id)
    files.value = files.value.filter(f => !deletedIds.includes(f.id))
    selectedFiles.value = selectedFiles.value.filter(f => !deletedIds.includes(f.id))
    
    showDeleteModal.value = false
    
    // Refresh stats
    const statsRes = await mediaAPI.getStats()
    stats.value = statsRes.data?.data || {}
  } catch (error) {
    toast.error('Failed to delete file(s)')
    console.error(error)
  } finally {
    deleting.value = false
  }
}

function openRenameModal(file) {
  renameTarget.value = file
  // Pre-fill with name excluding extension and random numbers at the end if possible
  let baseName = file.filename.substring(0, file.filename.lastIndexOf('.')) || file.filename
  // Basic heuristic: Remove trailing numbers like -230495 or timestamp
  baseName = baseName.replace(/-\d{5,}$/, '')
  
  newFileNameInput.value = baseName
  showRenameModal.value = true
}

async function executeRename() {
  if (!newFileNameInput.value.trim() || !renameTarget.value) return
  
  renaming.value = true
  try {
    const file = renameTarget.value
    await mediaAPI.rename(file.category, file.filename, newFileNameInput.value)
    toast.success('File renamed and mapped successfully')
    showRenameModal.value = false
    
    // Refresh the files
    await loadData()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to rename file')
    console.error(error)
  } finally {
    renaming.value = false
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  if (!isAdmin.value) {
    toast.error('Admin access required')
    return
  }
  loadData()
})
</script>
