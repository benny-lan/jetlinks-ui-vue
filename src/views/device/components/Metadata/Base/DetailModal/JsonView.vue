<template>
  <div class="json-view-box">
    <div class="json-view-border">
      <j-scrollbar :height="height">
        <JsonViewer :expandDepth="4" :expanded="true" :value="value" />
      </j-scrollbar>
    </div>

  </div>
</template>

<script lang="ts" name="JsonView" setup>
import 'vue3-json-viewer/dist/index.css';
import { JsonViewer } from 'vue3-json-viewer';

const props = defineProps({
  value: {
    type: [Object, Array],
    default: () => ({})
  },
  height: {
    type: Number,
    default: 250
  }
})

</script>

<style lang="less" scoped>
.json-view-box {
  width: 100%;
  padding-left: 32px;
  .json-view-border {
    border: 1px solid rgba(0,0,0,.15);
    border-radius:2px;
  }
}
</style>
