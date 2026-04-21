import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import Link from 'next/link';
import {
  Row,
  Col,
  Card,
  Button,
  Image,
  Input,
  Radio,
  Divider,
  Checkbox,
  Select,
  Typography,
  Modal,
  Spin,
  Empty,
  message,
} from 'antd';
import { EditOutlined, PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useCart } from '../hooks/useCart';
import { useAddresses } from '../hooks/useAddresses';
import { useCheckout } from '../hooks/useCheckout';
import { useRouter } from 'next/router';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

function Currency({ v }) {
  return `${v.toLocaleString('vi-VN')}₫`;
}

export default function Checkout() {
  const router = useRouter();
  const { cart, loading: cartLoading, clearCart } = useCart();
  const [cartItems, setCartItems] = useState([]);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const { addresses, loading: addressesLoading } = useAddresses();
  const { checkout, loading: checkoutLoading, buyNow } = useCheckout();

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useXu, setUseXu] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('fast');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);

  const [hasLoadedCart, setHasLoadedCart] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('buynow') === '1') {
      const buyNowItem = JSON.parse(sessionStorage.getItem('buyNowItem') || 'null');
      if (buyNowItem) {
        setIsBuyNow(true);
        api
          .get(`/products/${buyNowItem.productId}`)
          .then((product) => {
            let variant = null;
            if (buyNowItem.variantId && product.variants) {
              variant = product.variants.find((v) => v.id === buyNowItem.variantId);
            }
            setCartItems([
              {
                productId: product.id,
                id: buyNowItem.variantId || product.id,
                title: product.name,
                img: product.images?.[0]?.url || '',
                price: variant?.price || product.price,
                quantity: buyNowItem.qty,
                variant: variant
                  ? buyNowItem.options.map((opt) => `${opt.type}: ${opt.value}`).join(', ')
                  : '',
              },
            ]);
          })
          .catch(() => {
            setCartItems([]);
          });
      }
    } else {
      setCartItems(cart?.items || []);
    }
  }, [cart, cartLoading]);

  useEffect(() => {
    if (!cartLoading) {
      setHasLoadedCart(true);
    }
  }, [cartLoading]);

  // useEffect(() => {
  //   if (!isBuyNow && hasLoadedCart && !cartLoading && (!cartItems || cartItems.length === 0)) {
  //     router.push('/cart');
  //   }
  // }, [cartItems, cartLoading, hasLoadedCart, router, isBuyNow]);

  // Set default address
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addresses, selectedAddressId]);

  if (cartLoading || addressesLoading || !hasLoadedCart) {
    return (
      <main
        className="container py-8 flex justify-center items-center"
        style={{ minHeight: '400px' }}
      >
        <Spin size="large" />
      </main>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <main className="container py-8">
        <Empty description="Giỏ hàng trống" />
      </main>
    );
  }

  const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);

  const itemsTotal = cartItems.reduce((sum, item) => {
    const price = item.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const shippingTotal = 30000;
  const discount = 30000;
  const xuDiscount = useXu ? Math.min(5000, itemsTotal * 0.1) : 0;
  const grandTotal = itemsTotal + shippingTotal - discount - xuDiscount;

  const totalCommission = cartItems.reduce((sum, item) => {
    const commissionRate = 0.05;
    return sum + item.price * item.quantity * commissionRate;
  }, 0);

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      message.error('Vui lòng chọn địa chỉ giao hàng');
      return;
    }
    if (isBuyNow && cartItems.length === 1) {
      const item = cartItems[0];
      const { productId, quantity, variantId } = {
        productId: item.productId,
        quantity: item.quantity,
        variantId: item.id !== item.productId ? item.id : null,
      };
      await buyNow(productId, quantity, selectedAddressId, paymentMethod, variantId);
      await clearCart();
      return;
    }
    const success = await checkout({
      addressId: selectedAddressId,
      paymentMethod: paymentMethod,
      notes: notes,
    });
    if (success) {
      await clearCart();
    }
  };

  return (
    <main className="container py-8">
      <Title level={4} className="mb-6">
        Đặt hàng
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* Address */}
          <Card className="rounded-lg mb-6" bodyStyle={{ padding: 16 }}>
            {selectedAddress ? (
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-orange-500 font-medium">{selectedAddress.recipient}</div>
                  <div className="text-sm text-gray-600">{selectedAddress.phone}</div>
                  <div className="text-sm text-gray-600 mt-2">
                    {selectedAddress.address}
                    {selectedAddress.ward?.name && `, ${selectedAddress.ward.name}`}
                    {selectedAddress.district?.name && `, ${selectedAddress.district.name}`}
                    {selectedAddress.province?.name && `, ${selectedAddress.province.name}`}
                  </div>
                  {selectedAddress.isDefault && (
                    <div className="mt-3">
                      <Button size="small">Địa chỉ mặc định</Button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => setShowAddressModal(true)}
                  >
                    Thay đổi
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Empty
                  description="Chưa có địa chỉ giao hàng"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setShowAddressModal(true)}
                >
                  Thêm địa chỉ
                </Button>
              </div>
            )}
          </Card>

          <Card className="rounded-lg mb-6" title="Sản phẩm đặt hàng">
            <div className="space-y-4">
              {cartItems.map((item) => {
                const price = item.price || 0;
                const imageUrl = item.img;

                return (
                  <div
                    key={`${item.productId}-${item.id || 'default'}`}
                    className="flex items-center gap-4 py-3 border-b last:border-b-0"
                  >
                    <div className="relative w-20 h-20 bg-gray-100 rounded overflow-hidden">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.title || 'Sản phẩm'}
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
                      <div className="font-medium text-sm">{item.title || 'Sản phẩm'}</div>
                      {item.variant && (
                        <div className="text-xs text-gray-500 mt-1">Phân loại: {item.variant}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">Số lượng: x{item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-orange-500">
                        {Currency({ v: price * item.quantity })}
                      </div>
                      <div className="text-xs text-gray-500">{Currency({ v: price })}/sp</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="rounded-lg mt-6" title="Phương thức giao hàng & thanh toán">
            <div className="mb-4">
              <div className="font-medium mb-2">Phương thức vận chuyển</div>
              <Radio.Group
                onChange={(e) => setShippingMethod(e.target.value)}
                value={shippingMethod}
                className="w-full"
              >
                <Radio value="fast" className="flex items-center p-3 w-full border rounded">
                  <div className="flex-1">
                    <div>Giao hàng tiết kiệm - Nhanh</div>
                    <div className="text-xs text-gray-500">Dự kiến 3-5 ngày</div>
                  </div>
                  <div className="text-orange-500 font-medium">
                    {Currency({ v: shippingTotal })}
                  </div>
                </Radio>
              </Radio.Group>
            </div>

            <div>
              <div className="font-medium mb-2">Phương thức thanh toán</div>
              <Radio.Group
                onChange={(e) => setPaymentMethod(e.target.value)}
                value={paymentMethod}
                className="w-full"
              >
                <Radio value="CASH" className="flex items-center p-3 w-full border rounded mb-2">
                  <div className="flex-1">
                    <div>COD (Thanh toán khi nhận hàng)</div>
                    <div className="text-xs text-gray-500">
                      Thanh toán bằng tiền mặt khi nhận hàng
                    </div>
                  </div>
                </Radio>
              </Radio.Group>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Tổng tiền hàng</div>
                <div className="font-medium">{Currency({ v: itemsTotal })}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Tổng phí vận chuyển</div>
                <div className="font-medium">{Currency({ v: shippingTotal })}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-sm text-gray-500">Giảm giá phí vận chuyển</div>
              <div className="text-sm text-red-500">- {Currency({ v: discount })}</div>
            </div>

            <div className="mt-4">
              <div className="text-right text-lg font-semibold">
                Tổng thanh toán{' '}
                <span className="text-orange-500">{Currency({ v: grandTotal })}</span>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <div className="sticky top-20">
            <Card className="rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm text-gray-500">Miễn phí vận chuyển</div>
                <div className=" text-gray-500">-30.000₫</div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500">Tổng thanh toán:</div>
                <div className="text-xl font-bold text-orange-500">
                  {Currency({ v: grandTotal })}
                </div>
              </div>
              
              <Button
                type="primary"
                block
                className="bg-orange-500 border-orange-500"
                loading={checkoutLoading}
                disabled={!selectedAddressId || cartItems.length === 0}
                onClick={handleCheckout}
              >
                {checkoutLoading ? 'Đang xử lý...' : 'Đặt hàng'}
              </Button>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Address Selection Modal */}
      <Modal
        title="Chọn địa chỉ giao hàng"
        open={showAddressModal}
        onCancel={() => setShowAddressModal(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={`cursor-pointer transition-colors ${
                selectedAddressId === address.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'hover:border-gray-400'
              }`}
              bodyStyle={{ padding: 16 }}
              onClick={() => {
                setSelectedAddressId(address.id);
                setShowAddressModal(false);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{address.recipient}</span>
                    {address.isDefault && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{address.phone}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {address.address}
                    {address.ward?.name && `, ${address.ward.name}`}
                    {address.district?.name && `, ${address.district.name}`}
                    {address.province?.name && `, ${address.province.name}`}
                  </div>
                </div>
                {selectedAddressId === address.id && (
                  <div className="text-orange-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </Card>
          ))}

          {addresses.length === 0 && (
            <Empty description="Chưa có địa chỉ nào" image={Empty.PRESENTED_IMAGE_SIMPLE}>
              <Button type="primary" onClick={() => router.push('/account/addresses')}>
                Thêm địa chỉ mới
              </Button>
            </Empty>
          )}
        </div>

        <div className="mt-4 pt-4 border-t text-center">
          <Button type="link" onClick={() => router.push('/account/addresses')}>
            Quản lý địa chỉ
          </Button>
        </div>
      </Modal>
    </main>
  );
}

const discount = 5000;
