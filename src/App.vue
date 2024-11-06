<script setup lang="ts">
import HomeView from "@/views/home-view.vue";
import { description, version, author } from "../package.json";
import { ref } from "vue";

const visible = ref(false);

function about() {
  visible.value = true;
}

window.ipcRenderer.on("about", about);
window.addEventListener("click", () => (visible.value = false));
</script>

<template>
  <home-view />
  <div v-show="visible" class="about">
    <div>{{ description }}</div>
    <div class="split"></div>
    <div>作者：{{ author }}</div>
    <div class="version">
      版本：{{ version }}
      <img src="./assets/flat-color-icons-engineering.svg" width="20" height="20" alt="icon" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes turn-a-round {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}
.about {
  display: flex;
  position: fixed;
  top: 35%;
  left: calc(50% - 98px);
  flex-direction: column;
  gap: 10px;
  z-index: 999;
  box-shadow:
    0 0 5px 1px #00000080 inset,
    3px 3px 5px 1px #00000080;
  border-radius: 5px;
  background-color: #f2e7e5;
  padding: 20px;
  font-size: small;

  .split {
    border-top: 1px solid #00000080;
    height: 0px;
  }

  .version {
    display: flex;
    justify-content: space-between;
    align-items: center;

    img {
      animation: 3s linear 0s infinite turn-a-round;
    }
  }
}
</style>
