<template>
  <suspense>
    <v-app>
      <v-navigation-drawer
        class="pt-4"
        color="grey-lighten-3"
        model-value
        rail
        permanent
      >
        <v-avatar
          v-for="n in 6"
          :key="n"
          :color="`grey-${n === 1 ? 'darken' : 'lighten'}-1`"
          :size="n === 1 ? 36 : 20"
          class="d-block text-center mx-auto mb-9"
        ></v-avatar>
      </v-navigation-drawer>

      <v-main>
        <div class="pa-2">
          <v-btn variant="text" slim density="compact" icon="mdi-chevron-left"></v-btn>
          <v-btn variant="text" slim density="comfortable">#62009</v-btn>
          <span class="text-button">Build lOg</span>
        </div>
        <LogViewer @called="called" ref="logViewer" />
        <div class="text-center">
          <v-snackbar
            v-model="snackBar"
            :timeout="500"
            color="blue-grey"
            rounded="pill"
          >
            {{ snackBarText }}
          </v-snackbar>
        </div>
      </v-main>
    </v-app>
  </suspense>
</template>

<script setup lang="ts">
import { ref } from "vue";

const snackBar = ref(false);
const snackBarText = ref("");
const logViewer = ref();

function called(page: number) {
  snackBarText.value = `${page}페이지 요청됨!`;
  snackBar.value = true;
}
</script>

<style>
html {
  overflow: hidden !important;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

html::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>
