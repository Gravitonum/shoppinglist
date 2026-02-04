import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd';
import {
    ShoppingOutlined,
    FileTextOutlined,
    TagsOutlined,
    ShopOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const menuItems = [
        {
            key: '/lists',
            icon: <ShoppingOutlined />,
            label: 'Мои списки',
        },
        {
            key: '/templates',
            icon: <FileTextOutlined />,
            label: 'Шаблоны',
        },
        {
            key: '/categories',
            icon: <TagsOutlined />,
            label: 'Категории',
        },
        {
            key: '/stores',
            icon: <ShopOutlined />,
            label: 'Магазины',
        },
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Профиль',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Выйти',
            onClick: () => {
                logout();
                navigate('/login');
            },
        },
    ];

    const handleMenuClick = (e: { key: string }) => {
        navigate(e.key);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                breakpoint="lg"
                onBreakpoint={(broken) => {
                    if (broken) setCollapsed(true);
                }}
                style={{
                    background: '#fff',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
                }}
            >
                <div style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    fontWeight: 'bold',
                    borderBottom: '1px solid #f0f0f0',
                }}>
                    {collapsed ? '🛒' : '🛒 Списки'}
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{ borderRight: 0 }}
                />
            </Sider>

            <Layout>
                <Header style={{
                    padding: '0 24px',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            style: { fontSize: 18, cursor: 'pointer' },
                            onClick: () => setCollapsed(!collapsed),
                        })}
                    </div>

                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                            <Avatar icon={<UserOutlined />} />
                            <Text>{user?.displayName || user?.email || 'Пользователь'}</Text>
                        </div>
                    </Dropdown>
                </Header>

                <Content style={{
                    margin: '24px',
                    padding: 24,
                    background: '#fff',
                    borderRadius: 8,
                    minHeight: 280,
                }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};
