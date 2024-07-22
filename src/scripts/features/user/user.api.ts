import axiosClient from '../../apis/axios-client';

const userApi = {
  signup: (body: { email: string; password: string; full_name: string }) =>
    axiosClient.post('/users/signup', body),
  signin: (body: { email: string; password: string }) =>
    axiosClient.post('/users/signin', body),
  signinMicrosoft: (body: { id_token: string }) =>
    axiosClient.post('/users/signin/microsoft', body), // Modify as needed for actual Microsoft login data
  resetPassword: (body: { email: string }) =>
    axiosClient.post('/users/reset-password', body),
  getTeachers: (): Promise<any> =>
    axiosClient.get(`/users?role=teacher`),
};

export default userApi;
