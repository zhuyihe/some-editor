<script setup lang="ts">
import EditorView from './views/EditorView.vue';
// AISidebar import removed
</script>

<template>
  <div class="app-container">
    <EditorView />
    {/* AISidebar component tag removed */}
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  padding: 0;
  margin: 0;
  position: relative; 
}
</style>
