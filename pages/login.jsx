import { useEffect } from 'react';

import { Form, Input, Checkbox, Button, message } from 'antd';
import { useRouter } from 'next/router';
import { authService } from '../services/auth.services';
import { useState } from 'react';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    const { username, password, remember } = values;

    if (!username || !password) {
      message.error('Vui lòng nhập username và mật khẩu');
      return;
    }

    setLoading(true);
    message.loading({ content: 'Đang đăng nhập...', key: 'login' });

    try {
      const res = await authService.login(username, password);
      const token = res?.accessToken || res?.token || (res?.data && res.data.accessToken);
      if (!token) throw new Error('No access token returned');

      try {
        if (remember) localStorage.setItem('accessToken', token);
        else sessionStorage.setItem('accessToken', token);
      } catch (e) {}

      try {
        const me = await authService.me();
        try {
          localStorage.setItem('user', JSON.stringify(me));
        } catch (e) {
          // ignore storage errors
        }
      } catch (e) {
        console.warn('Failed to fetch current user after login', e);
      }

      message.success({ content: 'Đăng nhập thành công', key: 'login' });
      router.push('/');
    } catch (err) {
      console.error(err);
      const info = err?.info?.message || err.message || 'Đăng nhập thất bại';
      message.error({ content: info, key: 'login' });
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
          <img src="/images/login.png" alt="Login illustration" />
        </div>

        <div className="col-span-2">
          <div className="max-w-md mx-auto bg-white/80 p-8 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4 text-center">Đăng nhập</h2>

            <Form
              name="login"
              layout="vertical"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              className="space-y-4"
            >
              <Form.Item
                label="Email"
                name="username"
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

              <div className="flex items-center justify-between">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>

                {/* <a href="#" className="text-sm text-blue-600">
                  Quên mật khẩu?
                </a> */}
              </div>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
                  Đăng nhập
                </Button>
              </Form.Item>

              <p className="text-center text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <a href="/register" className="text-blue-600">
                  Đăng ký
                </a>
              </p>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
