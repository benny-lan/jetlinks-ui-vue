<template>
  <j-select
    v-model:value="myValue"
    :options="[
        { label: '不必填', value: 'false'},
        { label: '必填', value: 'true'},
    ]"
    style="width: 100%;"
    @change="change"
  >

  </j-select>
</template>

<script name="ConstraintSelect" setup>
import { set, get } from 'lodash-es'
import {FULL_CODE} from "jetlinks-ui-components/es/DataTable";

const props = defineProps({
  value: {
    type: Object,
    default: () => ({})
  },
  name: {
    type: [String, Array],
    default: ['expands','required']
  }
})

const emit = defineEmits(['update:value'])
const fullRef = inject(FULL_CODE);

const myValue = ref()

const change = (e) => {
  const newData = { ...props.value }
  set(newData, props.name, myValue.value === 'true')
  console.log(newData, e);
  emit('update:value', newData)
}

watch(() => JSON.stringify(props.data), () => {
  console.log(props.value, props.name);
  myValue.value = get(props.value, props.name) === true ? 'true' : 'false'
}, { immediate: true })

</script>

<style scoped>

</style>
