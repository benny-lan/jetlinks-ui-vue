<template>
    <page-container>
        <div class="notification-record-container">
            <pro-search
                :columns="columns"
                target="category"
                @search="(params:any)=>queryParams = {...params}"
            />

            <j-pro-table
                ref="tableRef"
                :columns="columns"
                :defaultParams="{
                  sorts: [{
                    name: 'notifyTime', order: 'desc'
                  }]
                }"
                :params="queryParams"
                :request="getList_api"
                model="TABLE"
            >
                <template #topicProvider="slotProps">
                    {{ slotProps.topicName }}
                </template>
                <template #notifyTime="slotProps">
                    {{
                        moment(slotProps.notifyTime).format(
                            'YYYY-MM-DD HH:mm:ss',
                        )
                    }}
                </template>
                <template #state="slotProps">
                    <BadgeStatus
                        :status="slotProps.state.value"
                        :statusNames="{
                            read: 'success',
                            unread: 'error',
                        }"
                        :text="slotProps.state.text"
                    ></BadgeStatus>
                </template>
                <template #action="slotProps">
                    <j-space :size="16">
                        <PermissionButton
                            :popConfirm="{
                                title: `确认标为${
                                    slotProps.state.value === 'read'
                                        ? '未读'
                                        : '已读'
                                }`,
                                onConfirm: () => table.changeStatus(slotProps),
                            }"
                            :tooltip="{
                                title:
                                    slotProps.state.value === 'read'
                                        ? '标为未读'
                                        : '标为已读',
                            }"
                            type="link"
                        >
                            <AIcon type="icon-a-PIZHU1" />
                        </PermissionButton>
                        <PermissionButton
                            :tooltip="{
                                title: '查看',
                            }"
                            type="link"
                            @click="table.view(slotProps)"
                        >
                            <AIcon type="SearchOutlined" />
                        </PermissionButton>
                    </j-space>
                </template>
            </j-pro-table>

            <ViewDialog
                v-if="viewVisible"
                v-model:visible="viewVisible"
                :data="viewItem"
            />
        </div>
    </page-container>
</template>

<script lang="ts" name="NotificationRecord" setup>
import ViewDialog from './components/ViewDialog.vue';
import PermissionButton from '@/components/PermissionButton/index.vue';
import {
    getList_api,
    changeStatus_api,
} from '@/api/account/notificationRecord';
import { getTypeList_api } from '@/api/account/notificationSubscription';
import { optionItem } from '@/views/rule-engine/Scene/typings';
import { dictItemType } from '@/views/system/DataSource/typing';
import moment from 'moment';
import { message } from 'ant-design-vue';
import { useUserInfo } from '@/store/userInfo';
import { useRouterParams } from '@/utils/hooks/useParams';
import dayjs from 'dayjs'

const { updateAlarm } = useUserInfo();
const columns = [
    {
        title: '类型',
        dataIndex: 'topicProvider',
        key: 'topicProvider',
        search: {
            type: 'select',
            options: () =>
                getTypeList_api().then((resp: any) =>
                    resp.result
                        .map((item: dictItemType) => ({
                            label: item.name,
                            value: item.id,
                        }))
                        .filter((item: optionItem) => item.value === 'alarm'),
                ),
        },
        scopedSlots: true,
        ellipsis: true,
    },
    {
        title: '消息',
        dataIndex: 'message',
        key: 'message',
        search: {
            type: 'string',
        },
        scopedSlots: true,
        ellipsis: true,
    },
    {
        title: '通知时间',
        dataIndex: 'notifyTime',
        key: 'notifyTime',
        search: {
            type: 'date'
        },
        scopedSlots: true,
        ellipsis: true,
    },
    {
        title: '状态',
        dataIndex: 'state',
        key: 'state',
        search: {
            type: 'select',
            options: [
                {
                    label: '未读',
                    value: 'unread',
                },
                {
                    label: '已读',
                    value: 'read',
                },
            ],
        },
        scopedSlots: true,
        ellipsis: true,
    },
    {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        ellipsis: true,
        scopedSlots: true,
        width: '200px',
    },
];
const queryParams = ref({});

const tableRef = ref();
const table = {
    changeStatus: (row: any) => {
        const type = row.state.value === 'read' ? '_unread' : '_read';
        changeStatus_api(type, [row.id]).then((resp: any) => {
            if (resp.status === 200) {
                message.success('操作成功！');
                table.refresh();
                updateAlarm();
            }
        });
    },
    view: (row: any) => {
        console.log('row: ', row);
        viewItem.value = row;
        viewVisible.value = true;
    },
    refresh: () => {
        tableRef.value && tableRef.value.reload();
    },
};

const viewVisible = ref<boolean>(false);
const viewItem = ref<any>({});

const routerParams = useRouterParams();
onMounted(() => {
    if (routerParams.params?.value.row) {
        table.view(routerParams.params?.value.row);
    }
});
</script>

<style lang="less" scoped>
.notification-record-container {
    :deep(.ant-table-tbody) {
        .ant-table-cell {
            .ant-space-item {
                .ant-btn-link {
                    padding: 0;
                }
            }
        }
    }
}
</style>
