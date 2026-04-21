import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import api from '../lib/api'

export const useAddresses = () => {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAddresses = useCallback(async () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (!token) {
      setAddresses([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/addresses')
      
      if (response && response.data) {
        setAddresses(response.data)
      } else if (Array.isArray(response)) {
        setAddresses(response)
      } else {
        setAddresses([])
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch addresses')
      setAddresses([])
      
      if (err.response?.status === 401) {
        message.error('Vui lòng đăng nhập lại')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const addAddress = useCallback(async (addressData) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (!token) {
      message.error('Vui lòng đăng nhập để thêm địa chỉ')
      return false
    }

    try {
      setLoading(true)
      const response = await api.post('/addresses', addressData)
      
      message.success('Thêm địa chỉ thành công')
      await fetchAddresses() // Refresh addresses
      return true
    } catch (err) {
      console.error('Error adding address:', err)
      message.error(err.response?.data?.message || 'Thêm địa chỉ thất bại')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchAddresses])

  const updateAddress = useCallback(async (addressId, addressData) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (!token) {
      message.error('Vui lòng đăng nhập để cập nhật địa chỉ')
      return false
    }

    try {
      setLoading(true)
      const response = await api.put(`/addresses/${addressId}`, addressData)
      
      message.success('Cập nhật địa chỉ thành công')
      await fetchAddresses()
      return true
    } catch (err) {
      console.error('Error updating address:', err)
      message.error(err.response?.data?.message || 'Cập nhật địa chỉ thất bại')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchAddresses])

  const deleteAddress = useCallback(async (addressId) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (!token) {
      message.error('Vui lòng đăng nhập để xóa địa chỉ')
      return false
    }

    try {
      setLoading(true)
      await api.delete(`/addresses/${addressId}`)
      
      message.success('Xóa địa chỉ thành công')
      await fetchAddresses() 
      return true
    } catch (err) {
      console.error('Error deleting address:', err)
      message.error(err.response?.data?.message || 'Xóa địa chỉ thất bại')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchAddresses])

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress
  }
}