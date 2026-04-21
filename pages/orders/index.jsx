import Link from 'next/link';
import { Card, Button, Empty, Spin, Tag, Image, Typography } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { useOrders } from '../../hooks/useOrders';

const { Title, Text } = Typography;

function Currency({ v }) {
  return `${v.toLocaleString('vi-VN')}₫`;
}

const getStatusColor = (status) => {
  const statusColors = {
    PENDING: 'orange',
    CONFIRMED: 'blue',
    PROCESSING: 'cyan',
    SHIPPED: 'purple',
    DELIVERED: 'green',
    CANCELLED: 'red',
    REFUNDED: 'volcano',
  };
  return statusColors[status] || 'default';
};

const getStatusText = (status) => {
  const statusTexts = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    PROCESSING: 'Đang xử lý',
    SHIPPED: 'Đang giao hàng',
    DELIVERED: 'Đã giao hàng',
    CANCELLED: 'Đã hủy',
    REFUNDED: 'Đã hoàn tiền',
  };
  return statusTexts[status] || status;
};

export default function Orders() {
  const { orders, loading, error } = useOrders();

  if (loading) {
    return (
      <main
        className="container py-8 flex justify-center items-center"
        style={{ minHeight: '400px' }}
      >
        <Spin size="large" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-8">
        <Title level={4} className="mb-6">
          Đơn hàng của tôi
        </Title>
        <div className="text-center py-8">
          <Text type="danger">{error}</Text>
        </div>
      </main>
    );
  }

  return (
    <div className="container py-8">
      <Title level={4} className="mb-6">
        Đơn hàng của tôi
      </Title>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="rounded-lg shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Text strong>Đơn hàng #{order.orderCode || order.id}</Text>
                    <Tag color={getStatusColor(order.status)}>{getStatusText(order.status)}</Tag>
                  </div>
                  <Text className="text-sm text-gray-500">
                    Đặt ngày: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </Text>
                </div>
                <Link href={`/orders/${order.id}`}>
                  <Button type="link" icon={<EyeOutlined />}>
                    Xem chi tiết
                  </Button>
                </Link>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="border-t pt-4">
                  <div className="space-y-3">
                    {order.items.slice(0, 3).map((item, index) => {
                      const product = item.product || item;
                      const variant = item.variant;
                      const imageUrl = product?.imageUrl || (product?.images && product.images.length > 0 ? product.images[0] : null);
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
                            {imageUrl ? (
                              <Image
                                src={imageUrl?.url || imageUrl}
                                alt={variant?.name || product?.name || 'Sản phẩm'}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                                <ShoppingCartOutlined className="text-lg" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{variant?.name || product?.name || 'Sản phẩm'}</div>
                            {variant && (
                              <div className="text-xs text-blue-600">
                                Phân loại: {variant.options && variant.options.length > 0 ? variant.options.map(opt => `${opt.value}${opt.type ? ' (' + opt.type + ')' : ''}`).join(', ') : variant.sku || 'Mặc định'}
                              </div>
                            )}
                            <div className="text-xs text-gray-400">SKU: {variant?.sku || product?.sku}</div>
                            <div className="text-xs text-gray-500">Số lượng: x{item.quantity}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-orange-500">
                              {Currency({ v: (variant?.price ?? item.price) * item.quantity })}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {order.items.length > 3 && (
                      <div className="text-center text-sm text-gray-500 py-2">
                        ... và {order.items.length - 3} sản phẩm khác
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Phương thức thanh toán:{' '}
                    {order.paymentMethod === 'CASH'
                      ? 'Thanh toán khi nhận hàng'
                      : order.paymentMethod}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Tổng tiền:</div>
                    <div className="text-lg font-bold text-orange-500">
                      {Currency({ v: order.totalAmount || 0 })}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Empty description="Chưa có đơn hàng nào" image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Link href="/products">
              <Button type="primary" className="bg-orange-500 border-orange-500">
                Mua sắm ngay
              </Button>
            </Link>
          </Empty>
        </div>
      )}
    </div>
  );
}
