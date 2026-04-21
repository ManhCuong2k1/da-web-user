import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Card,
  Button,
  Empty,
  Spin,
  Tag,
  Image,
  Typography,
  Steps,
  Divider,
  Row,
  Col,
  Popconfirm,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useOrders } from '../../hooks/useOrders';

const { Title, Text } = Typography;
const { Step } = Steps;

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

const getStatusStep = (status) => {
  const statusSteps = {
    PENDING: 0,
    CONFIRMED: 1,
    PROCESSING: 2,
    SHIPPED: 3,
    DELIVERED: 4,
    CANCELLED: -1,
    REFUNDED: -1,
  };
  return statusSteps[status] || 0;
};

export default function OrderDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { getOrder, cancelOrder, loading } = useOrders();
  const [order, setOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const fetchOrderDetail = async () => {
    setOrderLoading(true);
    try {
      const orderData = await getOrder(id);
      setOrder(orderData);
    } catch (error) {
      message.error('Không thể tải thông tin đơn hàng');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    const success = await cancelOrder(id);
    if (success) {
      await fetchOrderDetail(); // Refresh order data
    }
  };

  if (orderLoading) {
    return (
      <div
        className="container py-8 flex justify-center items-center"
        style={{ minHeight: '400px' }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-8">
          <div className="text-center py-12">
            <Empty description="Không tìm thấy đơn hàng" />
            <Link href="/orders">
              <Button type="primary" className="mt-4">
                Quay lại danh sách đơn hàng
              </Button>
            </Link>
          </div>
        </div>
    );
  }

  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';
  const currentStep = getStatusStep(order.status);

  return (
    <main className="container py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} type="text">
          Chi tiết đơn hàng #{order.orderCode || order.id}
        </Button>
        {/* <Title level={4} className="mb-0">
          Chi tiết đơn hàng #{order.orderCode || order.id}
        </Title> */}
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* Order Status */}
          <Card className="rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Text className="text-lg font-semibold">Trạng thái đơn hàng</Text>
                <div className="mt-1">
                  <Tag color={getStatusColor(order.status)} className="text-sm">
                    {getStatusText(order.status)}
                  </Tag>
                </div>
              </div>
              {canCancel && (
                <Popconfirm
                  title="Hủy đơn hàng"
                  description="Bạn có chắc chắn muốn hủy đơn hàng này?"
                  onConfirm={handleCancelOrder}
                  okText="Hủy đơn hàng"
                  cancelText="Không"
                  okButtonProps={{ danger: true, loading }}
                >
                  <Button danger>Hủy đơn hàng</Button>
                </Popconfirm>
              )}
            </div>

            {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
              <Steps current={currentStep} size="small">
                <Step title="Chờ xác nhận" />
                <Step title="Đã xác nhận" />
                <Step title="Đang xử lý" />
                <Step title="Đang giao hàng" />
                <Step title="Đã giao hàng" />
              </Steps>
            )}
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card className="rounded-lg mb-6" title="Địa chỉ giao hàng">
              <div className="flex items-start gap-3">
                <EnvironmentOutlined className="text-orange-500 mt-1" />
                <div>
                  <div className="font-medium">{order.shippingAddress.recipientName}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <PhoneOutlined className="text-xs" />
                    {order.shippingAddress.phone}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {order.shippingAddress.address}, {order.shippingAddress.wardName},
                    {order.shippingAddress.districtName}, {order.shippingAddress.provinceName}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Order Items */}
          <Card className="rounded-lg" title="Sản phẩm đặt hàng">
            <div className="space-y-4">
              {order.items &&
                order.items.map((item, index) => {
                  const product = item.product || item;
                  const variant = item.variant;
                  // Ảnh vẫn lấy từ product gốc
                  const imageUrl = product?.imageUrl || (product?.images && product.images.length > 0 ? product.images[0] : null);
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 py-3 border-b last:border-b-0"
                    >
                      <div className="relative w-20 h-20 bg-gray-100 rounded overflow-hidden">
                        {imageUrl ? (
                          <Image
                            src={imageUrl?.url || imageUrl}
                            alt={variant?.name || product?.name || 'Sản phẩm'}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400">
                            <ShoppingCartOutlined className="text-lg" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{variant?.name || product?.name || 'Sản phẩm'}</div>
                        {variant && (
                          <div className="text-sm text-blue-600 mt-1">
                            Phân loại: {variant.options && variant.options.length > 0 ? variant.options.map(opt => `${opt.value}${opt.type ? ' (' + opt.type + ')' : ''}`).join(', ') : variant.sku || 'Mặc định'}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">SKU: {variant?.sku || product?.sku}</div>
                        <div className="text-sm text-gray-500 mt-1">Số lượng: x{item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-orange-500">
                          {Currency({ v: (variant?.price ?? item.price) * item.quantity })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {(variant?.price ?? item.price)}/sp
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {order.notes && (
              <div className="mt-4 pt-4 border-t">
                <Text className="text-sm text-gray-600">
                  <strong>Ghi chú:</strong> {order.notes}
                </Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <div className="sticky top-20">
            {/* Order Summary */}
            <Card className="rounded-lg shadow-sm">
              <Title level={5} className="mb-4">
                Thông tin đơn hàng
              </Title>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-medium">#{order.orderCode || order.id}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày đặt:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức thanh toán:</span>
                  <span>{order.paymentMethod === 'CASH' ? 'COD' : order.paymentMethod}</span>
                </div>

                <Divider className="my-3" />

                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span>
                    {Currency({ v: (order.totalAmount || 0) - (order.shippingFee || 0) })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span>{Currency({ v: order.shippingFee || 0 })}</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giảm giá:</span>
                    <span className="text-red-500">-{Currency({ v: order.discount || 0 })}</span>
                  </div>
                )}

                <Divider className="my-3" />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Tổng cộng:</span>
                  <span className="text-orange-500">{Currency({ v: order.totalAmount || 0 })}</span>
                </div>
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </main>
  );
}
