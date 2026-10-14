<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Messages</h1>
        <p class="text-gray-400 mt-1">Contact form submissions from the website</p>
      </div>
      <div class="flex items-center gap-3">
        <button 
          v-if="unreadCount > 0"
          @click="markAllRead" 
          class="btn btn-secondary text-sm"
          :disabled="markingAllRead"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Mark All Read
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search messages..."
              class="w-full pl-10 pr-4 py-2 bg-dark-200 border border-dark-100 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
              @input="debouncedSearch"
            />
            <svg class="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <!-- Filter tabs -->
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="tab in filterTabs"
            :key="tab.value"
            @click="activeFilter = tab.value"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
              activeFilter === tab.value
                ? 'bg-primary-600 text-white'
                : 'bg-dark-200 text-gray-400 hover:bg-dark-100 hover:text-white'
            ]"
          >
            {{ tab.label }}
            <span 
              v-if="tab.value === 'unread' && unreadCount > 0"
              class="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full"
            >
              {{ unreadCount }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <!-- Messages List -->
    <div v-else-if="messages.length > 0" class="space-y-3">
      <div
        v-for="message in messages"
        :key="message._id"
        @click="openMessage(message)"
        :class="[
          'card p-4 cursor-pointer transition-all hover:bg-dark-100 border-l-4',
          message.isRead ? 'border-l-transparent' : 'border-l-primary-500 bg-dark-100/50',
          selectedMessage?._id === message._id ? 'ring-2 ring-primary-500' : ''
        ]"
      >
        <div class="flex items-start gap-4">
          <!-- Star button -->
          <button
            @click.stop="toggleStar(message)"
            :class="['p-1 transition-colors', message.isStarred ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400']"
          >
            <svg class="w-5 h-5" :fill="message.isStarred ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-1">
              <span :class="['font-medium', message.isRead ? 'text-gray-300' : 'text-white']">
                {{ message.name }}
              </span>
              <span class="text-gray-500 text-sm">&lt;{{ message.email }}&gt;</span>
            </div>
            <h3 :class="['text-sm mb-1 truncate', message.isRead ? 'text-gray-400' : 'text-white font-medium']">
              {{ message.subject }}
            </h3>
            <p class="text-gray-500 text-sm truncate">{{ message.message }}</p>
          </div>
          
          <!-- Meta -->
          <div class="flex flex-col items-end gap-2 shrink-0">
            <span class="text-xs text-gray-500">{{ formatDate(message.createdAt) }}</span>
            <div class="flex items-center gap-2">
              <span v-if="!message.isRead" class="w-2 h-2 bg-primary-500 rounded-full"></span>
              <button
                @click.stop="toggleArchive(message)"
                class="p-1 text-gray-600 hover:text-gray-400 transition-colors"
                :title="message.isArchived ? 'Unarchive' : 'Archive'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-6">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-3 py-1 bg-dark-200 text-gray-400 rounded hover:bg-dark-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span class="px-3 py-1 text-gray-400">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 bg-dark-200 text-gray-400 rounded hover:bg-dark-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-400 mb-2">No messages found</h3>
      <p class="text-gray-500">
        {{ activeFilter === 'all' ? 'Messages from the contact form will appear here' : `No ${activeFilter} messages` }}
      </p>
    </div>

    <!-- Message Detail Modal -->
    <Teleport to="body">
      <div 
        v-if="selectedMessage" 
        class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        @click.self="closeMessage"
      >
        <div class="bg-dark-200 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-4 border-b border-dark-100">
            <h2 class="text-lg font-semibold text-white">Message Details</h2>
            <button @click="closeMessage" class="p-1 text-gray-400 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Modal Content -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Sender Info -->
            <div class="mb-6">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-primary-600/20 rounded-full flex items-center justify-center">
                  <span class="text-primary-400 font-semibold text-lg">{{ selectedMessage.name?.charAt(0).toUpperCase() }}</span>
                </div>
                <div>
                  <h3 class="text-white font-medium">{{ selectedMessage.name }}</h3>
                  <a :href="`mailto:${selectedMessage.email}`" class="text-primary-400 hover:text-primary-300 text-sm">
                    {{ selectedMessage.email }}
                  </a>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">Received:</span>
                  <span class="text-gray-300 ml-2">{{ formatDateTime(selectedMessage.createdAt) }}</span>
                </div>
                <div v-if="selectedMessage.isRead">
                  <span class="text-gray-500">Read:</span>
                  <span class="text-gray-300 ml-2">{{ formatDateTime(selectedMessage.readAt) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Subject -->
            <div class="mb-4">
              <label class="text-gray-500 text-sm">Subject</label>
              <p class="text-white font-medium">{{ selectedMessage.subject }}</p>
            </div>
            
            <!-- Message -->
            <div class="mb-6">
              <label class="text-gray-500 text-sm">Message</label>
              <div class="mt-2 p-4 bg-dark-300 rounded-lg">
                <p class="text-gray-300 whitespace-pre-wrap">{{ selectedMessage.message }}</p>
              </div>
            </div>
            
            <!-- Notes -->
            <div>
              <label class="text-gray-500 text-sm mb-2 block">Internal Notes</label>
              <textarea
                v-model="messageNotes"
                rows="3"
                class="w-full px-3 py-2 bg-dark-300 border border-dark-100 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none resize-none"
                placeholder="Add notes about this message..."
              ></textarea>
              <button
                v-if="messageNotes !== (selectedMessage.notes || '')"
                @click="saveNotes"
                class="mt-2 btn btn-primary text-sm"
                :disabled="savingNotes"
              >
                {{ savingNotes ? 'Saving...' : 'Save Notes' }}
              </button>
            </div>
          </div>
          
          <!-- Modal Footer -->
          <div class="flex items-center justify-between p-4 border-t border-dark-100">
            <div class="flex gap-2">
              <button
                @click="toggleReadStatus"
                class="btn btn-secondary text-sm"
              >
                {{ selectedMessage.isRead ? 'Mark Unread' : 'Mark Read' }}
              </button>
              <button
                @click="toggleStar(selectedMessage)"
                :class="['btn text-sm', selectedMessage.isStarred ? 'btn-primary' : 'btn-secondary']"
              >
                {{ selectedMessage.isStarred ? 'Unstar' : 'Star' }}
              </button>
            </div>
            <div class="flex gap-2">
              <a
                :href="`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`"
                class="btn btn-primary text-sm"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Reply
              </a>
              <button
                @click="deleteMessage"
                class="btn bg-red-600 hover:bg-red-500 text-white text-sm"
                :disabled="deleting"
              >
                {{ deleting ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { messagesAPI } from '@/services/api'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

// State
const messages = ref([])
const loading = ref(true)
const searchQuery = ref('')
const activeFilter = ref('all')
const currentPage = ref(1)
const totalPages = ref(1)
const unreadCount = ref(0)
const selectedMessage = ref(null)
const messageNotes = ref('')
const savingNotes = ref(false)
const deleting = ref(false)
const markingAllRead = ref(false)

// Filter tabs
const filterTabs = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'Read', value: 'read' },
  { label: 'Starred', value: 'starred' },
  { label: 'Archived', value: 'archived' }
]

// Fetch messages
async function fetchMessages() {
  loading.value = true
  try {
    const response = await messagesAPI.getAll({
      page: currentPage.value,
      filter: activeFilter.value,
      search: searchQuery.value
    })
    messages.value = response.data.data
    totalPages.value = response.data.totalPages
    unreadCount.value = response.data.unreadCount
  } catch (error) {
    toast.error('Failed to load messages')
  } finally {
    loading.value = false
  }
}

// Debounced search
let searchTimeout
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchMessages()
  }, 300)
}

// Watch filter changes
watch(activeFilter, () => {
  currentPage.value = 1
  fetchMessages()
})

watch(currentPage, fetchMessages)

// Open message
async function openMessage(message) {
  try {
    const response = await messagesAPI.getById(message._id)
    selectedMessage.value = response.data.data
    messageNotes.value = selectedMessage.value.notes || ''
    
    // Update local state if message was unread
    if (!message.isRead) {
      message.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  } catch (error) {
    toast.error('Failed to load message')
  }
}

function closeMessage() {
  selectedMessage.value = null
  messageNotes.value = ''
}

// Toggle star
async function toggleStar(message) {
  try {
    await messagesAPI.toggleStar(message._id)
    message.isStarred = !message.isStarred
    if (selectedMessage.value?._id === message._id) {
      selectedMessage.value.isStarred = message.isStarred
    }
  } catch (error) {
    toast.error('Failed to update message')
  }
}

// Toggle archive
async function toggleArchive(message) {
  try {
    await messagesAPI.toggleArchive(message._id)
    message.isArchived = !message.isArchived
    // Remove from current list if it shouldn't be there anymore
    if ((activeFilter.value === 'archived' && !message.isArchived) ||
        (activeFilter.value !== 'archived' && message.isArchived)) {
      messages.value = messages.value.filter(m => m._id !== message._id)
    }
    toast.success(message.isArchived ? 'Message archived' : 'Message unarchived')
  } catch (error) {
    toast.error('Failed to update message')
  }
}

// Toggle read status
async function toggleReadStatus() {
  if (!selectedMessage.value) return
  try {
    await messagesAPI.toggleRead(selectedMessage.value._id)
    selectedMessage.value.isRead = !selectedMessage.value.isRead
    
    // Update in list
    const msg = messages.value.find(m => m._id === selectedMessage.value._id)
    if (msg) {
      msg.isRead = selectedMessage.value.isRead
    }
    
    // Update unread count
    if (selectedMessage.value.isRead) {
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } else {
      unreadCount.value++
    }
  } catch (error) {
    toast.error('Failed to update message')
  }
}

// Save notes
async function saveNotes() {
  if (!selectedMessage.value) return
  savingNotes.value = true
  try {
    await messagesAPI.updateNotes(selectedMessage.value._id, messageNotes.value)
    selectedMessage.value.notes = messageNotes.value
    toast.success('Notes saved')
  } catch (error) {
    toast.error('Failed to save notes')
  } finally {
    savingNotes.value = false
  }
}

// Delete message
async function deleteMessage() {
  if (!selectedMessage.value || !confirm('Are you sure you want to delete this message?')) return
  deleting.value = true
  try {
    await messagesAPI.delete(selectedMessage.value._id)
    messages.value = messages.value.filter(m => m._id !== selectedMessage.value._id)
    closeMessage()
    toast.success('Message deleted')
  } catch (error) {
    toast.error('Failed to delete message')
  } finally {
    deleting.value = false
  }
}

// Mark all as read
async function markAllRead() {
  markingAllRead.value = true
  try {
    await messagesAPI.markAllRead()
    messages.value.forEach(m => m.isRead = true)
    unreadCount.value = 0
    toast.success('All messages marked as read')
  } catch (error) {
    toast.error('Failed to mark messages as read')
  } finally {
    markingAllRead.value = false
  }
}

// Format date
function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  
  return d.toLocaleDateString()
}

function formatDateTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

onMounted(fetchMessages)
</script>

<style scoped>
.spinner {
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
