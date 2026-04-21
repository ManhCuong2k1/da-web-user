import { useState, useEffect } from 'react'
import api from '../lib/api'

export function useProducts(params = {}) {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(!!params)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        perPage: 10,
        total: 0,
        totalPages: 1
    })

    const fetchProducts = async (queryParams = {}) => {
        try {
            setLoading(true)
            setError(null)

            const query = new URLSearchParams({
                page: queryParams.page || params.page || 1,
                perPage: queryParams.perPage || params.perPage || 10,
                ...queryParams,
                ...params
            }).toString()

            const response = await api.get(`/products?${query}`)

            if (response?.items) {
                const transformedProducts = response.items.map(product => ({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    basePrice: product.basePrice,
                    price: product.basePrice?.toLocaleString('vi-VN') || '0',
                    oldPrice: product.basePrice ? (product.basePrice * 1.2).toLocaleString('vi-VN') : '0',
                    category: product.category,
                    images: product.images?.map(img => img?.url).filter(Boolean) || [],
                    img: product.images?.[0]?.url || `https://via.placeholder.com/400x400/f0f0f0/999999?text=No+Image`,
                    variants: product.variants || [],
                    stockQuantity: product.stockQuantity || 0,
                    shop: product.shop,
                    createdAt: product.createdAt
                }))

                setProducts(transformedProducts)
                setPagination(response.pagination || {
                    page: 1,
                    perPage: 10,
                    total: transformedProducts.length,
                    totalPages: 1
                })
            } else {
                setProducts([])
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách sản phẩm')
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (params) {
            fetchProducts()
        }
    }, [
        params?.page,
        params?.perPage,
        params?.search,
        params?.category,
        params?.categories,
        params?.minPrice,
        params?.maxPrice,
        params?.sortBy,
    ])

    return {
        products,
        loading,
        error,
        pagination,
        refetch: fetchProducts
    }
}

export function useFeaturedProducts(limit = 4) {
    return useProducts({ perPage: limit, featured: true, isHightlight: true })
}

export function useNewProducts(limit = 12) {
    return useProducts({ perPage: limit, sortBy: 'createdAt', sortOrder: 'desc' })
}

export function useProduct(id) {
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(!!id && id !== 'undefined')
    const [error, setError] = useState(null)

    const fetchProduct = async (productId) => {
        if (!productId) return
        
        try {
            setLoading(true)
            setError(null)

            const response = await api.get(`/products/${productId}`)
            
            if (response) {
                const transformedProduct = {
                    id: response.id,
                    name: response.name,
                    shortDescription: response.shortDescription,
                    description: response.description,
                    basePrice: response.basePrice,
                    price: response.basePrice || 0,
                    oldPrice: response.basePrice ? Math.round(response.basePrice * 1.2) : 0,
                    category: response.category,
                    images: response.images?.map(img => img?.url).filter(Boolean) || [],
                    variants: response.variants || [],
                    stockQuantity: response.stockQuantity || 0,
                    shop: response.shop,
                    createdAt: response.createdAt,
                    colors: [...new Set(
                        response.variants?.flatMap(variant => 
                            variant.options?.filter(opt => opt.value?.typeId === 1)
                                .map(opt => opt.value?.value)
                        ).filter(Boolean) || []
                    )],
                    sizes: [...new Set(
                        response.variants?.flatMap(variant => 
                            variant.options?.filter(opt => opt.value?.typeId === 2)
                                .map(opt => opt.value?.value)
                        ).filter(Boolean) || []
                    )]
                }
                
                const variantInfo = response.variants?.map(variant => ({
                    id: variant.id,
                    sku: variant.sku,
                    price: variant.price,
                    stock: variant.stock,
                    options: variant.options?.map(opt => ({
                        type: opt.value?.typeId === 1 ? 'Color' : opt.value?.typeId === 2 ? 'Size' : 'Other',
                        value: opt.value?.value
                    })) || []
                })) || []
                
                transformedProduct.variantInfo = variantInfo
                setProduct(transformedProduct)
            } else {
                setProduct(null)
                setError('Không tìm thấy sản phẩm')
            }
        } catch (err) {
            setError(err.message || 'Không thể tải thông tin sản phẩm')
            setProduct(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id && id !== 'undefined') {
            fetchProduct(id)
        }
    }, [id])

    return {
        product,
        loading,
        error,
        refetch: () => fetchProduct(id)
    }
}