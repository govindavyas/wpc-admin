<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white">Company Settings</h1>
      <p class="text-gray-400 mt-1">Manage your company information</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="saveCompany" class="space-y-6">
      <!-- Basic Info -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Basic Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-300 mb-1">Company Name *</label>
            <input v-model="form.name" type="text" required />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-300 mb-1">Tagline</label>
            <input v-model="form.tagline" type="text" placeholder="e.g., Crafting Stories That Transcend Boundaries" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea v-model="form.description" rows="4" placeholder="Company description..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Founded Year</label>
            <input v-model="form.foundedYear" type="text" placeholder="e.g., 2020" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Location</label>
            <input v-model="form.location" type="text" placeholder="e.g., Pune, India" />
          </div>
        </div>
      </div>

      <!-- About Section -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">About Section</h2>
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">About Title</label>
              <input v-model="form.aboutUs.title" type="text" placeholder="e.g., THE COMPANY" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">About Subtitle</label>
              <input v-model="form.aboutUs.subtitle" type="text" placeholder="e.g., Films. Music. Artistes." />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">About Tagline</label>
            <input v-model="form.aboutUs.tagline" type="text" placeholder="e.g., At our core, we're storytellers." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">About Description</label>
            <textarea v-model="form.aboutUs.description" rows="6" placeholder="Main about us content..."></textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">About Image</label>
              <div class="flex gap-2 mb-2">
                <button 
                  type="button" 
                  @click="aboutImageType = 'url'" 
                  :class="['px-3 py-1 text-xs rounded-full transition-colors', aboutImageType === 'url' ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:bg-dark-100']"
                >
                  URL
                </button>
                <button 
                  type="button" 
                  @click="aboutImageType = 'upload'" 
                  :class="['px-3 py-1 text-xs rounded-full transition-colors', aboutImageType === 'upload' ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:bg-dark-100']"
                >
                  Upload
                </button>
              </div>
              <div v-if="aboutImageType === 'url'">
                <input v-model="form.aboutUs.imageUrl" type="text" placeholder="/uploads/images/..." />
              </div>
              <div v-else>
                <input type="file" accept="image/*" @change="handleAboutImageUpload" class="hidden" ref="aboutImageInput" />
                <button 
                  type="button" 
                  @click="$refs.aboutImageInput.click()" 
                  class="w-full py-2 px-4 border-2 border-dashed border-dark-100 rounded-lg text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-colors"
                  :disabled="uploadingAboutImage"
                >
                  <span v-if="uploadingAboutImage" class="flex items-center justify-center gap-2">
                    <span class="spinner w-4 h-4"></span> Uploading...
                  </span>
                  <span v-else>Choose About Image</span>
                </button>
              </div>
              <div v-if="form.aboutUs.imageUrl" class="mt-2 relative inline-block">
                <img :src="getApiUrl(form.aboutUs.imageUrl)" alt="About image preview" class="w-32 h-20 object-cover rounded" />
                <button type="button" @click="form.aboutUs.imageUrl = ''" class="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-500">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Video URL</label>
              <input v-model="form.aboutUs.videoUrl" type="text" placeholder="https://youtube.com/..." />
            </div>
          </div>
        </div>
      </div>

      <!-- About Sections (Multiple Paragraphs) -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-white">About Sections</h2>
          <button type="button" @click="addSection" class="btn btn-sm btn-secondary">+ Add Section</button>
        </div>
        <p class="text-gray-400 text-sm mb-4">Add multiple content sections with headings (e.g., Our Vision, Industry Leadership, etc.)</p>
        <div class="space-y-4">
          <div v-for="(section, index) in form.aboutUs.sections" :key="index" class="p-4 bg-dark-200 rounded-lg relative">
            <button type="button" @click="removeSection(index)" class="absolute top-2 right-2 p-1 text-red-400 hover:text-red-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div class="space-y-3 pr-8">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Section Heading</label>
                <input v-model="section.heading" type="text" placeholder="e.g., Our Vision" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Section Content</label>
                <textarea v-model="section.content" rows="4" placeholder="Section content..."></textarea>
              </div>
            </div>
          </div>
          <div v-if="!form.aboutUs.sections?.length" class="text-gray-500 text-center py-4">
            No sections added yet. Click "Add Section" to create one.
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-white">Company Stats</h2>
          <button type="button" @click="addStat" class="btn btn-sm btn-secondary">+ Add Stat</button>
        </div>
        <p class="text-gray-400 text-sm mb-4">Add statistics to display (e.g., Years of Excellence: 50+)</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="(stat, index) in form.aboutUs.stats" :key="index" class="p-4 bg-dark-200 rounded-lg relative">
            <button type="button" @click="removeStat(index)" class="absolute top-2 right-2 p-1 text-red-400 hover:text-red-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div class="grid grid-cols-2 gap-3 pr-8">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Value</label>
                <input v-model="stat.value" type="text" placeholder="e.g., 50+" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Label</label>
                <input v-model="stat.label" type="text" placeholder="e.g., Years of Excellence" />
              </div>
            </div>
          </div>
        </div>
        <div v-if="!form.aboutUs.stats?.length" class="text-gray-500 text-center py-4">
          No stats added yet. Click "Add Stat" to create one.
        </div>
      </div>

      <!-- Milestones -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-white">Company Milestones</h2>
          <button type="button" @click="addMilestone" class="btn btn-sm btn-secondary">+ Add Milestone</button>
        </div>
        <p class="text-gray-400 text-sm mb-4">Add company timeline milestones</p>
        <div class="space-y-4">
          <div v-for="(milestone, index) in form.aboutUs.milestones" :key="index" class="p-4 bg-dark-200 rounded-lg relative">
            <button type="button" @click="removeMilestone(index)" class="absolute top-2 right-2 p-1 text-red-400 hover:text-red-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pr-8">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Year</label>
                <input v-model="milestone.year" type="text" placeholder="e.g., 1970" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input v-model="milestone.title" type="text" placeholder="e.g., Foundation" />
              </div>
              <div class="md:col-span-1">
                <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <input v-model="milestone.description" type="text" placeholder="Brief description" />
              </div>
            </div>
          </div>
        </div>
        <div v-if="!form.aboutUs.milestones?.length" class="text-gray-500 text-center py-4">
          No milestones added yet. Click "Add Milestone" to create one.
        </div>
      </div>

      <!-- Mission & Vision -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Mission & Vision</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Mission Statement</label>
            <textarea v-model="form.mission" rows="3"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Vision Statement</label>
            <textarea v-model="form.vision" rows="3"></textarea>
          </div>
        </div>
      </div>

      <!-- Logos -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Branding</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Logo -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Logo</label>
            <div class="flex gap-2 mb-2">
              <button 
                type="button" 
                @click="logoImageType = 'url'" 
                :class="['px-3 py-1 text-xs rounded-full transition-colors', logoImageType === 'url' ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:bg-dark-100']"
              >
                URL
              </button>
              <button 
                type="button" 
                @click="logoImageType = 'upload'" 
                :class="['px-3 py-1 text-xs rounded-full transition-colors', logoImageType === 'upload' ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:bg-dark-100']"
              >
                Upload
              </button>
            </div>
            <div v-if="logoImageType === 'url'">
              <input v-model="form.logo" type="url" placeholder="https://..." />
            </div>
            <div v-else>
              <input type="file" accept="image/*" @change="handleLogoUpload" class="hidden" ref="logoInput" />
              <button 
                type="button" 
                @click="$refs.logoInput.click()" 
                class="w-full py-2 px-4 border-2 border-dashed border-dark-100 rounded-lg text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-colors"
                :disabled="uploadingLogo"
              >
                <span v-if="uploadingLogo" class="flex items-center justify-center gap-2">
                  <span class="spinner w-4 h-4"></span> Uploading...
                </span>
                <span v-else>Choose Logo Image</span>
              </button>
            </div>
            <div v-if="form.logo" class="mt-2 p-4 bg-dark-200 rounded inline-block relative">
              <img :src="getApiUrl(form.logo)" alt="Logo preview" class="h-12 object-contain" />
              <button type="button" @click="form.logo = ''" class="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-500">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Logo Dark -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Logo (Dark)</label>
            <div class="flex gap-2 mb-2">
              <button 
                type="button" 
                @click="logoDarkImageType = 'url'" 
                :class="['px-3 py-1 text-xs rounded-full transition-colors', logoDarkImageType === 'url' ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:bg-dark-100']"
              >
                URL
              </button>
              <button 
                type="button" 
                @click="logoDarkImageType = 'upload'" 
                :class="['px-3 py-1 text-xs rounded-full transition-colors', logoDarkImageType === 'upload' ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:bg-dark-100']"
              >
                Upload
              </button>
            </div>
            <div v-if="logoDarkImageType === 'url'">
              <input v-model="form.logoDark" type="url" placeholder="https://..." />
            </div>
            <div v-else>
              <input type="file" accept="image/*" @change="handleLogoDarkUpload" class="hidden" ref="logoDarkInput" />
              <button 
                type="button" 
                @click="$refs.logoDarkInput.click()" 
                class="w-full py-2 px-4 border-2 border-dashed border-dark-100 rounded-lg text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-colors"
                :disabled="uploadingLogoDark"
              >
                <span v-if="uploadingLogoDark" class="flex items-center justify-center gap-2">
                  <span class="spinner w-4 h-4"></span> Uploading...
                </span>
                <span v-else>Choose Logo (Dark) Image</span>
              </button>
            </div>
            <div v-if="form.logoDark" class="mt-2 p-4 bg-white rounded inline-block relative">
              <img :src="getApiUrl(form.logoDark)" alt="Logo dark preview" class="h-12 object-contain" />
              <button type="button" @click="form.logoDark = ''" class="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-500">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Favicon -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Favicon</label>
            <div class="flex gap-2 mb-2">
              <button 
                type="button" 
                @click="faviconImageType = 'url'" 
                :class="['px-3 py-1 text-xs rounded-full transition-colors', faviconImageType === 'url' ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:bg-dark-100']"
              >
                URL
              </button>
              <button 
                type="button" 
                @click="faviconImageType = 'upload'" 
                :class="['px-3 py-1 text-xs rounded-full transition-colors', faviconImageType === 'upload' ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:bg-dark-100']"
              >
                Upload
              </button>
            </div>
            <div v-if="faviconImageType === 'url'">
              <input v-model="form.favicon" type="url" placeholder="https://..." />
            </div>
            <div v-else>
              <input type="file" accept="image/*" @change="handleFaviconUpload" class="hidden" ref="faviconInput" />
              <button 
                type="button" 
                @click="$refs.faviconInput.click()" 
                class="w-full py-2 px-4 border-2 border-dashed border-dark-100 rounded-lg text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-colors"
                :disabled="uploadingFavicon"
              >
                <span v-if="uploadingFavicon" class="flex items-center justify-center gap-2">
                  <span class="spinner w-4 h-4"></span> Uploading...
                </span>
                <span v-else>Choose Favicon</span>
              </button>
            </div>
            <div v-if="form.favicon" class="mt-2 p-2 bg-dark-200 rounded inline-block relative">
              <img :src="getApiUrl(form.favicon)" alt="Favicon preview" class="h-8 w-8 object-contain" />
              <button type="button" @click="form.favicon = ''" class="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-500">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Contact Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input v-model="form.contact.email" type="email" placeholder="contact@whitepandacreations.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Phone</label>
            <input v-model="form.contact.phone" type="tel" placeholder="+91-22-1234-5678" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-300 mb-1">Full Address (Display)</label>
            <textarea v-model="form.contact.fullAddress" rows="2" placeholder="123 Film District, Kothrud, Pune, Maharashtra 411038, India"></textarea>
          </div>
          <div class="md:col-span-2 border-t border-dark-100 pt-4 mt-2">
            <p class="text-sm text-gray-500 mb-3">Structured Address (Optional - for mapping services)</p>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-300 mb-1">Street Address</label>
            <input v-model="form.contact.address.street" type="text" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">City</label>
            <input v-model="form.contact.address.city" type="text" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">State</label>
            <input v-model="form.contact.address.state" type="text" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Country</label>
            <input v-model="form.contact.address.country" type="text" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Pincode</label>
            <input v-model="form.contact.address.pincode" type="text" />
          </div>
        </div>
      </div>

      <!-- Social Media -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Social Media</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Instagram</label>
            <input v-model="form.socialLinks.instagram" type="text" placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Twitter</label>
            <input v-model="form.socialLinks.twitter" type="text" placeholder="https://twitter.com/..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Facebook</label>
            <input v-model="form.socialLinks.facebook" type="text" placeholder="https://facebook.com/..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">YouTube</label>
            <input v-model="form.socialLinks.youtube" type="text" placeholder="https://youtube.com/..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">LinkedIn</label>
            <input v-model="form.socialLinks.linkedin" type="text" placeholder="https://linkedin.com/..." />
          </div>
        </div>
      </div>

      <!-- SEO -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">SEO Settings</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Meta Title</label>
            <input v-model="form.seoMeta.title" type="text" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Meta Description</label>
            <textarea v-model="form.seoMeta.description" rows="2"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Keywords (comma separated)</label>
            <input v-model="form.seoMeta.keywords" type="text" />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4">
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <span v-if="saving" class="spinner"></span>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { companyAPI, uploadAPI } from '@/services/api'
import { useToastStore } from '@/stores/toast'
import { getApiUrl } from '@/utils/imageUrl'

const toast = useToastStore()

const loading = ref(true)
const saving = ref(false)

// Image type toggles
const logoImageType = ref('url')
const logoDarkImageType = ref('url')
const faviconImageType = ref('url')
const aboutImageType = ref('url')
const uploadingLogo = ref(false)
const uploadingLogoDark = ref(false)
const uploadingFavicon = ref(false)
const uploadingAboutImage = ref(false)

const defaultForm = () => ({
  name: '',
  tagline: '',
  description: '',
  foundedYear: '',
  location: '',
  aboutUs: {
    title: '',
    subtitle: '',
    tagline: '',
    description: '',
    imageUrl: '',
    videoUrl: '',
    sections: [],
    stats: [],
    milestones: []
  },
  mission: '',
  vision: '',
  logo: '',
  logoDark: '',
  favicon: '',
  contact: {
    email: '',
    phone: '',
    fullAddress: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      pincode: ''
    }
  },
  socialLinks: {
    instagram: '',
    twitter: '',
    facebook: '',
    youtube: '',
    linkedin: ''
  },
  seoMeta: {
    title: '',
    description: '',
    keywords: ''
  }
})

const form = ref(defaultForm())

async function fetchCompany() {
  loading.value = true
  try {
    const response = await companyAPI.get()
    if (response.data.data) {
      const company = response.data.data
      form.value = {
        ...defaultForm(),
        ...company,
        aboutUs: { 
          ...defaultForm().aboutUs, 
          ...company.aboutUs,
          sections: company.aboutUs?.sections || [],
          stats: company.aboutUs?.stats || [],
          milestones: company.aboutUs?.milestones || []
        },
        contact: { 
          ...defaultForm().contact, 
          ...company.contact,
          address: { ...defaultForm().contact.address, ...(company.contact?.address || {}) }
        },
        socialLinks: { ...defaultForm().socialLinks, ...company.socialLinks },
        seoMeta: { ...defaultForm().seoMeta, ...company.seoMeta }
      }
      
      // Set image types based on whether they are uploaded files or external URLs
      if (company.logo && company.logo.startsWith('/uploads/')) {
        logoImageType.value = 'upload'
      } else {
        logoImageType.value = 'url'
      }
      
      if (company.logoDark && company.logoDark.startsWith('/uploads/')) {
        logoDarkImageType.value = 'upload'
      } else {
        logoDarkImageType.value = 'url'
      }
      
      if (company.favicon && company.favicon.startsWith('/uploads/')) {
        faviconImageType.value = 'upload'
      } else {
        faviconImageType.value = 'url'
      }
      
      if (company.aboutUs?.imageUrl && company.aboutUs.imageUrl.startsWith('/uploads/')) {
        aboutImageType.value = 'upload'
      } else {
        aboutImageType.value = 'url'
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchCompany)

// Upload handlers for logo images
async function handleLogoUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  uploadingLogo.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('category', 'images')
    if (form.value.name) {
      formData.append('seoName', form.value.name + '-logo')
    }
    const response = await uploadAPI.uploadImage(formData)
    form.value.logo = response.data.data.url
    // Keep upload tab selected after successful upload
    logoImageType.value = 'upload'
    toast.success('Logo uploaded successfully')
  } catch (error) {
    toast.error('Failed to upload logo')
  } finally {
    uploadingLogo.value = false
    event.target.value = ''
  }
}

async function handleLogoDarkUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  uploadingLogoDark.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('category', 'images')
    if (form.value.name) {
      formData.append('seoName', form.value.name + '-logo-dark')
    }
    const response = await uploadAPI.uploadImage(formData)
    form.value.logoDark = response.data.data.url
    // Keep upload tab selected after successful upload
    logoDarkImageType.value = 'upload'
    toast.success('Dark logo uploaded successfully')
  } catch (error) {
    toast.error('Failed to upload dark logo')
  } finally {
    uploadingLogoDark.value = false
    event.target.value = ''
  }
}

async function handleFaviconUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  uploadingFavicon.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('category', 'images')
    if (form.value.name) {
      formData.append('seoName', form.value.name + '-favicon')
    }
    const response = await uploadAPI.uploadImage(formData)
    form.value.favicon = response.data.data.url
    // Keep upload tab selected after successful upload
    faviconImageType.value = 'upload'
    toast.success('Favicon uploaded successfully')
  } catch (error) {
    toast.error('Failed to upload favicon')
  } finally {
    uploadingFavicon.value = false
    event.target.value = ''
  }
}

async function handleAboutImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  uploadingAboutImage.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('category', 'images')
    if (form.value.name) {
      formData.append('seoName', form.value.name + '-about')
    }
    const response = await uploadAPI.uploadImage(formData)
    form.value.aboutUs.imageUrl = response.data.data.url
    // Keep upload tab selected after successful upload
    aboutImageType.value = 'upload'
    toast.success('About image uploaded successfully')
  } catch (error) {
    toast.error('Failed to upload about image')
  } finally {
    uploadingAboutImage.value = false
    event.target.value = ''
  }
}

function removeLogo() {
  form.value.logos.logo = ''
}

function removeLogoDark() {
  form.value.logos.logoDark = ''
}

function removeFavicon() {
  form.value.logos.favicon = ''
}

// Section management
function addSection() {
  if (!form.value.aboutUs.sections) {
    form.value.aboutUs.sections = []
  }
  form.value.aboutUs.sections.push({ heading: '', content: '' })
}

function removeSection(index) {
  form.value.aboutUs.sections.splice(index, 1)
}

// Stats management
function addStat() {
  if (!form.value.aboutUs.stats) {
    form.value.aboutUs.stats = []
  }
  form.value.aboutUs.stats.push({ value: '', label: '' })
}

function removeStat(index) {
  form.value.aboutUs.stats.splice(index, 1)
}

// Milestone management
function addMilestone() {
  if (!form.value.aboutUs.milestones) {
    form.value.aboutUs.milestones = []
  }
  form.value.aboutUs.milestones.push({ year: '', title: '', description: '' })
}

function removeMilestone(index) {
  form.value.aboutUs.milestones.splice(index, 1)
}

async function saveCompany() {
  saving.value = true
  try {
    await companyAPI.update(form.value)
    toast.success('Company settings saved successfully')
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to save company settings'
    toast.error(message)
  } finally {
    saving.value = false
  }
}
</script>

