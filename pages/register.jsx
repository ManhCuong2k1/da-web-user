import { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useRouter } from 'next/router';
import { authService } from '../services/auth.services';
import { useState } from 'react';

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    const { email, password, name } = values;
    if (!email || !password || !name) {
      message.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    message.loading({ content: 'Đang đăng ký...', key: 'register' });
    try {
      await authService.register({ email, password, name });
      message.success({ content: 'Đăng ký thành công! Vui lòng đăng nhập.', key: 'register' });
      router.push('/login');
    } catch (err) {
      const info = err?.info?.message || err.message || 'Đăng ký thất bại';
      message.error({ content: info, key: 'register' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      router.replace('/');
    }
  }, [router]);

  return (
    <div
      style={{ padding: 24 }}
      className='bg-[url("/images/bg-login.png")] h-screen bg-cover flex items-center justify-center'
    >
      <div className="grid grid-cols-5 w-[70%] gap-4 mx-auto h-screen items-center">
        <div className="col-span-3">
          <img src="/images/login.png" alt="Register illustration" />
        </div>
        <div className="col-span-2">
          <div className="max-w-md mx-auto bg-white/80 p-8 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4 text-center">Đăng ký tài khoản</h2>
            <Form name="register" layout="vertical" onFinish={onFinish} className="space-y-4">
              <Form.Item
                label="Tên hiển thị"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị' }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: 'Vui lòng nhập email' }]}
              >
                <Input placeholder="you@example.com" />
              </Form.Item>
              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
              >
                <Input.Password placeholder="••••••••" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
                  Đăng ký
                </Button>
              </Form.Item>
              <p className="text-center text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <a href="/login" className="text-blue-600">
                  Đăng nhập
                </a>
              </p>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
