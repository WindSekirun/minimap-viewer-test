<template>
  <div>
    <div ref="logContainer" class="log-container" @scroll="onScroll">
      <div
        v-for="(log, index) in logs"
        :key="index"
        :style="{ backgroundColor: log.backgroundColor, color: log.textColor }"
        class="log-item"
      >
        #{{ log.id }}. {{ log.log }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from "vue";
import { LogContent } from "../model/LogContent";

const logs = ref<LogContent[]>([]);
const hasNextPage = ref(false);
const page = ref(1);
const logContainer = ref<HTMLElement | null>(null);

const emit = defineEmits<{
  (eventName: "called", page: number): void;
}>();
const lengthPerPage = 160
const maxPage = 5

const fetchLogs = async (pageNum: number) => {
  const response = {
    data: {
      logContent: Array.from({ length: lengthPerPage }, (_, index) => ({
        id: (lengthPerPage * maxPage) - ((pageNum - 1) * lengthPerPage) - (lengthPerPage - index),
        log: Array.from(
          { length: Math.floor(Math.random() * 109) + 12 },
          () => Math.random().toString(36)[2]
        ).join(""),
        backgroundColor:
          index % 8 === 0 ? "#FF0000" : index % 5 == 0 ? "#FFFF00" : "#FFFFFF",
        textColor: index % 8 === 0 ? "#FFFFFF" : "#000000",
      })),
      hasNextPage: pageNum < maxPage,
    },
  };

  logs.value = [...response.data.logContent, ...logs.value];
  hasNextPage.value = response.data.hasNextPage;
};

const onScroll = async () => {
  if (!logContainer.value) return;

  const { scrollTop, scrollHeight, clientHeight } = logContainer.value;

  if (scrollTop === 0 && hasNextPage.value) {
    page.value += 1;
    const previousHeight = scrollHeight;

    await fetchLogs(page.value);
    emit("called", page.value);
    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTop =
          logContainer.value.scrollHeight - previousHeight;
      }
    });
  }
};

onMounted(async () => {
  await fetchLogs(page.value);
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight;
    }
  });
});
</script>

<style scoped>
.log-container {
  height: 100vh;
  overflow-y: auto;
}

.log-item {
  white-space: pre-wrap;
  padding: 2px;
  font-size: 0.7em;
}
</style>
