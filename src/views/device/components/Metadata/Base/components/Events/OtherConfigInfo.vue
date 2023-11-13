<template>
    <div v-if="['float', 'double'].includes(value.type)" class="values-text">{{ value.scale }}</div>
    <div v-else-if="value.type == 'boolean'" class="values-text">{{ value.trueText }}-{{ value.trueValue }}; {{ value.falseText }}-{{ value.falseValue }}</div>
    <div v-else-if="['string', 'password'].includes(value.type)" class="values-text">{{ value.expands?.maxLength }}</div>
    <div v-else-if="value.type == 'date'" class="values-text">{{ value.date }}</div>
    <div v-else-if="value.type == 'enum'" class="values-text">{{ value.elements?.map((item) => item.text).join(';')   }}</div>
    <div v-else-if="['int', 'long', 'geoPoint'].includes(value.type)" class="values-text">无</div>
</template>

<script lang="ts" name="OtherConfigInfo" setup>

const props = defineProps({
    value: {
        type: Object,
        default: () => ({}),
    }
})

const test = computed(() => {
    const value = props.value
    const type = props.value?.type
    if (value.value) {

    }
    switch(type) {
        case 'float':
        case 'double':
            return value.scale;
        case 'boolean':
            return value?.trueText ? `${ value?.trueText }-${ value.trueValue }; ${ value.falseText }-${ value.falseValue }` : '';
        case 'string':
        case 'password':
            return value?.expands?.maxLength;
        case 'int':
        case 'long':
            return '无'
    }
})
</script>
