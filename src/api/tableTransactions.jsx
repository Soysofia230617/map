import tableTransactionsData from '../data/tableTransactions.json';

export const getTableTransactions = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(tableTransactionsData);
        }, 500);
    });
};