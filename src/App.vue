<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#e0f2fe_45%,_#f8fafc_80%)] text-slate-900">
    <main class="mx-auto flex w-full max-w-[90rem] flex-col gap-10 px-6 py-10">
      <nav class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Pronunciation</p>
          <p class="text-lg font-semibold text-slate-900">Recording Portal</p>
        </div>
        <div class="flex items-center gap-2">
          <router-link
            to="/"
            class="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm transition hover:bg-white"
          >
            录音页面
          </router-link>
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm transition hover:bg-white disabled:opacity-60"
            :disabled="adminLoading"
            @click="openAdminModal"
          >
            {{ adminLoading ? '登录中...' : '管理界面' }}
          </button>
        </div>
      </nav>

      <router-view />
    </main>
  </div>

  <div v-if="showAdminModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-6">
    <div class="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
      <div class="flex items-start justify-between">
        <h2 class="text-base font-semibold text-slate-900">管理入口</h2>
        <button
          type="button"
          class="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
          @click="closeAdminModal"
        >
          关闭
        </button>
      </div>
      <p class="mt-2 text-sm text-slate-500">请输入管理密码后继续。</p>
      <label class="mt-4 block text-sm text-slate-700">
        <span class="sr-only">管理密码</span>
        <input
          v-model.trim="adminPassword"
          type="password"
          placeholder="输入管理密码"
          class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          @keyup.enter="submitAdminAccess"
        />
      </label>
      <p v-if="adminNotice" class="mt-2 text-xs text-amber-600">{{ adminNotice }}</p>
      <p v-if="adminError" class="mt-2 text-xs text-rose-600">{{ adminError }}</p>
      <div class="mt-5 flex items-center justify-end gap-3">
        <button
          type="button"
          class="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
          @click="closeAdminModal"
        >
          取消
        </button>
        <button
          type="button"
          class="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          :disabled="adminLoading"
          @click="submitAdminAccess"
        >
          {{ adminLoading ? '登录中...' : '进入' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const showAdminModal = ref(false);
const adminPassword = ref('');
const adminError = ref('');
const adminLoading = ref(false);
const adminNotice = ref('');

const hasAdminSession = () => sessionStorage.getItem('admin_logged_in') === '1';

const openAdminModal = (force = false) => {
  adminPassword.value = '';
  adminError.value = '';
  adminNotice.value = '';
  if (!force && hasAdminSession()) {
    router.push('/admin/records');
    return;
  }
  showAdminModal.value = true;
};

const closeAdminModal = () => {
  showAdminModal.value = false;
};

const submitAdminAccess = async () => {
  if (!adminPassword.value) {
    adminError.value = '请输入密码。';
    return;
  }
  adminError.value = '';
  adminLoading.value = true;
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password: adminPassword.value }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || '登录失败');
    }
    sessionStorage.setItem('admin_logged_in', '1');
    showAdminModal.value = false;
    router.push('/admin/records');
  } catch (err) {
    adminError.value = err.message || '登录失败';
  } finally {
    adminLoading.value = false;
  }
};

const handleAdminAuthRequired = () => {
  sessionStorage.removeItem('admin_logged_in');
  adminNotice.value = '会话已过期 请重新输入密码';
  openAdminModal(true);
};

onMounted(() => {
  window.addEventListener('admin:auth-required', handleAdminAuthRequired);
});

onBeforeUnmount(() => {
  window.removeEventListener('admin:auth-required', handleAdminAuthRequired);
});
</script>
