<template>
    <JLayout
        v-bind="layoutConf"
        v-model:collapsed="basicLayout.collapsed"
        v-model:openKeys="basicLayout.openKeys"
        :selectedKeys="basicLayout.selectedKeys"
        :breadcrumb="{ routes: breadcrumbs }"
        :headerHeight='basicLayout.pure ? 1 : layout.headerHeight'
        :pure="basicLayout.pure"
        :apps="filterApps"
        :layoutType="layoutType"
        @backClick='routerBack'
    >
        <template #breadcrumbRender="slotProps">
            <a
              v-if="slotProps.route.index !== 0 && !slotProps.route.isLast"
              @click='jump(slotProps.route)'
            >
              {{ slotProps.route.breadcrumbName }}
            </a>
            <span v-else style='cursor: default' >{{ slotProps.route.breadcrumbName }}</span>
        </template>
        <template #rightContentRender>
            <div class="right-content">
                <AIcon type="QuestionCircleOutlined" @click="toDoc" />
                <Notice style="margin: 0 24px" />
                <UserInfo />
            </div>
        </template>

      <slot>
        <router-view v-slot="{ Component }">
          <component :is="components || Component" />
        </router-view>
      </slot>
    </JLayout>
</template>

<script setup lang="ts" name="BasicLayoutPage">
import UserInfo from './components/UserInfo.vue';
import Notice from './components/Notice.vue';
import DefaultSetting from '../../../config/config';
import { useMenuStore } from '@/store/menu';
import { clearMenuItem } from 'jetlinks-ui-components/es/ProLayout/util';
import { AccountMenu } from '@/router/menu'
import { useSystem } from '@/store/system';
import { useApplication } from '@/store/application';
import { storeToRefs } from 'pinia';
import { useSlots } from 'vue'
import { ProLayout as JLayout } from '@jetlinks-web/components/es/components'
import {LocalStore, setToken} from "@/utils/comm";

type StateType = {
    collapsed: boolean;
    openKeys: string[];
    selectedKeys: string[];
    pure: boolean;
};

const router = useRouter();
const route = useRoute();

const application = useApplication();
const menu = useMenuStore();

const system = useSystem();
const {configInfo,layout, basicLayout} = storeToRefs(system);
const slots = useSlots()
const layoutType = ref('list')

const filterApps = computed(() => {
  return application.apps.filter(item => item.id !== system.microApp.appId)
})

const layoutConf = reactive({
    theme: DefaultSetting.layout.theme,
    siderWidth: layout.value.siderWidth,
    logo: DefaultSetting.layout.logo,
    title: DefaultSetting.layout.title,
    menuData: menu.siderMenus,
    // menuData: menu.siderMenus,
    splitMenus: true,
});

watchEffect(() => {
    layoutConf.theme = configInfo.value.front?.headerTheme || DefaultSetting.layout.theme;
    layoutConf.title = configInfo.value.front?.title || DefaultSetting.layout.title;
    layoutConf.logo = configInfo.value.front?.logo || DefaultSetting.layout.logo;
})

const components = computed(() => {
  const componentName = route.matched[route.matched.length - 1]?.components?.default?.name
  if (componentName !== 'BasicLayoutPage') {
    return route.matched[route.matched.length - 1]?.components?.default
  }
  return undefined
})

/**
 * 面包屑
 */
const breadcrumbs = ref<any[]>([])

const routerBack = () => {
  // TODO 子应用时，使用microapp跳转
  router.go(-1)
}


const jump = (item: any) => {
  router.push(item.path)
}

watchEffect(() => {
  if (router.currentRoute) {
    const paths = router.currentRoute.value.matched
    basicLayout.value.selectedKeys = paths.map(item => item.path)
    basicLayout.value.openKeys = paths.map(item => item.path)

    breadcrumbs.value = paths.map((item, index) => {
      return {
        index,
        isLast: index === (paths.length -1),
        path: item.path,
        breadcrumbName: (item.meta as any).title || '',
      }
    })
    console.log(paths, breadcrumbs.value)
  }

  if (route.query?.layout === 'false') {
    basicLayout.value.pure = true
  }
})

const init = () => {
  (window as any).microApp?.addDataListener((data: any) => {
    if (data.layoutType) {
      layoutType.value = data.layoutType
    }
  }, true)
}

init()
const toDoc = () => window.open('http://doc.v2.jetlinks.cn/');
</script>

<style scoped>
.right-content {
    margin-right: 24px;
    display: flex;
    align-items: center;
}
</style>
