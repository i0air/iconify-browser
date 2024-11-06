<script lang="ts" setup>
import type { IconModel } from "#/icon-model";
import IconItem from "@/components/icon-item.vue";
import ProgressBar from "@/components/progress-bar.vue";
import { computed, onMounted, reactive } from "vue";
import IconChevronLeft from "~icons/material-symbols/chevron-left";
import IconChevronRight from "~icons/material-symbols/chevron-right";
import IconSearch from "~icons/material-symbols/search";
import IconRefresh from "~icons/material-symbols/refresh";

type State = {
  percentage: number;
  collection: string;
  keyword: string;
  select: string;
  offset: number;
  take: number;
  total: number;
  loading: boolean;
  options: Array<{ label: string; value: string }>;
  icons: IconModel[];
};

const state = reactive<State>({
  percentage: 0,
  collection: "",
  keyword: "",
  select: "",
  offset: 0,
  take: 200,
  total: 0,
  loading: false,
  options: [],
  icons: [],
});

const msg = reactive({ context: "", visible: false });
const showProgress = computed<boolean>(() => 0 < state.percentage && state.percentage < 100);

async function init() {
  window.ipcRenderer.send("mounted");
  window.ipcRenderer.on("progress", (_, ...args) => (state.percentage = args[0]));
  window.ipcRenderer.on("ready", (_, ...args) => (state.options = args[0]));
  window.ipcRenderer.on("result", (_, ...args) => {
    state.icons = args[0];
    state.total = args[1];
    window.document.title = `Iconify Browser (${state.offset + state.icons.length}/${state.total})`;
    window.document.querySelector(".i-item")?.scrollIntoView({ behavior: "smooth" });
    state.loading = false;
  });
}

function query() {
  state.loading = true;
  window.ipcRenderer.send("query", state.keyword, { collection: state.collection, offset: state.offset, take: state.take });
}

function search() {
  state.offset = 0;
  query();
}

function reset() {
  state.collection = "";
  state.offset = 0;
  state.keyword = "";
  query();
}

function prev() {
  if (state.offset >= state.take) {
    state.offset -= state.take;
    query();
  }
}

function next() {
  if (state.offset + state.take < state.total) {
    state.offset += state.take;
    query();
  }
}

function copy(code: string) {
  state.select = code;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code);
    msg.context = `引入代码已复制！`;
    msg.visible = true;

    setTimeout(() => {
      msg.visible = false;
    }, 3000);
  }
}

onMounted(() => {
  init();
});
</script>

<template>
  <div class="tool">
    <select v-model="state.collection" title="图标集" @change="search" :disabled="state.loading">
      <option value="">-- 所有图标集 --</option>
      <option class="item" v-for="op in state.options" :key="op.value" :value="op.value" v-html="op.label"></option>
    </select>
    <input type="text" v-model="state.keyword" placeholder="图标名称" :disabled="state.loading" @keydown.enter="search" />
    <button type="button" @click="search" :disabled="state.loading" title="查询"><IconSearch /></button>
    <button type="button" @click="reset" :disabled="state.loading" title="重置"><IconRefresh /></button>
    <button type="button" @click="prev" :disabled="state.loading" title="上一页"><IconChevronLeft /></button>
    <button type="button" @click="next" :disabled="state.loading" title="下一页"><IconChevronRight /></button>
    <input type="text" v-model="state.select" style="flex: auto" placeholder="图标路径" />
  </div>
  <div class="view">
    <icon-item v-for="(icon, idx) in state.icons" :key="idx" :="icon" @click="copy" />
  </div>
  <progress-bar class="progress" :per="state.percentage" v-show="showProgress" />
  <div class="msg" v-show="msg.visible">
    <div>{{ msg.context }}</div>
  </div>
</template>

<style lang="scss" scoped>
.tool {
  display: flex;
  position: fixed;
  top: 5px;
  left: 5px;
  gap: 5px;
  opacity: 0.85;
  z-index: 9;
  width: calc(100% - 10px);
  height: 24px;

  select {
    outline: none;
    box-shadow: 0 0 3px 1px #00000080 inset;
    border: none;
    border-radius: 3px;
    padding: 4px;
    width: 200px;

    .item {
      font-family: "Courier New", Courier, monospace;
    }
  }

  input {
    outline: none;
    box-shadow: 0 0 3px 1px #00000080 inset;
    border: none;
    border-radius: 3px;
    padding: 4px;
    width: 192px;
  }

  button {
    cursor: pointer;
    box-shadow: 0 0 3px 1px #00000080 inset;
    border: none;
    border-radius: 3px;
    padding: 4px;

    &:hover {
      background-color: #00000080;
      color: #ffffff;
    }
  }
}

.view {
  display: flex;
  position: fixed;
  top: 34px;
  flex-wrap: wrap;
  gap: 5px;
  padding: 0 5px 5px 5px;
  height: calc(100% - 39px);
  overflow-y: auto;
}

.progress {
  position: fixed;
  top: 0px;
  width: 100%;
  height: 1px;
}

.msg {
  display: flex;
  position: fixed;
  top: 40px;
  justify-content: center;
  width: 100%;

  & > div {
    background-color: black;
    padding: 5px 15px;
    color: darkorange;
    font-size: small;
  }
}
</style>
