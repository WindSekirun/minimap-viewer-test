<template>
  <suspense>
    <v-app>
      <v-main>
        <LogViewer @called="called" />
        <div class="text-center">
          <v-snackbar
            v-model="snackBar"
            :timeout="2000"
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

function called(page: number) {
  snackBarText.value = `${page}페이지 요청됨!`;
  snackBar.value = true;
}
</script>
