import { defineStore } from 'pinia'
import { ref } from 'vue'
import { queryUserAppList } from '@/api/integration/application'

export const useApplication = defineStore('application', () => {
    const apps = ref([])

    const queryApplication = () => {
        queryUserAppList({
            "paging": false,
            "terms": [   // 应用查询条件-查询启用的
                {
                    "type": "or",
                    "value": "enabled",
                    "termType": "eq",
                    "column": "state"
                },
                {
                    "type": "or",
                    "value": "normal",
                    "termType": "eq",
                    "column": "connectState"
                }
            ],
        }).then(res => {
            if (res.success) {
                apps.value = res.result.reduce((prev, next) => {
                    next.label = next.name
                    prev.push(next)
                    return prev
                }, [])

            }
        })
    }

    return {
        apps,
        queryApplication
    }
})
