import ProfileLayout from '../../components/ProfileLayout';
import { Button, Card, Avatar, Spin, Alert } from 'antd';
import { useUser } from '../../hooks/useUser';

export default function AccountProfile() {
  const { user, loading: userLoading, error: userError } = useUser();

  return (
    <ProfileLayout selected={'/account'}>
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">HỒ SƠ CÁ NHÂN</h3>
          <Card className="mb-4">
            {userLoading ? (
              <Spin />
            ) : userError ? (
              <Alert type="error" message={userError} />
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500">Họ & Tên</div>
                  <div className="font-medium">{user?.name || user?.username || '-'}</div>

                  <div className="mt-4 text-sm text-gray-500">Số điện thoại</div>
                  <div className="font-medium">{user?.phone || '-'}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{user?.email || '-'}</div>

                  <div className="mt-4 text-sm text-gray-500">Trạng thái</div>
                  <div className="text-sm text-orange-500">
                    {user?.status ? 'Đã xác thực' : 'Chưa xác thực'}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </ProfileLayout>
  );
}
