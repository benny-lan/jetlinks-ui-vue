<template>
<j-form-item :rules="[
  {
    required: true,
    message: '请选择读写类型'
  }
]" label="读写类型" name="type">
  <j-select
      v-model:value="myValue"
      :disabled="disabled"
      :options="options"
      mode="multiple"
      placeholder="请选择读写类型"
      @change="onChange"
  />
</j-form-item>
</template>

<script lang="ts" name="ReadType" setup>

import type {PropType} from "vue";

type Emit = {
  (e: 'update:value', data: Array<string>): void
  (e: 'change', data: Array<string>): void
}

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  value: {
    type: Array as PropType<Array<string>>,
    default: () => []
  },
  options: {
    type: Array as PropType<Array<{label: string, value: string}>>,
    default: () => []
  }
})

const emit = defineEmits<Emit>()

const myValue = ref<Array<string>>([])

const onChange = (keys: Array<string>) =>{
  myValue.value = keys
  emit('update:value', keys)
  emit('change', keys)
}

watch(() => props.value, () => {
  myValue.value = props.value
}, { immediate: true})

</script>

<style scoped>

</style>
