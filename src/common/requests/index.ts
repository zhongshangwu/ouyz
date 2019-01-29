import axios from 'axios';

import interceptors from './interceptors';

const ax = axios.create({
    timeout: 1000,
    headers: {
        Accept: 'HELLO WORLD',
    }
});

ax.interceptors.response.use(interceptors.success, interceptors.error);

export default ax;
