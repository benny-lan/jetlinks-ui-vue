<template>
    <page-container>
        <FullPage>
            <div class="content">
                <div style="margin-bottom: 15px;">
                    <div class="alert">
                        <AIcon type="InfoCircleOutlined" />
                        启用通知类型后，你可以为每种通知类型配置不同的通知方式、通知模板、接收人。
                    </div>
                </div>
                <div class="content-collapse">
                    <j-collapse :bordered="false" v-model:activeKey="activeKey" expand-icon-position="right">
                        <template #expandIcon="{ isActive }">
                            <AIcon type="CaretRightOutlined" :style="{
                                transform: `rotate(${isActive ? 90 : 0
                                    }deg)`,
                            }" />
                        </template>
                        <j-collapse-panel v-for="item in tabs" :key="item.provider">
                            <template #header>
                                <div>
                                    {{ item.name }}
                                    <span style="margin-left: 10px;" class="alert"
                                        v-if="item.provider === 'alarm'">注意：接收人需要有告警配置页面查询权限，才能收到告警类通知</span>
                                </div>
                            </template>
                            <div>
                                <template v-for="(child, index) in item.children" :key="child.provider">
                                    <Item :data="child" @refresh="onRefresh" :isLast="index === item.children?.length"
                                        :provider="item.provider" />
                                </template>
                            </div>
                        </j-collapse-panel>
                    </j-collapse>
                </div>
            </div>
        </FullPage>
    </page-container>
</template>

<script lang="ts" setup>
import { queryChannelConfig } from '@/api/system/noticeRule';
import Item from './components/Item/index.vue';
import { omit } from 'lodash-es';
const activeKey = ref<string[]>([]);
const tabs = ref<any[]>([])
const handleSearch = () => {
    queryChannelConfig().then((resp) => {
        if (resp.status === 200) {
            const dataMap = new Map()
            resp.result.forEach((i: any) => {
                if (!dataMap.has(i.type.id)) {
                    dataMap.set(i.type.id, {
                        name: i.type.name,
                        provider: i.type.id,
                        children: [
                            {
                                ...omit(i, ['type'])
                            }
                        ]
                    })
                    activeKey.value.push(i.type.id)
                } else {
                    dataMap.get(i.type.id).children.push({
                        ...omit(i, ['type'])
                    })
                }
            })
            tabs.value = [...dataMap.values()]
        }
    });
};

const onRefresh = () => {
    handleSearch()
}

onMounted(() => {
    handleSearch();
});
</script>

<style lang="less" scoped>
.content {
    padding: 24px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    justify-content: space-between;

    .btn {
        padding: 24px 0;
        width: 100%;
        background-color: #fff;
    }
}

.alert {
    padding-left: 10px;
    color: rgba(0, 0, 0, 0.55);
}

.content-collapse {
    :deep(.ant-collapse) {
        border-color: #EBEEF3;
        background-color: #fff;

        .ant-collapse-item {
            border: 1px solid #EBEEF3;
            margin-bottom: 24px;
        }

        .ant-collapse-header {
            background-color: #F7F8FA;
            height: 42px;
        }

        .ant-collapse-content {
            padding: 17px 21px 7px 21px;
        }

        .ant-collapse-content-box {
            padding: 0;
        }
    }
}
</style>