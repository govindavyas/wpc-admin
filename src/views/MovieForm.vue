<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <router-link to="/movies" class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </router-link>
      <div>
        <h1 class="text-2xl font-bold text-white">{{ isEdit ? 'Edit Movie' : 'Add Movie' }}</h1>
        <p class="text-gray-400 mt-1">{{ isEdit ? 'Update movie details' : 'Create a new movie entry' }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loadingData" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="saveMovie" class="space-y-6">
      <!-- Basic Info -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Basic Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-300 mb-1">Title *</label>
            <input v-model="form.title" type="text" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Slug *</label>
            <input v-model="form.slug" type="text" required placeholder="movie-slug" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Year *</label>
            <input v-model.number="form.year" type="number" min="1900" :max="new Date().getFullYear() + 5" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Language</label>
            <input v-model="form.language" type="text" placeholder="Hindi" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Duration</label>
            <input v-model="form.duration" type="text" placeholder="2h 30m" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Genre</label>
            <input v-model="form.genre" type="text" placeholder="Drama, Thriller" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select v-model="form.status">
              <option value="announced">Announced</option>
              <option value="pre-production">Pre-Production</option>
              <option value="production">Production</option>
              <option value="post-production">Post-Production</option>
              <option value="completed">Completed</option>
              <option value="released">Released</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-300 mb-1">Tagline</label>
            <input v-model="form.tagline" type="text" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-300 mb-1">Synopsis</label>
            <textarea v-model="form.synopsis" rows="4"></textarea>
          </div>
        </div>
      </div>

      <!-- Media -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Media</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Poster -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Poster Image</label>
            <div class="flex gap-2 mb-2">
              <button 
                type="button" 
                @click="posterImageType = 'url'" 
                :class="['px-3 py-1 text-xs rounded-full transition-colors', posterImageType === 'url' ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:bg-dark-100']"
              >
                URL
              </button>
              <button 
                type="button" 
                @click="posterImageType = 'upload'" 
                :class="['px-3 py-1 text-xs rounded-full transition-colors', posterImageType === 'upload' ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:bg-dark-100']"
              >
                Upload
              </button>
            </div>
            <div v-if="posterImageType === 'url'">
              <input v-model="form.posterUrl" type="text" placeholder="https://..." />
            </div>
            <div v-else>
              <div class="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="handlePosterUpload" 
                  class="hidden" 
                  ref="posterInput"
                />
                <button 
                  type="button" 
                  @click="$refs.posterInput.click()" 
                  class="w-full py-2 px-4 border-2 border-dashed border-dark-100 rounded-lg text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-colors"
                  :disabled="uploadingPoster"
                >
                  <span v-if="uploadingPoster" class="flex items-center justify-center gap-2">
                    <span class="spinner w-4 h-4"></span> Uploading...
                  </span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Choose Poster Image
                  </span>
                </button>
              </div>
            </div>
            <div v-if="form.posterUrl" class="mt-2 relative inline-block">
              <img :src="getApiUrl(form.posterUrl)" alt="Poster preview" class="w-24 h-36 object-cover rounded" />
              <button 
                type="button" 
                @click="form.posterUrl = ''" 
                class="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-500"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Banner -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Banner Image</label>
            <div class="flex gap-2 mb-2">
              <button 
                type="button" 
                @click="bannerImageType = 'url'" 
                :class="['px-3 py-1 text-xs rounded-full transition-colors', bannerImageType === 'url' ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:bg-dark-100']"
              >
                URL
              </button>
              <button 
                type="button" 
                @click="bannerImageType = 'upload'" 
                :class="['px-3 py-1 text-xs rounded-full transition-colors', bannerImageType === 'upload' ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:bg-dark-100']"
              >
                Upload
              </button>
            </div>
            <div v-if="bannerImageType === 'url'">
              <input v-model="form.bannerUrl" type="text" placeholder="https://..." />
            </div>
            <div v-else>
              <div class="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="handleBannerUpload" 
                  class="hidden" 
                  ref="bannerInput"
                />
                <button 
                  type="button" 
                  @click="$refs.bannerInput.click()" 
                  class="w-full py-2 px-4 border-2 border-dashed border-dark-100 rounded-lg text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-colors"
                  :disabled="uploadingBanner"
                >
                  <span v-if="uploadingBanner" class="flex items-center justify-center gap-2">
                    <span class="spinner w-4 h-4"></span> Uploading...
                  </span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Choose Banner Image
                  </span>
                </button>
              </div>
            </div>
            <div v-if="form.bannerUrl" class="mt-2 relative inline-block">
              <img :src="getApiUrl(form.bannerUrl)" alt="Banner preview" class="w-48 h-24 object-cover rounded" />
              <button 
                type="button" 
                @click="form.bannerUrl = ''" 
                class="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-500"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Trailer -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Trailer</h2>
        
        <!-- Source Type Toggle -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">Source Type</label>
          <div class="flex gap-2">
            <button 
              type="button" 
              @click="trailerSourceType = 'url'; form.trailer.type = 'youtube'" 
              :class="['px-4 py-2 text-sm rounded-lg transition-colors', trailerSourceType === 'url' ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:bg-dark-100']"
            >
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
                YouTube / Vimeo URL
              </span>
            </button>
            <button 
              type="button" 
              @click="trailerSourceType = 'upload'; form.trailer.type = 'local'" 
              :class="['px-4 py-2 text-sm rounded-lg transition-colors', trailerSourceType === 'upload' ? 'bg-primary-600 text-white' : 'bg-dark-200 text-gray-400 hover:bg-dark-100']"
            >
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                Upload Video
              </span>
            </button>
          </div>
        </div>

        <!-- URL Input (YouTube / Vimeo) -->
        <div v-if="trailerSourceType === 'url'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              Video URL
              <span class="text-gray-500 text-xs ml-1">(YouTube or Vimeo)</span>
            </label>
            <input v-model="form.trailer.url" type="text" placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..." />
            <p class="text-xs text-gray-500 mt-1">Supports YouTube (watch, shorts, embed) and Vimeo links</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Thumbnail URL <span class="text-gray-500">(optional)</span></label>
            <input v-model="form.trailer.thumbnail" type="text" placeholder="https://..." />
          </div>
        </div>

        <!-- Video Upload -->
        <div v-else>
          <div class="relative">
            <input 
              type="file" 
              accept="video/mp4,video/webm,video/ogg,video/quicktime" 
              @change="handleTrailerUpload" 
              class="hidden" 
              ref="trailerInput"
            />
            <button 
              type="button" 
              @click="$refs.trailerInput.click()" 
              class="w-full py-4 px-4 border-2 border-dashed border-dark-100 rounded-lg text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-colors"
              :disabled="uploadingTrailer"
            >
              <span v-if="uploadingTrailer" class="flex flex-col items-center justify-center gap-2">
                <span class="spinner w-6 h-6"></span>
                <span>Uploading... {{ trailerUploadProgress }}%</span>
              </span>
              <span v-else class="flex flex-col items-center justify-center gap-2">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                <span>Choose Video File</span>
                <span class="text-xs text-gray-500">MP4, WebM, OGG, MOV (Max 1.5GB)</span>
              </span>
            </button>
          </div>
          
          <!-- Progress bar -->
          <div v-if="uploadingTrailer" class="mt-2">
            <div class="w-full bg-dark-200 rounded-full h-2">
              <div class="bg-primary-500 h-2 rounded-full transition-all duration-300" :style="{ width: trailerUploadProgress + '%' }"></div>
            </div>
          </div>
          
          <!-- Thumbnail upload after video -->
          <div v-if="form.trailer.url && trailerSourceType === 'upload'" class="mt-4">
            <label class="block text-sm font-medium text-gray-300 mb-1">Thumbnail URL <span class="text-gray-500">(optional)</span></label>
            <input v-model="form.trailer.thumbnail" type="text" placeholder="https://..." />
          </div>
        </div>

        <!-- Video Preview -->
        <div v-if="form.trailer.url" class="mt-4">
          <h3 class="text-sm font-medium text-gray-300 mb-2">Preview</h3>
          <div class="relative aspect-video bg-black rounded-lg overflow-hidden max-w-lg">
            <!-- YouTube/Vimeo iframe -->
            <iframe
              v-if="form.trailer.type === 'youtube' || form.trailer.type === 'vimeo'"
              :src="getTrailerPreviewUrl()"
              class="w-full h-full"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              loading="lazy"
            ></iframe>
            <!-- Local/Uploaded video -->
            <video
              v-else
              :src="getApiUrl(form.trailer.url)"
              controls
              class="w-full h-full"
              preload="metadata"
            ></video>
            <!-- Remove button -->
            <button 
              type="button" 
              @click="clearTrailer" 
              class="absolute top-2 right-2 p-2 bg-red-600/90 rounded-full text-white hover:bg-red-500 transition-colors"
              title="Remove trailer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Credits -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Credits</h2>
        
        <!-- Producers -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-gray-300">Producers</label>
            <div class="flex gap-2">
              <button type="button" @click="showProducerDropdown = !showProducerDropdown" class="text-sm text-primary-400 hover:text-primary-300">
                + Select from List
              </button>
              <button type="button" @click="addCredit('producers')" class="text-sm text-green-400 hover:text-green-300">
                + Add Manually
              </button>
            </div>
          </div>
          
          <!-- Producer Selection Dropdown -->
          <div v-if="showProducerDropdown" class="mb-4 p-3 bg-dark-200 rounded-lg border border-dark-100">
            <div class="flex items-center gap-2 mb-2">
              <input 
                v-model="producerSearchQuery" 
                type="text" 
                placeholder="Search producers..." 
                class="flex-1 text-sm"
              />
              <button type="button" @click="showProducerDropdown = false" class="p-1 text-gray-400 hover:text-white">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="max-h-40 overflow-y-auto space-y-1">
              <div v-if="loadingProducers" class="text-center py-2 text-gray-400 text-sm">Loading...</div>
              <div v-else-if="filteredProducers.length === 0" class="text-center py-2 text-gray-400 text-sm">No producers found</div>
              <button
                v-else
                v-for="producer in filteredProducers"
                :key="producer._id"
                type="button"
                @click="addProducerFromList(producer)"
                class="w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm text-gray-300 hover:bg-dark-100 rounded transition-colors"
                :class="{ 'opacity-50 cursor-not-allowed': isProducerAlreadyAdded(producer) }"
                :disabled="isProducerAlreadyAdded(producer)"
              >
                <img v-if="producer.photoUrl" :src="getApiUrl(producer.photoUrl)" class="w-6 h-6 rounded-full object-cover" />
                <div v-else class="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-xs text-white">{{ producer.name?.charAt(0) }}</div>
                <span>{{ producer.name }}</span>
                <span v-if="producer.designation" class="text-gray-500 text-xs">- {{ producer.designation }}</span>
                <span v-if="isProducerAlreadyAdded(producer)" class="ml-auto text-xs text-green-400">Added</span>
              </button>
            </div>
          </div>
          
          <!-- Added Producers List -->
          <div v-for="(producer, idx) in form.credits.producers" :key="idx" class="mb-3 p-3 bg-dark-200 rounded-lg border border-dark-100">
            <div class="flex items-start gap-3">
              <!-- Photo Preview -->
              <div class="flex-shrink-0">
                <div class="w-12 h-12 rounded-full overflow-hidden bg-dark-100">
                  <img v-if="producer.photoUrl" :src="getApiUrl(producer.photoUrl)" :alt="producer.name" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-lg font-bold text-primary-400">{{ producer.name?.charAt(0) || '?' }}</div>
                </div>
              </div>
              <div class="flex-1 space-y-2">
                <div class="flex gap-2">
                  <input v-model="form.credits.producers[idx].name" type="text" placeholder="Name" class="flex-1" />
                  <input v-model="form.credits.producers[idx].role" type="text" placeholder="Role (e.g., Executive Producer)" class="flex-1" />
                  <button type="button" @click="removeCredit('producers', idx)" class="p-2 text-red-400 hover:text-red-300">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <!-- Photo URL input/upload for manually added -->
                <div v-if="!producer.fromExisting" class="space-y-2">
                  <div class="flex gap-2">
                    <input v-model="form.credits.producers[idx].photoUrl" type="text" placeholder="Photo URL" class="flex-1 text-sm" />
                    <label class="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded cursor-pointer transition-colors whitespace-nowrap">
                      <input type="file" @change="handleProducerPhotoUpload($event, idx)" accept="image/*" class="hidden" />
                      Upload Photo
                    </label>
                  </div>
                  <div v-if="uploadingProducerPhoto[idx]" class="text-xs text-primary-400">Uploading...</div>
                </div>
                <div v-else class="text-xs text-gray-500">Photo from existing producer profile</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Directors -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-gray-300">Directors</label>
            <button type="button" @click="addCredit('directors')" class="text-sm text-primary-400 hover:text-primary-300">
              + Add Director
            </button>
          </div>
          <div v-for="(director, idx) in form.credits.directors" :key="idx" class="mb-3 p-3 bg-dark-200 rounded-lg border border-dark-100">
            <div class="flex items-start gap-3">
              <!-- Photo Preview -->
              <div class="flex-shrink-0">
                <div class="w-12 h-12 rounded-full overflow-hidden bg-dark-100">
                  <img v-if="director.photoUrl" :src="getApiUrl(director.photoUrl)" :alt="director.name" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-lg font-bold text-primary-400">{{ director.name?.charAt(0) || '?' }}</div>
                </div>
              </div>
              <div class="flex-1 space-y-2">
                <div class="flex gap-2">
                  <input v-model="form.credits.directors[idx].name" type="text" placeholder="Name" class="flex-1" />
                  <input v-model="form.credits.directors[idx].role" type="text" placeholder="Role (e.g., Co-Director)" class="flex-1" />
                  <button type="button" @click="removeCredit('directors', idx)" class="p-2 text-red-400 hover:text-red-300">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <input v-model="form.credits.directors[idx].photoUrl" type="text" placeholder="Photo URL (optional)" class="w-full text-sm" />
              </div>
            </div>
          </div>
        </div>

        <!-- Writers -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-gray-300">Writers</label>
            <button type="button" @click="addCredit('writers')" class="text-sm text-primary-400 hover:text-primary-300">
              + Add Writer
            </button>
          </div>
          <div v-for="(writer, idx) in form.credits.writers" :key="idx" class="mb-3 p-3 bg-dark-200 rounded-lg border border-dark-100">
            <div class="flex items-start gap-3">
              <!-- Photo Preview -->
              <div class="flex-shrink-0">
                <div class="w-12 h-12 rounded-full overflow-hidden bg-dark-100">
                  <img v-if="writer.photoUrl" :src="getApiUrl(writer.photoUrl)" :alt="writer.name" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-lg font-bold text-primary-400">{{ writer.name?.charAt(0) || '?' }}</div>
                </div>
              </div>
              <div class="flex-1 space-y-2">
                <div class="flex gap-2">
                  <input v-model="form.credits.writers[idx].name" type="text" placeholder="Name" class="flex-1" />
                  <input v-model="form.credits.writers[idx].role" type="text" placeholder="Role (e.g., Screenplay)" class="flex-1" />
                  <button type="button" @click="removeCredit('writers', idx)" class="p-2 text-red-400 hover:text-red-300">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <input v-model="form.credits.writers[idx].photoUrl" type="text" placeholder="Photo URL (optional)" class="w-full text-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cast -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Cast</h2>
        
        <!-- Lead Cast -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <label class="block text-sm font-medium text-gray-300">Lead Cast</label>
            <button type="button" @click="addCast('leadCast')" class="btn btn-sm btn-primary">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Lead
            </button>
          </div>
          
          <!-- Cast Cards -->
          <div class="space-y-3">
            <div v-for="(actor, idx) in form.credits.leadCast" :key="idx" class="p-4 bg-dark-200 rounded-lg hover:bg-dark-100 transition-colors">
              <div class="flex items-start gap-4">
                <!-- Photo Preview -->
                <div class="flex-shrink-0">
                  <div v-if="actor.image" class="relative">
                    <img :src="getApiUrl(actor.image)" :alt="actor.name" class="w-16 h-16 object-cover rounded-lg" />
                    <button 
                      type="button" 
                      @click="actor.image = ''" 
                      class="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-500"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div v-else class="w-16 h-16 bg-dark-300 rounded-lg flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                
                <!-- Form Fields -->
                <div class="flex-1 min-w-0 space-y-3">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Actor Name</label>
                      <input v-model="actor.name" type="text" placeholder="Enter name" class="text-sm" />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Character</label>
                      <input v-model="actor.character" type="text" placeholder="Enter character" class="text-sm" />
                    </div>
                  </div>
                  
                  <!-- Image Source -->
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Photo</label>
                    <div class="flex flex-col sm:flex-row gap-2">
                      <div class="flex gap-1 shrink-0">
                        <button 
                          type="button" 
                          @click="actor.imageType = 'url'" 
                          :class="['px-3 py-1.5 text-xs rounded transition-colors', (actor.imageType || 'url') === 'url' ? 'bg-primary-600 text-white' : 'bg-dark-300 text-gray-400 hover:bg-dark-100']"
                        >URL</button>
                        <button 
                          type="button" 
                          @click="actor.imageType = 'upload'" 
                          :class="['px-3 py-1.5 text-xs rounded transition-colors', actor.imageType === 'upload' ? 'bg-primary-600 text-white' : 'bg-dark-300 text-gray-400 hover:bg-dark-100']"
                        >Upload</button>
                      </div>
                      <div class="flex-1">
                        <input v-if="(actor.imageType || 'url') === 'url'" v-model="actor.image" type="text" placeholder="https://..." class="text-sm" />
                        <div v-else>
                          <input 
                            type="file" 
                            accept="image/*" 
                            @change="(e) => handleCastImageUpload(e, 'leadCast', idx)" 
                            class="hidden" 
                            :ref="el => castImageInputs[`leadCast_${idx}`] = el"
                          />
                          <button 
                            type="button" 
                            @click="castImageInputs[`leadCast_${idx}`]?.click()" 
                            class="w-full py-2 px-4 border border-dashed border-dark-100 rounded text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-colors text-sm"
                            :disabled="uploadingCastImage[`leadCast_${idx}`]"
                          >
                            <span v-if="uploadingCastImage[`leadCast_${idx}`]">Uploading...</span>
                            <span v-else>Choose File</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Remove Button -->
                <button type="button" @click="removeCast('leadCast', idx)" class="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <p v-if="!form.credits.leadCast.length" class="text-sm text-gray-500 italic py-3 text-center bg-dark-200 rounded-lg">No lead cast added yet</p>
        </div>

        <!-- Supporting Cast -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <label class="block text-sm font-medium text-gray-300">Supporting Cast</label>
            <button type="button" @click="addCast('supportingCast')" class="btn btn-sm btn-primary">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Supporting
            </button>
          </div>
          
          <!-- Cast Cards -->
          <div class="space-y-3">
            <div v-for="(actor, idx) in form.credits.supportingCast" :key="idx" class="p-4 bg-dark-200 rounded-lg hover:bg-dark-100 transition-colors">
              <div class="flex items-start gap-4">
                <!-- Photo Preview -->
                <div class="flex-shrink-0">
                  <div v-if="actor.image" class="relative">
                    <img :src="getApiUrl(actor.image)" :alt="actor.name" class="w-16 h-16 object-cover rounded-lg" />
                    <button 
                      type="button" 
                      @click="actor.image = ''" 
                      class="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-500"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div v-else class="w-16 h-16 bg-dark-300 rounded-lg flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                
                <!-- Form Fields -->
                <div class="flex-1 min-w-0 space-y-3">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Actor Name</label>
                      <input v-model="actor.name" type="text" placeholder="Enter name" class="text-sm" />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Character</label>
                      <input v-model="actor.character" type="text" placeholder="Enter character" class="text-sm" />
                    </div>
                  </div>
                  
                  <!-- Image Source -->
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Photo</label>
                    <div class="flex flex-col sm:flex-row gap-2">
                      <div class="flex gap-1 shrink-0">
                        <button 
                          type="button" 
                          @click="actor.imageType = 'url'" 
                          :class="['px-3 py-1.5 text-xs rounded transition-colors', (actor.imageType || 'url') === 'url' ? 'bg-primary-600 text-white' : 'bg-dark-300 text-gray-400 hover:bg-dark-100']"
                        >URL</button>
                        <button 
                          type="button" 
                          @click="actor.imageType = 'upload'" 
                          :class="['px-3 py-1.5 text-xs rounded transition-colors', actor.imageType === 'upload' ? 'bg-primary-600 text-white' : 'bg-dark-300 text-gray-400 hover:bg-dark-100']"
                        >Upload</button>
                      </div>
                      <div class="flex-1">
                        <input v-if="(actor.imageType || 'url') === 'url'" v-model="actor.image" type="text" placeholder="https://..." class="text-sm" />
                        <div v-else>
                          <input 
                            type="file" 
                            accept="image/*" 
                            @change="(e) => handleCastImageUpload(e, 'supportingCast', idx)" 
                            class="hidden" 
                            :ref="el => castImageInputs[`supportingCast_${idx}`] = el"
                          />
                          <button 
                            type="button" 
                            @click="castImageInputs[`supportingCast_${idx}`]?.click()" 
                            class="w-full py-2 px-4 border border-dashed border-dark-100 rounded text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-colors text-sm"
                            :disabled="uploadingCastImage[`supportingCast_${idx}`]"
                          >
                            <span v-if="uploadingCastImage[`supportingCast_${idx}`]">Uploading...</span>
                            <span v-else>Choose File</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Remove Button -->
                <button type="button" @click="removeCast('supportingCast', idx)" class="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <p v-if="!form.credits.supportingCast.length" class="text-sm text-gray-500 italic py-3 text-center bg-dark-200 rounded-lg">No supporting cast added yet</p>
        </div>

        <!-- Special Appearances -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="block text-sm font-medium text-gray-300">Special Appearances</label>
            <button type="button" @click="addCast('specialAppearances')" class="btn btn-sm btn-primary">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Special
            </button>
          </div>
          
          <!-- Cast Cards -->
          <div class="space-y-3">
            <div v-for="(actor, idx) in form.credits.specialAppearances" :key="idx" class="p-4 bg-dark-200 rounded-lg hover:bg-dark-100 transition-colors">
              <div class="flex items-start gap-4">
                <!-- Photo Preview -->
                <div class="flex-shrink-0">
                  <div v-if="actor.image" class="relative">
                    <img :src="getApiUrl(actor.image)" :alt="actor.name" class="w-16 h-16 object-cover rounded-lg" />
                    <button 
                      type="button" 
                      @click="actor.image = ''" 
                      class="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-500"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div v-else class="w-16 h-16 bg-dark-300 rounded-lg flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                
                <!-- Form Fields -->
                <div class="flex-1 min-w-0 space-y-3">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Actor Name</label>
                      <input v-model="actor.name" type="text" placeholder="Enter name" class="text-sm" />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Character</label>
                      <input v-model="actor.character" type="text" placeholder="Enter character" class="text-sm" />
                    </div>
                  </div>
                  
                  <!-- Image Source -->
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Photo</label>
                    <div class="flex flex-col sm:flex-row gap-2">
                      <div class="flex gap-1 shrink-0">
                        <button 
                          type="button" 
                          @click="actor.imageType = 'url'" 
                          :class="['px-3 py-1.5 text-xs rounded transition-colors', (actor.imageType || 'url') === 'url' ? 'bg-primary-600 text-white' : 'bg-dark-300 text-gray-400 hover:bg-dark-100']"
                        >URL</button>
                        <button 
                          type="button" 
                          @click="actor.imageType = 'upload'" 
                          :class="['px-3 py-1.5 text-xs rounded transition-colors', actor.imageType === 'upload' ? 'bg-primary-600 text-white' : 'bg-dark-300 text-gray-400 hover:bg-dark-100']"
                        >Upload</button>
                      </div>
                      <div class="flex-1">
                        <input v-if="(actor.imageType || 'url') === 'url'" v-model="actor.image" type="text" placeholder="https://..." class="text-sm" />
                        <div v-else>
                          <input 
                            type="file" 
                            accept="image/*" 
                            @change="(e) => handleCastImageUpload(e, 'specialAppearances', idx)" 
                            class="hidden" 
                            :ref="el => castImageInputs[`specialAppearances_${idx}`] = el"
                          />
                          <button 
                            type="button" 
                            @click="castImageInputs[`specialAppearances_${idx}`]?.click()" 
                            class="w-full py-2 px-4 border border-dashed border-dark-100 rounded text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-colors text-sm"
                            :disabled="uploadingCastImage[`specialAppearances_${idx}`]"
                          >
                            <span v-if="uploadingCastImage[`specialAppearances_${idx}`]">Uploading...</span>
                            <span v-else>Choose File</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Remove Button -->
                <button type="button" @click="removeCast('specialAppearances', idx)" class="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <p v-if="!form.credits.specialAppearances.length" class="text-sm text-gray-500 italic py-3 text-center bg-dark-200 rounded-lg">No special appearances added yet</p>
        </div>
      </div>

      <!-- Technical & Production Crew -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Technical & Production Crew</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Cinematographer</label>
            <input v-model="form.credits.cinematographer" type="text" placeholder="Director of Photography" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Editor</label>
            <input v-model="form.credits.editor" type="text" placeholder="Film Editor" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Music Director</label>
            <input v-model="form.credits.musicDirector" type="text" placeholder="Music Director" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Background Score</label>
            <input v-model="form.credits.backgroundScore" type="text" placeholder="Background Music Composer" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Lyricist</label>
            <input v-model="form.credits.lyricist" type="text" placeholder="Comma separated names" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Choreographer</label>
            <input v-model="form.credits.choreographer" type="text" placeholder="Comma separated names" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Playback Singers</label>
            <input v-model="form.credits.playbackSingers" type="text" placeholder="Comma separated names" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Production Manager</label>
            <input v-model="form.credits.productionManager" type="text" placeholder="Production Manager" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Associate Director</label>
            <input v-model="form.credits.associateDirector" type="text" placeholder="Associate Director" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Art Director</label>
            <input v-model="form.credits.artDirector" type="text" placeholder="Art Director / Production Designer" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Costume Designer</label>
            <input v-model="form.credits.costumeDesigner" type="text" placeholder="Costume Designer" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Makeup Artist</label>
            <input v-model="form.credits.makeupArtist" type="text" placeholder="Hair & Makeup Artist" />
          </div>
        </div>
      </div>

      <!-- Distribution -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Distribution</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Distributor</label>
            <input v-model="form.distribution.distributor" type="text" placeholder="Distribution company name" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Distributor Logo URL</label>
            <input v-model="form.distribution.distributorLogo" type="text" placeholder="https://..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Platforms</label>
            <input v-model="form.distribution.platforms" type="text" placeholder="Theatrical, Netflix, Prime (comma separated)" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Territories</label>
            <input v-model="form.distribution.territories" type="text" placeholder="India, USA, UK (comma separated)" />
          </div>
        </div>
      </div>

      <!-- Awards & Recognition -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">Awards & Recognition</h2>
          <button type="button" @click="addAward" class="btn btn-sm btn-primary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Award
          </button>
        </div>
        <div class="space-y-3">
          <div v-for="(award, idx) in form.awards" :key="idx" class="p-4 bg-dark-200 rounded-lg">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label class="block text-xs text-gray-500 mb-1">Award/Festival</label>
                <input v-model="form.awards[idx].name" type="text" placeholder="Name" class="text-sm" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Category</label>
                <input v-model="form.awards[idx].category" type="text" placeholder="Category" class="text-sm" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Year</label>
                <input v-model="form.awards[idx].year" type="text" placeholder="Year" class="text-sm" />
              </div>
              <div class="flex gap-2 items-end">
                <div class="flex-1">
                  <label class="block text-xs text-gray-500 mb-1">Result</label>
                  <select v-model="form.awards[idx].result" class="text-sm">
                    <option value="nominated">Nominated</option>
                    <option value="won">Won</option>
                  </select>
                </div>
                <button type="button" @click="removeAward(idx)" class="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors mb-0.5">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <p v-if="!form.awards?.length" class="text-sm text-gray-500 italic py-4 text-center bg-dark-200 rounded-lg">No awards added yet</p>
      </div>

      <!-- Social Media -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Social Media</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Instagram</label>
            <input v-model="form.socialMedia.instagram" type="text" placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Facebook</label>
            <input v-model="form.socialMedia.facebook" type="text" placeholder="https://facebook.com/..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">YouTube</label>
            <input v-model="form.socialMedia.youtube" type="text" placeholder="https://youtube.com/..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Twitter / X</label>
            <input v-model="form.socialMedia.twitter" type="text" placeholder="https://twitter.com/..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Hashtag</label>
            <input v-model="form.socialMedia.hashtag" type="text" placeholder="#MovieName" />
          </div>
        </div>
      </div>

      <!-- Gallery -->
      <div class="card">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 class="text-lg font-semibold text-white">Gallery</h2>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-400">{{ form.gallery.length }} images ({{ featuredCount }}/6 featured)</span>
            <button type="button" @click="addGalleryImage" class="btn btn-sm btn-primary">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Image
            </button>
          </div>
        </div>
        
        <!-- Gallery Items -->
        <div class="space-y-4">
          <div 
            v-for="(img, idx) in form.gallery" 
            :key="idx" 
            :class="['p-4 rounded-lg transition-colors', img.featured ? 'bg-primary-900/30 border border-primary-500/50' : 'bg-dark-200']"
          >
            <div class="flex flex-col sm:flex-row gap-4">
              <!-- Image Preview & Featured Star -->
              <div class="flex items-start gap-3 shrink-0">
                <button 
                  type="button" 
                  @click="toggleFeatured(idx)" 
                  :class="['p-2 rounded transition-colors', img.featured ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-500 hover:text-yellow-400']"
                  :title="img.featured ? 'Remove from featured' : 'Add to featured (shown on movie page)'"
                >
                  <svg class="w-5 h-5" :fill="img.featured ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
                <div class="w-24 h-16 bg-dark-300 rounded overflow-hidden">
                  <img 
                    v-if="img.url" 
                    :src="getApiUrl(img.url)" 
                    alt="Gallery preview" 
                    class="w-full h-full object-cover" 
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-500">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <!-- Form Fields -->
              <div class="flex-1 space-y-3">
                <!-- URL/Upload Toggle & Input -->
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Image Source</label>
                  <div class="flex flex-col sm:flex-row gap-2">
                    <div class="flex gap-1 shrink-0">
                      <button 
                        type="button" 
                        @click="img.imageType = 'url'" 
                        :class="['px-3 py-1.5 text-xs rounded transition-colors', (img.imageType || 'url') === 'url' ? 'bg-primary-600 text-white' : 'bg-dark-300 text-gray-400 hover:bg-dark-100']"
                      >URL</button>
                      <button 
                        type="button" 
                        @click="img.imageType = 'upload'" 
                        :class="['px-3 py-1.5 text-xs rounded transition-colors', img.imageType === 'upload' ? 'bg-primary-600 text-white' : 'bg-dark-300 text-gray-400 hover:bg-dark-100']"
                      >Upload</button>
                    </div>
                    <div class="flex-1">
                      <input v-if="(img.imageType || 'url') === 'url'" v-model="img.url" type="text" placeholder="Image URL" class="text-sm" />
                      <div v-else>
                        <input 
                          type="file" 
                          accept="image/*" 
                          @change="(e) => handleGalleryImageUpload(e, idx)" 
                          class="hidden" 
                          :ref="el => galleryImageInputs[idx] = el"
                        />
                        <button 
                          type="button" 
                          @click="galleryImageInputs[idx]?.click()" 
                          class="w-full py-2 px-4 border border-dashed border-dark-100 rounded text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-colors text-sm"
                          :disabled="uploadingGalleryImage[idx]"
                        >
                          <span v-if="uploadingGalleryImage[idx]" class="flex items-center justify-center gap-2">
                            <span class="spinner w-3 h-3"></span> Uploading...
                          </span>
                          <span v-else>{{ img.url ? 'Change Image' : 'Choose Image' }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Caption -->
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Caption</label>
                  <input v-model="img.caption" type="text" placeholder="Enter caption" class="text-sm" />
                </div>
              </div>
              
              <!-- Delete Button -->
              <button type="button" @click="removeGalleryImage(idx)" class="self-start p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="form.gallery.length === 0" class="text-center py-8 text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>No gallery images added yet</p>
          <button type="button" @click="addGalleryImage" class="mt-2 text-primary-400 hover:text-primary-300">
            + Add first image
          </button>
        </div>
      </div>

      <!-- Main Character -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Main Character Feature</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Character Name</label>
            <input v-model="form.mainCharacter.name" type="text" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Actor Name</label>
            <input v-model="form.mainCharacter.actor" type="text" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-300 mb-1">Character Image</label>
            <div class="flex gap-2 mb-2">
              <button 
                type="button" 
                @click="mainCharacterImageType = 'url'" 
                :class="['px-3 py-1 text-xs rounded-full transition-colors', mainCharacterImageType === 'url' ? 'bg-primary-600 text-white' : 'bg-dark-300 text-gray-400 hover:bg-dark-100']"
              >
                URL
              </button>
              <button 
                type="button" 
                @click="mainCharacterImageType = 'upload'" 
                :class="['px-3 py-1 text-xs rounded-full transition-colors', mainCharacterImageType === 'upload' ? 'bg-primary-600 text-white' : 'bg-dark-300 text-gray-400 hover:bg-dark-100']"
              >
                Upload
              </button>
            </div>
            <div v-if="mainCharacterImageType === 'url'">
              <input v-model="form.mainCharacter.image" type="text" placeholder="https://..." />
            </div>
            <div v-else>
              <input 
                type="file" 
                accept="image/*" 
                @change="handleMainCharacterImageUpload" 
                class="hidden" 
                ref="mainCharacterImageInput"
              />
              <button 
                type="button" 
                @click="mainCharacterImageInput?.click()" 
                class="w-full py-2 px-4 border-2 border-dashed border-dark-100 rounded-lg text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-colors"
                :disabled="uploadingMainCharacterImage"
              >
                <span v-if="uploadingMainCharacterImage" class="flex items-center justify-center gap-2">
                  <span class="spinner w-4 h-4"></span> Uploading...
                </span>
                <span v-else>Choose Image</span>
              </button>
            </div>
            <div v-if="form.mainCharacter.image" class="mt-2 relative inline-block">
              <img :src="getApiUrl(form.mainCharacter.image)" alt="Character" class="w-24 h-24 object-cover rounded-lg" />
              <button 
                type="button" 
                @click="form.mainCharacter.image = ''" 
                class="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-500"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-300 mb-1">Character Description</label>
            <textarea v-model="form.mainCharacter.description" rows="3"></textarea>
          </div>
        </div>
      </div>

      <!-- Settings -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Settings</h2>
        <div class="flex flex-wrap gap-6">
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.isActive" type="checkbox" class="w-4 h-4 rounded bg-dark-200 border-dark-100" />
            <span class="text-gray-300">Active (visible on website)</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.highlight" type="checkbox" class="w-4 h-4 rounded bg-dark-200 border-dark-100" />
            <span class="text-gray-300">Featured Movie (Hero Section)</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.showOnHomepage" type="checkbox" class="w-4 h-4 rounded bg-dark-200 border-dark-100" />
            <span class="text-gray-300">Show on Homepage</span>
          </label>
        </div>
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-300 mb-1">Display Order (lower number = shows first)</label>
          <input v-model.number="form.order" type="number" min="0" class="w-32" placeholder="0" />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4">
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <span v-if="saving" class="spinner"></span>
          <span v-else>{{ isEdit ? 'Update Movie' : 'Create Movie' }}</span>
        </button>
        <router-link to="/movies" class="btn btn-secondary">Cancel</router-link>
        <router-link v-if="isEdit" :to="`/movies/${route.params.id}/display-order`" class="btn btn-secondary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
          Set Display Order
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { moviesAPI, uploadAPI, teamAPI } from '@/services/api'
import { useToastStore } from '@/stores/toast'
import { getApiUrl } from '@/utils/imageUrl'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const isEdit = computed(() => route.params.id && route.params.id !== 'new')
const loadingData = ref(false)
const saving = ref(false)

// Image type toggles
const posterImageType = ref('url')
const bannerImageType = ref('url')
const uploadingPoster = ref(false)
const uploadingBanner = ref(false)

// Trailer handling
const trailerSourceType = ref('url')
const uploadingTrailer = ref(false)
const trailerUploadProgress = ref(0)

// Cast image handling
const castImageInputs = ref({})
const uploadingCastImage = ref({})

// Main character image handling
const mainCharacterImageType = ref('url')
const uploadingMainCharacterImage = ref(false)
const mainCharacterImageInput = ref(null)

// Gallery image handling
const galleryImageInputs = ref({})
const uploadingGalleryImage = ref({})

// Producer photo upload handling
const uploadingProducerPhoto = ref({})

// Producer selection
const showProducerDropdown = ref(false)
const producerSearchQuery = ref('')
const existingProducers = ref([])
const loadingProducers = ref(false)

// Computed for filtered producers based on search
const filteredProducers = computed(() => {
  if (!producerSearchQuery.value) return existingProducers.value
  const query = producerSearchQuery.value.toLowerCase()
  return existingProducers.value.filter(p => 
    p.name?.toLowerCase().includes(query) || 
    p.designation?.toLowerCase().includes(query)
  )
})

// Check if producer is already added
const isProducerAlreadyAdded = (producer) => {
  return form.value.credits.producers.some(p => p.name === producer.name)
}

// Add producer from existing list
const addProducerFromList = (producer) => {
  if (isProducerAlreadyAdded(producer)) return
  form.value.credits.producers.push({
    name: producer.name,
    role: producer.designation || 'Producer',
    photoUrl: producer.photoUrl || '',
    fromExisting: true // Flag to indicate this came from existing producers
  })
  showProducerDropdown.value = false
  producerSearchQuery.value = ''
}

// Fetch existing team members (producers)
const fetchProducers = async () => {
  loadingProducers.value = true
  try {
    const response = await teamAPI.getAll()
    existingProducers.value = response.data.data || []
  } catch (error) {
    console.error('Failed to fetch team members:', error)
  } finally {
    loadingProducers.value = false
  }
}

// Computed for featured count
const featuredCount = computed(() => {
  return form.value.gallery.filter(img => img.featured).length
})

const defaultForm = () => ({
  title: '',
  slug: '',
  year: new Date().getFullYear(),
  language: 'Hindi',
  duration: '',
  genre: '',
  status: 'announced',
  tagline: '',
  synopsis: '',
  posterUrl: '',
  bannerUrl: '',
  thumbnailUrl: '', // Compressed thumbnail for fast list loading
  trailer: {
    type: 'youtube',
    url: '',
    thumbnail: ''
  },
  credits: {
    producers: [],
    directors: [],
    writers: [],
    leadCast: [],
    supportingCast: [],
    specialAppearances: [],
    cinematographer: '',
    editor: '',
    musicDirector: '',
    backgroundScore: '',
    lyricist: '',
    choreographer: '',
    playbackSingers: '',
    productionManager: '',
    associateDirector: '',
    artDirector: '',
    costumeDesigner: '',
    makeupArtist: ''
  },
  distribution: {
    distributor: '',
    distributorLogo: '',
    platforms: '',
    territories: ''
  },
  awards: [],
  socialMedia: {
    instagram: '',
    facebook: '',
    youtube: '',
    twitter: '',
    hashtag: ''
  },
  gallery: [],
  mainCharacter: {
    name: '',
    actor: '',
    image: '',
    description: ''
  },
  isActive: true,
  highlight: false,
  showOnHomepage: true,
  order: 0,
  displayOrder: {
    sections: [
      { id: 'production', label: 'Production Credits', visible: true, order: 0 },
      { id: 'creative', label: 'Creative Team', visible: true, order: 1 },
      { id: 'productionTeam', label: 'Technical & Production Team', visible: true, order: 2 },
      { id: 'cast', label: 'Cast', visible: true, order: 3 },
      { id: 'gallery', label: 'Gallery', visible: true, order: 4 },
      { id: 'distribution', label: 'Distribution', visible: true, order: 5 },
      { id: 'awards', label: 'Awards & Recognition', visible: true, order: 6 },
      { id: 'socialMedia', label: 'Social Media', visible: true, order: 7 }
    ],
    creditsOrder: {
      producers: 0,
      directors: 1,
      writers: 2,
      cinematographer: 3,
      musicDirector: 4,
      editor: 5
    }
  }
})

const form = ref(defaultForm())

// Auto-generate slug from title
watch(() => form.value.title, (newTitle) => {
  if (!isEdit.value && newTitle) {
    form.value.slug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
})

async function fetchMovie() {
  if (!isEdit.value) return
  
  loadingData.value = true
  try {
    const response = await moviesAPI.getById(route.params.id)
    const movie = response.data.data
    
    // Map cast data from model fields (role, photoUrl) to form fields (character, image)
    const mapCastToForm = (castArray) => {
      if (!castArray) return []
      return castArray.map(item => ({
        name: item.name || '',
        character: item.role || '',
        image: item.photoUrl || '',
        imageType: item.photoUrl && item.photoUrl.startsWith('/uploads/') ? 'upload' : 'url'
      }))
    }
    
    // Map gallery items to include imageType and featured
    const mapGalleryToForm = (galleryArray) => {
      if (!galleryArray) return []
      return galleryArray.map(item => ({
        url: item.url || '',
        caption: item.caption || '',
        imageType: item.url && item.url.startsWith('/uploads/') ? 'upload' : 'url',
        featured: item.featured || false
      }))
    }
    
    // Helper to convert old string array format to new object format
    const convertCrewToObjects = (arr) => {
      if (!arr || !Array.isArray(arr)) return []
      return arr.map(item => {
        if (typeof item === 'string') {
          return { name: item, role: '' }
        }
        return item
      })
    }
    
    // Merge old 'producer' field with new 'producers' field
    const getProducers = () => {
      const oldProducers = convertCrewToObjects(movie.credits?.producer)
      const newProducers = convertCrewToObjects(movie.credits?.producers)
      // Combine and remove duplicates by name
      const all = [...newProducers, ...oldProducers]
      const seen = new Set()
      return all.filter(p => {
        if (!p.name || seen.has(p.name)) return false
        seen.add(p.name)
        return true
      })
    }
    
    form.value = {
      ...defaultForm(),
      ...movie,
      gallery: mapGalleryToForm(movie.gallery),
      credits: {
        producers: getProducers(),
        directors: convertCrewToObjects(movie.credits?.directors || movie.credits?.director),
        writers: convertCrewToObjects(movie.credits?.writers || movie.credits?.writer),
        leadCast: mapCastToForm(movie.credits?.leadCast),
        supportingCast: mapCastToForm(movie.credits?.supportingCast),
        specialAppearances: mapCastToForm(movie.credits?.specialAppearances),
        cinematographer: movie.credits?.cinematographer || '',
        editor: movie.credits?.editor || '',
        musicDirector: movie.credits?.musicDirector || '',
        backgroundScore: movie.credits?.backgroundScore || '',
        lyricist: Array.isArray(movie.credits?.lyricist) ? movie.credits.lyricist.join(', ') : movie.credits?.lyricist || '',
        choreographer: Array.isArray(movie.credits?.choreographer) ? movie.credits.choreographer.join(', ') : movie.credits?.choreographer || '',
        playbackSingers: Array.isArray(movie.credits?.playbackSingers) ? movie.credits.playbackSingers.join(', ') : movie.credits?.playbackSingers || '',
        productionManager: movie.credits?.productionManager || '',
        associateDirector: movie.credits?.associateDirector || '',
        artDirector: movie.credits?.artDirector || '',
        costumeDesigner: movie.credits?.costumeDesigner || '',
        makeupArtist: movie.credits?.makeupArtist || ''
      },
      distribution: {
        distributor: movie.distribution?.distributor || '',
        distributorLogo: movie.distribution?.distributorLogo || '',
        platforms: Array.isArray(movie.distribution?.platforms) ? movie.distribution.platforms.join(', ') : movie.distribution?.platforms || '',
        territories: Array.isArray(movie.distribution?.territories) ? movie.distribution.territories.join(', ') : movie.distribution?.territories || ''
      },
      awards: movie.awards || [],
      socialMedia: {
        instagram: movie.socialMedia?.instagram || '',
        facebook: movie.socialMedia?.facebook || '',
        youtube: movie.socialMedia?.youtube || '',
        twitter: movie.socialMedia?.twitter || '',
        hashtag: movie.socialMedia?.hashtag || ''
      },
      trailer: {
        ...defaultForm().trailer,
        ...movie.trailer
      },
      mainCharacter: {
        name: movie.mainCharacter?.name || '',
        actor: movie.mainCharacter?.actor || '',
        image: movie.mainCharacter?.imageUrl || movie.mainCharacter?.image || '',
        description: movie.mainCharacter?.description || ''
      },
      showOnHomepage: movie.showOnHomepage !== undefined ? movie.showOnHomepage : true,
      order: movie.order || 0,
      displayOrder: movie.displayOrder?.sections?.length 
        ? movie.displayOrder 
        : defaultForm().displayOrder
    }
    
    // Set image type based on whether it's an uploaded file or external URL
    if (movie.posterUrl && movie.posterUrl.startsWith('/uploads/')) {
      posterImageType.value = 'upload'
    } else {
      posterImageType.value = 'url'
    }
    
    if (movie.bannerUrl && movie.bannerUrl.startsWith('/uploads/')) {
      bannerImageType.value = 'upload'
    } else {
      bannerImageType.value = 'url'
    }
    
    // Set main character image type
    const mainCharImage = movie.mainCharacter?.image || movie.mainCharacter?.imageUrl
    if (mainCharImage && mainCharImage.startsWith('/uploads/')) {
      mainCharacterImageType.value = 'upload'
    } else {
      mainCharacterImageType.value = 'url'
    }
    
    // Set trailer source type based on trailer type and URL
    if (movie.trailer?.type === 'local' || (movie.trailer?.url && movie.trailer.url.startsWith('/uploads/'))) {
      trailerSourceType.value = 'upload'
      // Ensure form trailer type is set to 'local' for uploaded videos
      if (form.value.trailer.url && form.value.trailer.url.startsWith('/uploads/')) {
        form.value.trailer.type = 'local'
      }
    } else {
      trailerSourceType.value = 'url'
    }
  } catch (error) {
    toast.error('Failed to load movie')
    router.push('/movies')
  } finally {
    loadingData.value = false
  }
}

onMounted(() => {
  fetchMovie()
  fetchProducers()
})

function addCredit(type) {
  form.value.credits[type].push({ name: '', role: '', photoUrl: '', fromExisting: false })
}

function removeCredit(type, index) {
  form.value.credits[type].splice(index, 1)
}

function addCast(type) {
  form.value.credits[type].push({ name: '', character: '', image: '', imageType: 'url' })
}

function removeCast(type, index) {
  form.value.credits[type].splice(index, 1)
}

function addAward() {
  if (!form.value.awards) form.value.awards = []
  form.value.awards.push({ name: '', category: '', year: '', result: 'nominated' })
}

function removeAward(index) {
  form.value.awards.splice(index, 1)
}

function addGalleryImage() {
  form.value.gallery.push({ url: '', caption: '', imageType: 'url', featured: false })
}

function removeGalleryImage(index) {
  form.value.gallery.splice(index, 1)
}

function toggleFeatured(index) {
  const currentFeaturedCount = form.value.gallery.filter(img => img.featured).length
  const isCurrentlyFeatured = form.value.gallery[index].featured
  
  // Allow toggling off, or toggling on if less than 6 featured
  if (isCurrentlyFeatured || currentFeaturedCount < 6) {
    form.value.gallery[index].featured = !isCurrentlyFeatured
  } else {
    toast.error('Maximum 6 featured images allowed')
  }
}

async function handleGalleryImageUpload(event, index) {
  const file = event.target.files[0]
  if (!file) return
  
  uploadingGalleryImage.value[index] = true
  
  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('category', 'gallery')
    formData.append('thumbnailWidth', '600')
    formData.append('thumbnailQuality', '80')
    if (form.value.title) {
      formData.append('seoName', form.value.title + '-gallery')
    }
    
    const response = await uploadAPI.uploadImage(formData)
    form.value.gallery[index].url = response.data.data.url
    // Keep upload tab selected after successful upload
    form.value.gallery[index].imageType = 'upload'
    toast.success('Gallery image uploaded successfully')
  } catch (error) {
    toast.error('Failed to upload gallery image')
  } finally {
    uploadingGalleryImage.value[index] = false
    event.target.value = ''
  }
}

// Image upload handlers
async function handlePosterUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  uploadingPoster.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('category', 'posters')
    formData.append('thumbnailWidth', '600')  // Thumbnail for list views
    formData.append('thumbnailQuality', '80')
    if (form.value.title) {
      formData.append('seoName', form.value.title + '-poster')
    }
    
    const response = await uploadAPI.uploadImage(formData)
    // Store both original and thumbnail URLs
    form.value.posterUrl = response.data.data.url
    form.value.thumbnailUrl = response.data.data.thumbnailUrl
    // Keep upload tab selected after successful upload
    posterImageType.value = 'upload'
    toast.success('Poster uploaded successfully')
  } catch (error) {
    toast.error('Failed to upload poster')
  } finally {
    uploadingPoster.value = false
    event.target.value = ''
  }
}

async function handleBannerUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  uploadingBanner.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('category', 'posters')
    formData.append('thumbnailWidth', '1200')  // Slightly smaller thumbnail for banners
    formData.append('thumbnailQuality', '80')
    if (form.value.title) {
      formData.append('seoName', form.value.title + '-banner')
    }
    
    const response = await uploadAPI.uploadImage(formData)
    form.value.bannerUrl = response.data.data.url
    // Keep upload tab selected after successful upload
    bannerImageType.value = 'upload'
    toast.success('Banner uploaded successfully')
  } catch (error) {
    toast.error('Failed to upload banner')
  } finally {
    uploadingBanner.value = false
    event.target.value = ''
  }
}

// Trailer video upload handler
async function handleTrailerUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  // Validate file size (1.5GB max)
  if (file.size > 1536 * 1024 * 1024) {
    toast.error('Video file is too large. Maximum size is 1.5GB.')
    event.target.value = ''
    return
  }
  
  uploadingTrailer.value = true
  trailerUploadProgress.value = 0
  
  try {
    const formData = new FormData()
    formData.append('video', file)
    
    const response = await uploadAPI.uploadVideo(formData, (progressEvent) => {
      trailerUploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
    })
    
    form.value.trailer.url = response.data.data.url
    form.value.trailer.type = 'local'
    trailerSourceType.value = 'upload'
    toast.success('Trailer video uploaded successfully')
  } catch (error) {
    console.error('Trailer upload error:', error)
    toast.error('Failed to upload trailer video')
  } finally {
    uploadingTrailer.value = false
    trailerUploadProgress.value = 0
    event.target.value = ''
  }
}

// Get trailer embed URL for preview
function getTrailerPreviewUrl() {
  const url = form.value.trailer.url
  if (!url) return ''
  
  // Local/uploaded video - resolve to full API URL
  if (url.startsWith('/uploads/')) {
    // Don't modify type for local videos
    return getApiUrl(url)
  }
  
  // YouTube handling
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = ''
    
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split(/[?&#]/)[0]
    } else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('shorts/')[1]?.split(/[?&#]/)[0]
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split(/[?&#]/)[0]
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split(/[?&#]/)[0]
    }
    
    if (videoId) {
      // Only update type if not already local
      if (form.value.trailer.type !== 'local') {
        form.value.trailer.type = 'youtube'
      }
      return `https://www.youtube.com/embed/${videoId}?rel=0`
    }
  }
  
  // Vimeo handling
  if (url.includes('vimeo.com')) {
    const vimeoId = url.split('vimeo.com/')[1]?.split(/[?&#]/)[0]
    if (vimeoId) {
      // Only update type if not already local
      if (form.value.trailer.type !== 'local') {
        form.value.trailer.type = 'vimeo'
      }
      return `https://player.vimeo.com/video/${vimeoId}`
    }
  }
  
  return url
}

// Clear trailer
function clearTrailer() {
  form.value.trailer.url = ''
  form.value.trailer.thumbnail = ''
  form.value.trailer.type = 'youtube'
}

async function handleCastImageUpload(event, castType, index) {
  const file = event.target.files[0]
  if (!file) return
  
  const key = `${castType}_${index}`
  uploadingCastImage.value[key] = true
  
  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('category', 'posters')
    formData.append('thumbnailWidth', '300')
    formData.append('thumbnailQuality', '80')
    if (form.value.title) {
      const actorName = form.value.credits[castType]?.[index]?.name || ''
      formData.append('seoName', form.value.title + '-cast-' + actorName)
    }
    
    const response = await uploadAPI.uploadImage(formData)
    form.value.credits[castType][index].image = response.data.data.url
    // Keep upload tab selected after successful upload
    form.value.credits[castType][index].imageType = 'upload'
    toast.success('Cast photo uploaded successfully')
  } catch (error) {
    toast.error('Failed to upload cast photo')
  } finally {
    uploadingCastImage.value[key] = false
    event.target.value = ''
  }
}

async function handleMainCharacterImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  uploadingMainCharacterImage.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('category', 'posters')
    formData.append('thumbnailWidth', '400')
    formData.append('thumbnailQuality', '80')
    if (form.value.title) {
      const charName = form.value.mainCharacter?.name || ''
      formData.append('seoName', form.value.title + '-character-' + charName)
    }
    
    const response = await uploadAPI.uploadImage(formData)
    form.value.mainCharacter.image = response.data.data.url
    // Keep upload tab selected after successful upload
    mainCharacterImageType.value = 'upload'
    toast.success('Character image uploaded successfully')
  } catch (error) {
    toast.error('Failed to upload character image')
  } finally {
    uploadingMainCharacterImage.value = false
    event.target.value = ''
  }
}

// Handle producer photo upload
async function handleProducerPhotoUpload(event, index) {
  const file = event.target.files[0]
  if (!file) return
  
  uploadingProducerPhoto.value[index] = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('category', 'producers')
    formData.append('thumbnailWidth', '400')
    formData.append('thumbnailQuality', '85')
    if (form.value.title) {
      const producerName = form.value.credits.producers[index]?.name || ''
      formData.append('seoName', form.value.title + '-producer-' + producerName)
    }
    
    const response = await uploadAPI.uploadImage(formData)
    form.value.credits.producers[index].photoUrl = response.data.data.url
    toast.success('Producer photo uploaded successfully')
  } catch (error) {
    toast.error('Failed to upload producer photo')
  } finally {
    uploadingProducerPhoto.value[index] = false
    event.target.value = ''
  }
}

async function saveMovie() {
  saving.value = true
  try {
    // Clean up empty entries
    const data = { ...form.value }
    
    // Filter out empty entries and map field names for cast members
    // Form uses 'character' and 'image', model expects 'role' and 'photoUrl'
    const castTypes = ['leadCast', 'supportingCast', 'specialAppearances']
    for (const type of castTypes) {
      if (data.credits[type]) {
        data.credits[type] = data.credits[type]
          .filter(item => item.name)
          .map(item => ({
            name: item.name,
            role: item.character || item.role || '',
            photoUrl: item.image || item.photoUrl || ''
          }))
      }
    }
    
    // Filter other credit types (producers, directors, writers) and include photoUrl
    const crewTypes = ['producers', 'directors', 'writers']
    for (const type of crewTypes) {
      if (data.credits[type]) {
        data.credits[type] = data.credits[type]
          .filter(item => item.name)
          .map(item => ({
            name: item.name,
            role: item.role || '',
            photoUrl: item.photoUrl || ''
          }))
      }
    }
    
    // Convert comma-separated strings to arrays for certain fields
    const commaToArray = (str) => {
      if (!str || typeof str !== 'string') return []
      return str.split(',').map(s => s.trim()).filter(s => s)
    }
    
    // Convert string fields to arrays where needed
    if (data.credits.lyricist && typeof data.credits.lyricist === 'string') {
      data.credits.lyricist = commaToArray(data.credits.lyricist)
    }
    if (data.credits.choreographer && typeof data.credits.choreographer === 'string') {
      data.credits.choreographer = commaToArray(data.credits.choreographer)
    }
    if (data.credits.playbackSingers && typeof data.credits.playbackSingers === 'string') {
      data.credits.playbackSingers = commaToArray(data.credits.playbackSingers)
    }
    
    // Convert distribution fields
    if (data.distribution) {
      if (typeof data.distribution.platforms === 'string') {
        data.distribution.platforms = commaToArray(data.distribution.platforms)
      }
      if (typeof data.distribution.territories === 'string') {
        data.distribution.territories = commaToArray(data.distribution.territories)
      }
    }
    
    // Filter awards - remove empty entries
    if (data.awards) {
      data.awards = data.awards.filter(award => award.name)
    }
    
    // Filter gallery items and preserve featured flag
    data.gallery = data.gallery
      .filter(item => item.url)
      .map(item => ({
        url: item.url,
        caption: item.caption || '',
        featured: item.featured || false
      }))

    // Map mainCharacter.image to mainCharacter.imageUrl for backend
    if (data.mainCharacter) {
      data.mainCharacter = {
        name: data.mainCharacter.name || '',
        actor: data.mainCharacter.actor || '',
        imageUrl: data.mainCharacter.image || '',
        description: data.mainCharacter.description || ''
      }
    }

    // Ensure trailer type is correct for uploaded videos
    if (data.trailer && data.trailer.url) {
      if (data.trailer.url.startsWith('/uploads/')) {
        data.trailer.type = 'local'
      }
    }

    if (isEdit.value) {
      await moviesAPI.update(route.params.id, data)
      toast.success('Movie updated successfully')
    } else {
      await moviesAPI.create(data)
      toast.success('Movie created successfully')
    }
    router.push('/movies')
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to save movie'
    toast.error(message)
  } finally {
    saving.value = false
  }
}
</script>
