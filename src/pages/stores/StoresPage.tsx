import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

export const StoresPage: React.FC = () => {
    return (
        <div>
            <Title level={2}>Магазины</Title>
            <Card>
                <p>Управление магазинами (в разработке)</p>
            </Card>
        </div>
    );
};
