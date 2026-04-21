import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Row,
  Col,
  Card,
  Button,
  Image,
  Tabs,
  Tag,
  Space,
  InputNumber,
  Select,
  Divider,
  Badge,
  Spin,
  Alert,
  message,
} from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useProduct, useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';

const { TabPane } = Tabs;

function RelatedProducts({ categoryId, currentProductId }) {
  const searchParams = React.useMemo(() => {
    if (!categoryId) return null;
    return {
      perPage: 4,
      category: categoryId,
      excludeId: currentProductId,
    };
  }, [categoryId, currentProductId]);

  const { products, loading } = useProducts(searchParams);

  if (!categoryId) {
    return (
      <Card title="Sản phẩm liên quan" className="shadow-sm">
        <div className="text-center py-4 text-gray-500 text-sm">Không có sản phẩm liên quan</div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card title="Sản phẩm liên quan" className="shadow-sm">
        <div className="text-center py-4">
          <Spin size="small" />
        </div>
      </Card>
    );
  }

  return (
    <Card title="Sản phẩm liên quan" className="shadow-sm">
      <Row gutter={[12, 12]}>
        {products.slice(0, 4).map((product) => (
          <Col key={product.id} xs={24}>
            <Link href={`/products/${product.id}`}>
              <Card hoverable size="small" bodyStyle={{ padding: 8 }}>
                <div className="flex items-center gap-3">
                  <img
                    src={
                      product.images?.[0] || `https://picsum.photos/seed/prod${product.id}/80/80`
                    }
                    width={80}
                    height={80}
                    className="object-cover rounded"
                    onError={(e) => {
                      if (
                        e.target.src !==
                        `https://via.placeholder.com/80x80/f0f0f0/999999?text=No+Image`
                      ) {
                        e.target.src = `https://via.placeholder.com/80x80/f0f0f0/999999?text=No+Image`;
                      }
                    }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium line-clamp-2 mb-1">{product.name}</div>
                    <div className="text-xs text-orange-500 font-medium">
                      {product.basePrice.toLocaleString('vi-VN')} ₫
                    </div>
                    <div className="text-xs text-green-600">Còn hàng</div>
                  </div>
                </div>
              </Card>
            </Link>
          </Col>
        ))}
        {products.length === 0 && (
          <Col xs={24}>
            <div className="text-center py-4 text-gray-500 text-sm">
              Không có sản phẩm liên quan
            </div>
          </Col>
        )}
      </Row>
    </Card>
  );
}

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const shouldFetch = id && id !== 'undefined';
  const { product, loading, error } = useProduct(shouldFetch ? id : null);
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] || '');
      setSelectedSize(product.sizes[0] || '');
    }
  }, [product]);

  useEffect(() => {
    if (product?.variantInfo && (selectedColor || selectedSize)) {
      const matchingVariant = product.variantInfo.find((variant) => {
        const colorMatch =
          !selectedColor ||
          variant.options.some((opt) => opt.type === 'Color' && opt.value === selectedColor);
        const sizeMatch =
          !selectedSize ||
          variant.options.some((opt) => opt.type === 'Size' && opt.value === selectedSize);
        return colorMatch && sizeMatch;
      });
      setSelectedVariant(matchingVariant || null);
    }
  }, [selectedColor, selectedSize, product?.variantInfo]);

  const currentPrice = selectedVariant?.price || product?.price || 0;
  const currentStock = selectedVariant?.stock || product?.stockQuantity || 0;
  const isInStock = currentStock > 0;

  const handleAddToCart = async () => {
    if (!product) return;
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      message.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      router.push('/login');
      return;
    }
    setAddingToCart(true);
    try {
      const result = await addToCart(product.id, qty, selectedVariant?.id || null);
      if (result.success) {
        message.success(`Đã thêm ${qty} sản phẩm vào giỏ hàng`);
      } else {
        message.error(result.error || 'Thêm vào giỏ hàng thất bại');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      message.error('Có lỗi xảy ra');
    } finally {
      setAddingToCart(false);
    }
  };

  if (!shouldFetch) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
        <p className="ml-3 text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
        <p className="ml-3 text-gray-500">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-8">
        <Alert
          message="Lỗi tải dữ liệu"
          description={error || 'Không tìm thấy sản phẩm'}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => router.back()}>
              Quay lại
            </Button>
          }
        />
      </div>
    );
  }

  const handleBuyNow = async () => {
    if (!product) return;
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      message.error('Vui lòng đăng nhập để mua hàng');
      router.push('/login');
      return;
    }
    const buyNowItem = {
      productId: product.id,
      variantId: selectedVariant?.id || null,
      qty,
      options: selectedVariant?.options || [],
    };
    sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
    router.push('/checkout?buynow=1');
  };

  const displayImages =
    product.images && product.images.length > 0
      ? product.images
      : [`https://via.placeholder.com/800x800/f0f0f0/999999?text=No+Image`];

  return (
    <main className="container py-8">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/">CTV24</Link> &gt; <Link href="/products">Sản phẩm</Link> &gt;
        <span className="text-black">{product.category?.name || 'Chưa phân loại'}</span> &gt;
        <span className="text-black">{product.name}</span>
      </nav>

      <Row gutter={[24, 24]} className="items-stretch">
        <Col xs={24} lg={14} className="h-full">
          <div className="bg-white rounded-lg p-4 shadow-sm h-full flex flex-col">
            <div className="flex gap-4 flex-1">
              <div className="flex-1 flex flex-col">
                <Image.PreviewGroup>
                  <Image
                    src={displayImages[selectedImageIndex]}
                    alt={product.name}
                    className="w-full rounded-lg object-cover"
                    onError={(e) => {
                      if (
                        e.target.src !==
                        `https://via.placeholder.com/800x800/f0f0f0/999999?text=No+Image`
                      ) {
                        e.target.src = `https://via.placeholder.com/800x800/f0f0f0/999999?text=No+Image`;
                      }
                    }}
                  />
                </Image.PreviewGroup>
                <div className="flex gap-3 mt-3">
                  {displayImages.map((src, i) => (
                    <div
                      key={i}
                      className={`w-20 h-20 rounded overflow-hidden cursor-pointer transition-all ${
                        i === selectedImageIndex
                          ? 'ring-2 ring-orange-200'
                          : 'border border-gray-100'
                      }`}
                      onClick={() => setSelectedImageIndex(i)}
                    >
                      <Image
                        src={src}
                        alt={`thumb-${i}`}
                        preview={false}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          if (
                            e.target.src !==
                            `https://via.placeholder.com/80x80/f0f0f0/999999?text=No+Image`
                          ) {
                            e.target.src = `https://via.placeholder.com/80x80/f0f0f0/999999?text=No+Image`;
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} lg={10} className="h-full">
          <div className="bg-white rounded-lg p-4 shadow-sm h-full flex flex-col justify-between">
            <div>
              <h1 className="text-xl font-semibold mb-2">{product.name}</h1>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-500">
                  Mã sản phẩm: {selectedVariant?.sku || product.id}
                </div>
                <div className="text-sm text-gray-500">
                  Tồn kho: {currentStock}
                  {!isInStock && <Badge status="error" text="Hết hàng" className="ml-2" />}
                </div>
              </div>

              <div className="mb-4">
                <div className="text-2xl font-bold text-orange-500">
                  {currentPrice.toLocaleString('vi-VN')}₫
                </div>
                {selectedVariant && selectedVariant.price !== product.price && (
                  <div className="text-sm text-gray-400 line-through">
                    {product.price.toLocaleString('vi-VN')}₫
                  </div>
                )}
                {product.shop && (
                  <div className="text-sm text-gray-500 mt-1">Cửa hàng: {product.shop.name}</div>
                )}
              </div>

              {product.shortDescription && (
                <div className="mb-4 text-sm text-gray-600">
                  <p>{product.shortDescription}</p>
                </div>
              )}

              {product.colors.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm font-medium mb-2">Màu sắc</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-1 rounded-md border ${
                          selectedColor === c ? 'bg-orange-50 border-orange-300' : 'border-gray-200'
                        } text-sm hover:border-orange-200 transition-colors`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm font-medium mb-2">Kích thước</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`w-10 h-10 flex items-center justify-center rounded-md border ${
                          selectedSize === s ? 'bg-orange-50 border-orange-300' : 'border-gray-200'
                        } font-medium hover:border-orange-200 transition-colors`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4 flex items-center gap-4">
                <div className="text-sm text-gray-600">Số lượng</div>
                <div className="flex items-center gap-2">
                  <Button
                    shape="circle"
                    size="small"
                    disabled={!isInStock}
                    onClick={() => setQty(Math.max(1, qty - 1))}
                  >
                    <MinusOutlined />
                  </Button>
                  <div className="w-12 text-center">{qty}</div>
                  <Button
                    shape="circle"
                    size="small"
                    disabled={!isInStock || qty >= currentStock}
                    onClick={() => setQty(Math.min(currentStock, qty + 1))}
                  >
                    <PlusOutlined />
                  </Button>
                </div>
                {isInStock && <div className="text-xs text-gray-500">Có sẵn: {currentStock}</div>}
              </div>
            </div>

            <div>
              <div className="rounded-lg border-2 border-orange-100 p-4 shadow-md mb-3">
                <div className="flex gap-3">
                  <Button
                    type="default"
                    className="flex-1 border-orange-300"
                    disabled={!isInStock}
                    loading={addingToCart}
                    icon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                  >
                    {isInStock ? 'Thêm vào giỏ' : 'Hết hàng'}
                  </Button>
                  <Button
                    type="primary"
                    className="flex-1 bg-orange-500 border-orange-500"
                    disabled={!isInStock}
                    onClick={handleBuyNow}
                  >
                    {isInStock ? 'Mua ngay' : 'Hết hàng'}
                  </Button>
                </div>
                <div className="mt-3 text-xs text-gray-500 flex items-center gap-4">
                  <span>🔁 Đổi trả trong 7 ngày</span>
                  <span>✅ Hoàn tiền nếu phát hiện hàng giả</span>
                </div>
              </div>

              <Divider />

              <Tabs defaultActiveKey="1">
                <TabPane tab="Thông số kỹ thuật" key="2">
                  <div className="text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Mã sản phẩm:</strong> {product.id}
                      </div>
                      <div>
                        <strong>Danh mục:</strong> {product.category?.name || 'Chưa phân loại'}
                      </div>
                      <div>
                        <strong>Tồn kho:</strong> {currentStock}
                      </div>
                      {product.shop && (
                        <div>
                          <strong>Cửa hàng:</strong> {product.shop.name}
                        </div>
                      )}
                    </div>
                  </div>
                </TabPane>
                <TabPane tab="Đánh giá" key="3">
                  <div className="text-center py-4 text-gray-500">
                    <p>Chưa có đánh giá về sản phẩm.</p>
                  </div>
                </TabPane>
              </Tabs>
            </div>
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="mt-6">
        <Col xs={24} lg={16}>
          <Card className="shadow-sm">
            <Tabs defaultActiveKey="1">
              <TabPane tab="Mô tả chi tiết" key="1">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-3 md:col-span-1">
                    {displayImages.slice(0, 2).map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        className="w-full h-24 object-cover rounded mb-3"
                        onError={(e) => {
                          if (
                            e.target.src !==
                            `https://via.placeholder.com/300x200/f0f0f0/999999?text=No+Image`
                          ) {
                            e.target.src = `https://via.placeholder.com/300x200/f0f0f0/999999?text=No+Image`;
                          }
                        }}
                      />
                    ))}
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <h4 className="font-semibold mb-2">{product.name}</h4>
                    <div className="text-sm text-gray-700 space-y-2">
                      {product.description ? (
                        <p>{product.description}</p>
                      ) : (
                        <p>Sản phẩm chất lượng cao với giá cả hợp lý.</p>
                      )}

                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Thông tin sản phẩm:</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Mã sản phẩm: {product.id}</li>
                          <li>Danh mục: {product.category?.name || 'Chưa phân loại'}</li>
                          <li>Tình trạng: {isInStock ? 'Còn hàng' : 'Hết hàng'}</li>
                          {product.colors.length > 0 && (
                            <li>Màu sắc có sẵn: {product.colors.join(', ')}</li>
                          )}
                          {product.sizes.length > 0 && (
                            <li>Kích thước có sẵn: {product.sizes.join(', ')}</li>
                          )}
                          {selectedVariant && (
                            <li>
                              Biến thể đang chọn: {selectedVariant.sku} (Giá:{' '}
                              {selectedVariant.price.toLocaleString('vi-VN')}₫)
                            </li>
                          )}
                        </ul>
                      </div>

                      {product.variantInfo && product.variantInfo.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium mb-2">Tất cả các mã:</h5>
                          <div className="space-y-2">
                            {product.variantInfo.map((variant) => (
                              <div key={variant.id} className="border rounded p-2 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{variant.sku}</span>
                                  <span className="text-orange-600 font-medium">
                                    {variant.price.toLocaleString('vi-VN')}₫
                                  </span>
                                </div>
                                <div className="text-gray-600 text-xs mt-1">
                                  {variant.options
                                    .map((opt) => `${opt.type}: ${opt.value}`)
                                    .join(', ')}{' '}
                                  | Tồn kho: {variant.stock}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabPane>
              <TabPane tab="Chính sách" key="3">
                <div className="text-sm space-y-3">
                  <div>
                    <h5 className="font-medium mb-2">Chính sách bán hàng:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      <li>🔁 Đổi trả trong 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất</li>
                      <li>✅ Hoàn tiền 100% nếu phát hiện hàng giả</li>
                      <li>🚚 Miễn phí vận chuyển cho đơn hàng trên 500.000₫</li>
                      <li>📞 Hỗ trợ khách hàng 24/7</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Thông tin bảo hành:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Bảo hành chính hãng theo quy định của nhà sản xuất</li>
                      <li>Hỗ trợ sửa chữa và thay thế linh kiện</li>
                      <li>Trung tâm bảo hành toàn quốc</li>
                    </ul>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <div className="space-y-4">
            <RelatedProducts categoryId={product.category?.id} currentProductId={product.id} />

            <Card className="shadow-sm">
              <h4 className="font-semibold mb-2">Thông tin thêm</h4>
              <div className="text-sm text-gray-600">
                Liên hệ bán hàng • Chính sách bảo hành • Hỗ trợ
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </main>
  );
}
