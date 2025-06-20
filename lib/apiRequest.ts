import type { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import api from "./axiosInstance";

interface ApiRequestOptions<T = any> {
    method: "get" | "post" | "put" | "delete" | "patch";
    url: string;
    data?: T;
    params?: Record<string, any>;
    headers?: Record<string, string>;
    contentType?: string;
    token?: string | null;
    isFormData?: boolean;
    onUploadProgress?: (progressEvent: ProgressEvent) => void;
}

const apiRequest = async <T = any>({
    method,
    url,
    data,
    params,
    headers = {},
    contentType,
    token,
    isFormData = false,
    onUploadProgress
}: ApiRequestOptions<T>): Promise<any> => {
    try {
        const config: AxiosRequestConfig = {
            method,
            url,
            data,
            params,
            headers: {
                ...(isFormData ? {} : { "Content-Type": contentType || "application/json" }),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...headers,
            },
        };

        const response: AxiosResponse = await api(config);
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError;
        let errorMessage = "API request failed.";

        if (axiosError.response && axiosError.response.data) {
            const data = axiosError.response.data as any;
            // Handle nested errors (e.g., Laravel/Django validation)
            if (data.errors) {
                if (Array.isArray(data.errors)) {
                    errorMessage = data.errors.join(", ");
                } else if (typeof data.errors === "object") {
                    errorMessage = Object.values(data.errors).flat().join(", ");
                } else {
                    errorMessage = String(data.errors);
                }
            } else {
                errorMessage = data.error || data.message || data.detail || JSON.stringify(data);
            }
        } else if (axiosError.request) {
            errorMessage = "No response from server.";
        } else {
            errorMessage = (axiosError.message as string) || "Unknown error";
        }

        console.error("API Error:", errorMessage);
        return { error: errorMessage };
    }
};

export default apiRequest; 