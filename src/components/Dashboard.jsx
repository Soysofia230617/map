import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import {
    FiCheck, FiArrowUp, FiPlus, FiPercent,
    FiChevronDown, FiTrendingUp, FiTrendingDown,
    FiUser, FiSettings, FiUsers, FiDatabase, FiBell,
    FiFilter, FiSearch, FiMoreHorizontal
} from 'react-icons/fi';
import { getStats } from '../api/stats';
import { getTransactions } from '../api/transactions';
import { getBalance } from '../api/balance';
import { getTableTransactions } from '../api/tableTransactions';
import { getSettings } from '../api/settings';
import '../styles/Dashboard.css';

// Опции графиков
const lineChartOptions = {
    chart: {
        height: 350,
        type: 'line',
        zoom: { enabled: false },
        toolbar: { show: true, tools: { download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false } },
        foreColor: '#333',
        animations: { enabled: false }
    },
    stroke: {
        curve: 'smooth',
        width: 3,
        colors: ['#6b3fa0', '#4fc3f7', '#0288d1', '#b0bec5']
    },
    markers: {
        size: 5, // Включаем маркеры
        strokeWidth: 0,
        hover: { size: 7 }
    },
    xaxis: {
        categories: [],
        axisBorder: { show: false },
    },
    yaxis: {
        labels: {
            formatter: (value) => `${formatMoney(value)} ₽`,
            style: { fontSize: '12px' }
        },
    },
    tooltip: {
        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
            const date = w.globals.categoryLabels[dataPointIndex];
            const value = series[seriesIndex][dataPointIndex];
            const seriesName = w.globals.seriesNames[seriesIndex];
            return `
                <div class="tooltip-custom">
                    <span>${date}</span><br/>
                    <span>${formatMoney(value)} рублей</span><br/>
                    <span>${seriesName}</span>
                </div>
            `;
        },
        style: { fontSize: '14px' }
    },
    grid: {
        borderColor: '#f1f1f1',
        strokeDashArray: 3,
    },
    legend: {
        position: 'right',
        verticalAlign: 'top',
        labels: { colors: ['#333'] },
        formatter: (seriesName) => seriesName // Убираем значения из легенды
    }
};

// Форматирование денежных значений
const formatMoney = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

// Компонент для графиков с React.memo
const ChartSection = React.memo(({ title, options, series, type, height, onTabChange, activeTab, onPeriodChange, periods, selectedPeriod }) => {
    return (
        <div className="chart-section">
            <div className="chart-header">
                <h2>{title}</h2>
                <div className="chart-controls">
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'day' ? 'active' : ''}`}
                            onClick={() => onTabChange('day')}
                        >
                            День
                        </button>
                        <button
                            className={`tab ${activeTab === 'week' ? 'active' : ''}`}
                            onClick={() => onTabChange('week')}
                        >
                            Неделя
                        </button>
                        <button
                            className={`tab ${activeTab === 'month' ? 'active' : ''}`}
                            onClick={() => onTabChange('month')}
                        >
                            Месяц
                        </button>
                        <button
                            className={`tab ${activeTab === 'year' ? 'active' : ''}`}
                            onClick={() => onTabChange('year')}
                        >
                            Год
                        </button>
                    </div>
                    {onPeriodChange && (
                        <div className="dropdown">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => onPeriodChange(e.target.value)}
                                className="period-select"
                            >
                                {periods.map((period) => (
                                    <option key={period} value={period}>
                                        {period}
                                    </option>
                                ))}
                            </select>
                            <FiChevronDown style={{ marginLeft: '5px', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                        </div>
                    )}
                </div>
            </div>
            <Chart options={options} series={series} type={type} height={height} />
        </div>
    );
});

// Компонент для карточки пользователя
const UserCard = ({ user }) => {
    return (
        <div className="user-card">
            <div className="user-card-header">
                <img src="https://via.placeholder.com/40" alt="User Avatar" className="user-avatar" />
                <div className="user-more-options">
                    <FiMoreHorizontal />
                </div>
            </div>
            <div className="user-card-body">
                <h3>{user.name}</h3>
                <p>{user.email}</p>
            </div>
            <div className="user-card-footer">
                {user.isActive ? (
                    <span className="user-status active">АКТИВНО</span>
                ) : (
                    <span className="user-status inactive">НЕАКТИВНО</span>
                )}
                <div className="user-actions">
                    <button className="user-action-btn">Настройка</button>
                    <button className="user-action-btn">Пользователь</button>
                    {user.isActive ? (
                        <button className="user-action-btn">Просмотр модели</button>
                    ) : (
                        <button className="user-action-btn">Действие</button>
                    )}
                </div>
            </div>
        </div>
    );
};

function Dashboard() {
    const [menuState, setMenuState] = useState({
        investments: false,
        management: true, // Открываем меню "УПРАВЛЕНИЕ" по умолчанию
        data: true, // Открываем меню "Данные" в новом столбце по умолчанию
        models: false,
    });

    const [activeTab, setActiveTab] = useState('data'); // Устанавливаем "Данные" как активную вкладку
    const [notificationTab, setNotificationTab] = useState('telegram');
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
    const [transactionTab, setTransactionTab] = useState('history');
    const [isSettingsActionsOpen, setIsSettingsActionsOpen] = useState(false);
    const [isModelsActionsOpen, setIsModelsActionsOpen] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState('day'); // Для нового меню (День, Числовые данные и т.д.)

    const [notifications, setNotifications] = useState({
        tips: false,
        reports: false,
        training: false,
        systemInfo: false,
    });

    const [statsData, setStatsData] = useState({
        balance: '0.00',
        todayChange: '0',
        weekChange: '0',
    });
    const [historyData, setHistoryData] = useState([]);
    const [balanceData, setBalanceData] = useState({
        day: [
            { day: '00:00', sber: 5500, gazp: 6000, moex: 5800, rual: 5700 },
            { day: '06:00', sber: 5600, gazp: 6100, moex: 5900, rual: 5800 },
            { day: '12:00', sber: 5400, gazp: 5900, moex: 5700, rual: 5600 },
            { day: '18:00', sber: 5700, gazp: 6200, moex: 6000, rual: 5900 },
        ],
        week: [
            { day: '16, Нд', sber: 10000, gazp: 10503, moex: 11106, rual: 6453 },
            { day: '17, Вт', sber: 9500, gazp: 10000, moex: 10500, rual: 6000 },
            { day: '18, Ср', sber: 11000, gazp: 11500, moex: 12000, rual: 7000 },
            { day: '19, Чт', sber: 9000, gazp: 9500, moex: 10000, rual: 5800 },
            { day: '20, Пт', sber: 10500, gazp: 11000, moex: 11500, rual: 6700 },
            { day: '21, Сб', sber: 9800, gazp: 10200, moex: 10800, rual: 6300 },
            { day: '22, Вс', sber: 10000, gazp: 10503, moex: 11106, rual: 6453 },
        ],
        month: [
            { day: '1', sber: 10000, gazp: 10503, moex: 11106, rual: 6453 },
            { day: '5', sber: 9500, gazp: 10000, moex: 10500, rual: 6000 },
            { day: '9', sber: 9800, gazp: 10200, moex: 10800, rual: 6200 },
            { day: '13', sber: 9700, gazp: 10100, moex: 10700, rual: 6100 },
            { day: '17', sber: 9900, gazp: 10300, moex: 10900, rual: 6300 },
            { day: '21', sber: 10000, gazp: 10400, moex: 11000, rual: 6400 },
            { day: '25', sber: 10100, gazp: 10500, moex: 11100, rual: 6500 },
            { day: '29', sber: 10200, gazp: 10600, moex: 11200, rual: 6600 },
        ],
        year: [
            { month: 'Январь', density: 17, sko: 83, expectation: 88, accuracy: 15 },
            { month: 'Март', density: 16, sko: 82, expectation: 87, accuracy: 14 },
            { month: 'Май', density: 18, sko: 84, expectation: 89, accuracy: 16 },
            { month: 'Июль', density: 17, sko: 83, expectation: 88, accuracy: 15 },
            { month: 'Сентябрь', density: 19, sko: 85, expectation: 90, accuracy: 17 },
            { month: 'Ноябрь', density: 18, sko: 84, expectation: 89, accuracy: 16 },
        ],
    });
    const [tableData, setTableData] = useState([]);
    const [settingsData, setSettingsData] = useState([
        { id: 1, server: 'trade-controller', variable: 'RISK_MANAGEMENT_TYPE', value: '1', comment: 'Отключена маржинальная торговля' },
        { id: 2, server: 'trade-controller', variable: 'RISK_MANAGEMENT_TYPE', value: '1', comment: 'Отключена маржинальная торговля' },
        { id: 3, server: 'trade-controller', variable: 'RISK_MANAGEMENT_TYPE', value: '1', comment: 'Отключена маржинальная торговля' },
        { id: 4, server: 'trade-controller', variable: 'RISK_MANAGEMENT_TYPE', value: '1', comment: 'Отключена маржинальная торговля' },
        { id: 5, server: 'trade-controller', variable: 'RISK_MANAGEMENT_TYPE', value: '1', comment: 'Отключена маржинальная торговля' },
    ]);
    const [usersData, setUsersData] = useState([
        { id: 1, name: 'Влад Козак', email: 'email@example.com', isActive: true },
        { id: 2, name: 'Дмитрий Наркисов', email: 'email@example.com', isActive: true },
        { id: 3, name: 'Влад Козак', email: 'email@example.com', isActive: false },
        { id: 4, name: 'Влад Козак', email: 'email@example.com', isActive: true },
        { id: 5, name: 'Влад Козак', email: 'email@example.com', isActive: true },
        { id: 6, name: 'Влад Козак', email: 'email@example.com', isActive: true },
        { id: 7, name: 'Влад Козак', email: 'email@example.com', isActive: true },
        { id: 8, name: 'Влад Козак', email: 'email@example.com', isActive: true },
    ]);
    const [modelsData, setModelsData] = useState([
        { id: 1, name: 'EmaModel', type: 'Пледиктор', version: 'ae32c4', date: '11:20 05.01.2019', description: 'Скользящее среднее' },
        { id: 2, name: 'EmaModel', type: 'Сенектор', version: 'ae32c4', date: '21:18 02.01.2019', description: 'Скользящее среднее' },
        { id: 3, name: 'EmaModel', type: 'Пледиктор', version: 'ae32c4', date: '11:20 05.01.2019', description: 'Скользящее среднее' },
        { id: 4, name: 'EmaModel', type: 'Сенектор', version: 'ae32c4', date: '21:18 02.01.2019', description: 'Скользящее среднее' },
        { id: 5, name: 'EmaModel', type: 'Пледиктор', version: 'ae32c4', date: '11:20 05.01.2019', description: 'Скользящее среднее' },
        { id: 6, name: 'EmaModel', type: 'Сенектор', version: 'ae32c4', date: '21:18 02.01.2019', description: 'Скользящее среднее' },
    ]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [chartTab, setChartTab] = useState('week');
    const [dataChartTab, setDataChartTab] = useState('week');
    const [selectedPeriod, setSelectedPeriod] = useState('Сентябрь 2019');
    const periods = ['Январь 2019', 'Февраль 2019', 'Март 2019', 'Апрель 2019', 'Май 2019', 'Июнь 2019', 'Июль 2019', 'Август 2019', 'Сентябрь 2019', 'Октябрь 2019', 'Ноябрь 2019', 'Декабрь 2019'];

    const toggleMenu = (menu) => {
        setMenuState((prevState) => ({
            ...prevState,
            [menu]: !prevState[menu],
        }));
    };

    const handleNotificationChange = (e) => {
        const { name, checked } = e.target;
        setNotifications((prevState) => ({
            ...prevState,
            [name]: checked,
        }));
    };

    const handleSaveNotifications = () => {
        console.log('Сохранённые настройки уведомлений:', notifications);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const stats = await getStats();
                const transactions = await getTransactions();
                const balance = await getBalance();
                const table = await getTableTransactions();
                const settings = await getSettings();

                setStatsData(stats);
                setHistoryData(transactions);
                Después: setTableData(table);
            } catch (err) {
                setError(err.message || 'Ошибка загрузки данных');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const updatedLineChartOptions = (tab) => ({
        ...lineChartOptions,
        xaxis: {
            ...lineChartOptions.xaxis,
            categories: balanceData[tab].map(item => tab === 'week' ? item.day : tab === 'month' ? item.day : tab === 'year' ? item.month : item.day),
        },
    });

    const lineChartSeriesDay = [
        { name: 'SBER', data: balanceData.day.map(item => item.sber) },
        { name: 'GAZP', data: balanceData.day.map(item => item.gazp) },
        { name: 'MOEX', data: balanceData.day.map(item => item.moex) },
        { name: 'RUAL', data: balanceData.day.map(item => item.rual) },
    ];

    const lineChartSeriesWeek = [
        { name: 'SBER', data: balanceData.week.map(item => item.sber) },
        { name: 'GAZP', data: balanceData.week.map(item => item.gazp) },
        { name: 'MOEX', data: balanceData.week.map(item => item.moex) },
        { name: 'RUAL', data: balanceData.week.map(item => item.rual) },
    ];

    const lineChartSeriesMonth = [
        { name: 'SBER', data: balanceData.month.map(item => item.sber) },
        { name: 'GAZP', data: balanceData.month.map(item => item.gazp) },
        { name: 'MOEX', data: balanceData.month.map(item => item.moex) },
        { name: 'RUAL', data: balanceData.month.map(item => item.rual) },
    ];

    const lineChartSeriesYear = [
        { name: 'Плотность', data: balanceData.year.map(item => item.density) },
        { name: 'СКО', data: balanceData.year.map(item => item.sko) },
        { name: 'Математическое ожидание', data: balanceData.year.map(item => item.expectation) },
        { name: 'Точность', data: balanceData.year.map(item => item.accuracy) },
    ];

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error">Ошибка: {error}</div>;

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="user-info">
                    <img src="https://via.placeholder.com/40" alt="User" className="user-avatar" />
                    <span>Андрей Павлов</span>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li>
                            <div className="menu-item" onClick={() => toggleMenu('investments')}>
                                <span>ИНВЕСТИЦИИ</span>
                                <FiChevronDown className={`arrow ${menuState.investments ? 'open' : ''}`} />
                            </div>
                            {menuState.investments && (
                                <ul className="submenu">
                                    <li className={activeTab === 'overview' ? 'active' : ''}>
                                        <FiTrendingUp className="submenu-icon" />
                                        <span onClick={() => setActiveTab('overview')}>Обзор</span>
                                    </li>
                                    <li className={activeTab === 'transactions' ? 'active' : ''}>
                                        <FiArrowUp className="submenu-icon" />
                                        <span onClick={() => setActiveTab('transactions')}>Транзакции</span>
                                    </li>
                                    <li className={activeTab === 'notifications' ? 'active' : ''}>
                                        <FiBell className="submenu-icon" />
                                        <span onClick={() => setActiveTab('notifications')}>Уведомления</span>
                                    </li>
                                </ul>
                            )}
                        </li>
                        <li>
                            <div className="menu-item" onClick={() => toggleMenu('management')}>
                                <span>УПРАВЛЕНИЕ</span>
                                <FiChevronDown className={`arrow ${menuState.management ? 'open' : ''}`} />
                            </div>
                            {menuState.management && (
                                <ul className="submenu">
                                    <li className={activeTab === 'settings' ? 'active' : ''}>
                                        <FiSettings className="submenu-icon" />
                                        <span onClick={() => setActiveTab('settings')}>Настройка</span>
                                    </li>
                                    <li className={activeTab === 'users' ? 'active' : ''}>
                                        <FiUsers className="submenu-icon" />
                                        <span onClick={() => setActiveTab('users')}>Пользователи</span>
                                    </li>
                                    <li className={activeTab === 'models' ? 'active' : ''}>
                                        <FiDatabase className="submenu-icon" />
                                        <span onClick={() => setActiveTab('models')}>Модели</span>
                                    </li>
                                    <li className={activeTab === 'data' ? 'active' : ''}>
                                        <FiDatabase className="submenu-icon" />
                                        <span onClick={() => setActiveTab('data')}>Данные</span>
                                    </li>
                                </ul>
                            )}
                        </li>
                    </ul>
                </nav>
            </aside>

            <aside className="secondary-sidebar">
                <nav className="secondary-sidebar-nav">
                    <div className="menu-header">
                        <button
                            className={`menu-header-item ${activeTab === 'data' ? 'active' : ''}`}
                            onClick={() => setActiveTab('data')}
                        >
                            ДАННЫЕ
                        </button>
                        <button
                            className={`menu-header-item ${activeTab === 'models' ? 'active' : ''}`}
                            onClick={() => setActiveTab('models')}
                        >
                            МОДЕЛИ
                        </button>
                    </div>
                    {activeTab === 'data' && (
                        <ul className="submenu">
                            <li className={activeSubTab === 'day' ? 'active' : ''}>
                                <span onClick={() => setActiveSubTab('day')}>День</span>
                            </li>
                            <li className={activeSubTab === 'numeric-data' ? 'active' : ''}>
                                <span onClick={() => setActiveSubTab('numeric-data')}>Числовые данные</span>
                            </li>
                            <li className={activeSubTab === 'text-data' ? 'active' : ''}>
                                <span onClick={() => setActiveSubTab('text-data')}>Текстовые данные</span>
                            </li>
                            <li className={activeSubTab === 'raw-data' ? 'active' : ''}>
                                <span onClick={() => setActiveSubTab('raw-data')}>Необработанные данные</span>
                            </li>
                        </ul>
                    )}
                </nav>
            </aside>

            <div className="content-wrapper">
                {(activeTab === 'settings' || activeTab === 'users' || activeTab === 'models' || activeTab === 'data') && (
                    <header className="top-header">
                        <div className="header-top">
                            <h1 className="header-title">
                                {activeTab === 'settings' ? 'Конфигурации' : activeTab === 'users' ? 'Пользователи' : activeTab === 'models' ? 'Модели' : 'Данные'}
                            </h1>
                            {(activeTab === 'settings' || activeTab === 'models' || activeTab === 'data') && (
                                <button className="add-config-btn">
                                    <FiPlus style={{ marginRight: '5px' }} />
                                    {activeTab === 'settings' ? 'Добавить конфигурацию' : activeTab === 'models' ? 'Обучить новую модель' : 'Добавить новый парсер'}
                                </button>
                            )}
                        </div>
                    </header>
                )}

                <div className="content-body">
                    {activeTab === 'overview' && (
                        <aside className="transactions-column">
                            <div className="transactions-header">
                                <h3>История транзакций</h3>
                                <button
                                    className="view-all-btn"
                                    onClick={() => setActiveTab('transactions')}
                                >
                                    Все
                                </button>
                            </div>
                            <ul className="transactions-list">
                                {historyData.slice(0, 10).map((item, index) => (
                                    <li key={index} className="history-item">
                                        <div className={`icon ${item.icon}`}>
                                            {item.icon === 'check' && <FiCheck style={{ color: '#28a745' }} />}
                                            {item.icon === 'arrow-up' && <FiArrowUp style={{ color: '#dc3545' }} />}
                                            {item.icon === 'plus' && <FiPlus style={{ color: '#28a745' }} />}
                                            {item.icon === 'percent' && <FiPercent style={{ color: item.status === 'success' ? '#28a745' : '#dc3545' }} />}
                                        </div>
                                        <div className="history-details">
                                            <span className="type">{item.type}</span>
                                            <span className="date">{item.date}</span>
                                        </div>
                                        <span className={`amount ${item.amount < 0 ? 'negative' : 'positive'}`}>
                                            {item.amount > 0 ? '+' : ''}{formatMoney(item.amount)} ₽
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </aside>
                    )}

                    <main className="main-content">
                        {activeTab === 'overview' && (
                            <>
                                <div className="stats">
                                    <div className="stat-card">
                                        <span className="stat-label">Баланс</span>
                                        <p className="stat-value">{formatMoney(statsData.balance)} ₽</p>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-label">Изменения по счёту за сегодня</span>
                                        <span className="stat-date">13/09</span>
                                        <p className="stat-change">
                                            <span className={`arrow ${statsData.todayChange < 0 ? 'negative' : 'positive'}`}>
                                                {statsData.todayChange < 0 ? <FiTrendingDown /> : <FiTrendingUp />}
                                            </span>
                                            <span className="change-amount">{formatMoney(Math.abs(statsData.todayChange))} ₽</span>
                                        </p>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-label">Изменения по счёту за неделю</span>
                                        <span className="stat-date">06/09 – 13/09</span>
                                        <p className={`stat-change ${statsData.weekChange < 0 ? 'negative' : 'positive'}`}>
                                            <span className="arrow">{statsData.weekChange < 0 ? <FiTrendingDown /> : <FiTrendingUp />}</span>
                                            <span className="change-amount">{formatMoney(Math.abs(statsData.weekChange))} ₽</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="charts-container">
                                    <ChartSection
                                        title="LINE CHART - WEEK"
                                        options={updatedLineChartOptions('week')}
                                        series={lineChartSeriesWeek}
                                        type="line"
                                        height={350}
                                        activeTab={chartTab}
                                        onTabChange={setChartTab}
                                    />
                                </div>
                            </>
                        )}

                        {activeTab === 'transactions' && (
                            <>
                                <header className="top-header">
                                    <div className="transaction-tabs">
                                        <button
                                            className={`transaction-tab ${transactionTab === 'invoicing' ? 'active' : ''}`}
                                            onClick={() => setTransactionTab('invoicing')}
                                        >
                                            Выставление
                                        </button>
                                        <button
                                            className={`transaction-tab ${transactionTab === 'to-pay' ? 'active' : ''}`}
                                            onClick={() => setTransactionTab('to-pay')}
                                        >
                                            К оплате
                                        </button>
                                        <button
                                            className={`transaction-tab ${transactionTab === 'history' ? 'active' : ''}`}
                                            onClick={() => setTransactionTab('history')}
                                        >
                                            История
                                        </button>
                                    </div>
                                </header>

                                <div className="transactions-table-section">
                                    <div className="transactions-controls">
                                        <div className="filter-buttons">
                                            <button className="filter-btn active">Все счета</button>
                                        </div>
                                        <div className="right-controls">
                                            <div className="transactions-search-bar">
                                                <FiSearch className="search-icon" />
                                                <input type="text" placeholder="Поиск по комментарию" />
                                            </div>
                                            <div className="dropdown">
                                                <button
                                                    className="filter-btn"
                                                    onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
                                                >
                                                    Действия <FiChevronDown style={{ marginLeft: '5px' }} />
                                                </button>
                                                {isActionsDropdownOpen && (
                                                    <div className="dropdown-menu">
                                                        <div className="dropdown-item">Опция 1</div>
                                                        <div className="dropdown-item">Опция 2</div>
                                                        <div className="dropdown-item">Опция 3</div>
                                                    </div>
                                                )}
                                            </div>
                                            <button className="filter-btn">
                                                Фильтр <FiFilter style={{ marginLeft: '5px' }} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="table-wrapper">
                                        <table className="transactions-table">
                                            <thead>
                                            <tr>
                                                <th><input type="checkbox" /></th>
                                                <th>Номер с</th>
                                                <th>Время и дата</th>
                                                <th>Комментарий</th>
                                                <th>Сумма</th>
                                                <th>Статус</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {tableData.map((item) => {
                                                const statusMap = {
                                                    success: 'Начислено',
                                                    canceled: 'Отклонено',
                                                    withdrawal: 'Вывод средств',
                                                    commission: 'Комиссия',
                                                    paid: 'Оплачено',
                                                };

                                                const statusText = statusMap[item.status.toLowerCase()] || item.status;
                                                const statusClass = `status-${statusText.toLowerCase().replace(/\s+/g, '-')}`;

                                                return (
                                                    <tr key={item.id}>
                                                        <td><input type="checkbox" /></td>
                                                        <td>№{item.id}</td>
                                                        <td>{item.date}</td>
                                                        <td>{item.comment || '-'}</td>
                                                        <td className={item.amount < 0 ? 'negative' : 'positive'}>
                                                            {item.amount > 0 ? '+' : ''}{formatMoney(item.amount)} ₽
                                                        </td>
                                                        <td>
                                                                <span className={`status-label ${statusClass}`}>
                                                                    {statusText}
                                                                </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="notifications-section">
                                <div className="notification-tabs">
                                    <button
                                        className={`notification-tab ${notificationTab === 'telegram' ? 'active' : ''}`}
                                        onClick={() => setNotificationTab('telegram')}
                                    >
                                        Telegram
                                    </button>
                                    <button
                                        className={`notification-tab ${notificationTab === 'email' ? 'active' : ''}`}
                                        onClick={() => setNotificationTab('email')}
                                        disabled
                                    >
                                        Почта
                                    </button>
                                </div>

                                {notificationTab === 'telegram' && (
                                    <div className="notification-content">
                                        <p className="description">
                                            Самая нужная отправка уведомлений в t.me/alpha_money.bot
                                        </p>
                                        <div className="notification-options">
                                            <div className="notification-option">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="tips"
                                                        checked={notifications.tips}
                                                        onChange={handleNotificationChange}
                                                    />
                                                    Советы
                                                </label>
                                            </div>
                                            <div className="notification-option">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="reports"
                                                        checked={notifications.reports}
                                                        onChange={handleNotificationChange}
                                                    />
                                                    Ежедневный отчёт
                                                </label>
                                            </div>
                                            <div className="notification-option">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="training"
                                                        checked={notifications.training}
                                                        onChange={handleNotificationChange}
                                                    />
                                                    Обучение моделей
                                                </label>
                                            </div>
                                            <div className="notification-option">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="systemInfo"
                                                        checked={notifications.systemInfo}
                                                        onChange={handleNotificationChange}
                                                    />
                                                    Информация о системе
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {notificationTab === 'email' && (
                                    <div className="notification-content">
                                        <p className="description">
                                            Настройки уведомлений по почте (в разработке)
                                        </p>
                                    </div>
                                )}

                                <button className="save-btn" onClick={handleSaveNotifications}>
                                    Сохранить
                                </button>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="settings-table-section">
                                <div className="settings-controls">
                                    <div className="settings-search-bar">
                                        <FiSearch className="search-icon" />
                                        <input type="text" placeholder="Поиск" />
                                    </div>
                                    <div className="dropdown">
                                        <button
                                            className="filter-btn"
                                            onClick={() => setIsSettingsActionsOpen(!isSettingsActionsOpen)}
                                        >
                                            Действия <FiChevronDown style={{ marginLeft: '5px' }} />
                                        </button>
                                        {isSettingsActionsOpen && (
                                            <div className="dropdown-menu">
                                                <div className="dropdown-item">Опция 1</div>
                                                <div className="dropdown-item">Опция 2</div>
                                                <div className="dropdown-item">Опция 3</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="table-wrapper">
                                    <table className="settings-table">
                                        <thead>
                                        <tr>
                                            <th><input type="checkbox" /></th>
                                            <th>Название сервера</th>
                                            <th>Переменная окружения</th>
                                            <th>Значение</th>
                                            <th>Комментарий</th>
                                            <th>Действия</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {settingsData.map((item) => (
                                            <tr key={item.id}>
                                                <td><input type="checkbox" /></td>
                                                <td>{item.server}</td>
                                                <td>{item.variable}</td>
                                                <td>{item.value}</td>
                                                <td>{item.comment}</td>
                                                <td>
                                                    <button className="action-btn">
                                                        <FiMoreHorizontal />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="users-section">
                                <div className="users-controls">
                                    <div className="filter-buttons">
                                        <button className="filter-btn active">Все счета</button>
                                    </div>
                                    <div className="right-controls">
                                        <div className="transactions-search-bar">
                                            <FiSearch className="search-icon" />
                                            <input type="text" placeholder="Поиск по комментарию" />
                                        </div>
                                        <div className="dropdown">
                                            <button
                                                className="filter-btn"
                                                onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
                                            >
                                                Действия <FiChevronDown style={{ marginLeft: '5px' }} />
                                            </button>
                                            {isActionsDropdownOpen && (
                                                <div className="dropdown-menu">
                                                    <div className="dropdown-item">Опция 1</div>
                                                    <div className="dropdown-item">Опция 2</div>
                                                    <div className="dropdown-item">Опция 3</div>
                                                </div>
                                            )}
                                        </div>
                                        <button className="filter-btn">
                                            Фильтр <FiFilter style={{ marginLeft: '5px' }} />
                                        </button>
                                    </div>
                                </div>
                                <div className="users-grid">
                                    {usersData.map((user) => (
                                        <UserCard key={user.id} user={user} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'models' && (
                            <div className="models-table-section">
                                <div className="models-controls">
                                    <div className="filter-buttons">
                                        <button className="filter-btn active">Все модели</button>
                                    </div>
                                    <div className="right-controls">
                                        <div className="transactions-search-bar">
                                            <FiSearch className="search-icon" />
                                            <input type="text" placeholder="Поиск" />
                                        </div>
                                        <div className="dropdown">
                                            <button
                                                className="filter-btn"
                                                onClick={() => setIsModelsActionsOpen(!isModelsActionsOpen)}
                                            >
                                                Действия <FiChevronDown style={{ marginLeft: '5px' }} />
                                            </button>
                                            {isModelsActionsOpen && (
                                                <div className="dropdown-menu">
                                                    <div className="dropdown-item">Опция 1</div>
                                                    <div className="dropdown-item">Опция 2</div>
                                                    <div className="dropdown-item">Опция 3</div>
                                                </div>
                                            )}
                                        </div>
                                        <button className="filter-btn">
                                            Фильтр <FiFilter style={{ marginLeft: '5px' }} />
                                        </button>
                                    </div>
                                </div>
                                <div className="table-wrapper">
                                    <table className="models-table">
                                        <thead>
                                        <tr>
                                            <th><input type="checkbox" /></th>
                                            <th>Название</th>
                                            <th>Тип</th>
                                            <th>Версия</th>
                                            <th>Время и дата</th>
                                            <th>Описание</th>
                                            <th>Действия</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {modelsData.map((model) => (
                                            <tr key={model.id}>
                                                <td><input type="checkbox" /></td>
                                                <td>{model.name}</td>
                                                <td>
                                                        <span className={`model-type ${model.type.toLowerCase()}`}>
                                                            {model.type}
                                                        </span>
                                                </td>
                                                <td>{model.version}</td>
                                                <td>{model.date}</td>
                                                <td>{model.description}</td>
                                                <td>
                                                    <button className="action-btn">
                                                        <FiMoreHorizontal />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'data' && (
                            <div className="data-section">
                                <div className="charts-container">
                                    <ChartSection
                                        title="Котировки"
                                        options={updatedLineChartOptions(dataChartTab)}
                                        series={
                                            dataChartTab === 'day'
                                                ? lineChartSeriesDay
                                                : dataChartTab === 'week'
                                                    ? lineChartSeriesWeek
                                                    : dataChartTab === 'month'
                                                        ? lineChartSeriesMonth
                                                        : lineChartSeriesYear
                                        }
                                        type="line"
                                        height={350}
                                        activeTab={dataChartTab}
                                        onTabChange={setDataChartTab}
                                        onPeriodChange={setSelectedPeriod}
                                        periods={periods}
                                        selectedPeriod={selectedPeriod}
                                    />
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;