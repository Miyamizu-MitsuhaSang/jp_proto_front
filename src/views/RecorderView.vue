<template>
  <section class="flex select-none flex-col gap-10">
    <header class="space-y-3">
      <p class="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
        发音评测上传
      </p>
      <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
        录音、回放并提交评测
      </h1>
      <p class="max-w-3xl text-sm text-slate-600 sm:text-base">
        学校与年级为下拉选择，录音将尽量使用 mp3 格式（浏览器不支持时会退化为可用格式）
      </p>
    </header>

    <section class="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-slate-200/60 backdrop-blur">
      <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div class="space-y-5">
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="space-y-2 text-sm">
              <span class="font-medium text-slate-700">姓名</span>
              <input
                v-model.trim="name"
                type="text"
                placeholder="请输入姓名"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm select-text"
              />
            </label>
            <label class="space-y-2 text-sm">
              <span class="font-medium text-slate-700">性别</span>
              <select v-model="gender" class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm select-text">
                <option value="" disabled>请选择性别</option>
                <option v-for="option in genderOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
            <label class="space-y-2 text-sm">
              <span class="font-medium text-slate-700">学校</span>
              <select v-model="schoolLevel" class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm select-text">
                <option value="" disabled>请选择学校</option>
                <option v-for="option in schoolLevels" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </label>
            <label class="space-y-2 text-sm">
              <span class="font-medium text-slate-700">学习时长</span>
              <div class="relative">
                <input
                  v-model.number="learningAge"
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  min="0"
                  max="50"
                  step="1"
                  placeholder="例如 1（必选）"
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-11 text-sm placeholder:text-slate-400 [appearance:textfield] select-text"
                />
                <div class="absolute inset-y-1 right-1 flex flex-col gap-[2px]">
                  <button
                    type="button"
                    class="flex h-1/2 items-center justify-center rounded-md bg-transparent px-1 text-[9px] font-semibold text-slate-500 transition hover:-translate-y-[1px] hover:text-slate-700"
                    aria-label="学习时长加一"
                    @click="incrementLearningAge"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    class="flex h-1/2 items-center justify-center rounded-md bg-transparent px-1 text-[9px] font-semibold text-slate-500 transition hover:translate-y-[1px] hover:text-slate-700"
                    aria-label="学习时长减一"
                    @click="decrementLearningAge"
                    :disabled="Number(learningAge || 0) <= 0"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </label>
            <label class="space-y-2 text-sm sm:col-span-2">
              <span class="font-medium text-slate-700">年级</span>
              <select v-model="grade" class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm select-text">
                <option value="" disabled>请选择年级</option>
                <option v-for="option in availableGrades" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </label>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div class="flex items-center justify-between gap-4">
              <span class="font-medium text-slate-700">朗读文本</span>
              <button
                type="button"
                class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                :disabled="sentenceLoading"
                @click="fetchRandomSentence"
              >
                {{ sentenceLoading ? '获取中...' : '换一句' }}
              </button>
            </div>
            <p class="mt-3 min-h-[3rem] text-base text-slate-900 select-text">
              {{ refText || '正在获取参考文本...' }}
            </p>
            <div class="mt-3 flex items-center justify-end">
              <button
                type="button"
                class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                :disabled="!refText"
                @click="copyRefText"
              >
                复制文本
              </button>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              当前仅支持直接录音提交 暂不开放文件上传
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white">
            <p class="text-xs uppercase tracking-[0.25em] text-slate-400">录音控制</p>
            <div class="mt-4 flex flex-wrap gap-3">
              <button
                class="rounded-full bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="isRecording"
                @click="startRecording"
              >
                开始录音
              </button>
              <button
                class="rounded-full bg-rose-400/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="!isRecording"
                @click="stopRecording"
              >
                停止录音
              </button>
              <button
                class="rounded-full border border-slate-500 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                :disabled="!audioBlob"
                @click="resetRecording"
              >
                重录
              </button>
            </div>
              <p class="mt-4 text-xs text-slate-300">
                录音会尽量使用 mp3 若浏览器不支持则自动改用可用格式
              </p>
              <p v-if="!isSecureContext" class="mt-2 text-xs text-amber-300">
                当前为非 HTTPS 环境，浏览器将禁止录音
              </p>
              <p v-else-if="!canRecord" class="mt-2 text-xs text-amber-300">
                当前浏览器不支持录音功能
              </p>
            </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-5">
            <p class="text-xs uppercase tracking-[0.25em] text-slate-500">回放预览</p>
            <div class="mt-3">
              <audio v-if="audioUrl" :src="audioUrl" controls class="w-full"></audio>
              <p v-else class="text-sm text-slate-500">暂无录音</p>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="!audioBlob"
                @click="saveRecording"
              >
                保存录音
              </button>
            </div>
          </div>

          <button
            class="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSubmitting"
            @click="resetUserInfo"
          >
            重置信息
          </button>

          <button
            class="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!audioBlob || !refText || sentenceLoading || !name || !gender || !schoolLevel || !grade || learningAge === '' || Number(learningAge) < 0 || isSubmitting"
            @click="submitAnalyze"
          >
            {{ isSubmitting ? '提交中...' : '提交评测' }}
          </button>

          <div v-if="status" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {{ status }}
          </div>
          <div v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {{ error }}
          </div>
        </div>
      </div>
    </section>

    <section v-if="resultScore" ref="scoreSection" class="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-slate-800">打分情况</h2>
        <button
          type="button"
          class="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          @click="startNewTest"
        >
          新的测试
        </button>
      </div>

      <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Overall</p>
          <p class="mt-2 text-2xl font-semibold" :class="scoreTextClass(resultScore.overall)">
            {{ formatScore(resultScore.overall) }}
          </p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Pronunciation</p>
          <p class="mt-2 text-2xl font-semibold" :class="scoreTextClass(resultScore.pronunciation)">
            {{ formatScore(resultScore.pronunciation) }}
          </p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Fluency</p>
          <p class="mt-2 text-2xl font-semibold" :class="scoreTextClass(resultScore.fluency)">
            {{ formatScore(resultScore.fluency) }}
          </p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Rhythm</p>
          <p class="mt-2 text-2xl font-semibold" :class="scoreTextClass(resultScore.rhythm)">
            {{ formatScore(resultScore.rhythm) }}
          </p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Tone</p>
          <p class="mt-2 text-2xl font-semibold" :class="scoreTextClass(resultScore.tone)">
            {{ formatScore(resultScore.tone) }}
          </p>
        </div>
      </div>

      <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <p class="text-xs uppercase tracking-[0.2em] text-slate-500">分词评分</p>
        <div v-if="resultWords.length" class="mt-4 space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-[radial-gradient(circle_at_top,_#f8fafc,_#eef2ff_60%,_#f1f5f9)] p-4">
            <div class="flex flex-wrap items-center gap-2 text-base text-slate-900">
              <span
                v-for="(word, idx) in resultWords"
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
              <span>鼠标移到分词上查看对应评分</span>
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
                <p class="mt-1 text-base font-semibold" :class="scoreTextClass(resultScore.speed)">
                  {{ formatScore(resultScore.speed) }}
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
          未返回分词评分数据
        </div>
      </div>
    </section>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="toastMessage"
        class="fixed top-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-emerald-200/70 bg-white/90 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-lg shadow-emerald-200/40 backdrop-blur"
      >
        <span class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">✓</span>
        {{ toastMessage }}
      </div>
    </transition>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const schoolLevels = ['中学', '大学'];
const grades = ['一年生', '二年生', '三年生', '四年生'];
const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
];
const schoolLevel = ref('');
const grade = ref('');
const refText = ref('');
const name = ref('');
const gender = ref('');
const learningAge = ref('');

const isRecording = ref(false);
const isSubmitting = ref(false);
const status = ref('');
const error = ref('');
const toastMessage = ref('');
const toastTimer = ref(null);
const apiResponse = ref('');
const resultScore = ref(null);
const sentenceLoading = ref(false);
const activeWordIndex = ref(null);
const scoreSection = ref(null);

const audioBlob = ref(null);
const audioUrl = ref('');
const preferredMimeType = ref('');

let mediaRecorder = null;
let mediaStream = null;
let recordedChunks = [];

const isSecureContext = computed(() => Boolean(window.isSecureContext));
const canRecord = computed(() => Boolean(navigator.mediaDevices?.getUserMedia));
const resultWords = computed(() => {
  if (!resultScore.value) return [];
  if (Array.isArray(resultScore.value)) return resultScore.value;
  if (Array.isArray(resultScore.value.words)) return resultScore.value.words;
  if (Array.isArray(resultScore.value.result_details)) return resultScore.value.result_details;
  return [];
});

const activeWord = computed(() => {
  if (activeWordIndex.value === null) return null;
  return resultWords.value[activeWordIndex.value] || null;
});
const availableGrades = computed(() => {
  if (!schoolLevel.value) return [];
  if (schoolLevel.value === '中学') {
    return grades.filter((item) => item !== '四年生');
  }
  return grades;
});

watch(
  () => schoolLevel.value,
  () => {
    if (!availableGrades.value.includes(grade.value)) {
      grade.value = '';
    }
  }
);

const pickMimeType = () => {
  const candidates = ['audio/mpeg', 'audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'];
  const found = candidates.find((type) => window.MediaRecorder?.isTypeSupported?.(type));
  return found || '';
};

const cleanupStream = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
};

const resetRecording = () => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
  audioBlob.value = null;
  audioUrl.value = '';
};

const clampLearningAge = (value) => Math.min(50, Math.max(0, value));

const incrementLearningAge = () => {
  const current = Number.isFinite(Number(learningAge.value)) ? Number(learningAge.value) : 0;
  learningAge.value = clampLearningAge(current + 1);
};

const decrementLearningAge = () => {
  const current = Number.isFinite(Number(learningAge.value)) ? Number(learningAge.value) : 0;
  learningAge.value = clampLearningAge(current - 1);
};

const startRecording = async () => {
  error.value = '';
  status.value = '';
  apiResponse.value = '';

  try {
    if (!isSecureContext.value) {
      throw new Error('当前为非 HTTPS 环境，浏览器会阻止麦克风权限');
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('当前浏览器不支持录音功能');
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStream = stream;
    recordedChunks = [];

    const mimeType = pickMimeType();
    preferredMimeType.value = mimeType;

    mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => {
      if (event.data?.size) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blobType = mediaRecorder?.mimeType || 'audio/webm';
      const blob = new Blob(recordedChunks, { type: blobType });
      resetRecording();
      audioBlob.value = blob;
      audioUrl.value = URL.createObjectURL(blob);
      cleanupStream();
      status.value = '录音完成，可以回放或提交';
    };

    mediaRecorder.start();
    isRecording.value = true;
    status.value = '录音中...';
  } catch (err) {
    cleanupStream();
    error.value = err?.message || '无法访问麦克风，请检查浏览器权限';
  }
};

const stopRecording = () => {
  if (!mediaRecorder) return;
  mediaRecorder.stop();
  isRecording.value = false;
};

const saveRecording = () => {
  if (!audioBlob.value || !audioUrl.value) return;
  const link = document.createElement('a');
  link.href = audioUrl.value;
  link.download = `recording_${Date.now()}.mp3`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


const extensionFromMime = (mimeType) => {
  if (mimeType === 'audio/mpeg') return 'mp3';
  if (mimeType === 'audio/mp4') return 'mp4';
  if (mimeType?.includes('webm')) return 'webm';
  return 'audio';
};

const submitAnalyze = async () => {
  error.value = '';
  status.value = '';
  apiResponse.value = '';

  if (!audioBlob.value) {
    error.value = '请先录音';
    return;
  }
  if (!name.value) {
    error.value = '请输入姓名';
    return;
  }
  if (!gender.value) {
    error.value = '请选择性别';
    return;
  }
  if (!schoolLevel.value) {
    error.value = '请选择学校';
    return;
  }
  if (!grade.value) {
    error.value = '请选择年级';
    return;
  }
  if (learningAge.value === '') {
    error.value = '请填写学习时长';
    return;
  }
  if (Number.isNaN(learningAge.value) || Number(learningAge.value) < 0) {
    error.value = '请输入有效的学习时长';
    return;
  }
  if (!refText.value) {
    error.value = '参考文本获取中，请稍候';
    return;
  }

  const formData = new FormData();
  const mimeType = audioBlob.value.type || preferredMimeType.value || 'audio/webm';
  const extension = extensionFromMime(mimeType);
  formData.append('audio', audioBlob.value, `recording.${extension}`);
  formData.append('ref_text', refText.value);
  formData.append('core', 'sent');
  formData.append('name', name.value);
  formData.append('gender', gender.value);
  formData.append('learning_age', String(learningAge.value));
  formData.append('school_level', schoolLevel.value);
  formData.append('grade', grade.value);

  isSubmitting.value = true;
  status.value = '正在提交到后端...';

  try {
    const response = await fetch('/api/test/analyze', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || '提交失败');
    }

    resultScore.value = data?.result_score ?? null;
    activeWordIndex.value = null;

    const recordId = data?.record_id;
    if (recordId) {
      try {
        const uploadResponse = await fetch('/api/test/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            record_id: recordId,
            name: name.value,
            gender: gender.value,
            school_level: schoolLevel.value,
            grade: grade.value,
            learning_age: Number(learningAge.value),
          }),
        });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(uploadData?.detail || '信息同步失败');
        }
      } catch (uploadErr) {
        error.value = uploadErr.message || '信息同步失败';
      }
    }

    await nextTick();
    if (scoreSection.value) {
      scoreSection.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    status.value = '提交成功';
  } catch (err) {
    error.value = err.message || '提交失败，请稍后再试';
  } finally {
    isSubmitting.value = false;
  }
};

onBeforeUnmount(() => {
  resetRecording();
  cleanupStream();
});

const fetchRandomSentence = async () => {
  error.value = '';
  sentenceLoading.value = true;
  try {
    const response = await fetch('/api/test/random_sentence');
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || '获取参考文本失败');
    }
    refText.value = data?.text || '';
  } catch (err) {
    error.value = err.message || '获取参考文本失败，请稍后再试';
  } finally {
    sentenceLoading.value = false;
  }
};

onMounted(() => {
  fetchRandomSentence();
});

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

const startNewTest = () => {
  resultScore.value = null;
  activeWordIndex.value = null;
  error.value = '';
  status.value = '';
  resetRecording();
  fetchRandomSentence();
};

const resetUserInfo = () => {
  name.value = '';
  gender.value = '';
  schoolLevel.value = '';
  grade.value = '';
  learningAge.value = '';
};

const copyRefText = async () => {
  if (!refText.value) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(refText.value);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = refText.value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    toastMessage.value = '复制成功';
    if (toastTimer.value) {
      clearTimeout(toastTimer.value);
    }
    toastTimer.value = setTimeout(() => {
      toastMessage.value = '';
      toastTimer.value = null;
    }, 2000);
  } catch (err) {
    error.value = '复制失败，请手动选择文本';
  }
};

</script>
