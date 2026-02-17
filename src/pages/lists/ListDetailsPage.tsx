import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Button, Table, Checkbox, Tag, Space, Empty, Modal, Form, Input, InputNumber } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App as AntApp } from 'antd';
import { shoppingListsAPI, itemsAPI } from '@/api/entities';
import type { Item } from '@/types/entities';

const { Title } = Typography;

export const ListDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { message: msg, modal } = AntApp.useApp();
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Fetch list details
    const { data: list, isLoading: listLoading } = useQuery({
        queryKey: ['shoppingList', id],
        queryFn: async () => {
            if (!id) return Promise.reject('No ID');
            const data = await shoppingListsAPI.getById(id);
            console.log('Shopping List Data:', data);
            return data;
        },
        enabled: !!id,
    });

    // Fetch items for this list
    const { data: allItems, isLoading: itemsLoading } = useQuery({
        queryKey: ['items'],
        queryFn: () => itemsAPI.getAll(),
    });

    // Filter items for this specific list
    const items = allItems?.filter((item: Item) => {
        const listRef = item.shoppingList as any;
        return listRef === id || listRef?.id === id;
    }) || [];

    // Toggle item check status
    const toggleMutation = useMutation({
        mutationFn: (item: Item) => {
            return itemsAPI.patch({ id: item.id, isChecked: !item.isChecked });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
        },
        onError: (error: any) => {
            if (error.response?.status === 500) {
                queryClient.invalidateQueries({ queryKey: ['items'] });
                return;
            }
            msg.error('Не удалось обновить статус товара');
        },
    });

    // Reset all items
    const resetMutation = useMutation({
        mutationFn: async (itemsToReset: Item[]) => {
            await Promise.all(itemsToReset.map(item => {
                return itemsAPI.patch({ id: item.id, isChecked: false });
            }));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            msg.success('Все товары сброшены');
        },
        onError: (error: any) => {
            if (error.response?.status === 500) {
                queryClient.invalidateQueries({ queryKey: ['items'] });
                msg.success('Все товары сброшены');
                return;
            }
            msg.error('Не удалось сбросить товары');
        },
    });

    // Delete item
    const deleteMutation = useMutation({
        mutationFn: (id: string) => itemsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            msg.success('Товар удален');
        },
        onError: () => {
            msg.error('Не удалось удалить товар');
        },
    });

    const handleDelete = (id: string) => {
        modal.confirm({
            title: 'Удалить товар?',
            content: 'Это действие необратимо.',
            okText: 'Удалить',
            okType: 'danger',
            cancelText: 'Отмена',
            onOk: () => deleteMutation.mutate(id),
        });
    };

    const handleToggle = (item: Item) => {
        toggleMutation.mutate(item);
    };

    const handleReset = () => {
        const checkedItems = items.filter(item => item.isChecked);
        if (checkedItems.length === 0) return;

        resetMutation.mutate(checkedItems);
    };

    // Calculate progress
    const totalItems = items.length;
    const checkedItemsCount = items.filter(i => i.isChecked).length;
    const progressPercent = totalItems > 0 ? Math.round((checkedItemsCount / totalItems) * 100) : 0;

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingItem, setEditingItem] = React.useState<Item | undefined>(undefined);
    const [form] = Form.useForm();

    const mutation = useMutation({
        mutationFn: (values: any) => {
            if (!id) throw new Error('No ID');
            const payload: any = {
                title: values.title,
                quantity: values.quantity,
                unit: values.unit,
            };

            if (editingItem) {
                return itemsAPI.patch({ ...payload, id: editingItem.id });
            } else {
                return itemsAPI.create({
                    ...payload,
                    shoppingList: { id: id },
                    isChecked: false,
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            msg.success(editingItem ? 'Товар обновлен' : 'Товар добавлен');
            setIsModalOpen(false);
            setEditingItem(undefined);
            form.resetFields();
        },
        onError: (error: any) => {
            if (error.response?.status === 500) {
                queryClient.invalidateQueries({ queryKey: ['items'] });
                msg.success(editingItem ? 'Товар обновлен' : 'Товар добавлен');
                setIsModalOpen(false);
                setEditingItem(undefined);
                form.resetFields();
                return;
            }

            const errorMessage = error.response?.data?.message || 'Ошибка при сохранении товара';
            msg.error(errorMessage);
        },
    });

    const handleAdd = () => {
        setEditingItem(undefined);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (item: Item) => {
        setEditingItem(item);
        form.setFieldsValue({
            title: item.title,
            quantity: item.quantity,
            unit: item.unit,
        });
        setIsModalOpen(true);
    };

    const handleFinish = (values: any) => {
        mutation.mutate(values);
    };

    const columns = [
        {
            title: '',
            dataIndex: 'isChecked',
            key: 'isChecked',
            width: 50,
            render: (checked: boolean, record: Item) => (
                <Checkbox
                    checked={checked}
                    onChange={() => handleToggle(record)}
                    disabled={toggleMutation.isPending}
                />
            ),
        },
        {
            title: 'Название',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: Item) => (
                <span
                    style={{
                        textDecoration: record.isChecked ? 'line-through' : 'none',
                        color: record.isChecked ? '#999' : 'inherit',
                        cursor: 'pointer'
                    }}
                    onClick={() => handleToggle(record)}
                >
                    {text}
                </span>
            ),
        },
        {
            title: 'Количество',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 120,
            render: (qty: number, record: Item) => `${qty || ''} ${record.unit || ''}`.trim(),
        },
        {
            title: 'Категория',
            dataIndex: 'category',
            key: 'category',
            width: 150,
            render: (category: string) => category && <Tag>{category}</Tag>,
        },
        {
            title: 'Магазин',
            dataIndex: 'store',
            key: 'store',
            width: 150,
            render: (store: string) => store && <Tag color="blue">{store}</Tag>,
        },
        {
            title: '',
            key: 'actions',
            width: 80,
            render: (_: any, record: Item) => (
                <Space>
                    <Button
                        type="text"
                        icon={<div style={{ fontSize: '16px' }}>✏️</div>}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<div style={{ fontSize: '16px' }}>🗑️</div>}
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            ),
        },
    ];

    if (listLoading || itemsLoading) {
        return <Card loading />;
    }

    return (
        <div>
            <Space style={{ marginBottom: 24 }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/lists')}
                >
                    Назад
                </Button>
            </Space>

            {/* Progress Bar */}
            {items.length > 0 && (
                <div style={{ marginBottom: 24, padding: '12px 16px', background: 'white', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ fontSize: 24 }}>👍</div>
                    <div style={{ flex: 1, height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                        <div
                            style={{
                                height: '100%',
                                width: `${progressPercent}%`,
                                background: '#7c3aed', // Purple
                                borderRadius: 4,
                                transition: 'width 0.3s ease'
                            }}
                        />
                    </div>
                    <div style={{ fontWeight: 500, color: '#374151' }}>{progressPercent}%</div>
                </div>
            )}

            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                marginBottom: 24,
                gap: isMobile ? 16 : 0
            }}>
                <Title level={2} style={{ margin: 0 }}>
                    {list?.title || 'Список покупок'}
                </Title>
                <Space style={{ justifyContent: isMobile ? 'center' : 'flex-end' }}>
                    <Button
                        onClick={handleReset}
                        loading={resetMutation.isPending}
                        disabled={items.every(i => !i.isChecked)}
                    >
                        Сбросить все
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        {isMobile ? 'Добавить' : 'Добавить товар'}
                    </Button>
                </Space>
            </div>

            {items.length === 0 ? (
                <Empty description="В списке пока нет товаров">
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Добавить первый товар
                    </Button>
                </Empty>
            ) : (
                <Table
                    dataSource={items}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: isMobile ? 'max-content' : undefined }}
                />
            )}

            <Modal
                title={editingItem ? "Редактировать товар" : "Добавить товар"}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingItem(undefined);
                }}
                onOk={() => form.submit()}
                confirmLoading={mutation.isPending}
                okText={editingItem ? "Сохранить" : "Добавить"}
                cancelText="Отмена"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                >
                    <Form.Item
                        name="title"
                        label="Название"
                        rules={[{ required: true, message: 'Введите название товара' }]}
                    >
                        <Input placeholder="Например, Молоко" autoFocus />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item
                            name="quantity"
                            label="Количество"
                            style={{ flex: 1 }}
                        >
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>

                        <Form.Item
                            name="unit"
                            label="Ед. изм."
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="кг, шт, л" />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};
