<template>
  <section class="flex flex-col gap-10">
    <header class="space-y-3">
      <p class="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
        发音评测上传
      </p>
      <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
        录音、回放并提交评测
      </h1>
      <p class="max-w-3xl text-sm text-slate-600 sm:text-base">
        学校与年级为下拉选择，录音将尽量使用 mp3 格式（浏览器不支持时会退化为可用格式）。
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
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label class="space-y-2 text-sm">
              <span class="font-medium text-slate-700">性别</span>
              <select v-model="gender" class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <option v-for="option in genderOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
            <label class="space-y-2 text-sm">
              <span class="font-medium text-slate-700">学校</span>
              <select v-model="schoolLevel" class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <option v-for="option in schoolLevels" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </label>
            <label class="space-y-2 text-sm">
              <span class="font-medium text-slate-700">学习年限</span>
              <input
                v-model.number="learningAge"
                type="number"
                min="0"
                max="50"
                step="1"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label class="space-y-2 text-sm sm:col-span-2">
              <span class="font-medium text-slate-700">年级</span>
              <select v-model="grade" class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <option v-for="option in availableGrades" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </label>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div class="flex items-center justify-between gap-4">
              <span class="font-medium text-slate-700">参考文本</span>
              <button
                type="button"
                class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                :disabled="sentenceLoading"
                @click="fetchRandomSentence"
              >
                {{ sentenceLoading ? '获取中...' : '换一句' }}
              </button>
            </div>
            <p class="mt-3 min-h-[3rem] text-base text-slate-900">
              {{ refText || '正在获取参考文本...' }}
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              当前仅支持直接录音提交，暂不支持上传现有文件。
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white">
            <p class="text-xs uppercase tracking-[0.25em] text-slate-400">录音控制</p>
            <div class="mt-4 flex flex-wrap gap-3">
              <button
                class="rounded-full bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="!canRecord || isRecording"
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
              录音会尽量使用 mp3，若浏览器不支持则自动改用可用格式。
            </p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-5">
            <p class="text-xs uppercase tracking-[0.25em] text-slate-500">回放预览</p>
            <div class="mt-3">
              <audio v-if="audioUrl" :src="audioUrl" controls class="w-full"></audio>
              <p v-else class="text-sm text-slate-500">暂无录音。</p>
            </div>
          </div>

          <button
            class="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!audioBlob || !refText || sentenceLoading || !name || gender === '' || learningAge < 0 || isSubmitting"
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

    <section v-if="apiResponse" class="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <h2 class="text-base font-semibold text-slate-800">接口响应</h2>
      <pre class="mt-3 overflow-auto rounded-2xl bg-slate-900 p-4 text-xs text-emerald-200">
{{ apiResponse }}
      </pre>
    </section>

    <section v-if="resultScore" class="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <h2 class="text-base font-semibold text-slate-800">打分情况</h2>
      <div class="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <p class="text-xs uppercase tracking-[0.2em] text-emerald-600">Summary</p>
        <p class="mt-2 text-lg font-semibold text-emerald-900">
          {{ scoreSummary || '已返回评分结果' }}
        </p>
      </div>
      <pre class="mt-3 overflow-auto rounded-2xl bg-slate-900 p-4 text-xs text-emerald-200">
{{ JSON.stringify(resultScore, null, 2) }}
      </pre>
    </section>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const schoolLevels = ['中学', '大学'];
const grades = ['一年生', '二年生', '三年生', '四年生'];
const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
];
const schoolLevel = ref(schoolLevels[0]);
const grade = ref(grades[0]);
const refText = ref('');
const name = ref('');
const gender = ref(genderOptions[0].value);
const learningAge = ref(0);

const isRecording = ref(false);
const isSubmitting = ref(false);
const status = ref('');
const error = ref('');
const apiResponse = ref('');
const resultScore = ref(null);
const sentenceLoading = ref(false);

const audioBlob = ref(null);
const audioUrl = ref('');
const preferredMimeType = ref('');

let mediaRecorder = null;
let mediaStream = null;
let recordedChunks = [];

const canRecord = computed(() => Boolean(navigator.mediaDevices?.getUserMedia));
const scoreSummary = computed(() => {
  if (!resultScore.value) return '';
  if (typeof resultScore.value === 'string') return resultScore.value;
  if (typeof resultScore.value === 'number') return String(resultScore.value);
  if (typeof resultScore.value === 'object') {
    return resultScore.value.result ? String(resultScore.value.result) : '';
  }
  return '';
});
const availableGrades = computed(() => {
  if (schoolLevel.value === '中学') {
    return grades.filter((item) => item !== '四年生');
  }
  return grades;
});

watch(
  () => schoolLevel.value,
  () => {
    if (!availableGrades.value.includes(grade.value)) {
      grade.value = availableGrades.value[0];
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

const startRecording = async () => {
  error.value = '';
  status.value = '';
  apiResponse.value = '';

  try {
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
      status.value = '录音完成，可以回放或提交。';
    };

    mediaRecorder.start();
    isRecording.value = true;
    status.value = '录音中...';
  } catch (err) {
    cleanupStream();
    error.value = '无法访问麦克风，请检查浏览器权限。';
  }
};

const stopRecording = () => {
  if (!mediaRecorder) return;
  mediaRecorder.stop();
  isRecording.value = false;
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
    error.value = '请先录音。';
    return;
  }
  if (!name.value) {
    error.value = '请输入姓名。';
    return;
  }
  if (!gender.value) {
    error.value = '请选择性别。';
    return;
  }
  if (Number.isNaN(learningAge.value) || learningAge.value < 0) {
    error.value = '请输入有效的学习年限。';
    return;
  }
  if (!refText.value) {
    error.value = '参考文本获取中，请稍候。';
    return;
  }

  const formData = new FormData();
  const mimeType = audioBlob.value.type || preferredMimeType.value || 'audio/webm';
  const extension = extensionFromMime(mimeType);
  formData.append('audio', audioBlob.value, `recording.${extension}`);
  formData.append('ref_text', refText.value);
  formData.append('core', 'word');
  formData.append('name', name.value);
  formData.append('gender', gender.value);
  formData.append('learning_age', String(learningAge.value));
  formData.append('school_level', schoolLevel.value);
  formData.append('grade', grade.value);

  isSubmitting.value = true;
  status.value = '正在提交到后端...';

  try {
    const response = await fetch('/test/analyze', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || '提交失败');
    }

    resultScore.value = data?.result_score ?? null;
    apiResponse.value = JSON.stringify(data, null, 2);
    status.value = '提交成功。';
  } catch (err) {
    error.value = err.message || '提交失败，请稍后再试。';
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
    const response = await fetch('/test/random_sentence');
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || '获取参考文本失败');
    }
    refText.value = data?.text || '';
  } catch (err) {
    error.value = err.message || '获取参考文本失败，请稍后再试。';
  } finally {
    sentenceLoading.value = false;
  }
};

onMounted(() => {
  fetchRandomSentence();
});

</script>
