<template>
    <j-input
        v-if="type === 'string'"
        v-model:value="myValue"
        placeholder="请输入"
        @change="change"
    />
    <j-input-number
        v-else-if="type === 'int'"
        v-model:value="myValue"
        :max="2147483647"
        :min="-2147483648"
        :precision="0"
        placeholder="请输入"
        style="width: 100%"
        @change="change"
    />
    <j-input-number
        v-else-if="type === 'long'"
        v-model:value="myValue"
        :max="999999999999999"
        :min="-999999999999999"
        :precision="0"
        placeholder="请输入"
        style="width: 100%"
        @change="change"
    />
    <j-input-number
        v-else-if="['float', 'double'].includes(type)"
        v-model:value="myValue"
        :max="999999999999999"
        :min="-999999999999999"
        placeholder="请输入"
        style="width: 100%"
        @change="change"
    />
    <j-select
        v-else-if="type === 'boolean'"
        v-model:value="myValue"
        :get-popup-container="(node) => fullRef || node"
        :options="options"
        placeholder="请选择"
        style="width: 100%"
        @change="change"
    />
    <j-date-picker
        v-else-if="type === 'date' "
        v-model:value="myValue"
        :get-popup-container="(node) => fullRef || node"
        format="YYYY-MM-DD HH:mm:ss"
        placeholder="请选择"
        show-time
        style="width: 100%"
        valueFormat="YYYY-MM-DD HH:mm:ss"
        @change="change"
    />
</template>
<script name="MetricValueItem" setup>
import { Form } from 'jetlinks-ui-components'
import {FULL_CODE} from "jetlinks-ui-components/es/DataTable";

const props = defineProps({
    value: {
        type: [String, Number, Array],
        default: undefined
    },
    options: {
      type: Array,
      default: () => []
    }
})

const emit = defineEmits(['update:value'])
const formItemContext = Form.useInjectFormItemContext();

const type = inject('metricsType')
const myValue = ref(props.value)
const fullRef = inject(FULL_CODE);

const change = () => {
    emit('update:value', myValue.value)
    formItemContext.onFieldChange()
}

watch(() => props.value, () => {
    myValue.value = props.value
})

</script>
