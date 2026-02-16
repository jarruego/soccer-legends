/**
 * Cliente HTTP con Axios
 *
 * Centraliza todas las peticiones a la API
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS } from '@constants/index';
import { ApiError } from '../types/index';

class HttpClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token en cada request
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Interceptor para manejar errores
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expirado o inválido
          AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          AsyncStorage.removeItem(STORAGE_KEYS.USER);
        }
        return Promise.reject(this.formatError(error));
      },
    );
  }

  /**
   * Formatea errores de API a formato consistente
   */
  private formatError(error: AxiosError): ApiError {
    if (error.response) {
      return {
        statusCode: error.response.status,
        message: (error.response.data as any)?.message || 'Error en la solicitud',
        error: (error.response.data as any)?.error,
      };
    }

    return {
      statusCode: 0,
      message: error.message || 'Error de conexión',
    };
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    // Para 204 No Content, response.data será undefined, así que retornamos undefined o {}
    return response.data || ({} as T);
  }
}

export const httpClient = new HttpClient();
