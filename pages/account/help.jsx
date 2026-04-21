import React from 'react';
import { Card, Typography, Divider, List } from 'antd';
import ProfileLayout from '../../components/ProfileLayout';

const { Title, Paragraph, Text } = Typography;

const helpTopics = [
  {
    title: 'Câu hỏi thường gặp',
    content: [
      'Làm thế nào để đặt hàng?',
      'Tôi có thể hủy đơn hàng như thế nào?',
      'Làm sao để đổi/trả sản phẩm?',
      'Tôi có thể liên hệ hỗ trợ ở đâu?',
    ],
  },
  {
    title: 'Liên hệ hỗ trợ',
    content: [
      'Hotline: 1900 1234',
      'Email: support@os-user.vn',
      'Thời gian làm việc: 8:00 - 22:00 (T2 - CN)',
    ],
  },
  {
    title: 'Hướng dẫn sử dụng',
    content: [
      'Đăng nhập tài khoản để sử dụng đầy đủ tính năng.',
      'Thêm sản phẩm vào giỏ hàng và tiến hành thanh toán.',
      'Theo dõi đơn hàng tại mục "Đơn hàng của tôi".',
    ],
  },
];

export default function HelpPage() {
  return (
    <ProfileLayout selected="/account/help">
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 0 }}>
        <Card bordered>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>Hỗ trợ khách hàng</Title>
          <Paragraph style={{ textAlign: 'center', marginBottom: 32 }}>
            Nếu bạn gặp khó khăn trong quá trình sử dụng, hãy tham khảo các thông tin dưới đây hoặc liên hệ với chúng tôi để được hỗ trợ nhanh nhất.
          </Paragraph>
          <Divider />
          {helpTopics.map((topic, idx) => (
            <div key={idx} style={{ marginBottom: 32 }}>
              <Title level={4}>{topic.title}</Title>
              <List
                size="small"
                dataSource={topic.content}
                renderItem={item => <List.Item><Text>{item}</Text></List.Item>}
              />
            </div>
          ))}
        </Card>
      </div>
    </ProfileLayout>
  );
}
