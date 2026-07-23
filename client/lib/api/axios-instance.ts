import axios, { type AxiosRequestConfig } from 'axios';

import { API_BASE_URL } from '@/constants/api.constants';

const axiosInstance = axios.create({ baseURL: API_BASE_URL });

/**
 * orval mutator — every generated hook routes through this single Axios instance,
 * so base URL, headers, and error handling live in one place (never ad-hoc fetch).
 */
export const customInstance = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const { data } = await axiosInstance.request<T>(config);
  return data;
};
