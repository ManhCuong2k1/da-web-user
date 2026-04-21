import React from 'react';
import Link from 'next/link';
import { Menu, Avatar, Spin } from 'antd';
import {
  UserOutlined,
  BankOutlined,
  ShoppingCartOutlined,
  QuestionCircleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useUser } from '../hooks/useUser';
import { useOrders } from '../hooks/useOrders';

export default function ProfileLayout({ children, selected = '/account' }) {
  const { user, loading } = useUser();
  const { orders, loading: ordersLoading } = useOrders();
  const menuItems = [
    { key: '/account', label: 'Hồ sơ', icon: <UserOutlined /> },
    { key: '/account/orders', label: 'Đơn hàng', icon: <ShoppingCartOutlined /> },
    { key: '/account/addresses', label: 'Sổ địa chỉ', icon: <EnvironmentOutlined /> },
    { key: '/account/help', label: 'Hỗ trợ', icon: <QuestionCircleOutlined /> },
  ];

  const getRoleLabel = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'Quản trị viên';
      case 'shop':
        return 'Cộng tác viên';
      default:
        return 'Khách hàng';
    }
  };

  return (
    <div className="py-8">
      <div className="container grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-3">
          <div className="bg-white rounded-lg p-4 shadow-sm sticky top-6">
            <div className="flex items-center gap-4 mb-4">
              {/* <Avatar size={56} icon={<UserOutlined />} src={user?.avatar} /> */}
              <Avatar size={56} src={user?.avatar || null} alt={user?.name || 'U'}>
                {!user?.avatar && (user?.name ? user.name[0].toUpperCase() : <UserOutlined />)}
              </Avatar>
              <div>
                {loading ? (
                  <Spin size="small" />
                ) : (
                  <>
                    <div className="font-medium">
                      {user?.name || user?.username || 'Chưa đăng nhập'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.role ? `${getRoleLabel(user.role)}` : 'Khách hàng'}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-orange-50 rounded p-2">
                  <div className="text-sm font-medium">
                    {user?.sales?.toLocaleString('vi-VN') || '0 đ'}
                  </div>
                  <div className="text-xs text-gray-500">Doanh số</div>
                </div>
                <div className="bg-orange-50 rounded p-2">
                  <div className="text-sm font-medium">
                    {ordersLoading ? <Spin size="small" /> : `${orders?.length || 0} đơn`}
                  </div>
                  <div className="text-xs text-gray-500">Đơn</div>
                </div>
              </div>
            </div>

            <Menu mode="inline" selectedKeys={[selected]} style={{ border: 'none' }}>
              {menuItems.map((m) => (
                <Menu.Item key={m.key} icon={m.icon}>
                  <Link href={m.key}>{m.label}</Link>
                </Menu.Item>
              ))}
            </Menu>
          </div>
        </aside>

        <section className="col-span-12 md:col-span-9 lg:col-span-9">
          <div className="bg-white rounded-lg p-6 shadow-sm">{children}</div>
        </section>
      </div>
    </div>
  );
}
