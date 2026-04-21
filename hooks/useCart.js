import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import api from '../lib/api'
import { updateCart, clearCart as clearCartStore } from '../store/index'

export function useCart() {
    const dispatch = useDispatch();
    const [cart, setCart] = useState(null);
    const [cartNumber, setCartNumber] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCart = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await api.get('/cart')
            if (response) {
                const items = response.items?.map(item => {
                    let variantLabel = 'Mặc định';
                    let variantPrice = item.product.basePrice;
                    let variantSku = item.product.id;
                    if (item.variant) {
                        variantLabel = item.variant.options && item.variant.options.length > 0
                            ? item.variant.options.map(opt => `${opt.value}${opt.type ? ' (' + opt.type + ')' : ''}`).join(', ')
                            : item.variant.sku || 'Variant';
                        variantPrice = item.variant.price;
                        variantSku = item.variant.sku;
                    }
                    return {
                        id: item.id,
                        productId: item.product.id,
                        title: item.variant?.name || item.product.name,
                        sku: variantSku,
                        price: variantPrice,
                        quantity: item.quantity,
                        img: (item.product.images && item.product.images.length > 0)
                            ? (item.product.images[0].url || item.product.images[0])
                            : `https://via.placeholder.com/120x120/f0f0f0/999999?text=No+Image`,
                        variant: variantLabel,
                    };
                }) || []

                const transformedCart = {
                    id: response.id,
                    items: items,
                    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
                    totalPrice: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                }
                setCartNumber(items?.length)
                setCart(transformedCart)
                dispatch(updateCart({ items, total: items.length }))
            } else {
                setCart({ items: [], totalItems: 0, totalPrice: 0 })
                dispatch(updateCart({ items: [], total: 0 }))
            }
        } catch (err) {
            setError(err.message || 'Không thể tải giỏ hàng')
            setCart({ items: [], totalItems: 0, totalPrice: 0 })
            dispatch(updateCart({ items: [], total: 0 }))
        } finally {
            setLoading(false)
        }
    };

    const addToCart = async (productId, quantity = 1, variantId = null) => {
        try {
            setError(null)
            const payload = { productId, quantity };
            if (variantId) payload.variantId = variantId;
            const response = await api.post('/cart', payload);
            if (response) {
                await fetchCart();
                return { success: true };
            } else {
                return { success: false, error: 'No response from server' };
            }
        } catch (err) {
            setError(err.message || 'Không thể thêm vào giỏ hàng');
            return { success: false, error: err.message };
        }
    }

    const updateCartItem = async (itemId, quantity) => {
        try {
            setError(null)

            const response = await api.put(`/cart/${itemId}`, {
                quantity: quantity
            })

            if (response) {
                await fetchCart()
                return { success: true }
            }
        } catch (err) {
            setError(err.message || 'Không thể cập nhật giỏ hàng')
            return { success: false, error: err.message }
        }
    }

    const removeFromCart = async (itemId) => {
        try {
            setError(null)
            await api.del(`/cart/${itemId}`)

            await fetchCart()
            return { success: true }
        } catch (err) {
            setError(err.message || 'Không thể xóa khỏi giỏ hàng')
            return { success: false, error: err.message }
        }
    }

    const clearCart = async () => {
        try {
            setError(null)
            await api.del('/cart')
            await fetchCart()
            dispatch(clearCartStore())
            return { success: true }
        } catch (err) {
            console.error('Failed to clear cart:', err)
            setError(err.message || 'Không thể xóa giỏ hàng')
            return { success: false, error: err.message }
        }
    }

    useEffect(() => {
        let token = null
        try {
            token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
        } catch (e) {
            token = null
        }

        if (token) {
            fetchCart()
        } else {
            setLoading(false)
            setCart({ items: [], totalItems: 0, totalPrice: 0 })
        }
    }, [])

    return {
        cart,
        loading,
        cartNumber,
        error,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refetch: fetchCart
    }
}