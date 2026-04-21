import { useState, useCallback } from 'react'
import { message } from 'antd'
import api from '../lib/api'
import { useRouter } from 'next/router'

export const useCheckout = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const checkout = useCallback(async (checkoutData) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (!token) {
      message.error('Vui lòng đăng nhập để đặt hàng')
      return null
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await api.post('/orders/checkout', {
        addressId: checkoutData.addressId,
        paymentMethod: checkoutData.paymentMethod,
        notes: checkoutData.notes
      })
      message.success('Đặt hàng thành công!')
    
      if (response && response.data && response.data.id) {
        console.log('response', response)
        router.push(`/orders/${response.data.id}`)
      } else {
        router.push('/orders')
      }
      
      return response.data || response
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Đặt hàng thất bại'
      setError(errorMessage)
      message.error(errorMessage)
      
      if (err.response?.status === 401) {
        message.error('Vui lòng đăng nhập lại')
        router.push('/login')
      }
      
      return null
    } finally {
      setLoading(false)
    }
  }, [router])

  const buyNow = useCallback(async (productId, quantity, addressId, paymentMethod, variantId) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (!token) {
      message.error('Vui lòng đăng nhập để mua hàng')
      return null
    }

    try {
      setLoading(true)
      setError(null)
      let payload = { productId: Number(productId), quantity: Number(quantity), addressId: addressId ? Number(addressId) : undefined, paymentMethod, variantId };
      if (typeof arguments[4] !== 'undefined' && arguments[4] !== null) {
        payload.variantId = arguments[4];
      }
      const response = await api.post('/orders/buy-now', payload);
      message.success('Mua hàng thành công!');
      if (response && response.data && response.data.id) {
        router.push(`/orders/${response.data.id}`)
      } else {
        router.push('/orders')
      }
      return response.data || response;
    } catch (err) {
      console.error('Error during buy now:', err)
      const errorMessage = err.response?.data?.message || 'Mua hàng thất bại';
      setError(errorMessage);
      message.error(errorMessage);
      if (err.response?.status === 401) {
        message.error('Vui lòng đăng nhập lại');
        router.push('/login');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [router])

  return {
    loading,
    error,
    checkout,
    buyNow
  }
}