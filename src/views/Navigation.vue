<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Navigation Management</h1>
        <p class="text-gray-400 mt-1">Drag and drop to reorder or move items between main navbar and dropdown</p>
      </div>
      <button @click="saveNavigation" class="btn btn-primary" :disabled="saving">
        <span v-if="saving" class="spinner"></span>
        <span v-else>Save Changes</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Main Navigation -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold text-white">Main Navigation</h2>
            <p class="text-sm text-gray-400">Items shown directly in the navbar</p>
          </div>
          <span class="badge badge-primary">{{ mainNavigation.length }} items</span>
        </div>

        <div class="space-y-2">
          <div 
            @drop="onDropZone($event, 'main')"
            @dragover.prevent="dragOverZone = 'main'"
            @dragleave="onDragLeave"
            :class="['space-y-2 min-h-[100px] p-2 bg-dark-300 rounded-lg border-2 border-dashed transition-colors', 
                     dragOverZone === 'main' ? 'border-primary-500 bg-primary-500/10' : 'border-dark-100']"
          >
            <div 
              v-for="(element, index) in mainNavigation" 
              :key="element._id || index"
              draggable="true"
              @dragstart="onDragStart($event, element, index, 'main')"
              @dragend="onDragEnd"
              @dragover="onDragOverItem($event, index, 'main')"
              @drop="onDropItem($event, index, 'main')"
              :class="['flex items-center gap-3 p-3 bg-dark-200 rounded-lg group transition-all cursor-move',
                       draggedItem === element ? 'opacity-50 scale-95' : 'hover:bg-dark-100 hover:shadow-lg',
                       dropPosition === index && dropZone === 'main' ? 'border-t-2 border-primary-500' : '']"
            >
              <div class="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                </svg>
              </div>
              
              <div class="flex-1">
                <p class="font-medium text-white">{{ element.label }}</p>
                <p class="text-xs text-gray-500">
                  {{ element.type === 'scroll' ? `#${element.target}` : element.route }}
                </p>
              </div>

              <span :class="['badge text-xs', element.type === 'scroll' ? 'badge-info' : 'badge-success']">
                {{ element.type }}
              </span>

              <label class="flex items-center gap-2 cursor-pointer" @click.stop>
                <input 
                  type="checkbox" 
                  :checked="element.isActive"
                  @change="element.isActive = !element.isActive"
                  class="w-4 h-4 rounded"
                />
                <span class="text-xs text-gray-400">Active</span>
              </label>
            </div>

            <p v-if="mainNavigation.length === 0" class="text-center text-gray-500 py-8">
              Drag items here from the dropdown menu
            </p>
          </div>

          <p class="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Drag items to reorder or move to dropdown
          </p>
        </div>

        <button @click="showAddMainModal" class="btn btn-secondary w-full mt-4">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </button>
      </div>

      <!-- Dropdown Navigation -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold text-white">More Dropdown</h2>
            <p class="text-sm text-gray-400">Items shown in the "More" dropdown menu</p>
          </div>
          <span class="badge badge-secondary">{{ dropdownNavigation.length }} items</span>
        </div>

        <div class="space-y-2">
          <div 
            @drop="onDropZone($event, 'dropdown')"
            @dragover.prevent="dragOverZone = 'dropdown'"
            @dragleave="onDragLeave"
            :class="['space-y-2 min-h-[100px] p-2 bg-dark-300 rounded-lg border-2 border-dashed transition-colors',
                     dragOverZone === 'dropdown' ? 'border-secondary-500 bg-secondary-500/10' : 'border-dark-100']"
          >
            <div 
              v-for="(element, index) in dropdownNavigation" 
              :key="element._id || index"
              draggable="true"
              @dragstart="onDragStart($event, element, index, 'dropdown')"
              @dragend="onDragEnd"
              @dragover="onDragOverItem($event, index, 'dropdown')"
              @drop="onDropItem($event, index, 'dropdown')"
              :class="['flex items-center gap-3 p-3 bg-dark-200 rounded-lg group transition-all cursor-move',
                       draggedItem === element ? 'opacity-50 scale-95' : 'hover:bg-dark-100 hover:shadow-lg',
                       dropPosition === index && dropZone === 'dropdown' ? 'border-t-2 border-secondary-500' : '']"
            >
              <div class="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                </svg>
              </div>
              
              <div class="w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path v-if="element.icon === 'building'" fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4z" clip-rule="evenodd"/>
                  <path v-else-if="element.icon === 'users'" d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07z"/>
                  <path v-else-if="element.icon === 'document'" fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                  <path v-else-if="element.icon === 'handshake'" d="M3.707 7.707a1 1 0 00-1.414 1.414l6 6a1 1 0 001.414 0l6-6a1 1 0 00-1.414-1.414L10 12.586 5.707 8.293a1 1 0 00-1.414 0z"/>
                  <path v-else-if="element.icon === 'newspaper'" fill-rule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5z" clip-rule="evenodd"/>
                  <path v-else-if="element.icon === 'briefcase'" fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2z" clip-rule="evenodd"/>
                  <path v-else-if="element.icon === 'collection'" fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7z" clip-rule="evenodd"/>
                  <path v-else d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              
              <div class="flex-1">
                <p class="font-medium text-white">{{ element.label }}</p>
                <p class="text-xs text-gray-500">{{ element.route }}</p>
              </div>

              <label class="flex items-center gap-2 cursor-pointer" @click.stop>
                <input 
                  type="checkbox" 
                  :checked="element.isActive"
                  @change="element.isActive = !element.isActive"
                  class="w-4 h-4 rounded"
                />
                <span class="text-xs text-gray-400">Active</span>
              </label>

              <button 
                @click.stop="removeDropdownItem(index)"
                class="p-1 text-gray-500 hover:text-red-400 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <p v-if="dropdownNavigation.length === 0" class="text-center text-gray-500 py-8">
              Drag items here from the main navigation
            </p>
          </div>

          <p class="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Drag items to reorder or move to main navbar
          </p>
        </div>

        <button @click="showAddDropdownModal" class="btn btn-secondary w-full mt-4">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </button>
      </div>
    </div>

    <!-- Instructions Card -->
    <div class="card mt-6 bg-primary-500/10 border border-primary-500/30">
      <h3 class="text-lg font-semibold text-white mb-2">How to Use</h3>
      <ul class="text-gray-300 space-y-2">
        <li class="flex items-start gap-2">
          <svg class="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span><strong>Drag and drop</strong> items to reorder within a list. Drop between items for precise positioning or drag to another list to move between sections.</span>
        </li>
        <li class="flex items-start gap-2">
          <svg class="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span><strong>Move between sections</strong> by dragging items from Main Navigation to Dropdown or vice versa.</span>
        </li>
        <li class="flex items-start gap-2">
          <svg class="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span><strong>Toggle visibility</strong> using the Active checkbox to hide/show items without removing them.</span>
        </li>
        <li class="flex items-start gap-2">
          <svg class="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span><strong>Click Save Changes</strong> to apply your configuration to the website.</span>
        </li>
      </ul>
    </div>

    <!-- Add Main Nav Item Modal -->
    <Teleport to="body">
      <div v-if="showMainModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-dark-200 rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Add Navigation Item</h3>
          <form @submit.prevent="addMainItem" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Label</label>
              <input v-model="newMainItem.label" type="text" required placeholder="e.g., About" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Type</label>
              <select v-model="newMainItem.type">
                <option value="scroll">Scroll (anchor link)</option>
                <option value="route">Route (page link)</option>
              </select>
            </div>
            <div v-if="newMainItem.type === 'scroll'">
              <label class="block text-sm font-medium text-gray-300 mb-1">Target Section ID</label>
              <input v-model="newMainItem.target" type="text" required placeholder="e.g., about" />
            </div>
            <div v-else>
              <label class="block text-sm font-medium text-gray-300 mb-1">Route Path</label>
              <input v-model="newMainItem.route" type="text" required placeholder="e.g., /about" />
            </div>
            <div class="flex gap-3 justify-end">
              <button type="button" @click="showMainModal = false" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary">Add Item</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Add Dropdown Item Modal -->
    <Teleport to="body">
      <div v-if="showDropdownModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-dark-200 rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Add Dropdown Item</h3>
          <form @submit.prevent="addDropdownItem" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Label</label>
              <input v-model="newDropdownItem.label" type="text" required placeholder="e.g., The Company" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Route Path</label>
              <input v-model="newDropdownItem.route" type="text" required placeholder="e.g., /the-company" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Icon</label>
              <select v-model="newDropdownItem.icon">
                <option value="building">Building</option>
                <option value="users">Users</option>
                <option value="document">Document</option>
                <option value="handshake">Handshake</option>
                <option value="newspaper">Newspaper</option>
                <option value="briefcase">Briefcase</option>
                <option value="collection">Collection</option>
              </select>
            </div>
            <div class="flex gap-3 justify-end">
              <button type="button" @click="showDropdownModal = false" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary">Add Item</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { navigationAPI } from '@/services/api'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

// State
const loading = ref(true)
const saving = ref(false)
const mainNavigation = ref([])
const dropdownNavigation = ref([])

// Drag and drop state
const draggedItem = ref(null)
const draggedFromZone = ref(null)
const draggedIndex = ref(null)
const dragOverZone = ref(null)
const dropPosition = ref(null)
const dropZone = ref(null)

// Modals
const showMainModal = ref(false)
const showDropdownModal = ref(false)

const newMainItem = ref({
  label: '',
  type: 'scroll',
  target: '',
  route: '',
  isActive: true
})

const newDropdownItem = ref({
  label: '',
  route: '',
  icon: 'document',
  isActive: true
})

// Drag and drop handlers
function onDragStart(event, item, index, zone) {
  draggedItem.value = item
  draggedIndex.value = index
  draggedFromZone.value = zone
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', index)
}

function onDragOverItem(event, index, zone) {
  event.preventDefault()
  event.stopPropagation()
  if (draggedItem.value && (zone !== draggedFromZone.value || index !== draggedIndex.value)) {
    dropPosition.value = index
    dropZone.value = zone
  }
}

function onDragLeave() {
  dragOverZone.value = null
}

function onDragEnd() {
  draggedItem.value = null
  draggedIndex.value = null
  draggedFromZone.value = null
  dragOverZone.value = null
  dropPosition.value = null
  dropZone.value = null
}

function onDropItem(event, targetIndex, targetZone) {
  event.preventDefault()
  event.stopPropagation()
  
  if (!draggedItem.value) return
  
  const sourceZone = draggedFromZone.value
  const sourceIndex = draggedIndex.value
  
  // Skip if same position
  if (sourceZone === targetZone && sourceIndex === targetIndex) {
    onDragEnd()
    return
  }
  
  // Prepare item for target zone
  let itemToAdd = {}
  
  if (targetZone === 'dropdown' && sourceZone === 'main') {
    // Convert main nav item to dropdown format
    itemToAdd = {
      label: draggedItem.value.label,
      type: 'route',
      route: draggedItem.value.route || `/${draggedItem.value.target || draggedItem.value.label.toLowerCase().replace(/\s+/g, '-')}`,
      icon: draggedItem.value.icon || 'collection',
      isActive: draggedItem.value.isActive !== undefined ? draggedItem.value.isActive : true,
      order: 0
    }
    // Keep _id if valid
    if (draggedItem.value._id && !draggedItem.value._id.toString().startsWith('temp-')) {
      itemToAdd._id = draggedItem.value._id
    }
  } else if (targetZone === 'main' && sourceZone === 'dropdown') {
    // Convert dropdown item to main nav format (remove icon)
    itemToAdd = {
      label: draggedItem.value.label,
      type: draggedItem.value.type || 'route',
      route: draggedItem.value.route,
      isActive: draggedItem.value.isActive !== undefined ? draggedItem.value.isActive : true,
      order: 0
    }
    // Keep _id if valid
    if (draggedItem.value._id && !draggedItem.value._id.toString().startsWith('temp-')) {
      itemToAdd._id = draggedItem.value._id
    }
  } else {
    // Same zone, just copy everything
    itemToAdd = { ...draggedItem.value }
  }
  
  // Remove from source
  if (sourceZone === 'main') {
    mainNavigation.value.splice(sourceIndex, 1)
  } else {
    dropdownNavigation.value.splice(sourceIndex, 1)
  }
  
  // Adjust target index if needed (when dragging within same zone)
  let insertIndex = targetIndex
  if (sourceZone === targetZone && sourceIndex < targetIndex) {
    insertIndex--
  }
  
  // Insert at target position
  if (targetZone === 'main') {
    mainNavigation.value.splice(insertIndex, 0, itemToAdd)
  } else {
    dropdownNavigation.value.splice(insertIndex, 0, itemToAdd)
  }
  
  onDragEnd()
}

function onDropZone(event, targetZone) {
  event.preventDefault()
  
  if (!draggedItem.value) return
  
  const sourceZone = draggedFromZone.value
  const sourceIndex = draggedIndex.value
  
  // Prepare item for target zone
  let itemToAdd = {}
  
  if (targetZone === 'dropdown' && sourceZone === 'main') {
    // Convert main nav item to dropdown format
    itemToAdd = {
      label: draggedItem.value.label,
      type: 'route',
      route: draggedItem.value.route || `/${draggedItem.value.target || draggedItem.value.label.toLowerCase().replace(/\s+/g, '-')}`,
      icon: draggedItem.value.icon || 'collection',
      isActive: draggedItem.value.isActive !== undefined ? draggedItem.value.isActive : true,
      order: 0
    }
    // Keep _id if valid
    if (draggedItem.value._id && !draggedItem.value._id.toString().startsWith('temp-')) {
      itemToAdd._id = draggedItem.value._id
    }
  } else if (targetZone === 'main' && sourceZone === 'dropdown') {
    // Convert dropdown item to main nav format (remove icon)
    itemToAdd = {
      label: draggedItem.value.label,
      type: draggedItem.value.type || 'route',
      route: draggedItem.value.route,
      isActive: draggedItem.value.isActive !== undefined ? draggedItem.value.isActive : true,
      order: 0
    }
    // Keep _id if valid
    if (draggedItem.value._id && !draggedItem.value._id.toString().startsWith('temp-')) {
      itemToAdd._id = draggedItem.value._id
    }
  } else {
    // Same zone, just copy everything
    itemToAdd = { ...draggedItem.value }
  }
  
  // Remove from source
  if (sourceZone === 'main') {
    mainNavigation.value.splice(sourceIndex, 1)
  } else {
    dropdownNavigation.value.splice(sourceIndex, 1)
  }
  
  // Add to end of target zone
  if (targetZone === 'main') {
    mainNavigation.value.push(itemToAdd)
  } else {
    dropdownNavigation.value.push(itemToAdd)
  }
  
  onDragEnd()
}

// Fetch navigation data
async function fetchNavigation() {
  loading.value = true
  try {
    const response = await navigationAPI.get()
    const data = response.data.data
    mainNavigation.value = data.mainNavigation || []
    dropdownNavigation.value = data.dropdownNavigation || []
    
    // Check if Social Feed exists in either main or dropdown navigation
    const hasSocialFeedInMain = mainNavigation.value.some(item => 
      item.label === 'Social Feed' || item.route === '/feed'
    )
    const hasSocialFeedInDropdown = dropdownNavigation.value.some(item => 
      item.label === 'Social Feed' || item.route === '/feed'
    )
    
    // Only add Social Feed if it doesn't exist in either location
    if (!hasSocialFeedInMain && !hasSocialFeedInDropdown && !saving.value) {
      dropdownNavigation.value.push({
        label: 'Social Feed',
        route: '/feed',
        icon: 'collection',
        type: 'route',
        order: dropdownNavigation.value.length,
        isActive: true,
        _id: `temp-social-feed-${Date.now()}`
      })
      toast.info('Social Feed section added to dropdown navigation. Click Save to keep it.')
    }
  } catch (error) {
    console.error('Failed to fetch navigation:', error)
    toast.error('Failed to load navigation data')
  } finally {
    loading.value = false
  }
}

// Save navigation
async function saveNavigation() {
  saving.value = true
  try {
    console.log('Saving navigation...')
    console.log('Main Navigation:', mainNavigation.value)
    console.log('Dropdown Navigation:', dropdownNavigation.value)
    
    // Update order values and clean up data for backend
    const cleanMainNav = mainNavigation.value.map((item, index) => {
      const cleaned = {
        label: item.label,
        type: item.type,
        order: index,
        isActive: item.isActive !== undefined ? item.isActive : true
      }
      
      // Add type-specific fields
      if (item.type === 'scroll' && item.target) {
        cleaned.target = item.target
      }
      if (item.type === 'route' && item.route) {
        cleaned.route = item.route
      }
      if (item.type === 'external' && item.externalUrl) {
        cleaned.externalUrl = item.externalUrl
      }
      
      // Only include _id if it's a valid MongoDB ObjectID (not temporary)
      if (item._id && !item._id.toString().startsWith('temp-')) {
        cleaned._id = item._id
      }
      
      return cleaned
    })
    
    const cleanDropdownNav = dropdownNavigation.value.map((item, index) => {
      const cleaned = {
        label: item.label,
        type: item.type || 'route',
        route: item.route,
        order: index,
        isActive: item.isActive !== undefined ? item.isActive : true
      }
      
      // Include icon if present
      if (item.icon) {
        cleaned.icon = item.icon
      }
      
      // Only include _id if it's a valid MongoDB ObjectID (not temporary)
      if (item._id && !item._id.toString().startsWith('temp-')) {
        cleaned._id = item._id
      }
      
      return cleaned
    })
    
    console.log('Cleaned Main Nav:', cleanMainNav)
    console.log('Cleaned Dropdown Nav:', cleanDropdownNav)

    const results = await Promise.all([
      navigationAPI.updateMain(cleanMainNav),
      navigationAPI.updateDropdown(cleanDropdownNav)
    ])
    
    console.log('Save results:', results)
    
    // Refresh data to get the new IDs from the server
    await fetchNavigation()
    
    toast.success('Navigation saved successfully')
  } catch (error) {
    console.error('Failed to save navigation:', error)
    console.error('Error response:', error.response?.data)
    toast.error(error.response?.data?.message || 'Failed to save navigation')
  } finally {
    saving.value = false
  }
}

// Add main nav item
function showAddMainModal() {
  newMainItem.value = {
    label: '',
    type: 'scroll',
    target: '',
    route: '',
    isActive: true
  }
  showMainModal.value = true
}

function addMainItem() {
  const item = {
    label: newMainItem.value.label,
    type: newMainItem.value.type,
    isActive: true,
    order: mainNavigation.value.length,
    _id: `temp-${Date.now()}`
  }
  
  if (newMainItem.value.type === 'scroll') {
    item.target = newMainItem.value.target
  } else {
    item.route = newMainItem.value.route
  }
  
  mainNavigation.value.push(item)
  showMainModal.value = false
}

// Add dropdown item
function showAddDropdownModal() {
  newDropdownItem.value = {
    label: '',
    route: '',
    icon: 'document',
    isActive: true
  }
  showDropdownModal.value = true
}

function addDropdownItem() {
  dropdownNavigation.value.push({
    ...newDropdownItem.value,
    type: 'route',
    order: dropdownNavigation.value.length,
    _id: `temp-${Date.now()}`
  })
  showDropdownModal.value = false
}

// Remove dropdown item  
function removeDropdownItem(index) {
  const item = dropdownNavigation.value[index]
  if (confirm(`Are you sure you want to remove "${item.label}" from the dropdown menu?`)) {
    dropdownNavigation.value.splice(index, 1)
  }
}

onMounted(() => {
  fetchNavigation()
})
</script>
