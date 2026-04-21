import React, { useState } from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';
import { Carousel, Row, Col, Card, Button, Badge, Spin, Alert, Modal, Input, message } from 'antd';
import { ShoppingCartOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useProducts, useFeaturedProducts, useNewProducts } from '../hooks/useProducts';
import api from '../lib/api';

function ProductCard({ p }) {
  const hasDiscount = p.oldPrice && p.oldPrice !== p.price;
  const stockStatus = p.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng';
  const router = useRouter();

  return (
    <Card hoverable bodyStyle={{ padding: 12 }} className="shadow-sm h-full flex flex-col">
      <Link href={`/products/${p.id}`}>
        <div className="w-full h-44 flex items-center justify-center overflow-hidden mb-3 bg-gray-50 rounded">
          <img
            src={p.img}
            alt={p.name}
            className="object-cover w-full h-full hover:scale-105 transition-transform"
            onError={(e) => {
              e.target.src = `https://picsum.photos/seed/prod${p.id}/400/400`;
            }}
          />
        </div>
      </Link>

      <div className="flex-1 flex flex-col">
        <Link href={`/products/${p.id}`}>
          <div
            className="text-sm font-medium mb-2 hover:text-blue-600 transition-colors line-clamp-2"
            title={p.name}
          >
            {p.name}
          </div>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="text-lg font-semibold text-red-600">{p.price}₫</div>
          {hasDiscount && <div className="text-xs text-gray-400 line-through">{p.oldPrice}₫</div>}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <Button type="primary" size="small" onClick={() => router.push(`/products/${p.id}`)}>
            Mua ngay
          </Button>
          {/* <Button size="small" icon={<ShoppingCartOutlined />} /> */}
        </div>
      </div>
    </Card>
  );
}

function CategorySlider({ items = [] }) {
  const router = useRouter();
  const carouselRef = React.useRef(null);
  const perSlide = 10;
  const slides = [];
  for (let i = 0; i < items.length; i += perSlide) slides.push(items.slice(i, i + perSlide));
  const [selectedId, setSelectedId] = React.useState(items[0]?.id || null);

  return (
    <div className="relative">
      <Button
        onClick={() => carouselRef.current?.prev()}
        aria-label="prev"
        shape="circle"
        size="small"
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white z-10 shadow"
        icon={<LeftOutlined />}
      />

      <Carousel ref={carouselRef} dots={false} draggable slidesToShow={1}>
        {slides.map((page, idx) => (
          <div key={idx}>
            <div className="grid grid-cols-5 gap-4">
              {page.slice(0, 5).map((it) => (
                <div key={it.id} className="flex flex-col items-center text-center p-2">
                  <div
                    onClick={() => {
                      setSelectedId(it.id);
                      router.push(`/products?categoryId=${it.id}`);
                    }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition cursor-pointer ${
                      selectedId === it.id
                        ? 'bg-orange-50 ring-2 ring-orange-200'
                        : 'bg-white border border-transparent hover:border-orange-200'
                    }`}
                  >
                    <img
                      src={it.img}
                      alt={it.name}
                      className="w-16 h-16 object-cover rounded-full"
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-2">{it.name}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-5 gap-4">
              {page.slice(5, 10).map((it) => (
                <div key={it.id} className="flex flex-col items-center text-center p-2">
                  <div
                    onClick={() => setSelectedId(it.id)}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition cursor-pointer ${
                      selectedId === it.id
                        ? 'bg-orange-50 ring-2 ring-orange-200'
                        : 'bg-white border border-transparent hover:border-orange-200'
                    }`}
                  >
                    <img
                      src={it.img}
                      alt={it.name}
                      className="w-16 h-16 object-cover rounded-full"
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-2">{it.name}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Carousel>

      <Button
        onClick={() => carouselRef.current?.next()}
        aria-label="next"
        shape="circle"
        size="small"
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white z-10 shadow"
        icon={<RightOutlined />}
      />
    </div>
  );
}

export async function getServerSideProps() {
  let categories = [];
  try {
    categories = await api.get('/categories');
  } catch (e) {
    categories = [];
  }
  return { props: { categories } };
}

export default function Home({ categories = [] }) {
  const {
    products: featuredProducts,
    loading: featuredLoading,
    error: featuredError,
  } = useFeaturedProducts(4);
  const { products: newProducts, loading: newLoading, error: newError } = useNewProducts(12);

  const [modalOpen, setModalOpen] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegisterAgency = async () => {
    setLoading(true);
    try {
      await api.post('/agency-requests', { note });
      message.success('Gửi yêu cầu thành công!');
      setModalOpen(false);
      setNote('');
    } catch (e) {
      message.error(e?.response?.data?.message || 'Gửi yêu cầu thất bại!');
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="container py-8">
      <section className="mb-8">
        <Carousel autoplay dotPosition="bottom" className="rounded-lg overflow-hidden">
          <div>
            <div className="h-64 md:h-96 bg-gradient-to-r from-orange-400 to-pink-400 flex items-center rounded-lg">
              <div className="container flex flex-col md:flex-row items-center gap-6">
                <div className="md:w-1/2 text-white">
                  <h2 className="text-2xl md:text-4xl font-bold">Khởi đầu công việc mới</h2>
                  <p className="mt-2 text-sm md:text-base">
                    Ưu đãi lớn cho đối tác CTV — bán nhanh, nhận thưởng.
                  </p>
                  <div className="mt-4">
                    {/* <Button type="default" className="mr-2">
                      Tìm hiểu
                    </Button> */}
                    <Button type="default" onClick={() => setModalOpen(true)}>
                      Đăng ký ngay
                    </Button>
                  </div>
                </div>
                <div className="md:w-1/2 text-center">
                  <img
                    src="https://donex.vn/upload/caches/image/2024/z6840063988537_4959104d2e1ebc3b2e5c7f7745e3ffea-588x294.jpg"
                    alt="hero"
                    className="mx-auto rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="h-64 md:h-96 bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center rounded-lg">
              <div className="container flex items-center gap-6">
                <img
                  src="https://donex.vn/upload/cache/image/2024/9148-04-h-1920x684.png"
                  alt="hero2"
                  className="rounded-lg shadow-lg w-1/2 h-[300px] object-cover"
                />
                <div className="text-white">
                  <h2 className="text-2xl md:text-4xl font-bold">Sản phẩm nổi bật</h2>
                  <p className="mt-2">Tuyển chọn sản phẩm bán chạy với giá tốt mỗi ngày.</p>
                </div>
              </div>
            </div>
          </div>
        </Carousel>
      </section>
      <Modal
        title="Đăng ký làm đại lý/CTV"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleRegisterAgency}
        okText="Gửi yêu cầu"
        confirmLoading={loading}
      >
        <div className="mb-2">Bạn muốn trở thành đại lý/CTV? Vui lòng nhập ghi chú (nếu có):</div>
        <Input.TextArea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú (không bắt buộc)"
        />
      </Modal>

      <section className="mb-6">
        <div className="bg-white rounded-lg py-4 shadow-sm">
          <div className="container">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-orange-500">📦</span>
                Danh mục sản phẩm
              </h3>
              {/* <a className="text-sm text-blue-600">Xem thêm</a> */}
            </div>
            <CategorySlider
              items={categories.map((c) => ({ id: c.id, name: c.name, img: c.image }))}
            />
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Sản phẩm nổi bật</h3>
          <Link href="/products" className="text-sm text-blue-600">
            Xem tất cả
          </Link>
        </div>

        {featuredLoading ? (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        ) : featuredError ? (
          <Alert message="Lỗi" description={featuredError} type="error" showIcon className="mb-4" />
        ) : (
          <Row gutter={[16, 16]}>
            {featuredProducts.map((p) => (
              <Col key={p.id} xs={12} sm={8} md={6} lg={6}>
                <ProductCard p={p} />
              </Col>
            ))}
          </Row>
        )}
      </section>

      <section className="mb-8">
        <div className="bg-white rounded-lg overflow-hidden shadow-md">
          <img
            src="https://donex.vn/upload/cache/image/2024/257-05-h-1920x684.png"
            alt="promo"
            className="w-full h-[250px] object-cover object-top"
          />
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Sản phẩm mới</h3>
          <Link href="/products" className="text-sm text-blue-600">
            Xem thêm
          </Link>
        </div>

        {newLoading ? (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        ) : newError ? (
          <Alert message="Lỗi" description={newError} type="error" showIcon className="mb-4" />
        ) : newProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg mb-2">Chưa có sản phẩm nào</div>
            <div className="text-sm">Hãy quay lại sau để xem sản phẩm mới</div>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {newProducts.map((p) => (
              <Col key={p.id} xs={12} sm={8} md={6} lg={6}>
                <ProductCard p={p} />
              </Col>
            ))}
          </Row>
        )}
      </section>

      <section>
        <h4 className="font-semibold mb-3 text-xl">Tin tức & blog</h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded overflow-hidden">
            <img
              src="https://picsum.photos/seed/blog1/600/340"
              alt="blog1"
              className="w-full h-40 object-cover"
            />
            <div className="p-3">
              <h5 className="font-semibold">Mẹo làm đẹp mùa hè</h5>
              <p className="text-xs text-gray-500">Cập nhật xu hướng & mẹo chăm sóc da.</p>
            </div>
          </div>
          <div className="rounded overflow-hidden">
            <img
              src="https://donex.vn/upload/caches/image/2024/z6840063988537_4959104d2e1ebc3b2e5c7f7745e3ffea-588x294.jpg"
              alt="blog2"
              className="w-full h-40 object-cover"
            />
            <div className="p-3">
              <h5 className="font-semibold">Làm thế nào để tăng doanh số</h5>
              <p className="text-xs text-gray-500">Chiến lược bán hàng hiệu quả cho CTV.</p>
            </div>
          </div>
          <div className="rounded overflow-hidden">
            <img
              src="https://donex.vn/upload/cache/image/2024/257-05-h-1920x684.png"
              alt="blog2"
              className="w-full h-40 object-cover"
            />
            <div className="p-3">
              <h5 className="font-semibold">Sẵn sàng đón gió</h5>
              <p className="text-xs text-gray-500">Chiến lược bán hàng.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
