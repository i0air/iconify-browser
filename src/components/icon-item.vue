<script lang="ts" setup>
import { IconModel } from "#/icon-model";
import { computed } from "vue";

const props = defineProps<IconModel>();
const emits = defineEmits<{ (event: "click", code: string): void }>();
const svgWidth = computed(() => ratio(props) * 5 + "em");
const svgHeight = "5em";
const svgViewBox = computed(() => `0 0 ${props.width} ${props.height}`);

function handleClick() {
  const code = `import Icon${link2pascal(props.id)} from "~icons/${props.prefix}/${props.id}";`;
  emits("click", code);
}

function link2pascal(str: string) {
  const arr = str.split("-");
  for (let i = 0; i < arr.length; i++) {
    arr[i] = arr[i].slice(0, 1).toUpperCase() + arr[i].slice(1, arr[i].length);
  }
  return arr.join("");
}

function ratio(icon: IconModel) {
  if (icon.width && icon.height && icon.height > 0) {
    return icon.width / icon.height;
  } else {
    return 1;
  }
}

function tosvg() {
  const name = `${props.prefix}-${props.id}.svg`;
  const blob = new Blob([`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svgViewBox.value}">${props.body}</svg>`], { type: "image/svg+xml" });
  const href = window.URL.createObjectURL(blob);
  const link = window.document.createElement("a");

  link.target = "_blank";
  link.download = name;
  link.href = href;

  window.document.body.append(link);
  link.click();

  requestAnimationFrame(() => {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
    window.URL.revokeObjectURL(href);
  });
}

function topng() {
  const name = `${props.prefix}-${props.id}.png`;
  const link = window.document.createElement("a");
  const img = new Image();
  const blob = new Blob([`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svgViewBox.value}">${props.body}</svg>`], { type: "image/svg+xml" });
  const href = window.URL.createObjectURL(blob);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 512 * ratio(props);
  canvas.height = 512;
  img.src = href;
  img.onload = () => {
    ctx?.drawImage(img, 0, 0);
    link.target = "_blank";
    link.download = name;
    link.href = canvas.toDataURL("image/png");
    window.document.body.append(link);
    link.click();

    requestAnimationFrame(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      window.URL.revokeObjectURL(href);
    });
  };
}
</script>

<template>
  <div class="i-item">
    <div class="i-icon" @click="handleClick">
      <svg :width="svgWidth" :height="svgHeight" :viewBox="svgViewBox" v-html="props.body"></svg>
    </div>
    <div class="i-text">
      <div class="i-pre">{{ props.prefix }}</div>
      <div class="i-id">{{ props.id }}</div>
      <div class="i-button">
        <div class="i-svg" title="svg" @click="tosvg"></div>
        <div class="i-png" title="png" @click="topng"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes turn-a-round {
  0% {
    transform: scale(0.8) rotateX(-15deg) rotateY(0);
  }

  100% {
    transform: scale(0.8) rotateX(-15deg) rotateY(360deg);
  }
}

.i-item {
  display: flex;
  position: relative;
  align-items: center;
  gap: 8px;
  box-shadow: 0 0 3px 0px #00000080 inset;
  padding: 10px;

  .i-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 0 5px 0 #000000c0;
    min-width: 2em;

    &:hover {
      svg {
        z-index: 100;
        animation: 3s linear 0s infinite turn-a-round;
      }
    }
  }

  .i-text {
    display: flex;
    flex-direction: column;
    cursor: default;
    font-size: small;

    .i-pre {
      font-weight: bold;
    }

    .i-id {
      word-break: break-all;
    }

    .i-button {
      display: flex;
      justify-content: flex-end;
      gap: 5px;
      padding-top: 4px;

      & > div {
        cursor: pointer;
        box-shadow: 0 0 3px 0 #000000c0;
        border-radius: 3px;
        padding: 7px;

        &:hover {
          transform: scale(1.2);
        }
      }

      .i-svg {
        background-color: lightgreen;
      }

      .i-png {
        background-color: lightsalmon;
      }
    }
  }
}
</style>
