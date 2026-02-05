import React, { useState } from 'react';
import { Modal, Form, Input } from 'antd';
import type { ShoppingList } from '@/types/entities';
import { shoppingListsAPI, usersAPI } from '@/api/entities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsernameFromToken } from '@/utils/jwt';

interface AddListModalProps {
    visible: boolean;
    onCancel: () => void;
    existingLists: ShoppingList[];
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

export const AddListModal: React.FC<AddListModalProps> = ({ visible, onCancel, existingLists }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    const createMutation = useMutation({
        mutationFn: (data: Partial<ShoppingList>) => shoppingListsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shoppingLists'] });
            form.resetFields();
            onCancel();
        },
        onSettled: () => {
            setLoading(false);
        }
    });

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // 1. Get current username
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No token found');

            const username = getUsernameFromToken(token);
            if (!username) throw new Error('Could not extract username from token');

            // 2. Find User entity
            const allUsers = await usersAPI.getAll();
            const userEntity = allUsers.find((u: any) => u.username === username);

            if (!userEntity) {
                // If user doesn't exist (e.g. old registration), create it now? 
                // Alternatively, error out. For robustness, let's create if missing.
                console.warn('User entity not found, creating one...');
                // ... logic to create user if needed, but for now let's just error
                throw new Error('Пользователь не найден в системе');
            }

            // 3. Format data for API with Owner Reference
            const listData: Partial<ShoppingList> = {
                title: values.title,
                color: typeof values.color === 'string' ? values.color : values.color?.toHexString(),
                position: existingLists.length,
                owner: { id: userEntity.id } // Reference to User entity
            };

            createMutation.mutate(listData);
        } catch (error) {
            console.error('Operation failed:', error);
            setLoading(false);
            // Show error to user via message? Antd Form handles validation errors roughly, but logic errors need manual care
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    Создание нового списка
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
                Создайте новый список для организации покупок.
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
