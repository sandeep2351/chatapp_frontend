import axios from 'axios';
import { HOST } from '../utils/constants';

const apiclient = axios.create({
  baseURL: HOST, // Ensure this matches your server URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiclient;
