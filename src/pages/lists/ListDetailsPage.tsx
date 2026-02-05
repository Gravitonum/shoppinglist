import React from 'react';
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
    const { message: msg } = AntApp.useApp();

    // Fetch list details
    const { data: list, isLoading: listLoading } = useQuery({
        queryKey: ['shoppingList', id],
        queryFn: async () => {
            if (!id) return Promise.reject('No ID');
            const data = await shoppingListsAPI.getById(id);
            console.log('Shopping List Data:', data); // Log the structure
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
        mutationFn: (item: Item) => itemsAPI.patch({ id: item.id, isChecked: !item.isChecked }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
        },
        onError: () => {
            msg.error('Не удалось обновить статус товара');
        },
    });

    // Reset all items
    const resetMutation = useMutation({
        mutationFn: async (itemsToReset: Item[]) => {
            await Promise.all(itemsToReset.map(item =>
                itemsAPI.patch({ id: item.id, isChecked: false })
            ));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            msg.success('Все товары сброшены');
        },
        onError: () => {
            msg.error('Не удалось сбросить товары');
        },
    });

    const handleToggle = (item: Item) => {
        toggleMutation.mutate(item);
    };

    const handleReset = () => {
        const checkedItems = items.filter(item => item.isChecked);
        if (checkedItems.length === 0) return;

        resetMutation.mutate(checkedItems);
    };

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [form] = Form.useForm();

    const createMutation = useMutation({
        mutationFn: (values: any) => {
            if (!id) throw new Error('No ID');
            const payload = {
                title: values.title,
                quantity: values.quantity,
                unit: values.unit,
                shoppingList: { id: id }, // Use new attribute name
                isChecked: false,
            };
            console.log('Creating Item Payload (Minimal):', payload);
            return itemsAPI.create(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            msg.success('Товар добавлен');
            setIsModalOpen(false);
            form.resetFields();
        },
        onError: (error: any) => {
            console.error('Create item error:', error);
            const errorMessage = error.response?.data?.message || 'Не удалось добавить товар';
            const errorDetail = JSON.stringify(error.response?.data || error.message);
            msg.error(`${errorMessage}: ${errorDetail}`);
        },
    });

    const handleAdd = (values: any) => {
        createMutation.mutate(values);
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>
                    {list?.title || 'Список покупок'}
                </Title>
                <Space>
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
                        onClick={() => setIsModalOpen(true)}
                    >
                        Добавить товар
                    </Button>
                </Space>
            </div>

            {items.length === 0 ? (
                <Empty description="В списке пока нет товаров">
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                        Добавить первый товар
                    </Button>
                </Empty>
            ) : (
                <Table
                    dataSource={items}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                />
            )}

            <Modal
                title="Добавить товар"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={createMutation.isPending}
                okText="Добавить"
                cancelText="Отмена"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAdd}
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
