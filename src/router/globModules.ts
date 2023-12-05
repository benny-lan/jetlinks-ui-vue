const routerModules = import.meta.glob('../views/**/index.vue')
import {getGlobModules as LowCodeComponentsFn} from '../../../low-code-ui/src/router/globModules'

export const getAsyncRoutesMap = () => {
    const modules = {}
    Object.keys(routerModules).forEach(item => {
        const code = item.replace('../views/', '').replace('/index.vue', '')
        modules[code] = routerModules[item]
    })

    return modules
}


export const getGlobModules = () => {

    const asyncRoutesMap = getAsyncRoutesMap()
    const LowCodeComponents = LowCodeComponentsFn()

    return {
        ...LowCodeComponents,
        ...asyncRoutesMap
    }
}
