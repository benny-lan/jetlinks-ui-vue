<template>
    <page-container>
        <div>
            <pro-search
                :columns="columns"
                target="search-firmware"
                @search="handleSearch"
            />
            <FullPage>
                <j-pro-table
                    ref="tableRef"
                    model="TABLE"
                    :columns="columns"
                    :request="query"
                    :defaultParams="{
                        sorts: [{ name: 'createTime', order: 'desc' }],
                    }"
                    :params="params"
                >
                    <template #headerTitle>
                        <PermissionButton
                            type="primary"
                            @click="handleAdd"
                            hasPermission="device/Firmware:add"
                        >
                            <template #icon
                                ><AIcon type="PlusOutlined"
                            /></template>
                            新增
                        </PermissionButton>
                    </template>
                    <template #productId="slotProps">
                        <span>{{ slotProps.productName }}</span>
                    </template>
                    <template #createTime="slotProps">
                        <span>{{
                            dayjs(slotProps.createTime).format(
                                'YYYY-MM-DD HH:mm:ss',
                            )
                        }}</span>
                    </template>
                    <template #action="slotProps">
                        <j-space :size="16">
                            <template
                                v-for="i in getActions(slotProps)"
                                :key="i.key"
                            >
                                <PermissionButton
                                    :disabled="i.disabled"
                                    :popConfirm="i.popConfirm"
                                    :tooltip="{
                                        ...i.tooltip,
                                    }"
                                    style="padding: 0px"
                                    @click="i.onClick"
                                    type="link"
                                    :danger="i.key === 'delete'"
                                    :hasPermission="'device/Firmware:' + i.key"
                                >
                                    <template #icon
                                        ><AIcon :type="i.icon"
                                    /></template>
                                </PermissionButton>
                            </template>
                        </j-space>
                    </template>
                </j-pro-table>
            </FullPage>
        </div>
        <Save
            v-if="visible"
            :data="current"
            :productOptions="productOptions"
            @change="saveChange"
        />
        <TaskDrawer
            v-if="showTask"
            :firmwareId="firmwareId"
            :productId="productId"
            @close-drawer="showTask = false"
        />
    </page-container>
</template>
<script lang="ts" setup name="FirmwarePage">
import type { ActionsType } from '@/components/Table/index';
import { query, queryProduct, remove } from '@/api/device/firmware';
import TaskDrawer from './Task/index.vue';
import dayjs from 'dayjs';
import { map, cloneDeep } from 'lodash-es';
import Save from './Save/index.vue';
import type { FormDataType } from './type';
import { onlyMessage } from '@/utils/comm';

const tableRef = ref<Record<string, any>>({});
const params = ref<Record<string, any>>({});

const productOptions = ref([]);
const visible = ref(false);
const current = ref({});
const showTask = ref(false);
const firmwareId = ref('');
const productId = ref();

const columns = [
    {
        title: '固件名称',
        key: 'name',
        dataIndex: 'name',
        fixed: 'left',
        width: 200,
        ellipsis: true,
        search: {
            type: 'string',
        },
    },
    {
        title: '固件版本',
        dataIndex: 'version',
        key: 'version',
        ellipsis: true,
        search: {
            type: 'string',
        },
    },
    {
        title: '所属产品',
        dataIndex: 'productId',
        key: 'productId',
        ellipsis: true,
        width: 200,
        scopedSlots: true,
        search: {
            type: 'select',
            options: productOptions,
        },
    },
    {
        title: '签名方式',
        dataIndex: 'signMethod',
        key: 'signMethod',
        scopedSlots: true,
        search: {
            type: 'select',
            options: [
                {
                    label: 'MD5',
                    value: 'md5',
                },
                {
                    label: 'SHA256',
                    value: 'sha256',
                },
            ],
        },
        width: 150,
    },
    {
        title: '创建时间',
        key: 'createTime',
        dataIndex: 'createTime',
        search: {
            type: 'date',
        },
        width: 200,
        scopedSlots: true,
    },
    {
        title: '说明',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
        search: {
            type: 'string',
        },
    },

    {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 120,
        scopedSlots: true,
    },
];

const getActions = (data: Partial<Record<string, any>>): ActionsType[] => {
    if (!data) {
        return [];
    }
    return [
        {
            key: 'view',
            text: '升级任务',
            tooltip: {
                title: '升级任务',
            },
            icon: 'FileTextOutlined',
            onClick: async () => {
                handleUpdate(data);
            },
        },
        {
            key: 'update',
            text: '编辑',
            tooltip: {
                title: '编辑',
            },
            icon: 'EditOutlined',
            onClick: async () => {
                handleEdit(data);
            },
        },
        {
            key: 'delete',
            text: '删除',
            tooltip: {
                title: '删除',
            },
            popConfirm: {
                title: '确认删除?',
                onConfirm: () => {
                   return handleDelete(data.id);
                },
            },
            icon: 'DeleteOutlined',
        },
    ];
};

const handleUpdate = (data: Partial<Record<string, any>>) => {

    showTask.value = true;
    firmwareId.value = data.id;
    productId.value = data.productId;
    console.log(data);
};

const handleAdd = () => {
    current.value = {};
    visible.value = true;
};
const handleEdit = (data: Partial<Record<string, any>>) => {
    current.value = cloneDeep(data);
    visible.value = true;
};

const saveChange = (value: FormDataType) => {
    visible.value = false;
    current.value = {};
    if (value) {
        onlyMessage('操作成功', 'success');
        tableRef.value.reload();
    }
};

const handleDelete = (id: string) => {
    const response = remove(id);
    response.then((res:any) => {
        if (res.status === 200) {
            onlyMessage('操作成功', 'success');
            tableRef.value.reload();
        } else {
            onlyMessage(res?.message, 'error');
        }
    });
    return response
};

onMounted(() => {
    queryProduct({
        paging: false,
        sorts: [{ name: 'name', order: 'desc' }],
        terms: [{ column: 'state', value: 1 }], // 不传参会报错，暂时查询启用状态的，后期会改查全部 todo
    }).then((resp: any) => {
        const list = resp.result.filter((it: any) => {
            return map(it?.features || [], 'id').includes('supportFirmware');
        });
        productOptions.value = list.map((item: any) => ({
            label: item.name,
            value: item.id,
        }));
    });
});

/**
 * 搜索
 * @param params
 */
const handleSearch = (e: any) => {
    params.value = e;
};
</script>

<style lang="less" scoped></style>
