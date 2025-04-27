import transactionsData from '../data/transactions.json';

export const getTransactions = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(transactionsData);
        }, 500);
    });
};