import { createRouter, createWebHistory } from 'vue-router';
import RecorderView from '../views/RecorderView.vue';
import AdminView from '../views/AdminView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Recorder', component: RecorderView },
    { path: '/admin', name: 'Admin', component: AdminView },
  ],
});

export default router;
