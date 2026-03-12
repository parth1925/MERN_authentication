import axios from "axios";

const server = 'http://localhost:5000'

const getcookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(";").shift();
}

const api = axios.create({
    baseURL: server,
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        if (config.method === "post" || config.method === "put" || config.method === "delete") {
            const csrfToken = getcookie("csrfToken")
            if (csrfToken) {
                config.headers["x-csrf-token"] = csrfToken;
            }
        }
        return config;
    }, (error) => {
        return Promise.reject(error);
    }
);
let isRefreshing = false;
let isRefreshingCSRFTOKEN = false;

let failedQueue = [];
let csrffailedQueue = [];


const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};


const processcsrfQueue = (error, token = null) => {
    csrffailedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    csrffailedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        //which req fail this req all detail cpy pass in originlreq
        const originalRequest = error.config;

        if (error.response?.status === 403 && !originalRequest._retry) {
            const errorcode = error.response.data?.code || "";
            if (errorcode.startsWith("CSRF_")) {
                if (isRefreshingCSRFTOKEN) {
                    return new Promise((resolve, reject) => {
                        csrffailedQueue.push({ resolve, reject })
                    }).then(() => api(originalRequest))
                }
                originalRequest._retry = true
                isRefreshingCSRFTOKEN = true

                try {
                    await api.post("api/v1/refresh-csrf")
                    processcsrfQueue(null)
                    return api(originalRequest);
                } catch (error) {
                    processcsrfQueue(error)
                    console.error("Failed to refresh csrf token", error)
                    return Promise.reject(error)
                } finally {
                    isRefreshingCSRFTOKEN = false;
                }
            }
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(() => {
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;


            try {
                await api.post("api/v1/refresh");
                processQueue(null);
                return api(originalRequest);
            } catch (error) {
                processQueue(error, null)
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default api;
//Authetication req are called this use api 