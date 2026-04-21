import api from '../lib/api'
import { useEffect, useState } from 'react'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api.get('/categories')
      .then(data => {
        if (mounted) setCategories(data)
      })
      .catch(e => {
        if (mounted) setError(e)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  return { categories, loading, error }
}
