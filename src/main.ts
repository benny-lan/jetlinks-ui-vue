import {createApp} from 'vue'
import App from './App.vue'
import {setupPinia} from '@jetlinks-web/stores'
import components from './components'
import { createAuthRoute } from './router'
import menu, { Login } from '@/router/menu'
import { initRoute } from '@jetlinks-web/router'
import './style.less'
import 'ant-design-vue/dist/antd.variable.min.css'
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');


(async () => {
    const app = createApp(App)

    await setupPinia(app)

    app.use(components)

    const router = initRoute({ base: menu, Login: Login })

    console.log(router)

    app.use(router)

    await createAuthRoute(router)

    app.mount('#app')
})()

