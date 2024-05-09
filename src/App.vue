<template>
  <ConfigProvider :locale='zhCN'>
    <router-view />
  </ConfigProvider>
</template>

<script setup lang="ts">
import { ConfigProvider } from 'jetlinks-ui-components'
import zhCN from 'jetlinks-ui-components/es/locale/zh_CN';
import { storeToRefs } from 'pinia';
import { useSystem } from './store/system';
import DefaultSetting from '../config/config'
import {LocalStore} from "@/utils/comm";
import {TOKEN_KEY} from "@/utils/variable";

const system = useSystem();
const {configInfo} = storeToRefs(system);

system.setDocumentTitle()

const route = useRoute()
const router = useRouter()

watch(() => JSON.stringify(route.query || {}), () => {
  if (route.query.token) {
    LocalStore.set(TOKEN_KEY, route.query.token);
  }
}, { immediate: true })

watchEffect(() => {
  if (router.currentRoute && (window as any).__MICRO_APP_ENVIRONMENT__) {
    const paths = router.currentRoute.value.matched
    const selectedKeys = paths.map(item => item.path);
    const openKeys = paths.map(item => item.path);

    const breadcrumbs = paths.map((item, index) => {
      return {
        index,
        isLast: index === (paths.length - 1),
        path: item.path,
        breadcrumbName: (item.meta as any).title || '',
      }
    });

    (window as any).microApp.dispatch({
      name: 'layout',
      selectedKeys,
      openKeys,
      breadcrumbs
    })
  }
})


ConfigProvider.config({
  theme: {
    primaryColor: "#315efb"
  }
})
</script>

<style scoped>
</style>
