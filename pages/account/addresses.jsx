import React, { useState, useEffect } from 'react';
import ProfileLayout from '../../components/ProfileLayout';
import {
  Card,
  Button,
  Input,
  Space,
  Tooltip,
  Modal,
  Form,
  Checkbox,
  Select,
  message,
  Spin,
  Empty,
  Popconfirm,
} from 'antd';
import { EditOutlined, DeleteOutlined, EnvironmentOutlined, PlusOutlined } from '@ant-design/icons';
import { useAddresses } from '../../hooks/useAddresses';
import { useLocations } from '../../hooks/useLocations';

export default function AddressesPage() {
  const { addresses, loading, addAddress, updateAddress, deleteAddress, fetchAddresses } =
    useAddresses();
  const { loading: locationsLoading, getProvinces, getDistricts, getWards } = useLocations();
  const [q, setQ] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      const data = await getProvinces();
      setProvinces(data || []);

      if (!data || data.length === 0) {
        message.warning('Không có dữ liệu tỉnh/thành phố');
      }
    } catch (error) {
      message.error('Không thể tải danh sách tỉnh/thành phố');
    }
  };

  const loadDistricts = async (provinceId) => {
    try {
      const data = await getDistricts(provinceId);
      setDistricts(data || []);
    } catch (error) {
      message.error('Không thể tải danh sách quận/huyện');
    }
  };

  const loadWards = async (districtId) => {
    try {
      const data = await getWards(districtId);
      setWards(data || []);
    } catch (error) {
      console.error('Error loading wards:', error);
      message.error('Không thể tải danh sách phường/xã');
    }
  };

  const handleProvinceChange = (provinceId) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict(null);
    setDistricts([]);
    setWards([]);
    form.setFieldsValue({ district: undefined, ward: undefined });
    loadDistricts(provinceId);
  };

  const handleDistrictChange = (districtId) => {
    setSelectedDistrict(districtId);
    setWards([]);
    form.setFieldsValue({ ward: undefined });
    loadWards(districtId);
  };

  async function setDefault(id) {
    const address = addresses.find((a) => a.id === id);
    if (address) {
      const success = await updateAddress(id, { ...address, isDefault: true });
      if (success) {
        fetchAddresses();
      }
    }
  }

  async function removeAddress(id) {
    const success = await deleteAddress(id);
    if (success) {
      message.success('Xóa địa chỉ thành công');
    }
  }

  async function openAdd() {
    setEditing(null);
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setWards([]);
    form.resetFields();

    if (provinces.length === 0) {
      await loadProvinces();
    }

    setModalVisible(true);
  }

  async function openEdit(address) {
    setEditing(address);

    if (provinces.length === 0) {
      await loadProvinces();
    }

    if (address.province) {
      setSelectedProvince(address.province.id);
      const districtsData = await getDistricts(address.province.id);
      setDistricts(districtsData);
      if (address.district) {
        setSelectedDistrict(address.district.id);
        const wardsData = await getWards(address.district.id);
        setWards(wardsData);
        form.setFieldsValue({
          recipientName: address.recipient,
          recipientPhone: address.phone,
          province: address.province.id,
          district: address.district.id,
          ward: address.ward?.id,
          street: address.address,
          isDefault: address.isDefault,
        });
      }
    } else {
      form.setFieldsValue({
        recipientName: address.recipient,
        recipientPhone: address.phone,
        street: address.address,
        isDefault: address.isDefault,
      });
    }

    setModalVisible(true);
  }

  function handleCancel() {
    setModalVisible(false);
    setEditing(null);
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setWards([]);
    form.resetFields();
  }

  async function onFinish(values) {
    try {
      setSubmitLoading(true);

      const addressData = {
        recipient: values.recipientName,
        phone: values.recipientPhone,
        provinceId: values.province,
        districtId: values.district,
        wardId: values.ward,
        address: values.street,
        isDefault: values.isDefault || false,
      };
      let success = false;
      if (editing) {
        success = await updateAddress(editing.id, addressData);
      } else {
        success = await addAddress(addressData);
      }

      if (success) {
        handleCancel();
      }
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setSubmitLoading(false);
    }
  }

  const filtered = addresses.filter((a) =>
    `${a.recipient} ${a.phone} ${a.address} ${a.ward?.name || ''} ${a.district?.name || ''} ${
      a.province?.name || ''
    }`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  if (loading && addresses.length === 0) {
    return (
      <ProfileLayout selected={'/account/addresses'}>
        <div className="flex justify-center items-center" style={{ minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout selected={'/account/addresses'}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Sổ địa chỉ</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          Thêm địa chỉ mới
        </Button>
      </div>

      <div className="mb-4">
        <Input.Search placeholder="Tìm kiếm" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Empty
              description={q ? 'Không tìm thấy địa chỉ nào' : 'Chưa có địa chỉ nào'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              {!q && (
                <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
                  Thêm địa chỉ đầu tiên
                </Button>
              )}
            </Empty>
          </div>
        ) : (
          filtered.map((address) => (
            <Card
              key={address.id}
              bodyStyle={{ padding: 16 }}
              className={`${address.isDefault ? 'bg-orange-50 border-orange-200' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-orange-600">{address.recipient}</span>
                    {address.isDefault && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="inline-flex items-center gap-1">
                      <span>📞</span>
                      {address.phone}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="inline-flex items-start gap-1">
                      <EnvironmentOutlined className="mt-0.5 text-gray-400" />
                      <span>
                        {address.address}
                        {address.ward?.name && `, ${address.ward.name}`}
                        {address.district?.name && `, ${address.district.name}`}
                        {address.province?.name && `, ${address.province.name}`}
                      </span>
                    </span>
                  </div>
                  {!address.isDefault && (
                    <div>
                      <Button size="small" onClick={() => setDefault(address.id)}>
                        Đặt làm mặc định
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Tooltip title="Chỉnh sửa">
                    <Button icon={<EditOutlined />} onClick={() => openEdit(address)} />
                  </Tooltip>
                  <Popconfirm
                    title="Xóa địa chỉ"
                    description="Bạn có chắc chắn muốn xóa địa chỉ này?"
                    onConfirm={() => removeAddress(address.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                  >
                    <Tooltip title="Xóa">
                      <Button danger icon={<DeleteOutlined />} />
                    </Tooltip>
                  </Popconfirm>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        title={editing ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
        open={modalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText={editing ? 'Lưu thay đổi' : 'Thêm địa chỉ mới'}
        confirmLoading={submitLoading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ isDefault: false }}
        >
          <Form.Item
            name="recipientName"
            label="Tên người nhận"
            rules={[{ required: true, message: 'Vui lòng nhập tên người nhận' }]}
          >
            <Input placeholder="VD: Nguyễn Văn Anh" />
          </Form.Item>

          <Form.Item
            name="recipientPhone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input placeholder="VD: 0123456789" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-2">
            <Form.Item
              name="province"
              label="Tỉnh/Thành phố"
              className="m-0"
              rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
            >
              <Select
                placeholder={provinces.length === 0 ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}
                loading={locationsLoading || provinces.length === 0}
                onChange={handleProvinceChange}
                showSearch
                filterOption={(input, option) =>
                  (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
                notFoundContent={provinces.length === 0 ? 'Đang tải dữ liệu...' : 'Không tìm thấy'}
              >
                {provinces.map((province) => (
                  <Select.Option key={province.id} value={province.id}>
                    {province.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="district"
              label="Quận/Huyện"
              className="m-0"
              rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
            >
              <Select
                placeholder="Chọn quận/huyện"
                loading={locationsLoading}
                onChange={handleDistrictChange}
                disabled={!selectedProvince}
                showSearch
                filterOption={(input, option) =>
                  (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {districts.map((district) => (
                  <Select.Option key={district.id} value={district.id}>
                    {district.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="ward"
            label="Phường/Xã"
            rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
          >
            <Select
              placeholder="Chọn phường/xã"
              loading={locationsLoading}
              disabled={!selectedDistrict}
              showSearch
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {wards.map((ward) => (
                <Select.Option key={ward.id} value={ward.id}>
                  {ward.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="street"
            label="Địa chỉ chi tiết"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
          >
            <Input placeholder="VD: Số 01, Ngõ 123, Đường Dương Đình Nghệ" />
          </Form.Item>

          <Form.Item name="isDefault" valuePropName="checked">
            <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </ProfileLayout>
  );
}
