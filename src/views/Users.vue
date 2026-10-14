<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Users</h1>
        <p class="text-gray-400 mt-1">Manage admin users</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add User
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="users.length === 0" class="card text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <h3 class="text-lg font-medium text-white mb-2">No users yet</h3>
      <p class="text-gray-400 mb-4">Get started by adding your first user.</p>
      <button @click="openCreateModal" class="btn btn-primary">Add User</button>
    </div>

    <!-- Users Table (Desktop) -->
    <div v-else class="hidden md:block table-container">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Last Login</th>
            <th>Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user._id">
            <td>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                  {{ user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="font-medium text-white">{{ user.name || 'No name' }}</p>
                  <p class="text-sm text-gray-400">{{ user.email }}</p>
                </div>
              </div>
            </td>
            <td>
              <span :class="['badge', user.role === 'admin' ? 'badge-blue' : 'badge-gray']">
                {{ user.role }}
              </span>
            </td>
            <td class="text-gray-400">{{ formatDate(user.lastLogin) }}</td>
            <td>
              <span :class="['badge', user.isActive ? 'badge-green' : 'badge-gray']">
                {{ user.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="text-right">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="openEditModal(user)"
                  class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="Edit"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="confirmDelete(user)"
                  class="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Delete"
                  :disabled="user._id === currentUser?._id"
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

    <!-- Users Cards (Mobile) -->
    <div v-if="!loading && users.length > 0" class="md:hidden space-y-4">
      <div
        v-for="user in users"
        :key="user._id"
        class="card"
      >
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium text-lg flex-shrink-0">
            {{ user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-white">{{ user.name || 'No name' }}</h3>
            <p class="text-sm text-gray-400 truncate">{{ user.email }}</p>
            <div class="flex items-center gap-2 mt-2">
              <span :class="['badge text-xs', user.role === 'admin' ? 'badge-blue' : 'badge-gray']">
                {{ user.role }}
              </span>
              <span :class="['badge text-xs', user.isActive ? 'badge-green' : 'badge-gray']">
                {{ user.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
          <div class="text-xs text-gray-500">
            Last login: {{ formatDate(user.lastLogin) }}
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="openEditModal(user)"
              class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Edit"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="confirmDelete(user)"
              class="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Delete"
              :disabled="user._id === currentUser?._id"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- User Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-100 rounded-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-white mb-4">
            {{ editingUser ? 'Edit User' : 'Add User' }}
          </h3>
          <form @submit.prevent="saveUser" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input v-model="userForm.name" type="text" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Email *</label>
              <input v-model="userForm.email" type="email" required />
            </div>
            <div v-if="!editingUser">
              <label class="block text-sm font-medium text-gray-300 mb-1">Password *</label>
              <input v-model="userForm.password" type="password" required minlength="6" />
            </div>
            <div v-else>
              <label class="block text-sm font-medium text-gray-300 mb-1">New Password (leave blank to keep current)</label>
              <input v-model="userForm.password" type="password" minlength="6" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Role</label>
              <select v-model="userForm.role">
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="userForm.isActive" type="checkbox" class="w-4 h-4 rounded bg-dark-200 border-dark-100" />
              <span class="text-gray-300">Active</span>
            </label>
            <div class="flex gap-3 justify-end pt-4">
              <button type="button" @click="showModal = false" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="savingUser">
                <span v-if="savingUser" class="spinner"></span>
                <span v-else>{{ editingUser ? 'Update' : 'Create' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <div v-if="deleteModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-100 rounded-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-white mb-2">Delete User</h3>
          <p class="text-gray-400 mb-6">Are you sure you want to delete "{{ userToDelete?.email }}"? This action cannot be undone.</p>
          <div class="flex gap-3 justify-end">
            <button @click="deleteModal = false" class="btn btn-secondary">Cancel</button>
            <button @click="deleteUser" class="btn btn-danger" :disabled="deleting">
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
import { ref, onMounted, computed } from 'vue'
import { usersAPI } from '@/services/api'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'

const toast = useToastStore()
const authStore = useAuthStore()

const currentUser = computed(() => authStore.user)

const users = ref([])
const loading = ref(true)

const showModal = ref(false)
const editingUser = ref(null)
const savingUser = ref(false)

const deleteModal = ref(false)
const userToDelete = ref(null)
const deleting = ref(false)

const defaultUserForm = () => ({
  name: '',
  email: '',
  password: '',
  role: 'editor',
  isActive: true
})

const userForm = ref(defaultUserForm())

async function fetchUsers() {
  loading.value = true
  try {
    const response = await usersAPI.getAll()
    users.value = response.data.data
  } catch (error) {
    toast.error('Failed to fetch users')
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchUsers)

function formatDate(date) {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function openCreateModal() {
  editingUser.value = null
  userForm.value = defaultUserForm()
  showModal.value = true
}

function openEditModal(user) {
  editingUser.value = user
  userForm.value = {
    name: user.name || '',
    email: user.email,
    password: '',
    role: user.role,
    isActive: user.isActive
  }
  showModal.value = true
}

async function saveUser() {
  savingUser.value = true
  try {
    const data = { ...userForm.value }
    if (!data.password) {
      delete data.password
    }

    if (editingUser.value) {
      await usersAPI.update(editingUser.value._id, data)
      toast.success('User updated successfully')
    } else {
      await usersAPI.create(data)
      toast.success('User created successfully')
    }
    showModal.value = false
    fetchUsers()
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to save user'
    toast.error(message)
  } finally {
    savingUser.value = false
  }
}

function confirmDelete(user) {
  userToDelete.value = user
  deleteModal.value = true
}

async function deleteUser() {
  if (!userToDelete.value) return
  
  deleting.value = true
  try {
    await usersAPI.delete(userToDelete.value._id)
    toast.success('User deleted successfully')
    deleteModal.value = false
    fetchUsers()
  } catch (error) {
    toast.error('Failed to delete user')
  } finally {
    deleting.value = false
  }
}
</script>
