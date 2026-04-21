import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import api from '../lib/api'

export const useOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (!token) {
      setOrders([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/orders')
      
      if (response && response.data) {
        setOrders(response.data)
      } else if (Array.isArray(response)) {
        setOrders(response)
      } else {
        setOrders([])
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch orders')
      setOrders([])
      
      if (err.response?.status === 401) {
        message.error('Vui lòng đăng nhập lại')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const getOrder = useCallback(async (orderId) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (!token) {
      message.error('Vui lòng đăng nhập để xem đơn hàng')
      return null
    }

    try {
      setLoading(true)
      const response = await api.get(`/orders/${orderId}`)
      
      return response.data || response
    } catch (err) {
      console.error('Error fetching order:', err)
      message.error(err.response?.data?.message || 'Không thể tải thông tin đơn hàng')
      
      if (err.response?.status === 401) {
        message.error('Vui lòng đăng nhập lại')
      }
      
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const cancelOrder = useCallback(async (orderId) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (!token) {
      message.error('Vui lòng đăng nhập để hủy đơn hàng')
      return false
    }

    try {
      setLoading(true)
      const response = await api.put(`/orders/${orderId}/cancel`)
      
      message.success('Hủy đơn hàng thành công')
      await fetchOrders() // Refresh orders
      return true
    } catch (err) {
      console.error('Error canceling order:', err)
      message.error(err.response?.data?.message || 'Hủy đơn hàng thất bại')
      
      if (err.response?.status === 401) {
        message.error('Vui lòng đăng nhập lại')
      }
      
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchOrders])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return {
    orders,
    loading,
    error,
    fetchOrders,
    getOrder,
    cancelOrder
  }
}