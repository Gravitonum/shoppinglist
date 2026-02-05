import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, App } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/api/entities';

const { Title, Text } = Typography;

export const RegisterPage: React.FC = () => {
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    // v2: Added detailed error logging
    const onFinish = async (values: {
        username: string;
        email: string;
        password: string;
        displayName?: string;
    }) => {
        setLoading(true);
        try {
            await register(values.username, values.password, values.email, values.displayName);

            // Create User entity record
            await usersAPI.create({
                username: values.username,
                email: values.email,
                name: values.displayName
            });

            message.success('Регистрация успешна!');
            navigate('/');
        } catch (error: unknown) {
            console.error('Registration error:', error);
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response: { data: any } };
                console.error('Detailed registration error data:', axiosError.response.data);
            }
            const err = error as { response?: { data?: { message?: string; details?: string; error?: string } } };
            const errorMessage = err.response?.data?.details || err.response?.data?.message || err.response?.data?.error || 'Ошибка регистрации. Попробуйте снова.';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}>
            <Card
                style={{
                    width: 450,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    borderRadius: 16,
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ marginBottom: 8 }}>
                        🛒 Список Покупок
                    </Title>
                    <Text type="secondary">Создайте новый аккаунт</Text>
                </div>

                <Form
                    name="register"
                    onFinish={onFinish}
                    autoComplete="off"
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        rules={[
                            { required: true, message: 'Введите имя пользователя' },
                            { min: 3, message: 'Минимум 3 символа' },
                            {
                                pattern: /^[a-zA-Z][a-zA-Z0-9-]*$/,
                                message: 'Только латинские буквы, цифры и дефис. Должно начинаться с буквы.'
                            }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Имя пользователя"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Введите email' },
                            { type: 'email', message: 'Неверный формат email' },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="Email"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="displayName"
                        rules={[{ required: true, message: 'Введите отображаемое имя' }]}
                    >
                        <Input
                            prefix={<IdcardOutlined />}
                            placeholder="Отображаемое имя"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Введите пароль' },
                            { min: 6, message: 'Минимум 6 символов' },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Пароль"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Подтвердите пароль' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Пароли не совпадают'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Подтвердите пароль"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                            style={{ marginBottom: 16 }}
                        >
                            Зарегистрироваться
                        </Button>
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary">
                                Уже есть аккаунт? <Link to="/login">Войти</Link>
                            </Text>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};
