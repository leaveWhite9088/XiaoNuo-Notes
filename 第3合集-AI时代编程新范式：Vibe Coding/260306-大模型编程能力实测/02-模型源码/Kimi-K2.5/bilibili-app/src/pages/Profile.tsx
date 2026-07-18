import { useEffect, useState } from 'react';
import { Layout, Card, Avatar, Form, Input, Button, message, Upload, Row, Col, Tag, Divider, List, Empty, Space, Select, DatePicker } from 'antd';
import { EditOutlined, CameraOutlined } from '@ant-design/icons';
import { useUserStore } from '../stores/user';

const { Content } = Layout;
const { Option } = Select;

export const Profile = () => {
  const { isLogin, userInfo } = useUserStore();
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (userInfo) {
      form.setFieldsValue({
        name: userInfo.name,
        sign: userInfo.sign,
      });
    }
  }, [userInfo, form]);

  const handleSave = async () => {
    try {
      await form.validateFields();
      message.success('个人资料更新成功');
      setEditing(false);
    } catch (error) {
      message.error('保存失败');
    }
  };

  if (!isLogin) {
    return (
      <Content style={{ padding: '24px 48px', marginTop: 64, background: '#F1F2F3', minHeight: '100vh' }}>
        <Empty description="请先登录后查看个人资料" style={{ padding: '100px 0' }} />
      </Content>
    );
  }

  const stats = [
    { title: '关注', value: userInfo?.following || 0 },
    { title: '粉丝', value: userInfo?.follower || 0 },
    { title: '获赞', value: 0 },
    { title: '播放', value: 0 },
  ];

  return (
    <Content style={{ padding: '24px 48px', marginTop: 64, background: '#F1F2F3', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Row gutter={24}>
          <Col xs={24} lg={8}>
            <Card style={{ borderRadius: 12, textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                <Avatar src={userInfo?.face} size={120} style={{ border: '4px solid #00AEEC' }} />
                <Upload showUploadList={false} beforeUpload={() => false}>
                  <Button
                    shape="circle"
                    icon={<CameraOutlined />}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      background: '#00AEEC',
                      borderColor: '#00AEEC',
                      color: '#fff',
                    }}
                  />
                </Upload>
              </div>
              
              <h2 style={{ marginBottom: 8 }}>{userInfo?.name}</h2>
              <p style={{ color: '#9499A0', marginBottom: 16 }}>UID: {userInfo?.mid}</p>
              
              <Tag color="blue">LV{userInfo?.level} 会员</Tag>
              
              <Divider />
              
              <Row gutter={16}>
                {stats.map((stat, index) => (
                  <Col span={12} key={index}>
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                      <div style={{ fontSize: 24, fontWeight: 600, color: '#18191C' }}>{stat.value}</div>
                      <div style={{ color: '#9499A0', fontSize: 13 }}>{stat.title}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
          
          <Col xs={24} lg={16}>
            <Card
              title="个人资料"
              extra={
                editing ? (
                  <Space>
                    <Button onClick={() => setEditing(false)}>取消</Button>
                    <Button type="primary" onClick={handleSave} style={{ background: '#00AEEC' }}>保存</Button>
                  </Space>
                ) : (
                  <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>编辑</Button>
                )
              }
              style={{ borderRadius: 12 }}
            >
              <Form form={form} layout="vertical" disabled={!editing}>
                <Form.Item label="昵称" name="name" rules={[{ required: true, message: '请输入昵称' }]}>
                  <Input placeholder="请输入昵称" />
                </Form.Item>
                
                <Form.Item label="个性签名" name="sign">
                  <Input.TextArea rows={4} placeholder="这个人很懒，什么都没有写~" />
                </Form.Item>
                
                <Form.Item label="性别" name="gender">
                  <Select placeholder="请选择性别">
                    <Option value="male">男</Option>
                    <Option value="female">女</Option>
                    <Option value="secret">保密</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item label="生日" name="birthday">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Form>
            </Card>
            
            <Card title="账号安全" style={{ marginTop: 24, borderRadius: 12 }}>
              <List>
                <List.Item>
                  <div>
                    <div style={{ fontWeight: 500 }}>登录密码</div>
                    <div style={{ color: '#9499A0', fontSize: 13 }}>建议定期更换密码以保护账号安全</div>
                  </div>
                  <Button>修改</Button>
                </List.Item>
                
                <List.Item>
                  <div>
                    <div style={{ fontWeight: 500 }}>手机绑定</div>
                    <div style={{ color: '#9499A0', fontSize: 13 }}>已绑定 138****8888</div>
                  </div>
                  <Button>更换</Button>
                </List.Item>
                
                <List.Item>
                  <div>
                    <div style={{ fontWeight: 500 }}>邮箱绑定</div>
                    <div style={{ color: '#9499A0', fontSize: 13 }}>未绑定邮箱</div>
                  </div>
                  <Button type="primary" style={{ background: '#00AEEC' }}>绑定</Button>
                </List.Item>
              </List>
            </Card>
          </Col>
        </Row>
      </div>
    </Content>
  );
};
