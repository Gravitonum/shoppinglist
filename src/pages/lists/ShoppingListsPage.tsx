import React from 'react';
import { Card, Button, Empty, Space, Typography, Row, Col, Tag, Modal, message } from 'antd';
import {
    PlusOutlined,
    ShoppingOutlined,
    TeamOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shoppingListsAPI } from '@/api/entities';
import type { ShoppingList } from '@/types/entities';
import { AddListModal } from '@/components/lists/AddListModal';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Text } = Typography;

export const ShoppingListsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isCreateModalVisible, setIsCreateModalVisible] = React.useState(false);

    // Fetch shopping lists
    const { data: lists, isLoading } = useQuery({
        queryKey: ['shoppingLists', user?.id],
        queryFn: () => shoppingListsAPI.getAll({ owner: user?.id }),
        enabled: !!user?.id,
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => shoppingListsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shoppingLists'] });
            message.success('Список удален');
        },
        onError: () => {
            message.error('Ошибка при удалении списка');
        },
    });

    const handleDelete = (id: string, title?: string) => {
        Modal.confirm({
            title: 'Удалить список?',
            content: `Вы уверены, что хотите удалить "${title || 'этот список'}"?`,
            okText: 'Удалить',
            okType: 'danger',
            cancelText: 'Отмена',
            onOk: () => deleteMutation.mutate(id),
        });
    };

    const handleCreateList = () => {
        setIsCreateModalVisible(true);
    };

    if (isLoading) {
        return <Card loading={isLoading} />;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>
                    <ShoppingOutlined /> Мои списки покупок
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={handleCreateList}
                >
                    Создать список
                </Button>
            </div>

            {!lists || lists.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="У вас пока нет списков покупок"
                >
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateList}>
                        Создать первый список
                    </Button>
                </Empty>
            ) : (
                <Row gutter={[16, 16]}>
                    {lists.map((list: ShoppingList) => (
                        <Col xs={24} sm={12} lg={8} xl={6} key={list.id}>
                            <Card
                                hoverable
                                onClick={() => navigate(`/lists/${list.id}`)}
                                style={{
                                    borderRadius: 12,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    borderTop: list.color ? `4px solid ${list.color}` : undefined
                                }}
                                actions={[
                                    <EditOutlined
                                        key="edit"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            message.info('Редактирование будет добавлено');
                                        }}
                                    />,
                                    <DeleteOutlined
                                        key="delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(list.id, list.title);
                                        }}
                                    />,
                                ]}
                            >
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Title level={4} style={{ margin: 0 }}>
                                        {list.title || 'Без названия'}
                                    </Title>
                                    {list.isShared && (
                                        <Tag icon={<TeamOutlined />} color="blue">
                                            Общий доступ
                                        </Tag>
                                    )}
                                    <Text type="secondary">
                                        Нажмите для просмотра
                                    </Text>
                                </Space>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            <AddListModal
                visible={isCreateModalVisible}
                onCancel={() => setIsCreateModalVisible(false)}
                existingLists={lists || []}
            />
        </div>
    );
};
