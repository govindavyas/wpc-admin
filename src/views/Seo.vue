<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">SEO Management</h1>
        <p class="text-gray-400 mt-1">Manage page-level SEO settings, meta tags, and structured data</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Page SEO
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <!-- SEO Records List -->
    <div v-else class="space-y-4">
      <!-- Search & Filter -->
      <div class="card">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search by page name or slug..." 
              class="w-full"
            />
          </div>
          <select v-model="filterType" class="md:w-48">
            <option value="">All Types</option>
            <option value="static">Static Pages</option>
            <option value="dynamic">Dynamic Pages</option>
            <option value="content">Content Pages</option>
          </select>
        </div>
      </div>

      <!-- Records Table -->
      <div class="card overflow-hidden">
        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left border-b border-gray-700">
                <th class="pb-3 px-4 text-sm font-medium text-gray-400">Page</th>
                <th class="pb-3 px-4 text-sm font-medium text-gray-400">Meta Title</th>
                <th class="pb-3 px-4 text-sm font-medium text-gray-400">Type</th>
                <th class="pb-3 px-4 text-sm font-medium text-gray-400">Status</th>
                <th class="pb-3 px-4 text-sm font-medium text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr v-for="seo in filteredSeoRecords" :key="seo._id" class="hover:bg-dark-200/50">
                <td class="py-3 px-4">
                  <div>
                    <p class="font-medium text-white">{{ seo.pageName }}</p>
                    <p class="text-sm text-gray-400">/{{ seo.pageSlug }}</p>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <p class="text-gray-300 text-sm truncate max-w-xs" :title="seo.metaTitle">
                    {{ seo.metaTitle }}
                  </p>
                  <p class="text-xs text-gray-500">{{ seo.metaTitle?.length || 0 }}/70 chars</p>
                </td>
                <td class="py-3 px-4">
                  <span 
                    class="px-2 py-1 text-xs rounded-full"
                    :class="{
                      'bg-blue-500/20 text-blue-400': seo.pageType === 'static',
                      'bg-purple-500/20 text-purple-400': seo.pageType === 'dynamic',
                      'bg-green-500/20 text-green-400': seo.pageType === 'content'
                    }"
                  >
                    {{ seo.pageType }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <button 
                    @click="toggleStatus(seo)"
                    class="px-2 py-1 text-xs rounded-full transition-colors"
                    :class="seo.isActive ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'"
                  >
                    {{ seo.isActive ? 'Active' : 'Inactive' }}
                  </button>
                </td>
                <td class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button 
                      @click="openEditModal(seo)" 
                      class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      @click="previewSeo(seo)" 
                      class="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button 
                      @click="confirmDelete(seo)" 
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

        <!-- Mobile Cards -->
        <div class="md:hidden space-y-4 p-4">
          <div 
            v-for="seo in filteredSeoRecords" 
            :key="seo._id" 
            class="bg-dark-200 rounded-lg p-4 space-y-3"
          >
            <!-- Page Info -->
            <div>
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <p class="font-medium text-white">{{ seo.pageName }}</p>
                  <p class="text-sm text-gray-400">/{{ seo.pageSlug }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span 
                    class="px-2 py-1 text-xs rounded-full whitespace-nowrap"
                    :class="{
                      'bg-blue-500/20 text-blue-400': seo.pageType === 'static',
                      'bg-purple-500/20 text-purple-400': seo.pageType === 'dynamic',
                      'bg-green-500/20 text-green-400': seo.pageType === 'content'
                    }"
                  >
                    {{ seo.pageType }}
                  </span>
                  <button 
                    @click="toggleStatus(seo)"
                    class="px-2 py-1 text-xs rounded-full transition-colors whitespace-nowrap"
                    :class="seo.isActive ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'"
                  >
                    {{ seo.isActive ? 'Active' : 'Inactive' }}
                  </button>
                </div>
              </div>
              
              <!-- Meta Title -->
              <div class="bg-dark-300 rounded p-2 mb-2">
                <p class="text-xs text-gray-400 mb-1">Meta Title</p>
                <p class="text-sm text-gray-300 line-clamp-2">{{ seo.metaTitle }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ seo.metaTitle?.length || 0 }}/70 chars</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-2 pt-2 border-t border-gray-700">
              <button 
                @click="openEditModal(seo)" 
                class="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button 
                @click="previewSeo(seo)" 
                class="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>
              <button 
                @click="confirmDelete(seo)" 
                class="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredSeoRecords.length === 0" class="py-12 text-center">
          <svg class="w-12 h-12 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p class="text-gray-400">No SEO records found</p>
          <button @click="openCreateModal" class="mt-4 btn btn-primary btn-sm">Add First Page</button>
        </div>
      </div>
    </div>

    <!-- Edit/Create Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 overflow-y-auto">
        <div class="bg-dark-100 rounded-xl w-full max-w-4xl my-8">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 class="text-xl font-semibold text-white">
              {{ isEditing ? 'Edit SEO Settings' : 'Add Page SEO' }}
            </h2>
            <button @click="closeModal" class="text-gray-400 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Content -->
          <form @submit.prevent="saveSeo" class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <!-- Tabs -->
            <div class="flex flex-wrap gap-2 border-b border-gray-700 pb-4">
              <button 
                type="button"
                v-for="tab in tabs" 
                :key="tab.id"
                @click="activeTab = tab.id"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="activeTab === tab.id ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-dark-200'"
              >
                {{ tab.label }}
              </button>
            </div>

            <!-- Basic Info Tab -->
            <div v-show="activeTab === 'basic'" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">
                    Page Name <span class="text-red-400">*</span>
                  </label>
                  <input v-model="form.pageName" type="text" required placeholder="e.g., Home, About Us" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">
                    Page Slug <span class="text-red-400">*</span>
                  </label>
                  <input v-model="form.pageSlug" type="text" required placeholder="e.g., home, the-company" />
                  <p class="text-xs text-gray-500 mt-1">URL: /{{ form.pageSlug }}</p>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Page Type</label>
                <select v-model="form.pageType">
                  <option value="static">Static Page</option>
                  <option value="dynamic">Dynamic Page</option>
                  <option value="content">Content Page</option>
                </select>
              </div>
            </div>

            <!-- Meta Tags Tab -->
            <div v-show="activeTab === 'meta'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  Meta Title <span class="text-red-400">*</span>
                  <span class="text-xs text-gray-500 ml-2">{{ form.metaTitle?.length || 0 }}/70</span>
                </label>
                <input v-model="form.metaTitle" type="text" required maxlength="70" placeholder="Page title for search engines" />
                <p class="text-xs text-gray-500 mt-1">Optimal: 50-60 characters</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  Meta Description <span class="text-red-400">*</span>
                  <span class="text-xs text-gray-500 ml-2">{{ form.metaDescription?.length || 0 }}/160</span>
                </label>
                <textarea v-model="form.metaDescription" rows="3" required maxlength="160" placeholder="Brief description for search results"></textarea>
                <p class="text-xs text-gray-500 mt-1">Optimal: 150-160 characters</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Meta Keywords</label>
                <input v-model="keywordsInput" type="text" placeholder="Comma-separated keywords" @blur="parseKeywords" />
                <div v-if="form.metaKeywords?.length" class="flex flex-wrap gap-2 mt-2">
                  <span 
                    v-for="(keyword, i) in form.metaKeywords" 
                    :key="i"
                    class="px-2 py-1 bg-dark-200 text-gray-300 text-xs rounded-full flex items-center gap-1"
                  >
                    {{ keyword }}
                    <button type="button" @click="removeKeyword(i)" class="text-gray-500 hover:text-red-400">×</button>
                  </span>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">Robots Meta</label>
                  <select v-model="form.robotsMeta">
                    <option value="index, follow">index, follow</option>
                    <option value="index, nofollow">index, nofollow</option>
                    <option value="noindex, follow">noindex, follow</option>
                    <option value="noindex, nofollow">noindex, nofollow</option>
                    <option value="index, follow, noarchive">index, follow, noarchive</option>
                    <option value="noindex, nofollow, noarchive">noindex, nofollow, noarchive</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">Canonical URL</label>
                  <input v-model="form.canonicalUrl" type="url" placeholder="https://whitepandacreations.com/page" />
                </div>
              </div>
            </div>

            <!-- Open Graph Tab -->
            <div v-show="activeTab === 'og'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  OG Title
                  <span class="text-xs text-gray-500 ml-2">{{ form.ogTitle?.length || 0 }}/95</span>
                </label>
                <input v-model="form.ogTitle" type="text" maxlength="95" placeholder="Title for social sharing" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  OG Description
                  <span class="text-xs text-gray-500 ml-2">{{ form.ogDescription?.length || 0 }}/200</span>
                </label>
                <textarea v-model="form.ogDescription" rows="3" maxlength="200" placeholder="Description for social sharing"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">OG Image URL</label>
                <input v-model="form.ogImage" type="url" placeholder="https://example.com/image.jpg" />
                <p class="text-xs text-gray-500 mt-1">Recommended: 1200x630 pixels</p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">OG Type</label>
                  <select v-model="form.ogType">
                    <option value="website">Website</option>
                    <option value="article">Article</option>
                    <option value="video.movie">Movie</option>
                    <option value="video.tv_show">TV Show</option>
                    <option value="profile">Profile</option>
                    <option value="product">Product</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">OG Locale</label>
                  <input v-model="form.ogLocale" type="text" placeholder="en_US" />
                </div>
              </div>
            </div>

            <!-- Twitter Tab -->
            <div v-show="activeTab === 'twitter'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Twitter Card Type</label>
                <select v-model="form.twitterCard">
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary Large Image</option>
                  <option value="player">Player</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Twitter Title</label>
                <input v-model="form.twitterTitle" type="text" maxlength="70" placeholder="Title for Twitter" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Twitter Description</label>
                <textarea v-model="form.twitterDescription" rows="3" maxlength="200" placeholder="Description for Twitter"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Twitter Image URL</label>
                <input v-model="form.twitterImage" type="url" placeholder="https://example.com/twitter-image.jpg" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">Twitter Site</label>
                  <input v-model="form.twitterSite" type="text" placeholder="@whitepandacreations" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">Twitter Creator</label>
                  <input v-model="form.twitterCreator" type="text" placeholder="@username" />
                </div>
              </div>
            </div>

            <!-- Schema Tab -->
            <div v-show="activeTab === 'schema'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Schema Type</label>
                <select v-model="form.schemaType">
                  <option value="WebPage">WebPage</option>
                  <option value="Organization">Organization</option>
                  <option value="WebSite">WebSite</option>
                  <option value="Movie">Movie</option>
                  <option value="Article">Article</option>
                  <option value="Person">Person</option>
                  <option value="LocalBusiness">LocalBusiness</option>
                  <option value="BreadcrumbList">BreadcrumbList</option>
                  <option value="FAQPage">FAQPage</option>
                  <option value="VideoObject">VideoObject</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  Schema JSON-LD
                  <button 
                    type="button" 
                    @click="validateSchema" 
                    class="ml-2 text-xs text-primary hover:text-primary-400"
                  >
                    Validate
                  </button>
                  <button 
                    type="button" 
                    @click="generateDefaultSchema" 
                    class="ml-2 text-xs text-blue-400 hover:text-blue-300"
                  >
                    Generate Default
                  </button>
                </label>
                <textarea 
                  v-model="schemaJsonString" 
                  rows="12" 
                  class="font-mono text-sm"
                  placeholder='{"@context": "https://schema.org", "@type": "WebPage", ...}'
                ></textarea>
                <p v-if="schemaError" class="text-xs text-red-400 mt-1">{{ schemaError }}</p>
                <p v-else-if="schemaValid" class="text-xs text-green-400 mt-1">✓ Valid JSON-LD schema</p>
              </div>
            </div>

            <!-- Sitemap Tab -->
            <div v-show="activeTab === 'sitemap'" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">Sitemap Priority</label>
                  <input v-model.number="form.sitemapPriority" type="number" step="0.1" min="0" max="1" />
                  <p class="text-xs text-gray-500 mt-1">0.0 (lowest) to 1.0 (highest)</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">Change Frequency</label>
                  <select v-model="form.sitemapChangeFreq">
                    <option value="always">Always</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Author</label>
                <input v-model="form.author" type="text" placeholder="WHITE PANDA CREATIONS" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Publisher</label>
                <input v-model="form.publisher" type="text" placeholder="WHITE PANDA CREATIONS" />
              </div>
            </div>
          </form>

          <!-- Modal Footer -->
          <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
            <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
            <button @click="saveSeo" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner mr-2"></span>
              {{ isEditing ? 'Update SEO' : 'Create SEO' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Preview Modal -->
    <Teleport to="body">
      <div v-if="showPreviewModal" class="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 overflow-y-auto">
        <div class="bg-dark-100 rounded-xl w-full max-w-2xl my-8">
          <div class="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 class="text-xl font-semibold text-white">SEO Preview</h2>
            <button @click="showPreviewModal = false" class="text-gray-400 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-6">
            <!-- Google Preview -->
            <div>
              <h3 class="text-sm font-medium text-gray-400 mb-3">Google Search Preview</h3>
              <div class="p-4 bg-white rounded-lg">
                <p class="text-blue-600 text-lg hover:underline cursor-pointer">
                  {{ previewData?.metaTitle || 'Page Title' }}
                </p>
                <p class="text-green-700 text-sm">
                  {{ previewData?.canonicalUrl || 'https://whitepandacreations.com/' }}
                </p>
                <p class="text-gray-600 text-sm mt-1">
                  {{ previewData?.metaDescription || 'Page description will appear here...' }}
                </p>
              </div>
            </div>

            <!-- Facebook Preview -->
            <div>
              <h3 class="text-sm font-medium text-gray-400 mb-3">Facebook/OG Preview</h3>
              <div class="border border-gray-700 rounded-lg overflow-hidden">
                <div class="bg-gray-800 h-40 flex items-center justify-center">
                  <img 
                    v-if="previewData?.ogImage" 
                    :src="getApiUrl(previewData.ogImage)" 
                    class="w-full h-full object-cover"
                    @error="(e) => e.target.style.display = 'none'"
                  />
                  <span v-else class="text-gray-500">OG Image Preview</span>
                </div>
                <div class="p-4 bg-dark-200">
                  <p class="text-xs text-gray-500 uppercase">whitepandacreations.com</p>
                  <p class="text-white font-medium mt-1">{{ previewData?.ogTitle || previewData?.metaTitle }}</p>
                  <p class="text-gray-400 text-sm mt-1">{{ previewData?.ogDescription || previewData?.metaDescription }}</p>
                </div>
              </div>
            </div>

            <!-- Twitter Preview -->
            <div>
              <h3 class="text-sm font-medium text-gray-400 mb-3">Twitter Card Preview</h3>
              <div class="border border-gray-700 rounded-lg overflow-hidden">
                <div class="bg-gray-800 h-32 flex items-center justify-center">
                  <img 
                    v-if="previewData?.twitterImage || previewData?.ogImage" 
                    :src="getApiUrl(previewData.twitterImage || previewData.ogImage)" 
                    class="w-full h-full object-cover"
                    @error="(e) => e.target.style.display = 'none'"
                  />
                  <span v-else class="text-gray-500">Twitter Image</span>
                </div>
                <div class="p-3 bg-dark-200">
                  <p class="text-white font-medium text-sm">{{ previewData?.twitterTitle || previewData?.ogTitle || previewData?.metaTitle }}</p>
                  <p class="text-gray-400 text-xs mt-1">{{ previewData?.twitterDescription || previewData?.ogDescription || previewData?.metaDescription }}</p>
                  <p class="text-gray-500 text-xs mt-2">🔗 whitepandacreations.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-100 rounded-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-red-400 mb-2">Delete SEO Record</h3>
          <p class="text-gray-400 mb-4">
            Are you sure you want to delete SEO settings for "{{ deleteTarget?.pageName }}"? This action cannot be undone.
          </p>
          <div class="flex gap-3 justify-end">
            <button @click="showDeleteModal = false" class="btn btn-secondary">Cancel</button>
            <button @click="deleteSeo" class="btn btn-danger" :disabled="deleting">
              <span v-if="deleting" class="spinner mr-2"></span>
              Delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { seoAPI } from '@/services/api'
import { useToastStore } from '@/stores/toast'
import { getApiUrl } from '@/utils/imageUrl'

const toast = useToastStore()

// State
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const seoRecords = ref([])
const searchQuery = ref('')
const filterType = ref('')

// Modal State
const showModal = ref(false)
const showPreviewModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const deleteTarget = ref(null)
const previewData = ref(null)
const activeTab = ref('basic')

// Form
const defaultForm = {
  pageName: '',
  pageSlug: '',
  pageType: 'static',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: [],
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  ogType: 'website',
  ogLocale: 'en_US',
  twitterCard: 'summary_large_image',
  twitterTitle: '',
  twitterDescription: '',
  twitterImage: '',
  twitterSite: '@whitepandacreations',
  twitterCreator: '',
  canonicalUrl: '',
  robotsMeta: 'index, follow',
  schemaType: 'WebPage',
  schemaJson: null,
  sitemapPriority: 0.5,
  sitemapChangeFreq: 'weekly',
  author: 'WHITE PANDA CREATIONS',
  publisher: 'WHITE PANDA CREATIONS',
  isActive: true
}

const form = ref({ ...defaultForm })
const keywordsInput = ref('')
const schemaJsonString = ref('')
const schemaError = ref('')
const schemaValid = ref(false)

// Tabs
const tabs = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'meta', label: 'Meta Tags' },
  { id: 'og', label: 'Open Graph' },
  { id: 'twitter', label: 'Twitter' },
  { id: 'schema', label: 'Schema' },
  { id: 'sitemap', label: 'Sitemap' }
]

// Computed
const filteredSeoRecords = computed(() => {
  let records = [...seoRecords.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    records = records.filter(seo => 
      seo.pageName?.toLowerCase().includes(query) ||
      seo.pageSlug?.toLowerCase().includes(query) ||
      seo.metaTitle?.toLowerCase().includes(query)
    )
  }
  
  if (filterType.value) {
    records = records.filter(seo => seo.pageType === filterType.value)
  }
  
  return records
})

// Watch schema string for validation
watch(schemaJsonString, (value) => {
  schemaError.value = ''
  schemaValid.value = false
  
  if (!value.trim()) return
  
  try {
    const parsed = JSON.parse(value)
    if (!parsed['@context'] || !parsed['@type']) {
      schemaError.value = 'Schema must include @context and @type'
    } else {
      schemaValid.value = true
      form.value.schemaJson = parsed
    }
  } catch (e) {
    schemaError.value = 'Invalid JSON format'
  }
})

// Methods
async function loadSeoRecords() {
  loading.value = true
  try {
    const response = await seoAPI.getAll()
    seoRecords.value = response.data?.data || []
  } catch (error) {
    toast.error('Failed to load SEO records')
    console.error(error)
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  isEditing.value = false
  editingId.value = null
  form.value = { ...defaultForm }
  keywordsInput.value = ''
  schemaJsonString.value = ''
  schemaError.value = ''
  schemaValid.value = false
  activeTab.value = 'basic'
  showModal.value = true
}

function openEditModal(seo) {
  isEditing.value = true
  editingId.value = seo._id
  form.value = { ...seo }
  keywordsInput.value = seo.metaKeywords?.join(', ') || ''
  schemaJsonString.value = seo.schemaJson ? JSON.stringify(seo.schemaJson, null, 2) : ''
  schemaError.value = ''
  schemaValid.value = !!seo.schemaJson
  activeTab.value = 'basic'
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  form.value = { ...defaultForm }
}

function parseKeywords() {
  if (!keywordsInput.value.trim()) return
  
  const keywords = keywordsInput.value
    .split(',')
    .map(k => k.trim())
    .filter(k => k && !form.value.metaKeywords?.includes(k))
  
  form.value.metaKeywords = [...(form.value.metaKeywords || []), ...keywords]
  keywordsInput.value = ''
}

function removeKeyword(index) {
  form.value.metaKeywords.splice(index, 1)
}

async function validateSchema() {
  if (!schemaJsonString.value.trim()) {
    schemaError.value = 'No schema to validate'
    return
  }
  
  try {
    const response = await seoAPI.validateSchema(schemaJsonString.value)
    if (response.data?.isValid) {
      toast.success('Schema is valid!')
      schemaValid.value = true
      schemaError.value = ''
    } else {
      schemaError.value = response.data?.validation?.errors?.join(', ') || 'Invalid schema'
    }
  } catch (e) {
    schemaError.value = 'Validation failed'
  }
}

function generateDefaultSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': form.value.schemaType || 'WebPage',
    'name': form.value.pageName || 'Page Name',
    'description': form.value.metaDescription || 'Page description',
    'url': form.value.canonicalUrl || `https://whitepandacreations.com/${form.value.pageSlug || ''}`
  }
  
  schemaJsonString.value = JSON.stringify(schema, null, 2)
  form.value.schemaJson = schema
  schemaValid.value = true
}

async function saveSeo() {
  // Parse schema JSON if present
  if (schemaJsonString.value.trim()) {
    try {
      form.value.schemaJson = JSON.parse(schemaJsonString.value)
    } catch (e) {
      toast.error('Invalid schema JSON')
      return
    }
  }
  
  saving.value = true
  try {
    if (isEditing.value) {
      await seoAPI.update(editingId.value, form.value)
      toast.success('SEO record updated successfully')
    } else {
      await seoAPI.create(form.value)
      toast.success('SEO record created successfully')
    }
    
    closeModal()
    await loadSeoRecords()
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to save SEO record'
    toast.error(message)
  } finally {
    saving.value = false
  }
}

async function toggleStatus(seo) {
  try {
    await seoAPI.toggle(seo._id)
    seo.isActive = !seo.isActive
    toast.success(`SEO ${seo.isActive ? 'activated' : 'deactivated'}`)
  } catch (error) {
    toast.error('Failed to update status')
  }
}

function previewSeo(seo) {
  previewData.value = seo
  showPreviewModal.value = true
}

function confirmDelete(seo) {
  deleteTarget.value = seo
  showDeleteModal.value = true
}

async function deleteSeo() {
  if (!deleteTarget.value) return
  
  deleting.value = true
  try {
    await seoAPI.delete(deleteTarget.value._id)
    toast.success('SEO record deleted')
    showDeleteModal.value = false
    deleteTarget.value = null
    await loadSeoRecords()
  } catch (error) {
    toast.error('Failed to delete SEO record')
  } finally {
    deleting.value = false
  }
}

// Initialize
onMounted(loadSeoRecords)
</script>


