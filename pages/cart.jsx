import React, { useState } from 'react'
import Link from 'next/link'
import { Row, Col, Card, Button, Input, Image, Divider, Badge, InputNumber, Checkbox, Spin, Alert, Popconfirm, message } from 'antd'
import { PlusOutlined, MinusOutlined, ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'



function Currency({ v }) {
  return `${v?.toLocaleString('vi-VN')} ₫`
}

export default function CartPage() {
  const [useXu, setUseXu] = useState(true)
  const [updating, setUpdating] = useState({})
  
  // Get cart data from API
  const { cart, loading, error, updateCartItem, removeFromCart, clearCart } = useCart()
  
  // Get related products
  const { products: relatedProducts } = useProducts({ perPage: 8, featured: true })

  const handleUpdateQty = async (itemId, currentQty, delta) => {
    const newQty = Math.max(1, currentQty + delta)
    if (newQty === currentQty) return
    
    setUpdating(prev => ({ ...prev, [itemId]: true }))
    const result = await updateCartItem(itemId, newQty)
    setUpdating(prev => ({ ...prev, [itemId]: false }))
    
    if (result.success) {
      message.success('Cập nhật thành công')
    } else {
      message.error('Cập nhật thất bại')
    }
  }
  
  const handleRemoveItem = async (itemId) => {
    const result = await removeFromCart(itemId)
    if (result.success) {
      message.success('Đã xóa khỏi giỏ hàng')
    } else {
      message.error('Xóa thất bại')
    }
  }
  
  const handleClearCart = async () => {
    const result = await clearCart()
    if (result.success) {
      message.success('Đã xóa toàn bộ giỏ hàng')
    } else {
      message.error('Xóa thất bại')
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
        <p className="ml-3 text-gray-500">Đang tải giỏ hàng...</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container py-8">
        <Alert
          message="Lỗi tải giỏ hàng"
          description={error}
          type="error"
          showIcon
        />
      </div>
    )
  }
  
  const items = cart?.items || []
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0)

  return (
    <main className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Giỏ hàng ({items.length})</h2>
        {items.length > 0 && (
          <Popconfirm
            title="Xóa toàn bộ giỏ hàng?"
            description="Bạn có chắc chắn muốn xóa tất cả sản phẩm?"
            onConfirm={handleClearCart}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa tất cả
            </Button>
          </Popconfirm>
        )}
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCartOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-500 mb-2">Giỏ hàng trống</h3>
          <p className="text-gray-400 mb-6">Bạn chưa thêm sản phẩm nào vào giỏ hàng</p>
          <Link href="/products">
            <Button type="primary" size="large">
              Tiếp tục mua sắm
            </Button>
          </Link>
        </div>
      ) : (

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="rounded-lg shadow-sm" bodyStyle={{ padding: 20 }}>
                <div className="flex gap-4">
                  <Link href={`/products/${item.productId}`}>
                    <Image 
                      src={item.img} 
                      width={96} 
                      height={96} 
                      className="object-cover rounded hover:opacity-80 transition-opacity" 
                      onError={(e) => {
                        if (e.target.src !== `https://via.placeholder.com/120x120/f0f0f0/999999?text=No+Image`) {
                          e.target.src = `https://via.placeholder.com/120x120/f0f0f0/999999?text=No+Image`
                        }
                      }}
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link href={`/products/${item.productId}`}>
                          <div className="text-sm font-medium hover:text-blue-600 transition-colors">{item.title}</div>
                        </Link>
                        <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                        <div className="text-xs text-gray-600s">{Currency({ v: item.price })}</div>
                        <div className="text-sm text-orange-500 mt-1">
                          Tổng: {Currency({ v: item.price * item.quantity })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <Button 
                            shape="circle" 
                            size="small" 
                            loading={updating[item.id]}
                            disabled={item.quantity <= 1}
                            onClick={() => handleUpdateQty(item.id, item.quantity, -1)} 
                            icon={<MinusOutlined />} 
                          />
                          <div className="px-3 min-w-[40px] text-center">{item.quantity}</div>
                          <Button 
                            shape="circle" 
                            size="small" 
                            loading={updating[item.id]}
                            onClick={() => handleUpdateQty(item.id, item.quantity, 1)} 
                            icon={<PlusOutlined />} 
                          />
                        </div>
                        <Popconfirm
                          title="Xóa sản phẩm?"
                          description="Bạn có chắc chắn muốn xóa sản phẩm này?"
                          onConfirm={() => handleRemoveItem(item.id)}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button 
                            danger 
                            size="small" 
                            icon={<DeleteOutlined />}
                          >
                            Xóa
                          </Button>
                        </Popconfirm>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {relatedProducts && relatedProducts.length > 0 && (
              <div>
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <ShoppingCartOutlined className="text-orange-500" />
                  Sản phẩm gợi ý
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {relatedProducts.slice(0, 8).map((product) => {
                    const imageUrl = product.images?.[0] || null
                    
                    return (
                      <Link key={product.id} href={`/products/${product.id}`}>
                        <Card hoverable bodyStyle={{ padding: 8 }} className="rounded transition-all duration-200 hover:shadow-md">
                          <div className="relative w-full h-36 bg-gray-100 rounded mb-2 overflow-hidden">
                            {imageUrl ? (
                              <>
                                <Image 
                                  src={imageUrl}
                                  alt={product.name}
                                  width={280} 
                                  height={144} 
                                  className="object-cover w-full h-full transition-transform duration-200 hover:scale-105"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.nextSibling.style.display = 'flex'
                                  }}
                                />
                                <div 
                                  className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400" 
                                  style={{ display: 'none' }}
                                >
                                  <ShoppingCartOutlined className="text-2xl mb-1" />
                                  <span className="text-xs">Không có ảnh</span>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400">
                                <ShoppingCartOutlined className="text-2xl mb-1" />
                                <span className="text-xs">Không có ảnh</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500 font-medium">
                              {product.category?.name || 'Sản phẩm'}
                            </div>
                            <div className="text-sm font-medium line-clamp-2 text-gray-800 leading-tight">
                              {product.name}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-sm font-bold text-orange-500">
                                {Currency({ v: product.basePrice })}
                              </div>
                              <div className="text-xs text-green-600 bg-green-50 px-1 py-0.5 rounded">
                                +{Currency({ v: Math.round(product.basePrice * 0.1) })}
                              </div>
                            </div>
                            {/* <div className="text-xs text-gray-500">
                              Hoa hồng: {Math.round(product.basePrice * 0.1 / product.basePrice * 100)}%
                            </div> */}
                          </div>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <div className="relative">
            <Card className="rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Tổng cộng</h3>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <div>Tổng tiền hàng</div>
                <div>{Currency({ v: subtotal })}</div>
              </div>

              <Divider />

              <div className="text-right mb-4">
                <div className="text-xs text-gray-500">Tổng thanh toán</div>
                <div className="text-xl font-bold text-orange-500">{Currency({ v: subtotal })}</div>
              </div>

              <Link href="/checkout">
                <Button type="primary" block className="bg-orange-500 border-orange-500">
                  Đặt hàng ({items.length})
                </Button>
              </Link>
            </Card>
          </div>
        </Col>
      </Row>
      )}
    </main>
  )
}
