<template>
    <j-input-group compact>
        <j-select
            :options="[
                { label: '手动输入', value: 'fixed' },
                { label: '内置参数', value: 'upper' },
            ]"
            :value="value?.source"
            style="width: 120px"
            @change="sourceChange"
        />
        <template v-if="source === 'upper'">
            <j-tree-select
                v-model:value="upperKey"
                :fieldNames="{ label: 'name', value: 'id' }"
                :treeData="builtInList"
                placeholder="请选择参数"
                style="width: calc(100% - 120px)"
                @change="(val) => itemOnChange(undefined, val)"
            >
            </j-tree-select>
        </template>
        <template v-else>
            <j-date-picker
                v-if="item.type === 'date'"
                :value="value.value"
                allowClear
                format="YYYY-MM-DD HH:mm:ss"
                style="width: calc(100% - 120px)"
                valueFormat='YYYY-MM-DD HH:mm:ss'
                @change="(_, dateString) => itemOnChange(dateString)"
            />
            <j-input-number
                v-else-if="item.type === 'number'"
                :placeholder="`请输入${item.name}`"
                :value="value.value"
                allowClear
                style="width: calc(100% - 120px)"
                @change="itemOnChange"
            />
            <j-input
                v-else
                :placeholder="`请输入${item.name}`"
                :value="value.value"
                allowClear
                style="width: calc(100% - 120px)"
                @change="(e) => itemOnChange(e.target.value)"
            />
        </template>
    </j-input-group>
</template>

<script lang="ts" name='NotifyBuildIn' setup>
import { queryConfigVariables } from '@/api/system/noticeRule';

const props = defineProps({
    value: {
        type: Object,
        default: () => {
            return {
                source: 'fixed',
                value: undefined,
                upperKey: undefined,
            };
        },
    },
    item: {
        type: Object,
        default: () => {},
    },
    name: {
        type: Number,
        default: 0,
    },
    providerId: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:value']);

const source = computed(() => {
    return props.value?.source || 'fixed';
});

const builtInList = ref<any[]>([]);
const upperKey = ref(props.value?.upperKey);

const sourceChange = (val: any) => {
    emit('update:value', {
        ...props.value,
        source: val,
        value: undefined,
    });
};

const itemOnChange = (val: any, _upperKey?: string) => {
    emit('update:value', {
        ...props.value,
        value: val,
        upperKey: _upperKey,
    });
};

watch(
    () => source.value,
    (newVal) => {
        const v = newVal;
        if (v === 'upper') {
            queryConfigVariables(props.providerId).then(resp => {
                if (resp.status === 200) {
                    // 避免数据id相同，去重
                    const _set = new Set((resp.result as any[]).map(item => item?.id))
                    const arr = [..._set.values()].map(item => {
                        const _arr = (resp.result as any[]).reverse()
                        return _arr.find(i => i.id === item)
                    })
                    builtInList.value = arr.map(item => {
                        return {
                            ...item,
                            id: 'detail.' + item.id // 为了方便传到后端
                        }
                    })
                }
            })
        }
    },
    { deep: true, immediate: true },
);

watch(
    () => props.value.upperKey,
    (newVal) => {
        upperKey.value = newVal;
    },
    { immediate: true },
);
</script>

<style lang="less" scoped>
</style>
