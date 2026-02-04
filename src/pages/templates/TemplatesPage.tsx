import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

export const TemplatesPage: React.FC = () => {
    return (
        <div>
            <Title level={2}>Шаблоны списков</Title>
            <Card>
                <p>Управление шаблонами (в разработке)</p>
            </Card>
        </div>
    );
};
