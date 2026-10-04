import axios from 'axios';

const apiBaseUrl = window.__APP_CONFIG__?.apiBaseUrl;

if (!apiBaseUrl) {
  throw new Error('API configuration missing. Set API_BASE_URL when starting the frontend.');
}

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
