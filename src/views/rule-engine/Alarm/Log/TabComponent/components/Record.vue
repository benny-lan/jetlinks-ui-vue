<template>
    <a-table
        :dataSource="dataSource"
        :columns="columns"
        :pagination="false"
        bordered
        :scroll="{ y: 'calc(100vh - 260px)' }"
    >
        <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'alarmTime'">
                <j-ellipsis>
                    {{ dayjs(text).format('YYYY-MM-DD HH:mm:ss') }}
                </j-ellipsis>
            </template>
            <template v-if="column.dataIndex === 'handleTime'">
                <j-ellipsis>
                    {{
                        text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
                    }}
                </j-ellipsis>
            </template>
            <template v-if="column.dataIndex === 'duration'">
                <Duration :data="record" />
            </template>
            <template v-if="column.dataIndex === 'state'">
                {{ text?.text || '--' }}
            </template>
            <template v-if="column.dataIndex === 'handleType'">
                {{ text?.text || '--' }}
            </template>
            <template v-if="column.dataIndex === 'description'">
                <Ellipsis>
                    {{ text || '--' }}
                </Ellipsis>
            </template>
        </template>
    </a-table>
    <div class="tableBottom">
        <a-button
            v-if="exceed"
            class="moreBtn"
            type="link"
            @click="gotoAlarmRecord"
            >查看更多 ></a-button
        ><span v-else-if="dataSource.length">已展示全部数据</span>
    </div>
</template>

<script setup>
import { queryHandleHistory } from '@/api/rule-engine/log';
import dayjs from 'dayjs';
import { useMenuStore } from 'store/menu';
import { defineExpose } from 'vue';
import Duration from '../../components/Duration.vue';
const props = defineProps({
    currentId: {
        type: String,
        default: '',
    },
});
const exceed = ref();
const dataSource = ref([]);
const menuStory = useMenuStore();
const columns = [
    {
        title: '告警时间',
        dataIndex: 'alarmTime',
        key: 'alarmTime',
    },
    {
        title: '处理时间',
        dataIndex: 'handleTime',
        key: 'handleTime',
    },
    {
        title: '告警持续时长',
        dataIndex: 'duration',
        key: 'duration',
    },
    {
        title: '处理状态',
        dataIndex: 'state',
        key: 'state',
        width:100
    },
    {
        title: '处理类型',
        dataIndex: 'handleType',
        key: 'handleType',
        width:100
    },
    {
        title: '处理结果',
        dataIndex: 'description',
        key: 'description',
    },
];
const queryList = async () => {
    const res = await queryHandleHistory(props.currentId, {
        sorts: [{ name: 'createTime', order: 'desc' }],
        pageIndex: 0,
        pageSize: 51,
    });
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
const gotoAlarmRecord = () => {
    menuStory.jumpPage(
        'rule-engine/Alarm/Log/Record',
        {},
        { id: props.currentId },
    );
};
const refreshRecord = () => {
    queryList();
};
defineExpose({
    refreshRecord,
});
onMounted(() => {
    queryList();
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
</style>
