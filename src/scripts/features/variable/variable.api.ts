import axiosClient from '../../apis/axios-client';

const baseUrl = 'variables';

const variableApi = {
  getList: (name?: string): Promise<any> =>
    axiosClient.get(baseUrl, { params: { name } }),
  create: (name: string, defaultValue: any): Promise<any> =>
    axiosClient.post(baseUrl, { name, defaultValue }),
  update: (id: number, updateData: any): Promise<any> =>
    axiosClient.put(`${baseUrl}/${id}`, updateData),
  delete: (id: number): Promise<any> => axiosClient.delete(`${baseUrl}/${id}`),
};

export default variableApi;
