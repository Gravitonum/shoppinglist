import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

export const CategoriesPage: React.FC = () => {
    return (
        <div>
            <Title level={2}>Категории</Title>
            <Card>
                <p>Управление категориями товаров (в разработке)</p>
            </Card>
        </div>
    );
};
