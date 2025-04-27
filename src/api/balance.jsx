import balanceData from '../data/balance.json';

export const getBalance = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(balanceData);
        }, 500);
    });
};