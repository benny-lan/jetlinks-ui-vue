import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import components from './components'
import router from './router'
import './style.less'
import 'ant-design-vue/dist/antd.variable.min.css'
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { setToken, LocalStore } from '@/utils/comm'

dayjs.locale('zh-cn');

(window as any).microApp?.addDataListener((data: any) => {
    console.log(data, data.token)
    if (data.token) {
        setToken(data.token)
    }

    if (data.appId) {
        LocalStore.set('appId', data.appId)
    }
}, true)

const app = createApp(App)

app.use(store)
  .use(router)
  .use(components)
  .mount('#jetlinks-iot')
