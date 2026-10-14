<template>
  <div class="job-applications">
    <div class="page-header">
      <div>
        <h1>Job Applications</h1>
        <p class="subtitle">Manage and review candidate applications</p>
      </div>
      <div class="filters">
        <select v-model="filterCareer" @change="fetchApplications" class="filter-select">
          <option value="">All Positions</option>
          <option v-for="career in careers" :key="career._id" :value="career._id">
            {{ career.title }}
          </option>
        </select>
        <select v-model="filterStatus" @change="fetchApplications" class="filter-select">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
          <option value="hired">Hired</option>
        </select>
      </div>
    </div>

    <!-- Statistics -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon pending">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <div class="stat-label">Pending Review</div>
          <div class="stat-value">{{ stats.pending }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon reviewing">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <div class="stat-label">Under Review</div>
          <div class="stat-value">{{ stats.reviewing }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon shortlisted">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
        <div>
          <div class="stat-label">Shortlisted</div>
          <div class="stat-value">{{ stats.shortlisted }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon total">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <div>
          <div class="stat-label">Total Applications</div>
          <div class="stat-value">{{ applications.length }}</div>
        </div>
      </div>
    </div>

    <!-- Applications List -->
    <div class="applications-list">
      <div v-if="loading" class="loading">Loading applications...</div>
      
      <div v-else-if="applications.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
        <p>No applications found</p>
      </div>

      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Position</th>
              <th>Applied On</th>
              <th>Status</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="application in applications" :key="application._id">
              <td>
                <div class="applicant-info">
                  <div class="applicant-avatar">
                    {{ getInitials(application.firstName, application.lastName) }}
                  </div>
                  <div>
                    <div class="applicant-name">
                      {{ application.firstName }} {{ application.lastName }}
                    </div>
                    <div class="applicant-email">{{ application.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div v-if="application.career">
                  <strong>{{ application.career.title }}</strong>
                  <div class="position-meta">{{ application.career.department }}</div>
                </div>
                <span v-else class="text-muted">General Application</span>
              </td>
              <td>{{ formatDate(application.createdAt) }}</td>
              <td>
                <select 
                  v-model="application.status" 
                  @change="updateStatus(application)"
                  :class="['status-select', application.status]"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired</option>
                </select>
              </td>
              <td>
                <div class="contact-info">
                  <a :href="`tel:${application.phone}`" class="contact-link">
                    {{ application.phone }}
                  </a>
                  <a v-if="application.linkedinUrl" :href="application.linkedinUrl" target="_blank" class="social-link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                    </svg>
                  </a>
                </div>
              </td>
              <td>
                <div class="actions">
                  <button @click="viewApplication(application)" class="btn-icon" title="View Details">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <a :href="getResumeUrl(application.resumeUrl)" target="_blank" class="btn-icon" title="View Resume">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </a>
                  <button @click="deleteApplication(application)" class="btn-icon btn-danger" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Application Detail Modal -->
    <div v-if="selectedApplication" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button @click="closeModal" class="modal-close">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="modal-header">
          <div class="applicant-header">
            <div class="applicant-avatar large">
              {{ getInitials(selectedApplication.firstName, selectedApplication.lastName) }}
            </div>
            <div>
              <h2>{{ selectedApplication.firstName }} {{ selectedApplication.lastName }}</h2>
              <p class="position-applied">
                Applied for: 
                <strong v-if="selectedApplication.career">{{ selectedApplication.career.title }}</strong>
                <strong v-else>General Position</strong>
              </p>
            </div>
          </div>
        </div>

        <div class="modal-body">
          <div class="detail-section">
            <h3>Contact Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Email</label>
                <a :href="`mailto:${selectedApplication.email}`">{{ selectedApplication.email }}</a>
              </div>
              <div class="detail-item">
                <label>Phone</label>
                <a :href="`tel:${selectedApplication.phone}`">{{ selectedApplication.phone }}</a>
              </div>
              <div v-if="selectedApplication.linkedinUrl" class="detail-item">
                <label>LinkedIn</label>
                <a :href="selectedApplication.linkedinUrl" target="_blank">View Profile</a>
              </div>
              <div v-if="selectedApplication.portfolioUrl" class="detail-item">
                <label>Portfolio</label>
                <a :href="selectedApplication.portfolioUrl" target="_blank">View Portfolio</a>
              </div>
            </div>
          </div>

          <div v-if="selectedApplication.coverLetter" class="detail-section">
            <h3>Cover Letter</h3>
            <p class="cover-letter">{{ selectedApplication.coverLetter }}</p>
          </div>

          <div class="detail-section">
            <h3>Resume</h3>
            <a :href="getResumeUrl(selectedApplication.resumeUrl)" target="_blank" class="btn-download">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download Resume
            </a>
          </div>

          <div class="detail-section">
            <h3>Application Status</h3>
            <select 
              v-model="selectedApplication.status" 
              @change="updateStatus(selectedApplication)"
              class="status-select-large"
              :class="selectedApplication.status"
            >
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
          </div>

          <div class="detail-section">
            <h3>Notes</h3>
            <textarea 
              v-model="selectedApplication.notes" 
              rows="4" 
              placeholder="Add notes about this applicant..."
              class="notes-textarea"
            ></textarea>
            <button @click="saveNotes" class="btn-save-notes">Save Notes</button>
          </div>

          <div class="detail-section">
            <div class="detail-item">
              <label>Applied On</label>
              <div>{{ formatDate(selectedApplication.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';
import { useToastStore } from '../stores/toast';

const route = useRoute();
const toast = useToastStore();

const applications = ref([]);
const careers = ref([]);
const loading = ref(false);
const selectedApplication = ref(null);
const filterCareer = ref(route.query.careerId || '');
const filterStatus = ref('');

const stats = computed(() => {
  return {
    pending: applications.value.filter(a => a.status === 'pending').length,
    reviewing: applications.value.filter(a => a.status === 'reviewing').length,
    shortlisted: applications.value.filter(a => a.status === 'shortlisted').length,
  };
});

onMounted(async () => {
  await Promise.all([fetchCareers(), fetchApplications()]);
});

const fetchCareers = async () => {
  try {
    const response = await api.get('/careers');
    careers.value = response.data;
  } catch (error) {
    console.error('Error fetching careers:', error);
  }
};

const fetchApplications = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filterCareer.value) params.careerId = filterCareer.value;
    if (filterStatus.value) params.status = filterStatus.value;
    
    const response = await api.get('/job-applications', { params });
    applications.value = response.data;
  } catch (error) {
    console.error('Error fetching applications:', error);
    toast.error('Failed to load applications');
  } finally {
    loading.value = false;
  }
};

const viewApplication = (application) => {
  selectedApplication.value = { ...application };
};

const closeModal = () => {
  selectedApplication.value = null;
};

const updateStatus = async (application) => {
  try {
    await api.put(`/job-applications/${application._id}/status`, {
      status: application.status
    });
    toast.success('Status updated successfully');
    fetchApplications();
  } catch (error) {
    console.error('Error updating status:', error);
    toast.error('Failed to update status');
  }
};

const saveNotes = async () => {
  try {
    await api.put(`/job-applications/${selectedApplication.value._id}/status`, {
      status: selectedApplication.value.status,
      notes: selectedApplication.value.notes
    });
    toast.success('Notes saved successfully');
    fetchApplications();
  } catch (error) {
    console.error('Error saving notes:', error);
    toast.error('Failed to save notes');
  }
};

const deleteApplication = async (application) => {
  if (!confirm(`Are you sure you want to delete the application from ${application.firstName} ${application.lastName}?`)) {
    return;
  }

  try {
    await api.delete(`/job-applications/${application._id}`);
    toast.success('Application deleted successfully');
    fetchApplications();
  } catch (error) {
    console.error('Error deleting application:', error);
    toast.error('Failed to delete application');
  }
};

const getInitials = (firstName, lastName) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getResumeUrl = (url) => {
  return `${import.meta.env.VITE_API_URL}${url}`;
};
</script>

<style scoped>
.job-applications {
  @apply p-6;
}

.page-header {
  @apply flex justify-between items-start mb-8;
}

.page-header h1 {
  @apply text-2xl font-bold text-white mb-1;
}

.subtitle {
  @apply text-gray-400 text-sm;
}

.filters {
  @apply flex gap-4;
}

.filter-select {
  @apply px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg text-white cursor-pointer focus:border-primary-500;
}

/* Stats Grid */
.stats-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8;
}

.stat-card {
  @apply bg-dark-100 rounded-xl p-5 border border-gray-800 flex items-center gap-4;
}

.stat-icon {
  @apply w-12 h-12 rounded-xl flex items-center justify-center;
}

.stat-icon svg {
  @apply w-6 h-6 text-white;
}

.stat-icon.pending {
  @apply bg-gradient-to-br from-amber-500 to-amber-600;
}

.stat-icon.reviewing {
  @apply bg-gradient-to-br from-blue-500 to-blue-600;
}

.stat-icon.shortlisted {
  @apply bg-gradient-to-br from-green-500 to-green-600;
}

.stat-icon.total {
  @apply bg-gradient-to-br from-purple-500 to-purple-600;
}

.stat-label {
  @apply text-sm text-gray-400 mb-1;
}

.stat-value {
  @apply text-3xl font-bold text-white;
}

/* Applications List */
.applications-list {
  @apply bg-dark-100 rounded-xl border border-gray-800;
}

.loading {
  @apply text-center py-12 text-gray-400;
}

.empty-state {
  @apply text-center py-16 px-8 text-gray-400;
}

.empty-state svg {
  @apply w-16 h-16 mx-auto mb-4 opacity-50;
}

.table-container {
  @apply overflow-x-auto;
}

table {
  @apply w-full;
}

thead {
  @apply bg-dark-200;
}

th {
  @apply px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-700;
}

td {
  @apply px-4 py-4 text-sm text-gray-300 border-b border-gray-800;
}

tr:hover td {
  @apply bg-dark-200/50;
}

.applicant-info {
  @apply flex items-center gap-3;
}

.applicant-avatar {
  @apply w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center font-bold text-sm;
}

.applicant-avatar.large {
  @apply w-16 h-16 text-2xl;
}

.applicant-name {
  @apply font-semibold text-white;
}

.applicant-email {
  @apply text-sm text-gray-400;
}

.position-meta {
  @apply text-sm text-gray-400 mt-1;
}

.text-muted {
  @apply text-gray-500 italic;
}

.status-select {
  @apply px-3 py-1.5 border rounded-lg text-sm font-medium cursor-pointer bg-dark-200;
}

.status-select.pending {
  @apply bg-amber-900/30 text-amber-400 border-amber-700;
}

.status-select.reviewing {
  @apply bg-blue-900/30 text-blue-400 border-blue-700;
}

.status-select.shortlisted {
  @apply bg-green-900/30 text-green-400 border-green-700;
}

.status-select.rejected {
  @apply bg-red-900/30 text-red-400 border-red-700;
}

.status-select.hired {
  @apply bg-purple-900/30 text-purple-400 border-purple-700;
}

.contact-info {
  @apply flex flex-col gap-1;
}

.contact-link {
  @apply text-primary-400 hover:text-primary-300 text-sm transition-colors;
}

.social-link {
  @apply text-blue-400 inline-flex items-center;
}

.actions {
  @apply flex gap-2;
}

.btn-icon {
  @apply flex items-center justify-center w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors no-underline;
}

.btn-icon svg {
  @apply w-4 h-4 text-gray-300;
}

.btn-danger:hover {
  @apply bg-red-900/50;
}

.btn-danger:hover svg {
  @apply text-red-400;
}

/* Modal */
.modal-overlay {
  @apply fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-dark-100 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-800;
}

.modal-close {
  @apply absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer transition-colors z-10;
}

.modal-close svg {
  @apply w-5 h-5 text-gray-300;
}

.modal-header {
  @apply p-6 border-b border-gray-800;
}

.applicant-header {
  @apply flex items-center gap-4;
}

.applicant-header h2 {
  @apply text-2xl font-bold text-white mb-2;
}

.position-applied {
  @apply text-gray-400;
}

.modal-body {
  @apply p-6;
}

.detail-section {
  @apply mb-8;
}

.detail-section h3 {
  @apply text-lg font-semibold text-white mb-4;
}

.detail-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-6;
}

.detail-item label {
  @apply block text-sm text-gray-400 mb-1 font-semibold;
}

.detail-item {
  @apply text-white;
}

.detail-item a {
  @apply text-primary-400 hover:text-primary-300 transition-colors;
}

.cover-letter {
  @apply text-gray-300 leading-relaxed whitespace-pre-wrap bg-dark-200 p-4 rounded-lg;
}

.btn-download {
  @apply inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors no-underline;
}

.btn-download svg {
  @apply w-5 h-5;
}

.status-select-large {
  @apply w-full px-4 py-3 bg-dark-200 border-2 border-gray-700 rounded-lg text-white font-semibold cursor-pointer focus:border-primary-500;
}

.notes-textarea {
  @apply w-full px-4 py-3 bg-dark-200 border border-gray-700 rounded-lg text-white font-sans resize-y mb-4 focus:border-primary-500;
}

.btn-save-notes {
  @apply px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold cursor-pointer transition-colors;
}

@media (max-width: 768px) {
  .job-applications {
    @apply p-4;
  }

  .page-header {
    @apply flex-col gap-4;
  }

  .filters {
    @apply flex-col w-full;
  }

  .filter-select {
    @apply w-full;
  }

  .detail-grid {
    @apply grid-cols-1;
  }
}
</style>
