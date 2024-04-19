import { post } from '@/utils/request'
// 根据用户拥有菜单权限,查询应用列表
export const queryUserAppList = (data: any) => post(`/application/user/_query/no-paging`, data);
