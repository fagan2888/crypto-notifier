const path = require('path');
const notifier = require('node-notifier');
const NotificationCenter = require('node-notifier/notifiers/notifysend');
const formatNum = require('format-num')
const scrapCurrencies = require('./currencyScraper');
const db = require('./db');

const increaseIcon = 'increase.png';
const decreaseIcon = 'decrease.png';

const timeToUpdate = 60000;
const currencies = [
    'btc_mxn',
    "eth_mxn",
    "xrp_btc",
    "xrp_mxn",
    "eth_btc",
    "bch_btc",
];

async function start() {
    try {
        const prices = await scrapCurrencies();
        const previousPrices = db.getState();

        currencies.forEach((currency, index) => {
            const displayCurrencyName = currency.split('_').join(' ').toUpperCase();
            const displayPrice = prices[currency];

            const price = Number(prices[currency]);
            const previousPrice = Number(previousPrices[currency]);

            const stable = price === previousPrice;

            if (!stable) {
                const increase = price > previousPrice;
                const percent = calculatePercent(price, previousPrice).toFixed(4);

                console.info(path.join(__dirname, 'icons', Boolean(increase) ? 'increase.png' : 'decrease.png'));

                const notificationOptions = {
                    title: `${displayCurrencyName}: $${displayPrice}`,
                    message: !previousPrice ? ' ' : `${increase ? 'UP' : 'DOWN'} by ${percent}%`,
                    icon: path.join(__dirname, 'icons', Boolean(increase) ? increaseIcon : decreaseIcon),
                };

                setTimeout(() => {
                    notifier.notify(notificationOptions);
                }, 5000 * index);
            } else {
                console.info(`${displayCurrencyName} is stable`);
            }
        });

        db.setState(prices);
    } catch (e) {
        console.error('There was a problem updating the values');
    } finally {
        setTimeout(start, timeToUpdate);
    }
}

function calculatePercent(newPrice, oldPrice) {
    const increaseValue = newPrice - oldPrice;
    return (increaseValue / oldPrice) * 100;
}

start();