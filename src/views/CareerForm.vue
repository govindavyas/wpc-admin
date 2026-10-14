<template>
  <div class="career-form">
    <div class="page-header">
      <h1>{{ isEdit ? 'Edit Career Position' : 'Create Career Position' }}</h1>
      <button @click="goBack" class="btn-secondary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to List
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="form-container">
      <div class="form-section">
        <h2>Basic Information</h2>
        
        <div class="form-group">
          <label for="title">Job Title *</label>
          <input 
            id="title"
            v-model="form.title" 
            type="text" 
            required 
            placeholder="e.g., Senior Video Editor"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="department">Department *</label>
            <input 
              id="department"
              v-model="form.department" 
              type="text" 
              required 
              placeholder="e.g., Post-Production"
            />
          </div>

          <div class="form-group">
            <label for="location">Location *</label>
            <input 
              id="location"
              v-model="form.location" 
              type="text" 
              required 
              placeholder="e.g., Los Angeles, CA"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="jobType">Job Type *</label>
            <select id="jobType" v-model="form.jobType" required>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div class="form-group">
            <label for="salaryRange">Salary Range</label>
            <input 
              id="salaryRange"
              v-model="form.salaryRange" 
              type="text" 
              placeholder="e.g., $60,000 - $80,000 per year"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="displayOrder">Display Order</label>
            <input 
              id="displayOrder"
              v-model.number="form.displayOrder" 
              type="number" 
              min="0"
              placeholder="0"
            />
            <small>Lower numbers appear first</small>
          </div>

          <div class="form-group">
            <label for="applicationDeadline">Application Deadline</label>
            <input 
              id="applicationDeadline"
              v-model="form.applicationDeadline" 
              type="date"
            />
          </div>
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" v-model="form.isActive" />
            <span>Active (visible to public)</span>
          </label>
        </div>
      </div>

      <div class="form-section">
        <h2>Job Description</h2>
        
        <div class="form-group">
          <label for="description">Overview *</label>
          <textarea 
            id="description"
            v-model="form.description" 
            required 
            rows="5"
            placeholder="Provide a brief overview of the role and what makes it exciting..."
          ></textarea>
        </div>

        <div class="form-group">
          <label for="responsibilities">Key Responsibilities *</label>
          <textarea 
            id="responsibilities"
            v-model="form.responsibilities" 
            required 
            rows="8"
            placeholder="List the main responsibilities (one per line or use bullet points):&#10;- Manage post-production workflows&#10;- Edit video content for films&#10;- Collaborate with directors and producers"
          ></textarea>
          <small>Use bullet points with - or • for better formatting</small>
        </div>

        <div class="form-group">
          <label for="requirements">Requirements *</label>
          <textarea 
            id="requirements"
            v-model="form.requirements" 
            required 
            rows="8"
            placeholder="List the required qualifications and skills:&#10;- 5+ years of video editing experience&#10;- Proficiency in Adobe Premiere Pro and DaVinci Resolve&#10;- Strong understanding of storytelling and pacing"
          ></textarea>
          <small>Use bullet points with - or • for better formatting</small>
        </div>

        <div class="form-group">
          <label for="qualifications">Preferred Qualifications</label>
          <textarea 
            id="qualifications"
            v-model="form.qualifications" 
            rows="6"
            placeholder="List preferred (but not required) qualifications:&#10;- Bachelor's degree in Film or related field&#10;- Experience with color grading&#10;- Portfolio of feature film work"
          ></textarea>
          <small>Use bullet points with - or • for better formatting</small>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="goBack" class="btn-cancel">Cancel</button>
        <button type="submit" class="btn-submit" :disabled="submitting">
          {{ submitting ? 'Saving...' : (isEdit ? 'Update Position' : 'Create Position') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api';
import { useToastStore } from '../stores/toast';

const router = useRouter();
const route = useRoute();
const toast = useToastStore();

const careerId = computed(() => route.params.id);
const isEdit = computed(() => careerId.value && careerId.value !== 'new');

const submitting = ref(false);
const form = ref({
  title: '',
  department: '',
  location: '',
  jobType: 'Full-time',
  description: '',
  requirements: '',
  responsibilities: '',
  qualifications: '',
  salaryRange: '',
  isActive: true,
  applicationDeadline: '',
  displayOrder: 0
});

onMounted(async () => {
  if (isEdit.value) {
    await fetchCareer();
  }
});

const fetchCareer = async () => {
  try {
    const response = await api.get(`/careers/${careerId.value}`);
    const career = response.data;
    
    // Format date for input
    if (career.applicationDeadline) {
      career.applicationDeadline = new Date(career.applicationDeadline).toISOString().split('T')[0];
    }
    
    form.value = career;
  } catch (error) {
    console.error('Error fetching career:', error);
    toast.error('Failed to load career position');
    goBack();
  }
};

const handleSubmit = async () => {
  try {
    submitting.value = true;
    
    // Prepare data
    const data = { ...form.value };
    
    // Convert empty strings to null
    if (!data.salaryRange) data.salaryRange = null;
    if (!data.qualifications) data.qualifications = null;
    if (!data.applicationDeadline) data.applicationDeadline = null;

    if (isEdit.value) {
      await api.put(`/careers/${careerId.value}`, data);
      toast.success('Career position updated successfully');
    } else {
      await api.post('/careers', data);
      toast.success('Career position created successfully');
    }
    
    goBack();
  } catch (error) {
    console.error('Error saving career:', error);
    toast.error('Failed to save career position');
  } finally {
    submitting.value = false;
  }
};

const goBack = () => {
  router.push('/careers');
};
</script>

<style scoped>
.career-form {
  @apply p-6 max-w-5xl;
}

.page-header {
  @apply flex justify-between items-center mb-8;
}

.page-header h1 {
  @apply text-2xl font-bold text-white;
}

.btn-secondary {
  @apply flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors;
}

.btn-secondary svg {
  @apply w-5 h-5;
}

.form-container {
  @apply bg-dark-100 rounded-xl border border-gray-800 overflow-hidden;
}

.form-section {
  @apply p-6 border-b border-gray-800;
}

.form-section:last-of-type {
  @apply border-b-0;
}

.form-section h2 {
  @apply text-xl font-semibold text-white mb-6;
}

.form-row {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.form-group {
  @apply mb-6;
}

.form-group label {
  @apply block font-semibold text-gray-300 mb-2 text-sm;
}

.form-group input,
.form-group select,
.form-group textarea {
  @apply w-full px-4 py-3 bg-dark-200 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors;
}

.form-group textarea {
  @apply resize-y font-sans;
}

.form-group small {
  @apply block mt-2 text-gray-500 text-sm;
}

.checkbox-group label {
  @apply flex items-center gap-3 cursor-pointer font-medium text-gray-300;
}

.checkbox-group input[type="checkbox"] {
  @apply w-5 h-5 cursor-pointer accent-primary-500;
}

.form-actions {
  @apply flex justify-end gap-4 p-6 bg-dark-200;
}

.btn-cancel,
.btn-submit {
  @apply px-8 py-3 rounded-lg font-semibold cursor-pointer transition-all text-base;
}

.btn-cancel {
  @apply bg-gray-700 hover:bg-gray-600 text-white;
}

.btn-submit {
  @apply bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed;
}

@media (max-width: 768px) {
  .career-form {
    @apply p-4;
  }

  .page-header {
    @apply flex-col items-start gap-4;
  }

  .form-section {
    @apply p-4;
  }

  .form-actions {
    @apply flex-col-reverse;
  }

  .btn-cancel,
  .btn-submit {
    @apply w-full;
  }
}
</style>
