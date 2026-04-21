import { useState, useEffect } from 'react'
import { authService } from '../services/auth.services'

export function useUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    authService.me(token)
      .then((res) => {
        setUser(res.data || res)
        setError(null)
      })
      .catch((err) => {
        setUser(null)
        setError(err.message || 'Không thể lấy thông tin user')
      })
      .finally(() => setLoading(false))
  }, [])

  return { user, loading, error }
}
