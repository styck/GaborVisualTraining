import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, RouteLocationNormalized } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TrainingView from '../components/TrainingView.vue'
import SelectModeView from '../components/SelectModeView.vue'
import SettingsView from '../views/SettingsView.vue'
import ReportView from '../views/ReportView.vue'
import TestReport from '../components/TestReport.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/training',
    name: 'training',
    component: TrainingView,
  },
  {
    path: '/select-mode',
    name: 'select-mode',
    component: SelectModeView,
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
  },
  {
    path: '/report',
    name: 'report',
    component: ReportView,
  },
  {
    path: '/test-report',
    name: 'test-report',
    component: TestReport,
    props: (route: RouteLocationNormalized) => ({
      report: JSON.parse(route.params.report as string),
    }),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
