<template>
    <div class="terms-params-item">
        <div v-if="!isFirst" class="term-type-warp">
            <DropdownButton
                :options="[
                    { label: '并且', value: 'and' },
                    { label: '或者', value: 'or' },
                ]"
                type="type"
                v-model:value="paramsValue.type"
                @select="typeSelect"
            />
        </div>
        <div
            class="params-item_button"
            @mouseover="mouseover"
            @mouseout="mouseout"
        >
            <DropdownButton
                :options="columnOptions"
                icon="icon-zhihangdongzuoxie-1"
                type="column"
                value-name="column"
                label-name="fullName"
                placeholder="请选择参数"
                v-model:value="paramsValue.column"
                component="treeSelect"
                @select="columnSelect"
            />
            <DropdownButton
                :options="termTypeOptions"
                type="termType"
                value-name="id"
                label-name="name"
                placeholder="操作符"
                v-model:value="paramsValue.termType"
                @select="termsTypeSelect"
            />
            <div v-if="!['notnull', 'isnull'].includes(paramsValue.termType)" style="display: flex">
                <DoubleParamsDropdown
                    v-if="showDouble"
                    icon="icon-canshu"
                    placeholder="参数值"
                    :options="valueOptions"
                    :metricOptions="metricOption"
                    :tabsOptions="tabsOptions"
                    v-model:value="paramsValue.value.value"
                    v-model:source="paramsValue.value.source"
                    @select="valueSelect"
                />
                <ArrayParamsDropdown
                    v-else-if="
                      showArray
                    "
                    icon="icon-canshu"
                    placeholder="参数值"
                    :options="valueOptions"
                    :metricOptions="metricOption"
                    :tabsOptions="tabsOptions"
                    v-model:value="paramsValue.value.value"
                    v-model:source="paramsValue.value.source"
                    @select="valueSelect"
                />
                <ParamsDropdown
                    v-else
                    icon="icon-canshu"
                    :placeholder="tabsOptions[0]?.component === 'array' ? '多个值以英文逗号隔开':'参数值'"
                    :options="valueOptions"
                    :metricOptions="metricOption"
                    :tabsOptions="tabsOptions"
                    :metric="paramsValue.value?.metric"
                    v-model:value="paramsValue.value.value"
                    v-model:source="paramsValue.value.source"
                    @select="valueSelect"
                />
            </div>
            <ConfirmModal title="确认删除？" :onConfirm="onDelete" className="button-delete" :show="showDelete">
                <AIcon type="CloseOutlined" />
            </ConfirmModal>
        </div>
        <div class="term-add" @click.stop="termAdd" v-if="isLast">
            <div class="terms-content">
                <AIcon type="PlusOutlined" style="font-size: 12px" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" name="ParamsItem">
import type { PropType } from 'vue';
import type { TermsType } from '@/views/rule-engine/Scene/typings';
import DropdownButton from '../DropdownButton';
import { getOption } from '../DropdownButton/util';
import ParamsDropdown, {
    DoubleParamsDropdown,
    ArrayParamsDropdown,
} from '../ParamsDropdown';
import { inject, watch } from 'vue';
import {
    ContextKey,
    arrayParamsKey,
    timeTypeKeys,
    doubleParamsKey,
} from './util';
import { useSceneStore } from 'store/scene';
import { storeToRefs } from 'pinia';
import { Form } from 'jetlinks-ui-components';
import {
    indexOf,
    isArray,
    isObject,
    isString,
    pick,
    cloneDeep,
} from 'lodash-es';

const sceneStore = useSceneStore();
const { data: formModel } = storeToRefs(sceneStore);
const formItemContext = Form.useInjectFormItemContext();


type Emit = {
    (e: 'update:value', data: TermsType): void;
};

type TabsOption = {
    label: string;
    key: string;
    component: string;
};

const props = defineProps({
    isFirst: {
        type: Boolean,
        default: true,
    },
    isLast: {
        type: Boolean,
        default: true,
    },
    showDeleteBtn: {
        type: Boolean,
        default: true,
    },
    name: {
        type: Number,
        default: 0,
    },
    termsName: {
        type: Number,
        default: 0,
    },
    branchName: {
        type: Number,
        default: 0,
    },
    whenName: {
        type: Number,
        default: 0,
    },
    branches_Index:{
        type: Number,
        default: 0,
    },
    value: {
        type: Object as PropType<TermsType>,
        default: () => ({
            column: '',
            type: '',
            termType: 'eq',
            value: {
                source: 'manual',
                value: undefined,
            },
        }),
    },
});

const emit = defineEmits<Emit>();

const paramsValue = reactive<TermsType>({
    column: props.value?.column,
    type: props.value?.type,
    termType: props.value?.termType,
    value: props.value?.value,
    metric: undefined,
});

const showDelete = ref(false);
const columnOptions: any = inject(ContextKey); //
const columnType = ref<string>();
const termTypeOptions = ref<Array<{ id: string; name: string }>>([]); // 条件值
const valueOptions = ref<any[]>([]); // 默认手动输入下拉
const metricOption = ref<any[]>([]); // 根据termType获取对应指标值
const isMetric = ref<boolean>(false); // 是否为指标值
const tabsOptions = ref<Array<TabsOption>>([
    { label: '手动输入', key: 'manual', component: 'string' },
]);
const metricsCacheOption = ref<any[]>([]); // 缓存指标值

const handOptionByColumn = (option: any) => {
    if (option) {
        termTypeOptions.value = option.termTypes || [];
        metricsCacheOption.value =
            option.metrics?.map((item: any) => ({
                ...item,
                label: item.name,
            })) || [];
        tabsOptions.value.length = 1;
        tabsOptions.value[0].component = option.dataType;
        columnType.value = option.dataType;
        if (option.metrics && option.metrics.length) {
            tabsOptions.value.push({
                label: '指标值',
                key: 'metric',
                component: 'select',
            });
            isMetric.value = true;
        } else {
            isMetric.value = false;
        }

        if (option.dataType === 'boolean') {
            // 处理_options为Object时
            const _options = option.options || option.others;
            if (isObject(_options)) {
                const bool = (_options as any)?.bool;
                valueOptions.value = [
                    { label: bool.falseText, value: String(bool.falseValue) },
                    { label: bool.trueText, value: String(bool.trueValue) },
                ];
            } else {
                valueOptions.value = option.options?.map((item: any) => ({
                    ...item,
                    label: item.name,
                    value: item.id,
                })) || [
                    { label: '是', value: 'true' },
                    { label: '否', value: 'false' },
                ];
            }
        } else if (option.dataType === 'enum') {
            valueOptions.value =
                option.options?.map((item: any) => ({
                    ...item,
                    label: item.name,
                    value: item.id,
                })) || [];
        } else {
            valueOptions.value = (option.options || []).map((item: any) => ({
                ...item,
                label: item.name,
                value: item.id,
            }));
        }
    } else {
        termTypeOptions.value = [];
        metricsCacheOption.value = [];
        valueOptions.value = [];
    }
};

watch(
    () => JSON.stringify(columnOptions.value),
    () => {
        if (paramsValue.column) {
            const option = getOption(
                columnOptions.value,
                paramsValue.column,
                'column',
            );
            const copyValue = props.value;
            if (option && Object.keys(option).length) {
                handOptionByColumn(option);
                if (copyValue.error) {
                    copyValue.error = false;
                    emit('update:value', copyValue);
                    formItemContext.onFieldChange();
                }
            } else {
                copyValue.error = true;
                emit('update:value', copyValue);
                formItemContext.onFieldChange();
            }
            //数据类型为date时判断是选择还是手动输入
            if (option?.dataType === 'date') {
                if (timeTypeKeys.includes(paramsValue.termType || '')) {
                    if (tabsOptions.value[0].component !== 'int') {
                    }
                    tabsOptions.value[0].component = 'int';
                } else if (
                    !timeTypeKeys.includes(paramsValue.termType || '') &&
                    tabsOptions.value[0].component == 'int'
                ) {
                    tabsOptions.value[0].component = 'date';
                }
            }
        }
    },
    { immediate: true },
);

const showDouble = computed(() => {
    const isRange = paramsValue.termType
        ? doubleParamsKey.includes(paramsValue.termType)
        : false;
    const isSourceMetric = paramsValue.value?.source === 'metric';
    if (metricsCacheOption.value.length) {
        metricOption.value = metricsCacheOption.value.filter((item) =>
            isRange ? item.range : !item.range,
        );
    } else {
        metricOption.value = [];
    }

    if (isRange) {
        if (isMetric.value) {
            return !isSourceMetric;
        }
        return true;
    }
    return false;
});

const showArray = computed(()=>{
    const isRange = paramsValue.termType ? arrayParamsKey.includes(paramsValue.termType) : false;
    const isSourceMetric = paramsValue.value?.source === 'metric';
    if (metricsCacheOption.value.length) {
        metricOption.value = metricsCacheOption.value.filter((item) =>
            isRange ? item.range : !item.range,
        );
    } else {
        metricOption.value = [];
    }

    if (isRange) {
        if (isMetric.value) {
            return !isSourceMetric;
        }
        return true;
    }
    return false;
})

const mouseover = () => {
    if (props.showDeleteBtn) {
        showDelete.value = true;
    }
};

const mouseout = () => {
    if (props.showDeleteBtn) {
        showDelete.value = false;
    }
};

const columnSelect = (option: any) => {
    const dataType = option.dataType;
    const hasTypeChange = dataType !== tabsOptions.value[0].component;
    let termTypeChange = false;
    // 如果参数类型未发生变化，则不修改操作符以及值
    const termTypes = option.termTypes;

    if (
        !termTypes.some(
            (item: { id: string }) => paramsValue.termType === item.id,
        )
    ) {
        // 修改操作符
        termTypeChange = true;
        paramsValue.termType = termTypes?.length ? termTypes[0].id : 'eq';
    }
    if (
        hasTypeChange ||
        !tabsOptions.value.every((a) => a.key === paramsValue.value.source)
    ) {
        // 类型发生变化
        paramsValue.termType = termTypes?.length ? termTypes[0].id : 'eq';
        paramsValue.value = {
            source: tabsOptions.value[0].key,
            value: undefined,
        };
    } else if (termTypeChange) {
        const oldValue = isArray(paramsValue.value!.value)
            ? paramsValue.value!.value[0]
            : paramsValue.value!.value;
        const value = arrayParamsKey.includes(paramsValue.termType as string)
            ? [oldValue, undefined]
            : oldValue;

        const _source = paramsValue.value?.source || tabsOptions.value[0].key;
        const newValue: any = {
            source: _source,
            value: value,
        };

        if (_source === 'metric') {
            newValue.metric = paramsValue.value?.metric;
        }

        paramsValue.value = newValue;
    }
    handOptionByColumn(option);
    emit('update:value', { ...paramsValue });
    nextTick(() => {
        formItemContext.onFieldChange();
    });

    formModel.value.options!.when[props.branches_Index].terms[props.whenName].terms[
        props.termsName
    ][0] = option.fullName || option.name ;
    formModel.value.options!.when[props.branches_Index].terms[props.whenName].terms[
        props.termsName
    ][1] = paramsValue.termType;
};

const termsTypeSelect = (e: { key: string; name: string }) => {
    const oldValue = isArray(paramsValue.value!.value)
        ? paramsValue.value!.value[0]
        : paramsValue.value!.value;
    let value = arrayParamsKey.includes(e.key)
        ? [oldValue, undefined]
        : oldValue;
    // 如果上次的值 在 timeTypeKeys中 则不变
    if (columnType.value === 'date') {
        if (timeTypeKeys.includes(e.key)) {
            if (tabsOptions.value[0].component !== 'int') {
                value = undefined;
            }
            tabsOptions.value[0].component = 'int';
        } else if (
            !timeTypeKeys.includes(e.key) &&
            tabsOptions.value[0].component == 'int'
        ) {
            value = undefined;
            tabsOptions.value[0].component = 'date';
        }
    }

    const _source = paramsValue.value?.source || tabsOptions.value[0].key;
    const newValue: any = {
        source: _source,
        value: value,
    };

    if (_source === 'metric') {
        newValue.metric = paramsValue.value?.metric;
        const isArray = isString(paramsValue.value!.value)
            ? paramsValue.value!.value?.includes?.(',')
            : false;
        if (arrayParamsKey.includes(e.key) !== isArray) {
            // 有变化
            newValue.value = undefined;
        }else{
            newValue.value = paramsValue.value!.value
        }
    }
    if (['isnull', 'notnull'].includes(e.key)) {
        newValue.value = 1;
        newValue.source = tabsOptions.value[0].key;
    }
    paramsValue.value = newValue;
    emit('update:value', { ...paramsValue });
    formItemContext.onFieldChange();
    formModel.value.options!.when[props.branches_Index].terms[props.whenName].terms[
        props.termsName
    ][1] = e.name;
};

const valueSelect = (
    v: any,
    label: string,
    labelObj: Record<number, any>,
    option: any,
) => {

    if (paramsValue.value?.source === 'metric') {
        paramsValue.value.metric = option?.id;
    }
    const newValues = { ...paramsValue };
    if (paramsValue.value?.source !== 'metric') {
        delete newValues.value.metric;
    }
    emit('update:value', { ...newValues });
    formItemContext.onFieldChange();
    formModel.value.options!.when[props.branches_Index].terms[props.whenName].terms[
        props.termsName
    ][2] = labelObj;
};

const typeSelect = (e: any) => {
    emit('update:value', { ...paramsValue });
    formModel.value.options!.when[props.branches_Index].terms[props.whenName].terms[
        props.termsName
    ][3] = e.label;
};

const termAdd = () => {
    const termsData = {
        column: undefined,
        value: {
            source: 'manual',
            value: undefined,
        },
        termType: undefined,
        type: 'and',
        key: `params_${new Date().getTime()}`,
    };
    formModel.value.branches?.[props.branchName]?.when?.[
        props.whenName
    ]?.terms?.push(termsData);
    formModel.value.options!.when[props.branchName / 2].terms[props.whenName].terms.push(['', '', '', '并且']);
};

const onDelete = () => {
    console.log(formModel.value,'formModal')
    formModel.value.branches?.[props.branchName]?.when?.[
        props.whenName
    ]?.terms?.splice(props.termsName, 1);
    console.log(props,'props')
    formModel.value.options!.when[props.branches_Index].terms[
        props.whenName
    ].terms.splice(props.termsName, 1);
};

watchEffect(() => {
  const isRange = paramsValue.termType ? arrayParamsKey.includes(paramsValue.termType) : false;
  const isSourceMetric = paramsValue.value?.source === 'metric';
  if (metricsCacheOption.value.length) {
    metricOption.value = metricsCacheOption.value.filter((item) =>
      isRange ? item.range : !item.range,
    );
  } else {
    metricOption.value = [];
  }

  if (isRange) {
    if (isMetric.value) {
      return !isSourceMetric;
    }
    return true;
  }
  return false;
})

nextTick(() => {
    Object.assign(
        paramsValue,
        pick(props.value, [
            'column',
            'options',
            'termType',
            'terms',
            'type',
            'value',
            'metric',
            'key',
        ]),
    );
});
</script>

<style scoped></style>
