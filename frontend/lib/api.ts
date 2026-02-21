import axios from 'axios';

const api = axios.create({
  // In production we default to same-origin so Next.js can proxy /api requests
  // to the backend via `next.config.mjs` rewrites.
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
});

export default api;
