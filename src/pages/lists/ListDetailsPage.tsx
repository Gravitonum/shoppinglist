import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Button, Table, Checkbox, Tag, Space, Empty, message } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shoppingListsAPI, itemsAPI } from '@/api/entities';
import type { Item } from '@/types/entities';

const { Title } = Typography;

export const ListDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Fetch list details
    const { data: list, isLoading: listLoading } = useQuery({
        queryKey: ['shoppingList', id],
        queryFn: () => id ? shoppingListsAPI.getById(id) : Promise.reject('No ID'),
        enabled: !!id,
    });

    // Fetch items for this list
    const { data: allItems, isLoading: itemsLoading } = useQuery({
        queryKey: ['items'],
        queryFn: () => itemsAPI.getAll(),
    });

    // Filter items for this specific list
    const items = allItems?.filter((item: Item) => item.list === id) || [];

    const columns = [
        {
            title: '',
            dataIndex: 'isChecked',
            key: 'isChecked',
            width: 50,
            render: (checked: boolean) => (
                <Checkbox
                    checked={checked}
                    onChange={() => message.info('Функция будет добавлена')}
                />
            ),
        },
        {
            title: 'Название',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: Item) => (
                <span style={{ textDecoration: record.isChecked ? 'line-through' : 'none' }}>
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
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => message.info('Добавление товара будет реализовано')}
                >
                    Добавить товар
                </Button>
            </div>

            {items.length === 0 ? (
                <Empty description="В списке пока нет товаров">
                    <Button type="primary" icon={<PlusOutlined />}>
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
        </div>
    );
};
