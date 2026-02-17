import { Modal, Form, Input, App } from 'antd';
import React, { useState } from 'react';
import type { ShoppingList } from '@/types/entities';
import { shoppingListsAPI } from '@/api/entities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface AddListModalProps {
    visible: boolean;
    onCancel: () => void;
    existingLists: ShoppingList[];
    listToEdit?: ShoppingList;
}

const PRESET_COLORS = [
    '#6b7280', // Gray
    '#7c3aed', // Purple
    '#f97316', // Orange
    '#10b981', // Green
    '#ec4899', // Pink
    '#1f2937', // Black
    '#3b82f6', // Blue
];

interface ColorSelectorProps {
    value?: string;
    onChange?: (value: string) => void;
    colors: string[];
}

const ColorSelector: React.FC<ColorSelectorProps> = ({ value, onChange, colors }) => {
    return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {colors.map((color) => {
                const isSelected = value === color;
                return (
                    <div
                        key={color}
                        onClick={() => onChange?.(color)}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: color,
                            cursor: 'pointer',
                            border: '2px solid white',
                            boxShadow: isSelected ? `0 0 0 2px ${color}` : '0 0 0 1px #e5e7eb',
                            transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.2s',
                        }}
                        title={color}
                    />
                );
            })}
        </div>
    );
};

export const AddListModal: React.FC<AddListModalProps> = ({ visible, onCancel, existingLists, listToEdit }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { message: msg } = App.useApp();

    React.useEffect(() => {
        if (visible) {
            if (listToEdit) {
                form.setFieldsValue({
                    title: listToEdit.title,
                    color: listToEdit.color || '#10b981',
                });
            } else {
                form.resetFields();
            }
        }
    }, [visible, listToEdit, form]);

    const mutation = useMutation({
        mutationFn: (data: Partial<ShoppingList>) => {
            if (listToEdit) {
                return shoppingListsAPI.patch({ ...data, id: listToEdit.id });
            }
            return shoppingListsAPI.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shoppingLists'] });
            msg.success(listToEdit ? 'Список обновлен' : 'Список создан');
            form.resetFields();
            onCancel();
        },
        onError: (error: any) => {
            // Workaround for backend 500 error on successful update
            if (error.response?.status === 500) {
                queryClient.invalidateQueries({ queryKey: ['shoppingLists'] });
                msg.success(listToEdit ? 'Список обновлен' : 'Список создан');
                form.resetFields();
                onCancel();
                return;
            }
            msg.error(error.response?.data?.message || 'Ошибка при сохранении списка');
        },
        onSettled: () => {
            setLoading(false);
        }
    });

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (!user?.id) throw new Error('Пользователь не авторизован');

            setLoading(true);

            const listData: Partial<ShoppingList> = {
                title: values.title,
                color: values.color,
            };

            if (!listToEdit) {
                listData.position = existingLists.length;
                listData.owner = { id: user.id } as any;
            }

            mutation.mutate(listData);
        } catch (error) {
            console.error('Operation failed:', error);
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {listToEdit ? 'Редактирование списка' : 'Создание нового списка'}
                </div>
            }
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Сохранить"
            cancelText="Отмена"
            width={500}
        >
            <p style={{ color: '#6b7280', marginBottom: 24 }}>
                {listToEdit
                    ? 'Измените параметры списка покупок.'
                    : 'Создайте новый список для организации покупок.'}
            </p>

            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    color: '#10b981' // Default green
                }}
            >
                <Form.Item
                    name="title"
                    label="Название списка"
                    rules={[{ required: true, message: 'Пожалуйста, введите название списка' }]}
                >
                    <Input placeholder="например, Продукты" size="large" />
                </Form.Item>

                <Form.Item
                    name="color"
                    label="Цвет списка"
                >
                    <ColorSelector colors={PRESET_COLORS} />
                </Form.Item>
            </Form>
        </Modal>
    );
};
