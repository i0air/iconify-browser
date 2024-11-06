import { createApp } from 'vue'
import App from './App.vue'
import "./assets/main.css";

createApp(App).mount('#app').$nextTick(() => {
  // Remove Preload scripts loading
  postMessage({ payload: 'removeLoading' }, '*')
})
