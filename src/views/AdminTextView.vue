<template>
  <section class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200/40 backdrop-blur">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">管理界面</p>
        <h1 class="mt-2 text-2xl font-semibold text-slate-900">朗读文本管理</h1>
        <p class="mt-2 text-sm text-slate-600">新增、编辑与删除朗读文本</p>
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
          :disabled="textLoading"
          @click="fetchAdminTexts(1)"
        >
          {{ textLoading ? '刷新中...' : '刷新列表' }}
        </button>
      </div>
    </div>

    <div class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p class="text-xs uppercase tracking-[0.2em] text-slate-500">新增文本</p>
      <div class="mt-3 flex flex-wrap gap-3">
        <textarea
          v-model.trim="newText"
          rows="1"
          placeholder="输入新的朗读文本"
          class="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          @input="autoResizeNewText"
          ref="newTextArea"
        ></textarea>
        <button
          type="button"
          class="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          :disabled="!newText || textLoading"
          @click="addText"
        >
          新增
        </button>
      </div>
      <p v-if="textStatus" class="mt-2 text-xs text-slate-500">{{ textStatus }}</p>
    </div>

    <div class="mt-5 overflow-hidden rounded-2xl border border-slate-200">
      <table class="w-full table-fixed text-[11px] sm:text-xs text-slate-600">
        <colgroup>
          <col class="w-[10%]" />
          <col class="w-[65%]" />
          <col class="w-[25%]" />
        </colgroup>
        <thead class="bg-slate-100 text-[12px] uppercase tracking-[0.2em] text-slate-500">
          <tr>
            <th class="px-2 sm:px-3 py-3 text-center">ID</th>
            <th class="px-2 sm:px-3 py-3 text-center">文本</th>
            <th class="px-2 sm:px-3 py-3 text-center">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 bg-white">
          <tr v-if="textLoading">
            <td colspan="3" class="px-4 py-6 text-center text-sm text-slate-500">加载中...</td>
          </tr>
          <tr v-else-if="textRecords.length === 0">
            <td colspan="3" class="px-4 py-6 text-center text-sm text-slate-500">暂无朗读文本</td>
          </tr>
          <tr v-else v-for="item in textRecords" :key="item.text_id">
            <td class="px-2 sm:px-3 py-3 text-center font-mono text-[11px] text-slate-700">{{ item.text_id }}</td>
            <td class="px-2 sm:px-3 py-3 text-left text-[11px] sm:text-sm text-slate-800">
              <div v-if="editingTextId === item.text_id" class="flex flex-col gap-2">
                <textarea
                  v-model.trim="editingTextValue"
                  rows="3"
                  class="w-full flex-1 resize-none rounded-lg border border-slate-200 px-2 py-1 text-sm"
                  @input="autoResizeEditText"
                  ref="editTextArea"
                ></textarea>
                <div class="flex flex-nowrap items-center justify-start gap-2">
                  <button
                    type="button"
                    class="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                    :disabled="!editingTextValue || textLoading"
                    @click="saveEditText(item)"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    class="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                    @click="cancelEditText"
                  >
                    取消
                  </button>
                </div>
              </div>
              <div v-else class="whitespace-normal break-words">{{ item.text }}</div>
            </td>
            <td class="px-2 sm:px-3 py-3 text-center">
              <div class="flex flex-nowrap items-center justify-center gap-2">
                <button
                  type="button"
                  class="rounded-full border border-slate-200 px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                  :disabled="textLoading"
                  @click="startEditText(item)"
                >
                  编辑
                </button>
                <button
                  type="button"
                  class="rounded-full border border-rose-200 px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
                  :disabled="textLoading"
                  @click="deleteText(item)"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
      <p>共 {{ textTotal }} 条</p>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-50"
          :disabled="textPage <= 1 || textLoading"
          @click="fetchAdminTexts(1)"
        >
          首页
        </button>
        <button
          type="button"
          class="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-50"
          :disabled="textPage <= 1 || textLoading"
          @click="fetchAdminTexts(textPage - 1)"
        >
          上一页
        </button>
        <span>第 {{ textPage }} 页</span>
        <button
          type="button"
          class="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-50"
          :disabled="!textHasNext || textLoading"
          @click="fetchAdminTexts(textPage + 1)"
        >
          下一页
        </button>
        <button
          type="button"
          class="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-50"
          :disabled="!textHasNext || textLoading"
          @click="fetchAdminTexts(totalTextPages)"
        >
          末页
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';

const textRecords = ref([]);
const textPage = ref(1);
const textPageSize = ref(10);
const textTotal = ref(0);
const textHasNext = ref(false);
const textLoading = ref(false);
const textStatus = ref('');
const newText = ref('');
const editingTextId = ref(null);
const editingTextValue = ref('');
const newTextArea = ref(null);
const editTextArea = ref(null);
const totalTextPages = computed(() => Math.max(1, Math.ceil(textTotal.value / textPageSize.value)));

const notifyAuthRequired = () => {
  window.dispatchEvent(new Event('admin:auth-required'));
};

const fetchAdminTexts = async (targetPage = textPage.value) => {
  textLoading.value = true;
  textStatus.value = '';
  try {
    const response = await fetch(`/api/admin/all-text?page=${targetPage}&page_size=${textPageSize.value}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (response.status === 401) {
      notifyAuthRequired();
      return;
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || '获取朗读文本失败');
    }
    textRecords.value = data?.records || [];
    textPage.value = data?.page ?? targetPage;
    textTotal.value = data?.total ?? 0;
    textHasNext.value = Boolean(data?.has_next);
  } catch (err) {
    textRecords.value = [];
    textTotal.value = 0;
    textHasNext.value = false;
    textStatus.value = err.message || '获取朗读文本失败';
  } finally {
    textLoading.value = false;
  }
};

const addText = async () => {
  if (!newText.value) return;
  textLoading.value = true;
  textStatus.value = '';
  try {
    const response = await fetch('/api/admin/add-text', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text: newText.value }),
    });
    if (response.status === 401) {
      notifyAuthRequired();
      return;
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || '新增失败');
    }
    textStatus.value = '新增成功';
    newText.value = '';
    if (newTextArea.value) {
      newTextArea.value.style.height = '';
    }
    await fetchAdminTexts(1);
  } catch (err) {
    textStatus.value = err.message || '新增失败';
  } finally {
    textLoading.value = false;
  }
};

const startEditText = (item) => {
  editingTextId.value = item.text_id;
  editingTextValue.value = item.text;
  requestAnimationFrame(() => autoResizeEditText());
};

const cancelEditText = () => {
  editingTextId.value = null;
  editingTextValue.value = '';
  if (editTextArea.value) {
    editTextArea.value.style.height = '';
  }
};

const saveEditText = async (item) => {
  if (!editingTextValue.value) return;
  textLoading.value = true;
  textStatus.value = '';
  try {
    const response = await fetch('/api/admin/update-text', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        text_id: item.text_id,
        text: item.text,
        new_text: editingTextValue.value,
      }),
    });
    if (response.status === 401) {
      notifyAuthRequired();
      return;
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || '更新失败');
    }
    textStatus.value = '更新成功';
    cancelEditText();
    await fetchAdminTexts(textPage.value);
  } catch (err) {
    textStatus.value = err.message || '更新失败';
  } finally {
    textLoading.value = false;
  }
};

const deleteText = async (item) => {
  if (!window.confirm('确定删除该朗读文本吗')) return;
  textLoading.value = true;
  textStatus.value = '';
  try {
    const response = await fetch('/api/admin/delete-text', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text_id: item.text_id }),
    });
    if (response.status === 401) {
      notifyAuthRequired();
      return;
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || '删除失败');
    }
    textStatus.value = '删除成功';
    await fetchAdminTexts(textPage.value);
  } catch (err) {
    textStatus.value = err.message || '删除失败';
  } finally {
    textLoading.value = false;
  }
};

onMounted(() => {
  fetchAdminTexts(1);
});

const autoResizeNewText = () => {
  const el = newTextArea.value;
  if (!el) return;
  el.style.height = 'auto';
  const minHeight = parseFloat(getComputedStyle(el).lineHeight || '20') + 16;
  el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
};

const autoResizeEditText = () => {
  const el = editTextArea.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
};
</script>
