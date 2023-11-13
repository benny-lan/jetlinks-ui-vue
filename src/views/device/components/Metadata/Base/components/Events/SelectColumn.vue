<template>
  <j-select
      v-model:value="value"
      :getPopupContainer="(node) => fullRef || node"
      :options="options"
      :placeholder="placeholder"
      @change="change"
  />
</template>

<script lang="ts" name="SelectColumnn" setup>
import type { PropType } from 'vue';
import { ref, watch } from 'vue';
import { FULL_CODE } from 'jetlinks-ui-components/es/DataTable'

type Emits = {
  (e: 'update:value', data: Record<string, any>): void;
  (e: 'change', data: string): void;
};

type SizeType = 'small' | 'middle' | 'large' | undefined;

const fullRef = inject(FULL_CODE);
const emit = defineEmits<Emits>();
const props = defineProps({
  value: {
      type: Object as PropType<Record<string, any>>,
      default: () => { },
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  options: {
    type: Array as PropType<{label: string, value: string}[]>,
    default: () => [],
  },

});

const value = ref(props.value.expands?.level);

const change = (v: string) => {
  emit('update:value', {...props.value, expands: {...props.value.expands, level: v}});
  emit('change', v);
};


watch(
  () => props.value,
  (newV) => {
      value.value = props.value.expands?.level;
  },
  { immediate: true },
);
</script>

<style scoped></style>
