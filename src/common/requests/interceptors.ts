
import { AxiosResponse, AxiosError } from 'axios';
import { Message } from 'element-ui';

const success = (res: AxiosResponse) => {
    if (res.data._redirect) {
        window.location.href = res.data._redirect;
    }
    return res.data;
};

const error = (err: AxiosError) => {
    if (err.response) {
        const status = Number(err.response.status);
        switch (status) {
        case 400:
            Message({
                showClose: true,
                message: err.response.data.error || err.response.data.message,
                type: 'error',
            });
            break;
        case 401:
            break;
        case 500:
            Message({
                showClose: true,
                message: '服务异常',
                type: 'error',
            });
            break;
        default:
        }

        const error = {
            status: err.response.status,
            error: err.response.data.error,
            message: err.response.data.message,
            errors: err.response.data.errors,
            detail: err.response.data.detail,
        };
        return Promise.reject(error);
    }
};

export default {
    success,
    error
};
