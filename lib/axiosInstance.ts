import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";

let logoutCallback: (() => void) | null = null;
let navigateCallback: ((path: string) => void) | null = null;

export const setLogoutCallback = (cb: () => void) => {
    logoutCallback = cb;
};

export const setNavigateCallback = (cb: (path: string) => void) => {
    navigateCallback = cb;
};

// Export the navigateCallback directly
export const getNavigateCallback = () => navigateCallback;

const api = axios.create({
    baseURL: '/api'
});

// Interceptors
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        const status = error.response?.status;
        if ((status === 401 || status === 404) && logoutCallback && navigateCallback) {
            console.warn(`Global ${status} error detected. Calling logout...`);
            console.warn("Navigating to /login due to 401");
            logoutCallback();
            navigateCallback("/login");
        }
        return Promise.reject(error);
    }
);

export default api; 