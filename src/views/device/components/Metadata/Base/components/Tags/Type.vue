<template>
  <j-select
      v-model:value="myValue"
      :get-popup-container="(node) => fullRef || node"
      :options="[
        { label: '读', value: 'read'},
        { label: '写', value: 'write'},
        { label: '上报', value: 'report'},
      ]"
      mode="multiple"
      placeholder="请选择读写类型"
      @change="onChange"
  />
</template>

<script lang="ts" setup>

import type {PropType} from "vue";
import { FULL_CODE } from 'jetlinks-ui-components/es/DataTable'

type Emit = {
(e: 'update:value', data: any): void
}

const props = defineProps({
  value: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits<Emit>()
const fullRef = inject(FULL_CODE);
const myValue = ref<Array<string>>([])

const onChange = () =>{
  const _data = {
    ...props.value
  }
  console.log(props.value)
  _data.expands['type'] = myValue.value
  console.log(_data, myValue.value)
  emit('update:value', {
    ..._data
  })
}

watch(() => props.value.expands, () => {
  console.log(props.value)
  myValue.value = props.value?.expands?.type
}, { immediate: true})

</script>

<style scoped>

</style>
