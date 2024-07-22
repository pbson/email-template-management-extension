import axiosClient from '../../apis/axios-client'

const baseUrl = 'case-responses'

const caseResponseApi = {
    add: (body: any): Promise<any> => axiosClient.post(baseUrl, body)
}

export default caseResponseApi
