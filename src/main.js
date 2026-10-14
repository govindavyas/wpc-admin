import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { companyAPI } from './services/api'

// Set favicon dynamically
async function setFavicon() {
  try {
    const response = await companyAPI.get()
    const data = response.data.data || response.data
    const faviconUrl = data.favicon || data.logo || '/assets/logo.png'
    
    // Update favicon
    let link = document.querySelector("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = faviconUrl
    
    // Update apple-touch-icon
    let appleIcon = document.querySelector("link[rel~='apple-touch-icon']")
    if (!appleIcon) {
      appleIcon = document.createElement('link')
      appleIcon.rel = 'apple-touch-icon'
      document.head.appendChild(appleIcon)
    }
    appleIcon.href = faviconUrl
  } catch (error) {
    console.warn('Using default favicon:', error.message)
    // Fallback to local logo is already set in HTML
  }
}

setFavicon()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

