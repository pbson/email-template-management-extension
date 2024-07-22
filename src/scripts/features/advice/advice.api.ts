import axiosClient from '../../apis/axios-client';

const baseUrl = 'advice';

const adviceApi = {
  getList: (caseId: string, params?: any): Promise<any> =>
    axiosClient.get(`${baseUrl}/${caseId}`, { params }),
  getDetail: (id: string): Promise<any> => axiosClient.get(`${baseUrl}/${id}`),
  add: (body: any): Promise<any> => axiosClient.post(baseUrl, body),
  update: (body: any): Promise<any> =>
    axiosClient.put(`${baseUrl}/${body.id}`, body),
  delete: (id: string): Promise<any> => axiosClient.delete(`${baseUrl}/${id}`),
};

export default adviceApi;
