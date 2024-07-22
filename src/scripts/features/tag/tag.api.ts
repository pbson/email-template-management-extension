import axiosClient from '../../apis/axios-client';

const baseUrl = 'tags';

const tagApi = {
  getList: (): Promise<any> => axiosClient.get(baseUrl),
  getDetail: (id: number): Promise<any> =>
    axiosClient.get(`${baseUrl}/${id}`),
  add: (body: any): Promise<any> =>
    axiosClient.post(baseUrl, body),
  update: (body: { id: number; [key: string]: any }): Promise<any> =>
    axiosClient.put(`${baseUrl}/${body.id}`, body),
  delete: (id: number): Promise<any> =>
    axiosClient.delete(`${baseUrl}/${id}`),
};

export default tagApi;