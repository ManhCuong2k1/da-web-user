import React, { useEffect, useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import Link from 'next/link';
import {
  Row,
  Col,
  Card,
  Button,
  Tag,
  Checkbox,
  Collapse,
  Slider,
  Pagination,
  Select,
  Input,
  Spin,
  Alert,
  message,
} from 'antd';
import { FilterOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import { useRouter } from 'next/router';

function AddToCartButton({ productId, isInStock, size = 'small' }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    router.push('/products/' + productId);
  };

  return (
    <Button
      type="primary"
      size={size}
      loading={loading}
      icon={<ShoppingCartOutlined />}
      onClick={handleAddToCart}
    ></Button>
  );
}

const { Panel } = Collapse;

export default function ProductsList() {
  const { categories, loading: loadingCategories } = useCategories();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchQuery, setSearchQuery] = useState(router.query.search || '');
  const [selectedCategories, setSelectedCategories] = useState(
    router.query.categoryId ? [Number(router.query.categoryId)] : []
  );
  const [priceRange, setPriceRange] = useState([100000, 2000000]);
  const [sortBy, setSortBy] = useState('all');

  let categoriesFilter;
  if (selectedCategories.length > 0) {
    const uniqueCats = Array.from(new Set(selectedCategories.map(Number))).filter(Boolean);
    if (uniqueCats.length > 0) {
      categoriesFilter = uniqueCats.join(',');
    } else {
      categoriesFilter = undefined;
    }
  }

  const { products, loading, error, pagination } = useProducts({
    page,
    perPage: pageSize,
    search: searchQuery,
    ...(categoriesFilter ? { categories: categoriesFilter } : {}),
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    sortBy,
  });

  const onFilter = () => {
    setPage(1);
  };

  const onSearch = (v) => {
    setSearchQuery(v || '');
    setPage(1);
  };

  const onCategoryChange = (categories) => {
    setSelectedCategories(categories);
    setPage(1);
    onFilter();
  };

  const onPriceChange = (range) => {
    setPriceRange(range);
  };

  const onSortChange = (value) => {
    setSortBy(value);
    setPage(1);
  };

  useEffect(() => {
    const query = {};
    setSearchQuery(router.query.search || '');
    setSelectedCategories(
      router.query.categoryId ? [Number(router.query.categoryId)] : []
    );
  }, [router.query]);

  return (
    <main className="container py-8">
      <div className="flex gap-6">
        <aside className="w-72 hidden md:block">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Bộ lọc</h3>
              <Button
                type="text"
                icon={<FilterOutlined />}
                onClick={() => {
                  setPriceRange([100000, 2000000]);
                  setSelectedCategories([]);
                  setSearchQuery('');
                  setPage(1);
                }}
              >
                Thiết lập lại
              </Button>
            </div>

            <Collapse defaultActiveKey={['1', '2', '3']} ghost>
              <Panel header="Danh mục" key="1">
                <Checkbox.Group
                  style={{ display: 'flex', flexDirection: 'column' }}
                  value={selectedCategories}
                  onChange={onCategoryChange}
                >
                  {loadingCategories ? (
                    <span>Đang tải...</span>
                  ) : categories && categories.length > 0 ? (
                    categories.map((cat) => (
                      <Checkbox key={cat.id} value={cat.id} className="py-1">
                        {cat.name}
                      </Checkbox>
                    ))
                  ) : (
                    <span>Không có danh mục</span>
                  )}
                </Checkbox.Group>
              </Panel>
              <Panel header="Khoảng giá" key="3">
                <Slider
                  key={priceRange[0]}
                  range
                  defaultValue={priceRange}
                  min={0}
                  max={5000000}
                  step={50000}
                  onAfterChange={onPriceChange}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{priceRange[0].toLocaleString('vi-VN')}₫</span>
                  <span>{priceRange[1].toLocaleString('vi-VN')}₫</span>
                </div>
              </Panel>
            </Collapse>
          </div>
        </aside>

        <section className="flex-1">
          <div className="mb-4 flex items-center gap-4">
            <Select value={sortBy} style={{ width: 160 }} onChange={onSortChange}>
              <Select.Option value="all">Sắp xếp: Mặc định</Select.Option>
              <Select.Option value="price-asc">Giá: Thấp → Cao</Select.Option>
              <Select.Option value="price-desc">Giá: Cao → Thấp</Select.Option>
              <Select.Option value="newest">Mới nhất</Select.Option>
              <Select.Option value="oldest">Cũ nhất</Select.Option>
            </Select>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
                <p className="mt-2 text-gray-500">Đang tải sản phẩm...</p>
              </div>
            ) : error ? (
              <Alert
                message="Lỗi tải dữ liệu"
                description="Không thể tải danh sách sản phẩm. Vui lòng thử lại sau."
                type="error"
                showIcon
                className="mb-4"
              />
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
              </div>
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  {products.map((product) => {
                    const price = product.basePrice || 0;
                    const imageUrl =
                      product.images && product.images.length > 0
                        ? product.images[0]
                        : `https://via.placeholder.com/400x300/f0f0f0/999999?text=No+Image`;
                    const isInStock = product.stockQuantity > 0;

                    return (
                      <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                          hoverable
                          cover={
                            <Link href={`/products/${product.id}`}>
                              <img
                                src={imageUrl}
                                alt={product.name}
                                className="object-cover w-full h-40"
                                onError={(e) => {
                                  if (
                                    e.target.src !==
                                    `https://via.placeholder.com/400x300/f0f0f0/999999?text=No+Image`
                                  ) {
                                    e.target.src = `https://via.placeholder.com/400x300/f0f0f0/999999?text=No+Image`;
                                  }
                                }}
                              />
                            </Link>
                          }
                          bodyStyle={{ padding: 12 }}
                        >
                          <div className="mb-2">
                            <Link href={`/products/${product.id}`}>
                              <h4 className="text-sm font-semibold truncate hover:text-blue-600">
                                {product.name}
                              </h4>
                            </Link>
                            <div className="text-xs text-gray-500">
                              {product.category?.name || 'Chưa phân loại'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Kho: {product.stockQuantity || 0}
                            </div>
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="text-lg font-bold text-orange-500">
                                {price.toLocaleString('vi-VN')}₫
                              </div>
                              {product.shop && (
                                <div className="text-xs text-gray-400">{product.shop.name}</div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <AddToCartButton
                                productId={product.id}
                                isInStock={isInStock}
                                size="small"
                              />
                            </div>
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>

                {pagination && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">
                      Hiển thị{' '}
                      {pagination.total < pagination.perPage
                        ? pagination.total
                        : pagination.perPage}{' '}
                      / {pagination.total} sản phẩm
                    </div>
                    <Pagination
                      current={pagination.currentPage}
                      pageSize={pagination.perPage}
                      total={pagination.totalItems}
                      onChange={(p, ps) => {
                        setPage(p);
                        if (ps !== pageSize) setPageSize(ps);
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
