import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout, Input, Badge, Dropdown, Avatar, Button, Popover, List } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { theme } from 'antd';
import styles from './Header.module.css';
import { useSelector } from 'react-redux';

export default function Header() {
  const router = useRouter();
  const { token } = theme.useToken();

  const cartStore = useSelector(state => state.cart);
  const cartNumber = cartStore.items?.length || 0;
  const cart = useMemo(() => ({ items: cartStore.items, total: cartStore.total }), [cartStore.items, cartStore.total]);

  const [user, setUser] = useState(null);
  const { Search } = Input;

  useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      setUser(u ? JSON.parse(u) : null);
    } catch (e) {
      setUser(null);
    }
  }, []);

  const cartItems = useMemo(() => cart?.items || [], [cart?.items])

  const handleMenuClick = useCallback(({ key }) => {
    if (key === 'logout') {
      try {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      } catch (e) {}
      router.push('/login');
      return;
    }
    if (key === 'profile') router.push('/account');
    if (key === 'orders') router.push('/orders');
  }, [router]);

  const userMenuItems = user
    ? [
        { key: 'profile', label: 'Profile', icon: <UserOutlined /> },
        { key: 'orders', label: 'Đơn hàng của tôi', icon: <ShoppingCartOutlined /> },
        { type: 'divider' },
        { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined /> },
      ]
    : [{ key: 'login', label: 'Đăng nhập' }];

  return (
    <Layout.Header style={{ background: '#fff', padding: 0 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 160 }}>
          <Link href="/">
            <img src="/logo.png" alt="OS-User" style={{ height: 40, cursor: 'pointer' }} />
          </Link>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Search
            placeholder="Tìm kiếm sản phẩm..."
            size="large"
            onSearch={(q) => {
              router.push(q ? `/products?search=${q}${router.query.categoryId ? `&categoryId=${router.query.categoryId}` : ''}` : '/products');
            }}
            style={{ width: '90%', maxWidth: 900 }}
          />
        </div>

        <div className={styles.headerRight}>
          <Popover
            placement="bottomRight"
            content={
              <div style={{ width: 300 }}>
                {cartItems.length ? (
                  <List
                    dataSource={cartItems.slice(0, 5)}
                    renderItem={(item) => (
                      <List.Item style={{ padding: '8px 0' }}>
                        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                          <img
                            src={item.img}
                            alt={item.title}
                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                            onError={(e) => {
                              if (
                                e.target.src !==
                                `https://via.placeholder.com/40x40/f0f0f0/999999?text=No+Image`
                              ) {
                                e.target.src = `https://via.placeholder.com/40x40/f0f0f0/999999?text=No+Image`;
                              }
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 500,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.title}
                            </div>
                            <div style={{ fontSize: 11, color: '#999' }}>
                              SL: {item.quantity} • {item.price.toLocaleString('vi-VN')}₫
                            </div>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ padding: 12, textAlign: 'center', color: '#999' }}>
                    Giỏ hàng trống
                  </div>
                )}
                {cartItems.length > 5 && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '8px 0',
                      color: '#999',
                      fontSize: 12,
                      borderTop: '1px solid #f0f0f0',
                    }}
                  >
                    và {cartItems.length - 5} sản phẩm khác...
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: 12,
                    borderTop: '1px solid #f0f0f0',
                  }}
                >
                  <Button type="default" onClick={() => router.push('/cart')} size="small">
                    Xem giỏ hàng
                  </Button>
                  {cartItems.length > 0 && (
                    <Button type="primary" onClick={() => router.push('/checkout')} size="small">
                      Thanh toán
                    </Button>
                  )}
                </div>
              </div>
            }
            trigger={['click']}
          >
            <Badge count={cartNumber} size="small" offset={[0, 4]}>
              <ShoppingCartOutlined
                className={styles.icon}
                style={{ fontSize: 20, color: token.colorPrimary }}
              />
            </Badge>
          </Popover>

          {user ? (
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleMenuClick }}
              placement="bottomRight"
            >
              <div className={styles.userDropdown}>
                <Avatar src={user?.avatar || null} alt={user?.name || 'U'}>
                  {!user?.avatar && (user?.name ? user.name[0].toUpperCase() : <UserOutlined />)}
                </Avatar>
              </div>
            </Dropdown>
          ) : (
            <Button type="primary" onClick={() => router.push('/login')}>
              Login
            </Button>
          )}
        </div>
      </div>
    </Layout.Header>
  );
}
