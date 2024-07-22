import axiosClient from '../../apis/axios-client'

const baseUrl = 'schedules'

const scheduleApi = {
    getList: (params?: any): Promise<any> => axiosClient.get(`${baseUrl}/user`, { params }),
    getDetail: (id: number): Promise<any> => axiosClient.get(`${baseUrl}/${id}`),
    add: (body: any): Promise<any> => axiosClient.post(baseUrl, body),
    update: (body: any): Promise<any> => axiosClient.put(`${baseUrl}/${body.id}`, body),
    delete: (id: number): Promise<any> => axiosClient.delete(`${baseUrl}/${id}`)
}

export default scheduleApi
