<template>
    <j-form :layout="'vertical'" ref="formRef" :model="modelRef">
        <j-row :gutter="24">
            <j-col :span="24" v-if="actionType === 'command'">
                <j-form-item
                    name="messageType"
                    label="指令类型"
                    :rules="{
                        required: true,
                        message: '请选择指令类型',
                    }"
                >
                    <MSelect
                        v-model:value="modelRef.messageType"
                        :options="_options"
                        @change="onTypeChange"
                        type="messageType"
                    />
                    <!-- // <j-select
                    //     placeholder="请选择指令类型"
                    //     v-model:value="modelRef.messageType"
                    //     show-search
                    //     @change="onTypeChange"
                    // >
                    //     <j-select-option value="READ_PROPERTY"
                    //         >读取属性</j-select-option
                    //     >
                    //     <j-select-option value="WRITE_PROPERTY"
                    //         >修改属性</j-select-option
                    //     >
                    //     <j-select-option value="INVOKE_FUNCTION"
                    //         >调用功能</j-select-option
                    //     >
                    // </j-select> -->
                </j-form-item>
            </j-col>
            <j-col
                class="inputs"
                :span="
                    modelRef.messageType === 'READ_PROPERTY' ||
                    actionType === 'latestData'
                        ? 24
                        : 12
                "
                v-if="
                    (actionType === 'command' &&
                        ['READ_PROPERTY', 'WRITE_PROPERTY'].includes(
                            modelRef.messageType,
                        )) ||
                    actionType === 'latestData'
                "
            >
                <j-form-item
                    :name="['message', 'properties']"
                    label="属性"
                    :rules="{
                        required: true,
                        message: '请选择属性',
                    }"
                >
                    <j-select
                        placeholder="请选择属性"
                        v-model:value="modelRef.message.properties"
                        show-search
                        @change="(val) => onPropertyChange(val, false)"
                    >
                        <j-select-option
                            v-for="i in metadata?.properties || []"
                            :key="i.id"
                            :value="i.id"
                            :label="i.name"
                            >{{ i.name }}</j-select-option
                        >
                    </j-select>
                </j-form-item>
            </j-col>
            <j-col
                :span="12"
                class="inputs"
                v-if="
                    modelRef.messageType === 'WRITE_PROPERTY' &&
                    actionType === 'command'
                "
            >
                <j-form-item
                    :name="['message', 'value']"
                    label="值"
                    :rules="{
                        required: true,
                        message: '请输入值',
                    }"
                >
                    <ValueItem
                        v-model:modelValue="modelRef.message.value"
                        :itemType="
                            property.valueType?.type || property.type || 'int'
                        "
                        :placeholder="
                            property.valueType?.type === 'array'
                                ? '多个数据用英文,分割'
                                : ''
                        "
                        :options="
                            property.valueType?.type === 'enum'
                                ? (property?.valueType?.elements || []).map(
                                      (item) => {
                                          return {
                                              label: item?.text,
                                              value: item?.value,
                                          };
                                      },
                                  )
                                : property.valueType?.type === 'boolean'
                                ? [
                                      {
                                          label: property.valueType?.trueText,
                                          value: property.valueType?.trueValue,
                                      },
                                      {
                                          label: property.valueType?.falseText,
                                          value: property.valueType?.falseValue,
                                      },
                                  ]
                                : undefined
                        "
                    />
                </j-form-item>
            </j-col>
            <j-col
                :span="24"
                v-if="modelRef.messageType === 'INVOKE_FUNCTION'"
                class="inputs"
            >
                <j-form-item
                    :name="['message', 'functionId']"
                    label="功能"
                    :rules="{
                        required: true,
                        message: '请选择功能',
                    }"
                >
                    <j-select
                        placeholder="请选择功能"
                        v-model:value="modelRef.message.functionId"
                        show-search
                        @change="(e) => funcChange(e)"
                    >
                        <j-select-option
                            v-for="i in metadata?.functions || []"
                            :key="i.id"
                            :value="i.id"
                            :label="i.name"
                            >{{ i.name }}</j-select-option
                        >
                    </j-select>
                </j-form-item>
            </j-col>
            <j-col
                :span="24"
                v-if="
                    modelRef.messageType === 'INVOKE_FUNCTION' &&
                    modelRef.message?.functionId &&
                    modelRef.message?.inputs?.length
                "
                class="inputs"
            >
                <j-form-item
                    :name="['message', 'inputs']"
                    label="参数列表"
                    :rules="{
                        required: true,
                        message: '请输入参数列表',
                    }"
                >
                    <EditTable
                        ref="editRef"
                        v-model="modelRef.message.inputs"
                    />
                </j-form-item>
            </j-col>
        </j-row>
    </j-form>
</template>

<script lang="ts" setup>
import EditTable from './EditTable.vue';
import MSelect from '../../../components/MSelect/index.vue';
import { cloneDeep, omit } from 'lodash-es';

const formRef = ref();

const props = defineProps({
    actionType: {
        type: String,
        default: '',
    },
    modelValue: {
        type: Object,
        default: () => {},
    },
    metadata: {
        type: Object,
        default: () => {
            return {
                properties: [],
                functions: [],
            };
        },
    },
});

const emit = defineEmits(['update:modelValue']);

const editRef = ref();

const modelRef = reactive({
    messageType: 'READ_PROPERTY',
    message: {
        properties: undefined,
        functionId: undefined,
        inputs: [],
        value: undefined,
    },
});

const property = ref<any>({});

const onPropertyChange = (val: string, flag?: boolean) => {
    if (val) {
        const _item = props.metadata?.properties.find(
            (item: any) => item.id === val,
        );
        property.value = _item || {};
    }
    if (!flag) {
        modelRef.message.value = undefined;
    }
};

const _options = [
    {
        id: 'READ_PROPERTY',
        name: '读取属性',
    },
    {
        id: 'WRITE_PROPERTY',
        name: '修改属性',
    },
    {
        id: 'INVOKE_FUNCTION',
        name: '调用功能',
    },
];
const onTypeChange = () => {
    // 需要记住之前的选择, 所以注释了该代码
    // modelRef.message = {
    //     properties: undefined,
    //     functionId: undefined,
    //     inputs: [],
    //     value: undefined,
    // };
};

const funcChange = (val: string, _inputs?: any[]) => {
    if (val) {
        const arr =
            props.metadata?.functions.find((item: any) => item.id === val)
                ?.inputs || [];
        const list = arr.map((item: any) => {
            const _item = _inputs?.find((i) => i.id === item.id);
            return {
                id: item.id,
                name: item.name,
                value: undefined,
                valueType: item?.valueType?.type,
                ..._item,
                required: item?.expands?.required,
            };
        });
        modelRef.message.inputs = list;
    }
};

const saveBtn = () =>
    new Promise((resolve) => {
        formRef.value
            .validate()
            .then(async (_data: any) => {
                if (modelRef.message.inputs?.length) {
                    await editRef.value?.onSave().catch(() => {
                        resolve(false);
                    });
                }
                const data = cloneDeep(_data);
                if (
                    props.actionType === 'command' &&
                    modelRef.messageType === 'WRITE_PROPERTY'
                ) {
                    omit(data, ['message']);
                    data.message = {
                        properties: {
                            [_data.message.properties]: _data.message.value,
                        },
                    };
                }
                if (
                    (props.actionType === 'command' ||
                        props.actionType === 'latestData') &&
                    modelRef.messageType === 'READ_PROPERTY'
                ) {
                    omit(data, ['message']);
                    data.message = {
                        properties: [_data.message.properties],
                    };
                }
                emit('update:modelValue', data);
                resolve(data);
            })
            .catch((err: any) => {
                resolve(err);
            });
    });

watch(
    () => props.modelValue,
    (val) => {
        if (val) {
            const newVal = cloneDeep(val);
            if (val.message.properties && typeof val.message.properties === 'object') {
                if (
                    props.actionType === 'command' &&
                    val.messageType === 'WRITE_PROPERTY'
                ) {
                    newVal.message.properties = Object.keys(
                        val.message.properties,
                    )[0];
                    newVal.message.value = Object.values(
                        val.message.properties,
                    )[0];
                }
                if (
                    (props.actionType === 'command' ||
                        props.actionType === 'latestData') &&
                        val.messageType === 'READ_PROPERTY'
                ){
                    newVal.message.properties = val.message.properties[0]
                }
                onPropertyChange(newVal?.message?.properties, true);
            }
            Object.assign(modelRef, newVal);
            if (newVal?.message?.functionId) {
                funcChange(
                    newVal?.message?.functionId,
                    newVal?.message?.inputs,
                );
            }
        }
    },
    {
        immediate: true,
    },
);

defineExpose({ saveBtn });
</script>

<style lang="less" scoped>
.inputs {
    .ant-form-item:last-child {
        margin-bottom: 0;
    }
}
</style>
