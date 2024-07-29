/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import axios, { AxiosError } from 'axios';

const LOGIN_PATH = '/login';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors
// Add a request interceptor
axiosClient.interceptors.request.use(
  async function (config) {
    // Retrieve the token from Chrome storage
    const token = await new Promise<string | null>((resolve) => {
      chrome.storage.local.get(['jwt'], (result) => {
        resolve(result.jwt);
      });
    });

    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }

    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

// Add a response interceptor
axiosClient.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
  },
  function (error: AxiosError) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.response?.status === 401) {
      // clear token ...
      chrome.storage.local.remove('jwt');
      window.location.replace(LOGIN_PATH);
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
