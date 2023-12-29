import { defineStore } from '@jetlinks-web/stores'
export const useTypeStore = defineStore({
    id: 'type',
    state: () => ({
        configRef: [] as any,
        resourcesClusters: {} as any,
    }),
    actions: {
        setConfigRef(current: any[]) {
            this.configRef = current
        },
        setResourcesClusters(current: any) {
            this.resourcesClusters = current
        }
    }
})
