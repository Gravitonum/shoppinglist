import { Modal, Form, Input } from 'antd';
import React, { useState } from 'react';
import type { ShoppingList } from '@/types/entities';
import { shoppingListsAPI } from '@/api/entities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

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
    const { user } = useAuth();

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
            if (!user?.id) throw new Error('Пользователь не авторизован');

            setLoading(true);

            // 3. Format data for API with Owner Reference
            const listData: Partial<ShoppingList> = {
                title: values.title,
                color: typeof values.color === 'string' ? values.color : values.color?.toHexString(),
                position: existingLists.length,
                owner: { id: user.id } as any // Pass as object reference, not string
            };

            createMutation.mutate(listData);
        } catch (error) {
            console.error('Operation failed:', error);
            setLoading(false);
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
