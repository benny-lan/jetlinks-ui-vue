import {
  USER_CENTER_MENU_BUTTON_CODE,
  USER_CENTER_MENU_CODE
} from '@/utils/consts'
import menus from './baseMenuData.json'

export const USER_CENTER_MENU_DATA = {
  id: '19a1f2c763e1231f1e1',
  accessSupport: { value: 'unsupported', label: '不支持'},
  supportDataAccess: false,
  code: USER_CENTER_MENU_CODE,
  name: '个人中心',
  url: '/account/center',
  sortIndex: 9999,
  granted: true,
  owner: 'iot',
  options: {
    isShow: false,
  },
  permissions: [
    {
      permission: 'system_config',
      actions: ['query'],
    },
  ],
  buttons: [
    {
      id: USER_CENTER_MENU_BUTTON_CODE,
      name: '修改密码',
      permissions: [
        {
          permission: 'user',
          actions: ['update-self-pwd']
        },
        {
          permission: 'system_config',
          actions: ['query'],
        },
      ]
    }
  ]
}

export default menus;
