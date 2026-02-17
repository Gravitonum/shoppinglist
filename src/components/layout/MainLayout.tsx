import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Drawer } from 'antd';
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
    const [isMobile, setIsMobile] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
        if (isMobile) {
            setDrawerVisible(false);
        }
    };

    const SidebarContent = () => (
        <>
            <div style={{
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 'bold',
                borderBottom: '1px solid #f0f0f0',
            }}>
                {(collapsed && !isMobile) ? '🛒' : '🛒 Списки'}
            </div>
            <Menu
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={handleMenuClick}
                style={{ borderRight: 0 }}
            />
        </>
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Desktop Sidebar */}
            {!isMobile && (
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
                    <SidebarContent />
                </Sider>
            )}

            {/* Mobile Drawer */}
            {isMobile && (
                <Drawer
                    placement="left"
                    onClose={() => setDrawerVisible(false)}
                    open={drawerVisible}
                    width={250}
                    styles={{ body: { padding: 0 } }}
                    closeIcon={null}
                >
                    <SidebarContent />
                </Drawer>
            )}

            <Layout>
                <Header style={{
                    padding: isMobile ? '0 16px' : '0 24px',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {isMobile ? (
                            <MenuUnfoldOutlined
                                style={{ fontSize: 18, cursor: 'pointer' }}
                                onClick={() => setDrawerVisible(true)}
                            />
                        ) : (
                            React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                                style: { fontSize: 18, cursor: 'pointer' },
                                onClick: () => setCollapsed(!collapsed),
                            })
                        )}
                    </div>

                    <Dropdown
                        menu={{ items: userMenuItems }}
                        placement="bottomRight"
                        trigger={['click']}
                        getPopupContainer={(trigger) => trigger.parentElement || document.body}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                            <Avatar icon={<UserOutlined />} />
                            {!isMobile && <Text>{user?.displayName || user?.email || 'Пользователь'}</Text>}
                        </div>
                    </Dropdown>
                </Header>

                <Content style={{
                    margin: isMobile ? '12px' : '24px',
                    padding: isMobile ? 16 : 24,
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
