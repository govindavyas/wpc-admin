<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white">Settings</h1>
      <p class="text-gray-400 mt-1">Configure application settings</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="spinner w-8 h-8"></div>
    </div>

    <!-- Settings -->
    <div v-else class="space-y-6">
      <!-- Profile Settings -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Profile Settings</h2>
        <form @submit.prevent="updateProfile" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input v-model="profileForm.name" type="text" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input v-model="profileForm.email" type="email" disabled class="opacity-60" />
            </div>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="savingProfile">
            <span v-if="savingProfile" class="spinner"></span>
            <span v-else>Update Profile</span>
          </button>
        </form>
      </div>

      <!-- Change Password -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Change Password</h2>
        <form @submit.prevent="changePassword" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
              <input v-model="passwordForm.currentPassword" type="password" required />
            </div>
            <div></div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">New Password</label>
              <input v-model="passwordForm.newPassword" type="password" required minlength="6" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
              <input v-model="passwordForm.confirmPassword" type="password" required minlength="6" />
            </div>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="savingPassword">
            <span v-if="savingPassword" class="spinner"></span>
            <span v-else>Change Password</span>
          </button>
        </form>
      </div>

      <!-- Application Settings -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Application Settings</h2>
        <form @submit.prevent="saveSettings" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Site Name</label>
              <input v-model="settingsForm.siteName" type="text" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Items Per Page</label>
              <select v-model.number="settingsForm.itemsPerPage">
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>
          <div class="space-y-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="settingsForm.maintenanceMode" type="checkbox" class="w-4 h-4 rounded bg-dark-200 border-dark-100" />
              <span class="text-gray-300">Maintenance Mode</span>
            </label>
            <div v-if="settingsForm.maintenanceMode" class="ml-6 mt-2">
              <label class="block text-sm font-medium text-gray-300 mb-1">Maintenance Message</label>
              <textarea 
                v-model="settingsForm.maintenanceMessage" 
                rows="3" 
                class="w-full px-3 py-2 bg-dark-200 border border-dark-100 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="We're currently performing scheduled maintenance to improve your experience."
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">This message will be displayed to visitors during maintenance mode</p>
            </div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="settingsForm.enableRegistration" type="checkbox" class="w-4 h-4 rounded bg-dark-200 border-dark-100" />
              <span class="text-gray-300">Enable User Registration</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="settingsForm.enableAnalytics" type="checkbox" class="w-4 h-4 rounded bg-dark-200 border-dark-100" />
              <span class="text-gray-300">Enable Analytics Tracking</span>
            </label>
            <p v-if="settingsForm.enableAnalytics" class="ml-6 text-xs text-gray-500">
              Analytics tracking is currently <span class="text-green-400 font-medium">ENABLED</span>. Visitor data is being collected.
            </p>
            <p v-else class="ml-6 text-xs text-yellow-500">
              Analytics tracking is currently <span class="font-medium">DISABLED</span>. No visitor data is being collected.
            </p>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="savingSettings">
            <span v-if="savingSettings" class="spinner"></span>
            <span v-else>Save Settings</span>
          </button>
        </form>
      </div>

      <!-- Theme Settings -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Section Visibility</h2>
        <p class="text-sm text-gray-400 mb-4">Control which sections are visible on the website</p>
        <form @submit.prevent="saveSettings" class="space-y-4">
          <!-- Main Sections -->
          <div class="space-y-3">
            <h3 class="text-sm font-semibold text-gray-300 uppercase tracking-wide">Main Sections</h3>
            <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-dark-200 transition-colors">
              <input v-model="settingsForm.sections.home" type="checkbox" class="w-5 h-5 rounded bg-dark-200 border-dark-100 text-primary-500 focus:ring-primary-500" />
              <div class="flex-1">
                <span class="text-gray-200 font-medium">Home Section</span>
                <p class="text-xs text-gray-500">Hero/Banner section on homepage</p>
              </div>
            </label>
            <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-dark-200 transition-colors">
              <input v-model="settingsForm.sections.about" type="checkbox" class="w-5 h-5 rounded bg-dark-200 border-dark-100 text-primary-500 focus:ring-primary-500" />
              <div class="flex-1">
                <span class="text-gray-200 font-medium">About Section</span>
                <p class="text-xs text-gray-500">About us information and navigation link</p>
              </div>
            </label>
            <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-dark-200 transition-colors">
              <input v-model="settingsForm.sections.films" type="checkbox" class="w-5 h-5 rounded bg-dark-200 border-dark-100 text-primary-500 focus:ring-primary-500" />
              <div class="flex-1">
                <span class="text-gray-200 font-medium">Films Section</span>
                <p class="text-xs text-gray-500">Movies/Films showcase and navigation link</p>
              </div>
            </label>
            <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-dark-200 transition-colors">
              <input v-model="settingsForm.sections.news" type="checkbox" class="w-5 h-5 rounded bg-dark-200 border-dark-100 text-primary-500 focus:ring-primary-500" />
              <div class="flex-1">
                <span class="text-gray-200 font-medium">News Section</span>
                <p class="text-xs text-gray-500">Latest news and navigation link</p>
              </div>
            </label>
            <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-dark-200 transition-colors">
              <input v-model="settingsForm.sections.contact" type="checkbox" class="w-5 h-5 rounded bg-dark-200 border-dark-100 text-primary-500 focus:ring-primary-500" />
              <div class="flex-1">
                <span class="text-gray-200 font-medium">Contact Section</span>
                <p class="text-xs text-gray-500">Contact form and navigation link</p>
              </div>
            </label>
          </div>

          <!-- More Dropdown Items -->
          <div class="space-y-3 pt-4 border-t border-dark-100">
            <h3 class="text-sm font-semibold text-gray-300 uppercase tracking-wide">More Dropdown Menu Items</h3>
            <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-dark-200 transition-colors">
              <input v-model="settingsForm.sections.theCompany" type="checkbox" class="w-5 h-5 rounded bg-dark-200 border-dark-100 text-primary-500 focus:ring-primary-500" />
              <div class="flex-1">
                <span class="text-gray-200 font-medium">The Company</span>
                <p class="text-xs text-gray-500">Company information page</p>
              </div>
            </label>
            <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-dark-200 transition-colors">
              <input v-model="settingsForm.sections.team" type="checkbox" class="w-5 h-5 rounded bg-dark-200 border-dark-100 text-primary-500 focus:ring-primary-500" />
              <div class="flex-1">
                <span class="text-gray-200 font-medium">Our Team</span>
                <p class="text-xs text-gray-500">Team members showcase page</p>
              </div>
            </label>
            <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-dark-200 transition-colors">
              <input v-model="settingsForm.sections.licensing" type="checkbox" class="w-5 h-5 rounded bg-dark-200 border-dark-100 text-primary-500 focus:ring-primary-500" />
              <div class="flex-1">
                <span class="text-gray-200 font-medium">Licensing</span>
                <p class="text-xs text-gray-500">Film licensing information</p>
              </div>
            </label>
            <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-dark-200 transition-colors">
              <input v-model="settingsForm.sections.partners" type="checkbox" class="w-5 h-5 rounded bg-dark-200 border-dark-100 text-primary-500 focus:ring-primary-500" />
              <div class="flex-1">
                <span class="text-gray-200 font-medium">Partners</span>
                <p class="text-xs text-gray-500">Partners and collaborators page</p>
              </div>
            </label>
            <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-dark-200 transition-colors">
              <input v-model="settingsForm.sections.allNews" type="checkbox" class="w-5 h-5 rounded bg-dark-200 border-dark-100 text-primary-500 focus:ring-primary-500" />
              <div class="flex-1">
                <span class="text-gray-200 font-medium">All News</span>
                <p class="text-xs text-gray-500">Complete news archive page</p>
              </div>
            </label>
            <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-dark-200 transition-colors">
              <input v-model="settingsForm.sections.careers" type="checkbox" class="w-5 h-5 rounded bg-dark-200 border-dark-100 text-primary-500 focus:ring-primary-500" />
              <div class="flex-1">
                <span class="text-gray-200 font-medium">Careers</span>
                <p class="text-xs text-gray-500">Careers and job opportunities page</p>
              </div>
            </label>
            <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-dark-200 transition-colors">
              <input v-model="settingsForm.sections.feed" type="checkbox" class="w-5 h-5 rounded bg-dark-200 border-dark-100 text-primary-500 focus:ring-primary-500" />
              <div class="flex-1">
                <span class="text-gray-200 font-medium">Social Feed</span>
                <p class="text-xs text-gray-500">Curated social media posts page</p>
              </div>
            </label>
          </div>

          <button type="submit" class="btn btn-primary mt-4" :disabled="savingSettings">
            <span v-if="savingSettings" class="spinner"></span>
            <span v-else>Save Visibility Settings</span>
          </button>
        </form>
      </div>

      <!-- Theme Settings -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Website Theme</h2>
        <p class="text-gray-400 text-sm mb-4">Choose the color theme for the main website</p>
        <form @submit.prevent="saveTheme" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Dark Theme Option -->
            <label 
              class="relative flex flex-col p-4 rounded-xl cursor-pointer border-2 transition-all"
              :class="themeForm.theme === 'dark' ? 'border-primary bg-primary/10' : 'border-dark-100 bg-dark-200 hover:border-gray-600'"
            >
              <input 
                type="radio" 
                v-model="themeForm.theme" 
                value="dark" 
                class="sr-only" 
              />
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center">
                  <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-white">Dark Theme</p>
                  <p class="text-xs text-gray-400">Dark backgrounds with light text</p>
                </div>
              </div>
              <div class="flex gap-1">
                <div class="w-6 h-6 rounded bg-gray-900 border border-gray-700"></div>
                <div class="w-6 h-6 rounded bg-gray-800"></div>
                <div class="w-6 h-6 rounded bg-amber-500"></div>
                <div class="w-6 h-6 rounded bg-gray-300"></div>
              </div>
              <div v-if="themeForm.theme === 'dark'" class="absolute top-2 right-2">
                <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
            </label>

            <!-- Light Theme Option -->
            <label 
              class="relative flex flex-col p-4 rounded-xl cursor-pointer border-2 transition-all"
              :class="themeForm.theme === 'light' ? 'border-primary bg-primary/10' : 'border-dark-100 bg-dark-200 hover:border-gray-600'"
            >
              <input 
                type="radio" 
                v-model="themeForm.theme" 
                value="light" 
                class="sr-only" 
              />
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-lg bg-white border border-gray-300 flex items-center justify-center">
                  <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-white">Light Theme</p>
                  <p class="text-xs text-gray-400">Light backgrounds with dark text</p>
                </div>
              </div>
              <div class="flex gap-1">
                <div class="w-6 h-6 rounded bg-white border border-gray-300"></div>
                <div class="w-6 h-6 rounded bg-gray-100 border border-gray-200"></div>
                <div class="w-6 h-6 rounded bg-amber-500"></div>
                <div class="w-6 h-6 rounded bg-gray-800"></div>
              </div>
              <div v-if="themeForm.theme === 'light'" class="absolute top-2 right-2">
                <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
            </label>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="savingTheme">
            <span v-if="savingTheme" class="spinner"></span>
            <span v-else>Save Theme</span>
          </button>
        </form>
      </div>

      <!-- Splash Screen Settings -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Splash Screen</h2>
        <p class="text-gray-400 text-sm mb-4">Configure the splash screen animation for the main website</p>
        <form @submit.prevent="saveSplashScreen" class="space-y-6">
          
          <!-- Enable/Disable Toggle -->
          <div class="p-4 bg-dark-200 rounded-lg">
            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <span class="text-gray-200 font-medium">Enable Splash Screen</span>
                <p class="text-xs text-gray-500 mt-1">Show splash animation when visitors first load the website</p>
              </div>
              <div class="relative">
                <input type="checkbox" v-model="splashForm.enabled" class="sr-only peer" />
                <div class="w-11 h-6 bg-dark-100 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>
          </div>

          <!-- Show Once Per User Toggle (only show if enabled) -->
          <div v-if="splashForm.enabled" class="p-4 bg-dark-200 rounded-lg border border-dark-100">
            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <span class="text-gray-200 font-medium">Show Only Once Per User</span>
                <p class="text-xs text-gray-500 mt-1">
                  Splash screen will only appear on the first visit. Uses browser storage (clearing cache resets this).
                </p>
                <p class="text-xs text-amber-500/80 mt-2">
                  <svg class="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  Recommended for production — prevents repeat splash on every page refresh.
                </p>
              </div>
              <div class="relative ml-4 flex-shrink-0">
                <input type="checkbox" v-model="splashForm.showOnce" class="sr-only peer" />
                <div class="w-11 h-6 bg-dark-100 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>
          </div>

          <!-- Duration Slider (only show if enabled) -->
          <div v-if="splashForm.enabled" class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">
              Duration: <span class="text-primary font-semibold">{{ (splashForm.duration / 1000).toFixed(1) }}s</span>
            </label>
            <div class="flex items-center gap-4">
              <span class="text-xs text-gray-500">1s</span>
              <input 
                type="range" 
                v-model.number="splashForm.duration" 
                min="1000" 
                max="8000" 
                step="500"
                class="flex-1 h-2 bg-dark-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span class="text-xs text-gray-500">8s</span>
            </div>
            <p class="text-xs text-gray-500">How long the splash screen animation plays before fading out</p>
          </div>

          <!-- Variant Selection (only show if enabled) -->
          <div v-if="splashForm.enabled">
            <label class="block text-sm font-medium text-gray-300 mb-3">Animation Style</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <!-- Galaxy Variant -->
              <label 
                class="relative flex items-center p-3 rounded-lg cursor-pointer border-2 transition-all"
                :class="splashForm.variant === 'galaxy' ? 'border-primary bg-primary/10' : 'border-dark-100 bg-dark-200 hover:border-gray-600'"
              >
                <input 
                  type="radio" 
                  v-model="splashForm.variant" 
                  value="galaxy" 
                  class="sr-only" 
                />
                <div class="flex items-center gap-3 flex-1">
                  <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-white">Galaxy</p>
                    <p class="text-xs text-gray-400">3D spiral galaxy animation</p>
                  </div>
                </div>
                <div v-if="splashForm.variant === 'galaxy'" class="ml-2">
                  <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </label>

              <!-- Film Reel Variant -->
              <label 
                class="relative flex items-center p-3 rounded-lg cursor-pointer border-2 transition-all"
                :class="splashForm.variant === 'film-reel' ? 'border-primary bg-primary/10' : 'border-dark-100 bg-dark-200 hover:border-gray-600'"
              >
                <input 
                  type="radio" 
                  v-model="splashForm.variant" 
                  value="film-reel" 
                  class="sr-only" 
                />
                <div class="flex items-center gap-3 flex-1">
                  <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-white">Film Reel</p>
                    <p class="text-xs text-gray-400">Classic film projector animation</p>
                  </div>
                </div>
                <div v-if="splashForm.variant === 'film-reel'" class="ml-2">
                  <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </label>

              <!-- Cinematic Variant -->
              <label 
                class="relative flex items-center p-3 rounded-lg cursor-pointer border-2 transition-all"
                :class="splashForm.variant === 'cinematic' ? 'border-primary bg-primary/10' : 'border-dark-100 bg-dark-200 hover:border-gray-600'"
              >
                <input 
                  type="radio" 
                  v-model="splashForm.variant" 
                  value="cinematic" 
                  class="sr-only" 
                />
                <div class="flex items-center gap-3 flex-1">
                  <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-white">Cinematic</p>
                    <p class="text-xs text-gray-400">Theatre curtain & clapperboard</p>
                  </div>
                </div>
                <div v-if="splashForm.variant === 'cinematic'" class="ml-2">
                  <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </label>

              <!-- Minimal Variant -->
              <label 
                class="relative flex items-center p-3 rounded-lg cursor-pointer border-2 transition-all"
                :class="splashForm.variant === 'minimal' ? 'border-primary bg-primary/10' : 'border-dark-100 bg-dark-200 hover:border-gray-600'"
              >
                <input 
                  type="radio" 
                  v-model="splashForm.variant" 
                  value="minimal" 
                  class="sr-only" 
                />
                <div class="flex items-center gap-3 flex-1">
                  <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-white">Minimal</p>
                    <p class="text-xs text-gray-400">Clean & simple geometric design</p>
                  </div>
                </div>
                <div v-if="splashForm.variant === 'minimal'" class="ml-2">
                  <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </label>
            </div>
          </div>

          <!-- Theme Mode Selection (only show if enabled) -->
          <div v-if="splashForm.enabled">
            <label class="block text-sm font-medium text-gray-300 mb-3">Splash Screen Theme</label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <!-- Auto Mode -->
              <label 
                class="relative flex flex-col p-4 rounded-lg cursor-pointer border-2 transition-all"
                :class="splashForm.themeMode === 'auto' ? 'border-primary bg-primary/10' : 'border-dark-100 bg-dark-200 hover:border-gray-600'"
              >
                <input 
                  type="radio" 
                  v-model="splashForm.themeMode" 
                  value="auto" 
                  class="sr-only" 
                />
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
                  </svg>
                  <p class="font-semibold text-white">Auto</p>
                </div>
                <p class="text-xs text-gray-400">Match user's system theme</p>
                <div v-if="splashForm.themeMode === 'auto'" class="absolute top-2 right-2">
                  <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </label>

              <!-- Dark Mode -->
              <label 
                class="relative flex flex-col p-4 rounded-lg cursor-pointer border-2 transition-all"
                :class="splashForm.themeMode === 'dark' ? 'border-primary bg-primary/10' : 'border-dark-100 bg-dark-200 hover:border-gray-600'"
              >
                <input 
                  type="radio" 
                  v-model="splashForm.themeMode" 
                  value="dark" 
                  class="sr-only" 
                />
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                  </svg>
                  <p class="font-semibold text-white">Dark</p>
                </div>
                <p class="text-xs text-gray-400">Always use dark theme</p>
                <div v-if="splashForm.themeMode === 'dark'" class="absolute top-2 right-2">
                  <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </label>

              <!-- Light Mode -->
              <label 
                class="relative flex flex-col p-4 rounded-lg cursor-pointer border-2 transition-all"
                :class="splashForm.themeMode === 'light' ? 'border-primary bg-primary/10' : 'border-dark-100 bg-dark-200 hover:border-gray-600'"
              >
                <input 
                  type="radio" 
                  v-model="splashForm.themeMode" 
                  value="light" 
                  class="sr-only" 
                />
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                  </svg>
                  <p class="font-semibold text-white">Light</p>
                </div>
                <p class="text-xs text-gray-400">Always use light theme</p>
                <div v-if="splashForm.themeMode === 'light'" class="absolute top-2 right-2">
                  <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="savingSplash">
            <span v-if="savingSplash" class="spinner"></span>
            <span v-else>Save Splash Screen</span>
          </button>
        </form>
      </div>

      <!-- API Keys -->
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">API Configuration</h2>
        <form @submit.prevent="saveApiConfig" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">API Base URL</label>
            <input v-model="apiForm.baseUrl" type="url" placeholder="https://api.example.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Upload Max Size (MB)</label>
            <input v-model.number="apiForm.uploadMaxSize" type="number" min="1" max="100" />
          </div>
          <button type="submit" class="btn btn-primary" :disabled="savingApi">
            <span v-if="savingApi" class="spinner"></span>
            <span v-else>Save API Config</span>
          </button>
        </form>
      </div>

      <!-- Danger Zone -->
      <div class="card border-red-900/50">
        <h2 class="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-dark-200 rounded-lg">
            <div>
              <p class="font-medium text-white">Clear Cache</p>
              <p class="text-sm text-gray-400">Clear all cached data</p>
            </div>
            <button @click="clearCache" class="btn btn-secondary btn-sm">Clear Cache</button>
          </div>
          <div class="flex items-center justify-between p-4 bg-dark-200 rounded-lg">
            <div>
              <p class="font-medium text-white">Reset Database</p>
              <p class="text-sm text-gray-400">Reset all data to default (cannot be undone)</p>
            </div>
            <button @click="confirmReset" class="btn btn-danger btn-sm">Reset Database</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reset Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showResetModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-100 rounded-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-red-400 mb-2">Reset Database</h3>
          <p class="text-gray-400 mb-4">This will permanently delete all data. Type "RESET" to confirm:</p>
          <input v-model="resetConfirmation" type="text" placeholder="Type RESET" class="mb-4" />
          <div class="flex gap-3 justify-end">
            <button @click="showResetModal = false" class="btn btn-secondary">Cancel</button>
            <button
              @click="resetDatabase"
              class="btn btn-danger"
              :disabled="resetConfirmation !== 'RESET' || resetting"
            >
              <span v-if="resetting" class="spinner"></span>
              <span v-else>Reset Database</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authAPI, settingsAPI } from '@/services/api'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'

const toast = useToastStore()
const authStore = useAuthStore()

const loading = ref(true)

const profileForm = ref({
  name: '',
  email: ''
})
const savingProfile = ref(false)

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const savingPassword = ref(false)

const settingsForm = ref({
  siteName: 'WHITE PANDA CREATIONS Admin',
  itemsPerPage: 20,
  maintenanceMode: false,
  maintenanceMessage: '',
  enableRegistration: false,
  enableAnalytics: true,
  sections: {
    home: true,
    about: true,
    films: true,
    news: true,
    contact: true,
    theCompany: true,
    team: true,
    licensing: true,
    partners: true,
    allNews: true,
    careers: true,
    feed: true
  }
})
const savingSettings = ref(false)

const apiForm = ref({
  baseUrl: '',
  uploadMaxSize: 10
})
const savingApi = ref(false)

const themeForm = ref({
  theme: 'dark'
})
const savingTheme = ref(false)

const splashForm = ref({
  enabled: true,
  variant: 'galaxy',
  themeMode: 'auto',
  duration: 3000,
  showOnce: false
})
const savingSplash = ref(false)

const showResetModal = ref(false)
const resetConfirmation = ref('')
const resetting = ref(false)

async function loadData() {
  loading.value = true
  try {
    // Load user profile
    if (authStore.user) {
      profileForm.value = {
        name: authStore.user.name || '',
        email: authStore.user.email
      }
    }

    // Load settings
    try {
      const response = await settingsAPI.get()
      if (response.data.data) {
        const settings = response.data.data
        settingsForm.value = {
          siteName: settings.siteName || settingsForm.value.siteName,
          itemsPerPage: settings.itemsPerPage || settingsForm.value.itemsPerPage,
          maintenanceMode: settings.maintenanceMode || false,
          maintenanceMessage: settings.maintenanceMessage || '',
          enableRegistration: settings.enableRegistration || false,
          enableAnalytics: settings.enableAnalytics !== undefined ? settings.enableAnalytics : true,
          sections: settings.sections || settingsForm.value.sections
        }
        apiForm.value = {
          ...apiForm.value,
          ...settings.api
        }
        // Load theme setting
        if (settings.theme) {
          themeForm.value.theme = settings.theme
        }
        // Load splash screen settings
        if (settings.showSplashScreen !== undefined) {
          splashForm.value.enabled = settings.showSplashScreen
        }
        if (settings.splashScreenVariant) {
          splashForm.value.variant = settings.splashScreenVariant
        }
        if (settings.splashScreenTheme) {
          splashForm.value.themeMode = settings.splashScreenTheme
        }
        if (settings.splashDuration) {
          splashForm.value.duration = settings.splashDuration
        }
        if (settings.splashShowOnce !== undefined) {
          splashForm.value.showOnce = settings.splashShowOnce
        }
      }
    } catch (e) {
      // Settings may not exist yet
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

async function updateProfile() {
  savingProfile.value = true
  try {
    await authAPI.updateProfile(profileForm.value)
    toast.success('Profile updated successfully')
    authStore.fetchUser()
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update profile'
    toast.error(message)
  } finally {
    savingProfile.value = false
  }
}

async function changePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error('Passwords do not match')
    return
  }

  savingPassword.value = true
  try {
    await authAPI.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    toast.success('Password changed successfully')
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to change password'
    toast.error(message)
  } finally {
    savingPassword.value = false
  }
}

async function saveSettings() {
  savingSettings.value = true
  try {
    await settingsAPI.update({ 
      siteName: settingsForm.value.siteName,
      itemsPerPage: settingsForm.value.itemsPerPage,
      maintenanceMode: settingsForm.value.maintenanceMode,
      maintenanceMessage: settingsForm.value.maintenanceMessage,
      enableRegistration: settingsForm.value.enableRegistration,
      enableAnalytics: settingsForm.value.enableAnalytics,
      sections: settingsForm.value.sections
    })
    toast.success('Settings saved successfully')
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to save settings'
    toast.error(message)
  } finally {
    savingSettings.value = false
  }
}

async function saveApiConfig() {
  savingApi.value = true
  try {
    await settingsAPI.update({ api: apiForm.value })
    toast.success('API configuration saved successfully')
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to save API configuration'
    toast.error(message)
  } finally {
    savingApi.value = false
  }
}

async function saveTheme() {
  savingTheme.value = true
  try {
    await settingsAPI.update({ theme: themeForm.value.theme })
    toast.success('Theme saved successfully. Refresh the main website to see changes.')
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to save theme'
    toast.error(message)
  } finally {
    savingTheme.value = false
  }
}

async function saveSplashScreen() {
  savingSplash.value = true
  try {
    await settingsAPI.update({ 
      showSplashScreen: splashForm.value.enabled,
      splashScreenVariant: splashForm.value.variant,
      splashScreenTheme: splashForm.value.themeMode,
      splashDuration: splashForm.value.duration,
      splashShowOnce: splashForm.value.showOnce
    })
    toast.success('Splash screen settings saved successfully. Refresh the main website to see changes.')
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to save splash screen settings'
    toast.error(message)
  } finally {
    savingSplash.value = false
  }
}

async function clearCache() {
  toast.success('Cache cleared successfully')
}

function confirmReset() {
  resetConfirmation.value = ''
  showResetModal.value = true
}

async function resetDatabase() {
  if (resetConfirmation.value !== 'RESET') return

  resetting.value = true
  try {
    // This would typically call a backend reset endpoint
    toast.success('Database reset successfully')
    showResetModal.value = false
  } catch (error) {
    toast.error('Failed to reset database')
  } finally {
    resetting.value = false
  }
}
</script>

