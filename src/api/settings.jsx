export const getSettings = async () => {
    try {
        // Здесь должен быть реальный запрос к API, например:
        // const response = await fetch('/api/settings');
        // const data = await response.json();
        // return data;

        // Для примера возвращаем тестовые данные
        return [
            {
                id: 1,
                server: 'trade-controller',
                variable: 'RISK_MANAGEMENT_TYPE',
                value: '1',
                comment: 'Отключена маржинальная торговля',
            },
            {
                id: 2,
                server: 'trade-controller',
                variable: 'RISK_MANAGEMENT_TYPE',
                value: '1',
                comment: 'Отключена маржинальная торговля',
            },
            {
                id: 3,
                server: 'trade-controller',
                variable: 'RISK_MANAGEMENT_TYPE',
                value: '1',
                comment: 'Отключена маржинальная торговля',
            },
        ];
    } catch (error) {
        throw new Error('Ошибка при загрузке настроек: ' + error.message);
    }
};