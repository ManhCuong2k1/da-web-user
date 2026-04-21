import React from 'react';
import ProfileLayout from '../../components/ProfileLayout';
import { Table, Tag, Spin, message } from 'antd';
import { useOrders } from '../../hooks/useOrders';

const columns = [
  {
    title: 'Mã đơn',
    dataIndex: 'code',
    key: 'code',
    render: (text, record) => <a href={`/orders/${record.id}`}>{text || record.id}</a>,
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (text) => new Date(text).toLocaleString(),
  },
  {
    title: 'Tổng tiền',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    render: (value) => value?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status) => <Tag color={status === 'CANCELLED' ? 'red' : status === 'DELIVERED' ? 'green' : 'blue'}>{status}</Tag>,
  },
];

export default function AccountOrders() {
  const { orders, loading, error } = useOrders();

  React.useEffect(() => {
    if (error) message.error('Không thể tải danh sách đơn hàng');
  }, [error]);

  return (
    <ProfileLayout selected={'/account/orders'}>
      <h2 className="text-lg font-semibold mb-4">Đơn hàng của tôi</h2>
      {loading ? <Spin /> : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={orders}
          pagination={{ pageSize: 10 }}
        />
      )}
    </ProfileLayout>
  );
}
