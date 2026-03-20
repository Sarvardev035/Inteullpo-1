import api from './axios'

export const authApi = {
  login:    (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  logout:   ()     => api.post('/api/auth/logout'),
}
