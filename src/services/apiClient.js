import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://localhost:7248/api', // Change to your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;