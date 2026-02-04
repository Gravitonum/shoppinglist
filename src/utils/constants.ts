// Application constants

export const UNITS = [
    { value: 'шт', label: 'шт' },
    { value: 'кг', label: 'кг' },
    { value: 'г', label: 'г' },
    { value: 'л', label: 'л' },
    { value: 'мл', label: 'мл' },
    { value: 'уп', label: 'уп' },
] as const;

export const ROLES = [
    { value: 'viewer', label: 'Просмотр' },
    { value: 'editor', label: 'Редактор' },
    { value: 'admin', label: 'Администратор' },
] as const;

export const STORE_TYPES = [
    { value: 'Супермаркет', label: 'Супермаркет' },
    { value: 'Магазин', label: 'Магазин' },
    { value: 'Онлайн', label: 'Онлайн' },
    { value: 'Рынок', label: 'Рынок' },
    { value: 'Аптека', label: 'Аптека' },
] as const;

export const CATEGORY_COLORS = [
    '#1890ff', // blue
    '#52c41a', // green
    '#faad14', // orange
    '#f5222d', // red
    '#722ed1', // purple
    '#13c2c2', // cyan
    '#eb2f96', // magenta
    '#fa8c16', // volcano
] as const;
