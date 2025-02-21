<template>
    <a-table
        :dataSource="dataSource"
        :columns="columns"
        :pagination="false"
        bordered
        :scroll="{ y: 'calc(100vh - 300px)' }"
    >
        <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'alarmTime'"
                ><span
                    >{{ dayjs(text).format('YYYY-MM-DD HH:mm:ss')
                    }}</span
            ></template>
            <template v-if="column.dataIndex === 'sourceName'">
                <Ellipsis v-if="record.targetType === 'device'">设备名称：<span class="deviceId" @click="() => gotoDevice(record.targetId)">{{text}}</span></Ellipsis>
                <Ellipsis v-else>场景联动名称：<span class="deviceId" @click="() => gotoRule(record)">{{text}}</span></Ellipsis>
            </template>
            <template
                v-if="
                    column.dataIndex === 'triggerDesc' ||
                    column.dataIndex === 'actualDesc'
                "
                ><Ellipsis>{{ text }}</Ellipsis></template
            >
            <template v-if="column.dataIndex === 'action'">
                <a-button type="link" @click="() => showDetail(record)">
                        <template #icon>
                            <AIcon type="EyeOutlined"></AIcon>
                        </template> </a-button>
            </template>
        </template></a-table
    >
    <div class="tableBottom">
        <a-button
            v-if="exceed"
            class="moreBtn"
            type="link"
            @click="gotoAlarmLog"
            >查看更多 ></a-button
        >
        <span v-else-if="dataSource.length">已展示全部数据</span>
    </div>
    <LogDetail v-if="visibleDetail" :data="current" @close="close" />
</template>

<script setup>
import { queryLogList ,queryPreconditioningLogList } from '@/api/rule-engine/log';
import dayjs from 'dayjs';
import { useMenuStore } from 'store/menu';
import LogDetail from './LogDetail.vue';
const props = defineProps({
    currentId: {
        type: String,
        default: '',
    },
    configId: {
        type: String,
        default: '',
    },
    goal:{
        type:String,
        default: ''
    }
});
const menuStory = useMenuStore();
const exceed = ref();
const visibleDetail = ref(false);
const dataSource = ref([]);
const current = ref();
const columns = [
    {
        title: '告警时间',
        dataIndex: 'alarmTime',
        key: 'alarmTime',
    },
    {
        title: '触发条件',
        dataIndex: 'triggerDesc',
        key: 'triggerDesc',
    },
    {
        title: '告警源',
        dataIndex: 'sourceName',
        key: 'sourceName',
    },
    {
        title: '告警原因',
        dataIndex: 'actualDesc',
        key: 'actualDesc',
    },
    {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width:100
    }
];
const queryData = async () => {
    const params = {
        pageIndex: 0,
        pageSize: 51,
        terms: [
            {
                column: 'alarmRecordId',
                termType: 'eq',
                value: props.currentId,
                type: 'and',
            },
        ],
        sorts: [
            {
                name: 'alarmTime',
                order: 'desc',
            },
        ],
    }
    const res = props.goal ? await queryPreconditioningLogList(props.configId,params) : await queryLogList(props.configId, params);
    if (res.success) {
        if (res.result.data?.length > 50) {
            exceed.value = true;
            dataSource.value = res.result.data.slice(0, 50);
        } else {
            exceed.value = false;
            dataSource.value = res.result.data;
        }
    }
};

const gotoDevice = (id) => {
    menuStory.jumpPage('device/Instance/Detail', { id, tab: 'Running' });
};

const gotoRule = (record) => {
    menuStory.jumpPage(
        'rule-engine/Scene/Save',
        {},
        { triggerType:record.sourceName==='定时触发'?'timer':'manual', id:record.sourceId, type: 'view' },
    );
}

const showDetail = (data) => {
    visibleDetail.value = true;
    current.value = data;
};
const close = () => {
    visibleDetail.value = false;
};
const gotoAlarmLog = () => {
    menuStory.jumpPage(`rule-engine/Alarm/Log/Detail`, {
        id: props.currentId,
    });
};
onMounted(() => {
    queryData();
});
</script>
<style lang="less" scoped>
.tableBottom {
    text-align: center;
    position: relative;
    height: 50px;
    margin-top: 20px;
    .moreBtn {
        position: absolute;
        right: 50%;
        top: 10px;
    }
}
.deviceId {
    cursor: pointer;
    color:#4096FF;
}
</style>
