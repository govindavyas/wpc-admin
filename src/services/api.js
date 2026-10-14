import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add auth token from localStorage directly
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    console.log('API Request:', config.method?.toUpperCase(), config.url, 'Token:', token ? 'Present' : 'Missing')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status, response.data?.success)
    return response
  },
  async (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.message)
    if (error.response?.status === 401) {
      // Clear auth data and redirect
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API methods
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/updateprofile', data),
  changePassword: (data) => api.put('/auth/updatepassword', data),
  updatePassword: (data) => api.put('/auth/updatepassword', data)
}

export const usersAPI = {
  getAll: () => api.get('/auth/users'),
  create: (data) => api.post('/auth/register', data),
  update: (id, data) => api.put(`/auth/users/${id}`, data),
  delete: (id) => api.delete(`/auth/users/${id}`)
}

export const companyAPI = {
  get: () => api.get('/company'),
  update: (data) => api.put('/company', data),
  updateAbout: (data) => api.put('/company/about', data),
  updateContact: (data) => api.put('/company/contact', data),
  updateSocial: (data) => api.put('/company/social', data)
}

export const moviesAPI = {
  getAll: (params) => api.get('/movies/admin', { params }),
  getById: (id) => api.get(`/movies/${id}`),
  getOne: (id) => api.get(`/movies/${id}`),
  create: (data) => api.post('/movies', data),
  update: (id, data) => api.put(`/movies/${id}`, data),
  delete: (id) => api.delete(`/movies/${id}`),
  toggle: (id) => api.put(`/movies/${id}/toggle`),
  setHighlight: (id) => api.put(`/movies/${id}/highlight`),
  addGalleryImage: (id, data) => api.post(`/movies/${id}/gallery`, data),
  removeGalleryImage: (id, galleryId) => api.delete(`/movies/${id}/gallery/${galleryId}`)
}

export const newsAPI = {
  getAll: (params) => api.get('/news/admin', { params }),
  getById: (id) => api.get(`/news/${id}`),
  getOne: (id) => api.get(`/news/${id}`),
  create: (data) => api.post('/news', data),
  update: (id, data) => api.put(`/news/${id}`, data),
  delete: (id) => api.delete(`/news/${id}`),
  toggle: (id) => api.put(`/news/${id}/toggle`),
  toggleDashboard: (id) => api.put(`/news/${id}/dashboard`),
  getCategories: () => api.get('/news/categories')
}

// Team Member API
export const teamAPI = {
  getAll: (params) => api.get('/team/admin', { params }),
  getById: (id) => api.get(`/team/${id}`),
  getRoles: () => api.get('/team/roles'),
  getByRole: (role) => api.get(`/team/by-role/${encodeURIComponent(role)}`),
  create: (data) => api.post('/team', data),
  update: (id, data) => api.put(`/team/${id}`, data),
  delete: (id) => api.delete(`/team/${id}`),
  reorder: (orders) => api.put('/team/reorder', { orders })
}

export const licensingAPI = {
  get: () => api.get('/licensing'),
  update: (data) => api.put('/licensing', data),
  addDocument: (data) => api.post('/licensing/documents', data),
  updateDocument: (id, data) => api.put(`/licensing/documents/${id}`, data),
  deleteDocument: (id) => api.delete(`/licensing/documents/${id}`),
  addFeature: (data) => api.post('/licensing/features', data),
  deleteFeature: (id) => api.delete(`/licensing/features/${id}`)
}

export const marketingAPI = {
  get: () => api.get('/marketing'),
  update: (data) => api.put('/marketing', data),
  addPartner: (data) => api.post('/marketing/partners', data),
  updatePartner: (id, data) => api.put(`/marketing/partners/${id}`, data),
  deletePartner: (id) => api.delete(`/marketing/partners/${id}`),
  addTestimonial: (data) => api.post('/marketing/testimonials', data),
  updateTestimonial: (id, data) => api.put(`/marketing/testimonials/${id}`, data),
  deleteTestimonial: (id) => api.delete(`/marketing/testimonials/${id}`)
}

export const navigationAPI = {
  get: () => api.get('/navigation'),
  updateMain: (items) => api.put('/navigation/main', { items }),
  updateDropdown: (items) => api.put('/navigation/dropdown', { items }),
  addMainItem: (data) => api.post('/navigation/main/item', data),
  addDropdownItem: (data) => api.post('/navigation/dropdown/item', data),
  deleteMainItem: (id) => api.delete(`/navigation/main/${id}`),
  deleteDropdownItem: (id) => api.delete(`/navigation/dropdown/${id}`)
}

export const settingsAPI = {
  get: () => api.get('/settings/admin'),
  update: (data) => api.put('/settings', data),
  toggleMaintenance: (data) => api.put('/settings/maintenance', data),
  updateSplash: (data) => api.put('/settings/splash', data),
  updateSeo: (data) => api.put('/settings/seo', data),
  updateAnalytics: (data) => api.put('/settings/analytics', data)
}

export const uploadAPI = {
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadImages: (formData) => api.post('/upload/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadVideo: (formData, onUploadProgress) => api.post('/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  }),
  uploadPoster: (formData) => api.post('/upload/poster', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteFile: (url) => api.delete('/upload', { data: { url } }),
  listFiles: (category) => api.get(`/upload/list/${category}`)
}

// Media Management API (Admin only)
export const mediaAPI = {
  getAll: () => api.get('/upload/media/all'),
  getStats: () => api.get('/upload/media/stats'),
  rename: (category, filename, newName) => api.put('/upload/rename', { category, filename, newName }),
  delete: (category, filename) => api.delete(`/upload/media/${category}/${filename}`),
  deleteBulk: (files) => api.delete('/upload/media/bulk', { data: { files } })
}

export const messagesAPI = {
  getAll: (params) => api.get('/messages', { params }),
  getById: (id) => api.get(`/messages/${id}`),
  getUnreadCount: () => api.get('/messages/unread-count'),
  toggleRead: (id) => api.put(`/messages/${id}/read`),
  toggleStar: (id) => api.put(`/messages/${id}/star`),
  toggleArchive: (id) => api.put(`/messages/${id}/archive`),
  updateNotes: (id, notes) => api.put(`/messages/${id}/notes`, { notes }),
  markAllRead: () => api.put('/messages/mark-all-read'),
  delete: (id) => api.delete(`/messages/${id}`)
}

export const seoAPI = {
  getAll: () => api.get('/seo/admin'),
  getById: (id) => api.get(`/seo/${id}`),
  getBySlug: (slug) => api.get(`/seo/slug/${slug}`),
  create: (data) => api.post('/seo', data),
  update: (id, data) => api.put(`/seo/${id}`, data),
  updateBySlug: (slug, data) => api.put(`/seo/slug/${slug}`, data),
  delete: (id) => api.delete(`/seo/${id}`),
  toggle: (id) => api.put(`/seo/${id}/toggle`),
  validateSchema: (schemaJson) => api.post('/seo/validate-schema', { schemaJson }),
  getSitemapData: () => api.get('/seo/sitemap/data')
}

export const careersAPI = {
  getAll: () => api.get('/careers'),
  getById: (id) => api.get(`/careers/${id}`),
  create: (data) => api.post('/careers', data),
  update: (id, data) => api.put(`/careers/${id}`, data),
  delete: (id) => api.delete(`/careers/${id}`),
  updateOrder: (id, displayOrder) => api.put(`/careers/${id}/order`, { displayOrder })
}

export const jobApplicationsAPI = {
  getAll: (params) => api.get('/job-applications', { params }),
  getById: (id) => api.get(`/job-applications/${id}`),
  updateStatus: (id, status, notes) => api.put(`/job-applications/${id}/status`, { status, notes }),
  delete: (id) => api.delete(`/job-applications/${id}`)
}

export const analyticsAPI = {
  getOverview: (range) => api.get('/analytics/overview', { params: { range } }),
  getPageViews: (range, interval) => api.get('/analytics/pageviews', { params: { range, interval } }),
  getTopPages: (range, limit) => api.get('/analytics/top-pages', { params: { range, limit } }),
  getReferrers: (range, limit) => api.get('/analytics/referrers', { params: { range, limit } }),
  getDevices: (range) => api.get('/analytics/devices', { params: { range } }),
  getEvents: (range, limit) => api.get('/analytics/events', { params: { range, limit } }),
  getRealtime: () => api.get('/analytics/realtime'),
  getUserFlow: (range) => api.get('/analytics/user-flow', { params: { range } }),
  getUTM: (range) => api.get('/analytics/utm', { params: { range } }),
  clearData: (type, beforeDate) => api.delete('/analytics/clear', { params: { type, beforeDate } })
}

// Feed Management API
export const feedAPI = {
  // Admin endpoints
  getAll: (params) => api.get('/feed/admin/all', { params }),
  preview: (url) => api.post('/feed/admin/preview', { url }),
  create: (data) => api.post('/feed/admin', data),
  update: (id, data) => api.put(`/feed/admin/${id}`, data),
  delete: (id) => api.delete(`/feed/admin/${id}`),
  toggle: (id) => api.put(`/feed/admin/${id}/toggle`),
  refresh: (id) => api.put(`/feed/admin/${id}/refresh`),
  reorder: (orders) => api.put('/feed/admin/reorder', { orders }),

  // Analytics endpoints
  getAnalyticsOverview: (params = {}) => api.get('/feed/admin/analytics/overview', { params: { ...params, _t: Date.now() } }),
  getItemAnalytics: (id, params) => api.get(`/feed/admin/analytics/${id}`, { params }),
  getEngagement: (params) => api.get('/feed/admin/analytics/engagement', { params })
}

export default api
