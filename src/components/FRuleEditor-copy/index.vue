<template>
  <Editor :id="id" key="simple" v-model:value="_value" @change="change" />
  <Advance v-if="ruleEditorStore.state.model === 'advance'" :id="id" v-model:value="_value"
    :model="ruleEditorStore.state.model" :virtualRule="virtualRule" @change="change" />
</template>
<script lang="ts" setup>
import { useRuleEditorStore } from '@/store/ruleEditor'
import Editor from './Editor/index.vue'
import Advance from './Advance/index.vue'

interface Props {
  value: string;
  property?: string;
  virtualRule?: any;
  id?: string;
}

const props = defineProps<Props>()

interface Emits {
  (e: 'update:value', data: string): void;
}

const emit = defineEmits<Emits>()

const _value = computed({
  get: () => props.value,
  set: (val: string) => {
    emit('update:value', val)
  }
})

const ruleEditorStore = useRuleEditorStore()

const change = (v: string) => {
  ruleEditorStore.set('model', v);
}

onMounted(() => {
  ruleEditorStore.set('property', props.property)
  ruleEditorStore.set('code', props.value);
})
</script>
<style lang="less" scoped></style>
