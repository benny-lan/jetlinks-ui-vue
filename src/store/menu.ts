import { defineStore } from '@jetlinks-web/stores'
import { queryOwnThree } from '@/api/system/menu'
import {
  handleMenus,
  MenuItem,
  handleSiderMenu,
  handleMenusMap
} from '@/utils/menu'
import { cloneDeep, isArray } from 'lodash-es'
import { usePermissionStore } from './permission'
import { onlyMessage } from '@/utils/comm'
import { router } from '@jetlinks-web/router'
import { AccountMenu, NotificationRecordCode, NotificationSubscriptionCode } from '@/router/menu'
import { USER_CENTER_MENU_CODE } from '@/utils/consts'
import {isNoCommunity} from "@/utils/utils";
import { getGlobModules } from '../router/globModules'
import { BASIC_ROUTER_DATA } from '@LowCode/router/basic'
import { handleMenuInit } from '@LowCode/utils'
import {useMenuStore as lowCodeMenuStore} from '@LowCode/store'

const defaultOwnParams = [
  {
    terms: [
      {
        terms: [
          {
            column: 'owner',
            termType: 'eq',
            value: 'iot'
          },
          {
            column: 'owner',
            termType: 'isnull',
            value: '1',
            type: 'or'
          },
        ]
      },
      {
        terms: [
          {
            value: "%show\":true%",
            termType: "like",
            column: "options"
          }
        ],
        type:'or'
      }
    ]
  }
]

type MenuStateType = {
  menus: any
  siderMenus: MenuItem[]
  params: Record<string, any>
}

// export const useMenuStore = defineStore('menu', () => {
//   const menus = ref({})
//   const params = ref({})
//   const siderMenus = ref([])
//
//   const hasPermission = () => {
//     return (menuCode: string | string[]) => {
//       if (!menuCode) {
//         return true
//       }
//       if (!!Object.keys(menus.value).length) {
//         if (typeof menuCode === 'string') {
//           return !!menus.value[menuCode]
//         }
//         return menuCode.some(code => !!menus.value[code])
//       }
//       return false
//     }
//   }
//
//   const hasMenu = (code: string) => {
//     return menus.value[code]?.path
//   }
//
//   const jumpPage =(name: string, _params?: Record<string, any>, query?: Record<string, any>) => {
//     const path = hasMenu(name)
//     if (path) {
//       params.value = { [name]: _params || {} }
//       router.push({
//         name, params: _params, query, state: { params: _params }
//       })
//     } else {
//       onlyMessage('暂无权限，请联系管理员', 'error')
//       console.warn(`没有找到对应的页面: ${name}`)
//     }
//   }
//
//   const routerPush = (name: string, _params?: Record<string, any>, query?: Record<string, any>) => {
//     params.value = { [name]: params || {} }
//     router.push({
//       name, params: _params, query, state: { params: _params }
//     })
//   }
//
//   const handleMenusMapById = (item: { name: string, path: string }) => {
//     const { name, path } = item
//     if (name) {
//       menus.value[name] = { path }
//     }
//   }
//
//
//
//   return {
//     hasPermission,
//     hasMenu,
//     jumpPage,
//     routerPush,
//     handleMenusMapById
//   }
//
// })
export const useMenuStore = defineStore({
  id: 'menu',
  state: (): MenuStateType => ({
    menus: {},
    params: {},
    siderMenus: []
  }),
  getters: {
    hasPermission(state) {
      return (menuCode: string | string[]) => {
        if (!menuCode) {
          return true
        }
        if (!!Object.keys(state.menus).length) {
          if (typeof menuCode === 'string') {
            return !!this.menus[menuCode]
          }
          return menuCode.some(code => !!this.menus[code])
        }
        return false
      }
    }
  },
  actions: {
    hasMenu(code: string) {
      return this.menus[code]?.path
    },
    /**
     * 路由跳转
     * @param name 菜单code
     * @param params 路由参数
     * @param query 路由参数
     */
    jumpPage(name: string, params?: Record<string, any>, query?: Record<string, any>) {
      const path = this.hasMenu(name)
      if (path) {
        this.params = { [name]: params || {} }
        router.push({
          name, params, query, state: { params }
        })
      } else {
        onlyMessage('暂无权限，请联系管理员', 'error')
        console.warn(`没有找到对应的页面: ${name}`)
      }
    },
    routerPush(name: string, params?: Record<string, any>, query?: Record<string, any>) {
      this.params = { [name]: params || {} }
      router.push({
        name, params, query, state: { params }
      })
    },
    handleMenusMapById(item: { name: string, path: string }) {
      const { name, path } = item
      if (name) {
        this.menus[name] = { path }
      }
    },
    queryMenuTree(isCommunity = false): Promise<any[]> {
      return new Promise(async (res) => {
        //过滤非集成的菜单
        const resp = await queryOwnThree({ paging: false, terms: defaultOwnParams })
        if (resp.success) {
          const permission = usePermissionStore()
          let resultData = handleMenuInit([...resp.result,...BASIC_ROUTER_DATA])
          const components = getGlobModules()
          const menusData = handleMenus(cloneDeep(resultData), components)
          permission.handlePermission(resultData)
          // const { menusData, silderMenus } = filterAsyncRouter(resultData)
          handleMenusMap(cloneDeep(menusData), this.handleMenusMapById)
          menusData.push({
            path: '/',
            redirect: menusData[0]?.path,
          })
          // menusData.push(AccountMenu)
          // lowCodeMenuStore().handleMenuMapFn(cloneDeep(menusData))
          this.siderMenus = handleSiderMenu(cloneDeep(resultData))
          console.log(cloneDeep(menusData))
          res(menusData)
        }
      })
    }
  }
})
