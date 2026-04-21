import { useState, useCallback } from 'react'
import api from '../lib/api'

export const useLocations = () => {
  const [loading, setLoading] = useState(false)

  const getProvinces = useCallback(async (q = '') => {
    try {
      setLoading(true)
      const response = await api.get(`/locations/provinces${q ? `?q=${encodeURIComponent(q)}` : ''}`)
      
      let data = response
      if (response && typeof response === 'object') {
        data = response.data || response.results || response
      }
      
      return Array.isArray(data) ? data : []
    } catch (error) {
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const getDistricts = useCallback(async (provinceId, q = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (provinceId) params.append('provinceId', provinceId.toString())
      if (q) params.append('q', q)
      
      const response = await api.get(`/locations/districts?${params.toString()}`)
      
      let data = response
      if (response && typeof response === 'object') {
        data = response.data || response.results || response
      }
      
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching districts:', error)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const getWards = useCallback(async (districtId, q = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (districtId) params.append('districtId', districtId.toString())
      if (q) params.append('q', q)
      
      const response = await api.get(`/locations/wards?${params.toString()}`)
      
      let data = response
      if (response && typeof response === 'object') {
        data = response.data || response.results || response
      }
      
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching wards:', error)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    getProvinces,
    getDistricts,
    getWards
  }
}