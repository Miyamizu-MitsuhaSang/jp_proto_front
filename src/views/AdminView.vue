<template>
  <section class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200/40 backdrop-blur">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">管理界面</p>
        <h1 class="mt-2 text-2xl font-semibold text-slate-900">录音记录管理</h1>
        <p class="mt-2 text-sm text-slate-600">
          登录成功后可查看录音记录（/admin/all-record）。
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <nav class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          <router-link
            to="/admin"
            class="rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600 hover:bg-slate-100"
          >
            录音记录
          </router-link>
          <router-link
            to="/admin/texts"
            class="rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600 hover:bg-slate-100"
          >
            朗读文本
          </router-link>
        </nav>
        <button
          type="button"
          class="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
          :disabled="adminLoading || recordsLoading"
          @click="refreshAdmin"
        >
          {{ adminLoading || recordsLoading ? '刷新中...' : '刷新' }}
        </button>
      </div>
    </div>

    <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
      <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <p class="uppercase tracking-[0.2em] text-slate-500">录音记录</p>
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2">
            <span>每页</span>
            <select
              v-model.number="pageSize"
              class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs"
              @change="fetchAdminRecords(1)"
            >
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
            </select>
          </label>
        </div>
      </div>

      <div class="mt-4 overflow-x-auto md:overflow-hidden rounded-2xl border border-slate-200">
        <table class="w-full table-fixed text-[11px] sm:text-xs text-slate-600">
          <colgroup>
            <col class="w-[8%]" />
            <col class="w-[8%]" />
            <col class="w-[6%]" />
            <col class="w-[8%]" />
            <col class="w-[7%]" />
            <col class="w-[7%]" />
            <col class="w-[16%]" />
            <col class="w-[12%]" />
            <col class="w-[7%]" />
            <col class="w-[14%]" />
          </colgroup>
          <thead class="bg-slate-100 text-[12px] uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th class="px-2 sm:px-3 py-4 whitespace-nowrap text-center">记录ID</th>
              <th class="px-2 sm:px-3 py-4 whitespace-nowrap text-center">姓名</th>
              <th class="px-2 sm:px-3 py-4 whitespace-nowrap text-center">性别</th>
              <th class="px-2 sm:px-3 py-4 whitespace-nowrap text-center">学校</th>
              <th class="px-2 sm:px-3 py-4 whitespace-nowrap text-center">年级</th>
              <th class="px-2 sm:px-3 py-4 whitespace-nowrap text-center">学习年限</th>
              <th class="px-2 sm:px-3 py-4 whitespace-nowrap text-center">朗读文本</th>
              <th class="px-2 sm:px-3 py-4 whitespace-nowrap text-center">时间</th>
              <th class="px-2 sm:px-3 py-4 whitespace-nowrap text-center">Overall</th>
              <th class="px-2 sm:px-3 py-4 whitespace-nowrap text-center">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            <tr v-if="recordsLoading">
              <td colspan="10" class="px-4 py-6 text-center text-sm text-slate-500">加载中...</td>
            </tr>
            <tr v-else-if="records.length === 0">
              <td colspan="10" class="px-4 py-6 text-center text-sm text-slate-500">暂无数据</td>
            </tr>
            <tr v-else v-for="record in records" :key="record.record_id">
              <td class="px-2 sm:px-3 py-4 whitespace-nowrap text-center font-mono text-[11px] sm:text-[12px] text-slate-700">
                <div class="mx-auto max-w-[7rem] truncate">
                  {{ record.record_id }}
                </div>
              </td>
              <td class="px-2 sm:px-3 py-4 whitespace-nowrap text-center text-[11px] sm:text-sm text-slate-800">{{ record.user_name }}</td>
              <td class="px-2 sm:px-3 py-4 whitespace-nowrap text-center text-[11px] sm:text-sm">{{ record.gender }}</td>
              <td class="px-2 sm:px-3 py-4 whitespace-nowrap text-center text-[11px] sm:text-sm">{{ record.school_level }}</td>
              <td class="px-2 sm:px-3 py-4 whitespace-nowrap text-center text-[11px] sm:text-sm">{{ record.grade }}</td>
              <td class="px-2 sm:px-3 py-4 whitespace-nowrap text-center text-[11px] sm:text-sm">{{ record.learning_age }}</td>
              <td class="group px-2 sm:px-3 py-4 whitespace-nowrap text-center text-[11px] sm:text-sm">
                <div
                  class="mx-auto max-w-[14rem] overflow-hidden pb-2 group-hover:overflow-x-auto"
                  style="scrollbar-gutter: stable both-edges;"
                >
                  {{ record.reading_text }}
                </div>
              </td>
              <td class="px-2 sm:px-3 py-4 whitespace-nowrap text-center text-[11px] sm:text-sm">{{ formatDate(record.created_at) }}</td>
              <td class="px-2 sm:px-3 py-4 whitespace-nowrap text-center text-[11px] sm:text-sm">{{ formatScore(record.test__overall) }}</td>
              <td class="px-2 sm:px-3 py-4 whitespace-nowrap text-center">
                <div class="flex flex-nowrap items-center justify-center gap-2">
                  <button
                    type="button"
                    class="rounded-full border border-slate-200 px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                    @click="openDetail(record)"
                  >
                    详情
                  </button>
                  <button
                    type="button"
                    class="rounded-full border border-slate-200 px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                    @click="toggleAudio(record.record_id)"
                  >
                    {{ activeAudioId === record.record_id ? '收起试听' : '在线听' }}
                  </button>
                  <a
                    :href="downloadUrl(record.record_id)"
                    download
                    class="rounded-full border border-slate-200 px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    下载
                  </a>
                </div>
                <div v-if="activeAudioId === record.record_id" class="mt-2">
                  <audio
                    :ref="(el) => setAudioRef(record.record_id, el)"
                    :src="audioUrl(record.record_id)"
                    controls
                    preload="metadata"
                    class="w-full min-w-[12rem]"
                  ></audio>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <p>共 {{ total }} 条</p>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-50"
            :disabled="page <= 1 || recordsLoading"
            @click="fetchAdminRecords(page - 1)"
          >
            上一页
          </button>
          <span>第 {{ page }} 页</span>
          <button
            type="button"
            class="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-50"
            :disabled="!hasNext || recordsLoading"
            @click="fetchAdminRecords(page + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </section>

  <div v-if="showDetail" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-6">
    <div class="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
      <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">记录详情</p>
          <h2 class="mt-2 text-lg font-semibold text-slate-900">Record {{ activeRecord?.record_id }}</h2>
        </div>
        <button
          type="button"
          class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
          @click="closeDetail"
        >
          关闭
        </button>
      </div>
      <div class="flex-1 overflow-y-auto px-6 pb-6">
      <div class="mt-4 space-y-4">
        <div v-if="detailLoading" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          正在加载打分信息...
        </div>
        <div v-else-if="detailError" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {{ detailError }}
        </div>
        <div v-else-if="!detailScore" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          暂无评分信息
        </div>

        <div v-if="detailScore" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Overall</p>
            <p class="mt-2 text-2xl font-semibold" :class="scoreTextClass(detailScore.overall)">
              {{ formatScore(detailScore.overall) }}
            </p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Pronunciation</p>
            <p class="mt-2 text-2xl font-semibold" :class="scoreTextClass(detailScore.pronunciation)">
              {{ formatScore(detailScore.pronunciation) }}
            </p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Fluency</p>
            <p class="mt-2 text-2xl font-semibold" :class="scoreTextClass(detailScore.fluency)">
              {{ formatScore(detailScore.fluency) }}
            </p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Rhythm</p>
            <p class="mt-2 text-2xl font-semibold" :class="scoreTextClass(detailScore.rhythm)">
              {{ formatScore(detailScore.rhythm) }}
            </p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Tone</p>
            <p class="mt-2 text-2xl font-semibold" :class="scoreTextClass(detailScore.tone)">
              {{ formatScore(detailScore.tone) }}
            </p>
          </div>
        </div>
        <div class="mt-4">
          <audio
            v-if="detailAudioUrl"
            :src="detailAudioUrl"
            controls
            preload="metadata"
            class="w-full"
          ></audio>
          <p v-else class="text-xs text-slate-500">暂无音频</p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-4">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">分词评分</p>
          <div v-if="detailWords.length" class="mt-4 space-y-4">
            <div class="rounded-2xl border border-slate-200 bg-[radial-gradient(circle_at_top,_#f8fafc,_#eef2ff_60%,_#f1f5f9)] p-4">
              <div class="flex flex-wrap items-center gap-2 text-base text-slate-900">
                <span
                  v-for="(word, idx) in detailWords"
                  :key="`${word.word}-${idx}`"
                  class="group inline-flex items-center"
                  @mouseenter="activeWordIndex = idx"
                  @mouseleave="activeWordIndex = null"
                >
                  <span
                    :class="[
                      'cursor-pointer select-none px-1 text-sm transition',
                      scoreUnderlineClass(word.scores?.overall),
                    ]"
                  >
                    {{ word.word }}
                  </span>
                </span>
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                <span class="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">高分</span>
                <span class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-700">中等</span>
                <span class="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-rose-700">偏低</span>
                <span>鼠标移到分词上查看对应评分。</span>
              </div>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-500">当前分词详情</p>
              <div class="mt-3 grid min-h-[10rem] gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p class="text-xs text-slate-500">文本</p>
                  <p class="mt-1 text-base font-semibold text-slate-900">{{ activeWord?.word || '—' }}</p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p class="text-xs text-slate-500">Overall</p>
                  <p class="mt-1 text-base font-semibold" :class="scoreTextClass(activeWord?.scores?.overall)">
                    {{ formatScore(activeWord?.scores?.overall) }}
                  </p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p class="text-xs text-slate-500">Pronunciation</p>
                  <p class="mt-1 text-base font-semibold" :class="scoreTextClass(activeWord?.scores?.pronunciation)">
                    {{ formatScore(activeWord?.scores?.pronunciation) }}
                  </p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p class="text-xs text-slate-500">Prominence</p>
                  <p class="mt-1 text-base font-semibold" :class="scoreTextClass(activeWord?.scores?.prominence)">
                    {{ formatScore(activeWord?.scores?.prominence) }}
                  </p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p class="text-xs text-slate-500">Tone Score</p>
                  <p class="mt-1 text-base font-semibold" :class="scoreTextClass(activeWord?.tone_stats?.tone_score)">
                    {{ formatScore(activeWord?.tone_stats?.tone_score) }}
                  </p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p class="text-xs text-slate-500">Speed</p>
                  <p class="mt-1 text-base font-semibold" :class="scoreTextClass(detailSpeed)">
                    {{ formatScore(detailSpeed) }}
                  </p>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2 lg:col-span-3">
                  <p class="text-xs text-slate-500">音素</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900">{{ formatPhonemes(activeWord?.phonemes) }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            未返回分词评分数据。
          </div>
        </div>

        <!-- Raw JSON removed -->
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue';

const adminLoading = ref(false);
const recordsLoading = ref(false);
const records = ref([]);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const hasNext = ref(false);
const activeAudioId = ref('');
const showDetail = ref(false);
const activeRecord = ref(null);
const detailLoading = ref(false);
const detailError = ref('');
const detailScore = ref(null);
const detailWords = ref([]);
const detailDetails = ref(null);
const activeWordIndex = ref(null);
const audioRefs = new Map();

const notifyAuthRequired = () => {
  window.dispatchEvent(new Event('admin:auth-required'));
};

const fetchAdminRecords = async (targetPage = page.value) => {
  recordsLoading.value = true;
  try {
    const response = await fetch(`/api/admin/all-record?page=${targetPage}&page_size=${pageSize.value}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (response.status === 401) {
      notifyAuthRequired();
      return;
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || '获取记录失败');
    }
    records.value = data?.records || [];
    page.value = data?.page ?? targetPage;
    total.value = data?.total ?? 0;
    hasNext.value = Boolean(data?.has_next);
  } catch (err) {
    records.value = [];
    total.value = 0;
    hasNext.value = false;
  } finally {
    recordsLoading.value = false;
  }
};

const refreshAdmin = async () => {
  await fetchAdminRecords(1);
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

const audioUrl = (recordId) => `/api/admin/download/record?record_id=${encodeURIComponent(recordId)}`;
const downloadUrl = (recordId) => `/api/admin/download/record?record_id=${encodeURIComponent(recordId)}&download=1`;

const toggleAudio = (recordId) => {
  const nextId = activeAudioId.value === recordId ? '' : recordId;
  activeAudioId.value = nextId;
  if (nextId) {
    nextTick(() => {
      const audio = audioRefs.get(nextId);
      if (audio) {
        audio.load();
      }
    });
  }
};

const setAudioRef = (recordId, el) => {
  if (el) {
    audioRefs.set(recordId, el);
  } else {
    audioRefs.delete(recordId);
  }
};

const openDetail = (record) => {
  activeRecord.value = record;
  showDetail.value = true;
  fetchDetailScore(record);
};

const closeDetail = () => {
  showDetail.value = false;
  activeRecord.value = null;
  detailScore.value = null;
  detailWords.value = [];
  detailDetails.value = null;
  detailError.value = '';
  activeWordIndex.value = null;
};


const fetchDetailScore = async (record) => {
  detailLoading.value = true;
  detailError.value = '';
  detailScore.value = null;
  detailWords.value = [];
  detailDetails.value = null;
  try {
    if (!record?.test_id) {
      throw new Error('缺少 test_id，无法获取评分详情。');
    }
    const response = await fetch(`/api/admin/detail/${record.test_id}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (response.status === 401) {
      notifyAuthRequired();
      return;
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || '获取评分详情失败');
    }
    const score = data?.score ?? null;
    detailScore.value = score;
    detailDetails.value = score?.result_details ?? null;
    if (Array.isArray(detailDetails.value)) {
      detailWords.value = detailDetails.value;
    } else {
      detailWords.value = Array.isArray(detailDetails.value?.words) ? detailDetails.value.words : [];
    }
  } catch (err) {
    detailError.value = err.message || '获取评分详情失败';
  } finally {
    detailLoading.value = false;
  }
};

const formatScore = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') return value.toFixed(1);
  return String(value);
};

const formatPhonemes = (phonemes) => {
  if (!Array.isArray(phonemes) || phonemes.length === 0) return '—';
  return phonemes
    .map((item) => {
      const name = item.phoneme ?? '';
      const score = formatScore(item.pronunciation);
      return `${name}:${score}`;
    })
    .join('  ');
};

const scoreUnderlineClass = (value) => {
  if (value === null || value === undefined) return 'border-b border-slate-200 text-slate-700';
  const score = Number(value);
  if (Number.isNaN(score)) return 'border-b border-slate-200 text-slate-700';
  if (score >= 85) return 'border-b-2 border-emerald-400 text-emerald-700';
  if (score >= 60) return 'border-b-2 border-amber-400 text-amber-700';
  return 'border-b-2 border-rose-400 text-rose-700';
};

const scoreTextClass = (value) => {
  if (value === null || value === undefined) return 'text-slate-400';
  const score = Number(value);
  if (Number.isNaN(score)) return 'text-slate-400';
  if (score >= 85) return 'text-emerald-700';
  if (score >= 60) return 'text-amber-700';
  return 'text-rose-700';
};

const activeWord = computed(() => {
  if (activeWordIndex.value === null) return null;
  return detailWords.value[activeWordIndex.value] || null;
});

const detailSpeed = computed(() => {
  if (detailScore.value?.speed !== undefined) return detailScore.value.speed;
  if (detailDetails.value?.speed !== undefined) return detailDetails.value.speed;
  return null;
});

const detailAudioUrl = computed(() => {
  if (!activeRecord.value?.record_id) return '';
  return audioUrl(activeRecord.value.record_id);
});

onMounted(() => {
  refreshAdmin();
});
</script>
