import axiosClient from '../../apis/axios-client';

const baseUrl = 'cases';
const recentSearchUrl = `${baseUrl}/recent-search`;

interface GetListParams {
  title?: string;
  tagId?: number;
  page?: number;
  limit?: number;
}

const caseApi = {
  getList: (params: GetListParams = {}): Promise<any> =>
    axiosClient.get(baseUrl, { params }),
  getDetail: (id: string): Promise<any> =>
    axiosClient.get(`${baseUrl}/${id}`),
  add: (body: any): Promise<any> =>
    axiosClient.post(baseUrl, body),
  update: (body: any): Promise<any> =>
    axiosClient.put(`${baseUrl}/${body.id}`, body),
  delete: (id: string): Promise<any> =>
    axiosClient.delete(`${baseUrl}/${id}`),

  // Recent Search methods
  getRecentSearches: (): Promise<any> =>
    axiosClient.get(recentSearchUrl),
  addRecentSearch: (caseId: number): Promise<any> =>
    axiosClient.post(recentSearchUrl, { caseId }),
  deleteRecentSearch: (searchId: number): Promise<any> =>
    axiosClient.delete(`${recentSearchUrl}/${searchId}`),
};

export default caseApi;
