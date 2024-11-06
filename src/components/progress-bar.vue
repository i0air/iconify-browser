<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{ per: number }>();
const ltwidth = computed(() => props.per.toFixed(1) + "%");
const gtwidth = computed(() => (100 - props.per).toFixed(1) + "%");
</script>

<template>
  <div class="progress-bar">
    <div class="lt" :style="{ width: ltwidth }"></div>
    <div class="gt" :style="{ width: gtwidth }"></div>
  </div>
</template>

<style lang="scss" scoped>
.progress-bar {
  display: flex;
  position: relative;
  align-items: center;

  div {
    height: 100%;
  }

  .lt {
    background-color: red;
  }

  .gt {
    background-color: transparent;
  }
}
</style>
