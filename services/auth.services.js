import api from '../lib/api'

export const authService = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (data) => api.post('/auth/register', data),
  me: (token) => api.get('/users/me', token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
}

export default authService
