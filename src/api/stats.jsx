import statsData from '../data/stats.json';

export const getStats = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(statsData);
        }, 500); // Имитация задержки в 500 мс
    });
};