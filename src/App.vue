<script setup lang="ts">
import EditorView from './views/EditorView.vue';
import AISidebar from './components/AI/AISidebar.vue'; // Import the new component
</script>

<template>
  <div class="app-container">
    <EditorView />
    <AISidebar /> {/* Add the AISidebar component here */}
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  padding: 0;
  margin: 0;
  position: relative; /* Added to ensure FAB positioning context if needed, though FAB is fixed */
}
</style>
