import { createRouter, createWebHistory } from 'vue-router';
import RecorderView from '../views/RecorderView.vue';
import AdminView from '../views/AdminView.vue';
import AdminTextView from '../views/AdminTextView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Recorder', component: RecorderView },
    { path: '/admin', redirect: '/admin/records' },
    { path: '/admin/records', name: 'AdminRecords', component: AdminView },
    { path: '/admin/texts', name: 'AdminTexts', component: AdminTextView },
  ],
});

export default router;
