<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Our Teams</h1>
        <p class="text-gray-400 mt-1">Manage team member profiles</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Role Filter -->
        <select v-model="roleFilter" class="bg-dark-200 border border-dark-100 rounded-lg text-sm text-gray-300 px-3 py-2">
          <option value="">All Roles</option>
          <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
        </select>
        <router-link to="/team/new" class="btn btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Team Member
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredMembers.length === 0" class="card text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h3 class="text-lg font-medium text-white mb-2">
        {{ roleFilter ? `No ${roleFilter}s found` : 'No team members yet' }}
      </h3>
      <p class="text-gray-400 mb-4">
        {{ roleFilter ? 'Try selecting a different role.' : 'Get started by adding your first team member.' }}
      </p>
      <router-link to="/team/new" class="btn btn-primary">Add Team Member</router-link>
    </div>

    <!-- Team Members Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="member in filteredMembers"
        :key="member._id"
        class="card hover:border-gray-700 transition-colors"
      >
        <div class="flex items-start gap-4">
          <div class="w-16 h-16 rounded-lg bg-dark-200 overflow-hidden flex-shrink-0">
            <img v-if="member.photoUrl" :src="getApiUrl(member.thumbnailUrl || member.photoUrl)" :alt="member.name" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-600">
              {{ member.name?.charAt(0) }}
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-white truncate">{{ member.name }}</h3>
            <p class="text-sm text-gray-400 truncate">{{ member.displayRole || member.role }}</p>
            <p v-if="member.company" class="text-xs text-gray-500 mt-1 truncate">{{ member.company }}</p>
          </div>
          <div class="flex items-center gap-1">
            <router-link
              :to="`/team/${member._id}`"
              class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Edit"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </router-link>
            <button
              @click="confirmDelete(member)"
              class="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Delete"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <p v-if="member.bio" class="text-sm text-gray-400 mt-4 line-clamp-3">{{ member.bio }}</p>
        <div class="flex items-center gap-3 mt-4 pt-4 border-t border-dark-100">
          <span class="text-xs px-2 py-1 rounded-full bg-primary-600/20 text-primary-400">
            {{ member.role === 'Other' && member.customRole ? member.customRole : member.role }}
          </span>
          <span v-if="member.showOnHomepage" class="text-xs text-amber-400">Featured</span>
          <span :class="['text-xs ml-auto', member.isActive ? 'text-green-400' : 'text-gray-500']">
            {{ member.isActive ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <Teleport to="body">
      <div v-if="deleteModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-100 rounded-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-white mb-2">Delete Team Member</h3>
          <p class="text-gray-400 mb-6">Are you sure you want to delete "{{ memberToDelete?.name }}"? This action cannot be undone.</p>
          <div class="flex gap-3 justify-end">
            <button @click="deleteModal = false" class="btn btn-secondary">Cancel</button>
            <button @click="deleteMember" class="btn btn-danger" :disabled="deleting">
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
import { ref, computed, onMounted } from 'vue'
import { teamAPI } from '@/services/api'
import { useToastStore } from '@/stores/toast'
import { getApiUrl } from '@/utils/imageUrl'

const toast = useToastStore()

const teamMembers = ref([])
const loading = ref(true)
const roleFilter = ref('')

const roleOptions = [
  'Producer',
  'Executive Producer',
  'Co-Producer',
  'Associate Producer',
  'Line Producer',
  'Director',
  'Writer',
  'Actor',
  'Editor',
  'Cinematographer',
  'Music Director',
  'Sound Designer',
  'Art Director',
  'Costume Designer',
  'VFX Supervisor',
  'Other'
]

const deleteModal = ref(false)
const memberToDelete = ref(null)
const deleting = ref(false)

const filteredMembers = computed(() => {
  if (!roleFilter.value) return teamMembers.value
  return teamMembers.value.filter(m => m.role === roleFilter.value)
})

async function fetchTeamMembers() {
  loading.value = true
  try {
    const response = await teamAPI.getAll()
    teamMembers.value = response.data.data
  } catch (error) {
    toast.error('Failed to fetch team members')
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchTeamMembers)

function confirmDelete(member) {
  memberToDelete.value = member
  deleteModal.value = true
}

async function deleteMember() {
  if (!memberToDelete.value) return
  
  deleting.value = true
  try {
    await teamAPI.delete(memberToDelete.value._id)
    toast.success('Team member deleted successfully')
    deleteModal.value = false
    fetchTeamMembers()
  } catch (error) {
    toast.error('Failed to delete team member')
  } finally {
    deleting.value = false
  }
}
</script>
