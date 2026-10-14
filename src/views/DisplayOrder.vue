<template>
  <div class="p-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <router-link :to="`/movies/${route.params.id}`" class="text-gray-400 hover:text-white text-sm mb-2 inline-flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          Back to Movie
        </router-link>
        <h1 class="text-2xl font-bold text-white">Display Order</h1>
        <p v-if="movieTitle" class="text-gray-400 mt-1">{{ movieTitle }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="spinner"></div>
    </div>

    <!-- Content -->
    <div v-else class="space-y-6">
      <!-- Instructions -->
      <div class="card p-4 bg-blue-500/10 border border-blue-500/20">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <p class="text-blue-200 font-medium">Drag and Drop to Reorder</p>
            <p class="text-blue-300/70 text-sm mt-1">Drag sections to change the order they appear on the movie details page. Toggle visibility to show or hide sections.</p>
          </div>
        </div>
      </div>

      <!-- Sections List with Drag & Drop -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4 px-4 pt-4">Page Sections</h2>
        
        <div 
          class="space-y-1 p-2"
          @dragover.prevent
          @drop="handleDrop"
        >
          <div 
            v-for="(section, idx) in sections" 
            :key="section.id"
            :draggable="true"
            @dragstart="handleDragStart($event, idx)"
            @dragend="handleDragEnd"
            @dragover.prevent="handleDragOver($event, idx)"
            @dragleave="handleDragLeave"
            :class="[
              'flex items-center gap-4 p-4 rounded-lg transition-all cursor-grab active:cursor-grabbing',
              draggedIndex === idx ? 'opacity-50 scale-95' : '',
              dropTargetIndex === idx ? 'border-2 border-panda-purple border-dashed' : 'border-2 border-transparent',
              section.visible ? 'bg-dark-200 hover:bg-dark-100' : 'bg-dark-300/50'
            ]"
          >
            <!-- Drag Handle -->
            <div class="flex-shrink-0 text-gray-500 hover:text-gray-300">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
              </svg>
            </div>

            <!-- Order Number -->
            <div class="w-8 h-8 rounded-full bg-panda-purple/20 flex items-center justify-center text-panda-purple font-bold text-sm flex-shrink-0">
              {{ idx + 1 }}
            </div>

            <!-- Section Name -->
            <div class="flex-1">
              <span :class="[section.visible ? 'text-white' : 'text-gray-500 line-through']">
                {{ section.label }}
              </span>
              <p class="text-xs text-gray-500 mt-0.5">{{ getSectionDescription(section.id) }}</p>
            </div>

            <!-- Visibility Toggle -->
            <label class="flex items-center gap-2 cursor-pointer flex-shrink-0">
              <span class="text-sm text-gray-400">{{ section.visible ? 'Visible' : 'Hidden' }}</span>
              <div class="relative">
                <input 
                  v-model="section.visible" 
                  type="checkbox" 
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-dark-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-panda-purple"></div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Preview -->
      <div class="card p-4">
        <h3 class="text-sm font-medium text-gray-400 mb-3">Preview Order (Visible Sections Only)</h3>
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="(section, idx) in visibleSections" 
            :key="section.id"
            class="px-3 py-1.5 bg-panda-purple/20 text-panda-purple rounded-full text-sm flex items-center gap-2"
          >
            <span class="w-5 h-5 bg-panda-purple/30 rounded-full flex items-center justify-center text-xs">{{ idx + 1 }}</span>
            {{ section.label }}
          </span>
          <span v-if="visibleSections.length === 0" class="text-gray-500 text-sm">No sections visible</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4">
        <button 
          @click="saveOrder" 
          class="btn btn-primary"
          :disabled="saving"
        >
          <span v-if="saving" class="spinner mr-2"></span>
          <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          Save Order
        </button>
        <router-link :to="`/movies/${route.params.id}`" class="btn btn-secondary">Cancel</router-link>
        <button @click="resetToDefault" class="btn btn-secondary ml-auto">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Reset to Default
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { moviesAPI } from '@/services/api'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const loading = ref(true)
const saving = ref(false)
const movieTitle = ref('')

// Default sections configuration
const defaultSections = [
  { id: 'production', label: 'Production Credits', visible: true, order: 0 },
  { id: 'creative', label: 'Creative Team', visible: true, order: 1 },
  { id: 'productionTeam', label: 'Technical & Production Team', visible: true, order: 2 },
  { id: 'cast', label: 'Cast', visible: true, order: 3 },
  { id: 'gallery', label: 'Gallery', visible: true, order: 4 },
  { id: 'distribution', label: 'Distribution', visible: true, order: 5 },
  { id: 'awards', label: 'Awards & Recognition', visible: true, order: 6 },
  { id: 'socialMedia', label: 'Social Media', visible: true, order: 7 }
]

const sections = ref([...defaultSections])

// Drag and drop state
const draggedIndex = ref(null)
const dropTargetIndex = ref(null)

// Section descriptions
const getSectionDescription = (id) => {
  const descriptions = {
    production: 'Producers, Executive Producers, Production House',
    creative: 'Directors, Writers, Cinematography, Music, Editor',
    productionTeam: 'Production Manager, Art Director, Costume, Makeup',
    cast: 'Lead Cast, Supporting Cast, Special Appearances',
    gallery: 'Movie stills and behind-the-scenes images',
    distribution: 'Distributor, Platforms, Territories',
    awards: 'Awards won and nominations',
    socialMedia: 'Instagram, Facebook, YouTube, Twitter links'
  }
  return descriptions[id] || ''
}

// Computed visible sections
const visibleSections = computed(() => {
  return sections.value.filter(s => s.visible)
})

// Drag handlers
const handleDragStart = (e, idx) => {
  draggedIndex.value = idx
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', idx)
}

const handleDragEnd = () => {
  draggedIndex.value = null
  dropTargetIndex.value = null
}

const handleDragOver = (e, idx) => {
  e.preventDefault()
  if (draggedIndex.value !== null && draggedIndex.value !== idx) {
    dropTargetIndex.value = idx
  }
}

const handleDragLeave = () => {
  dropTargetIndex.value = null
}

const handleDrop = (e) => {
  e.preventDefault()
  if (draggedIndex.value !== null && dropTargetIndex.value !== null && draggedIndex.value !== dropTargetIndex.value) {
    const draggedItem = sections.value[draggedIndex.value]
    sections.value.splice(draggedIndex.value, 1)
    sections.value.splice(dropTargetIndex.value, 0, draggedItem)
    
    // Update order values
    sections.value.forEach((s, i) => s.order = i)
  }
  draggedIndex.value = null
  dropTargetIndex.value = null
}

// Fetch movie data
const fetchMovie = async () => {
  loading.value = true
  try {
    const response = await moviesAPI.getById(route.params.id)
    const movie = response.data.data
    movieTitle.value = movie.title
    
    // Load saved display order or use defaults
    if (movie.displayOrder?.sections?.length) {
      // Merge saved sections with defaults (in case new sections were added)
      const savedSections = movie.displayOrder.sections
      const mergedSections = defaultSections.map(defaultSection => {
        const saved = savedSections.find(s => s.id === defaultSection.id)
        return saved || defaultSection
      })
      // Sort by saved order
      sections.value = mergedSections.sort((a, b) => a.order - b.order)
    } else {
      sections.value = [...defaultSections]
    }
  } catch (error) {
    toast.error('Failed to load movie')
    router.push('/movies')
  } finally {
    loading.value = false
  }
}

// Save order
const saveOrder = async () => {
  saving.value = true
  try {
    // Update order values before saving
    sections.value.forEach((s, i) => s.order = i)
    
    await moviesAPI.update(route.params.id, {
      displayOrder: {
        sections: sections.value
      }
    })
    toast.success('Display order saved successfully')
  } catch (error) {
    toast.error('Failed to save display order')
  } finally {
    saving.value = false
  }
}

// Reset to default order
const resetToDefault = () => {
  sections.value = defaultSections.map((s, i) => ({ ...s, visible: true, order: i }))
}

onMounted(() => {
  fetchMovie()
})
</script>

<style scoped>
/* Custom drag ghost */
[draggable="true"] {
  -webkit-user-drag: element;
}
</style>

