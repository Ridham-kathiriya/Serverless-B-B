import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AxiosConfig = axios.create({
  baseURL: BACKEND_URL,
});

export default AxiosConfig;
