import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'

// Layouts
import AdminLayout from '@/layouts/AdminLayout.vue'

// Views - Lazy loaded for better performance
const Login = () => import('@/views/Login.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const Analytics = () => import('@/views/Analytics.vue')
const Movies = () => import('@/views/Movies.vue')
const MovieForm = () => import('@/views/MovieForm.vue')
const DisplayOrder = () => import('@/views/DisplayOrder.vue')
const News = () => import('@/views/News.vue')
const NewsForm = () => import('@/views/NewsForm.vue')
const Team = () => import('@/views/Team.vue')
const TeamMemberForm = () => import('@/views/TeamMemberForm.vue')
const Company = () => import('@/views/Company.vue')
const Licensing = () => import('@/views/Licensing.vue')
const Marketing = () => import('@/views/Marketing.vue')
const Settings = () => import('@/views/Settings.vue')
const Users = () => import('@/views/Users.vue')
const Messages = () => import('@/views/Messages.vue')
const Seo = () => import('@/views/Seo.vue')
const Careers = () => import('@/views/Careers.vue')
const CareerForm = () => import('@/views/CareerForm.vue')
const JobApplications = () => import('@/views/JobApplications.vue')
const Media = () => import('@/views/Media.vue')
const Feed = () => import('@/views/Feed.vue')
const FeedAnalytics = () => import('@/views/FeedAnalytics.vue')
const Navigation = () => import('@/views/Navigation.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true }
  },
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: Analytics,
        beforeEnter: async (to, from, next) => {
          try {
            const token = localStorage.getItem('admin_token')
            const response = await axios.get('/api/v1/settings', {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            })
            const analyticsEnabled = response.data?.data?.enableAnalytics !== false
            
            if (!analyticsEnabled) {
              // Redirect to dashboard if analytics is disabled
              next({ name: 'Dashboard' })
            } else {
              next()
            }
          } catch (error) {
            // If error fetching settings, allow access (fail open)
            console.error('Error checking analytics status:', error)
            next()
          }
        }
      },
      {
        path: 'movies',
        name: 'Movies',
        component: Movies
      },
      {
        path: 'movies/new',
        name: 'MovieCreate',
        component: MovieForm
      },
      {
        path: 'movies/:id',
        name: 'MovieEdit',
        component: MovieForm
      },
      {
        path: 'movies/:id/display-order',
        name: 'MovieDisplayOrder',
        component: DisplayOrder
      },
      {
        path: 'news',
        name: 'News',
        component: News
      },
      {
        path: 'news/new',
        name: 'NewsCreate',
        component: NewsForm
      },
      {
        path: 'news/:id',
        name: 'NewsEdit',
        component: NewsForm
      },
      {
        path: 'team',
        name: 'Team',
        component: Team
      },
      {
        path: 'team/new',
        name: 'TeamMemberCreate',
        component: TeamMemberForm
      },
      {
        path: 'team/:id',
        name: 'TeamMemberEdit',
        component: TeamMemberForm
      },
      {
        path: 'company',
        name: 'Company',
        component: Company
      },
      {
        path: 'licensing',
        name: 'Licensing',
        component: Licensing
      },
      {
        path: 'marketing',
        name: 'Marketing',
        component: Marketing
      },
      {
        path: 'messages',
        name: 'Messages',
        component: Messages
      },
      {
        path: 'seo',
        name: 'Seo',
        component: Seo,
        meta: { requiresAdmin: true }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
        meta: { requiresAdmin: true }
      },
      {
        path: 'navigation',
        name: 'Navigation',
        component: Navigation,
        meta: { requiresAdmin: true }
      },
      {
        path: 'users',
        name: 'Users',
        component: Users,
        meta: { requiresAdmin: true }
      },
      {
        path: 'careers',
        name: 'Careers',
        component: Careers
      },
      {
        path: 'careers/new',
        name: 'CareerCreate',
        component: CareerForm
      },
      {
        path: 'careers/:id',
        name: 'CareerEdit',
        component: CareerForm
      },
      {
        path: 'job-applications',
        name: 'JobApplications',
        component: JobApplications
      },
      {
        path: 'feed',
        name: 'Feed',
        component: Feed
      },
      {
        path: 'feed/analytics',
        name: 'FeedAnalytics',
        component: FeedAnalytics
      },
      {
        path: 'media',
        name: 'Media',
        component: Media,
        meta: { requiresAdmin: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

// Navigation guard - check auth status from localStorage directly
// to avoid Pinia initialization issues
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  const isAuthenticated = !!token
  
  // Check if route requires auth
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  }
  // Check if route is for guests only
  else if (to.meta.guest && isAuthenticated) {
    next({ name: 'Dashboard' })
  }
  // Check if route requires admin
  else if (to.meta.requiresAdmin) {
    const userStr = localStorage.getItem('admin_user')
    const user = userStr ? JSON.parse(userStr) : null
    if (user?.role !== 'admin') {
      next({ name: 'Dashboard' })
    } else {
      next()
    }
  }
  else {
    next()
  }
})

export default router
