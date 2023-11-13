<template>
    <SaveChild v-if="childVisible" :childData="_current" @close-child-save="closeChildSave" />
    <div v-else>
        <pro-search :columns="columns" class="device-child-device-search" target="child-device" @search="handleSearch" />
        <!-- <j-divider /> -->
        <JProTable ref="childDeviceRef" :bodyStyle="{
            padding: 0
        }" :columns="columns" :defaultParams="{
    terms: [
        {
            column: 'parentId',
            value: detail?.id || '',
            termType: 'eq',
        },
    ],
}" :model="'TABLE'" :params="params" :request="query" :rowSelection="{
    selectedRowKeys: _selectedRowKeys,
    onChange: onSelectChange,
}">
            <template #rightExtraRender>
                <j-space>
                    <PermissionButton v-if="detail?.accessProvider === 'official-edge-gateway'
                        " hasPermission="device/Instance:update" type="primary" @click="
        _current = {};
    childVisible = true;
    ">新增并绑定</PermissionButton>
                    <PermissionButton hasPermission="device/Instance:update" type="primary" @click="visible = true">
                        绑定</PermissionButton>
                    <PermissionButton :popConfirm="{
                        title: '确定解绑吗？',
                        onConfirm: handleUnBind,
                    }" hasPermission="device/Instance:update" type="primary">批量解除</PermissionButton>
                </j-space>
            </template>
            <template #registryTime="slotProps">
                {{
                    slotProps.registryTime
                    ? moment(slotProps.registryTime).format(
                        'YYYY-MM-DD HH:mm:ss',
                    )
                    : ''
                }}
            </template>
            <template #state="slotProps">
                <j-badge :status="statusMap.get(slotProps.state.value)" :text="slotProps.state.text" />
            </template>
            <template #action="slotProps">
                <j-space :size="16">
                    <template v-for="i in getActions(slotProps, 'table')" :key="i.key">
                        <PermissionButton v-if="i.key !== 'update' || detail.accessProvider === 'official-edge-gateway'"
                            :disabled="i.disabled" :hasPermission="'device/Instance:' + i.key" :popConfirm="i.popConfirm" :tooltip="{
                                ...i.tooltip,
                            }" style="padding: 0px" type="link"
                            @click="i.onClick">
                            <template #icon>
                                <AIcon :type="i.icon" />
                            </template>
                        </PermissionButton>
                    </template>
                </j-space>
            </template>
        </JProTable>
        <BindChildDevice v-if="visible" :parentIds="parentIds" @change="closeBindDevice" />
    </div>
</template>

<script setup lang="ts">
import moment from 'moment';
import type { ActionsType } from '@/components/Table';
import { query, unbindDevice, unbindBatchDevice, queryByParent, deleteDeviceMapping } from '@/api/device/instance';
import { useInstanceStore } from '@/store/instance';
import { storeToRefs } from 'pinia';
import BindChildDevice from './BindChildDevice/index.vue';
import { usePermissionStore } from '@/store/permission';
import SaveChild from './SaveChild/index.vue';
import { onlyMessage } from '@/utils/comm';

const instanceStore = useInstanceStore();
const { detail } = storeToRefs(instanceStore);
const router = useRouter();
const childVisible = ref(false);
const permissionStore = usePermissionStore();
// watchEffect(() => {
//     console.log(detail.value);
// });
const statusMap = new Map();
statusMap.set('online', 'success');
statusMap.set('offline', 'error');
statusMap.set('notActive', 'warning');

const childDeviceRef = ref<Record<string, any>>({});
const params = ref<Record<string, any>>({});
const _selectedRowKeys = ref<string[]>([]);
const visible = ref<boolean>(false);
const _current = ref({});
const parentIds = ref<any[]>([instanceStore.detail.id])

const columns = [
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        ellipsis: true,
        search: {
            type: 'string',
            defaultTermType: 'eq',
        },
    },
    {
        title: '设备名称',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        search: {
            type: 'string',
        },
    },
    {
        title: '所属产品',
        dataIndex: 'productName',
        key: 'productName',
        search: {
            type: 'string',
        },
    },
    {
        title: '注册时间',
        dataIndex: 'registryTime',
        key: 'registryTime',
        scopedSlots: true,
        search: {
            type: 'date',
        },
    },
    {
        title: '状态',
        dataIndex: 'state',
        key: 'state',
        scopedSlots: true,
        search: {
            type: 'select',
            options: [
                { label: '禁用', value: 'notActive' },
                { label: '离线', value: 'offline' },
                { label: '在线', value: 'online' },
            ],
        },
    },
    {
        title: '说明',
        dataIndex: 'describe',
        key: 'describe',
        ellipsis: true,
        search: {
            type: 'string',
        },
    },
    {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 200,
        scopedSlots: true,
    },
];

const getActions = (data: Partial<Record<string, any>>): ActionsType[] => {
    if (!data) return [];
    return [
        {
            key: 'view',
            text: '查看',
            tooltip: {
                title: '查看',
            },
            icon: 'EyeOutlined',
            onClick: () => {
                router.push('/iot/device/instance/detail/' + data.id);
            },
        },
        {
            key: 'action',
            text: '解绑',
            tooltip: {
                title: '解绑',
            },
            icon: 'DisconnectOutlined',
            popConfirm: {
                title: '确认解绑吗？',
                okText: '确定',
                cancelText: '取消',
                onConfirm: async () => {
                    const resp = await unbindDevice(
                        detail.value.id,
                        data.id,
                        {},
                    );
                    if (instanceStore.current.accessProvider === 'official-edge-gateway') {
                        const res = await deleteDeviceMapping(
                            detail.value.id,
                            { ids: [data.id] }
                        )
                    }
                    if (resp.status === 200) {
                        childDeviceRef.value?.reload();
                        onlyMessage('操作成功！');
                    }
                },
            },
        },
        {
            key: 'update',
            text: '编辑',
            tooltip: {
                title: '编辑',
            },
            icon: 'EditOutlined',
            onClick: () => {
                _current.value = data;
                childVisible.value = true;
            },
        },
    ];
};

const handleSearch = (e: any) => {
    params.value = e;
};

const onSelectChange = (keys: string[]) => {
    _selectedRowKeys.value = [...keys];
};

const cancelSelect = () => {
    _selectedRowKeys.value = [];
};

const handleUnBind = async () => {
    if (_selectedRowKeys.value.length) {
        const resp = await unbindBatchDevice(
            detail.value.id,
            _selectedRowKeys.value,
        );
        if (instanceStore.current.accessProvider === 'official-edge-gateway') {
            const res = await deleteDeviceMapping(
                detail.value.id,
                { ids: [_selectedRowKeys.value] }
            )
        }
        if (resp.status === 200) {
            onlyMessage('操作成功！');
            cancelSelect();
            childDeviceRef.value?.reload();
        }
    } else {
        onlyMessage('请勾选需要解绑的数据', 'warning');
    }
};

const closeBindDevice = (val: boolean) => {
    visible.value = false;
    if (val) {
        childDeviceRef.value?.reload();
    }
};

// const getChildren = async () => {
//   const { id} = instanceStore.detail
//   const data = await queryByParent(id)
//   if (data.success) {
//     parentIds.value.concat(data.result)
//   }
// }
const closeChildSave = () => {
    childVisible.value = false;
};
onMounted(() => {
    console.log(detail.value.accessProvider)
})
</script>

<style lang="less">
.device-child-device-search {
    padding: 0px;
}
</style>
