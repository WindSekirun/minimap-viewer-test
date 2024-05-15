<template>
  <div>
    <div ref="logContainer" class="log-container" @scroll="onScroll">
      <div
        v-for="(log, index) in logs"
        :key="index"
        :style="getLogLineStyle(log)"
        class="log-item ms-2 me-2"
      >
        #{{ log.id }}. {{ log.log }}
        <div v-show="log.id == lastLine" style="height: 80px" />
      </div>
    </div>
    <canvas
      ref="minimap"
      class="minimap"
      @mousedown="onMinimapDragStart"
      @click="onMinimapClick"
    ></canvas>
    <v-btn
      class="scroll-to-top-btn"
      @click="clickScrollToTop"
      icon="mdi-chevron-up"
    >
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from "vue";
import { LogContent, LogStyle } from "../model/LogContent";

const lengthPerPage = 80;
const maxPage = 5;

const logs = ref<LogContent[]>([]);
const hasNextPage = ref(false);
const page = ref(1);
const lastLine = ref(0);
const logContainer = ref<HTMLElement | null>(null);
const minimap = ref<HTMLCanvasElement | null>(null);
const emit = defineEmits<{
  (eventName: "called", page: number): void;
}>();
const isDragging = ref(false);

const getLogStyle = (log: LogContent) => {
  let result: { backgroundColor: string; textColor: string };
  switch (log.style) {
    case LogStyle.ERROR:
      result = {
        backgroundColor: "#DC143C",
        textColor: "#ffffff",
      };
      break;
    case LogStyle.WARNING:
      result = {
        backgroundColor: "#FFFF33",
        textColor: "#000000",
      };
      break;
    default:
      result = {
        backgroundColor: "#FFFFFF",
        textColor: "#000000",
      };
      break;
  }
  return result;
};

const getLogLineStyle = (log: LogContent) => {
  const result: { backgroundColor: string; textColor: string } =
    getLogStyle(log);
  return `background-color: ${result.backgroundColor}; color: ${result.textColor}`;
};

const fetchLogs = async (pageNum: number) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const response = {
    data: {
      logContent: Array.from({ length: lengthPerPage }, (_, index) => ({
        id:
          lengthPerPage * maxPage -
          (pageNum - 1) * lengthPerPage -
          (lengthPerPage - index - 1),
        log: Array.from(
          { length: Math.floor(Math.random() * 169) + 12 },
          () => Math.random().toString(36)[2]
        ).join(""),
        style:
          index % (Math.floor(Math.random() * 169) + 1) == 0
            ? LogStyle.ERROR
            : index % (Math.floor(Math.random() * 80) + 1) == 0
            ? LogStyle.WARNING
            : LogStyle.NORMAL,
      })),
      hasNextPage: pageNum < maxPage,
    },
  };

  logs.value = [...response.data.logContent, ...logs.value];
  hasNextPage.value = response.data.hasNextPage;
  drawMinimap();
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

  drawMinimap();
};

const clickScrollToTop = async () => {
  while (hasNextPage.value) {
    page.value += 1;
    await fetchLogs(page.value);
  }

  if (logContainer.value) {
    logContainer.value.scrollTop = 0;
  }
};

const drawMinimap = () => {
  if (!minimap.value || !logContainer.value) return;

  const context = minimap.value.getContext("2d");
  if (!context) return;

  const containerHeight = logContainer.value.scrollHeight;
  const viewportHeight = logContainer.value.clientHeight;
  const scrollTop = logContainer.value.scrollTop;

  const minimapWidth = 100;
  const logLineHeight = 2;
  const logSpacing = 1;

  const numLogs = logs.value.length;
  const minimapHeight = numLogs * (logLineHeight + logSpacing);

  minimap.value.width = minimapWidth;
  minimap.value.height = minimapHeight;

  context.clearRect(0, 0, minimapWidth, minimapHeight);
  context.fillStyle = "rgba(0, 0, 0, 0.35)";
  context.fillRect(0, 0, minimapWidth, minimapHeight);

  logs.value.forEach((log, index) => {
    const result: { backgroundColor: string; textColor: string } =
      getLogStyle(log);
    const y = index * (logLineHeight + logSpacing);
    if (log.style != LogStyle.NORMAL) {
      context.fillStyle = result.backgroundColor;
      context.fillRect(0, y, minimapWidth, logLineHeight);
    }
  });

  const viewportStartY = (scrollTop / containerHeight) * minimapHeight;
  const viewportHeightScaled =
    (viewportHeight / containerHeight) * minimapHeight;
  context.fillStyle = "rgba(255, 255, 255, 0.4)";
  context.fillRect(0, viewportStartY, minimapWidth, viewportHeightScaled);
};

const disableTextSelection = () => {
  document.body.style.userSelect = 'none';
};

const enableTextSelection = () => {
  document.body.style.userSelect = 'auto';
};

const onMinimapClick = (event: MouseEvent) => {
  if (!minimap.value || !logContainer.value) return;

  const rect = minimap.value.getBoundingClientRect();
  const clickY = event.clientY - rect.top;
  const scale = logContainer.value.scrollHeight / minimap.value.clientHeight;

  logContainer.value.scrollTop = clickY * scale;
};

const onMinimapDragStart = (event: MouseEvent) => {
  isDragging.value = true;
  disableTextSelection();
  onMinimapDragMove(event);
  window.addEventListener("mousemove", onMinimapDragMove);
  window.addEventListener("mouseup", onMinimapDragEnd);
};

const onMinimapDragMove = (event: MouseEvent) => {
  if (!isDragging.value || !minimap.value || !logContainer.value) return;

  const rect = minimap.value.getBoundingClientRect();
  const dragY = event.clientY - rect.top;
  const scale = logContainer.value.scrollHeight / minimap.value.clientHeight;

  logContainer.value.scrollTop = dragY * scale;
};

const onMinimapDragEnd = () => {
  isDragging.value = false;
  enableTextSelection();
  window.removeEventListener("mousemove", onMinimapDragMove);
  window.removeEventListener("mouseup", onMinimapDragEnd);
};

onMounted(async () => {
  await fetchLogs(page.value);
  lastLine.value = logs.value.at(-1)?.id || 0;
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight;
    }
  });
  drawMinimap();
});

watch(logs, drawMinimap);
</script>

<style scoped>
.log-container {
  height: 100vh;
  overflow-y: auto;
  position: relative;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.log-item {
  word-wrap:break-word;
  padding: 3px;
  font-size: 0.7em;
}

.scroll-to-top-btn {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 1000;
}

.minimap {
  position: fixed;
  top: 10px;
  right: 10px;
  width: 100px;
  height: 250px;
  border: 1px solid #bbb;
  z-index: 1000;
  cursor: pointer;
}
</style>