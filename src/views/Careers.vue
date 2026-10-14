<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Career Positions</h1>
        <p class="text-gray-400 mt-1">Manage job openings</p>
      </div>
      <button @click="createNew" class="btn btn-primary">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Position
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="careers.length === 0" class="card text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <h3 class="text-lg font-medium text-white mb-2">No career positions yet</h3>
      <p class="text-gray-400 mb-4">Get started by adding your first position.</p>
      <button @click="createNew" class="btn btn-primary">Add Position</button>
    </div>

    <!-- Careers Table (Desktop) -->
    <div v-else class="hidden lg:block table-container">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Title</th>
            <th>Department</th>
            <th>Location</th>
            <th>Type</th>
            <th>Status</th>
            <th>Deadline</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="career in careers" :key="career._id">
            <td>
              <input 
                type="number" 
                v-model.number="career.displayOrder" 
                @change="updateOrder(career)"
                class="w-16 px-2 py-1 bg-dark-200 border border-gray-700 rounded text-center text-white text-sm"
              />
            </td>
            <td>
              <p class="font-medium text-white">{{ career.title }}</p>
            </td>
            <td class="text-gray-400">{{ career.department }}</td>
            <td class="text-gray-400">{{ career.location }}</td>
            <td>
              <span class="badge badge-blue">{{ career.jobType }}</span>
            </td>
            <td>
              <span :class="['badge', career.isActive ? 'badge-green' : 'badge-gray']">
                {{ career.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="text-gray-400">
              {{ career.applicationDeadline ? formatDate(career.applicationDeadline) : 'No deadline' }}
            </td>
            <td class="text-right">
              <div class="flex items-center justify-end gap-2">
                <router-link
                  :to="`/job-applications?careerId=${career._id}`"
                  class="p-2 text-gray-400 hover:text-primary-400 hover:bg-gray-700 rounded-lg transition-colors"
                  title="View Applications"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </router-link>
                <button
                  @click="editCareer(career)"
                  class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="Edit"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="deleteCareer(career)"
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

    <!-- Careers Cards (Mobile/Tablet) -->
    <div v-if="!loading && careers.length > 0" class="lg:hidden space-y-4">
      <div
        v-for="career in careers"
        :key="career._id"
        class="card"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-white">{{ career.title }}</h3>
            <p class="text-sm text-gray-400 mt-1">{{ career.department }} · {{ career.location }}</p>
            <div class="flex flex-wrap items-center gap-2 mt-3">
              <span class="badge badge-blue text-xs">{{ career.jobType }}</span>
              <span :class="['badge text-xs', career.isActive ? 'badge-green' : 'badge-gray']">
                {{ career.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <label class="text-xs text-gray-500">Order:</label>
            <input 
              type="number" 
              v-model.number="career.displayOrder" 
              @change="updateOrder(career)"
              class="w-14 px-2 py-1 bg-dark-200 border border-gray-700 rounded text-center text-white text-sm"
            />
          </div>
        </div>
        <div v-if="career.applicationDeadline" class="text-xs text-gray-500 mt-3">
          Deadline: {{ formatDate(career.applicationDeadline) }}
        </div>
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
          <router-link
            :to="`/job-applications?careerId=${career._id}`"
            class="text-sm text-primary-400 hover:text-primary-300 font-medium"
          >
            View Applications
          </router-link>
          <div class="flex items-center gap-2">
            <button
              @click="editCareer(career)"
              class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Edit"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="deleteCareer(career)"
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

    <!-- Delete Modal -->
    <Teleport to="body">
      <div v-if="deleteModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-100 rounded-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-white mb-2">Delete Position</h3>
          <p class="text-gray-400 mb-6">Are you sure you want to delete "{{ careerToDelete?.title }}"? This action cannot be undone.</p>
          <div class="flex gap-3 justify-end">
            <button @click="deleteModal = false" class="btn btn-secondary">Cancel</button>
            <button @click="confirmDeleteCareer" class="btn btn-danger" :disabled="deleting">
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useToastStore } from '../stores/toast';

const router = useRouter();
const toast = useToastStore();
const careers = ref([]);
const loading = ref(true);

const deleteModal = ref(false);
const careerToDelete = ref(null);
const deleting = ref(false);

onMounted(() => {
  fetchCareers();
});

const fetchCareers = async () => {
  loading.value = true;
  try {
    const response = await api.get('/careers');
    careers.value = response.data;
  } catch (error) {
    console.error('Error fetching careers:', error);
    toast.error('Failed to load career positions');
  } finally {
    loading.value = false;
  }
};

const createNew = () => {
  router.push('/careers/new');
};

const editCareer = (career) => {
  router.push(`/careers/${career._id}`);
};

const updateOrder = async (career) => {
  try {
    await api.put(`/careers/${career._id}/order`, {
      displayOrder: career.displayOrder
    });
    toast.success('Display order updated');
  } catch (error) {
    console.error('Error updating order:', error);
    toast.error('Failed to update display order');
    fetchCareers();
  }
};

const deleteCareer = (career) => {
  careerToDelete.value = career;
  deleteModal.value = true;
};

const confirmDeleteCareer = async () => {
  if (!careerToDelete.value) return;
  
  deleting.value = true;
  try {
    await api.delete(`/careers/${careerToDelete.value._id}`);
    toast.success('Career position deleted');
    deleteModal.value = false;
    fetchCareers();
  } catch (error) {
    console.error('Error deleting career:', error);
    toast.error('Failed to delete career position');
  } finally {
    deleting.value = false;
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>
